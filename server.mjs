import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const publicRoot = resolve(publicDir);
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const projectPath = process.env.AGMSG_PROJECT || process.cwd();
const agentType = process.env.AGMSG_AGENT_TYPE || "codex";
const homeDir = process.env.HOME || process.env.USERPROFILE || "";
const agmsgRoot =
  process.env.AGMSG_ROOT || process.env.AGMSG_SKILL_DIR || join(homeDir, ".agents", "skills", "agmsg");
const teamsDir = process.env.AGMSG_TEAMS_DIR || join(agmsgRoot, "teams");
const storageDir = process.env.AGMSG_STORAGE_PATH || join(agmsgRoot, "db");
const dbPath = process.env.AGMSG_DB_PATH || join(storageDir, "messages.db");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function readJsonFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalizeProjectForCompare(value) {
  return String(value || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/([a-zA-Z])\//, (_, drive) => `${drive.toUpperCase()}:/`)
    .replace(/\/+$/, "")
    .toLowerCase();
}

function projectMatches(registrationProject, requestedProject) {
  const registered = normalizeProjectForCompare(registrationProject);
  const requested = normalizeProjectForCompare(requestedProject);
  if (!registered || !requested) return false;
  return requested === registered || requested.startsWith(`${registered}/`);
}

function validateTeamName(name) {
  if (!name) throw new Error("team is required");
  if (name === "." || name === ".." || name.startsWith("-") || /[/\\\u0000-\u001f\u007f]/.test(name)) {
    throw new Error("invalid team name");
  }
}

function registrationsForAgent(agent) {
  if (Array.isArray(agent?.registrations)) return agent.registrations;
  if (agent?.type || agent?.project) {
    return [{ type: agent.type || "unknown", project: agent.project || "" }];
  }
  return [];
}

function readTeamConfig(configPath, folderName) {
  const config = readJsonFile(configPath);
  const agents = Object.entries(config.agents || {}).map(([name, agent]) => {
    const registrations = registrationsForAgent(agent);
    const types = [...new Set(registrations.map((item) => item.type).filter(Boolean))];
    const latest = registrations.at(-1) || {};
    return {
      name,
      type: types.join(",") || "unknown",
      project: latest.project || "?",
      registrations,
    };
  });

  return {
    name: config.name || folderName,
    agents,
  };
}

// The state layout and read queries below are adapted from fujibee/agmsg's MIT-licensed scripts.
function readAllTeams() {
  if (!existsSync(teamsDir)) return [];
  return readdirSync(teamsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const configPath = join(teamsDir, entry.name, "config.json");
      if (!existsSync(configPath)) return null;
      try {
        return readTeamConfig(configPath, entry.name);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

function selectProjectTeams(teams) {
  const matching = teams.filter((team) =>
    team.agents.some((agent) =>
      agent.registrations.some(
        (registration) =>
          registration.type === agentType && projectMatches(registration.project, projectPath),
      ),
    ),
  );
  return matching.length ? matching : teams;
}

// busyTimeoutMs makes read connections wait for the agmsg watcher's write
// locks (WAL checkpoints) instead of failing immediately with SQLITE_BUSY.
const busyTimeoutMs = Number(process.env.AGMSG_BUSY_TIMEOUT_MS || 2000);
const busyRetryCount = 3;

function openMessageDb() {
  if (!existsSync(dbPath)) return null;
  return new DatabaseSync(dbPath, { readOnly: true, timeout: busyTimeoutMs });
}

function isBusyError(error) {
  return /database is locked|SQLITE_BUSY/i.test(error?.message || "");
}

function withMessageDb(fn) {
  let lastError = null;
  for (let attempt = 0; attempt < busyRetryCount; attempt += 1) {
    let db = null;
    try {
      db = openMessageDb();
      if (!db) return null;
      return fn(db);
    } catch (error) {
      lastError = error;
      if (!isBusyError(error)) throw error;
    } finally {
      db?.close();
    }
  }
  throw lastError;
}

function readHistory(team, limit, pair) {
  validateTeamName(team);
  const conditions = ["team = ?"];
  const params = [team];
  if (pair) {
    conditions.push("((from_agent = ? AND to_agent = ?) OR (from_agent = ? AND to_agent = ?))");
    params.push(pair.a, pair.b, pair.b, pair.a);
  }

  const rows =
    withMessageDb((db) =>
      db
        .prepare(
          `SELECT
             rowid AS id,
             team,
             from_agent AS fromAgent,
             to_agent AS toAgent,
             body,
             created_at AS createdAt,
             CASE WHEN read_at IS NULL THEN 0 ELSE 1 END AS read
           FROM messages
           WHERE ${conditions.join(" AND ")}
           ORDER BY created_at DESC
           LIMIT ?`,
        )
        .all(...params, limit),
    ) || [];

  return rows.reverse().map((row) => ({
    ...row,
    read: Boolean(row.read),
  }));
}

function readPairs(team) {
  validateTeamName(team);
  return (
    withMessageDb((db) =>
      db
        .prepare(
          `SELECT
             CASE WHEN from_agent <= to_agent THEN from_agent ELSE to_agent END AS agentA,
             CASE WHEN from_agent <= to_agent THEN to_agent ELSE from_agent END AS agentB,
             COUNT(*) AS count,
             MAX(created_at) AS lastAt
           FROM messages
           WHERE team = ?
           GROUP BY agentA, agentB
           ORDER BY lastAt DESC`,
        )
        .all(team),
    ) || []
  );
}

async function handleApi(req, res, url) {
  try {
    if (url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        source: "embedded-agmsg",
        projectPath,
        agentType,
        agmsgRoot,
        teamsDir,
        dbPath,
      });
      return;
    }

    if (url.pathname === "/api/teams") {
      const teams = selectProjectTeams(readAllTeams());
      sendJson(res, 200, { source: "embedded-agmsg", teams });
      return;
    }

    if (url.pathname === "/api/history") {
      const team = url.searchParams.get("team");
      if (!team) {
        sendJson(res, 400, { error: "team is required" });
        return;
      }
      const limit = Math.max(1, Math.min(300, Number(url.searchParams.get("limit") || 120)));
      const pairA = url.searchParams.get("a");
      const pairB = url.searchParams.get("b");
      const pair = pairA && pairB ? { a: pairA, b: pairB } : null;
      const entries = readHistory(team, limit, pair);
      sendJson(res, 200, { source: "embedded-agmsg", team, entries });
      return;
    }

    if (url.pathname === "/api/pairs") {
      const team = url.searchParams.get("team");
      if (!team) {
        sendJson(res, 400, { error: "team is required" });
        return;
      }
      const pairs = readPairs(team);
      sendJson(res, 200, { source: "embedded-agmsg", team, pairs });
      return;
    }

    sendJson(res, 404, { error: "unknown api path" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function serveStatic(req, res, url) {
  const appRoute = url.pathname === "/" || url.pathname === "/demo" || url.pathname === "/demo/";
  const requestedPath =
    appRoute ? "index.html" : decodeURIComponent(url.pathname).replace(/^[/\\]+/, "");
  const safePath = normalize(requestedPath);
  if (safePath === ".." || safePath.startsWith(`..${sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const fullPath = resolve(publicRoot, safePath);
  if (!fullPath.startsWith(`${publicRoot}${sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(fullPath);
    res.writeHead(200, {
      "content-type": mimeTypes.get(extname(fullPath)) || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }
  await serveStatic(req, res, url);
});

server.listen(port, host, () => {
  console.log(`agmsg-bubblelog を起動しました: http://${host}:${port}/`);
  console.log(`対象プロジェクト: ${projectPath}`);
  console.log(`agmsg state: ${agmsgRoot}`);
});

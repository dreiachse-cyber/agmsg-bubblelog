import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const publicRoot = resolve(publicDir);
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const projectPath = process.env.AGMSG_PROJECT || process.cwd();
const commandCwd = process.cwd();
const homeDir = process.env.HOME || process.env.USERPROFILE || "";
const scriptDir =
  process.env.AGMSG_SCRIPT_DIR || join(homeDir, ".agents", "skills", "agmsg", "scripts");
const gitBashPath = "C:\\Program Files\\Git\\bin\\bash.exe";
const bashCommand =
  process.env.AGMSG_BASH && process.env.AGMSG_BASH !== "bash"
    ? process.env.AGMSG_BASH
    : gitBashPath;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function runAgmsg(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(scriptDir, scriptName);
    const isWindows = process.platform === "win32";
    const command = isWindows ? bashCommand : scriptPath;
    const commandArgs = isWindows ? [scriptPath.replaceAll("\\", "/"), ...args] : args;

    execFile(
      command,
      commandArgs,
      {
        cwd: commandCwd,
        timeout: 8000,
        env: { ...process.env, HOME: homeDir },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || error.message));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

function parseKeyValueLine(line) {
  const pairs = new Map();
  for (const part of line.trim().split(/\s+/)) {
    const index = part.indexOf("=");
    if (index > 0) pairs.set(part.slice(0, index), part.slice(index + 1));
  }
  return pairs;
}

function parseTeamsFromWhoami(output) {
  const pairs = parseKeyValueLine(output.split("\n")[0] || "");
  const raw = pairs.get("teams") || pairs.get("available_teams") || "";
  if (!raw || raw === "none") return [];
  return raw
    .split(",")
    .map((team) => team.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

function parseTeamAgents(output) {
  return output
    .split("\n")
    .map((line) => {
      const match = line.match(/^\s{2}(.+?)\s+\((.+?)\)\s+—\s+(.+)$/);
      if (!match) return null;
      return {
        name: match[1],
        type: match[2],
        project: match[3],
      };
    })
    .filter(Boolean);
}

function parseHistory(output, team) {
  const records = [];
  for (const line of output.split("\n")) {
    const match = line.match(/^\s*([●○])\s+\[([^\]]+)\]\s+(.+?)\s+→\s+(.+?):\s+(.*)$/);
    if (!match) continue;
    records.push({
      id: records.length + 1,
      team,
      read: match[1] === "○",
      createdAt: match[2],
      fromAgent: match[3],
      toAgent: match[4],
      body: match[5],
    });
  }
  return records;
}

async function handleApi(req, res, url) {
  try {
    if (url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        projectPath,
        scriptDir,
      });
      return;
    }

    if (url.pathname === "/api/teams") {
      const whoami = await runAgmsg("whoami.sh", [projectPath, "codex"]);
      const teams = parseTeamsFromWhoami(whoami);
      const detailed = await Promise.all(
        teams.map(async (team) => {
          try {
            const output = await runAgmsg("team.sh", [team.name]);
            return { ...team, agents: parseTeamAgents(output) };
          } catch {
            return { ...team, agents: [] };
          }
        }),
      );
      sendJson(res, 200, { source: "agmsg", teams: detailed });
      return;
    }

    if (url.pathname === "/api/history") {
      const team = url.searchParams.get("team");
      if (!team) {
        sendJson(res, 400, { error: "team is required" });
        return;
      }
      const limit = Math.max(1, Math.min(300, Number(url.searchParams.get("limit") || 120)));
      const teamOutput = await runAgmsg("team.sh", [team]);
      const agents = parseTeamAgents(teamOutput);
      const reader = agents[0]?.name || "";
      const output = await runAgmsg("history.sh", [team, reader]);
      const entries = parseHistory(output, team).slice(-limit);
      sendJson(res, 200, { source: "agmsg", team, reader, entries });
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
});

const state = {
  teams: [],
  selectedTeam: "",
  entries: [],
  showControls: false,
  compact: true,
  limit: 80,
};

const els = {
  shell: document.querySelector(".app-shell"),
  teamList: document.querySelector("#teamList"),
  limitSelect: document.querySelector("#limitSelect"),
  compactToggle: document.querySelector("#compactToggle"),
  controlToggle: document.querySelector("#controlToggle"),
  refreshButton: document.querySelector("#refreshButton"),
  statusLine: document.querySelector("#statusLine"),
  messageList: document.querySelector("#messageList"),
  teamCaption: document.querySelector("#teamCaption"),
  chatTitle: document.querySelector("#chatTitle"),
};

const palette = [
  "#5f9e7b",
  "#5786a6",
  "#b47a4b",
  "#8f75b8",
  "#c76873",
  "#6d9fbc",
  "#b29b43",
  "#549c99",
];

const emotionRules = [
  { key: "error", label: "要注意", icon: "!", className: "error", words: ["失敗", "error", "fail", "壊", "できない", "危険", "注意"] },
  { key: "warn", label: "警戒", icon: "…", className: "warn", words: ["確認", "未確認", "リスク", "warning", "待って", "保留"] },
  { key: "question", label: "質問", icon: "?", className: "question", words: ["?", "？", "どう", "どれ", "相談", "質問"] },
  { key: "good", label: "完了", icon: "✓", className: "good", words: ["完了", "成功", "pass", "通った", "OK", "できた", "確認済み"] },
  { key: "review", label: "レビュー", icon: "R", className: "review", words: ["レビュー", "指摘", "P0", "QA", "判定"] },
  { key: "waiting", label: "待機", icon: "•", className: "waiting", words: ["待機", "見て", "お願いします", "依頼", "ready"] },
];

function hashText(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function agentInitial(name) {
  const cleaned = name.replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥]/g, "");
  return (cleaned[0] || "?").toUpperCase();
}

function avatarColor(name) {
  return palette[hashText(name) % palette.length];
}

function detectEmotion(body) {
  const lower = body.toLowerCase();
  return (
    emotionRules.find((rule) => rule.words.some((word) => lower.includes(word.toLowerCase()))) || {
      key: "neutral",
      label: "通常",
      icon: "・",
      className: "neutral",
    }
  );
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function fetchJson(path) {
  const response = await fetch(path);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function setStatus(text) {
  els.statusLine.textContent = text;
}

function renderTeams() {
  els.teamList.replaceChildren();
  if (!state.teams.length) {
    const empty = document.createElement("p");
    empty.className = "team-agents";
    empty.textContent = "agmsg チームが見つかりません。";
    els.teamList.appendChild(empty);
    return;
  }

  for (const team of state.teams) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `team-button${team.name === state.selectedTeam ? " active" : ""}`;
    button.dataset.team = team.name;

    const name = document.createElement("span");
    name.className = "team-name";
    name.textContent = team.name;

    const agents = document.createElement("span");
    agents.className = "team-agents";
    agents.textContent = (team.agents || []).map((agent) => agent.name).join(" / ") || "メンバー不明";

    button.append(name, agents);
    els.teamList.appendChild(button);
  }
}

function renderMessages() {
  els.shell.classList.toggle("compact", state.compact);
  els.messageList.replaceChildren();
  els.teamCaption.textContent = state.selectedTeam ? `チーム: ${state.selectedTeam}` : "チーム未選択";
  els.chatTitle.textContent = state.selectedTeam ? "agmsg 会話ログ" : "ログを選んでください";

  const visibleEntries = state.entries.filter(
    (entry) => state.showControls || !entry.body.startsWith("ctrl:"),
  );

  if (!visibleEntries.length) {
    const empty = document.createElement("div");
    empty.className = "control-message";
    empty.textContent = state.selectedTeam
      ? "表示できるメッセージがありません。"
      : "左のチームを選んでください。";
    els.messageList.appendChild(empty);
    return;
  }

  let lastDay = "";
  for (const entry of visibleEntries) {
    const day = (entry.createdAt || "").slice(0, 10);
    if (day && day !== lastDay) {
      lastDay = day;
      const sep = document.createElement("div");
      sep.className = "day-separator";
      sep.textContent = day;
      els.messageList.appendChild(sep);
    }

    if (entry.body.startsWith("ctrl:")) {
      const control = document.createElement("div");
      control.className = "control-message";
      control.textContent = `${entry.fromAgent} → ${entry.toAgent}: ${entry.body}`;
      els.messageList.appendChild(control);
      continue;
    }

    const emotion = detectEmotion(entry.body);
    const mine = /codex/i.test(entry.fromAgent);

    const row = document.createElement("article");
    row.className = `message-row ${mine ? "mine" : "other"} ${emotion.className}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.setProperty("--avatar-color", avatarColor(entry.fromAgent));
    avatar.dataset.emotion = emotion.icon;
    avatar.title = `${entry.fromAgent} / ${emotion.label}`;
    avatar.textContent = agentInitial(entry.fromAgent);

    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${entry.fromAgent} → ${entry.toAgent} · ${formatTime(entry.createdAt)} `;

    const tag = document.createElement("span");
    tag.className = "emotion";
    tag.textContent = emotion.label;
    meta.appendChild(tag);

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = entry.body;

    wrap.append(meta, bubble);
    row.append(avatar, wrap);
    els.messageList.appendChild(row);
  }

  els.messageList.scrollTop = els.messageList.scrollHeight;
}

async function loadTeams() {
  setStatus("agmsg チームを読み込み中です。");
  const data = await fetchJson("/api/teams");
  state.teams = data.teams || [];
  if (!state.selectedTeam && state.teams.length) {
    state.selectedTeam =
      state.teams.find((team) => team.name.includes("npc-side-battle-probe"))?.name ||
      state.teams[0].name;
  }
  renderTeams();
}

async function loadHistory() {
  if (!state.selectedTeam) {
    renderMessages();
    return;
  }
  setStatus(`${state.selectedTeam} の履歴を読み込み中です。`);
  const data = await fetchJson(
    `/api/history?team=${encodeURIComponent(state.selectedTeam)}&limit=${state.limit}`,
  );
  state.entries = data.entries || [];
  setStatus(`${state.entries.length} 件を表示中。すべてローカルで読み込んでいます。`);
  renderMessages();
}

async function refreshAll() {
  try {
    await loadTeams();
    await loadHistory();
  } catch (error) {
    setStatus(`読み込みに失敗しました: ${error.message}`);
  }
}

els.teamList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-team]");
  if (!button) return;
  state.selectedTeam = button.dataset.team;
  renderTeams();
  await loadHistory();
});

els.limitSelect.addEventListener("change", async () => {
  state.limit = Number(els.limitSelect.value);
  await loadHistory();
});

els.compactToggle.addEventListener("change", () => {
  state.compact = els.compactToggle.checked;
  renderMessages();
});

els.controlToggle.addEventListener("change", () => {
  state.showControls = els.controlToggle.checked;
  renderMessages();
});

els.refreshButton.addEventListener("click", refreshAll);

refreshAll();

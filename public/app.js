const state = {
  teams: [],
  selectedTeam: "",
  entries: [],
  agentIcons: {},
  showControls: false,
  compact: true,
  limit: 80,
  loadingTeams: false,
  loadingHistory: false,
  sidebarCollapsed: localStorage.getItem("agmsg-bubblelog-sidebar") === "collapsed",
  unreadCount: 0,
};

const els = {
  shell: document.querySelector(".app-shell"),
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  teamList: document.querySelector("#teamList"),
  limitSelect: document.querySelector("#limitSelect"),
  compactToggle: document.querySelector("#compactToggle"),
  controlToggle: document.querySelector("#controlToggle"),
  refreshButton: document.querySelector("#refreshButton"),
  newMessageButton: document.querySelector("#newMessageButton"),
  statusLine: document.querySelector("#statusLine"),
  messageList: document.querySelector("#messageList"),
  teamCaption: document.querySelector("#teamCaption"),
  chatTitle: document.querySelector("#chatTitle"),
};

const pollIntervalMs = 5000;

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

const emotionIconAliases = {
  error: "sad",
  warn: "sad",
  question: "thinking",
  good: "happy",
  review: "calm",
  waiting: "calm",
  neutral: "neutral",
  thinking: "thinking",
};

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
  const response = await fetch(path, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function setStatus(text) {
  els.statusLine.textContent = text;
}

function entryKey(entry) {
  return [entry.createdAt, entry.fromAgent, entry.toAgent, entry.body].join("\u001f");
}

function countNewEntries(previousEntries, nextEntries) {
  const previousKeys = new Set(previousEntries.map(entryKey));
  return nextEntries.filter((entry) => !previousKeys.has(entryKey(entry))).length;
}

function isNearBottom() {
  const distance = els.messageList.scrollHeight - els.messageList.scrollTop - els.messageList.clientHeight;
  return distance < 72;
}

function renderNewMessageButton() {
  if (state.unreadCount > 0) {
    els.newMessageButton.hidden = false;
    els.newMessageButton.textContent = `↓ 新着 ${state.unreadCount}件`;
    return;
  }
  els.newMessageButton.hidden = true;
}

function scrollToLatest() {
  els.messageList.scrollTop = els.messageList.scrollHeight;
  state.unreadCount = 0;
  renderNewMessageButton();
}

function applySidebarState() {
  els.shell.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  els.sidebar.setAttribute("aria-hidden", String(state.sidebarCollapsed));
  els.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  els.sidebarToggle.title = state.sidebarCollapsed ? "チーム欄を開く" : "チーム欄を閉じる";
}

function selectedTeam() {
  return state.teams.find((team) => team.name === state.selectedTeam);
}

function thinkingAgentName(visibleEntries) {
  const lastMessage = visibleEntries.at(-1);
  if (lastMessage?.toAgent) return lastMessage.toAgent;
  return selectedTeam()?.agents?.[0]?.name || "AI";
}

function normalizeIconConfig(value) {
  if (!value) return null;
  return typeof value === "string" ? { src: value } : value;
}

function resolveEmotionIcon(icon, emotionKey) {
  const emotions = icon?.emotions || {};
  const alias = emotionIconAliases[emotionKey] || emotionKey;
  const match = emotions[emotionKey] || emotions[alias];
  if (!match) return icon;
  return { ...icon, ...normalizeIconConfig(match) };
}

function agentIconConfig(name, emotionKey = "neutral") {
  const exact = state.agentIcons[name];
  if (exact) return resolveEmotionIcon(normalizeIconConfig(exact), emotionKey);

  const lowerName = name.toLowerCase();
  const matched = Object.entries(state.agentIcons).find(([key]) => key.toLowerCase() === lowerName);
  if (!matched) return null;
  return resolveEmotionIcon(normalizeIconConfig(matched[1]), emotionKey);
}

function createAvatar(agentName, emotion) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.style.setProperty("--avatar-color", avatarColor(agentName));
  avatar.dataset.emotion = emotion.icon;
  avatar.title = `${agentName} / ${emotion.label}`;

  const icon = agentIconConfig(agentName, emotion.key);
  const src = icon?.src || icon?.icon;
  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = icon?.label || agentName;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      avatar.classList.remove("has-image");
      image.remove();
      avatar.textContent = agentInitial(agentName);
    });
    avatar.classList.add("has-image");
    avatar.appendChild(image);
  } else {
    avatar.textContent = agentInitial(agentName);
  }

  return avatar;
}

function appendThinkingIndicator(agentName) {
  const row = document.createElement("article");
  row.className = "message-row thinking other";
  row.setAttribute("aria-label", `${agentName} が考え中`);

  const avatar = createAvatar(agentName, { key: "thinking", icon: "…", label: "考え中" });

  const wrap = document.createElement("div");
  wrap.className = "bubble-wrap";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${agentName} · 考え中 `;

  const tag = document.createElement("span");
  tag.className = "emotion thinking-label";
  tag.textContent = "思考中";
  meta.appendChild(tag);

  const bubble = document.createElement("div");
  bubble.className = "bubble thinking-bubble";

  const loader = document.createElement("span");
  loader.className = "thinking-loader";
  loader.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 3; index += 1) {
    loader.appendChild(document.createElement("span"));
  }

  const text = document.createElement("span");
  text.className = "thinking-text";
  text.textContent = "応答を待っています";

  bubble.append(loader, text);
  wrap.append(meta, bubble);
  row.append(avatar, wrap);
  els.messageList.appendChild(row);
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

function renderMessages({ scrollMode = "preserve", previousScrollTop = els.messageList.scrollTop } = {}) {
  els.shell.classList.toggle("compact", state.compact);
  els.shell.classList.toggle("loading", state.loadingTeams || state.loadingHistory);
  els.messageList.setAttribute("aria-busy", state.loadingHistory ? "true" : "false");
  els.messageList.replaceChildren();
  els.teamCaption.textContent = state.selectedTeam ? `チーム: ${state.selectedTeam}` : "チーム未選択";
  els.chatTitle.textContent = state.selectedTeam ? "agmsg 会話ログ" : "ログを選んでください";

  const visibleEntries = state.entries.filter(
    (entry) => state.showControls || !entry.body.startsWith("ctrl:"),
  );

  if (!visibleEntries.length && !state.loadingHistory) {
    const empty = document.createElement("div");
    empty.className = "control-message";
    empty.textContent = state.selectedTeam
      ? "表示できるメッセージがありません。"
      : "左のチームを選んでください。";
    els.messageList.appendChild(empty);
    renderNewMessageButton();
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

    const avatar = createAvatar(entry.fromAgent, emotion);

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

  if (state.loadingHistory) {
    appendThinkingIndicator(thinkingAgentName(visibleEntries));
  }

  if (scrollMode === "bottom") {
    els.messageList.scrollTop = els.messageList.scrollHeight;
  } else if (scrollMode === "preserve") {
    els.messageList.scrollTop = Math.min(
      previousScrollTop,
      Math.max(0, els.messageList.scrollHeight - els.messageList.clientHeight),
    );
  }
  renderNewMessageButton();
}

async function loadAgentIcons() {
  try {
    const data = await fetchJson("/agent-icons.json");
    state.agentIcons = data.agents || {};
  } catch {
    state.agentIcons = {};
  }
}

async function loadTeams() {
  state.loadingTeams = true;
  renderMessages();
  setStatus("agmsg チームを読み込み中です。");
  const data = await fetchJson("/api/teams");
  state.teams = data.teams || [];
  if (!state.selectedTeam && state.teams.length) {
    state.selectedTeam =
      state.teams.find((team) => team.name.includes("npc-side-battle-probe"))?.name ||
      state.teams[0].name;
  }
  state.loadingTeams = false;
  renderTeams();
}

async function loadHistory({ silent = false } = {}) {
  if (!state.selectedTeam) {
    renderMessages();
    return;
  }
  const previousEntries = state.entries;
  const hadEntries = previousEntries.length > 0;
  const wasAtBottom = isNearBottom();
  const previousScrollTop = els.messageList.scrollTop;

  if (!silent) {
    state.loadingHistory = true;
    renderMessages({
      scrollMode: wasAtBottom ? "bottom" : "preserve",
      previousScrollTop,
    });
    setStatus(`${state.selectedTeam} の履歴を読み込み中です。`);
  }

  try {
    const data = await fetchJson(
      `/api/history?team=${encodeURIComponent(state.selectedTeam)}&limit=${state.limit}`,
    );
    const nextEntries = data.entries || [];
    const newCount = hadEntries ? countNewEntries(previousEntries, nextEntries) : 0;
    const shouldFollowLatest = !hadEntries || wasAtBottom;

    state.entries = nextEntries;
    state.loadingHistory = false;

    if (newCount > 0 && !shouldFollowLatest) {
      state.unreadCount += newCount;
      setStatus(`${newCount} 件の新着メッセージがあります。`);
    } else {
      if (shouldFollowLatest) state.unreadCount = 0;
      if (!silent || newCount > 0) {
        setStatus(`${state.entries.length} 件を表示中。すべてローカルで読み込んでいます。`);
      }
    }

    renderMessages({
      scrollMode: shouldFollowLatest ? "bottom" : "preserve",
      previousScrollTop,
    });
  } catch (error) {
    state.loadingHistory = false;
    renderMessages({
      scrollMode: wasAtBottom ? "bottom" : "preserve",
      previousScrollTop,
    });
    throw error;
  }
}

async function refreshAll() {
  try {
    await loadAgentIcons();
    await loadTeams();
    await loadHistory();
  } catch (error) {
    state.loadingTeams = false;
    state.loadingHistory = false;
    renderMessages();
    setStatus(`読み込みに失敗しました: ${error.message}`);
  }
}

els.teamList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-team]");
  if (!button) return;
  state.selectedTeam = button.dataset.team;
  state.entries = [];
  state.unreadCount = 0;
  renderTeams();
  await loadHistory();
});

els.limitSelect.addEventListener("change", async () => {
  state.limit = Number(els.limitSelect.value);
  await loadHistory();
});

els.compactToggle.addEventListener("change", () => {
  state.compact = els.compactToggle.checked;
  renderMessages({ scrollMode: isNearBottom() ? "bottom" : "preserve" });
});

els.controlToggle.addEventListener("change", () => {
  state.showControls = els.controlToggle.checked;
  renderMessages({ scrollMode: isNearBottom() ? "bottom" : "preserve" });
});

els.refreshButton.addEventListener("click", refreshAll);
els.sidebarToggle.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  localStorage.setItem(
    "agmsg-bubblelog-sidebar",
    state.sidebarCollapsed ? "collapsed" : "expanded",
  );
  applySidebarState();
});
els.newMessageButton.addEventListener("click", scrollToLatest);
els.messageList.addEventListener("scroll", () => {
  if (state.unreadCount > 0 && isNearBottom()) {
    state.unreadCount = 0;
    renderNewMessageButton();
  }
});

setInterval(() => {
  if (state.loadingTeams || state.loadingHistory || !state.selectedTeam) return;
  loadHistory({ silent: true }).catch((error) => {
    setStatus(`自動更新に失敗しました: ${error.message}`);
  });
}, pollIntervalMs);

applySidebarState();
refreshAll();

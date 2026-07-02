const avatarOverridesKey = "agmsg-bubblelog-avatar-overrides";
const languageStorageKey = "agmsg-bubblelog-language";
const avatarExpressionNames = ["thinking", "sad", "happy", "neutral", "calm", "talk"];
const urlParams = new URLSearchParams(window.location.search);
const isDemoMode =
  window.location.pathname === "/demo" ||
  window.location.pathname === "/demo/" ||
  urlParams.get("demo") === "1";
const demoTeamName = "demo-x-capture";
const demoAgents = [
  { name: "claude-director", type: "claude", project: "demo" },
  { name: "codex-nyan", type: "codex", project: "demo" },
  { name: "gemini-qa", type: "gemini", project: "demo" },
];
const supportedLanguageIds = [
  "ja",
  "en",
  "zh-CN",
  "zh-TW",
  "ko",
  "ru",
  "es",
  "pt-BR",
  "de",
  "fr",
  "id",
  "tr",
  "vi",
  "pl",
  "it",
];
const languageOptions = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
  { id: "zh-CN", label: "简体中文" },
  { id: "zh-TW", label: "繁體中文" },
  { id: "ko", label: "한국어" },
  { id: "ru", label: "Русский" },
  { id: "es", label: "Español" },
  { id: "pt-BR", label: "Português (Brasil)" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
  { id: "id", label: "Bahasa Indonesia" },
  { id: "tr", label: "Türkçe" },
  { id: "vi", label: "Tiếng Việt" },
  { id: "pl", label: "Polski" },
  { id: "it", label: "Italiano" },
];
const supportedLanguageSet = new Set(supportedLanguageIds);
const dateLocales = {
  ja: "ja-JP",
  en: "en-US",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ko: "ko-KR",
  ru: "ru-RU",
  es: "es-ES",
  "pt-BR": "pt-BR",
  de: "de-DE",
  fr: "fr-FR",
  id: "id-ID",
  tr: "tr-TR",
  vi: "vi-VN",
  pl: "pl-PL",
  it: "it-IT",
};
const uiCopy = {
  en: {
    brandSubtitle: "Local conversation log viewer",
    teamPanelTitle: "Teams",
    displayPanelTitle: "View",
    language: "Language",
    limit: "Messages",
    compactView: "Compact view",
    showControlLogs: "Show control logs",
    teamNotSelected: "No team selected",
    chooseLog: "Choose a log",
    chatLog: "Conversation log",
    sidebarOpen: "Open team panel",
    sidebarClose: "Close team panel",
    refresh: "Refresh",
    loadingLocalTeams: "Loading local teams.",
    localTeamsMissing: "No local teams found.",
    unknownMembers: "Members unknown",
    newMessageButton: "↓ New {count}",
    newMessagesStatus: "{count} new messages.",
    messagesLoaded: "Showing {count} messages. Loaded locally.",
    loadingHistory: "Loading {team} history.",
    loadFailed: "Load failed: {message}",
    autoUpdateFailed: "Auto-refresh failed: {message}",
    noDisplayableMessages: "No displayable messages.",
    chooseTeam: "Choose a team on the left.",
    demoCaption: "Demo: {team}",
    demoTitle: "Demo capture log",
    demoStart: "Playing capture demo. Real agmsg history is not read.",
    demoThinking: "{agent} is thinking. Showing demo data only.",
    demoProgress: "Playing {count} / {total}. Real agmsg history is not read.",
    demoComplete: "Demo playback complete. It will replay in a few seconds.",
    avatarModalTitle: "Avatar",
    close: "Close",
    resetDefault: "Reset to default",
    chooseAvatarTitle: "Choose avatar for {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} is thinking",
    thinkingMeta: "{agent} · Thinking ",
    thinkingLabel: "Thinking",
    waitingResponse: "Waiting for response",
    "emotion.error": "Attention",
    "emotion.warn": "Caution",
    "emotion.question": "Question",
    "emotion.good": "Done",
    "emotion.review": "Review",
    "emotion.waiting": "Waiting",
    "emotion.neutral": "Normal",
  },
  ja: {
    brandSubtitle: "ローカル会話ログビューア",
    teamPanelTitle: "チーム",
    displayPanelTitle: "表示",
    language: "言語",
    limit: "件数",
    compactView: "コンパクト表示",
    showControlLogs: "制御ログも表示",
    teamNotSelected: "チーム未選択",
    chooseLog: "ログを選んでください",
    chatLog: "会話ログ",
    sidebarOpen: "チーム欄を開く",
    sidebarClose: "チーム欄を閉じる",
    refresh: "更新",
    loadingLocalTeams: "ローカルチームを読み込み中です。",
    localTeamsMissing: "ローカルチームが見つかりません。",
    unknownMembers: "メンバー不明",
    newMessageButton: "↓ 新着 {count}件",
    newMessagesStatus: "{count} 件の新着メッセージがあります。",
    messagesLoaded: "{count} 件を表示中。ローカルで読み込んでいます。",
    loadingHistory: "{team} の履歴を読み込み中です。",
    loadFailed: "読み込みに失敗しました: {message}",
    autoUpdateFailed: "自動更新に失敗しました: {message}",
    noDisplayableMessages: "表示できるメッセージがありません。",
    chooseTeam: "左のチームを選んでください。",
    demoCaption: "デモ: {team}",
    demoTitle: "撮影用デモログ",
    demoStart: "撮影用デモを再生します。本物のagmsg履歴は読みません。",
    demoThinking: "{agent} が考え中です。デモデータだけを表示しています。",
    demoProgress: "{count} / {total} 件を再生中です。本物のagmsg履歴は読みません。",
    demoComplete: "デモ再生が完了しました。数秒後にもう一度流します。",
    avatarModalTitle: "顔アイコン",
    close: "閉じる",
    resetDefault: "標準に戻す",
    chooseAvatarTitle: "{agent} の顔アイコンを選ぶ",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} が考え中",
    thinkingMeta: "{agent} · 考え中 ",
    thinkingLabel: "思考中",
    waitingResponse: "応答を待っています",
    "emotion.error": "要注意",
    "emotion.warn": "警戒",
    "emotion.question": "質問",
    "emotion.good": "完了",
    "emotion.review": "レビュー",
    "emotion.waiting": "待機",
    "emotion.neutral": "通常",
  },
  "zh-CN": {
    brandSubtitle: "本地会话日志查看器",
    teamPanelTitle: "团队",
    displayPanelTitle: "显示",
    language: "语言",
    limit: "消息数",
    compactView: "紧凑显示",
    showControlLogs: "显示控制日志",
    teamNotSelected: "未选择团队",
    chooseLog: "请选择日志",
    chatLog: "会话日志",
    sidebarOpen: "打开团队栏",
    sidebarClose: "关闭团队栏",
    refresh: "刷新",
    loadingLocalTeams: "正在加载本地团队。",
    localTeamsMissing: "未找到本地团队。",
    unknownMembers: "成员未知",
    newMessageButton: "↓ 新消息 {count}",
    newMessagesStatus: "有 {count} 条新消息。",
    messagesLoaded: "正在显示 {count} 条消息。本地读取。",
    loadingHistory: "正在加载 {team} 的历史。",
    loadFailed: "加载失败: {message}",
    autoUpdateFailed: "自动刷新失败: {message}",
    noDisplayableMessages: "没有可显示的消息。",
    chooseTeam: "请从左侧选择团队。",
    demoCaption: "演示: {team}",
    demoTitle: "录制用演示日志",
    demoStart: "正在播放录制演示。不读取真实 agmsg 历史。",
    demoThinking: "{agent} 正在思考。仅显示演示数据。",
    demoProgress: "正在播放 {count} / {total}。不读取真实 agmsg 历史。",
    demoComplete: "演示播放完成。几秒后将再次播放。",
    avatarModalTitle: "头像",
    close: "关闭",
    resetDefault: "恢复默认",
    chooseAvatarTitle: "为 {agent} 选择头像",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} 正在思考",
    thinkingMeta: "{agent} · 思考中 ",
    thinkingLabel: "思考中",
    waitingResponse: "等待回复",
    "emotion.error": "注意",
    "emotion.warn": "警戒",
    "emotion.question": "问题",
    "emotion.good": "完成",
    "emotion.review": "评审",
    "emotion.waiting": "等待",
    "emotion.neutral": "普通",
  },
  "zh-TW": {
    brandSubtitle: "本機對話紀錄檢視器",
    teamPanelTitle: "團隊",
    displayPanelTitle: "顯示",
    language: "語言",
    limit: "訊息數",
    compactView: "緊湊顯示",
    showControlLogs: "顯示控制紀錄",
    teamNotSelected: "尚未選擇團隊",
    chooseLog: "請選擇紀錄",
    chatLog: "對話紀錄",
    sidebarOpen: "開啟團隊欄",
    sidebarClose: "關閉團隊欄",
    refresh: "重新整理",
    loadingLocalTeams: "正在載入本機團隊。",
    localTeamsMissing: "找不到本機團隊。",
    unknownMembers: "成員不明",
    newMessageButton: "↓ 新訊息 {count}",
    newMessagesStatus: "有 {count} 則新訊息。",
    messagesLoaded: "正在顯示 {count} 則訊息。已從本機讀取。",
    loadingHistory: "正在載入 {team} 的歷史紀錄。",
    loadFailed: "載入失敗: {message}",
    autoUpdateFailed: "自動更新失敗: {message}",
    noDisplayableMessages: "沒有可顯示的訊息。",
    chooseTeam: "請從左側選擇團隊。",
    demoCaption: "示範: {team}",
    demoTitle: "錄製用示範紀錄",
    demoStart: "正在播放錄製用示範。不讀取真正的 agmsg 歷史。",
    demoThinking: "{agent} 正在思考。只顯示示範資料。",
    demoProgress: "正在播放 {count} / {total}。不讀取真正的 agmsg 歷史。",
    demoComplete: "示範播放完成。幾秒後會再次播放。",
    avatarModalTitle: "頭像",
    close: "關閉",
    resetDefault: "恢復預設",
    chooseAvatarTitle: "為 {agent} 選擇頭像",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} 正在思考",
    thinkingMeta: "{agent} · 思考中 ",
    thinkingLabel: "思考中",
    waitingResponse: "等待回覆",
    "emotion.error": "注意",
    "emotion.warn": "警戒",
    "emotion.question": "問題",
    "emotion.good": "完成",
    "emotion.review": "審查",
    "emotion.waiting": "等待",
    "emotion.neutral": "一般",
  },
  ko: {
    brandSubtitle: "로컬 대화 로그 뷰어",
    teamPanelTitle: "팀",
    displayPanelTitle: "보기",
    language: "언어",
    limit: "메시지 수",
    compactView: "컴팩트 보기",
    showControlLogs: "제어 로그 표시",
    teamNotSelected: "팀 미선택",
    chooseLog: "로그를 선택하세요",
    chatLog: "대화 로그",
    sidebarOpen: "팀 패널 열기",
    sidebarClose: "팀 패널 닫기",
    refresh: "새로고침",
    loadingLocalTeams: "로컬 팀을 불러오는 중입니다.",
    localTeamsMissing: "로컬 팀을 찾을 수 없습니다.",
    unknownMembers: "멤버 알 수 없음",
    newMessageButton: "↓ 새 메시지 {count}",
    newMessagesStatus: "새 메시지 {count}개가 있습니다.",
    messagesLoaded: "{count}개 메시지를 표시 중입니다. 로컬에서 읽었습니다.",
    loadingHistory: "{team} 기록을 불러오는 중입니다.",
    loadFailed: "불러오기 실패: {message}",
    autoUpdateFailed: "자동 새로고침 실패: {message}",
    noDisplayableMessages: "표시할 메시지가 없습니다.",
    chooseTeam: "왼쪽에서 팀을 선택하세요.",
    demoCaption: "데모: {team}",
    demoTitle: "촬영용 데모 로그",
    demoStart: "촬영용 데모를 재생합니다. 실제 agmsg 기록은 읽지 않습니다.",
    demoThinking: "{agent} 이(가) 생각 중입니다. 데모 데이터만 표시합니다.",
    demoProgress: "{count} / {total} 재생 중입니다. 실제 agmsg 기록은 읽지 않습니다.",
    demoComplete: "데모 재생이 완료되었습니다. 몇 초 후 다시 재생합니다.",
    avatarModalTitle: "아바타",
    close: "닫기",
    resetDefault: "기본값으로",
    chooseAvatarTitle: "{agent} 아바타 선택",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} 이(가) 생각 중",
    thinkingMeta: "{agent} · 생각 중 ",
    thinkingLabel: "생각 중",
    waitingResponse: "응답 대기 중",
    "emotion.error": "주의",
    "emotion.warn": "경계",
    "emotion.question": "질문",
    "emotion.good": "완료",
    "emotion.review": "리뷰",
    "emotion.waiting": "대기",
    "emotion.neutral": "보통",
  },
  ru: {
    brandSubtitle: "Локальный просмотр журнала диалогов",
    teamPanelTitle: "Команды",
    displayPanelTitle: "Вид",
    language: "Язык",
    limit: "Сообщения",
    compactView: "Компактный вид",
    showControlLogs: "Показывать служебные логи",
    teamNotSelected: "Команда не выбрана",
    chooseLog: "Выберите журнал",
    chatLog: "Журнал диалога",
    sidebarOpen: "Открыть панель команд",
    sidebarClose: "Закрыть панель команд",
    refresh: "Обновить",
    loadingLocalTeams: "Загрузка локальных команд.",
    localTeamsMissing: "Локальные команды не найдены.",
    unknownMembers: "Участники неизвестны",
    newMessageButton: "↓ Новые {count}",
    newMessagesStatus: "Новых сообщений: {count}.",
    messagesLoaded: "Показано сообщений: {count}. Загружено локально.",
    loadingHistory: "Загрузка истории {team}.",
    loadFailed: "Ошибка загрузки: {message}",
    autoUpdateFailed: "Ошибка автообновления: {message}",
    noDisplayableMessages: "Нет сообщений для отображения.",
    chooseTeam: "Выберите команду слева.",
    demoCaption: "Демо: {team}",
    demoTitle: "Демо-журнал для записи",
    demoStart: "Воспроизводится демо для записи. Реальная история agmsg не читается.",
    demoThinking: "{agent} думает. Показаны только демо-данные.",
    demoProgress: "Воспроизведение {count} / {total}. Реальная история agmsg не читается.",
    demoComplete: "Демо завершено. Повтор начнется через несколько секунд.",
    avatarModalTitle: "Аватар",
    close: "Закрыть",
    resetDefault: "Сбросить",
    chooseAvatarTitle: "Выбрать аватар для {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} думает",
    thinkingMeta: "{agent} · Думает ",
    thinkingLabel: "Думает",
    waitingResponse: "Ожидание ответа",
    "emotion.error": "Внимание",
    "emotion.warn": "Осторожно",
    "emotion.question": "Вопрос",
    "emotion.good": "Готово",
    "emotion.review": "Ревью",
    "emotion.waiting": "Ожидание",
    "emotion.neutral": "Обычно",
  },
  es: {
    brandSubtitle: "Visor local de registros de conversación",
    teamPanelTitle: "Equipos",
    displayPanelTitle: "Vista",
    language: "Idioma",
    limit: "Mensajes",
    compactView: "Vista compacta",
    showControlLogs: "Mostrar logs de control",
    teamNotSelected: "Sin equipo seleccionado",
    chooseLog: "Elige un log",
    chatLog: "Log de conversación",
    sidebarOpen: "Abrir panel de equipos",
    sidebarClose: "Cerrar panel de equipos",
    refresh: "Actualizar",
    loadingLocalTeams: "Cargando equipos locales.",
    localTeamsMissing: "No se encontraron equipos locales.",
    unknownMembers: "Miembros desconocidos",
    newMessageButton: "↓ Nuevos {count}",
    newMessagesStatus: "{count} mensajes nuevos.",
    messagesLoaded: "Mostrando {count} mensajes. Cargado localmente.",
    loadingHistory: "Cargando historial de {team}.",
    loadFailed: "Error al cargar: {message}",
    autoUpdateFailed: "Error de actualización automática: {message}",
    noDisplayableMessages: "No hay mensajes para mostrar.",
    chooseTeam: "Elige un equipo a la izquierda.",
    demoCaption: "Demo: {team}",
    demoTitle: "Log demo para grabación",
    demoStart: "Reproduciendo demo de captura. No se lee el historial real de agmsg.",
    demoThinking: "{agent} está pensando. Solo se muestran datos demo.",
    demoProgress: "Reproduciendo {count} / {total}. No se lee el historial real de agmsg.",
    demoComplete: "La demo terminó. Se repetirá en unos segundos.",
    avatarModalTitle: "Avatar",
    close: "Cerrar",
    resetDefault: "Restablecer",
    chooseAvatarTitle: "Elegir avatar para {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} está pensando",
    thinkingMeta: "{agent} · Pensando ",
    thinkingLabel: "Pensando",
    waitingResponse: "Esperando respuesta",
    "emotion.error": "Atención",
    "emotion.warn": "Cuidado",
    "emotion.question": "Pregunta",
    "emotion.good": "Listo",
    "emotion.review": "Revisión",
    "emotion.waiting": "Espera",
    "emotion.neutral": "Normal",
  },
  "pt-BR": {
    brandSubtitle: "Visualizador local de logs de conversa",
    teamPanelTitle: "Equipes",
    displayPanelTitle: "Visualização",
    language: "Idioma",
    limit: "Mensagens",
    compactView: "Visualização compacta",
    showControlLogs: "Mostrar logs de controle",
    teamNotSelected: "Nenhuma equipe selecionada",
    chooseLog: "Escolha um log",
    chatLog: "Log da conversa",
    sidebarOpen: "Abrir painel de equipes",
    sidebarClose: "Fechar painel de equipes",
    refresh: "Atualizar",
    loadingLocalTeams: "Carregando equipes locais.",
    localTeamsMissing: "Nenhuma equipe local encontrada.",
    unknownMembers: "Membros desconhecidos",
    newMessageButton: "↓ Novas {count}",
    newMessagesStatus: "{count} novas mensagens.",
    messagesLoaded: "Mostrando {count} mensagens. Carregado localmente.",
    loadingHistory: "Carregando histórico de {team}.",
    loadFailed: "Falha ao carregar: {message}",
    autoUpdateFailed: "Falha na atualização automática: {message}",
    noDisplayableMessages: "Não há mensagens para mostrar.",
    chooseTeam: "Escolha uma equipe à esquerda.",
    demoCaption: "Demo: {team}",
    demoTitle: "Log demo para gravação",
    demoStart: "Reproduzindo demo de captura. O histórico real do agmsg não é lido.",
    demoThinking: "{agent} está pensando. Apenas dados demo são exibidos.",
    demoProgress: "Reproduzindo {count} / {total}. O histórico real do agmsg não é lido.",
    demoComplete: "A demo terminou. Ela será repetida em alguns segundos.",
    avatarModalTitle: "Avatar",
    close: "Fechar",
    resetDefault: "Restaurar padrão",
    chooseAvatarTitle: "Escolher avatar para {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} está pensando",
    thinkingMeta: "{agent} · Pensando ",
    thinkingLabel: "Pensando",
    waitingResponse: "Aguardando resposta",
    "emotion.error": "Atenção",
    "emotion.warn": "Cuidado",
    "emotion.question": "Pergunta",
    "emotion.good": "Concluído",
    "emotion.review": "Revisão",
    "emotion.waiting": "Aguardando",
    "emotion.neutral": "Normal",
  },
  de: {
    brandSubtitle: "Lokaler Viewer für Gesprächslogs",
    teamPanelTitle: "Teams",
    displayPanelTitle: "Ansicht",
    language: "Sprache",
    limit: "Nachrichten",
    compactView: "Kompaktansicht",
    showControlLogs: "Steuerungslogs anzeigen",
    teamNotSelected: "Kein Team ausgewählt",
    chooseLog: "Log auswählen",
    chatLog: "Gesprächslog",
    sidebarOpen: "Teamleiste öffnen",
    sidebarClose: "Teamleiste schließen",
    refresh: "Aktualisieren",
    loadingLocalTeams: "Lokale Teams werden geladen.",
    localTeamsMissing: "Keine lokalen Teams gefunden.",
    unknownMembers: "Mitglieder unbekannt",
    newMessageButton: "↓ Neu {count}",
    newMessagesStatus: "{count} neue Nachrichten.",
    messagesLoaded: "{count} Nachrichten werden angezeigt. Lokal geladen.",
    loadingHistory: "Verlauf von {team} wird geladen.",
    loadFailed: "Laden fehlgeschlagen: {message}",
    autoUpdateFailed: "Automatische Aktualisierung fehlgeschlagen: {message}",
    noDisplayableMessages: "Keine anzeigbaren Nachrichten.",
    chooseTeam: "Wähle links ein Team.",
    demoCaption: "Demo: {team}",
    demoTitle: "Demo-Log für Aufnahme",
    demoStart: "Aufnahme-Demo wird abgespielt. Der echte agmsg-Verlauf wird nicht gelesen.",
    demoThinking: "{agent} denkt nach. Es werden nur Demo-Daten angezeigt.",
    demoProgress: "Wiedergabe {count} / {total}. Der echte agmsg-Verlauf wird nicht gelesen.",
    demoComplete: "Demo abgeschlossen. Sie startet in wenigen Sekunden erneut.",
    avatarModalTitle: "Avatar",
    close: "Schließen",
    resetDefault: "Zurücksetzen",
    chooseAvatarTitle: "Avatar für {agent} wählen",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} denkt nach",
    thinkingMeta: "{agent} · Denkt nach ",
    thinkingLabel: "Denkt nach",
    waitingResponse: "Warte auf Antwort",
    "emotion.error": "Achtung",
    "emotion.warn": "Vorsicht",
    "emotion.question": "Frage",
    "emotion.good": "Fertig",
    "emotion.review": "Review",
    "emotion.waiting": "Wartet",
    "emotion.neutral": "Normal",
  },
  fr: {
    brandSubtitle: "Visionneuse locale de journaux de conversation",
    teamPanelTitle: "Équipes",
    displayPanelTitle: "Affichage",
    language: "Langue",
    limit: "Messages",
    compactView: "Affichage compact",
    showControlLogs: "Afficher les logs de contrôle",
    teamNotSelected: "Aucune équipe sélectionnée",
    chooseLog: "Choisissez un log",
    chatLog: "Journal de conversation",
    sidebarOpen: "Ouvrir le panneau des équipes",
    sidebarClose: "Fermer le panneau des équipes",
    refresh: "Actualiser",
    loadingLocalTeams: "Chargement des équipes locales.",
    localTeamsMissing: "Aucune équipe locale trouvée.",
    unknownMembers: "Membres inconnus",
    newMessageButton: "↓ Nouveaux {count}",
    newMessagesStatus: "{count} nouveaux messages.",
    messagesLoaded: "{count} messages affichés. Chargés localement.",
    loadingHistory: "Chargement de l'historique de {team}.",
    loadFailed: "Échec du chargement: {message}",
    autoUpdateFailed: "Échec de l'actualisation automatique: {message}",
    noDisplayableMessages: "Aucun message à afficher.",
    chooseTeam: "Choisissez une équipe à gauche.",
    demoCaption: "Démo: {team}",
    demoTitle: "Log de démo pour capture",
    demoStart: "Lecture de la démo de capture. Le véritable historique agmsg n'est pas lu.",
    demoThinking: "{agent} réfléchit. Seules les données de démo sont affichées.",
    demoProgress: "Lecture {count} / {total}. Le véritable historique agmsg n'est pas lu.",
    demoComplete: "La démo est terminée. Elle redémarrera dans quelques secondes.",
    avatarModalTitle: "Avatar",
    close: "Fermer",
    resetDefault: "Réinitialiser",
    chooseAvatarTitle: "Choisir l'avatar de {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} réfléchit",
    thinkingMeta: "{agent} · Réflexion ",
    thinkingLabel: "Réflexion",
    waitingResponse: "En attente de réponse",
    "emotion.error": "Attention",
    "emotion.warn": "Prudence",
    "emotion.question": "Question",
    "emotion.good": "Terminé",
    "emotion.review": "Revue",
    "emotion.waiting": "Attente",
    "emotion.neutral": "Normal",
  },
  id: {
    brandSubtitle: "Penampil log percakapan lokal",
    teamPanelTitle: "Tim",
    displayPanelTitle: "Tampilan",
    language: "Bahasa",
    limit: "Pesan",
    compactView: "Tampilan ringkas",
    showControlLogs: "Tampilkan log kontrol",
    teamNotSelected: "Tim belum dipilih",
    chooseLog: "Pilih log",
    chatLog: "Log percakapan",
    sidebarOpen: "Buka panel tim",
    sidebarClose: "Tutup panel tim",
    refresh: "Segarkan",
    loadingLocalTeams: "Memuat tim lokal.",
    localTeamsMissing: "Tim lokal tidak ditemukan.",
    unknownMembers: "Anggota tidak diketahui",
    newMessageButton: "↓ Baru {count}",
    newMessagesStatus: "{count} pesan baru.",
    messagesLoaded: "Menampilkan {count} pesan. Dimuat secara lokal.",
    loadingHistory: "Memuat riwayat {team}.",
    loadFailed: "Gagal memuat: {message}",
    autoUpdateFailed: "Gagal menyegarkan otomatis: {message}",
    noDisplayableMessages: "Tidak ada pesan yang dapat ditampilkan.",
    chooseTeam: "Pilih tim di sebelah kiri.",
    demoCaption: "Demo: {team}",
    demoTitle: "Log demo untuk rekaman",
    demoStart: "Memutar demo rekaman. Riwayat agmsg asli tidak dibaca.",
    demoThinking: "{agent} sedang berpikir. Hanya data demo yang ditampilkan.",
    demoProgress: "Memutar {count} / {total}. Riwayat agmsg asli tidak dibaca.",
    demoComplete: "Demo selesai. Akan diputar ulang dalam beberapa detik.",
    avatarModalTitle: "Avatar",
    close: "Tutup",
    resetDefault: "Kembalikan bawaan",
    chooseAvatarTitle: "Pilih avatar untuk {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} sedang berpikir",
    thinkingMeta: "{agent} · Berpikir ",
    thinkingLabel: "Berpikir",
    waitingResponse: "Menunggu respons",
    "emotion.error": "Perhatian",
    "emotion.warn": "Waspada",
    "emotion.question": "Pertanyaan",
    "emotion.good": "Selesai",
    "emotion.review": "Tinjauan",
    "emotion.waiting": "Menunggu",
    "emotion.neutral": "Normal",
  },
  tr: {
    brandSubtitle: "Yerel konuşma günlüğü görüntüleyici",
    teamPanelTitle: "Takımlar",
    displayPanelTitle: "Görünüm",
    language: "Dil",
    limit: "Mesajlar",
    compactView: "Kompakt görünüm",
    showControlLogs: "Kontrol günlüklerini göster",
    teamNotSelected: "Takım seçilmedi",
    chooseLog: "Bir günlük seçin",
    chatLog: "Konuşma günlüğü",
    sidebarOpen: "Takım panelini aç",
    sidebarClose: "Takım panelini kapat",
    refresh: "Yenile",
    loadingLocalTeams: "Yerel takımlar yükleniyor.",
    localTeamsMissing: "Yerel takım bulunamadı.",
    unknownMembers: "Üyeler bilinmiyor",
    newMessageButton: "↓ Yeni {count}",
    newMessagesStatus: "{count} yeni mesaj var.",
    messagesLoaded: "{count} mesaj gösteriliyor. Yerelden yüklendi.",
    loadingHistory: "{team} geçmişi yükleniyor.",
    loadFailed: "Yükleme başarısız: {message}",
    autoUpdateFailed: "Otomatik yenileme başarısız: {message}",
    noDisplayableMessages: "Gösterilecek mesaj yok.",
    chooseTeam: "Soldan bir takım seçin.",
    demoCaption: "Demo: {team}",
    demoTitle: "Kayıt için demo günlüğü",
    demoStart: "Kayıt demosu oynatılıyor. Gerçek agmsg geçmişi okunmaz.",
    demoThinking: "{agent} düşünüyor. Yalnızca demo verileri gösteriliyor.",
    demoProgress: "{count} / {total} oynatılıyor. Gerçek agmsg geçmişi okunmaz.",
    demoComplete: "Demo tamamlandı. Birkaç saniye sonra tekrar oynatılacak.",
    avatarModalTitle: "Avatar",
    close: "Kapat",
    resetDefault: "Varsayılana dön",
    chooseAvatarTitle: "{agent} için avatar seç",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} düşünüyor",
    thinkingMeta: "{agent} · Düşünüyor ",
    thinkingLabel: "Düşünüyor",
    waitingResponse: "Yanıt bekleniyor",
    "emotion.error": "Dikkat",
    "emotion.warn": "Uyarı",
    "emotion.question": "Soru",
    "emotion.good": "Tamamlandı",
    "emotion.review": "İnceleme",
    "emotion.waiting": "Bekliyor",
    "emotion.neutral": "Normal",
  },
  vi: {
    brandSubtitle: "Trình xem nhật ký hội thoại cục bộ",
    teamPanelTitle: "Nhóm",
    displayPanelTitle: "Hiển thị",
    language: "Ngôn ngữ",
    limit: "Tin nhắn",
    compactView: "Hiển thị gọn",
    showControlLogs: "Hiển thị log điều khiển",
    teamNotSelected: "Chưa chọn nhóm",
    chooseLog: "Chọn nhật ký",
    chatLog: "Nhật ký hội thoại",
    sidebarOpen: "Mở cột nhóm",
    sidebarClose: "Đóng cột nhóm",
    refresh: "Làm mới",
    loadingLocalTeams: "Đang tải nhóm cục bộ.",
    localTeamsMissing: "Không tìm thấy nhóm cục bộ.",
    unknownMembers: "Không rõ thành viên",
    newMessageButton: "↓ Mới {count}",
    newMessagesStatus: "Có {count} tin nhắn mới.",
    messagesLoaded: "Đang hiển thị {count} tin nhắn. Đã tải cục bộ.",
    loadingHistory: "Đang tải lịch sử của {team}.",
    loadFailed: "Tải thất bại: {message}",
    autoUpdateFailed: "Tự động làm mới thất bại: {message}",
    noDisplayableMessages: "Không có tin nhắn để hiển thị.",
    chooseTeam: "Chọn một nhóm ở bên trái.",
    demoCaption: "Demo: {team}",
    demoTitle: "Nhật ký demo để ghi hình",
    demoStart: "Đang phát demo ghi hình. Không đọc lịch sử agmsg thật.",
    demoThinking: "{agent} đang suy nghĩ. Chỉ hiển thị dữ liệu demo.",
    demoProgress: "Đang phát {count} / {total}. Không đọc lịch sử agmsg thật.",
    demoComplete: "Demo đã hoàn tất. Sẽ phát lại sau vài giây.",
    avatarModalTitle: "Avatar",
    close: "Đóng",
    resetDefault: "Khôi phục mặc định",
    chooseAvatarTitle: "Chọn avatar cho {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} đang suy nghĩ",
    thinkingMeta: "{agent} · Đang suy nghĩ ",
    thinkingLabel: "Đang nghĩ",
    waitingResponse: "Đang chờ phản hồi",
    "emotion.error": "Chú ý",
    "emotion.warn": "Cảnh báo",
    "emotion.question": "Câu hỏi",
    "emotion.good": "Hoàn tất",
    "emotion.review": "Đánh giá",
    "emotion.waiting": "Đang chờ",
    "emotion.neutral": "Bình thường",
  },
  pl: {
    brandSubtitle: "Lokalna przeglądarka logów rozmów",
    teamPanelTitle: "Zespoły",
    displayPanelTitle: "Widok",
    language: "Język",
    limit: "Wiadomości",
    compactView: "Widok kompaktowy",
    showControlLogs: "Pokaż logi sterujące",
    teamNotSelected: "Nie wybrano zespołu",
    chooseLog: "Wybierz log",
    chatLog: "Log rozmowy",
    sidebarOpen: "Otwórz panel zespołów",
    sidebarClose: "Zamknij panel zespołów",
    refresh: "Odśwież",
    loadingLocalTeams: "Ładowanie lokalnych zespołów.",
    localTeamsMissing: "Nie znaleziono lokalnych zespołów.",
    unknownMembers: "Nieznani członkowie",
    newMessageButton: "↓ Nowe {count}",
    newMessagesStatus: "Nowe wiadomości: {count}.",
    messagesLoaded: "Wyświetlono {count} wiadomości. Wczytano lokalnie.",
    loadingHistory: "Ładowanie historii {team}.",
    loadFailed: "Błąd ładowania: {message}",
    autoUpdateFailed: "Błąd automatycznego odświeżania: {message}",
    noDisplayableMessages: "Brak wiadomości do wyświetlenia.",
    chooseTeam: "Wybierz zespół po lewej.",
    demoCaption: "Demo: {team}",
    demoTitle: "Log demo do nagrania",
    demoStart: "Odtwarzanie demo do nagrania. Prawdziwa historia agmsg nie jest czytana.",
    demoThinking: "{agent} myśli. Wyświetlane są tylko dane demo.",
    demoProgress: "Odtwarzanie {count} / {total}. Prawdziwa historia agmsg nie jest czytana.",
    demoComplete: "Demo zakończone. Powtórzy się za kilka sekund.",
    avatarModalTitle: "Awatar",
    close: "Zamknij",
    resetDefault: "Przywróć domyślne",
    chooseAvatarTitle: "Wybierz awatar dla {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} myśli",
    thinkingMeta: "{agent} · Myśli ",
    thinkingLabel: "Myśli",
    waitingResponse: "Oczekiwanie na odpowiedź",
    "emotion.error": "Uwaga",
    "emotion.warn": "Ostrożnie",
    "emotion.question": "Pytanie",
    "emotion.good": "Gotowe",
    "emotion.review": "Przegląd",
    "emotion.waiting": "Oczekiwanie",
    "emotion.neutral": "Normalnie",
  },
  it: {
    brandSubtitle: "Visualizzatore locale dei log di conversazione",
    teamPanelTitle: "Team",
    displayPanelTitle: "Vista",
    language: "Lingua",
    limit: "Messaggi",
    compactView: "Vista compatta",
    showControlLogs: "Mostra log di controllo",
    teamNotSelected: "Nessun team selezionato",
    chooseLog: "Scegli un log",
    chatLog: "Log conversazione",
    sidebarOpen: "Apri pannello team",
    sidebarClose: "Chiudi pannello team",
    refresh: "Aggiorna",
    loadingLocalTeams: "Caricamento dei team locali.",
    localTeamsMissing: "Nessun team locale trovato.",
    unknownMembers: "Membri sconosciuti",
    newMessageButton: "↓ Nuovi {count}",
    newMessagesStatus: "{count} nuovi messaggi.",
    messagesLoaded: "Mostro {count} messaggi. Caricati localmente.",
    loadingHistory: "Caricamento cronologia di {team}.",
    loadFailed: "Caricamento non riuscito: {message}",
    autoUpdateFailed: "Aggiornamento automatico non riuscito: {message}",
    noDisplayableMessages: "Nessun messaggio da mostrare.",
    chooseTeam: "Scegli un team a sinistra.",
    demoCaption: "Demo: {team}",
    demoTitle: "Log demo per registrazione",
    demoStart: "Riproduzione demo di cattura. La cronologia reale di agmsg non viene letta.",
    demoThinking: "{agent} sta pensando. Sono mostrati solo dati demo.",
    demoProgress: "Riproduzione {count} / {total}. La cronologia reale di agmsg non viene letta.",
    demoComplete: "Demo completata. Verrà riprodotta di nuovo tra pochi secondi.",
    avatarModalTitle: "Avatar",
    close: "Chiudi",
    resetDefault: "Ripristina predefinito",
    chooseAvatarTitle: "Scegli avatar per {agent}",
    agentEmotionTitle: "{agent} / {emotion}",
    thinkingAria: "{agent} sta pensando",
    thinkingMeta: "{agent} · Pensando ",
    thinkingLabel: "Pensando",
    waitingResponse: "In attesa di risposta",
    "emotion.error": "Attenzione",
    "emotion.warn": "Prudenza",
    "emotion.question": "Domanda",
    "emotion.good": "Fatto",
    "emotion.review": "Revisione",
    "emotion.waiting": "Attesa",
    "emotion.neutral": "Normale",
  },
};
const demoScript = [
  {
    fromAgent: "claude-director",
    toAgent: "codex-nyan",
    body: "撮影用のデモを開始します。本物のagmsg履歴は読みません。",
    emotion: "waiting",
  },
  {
    fromAgent: "codex-nyan",
    toAgent: "claude-director",
    body: "了解ニャ。架空チームだけで吹き出しを再生するニャ。",
    emotion: "good",
  },
  {
    fromAgent: "gemini-qa",
    toAgent: "codex-nyan",
    body: "確認ポイント: 左カラムを閉じても会話幅が安定、横スクロールなし。",
    emotion: "review",
  },
  {
    fromAgent: "codex-nyan",
    toAgent: "gemini-qa",
    body: "右側の顔アイコンも左側と同じ基準線に揃えたニャ。",
    emotion: "good",
  },
  {
    fromAgent: "claude-director",
    toAgent: "codex-nyan",
    body: "新着はLINE風に、下を見ている時だけ自動追従。途中を読んでいる時はボタンで知らせます。",
    emotion: "question",
  },
  {
    fromAgent: "codex-nyan",
    toAgent: "claude-director",
    body: "X用の録画はこの /demo だけ映せば安全ニャ。",
    emotion: "good",
  },
  {
    fromAgent: "gemini-qa",
    toAgent: "claude-director",
    body: "OK。デモデータのみ表示、API履歴は未取得です。",
    emotion: "review",
  },
  {
    fromAgent: "codex-nyan",
    toAgent: "gemini-qa",
    body: "撮影準備完了ニャ。もう一周、自動で再生するニャ。",
    emotion: "good",
  },
];
let demoTimerId = 0;

const state = {
  language: loadLanguage(),
  teams: [],
  selectedTeam: "",
  entries: [],
  agentIcons: {},
  avatarCatalog: [],
  avatarOverrides: loadAvatarOverrides(),
  avatarTargetAgent: "",
  showControls: false,
  compact: true,
  limit: 80,
  loadingTeams: false,
  loadingHistory: false,
  sidebarCollapsed: localStorage.getItem("agmsg-bubblelog-sidebar") === "collapsed",
  unreadCount: 0,
  demoCursor: 0,
  demoThinkingAgent: "",
};

const els = {
  shell: document.querySelector(".app-shell"),
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  brandSubtitle: document.querySelector("#brandSubtitle"),
  teamPanelTitle: document.querySelector("#teamPanelTitle"),
  displayPanelTitle: document.querySelector("#displayPanelTitle"),
  languageLabel: document.querySelector("#languageLabel"),
  languageSelect: document.querySelector("#languageSelect"),
  teamList: document.querySelector("#teamList"),
  limitLabel: document.querySelector("#limitLabel"),
  limitSelect: document.querySelector("#limitSelect"),
  compactLabel: document.querySelector("#compactLabel"),
  compactToggle: document.querySelector("#compactToggle"),
  controlLabel: document.querySelector("#controlLabel"),
  controlToggle: document.querySelector("#controlToggle"),
  refreshButton: document.querySelector("#refreshButton"),
  newMessageButton: document.querySelector("#newMessageButton"),
  statusLine: document.querySelector("#statusLine"),
  messageList: document.querySelector("#messageList"),
  teamCaption: document.querySelector("#teamCaption"),
  chatTitle: document.querySelector("#chatTitle"),
  avatarModal: document.querySelector("#avatarModal"),
  avatarModalAgent: document.querySelector("#avatarModalAgent"),
  avatarModalTitle: document.querySelector("#avatarModalTitle"),
  avatarModalClose: document.querySelector("#avatarModalClose"),
  avatarGrid: document.querySelector("#avatarGrid"),
  avatarResetButton: document.querySelector("#avatarResetButton"),
};

const pollIntervalMs = 5000;

function resolveLocaleToLanguage(value) {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/_/g, "-");
  const exact = supportedLanguageIds.find((language) => language.toLowerCase() === normalized);
  if (exact) return exact;

  if (normalized.startsWith("zh")) {
    if (normalized.includes("hant") || normalized.includes("tw") || normalized.includes("hk")) {
      return "zh-TW";
    }
    return "zh-CN";
  }

  if (normalized.startsWith("pt")) return "pt-BR";
  if (normalized.startsWith("in")) return "id";

  const prefix = normalized.split("-")[0];
  return supportedLanguageSet.has(prefix) ? prefix : null;
}

function resolveInitialLanguage(stored, browserLanguages = []) {
  const storedLanguage = resolveLocaleToLanguage(stored);
  if (storedLanguage) return storedLanguage;

  for (const browserLanguage of browserLanguages) {
    const resolved = resolveLocaleToLanguage(browserLanguage);
    if (resolved) return resolved;
  }

  return "en";
}

function loadLanguage() {
  try {
    const stored = localStorage.getItem(languageStorageKey);
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    return resolveInitialLanguage(stored, browserLanguages.filter(Boolean));
  } catch {
    return "en";
  }
}

function saveLanguage() {
  try {
    localStorage.setItem(languageStorageKey, state.language);
  } catch {
    // Language persistence is a convenience; the UI still works if storage is blocked.
  }
}

function t(key, values = {}) {
  const copy = uiCopy[state.language] || uiCopy.en;
  const template = copy[key] || uiCopy.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function currentLocale() {
  return dateLocales[state.language] || "en-US";
}

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
  { key: "error", labelKey: "emotion.error", icon: "!", className: "error", words: ["失敗", "error", "fail", "壊", "できない", "危険", "注意"] },
  { key: "warn", labelKey: "emotion.warn", icon: "…", className: "warn", words: ["確認", "未確認", "リスク", "warning", "待って", "保留"] },
  { key: "question", labelKey: "emotion.question", icon: "?", className: "question", words: ["?", "？", "どう", "どれ", "相談", "質問"] },
  { key: "good", labelKey: "emotion.good", icon: "✓", className: "good", words: ["完了", "成功", "pass", "通った", "OK", "できた", "確認済み"] },
  { key: "review", labelKey: "emotion.review", icon: "R", className: "review", words: ["レビュー", "指摘", "P0", "QA", "判定"] },
  { key: "waiting", labelKey: "emotion.waiting", icon: "•", className: "waiting", words: ["待機", "見て", "お願いします", "依頼", "ready"] },
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
      labelKey: "emotion.neutral",
      icon: "・",
      className: "neutral",
    }
  );
}

function emotionForEntry(entry) {
  if (entry.emotion) {
    const explicit = emotionRules.find((rule) => rule.key === entry.emotion);
    if (explicit) return explicit;
  }
  return detectEmotion(entry.body);
}

function emotionLabel(emotion) {
  return t(emotion.labelKey || `emotion.${emotion.key}`);
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(currentLocale(), {
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

function loadAvatarOverrides() {
  try {
    return JSON.parse(localStorage.getItem(avatarOverridesKey) || "{}");
  } catch {
    return {};
  }
}

function saveAvatarOverrides() {
  localStorage.setItem(avatarOverridesKey, JSON.stringify(state.avatarOverrides));
}

function setStatus(text) {
  els.statusLine.textContent = text;
}

function renderLanguageOptions() {
  els.languageSelect.replaceChildren();
  for (const option of languageOptions) {
    const node = document.createElement("option");
    node.value = option.id;
    node.textContent = option.label;
    els.languageSelect.appendChild(node);
  }
  els.languageSelect.value = state.language;
}

function applyStaticCopy() {
  document.documentElement.lang = state.language;
  els.brandSubtitle.textContent = t("brandSubtitle");
  els.teamPanelTitle.textContent = t("teamPanelTitle");
  els.displayPanelTitle.textContent = t("displayPanelTitle");
  els.languageLabel.textContent = t("language");
  els.limitLabel.textContent = t("limit");
  els.compactLabel.textContent = t("compactView");
  els.controlLabel.textContent = t("showControlLogs");
  els.refreshButton.title = t("refresh");
  els.refreshButton.setAttribute("aria-label", t("refresh"));
  els.avatarModalTitle.textContent = t("avatarModalTitle");
  els.avatarModalClose.title = t("close");
  els.avatarModalClose.setAttribute("aria-label", t("close"));
  els.avatarResetButton.textContent = t("resetDefault");
  applySidebarState();
}

function refreshLocalizedStatus() {
  if (isDemoMode) {
    if (state.loadingHistory && state.demoThinkingAgent) {
      setStatus(t("demoThinking", { agent: state.demoThinkingAgent }));
    } else if (state.demoCursor >= demoScript.length && state.entries.length) {
      setStatus(t("demoComplete"));
    } else if (state.entries.length) {
      setStatus(t("demoProgress", { count: state.entries.length, total: demoScript.length }));
    } else {
      setStatus(t("demoStart"));
    }
    return;
  }

  if (state.loadingTeams) {
    setStatus(t("loadingLocalTeams"));
  } else if (state.loadingHistory && state.selectedTeam) {
    setStatus(t("loadingHistory", { team: state.selectedTeam }));
  } else if (state.selectedTeam) {
    setStatus(t("messagesLoaded", { count: state.entries.length }));
  } else {
    setStatus(t("loadingLocalTeams"));
  }
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
    els.newMessageButton.textContent = t("newMessageButton", { count: state.unreadCount });
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
  els.sidebarToggle.title = state.sidebarCollapsed ? t("sidebarOpen") : t("sidebarClose");
}

function selectedTeam() {
  return state.teams.find((team) => team.name === state.selectedTeam);
}

function thinkingAgentName(visibleEntries) {
  if (state.demoThinkingAgent) return state.demoThinkingAgent;
  const lastMessage = visibleEntries.at(-1);
  if (lastMessage?.toAgent) return lastMessage.toAgent;
  return selectedTeam()?.agents?.[0]?.name || "AI";
}

function demoTimestamp(index) {
  const minute = String(40 + index).padStart(2, "0");
  return `2026-07-02T09:${minute}:00Z`;
}

function buildDemoEntry(item, index) {
  return {
    id: `demo-${index + 1}`,
    team: demoTeamName,
    read: true,
    createdAt: demoTimestamp(index),
    fromAgent: item.fromAgent,
    toAgent: item.toAgent,
    body: item.body,
    emotion: item.emotion,
  };
}

function clearDemoTimer() {
  if (!demoTimerId) return;
  window.clearTimeout(demoTimerId);
  demoTimerId = 0;
}

function scheduleDemoStep() {
  if (!isDemoMode) return;
  clearDemoTimer();

  if (state.demoCursor >= demoScript.length) {
    state.loadingHistory = false;
    state.demoThinkingAgent = "";
    renderMessages({ scrollMode: "bottom" });
    setStatus(t("demoComplete"));
    demoTimerId = window.setTimeout(resetDemoPlayback, 2600);
    return;
  }

  const next = demoScript[state.demoCursor];
  state.loadingHistory = true;
  state.demoThinkingAgent = next.fromAgent;
  renderMessages({ scrollMode: "bottom" });
  setStatus(t("demoThinking", { agent: next.fromAgent }));

  demoTimerId = window.setTimeout(() => {
    const entry = buildDemoEntry(next, state.demoCursor);
    state.entries = [...state.entries, entry];
    state.demoCursor += 1;
    state.loadingHistory = false;
    state.demoThinkingAgent = "";
    state.unreadCount = 0;
    renderMessages({ scrollMode: "bottom" });
    setStatus(t("demoProgress", { count: state.entries.length, total: demoScript.length }));
    demoTimerId = window.setTimeout(scheduleDemoStep, 1100);
  }, 900);
}

function resetDemoPlayback() {
  clearDemoTimer();
  state.teams = [{ name: demoTeamName, agents: demoAgents }];
  state.selectedTeam = demoTeamName;
  state.entries = [];
  state.unreadCount = 0;
  state.demoCursor = 0;
  state.demoThinkingAgent = "";
  state.loadingTeams = false;
  state.loadingHistory = false;
  renderTeams();
  renderMessages({ scrollMode: "bottom" });
  setStatus(t("demoStart"));
  demoTimerId = window.setTimeout(scheduleDemoStep, 500);
}

function normalizeIconConfig(value) {
  if (!value) return null;
  return typeof value === "string" ? { src: value } : value;
}

function avatarSetConfig(set) {
  return {
    label: set.label,
    src: `./avatars/${set.key}-neutral.png`,
    emotions: Object.fromEntries(
      avatarExpressionNames.map((name) => [name, `./avatars/${set.key}-${name}.png`]),
    ),
  };
}

function resolveEmotionIcon(icon, emotionKey) {
  const emotions = icon?.emotions || {};
  const alias = emotionIconAliases[emotionKey] || emotionKey;
  const match = emotions[emotionKey] || emotions[alias];
  if (!match) return icon;
  return { ...icon, ...normalizeIconConfig(match) };
}

function agentIconConfig(name, emotionKey = "neutral") {
  const override = state.avatarOverrides[name];
  if (override) return resolveEmotionIcon(normalizeIconConfig(override), emotionKey);

  const exact = state.agentIcons[name];
  if (exact) return resolveEmotionIcon(normalizeIconConfig(exact), emotionKey);

  const lowerName = name.toLowerCase();
  const matched = Object.entries(state.agentIcons).find(([key]) => key.toLowerCase() === lowerName);
  if (!matched) return null;
  return resolveEmotionIcon(normalizeIconConfig(matched[1]), emotionKey);
}

function agentModelLabel(agentName) {
  const config = normalizeIconConfig(state.agentIcons[agentName]);
  return config?.model || "";
}

function agentNameButton(agentName, options = {}) {
  const button = document.createElement("button");
  const model = options.showModel ? agentModelLabel(agentName) : "";
  button.type = "button";
  button.className = "agent-name-button";
  button.dataset.agentName = agentName;
  button.textContent = model ? `${agentName} (${model})` : agentName;
  button.title = t("chooseAvatarTitle", { agent: agentName });
  return button;
}

function createAvatar(agentName, emotion) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.style.setProperty("--avatar-color", avatarColor(agentName));
  avatar.title = t("agentEmotionTitle", { agent: agentName, emotion: emotionLabel(emotion) });

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
  row.setAttribute("aria-label", t("thinkingAria", { agent: agentName }));

  const avatar = createAvatar(agentName, {
    key: "thinking",
    icon: "…",
    labelKey: "thinkingLabel",
  });

  const wrap = document.createElement("div");
  wrap.className = "bubble-wrap";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = t("thinkingMeta", { agent: agentName });

  const tag = document.createElement("span");
  tag.className = "emotion thinking-label";
  tag.textContent = t("thinkingLabel");
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
  text.textContent = t("waitingResponse");

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
    empty.textContent = t("localTeamsMissing");
    els.teamList.appendChild(empty);
    return;
  }

  for (const team of state.teams) {
    const button = document.createElement("div");
    button.role = "button";
    button.tabIndex = 0;
    button.className = `team-button${team.name === state.selectedTeam ? " active" : ""}`;
    button.dataset.team = team.name;
    button.setAttribute("aria-current", team.name === state.selectedTeam ? "true" : "false");

    const name = document.createElement("span");
    name.className = "team-name";
    name.textContent = team.name;

    const agents = document.createElement("span");
    agents.className = "team-agents";
    const members = team.agents || [];
    if (members.length) {
      members.forEach((agent, index) => {
        if (index > 0) agents.append(" / ");
        agents.appendChild(agentNameButton(agent.name));
      });
    } else {
      agents.textContent = t("unknownMembers");
    }

    button.append(name, agents);
    els.teamList.appendChild(button);
  }
}

function renderMessages({ scrollMode = "preserve", previousScrollTop = els.messageList.scrollTop } = {}) {
  els.shell.classList.toggle("compact", state.compact);
  els.shell.classList.toggle("demo-mode", isDemoMode);
  els.shell.classList.toggle("loading", state.loadingTeams || state.loadingHistory);
  els.messageList.setAttribute("aria-busy", state.loadingHistory ? "true" : "false");
  els.messageList.replaceChildren();
  if (isDemoMode) {
    els.teamCaption.textContent = t("demoCaption", { team: state.selectedTeam || demoTeamName });
    els.chatTitle.textContent = t("demoTitle");
  } else {
    els.teamCaption.textContent = state.selectedTeam
      ? `${t("teamPanelTitle")}: ${state.selectedTeam}`
      : t("teamNotSelected");
    els.chatTitle.textContent = state.selectedTeam ? t("chatLog") : t("chooseLog");
  }

  const visibleEntries = state.entries.filter(
    (entry) => state.showControls || !entry.body.startsWith("ctrl:"),
  );

  if (!visibleEntries.length && !state.loadingHistory) {
    const empty = document.createElement("div");
    empty.className = "control-message";
    empty.textContent = state.selectedTeam
      ? t("noDisplayableMessages")
      : t("chooseTeam");
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

    const emotion = emotionForEntry(entry);
    const mine = /codex/i.test(entry.fromAgent);

    const row = document.createElement("article");
    row.className = `message-row ${mine ? "mine" : "other"} ${emotion.className}`;

    const avatar = createAvatar(entry.fromAgent, emotion);

    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(agentNameButton(entry.fromAgent, { showModel: true }));
    meta.append(" → ");
    meta.appendChild(agentNameButton(entry.toAgent));
    meta.append(` · ${formatTime(entry.createdAt)} `);

    const tag = document.createElement("span");
    tag.className = "emotion";
    tag.textContent = emotionLabel(emotion);
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

  try {
    const data = await fetchJson("/avatar-catalog.json");
    state.avatarCatalog = data.sets || [];
  } catch {
    state.avatarCatalog = [];
  }
}

function renderAvatarModal() {
  els.avatarModalAgent.textContent = state.avatarTargetAgent || "agent";
  els.avatarGrid.replaceChildren();

  for (const set of state.avatarCatalog) {
    const config = avatarSetConfig(set);
    const option = document.createElement("button");
    option.type = "button";
    option.className = "avatar-option";
    option.dataset.avatarSet = set.key;
    option.title = set.label;

    const image = document.createElement("img");
    image.src = config.src;
    image.alt = set.label;
    image.loading = "lazy";

    const label = document.createElement("span");
    label.textContent = set.label;

    option.append(image, label);
    els.avatarGrid.appendChild(option);
  }
}

function openAvatarModal(agentName) {
  state.avatarTargetAgent = agentName;
  renderAvatarModal();
  els.avatarModal.hidden = false;
  els.avatarModalClose.focus();
}

function closeAvatarModal() {
  els.avatarModal.hidden = true;
  state.avatarTargetAgent = "";
}

function rerenderAfterAvatarChange() {
  const keepBottom = isNearBottom();
  renderTeams();
  renderMessages({ scrollMode: keepBottom ? "bottom" : "preserve" });
}

function chooseAvatarSet(setKey) {
  const set = state.avatarCatalog.find((item) => item.key === setKey);
  if (!set || !state.avatarTargetAgent) return;
  state.avatarOverrides[state.avatarTargetAgent] = avatarSetConfig(set);
  saveAvatarOverrides();
  closeAvatarModal();
  rerenderAfterAvatarChange();
}

function resetAvatarSet() {
  if (!state.avatarTargetAgent) return;
  delete state.avatarOverrides[state.avatarTargetAgent];
  saveAvatarOverrides();
  closeAvatarModal();
  rerenderAfterAvatarChange();
}

function changeLanguage(language) {
  const resolved = resolveLocaleToLanguage(language) || "en";
  state.language = resolved;
  els.languageSelect.value = resolved;
  saveLanguage();
  applyStaticCopy();
  renderTeams();
  renderMessages({ scrollMode: isNearBottom() ? "bottom" : "preserve" });
  refreshLocalizedStatus();
}

async function selectTeam(teamName) {
  state.selectedTeam = teamName;
  state.entries = [];
  state.unreadCount = 0;
  renderTeams();
  await loadHistory();
}

async function loadTeams() {
  if (isDemoMode) {
    state.loadingTeams = false;
    state.teams = [{ name: demoTeamName, agents: demoAgents }];
    state.selectedTeam = demoTeamName;
    renderTeams();
    return;
  }

  state.loadingTeams = true;
  renderMessages();
  setStatus(t("loadingLocalTeams"));
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
  if (isDemoMode) {
    resetDemoPlayback();
    return;
  }

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
    setStatus(t("loadingHistory", { team: state.selectedTeam }));
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
      setStatus(t("newMessagesStatus", { count: newCount }));
    } else {
      if (shouldFollowLatest) state.unreadCount = 0;
      if (!silent || newCount > 0) {
        setStatus(t("messagesLoaded", { count: state.entries.length }));
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
    if (isDemoMode) {
      resetDemoPlayback();
      return;
    }
    await loadTeams();
    await loadHistory();
  } catch (error) {
    state.loadingTeams = false;
    state.loadingHistory = false;
    renderMessages();
    setStatus(t("loadFailed", { message: error.message }));
  }
}

els.teamList.addEventListener("click", async (event) => {
  const agentButton = event.target.closest("[data-agent-name]");
  if (agentButton) {
    event.stopPropagation();
    openAvatarModal(agentButton.dataset.agentName);
    return;
  }

  const button = event.target.closest("[data-team]");
  if (!button) return;
  await selectTeam(button.dataset.team);
});
els.teamList.addEventListener("keydown", async (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const agentButton = event.target.closest("[data-agent-name]");
  if (agentButton) {
    event.preventDefault();
    openAvatarModal(agentButton.dataset.agentName);
    return;
  }

  const button = event.target.closest("[data-team]");
  if (!button) return;
  event.preventDefault();
  await selectTeam(button.dataset.team);
});

els.languageSelect.addEventListener("change", () => {
  changeLanguage(els.languageSelect.value);
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
els.messageList.addEventListener("click", (event) => {
  const agentButton = event.target.closest("[data-agent-name]");
  if (!agentButton) return;
  openAvatarModal(agentButton.dataset.agentName);
});
els.avatarGrid.addEventListener("click", (event) => {
  const option = event.target.closest("[data-avatar-set]");
  if (!option) return;
  chooseAvatarSet(option.dataset.avatarSet);
});
els.avatarResetButton.addEventListener("click", resetAvatarSet);
els.avatarModalClose.addEventListener("click", closeAvatarModal);
els.avatarModal.addEventListener("click", (event) => {
  if (event.target === els.avatarModal) closeAvatarModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.avatarModal.hidden) {
    closeAvatarModal();
  }
});

setInterval(() => {
  if (isDemoMode) return;
  if (state.loadingTeams || state.loadingHistory || !state.selectedTeam) return;
  loadHistory({ silent: true }).catch((error) => {
    setStatus(t("autoUpdateFailed", { message: error.message }));
  });
}, pollIntervalMs);

renderLanguageOptions();
applyStaticCopy();
refreshAll();

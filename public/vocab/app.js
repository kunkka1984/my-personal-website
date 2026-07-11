/* 词链 app.js —— 单用户背单词:SM-2 遗忘曲线 + 点选词链 + 云同步 */
"use strict";

/* ---------- 配置 ---------- */
const API_BASE = "https://vocab-api.jinchongjie.workers.dev";
const DATA_BASE = "data/";
const IVL_CAP = 180;

/* ---------- 小工具 ---------- */
const $ = (id) => document.getElementById(id);
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ---------- 全局 ---------- */
let state = null;      // 学习进度(云同步)
let manifest = null;   // 内容清单
let batches = {};      // batchId -> batch data
let DICT = {};         // 全量词典(dict.json ∪ 各 batch 词卡)
let dirty = false;
let syncTimer = null;

/* ---------- 进度 state ---------- */
function freshState() {
  return {
    rev: 0,
    updatedAt: null,
    settings: { newPerDay: 15, rate: 0.9, accent: "us" },
    words: {},   // w -> {st:'new'|'learn'|'rev'|'known', due, ivl, ease, reps, lapses, last, b}
    log: {},     // date -> {n(新学), r(复习), g(认识), a(忘了)}
    misses: [],
  };
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem("vocabState")) || null; }
  catch { return null; }
}
function saveLocal() {
  localStorage.setItem("vocabState", JSON.stringify(state));
}
function getToken() { return localStorage.getItem("vocabToken") || ""; }

/* 多设备合并:每词取 last 较新者;日志按日取大;misses 并集 */
function mergeStates(a, b) {
  const out = freshState();
  out.settings = { ...b.settings, ...a.settings };
  const keys = new Set([...Object.keys(a.words), ...Object.keys(b.words)]);
  for (const k of keys) {
    const wa = a.words[k], wb = b.words[k];
    if (!wa) { out.words[k] = wb; continue; }
    if (!wb) { out.words[k] = wa; continue; }
    out.words[k] = (wa.last || "") >= (wb.last || "") ? wa : wb;
  }
  const days = new Set([...Object.keys(a.log), ...Object.keys(b.log)]);
  for (const d of days) {
    const la = a.log[d] || {}, lb = b.log[d] || {};
    out.log[d] = {
      n: Math.max(la.n || 0, lb.n || 0), r: Math.max(la.r || 0, lb.r || 0),
      g: Math.max(la.g || 0, lb.g || 0), a: Math.max(la.a || 0, lb.a || 0),
    };
  }
  out.misses = [...new Set([...(a.misses || []), ...(b.misses || [])])];
  out.rev = Math.max(a.rev, b.rev);
  return out;
}

async function pullServer() {
  const token = getToken();
  if (!token || API_BASE.startsWith("__")) return null;
  const res = await fetch(`${API_BASE}/state`, { headers: { "X-Token": token } });
  if (!res.ok) throw new Error(`GET ${res.status}`);
  return await res.json();
}

async function pushServer() {
  const token = getToken();
  if (!token || API_BASE.startsWith("__")) return;
  state.rev += 1;
  state.updatedAt = new Date().toISOString();
  saveLocal();
  const res = await fetch(`${API_BASE}/state`, {
    method: "PUT",
    headers: { "X-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (res.status === 409) {
    const { server } = await res.json();
    state = mergeStates(state, server);
    state.rev = server.rev + 1;
    saveLocal();
    await fetch(`${API_BASE}/state`, {
      method: "PUT",
      headers: { "X-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } else if (!res.ok) {
    throw new Error(`PUT ${res.status}`);
  }
}

function markDirty() {
  dirty = true;
  saveLocal();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(flushSync, 4000);
}
async function flushSync() {
  if (!dirty) return;
  try {
    await pushServer();
    dirty = false;
    setSyncNote("已同步到云端");
  } catch {
    setSyncNote("云同步暂时失败，进度已存在本机，会自动重试");
  }
}
function setSyncNote(msg) {
  const el = $("sync-note");
  if (el) el.textContent = msg;
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && dirty) flushSync();
});

/* ---------- 内容加载 ---------- */
async function loadContent() {
  manifest = await (await fetch(DATA_BASE + "manifest.json")).json();
  const dictJson = await (await fetch(DATA_BASE + "dict.json")).json();
  Object.assign(DICT, dictJson);
  const files = await Promise.all(
    manifest.batches.map((b) => fetch(DATA_BASE + b.file).then((r) => r.json()))
  );
  for (const b of files) {
    batches[b.id] = b;
    for (const w of b.words) DICT[w.w] = { ipa: w.ipa, def: w.def, ex: w.ex };
  }
}

/* ---------- 词形还原(朴素) ---------- */
const IRREGULAR = {
  was: "be", were: "be", is: "be", are: "be", am: "be", been: "be", being: "be",
  went: "go", gone: "go", goes: "go", did: "do", does: "do", done: "do",
  had: "have", has: "have", having: "have", got: "get", gotten: "get",
  said: "say", says: "say", saw: "see", seen: "see", came: "come", coming: "come",
  took: "take", taken: "take", taking: "take", made: "make", making: "make",
  ran: "run", running: "run", won: "win", felt: "feel", left: "leave",
  told: "tell", knew: "know", known: "know", thought: "think", gave: "give", given: "give",
  found: "find", kept: "keep", met: "meet", lost: "lose", put: "put", let: "let",
  began: "begin", begun: "begin", broke: "break", broken: "break", brought: "bring",
  bought: "buy", caught: "catch", chose: "choose", fell: "fall", flew: "fly",
  grew: "grow", heard: "hear", held: "hold", hit: "hit", sat: "sit", stood: "stand",
  threw: "throw", wore: "wear", wrote: "write", spoke: "speak", sent: "send",
  taught: "teach", better: "good", best: "good", worse: "bad", worst: "bad",
  children: "child", feet: "foot", men: "man", women: "woman", stopped: "stop",
  tried: "try", cried: "cry", carried: "carry", studied: "study", planned: "plan",
};
function lookupWord(raw) {
  const w = raw.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return null;
  const tries = [w];
  if (IRREGULAR[w]) tries.push(IRREGULAR[w]);
  if (w.endsWith("'s")) tries.push(w.slice(0, -2));
  if (w.endsWith("ies")) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("es")) tries.push(w.slice(0, -2));
  if (w.endsWith("s")) tries.push(w.slice(0, -1));
  if (w.endsWith("ed")) tries.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) tries.push(w.slice(0, -3), w.slice(0, -3) + "e");
  for (const t of tries) if (DICT[t]) return { word: t, entry: DICT[t] };
  return { word: w, entry: null };
}

/* ---------- 可点击文本 ---------- */
function clickableHTML(text, targets = []) {
  const tset = new Set(targets.map((t) => t.toLowerCase()));
  return text.replace(/[A-Za-z][A-Za-z']*/g, (m) => {
    const hit = lookupWord(m);
    const isTarget = hit && tset.has(hit.word);
    return `<span class="w${isTarget ? " tw" : ""}">${m}</span>`;
  });
}
document.addEventListener("click", (e) => {
  const span = e.target.closest(".clickable span.w, .story span.w");
  if (span) openSheet(span.textContent);
});

/* ---------- 词链弹层 ---------- */
const NAMES = new Set(["tsubasa", "ryo", "genzo", "sanae", "roberto", "nankatsu",
  "brazil", "japan", "china", "pele", "english", "chinese", "japanese", "ok"]);
let sheetStack = [];
function openSheet(raw, push = true) {
  const r = lookupWord(raw);
  if (!r) return;
  if (NAMES.has(r.word)) {
    if (push) sheetStack.push(r.word);
    $("sheet-w").textContent = raw.replace(/[^A-Za-z']/g, "");
    $("sheet-i").textContent = "";
    $("sheet-d").innerHTML = "人名 / 地名，不用记 🙂";
    $("sheet-d").classList.remove("sheet-missing");
    $("sheet-e").innerHTML = "";
    $("sheet-back").style.visibility = sheetStack.length > 1 ? "visible" : "hidden";
    $("sheet-overlay").classList.remove("hidden");
    return;
  }
  if (push) sheetStack.push(r.word);
  $("sheet-w").textContent = r.word;
  if (r.entry) {
    $("sheet-i").textContent = r.entry.ipa
      ? `${r.entry.ipa} · ${state.settings.accent === "uk" ? "英" : "美"}` : "";
    $("sheet-d").innerHTML = clickableHTML(r.entry.def || "");
    $("sheet-e").innerHTML = r.entry.ex ? clickableHTML(r.entry.ex) : "";
    $("sheet-d").classList.remove("sheet-missing");
  } else {
    $("sheet-i").textContent = "";
    $("sheet-d").innerHTML = "这个词词典还没收录，已经记下来了，金教练会补上。";
    $("sheet-d").classList.add("sheet-missing");
    $("sheet-e").innerHTML = "";
    if (!state.misses.includes(r.word)) {
      state.misses.push(r.word);
      markDirty();
    }
  }
  $("sheet-back").style.visibility = sheetStack.length > 1 ? "visible" : "hidden";
  $("sheet-overlay").classList.remove("hidden");
}
$("sheet-close").addEventListener("click", () => {
  sheetStack = [];
  $("sheet-overlay").classList.add("hidden");
});
$("sheet-overlay").addEventListener("click", (e) => {
  if (e.target.id === "sheet-overlay") {
    sheetStack = [];
    $("sheet-overlay").classList.add("hidden");
  }
});
$("sheet-back").addEventListener("click", () => {
  sheetStack.pop();
  if (sheetStack.length) openSheet(sheetStack[sheetStack.length - 1], false);
  else $("sheet-overlay").classList.add("hidden");
});
$("sheet-speak").addEventListener("click", () => speakWord($("sheet-w").textContent));

/* ---------- 发音 ---------- */
/* 单词/短语走有道真人发音(美音type=2/英音type=1,国内直连);整段文本或失败时兜底浏览器TTS */
let voice = null;
let audioEl = null;
function pickVoice() {
  const want = (state?.settings?.accent ?? "us") === "uk" ? "en-GB" : "en-US";
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  voice =
    vs.find((v) => v.lang === want && /Samantha|Ava|Allison|Daniel|Kate/.test(v.name)) ||
    vs.find((v) => v.lang === want) || vs[0] || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
function speakTTS(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = (state?.settings?.accent ?? "us") === "uk" ? "en-GB" : "en-US";
  u.rate = state?.settings?.rate ?? 0.9;
  speechSynthesis.speak(u);
}
function speakWord(word) {
  const w = String(word).trim();
  if (!w || /\s/.test(w) && w.split(/\s+/).length > 4) return speakTTS(w);
  const type = (state?.settings?.accent ?? "us") === "uk" ? 1 : 2;
  speechSynthesis?.cancel();
  if (audioEl) { audioEl.pause(); }
  audioEl = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(w)}&type=${type}`);
  audioEl.play().catch(() => speakTTS(w));
  audioEl.onerror = () => speakTTS(w);
}
function speak(text) {
  /* 整段朗读(故事)仍走 TTS */
  speakTTS(text);
}

/* ---------- 视图切换 ---------- */
let viewHistory = [];
function show(id, remember = true) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(id).classList.remove("hidden");
  if (remember) viewHistory.push(id);
}
document.querySelectorAll("[data-back]").forEach((b) =>
  b.addEventListener("click", () => {
    speechSynthesis?.cancel();
    renderHome();
    show("view-home", false);
    viewHistory = [];
  })
);

/* ---------- SM-2 ---------- */
function logToday(field, delta = 1) {
  const t = todayStr();
  if (!state.log[t]) state.log[t] = { n: 0, r: 0, g: 0, a: 0 };
  state.log[t][field] += delta;
}
function gradeWord(w, grade) {
  const t = todayStr();
  let e = state.words[w];
  if (!e) return;
  const isNew = e.st === "new";
  if (isNew) logToday("n");
  else logToday("r");
  if (grade === "again") {
    logToday("a");
    e.lapses = (e.lapses || 0) + 1;
    e.ease = Math.max(1.3, (e.ease || 2.5) - 0.2);
    e.ivl = 1;
    e.st = "learn";
  } else if (grade === "hard") {
    e.ease = Math.max(1.3, (e.ease || 2.5) - 0.05);
    e.ivl = isNew || e.st === "learn" ? 1 : Math.min(IVL_CAP, Math.max(e.ivl + 1, Math.round(e.ivl * 1.2)));
    e.st = "rev";
  } else {
    logToday("g");
    if (isNew || e.st === "learn") e.ivl = 1;
    else if (e.reps === 1) e.ivl = 3;
    else e.ivl = Math.min(IVL_CAP, Math.round(e.ivl * (e.ease || 2.5)));
    e.st = "rev";
  }
  e.reps = (e.reps || 0) + 1;
  e.last = t;
  e.due = addDays(t, e.ivl);
  markDirty();
}

/* ---------- 学习会话 ---------- */
let queue = [];      // [{w, isNew}]
let qIndex = 0;
let sessionStats = { rev: 0, learn: 0 };
let pendingBatch = null; // 预筛中的 batch

function dueReviewWords() {
  // 含 st==='new':预筛后中途退出没打完卡的新词,下次会话捞回来
  const t = todayStr();
  return Object.entries(state.words)
    .filter(([, e]) => (e.st === "rev" || e.st === "learn" || e.st === "new") && e.due <= t)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
    .map(([w]) => w);
}
function newIntroducedToday() {
  return state.log[todayStr()]?.n || 0;
}
function nextUntriagedBatch() {
  for (const meta of manifest.batches) {
    const b = batches[meta.id];
    if (b.words.some((w) => !state.words[w.w])) return b;
  }
  return null;
}

function startSession() {
  const due = dueReviewWords();
  queue = due.map((w) => ({ w }));
  qIndex = 0;
  queuePhase = "review";
  sessionStats = { rev: 0, learn: 0 };
  if (queue.length) {
    show("view-card");
    renderCard();
  } else {
    proceedToNew();
  }
}
function proceedToNew() {
  const quota = state.settings.newPerDay - newIntroducedToday();
  const b = quota > 0 ? nextUntriagedBatch() : null;
  if (!b) return finishSession();
  pendingBatch = b;
  renderTriage(b);
  show("view-triage");
}
function finishSession() {
  $("done-summary").textContent =
    `复习 ${sessionStats.rev} 个 · 新学 ${sessionStats.learn} 个。` +
    `明天的复习已经按遗忘曲线排好了。`;
  show("view-done");
  flushSync();
}

/* 预筛 */
function renderTriage(b) {
  const box = $("triage-chips");
  box.innerHTML = "";
  for (const w of b.words) {
    if (state.words[w.w]) continue; // 已处理过的词不再出
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = w.w;
    chip.addEventListener("click", () => chip.classList.toggle("off"));
    box.appendChild(chip);
  }
}
$("btn-triage-done").addEventListener("click", () => {
  const t = todayStr();
  const toLearn = [];
  $("triage-chips").querySelectorAll(".chip").forEach((chip) => {
    const w = chip.textContent;
    if (chip.classList.contains("off")) {
      state.words[w] = { st: "known", last: t, b: pendingBatch.id };
    } else {
      state.words[w] = { st: "new", due: t, ivl: 0, ease: 2.5, reps: 0, lapses: 0, last: t, b: pendingBatch.id };
      toLearn.push(w);
    }
  });
  markDirty();
  if (!toLearn.length) { proceedToNew(); return; }
  renderStory(pendingBatch, toLearn);
  show("view-story");
});

/* 故事页 */
let storyNewWords = [];
function renderStory(b, toLearn) {
  storyNewWords = toLearn;
  $("story-batch").textContent = `第 ${b.id} 组 · ${b.title}`;
  $("story-box").innerHTML = clickableHTML(b.story, b.words.map((w) => w.w));
  $("story-box").classList.add("hidden"); // 默认隐藏原文,先练听力
  $("btn-story-text").textContent = "显示原文";
}
$("btn-story-audio").addEventListener("click", () => speak(pendingBatch.story));
$("btn-story-text").addEventListener("click", () => {
  const box = $("story-box");
  box.classList.toggle("hidden");
  $("btn-story-text").textContent = box.classList.contains("hidden") ? "显示原文" : "隐藏原文";
});
$("btn-story-done").addEventListener("click", () => {
  speechSynthesis?.cancel();
  queue = storyNewWords.map((w) => ({ w }));
  qIndex = 0;
  queuePhase = "new";
  show("view-card");
  renderCard();
});

/* 卡片 */
let queuePhase = "review"; // review | new
function currentCard() { return queue[qIndex] || null; }
function isNewWord(w) { return state.words[w]?.st === "new"; }
function renderCard() {
  const c = currentCard();
  if (!c) {
    if (queuePhase === "review") return proceedToNew();
    return finishSession();
  }
  const entry = state.words[c.w];
  const cardData = findCardData(c.w);
  $("card-tag").textContent = isNewWord(c.w) ? "新词" : `复习 · 第 ${entry.reps} 次`;
  $("card-word").textContent = c.w;
  const ipa = cardData?.ipa || DICT[c.w]?.ipa || "";
  $("card-ipa").textContent = ipa ? `${ipa} · ${state.settings.accent === "uk" ? "英" : "美"}` : "";
  $("card-back").classList.add("hidden");
  $("grades").classList.add("hidden");
  $("btn-show").classList.remove("hidden");
  $("session-progress").textContent = `${qIndex + 1} / ${queue.length}`;
  speakWord(c.w);
}
function findCardData(w) {
  const b = batches[state.words[w]?.b];
  return b?.words.find((x) => x.w === w) || null;
}
$("card-speak").addEventListener("click", () => speakWord($("card-word").textContent));
$("btn-show").addEventListener("click", () => {
  const c = currentCard();
  const d = findCardData(c.w) || { def: DICT[c.w]?.def, ex: DICT[c.w]?.ex };
  $("card-def").innerHTML = clickableHTML(d.def || "");
  $("card-example").innerHTML = d.ex ? clickableHTML(d.ex) : "";
  const mn = d.mn ? `<b>巧记</b> · ${d.mn}` : "";
  $("card-mnemonic").innerHTML = mn;
  $("card-mnemonic").style.display = mn ? "" : "none";
  $("card-back").classList.remove("hidden");
  $("btn-show").classList.add("hidden");
  $("grades").classList.remove("hidden");
  speakWord(c.w);
});
document.querySelectorAll(".grade").forEach((btn) =>
  btn.addEventListener("click", () => {
    const c = currentCard();
    if (!c) return;
    const g = btn.dataset.grade;
    const wasNew = isNewWord(c.w);
    gradeWord(c.w, g);
    if (wasNew) sessionStats.learn += g === "again" ? 0 : 1;
    else sessionStats.rev += 1;
    if (g === "again") {
      // 重新排队:插到 3 张之后(不足则队尾)
      const item = queue.splice(qIndex, 1)[0];
      queue.splice(Math.min(qIndex + 3, queue.length), 0, item);
    } else {
      qIndex += 1;
    }
    renderCard();
  })
);

/* ---------- 首页 ---------- */
function counts() {
  let learned = 0, known = 0;
  for (const e of Object.values(state.words)) {
    if (e.st === "known") known += 1;
    else learned += 1;
  }
  return { learned, known };
}
function streakDays() {
  let s = 0;
  let d = todayStr();
  if (!state.log[d]) d = addDays(d, -1); // 今天还没学,从昨天算起
  while (state.log[d]) { s += 1; d = addDays(d, -1); }
  return s;
}
function renderHome() {
  const due = dueReviewWords().length;
  const quota = Math.max(0, state.settings.newPerDay - newIntroducedToday());
  const { learned, known } = counts();
  $("t-due").textContent = due;
  $("t-new").textContent = nextUntriagedBatch() ? quota : 0;
  $("t-learned").textContent = learned;
  $("t-known").textContent = known;
  $("streak").textContent = `🔥 ${streakDays()} 天`;
  const total = manifest.targetWords || 3000;
  const got = learned + known;
  $("p-text").textContent = `${got} / ${total}`;
  $("p-fill").style.width = Math.min(100, (got / total) * 100) + "%";
  $("btn-start").textContent =
    due > 0 ? `开始今日学习（复习 ${due}）` : quota > 0 && nextUntriagedBatch() ? "开始今日学习（新词）" : "今天的任务完成了 ✓";
}
$("btn-start").addEventListener("click", startSession);
$("btn-stats").addEventListener("click", () => { renderStats(); show("view-stats"); });
$("btn-list").addEventListener("click", () => { renderList(); show("view-list"); });
$("btn-settings").addEventListener("click", () => { renderSettings(); show("view-settings"); });

/* ---------- 统计 ---------- */
function renderStats() {
  const { learned } = counts();
  $("s-total").textContent = learned;
  $("s-streak").textContent = streakDays();
  let g = 0, a = 0, revs = 0;
  const days = Object.keys(state.log).sort().slice(-7);
  for (const d of days) { g += state.log[d].g; a += state.log[d].a; }
  for (const d of Object.keys(state.log)) revs += state.log[d].r;
  $("s-retention").textContent = g + a ? Math.round((g / (g + a)) * 100) + "%" : "–";
  $("s-reviews").textContent = revs;
  const rows = Object.keys(state.log).sort().slice(-14).reverse();
  $("log-table").innerHTML =
    "<tr><th>日期</th><th>新学</th><th>复习</th><th>忘了</th></tr>" +
    rows.map((d) => {
      const l = state.log[d];
      return `<tr><td>${d.slice(5)}</td><td>${l.n}</td><td>${l.r}</td><td>${l.a}</td></tr>`;
    }).join("");
  const stubborn = Object.entries(state.words)
    .filter(([, e]) => (e.lapses || 0) >= 3)
    .sort((x, y) => y[1].lapses - x[1].lapses)
    .slice(0, 20);
  $("stubborn-list").innerHTML = stubborn.length
    ? stubborn.map(([w, e]) => `<span class="chip">${w} ×${e.lapses}</span>`).join("")
    : "<span class='hint'>暂时没有 👍</span>";
  $("miss-list").innerHTML = state.misses.length
    ? state.misses.map((w) => `<span class="chip">${w}</span>`).join("")
    : "<span class='hint'>没有</span>";
}

/* ---------- 词表 ---------- */
const ST_LABEL = { new: "新词", learn: "学习中", rev: "复习中", known: "预筛已认识" };
function renderList() {
  const box = $("word-list");
  box.innerHTML = "";
  for (const meta of manifest.batches) {
    const b = batches[meta.id];
    const h = document.createElement("h3");
    h.textContent = `第 ${b.id} 组 · ${b.title}`;
    box.appendChild(h);
    for (const w of b.words) {
      const e = state.words[w.w];
      const row = document.createElement("div");
      row.className = "wl-row";
      row.innerHTML = `<span class="wl-word">${w.w}</span><span class="wl-ipa">${w.ipa}</span>` +
        `<span class="wl-status">${e ? ST_LABEL[e.st] + (e.due && e.st !== "known" ? " · " + e.due.slice(5) : "") : "未开始"}</span>`;
      row.addEventListener("click", () => openSheet(w.w));
      box.appendChild(row);
    }
  }
}

/* ---------- 设置 ---------- */
function renderSettings() {
  $("set-newperday").value = state.settings.newPerDay;
  $("set-rate").value = state.settings.rate;
  $("set-accent").value = state.settings.accent || "us";
  $("set-token").value = getToken();
  $("settings-sync").textContent = getToken()
    ? "云同步已配置"
    : "未配置同步密钥，进度只存在本机";
}
$("btn-save-settings").addEventListener("click", () => {
  state.settings.newPerDay = Math.max(5, Math.min(30, +$("set-newperday").value || 15));
  state.settings.rate = Math.max(0.5, Math.min(1.2, +$("set-rate").value || 0.9));
  state.settings.accent = $("set-accent").value === "uk" ? "uk" : "us";
  pickVoice();
  const tok = $("set-token").value.trim();
  if (tok) localStorage.setItem("vocabToken", tok);
  markDirty();
  renderHome();
  show("view-home", false);
});

/* ---------- 启动 ---------- */
(async function init() {
  // 私密链接注入 token:/vocab/#t=XXXX
  const m = location.hash.match(/t=([A-Za-z0-9_-]+)/);
  if (m) {
    localStorage.setItem("vocabToken", m[1]);
    history.replaceState(null, "", location.pathname);
  }
  state = loadLocal() || freshState();
  try {
    await loadContent();
  } catch (e) {
    document.body.innerHTML = "<p style='padding:40px;text-align:center'>内容加载失败，请检查网络后刷新。</p>";
    return;
  }
  try {
    const server = await pullServer();
    if (server) {
      state = Object.keys(state.words).length ? mergeStates(state, server) : server;
      saveLocal();
      setSyncNote(`云同步正常 · 已学 ${Object.keys(state.words).length} 词`);
    } else if (getToken()) {
      setSyncNote("云端暂无进度，本机进度将自动上传");
    } else {
      setSyncNote("本地模式（用私密链接打开可开启云同步）");
    }
  } catch {
    setSyncNote("云端连不上，先用本机进度");
  }
  renderHome();
  show("view-home", false);
})();

/* Career Canvas — quiz runner + scoring.
   Scoring here must match ../quizzes/scoring-key.md exactly. The 29-event table
   comes from quizzes.json, which build_quiz_data.py generates from the same
   Python source the checker uses, so the two can't drift. */

/* ---------------------------------------------------------------------------
   ANONYMOUS TALLY — OFF BY DEFAULT. Leave empty and the site sends nothing.
   To turn on: paste a Google Apps Script URL for a Sheet you own. It receives
   only {quiz, top3 result codes, timestamp} — never a name, an answer, or any
   identifier. Check with your advisor before collecting anything from minors.
--------------------------------------------------------------------------- */
const TALLY_ENDPOINT = "";

const ORDER = ["career", "deca", "branding"];
/* Each copy needs its OWN gradient id. With a shared id the first definition
   wins, and if that one sits inside a display:none element the gradient never
   paints -- the ring silently vanishes on every other compass. */
let compassSeq = 0;
const COMPASS = () => {
  const id = `cg${compassSeq++}`;
  return `<svg class="compass" viewBox="0 0 100 100" aria-hidden="true">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#91BDFF"/>
</linearGradient></defs>
<circle cx="50" cy="50" r="46" fill="none" stroke="url(#${id})" stroke-width="5"/>
<path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill="#fff"/></svg>`;
};

let DATA = null;
let keyHandler = null;

const $ = (s, r = document) => r.querySelector(s);
const single = () => document.body.dataset.page === "single";
/* one place that knows how a quiz is linked in each build */
const quizHref = (key) => (single() ? `#${key}` : `quiz.html?quiz=${key}`);
const homeHref = () => (single() ? "#" : "quizzes.html");
/** "All quizzes" after finishing one -- explicit, so it lands on the Quizzes
 *  tab even though the Home tab is the default landing view. */
const quizzesTabHref = () => (single() ? "#quizzes" : "quizzes.html#quizzes");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function loadData() {
  if (DATA) return DATA;
  // The single-file build (build_artifact.py) inlines the data instead of
  // fetching it, so the page works with no network at all.
  if (window.__QUIZ_DATA__) { DATA = window.__QUIZ_DATA__; return DATA; }
  const res = await fetch("quizzes.json");
  if (!res.ok) throw new Error(`quizzes.json failed to load (${res.status})`);
  DATA = await res.json();
  return DATA;
}

const getQuiz = (key) => DATA.quizzes.find((q) => q.key === key);

/* ------------------------------ scoring ------------------------------ */

/** Quizzes 1-3: +1 per tag on the chosen option. */
function scoreSimple(quiz, answers) {
  const totals = {};
  quiz.results.forEach((r) => (totals[r.code] = 0));
  answers.forEach((tag) => {
    if (tag && tag in totals) totals[tag] += 1;
  });
  return totals;
}

/** Quiz 4: points go straight to the 29 events. See scoring-key.md. */
function scoreEvents(quiz, answers) {
  const events = DATA.events;
  const flavorCluster = DATA.flavorCluster;
  const totals = {};
  Object.keys(events).forEach((e) => (totals[e] = 0));

  quiz.questions.forEach((q, i) => {
    const tag = answers[i];
    if (!tag) return;

    if (q.part === 1) {
      // your business world lifts every event in it
      for (const [code, ev] of Object.entries(events)) {
        if (ev.cluster === tag) totals[code] += 1;
      }
    } else if (q.part === 2) {
      const cluster = flavorCluster[tag];
      for (const [code, ev] of Object.entries(events)) {
        if (ev.flavor === tag) totals[code] += 3;
        // Principles events have no industry of their own, so they take
        // partial credit for anything in their world -- without this, two of
        // them are mathematically unreachable.
        else if (ev.tier === "PRIN" && ev.cluster === cluster) totals[code] += 1;
      }
    } else {
      for (const [code, ev] of Object.entries(events)) {
        if (tag === "SOLO" && ev.tier === "SERIES") totals[code] += 3;
        else if (tag === "TEAM" && ev.tier === "TDM") totals[code] += 3;
        else if (tag === "FOUND" && ev.tier === "PRIN") totals[code] += 5;
        else if (tag === "SPEC" && (ev.tier === "SERIES" || ev.tier === "TDM")) totals[code] += 3;
      }
    }
  });
  return totals;
}

function score(quiz, answers) {
  return quiz.key === "deca" ? scoreEvents(quiz, answers) : scoreSimple(quiz, answers);
}

/** Ranked [{code,name,blurb,score}] — ties keep source order, matching the checker. */
function rank(quiz, totals) {
  const byCode = {};
  quiz.results.forEach((r) => (byCode[r.code] = r));
  return Object.keys(totals)
    .filter((c) => byCode[c])
    .map((c, i) => ({ ...byCode[c], score: totals[c], i }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
}

/* expose for the parity check */
window.CCC = { loadData, getQuiz, score, rank, scoreEvents, scoreSimple };

/* ------------------------------ runner ------------------------------ */

function startRunner(key) {
  const quiz = getQuiz(key);
  const answers = new Array(quiz.questions.length).fill(null);
  let idx = 0;

  const main = $("#main");
  const bar = $("#bar > i");
  const count = $("#count");
  document.title = `${quiz.title} Quiz — Career Canvas`;

  // Only the DECA quiz has real parts. The other three are one long section, so
  // their rail tracks thirds of the way through instead of sitting on stage 1.
  const RAIL_LABELS = quiz.key === "deca"
    ? ["Your interests", "What you'd want to specialize in", "How you like to work", "Your top matches"]
    : ["Getting started", "Digging deeper", "Almost there", "Your top matches"];

  function stageFor(i) {
    if (i >= quiz.questions.length) return 3;
    if (quiz.key === "deca") return quiz.questions[i].part - 1;
    return Math.min(2, Math.floor((i / quiz.questions.length) * 3));
  }

  function paintRail() {
    const rail = $("#rail");
    if (!rail) return;
    const stage = stageFor(idx);
    [...rail.querySelectorAll("li")].forEach((li, i) => {
      li.textContent = RAIL_LABELS[i];
      li.className = i < stage ? "done" : i === stage ? "now" : "";
    });
  }

  function renderQuestion() {
    const q = quiz.questions[idx];
    bar.style.width = `${(idx / quiz.questions.length) * 100}%`;
    count.textContent = `${idx + 1} / ${quiz.questions.length}`;

    main.innerHTML = `
      <p class="qhead">${esc(quiz.title)} quiz</p>
      <h1 class="qtext">${esc(q.text)}</h1>
      <div class="opts" role="group" aria-label="Answer choices">
        ${q.options.map((o, n) => `
          <button class="opt" data-tag="${esc(o.tag)}" aria-pressed="${answers[idx] === o.tag}">
            <span class="key" aria-hidden="true">${n + 1}</span>
            <span class="opt-text">${esc(o.text)}</span>
          </button>`).join("")}
      </div>
      <div class="below">
        <div class="below-left">
          <button class="linkbtn" id="back" ${idx === 0 ? "disabled" : ""}>&larr; Back</button>
          <button class="linkbtn" id="skip">Skip question</button>
        </div>
        <button class="btn primary" id="next" ${answers[idx] == null ? "disabled" : ""}>Next question &rarr;</button>
      </div>`;

    main.querySelectorAll(".opt").forEach((b) =>
      b.addEventListener("click", () => select(b.dataset.tag)));
    $("#skip").addEventListener("click", () => advance(null));
    $("#next").addEventListener("click", () => advance(answers[idx]));
    $("#back").addEventListener("click", () => { if (idx > 0) { idx--; renderQuestion(); } });
    paintRail();
    main.focus();
  }

  /** Picking an option only marks it -- it doesn't move on, so a student who
   *  taps the wrong option first can see and fix their choice before advancing. */
  function select(tag) {
    answers[idx] = tag;
    main.querySelectorAll(".opt").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.tag === tag)));
    const next = $("#next");
    if (next) next.disabled = false;
  }

  function advance(tag) {
    answers[idx] = tag;
    idx++;
    if (idx >= quiz.questions.length) renderResults(quiz, answers, main, bar, count);
    else renderQuestion();
  }

  // startRunner can be called again (retake, or routing in the single-file
  // build), so drop the previous listener or keypresses stack up and skip
  // several questions at once.
  if (keyHandler) document.removeEventListener("keydown", keyHandler);
  keyHandler = (e) => {
    if (idx >= quiz.questions.length) return;
    const n = parseInt(e.key, 10);
    const opts = main.querySelectorAll(".opt");
    if (n >= 1 && n <= opts.length) opts[n - 1].click();
  };
  document.addEventListener("keydown", keyHandler);

  renderQuestion();
}

/* ------------------------------ results ------------------------------ */

const DECA_GUIDE_URL = "https://www.deca.org/guide";
const eventSlug = (code) => DATA.events?.[code]?.slug;
const eventUrl = (code) => `https://www.deca.org/compete/${eventSlug(code)}`;

function renderResults(quiz, answers, main, bar, count) {
  const ranked = rank(quiz, score(quiz, answers));
  const top = ranked.slice(0, 3);
  bar.style.width = "100%";
  count.textContent = "Done";

  const nextKey = ORDER[(ORDER.indexOf(quiz.key) + 1) % ORDER.length];
  const nextQuiz = getQuiz(nextKey);
  const isDeca = quiz.key === "deca";

  main.innerHTML = `
    <div class="res-head">
      ${COMPASS()}
      <h1>Your top matches</h1>
      <p>${esc(quiz.subtitle)}</p>
    </div>
    <div class="res">
      ${top.map((r, i) => `
        <div class="res-card${i === 0 ? " top" : ""}">
          <div class="rank">${i + 1}</div>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.blurb)}</p>
          ${r.schools ? `<p class="schools">${esc(r.schools)}</p>` : ""}
          <div class="score">Match score ${r.score}</div>
          ${isDeca && eventSlug(r.code)
            ? `<a class="event-link" href="${eventUrl(r.code)}" target="_blank" rel="noopener">Official event guidelines &rarr;</a>`
            : ""}
        </div>`).join("")}
    </div>
    <div class="actions">
      <button class="btn primary" id="save">Save as PDF</button>
      <a class="btn" href="${quizHref(nextKey)}">Next: ${esc(nextQuiz.title)} quiz &rarr;</a>
      <a class="btn" id="retake" href="${quizHref(quiz.key)}">Retake this quiz</a>
      <a class="btn" href="${quizzesTabHref()}">All quizzes</a>
    </div>
    <details class="full">
      <summary>See how everything ranked</summary>
      ${ranked.map((r, i) => `
        <div class="rank-row"><span>${i + 1}. ${esc(r.name)}</span><span>${r.score}</span></div>`).join("")}
    </details>
    ${isDeca ? `<p class="foot"><a href="${DECA_GUIDE_URL}" target="_blank" rel="noopener">Full DECA Guide (all events, current year) &rarr;</a></p>` : ""}
    <p class="foot">Career Canvas — Jada Lin &amp; Olivia Zheng</p>`;

  saveResult(quiz.key, top.map((r) => r.code));
  $("#save").addEventListener("click", () => window.print());
  // the retake link points at the hash we're already on, so no hashchange fires
  if (single()) $("#retake").addEventListener("click", (e) => {
    e.preventDefault();
    startRunner(quiz.key);
  });
  postGroupResult(quiz.key, top.map((r) => r.code));
  sendTally(quiz.key, top.map((r) => r.code));
  paintRailDone();
}

function paintRailDone() {
  const rail = $("#rail");
  if (rail) [...rail.querySelectorAll("li")].forEach((li) => (li.className = "done"));
}

/* ------------------------------ tally ------------------------------ */

/** Sends nothing unless TALLY_ENDPOINT is set. Payload carries no identifiers. */
function sendTally(quizKey, topCodes) {
  if (!TALLY_ENDPOINT) return;
  try {
    fetch(TALLY_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ quiz: quizKey, top3: topCodes, ts: new Date().toISOString() }),
    }).catch(() => {});
  } catch (_) { /* a failed tally must never break a student's results */ }
}

/* ------------------------ dashboard + restore code ------------------------

   Results live in this browser (localStorage). The restore code is not a
   lookup key -- it IS the results, packed into ~12 characters. So moving to
   another device needs no account, no server, and stores nothing about the
   student anywhere. Nothing to leak, nothing to secure.
--------------------------------------------------------------------------- */

const STORE_KEY = "ccc.results.v2";
const STORE_KEY_V1 = "ccc.results.v1"; // legacy: {key: [code,code,code]}, one attempt only
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: no I L O U

/** Reads a JSON object from storage. `null` means "unreadable" (corrupt JSON,
 *  or valid JSON that isn't a plain object) -- distinct from {} ("empty but
 *  fine"), so a write never mistakes a broken read for an empty store and
 *  clobbers whatever was actually there. This was the bug behind "only my
 *  most recent quiz shows up": a single bad read used to wipe the other three. */
function readStore(key) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return {};
    const parsed = JSON.parse(v);
    return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : null;
  } catch (_) {
    return null;
  }
}

/** One-time upgrade from v1 (one attempt per quiz) to v2 (a history per quiz).
 *  Never overwrites a quiz v2 already has data for. */
function migrateV1(history) {
  const v1 = readStore(STORE_KEY_V1);
  if (!v1) return history;
  let changed = false;
  for (const key of Object.keys(v1)) {
    if (history[key]) continue;
    const codes = v1[key];
    if (Array.isArray(codes) && codes.length) {
      history[key] = [{ codes, ts: Date.now() }];
      changed = true;
    }
  }
  if (changed) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history)); } catch (_) {}
  }
  return history;
}

/** {quizKey: [{codes, ts}, ...]}, newest attempt first. `null` only when
 *  storage is corrupt -- callers must treat that as "don't touch it", not
 *  as "empty". */
function loadHistory() {
  const history = readStore(STORE_KEY);
  return history === null ? null : migrateV1(history);
}

/** Every attempt is kept -- retaking a quiz adds to the history instead of
 *  replacing it, and a corrupt read aborts the write instead of overwriting. */
function saveResult(key, codes) {
  const history = loadHistory();
  if (history === null) return; // corrupt storage -- results still show on screen, just don't persist
  try {
    const attempts = history[key] || [];
    attempts.unshift({ codes, ts: Date.now() });
    history[key] = attempts;
    localStorage.setItem(STORE_KEY, JSON.stringify(history));
  } catch (_) { /* private browsing -- the results still show, just don't persist */ }
}

/** {quizKey: [code,code,code]} from just the latest attempt of each quiz --
 *  the shape packCode/fingerprint/etc were already written against. */
const latestOf = (history) => {
  const out = {};
  for (const key of ORDER) {
    const attempts = history[key];
    if (attempts && attempts.length) out[key] = attempts[0].codes;
  }
  return out;
};

/* Sorted result codes give a stable index even if the markdown reorders
   results; only adding or removing a result changes it, which the
   fingerprint below then catches. */
const codeIndex = (key) => getQuiz(key).results.map((r) => r.code).sort();
const slotBits = (n) => Math.ceil(Math.log2(n + 2)); // +1 slot for "not taken"

/** 5-bit check derived from result counts, so a code from a different version
 *  of the quizzes is rejected instead of silently decoding to wrong events. */
function fingerprint() {
  let h = 0;
  for (const key of ORDER) h = (h * 31 + getQuiz(key).results.length) % 32;
  return h;
}

const payloadLen = () => ORDER.reduce((n, k) => n + 3 * slotBits(codeIndex(k).length), 0);

/* 15 bits of checksum, not 5. A 5-bit check lets 1 corrupted code in 32
   through, which measured as 12 of 403 single-character typos silently
   "restoring" the wrong results. At 15 bits that is ~1 in 32,768. */
const CHECK_BITS = 15;

/** Position-weighted so a single wrong character AND a transposition both fail. */
function checksum(bits) {
  let s = 0;
  for (let i = 0; i < bits.length; i++) {
    s = (s * 31 + (bits.charCodeAt(i) - 48) * (i + 1)) % 32768;
  }
  return s;
}

function packCode(saved) {
  let payload = "";
  for (const key of ORDER) {
    const idx = codeIndex(key);
    const w = slotBits(idx.length);
    const top = saved[key] || [];
    for (let i = 0; i < 3; i++) {
      const pos = top[i] ? idx.indexOf(top[i]) + 1 : 0;
      payload += Math.max(pos, 0).toString(2).padStart(w, "0");
    }
  }
  let bits = fingerprint().toString(2).padStart(5, "0")
           + payload
           + checksum(payload).toString(2).padStart(CHECK_BITS, "0");
  while (bits.length % 5) bits += "0";
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += CODE_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  return out.match(/.{1,4}/g).join("-");
}

function unpackCode(text) {
  const clean = String(text).toUpperCase().replace(/[^0-9A-Z]/g, "")
    .replace(/[IL]/g, "1").replace(/O/g, "0");
  if (!clean) return null;
  let bits = "";
  for (const ch of clean) {
    const v = CODE_ALPHABET.indexOf(ch);
    if (v < 0) return null;
    bits += v.toString(2).padStart(5, "0");
  }
  const plen = payloadLen();
  const end = 5 + plen + CHECK_BITS;
  if (bits.length < end) return null;
  if (parseInt(bits.slice(0, 5), 2) !== fingerprint()) return "STALE";

  const payload = bits.slice(5, 5 + plen);
  if (parseInt(bits.slice(5 + plen, end), 2) !== checksum(payload)) return null;
  // padding must be zeros, so a typo in the last character is caught too
  if (/[^0]/.test(bits.slice(end))) return null;

  let at = 0;
  const out = {};
  for (const key of ORDER) {
    const idx = codeIndex(key);
    const w = slotBits(idx.length);
    const picks = [];
    for (let i = 0; i < 3; i++) {
      const pos = parseInt(payload.slice(at, at + w), 2);
      at += w;
      // a position past the end of the result list means the code is corrupt --
      // reject it rather than quietly dropping the pick
      if (pos > idx.length) return null;
      if (pos > 0) picks.push(idx[pos - 1]);
    }
    if (picks.length) out[key] = picks;
  }
  return out;
}

const dateOf = (ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function renderDashboard() {
  const host = $("#dashboard");
  if (!host) return;
  const history = loadHistory();
  const body = $("#dash-body");

  if (history === null) {
    body.innerHTML = `<p>Your saved results couldn't be read on this device -- taking a
      quiz will start fresh.</p>`;
    $("#dash-count").textContent = "";
    $("#dash-code").textContent = "----";
    return;
  }

  const taken = ORDER.filter((k) => history[k] && history[k].length);
  const nameOf = (key, code) => {
    const r = getQuiz(key).results.find((x) => x.code === code);
    return r ? r.name : code;
  };

  body.innerHTML = ORDER.map((key) => {
    const quiz = getQuiz(key);
    const attempts = history[key];
    if (!attempts || !attempts.length) {
      return `<div class="dash-row empty">
        <h3>${esc(quiz.title)}</h3>
        <p>Not taken yet</p>
        <a class="dash-go" href="${quizHref(key)}">Take it &rarr;</a></div>`;
    }
    const [latest, ...older] = attempts;
    return `<div class="dash-row">
      <h3>${esc(quiz.title)}</h3>
      <ol class="dash-picks">${latest.codes.map((c) => `<li>${esc(nameOf(key, c))}</li>`).join("")}</ol>
      ${older.length ? `<details class="dash-history">
        <summary>${attempts.length} attempts &middot; see all</summary>
        ${older.map((a) => `<div class="dash-old"><span>${dateOf(a.ts)}</span> ${a.codes.map((c) => esc(nameOf(key, c))).join(", ")}</div>`).join("")}
      </details>` : ""}
      <a class="dash-go" href="${quizHref(key)}">Retake &rarr;</a></div>`;
  }).join("");

  $("#dash-code").textContent = packCode(latestOf(history));
  $("#dash-count").textContent = `${taken.length} of ${ORDER.length} quizzes done`;
}

function initDashboard() {
  const host = $("#dashboard");
  if (!host) return;
  renderDashboard();

  $("#dash-copy").addEventListener("click", async () => {
    const btn = $("#dash-copy");
    try {
      await navigator.clipboard.writeText($("#dash-code").textContent);
      btn.textContent = "Copied";
    } catch (_) {
      btn.textContent = "Select it and copy";
    }
    setTimeout(() => (btn.textContent = "Copy code"), 1800);
  });

  $("#dash-restore").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#dash-msg");
    const parsed = unpackCode($("#dash-input").value);
    if (parsed === "STALE") {
      msg.textContent = "That code is from an older version of the quizzes, so it can't be read.";
      return;
    }
    if (!parsed || !Object.keys(parsed).length) {
      msg.textContent = "That code isn't quite right - check for a typo and try again.";
      return;
    }
    const history = loadHistory();
    if (history === null) {
      msg.textContent = "Your saved results are unreadable right now, so restoring isn't safe. Try reloading the page.";
      return;
    }
    // add the restored picks as a new attempt per quiz -- never wipes history
    for (const key of Object.keys(parsed)) {
      const attempts = history[key] || [];
      attempts.unshift({ codes: parsed[key], ts: Date.now() });
      history[key] = attempts;
    }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history)); } catch (_) {}
    msg.textContent = "Restored.";
    $("#dash-input").value = "";
    renderDashboard();
  });
}

/* ------------------------------ group compare ------------------------------

   Paste a deployed Google Apps Script web-app URL here to turn this on (see
   group/Code.gs + the README for setup). Empty = the Group tab just says so
   and nothing is ever sent anywhere.

   Posting uses no-cors, same as sendTally -- fire-and-forget, no response to
   read. Reading uses JSONP (a <script> tag, not fetch) because a GET+CORS
   round trip to an Apps Script web app is unreliable; Code.gs answers a
   `callback=` param with `callback({...})`, the classic JSONP shape.
--------------------------------------------------------------------------- */
const GROUP_ENDPOINT = "";
const GROUP_KEY = "ccc.group";

const getGroupCode = () => { try { return localStorage.getItem(GROUP_KEY) || ""; } catch (_) { return ""; } };
const setGroupCode = (code) => { try { localStorage.setItem(GROUP_KEY, code); } catch (_) {} };

/** Fire-and-forget. No name, no answers, no device identifier -- just the
 *  group code the student typed in, which quiz, and the top-3 codes. */
function postGroupResult(quizKey, topCodes) {
  const group = getGroupCode();
  if (!GROUP_ENDPOINT || !group) return;
  try {
    fetch(GROUP_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ group, quiz: quizKey, top3: topCodes, ts: new Date().toISOString() }),
    }).catch(() => {});
  } catch (_) { /* a failed post must never break a student's results */ }
}

let jsonpSeq = 0;
function jsonp(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const cb = `CCCGroupCB${jsonpSeq++}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, timeoutMs);
    function cleanup() { clearTimeout(timer); delete window[cb]; script.remove(); }
    window[cb] = (data) => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error("network")); };
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${cb}`;
    document.body.appendChild(script);
  });
}

function renderGroupBars(host, title, counts, nameOf, myCode) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const block = document.createElement("div");
  block.className = "group-block";
  block.innerHTML = `<h3>${esc(title)}</h3>
    ${rows.map(([code, n]) => `
      <div class="group-row${code === myCode ? " mine" : ""}">
        <span class="group-label">${esc(nameOf(code))}${code === myCode ? " (you)" : ""}</span>
        <span class="group-bar"><i style="width:${Math.round((n / total) * 100)}%"></i></span>
        <span class="group-n">${n}</span>
      </div>`).join("") || "<p>No results yet.</p>"}`;
  host.appendChild(block);
}

async function loadGroupStats(code) {
  const box = $("#group-body");
  box.innerHTML = "<p>Loading your group's results&hellip;</p>";
  const mine = latestOf(loadHistory() || {});
  try {
    const stats = await jsonp(`${GROUP_ENDPOINT}?group=${encodeURIComponent(code)}`);
    box.innerHTML = "";
    $("#group-count").textContent = `${stats.students || 0} students in "${code}"`;
    for (const key of ORDER) {
      const quiz = getQuiz(key);
      const nameOf = (c) => { const r = quiz.results.find((x) => x.code === c); return r ? r.name : c; };
      renderGroupBars(box, `${quiz.title} — top picks`, (stats.counts && stats.counts[key]) || {}, nameOf, (mine[key] || [])[0]);
    }
  } catch (_) {
    box.innerHTML = "<p>Couldn't load the group's results. Check the group code and try again.</p>";
  }
}

function initGroup() {
  const host = $("#group");
  if (!host) return;

  if (!GROUP_ENDPOINT) {
    host.innerHTML = `<div class="dash-head"><h2>Group compare</h2>
      <p>Not set up yet — ask your workshop leader.</p></div>`;
    return;
  }

  const saved = getGroupCode();
  host.innerHTML = `
    <div class="dash-head"><h2>Group compare</h2><p id="group-count"></p></div>
    <form id="group-join" class="dash-restore">
      <label for="group-input">Your group code</label>
      <div class="dash-code-row">
        <input id="group-input" type="text" autocomplete="off" spellcheck="false"
               placeholder="e.g. period3" value="${esc(saved)}">
        <button class="btn" type="submit">${saved ? "Switch group" : "Join group"}</button>
      </div>
    </form>
    <div id="group-body" class="dash-body"></div>`;

  $("#group-join").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#group-input").value.trim();
    if (!code) return;
    setGroupCode(code);
    loadGroupStats(code);
  });

  if (saved) loadGroupStats(saved);
}

/* ------------------------------ cursor ------------------------------ */

/** A dot at the pointer plus a ring that lags behind it, replacing the native
 *  arrow. Desktop only -- a trailing cursor is meaningless on a phone (and
 *  there's no arrow to hide there) and just burns battery. */
function initCursor() {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || still) return;
  document.body.classList.add("custom-cursor");

  const ring = document.createElement("div");
  const dot = document.createElement("div");
  ring.className = "cursor-ring";
  dot.className = "cursor-dot";
  document.body.append(ring, dot);

  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, running = false;

  const frame = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    ring.style.transform = `translate3d(${x - 17}px, ${y - 17}px, 0)`;
    dot.style.transform = `translate3d(${tx - 3.5}px, ${ty - 3.5}px, 0)`;
    // stop the loop once the ring has caught up, restart on the next move
    if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) { running = false; return; }
    requestAnimationFrame(frame);
  };

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY;
    ring.style.opacity = dot.style.opacity = "1";
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });

  addEventListener("pointerleave", () => {
    ring.style.opacity = dot.style.opacity = "0";
  });

  // swell over anything clickable
  const HOT = ".opt, .btn, .card, .linkbtn, a, summary";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(HOT)) ring.classList.add("big");
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest(HOT)) ring.classList.remove("big");
  });
}

/* ------------------------------ hub tabs ------------------------------ */

const HUB_TABS = ["home", "quizzes", "dashboard", "group"];

/** Home / Quizzes / Dashboard / Group live on one page, switched by plain
 *  #hash anchors -- no click handlers needed, the browser's own hashchange
 *  does it. Home is the default landing tab. */
function showHubTab(tab) {
  if (!HUB_TABS.includes(tab)) tab = "home";
  document.querySelectorAll(".tabbar [data-tab]").forEach((a) =>
    a.classList.toggle("active", a.dataset.tab === tab));
  const home = $("#tab-home");
  if (home) home.hidden = tab !== "home";
  const quizzes = $("#tab-quizzes");
  if (quizzes) quizzes.hidden = tab !== "quizzes";
  const dash = $("#dashboard");
  if (dash) dash.hidden = tab !== "dashboard";
  const group = $("#group");
  if (group) group.hidden = tab !== "group";
}

/* ------------------------------ boot ------------------------------ */

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("[data-compass]").forEach((el) => (el.innerHTML = COMPASS()));
  initCursor();
  document.querySelectorAll(".hero h1, .hero p, .meta-row, .foot").forEach((el, i) => {
    el.classList.add("rise");
    el.style.animationDelay = `${0.05 + i * 0.09}s`;
  });
  const page = document.body.dataset.page;

  try {
    await loadData();
  } catch (err) {
    const m = $("#main") || document.body;
    m.innerHTML = `<p class="qhead">Couldn't load the quizzes</p>
      <h1 class="qtext">${esc(err.message)}</h1>
      <p style="color:var(--muted)">If you opened this file directly, run a local
      server instead: <code>python3 -m http.server</code> in the site folder.</p>`;
    return;
  }

  if (page === "hub" || page === "single") {
    const times = { career: "~6 min", deca: "~8 min", branding: "~4 min" };
    $("#cards").innerHTML = ORDER.map((k) => {
      const q = getQuiz(k);
      return `<a class="card" href="${quizHref(k)}">
        <span class="go" aria-hidden="true">&rarr;</span>
        <h3>${esc(q.title)} quiz</h3>
        <p>${esc(q.subtitle)}</p>
        <div class="card-meta">${q.questions.length} questions · ${times[k]} · ${q.results.length} possible results</div>
      </a>`;
    }).join("");
    initDashboard();
    initGroup();
  }

  // Plain hosted hub: Quizzes/Dashboard/Group tabs switched by #hash, same
  // anchors as the single-file build below just without the quiz runner.
  if (page === "hub") {
    const routeHub = () => showHubTab(location.hash.replace("#", ""));
    addEventListener("hashchange", routeHub);
    routeHub();
  }

  if (page === "quiz") {
    const key = new URLSearchParams(location.search).get("quiz");
    if (!getQuiz(key)) { location.replace("quizzes.html"); return; }
    startRunner(key);
  }

  // Single-file build: hub and quiz live in one page, routed by #hash.
  if (page === "single") {
    const hub = $("#hub"), runner = $("#runner");
    const route = () => {
      const key = location.hash.replace("#", "");
      const isQuiz = !!getQuiz(key);
      hub.hidden = isQuiz;
      runner.hidden = !isQuiz;
      $("#topbar").hidden = !isQuiz;
      if (isQuiz) {
        startRunner(key);
      } else {
        showHubTab(key);
        // re-render every time we land on the hub, or a quiz finished a moment
        // ago won't show up in the dashboard
        renderDashboard();
        window.scrollTo(0, 0);
      }
    };
    addEventListener("hashchange", route);
    route();
  }
});

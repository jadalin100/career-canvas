/* Career & College Compass — quiz runner + scoring.
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

const ORDER = ["major", "college", "career", "deca"];
/* Each copy needs its OWN gradient id. With a shared id the first definition
   wins, and if that one sits inside a display:none element the gradient never
   paints -- the ring silently vanishes on every other compass. */
let compassSeq = 0;
const COMPASS = () => {
  const id = `cg${compassSeq++}`;
  return `<svg class="compass" viewBox="0 0 100 100" aria-hidden="true">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7C5CD6"/><stop offset="1" stop-color="#F0764B"/>
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
const homeHref = () => (single() ? "#" : "index.html");
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

/* expose for the parity check and the image-render check */
window.CCC = { loadData, getQuiz, score, rank, scoreEvents, scoreSimple,
               renderCard: (quiz, top) => drawCard(quiz, top).toDataURL("image/png") };

/* ------------------------------ runner ------------------------------ */

function startRunner(key) {
  const quiz = getQuiz(key);
  const answers = new Array(quiz.questions.length).fill(null);
  let idx = 0;

  const main = $("#main");
  const bar = $("#bar > i");
  const count = $("#count");
  document.title = `${quiz.title} Quiz — Career & College Compass`;

  // Only the DECA quiz has real parts. The other three are one long section, so
  // their rail tracks thirds of the way through instead of sitting on stage 1.
  const RAIL_LABELS = quiz.key === "deca"
    ? ["Your interests", "What you'd geek out over", "How you like to work", "Your top matches"]
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
        <button class="linkbtn" id="back" ${idx === 0 ? "disabled" : ""}>&larr; Back</button>
        <button class="linkbtn" id="skip">Skip question</button>
      </div>`;

    main.querySelectorAll(".opt").forEach((b) =>
      b.addEventListener("click", () => choose(b.dataset.tag)));
    $("#skip").addEventListener("click", () => choose(null));
    $("#back").addEventListener("click", () => { if (idx > 0) { idx--; renderQuestion(); } });
    paintRail();
    main.focus();
  }

  function choose(tag) {
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

function renderResults(quiz, answers, main, bar, count) {
  const ranked = rank(quiz, score(quiz, answers));
  const top = ranked.slice(0, 3);
  bar.style.width = "100%";
  count.textContent = "Done";

  const nextKey = ORDER[(ORDER.indexOf(quiz.key) + 1) % ORDER.length];
  const nextQuiz = getQuiz(nextKey);

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
          <div class="score">Match score ${r.score}</div>
        </div>`).join("")}
    </div>
    <div class="actions">
      <button class="btn primary" id="save">Save as image</button>
      <a class="btn" href="${quizHref(nextKey)}">Next: ${esc(nextQuiz.title)} quiz &rarr;</a>
      <a class="btn" id="retake" href="${quizHref(quiz.key)}">Retake this quiz</a>
      <a class="btn" href="${homeHref()}">All quizzes</a>
    </div>
    <details class="full">
      <summary>See how everything ranked</summary>
      ${ranked.map((r, i) => `
        <div class="rank-row"><span>${i + 1}. ${esc(r.name)}</span><span>${r.score}</span></div>`).join("")}
    </details>
    <p class="foot">Career &amp; College Compass — Jada Lin &amp; Olivia Zheng</p>`;

  saveResult(quiz.key, top.map((r) => r.code));
  $("#save").addEventListener("click", () => saveImage(quiz, top));
  // the retake link points at the hash we're already on, so no hashchange fires
  if (single()) $("#retake").addEventListener("click", (e) => {
    e.preventDefault();
    startRunner(quiz.key);
  });
  sendTally(quiz.key, top.map((r) => r.code));
  paintRailDone();
}

function paintRailDone() {
  const rail = $("#rail");
  if (rail) [...rail.querySelectorAll("li")].forEach((li) => (li.className = "done"));
}

/* ------------------------------ save as image ------------------------------ */

function wrap(ctx, text, x, y, maxW, lh) {
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = word;
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

/** Hand-rolled canvas render — no library, keeps the site dependency-free. */
function drawCard(quiz, top) {
  const W = 1080, H = 1350, P = 80;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const F = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  x.fillStyle = "#171B4D";
  x.fillRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, W, 260);
  g.addColorStop(0, "#7C5CD6"); g.addColorStop(1, "#F0764B");
  x.fillStyle = g;
  x.fillRect(0, 0, W, 14);

  x.fillStyle = "#A6ADD6";
  x.font = `600 26px ${F}`;
  x.fillText("CAREER & COLLEGE COMPASS", P, 120);

  x.fillStyle = "#fff";
  x.font = `800 66px ${F}`;
  x.fillText("Your top matches", P, 210);
  x.fillStyle = "#A6ADD6";
  x.font = `400 30px ${F}`;
  let y = wrap(x, quiz.subtitle, P, 265, W - P * 2, 40) + 40;

  top.forEach((r, i) => {
    const h = 250;
    x.fillStyle = i === 0 ? "#2f2a6e" : "#232a63";
    x.beginPath();
    x.roundRect(P, y, W - P * 2, h, 20);
    x.fill();

    x.fillStyle = g;
    x.beginPath();
    x.roundRect(P + 30, y + 30, 54, 54, 14);
    x.fill();
    x.fillStyle = "#fff";
    x.font = `800 30px ${F}`;
    x.fillText(String(i + 1), P + 49, y + 68);

    x.font = `800 36px ${F}`;
    let ty = wrap(x, r.name, P + 106, y + 68, W - P * 2 - 140, 44);
    x.fillStyle = "#A6ADD6";
    x.font = `400 26px ${F}`;
    wrap(x, r.blurb, P + 106, ty + 16, W - P * 2 - 140, 34);
    y += h + 22;
  });

  x.fillStyle = "#A6ADD6";
  x.font = `400 24px ${F}`;
  x.fillText("Jada Lin & Olivia Zheng — Great Neck South High School", P, H - 70);

  return c;
}

function saveImage(quiz, top) {
  const a = document.createElement("a");
  a.download = `compass-${quiz.key}-results.png`;
  a.href = drawCard(quiz, top).toDataURL("image/png");
  a.click();
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

const STORE_KEY = "ccc.results.v1";
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: no I L O U

const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch (_) { return {}; }
};
const saveResult = (key, codes) => {
  try {
    const all = loadSaved();
    all[key] = codes;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch (_) { /* private browsing -- the results still show, just don't persist */ }
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

function renderDashboard() {
  const host = $("#dashboard");
  if (!host) return;
  const saved = loadSaved();
  const taken = ORDER.filter((k) => saved[k] && saved[k].length);

  if (!taken.length) { host.hidden = true; return; }
  host.hidden = false;

  const nameOf = (key, code) => {
    const r = getQuiz(key).results.find((x) => x.code === code);
    return r ? r.name : code;
  };

  $("#dash-body").innerHTML = ORDER.map((key) => {
    const quiz = getQuiz(key);
    const picks = saved[key];
    if (!picks || !picks.length) {
      return `<div class="dash-row empty">
        <h3>${esc(quiz.title)}</h3>
        <p>Not taken yet</p>
        <a class="dash-go" href="${quizHref(key)}">Take it &rarr;</a></div>`;
    }
    return `<div class="dash-row">
      <h3>${esc(quiz.title)}</h3>
      <ol class="dash-picks">${picks.map((c) => `<li>${esc(nameOf(key, c))}</li>`).join("")}</ol>
      <a class="dash-go" href="${quizHref(key)}">Retake &rarr;</a></div>`;
  }).join("");

  $("#dash-code").textContent = packCode(saved);
  $("#dash-count").textContent = `${taken.length} of 4 quizzes done`;
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
    try { localStorage.setItem(STORE_KEY, JSON.stringify(parsed)); } catch (_) {}
    msg.textContent = "Restored.";
    $("#dash-input").value = "";
    renderDashboard();
  });
}

/* ------------------------------ cursor ------------------------------ */

/** A dot at the pointer plus a ring that lags behind it. Desktop only -- a
 *  trailing cursor is meaningless on a phone and just burns battery. */
function initCursor() {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || still) return;

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
    const times = { major: "~7 min", college: "~7 min", career: "~7 min", deca: "~8 min" };
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
  }

  if (page === "quiz") {
    const key = new URLSearchParams(location.search).get("quiz");
    if (!getQuiz(key)) { location.replace("index.html"); return; }
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

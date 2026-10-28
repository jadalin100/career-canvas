// Career Canvas lesson engine (draft). Runs both pages:
//   learn.html  -> draws the lesson path (#path)
//   lesson.html -> plays one lesson (#lesson), chosen by ?id=bma-1
// No sign-in needed. Without a class, progress saves in this browser (localStorage).
// After joining a class, it saves on the student's class record (CareerCanvasClassroom.syncStudent),
// so it follows the student to any device that joins with the same name.
(() => {
  "use strict";
  const api = window.CareerCanvasClassroom;
  const UNITS = window.CC_LESSONS;
  const HEARTS = 3;          // wrong answers allowed per lesson
  const XP_PER_CORRECT = 10;
  const XP_FINISH_BONUS = 20;

  const LOCAL_KEY = "careerCanvasLessonProgress";

  // ---------- progress ----------
  const blank = () => ({ done: {}, xp: 0, streak: 0, lastDay: "" });

  async function loadProgress() {
    if (!api.getSession()) {
      try { return { ...blank(), ...JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") }; } catch (_) { return blank(); }
    }
    const record = await api.getStudentRecord();
    return { ...blank(), ...(record?.lessonProgress || {}) };
  }

  // Returns a message for the result screen.
  async function saveProgress(progress) {
    if (!api.getSession()) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(progress)); return "Saved on this device. Join a class to keep it across devices."; }
      catch (_) { return "Progress couldn't be saved in this browser."; }
    }
    const synced = await api.syncStudent({ lessonProgress: progress });
    return synced ? "Saved to your class." : "Saved on this device. It will sync when you're back online.";
  }

  const dayKey = (date) => date.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  // Streak: same day = unchanged, the day after the last lesson = +1, any longer gap = restart at 1.
  function nextStreak(progress, today = new Date()) {
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (progress.lastDay === dayKey(today)) return progress.streak;
    if (progress.lastDay === dayKey(yesterday)) return progress.streak + 1;
    return 1;
  }

  // A lesson is open if it's the first in its unit or the lesson before it is done.
  function isUnlocked(progress, unit, index) {
    return index === 0 || Boolean(progress.done[unit.lessons[index - 1].id]);
  }

  function findLesson(id) {
    for (const unit of UNITS) {
      const index = unit.lessons.findIndex(lesson => lesson.id === id);
      if (index >= 0) return { unit, index, lesson: unit.lessons[index] };
    }
    return null;
  }

  const shuffle = (items) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  };
  const esc = (text) => String(text).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderStats(progress) {
    document.querySelector("#stat-streak").textContent = progress.streak;
    document.querySelector("#stat-xp").textContent = progress.xp;
  }

  // ---------- learn.html: the path ----------
  async function drawPath(root) {
    const progress = await loadProgress();
    renderStats(progress);
    root.innerHTML = UNITS.map((unit, u) => `
      <section class="unit" style="--unit:${unit.color}">
        <header class="unit-banner"><p>Unit ${u + 1}</p><h2>${esc(unit.title)}</h2></header>
        <ol class="nodes">${unit.lessons.map((lesson, i) => {
          const done = Boolean(progress.done[lesson.id]);
          const open = isUnlocked(progress, unit, i);
          const state = done ? "done" : open ? "current" : "locked";
          const label = `${lesson.title}: ${done ? "completed" : open ? "start" : "locked"}`;
          return `<li class="node-row" style="--shift:${[0, 1, -1][i % 3]}">
            ${open ? `<a class="node ${state}" href="lesson.html?id=${lesson.id}" aria-label="${esc(label)}">` : `<span class="node locked" aria-label="${esc(label)}">`}
              <span aria-hidden="true">${done ? "✓" : open ? "★" : "🔒"}</span>
            ${open ? "</a>" : "</span>"}
            <p class="node-title">${esc(lesson.title)}</p>
          </li>`;
        }).join("")}</ol>
      </section>`).join("");
  }

  // ---------- lesson.html: one lesson ----------
  async function playLesson(root) {
    const found = findLesson(new URLSearchParams(location.search).get("id"));
    const progress = await loadProgress();
    if (!found || !isUnlocked(progress, found.unit, found.index)) { location.replace("learn.html"); return; }
    const { unit, lesson } = found;
    document.body.style.setProperty("--unit", unit.color);

    // Wrong answers go to the back of the queue, so the lesson ends only when every question is answered right.
    let queue = shuffle(lesson.questions);
    let hearts = HEARTS, correctFirstTry = 0, answered = 0;
    const firstMiss = new Set();
    const total = lesson.questions.length;

    const bar = document.querySelector("#lesson-progress");
    const heartsEl = document.querySelector("#hearts");
    const footer = document.querySelector("#lesson-footer");

    function showQuestion() {
      const q = queue[0];
      const choices = shuffle(q.choices.map((text, i) => ({ text, right: i === q.answer })));
      bar.style.width = `${(answered / total) * 100}%`;
      heartsEl.textContent = `♥ ${hearts}`;
      root.innerHTML = `
        <p class="lesson-kicker">${esc(unit.title)} · ${esc(lesson.title)}</p>
        <h1 class="lesson-q">${esc(q.q)}</h1>
        <div class="choices" role="radiogroup">${choices.map((c, i) =>
          `<button class="choice" type="button" role="radio" aria-checked="false" data-i="${i}"><kbd>${i + 1}</kbd>${esc(c.text)}</button>`).join("")}</div>`;
      let picked = null;
      footer.className = "lesson-footer";
      footer.innerHTML = `<button class="cta" id="check" type="button" disabled>Check</button>`;
      const check = footer.querySelector("#check");
      root.querySelectorAll(".choice").forEach(btn => btn.addEventListener("click", () => {
        root.querySelectorAll(".choice").forEach(b => b.setAttribute("aria-checked", "false"));
        btn.setAttribute("aria-checked", "true");
        picked = choices[Number(btn.dataset.i)];
        check.disabled = false;
      }));
      check.addEventListener("click", () => grade(q, picked));
      check.focus({ preventScroll: true });
    }

    function grade(q, picked) {
      root.querySelectorAll(".choice").forEach(b => { b.disabled = true; });
      root.querySelector('.choice[aria-checked="true"]').classList.add(picked.right ? "right" : "wrong");
      queue.shift();
      if (picked.right) {
        answered++;
        if (!firstMiss.has(q)) correctFirstTry++;
      } else {
        hearts--;
        heartsEl.textContent = `♥ ${hearts}`;
        firstMiss.add(q);
        queue.push(q);
      }
      const rightText = q.choices[q.answer];
      footer.className = `lesson-footer ${picked.right ? "good" : "bad"}`;
      footer.innerHTML = `
        <div class="verdict" role="status"><strong>${picked.right ? "Nice!" : `Correct answer: ${esc(rightText)}`}</strong><p>${esc(q.why)}</p></div>
        <button class="cta" id="continue" type="button">Continue</button>`;
      const next = footer.querySelector("#continue");
      next.focus();
      next.addEventListener("click", () => {
        if (hearts <= 0) return finish(false);
        if (!queue.length) return finish(true);
        showQuestion();
      });
    }

    async function finish(passed) {
      bar.style.width = passed ? "100%" : bar.style.width;
      footer.className = "lesson-footer";
      if (!passed) {
        root.innerHTML = `<div class="result"><h1>Out of hearts</h1><p>Every miss is practice. Try this lesson again; questions come in a new order.</p></div>`;
        footer.innerHTML = `<a class="cta ghost" href="learn.html">Back to path</a><a class="cta" href="lesson.html?id=${lesson.id}">Try again</a>`;
        return;
      }
      const earned = correctFirstTry * XP_PER_CORRECT + XP_FINISH_BONUS;
      const updated = { ...progress, done: { ...progress.done, [lesson.id]: true }, xp: progress.xp + earned,
        streak: nextStreak(progress), lastDay: dayKey(new Date()) };
      root.innerHTML = `<div class="result"><h1>Lesson complete!</h1>
        <div class="result-stats"><p><strong>+${earned}</strong> XP</p><p><strong>${correctFirstTry}/${total}</strong> right first try</p><p><strong>${updated.streak}</strong> day streak</p></div>
        <p class="save-status" role="status">Saving…</p></div>`;
      footer.innerHTML = `<a class="cta" href="learn.html">Continue</a>`;
      const status = root.querySelector(".save-status");
      try {
        status.textContent = await saveProgress(updated);
      } catch (error) {
        status.textContent = error.message || "Could not save progress.";
      }
    }

    // Keyboard: 1-4 pick a choice, Enter presses the footer button.
    document.addEventListener("keydown", event => {
      if (/^[1-4]$/.test(event.key)) root.querySelectorAll(".choice:not([disabled])")[Number(event.key) - 1]?.click();
      if (event.key === "Enter" && document.activeElement?.tagName !== "BUTTON") footer.querySelector(".cta:not([disabled])")?.click();
    });

    showQuestion();
  }

  const pathRoot = document.querySelector("#path");
  const lessonRoot = document.querySelector("#lesson");
  if (pathRoot) drawPath(pathRoot);
  if (lessonRoot) playLesson(lessonRoot);
})();

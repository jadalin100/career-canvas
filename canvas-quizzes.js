(() => {
  "use strict";

  const DATA = window.CAREER_CANVAS_QUIZ_DATA;
  const ORDER = ["career", "deca", "branding"];
  const TIMES = { career: "About 6 minutes", deca: "About 8 minutes", branding: "About 4 minutes" };
  const ACCENTS = { career: "blue", deca: "yellow", branding: "ice" };
  const STORE_KEY = "careerCanvasQuizResults";
  const PROGRESS_KEY = "careerCanvasQuizProgress";
  const cards = document.querySelector("#canvas-quiz-cards");
  const overview = document.querySelector("#quiz-overview");
  const stage = document.querySelector("#canvas-quiz-stage");
  const stageBody = document.querySelector("#quiz-stage-body");
  const stageLabel = document.querySelector("#quiz-stage-label");
  const stageCount = document.querySelector("#quiz-stage-count");
  const progress = document.querySelector("#quiz-stage-progress");
  let currentKey = "";
  let answers = [];
  let questionIndex = 0;

  if (!DATA || !cards || !overview || !stage || !stageBody) return;

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  const getQuiz = (key) => DATA.quizzes.find((quiz) => quiz.key === key);

  function readResults() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      return saved && typeof saved === "object" ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function saveResult(key, topResults) {
    const saved = readResults();
    saved[key] = { topResults, completedAt: new Date().toISOString() };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (_) {}
    window.CareerCanvasClassroom?.syncStudent({ careerQuizResults: saved }).catch(() => {});
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return saved && typeof saved === "object" ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function saveProgress() {
    if (!currentKey) return;
    const saved = readProgress();
    saved[currentKey] = { answers, questionIndex, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(saved)); } catch (_) {}
    window.CareerCanvasClassroom?.syncStudent({ careerQuizProgress: saved }).catch(() => {});
  }

  function clearProgress(key) {
    const saved = readProgress();
    delete saved[key];
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(saved)); } catch (_) {}
  }

  function scoreSimple(quiz) {
    const totals = Object.fromEntries(quiz.results.map((result) => [result.code, 0]));
    answers.forEach((tag) => { if (tag && tag in totals) totals[tag] += 1; });
    return totals;
  }

  function scoreDeca(quiz) {
    const totals = Object.fromEntries(Object.keys(DATA.events).map((code) => [code, 0]));
    quiz.questions.forEach((question, index) => {
      const tag = answers[index];
      if (!tag) return;
      if (question.part === 1) {
        Object.entries(DATA.events).forEach(([code, event]) => {
          if (event.cluster === tag) totals[code] += 1;
        });
      } else if (question.part === 2) {
        const cluster = DATA.flavorCluster[tag];
        Object.entries(DATA.events).forEach(([code, event]) => {
          if (event.flavor === tag) totals[code] += 3;
          else if (event.tier === "PRIN" && event.cluster === cluster) totals[code] += 1;
        });
      } else {
        Object.entries(DATA.events).forEach(([code, event]) => {
          if (tag === "SOLO" && event.tier === "SERIES") totals[code] += 3;
          else if (tag === "TEAM" && event.tier === "TDM") totals[code] += 3;
          else if (tag === "FOUND" && event.tier === "PRIN") totals[code] += 5;
          else if (tag === "SPEC" && (event.tier === "SERIES" || event.tier === "TDM")) totals[code] += 3;
        });
      }
    });
    return totals;
  }

  function rankedResults(quiz) {
    const totals = quiz.key === "deca" ? scoreDeca(quiz) : scoreSimple(quiz);
    return quiz.results
      .map((result, index) => ({ ...result, score: totals[result.code] ?? 0, index }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
  }

  function renderCards() {
    const saved = readResults();
    const drafts = readProgress();
    cards.innerHTML = ORDER.map((key, index) => {
      const quiz = getQuiz(key);
      const done = saved[key];
      return `<a class="canvas-quiz-card quiz-accent-${ACCENTS[key]} reveal visible" href="#quiz-${key}">
        <span class="canvas-quiz-number">0${index + 1}</span>
        <p class="canvas-quiz-type">${esc(quiz.title)}</p>
        <h3>${esc(quiz.subtitle)}</h3>
        <p>${quiz.questions.length} questions · ${TIMES[key]}</p>
        <span class="canvas-quiz-action">${drafts[key] ? "Continue quiz" : done ? "Retake quiz" : "Start quiz"}<b aria-hidden="true">↗</b></span>
        ${done || drafts[key] ? `<span class="canvas-quiz-saved">${drafts[key] ? "Progress saved on this device" : "Result saved on this device"}</span>` : ""}
      </a>`;
    }).join("");
  }

  function showOverview() {
    currentKey = "";
    overview.hidden = false;
    stage.hidden = true;
    renderCards();
  }

  function showQuestion() {
    const quiz = getQuiz(currentKey);
    const question = quiz.questions[questionIndex];
    const selected = answers[questionIndex];
    const percent = Math.round((questionIndex / quiz.questions.length) * 100);
    stageLabel.textContent = `${quiz.title} quiz`;
    stageCount.textContent = `${questionIndex + 1} of ${quiz.questions.length}`;
    progress.style.width = `${percent}%`;
    stageBody.innerHTML = `
      <p class="quiz-question-kicker">Choose the answer that feels most like you</p>
      <h3 class="quiz-question">${esc(question.text)}</h3>
      <div class="quiz-options" role="group" aria-label="Answer choices">
        ${question.options.map((option, index) => `
          <button class="quiz-option" type="button" data-tag="${esc(option.tag)}" aria-pressed="${selected === option.tag}">
            <span>${String.fromCharCode(65 + index)}</span><strong>${esc(option.text)}</strong>
          </button>`).join("")}
      </div>
      <div class="quiz-controls">
        <button class="quiz-text-button" id="canvas-quiz-previous" type="button" ${questionIndex === 0 ? "disabled" : ""}>Previous</button>
        <button class="quiz-text-button" id="canvas-quiz-skip" type="button">Skip</button>
        <button class="button button-primary quiz-next" id="canvas-quiz-next" type="button" ${selected == null ? "disabled" : ""}>${questionIndex === quiz.questions.length - 1 ? "See my results" : "Next question"}</button>
      </div>`;

    stageBody.querySelectorAll(".quiz-option").forEach((button) => {
      button.addEventListener("click", () => {
        answers[questionIndex] = button.dataset.tag;
        saveProgress();
        stageBody.querySelectorAll(".quiz-option").forEach((choice) =>
          choice.setAttribute("aria-pressed", String(choice === button)));
        document.querySelector("#canvas-quiz-next").disabled = false;
      });
    });
    document.querySelector("#canvas-quiz-previous").addEventListener("click", () => {
      if (questionIndex > 0) { questionIndex -= 1; saveProgress(); showQuestion(); }
    });
    document.querySelector("#canvas-quiz-skip").addEventListener("click", () => {
      answers[questionIndex] = null;
      saveProgress();
      advance();
    });
    document.querySelector("#canvas-quiz-next").addEventListener("click", advance);
    stageBody.focus({ preventScroll: true });
  }

  function advance() {
    const quiz = getQuiz(currentKey);
    if (questionIndex < quiz.questions.length - 1) {
      questionIndex += 1;
      saveProgress();
      showQuestion();
    } else {
      showResults();
    }
  }

  function eventUrl(code) {
    const slug = DATA.events?.[code]?.slug;
    return slug ? `https://www.deca.org/compete/${slug}` : "";
  }

  function showResults() {
    const quiz = getQuiz(currentKey);
    const ranked = rankedResults(quiz);
    const top = ranked.slice(0, 3);
    saveResult(currentKey, top.map((result) => result.code));
    clearProgress(currentKey);
    stageCount.textContent = "Complete";
    progress.style.width = "100%";
    stageBody.innerHTML = `
      <div class="quiz-results-heading">
        <p class="quiz-question-kicker">Your top matches</p>
        <h3>${esc(quiz.subtitle)}</h3>
        <p>These results are a starting point. Notice what sounds exciting, surprising, or worth exploring next.</p>
      </div>
      <div class="canvas-results">
        ${top.map((result, index) => `
          <article class="canvas-result-card${index === 0 ? " first" : ""}">
            <span class="canvas-result-rank">${index + 1}</span>
            <h4>${esc(result.name)}</h4>
            <p>${esc(result.blurb)}</p>
            ${quiz.key === "deca" && eventUrl(result.code) ? `<a href="${eventUrl(result.code)}" target="_blank" rel="noopener">View official DECA event</a>` : ""}
          </article>`).join("")}
      </div>
      <div class="quiz-result-actions">
        <button class="button button-primary" id="canvas-quiz-retake" type="button">Retake this quiz</button>
        <a class="button button-quiet" href="#quizzes">Choose another quiz</a>
        <button class="quiz-text-button" id="canvas-quiz-print" type="button">Save results as PDF</button>
      </div>`;
    document.querySelector("#canvas-quiz-retake").addEventListener("click", () => startQuiz(currentKey, true));
    document.querySelector("#canvas-quiz-print").addEventListener("click", () => window.print());
    stageBody.focus({ preventScroll: true });
  }

  function startQuiz(key, fresh = false) {
    const quiz = getQuiz(key);
    if (!quiz) return;
    currentKey = key;
    const draft = fresh ? null : readProgress()[key];
    answers = draft && Array.isArray(draft.answers) && draft.answers.length === quiz.questions.length
      ? draft.answers
      : new Array(quiz.questions.length).fill(null);
    questionIndex = draft && Number.isInteger(draft.questionIndex)
      ? Math.min(Math.max(draft.questionIndex, 0), quiz.questions.length - 1)
      : 0;
    saveProgress();
    overview.hidden = true;
    stage.hidden = false;
    showQuestion();
    document.querySelector("#quizzes").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function route() {
    const hash = location.hash.replace("#", "");
    if (hash.startsWith("quiz-")) startQuiz(hash.slice(5));
    else if (hash === "quizzes") showOverview();
  }

  document.addEventListener("keydown", (event) => {
    if (stage.hidden || !currentKey || event.metaKey || event.ctrlKey || event.altKey) return;
    const number = Number(event.key);
    const choices = [...stageBody.querySelectorAll(".quiz-option")];
    if (number >= 1 && number <= choices.length) choices[number - 1].click();
  });

  renderCards();
  window.addEventListener("hashchange", route);
  if (window.CareerCanvasClassroom?.getSession()) {
    window.CareerCanvasClassroom.getStudentRecord().then((record) => {
      const localResults = readResults();
      const localProgress = readProgress();
      Object.entries(record?.careerQuizResults || {}).forEach(([key, value]) => {
        if (!localResults[key]?.completedAt || value.completedAt > localResults[key].completedAt) localResults[key] = value;
      });
      Object.entries(record?.careerQuizProgress || {}).forEach(([key, value]) => {
        if (!localProgress[key]?.updatedAt || value.updatedAt > localProgress[key].updatedAt) localProgress[key] = value;
      });
      localStorage.setItem(STORE_KEY, JSON.stringify(localResults));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(localProgress));
      renderCards();
      route();
    }).catch(route);
  } else route();
})();

(() => {
  "use strict";

  const STORAGE_KEY = "careerCanvasQuiz";
  const blankQuestion = () => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    prompt: "",
    choices: ["", "", "", ""],
    correct: 0
  });
  const defaultQuiz = { title: "", audience: "", business: "", intro: "", updatedAt: "", questions: [blankQuestion()] };
  const details = document.querySelector("#quiz-details");
  const list = document.querySelector("#question-list");
  const status = document.querySelector("#save-status");
  const preview = document.querySelector("#preview");
  const toast = document.querySelector("#toast");
  let saveTimer;
  let toastTimer;

  function esc(value) {
    return String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" }[character]));
  }

  function readQuiz() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !Array.isArray(saved.questions) || saved.questions.length === 0) return structuredClone(defaultQuiz);
      return { ...structuredClone(defaultQuiz), ...saved };
    } catch (_) {
      return structuredClone(defaultQuiz);
    }
  }

  const quiz = readQuiz();

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      toast.textContent = "";
    }, 2200);
  }

  function persist() {
    quiz.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
      status.textContent = `Saved on this device at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
    } catch (_) {
      status.textContent = "This browser could not save your quiz. Download it before leaving.";
    }
    paintSummary();
  }

  function queueSave() {
    status.textContent = "Saving…";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(persist, 350);
  }

  function completeQuestion(question) {
    return Boolean(question.prompt.trim() && question.choices.every((choice) => choice.trim()));
  }

  function paintSummary() {
    const complete = quiz.questions.filter(completeQuestion).length;
    document.querySelector("#summary-title").textContent = quiz.title.trim() ? "Ready" : "Missing";
    document.querySelector("#summary-count").textContent = String(quiz.questions.length);
    document.querySelector("#summary-complete").textContent = `${complete} / ${quiz.questions.length}`;
  }

  function renderQuestions() {
    list.innerHTML = quiz.questions.map((question, index) => `
      <article class="question-card" data-id="${esc(question.id)}">
        <div class="question-head">
          <h3>Question ${index + 1}</h3>
          <div class="question-tools" aria-label="Question ${index + 1} controls">
            <button class="icon-btn" type="button" data-action="up" aria-label="Move question up" ${index === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" type="button" data-action="down" aria-label="Move question down" ${index === quiz.questions.length - 1 ? "disabled" : ""}>↓</button>
            <button class="icon-btn" type="button" data-action="remove" aria-label="Remove question" ${quiz.questions.length === 1 ? "disabled" : ""}>×</button>
          </div>
        </div>
        <div class="field">
          <label for="prompt-${esc(question.id)}">Question</label>
          <input id="prompt-${esc(question.id)}" data-field="prompt" maxlength="180" value="${esc(question.prompt)}" placeholder="Ask one clear question">
        </div>
        <fieldset class="choices" style="border:0;padding:0">
          <legend class="field-label">Choices — select the correct answer</legend>
          ${question.choices.map((choice, choiceIndex) => `
            <label class="choice-row">
              <input type="radio" name="correct-${esc(question.id)}" data-field="correct" value="${choiceIndex}" ${question.correct === choiceIndex ? "checked" : ""} aria-label="Choice ${choiceIndex + 1} is correct">
              <input type="text" data-field="choice" data-choice="${choiceIndex}" maxlength="120" value="${esc(choice)}" placeholder="Choice ${choiceIndex + 1}">
            </label>`).join("")}
        </fieldset>
      </article>`).join("");
    paintSummary();
  }

  ["title", "audience", "business", "intro"].forEach((name) => {
    details.elements[name].value = quiz[name] || "";
  });

  details.addEventListener("input", (event) => {
    quiz[event.target.name] = event.target.value;
    queueSave();
  });

  list.addEventListener("input", (event) => {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    const question = quiz.questions.find((item) => item.id === card.dataset.id);
    if (!question) return;
    if (event.target.dataset.field === "prompt") question.prompt = event.target.value;
    if (event.target.dataset.field === "choice") question.choices[Number(event.target.dataset.choice)] = event.target.value;
    if (event.target.dataset.field === "correct") question.correct = Number(event.target.value);
    queueSave();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const card = button.closest("[data-id]");
    const index = quiz.questions.findIndex((item) => item.id === card.dataset.id);
    if (index < 0) return;
    const action = button.dataset.action;
    if (action === "remove") {
      if (!window.confirm(`Remove question ${index + 1}?`)) return;
      quiz.questions.splice(index, 1);
    } else {
      const nextIndex = action === "up" ? index - 1 : index + 1;
      [quiz.questions[index], quiz.questions[nextIndex]] = [quiz.questions[nextIndex], quiz.questions[index]];
    }
    renderQuestions();
    persist();
  });

  document.querySelector("#add-question").addEventListener("click", () => {
    quiz.questions.push(blankQuestion());
    renderQuestions();
    persist();
    list.lastElementChild?.querySelector("input[data-field='prompt']")?.focus();
  });

  function validate() {
    if (!quiz.title.trim()) return "Add a quiz title first.";
    const incomplete = quiz.questions.findIndex((question) => !completeQuestion(question));
    if (incomplete >= 0) return `Finish question ${incomplete + 1} and all four choices.`;
    return "";
  }

  function runPreview() {
    const issue = validate();
    if (issue) { showToast(issue); return; }
    let index = 0;
    let score = 0;
    let selected = null;

    function paint() {
      const question = quiz.questions[index];
      preview.hidden = false;
      preview.innerHTML = `
        <p class="eyebrow">Live preview · ${index + 1} of ${quiz.questions.length}</p>
        <h2 id="preview-title">${esc(quiz.title)}</h2>
        ${quiz.intro.trim() && index === 0 ? `<p>${esc(quiz.intro)}</p>` : ""}
        <p class="preview-question">${esc(question.prompt)}</p>
        <div class="preview-options">
          ${question.choices.map((choice, choiceIndex) => `<button class="preview-option" type="button" data-choice="${choiceIndex}">${esc(choice)}</button>`).join("")}
        </div>
        <div class="actions"><button class="btn blue" id="preview-next" type="button" disabled>${index === quiz.questions.length - 1 ? "See score" : "Next question"}</button></div>`;
      preview.querySelectorAll("[data-choice]").forEach((button) => {
        button.addEventListener("click", () => {
          selected = Number(button.dataset.choice);
          preview.querySelectorAll("[data-choice]").forEach((option) => option.classList.toggle("selected", option === button));
          preview.querySelector("#preview-next").disabled = false;
        });
      });
      preview.querySelector("#preview-next").addEventListener("click", () => {
        if (selected === question.correct) score += 1;
        index += 1;
        selected = null;
        if (index < quiz.questions.length) paint();
        else {
          preview.innerHTML = `<p class="eyebrow">Preview complete</p><h2 id="preview-title">${esc(quiz.title)}</h2><div class="preview-result"><strong>${score} / ${quiz.questions.length}</strong><br>You finished the quiz.</div><div class="actions"><button class="btn blue" id="preview-again" type="button">Play again</button></div>`;
          preview.querySelector("#preview-again").addEventListener("click", runPreview);
        }
      });
      preview.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    paint();
  }

  function exportedHtml() {
    const safeData = JSON.stringify({ title: quiz.title.trim(), intro: quiz.intro.trim(), questions: quiz.questions }).replace(/</g, "\\u003c");
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(quiz.title)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#bdc4d4;color:#0f1a2b;font:16px/1.5 Arial,sans-serif}.wrap{width:min(760px,calc(100% - 32px));margin:40px auto;background:#fff;box-shadow:0 18px 45px rgba(28,46,74,.1)}header{padding:18px 24px;color:#fff;background:#1c2e4a;font-weight:800}main{padding:36px}h1{margin:0;color:#0f1a2b;font-size:clamp(34px,7vw,56px);line-height:1}.intro{color:#52677d}.count{color:#52677d;font-size:12px;font-weight:800;text-transform:uppercase}.question{margin:28px 0 18px;font-size:26px;font-weight:800}.options{display:grid;gap:10px}.options button{padding:14px;text-align:left;color:#1c2e4a;background:#fff;border:1px solid rgba(28,46,74,.16);font:inherit;cursor:pointer}.options button.selected{border-color:#52677d;box-shadow:inset 4px 0 #a9d8ff}.next{margin-top:22px;padding:13px 18px;color:#0f1a2b;background:#a9d8ff;border:0;font-weight:800;cursor:pointer}.next:disabled{opacity:.45}.result{padding:24px;color:#fff;background:#1c2e4a}.result strong{color:#a9d8ff;font-size:34px}@media(max-width:600px){.wrap{width:100%;margin:0;min-height:100vh}main{padding:28px 20px}}
</style></head><body><div class="wrap"><header>CAREER CANVAS · STUDENT QUIZ</header><main id="app"></main></div><script>
const quiz=${safeData};let index=0,score=0,selected=null;const app=document.querySelector('#app');const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));function paint(){const q=quiz.questions[index];app.innerHTML='<p class="count">Question '+(index+1)+' of '+quiz.questions.length+'</p><h1>'+esc(quiz.title)+'</h1>'+(index===0&&quiz.intro?'<p class="intro">'+esc(quiz.intro)+'</p>':'')+'<p class="question">'+esc(q.prompt)+'</p><div class="options">'+q.choices.map((c,i)=>'<button data-choice="'+i+'">'+esc(c)+'</button>').join('')+'</div><button class="next" disabled>'+(index===quiz.questions.length-1?'See score':'Next question')+'</button>';app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.choice);app.querySelectorAll('[data-choice]').forEach(o=>o.classList.toggle('selected',o===b));app.querySelector('.next').disabled=false});app.querySelector('.next').onclick=()=>{if(selected===q.correct)score++;index++;selected=null;index<quiz.questions.length?paint():finish()}}function finish(){app.innerHTML='<h1>'+esc(quiz.title)+'</h1><div class="result"><strong>'+score+' / '+quiz.questions.length+'</strong><br>You finished the quiz.</div><button class="next" id="again">Play again</button>';document.querySelector('#again').onclick=()=>{index=0;score=0;paint()}}paint();
<\/script></body></html>`;
  }

  document.querySelector("#preview-quiz").addEventListener("click", runPreview);
  document.querySelector("#export-quiz").addEventListener("click", () => {
    const issue = validate();
    if (issue) { showToast(issue); return; }
    persist();
    const blob = new Blob([exportedHtml()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quiz.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "career-canvas-quiz"}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Standalone quiz downloaded");
  });

  renderQuestions();
  status.textContent = quiz.updatedAt ? "Your saved quiz is ready." : "Nothing saved yet. Add your title and first question.";
})();

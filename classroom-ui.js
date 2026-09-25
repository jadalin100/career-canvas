(() => {
  "use strict";
  const api = window.CareerCanvasClassroom;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const modeText = api.mode === "cloud" ? "Cloud sync is on. Work will follow students across school iPads." : "Demo mode: this works fully on one iPad, but class data is not shared across devices until Firebase is connected.";
  document.querySelectorAll("[data-mode-banner]").forEach(el => { el.innerHTML = `<strong>${api.mode === "cloud" ? "Classroom connected" : "Same-iPad demo"}</strong>${modeText}`; });

  const joinForm = document.querySelector("#class-join-form");
  if (joinForm) {
    joinForm.elements.code.value = "";
    joinForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.querySelector("#join-status");
      const button = joinForm.querySelector("button[type='submit']");
      status.className = "status"; status.textContent = "Joining…"; button.disabled = true;
      try {
        await api.joinClass(joinForm.elements.code.value, joinForm.elements.username.value);
        location.href = "student.html";
      } catch (error) {
        status.className = "status error"; status.textContent = error.message || "Could not join the class."; button.disabled = false;
      }
    });
  }

  async function renderStudent() {
    const root = document.querySelector("#student-dashboard");
    if (!root) return;
    const session = api.getSession();
    if (!session) { location.replace("join.html"); return; }
    document.querySelector("#student-name").textContent = session.username;
    const readLocal = (key) => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { return {}; } };
    let project = readLocal("careerCanvasProject");
    let deliverables = readLocal("careerCanvasDeliverables");
    const results = readLocal("careerCanvasQuizResults");
    const record = await api.getStudentRecord();
    if (record?.project?.updatedAt && (!project.updatedAt || record.project.updatedAt > project.updatedAt)) {
      project = record.project;
      deliverables = record.deliverables || deliverables;
      localStorage.setItem("careerCanvasProject", JSON.stringify(project));
      localStorage.setItem("careerCanvasDeliverables", JSON.stringify(deliverables));
    }
    Object.entries(record?.careerQuizResults || {}).forEach(([key, value]) => {
      if (!results[key]?.completedAt || value.completedAt > results[key].completedAt) results[key] = value;
    });
    localStorage.setItem("careerCanvasQuizResults", JSON.stringify(results));
    const done = Object.values(deliverables).filter(Boolean).length;
    document.querySelector("#project-progress").textContent = `${done * 25}%`;
    document.querySelector("#career-result-count").textContent = String(Object.keys(results).length);
    const resultList = document.querySelector("#career-results-list");
    if (resultList) {
      const labels = { career: "Business career fit", deca: "DECA event fit", branding: "Digital branding strengths" };
      resultList.innerHTML = Object.keys(results).length ? Object.entries(results).map(([key, value]) => `<a class="step-link" href="index.html#quiz-${encodeURIComponent(key)}"><span><strong>${esc(labels[key] || key)}</strong><br>${esc((value.topResults || []).join(", ") || "Result saved")} · ${value.completedAt ? new Date(value.completedAt).toLocaleDateString() : "Saved"}</span><b>→</b></a>`).join("") : '<p class="empty">Complete a career quiz to save a result.</p>';
    }
    await api.syncStudent({ project, deliverables, careerQuizResults: results });
    const quizzes = await api.listQuizzes(true);
    document.querySelector("#gallery-count").textContent = String(quizzes.filter(q => q.status === "published").length);
    const gallery = document.querySelector("#class-gallery");
    gallery.innerHTML = quizzes.length ? quizzes.map(q => `<article class="quiz-tile"><span class="pill ${q.status === "published" ? "published" : ""}">${esc(q.status === "published" ? "Class gallery" : "Waiting for teacher")}</span><strong>${esc(q.title || "Untitled quiz")}</strong><span>By ${esc(q.ownerUsername)} · ${q.questions?.length || 0} questions</span><footer><span>${q.ownerId === session.studentId ? "Your quiz" : "Student quiz"}</span><a class="class-button secondary" href="play.html?id=${encodeURIComponent(q.id)}">Play</a></footer></article>`).join("") : '<p class="empty">No quizzes yet. Build one and submit it for the teacher to publish.</p>';
    const artifacts = await api.listArtifacts(true);
    const artifactGallery = document.createElement("div");
    artifactGallery.innerHTML = `<h3 style="margin-top:24px">Articles, ads, and portfolios</h3><div class="gallery-grid">${artifacts.length ? artifacts.map(item => `<article class="quiz-tile"><span class="pill ${item.status === "published" ? "published" : ""}">${esc(item.status === "published" ? "Class gallery" : "Waiting for teacher")}</span><strong>${esc(item.title)}</strong><span>${esc(item.type)} by ${esc(item.ownerUsername)}</span><footer><span>${item.ownerId === session.studentId ? "Your project" : "Student project"}</span><a class="class-button secondary" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a></footer></article>`).join("") : '<p class="empty">No project links yet. Submit an article, ad, or portfolio from the Project Studio.</p>'}</div>`;
    gallery.after(artifactGallery);
  }

  document.querySelector("#leave-class")?.addEventListener("click", () => { api.leaveClass(); location.href = "join.html"; });
  renderStudent().catch(error => { const root = document.querySelector("#student-dashboard"); if (root) root.innerHTML = `<p class="status error">${esc(error.message)}</p>`; });

  async function renderTeacher() {
    const root = document.querySelector("#teacher-dashboard");
    if (!root) return;
    const status = document.querySelector("#teacher-status");
    try {
      const data = await api.teacherDashboard();
      document.querySelector("#teacher-students").textContent = data.students.length;
      document.querySelector("#teacher-quizzes").textContent = data.quizzes.length;
      document.querySelector("#teacher-attempts").textContent = data.attempts.length;
      document.querySelector("#teacher-code").textContent = api.config.classCode;
      const students = document.querySelector("#student-list");
      students.innerHTML = data.students.length ? data.students.sort((a,b)=>a.username.localeCompare(b.username)).map(s => {
        const complete = Object.values(s.deliverables || {}).filter(Boolean).length;
        const results = Object.keys(s.careerQuizResults || {}).length;
        return `<div class="teacher-row"><div><strong>${esc(s.username)}</strong><span>${complete}/4 project pieces · ${results}/3 career quizzes</span></div><span>Last active ${s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleDateString() : "—"}</span></div>`;
      }).join("") : '<p class="empty">No students have joined yet.</p>';
      const quizzes = document.querySelector("#teacher-quiz-list");
      quizzes.innerHTML = data.quizzes.length ? data.quizzes.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(q => `<div class="teacher-row" data-quiz-id="${esc(q.id)}"><div><strong>${esc(q.title || "Untitled quiz")}</strong><span>By ${esc(q.ownerUsername)} · ${q.questions?.length || 0} questions · ${esc(q.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="play.html?id=${encodeURIComponent(q.id)}&teacher=1">Play</a><button class="small-button" data-status="${q.status === "published" ? "pending" : "published"}">${q.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No quizzes have been submitted.</p>';
      const artifacts = document.querySelector("#teacher-artifact-list");
      if (artifacts) artifacts.innerHTML = data.artifacts.length ? data.artifacts.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(item => `<div class="teacher-row" data-artifact-id="${esc(item.id)}"><div><strong>${esc(item.title)}</strong><span>${esc(item.type)} by ${esc(item.ownerUsername)} · ${esc(item.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a><button class="small-button" data-artifact-status="${item.status === "published" ? "pending" : "published"}">${item.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No project links have been submitted.</p>';
      status.textContent = "Dashboard updated.";
    } catch (error) { status.className = "status error"; status.textContent = error.message; }
  }

  document.querySelector("#teacher-sign-in")?.addEventListener("click", async event => {
    event.currentTarget.disabled = true;
    const status = document.querySelector("#teacher-status"); status.textContent = "Signing in…";
    try { await api.teacherSignIn(); await renderTeacher(); } catch (error) { status.className = "status error"; status.textContent = error.message; }
    event.currentTarget.disabled = false;
  });
  document.querySelector("#teacher-quiz-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-status]"); if (!button) return;
    button.disabled = true;
    try { await api.setQuizStatus(button.closest("[data-quiz-id]").dataset.quizId, button.dataset.status); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  document.querySelector("#teacher-artifact-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-artifact-status]"); if (!button) return;
    button.disabled = true;
    try { await api.setArtifactStatus(button.closest("[data-artifact-id]").dataset.artifactId, button.dataset.artifactStatus); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  if (document.querySelector("#teacher-dashboard") && api.mode === "demo") renderTeacher();

  async function renderPlayer() {
    const root = document.querySelector("#quiz-player"); if (!root) return;
    const quiz = await api.getQuiz(new URLSearchParams(location.search).get("id"));
    const session = api.getSession();
    const teacherPreview = new URLSearchParams(location.search).get("teacher") === "1" && await api.isTeacherSignedIn();
    const participant = session && !teacherPreview ? session : null;
    if (!session && !teacherPreview) { location.replace("join.html"); return; }
    if (!quiz || (quiz.status !== "published" && quiz.ownerId !== participant?.studentId && !teacherPreview)) { root.innerHTML = '<p class="empty">This quiz is not available.</p>'; return; }
    const themes = { midnight:["#1c2e4a","#a9d8ff","#0f1a2b"], dusty:["#52677d","#bdc4d4","#0f1a2b"], buttercream:["#1c2e4a","#d1cfc9","#1c2e4a"], ivory:["#52677d","#bdc4d4","#0f1a2b"] };
    const fonts = { modern:'"Avenir Next",Arial,sans-serif', classic:'Georgia,"Times New Roman",serif', rounded:'"Arial Rounded MT Bold","Trebuchet MS",sans-serif' };
    const [header, accent, ink] = themes[quiz.theme] || themes.midnight;
    root.style.setProperty("--quiz-header", header); root.style.setProperty("--quiz-accent", accent); root.style.setProperty("--quiz-ink", ink); root.style.fontFamily = fonts[quiz.font] || fonts.modern;
    let index = 0, score = 0, selected = null;
    const paint = () => {
      const q = quiz.questions[index];
      root.innerHTML = `<p class="kicker">${esc(quiz.title)} · ${index+1} of ${quiz.questions.length}</p><div class="progress-track"><i style="width:${(index/quiz.questions.length)*100}%"></i></div><p class="player-question">${esc(q.prompt)}</p><div class="player-options">${q.choices.map((choice,i)=>`<button class="player-option" data-choice="${i}" aria-pressed="false">${esc(choice)}</button>`).join("")}</div><div class="class-actions"><button class="class-button" id="player-next" disabled>${index === quiz.questions.length-1 ? "See score" : "Next question"}</button></div>`;
      root.querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click",()=>{ selected=Number(button.dataset.choice); root.querySelectorAll("[data-choice]").forEach(item=>item.setAttribute("aria-pressed",String(item===button))); root.querySelector("#player-next").disabled=false; }));
      root.querySelector("#player-next").addEventListener("click", async()=>{ if(selected===q.correct) score++; index++; selected=null; if(index<quiz.questions.length) paint(); else { if(participant) await api.saveAttempt(quiz,score,quiz.questions.length); root.innerHTML=`<div class="result-card"><p class="kicker" style="color:var(--accent)">Quiz complete</p><h1>${esc(quiz.title)}</h1><strong>${score} / ${quiz.questions.length}</strong><p>${participant ? "Your result was saved to the class." : "Teacher preview—this result was not recorded."}</p></div><div class="class-actions"><a class="class-button" href="${participant ? "student.html" : "teacher.html"}">Back to ${participant ? "class gallery" : "teacher dashboard"}</a><button class="class-button secondary" id="play-again">Play again</button></div>`; root.querySelector("#play-again").onclick=()=>{index=0;score=0;paint();}; }});
    };
    paint();
  }
  renderPlayer().catch(error => { const root=document.querySelector("#quiz-player"); if(root) root.innerHTML=`<p class="status error">${esc(error.message)}</p>`; });
})();

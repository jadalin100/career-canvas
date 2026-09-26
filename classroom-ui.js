(() => {
  "use strict";
  const api = window.CareerCanvasClassroom;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const classSelect = document.querySelector("#teacher-class-select");
  if (classSelect) classSelect.innerHTML = api.listClasses().map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
  const selectedClassId = () => classSelect?.value || api.listClasses()[0].id;
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
    const className = document.querySelector("#student-class-name");
    if (className) className.textContent = api.getClass(session.classId).name;
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
      const labels = { career: "Business career fit", deca: "DECA event fit", branding: "Digital marketing strengths" };
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

  function discoveryChart(students, key, title) {
    const quiz = (window.CAREER_CANVAS_QUIZ_DATA?.quizzes || []).find(item => item.key === key);
    const labels = new Map((quiz?.results || []).map(result => [result.code, result.name]));
    const counts = new Map();
    students.forEach(student => {
      const primary = student.careerQuizResults?.[key]?.topResults?.[0];
      if (primary) counts.set(primary, (counts.get(primary) || 0) + 1);
    });
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || String(labels.get(a[0]) || a[0]).localeCompare(String(labels.get(b[0]) || b[0])));
    const completed = rows.reduce((total, [, count]) => total + count, 0);
    return { title, note: `${completed} of ${students.length} students completed`, center: String(completed), centerLabel: "responses", rows: rows.map(([code, count]) => ({ label: labels.get(code) || code, value: count, display: `${count} ${count === 1 ? "student" : "students"}` })) };
  }

  function studentQuizCharts(quizzes, attempts) {
    const groups = new Map();
    attempts.forEach(attempt => {
      if (!attempt.quizId || !Number.isFinite(Number(attempt.score)) || !Number.isFinite(Number(attempt.total)) || Number(attempt.total) <= 0) return;
      const group = groups.get(attempt.quizId) || { title: attempt.quizTitle || quizzes.find(quiz => quiz.id === attempt.quizId)?.title || "Untitled quiz", correct: 0, total: 0, plays: 0 };
      group.correct += Number(attempt.score);
      group.total += Number(attempt.total);
      group.plays++;
      groups.set(attempt.quizId, group);
    });
    return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title)).map(group => {
      const missed = Math.max(0, group.total - group.correct);
      const average = group.total ? Math.round((group.correct / group.total) * 100) : 0;
      return { title: group.title, note: `${group.plays} recorded ${group.plays === 1 ? "play" : "plays"}`, center: `${average}%`, centerLabel: "class average", rows: [
        { label: "Correct answers", value: group.correct, display: String(group.correct) },
        { label: "Missed answers", value: missed, display: String(missed) }
      ] };
    });
  }

  const pieColors = ["#1c2e4a", "#a9d8ff", "#52677d", "#d1cfc9", "#6f95bb", "#87c6a7", "#e4b86c", "#947aa8", "#d8877d", "#7694a6"];

  function pieBackground(rows) {
    const total = rows.reduce((sum, row) => sum + Math.max(0, Number(row.value) || 0), 0);
    if (!total) return "#e3e7ee";
    let cursor = 0;
    const stops = rows.map((row, index) => {
      const start = cursor;
      cursor += (Math.max(0, Number(row.value) || 0) / total) * 100;
      return `${pieColors[index % pieColors.length]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });
    return `conic-gradient(${stops.join(",")})`;
  }

  function renderPie(chart) {
    const label = chart.rows.map(row => `${row.label}: ${row.display}`).join(", ");
    return `<article class="analytics-chart"><h3>${esc(chart.title)}</h3><p>${esc(chart.note)}</p>${chart.rows.length ? `<div class="pie-layout"><div class="pie-chart" role="img" aria-label="${esc(label)}" style="--pie:${pieBackground(chart.rows)}"><span><strong>${esc(chart.center)}</strong><small>${esc(chart.centerLabel)}</small></span></div><div class="pie-legend">${chart.rows.map((row, index) => `<div class="pie-key"><i style="--key-color:${pieColors[index % pieColors.length]}"></i><span>${esc(row.label)}</span><strong>${esc(row.display)}</strong></div>`).join("")}</div></div>` : '<p class="analytics-empty">No results yet.</p>'}</article>`;
  }

  function renderAnalytics(data) {
    const target = document.querySelector("#teacher-analytics");
    if (!target) return;
    const charts = [
      discoveryChart(data.students, "career", "Business career fit"),
      discoveryChart(data.students, "deca", "DECA event fit"),
      discoveryChart(data.students, "branding", "Digital marketing strengths"),
      ...studentQuizCharts(data.quizzes, data.attempts)
    ];
    if (!charts.some(chart => chart.rows.length)) {
      target.innerHTML = '<p class="analytics-empty">No quiz results yet.</p>';
      return;
    }
    target.innerHTML = charts.map(renderPie).join("");
  }

  async function renderTeacher() {
    const root = document.querySelector("#teacher-dashboard");
    if (!root) return;
    const status = document.querySelector("#teacher-status");
    try {
      const classId = selectedClassId();
      const selectedClass = api.getClass(classId);
      const data = await api.teacherDashboard(classId);
      document.querySelector("#teacher-students").textContent = data.students.length;
      document.querySelector("#teacher-quizzes").textContent = data.quizzes.length;
      document.querySelector("#teacher-attempts").textContent = data.attempts.length;
      document.querySelector("#teacher-code").textContent = selectedClass.code;
      renderAnalytics(data);
      const students = document.querySelector("#student-list");
      students.innerHTML = data.students.length ? data.students.sort((a,b)=>a.username.localeCompare(b.username)).map(s => {
        const complete = Object.values(s.deliverables || {}).filter(Boolean).length;
        const results = Object.keys(s.careerQuizResults || {}).length;
        const studentId = s.id || s.usernameKey;
        return `<div class="teacher-row" data-student-id="${esc(studentId)}" data-student-name="${esc(s.username)}"><div><strong>${esc(s.username)}</strong><span>${complete}/4 project pieces · ${results}/3 career quizzes<br>Last active ${s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleDateString() : "—"}</span></div><button class="small-button danger-button" type="button" data-delete-student>Delete student</button></div>`;
      }).join("") : '<p class="empty">No students have joined yet.</p>';
      const quizzes = document.querySelector("#teacher-quiz-list");
      quizzes.innerHTML = data.quizzes.length ? data.quizzes.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(q => `<div class="teacher-row" data-quiz-id="${esc(q.id)}"><div><strong>${esc(q.title || "Untitled quiz")}</strong><span>By ${esc(q.ownerUsername)} · ${q.questions?.length || 0} questions · ${esc(q.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="play.html?id=${encodeURIComponent(q.id)}&teacher=1&class=${encodeURIComponent(classId)}">Play</a><button class="small-button" data-status="${q.status === "published" ? "pending" : "published"}">${q.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No quizzes have been submitted.</p>';
      const artifacts = document.querySelector("#teacher-artifact-list");
      if (artifacts) artifacts.innerHTML = data.artifacts.length ? data.artifacts.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(item => `<div class="teacher-row" data-artifact-id="${esc(item.id)}"><div><strong>${esc(item.title)}</strong><span>${esc(item.type)} by ${esc(item.ownerUsername)} · ${esc(item.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a><button class="small-button" data-artifact-status="${item.status === "published" ? "pending" : "published"}">${item.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No project links have been submitted.</p>';
      status.textContent = `${selectedClass.name} dashboard updated.`;
    } catch (error) { status.className = "status error"; status.textContent = error.message; }
  }

  document.querySelector("#teacher-sign-in")?.addEventListener("click", async event => {
    event.currentTarget.disabled = true;
    const status = document.querySelector("#teacher-status"); status.textContent = "Signing in…";
    try { await api.teacherSignIn(); await renderTeacher(); } catch (error) { status.className = "status error"; status.textContent = error.message; }
    event.currentTarget.disabled = false;
  });
  classSelect?.addEventListener("change", () => renderTeacher());
  document.querySelector("#teacher-quiz-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-status]"); if (!button) return;
    button.disabled = true;
    try { await api.setQuizStatus(button.closest("[data-quiz-id]").dataset.quizId, button.dataset.status, selectedClassId()); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  document.querySelector("#student-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-delete-student]"); if (!button) return;
    const row = button.closest("[data-student-id]");
    const name = row.dataset.studentName || "this student";
    if (!window.confirm(`Delete ${name}? This will permanently remove their profile, submitted work, and quiz results.`)) return;
    button.disabled = true;
    const status = document.querySelector("#teacher-status");
    status.className = "status"; status.textContent = `Deleting ${name}…`;
    try { await api.deleteStudent(row.dataset.studentId, selectedClassId()); await renderTeacher(); status.textContent = `${name} was deleted.`; }
    catch (error) { status.className = "status error"; status.textContent = error.message; button.disabled = false; }
  });
  document.querySelector("#teacher-artifact-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-artifact-status]"); if (!button) return;
    button.disabled = true;
    try { await api.setArtifactStatus(button.closest("[data-artifact-id]").dataset.artifactId, button.dataset.artifactStatus, selectedClassId()); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  if (document.querySelector("#teacher-dashboard") && api.mode === "demo") renderTeacher();

  async function renderPlayer() {
    const root = document.querySelector("#quiz-player"); if (!root) return;
    const params = new URLSearchParams(location.search);
    const quiz = await api.getQuiz(params.get("id"), params.get("class"));
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

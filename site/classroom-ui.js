(() => {
  "use strict";
  const stripHeadlinePeriods = () => {
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      const textNodes = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      for (let index = textNodes.length - 1; index >= 0; index--) {
        const node = textNodes[index];
        if (!node.data.trim()) continue;
        node.data = node.data.replace(/\.\s*$/, "");
        break;
      }
    });
  };
  stripHeadlinePeriods();
  const api = window.CareerCanvasClassroom;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const classSelect = document.querySelector("#teacher-class-select");
  const selectedClassId = () => classSelect?.value || "";
  async function loadTeacherClasses(selectId) {
    if (!classSelect) return;
    const list = await api.listTeacherClasses();
    const keep = selectId || classSelect.value;
    classSelect.innerHTML = list.length ? list.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("") : '<option value="">No classes yet</option>';
    if (keep && list.some(item => item.id === keep)) classSelect.value = keep;
  }
  const modeText = api.mode === "cloud" ? "Cloud sync is on. Work will follow students across school iPads." : "Demo mode: this works fully on one iPad, but class data is not shared across devices until Firebase is connected.";
  document.querySelectorAll("[data-mode-banner]").forEach(el => { el.innerHTML = `<strong>${api.mode === "cloud" ? "Classroom connected" : "Same-iPad demo"}</strong>${modeText}`; });

  const joinForm = document.querySelector("#class-join-form");
  if (joinForm) {
    joinForm.elements.code.value = "";
    joinForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.querySelector("#join-status");
      const button = joinForm.querySelector("button[type='submit']");
      status.className = "status"; status.textContent = api.mode === "cloud" ? "Joining…" : "Joining…"; button.disabled = true;
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
    if (className) className.textContent = session.className || api.getClass(session.classId).name;
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
      resultList.innerHTML = Object.keys(results).length ? Object.entries(results).map(([key, value]) => `<a class="step-link" href="discover.html#quiz-${encodeURIComponent(key)}"><span><strong>${esc(labels[key] || key)}</strong><br>${esc((value.topResults || []).join(", ") || "Result saved")} · ${value.completedAt ? new Date(value.completedAt).toLocaleDateString() : "Saved"}</span><b>→</b></a>`).join("") : '<p class="empty">Complete a career quiz to save a result.</p>';
    }
    await api.syncStudent({ project, deliverables, careerQuizResults: results });
    const quizzes = await api.listQuizzes(true);
    document.querySelector("#gallery-count").textContent = String(quizzes.filter(q => q.status === "published").length);
    const gallery = document.querySelector("#class-gallery");
    gallery.innerHTML = quizzes.length ? quizzes.map(q => `<article class="quiz-tile"><span class="pill ${q.status === "published" ? "published" : ""}">${esc(q.status === "published" ? "Class gallery" : "Waiting for teacher")}</span><strong>${esc(q.title || "Untitled quiz")}</strong><span>By ${esc(q.ownerUsername)} · ${q.questions?.length || 0} questions</span><footer><span>${q.ownerId === session.studentId ? "Your quiz" : "Student quiz"}</span><a class="class-button secondary" href="play.html?id=${encodeURIComponent(q.id)}">Play</a></footer>${q.status === "published" ? commentBox(q.id) : ""}</article>`).join("") : '<p class="empty">No quizzes yet. Build one and submit it for the teacher to publish.</p>';
    const artifacts = await api.listArtifacts(true);
    const artifactGallery = document.createElement("div");
    artifactGallery.innerHTML = `<h3 style="margin-top:24px">Articles, ads, and portfolios</h3><div class="gallery-grid">${artifacts.length ? artifacts.map(item => `<article class="quiz-tile"><span class="pill ${item.status === "published" ? "published" : ""}">${esc(item.status === "published" ? "Class gallery" : "Waiting for teacher")}</span><strong>${esc(item.title)}</strong><span>${esc(item.type)} by ${esc(item.ownerUsername)}</span><footer><span>${item.ownerId === session.studentId ? "Your project" : "Student project"}</span><a class="class-button secondary" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a></footer>${item.status === "published" ? commentBox(item.id) : ""}</article>`).join("") : '<p class="empty">No project links yet. Submit an article, ad, or portfolio from the Project Studio.</p>'}</div>`;
    gallery.after(artifactGallery);
    await refreshComments(session);
    if (!commentsWired) {
      commentsWired = true;
      root.addEventListener("submit", async event => {
        const form = event.target.closest("[data-comment-target]"); if (!form) return;
        event.preventDefault();
        const input = form.querySelector("input"); const button = form.querySelector("button");
        button.disabled = true;
        try { await api.addComment(form.dataset.commentTarget, input.value); input.value = ""; await refreshComments(session); }
        catch (error) { form.querySelector(".comment-error").textContent = error.message; }
        button.disabled = false;
      });
      root.addEventListener("click", async event => {
        const button = event.target.closest("[data-delete-comment]"); if (!button) return;
        button.disabled = true;
        try { await api.deleteComment(button.dataset.deleteComment); await refreshComments(session); } catch (_) { button.disabled = false; }
      });
    }
  }

  let commentsWired = false;
  function commentBox(id) {
    return `<details class="comment-box" data-comments-for="${esc(id)}"><summary>Comments (<span data-comment-count>0</span>)</summary><ul class="comment-list"></ul><form class="comment-form" data-comment-target="${esc(id)}"><label class="sr-only" for="comment-${esc(id)}">Add a comment</label><input id="comment-${esc(id)}" maxlength="300" placeholder="Say something kind and specific" required><button class="small-button" type="submit">Post</button><p class="comment-error" role="alert"></p></form><p class="comment-note">Only your class can see comments.</p></details>`;
  }
  async function refreshComments(session) {
    let comments = [];
    try { comments = await api.listComments(); } catch (_) { return; }
    const byTarget = {};
    comments.forEach(c => { (byTarget[c.targetId] ||= []).push(c); });
    document.querySelectorAll("[data-comments-for]").forEach(box => {
      const items = byTarget[box.dataset.commentsFor] || [];
      box.querySelector("[data-comment-count]").textContent = String(items.length);
      box.querySelector(".comment-list").innerHTML = items.length ? items.map(c => `<li><strong>${esc(c.authorUsername)}</strong> ${esc(c.text)}${c.authorId === session.studentId ? ` <button class="link-button" type="button" data-delete-comment="${esc(c.id)}">Delete</button>` : ""}</li>`).join("") : '<li class="comment-empty">No comments yet.</li>';
    });
  }

  document.querySelector("#leave-class")?.addEventListener("click", () => { api.leaveClass(); location.href = "join.html"; });
  renderStudent().catch(error => { const root = document.querySelector("#student-dashboard"); if (root) root.innerHTML = `<p class="status error">${esc(error.message)}</p>`; });

  function discoveryChart(students, key, title) {
    const quiz = (window.CAREER_CANVAS_QUIZ_DATA?.quizzes || []).find(item => item.key === key);
    const labels = new Map((quiz?.results || []).map(result => [result.code, result.name]));
    const counts = new Map();
    const people = [];
    students.forEach(student => {
      const primary = student.careerQuizResults?.[key]?.topResults?.[0];
      if (primary) { counts.set(primary, (counts.get(primary) || 0) + 1); people.push({ name: student.username, result: labels.get(primary) || primary }); }
    });
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || String(labels.get(a[0]) || a[0]).localeCompare(String(labels.get(b[0]) || b[0])));
    const completed = rows.reduce((total, [, count]) => total + count, 0);
    return { title, people, note: `${completed} of ${students.length} students completed`, center: String(completed), centerLabel: "responses", rows: rows.map(([code, count]) => ({ label: labels.get(code) || code, value: count, display: `${count} ${count === 1 ? "student" : "students"}` })) };
  }

  function studentQuizCharts(quizzes, attempts) {
    const groups = new Map();
    attempts.forEach(attempt => {
      if (!attempt.quizId || !Number.isFinite(Number(attempt.score)) || !Number.isFinite(Number(attempt.total)) || Number(attempt.total) <= 0) return;
      const group = groups.get(attempt.quizId) || { title: attempt.quizTitle || quizzes.find(quiz => quiz.id === attempt.quizId)?.title || "Untitled quiz", correct: 0, total: 0, plays: 0, people: [] };
      group.people.push({ name: attempt.playerUsername || "Unknown", result: `${Number(attempt.score)} / ${Number(attempt.total)}` });
      group.correct += Number(attempt.score);
      group.total += Number(attempt.total);
      group.plays++;
      groups.set(attempt.quizId, group);
    });
    return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title)).map(group => {
      const missed = Math.max(0, group.total - group.correct);
      const average = group.total ? Math.round((group.correct / group.total) * 100) : 0;
      return { title: group.title, people: group.people, note: `${group.plays} recorded ${group.plays === 1 ? "play" : "plays"}`, center: `${average}%`, centerLabel: "class average", rows: [
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
    return `<article class="analytics-chart"><h3>${esc(chart.title)}</h3><p>${esc(chart.note)}</p>${chart.rows.length ? `<details class="pie-details"><summary><div class="pie-layout"><div class="pie-chart" role="img" aria-label="${esc(label)}" style="--pie:${pieBackground(chart.rows)}"><span><strong>${esc(chart.center)}</strong><small>${esc(chart.centerLabel)}</small></span></div><div class="pie-legend">${chart.rows.map((row, index) => `<div class="pie-key"><i style="--key-color:${pieColors[index % pieColors.length]}"></i><span>${esc(row.label)}</span><strong>${esc(row.display)}</strong></div>`).join("")}</div></div><span class="pie-hint">Click to see each student</span></summary>${renderPeople(chart.people)}</details>` : '<p class="analytics-empty">No results yet.</p>'}</article>`;
  }

  function renderPeople(people = []) {
    const sorted = [...people].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return `<table class="pie-people"><thead><tr><th>Student</th><th>Result</th></tr></thead><tbody>${sorted.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.result)}</td></tr>`).join("")}</tbody></table>`;
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
      if (!classId) { status.className = "status"; status.textContent = "Create your first class below, then share its code with your students."; return; }
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
        return `<div class="teacher-row" data-student-id="${esc(studentId)}" data-student-name="${esc(s.username)}"><div><strong>${esc(s.username)}</strong><span>${complete}/4 project pieces · ${results}/3 career quizzes<br>Last active ${s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleDateString() : "—"}</span></div><div class="teacher-row-actions"><button class="small-button" type="button" data-lock-student="${s.locked ? "0" : "1"}" title="${s.locked ? "Only the current device can use this name" : "Anyone with the class code can rejoin under this name"}">${s.locked ? "Unlock name" : "Lock name"}</button><button class="small-button danger-button" type="button" data-delete-student>Delete student</button></div></div>`;
      }).join("") : '<p class="empty">No students have joined yet.</p>';
      const quizzes = document.querySelector("#teacher-quiz-list");
      quizzes.innerHTML = data.quizzes.length ? data.quizzes.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(q => `<div class="teacher-row" data-quiz-id="${esc(q.id)}"><div><strong>${esc(q.title || "Untitled quiz")}</strong><span>By ${esc(q.ownerUsername)} · ${q.questions?.length || 0} questions · ${esc(q.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="play.html?id=${encodeURIComponent(q.id)}&teacher=1&class=${encodeURIComponent(classId)}">Play</a><button class="small-button" data-status="${q.status === "published" ? "pending" : "published"}">${q.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No quizzes have been submitted.</p>';
      const artifacts = document.querySelector("#teacher-artifact-list");
      if (artifacts) artifacts.innerHTML = data.artifacts.length ? data.artifacts.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(item => `<div class="teacher-row" data-artifact-id="${esc(item.id)}"><div><strong>${esc(item.title)}</strong><span>${esc(item.type)} by ${esc(item.ownerUsername)} · ${esc(item.status)}</span></div><div class="teacher-row-actions"><a class="small-button" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a><button class="small-button" data-artifact-status="${item.status === "published" ? "pending" : "published"}">${item.status === "published" ? "Unpublish" : "Publish"}</button></div></div>`).join("") : '<p class="empty">No project links have been submitted.</p>';
      const commentList = document.querySelector("#teacher-comment-list");
      if (commentList) {
        const titles = Object.fromEntries([...data.quizzes, ...data.artifacts].map(item => [item.id, item.title || "Untitled"]));
        const comments = (data.comments || []).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
        commentList.innerHTML = comments.length ? comments.map(c => `<div class="teacher-row" data-comment-id="${esc(c.id)}"><div><strong>${esc(c.authorUsername)}</strong> ${esc(c.text)}<span>On ${esc(titles[c.targetId] || "deleted work")} · ${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span></div><div class="teacher-row-actions"><button class="small-button danger-button" type="button" data-delete-comment-teacher>Delete</button></div></div>`).join("") : '<p class="empty">No comments yet.</p>';
      }
      status.textContent = `${selectedClass.name} dashboard updated.`;
    } catch (error) { status.className = "status error"; status.textContent = error.message; }
  }

  document.querySelector("#teacher-sign-in")?.addEventListener("click", async event => {
    const button = event.currentTarget; // currentTarget is null after the first await
    button.disabled = true;
    const status = document.querySelector("#teacher-status"); status.className = "status"; status.textContent = "Signing in…";
    try { await api.teacherSignIn(); await loadTeacherClasses(); await renderTeacher(); } catch (error) { status.className = "status error"; status.textContent = error.message; }
    button.disabled = false;
  });
  classSelect?.addEventListener("change", () => renderTeacher());
  document.querySelector("#teacher-quiz-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-status]"); if (!button) return;
    button.disabled = true;
    try { await api.setQuizStatus(button.closest("[data-quiz-id]").dataset.quizId, button.dataset.status, selectedClassId()); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  document.querySelector("#student-list")?.addEventListener("click", async event => {
    const lock = event.target.closest("[data-lock-student]");
    if (lock) {
      lock.disabled = true;
      try { await api.setStudentLocked(lock.closest("[data-student-id]").dataset.studentId, lock.dataset.lockStudent === "1", selectedClassId()); await renderTeacher(); }
      catch (error) { document.querySelector("#teacher-status").textContent = error.message; lock.disabled = false; }
      return;
    }
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
  document.querySelector("#teacher-comment-list")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-delete-comment-teacher]"); if (!button) return;
    button.disabled = true;
    try { await api.deleteComment(button.closest("[data-comment-id]").dataset.commentId, selectedClassId()); await renderTeacher(); }
    catch (error) { document.querySelector("#teacher-status").textContent = error.message; button.disabled = false; }
  });
  document.querySelector("#create-class-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget; const button = form.querySelector("button");
    const status = document.querySelector("#teacher-status");
    button.disabled = true;
    try {
      const created = await api.createClass(form.elements.name.value);
      form.reset();
      await loadTeacherClasses(created.id);
      await renderTeacher();
      status.className = "status"; status.textContent = `${created.name} is ready. Share class code ${created.code} with your students.`;
    } catch (error) { status.className = "status error"; status.textContent = error.message; }
    button.disabled = false;
  });
  document.querySelector("#co-teacher-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget; const button = form.querySelector("button");
    const status = document.querySelector("#teacher-status");
    if (!selectedClassId()) { status.className = "status error"; status.textContent = "Create or choose a class first."; return; }
    button.disabled = true;
    try {
      const email = form.elements.email.value.trim();
      await api.addCoTeacher(selectedClassId(), email);
      form.reset();
      status.className = "status"; status.textContent = `${email} can now sign in with Google and manage this class.`;
    } catch (error) { status.className = "status error"; status.textContent = error.message; }
    button.disabled = false;
  });
  if (document.querySelector("#teacher-dashboard")) (async () => {
    if (api.mode === "demo" || await api.isTeacherSignedIn()) {
      try { await loadTeacherClasses(); } catch (error) { document.querySelector("#teacher-status").textContent = error.message; }
      renderTeacher();
    }
  })();

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
      root.querySelector("#player-next").addEventListener("click", async()=>{ if(selected===q.correct) score++; index++; selected=null; if(index<quiz.questions.length) paint(); else { const saved = participant ? await api.saveAttempt(quiz,score,quiz.questions.length) : null; const resultNote = !participant ? "Teacher preview—this result was not recorded." : saved?.savedOffline ? "Your result is saved on this iPad and will sync when the connection returns." : "Your result was saved to the class."; root.innerHTML=`<div class="result-card"><p class="kicker" style="color:var(--accent)">Quiz complete</p><h1>${esc(quiz.title)}</h1><strong>${score} / ${quiz.questions.length}</strong><p>${esc(resultNote)}</p></div><div class="class-actions"><a class="class-button" href="${participant ? "student.html" : "teacher.html"}">Back to ${participant ? "class gallery" : "teacher dashboard"}</a><button class="class-button secondary" id="play-again">Play again</button></div>`; root.querySelector("#play-again").onclick=()=>{index=0;score=0;paint();}; }});
    };
    paint();
  }
  renderPlayer().catch(error => { const root=document.querySelector("#quiz-player"); if(root) root.innerHTML=`<p class="status error">${esc(error.message)}</p>`; });
})();

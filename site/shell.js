// Career Canvas app shell: one top bar on every page, plus a bottom tab bar on phones
// (the iPhone app shows the phone layout). Each page keeps its own content; this only
// replaces the different headers each page used to have.
(() => {
  "use strict";
  const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";
  const tabFor = { index: "home", discover: "quizzes", quizzes: "quizzes", quiz: "quizzes", learn: "lessons", gallery: "gallery", play: "gallery", studio: "studio", "quiz-builder": "studio", student: "me", join: "me", teacher: "me", contact: "contact" };
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const tabs = [
    ["home", "index.html", "Home", icon("M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z")],
    ["quizzes", "discover.html", "Quizzes", icon("M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V15M12 18.5v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z")],
    ["lessons", "learn.html", "Lessons", icon("M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h5")],
    ["gallery", "gallery.html", "Gallery", icon("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z")],
    ["studio", "studio.html", "Studio", icon("M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4")],
    ["contact", "contact.html", "Contact", icon("M4 6h16v12H4zM4 7l8 6 8-6")],
    ["me", "student.html", "My class", icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0")]
  ];
  const current = tabFor[page] || "";
  let session = null;
  try { session = JSON.parse(localStorage.getItem("careerCanvasClassSession")); } catch (_) {}
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const links = cls => tabs.map(([key, href, label, svg]) =>
    `<a class="${cls}" href="${href}"${key === current ? ' aria-current="page"' : ""}>${svg}<span>${label}</span></a>`).join("");
  const initials = name => name.split(/\s+/).map(part => part[0] || "").join("").slice(0, 2).toUpperCase();
  const account = page === "join" || page === "teacher" ? "" : session?.username
    ? `<a class="cc-account" href="student.html" title="My class"><b>${esc(initials(session.username))}</b><span>${esc(session.username.split(/\s+/)[0])}</span></a>`
    : `<a class="cc-join" href="join.html">Join class</a>`;

  const bar = document.createElement("header");
  bar.className = "cc-bar";
  bar.innerHTML = `<a class="cc-brand" href="index.html" aria-label="Career Canvas home"><img src="assets/career-canvas-logo.png?v=2" alt=""><span>Career Canvas</span></a>
    <nav class="cc-tabs" aria-label="Main">${links("cc-tab")}</nav>
    <div class="cc-actions">${account}</div>`;
  const dock = document.createElement("nav");
  dock.className = "cc-dock";
  dock.setAttribute("aria-label", "Main");
  dock.innerHTML = links("cc-dock-tab");

  // Keep the old header's working controls (Leave class, Back to project, Teacher) by moving them into the new bar.
  const old = document.querySelector(".site-header, .class-header, .app-header, body > header.brand");
  if (old) {
    old.querySelectorAll("button, .header-action:not([href^='index.html']), a[href$='teacher.html']").forEach(el => {
      el.classList.add("cc-page-action");
      bar.querySelector(".cc-actions").prepend(el);
    });
    old.style.display = "none";
  }
  document.body.prepend(bar);
  document.body.append(dock);
  document.documentElement.classList.add("cc-shell");
})();

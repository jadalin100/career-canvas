(() => {
  "use strict";
  // gallery.html?section=articles|ads|quizzes|portfolios shows just that section as its own page.
  const only = document.getElementById(new URLSearchParams(location.search).get("section") || "");
  if (only?.classList.contains("gallery-section")) {
    document.querySelectorAll(".gallery-section").forEach(section => { section.hidden = section !== only; });
    const name = only.querySelector("h2").textContent;
    document.querySelector(".subpage-hero h1").textContent = name;
    document.title = `${name} — Career Canvas`;
  }
  const target = document.querySelector("#public-quiz-gallery");
  if (!target || !window.CareerCanvasClassroom) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const docId = url => (String(url).match(/^https:\/\/docs\.google\.com\/document\/d\/([\w-]+)/) || [])[1];

  // One shared pop-up for previewing Google Docs without leaving the gallery.
  const dialog = document.createElement("dialog");
  dialog.className = "doc-preview";
  dialog.innerHTML = '<div class="doc-preview-bar"><strong></strong><a target="_blank" rel="noopener">Open in new tab ↗</a><button type="button" aria-label="Close preview">×</button></div><iframe title="Document preview"></iframe>';
  document.body.append(dialog);
  const frame = dialog.querySelector("iframe");
  dialog.querySelector("button").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { frame.src = "about:blank"; });
  document.addEventListener("click", event => {
    const card = event.target.closest("[data-doc-id]");
    if (!card) return;
    const id = card.dataset.docId;
    dialog.querySelector("strong").textContent = card.dataset.title;
    dialog.querySelector("a").href = `https://docs.google.com/document/d/${id}/view`;
    frame.src = `https://docs.google.com/document/d/${id}/preview`;
    dialog.showModal();
  });

  const card = item => {
    const id = docId(item.url);
    const by = `<span>By ${esc(item.ownerUsername || "Career Canvas student")}</span>`;
    if (!id) return `<a class="gallery-link-card" href="${esc(item.url)}" target="_blank" rel="noopener"><strong>${esc(item.title)}</strong>${by}<b>Open project ↗</b></a>`;
    return `<button type="button" class="gallery-link-card gallery-doc-card" data-doc-id="${id}" data-title="${esc(item.title)}"><img src="https://drive.google.com/thumbnail?id=${id}&sz=w600" alt="" loading="lazy" onerror="this.remove()"><strong>${esc(item.title)}</strong>${by}<b>Preview ↗</b></button>`;
  };

  window.CareerCanvasClassroom.listQuizzes(false).then(items => {
    const quizzes = items.filter(item => item.status === "published");
    target.innerHTML = quizzes.length ? quizzes.map(quiz => `<a class="gallery-link-card" href="play.html?id=${encodeURIComponent(quiz.id)}"><strong>${esc(quiz.title || "Untitled quiz")}</strong><span>By ${esc(quiz.ownerUsername || "Career Canvas student")} · ${quiz.questions?.length || 0} questions</span><b>Play quiz →</b></a>`).join("") : '<p class="gallery-empty">No quizzes have been published yet.</p>';
  }).catch(() => { target.innerHTML = '<p class="gallery-empty">The quiz gallery could not load. Please try again.</p>'; });
  window.CareerCanvasClassroom.listArtifacts(false).then(items => {
    ["article", "ad", "portfolio"].forEach(type => {
      const section = document.querySelector(`[data-gallery-kind="${type}"]`);
      let matches = items.filter(item => item.status === "published" && item.type === type);
      // The All work page shows only featured items when a section has any; section pages show everything.
      if (!only && matches.some(item => item.featured)) matches = matches.filter(item => item.featured);
      if (section && matches.length) section.innerHTML = matches.map(card).join("");
    });
  }).catch(() => {});
})();

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

  // One shared pop-up for previewing Google Docs and Drive files (ads) without leaving the gallery.
  const dialog = document.createElement("dialog");
  dialog.className = "doc-preview";
  dialog.innerHTML = '<div class="doc-preview-bar"><strong></strong><a target="_blank" rel="noopener">Open in new tab ↗</a><button type="button" class="doc-prev" aria-label="Previous page">‹</button><button type="button" class="doc-next" aria-label="Next page">›</button><button type="button" class="doc-close" aria-label="Close preview">×</button></div><iframe title="Document preview" referrerpolicy="no-referrer" allow="autoplay"></iframe>';
  document.body.append(dialog);
  const frame = dialog.querySelector("iframe");
  let pages = [], page = 0, title = "";
  const show = () => {
    const [kind, id] = pages[page];
    const base = kind === "doc" ? `https://docs.google.com/document/d/${id}` : `https://drive.google.com/file/d/${id}`;
    dialog.querySelector("strong").textContent = pages.length > 1 ? `${title} (${page + 1} of ${pages.length})` : title;
    dialog.querySelector("a").href = `${base}/view`;
    frame.src = `${base}/preview`;
  };
  dialog.querySelector(".doc-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".doc-prev").addEventListener("click", () => { page = (page + pages.length - 1) % pages.length; show(); });
  dialog.querySelector(".doc-next").addEventListener("click", () => { page = (page + 1) % pages.length; show(); });
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { frame.src = "about:blank"; });
  document.addEventListener("click", event => {
    const card = event.target.closest("[data-pages]");
    if (!card) return;
    pages = card.dataset.pages.split(",").map(p => p.split(":"));
    page = 0; title = card.dataset.title;
    dialog.querySelectorAll(".doc-prev, .doc-next").forEach(b => { b.hidden = pages.length < 2; });
    show();
    dialog.showModal();
  });

  const card = item => {
    const id = docId(item.url);
    const pages = item.files ? item.files.map(f => `file:${f}`) : id ? [`doc:${id}`] : [];
    const by = `<span>By ${esc(item.ownerUsername || "Career Canvas student")}</span>`;
    if (!pages.length) return `<a class="gallery-link-card" href="${esc(item.url)}" target="_blank" rel="noopener"><strong>${esc(item.title)}</strong>${by}<b>Open project ↗</b></a>`;
    return `<button type="button" class="gallery-link-card gallery-doc-card${item.files ? " gallery-ad-card" : ""}" data-pages="${pages.join(",")}" data-title="${esc(item.title)}"><img src="${esc(item.thumb || `https://drive.google.com/thumbnail?id=${pages[0].split(":")[1]}&sz=w600`)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"><strong>${esc(item.title)}</strong>${by}<b>${item.files?.length > 1 ? `Preview ${item.files.length} pages ↗` : "Preview ↗"}</b></button>`;
  };

  window.CareerCanvasClassroom.listQuizzes(false).then(items => {
    const quizzes = items.filter(item => item.status === "published");
    target.innerHTML = quizzes.length ? quizzes.map(quiz => `<a class="gallery-link-card" href="play.html?id=${encodeURIComponent(quiz.id)}"><strong>${esc(quiz.title || "Untitled quiz")}</strong><span>By ${esc(quiz.ownerUsername || "Career Canvas student")} · ${quiz.questions?.length || 0} questions</span><b>Play quiz →</b></a>`).join("") : '<p class="gallery-empty">No quizzes have been published yet.</p>';
  }).catch(() => { target.innerHTML = '<p class="gallery-empty">The quiz gallery could not load. Please try again.</p>'; });
  // Ads from ads-data.js show even if the classroom database can't be reached.
  const ads = (window.CC_ADS || []).map(ad => ({ ...ad, type: "ad", status: "published", ownerUsername: ad.by }));
  const render = items => {
    items = items.concat(ads);
    ["article", "ad", "portfolio"].forEach(type => {
      const section = document.querySelector(`[data-gallery-kind="${type}"]`);
      let matches = items.filter(item => item.status === "published" && item.type === type);
      // The All work page shows only featured items when a section has any; section pages show everything.
      if (!only && matches.some(item => item.featured)) matches = matches.filter(item => item.featured);
      if (section && matches.length) section.innerHTML = matches.map(card).join("");
    });
  };
  window.CareerCanvasClassroom.listArtifacts(false).then(render).catch(() => render([]));
})();

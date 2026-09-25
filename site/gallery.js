(() => {
  "use strict";
  const target = document.querySelector("#public-quiz-gallery");
  if (!target || !window.CareerCanvasClassroom) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.CareerCanvasClassroom.listQuizzes(false).then(items => {
    const quizzes = items.filter(item => item.status === "published");
    target.innerHTML = quizzes.length ? quizzes.map(quiz => `<a class="gallery-link-card" href="play.html?id=${encodeURIComponent(quiz.id)}"><strong>${esc(quiz.title || "Untitled quiz")}</strong><span>By ${esc(quiz.ownerUsername || "Career Canvas student")} · ${quiz.questions?.length || 0} questions</span><b>Play quiz →</b></a>`).join("") : '<p class="gallery-empty">No quizzes have been published yet.</p>';
  }).catch(() => { target.innerHTML = '<p class="gallery-empty">The quiz gallery could not load. Please try again.</p>'; });
  window.CareerCanvasClassroom.listArtifacts(false).then(items => {
    ["article", "ad", "portfolio"].forEach(type => {
      const section = document.querySelector(`[data-gallery-kind="${type}"]`);
      const matches = items.filter(item => item.status === "published" && item.type === type);
      if (section && matches.length) section.innerHTML = matches.map(item => `<a class="gallery-link-card" href="${esc(item.url)}" target="_blank" rel="noopener"><strong>${esc(item.title)}</strong><span>By ${esc(item.ownerUsername || "Career Canvas student")}</span><b>Open project ↗</b></a>`).join("");
    });
  }).catch(() => {});
})();

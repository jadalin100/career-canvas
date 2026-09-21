const card = document.querySelector("#visual-card");
const visual = document.querySelector(".hero-visual");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (card && visual && !reducedMotion) {
  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
  });
  visual.addEventListener("pointerleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

const revealItems = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// The seven-meeting plan is generated from the slide decks. meetings-data.js
// keeps it available when the site is opened directly from the filesystem.
const meetingList = document.querySelector("#meeting-list");

if (meetingList) {
  const escape = (value) => String(value).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const untimedLabel = (label) => ({
    "Sixty seconds each. Say the choice, not the idea.": "Share your choice and explain why it works.",
    "Show a partner your layout for three seconds.": "Show a partner your layout and ask what stood out.",
    "Sixty seconds is a real format.": "A short pitch helps you focus your message.",
    "Write the pitch to these four time blocks.": "Write a clear beginning, middle, and ending for your pitch.",
  })[label] || label;

  const renderMeetings = ({ meetings }) => {
      meetingList.innerHTML = meetings.map((m) => `
        <li class="meeting reveal">
          <div class="meeting-head">
            <span class="meeting-number">${String(m.number).padStart(2, "0")}</span>
            <div>
              <h3>${escape(m.title)}</h3>
            </div>
          </div>
          <ul class="meeting-agenda">
            ${m.agenda.map((a) => `<li>${escape(untimedLabel(a.label))}</li>`).join("")}
          </ul>
          <p class="meeting-sources">Sources: ${m.sources.map(escape).join(" · ")}</p>
        </li>`).join("");
      meetingList.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  };

  if (window.CAREER_CANVAS_MEETINGS) {
    renderMeetings(window.CAREER_CANVAS_MEETINGS);
  } else {
    meetingList.innerHTML = '<li class="meeting-loading">The meeting plan is unavailable. Reload the page or contact the workshop leader.</li>';
  }
}

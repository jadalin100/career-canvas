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

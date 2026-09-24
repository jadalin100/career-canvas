(() => {
  "use strict";

  const form = document.querySelector("#partner-form");
  const status = document.querySelector("#partner-form-status");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const business = String(data.get("business") || "").trim();
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const focus = String(data.get("focus") || "").trim();
    const idea = String(data.get("idea") || "").trim();
    const subject = `Career Canvas partnership — ${business}`;
    const body = [
      "Hi Jada and Olivia,",
      "",
      `I'm interested in discussing a Career Canvas pilot partnership for ${business}.`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "What students should learn about our business:",
      focus,
      "",
      "What students could create for us:",
      idea || "We would like help choosing this together.",
      "",
      "Thank you,",
      name
    ].join("\n");

    status.textContent = "Your email app is opening with the details filled in.";
    window.location.href = `mailto:careercanvas.gns@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

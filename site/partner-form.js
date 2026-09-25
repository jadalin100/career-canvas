(() => {
  "use strict";

  const form = document.querySelector("#partner-form");
  const status = document.querySelector("#partner-form-status");
  const preview = document.querySelector("#email-preview");
  const copyButton = document.querySelector("#copy-email-draft");
  if (!form) return;

  function makeDraft() {
    const data = new FormData(form);
    const business = String(data.get("business") || "[Business Name]").trim() || "[Business Name]";
    const name = String(data.get("name") || "[Name]").trim() || "[Name]";
    const email = String(data.get("email") || "").trim();
    const focus = String(data.get("focus") || "[specific focus and role in the Great Neck community]").trim() || "[specific focus and role in the Great Neck community]";
    const idea = String(data.get("idea") || "We would be glad to choose an advertisement direction together.").trim();
    const body = [
      "Hi Jada and Olivia,", "",
      `My name is ${name}, and I'm interested in discussing a Career Canvas pilot partnership for ${business}. Our focus is ${focus}.`, "",
      "I understand that students will research our business, write a one-to-four-page article for the Career Canvas site, create an educational quiz connected to our industry, and design an original advertisement for us.", "",
      "Advertisement ideas:", idea, "",
      "I can also provide a short business introduction and complete the attached details form. Please let me know the best next step or a convenient time for a phone call.", "",
      `My email: ${email || "[your email]"}`, "", "Thank you,", name
    ].join("\n");
    return { business, body, subject: `Career Canvas pilot partnership — ${business}` };
  }

  function updatePreview() {
    if (preview) preview.textContent = makeDraft().body;
  }
  form.addEventListener("input", updatePreview);
  updatePreview();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const { subject, body } = makeDraft();

    status.textContent = "Your email app is opening with the details filled in.";
    window.location.href = `mailto:careercanva.gns@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  copyButton?.addEventListener("click", async () => {
    const { body } = makeDraft();
    try {
      await navigator.clipboard.writeText(body);
      status.textContent = "Email draft copied.";
    } catch (_) {
      if (preview) { preview.focus(); window.getSelection()?.selectAllChildren(preview); }
      status.textContent = "Select the preview text and copy it.";
    }
  });
})();

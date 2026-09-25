(() => {
  "use strict";

  const PROJECT_KEY = "careerCanvasProject";
  const DELIVERABLES_KEY = "careerCanvasDeliverables";
  const fields = ["name", "business", "audience", "problem", "idea"];
  const defaults = { name: "", business: "", audience: "", problem: "", idea: "", updatedAt: "" };
  const deliverableDefaults = { paper: false, ad: false, quiz: false, portfolio: false };
  const form = document.querySelector("#project-form");
  const status = document.querySelector("#save-status");
  const toast = document.querySelector("#toast");
  let saveTimer;
  let toastTimer;

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" ? { ...fallback, ...value } : { ...fallback };
    } catch (_) {
      return { ...fallback };
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      status.textContent = "This browser could not save your work. Download a summary before leaving.";
      return false;
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      toast.textContent = "";
    }, 2200);
  }

  const project = read(PROJECT_KEY, defaults);
  const deliverables = read(DELIVERABLES_KEY, deliverableDefaults);

  fields.forEach((name) => {
    const input = form.elements[name];
    if (input) input.value = project[name] || "";
  });

  document.querySelectorAll("[data-deliverable]").forEach((input) => {
    input.checked = Boolean(deliverables[input.dataset.deliverable]);
  });

  function saveProject() {
    fields.forEach((name) => { project[name] = form.elements[name].value.trim(); });
    if (!fields.some((name) => project[name])) return;
    project.updatedAt = new Date().toISOString();
    if (write(PROJECT_KEY, project)) {
      status.textContent = `Saved at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
      window.CareerCanvasClassroom?.syncStudent({ project, deliverables }).catch(() => {
        status.textContent = "Saved on this iPad. Class sync will retry when the connection returns.";
      });
    }
  }

  function queueSave() {
    status.textContent = "Saving…";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveProject, 350);
  }

  function foundationIsComplete() {
    return fields.every((name) => form.elements[name].value.trim());
  }

  function requireFoundation() {
    if (foundationIsComplete()) return true;
    const firstMissing = fields.map((name) => form.elements[name]).find((input) => !input.value.trim());
    if (firstMissing) {
      firstMissing.reportValidity();
      firstMissing.focus();
    }
    showToast("Complete the project foundation first");
    return false;
  }

  function paintProgress() {
    const done = Object.values(deliverables).filter(Boolean).length;
    const percent = done * 25;
    document.querySelector("#progress-ring").style.setProperty("--progress", `${percent}%`);
    document.querySelector("#progress-value").textContent = `${percent}%`;
    document.querySelector("#progress-copy").textContent = done === 4
      ? "Your full project kit is complete. Add the strongest pieces to your portfolio."
      : `${done} of 4 pieces complete. ${done === 0 ? "Start with the business paper so the rest is grounded in research." : "Keep building from what your research taught you."}`;
  }

  form.addEventListener("input", queueSave);
  document.querySelector("#save-project")?.addEventListener("click", () => {
    saveProject();
    showToast("Project saved");
  });
  document.querySelectorAll("[data-deliverable]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked && !requireFoundation()) {
        input.checked = false;
        return;
      }
      deliverables[input.dataset.deliverable] = input.checked;
      write(DELIVERABLES_KEY, deliverables);
      saveProject();
      paintProgress();
      showToast(input.checked ? "Marked complete" : "Moved back to in progress");
    });
  });

  document.querySelector("#download-summary").addEventListener("click", () => {
    if (!requireFoundation()) return;
    saveProject();
    const title = project.name || "Untitled Career Canvas project";
    const lines = [
      "CAREER CANVAS PROJECT SUMMARY",
      "",
      `Project: ${title}`,
      `Local business: ${project.business || "Not added yet"}`,
      `Audience: ${project.audience || "Not added yet"}`,
      "",
      "PROBLEM",
      project.problem || "Not added yet",
      "",
      "PROJECT IDEA",
      project.idea || "Not added yet",
      "",
      "DELIVERABLES",
      `Business paper: ${deliverables.paper ? "Complete" : "In progress"}`,
      `Original ad: ${deliverables.ad ? "Complete" : "In progress"}`,
      `Playable quiz: ${deliverables.quiz ? "Complete" : "In progress"}`,
      `Digital portfolio: ${deliverables.portfolio ? "Complete" : "In progress"}`,
      "",
      `Saved: ${new Date().toLocaleString()}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "career-canvas"}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Project summary downloaded");
  });

  document.querySelector("#artifact-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const artifactForm = event.currentTarget;
    if (!artifactForm.reportValidity()) return;
    const classroom = window.CareerCanvasClassroom;
    if (!classroom?.getSession()) { showToast("Join the class before submitting work"); return; }
    const button = artifactForm.querySelector("button[type='submit']");
    button.disabled = true;
    try {
      await classroom.submitArtifact({ type: artifactForm.elements.type.value, title: artifactForm.elements.title.value, url: artifactForm.elements.url.value });
      artifactForm.reset(); showToast("Sent to the teacher for gallery review");
    } catch (error) { showToast(error.message || "Could not submit this project"); }
    finally { button.disabled = false; }
  });

  window.addEventListener("pagehide", saveProject);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveProject();
  });

  paintProgress();
  status.textContent = project.updatedAt ? "Your saved project is ready." : "Nothing saved yet. Start typing to create your project.";
  if (window.CareerCanvasClassroom?.getSession()) {
    window.CareerCanvasClassroom.getStudentRecord().then((record) => {
      if (!record) return;
      const remoteProject = record.project || {};
      const remoteIsNewer = remoteProject.updatedAt && (!project.updatedAt || remoteProject.updatedAt > project.updatedAt);
      if (remoteIsNewer) {
        Object.assign(project, remoteProject);
        fields.forEach((name) => { if (form.elements[name]) form.elements[name].value = project[name] || ""; });
        write(PROJECT_KEY, project);
      }
      if (record.deliverables && remoteIsNewer) {
        Object.assign(deliverables, record.deliverables);
        document.querySelectorAll("[data-deliverable]").forEach((input) => { input.checked = Boolean(deliverables[input.dataset.deliverable]); });
        write(DELIVERABLES_KEY, deliverables);
      }
      paintProgress();
      status.textContent = "Your latest saved project is ready.";
    }).catch(() => { status.textContent = "Using the version saved on this iPad."; });
  }
})();

(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.getElementById("progress");
  const counter = document.getElementById("counter");
  const help = document.getElementById("help");
  const overview = document.getElementById("overview");
  const notes = document.getElementById("notes");
  const notesText = document.getElementById("notes-text");
  const overviewGrid = document.getElementById("overview-grid");
  const state = { index: 0 };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const formatNumber = (value) => String(value).padStart(2, "0");

  function closeOverlays() {
    help?.classList.remove("open");
    overview?.classList.remove("open");
    notes?.classList.remove("open");
  }

  function updateNotes() {
    if (notesText) notesText.textContent = slides[state.index]?.dataset.notes || "Заметок для этого слайда нет.";
  }

  function goTo(index) {
    state.index = clamp(index, 0, slides.length - 1);
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === state.index);
      slide.classList.toggle("past", i < state.index);
      slide.setAttribute("aria-hidden", i === state.index ? "false" : "true");
    });
    progress?.style.setProperty("--progress", `${((state.index + 1) / slides.length) * 100}%`);
    if (counter) counter.textContent = `${formatNumber(state.index + 1)} / ${formatNumber(slides.length)}`;
    updateNotes();
  }

  function buildOverview() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = "";
    slides.forEach((slide, i) => {
      const button = document.createElement("button");
      button.className = "thumb";
      button.innerHTML = `<strong>${formatNumber(i + 1)}</strong><span>${slide.dataset.title || slide.dataset.type || "Слайд"}</span>`;
      button.addEventListener("click", () => {
        goTo(i);
        closeOverlays();
      });
      overviewGrid.appendChild(button);
    });
  }

  document.getElementById("next")?.addEventListener("click", () => goTo(state.index + 1));
  document.getElementById("prev")?.addEventListener("click", () => goTo(state.index - 1));
  document.getElementById("help-open")?.addEventListener("click", () => help?.classList.add("open"));
  document.getElementById("overview-open")?.addEventListener("click", () => overview?.classList.add("open"));

  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "ArrowRight" || (key === " " && !event.shiftKey)) {
      event.preventDefault();
      goTo(state.index + 1);
    } else if (key === "ArrowLeft" || (key === " " && event.shiftKey)) {
      event.preventDefault();
      goTo(state.index - 1);
    } else if (key === "Home") {
      goTo(0);
    } else if (key === "End") {
      goTo(slides.length - 1);
    } else if (key.toLowerCase() === "o") {
      overview?.classList.toggle("open");
    } else if (key === "Escape") {
      if (help?.classList.contains("open") || overview?.classList.contains("open") || notes?.classList.contains("open")) {
        closeOverlays();
      } else {
        overview?.classList.add("open");
      }
    } else if (key === "?") {
      help?.classList.toggle("open");
    } else if (key.toLowerCase() === "p") {
      updateNotes();
      notes?.classList.toggle("open");
    } else if (key.toLowerCase() === "m") {
      document.body.classList.toggle("reduce-motion");
    }
  });

  [help, overview, notes].forEach((overlay) => {
    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.classList.remove("open");
    });
  });

  buildOverview();
  goTo(0);
})();

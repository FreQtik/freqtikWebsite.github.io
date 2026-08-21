"use strict";
(() => {
  const TERM_DEFS = {
    "impulse-response": "For this course, think of an IR as the file that shapes what your sound turns into inside Anvil. You do not need the technical definition to use it.",
    "convolution": "Convolution is the process that uses an IR to change your sound. You can ignore the math unless you actually want it.",
    "spectrum": "Spectrum just means how much low, middle and high-frequency energy a sound contains.",
    "phase": "Phase describes tiny timing relationships inside a waveform.",
    "residual": "A residual is simply what is left after some estimated matching material has been removed.",
    "mid-side": "Mid/Side separates stereo into the center and the left-right difference around it.",
    "source-time": "Source-time means which moment inside the prepared A/B material is being read."
  };

  let tooltip = null;
  let activeTerm = null;

  function ensureTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.className = "docs-term-tooltip";
    tooltip.id = "docs-term-tooltip";
    tooltip.role = "tooltip";
    tooltip.hidden = true;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function positionTooltip(button) {
    const tip = ensureTooltip();
    const r = button.getBoundingClientRect();
    const margin = 10;
    const width = Math.min(340, window.innerWidth - 28);
    tip.style.width = width + "px";
    tip.hidden = false;
    const tr = tip.getBoundingClientRect();
    let left = r.left + (r.width / 2) - (tr.width / 2);
    left = Math.max(14, Math.min(left, window.innerWidth - tr.width - 14));
    let top = r.bottom + margin;
    if (top + tr.height > window.innerHeight - 14)
      top = Math.max(14, r.top - tr.height - margin);
    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(top) + "px";
  }

  function openTerm(button) {
    const key = button.dataset.docsTerm;
    const def = TERM_DEFS[key];
    if (!def) return;
    if (activeTerm && activeTerm !== button)
      activeTerm.setAttribute("aria-expanded", "false");
    activeTerm = button;
    const tip = ensureTooltip();
    tip.textContent = def;
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-describedby", tip.id);
    positionTooltip(button);
  }

  function closeTerm(button = activeTerm) {
    if (button) button.setAttribute("aria-expanded", "false");
    if (tooltip) tooltip.hidden = true;
    if (!button || activeTerm === button) activeTerm = null;
  }

  for (const button of document.querySelectorAll("[data-docs-term]")) {
    if (!TERM_DEFS[button.dataset.docsTerm]) continue;
    button.addEventListener("mouseenter", () => openTerm(button));
    button.addEventListener("mouseleave", () => {
      if (document.activeElement !== button) closeTerm(button);
    });
    button.addEventListener("focus", () => openTerm(button));
    button.addEventListener("blur", () => closeTerm(button));
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (activeTerm === button && button.getAttribute("aria-expanded") === "true")
        closeTerm(button);
      else
        openTerm(button);
    });
  }

  window.addEventListener("resize", () => {
    if (activeTerm) positionTooltip(activeTerm);
  });
  window.addEventListener("scroll", () => {
    if (activeTerm) positionTooltip(activeTerm);
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTerm();
  });
  document.addEventListener("pointerdown", (event) => {
    if (activeTerm && !event.target.closest("[data-docs-term]")) closeTerm();
  });

  const track = document.querySelector("[data-learning-track]");
  if (!track) return;

  const STORAGE_KEY = "freqtik.impulseAnvil.learning.v1";
  const quests = [...track.querySelectorAll("[data-learning-quest]")];
  const showAllButton = track.querySelector("[data-learning-show-all]");
  const resetButton = track.querySelector("[data-learning-reset]");
  const progressText = track.querySelector("[data-learning-progress-text]");
  const progressBar = track.querySelector("[data-learning-progress-bar]");
  const history = track.querySelector("[data-learning-history]");
  const historyEmpty = track.querySelector("[data-learning-history-empty]");
  const badge = track.querySelector("[data-learning-badge]");

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        completed: parsed && parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
        showAll: Boolean(parsed && parsed.showAll)
      };
    } catch (_) {
      return { completed: {}, showAll: false };
    }
  }

  let state = loadState();

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function completedCount() {
    return quests.filter(q => Boolean(state.completed[q.dataset.learningQuest])).length;
  }

  function questTitle(quest) {
    const h = quest.querySelector("h2");
    return h ? h.textContent.trim() : ("Quest " + quest.dataset.learningQuest);
  }

  function renderHistory() {
    if (!history || !historyEmpty) return;
    const rows = quests
      .filter(q => state.completed[q.dataset.learningQuest])
      .map(q => ({
        title: questTitle(q),
        at: state.completed[q.dataset.learningQuest]
      }))
      .sort((a, b) => new Date(a.at) - new Date(b.at));

    history.innerHTML = "";
    historyEmpty.hidden = rows.length > 0;
    for (const row of rows) {
      const li = document.createElement("li");
      const d = new Date(row.at);
      li.textContent = `${row.title} — ${Number.isNaN(d.getTime()) ? "completed" : d.toLocaleString()}`;
      history.appendChild(li);
    }
  }

  function render() {
    const done = completedCount();
    if (progressText) progressText.textContent = done === quests.length ? "Course complete" : `${Math.round(quests.length ? (done / quests.length) * 100 : 0)}% complete · ${done} lessons done`;
    if (progressBar) progressBar.style.width = `${quests.length ? (done / quests.length) * 100 : 0}%`;
    if (showAllButton) showAllButton.textContent = state.showAll ? "Follow unlock order" : "Show all lessons";

    quests.forEach((quest, index) => {
      const id = quest.dataset.learningQuest;
      const complete = Boolean(state.completed[id]);
      const priorComplete = index === 0 || Boolean(state.completed[quests[index - 1].dataset.learningQuest]);
      const unlocked = complete || state.showAll || priorComplete;
      const body = quest.querySelector("[data-quest-body]");
      const button = quest.querySelector("[data-quest-complete]");
      const status = quest.querySelector("[data-quest-status]");

      quest.classList.toggle("is-complete", complete);
      quest.classList.toggle("is-locked", !unlocked);
      if (body) body.hidden = !unlocked;
      if (button) {
        button.disabled = !unlocked || complete;
        button.textContent = complete ? "Done ✓" : (quest.classList.contains("ia-quest-final") ? "Finish course" : "Done →");
      }
      if (status) status.textContent = complete ? "Done" : (unlocked ? "Ready" : "Locked");
    });

    if (badge) badge.hidden = done !== quests.length;
    renderHistory();
  }

  for (const quest of quests) {
    const button = quest.querySelector("[data-quest-complete]");
    if (!button) continue;
    button.addEventListener("click", () => {
      const id = quest.dataset.learningQuest;
      if (!state.completed[id]) {
        state.completed[id] = new Date().toISOString();
        saveState();
        render();
        const index = quests.indexOf(quest);
        const next = quests[index + 1];
        if (next && !state.showAll) {
          const changedChapter = quest.dataset.chapter !== next.dataset.chapter;
          const target = changedChapter ? next.closest("[data-learning-chapter]") : next;
          const heading = changedChapter
            ? target && target.querySelector(".ia-chapter-title")
            : next.querySelector("h2");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
          }
          if (target)
            target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: changedChapter ? "start" : "center" });
        }
      }
    });
  }

  if (showAllButton) {
    showAllButton.addEventListener("click", () => {
      state.showAll = !state.showAll;
      saveState();
      render();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (!window.confirm("Reset your local Impulse Anvil course progress on this browser?")) return;
      state = { completed: {}, showAll: false };
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      render();
    });
  }

  render();
})();

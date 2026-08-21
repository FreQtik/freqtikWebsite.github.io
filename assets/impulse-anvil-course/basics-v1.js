"use strict";
(() => {
  const DATA_URL = "/assets/impulse-anvil-course/basics-v1.json";
  const COURSE_URL = "/learn/impulse-anvil-basics/";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const $ = (selector, root = document) => root.querySelector(selector);

  async function loadCourse() {
    const response = await fetch(DATA_URL, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Course data HTTP " + response.status);
    const course = await response.json();
    if (!course || !Array.isArray(course.lessons) || !course.storageKey)
      throw new Error("Invalid course data.");
    return course;
  }

  function safeDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function sanitizeState(raw, course) {
    raw = raw && typeof raw === "object" ? raw : {};
    const sourceCompleted = raw.completed && typeof raw.completed === "object" ? raw.completed : {};
    const completed = {};
    let contiguous = true;

    for (const lesson of course.lessons) {
      if (contiguous && sourceCompleted[lesson.id]) {
        completed[lesson.id] = sourceCompleted[lesson.id];
      } else {
        contiguous = false;
      }
    }

    const completionDates = Object.values(completed).map(safeDate).filter(Boolean);
    const earliest = completionDates.length ? new Date(Math.min(...completionDates.map(d => d.getTime()))) : null;
    const finalLesson = course.lessons[course.lessons.length - 1];
    const allComplete = Object.keys(completed).length === course.lessons.length;
    const finalDate = allComplete ? safeDate(completed[finalLesson.id]) : null;

    return {
      completed,
      startedAt: safeDate(raw.startedAt)?.toISOString() || earliest?.toISOString() || null,
      activeMs: Number.isFinite(Number(raw.activeMs)) ? Math.max(0, Number(raw.activeMs)) : 0,
      completedAt: allComplete
        ? (safeDate(raw.completedAt)?.toISOString() || finalDate?.toISOString() || new Date().toISOString())
        : null,
      certificateName: typeof raw.certificateName === "string" ? raw.certificateName.slice(0, 80) : ""
    };
  }

  function readState(course) {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(course.storageKey) || "{}"); } catch (_) {}
    return sanitizeState(raw, course);
  }

  function writeState(course, state) {
    try { localStorage.setItem(course.storageKey, JSON.stringify(state)); } catch (_) {}
  }

  function doneCount(course, state) {
    let n = 0;
    for (const lesson of course.lessons) {
      if (!state.completed[lesson.id]) break;
      n++;
    }
    return n;
  }

  function firstIncompleteIndex(course, state) {
    const n = doneCount(course, state);
    return n >= course.lessons.length ? course.lessons.length - 1 : n;
  }

  function maxUnlockedIndex(course, state) {
    return doneCount(course, state) >= course.lessons.length
      ? course.lessons.length - 1
      : firstIncompleteIndex(course, state);
  }

  function isCourseComplete(course, state) {
    return doneCount(course, state) === course.lessons.length;
  }

  function formatDuration(ms) {
    const minutes = Math.max(0, Math.round(ms / 60000));
    if (minutes < 60) return minutes === 1 ? "1 min" : `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function formatCompletionDate(value) {
    const d = safeDate(value) || new Date();
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "short"
    }).format(d);
  }

  async function initLobby(course) {
    const lobby = $("[data-course-lobby]");
    if (!lobby) return false;

    const state = readState(course);
    writeState(course, state); // Removes old Show-all/out-of-order state safely.
    const done = doneCount(course, state);
    const pct = Math.round((done / course.lessons.length) * 100);
    const action = $("[data-course-launch-action]", lobby);
    const status = $("[data-course-launch-status]", lobby);
    const bar = $("[data-course-launch-progress]", lobby);

    if (action) {
      action.textContent = done === 0
        ? "START COURSE"
        : (done === course.lessons.length ? "COURSE COMPLETE · OPEN" : `CONTINUE · ${pct}%`);
    }
    if (status) {
      status.textContent = done === 0
        ? `${course.lessons.length} hands-on lessons · progress stays on this device`
        : (done === course.lessons.length
          ? `All ${course.lessons.length} lessons complete · certificate & review`
          : `${done} of ${course.lessons.length} lessons complete · progress stays on this device`);
    }
    if (bar) bar.style.width = `${pct}%`;
    return true;
  }

  function initApp(course) {
    const app = $("[data-course-app]");
    if (!app) return false;

    const stage = $("[data-course-stage]", app);
    const navigation = $("[data-course-navigation]", app);
    const prevButton = $("[data-course-prev]", app);
    const nextButton = $("[data-course-next]", app);
    const overviewButton = $("[data-course-overview-open]", app);
    const overview = $("[data-course-overview]", app);
    const overviewClose = $("[data-course-overview-close]", app);
    const overviewContent = $("[data-course-overview-content]", app);
    const topProgress = $("[data-course-top-progress]", app);
    const progressBar = $("[data-course-progress-bar]", app);
    const completion = $("[data-course-completion]", app);
    const completionDate = $("[data-certificate-date]", app);
    const completionDuration = $("[data-certificate-duration]", app);
    const nameInput = $(".ia-certificate-name input", app);
    const certificateSave = $("[data-certificate-save]", app);
    const reviewButton = $("[data-course-review]", app);
    const restartButton = $("[data-course-restart]", app);

    let state = readState(course);
    let activeStartedAt = null;
    let currentIndex = firstIncompleteIndex(course, state);
    let transitioning = false;

    if (!state.startedAt && !isCourseComplete(course, state)) {
      state.startedAt = new Date().toISOString();
      writeState(course, state);
    }

    function commitActiveTime() {
      if (activeStartedAt == null) return;
      state.activeMs += Math.max(0, Date.now() - activeStartedAt);
      activeStartedAt = null;
      writeState(course, state);
    }

    function beginActiveTime() {
      if (document.visibilityState !== "visible" || isCourseComplete(course, state) || activeStartedAt != null) return;
      activeStartedAt = Date.now();
    }

    function updateProgress() {
      const done = doneCount(course, state);
      const pct = (done / course.lessons.length) * 100;
      if (topProgress) topProgress.textContent = `${done} / ${course.lessons.length} complete`;
      if (progressBar) progressBar.style.width = `${pct}%`;
    }

    function canOpenLesson(index) {
      return index >= 0 && index <= maxUnlockedIndex(course, state);
    }

    function requestedIndexFromHash() {
      if (!location.hash) return -1;
      const id = decodeURIComponent(location.hash.slice(1));
      return course.lessons.findIndex(l => l.id === id);
    }

    function chooseInitialIndex() {
      const requested = requestedIndexFromHash();
      if (requested >= 0 && canOpenLesson(requested)) return requested;
      return firstIncompleteIndex(course, state);
    }

    function setHashForLesson(index) {
      const id = course.lessons[index]?.id;
      if (!id) return;
      history.replaceState(null, "", COURSE_URL + "#" + encodeURIComponent(id));
    }

    function clearHash() {
      history.replaceState(null, "", COURSE_URL);
    }

    function renderOverview() {
      overviewContent.innerHTML = "";
      const unlockedMax = maxUnlockedIndex(course, state);

      for (const chapter of course.chapters) {
        const wrap = document.createElement("section");
        wrap.className = "ia-overview-chapter";

        const h = document.createElement("h3");
        h.textContent = chapter.title;
        wrap.appendChild(h);

        const list = document.createElement("div");
        list.className = "ia-overview-list";

        course.lessons.forEach((lesson, index) => {
          if (lesson.chapter !== chapter.id) return;
          const complete = Boolean(state.completed[lesson.id]);
          const allowed = index <= unlockedMax;
          const currentProgress = index === firstIncompleteIndex(course, state) && !isCourseComplete(course, state);

          const button = document.createElement("button");
          button.type = "button";
          button.className = "ia-overview-lesson";
          if (complete) button.classList.add("is-complete");
          if (currentProgress) button.classList.add("is-current");
          button.disabled = !allowed;
          button.innerHTML =
            `<span class="ia-overview-id">${lesson.id}</span>` +
            `<span>${lesson.title}</span>` +
            `<span class="ia-overview-status">${complete ? "✓" : (currentProgress ? "CURRENT" : "🔒")}</span>`;

          button.addEventListener("click", () => {
            if (!canOpenLesson(index)) return;
            overview.close();
            goTo(index);
          });
          list.appendChild(button);
        });

        wrap.appendChild(list);
        overviewContent.appendChild(wrap);
      }
    }

    function renderLesson(index, entering = false) {
      if (!canOpenLesson(index)) index = firstIncompleteIndex(course, state);
      currentIndex = index;
      const lesson = course.lessons[index];
      const complete = Boolean(state.completed[lesson.id]);
      const isCurrentIncomplete = index === firstIncompleteIndex(course, state) && !isCourseComplete(course, state);

      completion.hidden = true;
      stage.hidden = false;
      navigation.hidden = false;
      clearHash();
      setHashForLesson(index);
      updateProgress();

      const card = document.createElement("article");
      card.className = "ia-course-card" + (entering && !reducedMotion.matches ? " is-entering" : "");
      card.innerHTML =
        `<div class="ia-course-card-top">` +
          `<span class="ia-course-lesson-id">${lesson.id} · ${course.chapters.find(c => c.id === lesson.chapter)?.title || ""}</span>` +
          `<span class="ia-course-card-position">Lesson ${index + 1} of ${course.lessons.length}</span>` +
        `</div>` +
        `<h1 tabindex="-1">${lesson.title}</h1>` +
        `<p class="ia-course-goal">${lesson.goal}</p>` +
        `<div class="ia-course-body">${lesson.bodyHtml}</div>` +
        `<div class="ia-course-done-row">` +
          (complete
            ? `<span class="ia-course-completed-label">DONE ✓</span>`
            : `<button type="button" class="ia-course-done-button" data-course-done>DONE →</button>`) +
        `</div>`;

      stage.replaceChildren(card);

      prevButton.disabled = index === 0;
      const hasNext = index < course.lessons.length - 1;
      nextButton.disabled = !hasNext || !complete;
      nextButton.textContent = hasNext ? (complete ? "Next →" : "Next 🔒") : "End";

      const doneButton = $("[data-course-done]", card);
      if (doneButton) {
        doneButton.disabled = !isCurrentIncomplete;
        doneButton.addEventListener("click", () => completeCurrentLesson());
      }

      prevButton.onclick = () => {
        if (index > 0) goTo(index - 1);
      };
      nextButton.onclick = () => {
        if (complete && index + 1 < course.lessons.length && canOpenLesson(index + 1))
          goTo(index + 1);
      };

      if (entering && !reducedMotion.matches) {
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("is-entering")));
      }
      setTimeout(() => {
        const heading = $("h1", card);
        if (heading) heading.focus({ preventScroll: true });
        card.scrollTop = 0;
      }, reducedMotion.matches ? 0 : 90);
    }

    function goTo(index) {
      if (transitioning || !canOpenLesson(index)) return;
      const oldCard = $(".ia-course-card", stage);
      if (!oldCard || reducedMotion.matches) {
        renderLesson(index, false);
        return;
      }
      transitioning = true;
      oldCard.classList.add("is-leaving");
      setTimeout(() => {
        renderLesson(index, true);
        transitioning = false;
      }, 180);
    }

    function completeCurrentLesson() {
      const expected = firstIncompleteIndex(course, state);
      if (currentIndex !== expected || isCourseComplete(course, state)) return;

      const lesson = course.lessons[currentIndex];
      state.completed[lesson.id] = new Date().toISOString();

      if (doneCount(course, state) === course.lessons.length) {
        commitActiveTime();
        state.completedAt = new Date().toISOString();
        writeState(course, state);
        showCompletion(true);
        return;
      }

      writeState(course, state);
      updateProgress();
      goTo(currentIndex + 1);
    }

    function showCompletion(animated = false) {
      commitActiveTime();
      if (!state.completedAt)
        state.completedAt = state.completed[course.lessons[course.lessons.length - 1].id] || new Date().toISOString();
      writeState(course, state);

      stage.hidden = true;
      navigation.hidden = true;
      completion.hidden = false;
      clearHash();
      updateProgress();

      completionDate.textContent = formatCompletionDate(state.completedAt);
      completionDuration.textContent = `Course duration: ${formatDuration(state.activeMs)}`;
      nameInput.value = state.certificateName || "";

      if (animated && !reducedMotion.matches) {
        completion.animate(
          [
            { opacity: 0, transform: "translateY(-18px)", filter: "blur(5px)" },
            { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
          ],
          { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      }
      setTimeout(() => completion.querySelector("h1")?.focus?.({ preventScroll: true }), 50);
    }

    async function saveCertificate() {
      if (!isCourseComplete(course, state)) return;

      state.certificateName = nameInput.value.trim().slice(0, 80);
      writeState(course, state);

      if (document.fonts?.ready) {
        try { await document.fonts.ready; } catch (_) {}
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
      grad.addColorStop(0, "#08090b");
      grad.addColorStop(.55, "#111820");
      grad.addColorStop(1, "#071019");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      const glow = ctx.createRadialGradient(1250, 100, 20, 1250, 100, 650);
      glow.addColorStop(0, "rgba(10,132,255,.28)");
      glow.addColorStop(1, "rgba(10,132,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.strokeStyle = "rgba(109,231,255,.42)";
      ctx.lineWidth = 3;
      ctx.strokeRect(70, 70, 1460, 860);

      ctx.textAlign = "center";
      ctx.fillStyle = "#6de7ff";
      ctx.font = "900 28px Sora, Arial, sans-serif";
      ctx.fillText("FREQTIK · IMPULSE ANVIL", 800, 165);

      ctx.fillStyle = "#f7f9fc";
      ctx.font = "900 72px Sora, Arial, sans-serif";
      ctx.fillText("BASICS COURSE", 800, 275);

      ctx.fillStyle = "#9aabb5";
      ctx.font = "700 25px Sora, Arial, sans-serif";
      ctx.fillText("CERTIFICATE OF COMPLETION", 800, 330);

      if (state.certificateName) {
        ctx.fillStyle = "#dbe5ea";
        ctx.font = "500 26px Sora, Arial, sans-serif";
        ctx.fillText("Completed by", 800, 430);
        ctx.fillStyle = "#ffffff";
        ctx.font = "800 48px Sora, Arial, sans-serif";
        ctx.fillText(state.certificateName, 800, 492);
      }

      const stampY = state.certificateName ? 610 : 515;
      ctx.strokeStyle = "rgba(109,231,255,.72)";
      ctx.lineWidth = 2;
      ctx.strokeRect(530, stampY - 52, 540, 92);
      ctx.fillStyle = "#e4fbff";
      ctx.font = "950 40px Sora, Arial, sans-serif";
      ctx.fillText("ANVIL OPERATOR", 800, stampY + 7);

      ctx.fillStyle = "#c8d2d8";
      ctx.font = "600 25px Sora, Arial, sans-serif";
      ctx.fillText(`Completed all ${course.lessons.length} hands-on lessons`, 800, stampY + 100);

      ctx.fillStyle = "#8d9ba4";
      ctx.font = "500 22px Sora, Arial, sans-serif";
      ctx.fillText(formatCompletionDate(state.completedAt), 800, stampY + 165);
      ctx.fillText(`Course duration: ${formatDuration(state.activeMs)}`, 800, stampY + 205);

      ctx.fillStyle = "#65747e";
      ctx.font = "500 18px Sora, Arial, sans-serif";
      ctx.fillText("SELF-GUIDED COURSE COMPLETION · FREQTIK.COM", 800, 875);

      const stamp = safeDate(state.completedAt) || new Date();
      const dateName = stamp.toISOString().slice(0, 10);
      const filename = `Impulse_Anvil_Basics_Certificate_${dateName}.png`;

      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    }

    function restartCourse() {
      if (!window.confirm("Restart the Impulse Anvil Basics Course from lesson A01? This clears the local course progress on this device.")) return;
      commitActiveTime();
      state = {
        completed: {},
        startedAt: new Date().toISOString(),
        activeMs: 0,
        completedAt: null,
        certificateName: state.certificateName || ""
      };
      writeState(course, state);
      completion.hidden = true;
      stage.hidden = false;
      navigation.hidden = false;
      currentIndex = 0;
      renderLesson(0, true);
      beginActiveTime();
    }

    overviewButton.addEventListener("click", () => {
      renderOverview();
      if (typeof overview.showModal === "function") overview.showModal();
      else overview.setAttribute("open", "");
    });
    overviewClose.addEventListener("click", () => overview.close());
    overview.addEventListener("click", event => {
      if (event.target === overview) overview.close();
    });

    reviewButton.addEventListener("click", () => {
      renderOverview();
      overview.showModal();
    });
    restartButton.addEventListener("click", restartCourse);
    certificateSave.addEventListener("click", saveCertificate);
    nameInput.addEventListener("change", () => {
      state.certificateName = nameInput.value.trim().slice(0, 80);
      writeState(course, state);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") commitActiveTime();
      else beginActiveTime();
    });
    window.addEventListener("pagehide", commitActiveTime);

    state = sanitizeState(state, course);
    writeState(course, state);
    updateProgress();

    if (isCourseComplete(course, state) && !location.hash) {
      showCompletion(false);
    } else {
      currentIndex = chooseInitialIndex();
      renderLesson(currentIndex, false);
      beginActiveTime();
    }

    return true;
  }

  async function boot() {
    try {
      const course = await loadCourse();
      const lobby = await initLobby(course);
      const app = initApp(course);
      if (!lobby && !app) return;
    } catch (error) {
      console.error("Impulse Anvil Basics Course:", error);
      const errorBox = $("[data-course-error]");
      if (errorBox) errorBox.hidden = false;
      const stage = $("[data-course-stage]");
      if (stage) stage.hidden = true;
      const nav = $("[data-course-navigation]");
      if (nav) nav.hidden = true;
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else
    boot();
})();
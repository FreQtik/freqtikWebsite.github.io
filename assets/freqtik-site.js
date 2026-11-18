
    "use strict";

    /** steam app IDs (immutable) */
    const STEAM_IDS = Object.freeze({ ltb:2789890, aim:3666950 });

    const IMPULSE_ANVIL_DOWNLOAD = "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.125/ImpulseAnvil_Freeware_v1.0.125_Windows_VST3.zip";
const DISCORD_INVITE_URL = 'https://discord.gg/qUetz23QPq';
    const CONTRAST_RULES_PDF_URL = 'https://freqtik.com/assets/contrast_rules_for_producers1.3.pdf';
    const CONTRAST_RULES_PDF_DOWNLOAD = 'https://github.com/FreQtik/free-tools/releases/download/contrast-rules-for-producers-v1.3/contrast_rules_for_producers1.3.pdf';
    const MASTER_DESKTOP_TAP_DOWNLOAD = 'https://github.com/FreQtik/free-tools/releases/download/master-desktop-tap-v0.4.4/MasterDesktopTap_v0.4.4_Windows.zip';
    const MASTER_DESKTOP_TAP_IMAGE = 'assets/master-desktop-tap/master-desktop-tap-ui.png';
    const MASTER_DESKTOP_TAP_VERSION = '0.4.4';
    const DISCORD_ICON = '<svg class="ia-discord-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3l-.2.4c1.7.5 2.5 1.2 2.5 1.2a15.8 15.8 0 0 0-5.8-1.8 15.8 15.8 0 0 0-5.8 1.8s.8-.7 2.6-1.2L8.5 3a19.6 19.6 0 0 0-4.8 1.4C.7 8.8-.1 13.1.3 17.3A19.8 19.8 0 0 0 6.2 20l.7-1.1c-1.3-.4-2.5-1.1-3.5-2 .3.2.6.4.9.6 3.6 2 8.4 2.6 13.7 0 .3-.2.6-.4.9-.6-1 .9-2.2 1.6-3.5 2l.7 1.1a19.8 19.8 0 0 0 5.9-2.7c.5-4.8-.8-9-1.7-12.9ZM8.1 14.7c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Zm7.8 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Z"></path></svg>';
    const IMPULSE_SUITE_DOWNLOAD = IMPULSE_ANVIL_DOWNLOAD; const introEl   = document.getElementById('intro');
    const headerEl  = document.getElementById('mainHeader');
    const toggleBtn = document.getElementById('menuToggle');
    const mainEl    = document.getElementById('mainContent');

    let lastY = window.scrollY;

    /* Dropdown helpers */
    function toggleDropdown(btn) {
      const li = btn.parentElement;
      if (!li) return;
      const isOpen = li.classList.toggle('dropdown-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      document.querySelectorAll('nav .dropdown').forEach(d => {
        if (d !== li) {
          d.classList.remove('dropdown-open');
          const b = d.querySelector('button');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    }
    function closeDropdowns() {
      document.querySelectorAll('nav .dropdown').forEach(d => {
        d.classList.remove('dropdown-open');
        const b = d.querySelector('button');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    function mainNavKeyForFeed(feed) {
      const productFeeds = ['anvil', 'impulse', 'forge', 'smith', 'desktopTap'];
      const aboutFeeds = ['about', 'ltb', 'aim', 'microgame', 'youtube', 'frameworks'];

      if (productFeeds.includes(feed)) return 'anvil';
      if (feed === 'downloads') return 'downloads';
      if (feed === 'docs') return 'docs';
      if (feed === 'socials') return 'socials';
      if (aboutFeeds.includes(feed)) return 'about';
      return null;
    }

    function updateMainNavState(feed) {
      const activeKey = mainNavKeyForFeed(feed || 'anvil');
      document.querySelectorAll('[data-main-nav]').forEach(item => {
        const isActive = !!activeKey && item.getAttribute('data-main-nav') === activeKey;
        item.classList.toggle('is-current', isActive);
        if (isActive) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    }

    /* Close dropdowns outside the control, with Escape, or after layout changes. */
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('nav .dropdown')) {
        closeDropdowns();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openButton = document.querySelector('nav .dropdown-open > button');
      closeDropdowns();
      if (openButton) openButton.focus();
    });
    window.addEventListener('resize', closeDropdowns, { passive:true });

    /* Tiny util */
    function escapeHtml(str){
      return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'","&#39;");
    }

    /* Product building blocks (with image support) */
    function initAutoSlides() {
      const sliders = mainEl.querySelectorAll('.anvil-slides');

      sliders.forEach(slidesEl => {
        if (!slidesEl || slidesEl.dataset.scrollInit === '1')
          return;

        slidesEl.dataset.scrollInit = '1';

        const isMobile = window.matchMedia('(max-width: 900px)').matches;
        const cards = Array.from(slidesEl.children);
        if (!cards.length) return;

        const dotsContainer = slidesEl.previousElementSibling;
        const dots = dotsContainer && dotsContainer.classList.contains('anvil-dots')
          ? Array.from(dotsContainer.querySelectorAll('.anvil-dot'))
          : [];

        let currentIdx = 0;           // which slide is "active"
        const state = {
          pos: slidesEl.scrollLeft || 0,
          speed: 0.25,
          auto: !isMobile,            // auto-scroll only on desktop
          animating: false
        };

        // Helper: mark active dot
        function setActiveDot(index) {
          dots.forEach(dot => {
            const idx = parseInt(dot.dataset.index, 10);
            dot.classList.toggle('is-active', idx === index);
          });
        }

        // Helper: smooth scroll to center a given card index
        function animateScrollToIndex(targetIdx) {
          const card = cards[targetIdx];
          if (!card) return;

          currentIdx = targetIdx;
          setActiveDot(currentIdx);

          const container = slidesEl;
          const containerRect = container.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const startScroll = container.scrollLeft;
          const targetScroll = startScroll +
            (cardRect.left - containerRect.left) -
            (containerRect.width - cardRect.width) / 2;

          const duration = 400;
          const startTime = (window.performance && performance.now()) || Date.now();

          state.animating = true;

          function frame(now) {
            const t = Math.min(1, ((now || Date.now()) - startTime) / duration);
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            container.scrollLeft = startScroll + (targetScroll - startScroll) * eased;

            if (t < 1) {
              requestAnimationFrame(frame);
            } else {
              state.animating = false;
              state.pos = container.scrollLeft; // auto-scroll resumes from here
            }
          }
          requestAnimationFrame(frame);
        }

        /* ------------------- MOBILE / TABLET ------------------- */
        if (isMobile) {
          // Native swipe + scroll-snap, no auto-scroll; support endless tap-through via cards/dots.
          cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
              let targetIdx = idx;
              if (targetIdx === currentIdx) {
                // tapping same card again -> go to next in a loop
                targetIdx = (targetIdx + 1) % cards.length;
              }
              animateScrollToIndex(targetIdx);
            });
          });

          dots.forEach(dot => {
            dot.addEventListener('click', () => {
              const idx = parseInt(dot.dataset.index, 10);
              let targetIdx = idx;
              if (targetIdx === currentIdx) {
                targetIdx = (targetIdx + 1) % cards.length;
              }
              animateScrollToIndex(targetIdx);
            });
          });

          setActiveDot(0);
          return; // no JS auto-scroll on mobile
        }

        /* ------------------- DESKTOP ------------------- */

        // Click card: center it (first click), then loop to next if you keep clicking it
        cards.forEach((card, idx) => {
          card.addEventListener('click', () => {
            let targetIdx = idx;
            if (targetIdx === currentIdx) {
              targetIdx = (targetIdx + 1) % cards.length;
            }
            state.auto = false;
            animateScrollToIndex(targetIdx);
          });
        });

        // Click dot: same endless-loop behaviour
        dots.forEach(dot => {
          dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.index, 10);
            let targetIdx = idx;
            if (targetIdx === currentIdx) {
              targetIdx = (targetIdx + 1) % cards.length;
            }
            state.auto = false;
            animateScrollToIndex(targetIdx);
          });
        });

        // Hover: pause auto-scroll; leaving: resume from *current* position
        slidesEl.addEventListener('mouseenter', () => {
          state.auto = false;
        });
        slidesEl.addEventListener('mouseleave', () => {
          state.auto = true;
        });

        // No wheel handler: do not hijack vertical scroll.

        function step() {
          if (!document.body.contains(slidesEl)) return;

          if (state.animating) {
            // Let the animation control scrollLeft; keep pos in sync
            state.pos = slidesEl.scrollLeft;
          } else if (state.auto) {
            // Gentle auto-scroll, starting from last position
            state.pos += state.speed;
            const maxScroll = slidesEl.scrollWidth - slidesEl.clientWidth;
            if (state.pos > maxScroll + 20) {
              state.pos = 0;
            }
            slidesEl.scrollLeft = state.pos;
          } else {
            // Auto paused: keep our pos in sync with manual movement
            state.pos = slidesEl.scrollLeft;
          }

          requestAnimationFrame(step);
        }

        // Initialize dots and start auto-scroll
        setActiveDot(0);
        requestAnimationFrame(step);
      });
    }




        /* IMPULSE ANVIL – ANATOMY HIGHLIGHTING */

    const anatomyFeatureMap = {
      global:  { top:0.03, left:0.02, width:0.36, height:0.30 },  // top-left: bypass, wet, normalize, levels
      ira:     { top:0.24, left:0.03, width:0.40, height:0.70 },  // left IR A panel
      irb:     { top:0.21, left:0.58, width:0.40, height:0.73 },  // right IR B panel
      morph:   { top:0.16, left:0.32, width:0.34, height:0.70 },  // central morph module
      fractal: { top:0.63, left:0.03, width:0.94, height:0.32 }   // bottom color/fractal rows
    };

    const anatomyLayoutMap = {
      global:{ shift:0 },
      ira:   { shift:-24 },
      irb:   { shift:24 },
      morph: { shift:0 },
      fractal:{ shift:0 }
    };

            function updateAnatomyHighlight(featureKey){
      const anatomy = mainEl.querySelector('.plugin-anatomy');
      if (!anatomy) return;

      const area = anatomyFeatureMap[featureKey];
      if (!area) return;

      const wrap     = anatomy.querySelector('.plugin-anatomy__image-wrap');
      const inner    = anatomy.querySelector('.plugin-anatomy__image-inner');
      const focusImg = anatomy.querySelector('.plugin-anatomy__img--focus');
      const box      = anatomy.querySelector('.plugin-anatomy__focus-box');
      const line     = anatomy.querySelector('.plugin-anatomy__focus-line');

      if (!wrap || !inner || !focusImg || !box || !line) return;

      const isMobile = window.matchMedia('(max-width: 900px)').matches;

      const layout = anatomyLayoutMap[featureKey] || { shift:0 };
      if (isMobile) {
        // Mobile: keep plugin centered, no side movement
        inner.style.transform = 'translateX(0px)';
      } else {
        // Desktop: gently shift plugin left/right per feature
        inner.style.transform = `translateX(${layout.shift}px)`;
      }

      const innerRect = inner.getBoundingClientRect();
      const wrapRect  = wrap.getBoundingClientRect();

      const x = innerRect.width  * area.left;
      const y = innerRect.height * area.top;
      const w = innerRect.width  * area.width;
      const h = innerRect.height * area.height;

      const topInset    = 100 * area.top;
      const rightInset  = 100 * (1 - area.left - area.width);
      const bottomInset = 100 * (1 - area.top  - area.height);
      const leftInset   = 100 * area.left;
      focusImg.style.clipPath = `inset(${topInset}% ${rightInset}% ${bottomInset}% ${leftInset}%)`;

      box.style.left   = `${x}px`;
      box.style.top    = `${y}px`;
      box.style.width  = `${w}px`;
      box.style.height = `${h}px`;

      let startX, startY, endX, endY;

      if (isMobile) {
        // MOBILE:
        // Use the real box position so the line always starts exactly at the highlighted area.
        const boxRect  = box.getBoundingClientRect();

        // Start at bottom-center of the highlight box (in wrap coordinates)
        startX = boxRect.left - wrapRect.left + boxRect.width / 2;
        startY = boxRect.bottom - wrapRect.top;

        // Short vertical pointer downwards toward the text
        endX   = startX;
        endY   = startY + 32; // adjust length if you want longer/shorter pointer
      } else {
        // DESKTOP:
        // Line from right edge of highlight into the text column
        startX = innerRect.left - wrapRect.left + x + w + 6;
        startY = innerRect.top  - wrapRect.top + y + h/2;
        endX   = wrapRect.width + 40; // 40px into the text column
        endY   = startY;
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx*dx + dy*dy);
      const angle  = Math.atan2(dy, dx) * 180 / Math.PI;

      line.style.left  = `${startX}px`;
      line.style.top   = `${startY}px`;
      line.style.width = `${length}px`;
      line.style.transform = `rotate(${angle}deg)`;
    }



                    function initAnatomy(){
      const anatomy = mainEl.querySelector('.plugin-anatomy');
      if (!anatomy) return;

      const steps = Array.from(anatomy.querySelectorAll('.anatomy-step'));
      if (!steps.length) return;

      const bandRoot = anatomy.closest('.anatomy-band') || anatomy;
      const dots  = Array.from(bandRoot.querySelectorAll('.plugin-anatomy__dot'));
      const stepsContainer = anatomy.querySelector('.plugin-anatomy__steps');

      const featureOrder = ['global','ira','irb','morph','fractal'];
      let currentIndex = 0;

      const isMobile = window.matchMedia('(max-width: 900px)').matches;

      // Throttle for all step-like gestures (wheel, swipe, keys)
      const STEP_DELAY = 350; // ms
      let lastStepTime = 0;
      function canStep(){
        const now = (window.performance && performance.now) ? performance.now() : Date.now();
        if (now - lastStepTime < STEP_DELAY) return false;
        lastStepTime = now;
        return true;
      }

      // Clear any previous timer (if user switched sections)
      if (window.__anatomyTimer) {
        clearInterval(window.__anatomyTimer);
        window.__anatomyTimer = null;
      }

      function setActiveByIndex(idx) {
        if (idx < 0 || idx >= featureOrder.length) return;
        currentIndex = idx;
        const feature = featureOrder[currentIndex];

        let activeStep = null;
        steps.forEach(step => {
          const on = step.getAttribute('data-feature') === feature;
          step.classList.toggle('is-active', on);
          if (on) activeStep = step;
        });

        dots.forEach(dot => {
          const on = dot.getAttribute('data-target') === feature;
          dot.classList.toggle('is-active', on);
        });

        if (activeStep && stepsContainer) {
          // Desktop uses fixed-height container; on mobile height:auto !important
          stepsContainer.style.height = activeStep.offsetHeight + 'px';
          requestAnimationFrame(() => {
            stepsContainer.style.height = activeStep.offsetHeight + 'px';
          });
        }

        updateAnatomyHighlight(feature);
      }

      function restartTimer() {
        if (!isMobile) return; // auto-advance only on mobile
        if (window.__anatomyTimer) {
          clearInterval(window.__anatomyTimer);
        }
        window.__anatomyTimer = setInterval(() => {
          const nextIdx = (currentIndex + 1) % featureOrder.length;
          setActiveByIndex(nextIdx);
        }, 12000); // ~12 seconds per feature
      }

      // Dots: jump directly to a feature (no heavy throttle needed)
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const feature = dot.getAttribute('data-target');
          const idx = featureOrder.indexOf(feature);
          if (idx !== -1) {
            setActiveByIndex(idx);
            restartTimer();
          }
        });
      });

      // Wheel inside the anatomy band: step through features on desktop
      const band = bandRoot;
      band.addEventListener('wheel', (ev) => {
        const delta = ev.deltaY || ev.detail || 0;
        if (!delta) return;

        const atFirst = currentIndex === 0;
        const atLast  = currentIndex === featureOrder.length - 1;

        if (delta > 0 && !atLast) {
          if (!canStep()) { ev.preventDefault(); return; }
          ev.preventDefault();
          setActiveByIndex(currentIndex + 1);
          restartTimer();
        } else if (delta < 0 && !atFirst) {
          if (!canStep()) { ev.preventDefault(); return; }
          ev.preventDefault();
          setActiveByIndex(currentIndex - 1);
          restartTimer();
        } else {
          // At edges: let normal page scroll continue
        }
      }, { passive:false });

      // Mobile swipe: swipe left/right to move features, throttled
      if (isMobile) {
        let touchStartX = null;
        let touchStartY = null;

        band.addEventListener('touchstart', (ev) => {
          const t = ev.touches[0];
          touchStartX = t.clientX;
          touchStartY = t.clientY;
        }, { passive:true });

        band.addEventListener('touchend', (ev) => {
          if (touchStartX == null || touchStartY == null) return;
          const t = ev.changedTouches[0];
          const dx = t.clientX - touchStartX;
          const dy = t.clientY - touchStartY;
          touchStartX = touchStartY = null;

          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (!canStep()) return;

            if (dx < 0 && currentIndex < featureOrder.length - 1) {
              setActiveByIndex(currentIndex + 1);
            } else if (dx > 0 && currentIndex > 0) {
              setActiveByIndex(currentIndex - 1);
            }
            restartTimer();
          }
        }, { passive:true });
      }

      // Optional keyboard nav (also throttled)
      band.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowDown') {
          if (currentIndex < featureOrder.length - 1 && canStep()) {
            ev.preventDefault();
            setActiveByIndex(currentIndex + 1);
            restartTimer();
          }
        } else if (ev.key === 'ArrowUp') {
          if (currentIndex > 0 && canStep()) {
            ev.preventDefault();
            setActiveByIndex(currentIndex - 1);
            restartTimer();
          }
        }
      });

      // Initialise: first card & first dot, plugin aligned
      setActiveByIndex(0);
      restartTimer();

      // Keep highlight & height aligned on resize
      window.addEventListener('resize', () => {
        const feature = featureOrder[currentIndex];
        setActiveByIndex(currentIndex);
        updateAnatomyHighlight(feature);
      }, { passive:true });
    }




    function initImpulseAnvilLanding(){
      const root = mainEl.querySelector('.ia26');
      if (!root) return;
      root.querySelectorAll('a[href^="#ia-"]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
          const target = root.querySelector(anchor.getAttribute('href')) || document.querySelector(anchor.getAttribute('href'));
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior:'smooth', block:'start' });
          }
        });
      });
    }


    /* SoundCloud-style waveform audio players for the dry/wet demo section */
    let __iaAudioResizeBound = false;
    function initImpulseAudioPlayers(){
      const players = Array.from(mainEl.querySelectorAll('.ia-wave-player'));
      if (!players.length) return;

      function fmt(seconds){
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${String(s).padStart(2,'0')}`;
      }

      function drawWave(player){
        const canvas = player.querySelector('.ia-wave-canvas');
        const audio  = player.querySelector('audio');
        if (!canvas || !audio) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const cssW = Math.max(160, rect.width || 300);
        const cssH = Math.max(44, rect.height || 58);
        const needW = Math.round(cssW * dpr);
        const needH = Math.round(cssH * dpr);
        if (canvas.width !== needW || canvas.height !== needH) {
          canvas.width = needW;
          canvas.height = needH;
        }
        ctx.setTransform(dpr,0,0,dpr,0,0);
        ctx.clearRect(0,0,cssW,cssH);

        const bars = 88;
        const mid = cssH / 2;
        const peaks = player.__peaks;
        const progress = audio.duration ? Math.max(0, Math.min(1, audio.currentTime / audio.duration)) : 0;
        const barW = Math.max(2, cssW / bars * 0.44);

        for (let i = 0; i < bars; i++) {
          let amp;
          if (peaks && peaks.length) {
            amp = peaks[i] || 0.08;
          } else {
            // Fallback waveform.
            amp = 0.15 + 0.75 * Math.abs(Math.sin((i + 3) * 0.31) * Math.sin((i + 11) * 0.071));
          }
          const x = (i + 0.5) / bars * cssW;
          const h = Math.max(4, amp * cssH * 0.88);
          ctx.lineWidth = barW;
          ctx.lineCap = 'round';
          ctx.strokeStyle = (i / bars <= progress) ? 'rgba(231,252,255,.96)' : 'rgba(46,218,255,.40)';
          ctx.beginPath();
          ctx.moveTo(x, mid - h / 2);
          ctx.lineTo(x, mid + h / 2);
          ctx.stroke();
        }
      }

      async function loadWaveform(player){
        if (player.__waveLoading || player.__peaks) return;
        player.__waveLoading = true;
        const audio = player.querySelector('audio');
        if (!audio || !audio.src || !(window.AudioContext || window.webkitAudioContext)) {
          drawWave(player);
          return;
        }
        try {
          const res = await fetch(audio.src, { cache: 'force-cache' });
          if (!res.ok) throw new Error('Audio not found yet');
          const bytes = await res.arrayBuffer();
          const AC = window.AudioContext || window.webkitAudioContext;
          const ac = new AC();
          const buffer = await ac.decodeAudioData(bytes.slice(0));
          const data = buffer.getChannelData(0);
          const bars = 88;
          const block = Math.max(1, Math.floor(data.length / bars));
          const peaks = [];
          let max = 0;
          for (let i = 0; i < bars; i++) {
            let sum = 0;
            const start = i * block;
            const end = Math.min(data.length, start + block);
            for (let j = start; j < end; j++) sum += Math.abs(data[j]);
            const avg = sum / Math.max(1, end - start);
            peaks.push(avg);
            if (avg > max) max = avg;
          }
          player.__peaks = peaks.map(v => max ? Math.max(0.08, Math.min(1, v / max)) : 0.08);
          if (ac.close) ac.close();
        } catch (err) {
          player.classList.add('is-placeholder');
        } finally {
          drawWave(player);
        }
      }

      players.forEach(player => {
        if (player.dataset.ready === '1') return;
        player.dataset.ready = '1';
        const btn = player.querySelector('.ia-wave-play');
        const audio = player.querySelector('audio');
        const canvas = player.querySelector('.ia-wave-canvas');
        const time = player.querySelector('.ia-wave-time');
        if (!btn || !audio || !canvas || !time) return;

        drawWave(player);
        loadWaveform(player);

        btn.addEventListener('click', async () => {
          try {
            if (audio.paused) {
              mainEl.querySelectorAll('.ia-wave-player audio').forEach(other => { if (other !== audio) other.pause(); });
              await audio.play();
            } else {
              audio.pause();
            }
          } catch (err) {
            player.classList.add('is-placeholder');
          }
        });

        canvas.addEventListener('click', ev => {
          if (!audio.duration) return;
          const rect = canvas.getBoundingClientRect();
          const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
          audio.currentTime = (x / rect.width) * audio.duration;
          drawWave(player);
        });

        audio.addEventListener('play', () => {
          player.classList.add('is-playing');
          btn.textContent = '❚❚';
        });
        audio.addEventListener('pause', () => {
          player.classList.remove('is-playing');
          btn.textContent = '▶';
        });
        audio.addEventListener('ended', () => {
          player.classList.remove('is-playing');
          btn.textContent = '▶';
          audio.currentTime = 0;
          drawWave(player);
        });
        audio.addEventListener('loadedmetadata', () => {
          time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
        });
        audio.addEventListener('timeupdate', () => {
          time.textContent = audio.duration ? `${fmt(audio.currentTime)} / ${fmt(audio.duration)}` : fmt(audio.currentTime);
          drawWave(player);
        });
        audio.addEventListener('error', () => {
          player.classList.add('is-placeholder');
          drawWave(player);
        });
      });

      if (!__iaAudioResizeBound) {
        __iaAudioResizeBound = true;
        window.addEventListener('resize', () => {
          mainEl.querySelectorAll('.ia-wave-player').forEach(drawWave);
        }, { passive:true });
      }
    }

    /* PAGE BUILDS */

    function buildImpulseAll(){
      return buildAnvil();
    }

function buildAnvil(){ return "<div class=\"ia26 ia-free\" id=\"anvil\">\n<section class=\"ia-section ia-hero\"><div class=\"ia-shell ia-free-hero\">\n<div class=\"ia-free-copy\"><span class=\"ia-eyebrow\"><span class=\"ia-pulse\"></span> Impulse-response design · Freeware · v1.0.125</span>\n<h1>Design the response.<br><span class=\"ia-cyan\">Hear the difference.</span></h1>\n<p class=\"ia-lead\">Impulse Anvil is a free impulse-response design effect. Load impulse responses or compatible recordings, reshape and morph them, and hear the result on your track through its built-in convolution engine. Export your designs as reusable WAV impulse responses.</p>\n<div class=\"ia-actions\"><a class=\"ia-btn ia-btn-primary\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.125/ImpulseAnvil_Freeware_v1.0.125_Windows_VST3.zip\" target=\"_blank\" rel=\"noopener noreferrer\">Download Windows VST3</a><a class=\"ia-btn ia-btn-dark\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.125/ImpulseAnvil_Freeware_v1.0.125_Windows_Standalone.zip\" target=\"_blank\" rel=\"noopener noreferrer\">Download Standalone</a></div>\n<p class=\"ia-free-meta\">Windows 10/11 x64 · 127 included factory IRs · Full features · No purchase, activation or account required</p>\n</div><div class=\"ia-free-visual\"><img src=\"/assets/impulse-anvil/v122/IA_01_Master_Overview.webp\" alt=\"Impulse Anvil interface with IR slots, Morph and editing panels\" width=\"1129\" height=\"696\" loading=\"eager\" decoding=\"async\"></div>\n</div></section>\n<section class=\"ia-section\"><div class=\"ia-shell\"><div class=\"ia-section-head\"><div class=\"ia-copy\"><span class=\"ia-kicker\">What it does</span><h2>One response, many possibilities.</h2><p>Use one IR on its own, or prepare A and B to design relationships between two responses. You can listen while you edit—no separate convolution plugin is needed.</p></div></div>\n<div class=\"ia-free-cards\">\n<article><h3>Shape an IR</h3><p>Trim, stretch, reverse and refine response material with Edit, EQ, Color and output controls.</p></article>\n<article><h3>Morph A and B</h3><p>Explore 21 Morph relationships, including time, spectral and residual approaches.</p></article>\n<article><h3>Author movement</h3><p>Use Draw, Path, Glue and Omni to define how two responses interact over time.</p></article>\n<article><h3>Listen and export</h3><p>Audition with internal stereo convolution, save a preset, or Bake a reusable 32-bit float WAV IR.</p></article>\n</div></div></section>\n<section class=\"ia-section ia-free-steps\"><div class=\"ia-shell\"><div class=\"ia-section-head\"><div class=\"ia-copy\"><span class=\"ia-kicker\">How to begin</span><h2>Make your first response.</h2></div></div><div class=\"ia-free-steps-grid\"><p><strong>01 — Insert.</strong> Put the VST3 on a playing track or open the Standalone.</p><p><strong>02 — Load.</strong> Choose one of the 127 included factory IRs, or load compatible material into A. Add B when you want to morph.</p><p><strong>03 — Explore.</strong> Shape the response while listening. Save the setup or Bake the IR when you want the file itself.</p></div><div class=\"ia-actions\"><a class=\"ia-btn ia-btn-dark\" href=\"/docs/impulse-anvil/getting-started/quickstart/\">5-minute quickstart</a><a class=\"ia-btn ia-btn-dark\" href=\"/docs/impulse-anvil/\">Complete documentation</a></div></div></section>\n<section class=\"ia-section ia-free-last\"><div class=\"ia-shell\"><span class=\"ia-kicker\">Free to use</span><h2>No license system. Just sound design.</h2><p>Impulse Anvil v1.0.125 runs without activation or license checks. Existing Cubase projects using the older commercial VST3 can generally load with the same plug-in identity; back up projects and the previous plug-in before upgrading. Known limitations and installation steps are listed in the documentation and release notes.</p><div class=\"ia-actions\"><a class=\"ia-btn ia-btn-primary\" href=\"/downloads.html\">Downloads and release notes</a><a class=\"ia-btn ia-btn-dark\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.125\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub release</a></div></div></section>\n</div>"; }

function buildMasterDesktopTap(){
      return `
      <div class="ia26 ia-desktop-tap-page" id="desktopTap">
        <div class="ia-mini-nav ia-tool-mini-nav" aria-label="Master Desktop Tap navigation">
          <div class="ia-mini-nav-inner">
            <a class="ia-mini-brand" href="#" onclick="iaScrollTo('desktopTap'); return false;"><span class="ia-mark"><img class="ia-brand-img" src="assets/tinylogoQ.png" alt=""></span><span><strong>FREQTIK</strong><span>Free Beta Tool</span></span></a>
            <div class="ia-mini-links"><a href="#" onclick="iaScrollTo('desktopTap-solve'); return false;">What it solves</a><a href="#" onclick="iaScrollTo('desktopTap-setup'); return false;">How to use</a><a class="ia-nav-important ia-btn ia-btn-small ia-btn-primary" href="${MASTER_DESKTOP_TAP_DOWNLOAD}" target="_blank" rel="noopener">Download Free Beta</a></div>
          </div>
        </div>

        <section class="ia-section ia-hero">
          <div class="ia-shell ia-hero-grid">
            <div class="ia-hero-copy">
              <span class="ia-eyebrow"><span class="ia-pulse"></span> Free beta utility · Windows VST3</span>
              <h1>Stream your DAW audio <span class="ia-cyan">on Windows.</span></h1>
              <p class="ia-lead">When your DAW is audible, but your stream hears nothing. Master Desktop Tap is a free beta utility for producers who want Discord, OBS or screen share to hear the DAW output on Windows.</p>
              <div class="ia-actions">
                <a class="ia-btn ia-btn-primary ia-hero-buy" href="${MASTER_DESKTOP_TAP_DOWNLOAD}" target="_blank" rel="noopener">Download Free Beta</a>
                <a class="ia-btn" href="#" onclick="iaScrollTo('desktopTap-setup'); return false;">Quick setup</a>
                <a class="ia-btn ia-btn-dark" href="/">Impulse Anvil</a>
              </div>
              <div class="ia-hero-note" aria-label="Master Desktop Tap highlights">
                <span>Windows VST3</span>
                <span>Free beta</span>
                <span>DAW → stream audio</span>
                <span>Discord / OBS / screen share</span>
                <span>No built-in session timer</span>
              </div>
              <p class="ia-note">Free beta utility. No built-in session timer. Test your routing before relying on it for a live stream, call or recording session.</p>
            </div>
            <div class="ia-product-card" aria-label="Master Desktop Tap interface preview">
              <div class="ia-product-window">
                <img src="${MASTER_DESKTOP_TAP_IMAGE}" alt="Master Desktop Tap plugin interface" loading="eager">
              </div>
              <div class="ia-float-card">
                <b>DAW → Stream</b>
                <p>Place it on your master and send your DAW output to the audio route your streaming app can hear.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="ia-section" id="desktopTap-solve">
          <div class="ia-shell">
            <div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">What it solves</span><h2>When your DAW is audible, but your stream hears nothing.</h2><p>Some Windows DAW setups play perfectly in your headphones, while Discord, OBS or screen share still receives silence. Master Desktop Tap is a small free beta tool that helps route your DAW master to the stream, without adding a session-time limit.</p></div></div>
            <div class="ia-grid ia-grid-three">
              <article class="ia-card"><div class="ia-number">1</div><h3>For Discord calls</h3><p>Let someone hear your Cubase, Ableton, FL Studio or other DAW while you keep working in your normal session.</p></article>
              <article class="ia-card"><div class="ia-number">2</div><h3>For OBS and capture</h3><p>Make DAW audio available to the app recording or streaming your screen, instead of fighting silent captures.</p></article>
              <article class="ia-card"><div class="ia-number">3</div><h3>Free beta, no timer</h3><p>Built to solve the routing problem directly, without a built-in session-time limit.</p></article>
            </div>
          </div>
        </section>

        <section class="ia-section" id="desktopTap-setup">
          <div class="ia-shell">
            <div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Quick setup</span><h2>Put it last on your master. Choose the stream output. Test.</h2><p>The goal is not to rebuild your whole Windows audio routing. Keep it simple and verify the signal before you go live.</p></div></div>
            <div class="ia-flow-strip">
              <div class="ia-flow-step"><b>01 · Install</b><p>Extract the ZIP and copy the complete <code>Master Desktop Tap.vst3</code> folder into your Windows VST3 folder.</p></div>
              <div class="ia-flow-step"><b>02 · Insert</b><p>Load Master Desktop Tap as the last insert on your DAW master channel.</p></div>
              <div class="ia-flow-step"><b>03 · Select</b><p>Choose the Windows output device your streaming app, capture app or screen share can hear.</p></div>
              <div class="ia-flow-step"><b>04 · Level</b><p>Start with Stream Gain low, then raise it until the receiving app gets a clean level.</p></div>
              <div class="ia-flow-step"><b>05 · Test</b><p>Open Discord, OBS or your screen share and confirm the DAW is actually arriving before the session starts.</p></div>
            </div>
            <div class="ia-grid ia-grid-two" style="margin-top:16px">
              <article class="ia-card ia-doc-tip"><h3>If you hear the DAW twice</h3><p>Use the plugin's mute option or adjust your monitoring route. The clean setup is one sound in your headphones and one controlled copy to the stream.</p></article>
              <article class="ia-card"><h3>Free beta note</h3><p>Master Desktop Tap is provided free because this routing problem is common and annoying. It has no built-in session timer, but you should still test it with your own DAW, interface and streaming app.</p></article>
            </div>
            <div class="ia-actions" style="margin-top:22px"><a class="ia-btn ia-btn-primary" href="${MASTER_DESKTOP_TAP_DOWNLOAD}" target="_blank" rel="noopener">Download Master Desktop Tap v${MASTER_DESKTOP_TAP_VERSION}</a><a class="ia-btn ia-btn-dark" href="/">Back to Impulse Anvil</a></div>
          </div>
        </section>
      </div>`;
    }

    function buildProducerFrameworks(){
      return `
      <div class="ia26" id="frameworks">
        <div class="ia-mini-nav" aria-label="Producer frameworks navigation">
          <div class="ia-mini-nav-inner">
            <a class="ia-mini-brand" href="#" onclick="iaScrollTo('frameworks'); return false;"><span class="ia-mark"><img class="ia-brand-img" src="assets/tinylogoQ.png" alt=""></span><span><strong>FREQTIK</strong><span>Producer Frameworks</span></span></a>
            <div class="ia-mini-links"><a href="#" onclick="iaScrollTo('framework-overview'); return false;">Overview</a><a href="#" onclick="iaScrollTo('framework-method'); return false;">Method</a><a href="#" onclick="iaScrollTo('framework-download'); return false;">PDF</a><a class="ia-nav-important ia-btn ia-btn-small ia-btn-primary" href="${CONTRAST_RULES_PDF_URL}" target="_blank" rel="noopener">Open PDF</a></div>
          </div>
        </div>

        <section class="ia-section ia-hero" id="framework-overview">
          <div class="ia-shell ia-hero-grid">
            <div>
              <span class="ia-eyebrow"><span class="ia-pulse"></span> Producer framework · PDF</span>
              <h1>Contrast Rules <span class="ia-cyan">for Producers.</span></h1>
              <p class="ia-lead">A FreQtik guide about context, contrast, attention and impact in arrangement, sound design and production decisions.</p>
              <div class="ia-actions"><a class="ia-btn ia-btn-primary ia-hero-buy" href="https://freqtik.com/assets/contrast_rules_for_producers1.3.pdf" target="_blank" rel="noopener">Open PDF</a><a class="ia-btn ia-btn-dark" href="${CONTRAST_RULES_PDF_DOWNLOAD}" target="_blank" rel="noopener">Download PDF</a><a class="ia-btn" href="/about.html">Back to About</a></div>
              <div class="ia-hero-note" aria-label="Contrast Rules highlights"><span>18-page PDF</span><span>Arrangement thinking</span><span>Sound-design decisions</span><span>Context → contrast → attention → impact</span></div>
              <p class="ia-note">This is a producer framework, not Impulse Anvil product documentation. It lives under FreQtik because it is about production thinking, perception and musical decision-making.</p>
            </div>
            <div class="ia-card" id="framework-download">
              <span class="ia-tag">Free guide</span>
              <h3>Contrast Rules for Producers</h3>
              <p>A practical framework for making musical moments feel cleaner, fresher, wider, heavier, clearer and more intentional by designing the context around them.</p>
              <div class="ia-formula">context → contrast → attention → impact</div>
              <ul class="ia-list">
                <li>Target and shadow</li>
                <li>Contrast axes and intervals</li>
                <li>Mutation, punctuation and progression</li>
                <li>Listener perspective and detail layers</li>
              </ul>
              <div class="ia-actions"><a class="ia-btn ia-btn-primary" href="${CONTRAST_RULES_PDF_URL}" target="_blank" rel="noopener">Read the PDF</a><a class="ia-btn ia-btn-dark" href="${CONTRAST_RULES_PDF_DOWNLOAD}" target="_blank" rel="noopener">Download</a></div>
            </div>
          </div>
        </section>

        <section class="ia-section" id="framework-method">
          <div class="ia-shell">
            <div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Why it belongs here</span><h2>Production depth without interrupting the plugin page.</h2><p>The guide sits separately from Impulse Anvil sales and setup pages, while still showing FreQtik's wider approach to music production, perception, arrangement and sound design.</p></div></div>
            <div class="ia-grid ia-grid-three">
              <article class="ia-card"><div class="ia-number">1</div><h3>Context</h3><p>The current moment is judged through what came before it and what surrounds it.</p></article>
              <article class="ia-card"><div class="ia-number">2</div><h3>Contrast</h3><p>A target can feel stronger when the arrangement briefly prepares the opposite or weaker state.</p></article>
              <article class="ia-card"><div class="ia-number">3</div><h3>Impact</h3><p>Release from contrast can make a return feel cleaner, heavier, wider, closer or more focused.</p></article>
            </div>
          </div>
        </section>
      </div>`;
    }

    // Docs & FAQ page
    function buildDocs(){ return `<div class="ia26"><section class="ia-section ia-hero"><div class="ia-shell"><span class="ia-eyebrow"><span class="ia-pulse"></span> Impulse Anvil documentation</span><h1>The manual has moved.</h1><p class="ia-lead">Read the current v1.0.125 freeware documentation.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/">Open documentation</a></div></div></section></div>`; }
    function buildAnvilDownloads(){ return "<div class=\"ia26 ia-free\" id=\"downloads\"><section class=\"ia-section ia-hero\"><div class=\"ia-shell\"><span class=\"ia-eyebrow\"><span class=\"ia-pulse\"></span> Impulse Anvil · v1.0.125 · Windows x64</span><h1>Download <span class=\"ia-cyan\">Impulse Anvil.</span></h1><p class=\"ia-lead\">The full impulse-response design effect is freeware. No purchase, demo limits, activation, license key or account required. Both Windows downloads include 127 factory IRs.</p><div class=\"ia-actions\"><a class=\"ia-btn ia-btn-primary\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.125/ImpulseAnvil_Freeware_v1.0.125_Windows_VST3.zip\" target=\"_blank\" rel=\"noopener noreferrer\">Download VST3 ZIP</a><a class=\"ia-btn ia-btn-dark\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.125/ImpulseAnvil_Freeware_v1.0.125_Windows_Standalone.zip\" target=\"_blank\" rel=\"noopener noreferrer\">Download Standalone ZIP</a></div><p class=\"ia-free-meta\">Windows 10/11 (64-bit) · Full feature set · Built-in convolution · WAV IR export</p></div></section>\n<section class=\"ia-section\"><div class=\"ia-shell\"><div class=\"ia-section-head\"><div class=\"ia-copy\"><span class=\"ia-kicker\">Installation</span><h2>Extract, install, create.</h2></div></div><div class=\"ia-free-steps-grid\"><p><strong>VST3:</strong> Close your DAW. Extract the full ZIP and copy the complete <code>Impulse Anvil.vst3</code> folder to <code>C:\\Program Files\\Common Files\\VST3\\</code>. Rescan in your DAW.</p><p><strong>Standalone:</strong> Extract the whole ZIP, keeping its Resources folder with the executable. Launch the application; no host or license is required.</p><p><strong>Upgrading:</strong> Back up the old VST3 and important DAW projects. Keep externally loaded IRs at their saved paths and test an existing project copy before replacing a working setup.</p></div><div class=\"ia-actions\"><a class=\"ia-btn ia-btn-dark\" href=\"/docs/impulse-anvil/getting-started/install-activate/\">Detailed installation guide</a><a class=\"ia-btn ia-btn-dark\" href=\"/docs/impulse-anvil/faq/\">FAQ</a></div></div></section>\n<section class=\"ia-section\"><div class=\"ia-shell\"><div class=\"ia-section-head\"><div class=\"ia-copy\"><span class=\"ia-kicker\">Release notes</span><h2>v1.0.125 — Freeware.</h2><p>Full functionality without licensing or demo restrictions; 127 included factory IRs; existing VST3 identity preserved for project compatibility.</p></div></div><div class=\"ia-free-steps-grid\"><p><strong>Freeware conversion.</strong> Removes purchase, activation and license-server dependencies in the Windows build.</p><p><strong>Editing and history.</strong> Includes accepted Init Undo/Redo, Color history and Solo/Morph history corrections.</p><p><strong>Limits.</strong> External editor-closed Morph generation (A07/C05), certain Omni lifecycle cases and seamless prior-IR tails remain unresolved.</p></div><div class=\"ia-actions\"><a class=\"ia-btn ia-btn-dark\" href=\"/IMPULSE_ANVIL_CHANGELOG.md\">Full patchlog</a><a class=\"ia-btn ia-btn-dark\" href=\"https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.125\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub release / checksums</a></div></div></section>\n<section class=\"ia-section\"><div class=\"ia-shell\"><span class=\"ia-kicker\">Other platforms</span><h2>Windows is the current freeware release.</h2><p>Older v1.0.124 macOS testing packages were separate unsigned and unnotarized builds under the previous license/demo model. They are <strong>not</strong> v1.0.125 freeware; see historical releases for archival information. A current macOS freeware binary is not provided here.</p></div></section>\n</div>"; }

function iaScrollTo(id){
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior:'smooth', block:'start' });
      return false;
    }


    function initImpulseThemeGallery(){
      const galleries = Array.from(mainEl.querySelectorAll('[data-ia-theme-gallery]'));
      galleries.forEach(gallery => {
        if (gallery.dataset.themeReady === '1') return;
        gallery.dataset.themeReady = '1';

        const main = gallery.querySelector('[data-ia-theme-main]');
        const title = gallery.querySelector('[data-ia-theme-title]');
        const desc = gallery.querySelector('[data-ia-theme-desc]');
        const thumbs = Array.from(gallery.querySelectorAll('.ia-theme-thumb'));
        if (!main || !thumbs.length) return;

        let active = Math.max(0, thumbs.findIndex(btn => btn.classList.contains('is-active')));
        let hovering = false;

        function setActive(index){
          const btn = thumbs[index];
          if (!btn) return;
          active = index;
          thumbs.forEach(t => t.classList.toggle('is-active', t === btn));
          const src = btn.getAttribute('data-src') || '';
          const ttl = btn.getAttribute('data-title') || 'Theme';
          const dsc = btn.getAttribute('data-desc') || '';
          main.style.opacity = '0.35';
          window.setTimeout(() => {
            main.src = src;
            if (title) title.textContent = ttl;
            if (desc) desc.textContent = dsc;
            main.style.opacity = '1';
          }, 110);
        }

        thumbs.forEach((btn, idx) => btn.addEventListener('click', () => setActive(idx)));
        gallery.addEventListener('mouseenter', () => { hovering = true; });
        gallery.addEventListener('mouseleave', () => { hovering = false; });

        window.setInterval(() => {
          if (!document.body.contains(gallery) || hovering) return;
          setActive((active + 1) % thumbs.length);
        }, 3600);
      });
    }

    function initImpulseAnvilStickyNav(){
      if (typeof window.__iaStickyCleanup === 'function') window.__iaStickyCleanup();

      const root = mainEl.querySelector('.ia26');
      if (!root) return;
      const mini = root.querySelector('.ia-mini-nav');
      const side = root.querySelector('.ia-side-nav');
      if (!mini || !side) return;

      const links = Array.from(side.querySelectorAll('[data-ia-target]'));
      const targets = links.map(a => document.getElementById(a.getAttribute('data-ia-target'))).filter(Boolean);
      let rafId = 0;
      let disposed = false;

      function update(){
        rafId = 0;
        if (disposed || !document.body.contains(root)) {
          cleanup();
          return;
        }

        const rootRect = root.getBoundingClientRect();
        const miniRect = mini.getBoundingClientRect();
        const visibleInProduct = rootRect.top < 60 && rootRect.bottom > 220;
        const miniGone = miniRect.bottom < 16;
        root.classList.toggle('ia-side-visible', visibleInProduct && miniGone);

        let activeId = null;
        let best = Infinity;
        for (const target of targets){
          const r = target.getBoundingClientRect();
          const d = Math.abs(r.top - 120);
          if (r.top < window.innerHeight * 0.72 && r.bottom > 80 && d < best){
            best = d;
            activeId = target.id;
          }
        }
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('data-ia-target') === activeId));
      }

      function schedule(){
        if (disposed || rafId) return;
        rafId = requestAnimationFrame(update);
      }

      function cleanup(){
        if (disposed) return;
        disposed = true;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        observer.disconnect();
        if (window.__iaStickyCleanup === cleanup) window.__iaStickyCleanup = null;
      }

      const observer = new MutationObserver(() => {
        if (!document.body.contains(root)) cleanup();
      });
      observer.observe(mainEl, { childList:true });
      window.addEventListener('scroll', schedule, { passive:true });
      window.addEventListener('resize', schedule, { passive:true });
      window.__iaStickyCleanup = cleanup;
      schedule();
    }



    function buildAbout(){
      return `
      <div class="ia26 ia-v2 ia-about-page">
        <section class="ia-section ia-about-hero">
          <div class="ia-shell ia-about-hero-grid">
            <div>
              <span class="ia-eyebrow"><span class="ia-pulse"></span> Independent developer · producer · toolmaker</span>
              <h1>Built from curiosity.<br><span class="ia-cyan">Finished as real tools.</span></h1>
              <p class="ia-lead">FreQtik is an independent creative-technology studio building focused audio software, producer frameworks and interactive experiments.</p>
              <p class="ia-about-intro">The work starts with practical friction: a production task that feels slower than it should, a workflow that does not yet exist, or an idea that becomes more useful once it can be touched and tested. Development is focused on making the result understandable, functional, documented and worth using.</p>
              <div class="ia-actions">
                <a class="ia-btn ia-btn-primary ia-hero-buy" href="/">Explore Impulse Anvil</a>
                <a class="ia-btn" href="/downloads.html">Downloads</a>
                <a class="ia-btn ia-btn-dark" href="/connect.html">Connect</a>
              </div>
              <div class="ia-hero-note" aria-label="FreQtik working characteristics"><span>Producer-led</span><span>Independent</span><span>Shipped products</span><span>Function-first</span></div>
            </div>
            <aside class="ia-about-manifesto">
              <span class="ia-kicker">Working standard</span>
              <h2>Useful before impressive.</h2>
              <p>A polished interface matters, but only after the core idea survives real use. FreQtik projects are shaped around clear purpose, low-friction workflows and honest communication about what each product can and cannot do.</p>
              <div class="ia-about-principles">
                <div class="ia-about-principle"><b>01</b><div><strong>Find the actual problem</strong><span>Start with the point where an existing workflow becomes limiting, repetitive or unclear.</span></div></div>
                <div class="ia-about-principle"><b>02</b><div><strong>Prototype aggressively</strong><span>Use modern tools to explore more approaches, then keep only what improves the experience.</span></div></div>
                <div class="ia-about-principle"><b>03</b><div><strong>Ship responsibly</strong><span>Test, document, support and describe the result without pretending it is something larger than it is.</span></div></div>
              </div>
            </aside>
          </div>
        </section>

        <div class="ia-proofbar" aria-label="FreQtik profile highlights">
          <div class="ia-proof-item"><strong>Long-term production perspective</strong><span>Tools are informed by years of practical music-making, not only feature lists.</span></div>
          <div class="ia-proof-item"><strong>Independent decisions</strong><span>Small projects can stay focused instead of growing into generic software suites.</span></div>
          <div class="ia-proof-item"><strong>Fast iteration</strong><span>Independent development allows broad experimentation and refinement.</span></div>
          <div class="ia-proof-item"><strong>Direct accountability</strong><span>The same person designs, tests, documents and supports the work.</span></div>
        </div>

        <section class="ia-section" id="about-focus">
          <div class="ia-shell">
            <div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">What FreQtik represents</span><h2>One studio.<br>Several forms of problem-solving.</h2><p>The projects may look different, but the underlying approach is consistent: observe how people work, isolate a useful idea, then turn it into something concrete.</p></div></div>
            <div class="ia-about-pillar-grid">
              <article class="ia-about-pillar"><span class="ia-number">01</span><h3>Audio software</h3><p>Producer-led tools that explore routing, convolution, sound transformation and practical studio workflow without hiding the underlying idea.</p></article>
              <article class="ia-about-pillar"><span class="ia-number">02</span><h3>Producer knowledge</h3><p>Frameworks that make perceptual and creative decisions easier to examine without reducing music to rigid rules.</p></article>
              <article class="ia-about-pillar"><span class="ia-number">03</span><h3>Interactive projects</h3><p>Games and browser experiments used to explore movement, precision, feedback systems and learnable interaction.</p></article>
            </div>
          </div>
        </section>

        <section class="ia-section" id="about-method">
          <div class="ia-shell">
            <div class="ia-about-method-grid">
              <article class="ia-about-method-card"><span class="ia-kicker">Independent and directly accountable</span><h3>Tools support the process.<br>The result remains the standard.</h3><p>FreQtik develops, tests and refines projects independently. Every public release is judged by whether it works, whether its claims are accurate, and whether a user can understand what they are buying.</p><p>The aim is not to imitate a large company. It is to use modern tools to build unusually focused software with a clear personal point of view.</p></article>
              <div class="ia-about-method-steps">
                <article class="ia-about-method-step"><b>Observe</b><h3>Start with real friction</h3><p>Look for a recurring production, routing, learning or interaction problem that deserves a more direct solution.</p></article>
                <article class="ia-about-method-step"><b>Build</b><h3>Explore more than one answer</h3><p>Prototype quickly, compare approaches and remove features that make the central idea harder to understand.</p></article>
                <article class="ia-about-method-step"><b>Refine</b><h3>Treat presentation as part of function</h3><p>Documentation, visual hierarchy, compatibility notes and honest limitations are part of the product—not decoration added afterward.</p></article>
              </div>
            </div>
          </div>
        </section>

        <section class="ia-section" id="about-projects">
          <div class="ia-shell">
            <div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Selected work</span><h2>Products, frameworks<br>and experiments.</h2><p>Explore the current FreQtik projects directly. Each project keeps its own purpose rather than being forced into one category.</p></div></div>
            <div class="ia-project-grid">
              <article class="ia-project-card"><span class="ia-tag">Commercial audio tool</span><h3>Impulse Anvil</h3><p>A Windows VST3 for preparing, morphing, sculpting and baking reusable WAV impulse responses.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary ia-btn-small" href="/">View product</a></div></article>
              <article class="ia-project-card"><span class="ia-tag">Free audio utility</span><h3>Master Desktop Tap</h3><p>A free Windows VST3 utility for routing DAW audio to connected output devices and streaming workflows.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="/master-desktop-tap.html">View tool</a></div></article>
              <article class="ia-project-card"><span class="ia-tag">Producer framework</span><h3>Contrast Rules for Producers</h3><p>A practical guide to context, contrast, attention and impact in arrangement, sound design and production decisions.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="/contrast-rules-for-producers.html">Open framework</a></div></article>
              <article class="ia-project-card"><span class="ia-tag">Game project</span><h3>Learning to Bear</h3><p>A non-violent third-person puzzle and movement project built around spatial thinking and learnable mechanics.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="/learning-to-bear.html">View project</a></div></article>
              <article class="ia-project-card"><span class="ia-tag">Precision training</span><h3>Aim Trainer Bee Pro</h3><p>A focused interactive project exploring repeatable aiming practice, feedback and measurable control.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="/aim-trainer-bee-pro.html">View project</a></div></article>
              <article class="ia-project-card"><span class="ia-tag">Browser experiment</span><h3>Micro Mouse Star Trainer</h3><p>A browser-based micro-control trainer with star layouts, ring drills, timing, accuracy and weakness-focused practice.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="/micro-mouse-trainer.html">Open trainer</a></div></article>
            </div>
          </div>
        </section>

        <section class="ia-section">
          <div class="ia-shell"><div class="ia-final-cta"><span class="ia-kicker">Direct contact</span><h2>Questions, support<br>or a serious collaboration?</h2><p>FreQtik is independent, so communication stays direct. Use the Connect page for product support, licensing questions, project discussion or development updates.</p><div class="ia-actions" style="justify-content:center"><a class="ia-btn ia-btn-primary ia-hero-buy" href="/connect.html">Open Connect</a></div></div></div>
        </section>
      </div>`;
    }

    function buildConnect(){
      return `
      <div class="ia26 ia-v2 ia-connect-page">
        <section class="ia-section ia-connect-hero">
          <div class="ia-shell">
            <h1>Connect</h1>
          </div>
        </section>
        <section class="ia-section" style="padding-top:22px">
          <div class="ia-shell">
            <div class="ia-connect-grid">
              <article class="ia-connect-card"><span class="ia-connect-mark">@</span><h3>Email</h3><p>Best for license questions, purchase support, compatibility details, business enquiries and anything that needs a direct answer.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="mailto:freqtiksup@gmail.com">Email FreQtik</a></div></article>
              <article class="ia-connect-card"><span class="ia-connect-mark">DC</span><h3>Discord</h3><p>Community support for Impulse Anvil, setup help, updates, extra themes, shared IR material and practical discussion.</p><div class="ia-actions"><a class="ia-btn" href="${DISCORD_INVITE_URL}" target="_blank" rel="noopener">${DISCORD_ICON}Join Discord</a></div></article>
              <article class="ia-connect-card"><span class="ia-connect-mark">YT</span><h3>YouTube</h3><div class="ia-actions"><a class="ia-btn" href="https://www.youtube.com/@FreQtik" target="_blank" rel="noopener noreferrer">Open YouTube</a></div></article>
              <article class="ia-connect-card"><span class="ia-connect-mark">IG</span><h3>Instagram</h3><div class="ia-actions"><a class="ia-btn" href="https://www.instagram.com/freqtik/" target="_blank" rel="noopener noreferrer">Open Instagram</a></div></article>
            </div>
            <p class="ia-note" style="margin-top:20px">For support, include your operating system, DAW, plugin version and a concise description of what happened. That makes technical issues much easier to reproduce.</p>
          </div>
        </section>
      </div>`;
    }


        /* Router */
    let currentFeed = null;
    function loadFeed(feed, options){
  const fromHash = options && options.fromHash === true;

  try {
        // Always close dropdowns when changing section
        closeDropdowns();

        let html = '';
        switch(feed){
          case 'impulse': html = buildImpulseAll(); break;
          case 'anvil': html = buildAnvil(); break;
          case 'desktopTap': html = buildMasterDesktopTap(); break;
          case 'forge': html = buildForge(); break;
          case 'smith': html = buildImpulseAll(); break; // alias to bundle page

          case 'about':
            html = buildAbout();
            break;

          case 'frameworks':
            html = buildProducerFrameworks();
            break;

          case 'ltb': case 'aim': {
            const id = STEAM_IDS[feed];
            html = `<section id="${feed}" class="depth-effect">
              <h2>${feed==='ltb'?'Learning to Bear':'Aim Trainer Bee Pro'}</h2>
              <iframe class="responsive-iframe" src="https://store.steampowered.com/widget/${id}/" frameborder="0" loading="lazy" title="Steam widget ${id}"></iframe>
              <div id="steam-${feed}"><p>Loading details…</p></div>
            </section>`;
            setTimeout(()=>fetchSteam(feed,id),0);
            break;
          }

          case 'microgame':
            html = `<section id="microgame" class="depth-effect micro-game-section">
              <h2>Micro Mouse Star Trainer</h2>
              <div class="micro-game-copy">
                <p>Train mouse micro-control directly in the browser: star layouts, ring drills, circle reps, depth training, timing, accuracy, weakness reports, and focused follow-up drills.</p>
                <p class="note">Train directly in the browser. If the embedded version does not load, use the direct link below.</p>
              </div>
              <div class="micro-game-shell">
                <iframe class="micro-game-frame"
                        src="micro_mouse_star_trainer_circle_reps_depth.html"
                        title="Micro Mouse Star Trainer"
                        loading="eager"
                        allow="fullscreen"></iframe>
              </div>
              <p class="note" style="margin-top:16px;">
                If the game does not load, open it directly here:
                <a href="micro_mouse_star_trainer_circle_reps_depth.html" target="_blank" rel="noopener">Micro Mouse Star Trainer</a>.
              </p>
            </section>`;
            break;

          case 'youtube':
            html = `<section id="youtube" class="depth-effect">
              <h2>YouTube Channel</h2>
              <div class="flex-container">
                <a href="https://www.youtube.com/@FreQtik" target="_blank" rel="noopener noreferrer">
                  <img class="social-icon" src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" alt="YouTube">Visit Channel
                </a>
              </div>
            </section>`;
            break;

          case 'downloads':
            html = buildAnvilDownloads();
            break;


          case 'docs':
            html = buildDocs();
            break;

          case 'socials':
            html = buildConnect();
            break;
          case 'impressum':
            window.location.href = '/impressum.html';
            return;

                  default:
          html = `<section><h2>Not found</h2><p>Sorry, that section doesn't exist.</p></section>`;
    }

    currentFeed = feed;
    updateMainNavState(feed);

    mainEl.innerHTML = html;
    initAutoSlides(); // initialize auto-scrolling on any slides in this view
    initAnatomy();    // initialize plugin anatomy highlight if present
    initImpulseAudioPlayers(); // initialize custom dry/wet waveform players
    initImpulseAnvilStickyNav(); // product/docs floating chapter navigation
    initImpulseAnvilLanding();
    initImpulseThemeGallery();
    mainEl.scrollIntoView({behavior:'smooth'});

    // Update URL hash when navigation comes from clicks, not from hashchange
    if (!fromHash) {
      const targetHash = '#' + feed;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }

  } catch (err) {
    console.error(err);
    mainEl.innerHTML = `<section><h2>Error</h2><p>Something went wrong loading this section.</p></section>`;
  }
}
    // Listen to back/forward and direct #links
window.addEventListener('hashchange', () => {
  const hash = window.location.hash || '';
  const feed = hash.startsWith('#') ? hash.substring(1) : '';

  if (!feed) {
    loadFeed('impulse', { fromHash: true });
    return;
  }

  if (feed === currentFeed)
    return;

  loadFeed(feed, { fromHash: true });
});


    /* Steam fetch helper */
    async function fetchSteam(feed, id){
      const targetId = `steam-${feed}`;
      const container = document.getElementById(targetId);
      if (!container) return;

      try{
        const url = encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=US&l=en`);
        const res = await fetch(`https://api.allorigins.win/raw?url=${url}`, { method:'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json || !json[id] || !json[id].success) {
          throw new Error('Steam API returned no data.');
        }
        const info = json[id].data;
        const shots = Array.isArray(info?.screenshots)
          ? info.screenshots.map(
              s=>`<img src="${s.path_full}" style="max-width:100%;margin:10px 0;border-radius:4px;" alt="Screenshot">`
            ).join('')
          : '';

        container.innerHTML = `
          <p><strong>${escapeHtml(info?.name ?? 'Unknown')}</strong></p>
          <p>${escapeHtml(info?.short_description ?? '')}</p>
          ${shots}
          <p><a href="https://store.steampowered.com/app/${id}" target="_blank" rel="noopener noreferrer">View on Steam</a></p>
        `;
      }catch(e){
        container.innerHTML = `<p>Error loading Steam details. ${escapeHtml((e).message || '')}</p>`;
      }
    }

    function updateMenuToggleTheme(isHeaderHidden){
      const darkProduct = document.querySelector('.ia26');
      let shouldBeLight = false;
      if (darkProduct && isHeaderHidden) {
        const r = darkProduct.getBoundingClientRect();
        shouldBeLight = r.top <= 52 && r.bottom >= 52;
      }
      if (toggleBtn) toggleBtn.classList.toggle('menu-light', shouldBeLight);
    }

    /* The redesigned header remains visible. Keep the legacy button inert for compatibility. */
    if (toggleBtn) {
      toggleBtn.hidden = true;
      toggleBtn.setAttribute('aria-hidden', 'true');
    }

    /* Passive scroll handling only closes transient menus; it performs no layout writes. */
    window.addEventListener('scroll', closeDropdowns, { passive:true });

    /* persist scroll */
    window.addEventListener('beforeunload', ()=> {
      try { sessionStorage.setItem('scrollPos', String(window.scrollY)); } catch {}
    });

    window.addEventListener('load', ()=>{
  const ySpan = document.getElementById('yearSpan');
  if (ySpan) ySpan.textContent = String(new Date().getFullYear());
  try {
    const pos = sessionStorage.getItem('scrollPos');
    if (pos) window.scrollTo(0, parseFloat(pos));
  } catch {}

  const hash = window.location.hash || '';
  const feedFromHash = hash && hash.startsWith('#') ? hash.substring(1) : '';

  const defaultFeed = document.body.dataset.defaultFeed || 'anvil';
  if (feedFromHash) {
    loadFeed(feedFromHash, { fromHash: true });
  } else if (mainEl && mainEl.children.length) {
    currentFeed = defaultFeed;
    updateMainNavState(defaultFeed);
    initAutoSlides();
    initAnatomy();
    initImpulseAudioPlayers();
    initImpulseAnvilStickyNav();
    initImpulseAnvilLanding();
    initImpulseThemeGallery();
  } else {
    loadFeed(defaultFeed, { fromHash: true });
  } updateMenuToggleTheme(window.scrollY > 0);

  if (window.innerWidth < 600) introEl.classList.add('hidden');
});



    // dismiss intro on minimal mouse movement
    let moved=0,lx=null,ly=null,done=false;
    document.addEventListener('mousemove',e=>{
      if(done||window.innerWidth<600) return;
      if(lx!==null) moved+=Math.abs(e.clientX-lx)+Math.abs(e.clientY-ly);
      lx=e.clientX; ly=e.clientY;
      if(moved>300){ introEl.classList.add('hidden'); done=true; }
    });
/* IA_EDIT_BAKE_VIDEO_FIX27_JS_START */
(function () {
  function initImpulseAnvilLazyWorkflowVideos() {
    document.querySelectorAll('[data-ia-youtube-lazy]').forEach(function (frame) {
      if (frame.dataset.iaYoutubeBound === '1') return;

      var button = frame.querySelector('.ia-workflow-video-play');
      var videoId = frame.getAttribute('data-video-id');

      if (!button || !videoId) return;

      frame.dataset.iaYoutubeBound = '1';

      button.addEventListener('click', function () {
        if (frame.querySelector('iframe')) return;

        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0';
        iframe.title = 'Edit an IR. Bake a new one. — Impulse Anvil workflow tutorial';
        iframe.loading = 'eager';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        frame.replaceChildren(iframe);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImpulseAnvilLazyWorkflowVideos, { once: true });
  } else {
    initImpulseAnvilLazyWorkflowVideos();
  }
}());
/* IA_EDIT_BAKE_VIDEO_FIX27_JS_END */

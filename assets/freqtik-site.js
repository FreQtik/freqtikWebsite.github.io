
    "use strict";

    /** steam app IDs (immutable) */
    const STEAM_IDS = Object.freeze({ ltb:2789890, aim:3666950 });
    const IMPULSE_ANVIL_DOWNLOAD = 'https://github.com/freqtik/freqtikWebsite.github.io/releases/latest/download/ImpulseAnvil_Windows_VST3.zip';
    const IMPULSE_ANVIL_BUY_URL = 'https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1';
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

    function refreshLemonSqueezyButtons() {
  try {
    document.querySelectorAll(`a[href="${IMPULSE_ANVIL_BUY_URL}"]`).forEach(link => {
      link.classList.add('lemonsqueezy-button');
      link.removeAttribute('target');
      link.removeAttribute('rel');
    });
    if (window.LemonSqueezy && typeof window.LemonSqueezy.Refresh === 'function') {
      window.LemonSqueezy.Refresh();
      return;
    }
    if (typeof window.createLemonSqueezy === 'function') {
      window.createLemonSqueezy();
    }
  } catch (err) {
    console.warn('Lemon Squeezy checkout refresh failed.', err);
  }
} /* Dropdown helpers */
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
    function productHero(opts){
  return `
  <section id="${opts.id}">
    <div class="hero">
      <div class="hero-art">
        <div class="card">
          <img src="${opts.img}" alt="${opts.title} UI preview" loading="lazy">
        </div>
      </div>

      <div class="hero-copy">
        <span class="kicker">${opts.kicker}</span>
        <h1>${opts.title}</h1>
        <p class="tagline">${opts.tagline}</p>

        <div class="cta-row">
          ${opts.buyHref && opts.priceFrom ? `
          <a class="btn primary"
             href="${opts.buyHref}"
             target="_blank"
             rel="noopener"
             aria-label="Buy ${opts.title}">
            Buy from €${opts.priceFrom}
          </a>` : ''}

          <a class="btn"
             href="${opts.demoHref}"
             target="_blank"
             rel="noopener"
             aria-label="${opts.secondaryCtaLabel || ('Try ' + opts.title + ' demo')}">
            ${opts.secondaryCtaLabel || 'Try Demo'}
          </a>

          ${opts.docsHref ? `<a class="btn ghost" href="${opts.docsHref}" onclick="loadFeed('docs');">Docs</a>` : ''}
        </div>

        <p class="note">${opts.req}</p>
      </div>
    </div>
  </section>`;
}



    function pricingGrid(title, plans){
      return `
      <section>
        <h2>${title}</h2>
        <div class="grid">
          ${plans.map(p=>`
            <div class="card ${p.popular?'popular':''}">
              <h3>${p.name}${p.badge?` <span class="badge">${p.badge}</span>`:''}</h3>
              <div class="price">€${p.price}</div>
              <div class="sub muted">${p.subtitle}</div>
              <div class="hr"></div>
              <ul class="list">
                ${p.points.map(pt=>`<li>${escapeHtml(pt)}</li>`).join('')}
              </ul>
              <div class="hr"></div>
              <div class="cta-row">
                <a class="btn primary" href="${p.buyHref}" target="_blank" rel="noopener">Buy</a>
                <a class="btn" href="${p.demoHref}" target="_blank" rel="noopener">Demo</a>
              </div>
              ${p.foot?`<div class="note">${p.foot}</div>`:''}
            </div>
          `).join('')}
        </div>
      </section>`;
    }

    function featureMatrix(title, cols, rows){
      return `
      <section>
        <h2>${title}</h2>
        <div class="card">
          <table class="matrix" aria-describedby="matrix-desc">
            <caption id="matrix-desc" class="tiny" style="caption-side:bottom;text-align:left;padding-top:8px;">Feature comparison across versions</caption>
            <thead>
              <tr>
                <th style="text-align:left">Feature</th>
                ${cols.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(r=>`
                <tr>
                  <td style="text-align:left">${escapeHtml(r.name)}</td>
                  ${r.cells.map(c=>`<td>${c}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>`;
    }

        function demoSection(items){
      return `
      <section>
        <h2>Demo & Licensing</h2>
        <div class="cols">
          <div class="card">
            <h3>Demo Limits</h3>
            <ul class="list">
              ${items.map(i=>`<li><strong>${escapeHtml(i.name)}:</strong> ${escapeHtml(i.detail)}</li>`).join('')}
            </ul>
          </div>
          <div class="card">
            <h3>License & Installer</h3>
            <ul class="list">
              <li>Perpetual license · 12 months of updates included</li>
              <li>2 seats per license (e.g. studio PC + laptop)</li>
              <li>Manual VST3 folder install for the current Windows release</li>
              <li>Windows 10/11 (64-bit) · VST3 effect plugin</li>
            </ul>
          </div>
        </div>
      </section>`;
    }


                /* Auto-scrolling slides (Anvil highlight band) */
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

function buildAnvil(){ return `
<div class="ia26 ia-v2" id="anvil">
<div aria-label="Impulse Anvil product navigation" class="ia-mini-nav ia-mini-nav-product">
<div class="ia-mini-nav-inner">
<div class="ia-mini-links ia-mini-links-product">
<a href="#" onclick="iaScrollTo('anvil'); return false;">Overview</a>
<a href="#" onclick="iaScrollTo('ia-sound'); return false;">Hear it</a>
<a href="#" onclick="iaScrollTo('ia-workflow'); return false;">How it works</a>
<a href="#" onclick="iaScrollTo('ia-usecases'); return false;">Record the world</a>
<a href="#" onclick="iaScrollTo('ia-morph'); return false;">Technical depth</a>
<a href="#" onclick="iaScrollTo('ia-interface'); return false;">Interface</a>
<a href="#" onclick="iaScrollTo('ia-trust'); return false;">Honest fit</a>
<a href="#" onclick="iaScrollTo('ia-pricing'); return false;">Pricing</a>
<a href="#" onclick="iaScrollTo('ia-faq'); return false;">FAQ</a>
<a href="/docs.html">Docs</a>
<span aria-hidden="true" class="ia-nav-spacer"></span>
<a class="ia-nav-important ia-btn ia-btn-small" href="/downloads.html">Free demo</a>
<a class="ia-nav-important ia-btn ia-btn-small ia-btn-primary lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Buy &middot; &euro;29</a>
</div>
</div>
</div>
<nav aria-label="Impulse Anvil floating chapter navigation" class="ia-side-nav">
<a class="is-active" data-ia-target="anvil" href="#" onclick="iaScrollTo('anvil'); return false;"><img alt="" class="ia-side-logo" src="assets/tinylogoQ.png"/><span class="ia-side-label">Overview</span></a>
<a data-ia-target="ia-sound" href="#" onclick="iaScrollTo('ia-sound'); return false;">&#9654;<span class="ia-side-label">Hear it</span></a>
<a data-ia-target="ia-workflow" href="#" onclick="iaScrollTo('ia-workflow'); return false;">3<span class="ia-side-label">How it works</span></a>
<a data-ia-target="ia-usecases" href="#" onclick="iaScrollTo('ia-usecases'); return false;">R<span class="ia-side-label">Record the world</span></a>
<a data-ia-target="ia-morph" href="#" onclick="iaScrollTo('ia-morph'); return false;">M<span class="ia-side-label">Technical depth</span></a>
<a data-ia-target="ia-interface" href="#" onclick="iaScrollTo('ia-interface'); return false;">UI<span class="ia-side-label">Interface</span></a>
<a data-ia-target="ia-trust" href="#" onclick="iaScrollTo('ia-trust'); return false;">&#10003;<span class="ia-side-label">Honest fit</span></a>
<a data-ia-target="ia-faq" href="#" onclick="iaScrollTo('ia-faq'); return false;">?<span class="ia-side-label">FAQ</span></a>
<a data-ia-target="ia-pricing" href="#" onclick="iaScrollTo('ia-pricing'); return false;">&euro;<span class="ia-side-label">Pricing</span></a>
<a class="ia-side-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Buy<span class="ia-side-label">Full license &euro;29</span></a>
</nav>
<section class="ia-section ia-hero">
<div class="ia-shell ia-hero-grid">
<div class="ia-hero-copy">
<span class="ia-eyebrow"><span class="ia-pulse"></span> Creative convolution &middot; Windows VST3</span>
<h1>Discover what your<br/><span class="ia-cyan">sound could become.</span></h1>
<p class="ia-lead">Transform familiar audio into new spaces, textures, rhythms and sonic identities.</p>
<p class="ia-hero-sub">Load an impulse response, texture, found sound or compatible WAV recording. Let it reshape your audio, explore unexpected transformations, and bake the results worth keeping.</p>
<div class="ia-actions">
<a class="ia-btn ia-btn-primary ia-hero-buy" href="/downloads.html">Download free demo</a>
<a class="ia-btn ia-hero-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1"><span class="ia-sale-inline"><span class="ia-old-price">&euro;49</span><span>Get full license &middot; &euro;29</span></span></a>
<a class="ia-btn ia-btn-dark" href="#" onclick="iaScrollTo('ia-sound'); return false;">Hear transformations</a>
</div>
<p class="ia-hero-fineprint">Windows 10/11 &middot; 64-bit VST3 &middot; 126 included IRs &middot; Load your own WAVs &middot; Two licence seats</p>
</div>
<div aria-label="Impulse Anvil interface preview" class="ia-product-card">
<div class="ia-product-window">
<img alt="Impulse Anvil creative convolution and impulse-response transformation interface" decoding="async" fetchpriority="high" loading="eager" src="assets/impulse-anvil-plugin-ui.png"/>
</div>
<div class="ia-float-card">
<b>Surprise first. Shape what matters.</b>
<p>Press Random, follow the transformations that provoke an idea, then sculpt and bake the results you want to keep.</p>
</div>
</div>
</div>
</section>

<div aria-label="Impulse Anvil key facts" class="ia-proofbar">
<div class="ia-proof-item"><strong>Creative transformation</strong><span>Give familiar audio a different identity.</span></div>
<div class="ia-proof-item"><strong>Real-world source material</strong><span>Use recordings, textures and found sounds.</span></div>
<div class="ia-proof-item"><strong>Seven morph structures</strong><span>Time, spectral, spatial and Lerp behavior.</span></div>
<div class="ia-proof-item"><strong>Reusable WAV output</strong><span>Bake discoveries into a portable IR library.</span></div>
<div class="ia-proof-item"><strong>&euro;29 full license</strong><span>One complete version with two seats.</span></div>
</div>

<section class="ia-sound-band ia-media-section" id="ia-sound">
<div class="ia-shell">
<div class="ia-section-head ia-media-head">
<div class="ia-copy">
<span class="ia-kicker">One sound. Different worlds.</span>
<h2>Hear the identity change.</h2>
<p>Each example begins with the untreated source and moves into creative convolution. Listen for the change in tone, space, resonance, rhythm and character - not only for a reverb tail.</p>
</div>
</div>
<div class="ia-audio-grid">
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Melody</span><h3>Piano</h3><p>One performance. A completely different direction.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-01.mp3"><button aria-label="Play piano dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-01.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Voice</span><h3>Vocal</h3><p>Turn a dry phrase into an intimate layer, unusual space or identity effect.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-02.mp3"><button aria-label="Play voice dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-02.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Guitar</span><h3>Guitar</h3><p>Reshape tone, resonance and space, or transform existing cabinet responses.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-03.mp3"><button aria-label="Play guitar dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-03.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
</div>
</div>
</section>

<div aria-hidden="true" id="ia-position"></div>

<section class="ia-section" id="ia-workflow">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Surprise first. Shape what matters.</span><h2>Three steps from source<br/>to something worth keeping.</h2><p>You do not need to know exactly what you are looking for before you begin. Start quickly, listen for a result that changes the idea, then go deeper only when it deserves attention.</p></div></div>
<div class="ia-position-grid">
<article class="ia-position-card"><span class="ia-number">01</span><h3>Load</h3><p>Choose from 126 included impulse responses, load your existing IR collection, or bring in compatible recordings, noise, textures and other WAV material.</p></article>
<article class="ia-position-card"><span class="ia-number">02</span><h3>Discover</h3><p>Press Random, morph between two prepared sources, and follow the transformations that change how the original part feels.</p></article>
<article class="ia-position-card"><span class="ia-number">03</span><h3>Keep</h3><p>Trim, Color, Texture, reverse, fade, EQ, widen and level the result, then bake the discovery as a reusable WAV impulse response.</p></article>
</div>
</div>
</section>

<section class="ia-section" id="ia-usecases">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Record the world. Put it inside your sound.</span><h2>Real material creates<br/>unrepeatable complexity.</h2><p>Water, stone, metal, paper, rooms, machinery, footsteps, environmental noise and small accidental sounds can all become creative source material.</p></div></div>
<div class="ia-outcome-grid">
<article class="ia-outcome ia-outcome-lead"><span class="ia-tag">Found-sound convolution</span><h3>A recording does not need to resemble a traditional reverb.</h3><p>Short sounds can create tight tonal coloration and resonance. Longer recordings can introduce evolving spaces, irregular tails and rhythmic behavior that changes how a loop or performance is perceived.</p><p>Because the material begins in the real world, the result can carry irregularity and complexity that would be difficult to design deliberately with ordinary synthesis or modulation.</p><p><strong>Record something that interests you. Load it. Hear what it does.</strong></p></article>
<article class="ia-outcome ia-outcome-vocal"><span class="ia-kicker">Melody and instruments</span><h3>Escape a familiar identity</h3><p>Push piano, synth, guitar or other melodic material toward a new tone, resonance, space or rhythmic impression.</p></article>
<article class="ia-outcome ia-outcome-drums"><span class="ia-kicker">Drums and rhythm</span><h3>Short organic spaces</h3><p>Create tight resonant, metallic or organic responses without automatically washing out the groove.</p></article>
<article class="ia-outcome ia-outcome-instruments"><span class="ia-kicker">Voice and selected words</span><h3>Distinctive layers and throws</h3><p>Turn a dry phrase into a filtered double, intimate layer, strange resonance or selected-word identity effect.</p></article>
<article class="ia-outcome ia-outcome-library"><span class="ia-kicker">Reusable discoveries</span><h3>Build a personal IR library</h3><p>Bake useful accidents before they disappear, name the WAV and use it again in compatible convolution software or another Impulse Anvil transformation.</p></article>
</div>
</div>
</section>

<section class="ia-section" id="ia-morph">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">The technology is convolution. The purpose is discovery.</span><h2>Immediate when you begin.<br/>Deep when a result matters.</h2><p>Randomization gets you moving. The complete A/B path remains visible when you want to understand, refine and preserve what you found.</p></div></div>
<div class="ia-mode-stage">
<article class="ia-mode-intro">
<div>
<span class="ia-eyebrow"><span class="ia-pulse"></span> A + B &rarr; Morph &rarr; Edit &rarr; EQ &rarr; Output &rarr; Bake</span>
<h3>Prepare two sources, then decide how they meet.</h3>
<p>Each slot can be stretched, leveled, colored and textured independently. The active morph mode determines how those prepared states interact before the result reaches editing, EQ, width and output preparation.</p>
</div>
<ul class="ia-list">
<li>Factory IRs, your own IRs or compatible WAV recordings</li>
<li>Per-slot Time, Gain, Color and Texture Depth</li>
<li>Random discovery with visible, editable results</li>
<li>Internal stereo convolution preview and standard WAV baking</li>
</ul>
</article>
<div class="ia-mode-list">
<article class="ia-mode-card"><b>Direct</b><h3>Time Morph</h3><p>Blend A and B in the time domain for direct combinations and dependable starting points.</p></article>
<article class="ia-mode-card"><b>Frequency structure</b><h3>Spectral &middot; Spectral Bandpass &middot; Spectral Zig Zag</h3><p>Fuse spectral character, divide the frequency range between sources, or create alternating spectral relationships.</p></article>
<article class="ia-mode-card"><b>Stereo structure</b><h3>Stereo Slot Swap &middot; Mid/Side Boundary</h3><p>Move the A/B relationship across left and right, or separate center information from the outside stereo field.</p></article>
<article class="ia-mode-card"><b>Movement baked into one file</b><h3>Mode-aware A&rarr;B Lerp</h3><p>Use the current morph mode to generate a progression from A toward B, then bake that movement into one static WAV impulse response. The motion becomes part of the file rather than live automation.</p></article>
</div>
</div>
</div>
</section>

<section class="ia-section" id="ia-interface">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Interface</span><h2>The signal path stays visible.</h2><p>The layout moves from A/B preparation into Morph, Edit, EQ and Output. You can see where the current sound is being created instead of navigating a stack of disconnected effect pages.</p></div></div>
<div class="ia-anatomy">
<div class="ia-bare-product-shot"><div class="ia-product-window"><img alt="Impulse Anvil interface overview" decoding="async" loading="lazy" src="assets/impulse-anvil-plugin-ui.png"/></div></div>
<div class="ia-callout-list">
<div class="ia-callout"><h3>IR A / IR B</h3><p>Load factory IRs, user IRs or WAV recordings. Stretch time, set gain and apply Color or Texture Depth independently.</p></div>
<div class="ia-callout"><h3>Morph + Lerp</h3><p>Choose Time Morph, Spectral, Spectral Bandpass, Spectral Zig Zag and spatial modes, or bake an internal A→B progression into one IR.</p></div>
<div class="ia-callout"><h3>Edit + EQ</h3><p>Trim silence, isolate a useful region, reverse a selected range, add fades and shape the final frequency balance.</p></div>
<div class="ia-callout"><h3>Preview + Bake</h3><p>Audition the current prepared IR through convolution, then export the designed result as a standard WAV file.</p></div>
</div>
</div>
</div>
</section>
<section class="ia-section" id="ia-themes">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Visual system</span><h2>A technical tool that can still feel personal.</h2><p>Built-in designs and custom theme files change the presentation without changing the audio workflow. Additional themes, IRs, updates and videos are shared through the Impulse Anvil Discord.</p></div></div>
<div class="ia-theme-stage" data-ia-theme-gallery="" data-theme-ready="1">
<div class="ia-theme-main"><img alt="Impulse Anvil default theme preview" data-ia-theme-main="" decoding="async" loading="lazy" src="assets/impulse-anvil-plugin-ui.png"><div class="ia-theme-caption"><span><strong data-ia-theme-title="">Default</strong><br/>Included interface design</span><a class="ia-btn ia-btn-small" href="https://discord.gg/qUetz23QPq" rel="noopener" target="_blank"><svg aria-hidden="true" class="ia-discord-icon" focusable="false" viewbox="0 0 24 24"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3l-.2.4c1.7.5 2.5 1.2 2.5 1.2a15.8 15.8 0 0 0-5.8-1.8 15.8 15.8 0 0 0-5.8 1.8s.8-.7 2.6-1.2L8.5 3a19.6 19.6 0 0 0-4.8 1.4C.7 8.8-.1 13.1.3 17.3A19.8 19.8 0 0 0 6.2 20l.7-1.1c-1.3-.4-2.5-1.1-3.5-2 .3.2.6.4.9.6 3.6 2 8.4 2.6 13.7 0 .3-.2.6-.4.9-.6-1 .9-2.2 1.6-3.5 2l.7 1.1a19.8 19.8 0 0 0 5.9-2.7c.5-4.8-.8-9-1.7-12.9ZM8.1 14.7c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Zm7.8 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Z" fill="currentColor"></path></svg>Discord extras</a></div></div>
<div class="ia-theme-panel">
<button class="ia-theme-thumb is-active" data-src="assets/impulse-anvil-plugin-ui.png" data-title="Default" type="button"><img alt="Default theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-plugin-ui.png"/><span><b>Default</b>Core cyan interface.</span></button>
<button class="ia-theme-thumb" data-src="assets/impulse-anvil-ui-purple.png" data-title="Purple" type="button"><img alt="Purple theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-ui-purple.png"/><span><b>Purple</b>Deeper violet accent.</span></button>
<button class="ia-theme-thumb" data-src="assets/impulse-anvil-ui-gold.png" data-title="Gold" type="button"><img alt="Gold theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-ui-gold.png"/><span><b>Gold</b>Warmer studio look.</span></button>
<button class="ia-theme-thumb" data-src="assets/impulse-anvil-ui-silver.png" data-title="Silver" type="button"><img alt="Silver theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-ui-silver.png"/><span><b>Silver</b>Neutral technical finish.</span></button>
<button class="ia-theme-thumb" data-src="assets/impulse-anvil-ui-ember.png" data-title="Ember" type="button"><img alt="Ember theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-ui-ember.png"/><span><b>Ember</b>Dark warm contrast.</span></button>
<button class="ia-theme-thumb" data-src="assets/impulse-anvil-ui-forest.png" data-title="Forest" type="button"><img alt="Forest theme preview" decoding="async" loading="lazy" src="assets/impulse-anvil-ui-forest.png"/><span><b>Forest</b>Low-light green variant.</span></button>
</div>
</div>
</div>
</section>
<section class="ia-section" id="ia-trust">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Honest fit</span><h2>Know what you are buying.</h2><p>A focused product converts better when its limits are as clear as its strengths. Impulse Anvil is a deliberate IR-building environment, not an automation-first performance effect.</p></div></div>
<div class="ia-fit-grid">
<article class="ia-fit-card is-positive"><h3>It is a strong fit when you want to…</h3><ul class="ia-list"><li>Design unusual rooms, filters, textures and resonant spaces</li><li>Morph two prepared IR sources through several structural modes</li><li>Create an A→B movement inside one baked impulse response</li><li>Build portable WAV IRs for a growing personal library</li><li>Work inside a Windows 64-bit VST3 host</li></ul></article>
<article class="ia-fit-card"><h3>Important before you buy</h3><ul class="ia-list ia-list-warn"><li>Most IR-shaping controls rebuild the impulse response and are intended for design, not continuous knob automation</li><li>Very long or dense IRs require more recalculation and can produce extreme or muddy results</li><li>The current public release is Windows 10/11, 64-bit VST3</li><li>Delivery is a manual ZIP bundle rather than an installer</li><li>Use source recordings and IRs you own or are permitted to process</li></ul></article>
</div>
</div>
</section>
<section class="ia-section" id="ia-pricing">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Pricing</span><h2>Try the workflow.<br/>Unlock the complete forge.</h2><p>The same VST3 download opens in demo mode. A license key unlocks the full morph engine, both Color rows, A→B Lerp and WAV baking.</p></div></div>
<div class="ia-pricing">
<article class="ia-card ia-price-card">
<span class="ia-tag">Demo</span><h3>Explore the sound</h3><div class="ia-price"><strong>€0</strong><span>download</span></div>
<p class="ia-muted">Test the plugin in your own DAW before purchasing.</p>
<ul class="ia-list"><li>Windows VST3 folder bundle</li><li>126 handmade IRs included</li><li>Time Morph available</li><li>One Color row per IR</li><li>Periodic subtle demo noise</li><li>No A→B Lerp or WAV baking</li></ul>
<div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/downloads.html">Download free demo</a></div>
</article>
<article class="ia-card ia-price-card ia-price-card-featured">
<span class="ia-tag">Launch offer</span><h3>Impulse Anvil Full License</h3><div class="ia-price ia-sale-price"><span class="ia-old-price">€49</span><strong>€29</strong><span>one-time</span></div>
<p class="ia-muted">The complete A/B IR-design, morphing and export workflow.</p>
<ul class="ia-list"><li>Time Morph, Spectral, Spectral Bandpass and Spectral Zig Zag</li><li>Stereo Slot Swap and Mid/Side Boundary modes</li><li>Mode-aware A→B Lerp and WAV export</li><li>Two Color rows per IR plus Texture Depth</li><li>Waveform editing, visual EQ, width and level preparation</li><li>2 seats per license</li></ul>
<div class="ia-actions"><a class="ia-btn ia-btn-primary lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Get full license · €29</a><a class="ia-btn ia-btn-dark" href="/downloads.html">Install and activation</a></div>
</article>
</div>
<div class="ia-portable-note"><strong>Your exported IRs remain portable.</strong> Full-version bakes are standard WAV impulse responses, so the useful result is not trapped inside Impulse Anvil. Load it later in compatible convolution reverbs, IR loaders and cabinet tools.</div>
</div>
</section>
<section class="ia-section" id="ia-docs">
<div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Setup and manual</span><h2>Detailed when you need it.<br/>Out of the way when you do not.</h2><p>The manual covers installation, activation, Color, Texture Depth, every morph mode, reverse Edit ranges, EQ, preview behavior, baking and practical source ideas.</p></div></div><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs.html">Open full manual</a><a class="ia-btn" href="/downloads.html">Downloads and setup</a><a class="ia-btn ia-btn-dark" href="https://discord.gg/qUetz23QPq" rel="noopener" target="_blank"><svg aria-hidden="true" class="ia-discord-icon" focusable="false" viewbox="0 0 24 24"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3l-.2.4c1.7.5 2.5 1.2 2.5 1.2a15.8 15.8 0 0 0-5.8-1.8 15.8 15.8 0 0 0-5.8 1.8s.8-.7 2.6-1.2L8.5 3a19.6 19.6 0 0 0-4.8 1.4C.7 8.8-.1 13.1.3 17.3A19.8 19.8 0 0 0 6.2 20l.7-1.1c-1.3-.4-2.5-1.1-3.5-2 .3.2.6.4.9.6 3.6 2 8.4 2.6 13.7 0 .3-.2.6-.4.9-.6-1 .9-2.2 1.6-3.5 2l.7 1.1a19.8 19.8 0 0 0 5.9-2.7c.5-4.8-.8-9-1.7-12.9ZM8.1 14.7c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Zm7.8 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Z" fill="currentColor"></path></svg>Community support</a></div></div>
</section>
<section class="ia-section" id="ia-faq">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">FAQ</span><h2>Clear answers before checkout.</h2></div></div>
<div class="ia-faq">
<details open=""><summary>Is Impulse Anvil a convolution reverb or an IR designer?</summary><p>Both functions are present, but the product is centered on IR design. You prepare A/B sources, morph and sculpt the impulse response, audition it through the internal convolver, and bake the result as WAV.</p></details>
<details><summary>Can I load my own audio?</summary><p>Yes. Load compatible WAV material or existing impulse responses, then trim, color, texture, morph, EQ and bake the result. Use material you own or are properly allowed to use.</p></details>
<details><summary>What makes A→B Lerp different from moving a morph knob?</summary><p>A→B Lerp creates one static IR whose internal tail progresses from A toward B over time. The movement becomes part of the baked WAV itself rather than a live automation gesture.</p></details>
<details><summary>Can the exported IR be used outside Impulse Anvil?</summary><p>Yes. Full-version bakes are standard WAV impulse responses and can be loaded into compatible convolution reverbs, IR loaders, cabinet tools and supported hardware.</p></details>
<details><summary>Can I automate all controls continuously?</summary><p>Impulse Anvil is not designed as an automation-heavy performance effect. Controls that reshape the impulse response rebuild prepared audio in the background and are intended for auditioning, design and baking.</p></details>
<details><summary>Why do long IRs take more time to update?</summary><p>A longer impulse contains more audio data. Trimming the useful range usually speeds up iteration and often produces a tighter, more mixable result.</p></details>
<details><summary>Will every recording automatically become a useful IR?</summary><p>No. Source length, transients, silence, tonal balance and noise all affect the result. Short, intentional material is usually easier to control; the Edit, fade, EQ and level tools are there to refine experiments before baking.</p></details>
<details><summary>Is this delivered through an installer?</summary><p>No. The current Windows release is a manual ZIP bundle containing the complete VST3 folder. The Downloads section includes installation and activation videos.</p></details>
<details><summary>What systems are officially supported?</summary><p>The current official public release supports Windows 10/11 in 64-bit VST3 hosts. Compatibility still depends on the host correctly supporting the VST3 format.</p></details>
<details><summary>What is included with the license?</summary><p>The full plugin, 126 handmade IRs, the complete morph and Lerp workflow, both Color rows, Texture Depth, editing and WAV baking, with two seats per license.</p></details>
</div>
</div>
</section>
<section class="ia-section">
<div class="ia-shell">
<div class="ia-final-cta">
<span class="ia-kicker">Impulse Anvil</span>
<h2>Morph IRs.<br/><span class="ia-cyan">Bake WAVs.</span></h2>
<p>Start with the free demo. Load your own sounds, explore the included library and hear what Impulse Anvil does inside your own music.</p>
<div class="ia-actions" style="justify-content:center"><a class="ia-btn ia-btn-primary ia-hero-buy" href="/downloads.html">Download free demo</a><a class="ia-btn ia-hero-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1"><span class="ia-sale-inline"><span class="ia-old-price">€49</span><span>Buy full license · €29</span></span></a></div>
</div>
</div>
</section>
</div>
`; } function buildForge(){
      return buildAnvil();
    }

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
    function buildDocs(){
      return `
      <div class="ia26" id="docs">
        <div class="ia-mini-nav" aria-label="Impulse Anvil docs navigation"><div class="ia-mini-nav-inner"><a class="ia-mini-brand" href="#" onclick="iaScrollTo('docs'); return false;"><span class="ia-mark"><img class="ia-brand-img" src="assets/tinylogoQ.png" alt=""></span><span><strong>FREQTIK</strong><span>Anvil Manual</span></span></a><div class="ia-mini-links"><a href="#" onclick="iaScrollTo('ia-doc-basic'); return false;">Quickstart</a><a href="#" onclick="iaScrollTo('ia-doc-sections'); return false;">Sections</a><a href="#" onclick="iaScrollTo('ia-doc-color'); return false;">Color</a><a href="#" onclick="iaScrollTo('ia-doc-morph'); return false;">Morph</a><a href="#" onclick="iaScrollTo('ia-doc-edit'); return false;">Edit</a><a href="#" onclick="iaScrollTo('ia-doc-bake'); return false;">Bake</a><a class="ia-nav-important ia-btn ia-btn-small ia-btn-primary" href="${IMPULSE_ANVIL_DOWNLOAD}" target="_blank" rel="noopener">Download VST3</a></div></div></div>
    
        <nav class="ia-side-nav" aria-label="Impulse Anvil floating docs navigation"><a href="#" data-ia-target="docs" onclick="iaScrollTo('docs'); return false;"><img class="ia-side-logo" src="assets/tinylogoQ.png" alt=""><span class="ia-side-label">Top</span></a><a href="#" data-ia-target="ia-doc-basic" onclick="iaScrollTo('ia-doc-basic'); return false;">Q<span class="ia-side-label">Quickstart</span></a><a href="#" data-ia-target="ia-doc-sections" onclick="iaScrollTo('ia-doc-sections'); return false;">S<span class="ia-side-label">Sections</span></a><a href="#" data-ia-target="ia-doc-color" onclick="iaScrollTo('ia-doc-color'); return false;">C<span class="ia-side-label">Color / Texture</span></a><a href="#" data-ia-target="ia-doc-morph" onclick="iaScrollTo('ia-doc-morph'); return false;">M<span class="ia-side-label">Morph</span></a><a href="#" data-ia-target="ia-doc-edit" onclick="iaScrollTo('ia-doc-edit'); return false;">E<span class="ia-side-label">Edit</span></a><a href="#" data-ia-target="ia-doc-bake" onclick="iaScrollTo('ia-doc-bake'); return false;">B<span class="ia-side-label">Bake</span></a><a href="/">↩<span class="ia-side-label">Product page</span></a></nav>
    
        <section class="ia-section ia-hero"><div class="ia-shell ia-hero-grid"><div><span class="ia-eyebrow"><span class="ia-pulse"></span> User manual</span><h1>Impulse Anvil <span class="ia-cyan">explained.</span></h1><p class="ia-lead">Start simple: load an IR or WAV, listen, morph, edit and bake. Then go deeper into Color, Texture Depth, spectral morphing and reverse IR slicing when you want more experimental results.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="#" onclick="iaScrollTo('ia-doc-basic'); return false;">Start quickstart</a><a class="ia-btn" href="#" onclick="iaScrollTo('ia-doc-sections'); return false;">View sections</a><a class="ia-btn ia-btn-dark" href="/">Back to product page</a></div></div><div class="ia-product-card"><div class="ia-product-window"><img src="assets/impulse-anvil-plugin-ui.png" alt="Impulse Anvil interface" loading="lazy"></div></div></div></section>
    
        <section class="ia-section" id="ia-doc-basic"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Quickstart</span><h2>Load a fingerprint and listen.</h2><p>Impulse Anvil can behave like a convolution reverb, but its deeper purpose is creating new impulse responses from recordings, IRs and sound textures.</p></div></div><div class="ia-grid ia-grid-three"><article class="ia-card"><div class="ia-number">1</div><h3>Load A</h3><p>Click Load in the A section and choose a factory IR, your own IR or any WAV. This is your first fingerprint.</p></article><article class="ia-card"><div class="ia-number">2</div><h3>Load B</h3><p>Use B when you want a second world to morph toward: a room into fabric, a cab into ice, a click into a metallic tail.</p></article><article class="ia-card"><div class="ia-number">3</div><h3>Shape and bake</h3><p>Use Morph, EQ, Edit and Output to shape the result. When it feels special, Bake it as a reusable WAV IR.</p></article></div><div class="ia-grid ia-grid-two" style="margin-top:16px"><article class="ia-card ia-doc-tip"><h3>Precision dragging</h3><ul class="ia-list"><li>Hold Shift before dragging for finer movement.</li><li>Hold Ctrl before dragging for extremely fine adjustment.</li><li>Use lower Wet Level while browsing loud or unknown IRs.</li></ul></article><article class="ia-card"><h3>Best first experiment</h3><p>Record a snap, clap, cloth rub or short scrape with your phone, load it into A, put Anvil on a piano or synth and listen in Wet Only. That is the core idea in one minute.</p></article></div></div></section>
    
        <section class="ia-section" id="ia-doc-sections"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Interface sections</span><h2>What each section does.</h2><p>The plugin is laid out from left to right and top to bottom: sources, morphing, EQ, waveform edit and final output.</p></div></div>
          <div class="ia-section-visual-grid"><div class="ia-section-shot"><img src="assets/docs/section-ir-a.png" alt="Impulse Anvil IR A section"></div><div class="ia-doc-panel"><article class="ia-card"><h3>IR A / IR B</h3><p>Each side loads one source IR or WAV. Time changes the source length before processing. Gain balances the IR when normalization is not doing the comparison for you.</p></article><article class="ia-card"><h3>Color rows</h3><p>Each IR has two Color rows. A row makes a stretched, delayed and level-adjusted copy of the IR, then mixes it back into the slot to add complexity.</p></article></div></div>
          <div class="ia-section-visual-grid"><div class="ia-section-shot"><img src="assets/docs/section-morph.png" alt="Impulse Anvil morph section"></div><div class="ia-doc-panel"><article class="ia-card"><h3>Morph</h3><p>The center section blends A and B. Use Time Morph for predictable blends, spectral modes for more synthetic hybrids, and A→B Lerp when you want a single IR that evolves over its own tail.</p></article><article class="ia-card"><h3>Align Peaks</h3><p>Peak alignment keeps transients coherent. Disable it when you want offset, ghosting or stranger timing between the two sources.</p></article></div></div>
          <div class="ia-section-visual-grid"><div class="ia-section-shot"><img src="assets/docs/section-eq.png" alt="Impulse Anvil EQ section"></div><div class="ia-doc-panel"><article class="ia-card"><h3>EQ</h3><p>The visual EQ shapes the prepared IR. High-pass removes rumble, low-pass controls harshness, bell filters target resonances and Tilt quickly shifts the IR darker or brighter.</p></article><article class="ia-card"><h3>Resonance assist</h3><p>The display highlights strong energy areas so you can quickly locate ringing, whistling or heavy resonant spots inside the IR.</p></article></div></div>
          <div class="ia-section-visual-grid"><div class="ia-section-shot"><img src="assets/docs/section-edit.png" alt="Impulse Anvil Edit waveform section"></div><div class="ia-doc-panel"><article class="ia-card"><h3>Edit</h3><p>The waveform shows the prepared IR. Set Pre, Start, End, Fade In and Fade Out to isolate useful pieces of long recordings or remove unwanted tails.</p></article><article class="ia-card"><h3>Long IR browsing</h3><p>A five-second recording can contain many short interesting spaces. Use Start and End to scan the waveform and turn tiny moments into usable IRs.</p></article></div></div>
          <div class="ia-section-visual-grid"><div class="ia-section-shot"><img src="assets/docs/section-out.png" alt="Impulse Anvil Output section"></div><div class="ia-doc-panel"><article class="ia-card"><h3>Output</h3><p>Set IR input, Wet Level, Dry/Wet, output gain and stereo Width. Limiter and Normalize help keep exploration controlled while browsing, randomizing and baking.</p></article><article class="ia-card"><h3>Width</h3><p>0.0 narrows toward mono, 1.0 keeps the original stereo image, and 2.0 expands side information. This is useful because many IRs carry strong stereo character.</p></article></div></div>
        </div></section>
    
        <section class="ia-section" id="ia-doc-color"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Color + Texture</span><h2>Color adds layers. Texture recursively recolors them.</h2><p>Color is the first deep sound-design layer in Impulse Anvil. It does not add a normal effect after the plugin; it changes the impulse response before convolution.</p></div></div><div class="ia-grid ia-grid-three"><article class="ia-card"><h3>Time</h3><p>Stretches or compresses the Color copy. Longer values create bigger, slower tails; shorter values tighten and brighten the fingerprint.</p></article><article class="ia-card"><h3>Offset</h3><p>Moves the Color copy later in time. This can create slap, pre-echo, delayed body or ghost reflections.</p></article><article class="ia-card"><h3>Amount</h3><p>Controls how strongly the Color copy is mixed into the base IR. Start low, then raise it when the character is useful.</p></article></div><div class="ia-card" style="margin-top:16px"><h3>Texture Depth</h3><p>Texture Depth uses the enabled Color settings recursively. The result is recolored, then the recolored result is used as the source for the next layer, alternating Color 1 and Color 2. Depth is limited for stability, and it only works when Color is enabled because it needs a Color transformation to recurse through.</p><div class="ia-formula">Base IR → Color layer → recolored layer → deeper texture layers</div></div></div></section>
    
        <section class="ia-section" id="ia-doc-morph"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Morph engine</span><h2>Seven approaches for A to become B.</h2><p>Before morphing, each endpoint can already have time stretch, gain, Color and Texture applied. The morph engine works on those prepared endpoints.</p></div></div><div class="ia-grid ia-grid-two"><article class="ia-card"><h3>Time Morph</h3><p>Predictable sample/time-domain blend. Use it for natural room blending, cab blending and reliable first results.</p></article><article class="ia-card"><h3>Spectral Morph</h3><p>Blends frequency-domain character for more fused, synthetic or tone-driven results.</p></article><article class="ia-card"><h3>Spectral BandSwap</h3><p>Alternates spectral regions between A and B so different frequency areas can feel like different spaces.</p></article><article class="ia-card"><h3>Spectral ZigZag</h3><p>A more experimental spectral pattern for glitchy, striped, phasey or impossible spaces.</p></article><article class="ia-card"><h3>Stereo Slot Swap</h3><p>Moves the A/B relationship in opposite directions across the left and right channels, creating a spatial A/B field rather than a simple pan effect.</p></article><article class="ia-card"><h3>Mid/Side Boundary</h3><p>Keeps Slot A toward the center field while introducing Slot B into the side field. Morph controls how strongly that center/outside boundary is expressed.</p></article></div><div class="ia-card ia-doc-tip" style="margin-top:16px"><h3>A→B Lerp</h3><p>A→B Lerp is not a live knob movement. It creates one static IR whose internal tail moves from A toward B over time. Choose the curve and Lerp Time, then bake it into a single WAV IR.</p></div></div></section>
    
        <section class="ia-section" id="ia-doc-edit"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Edit range</span><h2>Turn one long recording into many short IRs.</h2><p>Start, End, Fade In and Fade Out follow the prepared IR length. This makes long material practical: scroll through a recording and isolate the one resonance, hit, rattle or tail that actually works.</p></div></div><div class="ia-grid ia-grid-two"><article class="ia-card"><h3>Forward range</h3><p>When Start is before End, the selected region plays forward. Use this for normal trimming, removing silence and focusing the useful part of an IR.</p></article><article class="ia-card"><h3>Reverse range</h3><p>When Start is later than End, Impulse Anvil creates a reversed slice between those endpoints. Fades and processing then apply to that resolved slice, making reverse textures fast to design and bake.</p></article><article class="ia-card"><h3>Pre</h3><p>Adds silence before the IR. This behaves like predelay and remains outside the reversed slice.</p></article><article class="ia-card"><h3>Fades</h3><p>Fade In and Fade Out prevent clicks and make tiny slices usable as smooth filters or short spaces.</p></article></div></div></section>
    
        <section class="ia-section" id="ia-doc-bake"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Bake / export</span><h2>Commit the accident before it disappears.</h2><p>The true power of Impulse Anvil is not only processing a track in the moment. It lets you build a personal IR library from the rooms, noises, surfaces and experiments you discover.</p></div></div><div class="ia-grid ia-grid-three"><article class="ia-card"><h3>Bake Current</h3><p>Exports the currently prepared IR as a WAV file: the source, Color, Texture, morph state, Edit, EQ and Output sculpting that define the current sound.</p></article><article class="ia-card"><h3>Bake A→B</h3><p>Exports a single IR that evolves from A toward B over its tail using the selected curve and Lerp Time.</p></article><article class="ia-card"><h3>Use anywhere</h3><p>Baked files are standard WAV impulse responses, so you can load them into compatible convolution reverbs, IR loaders and cab tools.</p></article></div><div class="ia-grid ia-grid-two" style="margin-top:16px"><article class="ia-card"><h3>Good sources to try</h3><ul class="ia-list"><li>Short claps, snaps or clicks in rooms.</li><li>Fabric rubbing, leaves, paper, metal, glass and concrete.</li><li>Existing cab and room IR libraries.</li><li>Short slices from field recordings and noise beds.</li></ul></article><article class="ia-card"><h3>Instrument tips</h3><ul class="ia-list"><li>Synths, guitars, piano and vocals can take large surreal spaces well.</li><li>For bass, start with very short IR ranges and control low-end with HP/EQ.</li><li>Bake often when Random finds something unusual.</li></ul></article></div></div></section>
    
        <section class="ia-section" id="ia-doc-install"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Install / activation</span><h2>Copy the complete VST3 folder.</h2><p>Impulse Anvil ships as a zipped Windows VST3 folder bundle with the 126 handmade IR library inside.</p></div></div><div class="ia-grid ia-grid-three"><article class="ia-card"><div class="ia-number">1</div><h3>Download</h3><p>Download <code>ImpulseAnvil_Windows_VST3.zip</code>.</p></article><article class="ia-card"><div class="ia-number">2</div><h3>Extract + copy</h3><p>Copy the full <code>Impulse Anvil.vst3</code> folder to <code>C:&bsol;Program Files&bsol;Common Files&bsol;VST3</code>.</p></article><article class="ia-card"><div class="ia-number">3</div><h3>Activate</h3><p>After purchase, paste the license key from your email into the License panel inside the plugin.</p></article></div></div></section>
      </div>`;
    }
    

        function buildAnvilDownloads(){
          return `
          <div class="ia26" id="downloads">
            <section class="ia-section ia-hero"><div class="ia-shell ia-hero-grid"><div><div class="ia-download-heading"><span class="ia-eyebrow"><span class="ia-pulse"></span> Download</span><span class="ia-current-version">Current v1.0.120</span></div><h1>Impulse Anvil <span class="ia-cyan">VST3 ZIP.</span></h1><p class="ia-lead">Download the Windows VST3 folder bundle, extract it, copy the complete <code>Impulse Anvil.vst3</code> folder into the VST3 directory, then rescan your DAW.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="${IMPULSE_ANVIL_DOWNLOAD}" target="_blank" rel="noopener">Download VST3</a><a class="ia-btn lemonsqueezy-button" href="${IMPULSE_ANVIL_BUY_URL}">Get license €29</a><a class="ia-btn ia-btn-dark" href="#download-install" onclick="return iaScrollTo('download-install');">Install guide</a><a class="ia-btn ia-btn-dark" href="${DISCORD_INVITE_URL}" target="_blank" rel="noopener" aria-label="Join the Impulse Anvil Discord for setup help, free themes, free IRs, updates and videos">${DISCORD_ICON}Discord support</a></div></div><div class="ia-product-card"><div class="ia-product-window"><img src="assets/impulse-anvil-plugin-ui.png" alt="Impulse Anvil plugin interface" loading="lazy"></div></div></div></section>
            <section class="ia-section" id="download-videos"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Setup videos</span><h2>Install and activate Impulse Anvil.</h2><p>Watch the short setup walkthroughs directly here before opening your DAW.</p></div></div><div class="ia-download-video-grid"><article class="ia-card ia-download-video-card"><div class="ia-download-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/d4JgmIoF9zA" title="Impulse Anvil installation tutorial" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><h3>Installation</h3><p>Download, extract and copy the complete VST3 folder to the Windows VST3 directory.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="https://www.youtube.com/watch?v=d4JgmIoF9zA" target="_blank" rel="noopener">Open on YouTube</a></div></article><article class="ia-card ia-download-video-card"><div class="ia-download-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/mgJKXHDkyzE" title="Impulse Anvil license activation tutorial" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><h3>License activation</h3><p>Paste your license key into the plugin and unlock the full version after purchase.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="https://www.youtube.com/watch?v=mgJKXHDkyzE" target="_blank" rel="noopener">Open on YouTube</a></div></article></div></div></section>
            <section class="ia-section" id="download-install"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Install guide</span><h2>Quick Setup — Copy/Paste</h2><p>Open both folders, then copy the full <code>Impulse Anvil.vst3</code> folder into your system VST3 folder.</p></div></div><div class="ia-install-visual"><img src="assets/impulse-anvil-install-guide.png" alt="Impulse Anvil installation guide showing the downloaded VST3 folder and the system VST3 folder side by side" loading="lazy"><p class="ia-install-note">Image guide: left = extracted download folder, right = <code>C:\Program Files\Common Files\VST3</code>.</p></div><div class="ia-grid ia-grid-three"><article class="ia-card"><div class="ia-number">1</div><h3>Extract</h3><p>Unzip <code>ImpulseAnvil_Windows_VST3.zip</code>. Keep the VST3 bundle structure intact.</p></article><article class="ia-card"><div class="ia-number">2</div><h3>Copy</h3><p>Copy the complete <code>Impulse Anvil.vst3</code> folder to <code>C:&bsol;Program Files&bsol;Common Files&bsol;VST3</code>.</p></article><article class="ia-card"><div class="ia-number">3</div><h3>Rescan</h3><p>Restart or rescan your DAW. The 126 handmade IR library is bundled inside the plugin folder.</p></article></div></div></section>
            <section class="ia-section" id="download-changelog"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Changelog</span><h2>Release notes.</h2><p>Open a version to see what changed. The newest public build is listed first.</p></div></div><div class="ia-changelog">
              <details open=""><summary>v1.0.120 — JUCE 8 Maintenance Build</summary><div class="ia-changelog-body"><p>This maintenance release refreshes the Windows commercial build after migration to JUCE 8.0.13.</p><h3>Updated</h3><ul class="ia-list"><li>Rebuilt the Windows 64-bit VST3 with JUCE 8.0.13.</li><li>Refreshed the commercial release package and build process.</li><li>Corrected the license activation dialog layout after the framework migration.</li></ul><h3>Compatibility</h3><ul class="ia-list"><li>No intentional changes were made to the DSP workflow, parameter IDs, project-state format, factory IR library, license entitlement or demo restrictions.</li><li>Existing projects and sessions should remain compatible.</li><li>Replace the complete existing <code>Impulse Anvil.vst3</code> folder when updating.</li></ul></div></details><details open><summary>v1.0.120 &mdash; JUCE 8 Maintenance Build</summary><div class="ia-changelog-body"><p><span class="ia-version-pill">Current release</span></p><p>This maintenance release refreshes the Windows commercial build after migration to JUCE 8.0.13.</p><h3>Updated</h3><ul class="ia-list"><li>Rebuilt the Windows 64-bit VST3 with JUCE 8.0.13.</li><li>Updated the bundled license notices for the current release toolchain.</li><li>Corrected the license activation dialog layout after the JUCE migration.</li></ul><h3>Compatibility</h3><ul class="ia-list"><li>No intentional changes were made to the DSP workflow, parameter IDs, project-state format, factory IR library, license entitlement or demo restrictions.</li><li>Windows 10/11, 64-bit VST3.</li><li>Replace the complete existing <code>Impulse Anvil.vst3</code> folder when updating.</li></ul></div></details>
<details><summary>v1.0.119 — Workflow, Spatial Morph and Randomization Update</summary><div class="ia-changelog-body"><p>This update focuses on cleaner workflow, improved A/B slot handling, new spatial morph behavior, better loudness control, and a more coherent randomization/layout experience.</p><h3>New Spatial Morph Modes</h3><ul class="ia-list"><li>Added Stereo Slot Swap, a spatial morph field where the left channel moves from Slot A to Slot B while the right channel moves from Slot B to Slot A.</li><li>Added Mid/Side Boundary, keeping Slot A in the center/mid field while introducing Slot B into the side/outside field.</li><li>Both new Morph Modes are supported in normal Morph preview, A-to-B Lerp preview, project restore, and Lerp Bake/export.</li></ul><h3>Improved Drag &amp; Drop Slot Routing</h3><ul class="ia-list"><li>Dropping a WAV file onto the A panel now reliably loads Slot A.</li><li>Dropping a WAV file onto the B panel now reliably loads Slot B.</li><li>The empty-slot fallback behavior outside the A/B panels is preserved.</li></ul><h3>Loudness &amp; Normalize Workflow Cleanup</h3><ul class="ia-list"><li>Slot A and Slot B now have their own Normalize controls.</li><li>Old sessions that used the previous global Normalize setting remain compatible and migrate safely to the new A/B Normalize setup.</li><li>Slot Gain remains useful when Normalize is enabled, making A/B compensation easier after normalization.</li><li>Output/Post Normalize now defaults to ON, and the visible Post Limiter clearly controls final output limiting.</li><li>Random, load, and reset workflows no longer unexpectedly reset Wet Level to -30 dB, except for factory startup defaults.</li></ul><h3>Randomization Workflow Improvements</h3><ul class="ia-list"><li>A/B full-slot random buttons randomize the full slot IR selection and related full-slot behavior.</li><li>A/B Color-header random buttons randomize the current IR&apos;s Color controls only, keeping the loaded IR in place.</li><li>Morph Random is available directly in the Morph card and randomizes Morph-related controls only.</li><li>EQ and EDIT now have their own local random buttons.</li><li>A/B Random resets Slot Gain to 0 dB and no longer randomizes gain above unity.</li></ul><h3>Layout &amp; Usability Polish</h3><ul class="ia-list"><li>Init/Reset Controls has been moved into the Options menu.</li><li>Clicking the A, B, or Morph panel background now selects that mode.</li><li>Moving a Color voice knob automatically enables that Color voice, so the change is immediately audible.</li><li>Morph Mode and Curve dropdowns are now centered in the Morph panel.</li><li>K and Lerp Time now use compact horizontal controls above the curve display.</li><li>Align Peaks has been renamed to Align with a clearer tooltip.</li><li>Post random tooltip now clarifies that it affects EQ, EDIT, and OUT.</li></ul><h3>Fixes</h3><ul class="ia-list"><li>Fixed A/B WAV drag-and-drop target detection.</li><li>Fixed EDIT double-click reset behavior when linked Start/End or reverse Fade Out are active.</li><li>Fixed Morph Random build handling from the previous internal build step.</li></ul><p>Existing projects and sessions remain compatible.</p></div></details>
              <details><summary>v1.0.113 — Texture Depth Bug Fix</summary><div class="ia-changelog-body"><p>Small maintenance update for Texture Depth.</p><ul class="ia-list"><li>Fixed a &quot;Texture&quot; bug, previously introducing the wrong IR when tweaking parameters.</li></ul></div></details>
              <details><summary>v1.0.112 — Prepared IR length policy</summary><div class="ia-changelog-body"><p>This update makes prepared IR length handling more predictable across preview, editing, statistics and baking.</p><ul class="ia-list"><li>Preserves quiet reverb tails that belong to the loaded or processed IR instead of trimming them unexpectedly.</li><li>Uses the same prepared-IR length policy for convolver preview, A/B slot stats, Bake and A→B Lerp export.</li><li>Keeps a hard 30-second safety cap for generated Color, Texture, Morph and Lerp results.</li><li>Prevents mismatches between long Color/Texture stats, shorter Edit ranges and convolver safety kernels.</li><li>Color, Texture, Morph, Lerp, project restore, Normalize and Limiter behavior are unchanged.</li></ul></div></details>
              <details><summary>v1.0.110 — Release polish and safety</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Improved C1/C2 Color switch rendering so the labels stay readable in tight rows.</li><li>A/B prepared IR stats are now laid out directly in the active manual A/B panels.</li><li>Improved Lerp curve display readability in the default theme.</li><li>Theme randomizer tooltip now shows the current theme name.</li><li>Normalize tooltips now warn clearly that quiet IRs can become much louder.</li><li>A/B/Morph switching now uses a safer unity-sum crossfade to reduce brief correlated level boosts.</li><li>Spectral, BandSwap and ZigZag Lerp snapshots are normalized when Normalize is enabled, reducing weak or silent middle sections.</li></ul></div></details>
              <details><summary>v1.0.109 — Slot stats and default-theme polish</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Added per-slot prepared IR stats for A and B: Peak, RMS and IR length.</li><li>Slot stats follow the prepared slot after Time, Gain, Color, Texture Depth and Normalize.</li><li>Color voice switches now draw as compact C1/C2 controls instead of being shortened to ellipses.</li><li>The factory Anvil Blue theme was slightly calmed for a cleaner first-run look.</li><li>Stats update from the editor side with throttling; no audio-thread work was added.</li></ul></div></details>
              <details><summary>v1.0.108 — Color label polish</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Color enable switches now display C1 and C2 visibly.</li><li>Added clearer C1/C2 tooltips for A and B Color voices.</li><li>No DSP, Morph/Lerp, Color/Texture, backend or licensing behavior changed.</li></ul></div></details>
              <details><summary>v1.0.107 — Build safety and Lerp build indicator</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Added safer cancellation for heavy Morph/Lerp preview jobs.</li><li>Closing the editor, deleting the plugin, closing a project or quitting the DAW can now cancel pending Morph/Lerp work cleanly.</li><li>Background preview, convolver and Color jobs now check shutdown state before publishing results.</li><li>Added a subtle masthead build glow while heavy Morph/Lerp preview work is running.</li><li>The old IR keeps playing until the new preview IR is ready.</li></ul></div></details>
              <details><summary>v1.0.105 — Mode-aware A→B Lerp</summary><div class="ia-changelog-body"><ul class="ia-list"><li>A→B Lerp Preview now uses the selected Morph Mode.</li><li>Time Morph Lerp remains the default compatibility path.</li><li>Spectral, BandSwap and ZigZag Lerp are built from fixed intermediate snapshots for more mode-specific movement.</li><li>Preview, DAW project restore and Lerp export now share the same processor-side Lerp build path.</li><li>The unified Bake button still exports the prepared IR exactly as heard.</li></ul></div></details>
              <details><summary>v1.0.104 — DAW project restore fix</summary><div class="ia-changelog-body"><ul class="ia-list"><li>DAW project save/load restore now rebuilds the active internal preview IR from the processor side.</li><li>Saved A/B IR paths and A Only, B Only, Morph and Lerp state are restored without requiring the plugin editor window to be opened.</li><li>Morph restore supports Time, Spectral, BandSwap and ZigZag modes.</li><li>Baked/prepared IR audio is not stored inside the DAW project; the plugin rebuilds it from saved state.</li></ul></div></details>
              <details><summary>v1.0.103 — Editor state persistence</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Morph Mode, Align Peaks, Curve Type and Curve K now persist through the plugin state.</li><li>Closing and reopening the plugin editor no longer resets these controls to default values.</li><li>Texture Depth recursion is safer when only one Color voice is enabled.</li><li>Texture Depth and IR Gain tooltips were clarified.</li></ul></div></details>
              <details><summary>v1.0.102 — Preview identity and Align Peaks fix</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Prevents stale preview jobs from overwriting the currently processed IR.</li><li>Morph Mode changes now rebuild more deterministically, especially for spectral modes.</li><li>Strengthened preview identity handling so different spectral results are less likely to be treated as identical.</li><li>Align Peaks now only rebuilds Morph/Lerp preview and no longer reshapes A Only or B Only.</li></ul></div></details>
              <details><summary>v1.0.101 — Morph balance and spectral character</summary><div class="ia-changelog-body"><ul class="ia-list"><li>When Normalize is enabled, processed A and B endpoints are balanced before normal Morph interpolation.</li><li>This prevents a very loud Color/Texture endpoint from dominating almost the entire morph range.</li><li>Spectral, BandSwap and ZigZag modes now keep more of their direct spectral character in the middle of the Morph knob.</li><li>Morph endpoints remain exact: 0.0 is processed A and 1.0 is processed B.</li></ul></div></details>
              <details><summary>v1.0.100 — Texture Depth state fix</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Texture Depth is now the single audible source of truth: 0 is off, 1–4 are active recursive depths.</li><li>Hidden legacy parameters remain only for old-session compatibility.</li><li>Preview and convolver rebuild paths now agree when Texture Depth changes.</li><li>Fixes cases where the plugin could flip between a processed Texture/Color IR and an older/basic IR while dragging or pausing controls.</li></ul></div></details>
              <details><summary>v1.0.99 — Workflow polish</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Texture Depth was simplified into one 0–4 control.</li><li>Dry/Wet became the main dry routing control and defaults to 100% wet.</li><li>Added A/B swap for loaded IRs and slot-specific creative controls.</li><li>Preview buttons were clarified as A Only, Morph and B Only.</li><li>Post Random gained more useful edit slicing, including tiny, medium, long, forward and reversed regions.</li></ul></div></details>
              <details><summary>v1.0.97 — Launch safety and first-run UX</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Improved dry-path transparency and limiter-off behavior for normal floating-point audio.</li><li>First-run factory loading can initialize A/B even when only one valid factory/user IR is found.</li><li>Removed disruptive modal popups for normal A/B selection cases and replaced them with inline guidance.</li><li>Drag-and-drop loading now targets A or B based on where the file is dropped.</li><li>File loading accepts WAV, AIFF and FLAC through JUCE basic formats.</li><li>Texture Depth and IR Gain remain editable in more normal workflow states, with tooltips explaining the behavior.</li></ul></div></details>
              <details><summary>v1.0.95 — Edit range and precision drag update</summary><div class="ia-changelog-body"><ul class="ia-list"><li>Edit Start, End and Fade ranges now follow the prepared IR length published by the processor.</li><li>The Edit range tracks Color, Texture Depth, Morph and stretch length changes without collapsing when Start/End trim the final IR.</li><li>Shift and Ctrl precision handling is more stable during slider and knob drags.</li><li>Width behavior remains unchanged: 0.0 narrows toward mono, 1.0 keeps the original stereo width and 2.0 expands side information.</li></ul></div></details>
            </div></div></section>
          </div>`;
        }
        

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

    mainEl.innerHTML = html; refreshLemonSqueezyButtons();
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
  } refreshLemonSqueezyButtons(); updateMenuToggleTheme(window.scrollY > 0);

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
/* Impulse Anvil Lemon Squeezy checkout overlay. */
if (!window.__freqtikLemonCheckoutBound) {
  window.__freqtikLemonCheckoutBound = true;
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var link = target.closest('a');
    if (!link || link.href.indexOf('https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4') !== 0) return;

    if (window.LemonSqueezy &&
        window.LemonSqueezy.Url &&
        typeof window.LemonSqueezy.Url.Open === 'function') {
      event.preventDefault();
      window.LemonSqueezy.Url.Open(link.href);
    }
  });
}

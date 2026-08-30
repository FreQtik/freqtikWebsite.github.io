
    "use strict";

    /** steam app IDs (immutable) */
    const STEAM_IDS = Object.freeze({ ltb:2789890, aim:3666950 });
    const IMPULSE_ANVIL_DOWNLOAD = 'https://github.com/freqtik/freqtikWebsite.github.io/releases/latest/download/ImpulseAnvil_Windows_VST3.zip';
    const IMPULSE_ANVIL_MAC_RELEASE = 'https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123';
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
<a href="#" onclick="iaScrollTo('ia-morph'); return false;">Morph modes</a><a href="#" onclick="iaScrollTo('ia-authoring'); return false;">Draw / Path / Glue / Omni</a>
<a href="#" onclick="iaScrollTo('ia-interface'); return false;">Interface</a>
<a href="#" onclick="iaScrollTo('ia-trust'); return false;">Honest fit</a>
<a href="#" onclick="iaScrollTo('ia-pricing'); return false;">Pricing</a>
<a href="#" onclick="iaScrollTo('ia-faq'); return false;">FAQ</a>
<a href="/docs/impulse-anvil/">Docs</a>
<span aria-hidden="true" class="ia-nav-spacer"></span>
<a class="ia-nav-important ia-btn ia-btn-small" href="/downloads.html">Free demo</a>
<a class="ia-nav-important ia-btn ia-btn-small ia-btn-primary lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Buy &middot; &euro;49</a>
</div>
</div>
</div>
<nav aria-label="Impulse Anvil floating chapter navigation" class="ia-side-nav ia-side-nav-complete"><a class="is-active" data-ia-target="anvil" href="#" onclick="iaScrollTo('anvil'); return false;" title="Overview"><img alt="" class="ia-side-logo" src="assets/tinylogoQ.png"/><span class="ia-side-label">Overview</span></a><a data-ia-target="ia-sound" href="#" onclick="iaScrollTo('ia-sound'); return false;" title="Hear it"><span class="ia-side-step">01</span><span class="ia-side-label">Hear it</span></a><a data-ia-target="ia-workflow" href="#" onclick="iaScrollTo('ia-workflow'); return false;" title="How it works"><span class="ia-side-step">02</span><span class="ia-side-label">How it works</span></a><a data-ia-target="ia-material" href="#" onclick="iaScrollTo('ia-material'); return false;" title="The mental model"><span class="ia-side-step">03</span><span class="ia-side-label">The mental model</span></a><a data-ia-target="ia-usecases" href="#" onclick="iaScrollTo('ia-usecases'); return false;" title="Record the world"><span class="ia-side-step">04</span><span class="ia-side-label">Record the world</span></a><a data-ia-target="ia-acoustic" href="#" onclick="iaScrollTo('ia-acoustic'); return false;" title="Acoustic bodies as material"><span class="ia-side-step">05</span><span class="ia-side-label">Acoustic bodies as material</span></a><a data-ia-target="ia-morph" href="#" onclick="iaScrollTo('ia-morph'); return false;" title="Morph relationships"><span class="ia-side-step">06</span><span class="ia-side-label">Morph relationships</span></a><a data-ia-target="ia-authoring" href="#" onclick="iaScrollTo('ia-authoring'); return false;" title="Draw movement into the IR"><span class="ia-side-step">07</span><span class="ia-side-label">Draw movement into the IR</span></a><a data-ia-target="ia-focus" href="#" onclick="iaScrollTo('ia-focus'); return false;" title="Focus View"><span class="ia-side-step">08</span><span class="ia-side-label">Focus View</span></a><a data-ia-target="ia-bake-value" href="#" onclick="iaScrollTo('ia-bake-value'); return false;" title="The useful accident becomes an…"><span class="ia-side-step">09</span><span class="ia-side-label">The useful accident becomes an…</span></a><a data-ia-target="ia-interface" href="#" onclick="iaScrollTo('ia-interface'); return false;" title="Interface"><span class="ia-side-step">10</span><span class="ia-side-label">Interface</span></a><a data-ia-target="ia-themes" href="#" onclick="iaScrollTo('ia-themes'); return false;" title="Design"><span class="ia-side-step">11</span><span class="ia-side-label">Design</span></a><a data-ia-target="ia-trust" href="#" onclick="iaScrollTo('ia-trust'); return false;" title="Honest fit"><span class="ia-side-step">12</span><span class="ia-side-label">Honest fit</span></a><a data-ia-target="ia-pricing" href="#" onclick="iaScrollTo('ia-pricing'); return false;" title="Pricing"><span class="ia-side-step">13</span><span class="ia-side-label">Pricing</span></a><a data-ia-target="ia-docs" href="#" onclick="iaScrollTo('ia-docs'); return false;" title="Setup and manual"><span class="ia-side-step">14</span><span class="ia-side-label">Setup and manual</span></a><a data-ia-target="ia-faq" href="#" onclick="iaScrollTo('ia-faq'); return false;" title="FAQ"><span class="ia-side-step">15</span><span class="ia-side-label">FAQ</span></a><a class="ia-side-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1"><span class="ia-side-step">€</span><span class="ia-side-label">Full license €49</span></a></nav>
<section class="ia-section ia-hero" data-ia-positioning="v122">

<div class="ia-shell ia-hero-grid">

<div class="ia-hero-copy">

<span class="ia-eyebrow"><span class="ia-pulse"></span> Impulse-response design workstation &middot; Windows VST3</span>

<h1>Stop choosing impulse responses.<br/><span class="ia-cyan">Start making them.</span></h1>

<p class="ia-lead">Two sources in. One new response out.</p>

<p class="ia-hero-sub">Load two IRs, recordings or found sounds. Decide how they relate, draw how they move, reshape source-time, then Bake the result into a WAV you can use again.</p>

<div class="ia-actions">

<a class="ia-btn ia-hero-buy" href="/downloads.html">Download free demo</a>

<a class="ia-btn ia-btn-primary ia-hero-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Get Impulse Anvil &middot; &euro;49</a>

<a class="ia-btn ia-btn-dark" href="#" onclick="iaScrollTo('ia-sound'); return false;">Hear transformations</a>

</div>

<p class="ia-hero-fineprint">Build from two sources &middot; Draw / Path / Glue / Omni &middot; Bake reusable WAV IRs &middot; 126 included IRs &middot; Two licence seats</p><!-- IA_MAC_BETA_PRODUCT_START -->
<p class="ia-platform-beta-note"><strong>Platforms:</strong> Windows 10/11 VST3 is the primary supported commercial release. <a href="/downloads.html?platform=mac">macOS AU/VST3 testing build</a> is also available with the same demo/full-license functionality; the macOS testing build is not Developer ID signed or notarized by Apple.</p>
<!-- IA_MAC_BETA_PRODUCT_END -->

</div>

<div aria-label="Impulse Anvil interface preview" class="ia-product-card">

<div class="ia-product-window">

<img alt="Impulse Anvil impulse-response design workstation interface" decoding="async" fetchpriority="high" loading="eager" src="/assets/impulse-anvil/v122/IA_01_Master_Overview.webp" width="1129" height="696"/>

</div>

<div class="ia-float-card">

<b>The impulse response is the thing you are making.</b>

<p>A and B are material. Shape the relationship, follow the useful accident, then keep the result.</p>

</div>

</div>

</div>

</section>

<div aria-label="Impulse Anvil key facts" class="ia-proofbar">

<div class="ia-proof-item"><strong>Two sources. One new IR.</strong><span>Start with rooms, cabinets, recordings or found sounds.</span></div>

<div class="ia-proof-item"><strong>Relationships, not only fades</strong><span>Blend, split, compare, carve and transform A against B.</span></div>

<div class="ia-proof-item"><strong>Draw the route</strong><span>Author A/B movement and source-time with Draw, Path, Glue and Omni.</span></div>

<div class="ia-proof-item"><strong>Bake and reuse</strong><span>Turn discoveries into portable WAV impulse responses.</span></div>

<div class="ia-proof-item"><strong>&euro;49 full license</strong><span>The complete workstation with two licence seats.</span></div>

</div>

<section class="ia-sound-band ia-media-section" id="ia-sound">
<div class="ia-shell">
<div class="ia-section-head ia-media-head">
<div class="ia-copy">
<span class="ia-kicker">One sound. Different worlds.</span>
<h2>Hear the identity change.</h2>
<p>Watch the workstation in motion, then follow one transformation all the way through: untreated source → exact IR → Anvil result. Download the IR and try the same response on your own audio.</p>
</div>
</div>
<!-- IA_PRODUCT_VIDEO_FIX20_START -->
<div class="ia-product-video" aria-labelledby="ia-product-video-title">
  <div class="ia-product-video-head">
    <span class="ia-tag">Product showcase</span>
    <h3 id="ia-product-video-title">See Impulse Anvil in motion.</h3>
    <p>Watch the workflow first, then hear one transformation broken into its dry source, exact IR and Anvil result below.</p>
  </div>
  <div class="ia-product-video-frame">
    <button class="ia-product-video-poster" type="button" aria-label="Play the Impulse Anvil product showcase" onclick="var p=this.parentElement,f=document.createElement('iframe');f.title='Impulse Anvil product showcase';f.src='https://www.youtube-nocookie.com/embed/NFNTsQ2_1hQ?autoplay=1&amp;rel=0&amp;modestbranding=1';f.allow='autoplay; encrypted-media; picture-in-picture; web-share';f.referrerPolicy='strict-origin-when-cross-origin';f.setAttribute('allowfullscreen','');p.replaceChildren(f);">
      <img src="assets/impulse-anvil-product-showcase.webp" width="1672" height="941" loading="lazy" decoding="async" alt=""/>
      <span class="ia-product-video-play" aria-hidden="true">&#9654;</span>
    </button>
  </div>
  <div class="ia-product-video-meta">
    <span>YouTube loads only after you press play.</span>
    <a href="https://www.youtube.com/watch?v=NFNTsQ2_1hQ" target="_blank" rel="noopener noreferrer">Watch on YouTube &#8599;</a>
  </div>
</div>
<!-- IA_PRODUCT_VIDEO_FIX20_END -->
<!-- IA_REPRODUCIBLE_AUDIO_PROOF_START -->
<div class="ia-repro-proof" aria-labelledby="ia-repro-proof-title">
  <div class="ia-repro-proof-head">
    <span class="ia-tag">Reproducible transformation</span>
    <h3 id="ia-repro-proof-title">This sound. Through this IR. Becomes this.</h3>
    <p>Mystic March 2 is the exact response used here. Listen to each part separately, then download the WAV and test it on your own material.</p>
  </div>
  <div class="ia-repro-proof-grid">
    <article class="ia-repro-step">
      <span class="ia-repro-number">01</span>
      <span class="ia-kicker">This sound</span>
      <h3>Dry synth chords</h3>
      <p>The untreated four-second source.</p>
      <div class="ia-repro-media">
        <div class="ia-wave-player" data-audio-src="assets/audio/ia-proof-bad-synth-chords-dry.mp3">
          <button aria-label="Play untreated synth chords" class="ia-wave-play" type="button">&#9654;</button>
          <div class="ia-wave-main">
            <div class="ia-wave-top"><span class="ia-wave-label">Dry source</span><span class="ia-wave-time">0:00</span></div>
            <canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas>
            <audio preload="metadata" src="assets/audio/ia-proof-bad-synth-chords-dry.mp3">Your browser does not support audio playback.</audio>
          </div>
        </div>
      </div>
    </article>
    <article class="ia-repro-step ia-repro-step-ir">
      <span class="ia-repro-number">02</span>
      <span class="ia-kicker">Through this IR</span>
      <h3>Mystic March 2</h3>
      <p>The exact 1.339-second stereo WAV response.</p>
      <div class="ia-repro-media">
        <div class="ia-wave-player" data-audio-src="assets/audio/ia-proof-mystic-march-2-ir.wav">
          <button aria-label="Play Mystic March 2 impulse response" class="ia-wave-play" type="button">&#9654;</button>
          <div class="ia-wave-main">
            <div class="ia-wave-top"><span class="ia-wave-label">Impulse response</span><span class="ia-wave-time">0:00</span></div>
            <canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas>
            <audio preload="metadata" src="assets/audio/ia-proof-mystic-march-2-ir.wav">Your browser does not support audio playback.</audio>
          </div>
        </div>
      </div>
    </article>
    <article class="ia-repro-step ia-repro-step-result">
      <span class="ia-repro-number">03</span>
      <span class="ia-kicker">Becomes this</span>
      <h3>Through Impulse Anvil</h3>
      <p>The same source processed with Mystic March 2.</p>
      <div class="ia-repro-media">
        <div class="ia-wave-player" data-audio-src="assets/audio/ia-proof-bad-synth-chords-anvil.mp3">
          <button aria-label="Play synth chords processed through Impulse Anvil" class="ia-wave-play" type="button">&#9654;</button>
          <div class="ia-wave-main">
            <div class="ia-wave-top"><span class="ia-wave-label">Anvil result</span><span class="ia-wave-time">0:00</span></div>
            <canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas>
            <audio preload="metadata" src="assets/audio/ia-proof-bad-synth-chords-anvil.mp3">Your browser does not support audio playback.</audio>
          </div>
        </div>
      </div>
    </article>
  </div>
  <div class="ia-repro-download-row">
    <div class="ia-repro-download-copy"><strong>Try the exact response.</strong><span>Use Mystic March 2 on your own audio.</span></div>
    <a class="ia-btn ia-btn-small ia-repro-download" href="assets/audio/ia-proof-mystic-march-2-ir.wav" download="ImpulseAnvil_MysticMarch2.wav">Download this IR · WAV</a>
  </div>
  <p class="ia-repro-note">Load the WAV into a compatible convolution workflow or Impulse Anvil and hear how the same response behaves on your own source.</p>
</div>
<h3 class="ia-more-transformations">More transformations</h3>
<!-- IA_REPRODUCIBLE_AUDIO_PROOF_END --><div class="ia-audio-grid">
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Melody</span><h3>Piano</h3><p>One performance. A completely different direction.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-01.mp3"><button aria-label="Play piano dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-01.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Voice</span><h3>Vocal</h3><p>Turn a dry phrase into an intimate layer, unusual space or identity effect.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-02.mp3"><button aria-label="Play voice dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-02.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
<article class="ia-demo-card ia-audio-card"><span class="ia-tag">Guitar</span><h3>Guitar</h3><p>Reshape tone, resonance and space, or transform existing cabinet responses.</p><div class="ia-player-pair"><div class="ia-wave-player" data-audio-src="assets/audio/ia-example-03.mp3"><button aria-label="Play guitar dry to wet example" class="ia-wave-play" type="button">&#9654;</button><div class="ia-wave-main"><div class="ia-wave-top"><span class="ia-wave-label">Dry &rarr; Transformed</span><span class="ia-wave-time">0:00</span></div><canvas aria-hidden="true" class="ia-wave-canvas" height="58" width="217"></canvas><audio preload="metadata" src="assets/audio/ia-example-03.mp3">Your browser does not support audio playback.</audio></div></div></div></article>
</div>
</div>
</section>

<div aria-hidden="true" id="ia-position"></div>

<section class="ia-section" id="ia-workflow">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Material &rarr; relationship &rarr; response</span><h2>Make the IR before<br/>you use the IR.</h2><p>Impulse Anvil moves the creative decision one step earlier. Instead of starting with a finished response, you build the response you want to hear.</p></div></div>

<div class="ia-position-grid">

<article class="ia-position-card"><span class="ia-number">01</span><h3>Load material</h3><p>Choose two impulse responses, compatible WAV recordings, textures or found sounds. Prepare A and B independently.</p></article>

<article class="ia-position-card"><span class="ia-number">02</span><h3>Build the relationship</h3><p>Choose how the sources meet. Morph them, reveal what they share or what differs, then Draw, Path, Glue or Omni the movement you want.</p></article>

<article class="ia-position-card"><span class="ia-number">03</span><h3>Bake and reuse it</h3><p>Trim, Color, Texture, EQ, widen and level the finished response. Bake it as a WAV and use it again whenever you want.</p></article>

</div>

</div>

</section>
<section class="ia-section ia-material-section" id="ia-material">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">The mental model</span><h2>The IR is not the preset.<br/>It is the thing you are building.</h2><p>Two pieces of acoustic material go in. One designed response comes out.</p></div></div>

<div class="ia-material-flow" role="img" aria-label="Source A and Source B enter Impulse Anvil, producing a new impulse response that can be baked to WAV and reused">

<div class="ia-material-node"><span>A</span><strong>Source material</strong><small>IR · cabinet · recording · texture</small></div>

<div class="ia-material-arrow" aria-hidden="true">&rarr;</div>

<div class="ia-material-core"><span>IMPULSE ANVIL</span><strong>Design the relationship</strong><small>Morph · Draw · Path · Glue · Omni · sculpt</small></div>

<div class="ia-material-arrow ia-material-arrow-back" aria-hidden="true">&larr;</div>

<div class="ia-material-node"><span>B</span><strong>Source material</strong><small>IR · room · found sound · another Bake</small></div>

</div>

<div class="ia-material-output"><strong>NEW IR</strong><span>&rarr;</span><strong>BAKE</strong><span>&rarr;</span><strong>WAV</strong><span>&rarr;</span><strong>REUSE</strong></div>

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
<section class="ia-section" id="ia-acoustic">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Acoustic bodies as material</span><h2>What happens if you capture<br/>a guitar or violin body?</h2><p>This is where IR design becomes especially interesting - as long as the limits of the measurement are kept honest.</p></div></div>

<div class="ia-grid ia-grid-three">

<article class="ia-card"><h3>Impart body resonance</h3><p>A recorded or measured body response can be used as convolution material and can place some of that captured resonant character onto another signal. It will not completely turn an electric guitar into the acoustic instrument that was measured.</p></article>

<article class="ia-card"><h3>Compare two captures</h3><p>With matched recordings, Common, Unique, Difference and Residual relationships can help you listen to what overlaps and what remains different between A and B.</p></article>

<article class="ia-card"><h3>Add what B has that A does not</h3><p><strong>Unique B</strong> is the closest direct tool for that question. Matched Residual, Spectral Carve and Transfer offer other ways to explore the relationship when level, spectrum or transformation matters.</p></article>

</div>

<div class="ia-portable-note"><strong>Important:</strong> one captured IR is a linearized response under one excitation, position, microphone and environment. It can reveal useful resonant differences, but it does not prove why one instrument is more valuable or reproduce every dynamic and directional behavior of the physical instrument.</div>

<div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/workflows/acoustic-bodies/">Acoustic bodies &amp; comparison guide</a></div>

</div>

</section>

<section class="ia-section" id="ia-morph">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">A and B can meet in different ways</span><h2>Choose the relationship,<br/>not just the amount.</h2><p>The full workstation contains 21 Morph relationships. You do not need to learn all of them first. Start with the question you are trying to answer.</p></div></div>

<figure class="ia-feature-shot ia-feature-shot-wide"><img src="/assets/impulse-anvil/v122/IA_06_Morph_Mode_Browser.webp" width="1128" height="698" loading="lazy" decoding="async" alt="Impulse Anvil Morph Mode browser showing the relationship library and selected-mode explanation"/><figcaption>Choose by intention first. The browser then explains what the relationship is for, how Morph behaves and the deeper technical model.</figcaption></figure>
<div class="ia-mode-stage">

<article class="ia-mode-intro">

<div>

<span class="ia-eyebrow"><span class="ia-pulse"></span> Core Morph &middot; Residual / Decompose &middot; Acoustic Interaction</span>

<h3>Sometimes you want a hybrid. Sometimes you want the difference.</h3>

<p>The mode browser keeps the full library organized and explains what each relationship is useful for, how Morph behaves and what is happening underneath.</p>

</div>

<ul class="ia-list">

<li><strong>Core Morph:</strong> direct, spectral and stereo relationships.</li>

<li><strong>Residual / Decompose:</strong> shared material, unique material and different kinds of leftovers.</li>

<li><strong>Acoustic Interaction:</strong> compound, transfer, magnitude/phase and more experimental structural relationships.</li>

<li>Draw, Path, Glue and Omni can control depth through the selected relationship where supported by the mode.</li>

</ul>

</article>

<div class="ia-mode-list ia-relation-grid">

<article class="ia-mode-card"><b>Blend</b><h3>Build a hybrid</h3><p>Move from one prepared response toward another directly, spectrally or across stereo structure.</p></article>

<article class="ia-mode-card"><b>Split</b><h3>Let different regions come from different places</h3><p>Divide spectral or stereo ownership so A and B do not have to contribute in the same way everywhere.</p></article>

<article class="ia-mode-card"><b>Reveal</b><h3>Hear what is shared - or what remains</h3><p>Use Common, Unique, Difference and Residual relationships when the contrast between A and B is more interesting than a normal blend.</p></article>

<article class="ia-mode-card"><b>Transform</b><h3>Build relationships neither source contains alone</h3><p>Nest, Transfer, Ghost, Eclipse and Spectral Time Shear push A/B interaction into more deliberately constructed territory.</p></article>

</div>

<div class="ia-actions" style="margin-top:22px"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/sections/morph/">Explore the Morph relationships</a></div>

</div>

</div>

</section>
<section class="ia-section ia-authoring-section" id="ia-authoring"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Draw movement into the IR</span><h2>Paint it. Route it. Glue it.<br/>Make the gesture become time.</h2><p>The curve display is now a construction surface. Draw controls the relationship, Path routes source-time, Glue assembles pieces, and Omni Path makes the full 2-D gesture contribute to output time.</p></div></div><div class="ia-shot-grid ia-shot-grid-three" aria-label="Draw Path and Glue Path examples"><figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_03_Morph_Draw.webp" width="1128" height="697" loading="lazy" decoding="async" alt="Impulse Anvil Draw mode with an authored A to B curve"/><figcaption><strong>Draw</strong> — paint the relationship.</figcaption></figure><figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_04_Morph_Path.webp" width="1128" height="697" loading="lazy" decoding="async" alt="Impulse Anvil Path moving forward backward and forward through source time"/><figcaption><strong>Path</strong> — route through source-time.</figcaption></figure><figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_05_Morph_Glue_Path.webp" width="1128" height="697" loading="lazy" decoding="async" alt="Impulse Anvil Glue Path with separate authored source-time strokes"/><figcaption><strong>Glue Path</strong> — assemble a new timeline from pieces.</figcaption></figure></div><div class="ia-grid ia-grid-two"><article class="ia-card"><span class="ia-tag">Draw</span><h3>Paint how A and B change</h3><p>Draw the A/B or relationship movement directly through the IR timeline.</p></article><article class="ia-card"><span class="ia-tag">Path</span><h3>Move through source-time</h3><p>Horizontal travel is the clock. Move right to read later source material or left to revisit earlier material. Vertical movement changes A/B or relationship depth.</p></article><article class="ia-card"><span class="ia-tag">Glue Path</span><h3>Assemble a new timeline from pieces</h3><p>Each stroke becomes the next piece of the output. Glue keeps its own horizontal route timing and remains independent of Lerp Start and Lerp Time.</p></article><article class="ia-card"><span class="ia-tag">Omni Path</span><h3>Make the whole gesture become time</h3><p>X still reads the selected Lerp source window and Y still controls A/B or relationship depth. Omni changes the clock: both horizontal and vertical travel create output duration.</p></article></div><div class="ia-portable-note"><strong>Omni timing in one sentence:</strong> Lerp Start offsets the source window Omni reads, Lerp Time scales the width of that window, and the drawn 2-D travel distance is converted through that window into the final IR timeline.</div><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/sections/curves-path/">Learn Draw, Path, Glue &amp; Omni</a><a class="ia-btn" href="/docs/impulse-anvil/workflows/omni-path/">Omni Path workflow</a></div></div></section>
<section class="ia-section" id="ia-focus">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">See everything. Then lean into one part.</span><h2>Overview for context.<br/>Focus View for precision.</h2><p>The six work areas stay visible in Overview. When one deserves attention, Focus View expands the same live controls instead of opening a second copy of the plugin.</p></div></div>

<div class="ia-shot-grid ia-shot-grid-two">
<figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_02_Morph_Focus.webp" width="1129" height="699" loading="lazy" decoding="async" alt="Impulse Anvil Morph Focus View with large waveform and curve workspace"/><figcaption>Morph Focus gives the authored response most of the workspace.</figcaption></figure>
<figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_07_IR_Browser.webp" width="1130" height="696" loading="lazy" decoding="async" alt="Impulse Anvil IR Browser comparing a candidate against the current source"/><figcaption>Inspect and compare a candidate before committing it to A or B.</figcaption></figure>
</div>
<div class="ia-grid ia-grid-three">

<article class="ia-card"><h3>Focus the module</h3><p>Open A, Morph, B, EQ, Edit or Out into a larger workspace. Use the Focus control or double-click genuine empty panel space; Esc or the exposed background brings the overview back.</p></article>

<article class="ia-card"><h3>Explore without losing the good version</h3><p>Global Undo and Redo treat deliberate edits as meaningful steps, including IR loads, Morph changes and Draw/Path/Glue/Omni gestures. The local curve Undo remains available for curve editing.</p></article>

<article class="ia-card"><h3>Browse before you commit</h3><p>The IR Browser lets you search, inspect waveforms and stats, compare against the current slot and load only when the candidate is worth keeping.</p></article>

</div>

<div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/getting-started/focus-view/">Focus View</a><a class="ia-btn" href="/docs/impulse-anvil/getting-started/ir-browser/">IR Browser</a></div>

</div>

</section>
<section class="ia-section ia-bake-value" id="ia-bake-value">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">The useful accident becomes an asset</span><h2>Find it. Refine it.<br/>Turn it into a file.</h2><p>Exploration is more valuable when the result can leave the experiment behind.</p></div></div>

<div class="ia-material-output ia-bake-flow"><strong>EXPERIMENT</strong><span>&rarr;</span><strong>BAKE</strong><span>&rarr;</span><strong>WAV</strong><span>&rarr;</span><strong>REUSE</strong></div>

<div class="ia-grid ia-grid-three" style="margin-top:18px">

<article class="ia-card"><h3>Keep the exact response</h3><p>Bake the prepared IR after source shaping, Morph construction, Edit, EQ and IR-output preparation.</p></article>

<article class="ia-card"><h3>Use it elsewhere</h3><p>The full version writes a standard WAV impulse response for compatible convolution software and IR loaders.</p></article>

<article class="ia-card"><h3>Build another generation</h3><p>Load a Bake back into A or B, combine it with something else and keep transforming the material.</p></article>

</div>

</div>

</section>

<div aria-hidden="true" id="ia-draw-path"></div>
<section class="ia-section" id="ia-interface">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">One workstation</span><h2>The complete path stays visible.</h2><p>Overview shows where the response is being built. Focus View and the in-plugin browsers appear only when you need more room or more information.</p></div></div>

<div class="ia-anatomy">

<div class="ia-bare-product-shot"><div class="ia-product-window"><img alt="Impulse Anvil interface overview" decoding="async" loading="lazy" src="/assets/impulse-anvil/v122/IA_01_Master_Overview.webp" width="1129" height="696"/></div></div>

<div class="ia-callout-list">

<div class="ia-callout"><h3>A / B material</h3><p>Load factory IRs, your own IRs or compatible recordings. Inspect candidates in the IR Browser, then prepare Time, Gain, Color, Texture and Normalize per source.</p></div>

<div class="ia-callout"><h3>Morph relationships</h3><p>Choose from the organized Morph browser, set the direction where the relationship needs one, then use the Morph amount or author it through Draw, Path, Glue or Omni.</p></div>

<div class="ia-callout"><h3>Focus when it matters</h3><p>Expand A, Morph, B, EQ, Edit or Out without creating a second set of controls. The same state returns to Overview when Focus closes.</p></div>

<div class="ia-callout"><h3>Edit, finish and Bake</h3><p>Isolate the useful region, shape frequency and width, prepare the output IR and turn the final construction into a reusable WAV.</p></div>

</div>

</div>

<div class="ia-shot-grid ia-shot-grid-three ia-finish-shots">
<figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_09_Edit_Focus.webp" width="1128" height="697" loading="lazy" decoding="async" alt="Impulse Anvil Edit Focus View"/><figcaption>Edit the useful region.</figcaption></figure>
<figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_10_EQ_Focus.webp" width="1129" height="700" loading="lazy" decoding="async" alt="Impulse Anvil EQ Focus View"/><figcaption>Shape the spectrum.</figcaption></figure>
<figure class="ia-feature-shot"><img src="/assets/impulse-anvil/v122/IA_11_Out_Focus.webp" width="1129" height="697" loading="lazy" decoding="async" alt="Impulse Anvil Out Focus View"/><figcaption>Prepare the finished response.</figcaption></figure>
</div>
</div>

</section>
<section class="ia-section" id="ia-themes">
<div class="ia-shell">
<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Visual system</span><h2>Liquid Slate by default.<br/>Personal when you want it.</h2><p>The DESIGN workspace keeps appearance separate from sound. Browse, import, edit and save compatible designs without changing the IR you are building.</p></div></div>
<figure class="ia-feature-shot ia-feature-shot-wide"><img src="/assets/impulse-anvil/v122/IA_12_Design_Themes.webp" width="1129" height="698" loading="lazy" decoding="async" alt="Impulse Anvil DESIGN workspace with theme browser and panel color editor"/><figcaption>Liquid Slate remains the default design; the same workspace can manage imported and custom themes.</figcaption></figure>
<div class="ia-grid ia-grid-three">
<article class="ia-card"><h3>One design system</h3><p>A, B, Morph, EQ, Edit and Out can inherit the global design or use compatible section-level color ownership.</p></article>
<article class="ia-card"><h3>Browse without leaving Anvil</h3><p>The persistent DESIGN navigator opens the focused workspace for choosing and managing designs.</p></article>
<article class="ia-card"><h3>Shareable JSON</h3><p>Compatible theme JSON can be imported, edited and saved without touching the audio engine.</p></article>
</div>
</div>
</section>
<section class="ia-section" id="ia-trust">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Honest fit</span><h2>Know what you are buying.</h2><p>Impulse Anvil is built for deliberate impulse-response construction, exploration and WAV creation rather than continuous performance automation of every shaping control.</p></div></div>

<div class="ia-fit-grid">

<article class="ia-fit-card is-positive"><h3>It is a strong fit when you want to...</h3><ul class="ia-list"><li>Build new IRs from two pieces of acoustic or recorded material</li><li>Choose structural relationships instead of relying on one normal crossfade</li><li>Explore shared, unique, residual and more experimental A/B relationships</li><li>Draw movement, revisit source-time or assemble a response with Glue Path</li><li>Bake portable WAV IRs and build a growing personal library</li></ul></article>

<article class="ia-fit-card"><h3>Important before you buy</h3><ul class="ia-list ia-list-warn"><li>Many IR-shaping edits rebuild the response and are intended for design rather than continuous live knob automation</li><li>Heavy analysis modes and very long or dense material can require more preparation time</li><li>An acoustic-body capture is a measured/recorded linear response, not a complete physical model of the original instrument</li><li>Windows 10/11, 64-bit VST3 is the primary supported commercial release.</li><li>macOS AU/VST3 is available as a testing build with full plug-in functionality. It is not distributed with an Apple Developer ID signature and is not notarized by Apple, so manual Gatekeeper approval may be required.</li><li>Delivery is a manual ZIP bundle rather than an installer</li><li>Use source recordings and IRs you own or are permitted to process</li></ul></article>

</div>

</div>

</section>
<section class="ia-section" id="ia-pricing">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Pricing</span><h2>Try the core idea.<br/>Unlock the complete workstation.</h2><p>Impulse Anvil opens in demo mode on both distribution tracks. The same purchased license unlocks the complete relationship library, authored movement and WAV creation workflow on Windows and on the macOS testing build.</p></div></div>

<div class="ia-pricing">

<article class="ia-card ia-price-card">

<span class="ia-tag">Demo</span><h3>Explore the sound</h3><div class="ia-price"><strong>&euro;0</strong><span>download</span></div>

<p class="ia-muted">Test Impulse Anvil in your own DAW before purchasing.</p>

<ul class="ia-list"><li>Windows VST3 stable build; macOS AU/VST3 testing build available separately</li><li>126 included IRs</li><li>Time Morph available</li><li>One Color row per IR</li><li>Periodic subtle demo noise</li><li>No A&rarr;B Lerp or WAV baking</li></ul>

<div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/downloads.html">Download free demo</a></div>

</article>

<article class="ia-card ia-price-card ia-price-card-featured">

<span class="ia-tag">Full license</span><h3>Impulse Anvil Full License</h3><div class="ia-price"><strong>&euro;49</strong><span>one-time</span></div>

<p class="ia-muted">The complete impulse-response design workstation.</p>

<ul class="ia-list"><li>Complete 21-mode Morph relationship library</li><li>Core Morph, Residual / Decompose and Acoustic Interaction families</li><li>Draw, Path, Glue and Omni Path authoring</li><li>Mode-aware A&rarr;B Lerp and standard WAV baking</li><li>Focus View, IR Browser, Morph browser and global Undo / Redo</li><li>Two Color rows per IR plus Texture Depth</li><li>Edit, visual EQ, width and final IR preparation</li><li>2 seats per license</li></ul>

<div class="ia-actions"><a class="ia-btn ia-btn-primary lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Get Impulse Anvil &middot; &euro;49</a><a class="ia-btn ia-btn-dark" href="/downloads.html">Install and activation</a></div>

</article>

</div>

<div class="ia-portable-note"><strong>Your exported IRs remain portable.</strong> Full-version bakes are standard WAV impulse responses, so a useful result does not have to stay trapped inside the preset that created it.</div>

</div>

</section>
<section class="ia-section" id="ia-docs">
<div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Setup and manual</span><h2>Detailed when you need it.<br/>Out of the way when you do not.</h2><p>The documentation covers Quickstart, every Morph relationship, Draw, Path, Glue and Omni, Color/Texture, editing, EQ/output, Bake, installation, troubleshooting and focused creative workflows.</p></div></div><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/">Open documentation</a><a class="ia-btn" href="/downloads.html">Downloads and setup</a><a class="ia-btn ia-btn-dark" href="https://discord.gg/qUetz23QPq" rel="noopener" target="_blank"><svg aria-hidden="true" class="ia-discord-icon" focusable="false" viewbox="0 0 24 24"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3l-.2.4c1.7.5 2.5 1.2 2.5 1.2a15.8 15.8 0 0 0-5.8-1.8 15.8 15.8 0 0 0-5.8 1.8s.8-.7 2.6-1.2L8.5 3a19.6 19.6 0 0 0-4.8 1.4C.7 8.8-.1 13.1.3 17.3A19.8 19.8 0 0 0 6.2 20l.7-1.1c-1.3-.4-2.5-1.1-3.5-2 .3.2.6.4.9.6 3.6 2 8.4 2.6 13.7 0 .3-.2.6-.4.9-.6-1 .9-2.2 1.6-3.5 2l.7 1.1a19.8 19.8 0 0 0 5.9-2.7c.5-4.8-.8-9-1.7-12.9ZM8.1 14.7c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Zm7.8 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Z" fill="currentColor"></path></svg>Community support</a></div></div>
</section>
<section class="ia-section" id="ia-faq">

<div class="ia-shell">

<div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">FAQ</span><h2>Clear answers before checkout.</h2></div></div>

<div class="ia-faq">

<details open=""><summary>What is Impulse Anvil?</summary><p>Impulse Anvil is an impulse-response design workstation. Load two IRs, recordings or found sounds, decide how they relate, shape the result and Bake a reusable WAV impulse response.</p></details>

<details><summary>Is it a convolution reverb?</summary><p>It can audition the response through convolution, but the product is centered on making and shaping the impulse response itself rather than only choosing a finished reverb preset.</p></details>

<details><summary>Do A and B only crossfade?</summary><p>No. The full version contains 21 relationships across Core Morph, Residual / Decompose and Acoustic Interaction families. They include direct and spectral blends, stereo structures, shared/unique material, residual relationships and more experimental transformations.</p></details>

<details><summary>What are Draw, Path, Glue and Omni Path?</summary><p>Draw paints how the selected relationship changes over the IR. Path adds forward/backward source-time travel. Glue Path appends separate painted pieces and owns its duration independently of Lerp Start/Time. Omni Path keeps X as source-time and Y as relationship depth, while both horizontal and vertical route travel create output time.</p></details>

<details><summary>What does A&rarr;B Lerp do?</summary><p>It creates one prepared IR whose relationship changes internally over its duration. The selected Morph mode and curve/path define the construction, and the result can be baked into one WAV instead of requiring live automation.</p></details>

<details><summary>Can I record the body of a guitar or violin and use it as an IR?</summary><p>Yes, as creative convolution material. A controlled capture can impose some of the body's measured resonant character onto another signal. It does not fully clone the physical instrument, because one IR does not capture every dynamic, nonlinear, directional, pickup, bridge and radiation behavior.</p></details>

<details><summary>Can I compare two instrument-body captures?</summary><p>Yes. Under matched capture conditions, Common, Unique A/B, Difference and Residual modes can help you audition what overlaps and what differs. Transfer can estimate a stabilized transformation between A and B. These are useful analytical and creative views, not proof of why one instrument is objectively better.</p></details>

<details><summary>Can I use only what B has that A does not?</summary><p><strong>Unique B</strong> is designed around that exact relationship: progressively remove the component estimated to be shared with A and keep what remains characteristic of B. Matched Residual, Spectral Carve and Transfer provide related alternatives depending on what you are trying to isolate.</p></details>

<details><summary>Can I load normal recordings and found sounds?</summary><p>Yes. Compatible recordings can become convolution material. Short fragments often behave like complex resonant or tonal fingerprints; longer material can introduce more obvious timing and decay behavior.</p></details>

<details><summary>What gets baked?</summary><p>The prepared IR path is baked: A/B preparation, the current Morph/Lerp construction, Edit, IR-input preparation, EQ, Width, Normalize and Limiter as documented. Playback-only controls such as Dry/Wet and final track Output are not a substitute for preparing the IR itself.</p></details>

<details><summary>Can I use baked WAVs elsewhere?</summary><p>Yes. The full version writes standard WAV impulse responses for compatible convolution software and IR loaders.</p></details>

<details><summary>What does the demo include?</summary><p>The demo lets you test the Windows VST3 with the included library, Time Morph and a reduced Color workflow. It adds subtle periodic demo noise and does not unlock the complete Morph library, A&rarr;B Lerp or WAV baking.</p></details>

<details><summary>What platforms are supported?</summary><p>Windows 10/11, 64-bit VST3 is the primary supported commercial release. A macOS AU/VST3 testing build is also available from the Downloads page. The macOS testing build uses the same demo/full-license system and unlocks the complete plug-in functionality with a valid Impulse Anvil license, but it is not distributed with an Apple Developer ID signature and is not notarized by Apple, so macOS may require manual approval.</p></details><details><summary>Is the macOS testing build feature-limited?</summary><p>No. Testing-build status describes the current macOS distribution/support path, not a reduced feature tier. The build starts in the normal Impulse Anvil demo state; the same purchased license unlocks the complete functionality. The important difference is distribution trust: the macOS testing build is not Apple Developer ID signed and has not been notarized by Apple.</p></details>

</div>

</div>

</section>
<section class="ia-section">
<div class="ia-shell">
<div class="ia-final-cta">
<span class="ia-kicker">Impulse Anvil</span>
<h2>Morph IRs.<br/><span class="ia-cyan">Bake WAVs.</span></h2>
<p>Start with the free demo. Load your own sounds, explore the included library and hear what Impulse Anvil does inside your own music.</p>
<div class="ia-actions" style="justify-content:center"><a class="ia-btn ia-hero-buy" href="/downloads.html">Download free demo</a><a class="ia-btn ia-btn-primary ia-hero-buy lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Get Impulse Anvil · €49</a></div>
</div>
</div>
</section>
</div>
`; }
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
    function buildDocs(){ return `<div class="ia26"><section class="ia-section ia-hero"><div class="ia-shell"><span class="ia-eyebrow"><span class="ia-pulse"></span> Impulse Anvil documentation</span><h1>The manual has moved.</h1><p class="ia-lead">Use the canonical multi-page documentation for current Impulse Anvil 1.0.122 behavior.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="/docs/impulse-anvil/">Open documentation</a></div></div></section></div>`; }
    function buildAnvilDownloads(){ return `
<div class="ia26" id="downloads">
<section class="ia-section ia-hero"><div class="ia-shell ia-hero-grid"><div><div class="ia-download-heading"><span class="ia-eyebrow"><span class="ia-pulse"></span> Download</span><span class="ia-current-version">Current v1.0.122</span></div><h1>Impulse Anvil <span class="ia-cyan">VST3 ZIP.</span></h1><p class="ia-lead">Download the Windows VST3 folder bundle, extract it, copy the complete <code>Impulse Anvil.vst3</code> folder into the VST3 directory, then rescan your DAW.</p><div class="ia-actions"><a class="ia-btn ia-btn-primary" href="https://github.com/freqtik/freqtikWebsite.github.io/releases/latest/download/ImpulseAnvil_Windows_VST3.zip" rel="noopener" target="_blank">Download VST3</a><a class="ia-btn lemonsqueezy-button" href="https://freqtik.lemonsqueezy.com/checkout/buy/4b848f45-e481-4b69-9203-aaea3b9afdd4?embed=1">Get license €49</a><a class="ia-btn ia-btn-dark" href="#download-install" onclick="return iaScrollTo('download-install');">Install guide</a><a class="ia-btn ia-btn-dark" href="/docs/impulse-anvil/">Documentation</a><a aria-label="Join the Impulse Anvil Discord for setup help, free themes, free IRs, updates and videos" class="ia-btn ia-btn-dark" href="https://discord.gg/qUetz23QPq" rel="noopener" target="_blank"><svg aria-hidden="true" class="ia-discord-icon" focusable="false" viewbox="0 0 24 24"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3l-.2.4c1.7.5 2.5 1.2 2.5 1.2a15.8 15.8 0 0 0-5.8-1.8 15.8 15.8 0 0 0-5.8 1.8s.8-.7 2.6-1.2L8.5 3a19.6 19.6 0 0 0-4.8 1.4C.7 8.8-.1 13.1.3 17.3A19.8 19.8 0 0 0 6.2 20l.7-1.1c-1.3-.4-2.5-1.1-3.5-2 .3.2.6.4.9.6 3.6 2 8.4 2.6 13.7 0 .3-.2.6-.4.9-.6-1 .9-2.2 1.6-3.5 2l.7 1.1a19.8 19.8 0 0 0 5.9-2.7c.5-4.8-.8-9-1.7-12.9ZM8.1 14.7c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Zm7.8 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2s2 1 2 2.2c0 1.2-.9 2.2-2 2.2Z" fill="currentColor"></path></svg>Discord support</a></div></div><div class="ia-product-card"><div class="ia-product-window"><img alt="Impulse Anvil plugin interface" loading="lazy" src="assets/impulse-anvil-plugin-ui.png"/></div></div></div></section>
<section class="ia-section" id="download-videos"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Setup videos</span><h2>Install and activate Impulse Anvil.</h2><p>Watch the short setup walkthroughs directly here before opening your DAW.</p></div></div><div class="ia-download-video-grid"><article class="ia-card ia-download-video-card"><div class="ia-download-video-frame"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" loading="lazy" src="https://www.youtube-nocookie.com/embed/d4JgmIoF9zA" title="Impulse Anvil installation tutorial"></iframe></div><h3>Installation</h3><p>Download, extract and copy the complete VST3 folder to the Windows VST3 directory.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="https://www.youtube.com/watch?v=d4JgmIoF9zA" rel="noopener" target="_blank">Open on YouTube</a></div></article><article class="ia-card ia-download-video-card"><div class="ia-download-video-frame"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" loading="lazy" src="https://www.youtube-nocookie.com/embed/mgJKXHDkyzE" title="Impulse Anvil license activation tutorial"></iframe></div><h3>License activation</h3><p>Paste your license key into the plugin and unlock the full version after purchase.</p><div class="ia-actions"><a class="ia-btn ia-btn-small" href="https://www.youtube.com/watch?v=mgJKXHDkyzE" rel="noopener" target="_blank">Open on YouTube</a></div></article></div></div></section>
<section class="ia-section" id="download-install"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Install guide</span><h2>Quick Setup — Copy/Paste</h2><p>Open both folders, then copy the full <code>Impulse Anvil.vst3</code> folder into your system VST3 folder.</p></div></div><div class="ia-install-visual"><img alt="Impulse Anvil installation guide showing the downloaded VST3 folder and the system VST3 folder side by side" loading="lazy" src="assets/impulse-anvil-install-guide.png"><p class="ia-install-note">Image guide: left = extracted download folder, right = <code>C:\\Program Files\\Common Files\\VST3</code>.</p></div><div class="ia-grid ia-grid-three"><article class="ia-card"><div class="ia-number">1</div><h3>Extract</h3><p>Unzip <code>ImpulseAnvil_Windows_VST3.zip</code>. Keep the VST3 bundle structure intact.</p></article><article class="ia-card"><div class="ia-number">2</div><h3>Copy</h3><p>Copy the complete <code>Impulse Anvil.vst3</code> folder to <code>C:\\Program Files\\Common Files\\VST3</code>.</p></article><article class="ia-card"><div class="ia-number">3</div><h3>Rescan</h3><p>Restart or rescan your DAW. The 126 handmade IR library is bundled inside the plugin folder.</p></article></div></div></section>
<section class="ia-section" id="download-changelog"><div class="ia-shell"><div class="ia-section-head"><div class="ia-copy"><span class="ia-kicker">Changelog</span><h2>Release notes.</h2><p>Open a version to see what changed. The newest public build is listed first.</p></div></div><div class="ia-changelog">
<details open=""><summary>v1.0.122 &mdash; IR Design Workstation Update</summary><div class="ia-changelog-body"><h4>Current package addition: Omni Path</h4><p>Omni Path uses the selected Lerp Start and Lerp Time source window, but its output clock comes from the full 2-D route. Horizontal and vertical movement both consume time while X remains source-time and Y remains A/B or relationship depth.</p><ul class="ia-list"><li>Vertical movement creates real duration.</li><li>Lerp Start offsets the source region Omni reads.</li><li>Lerp Time scales the source window and the route duration derived from it.</li><li>Glue Path remains independent of Lerp Start/Time.</li></ul><p><span class="ia-version-pill">Current release</span></p><p>Impulse Anvil expands from A/B morphing into a much deeper impulse-response construction workstation.</p><h3>21 Morph relationships</h3><ul class="ia-list"><li>The full Morph library now contains 21 ways for A and B to interact.</li><li>New Residual / Decompose relationships can reveal what two responses share, what belongs mainly to A or B, and where they differ.</li><li>New Acoustic Interaction relationships add Nest, Transfer, Ghost, Eclipse and Spectral Time Shear for more unusual structural transformations.</li></ul><h3>Glue Path</h3><ul class="ia-list"><li>Draw separate pieces from anywhere in source-time and join them into one new sequential IR.</li><li>Move forward or backward through the source inside each stroke.</li><li>The route itself determines the constructed timing, independently of normal Lerp timing.</li></ul><h3>Focus View</h3><ul class="ia-list"><li>Expand A, Morph, B, EQ, Edit or Out into a larger workspace when one part needs more precision.</li><li>Return to Overview without changing the underlying sound or state.</li></ul><h3>New browsers &amp; safer exploration</h3><ul class="ia-list"><li>The IR Browser adds search, waveform/stats inspection and Compare before loading a candidate into A or B.</li><li>The Morph Browser organizes the larger mode library and explains what each relationship is for.</li><li>Global Undo / Redo lets you explore IR loads, Morph changes and Draw / Path / Glue edits without losing a good state.</li></ul><h3>DESIGN workspace</h3><ul class="ia-list"><li>A persistent DESIGN workflow now handles theme browsing, importing, editing and saving.</li><li>Liquid Slate is the new default visual design.</li></ul></div></details><details><summary>v1.0.121 &mdash; Draw &amp; Path Authoring</summary><div class="ia-changelog-body"><p>Expanded the curve system from preset shapes into direct IR authoring.</p><ul class="ia-list"><li>Added Draw curves with Undo, Smooth, Precision Nodes, Free endpoints and Reset.</li><li>Added Path routing through source-time, including real backward travel that can revisit earlier IR samples.</li><li>Lerp Start and Lerp Time moved to direct millisecond timing and follow the available prepared IR duration.</li><li>A/B waveforms became visible behind the curve for source-length and landmark guidance.</li><li>Fade In now supports a true authored 0 ms path for micro-IR work.</li><li>Color Offset expanded to 500 ms.</li><li>Theme Schema 2 added optional per-panel styling while preserving Schema 1 compatibility.</li><li>Improved IR browsing defaults, dialogs and control tooltips.</li><li>Draw/Path Preview and Bake share the prepared rendering path.</li></ul></div></details><details><summary>v1.0.120 &mdash; JUCE 8 Maintenance Build</summary><div class="ia-changelog-body"><p>This maintenance release refreshed the Windows commercial build after migration to JUCE 8.0.13.</p><ul class="ia-list"><li>Rebuilt the Windows 64-bit VST3 with JUCE 8.0.13.</li><li>Refreshed the commercial release package and build process.</li><li>Corrected the license activation dialog layout after the framework migration.</li></ul><p>Existing projects and sessions remained compatible.</p></div></details>


<details><summary>v1.0.119 — Workflow, Spatial Morph and Randomization Update</summary><div class="ia-changelog-body"><p>This update focuses on cleaner workflow, improved A/B slot handling, new spatial morph behavior, better loudness control, and a more coherent randomization/layout experience.</p><h3>New Spatial Morph Modes</h3><ul class="ia-list"><li>Added Stereo Slot Swap, a spatial morph field where the left channel moves from Slot A to Slot B while the right channel moves from Slot B to Slot A.</li><li>Added Mid/Side Boundary, keeping Slot A in the center/mid field while introducing Slot B into the side/outside field.</li><li>Both new Morph Modes are supported in normal Morph preview, A-to-B Lerp preview, project restore, and Lerp Bake/export.</li></ul><h3>Improved Drag &amp; Drop Slot Routing</h3><ul class="ia-list"><li>Dropping a WAV file onto the A panel now reliably loads Slot A.</li><li>Dropping a WAV file onto the B panel now reliably loads Slot B.</li><li>The empty-slot fallback behavior outside the A/B panels is preserved.</li></ul><h3>Loudness &amp; Normalize Workflow Cleanup</h3><ul class="ia-list"><li>Slot A and Slot B now have their own Normalize controls.</li><li>Old sessions that used the previous global Normalize setting remain compatible and migrate safely to the new A/B Normalize setup.</li><li>Slot Gain remains useful when Normalize is enabled, making A/B compensation easier after normalization.</li><li>Output/Post Normalize now defaults to ON, and the visible Post Limiter clearly controls final output limiting.</li><li>Random, load, and reset workflows no longer unexpectedly reset Wet Level to -30 dB, except for factory startup defaults.</li></ul><h3>Randomization Workflow Improvements</h3><ul class="ia-list"><li>A/B full-slot random buttons randomize the full slot IR selection and related full-slot behavior.</li><li>A/B Color-header random buttons randomize the current IR's Color controls only, keeping the loaded IR in place.</li><li>Morph Random is available directly in the Morph card and randomizes Morph-related controls only.</li><li>EQ and EDIT now have their own local random buttons.</li><li>A/B Random resets Slot Gain to 0 dB and no longer randomizes gain above unity.</li></ul><h3>Layout &amp; Usability Polish</h3><ul class="ia-list"><li>Init/Reset Controls has been moved into the Options menu.</li><li>Clicking the A, B, or Morph panel background now selects that mode.</li><li>Moving a Color voice knob automatically enables that Color voice, so the change is immediately audible.</li><li>Morph Mode and Curve dropdowns are now centered in the Morph panel.</li><li>K and Lerp Time now use compact horizontal controls above the curve display.</li><li>Align Peaks has been renamed to Align with a clearer tooltip.</li><li>Post random tooltip now clarifies that it affects EQ, EDIT, and OUT.</li></ul><h3>Fixes</h3><ul class="ia-list"><li>Fixed A/B WAV drag-and-drop target detection.</li><li>Fixed EDIT double-click reset behavior when linked Start/End or reverse Fade Out are active.</li><li>Fixed Morph Random build handling from the previous internal build step.</li></ul><p>Existing projects and sessions remain compatible.</p></div></details>
<details><summary>v1.0.113 — Texture Depth Bug Fix</summary><div class="ia-changelog-body"><p>Small maintenance update for Texture Depth.</p><ul class="ia-list"><li>Fixed a "Texture" bug, previously introducing the wrong IR when tweaking parameters.</li></ul></div></details>
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
</div>
`; }
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

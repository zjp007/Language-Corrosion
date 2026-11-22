/* =========================================================
   Language Corrosion — Scene Controllers (Scene 0 ~ Scene 7)
   Each scene implements: enter(opts), leave(), onLangChange()
   ========================================================= */

(function (global) {
  'use strict';

  const Scenes = {};

  /* =======================================================
     SCENE 0: WELCOME — Language Corrosion
     ======================================================= */
  Scenes[0] = (function () {
    let active = false;
    let wheelCooldown = false;

    const elCenter = document.getElementById('welcome-center');
    const elCorrosion = document.getElementById('welcome-corrosion');
    const elPerson = document.querySelector('.fig-person');
    const elBook = document.querySelector('.fig-book');
    const elHands = document.querySelector('.fig-hands');
    const elEnterBtn = document.getElementById('s0-enter-btn');

    function onMouseMove(e) {
      if (!active) return;
      const rect = elCenter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      // Reveal "Corrosion" / "腐蚀" within 320px
      const maxDist = 320;
      const t = Math.max(0, Math.min(1, 1 - dist / maxDist));
      const eased = t * t * (3 - 2 * t);

      elCorrosion.style.opacity = eased.toFixed(3);
      elCorrosion.style.filter = `blur(${((1 - eased) * 10).toFixed(1)}px)`;

      if (eased > 0.15 && eased < 0.92) {
        const jx = (Math.random() - 0.5) * 4 * (1 - eased);
        const jy = (Math.random() - 0.5) * 3 * (1 - eased);
        elCorrosion.style.transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px)`;
        elCorrosion.classList.add('glitching');
      } else {
        elCorrosion.style.transform = 'translate(0, 0)';
        elCorrosion.classList.remove('glitching');
      }

      // Parallax: hands stay stationary, book moves with larger amplitude
      const nx = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.5)));
      const ny = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.5)));
      if (elPerson) elPerson.style.transform = `translate3d(${(nx * 4).toFixed(1)}px, ${(ny * 3).toFixed(1)}px, 0)`;
      if (elBook)   elBook.style.transform   = `translate3d(${(nx * 18).toFixed(1)}px, ${(ny * 13).toFixed(1)}px, 0) rotate(${(nx * 2).toFixed(2)}deg)`;
      if (elHands)  elHands.style.transform  = 'translate3d(0, 0, 0)';
    }

    function onWheel(e) {
      if (!active || wheelCooldown) return;
      if (e.deltaY > 18) {
        wheelCooldown = true;
        global.App.goToScene(1);
      }
    }

    function onKeyDown(e) {
      if (!active) return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        global.App.goToScene(1);
      }
    }

    function onEnterClick() {
      if (!active) return;
      global.App.goToScene(1);
    }

    return {
      enter() {
        active = true;
        wheelCooldown = false;
        elCorrosion.style.opacity = '0';
        elCorrosion.style.filter = 'blur(10px)';
        elCorrosion.style.transform = 'translate(0, 0)';
        elCorrosion.classList.remove('glitching');
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('keydown', onKeyDown);
        elEnterBtn.addEventListener('click', onEnterClick);
      },
      leave() {
        active = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKeyDown);
        elEnterBtn.removeEventListener('click', onEnterClick);
      },
      onLangChange() {}
    };
  })();

  /* =======================================================
     SCENE 1: TRANSITION — Sentence Collapse & Lexical Junkyard
     ======================================================= */
  Scenes[1] = (function () {
    let active = false;
    let progress = 0; // 0 -> 100
    let nearCenter = false;
    let rafId = null;
    let lastTime = 0;
    let junkyardScrollCount = 0;

    const elProgress = document.getElementById('s1-progress-fill');
    const elStage = document.getElementById('s1-sentence-stage');
    const elTokens = document.getElementById('s1-tokens');
    const elHaha = document.getElementById('s1-haha');
    const elJunkyard = document.getElementById('s1-junkyard');
    const elPile = document.getElementById('junkyard-pile');
    const elNextBtn = document.getElementById('s1-next-btn');

    const DEBRIS_LAYOUT = [
      { left: '4%',  bottom: '-6%', size: 'clamp(64px, 11vw, 148px)', rot: -16 },
      { left: '26%', bottom: '4%',  size: 'clamp(42px, 6.8vw, 96px)', rot: 22 },
      { left: '12%', bottom: '28%', size: 'clamp(48px, 8vw, 110px)',  rot: -32 },
      { left: '38%', bottom: '18%', size: 'clamp(36px, 5.5vw, 76px)', rot: 14 },
      { left: '2%',  bottom: '46%', size: 'clamp(34px, 5vw, 68px)',   rot: 28 },
      { left: '50%', bottom: '-4%', size: 'clamp(44px, 6.2vw, 88px)', rot: -20 },
      { left: '24%', bottom: '42%', size: 'clamp(28px, 4vw, 56px)',   rot: -8 }
    ];

    function buildTokens() {
      const tokens = I18N.t('s1.tokens');
      elTokens.innerHTML = '';
      tokens.forEach((word, idx) => {
        const span = document.createElement('span');
        span.className = 's1-token';
        span.textContent = word;
        span.dataset.idx = idx;
        span.style.setProperty('--rot', ((idx % 2 === 0 ? 1 : -1) * (16 + idx * 5)) + 'deg');
        elTokens.appendChild(span);
      });
    }

    function buildJunkyard() {
      const debris = I18N.t('s1.debris');
      elPile.innerHTML = '';
      debris.forEach((word, idx) => {
        const cfg = DEBRIS_LAYOUT[idx % DEBRIS_LAYOUT.length];
        const div = document.createElement('div');
        div.className = 'debris-word';
        div.textContent = word;
        div.style.left = cfg.left;
        div.style.bottom = cfg.bottom;
        div.style.fontSize = cfg.size;
        div.style.transform = `rotate(${cfg.rot}deg)`;
        div.dataset.baseRot = cfg.rot;
        elPile.appendChild(div);
      });
    }

    function renderProgress() {
      elProgress.style.width = `${Math.min(100, progress).toFixed(1)}%`;

      const dropLate = I18N.t('s1.dropLate');
      const keepSkeleton = I18N.t('s1.keepSkeleton');
      const spans = elTokens.querySelectorAll('.s1-token');

      // Sub-stages:
      // 0..20: full sentence, jitters when near
      // 20..45: dropLate falls slightly
      // 45..68: everything except keepSkeleton drops away
      // 68..84: all drop away, "Haha" appears
      // 84..100: Lexical Junkyard
      spans.forEach((span, idx) => {
        span.classList.remove('jittering', 'drop-slight', 'drop-away');
        if (progress < 20) {
          if (nearCenter || progress > 4) span.classList.add('jittering');
        } else if (progress < 45) {
          if (dropLate.includes(idx)) {
            span.classList.add('drop-slight');
          } else {
            span.classList.add('jittering');
          }
        } else if (progress < 68) {
          if (!keepSkeleton.includes(idx)) {
            span.classList.add('drop-away');
          } else if (nearCenter) {
            span.classList.add('jittering');
          }
        } else {
          span.classList.add('drop-away');
        }
      });

      const showHaha = progress >= 68 && progress < 84;
      elHaha.classList.toggle('visible', showHaha);

      const showJunk = progress >= 84;
      elStage.style.opacity = showJunk ? '0' : '1';
      elJunkyard.classList.toggle('visible', showJunk);

      elNextBtn.textContent = showJunk ? I18N.t('s1.hintJunkyard') : I18N.t('s1.hint');
    }

    function tick(ts) {
      if (!active) return;
      if (!lastTime) lastTime = ts;
      const dt = Math.min(0.08, (ts - lastTime) / 1000);
      lastTime = ts;

      if (nearCenter && progress < 84) {
        progress = Math.min(84, progress + dt * 11.5);
        renderProgress();
      }
      rafId = requestAnimationFrame(tick);
    }

    function onMouseMove(e) {
      if (!active) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const wasNear = nearCenter;
      nearCenter = dist < 210;
      if (nearCenter !== wasNear && progress < 84) {
        renderProgress();
      }

      // Subtle push on junkyard debris
      if (progress >= 84) {
        elPile.querySelectorAll('.debris-word').forEach((w) => {
          const r = w.getBoundingClientRect();
          const wx = r.left + r.width / 2;
          const wy = r.top + r.height / 2;
          const d = Math.hypot(e.clientX - wx, e.clientY - wy);
          const baseRot = parseFloat(w.dataset.baseRot || '0');
          if (d < 160) {
            const push = (1 - d / 160) * 14;
            const ang = Math.atan2(wy - e.clientY, wx - e.clientX);
            w.style.transform = `translate(${(Math.cos(ang) * push).toFixed(1)}px, ${(Math.sin(ang) * push).toFixed(1)}px) rotate(${(baseRot + (push * 0.4)).toFixed(1)}deg)`;
          } else {
            w.style.transform = `rotate(${baseRot}deg)`;
          }
        });
      }
    }

    function advanceStep() {
      if (progress < 22) progress = 28;
      else if (progress < 46) progress = 52;
      else if (progress < 68) progress = 74;
      else if (progress < 84) progress = 92;
      else {
        global.App.goToScene(2);
        return;
      }
      renderProgress();
    }

    function onWheel(e) {
      if (!active) return;
      if (e.deltaY > 0) {
        if (progress >= 84) {
          junkyardScrollCount += e.deltaY;
          if (junkyardScrollCount > 140) {
            global.App.goToScene(2);
          }
        } else {
          progress = Math.min(92, progress + Math.max(4, e.deltaY * 0.08));
          renderProgress();
        }
      } else if (e.deltaY < 0 && progress > 0) {
        junkyardScrollCount = 0;
        progress = Math.max(0, progress + e.deltaY * 0.07);
        renderProgress();
      }
    }

    function onKeyDown(e) {
      if (!active) return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advanceStep();
      }
    }

    return {
      enter() {
        active = true;
        progress = 0;
        nearCenter = false;
        junkyardScrollCount = 0;
        lastTime = 0;
        buildTokens();
        buildJunkyard();
        renderProgress();
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('keydown', onKeyDown);
        elNextBtn.addEventListener('click', advanceStep);
        rafId = requestAnimationFrame(tick);
      },
      leave() {
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKeyDown);
        elNextBtn.removeEventListener('click', advanceStep);
      },
      onLangChange() {
        if (!active) return;
        buildTokens();
        buildJunkyard();
        renderProgress();
      }
    };
  })();

  /* =======================================================
     SCENE 2: HUB — Choose an Image
     ======================================================= */
  Scenes[2] = (function () {
    let active = false;
    let hasEnteredOnce = false;
    let previewRaf = null;
    let timers = [];

    const cards = Array.from(document.querySelectorAll('.hub-card'));
    const elEpilogue = document.getElementById('hub-epilogue');
    const seaCanvas = document.getElementById('hub-sea-preview');
    const kaleidoCanvas = document.getElementById('hub-kaleido-preview');

    function drawPreviews(t) {
      if (!active) return;

      // Mini Sea Preview
      if (seaCanvas) {
        const ctx = seaCanvas.getContext('2d');
        const w = seaCanvas.width, h = seaCanvas.height;
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#c8d7e1');
        sky.addColorStop(0.45, '#9ab2c2');
        sky.addColorStop(0.46, '#5c7c8e');
        sky.addColorStop(1, '#263e4d');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        for (let layer = 0; layer < 4; layer++) {
          ctx.beginPath();
          const baseY = h * (0.52 + layer * 0.12);
          ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 6) {
            const y = baseY + Math.sin(x * 0.05 + t * 0.002 + layer * 1.4) * (3 + layer);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fillStyle = `rgba(240, 246, 250, ${0.14 + layer * 0.05})`;
          ctx.fill();
        }
      }

      // Mini Kaleidoscope Preview
      if (kaleidoCanvas) {
        const ctx = kaleidoCanvas.getContext('2d');
        const w = kaleidoCanvas.width, h = kaleidoCanvas.height;
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        const sectors = 8;
        const angle = t * 0.0005;
        const colors = ['#e58ca8', '#7ba7c7', '#e6c37a', '#9982c7', '#7ac7b4'];
        for (let i = 0; i < sectors; i++) {
          ctx.save();
          ctx.rotate((Math.PI * 2 / sectors) * i + angle);
          if (i % 2 === 1) ctx.scale(1, -1);
          for (let j = 0; j < 4; j++) {
            ctx.fillStyle = colors[(i + j) % colors.length];
            ctx.globalAlpha = 0.62;
            ctx.beginPath();
            ctx.moveTo(10 + j * 11, 2);
            ctx.lineTo(28 + j * 10, 12 + Math.sin(t * 0.001 + j) * 6);
            ctx.lineTo(14 + j * 9, 26);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      previewRaf = requestAnimationFrame(drawPreviews);
    }

    function refreshVisited() {
      const visited = global.App.getVisited();
      let count = 0;
      cards.forEach((c) => {
        const target = Number(c.dataset.target);
        const isV = visited.has(target);
        c.classList.toggle('visited', isV);
        if (isV) count++;
      });
      elEpilogue.classList.toggle('visible', count >= 5);
    }

    function onCardClick(e) {
      const target = Number(e.currentTarget.dataset.target);
      if (!isNaN(target)) {
        global.App.goToScene(target);
      }
    }

    return {
      enter(opts) {
        active = true;
        refreshVisited();
        timers.forEach(clearTimeout);
        timers = [];

        const skipIntro = (opts && opts.fromEvent) || hasEnteredOnce;
        cards.forEach((c, i) => {
          c.addEventListener('click', onCardClick);
          if (skipIntro) {
            c.classList.add('entered');
          } else {
            c.classList.remove('entered');
            timers.push(setTimeout(() => c.classList.add('entered'), 140 + i * 210));
          }
        });
        hasEnteredOnce = true;
        previewRaf = requestAnimationFrame(drawPreviews);
      },
      leave() {
        active = false;
        timers.forEach(clearTimeout);
        timers = [];
        if (previewRaf) cancelAnimationFrame(previewRaf);
        previewRaf = null;
        cards.forEach((c) => c.removeEventListener('click', onCardClick));
      },
      onLangChange() {
        if (active) refreshVisited();
      }
    };
  })();

  /* =======================================================
     SCENE 3: EVENT 1 — Foggy Window (Helplessness)
     ======================================================= */
  Scenes[3] = (function () {
    let active = false;
    let phase = 'wipe'; // 'wipe' | 'rolldown' | 'rollup' | 'finale'
    let hasWiped = false;
    let idleTimer = null;
    let regrowRaf = null;
    let typeTimer = null;
    let typedChars = 0;
    let fogImg = null;
    let fogCtx = null;

    const elViewport = document.getElementById('s3-viewport');
    const elAssembly = document.getElementById('s3-glass-assembly');
    const elThoughts = document.getElementById('s3-thoughts');
    const elCanvas = document.getElementById('s3-fog-canvas');
    const elQuestion = document.getElementById('s3-question');
    const elQuestionText = document.getElementById('s3-question-text');
    const elRetreat = document.getElementById('s3-retreat');
    const elFinale = document.getElementById('s3-finale');
    const elHint = document.getElementById('s3-hint');
    const elSkipBtn = document.getElementById('s3-skip-btn');
    const elReturnBtn = document.getElementById('s3-return-btn');

    const THOUGHT_POS = [
      { left: '16%', top: '26%' },
      { left: '50%', top: '22%' },
      { left: '22%', top: '56%' },
      { left: '54%', top: '52%' },
      { left: '34%', top: '74%' }
    ];

    function buildThoughts() {
      const list = I18N.t('s3.thoughts');
      const existing = elThoughts.querySelectorAll('.window-thought');
      if (existing.length === list.length) {
        existing.forEach((node, i) => { node.textContent = list[i]; });
        return;
      }
      elThoughts.innerHTML = '';
      list.forEach((txt, i) => {
        const div = document.createElement('div');
        div.className = 'window-thought';
        div.textContent = txt;
        div.style.left = THOUGHT_POS[i % THOUGHT_POS.length].left;
        div.style.top = THOUGHT_POS[i % THOUGHT_POS.length].top;
        div.dataset.cooldownUntil = '0';
        elThoughts.appendChild(div);
      });
    }

    function drawFullFog() {
      if (!fogCtx) return;
      const w = elCanvas.width, h = elCanvas.height;
      fogCtx.globalCompositeOperation = 'source-over';
      fogCtx.globalAlpha = 1;
      if (fogImg && fogImg.complete && fogImg.naturalWidth > 0) {
        // Cover-fit fog image
        const scale = Math.max(w / fogImg.naturalWidth, h / fogImg.naturalHeight);
        const dw = fogImg.naturalWidth * scale;
        const dh = fogImg.naturalHeight * scale;
        fogCtx.drawImage(fogImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
      } else {
        fogCtx.fillStyle = 'rgba(175, 195, 200, 0.92)';
        fogCtx.fillRect(0, 0, w, h);
      }
    }

    function resizeCanvas() {
      const rect = elViewport.getBoundingClientRect();
      elCanvas.width = Math.max(320, Math.round(rect.width));
      elCanvas.height = Math.max(200, Math.round(rect.height));
      fogCtx = elCanvas.getContext('2d');
      drawFullFog();
    }

    function regrowLoop() {
      if (!active || phase !== 'wipe') return;
      if (fogCtx && fogImg && fogImg.complete && fogImg.naturalWidth > 0) {
        const w = elCanvas.width, h = elCanvas.height;
        const scale = Math.max(w / fogImg.naturalWidth, h / fogImg.naturalHeight);
        const dw = fogImg.naturalWidth * scale;
        const dh = fogImg.naturalHeight * scale;
        fogCtx.globalCompositeOperation = 'source-over';
        fogCtx.globalAlpha = 0.011;
        fogCtx.drawImage(fogImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
        fogCtx.globalAlpha = 1;
      }
      regrowRaf = requestAnimationFrame(regrowLoop);
    }

    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      if (phase !== 'wipe' || !hasWiped) return;
      elHint.textContent = I18N.t('s3.hintPause');
      elSkipBtn.hidden = false;
      idleTimer = setTimeout(() => {
        if (active && phase === 'wipe') {
          startRollDown();
        }
      }, 5000);
    }

    function triggerThoughtAt(clientX, clientY) {
      const now = Date.now();
      elThoughts.querySelectorAll('.window-thought').forEach((node) => {
        const until = Number(node.dataset.cooldownUntil || '0');
        if (now < until) return;
        const r = node.getBoundingClientRect();
        const pad = 28;
        if (
          clientX >= r.left - pad &&
          clientX <= r.right + pad &&
          clientY >= r.top - pad &&
          clientY <= r.bottom + pad
        ) {
          node.dataset.cooldownUntil = String(now + 6100);
          node.classList.remove('lifecycle-active');
          void node.offsetWidth;
          node.classList.add('lifecycle-active');
        }
      });
    }

    function onWipeMove(e) {
      if (!active || phase !== 'wipe' || !fogCtx) return;
      const rect = elCanvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * elCanvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * elCanvas.height;

      const radius = 52;
      fogCtx.save();
      fogCtx.globalCompositeOperation = 'destination-out';
      const grad = fogCtx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      grad.addColorStop(0, 'rgba(0,0,0,0.95)');
      grad.addColorStop(0.65, 'rgba(0,0,0,0.45)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      fogCtx.fillStyle = grad;
      fogCtx.beginPath();
      fogCtx.arc(x, y, radius, 0, Math.PI * 2);
      fogCtx.fill();
      fogCtx.restore();

      hasWiped = true;
      triggerThoughtAt(e.clientX, e.clientY);
      resetIdleTimer();
    }

    function startRollDown() {
      if (phase !== 'wipe') return;
      phase = 'rolldown';
      if (idleTimer) clearTimeout(idleTimer);
      if (regrowRaf) cancelAnimationFrame(regrowRaf);
      global.App.setCursorMode('default');
      drawFullFog();
      elSkipBtn.hidden = true;
      elAssembly.classList.add('rolled-down');
      SoundFX.startWind();

      elQuestion.hidden = false;
      elQuestionText.textContent = '';
      typedChars = 0;
      elHint.textContent = I18N.t('s3.hintClickWindow');

      // Typewriter question
      const stepType = () => {
        if (!active || phase !== 'rolldown') return;
        const full = I18N.t('s3.question');
        if (typedChars < full.length) {
          typedChars++;
          elQuestionText.textContent = full.slice(0, typedChars);
          SoundFX.playType();
          typeTimer = setTimeout(stepType, I18N.getLanguage() === 'zh' ? 120 : 65);
        }
      };
      typeTimer = setTimeout(stepType, 550);
    }

    function startRollUp() {
      phase = 'rollup';
      if (typeTimer) clearTimeout(typeTimer);
      elQuestion.hidden = true;
      elAssembly.classList.remove('rolled-down');
      SoundFX.stopWind();
      elRetreat.hidden = false;
      elHint.textContent = I18N.t('s3.hintClickRetreat');
    }

    function startFinale() {
      phase = 'finale';
      elRetreat.hidden = true;
      elFinale.hidden = false;
      elHint.textContent = '';
      elReturnBtn.hidden = false;
      global.App.markVisited(3);
    }

    function onStageClick(e) {
      if (!active) return;
      if (e.target.closest('button')) return;
      if (phase === 'rolldown') {
        startRollUp();
      } else if (phase === 'rollup') {
        startFinale();
      }
    }

    function onSkipClick() {
      if (active && phase === 'wipe') startRollDown();
    }

    function onReturnClick() {
      global.App.goToScene(2, { fromEvent: true });
    }

    function onMouseEnterViewport() {
      if (active && phase === 'wipe') global.App.setCursorMode('wipe');
    }

    function onMouseLeaveViewport() {
      if (active) global.App.setCursorMode('default');
    }

    return {
      enter() {
        active = true;
        phase = 'wipe';
        hasWiped = false;
        typedChars = 0;
        elAssembly.classList.remove('rolled-down');
        elQuestion.hidden = true;
        elRetreat.hidden = true;
        elFinale.hidden = true;
        elSkipBtn.hidden = true;
        elReturnBtn.hidden = true;
        elHint.textContent = I18N.t('s3.hintWipe');

        buildThoughts();
        fogImg = global.App.getImage('Assets/images/雾气车窗.png');
        resizeCanvas();
        if (fogImg && !fogImg.complete) {
          fogImg.addEventListener('load', drawFullFog, { once: true });
        }

        elCanvas.addEventListener('pointermove', onWipeMove);
        elCanvas.addEventListener('pointerdown', onWipeMove);
        elViewport.addEventListener('mouseenter', onMouseEnterViewport);
        elViewport.addEventListener('mouseleave', onMouseLeaveViewport);
        document.getElementById('scene-3').addEventListener('click', onStageClick);
        elSkipBtn.addEventListener('click', onSkipClick);
        elReturnBtn.addEventListener('click', onReturnClick);
        window.addEventListener('resize', resizeCanvas);

        regrowRaf = requestAnimationFrame(regrowLoop);
      },
      leave() {
        active = false;
        if (idleTimer) clearTimeout(idleTimer);
        if (typeTimer) clearTimeout(typeTimer);
        if (regrowRaf) cancelAnimationFrame(regrowRaf);
        SoundFX.stopWind();
        global.App.setCursorMode('default');
        elCanvas.removeEventListener('pointermove', onWipeMove);
        elCanvas.removeEventListener('pointerdown', onWipeMove);
        elViewport.removeEventListener('mouseenter', onMouseEnterViewport);
        elViewport.removeEventListener('mouseleave', onMouseLeaveViewport);
        document.getElementById('scene-3').removeEventListener('click', onStageClick);
        elSkipBtn.removeEventListener('click', onSkipClick);
        elReturnBtn.removeEventListener('click', onReturnClick);
        window.removeEventListener('resize', resizeCanvas);
      },
      onLangChange() {
        if (!active) return;
        buildThoughts();
        if (phase === 'wipe') {
          elHint.textContent = hasWiped ? I18N.t('s3.hintPause') : I18N.t('s3.hintWipe');
        } else if (phase === 'rolldown') {
          const full = I18N.t('s3.question');
          elQuestionText.textContent = full;
          typedChars = full.length;
          elHint.textContent = I18N.t('s3.hintClickWindow');
        } else if (phase === 'rollup') {
          elHint.textContent = I18N.t('s3.hintClickRetreat');
        }
      }
    };
  })();

  /* =======================================================
     SCENE 4: EVENT 2 — Birthday Card (Invisible Wall)
     ======================================================= */
  Scenes[4] = (function () {
    let active = false;
    let firstDropped = false;
    let spamCount = 0;
    let cardWishIndex = 0;
    let draggingEl = null;
    let dragOffset = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };
    let movedDuringDrag = false;

    const elStage = document.getElementById('s4-stage');
    const elDropZone = document.getElementById('s4-drop-zone');
    const elCardText = document.getElementById('s4-card-text');
    const elThoughtsLayer = document.getElementById('s4-thoughts-layer');
    const elProliferateLayer = document.getElementById('s4-proliferate-layer');
    const elHint = document.getElementById('s4-hint');
    const elReturnBtn = document.getElementById('s4-return-btn');

    const CARD_ASSETS = [
      'Assets/images/粉色撕纸上的百合与纸夹.png',
      'Assets/images/黄紫星星粉色胶带便签.png',
      'Assets/images/米色线格纸与赭色胶带.png',
      'Assets/images/五款纸艺拼贴透明素材集.png'
    ];

    const TAG_POSITIONS = [
      { left: '9%',  top: '26%' },
      { left: '12%', top: '62%' },
      { left: '66%', top: '66%' },
      { left: '26%', top: '16%' }
    ];

    function buildThoughts() {
      const list = I18N.t('s4.thoughts');
      elThoughtsLayer.innerHTML = '';
      list.forEach((txt, i) => {
        const tag = document.createElement('div');
        tag.className = 'thought-tag';
        tag.textContent = txt;
        tag.dataset.idx = i;
        tag.style.left = TAG_POSITIONS[i % TAG_POSITIONS.length].left;
        tag.style.top = TAG_POSITIONS[i % TAG_POSITIONS.length].top;
        tag.addEventListener('pointerdown', onTagPointerDown);
        elThoughtsLayer.appendChild(tag);
      });
    }

    function updateHint() {
      if (!firstDropped) {
        elHint.textContent = I18N.t('s4.hintDrag');
      } else if (spamCount < 12) {
        elHint.textContent = I18N.t('s4.hintClick', { n: spamCount });
      } else {
        elHint.textContent = I18N.t('s4.hintBuried');
      }
    }

    function acceptThoughtIntoCard(tag) {
      if (!tag || tag.classList.contains('consumed')) return;
      tag.classList.add('consumed');
      SoundFX.playCardPop();

      const wishes = I18N.t('s4.safeWishes');
      elCardText.textContent = wishes[cardWishIndex % wishes.length];
      elCardText.dataset.wishIdx = String(cardWishIndex % wishes.length);
      cardWishIndex++;

      elCardText.classList.remove('censored-flash');
      void elCardText.offsetWidth;
      elCardText.classList.add('censored-flash');

      firstDropped = true;
      updateHint();
    }

    function isOverDropZone(x, y) {
      const r = elDropZone.getBoundingClientRect();
      const pad = 28;
      return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    }

    function onTagPointerDown(e) {
      if (!active) return;
      e.stopPropagation();
      const tag = e.currentTarget;
      if (tag.classList.contains('consumed')) return;
      const r = tag.getBoundingClientRect();
      draggingEl = tag;
      dragOffset.x = e.clientX - r.left;
      dragOffset.y = e.clientY - r.top;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      movedDuringDrag = false;
      tag.classList.add('dragging');
      tag.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!active || !draggingEl) return;
      if (Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 6) {
        movedDuringDrag = true;
      }
      draggingEl.style.left = `${e.clientX - dragOffset.x}px`;
      draggingEl.style.top = `${e.clientY - dragOffset.y}px`;
      elDropZone.classList.toggle('drag-over', isOverDropZone(e.clientX, e.clientY));
    }

    function onPointerUp(e) {
      if (!active || !draggingEl) return;
      const tag = draggingEl;
      draggingEl = null;
      tag.classList.remove('dragging');
      elDropZone.classList.remove('drag-over');

      // Either dropped onto card OR simple click accessibility helper
      if (!movedDuringDrag || isOverDropZone(e.clientX, e.clientY)) {
        acceptThoughtIntoCard(tag);
      }
    }

    function spawnSafeCard(clickX, clickY) {
      spamCount++;
      SoundFX.playCardPop();
      const wishes = I18N.t('s4.safeWishes');
      const wishIdx = (spamCount - 1) % wishes.length;
      const asset = CARD_ASSETS[(spamCount - 1) % CARD_ASSETS.length];

      const card = document.createElement('div');
      card.className = 'spam-card';
      const rot = (Math.random() - 0.5) * 34;
      card.style.setProperty('--r', `${rot.toFixed(1)}deg`);
      card.dataset.wishIdx = String(wishIdx);

      // Spread cards across screen while slightly biasing near click
      const spreadX = (Math.random() * 0.78 + 0.05) * window.innerWidth;
      const spreadY = (Math.random() * 0.72 + 0.08) * window.innerHeight;
      const x = spamCount <= 3 ? (clickX - 110) : spreadX - 90;
      const y = spamCount <= 3 ? (clickY - 80) : spreadY - 70;
      card.style.left = `${Math.max(-20, Math.min(window.innerWidth - 190, x))}px`;
      card.style.top = `${Math.max(20, Math.min(window.innerHeight - 160, y))}px`;

      const img = document.createElement('img');
      img.src = asset;
      img.alt = '';
      img.draggable = false;

      const txt = document.createElement('div');
      txt.className = 'spam-card-text';
      txt.textContent = wishes[wishIdx];

      card.appendChild(img);
      card.appendChild(txt);
      elProliferateLayer.appendChild(card);

      updateHint();
      if (spamCount >= 12) {
        elReturnBtn.hidden = false;
        global.App.markVisited(4);
      }
    }

    function onStageClick(e) {
      if (!active || !firstDropped) return;
      if (e.target.closest('button') || e.target.closest('.thought-tag')) return;
      spawnSafeCard(e.clientX, e.clientY);
    }

    function onReturnClick() {
      global.App.goToScene(2, { fromEvent: true });
    }

    return {
      enter() {
        active = true;
        firstDropped = false;
        spamCount = 0;
        cardWishIndex = 0;
        draggingEl = null;
        elProliferateLayer.innerHTML = '';
        elCardText.textContent = I18N.t('s4.cardPlaceholder');
        elCardText.classList.remove('censored-flash');
        delete elCardText.dataset.wishIdx;
        elReturnBtn.hidden = true;

        buildThoughts();
        updateHint();

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        elStage.addEventListener('click', onStageClick);
        elReturnBtn.addEventListener('click', onReturnClick);
      },
      leave() {
        active = false;
        draggingEl = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        elStage.removeEventListener('click', onStageClick);
        elReturnBtn.removeEventListener('click', onReturnClick);
      },
      onLangChange() {
        if (!active) return;
        const thoughts = I18N.t('s4.thoughts');
        elThoughtsLayer.querySelectorAll('.thought-tag').forEach((tag) => {
          const i = Number(tag.dataset.idx);
          if (thoughts[i]) tag.textContent = thoughts[i];
        });
        const wishes = I18N.t('s4.safeWishes');
        if (elCardText.dataset.wishIdx !== undefined) {
          elCardText.textContent = wishes[Number(elCardText.dataset.wishIdx) % wishes.length];
        } else {
          elCardText.textContent = I18N.t('s4.cardPlaceholder');
        }
        elProliferateLayer.querySelectorAll('.spam-card').forEach((c) => {
          const idx = Number(c.dataset.wishIdx || '0');
          const t = c.querySelector('.spam-card-text');
          if (t) t.textContent = wishes[idx % wishes.length];
        });
        updateHint();
      }
    };
  })();

  /* =======================================================
     SCENE 5: EVENT 3 — Crumpled Paper (Wronged)
     ======================================================= */
  Scenes[5] = (function () {
    let active = false;
    let stage = 'question'; // 'question' | 'typing' | 'ball' | 'rebuttal' | 'finale'
    let completedLines = 0;
    let currentLineRatio = 0; // 0..1 progress within current defense line
    let ballTimer = null;

    const elGuide = document.getElementById('s5-guide');
    const elPaper = document.getElementById('s5-paper');
    const elCreases = document.getElementById('s5-creases');
    const elQuestion = document.getElementById('s5-question');
    const elTyping = document.getElementById('s5-typing');
    const elLines = document.getElementById('s5-lines');
    const elRebuttal = document.getElementById('s5-rebuttal');
    const elBallWrap = document.getElementById('s5-ball-wrap');
    const elFinale = document.getElementById('s5-finale');
    const elReturnBtn = document.getElementById('s5-return-btn');

    const DEFORMS = [
      'scale(1) rotate(0deg) skew(0deg, 0deg)',
      'scale(0.95, 0.98) rotate(-3deg) skew(3deg, -1deg) translate(-12px, 6px)',
      'scale(0.89, 0.92) rotate(5deg) skew(-6deg, 3deg) translate(22px, -14px)',
      'scale(0.82, 0.86) rotate(-9deg) skew(10deg, -5deg) translate(-34px, 18px)',
      'scale(0.75, 0.8) rotate(13deg) skew(-12deg, 7deg) translate(46px, -22px)',
      'scale(0.68, 0.72) rotate(-16deg) skew(14deg, -9deg) translate(-50px, 24px)'
    ];

    const CREASE_PATHS = [
      'M 80 0 L 210 420',
      'M 0 150 L 600 240',
      'M 490 0 L 290 420',
      'M 0 320 L 600 90',
      'M 160 0 L 460 420'
    ];

    function renderCreases(count) {
      elCreases.innerHTML = '';
      for (let i = 0; i < Math.min(count, CREASE_PATHS.length); i++) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', CREASE_PATHS[i]);
        p.setAttribute('stroke', 'rgba(90, 82, 70, 0.24)');
        p.setAttribute('stroke-width', '2');
        p.setAttribute('fill', 'none');
        elCreases.appendChild(p);
      }
    }

    function renderTypedLines() {
      const defenses = I18N.t('s5.defenses');
      elLines.innerHTML = '';

      for (let i = 0; i < completedLines; i++) {
        const row = document.createElement('div');
        row.className = 'paper-line';
        const del = document.createElement('del');
        del.textContent = defenses[i];
        row.appendChild(del);
        elLines.appendChild(row);
      }

      if (completedLines < defenses.length && currentLineRatio > 0) {
        const target = defenses[completedLines];
        const len = Math.max(1, Math.round(target.length * currentLineRatio));
        const row = document.createElement('div');
        row.className = 'paper-line';
        row.textContent = target.slice(0, len);
        elLines.appendChild(row);
      }

      elPaper.style.transform = DEFORMS[Math.min(completedLines, DEFORMS.length - 1)];
      renderCreases(completedLines);
    }

    function enterTypingStage() {
      stage = 'typing';
      elQuestion.hidden = true;
      elTyping.hidden = false;
      elGuide.textContent = I18N.t('s5.guideType');
      renderTypedLines();
    }

    function advanceTyping() {
      const defenses = I18N.t('s5.defenses');
      if (completedLines >= defenses.length) return;

      const line = defenses[completedLines];
      const stepChars = I18N.t('s5.charsPerKey') || 1;
      const curLen = Math.round(line.length * currentLineRatio);
      const nextLen = Math.min(line.length, curLen + stepChars);
      SoundFX.playType();

      if (nextLen >= line.length) {
        completedLines++;
        currentLineRatio = 0;
        SoundFX.playPaperCrumple(false);
        renderTypedLines();

        if (completedLines >= defenses.length) {
          setTimeout(() => {
            if (active && stage === 'typing') collapseToBall();
          }, 420);
        }
      } else {
        currentLineRatio = nextLen / line.length;
        renderTypedLines();
      }
    }

    function collapseToBall() {
      stage = 'ball';
      SoundFX.playPaperCrumple(true);
      elPaper.classList.add('tape-snap', 'collapsing');
      elGuide.textContent = I18N.t('s5.guideBall');

      setTimeout(() => {
        if (!active || stage !== 'ball') return;
        elPaper.hidden = true;
        elBallWrap.hidden = false;

        ballTimer = setTimeout(() => {
          if (active && stage === 'ball') unfoldToRebuttal();
        }, 2400);
      }, 420);
    }

    function unfoldToRebuttal() {
      if (ballTimer) clearTimeout(ballTimer);
      stage = 'rebuttal';
      elBallWrap.hidden = true;
      elPaper.hidden = false;
      elPaper.classList.remove('tape-snap', 'collapsing');
      elPaper.style.transform = 'scale(1) rotate(0deg) skew(0deg, 0deg)';
      elCreases.innerHTML = '';
      elTyping.hidden = true;
      elRebuttal.hidden = false;
      elGuide.textContent = I18N.t('s5.guideRebuttal');
      renderRebuttal();
    }

    function renderRebuttal() {
      const lines = I18N.t('s5.rebuttals');
      elRebuttal.innerHTML = '';
      lines.forEach((txt, idx) => {
        const div = document.createElement('div');
        div.className = 'rebuttal-line';
        div.style.animationDelay = `${idx * 0.28}s`;
        div.textContent = txt;
        elRebuttal.appendChild(div);
      });
    }

    function enterFinale() {
      stage = 'finale';
      elPaper.style.opacity = '0';
      elGuide.textContent = '';
      setTimeout(() => {
        if (!active) return;
        elPaper.hidden = true;
        elFinale.hidden = false;
        elReturnBtn.hidden = false;
        global.App.markVisited(5);
      }, 500);
    }

    function onKeyDown(e) {
      if (!active) return;
      if (e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'Escape', 'Tab'].includes(e.key)) return;

      if (stage === 'question') {
        e.preventDefault();
        enterTypingStage();
      } else if (stage === 'typing') {
        e.preventDefault();
        advanceTyping();
      } else if (stage === 'ball') {
        e.preventDefault();
        unfoldToRebuttal();
      } else if (stage === 'rebuttal') {
        e.preventDefault();
        enterFinale();
      }
    }

    function onStageClick(e) {
      if (!active) return;
      if (e.target.closest('button')) return;

      if (stage === 'question') {
        enterTypingStage();
      } else if (stage === 'typing') {
        advanceTyping();
      } else if (stage === 'ball') {
        unfoldToRebuttal();
      } else if (stage === 'rebuttal') {
        enterFinale();
      }
    }

    function onReturnClick() {
      global.App.goToScene(2, { fromEvent: true });
    }

    return {
      enter() {
        active = true;
        stage = 'question';
        completedLines = 0;
        currentLineRatio = 0;
        if (ballTimer) clearTimeout(ballTimer);

        elPaper.hidden = false;
        elPaper.style.opacity = '1';
        elPaper.style.transform = DEFORMS[0];
        elPaper.classList.remove('tape-snap', 'collapsing');
        elCreases.innerHTML = '';

        elQuestion.hidden = false;
        elTyping.hidden = true;
        elRebuttal.hidden = true;
        elBallWrap.hidden = true;
        elFinale.hidden = true;
        elReturnBtn.hidden = true;
        elGuide.textContent = I18N.t('s5.guideClick');

        window.addEventListener('keydown', onKeyDown);
        document.getElementById('scene-5').addEventListener('click', onStageClick);
        elReturnBtn.addEventListener('click', onReturnClick);
      },
      leave() {
        active = false;
        if (ballTimer) clearTimeout(ballTimer);
        window.removeEventListener('keydown', onKeyDown);
        document.getElementById('scene-5').removeEventListener('click', onStageClick);
        elReturnBtn.removeEventListener('click', onReturnClick);
      },
      onLangChange() {
        if (!active) return;
        if (stage === 'question') elGuide.textContent = I18N.t('s5.guideClick');
        if (stage === 'typing') {
          elGuide.textContent = I18N.t('s5.guideType');
          renderTypedLines();
        }
        if (stage === 'ball') elGuide.textContent = I18N.t('s5.guideBall');
        if (stage === 'rebuttal') {
          elGuide.textContent = I18N.t('s5.guideRebuttal');
          renderRebuttal();
        }
      }
    };
  })();

  /* =======================================================
     SCENE 6: EVENT 4 — The Sea (Loss)
     ======================================================= */
  Scenes[6] = (function () {
    let active = false;
    let rafId = null;
    let ctx = null;
    let words = [];       // { x, y, thoughtIdx, alpha, blur, spacing, hits, drift }
    let ripples = [];     // { x, y, r, alpha }
    let nextThoughtIdx = 0;
    let hasSpoken = false;
    let tideCycle = 0;    // 0..1 every 3.5s
    let washesAfterSpeak = 0;
    let finaleShown = false;
    let lastTs = 0;

    const elCanvas = document.getElementById('s6-sea-canvas');
    const elGuide = document.getElementById('s6-guide');
    const elFinale = document.getElementById('s6-finale');
    const elReturnBtn = document.getElementById('s6-return-btn');

    function resize() {
      elCanvas.width = window.innerWidth;
      elCanvas.height = window.innerHeight;
      ctx = elCanvas.getContext('2d');
    }

    function draw(ts) {
      if (!active || !ctx) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      const w = elCanvas.width;
      const h = elCanvas.height;
      const horizonY = h * 0.42;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#c8d6df');
      skyGrad.addColorStop(1, '#9ab0bf');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Sea gradient
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      seaGrad.addColorStop(0, '#6e8c9e');
      seaGrad.addColorStop(0.45, '#466275');
      seaGrad.addColorStop(1, '#1f3340');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Layered rolling waves
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const yBase = horizonY + 18 + i * ((h - horizonY) / 6);
        const amp = 4 + i * 2.4;
        const speed = 0.0008 + i * 0.00025;
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 22) {
          const y = yBase + Math.sin(x * 0.008 + ts * speed + i * 1.7) * amp
                          + Math.cos(x * 0.017 - ts * speed * 0.7) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(30, 50, 64, ${0.14 + i * 0.04})`;
        ctx.fill();

        // Subtle crest highlight
        ctx.strokeStyle = `rgba(240, 246, 250, ${0.12 + i * 0.02})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Advance tide wash every 3.5 seconds
      const prevCycle = tideCycle;
      tideCycle = (tideCycle + dt / 3.5) % 1;
      const tideY = h + 40 - Math.sin(tideCycle * Math.PI) * (h * 0.56);

      // Detect crest passing
      if (prevCycle < 0.5 && tideCycle >= 0.5) {
        if (hasSpoken) {
          washesAfterSpeak++;
          words.forEach((wd) => {
            wd.hits++;
            wd.alpha = Math.max(0, wd.alpha - 0.34);
            wd.blur += 2.2;
            wd.spacing += 4.5;
            wd.y -= 10;
          });
          if (washesAfterSpeak >= 3 && !finaleShown) {
            finaleShown = true;
            elFinale.hidden = false;
            elReturnBtn.hidden = false;
            elGuide.textContent = '';
            global.App.markVisited(6);
          }
        }
      }

      // Draw ripples
      ripples.forEach((rp) => {
        rp.r += dt * 42;
        rp.alpha -= dt * 0.42;
        if (rp.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.32, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(240, 246, 250, ${rp.alpha.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }
      });
      ripples = ripples.filter((rp) => rp.alpha > 0);

      // Draw floating thoughts on water
      const dictThoughts = I18N.t('s6.thoughts');
      const fontFamily = I18N.getLanguage() === 'zh'
        ? '"Noto Serif SC", serif'
        : '"Cormorant Garamond", Georgia, serif';

      words.forEach((wd) => {
        if (wd.alpha <= 0.02) return;
        const text = dictThoughts[wd.thoughtIdx % dictThoughts.length];
        const waveOffset = Math.sin(ts * 0.002 + wd.drift) * 4;

        ctx.save();
        ctx.globalAlpha = wd.alpha;
        ctx.filter = `blur(${wd.blur.toFixed(1)}px)`;
        ctx.font = `24px ${fontFamily}`;
        ctx.fillStyle = '#F0F6FA';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(15, 32, 46, 0.55)';
        ctx.shadowBlur = 10;

        if (wd.spacing > 0.5) {
          const chars = Array.from(text);
          const totalW = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width + wd.spacing, 0);
          let curX = wd.x - totalW / 2;
          chars.forEach((ch) => {
            ctx.fillText(ch, curX, wd.y + waveOffset);
            curX += ctx.measureText(ch).width + wd.spacing;
          });
        } else {
          ctx.fillText(text, wd.x, wd.y + waveOffset);
        }
        ctx.restore();
      });

      // Draw incoming white foam tide line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 18) {
        const foamY = tideY + Math.sin(x * 0.02 + ts * 0.004) * 9;
        ctx.lineTo(x, foamY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      const foamGrad = ctx.createLinearGradient(0, tideY - 12, 0, tideY + 65);
      foamGrad.addColorStop(0, 'rgba(240, 246, 250, 0.52)');
      foamGrad.addColorStop(0.35, 'rgba(240, 246, 250, 0.14)');
      foamGrad.addColorStop(1, 'rgba(240, 246, 250, 0)');
      ctx.fillStyle = foamGrad;
      ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }

    function onCanvasClick(e) {
      if (!active) return;
      const y = Math.max(window.innerHeight * 0.48, Math.min(window.innerHeight * 0.85, e.clientY));
      const x = Math.max(120, Math.min(window.innerWidth - 120, e.clientX));

      SoundFX.playWaterDrop();
      ripples.push({ x, y, r: 10, alpha: 0.7 });
      words.push({
        x,
        y,
        thoughtIdx: nextThoughtIdx++,
        alpha: 0.92,
        blur: 0,
        spacing: 0,
        hits: 0,
        drift: Math.random() * Math.PI * 2
      });

      if (!hasSpoken) {
        hasSpoken = true;
        elGuide.textContent = I18N.t('s6.guideWashing');
      }
    }

    function onReturnClick() {
      global.App.goToScene(2, { fromEvent: true });
    }

    return {
      enter() {
        active = true;
        words = [];
        ripples = [];
        nextThoughtIdx = 0;
        hasSpoken = false;
        washesAfterSpeak = 0;
        finaleShown = false;
        tideCycle = 0;
        lastTs = 0;

        elFinale.hidden = true;
        elReturnBtn.hidden = true;
        elGuide.textContent = I18N.t('s6.guide');

        resize();
        SoundFX.startOcean();
        elCanvas.addEventListener('click', onCanvasClick);
        elReturnBtn.addEventListener('click', onReturnClick);
        window.addEventListener('resize', resize);
        rafId = requestAnimationFrame(draw);
      },
      leave() {
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
        SoundFX.stopOcean();
        elCanvas.removeEventListener('click', onCanvasClick);
        elReturnBtn.removeEventListener('click', onReturnClick);
        window.removeEventListener('resize', resize);
      },
      onLangChange() {
        if (!active) return;
        if (!finaleShown) {
          elGuide.textContent = hasSpoken ? I18N.t('s6.guideWashing') : I18N.t('s6.guide');
        }
      }
    };
  })();

  /* =======================================================
     SCENE 7: EVENT 5 — Kaleidoscope (Envy)
     ======================================================= */
  Scenes[7] = (function () {
    let active = false;
    let rafId = null;
    let ctx = null;
    let clicks = 0;
    let shattered = false;
    let angle = 0;
    let mouseNorm = { x: 0, y: 0 };
    let chromaShake = 0;
    let shards = [];
    let cracks = [];
    let capturedSand = [];

    const elCanvas = document.getElementById('s7-canvas');
    const elGuide = document.getElementById('s7-guide');
    const elSpeechBar = document.getElementById('s7-speech-bar');
    const elSpeechOutput = document.getElementById('s7-speech-output');
    const elFinale = document.getElementById('s7-finale');
    const elReturnBtn = document.getElementById('s7-return-btn');

    const PALETTE = ['#e788a9', '#73a6c8', '#e8be6b', '#9d81cc', '#6ec4b0', '#ef9c7b'];

    function resize() {
      const rect = elCanvas.getBoundingClientRect();
      const size = Math.max(300, Math.round(Math.min(rect.width, rect.height)));
      elCanvas.width = size;
      elCanvas.height = size;
      ctx = elCanvas.getContext('2d');
    }

    function updateGuide() {
      if (shattered) {
        elGuide.textContent = I18N.t('s7.guideShattered');
      } else {
        elGuide.textContent = I18N.t('s7.guide', { n: clicks });
      }
      if (capturedSand.length === 0) {
        elSpeechOutput.textContent = '...';
      } else {
        const list = I18N.t('s7.sandFragments');
        elSpeechOutput.textContent = capturedSand.map((i) => list[i % list.length]).join('  ');
      }
    }

    function buildShatterShards() {
      shards = [];
      const cx = elCanvas.width / 2;
      const cy = elCanvas.height / 2;
      const radius = elCanvas.width * 0.42;
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const speed = 2.2 + Math.random() * 6;
        shards.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 2.5,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.16,
          size: 12 + Math.random() * 28,
          shade: Math.floor(35 + Math.random() * 165),
          alpha: 0.92
        });
      }
    }

    function drawKaleidoscope() {
      if (!active || !ctx) return;
      const w = elCanvas.width;
      const h = elCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.43;

      ctx.clearRect(0, 0, w, h);

      if (shattered) {
        // Falling monochrome shards
        shards.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.18;
          s.rot += s.vrot;
          s.alpha = Math.max(0, s.alpha - 0.004);
          if (s.alpha <= 0) return;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.fillStyle = `rgba(${s.shade}, ${s.shade}, ${s.shade}, ${s.alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(0, -s.size * 0.6);
          ctx.lineTo(s.size * 0.5, s.size * 0.4);
          ctx.lineTo(-s.size * 0.45, s.size * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
        rafId = requestAnimationFrame(drawKaleidoscope);
        return;
      }

      const speedMult = Math.pow(1.85, clicks);
      angle += 0.0045 * speedMult;
      chromaShake *= 0.88;

      const wordsList = I18N.t('s7.eloquence');
      const fontFamily = I18N.getLanguage() === 'zh'
        ? '"Noto Serif SC", serif'
        : '"Cormorant Garamond", Georgia, serif';

      // Clip circular viewport
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#fbfbfb';
      ctx.fillRect(0, 0, w, h);

      const sectors = 8;
      const slice = (Math.PI * 2) / sectors;
      const shiftX = (Math.random() - 0.5) * chromaShake;
      const shiftY = (Math.random() - 0.5) * chromaShake;

      for (let i = 0; i < sectors; i++) {
        ctx.save();
        ctx.translate(cx + shiftX, cy + shiftY);
        ctx.rotate(i * slice + angle + mouseNorm.x * 0.6);
        if (i % 2 === 1) ctx.scale(1, -1);

        // Colorful crystalline facets
        for (let k = 0; k < 5; k++) {
          const dist = 28 + k * (radius * 0.16);
          const sway = Math.sin(angle * 2 + k + mouseNorm.y * 3) * 18;
          ctx.fillStyle = PALETTE[(i + k) % PALETTE.length];
          ctx.globalAlpha = 0.52;
          ctx.beginPath();
          ctx.moveTo(dist - 16, 4);
          ctx.lineTo(dist + 26, 20 + sway);
          ctx.lineTo(dist + 4, 48);
          ctx.closePath();
          ctx.fill();
        }

        // Eloquent words refracted inside
        ctx.globalAlpha = 0.86;
        ctx.font = `500 15px ${fontFamily}`;
        ctx.fillStyle = '#222222';
        ctx.fillText(wordsList[i % wordsList.length], radius * 0.34, 18);

        ctx.restore();
      }

      // Draw glass cracks accumulated from clicks
      if (cracks.length > 0) {
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.55)';
        ctx.lineWidth = 1.4;
        cracks.forEach((cr) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(cr.a) * radius * 0.48, cy + Math.sin(cr.a) * radius * 0.48);
          ctx.lineTo(cx + Math.cos(cr.a + cr.bend) * radius, cy + Math.sin(cr.a + cr.bend) * radius);
          ctx.stroke();
        });
      }

      ctx.restore();

      // Subtle outer brass/graphite ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      rafId = requestAnimationFrame(drawKaleidoscope);
    }

    function onMouseMove(e) {
      if (!active) return;
      mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNorm.y = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function onCanvasClick() {
      if (!active || shattered) return;
      clicks++;
      capturedSand.push(clicks - 1);
      chromaShake = 14 + clicks * 5;
      cracks.push({
        a: Math.random() * Math.PI * 2,
        bend: (Math.random() - 0.5) * 0.45
      });

      if (clicks >= 5) {
        shattered = true;
        SoundFX.playGlassShatter();
        buildShatterShards();
        updateGuide();
        elSpeechBar.style.opacity = '0.45';
        setTimeout(() => {
          if (!active) return;
          elFinale.hidden = false;
          elReturnBtn.hidden = false;
          global.App.markVisited(7);
        }, 700);
      } else {
        SoundFX.playGlassCrack(clicks);
        updateGuide();
      }
    }

    function onReturnClick() {
      global.App.goToScene(2, { fromEvent: true });
    }

    return {
      enter() {
        active = true;
        clicks = 0;
        shattered = false;
        angle = 0;
        chromaShake = 0;
        shards = [];
        cracks = [];
        capturedSand = [];

        elFinale.hidden = true;
        elReturnBtn.hidden = true;
        elSpeechBar.style.opacity = '1';
        resize();
        updateGuide();

        window.addEventListener('mousemove', onMouseMove);
        elCanvas.addEventListener('click', onCanvasClick);
        elReturnBtn.addEventListener('click', onReturnClick);
        window.addEventListener('resize', resize);
        rafId = requestAnimationFrame(drawKaleidoscope);
      },
      leave() {
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', onMouseMove);
        elCanvas.removeEventListener('click', onCanvasClick);
        elReturnBtn.removeEventListener('click', onReturnClick);
        window.removeEventListener('resize', resize);
      },
      onLangChange() {
        if (active) updateGuide();
      }
    };
  })();

  global.Scenes = Scenes;
})(window);

/* =========================================================
   Language Corrosion — Application State Machine & Bootstrap
   ========================================================= */

(function (global) {
  'use strict';

  const ASSET_URLS = [
    'Assets/images/人.png',
    'Assets/images/书.png',
    'Assets/images/手.png',
    'Assets/images/车窗.png',
    'Assets/images/雾气车窗.png',
    'Assets/images/草莓拼贴巧克力生日蛋糕.png',
    'Assets/images/粉色撕纸上的百合与纸夹.png',
    'Assets/images/黄紫星星粉色胶带便签.png',
    'Assets/images/米色线格纸与赭色胶带.png',
    'Assets/images/五款纸艺拼贴透明素材集.png',
    'Assets/images/纸团.png'
  ];

  const SCENE_THEMES = {
    0: 'theme-dark',
    1: 'theme-dark',
    2: 'theme-dark',
    3: 'theme-dark',
    4: 'theme-light',
    5: 'theme-paper',
    6: 'theme-sea',
    7: 'theme-light'
  };

  const imageCache = {};
  const visitedEvents = new Set();
  let currentSceneId = null;

  function preloadAssets() {
    ASSET_URLS.forEach((src) => {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
    });
  }

  function getImage(src) {
    if (!imageCache[src]) {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
    }
    return imageCache[src];
  }

  function applyTheme(sceneId) {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-paper', 'theme-sea');
    document.body.classList.add(SCENE_THEMES[sceneId] || 'theme-dark');
  }

  function updateDropdownActive(sceneId) {
    document.querySelectorAll('#scene-dropdown button[data-goto]').forEach((btn) => {
      btn.classList.toggle('current', Number(btn.dataset.goto) === sceneId);
    });
  }

  function goToScene(id, opts) {
    const targetId = Number(id);
    if (!global.Scenes[targetId]) return;

    if (currentSceneId !== null && global.Scenes[currentSceneId]) {
      global.Scenes[currentSceneId].leave();
      const prevEl = document.getElementById(`scene-${currentSceneId}`);
      if (prevEl) prevEl.classList.remove('active');
    }

    SoundFX.stopAllAmbience();
    currentSceneId = targetId;
    applyTheme(targetId);
    updateDropdownActive(targetId);

    const nextEl = document.getElementById(`scene-${targetId}`);
    if (nextEl) nextEl.classList.add('active');

    global.Scenes[targetId].enter(opts || {});
  }

  function markVisited(sceneId) {
    visitedEvents.add(Number(sceneId));
  }

  function getVisited() {
    return visitedEvents;
  }

  /* ---------- Custom Cursor ---------- */
  const elCursor = document.getElementById('custom-cursor');
  let cursorX = -100, cursorY = -100;
  let targetX = -100, targetY = -100;

  function setCursorMode(mode) {
    if (!elCursor) return;
    elCursor.classList.remove('is-wipe', 'is-hover');
    if (mode === 'wipe') elCursor.classList.add('is-wipe');
  }

  function initCursor() {
    if (!elCursor) return;
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!elCursor.classList.contains('is-wipe')) {
        const interactive = e.target.closest('button, a, .hub-card, .thought-tag, .crumpled-ball-img');
        elCursor.classList.toggle('is-hover', !!interactive);
      }
    });

    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.24;
      cursorY += (targetY - cursorY) * 0.24;
      elCursor.style.transform = `translate3d(${cursorX.toFixed(1)}px, ${cursorY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }

  /* ---------- Top Controls ---------- */
  function updateSoundLabel() {
    const el = document.getElementById('sound-label');
    if (el) {
      el.textContent = SoundFX.isEnabled() ? I18N.t('ui.soundOn') : I18N.t('ui.soundOff');
    }
  }

  function initControls() {
    const btnLang = document.getElementById('btn-lang');
    const btnSound = document.getElementById('btn-sound');
    const btnScenes = document.getElementById('btn-scenes');
    const dropdown = document.getElementById('scene-dropdown');

    btnLang.addEventListener('click', (e) => {
      e.stopPropagation();
      I18N.toggleLanguage();
    });

    btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundFX.unlock();
      SoundFX.toggle();
      updateSoundLabel();
    });

    btnScenes.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = dropdown.hidden;
      dropdown.hidden = !willOpen;
      btnScenes.setAttribute('aria-expanded', String(willOpen));
    });

    dropdown.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-goto]');
      if (!btn) return;
      dropdown.hidden = true;
      btnScenes.setAttribute('aria-expanded', 'false');
      goToScene(Number(btn.dataset.goto));
    });

    document.addEventListener('click', () => {
      if (!dropdown.hidden) {
        dropdown.hidden = true;
        btnScenes.setAttribute('aria-expanded', 'false');
      }
    });

    // Unlock Web Audio on first user gesture
    const unlockOnce = () => {
      SoundFX.unlock();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);

    I18N.onChange(() => {
      updateSoundLabel();
      if (currentSceneId !== null && global.Scenes[currentSceneId]) {
        global.Scenes[currentSceneId].onLangChange();
      }
    });
  }

  /* ---------- Public App API ---------- */
  global.App = {
    goToScene,
    markVisited,
    getVisited,
    getImage,
    setCursorMode
  };

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    preloadAssets();
    I18N.applyDOMTranslations();
    initControls();
    updateSoundLabel();
    initCursor();
    goToScene(0);
  });
})(window);

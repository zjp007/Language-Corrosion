/* =========================================================
   Language Corrosion — Procedural Web Audio Synthesizer
   Zero external audio files; gracefully unlocks on gesture.
   ========================================================= */

(function (global) {
  'use strict';

  let ctx = null;
  let enabled = true;
  let noiseBuffer = null;

  let windNode = null;
  let windGain = null;

  let oceanNode = null;
  let oceanGain = null;
  let oceanLfo = null;

  function ensureContext() {
    if (!enabled) return null;
    if (!ctx) {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!noiseBuffer && ctx) {
      const len = ctx.sampleRate * 3;
      noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      // Pink-ish noise using Paul Kellet's filter
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      }
    }
    return ctx;
  }

  function unlock() {
    ensureContext();
  }

  function startWind() {
    stopWind();
    const c = ensureContext();
    if (!c || !noiseBuffer) return;

    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(420, c.currentTime);
    bp.Q.setValueAtTime(0.65, c.currentTime);

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1100, c.currentTime);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.24, c.currentTime + 0.8);

    src.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    g.connect(c.destination);
    src.start();

    windNode = src;
    windGain = g;
  }

  function stopWind() {
    if (windGain && ctx) {
      try {
        const now = ctx.currentTime;
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(Math.max(windGain.gain.value, 0.0001), now);
        windGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      } catch (_) {}
    }
    if (windNode) {
      const n = windNode;
      windNode = null;
      setTimeout(() => {
        try { n.stop(); n.disconnect(); } catch (_) {}
      }, 280);
    }
    windGain = null;
  }

  function startOcean() {
    stopOcean();
    const c = ensureContext();
    if (!c || !noiseBuffer) return;

    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(520, c.currentTime);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(0.16, c.currentTime + 1.2);

    // Slow tide modulation LFO
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.setValueAtTime(0.16, c.currentTime);
    lfoGain.gain.setValueAtTime(220, c.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    lfo.start();

    src.connect(lp);
    lp.connect(g);
    g.connect(c.destination);
    src.start();

    oceanNode = src;
    oceanGain = g;
    oceanLfo = lfo;
  }

  function stopOcean() {
    if (oceanGain && ctx) {
      try {
        const now = ctx.currentTime;
        oceanGain.gain.cancelScheduledValues(now);
        oceanGain.gain.setValueAtTime(Math.max(oceanGain.gain.value, 0.0001), now);
        oceanGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      } catch (_) {}
    }
    const n = oceanNode;
    const l = oceanLfo;
    oceanNode = null;
    oceanLfo = null;
    oceanGain = null;
    if (n || l) {
      setTimeout(() => {
        try { if (n) { n.stop(); n.disconnect(); } } catch (_) {}
        try { if (l) { l.stop(); l.disconnect(); } } catch (_) {}
      }, 420);
    }
  }

  function playType() {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620 + Math.random() * 260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  function playPaperCrumple(heavy) {
    const c = ensureContext();
    if (!c || !noiseBuffer) return;
    const now = c.currentTime;
    const bursts = heavy ? 5 : 2;
    for (let i = 0; i < bursts; i++) {
      const start = now + i * (heavy ? 0.065 : 0.045);
      const src = c.createBufferSource();
      src.buffer = noiseBuffer;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1600 + Math.random() * 1800, start);
      bp.Q.setValueAtTime(1.4, start);
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, start);
      g.gain.linearRampToValueAtTime(heavy ? 0.24 : 0.12, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + (heavy ? 0.18 : 0.1));
      src.connect(bp);
      bp.connect(g);
      g.connect(c.destination);
      src.start(start, Math.random() * 1.5, heavy ? 0.2 : 0.12);
    }
  }

  function playCardPop() {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340 + Math.random() * 140, now);
    osc.frequency.exponentialRampToValueAtTime(520 + Math.random() * 120, now + 0.06);
    g.gain.setValueAtTime(0.055, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  function playWaterDrop() {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520 + Math.random() * 160, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  function playGlassCrack(level) {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const base = 1800 + (level || 1) * 320;
    [1, 1.41, 2.05].forEach((mult, idx) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * mult + Math.random() * 140, now + idx * 0.015);
      g.gain.setValueAtTime(0.045, now + idx * 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16 + idx * 0.03);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(now + idx * 0.015);
      osc.stop(now + 0.22 + idx * 0.03);
    });
  }

  function playGlassShatter() {
    const c = ensureContext();
    if (!c || !noiseBuffer) return;
    const now = c.currentTime;
    // High sparkle shards
    for (let i = 0; i < 8; i++) {
      const start = now + i * 0.022;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200 + Math.random() * 3400, start);
      g.gain.setValueAtTime(0.05, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    }
    // Crisp noise crash
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2600, now);
    const g = c.createGain();
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    src.connect(hp);
    hp.connect(g);
    g.connect(c.destination);
    src.start(now, 0, 0.48);
  }

  function stopAllAmbience() {
    stopWind();
    stopOcean();
  }

  function setEnabled(val) {
    enabled = !!val;
    if (!enabled) {
      stopAllAmbience();
    }
  }

  function toggle() {
    setEnabled(!enabled);
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  global.SoundFX = {
    unlock,
    setEnabled,
    toggle,
    isEnabled,
    startWind,
    stopWind,
    startOcean,
    stopOcean,
    playType,
    playPaperCrumple,
    playCardPop,
    playWaterDrop,
    playGlassCrack,
    playGlassShatter,
    stopAllAmbience
  };
})(window);

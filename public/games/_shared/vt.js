/* VOLTARA Originals runtime — tiny shared helpers for every in-house game.
 * Handles: host handshake, settings (sound / reduced motion), best scores,
 * HiDPI canvas sizing, a pausable RAF loop, overlays, keyboard state and
 * WebAudio blips. No dependencies. */
(function () {
  'use strict';
  var slug = (location.pathname.match(/games\/([^/]+)\//) || [])[1] || 'game';
  var embedded = window.parent !== window;
  var settingsListeners = [];
  var pauseListeners = [];

  var VT = {
    slug: slug,
    embedded: embedded,
    sound: true,
    reducedMotion: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
    keys: new Set(),
    /** ?preview=1: used to capture catalog thumbnails. Skips the intro card, starts play, stays silent. */
    preview: /[?&]preview=1/.test(location.search),
  };
  var introSkipped = false;

  function post(msg) {
    if (embedded) {
      try {
        window.parent.postMessage(msg, location.origin);
      } catch (e) {}
    }
  }

  // ── Host settings ────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'voltara:settings') return;
    VT.sound = !!e.data.sound;
    VT.reducedMotion = !!e.data.reducedMotion || VT.reducedMotion;
    document.documentElement.classList.toggle('reduced-motion', VT.reducedMotion);
    settingsListeners.forEach(function (fn) { fn(VT); });
  });
  VT.onSettings = function (fn) { settingsListeners.push(fn); };

  // Read the host's stored prefs directly when same-origin (standalone tab or first paint).
  try {
    var prefs = JSON.parse(localStorage.getItem('voltara:prefs') || '{}');
    if (prefs.sound === false) VT.sound = false;
    if (prefs.motion === 'reduced') VT.reducedMotion = true;
  } catch (e) {}

  // ── Keyboard ─────────────────────────────────────────────────
  var GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
  window.addEventListener('keydown', function (e) {
    VT.keys.add(e.code);
    if (GAME_KEYS.indexOf(e.code) !== -1 && !/INPUT|TEXTAREA/.test(e.target.tagName)) e.preventDefault();
    if (e.key === 'Escape') post({ type: 'voltara:escape' });
  });
  window.addEventListener('keyup', function (e) { VT.keys.delete(e.code); });
  window.addEventListener('blur', function () { VT.keys.clear(); });

  // ── Visibility → pause ───────────────────────────────────────
  VT.onPause = function (fn) { pauseListeners.push(fn); };
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseListeners.forEach(function (fn) { fn(); });
  });
  window.addEventListener('blur', function () { pauseListeners.forEach(function (fn) { fn(); }); });

  // ── Best scores (per game, on this device) ───────────────────
  VT.getBest = function (key) {
    try {
      var v = localStorage.getItem('voltara:best:' + slug + ':' + (key || 'score'));
      return v === null ? null : Number(v);
    } catch (e) { return null; }
  };
  /** Stores value if it beats the record. Returns { best, isNew }. */
  VT.submit = function (value, opts) {
    opts = opts || {};
    var key = opts.key || 'score';
    var lower = !!opts.lowerIsBetter;
    var prev = VT.getBest(key);
    var isNew = prev === null || (lower ? value < prev : value > prev);
    if (isNew) {
      try { localStorage.setItem('voltara:best:' + slug + ':' + key, String(value)); } catch (e) {}
    }
    return { best: isNew ? value : prev, isNew: isNew, first: prev === null };
  };

  // ── Audio ────────────────────────────────────────────────────
  var actx = null;
  VT.beep = function (freq, dur, type, vol) {
    if (!VT.sound || VT.preview) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime((vol || 0.05), actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + (dur || 0.08));
      o.connect(g).connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + (dur || 0.08) + 0.02);
    } catch (e) {}
  };

  // ── HiDPI canvas ─────────────────────────────────────────────
  /** Sizes the canvas to its CSS box. cb(w, h) runs on every resize. */
  VT.canvas = function (canvas, cb) {
    var ctx = canvas.getContext('2d');
    var state = { ctx: ctx, w: 0, h: 0, dpr: 1 };
    function fit(silent) {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = Math.max(1, r.width);
      state.h = Math.max(1, r.height);
      state.dpr = dpr;
      canvas.width = Math.round(state.w * dpr);
      canvas.height = Math.round(state.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (cb && silent !== true) cb(state.w, state.h);
    }
    // Initial sizing is silent; the ResizeObserver fires cb asynchronously once the caller is set up.
    fit(true);
    new ResizeObserver(function () { fit(); }).observe(canvas);
    return state;
  };

  // ── Loop ─────────────────────────────────────────────────────
  /** Fixed-cap delta RAF loop. update(dt seconds) then render(). */
  VT.loop = function (update, render) {
    var raf = 0;
    var last = 0;
    var running = false;
    var warmed = false;
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      update(dt);
      if (render) render();
      raf = requestAnimationFrame(frame);
    }
    return {
      start: function () {
        if (running) return;
        running = true;
        // Preview captures: simulate ~6 s up front so thumbnails show a game in progress.
        if (VT.preview && !warmed) {
          warmed = true;
          for (var i = 0; i < 360 && running; i++) update(1 / 60);
          if (render) render();
        }
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop: function () {
        running = false;
        cancelAnimationFrame(raf);
      },
      get running() { return running; },
    };
  };

  // ── Overlay ──────────────────────────────────────────────────
  /** opts: { eyebrow, title, sub, stats: [[label, value]], button, onAction, hint, secondary: {label, onAction} } */
  VT.overlay = function (el, opts) {
    if (VT.preview) {
      el.hidden = true;
      if (!introSkipped) { introSkipped = true; if (opts.onAction) setTimeout(opts.onAction, 0); }
      return;
    }
    var html = '<div class="vt-card">';
    if (opts.eyebrow) html += '<div class="vt-eyebrow">' + opts.eyebrow + '</div>';
    html += '<h1 class="vt-title">' + opts.title + '</h1>';
    if (opts.sub) html += '<p class="vt-sub">' + opts.sub + '</p>';
    if (opts.stats && opts.stats.length) {
      html += '<div class="vt-stats">';
      opts.stats.forEach(function (s) {
        html += '<div class="vt-stat' + (s[2] ? ' accent' : '') + '"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
      });
      html += '</div>';
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">';
    if (opts.button) html += '<button class="vt-btn vt-btn--primary" data-act="main">' + opts.button + '</button>';
    if (opts.secondary) html += '<button class="vt-btn" data-act="alt">' + opts.secondary.label + '</button>';
    html += '</div>';
    if (opts.hint) html += '<div class="vt-hint">' + opts.hint + '</div>';
    html += '</div>';
    el.innerHTML = html;
    el.hidden = false;
    var main = el.querySelector('[data-act="main"]');
    var alt = el.querySelector('[data-act="alt"]');
    if (main) {
      main.addEventListener('click', function (e) { e.stopPropagation(); opts.onAction && opts.onAction(); });
      setTimeout(function () { main.focus({ preventScroll: true }); }, 30);
    }
    if (alt) alt.addEventListener('click', function (e) { e.stopPropagation(); opts.secondary.onAction(); });
  };
  VT.hide = function (el) { el.hidden = true; el.innerHTML = ''; };

  // ── Utilities ────────────────────────────────────────────────
  VT.rand = function (a, b) { return a + Math.random() * (b - a); };
  VT.randInt = function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); };
  VT.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  VT.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };
  VT.fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  VT.$ = function (sel) { return document.querySelector(sel); };

  // ── Handshake ────────────────────────────────────────────────
  /** Each game calls VT.ready() once its init code has run without errors.
   *  If it never does (crash, missing file), the host shows an error state. */
  VT.ready = function () {
    if (VT.reducedMotion) document.documentElement.classList.add('reduced-motion');
    post({ type: 'voltara:ready', slug: slug });
  };

  window.VT = VT;
})();

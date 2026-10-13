/* HOLE HOLE DONUTS — interactions（HTML 版の動きをそのまま移植＋WordPress 用の追加） */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isStatic() { return reduce || root.classList.contains('is-shot'); }
  if (reduce) root.classList.add('is-static');

  /* ---------- flavor (recolor the whole page) ---------- */
  var NAMES = { strawberry: 'いちご', lemon: 'レモン', cherry: 'チェリー', peach: 'ピーチ', blueberry: 'ブルーベリー',
    mint: 'ミントチョコ', choco: 'チョコ', plain: 'プレーン', sprinkle: 'スプリンクル', pumpkin: 'かぼちゃ' };
  var flavBtns = document.querySelectorAll('.flav button');
  var nowEl = document.querySelector('.js-now');
  function setFlavor(key, burstIt) {
    root.setAttribute('data-flavor', key);
    flavBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.flavor === key)); });
    if (nowEl) nowEl.textContent = NAMES[key] || key;
    if (burstIt) burst();
  }
  flavBtns.forEach(function (b) { b.addEventListener('click', function () { setFlavor(b.dataset.flavor, true); }); });
  // ドーナツ詳細ページでは、そのドーナツの味でサイト全体の色をそろえる
  var detail = document.querySelector('[data-detail-flavor]');
  if (detail) setFlavor(detail.getAttribute('data-detail-flavor'), false);

  /* ---------- conveyor lane ---------- */
  var track = document.querySelector('.lane__track');
  var list = document.querySelector('.lane__list');
  if (track && list) {
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('button').forEach(function (b) { b.tabIndex = -1; });
    track.appendChild(clone);
  }
  var pickSvg = document.querySelector('.js-pick-svg');
  var pickWrap = document.querySelector('.pick__donut');
  function q(s) { return document.querySelector(s); }
  document.querySelectorAll('.plate button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.closest('.plate');
      var svg = btn.querySelector('svg');
      pickSvg.setAttribute('style', svg.getAttribute('style'));
      pickSvg.innerHTML = svg.innerHTML;
      q('.js-pick-no').textContent = 'No.' + btn.querySelector('.plate__no').textContent;
      q('.js-pick-name').textContent = btn.querySelector('.plate__name').textContent;
      q('.js-pick-en').textContent = btn.querySelector('.plate__en').textContent;
      q('.js-pick-desc').textContent = btn.querySelector('.plate__desc').textContent;
      q('.js-pick-price').textContent = btn.querySelector('.plate__price').textContent;
      var pickUrl = q('.js-pick-url');
      if (pickUrl && li.dataset.url) pickUrl.href = li.dataset.url;
      document.querySelectorAll('.plate').forEach(function (p) {
        p.querySelector('button').setAttribute('aria-pressed', String(p.dataset.flavor === li.dataset.flavor));
      });
      pickWrap.classList.remove('is-pop'); void pickWrap.offsetWidth; pickWrap.classList.add('is-pop');
      setFlavor(li.dataset.flavor, true);
    });
  });
  var laneEl = document.querySelector('.lane');
  var toggle = document.querySelector('.lane__toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var on = laneEl.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'レーンを動かす' : 'いったん止める';
  });

  /* ---------- mobile nav ---------- */
  var hd = document.querySelector('.hd');
  var navBtn = document.querySelector('.hd__btn');
  function closeNav() { if (!hd || !navBtn) return; hd.classList.remove('is-open'); navBtn.setAttribute('aria-expanded', 'false'); }
  if (navBtn) navBtn.addEventListener('click', function () {
    var open = hd.classList.toggle('is-open');
    navBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.gnav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- portals: rotate + zoom through the hole ---------- */
  var portals = [].slice.call(document.querySelectorAll('[data-portal]')).map(function (el) {
    return { el: el, donut: el.querySelector('.portal__donut'), hero: el.classList.contains('portal--hero') };
  });
  var vw = 0, vh = 0, diag = 0, ticking = false;
  function measure() {
    vw = window.innerWidth; vh = window.innerHeight; diag = Math.sqrt(vw * vw + vh * vh);
    portals.forEach(function (p) { p.size = p.donut ? p.donut.offsetWidth : 0; });
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function update() {
    ticking = false;
    if (isStatic()) { portals.forEach(function (p) { p.el.style.setProperty('--s', 1); p.el.style.setProperty('--rot', '0deg'); p.el.style.setProperty('--fade', 1); }); return; }
    portals.forEach(function (p) {
      if (!p.donut) return;
      var r = p.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var total = r.height - vh;
      var prog = total > 0 ? clamp(-r.top / total) : 0;
      var hold = p.hero ? 0.06 : 0.12;
      var t = clamp((prog - hold) / (0.96 - hold));
      var holeR = p.size * 50 / 400;
      var smax = (diag / 2) / holeR * 1.12;
      var s = Math.pow(smax, t * t * (1.6 - 0.6 * t));
      var st = p.el.style;
      st.setProperty('--s', s.toFixed(4));
      st.setProperty('--rot', (prog * 300).toFixed(2) + 'deg');
      st.setProperty('--hr', (holeR * s).toFixed(1) + 'px');
      st.setProperty('--ls', Math.min(1 + (s - 1) * 0.3, 7).toFixed(3));
      st.setProperty('--fade', Math.max(0, 1 - t * 4).toFixed(3));
      p.donut.style.visibility = holeR * s > diag / 2 + 20 ? 'hidden' : '';
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  measure(); update();
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { measure(); req(); });
  window.addEventListener('load', function () { measure(); req(); });

  /* ---------- sprinkle rain ---------- */
  var cv = document.querySelector('.rain');
  var ctx = cv && cv.getContext && cv.getContext('2d');
  var parts = [], W = 0, H = 0, dpr = 1, running = false;
  var COLORS = ['#FF4F9A', '#3FE0C0', '#FFE14D', '#6C8CFF', '#FF9A3D', '#FFFFFF', '#4A2618'];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mk(fast) {
    var main = getComputedStyle(root).getPropertyValue('--main').trim();
    return {
      x: Math.random() * W, y: fast ? -Math.random() * H * 0.6 : Math.random() * H,
      vy: fast ? 3 + Math.random() * 4 : 0.5 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * (fast ? 1.6 : 0.4),
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.12,
      len: 7 + Math.random() * 6, c: fast && Math.random() < 0.35 ? main : COLORS[(Math.random() * COLORS.length) | 0],
      once: !!fast
    };
  }
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineWidth = 4.5;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.y += p.vy; p.x += p.vx; p.a += p.va;
      if (p.y > H + 20) {
        if (p.once) { parts.splice(i, 1); continue; }
        p.y = -20; p.x = Math.random() * W;
      }
      var dx = Math.cos(p.a) * p.len / 2, dy = Math.sin(p.a) * p.len / 2;
      ctx.strokeStyle = p.c; ctx.globalAlpha = p.once ? 0.95 : 0.55;
      ctx.beginPath(); ctx.moveTo(p.x - dx, p.y - dy); ctx.lineTo(p.x + dx, p.y + dy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  function burst() {
    if (!ctx || isStatic()) return;
    for (var i = 0; i < 120; i++) parts.push(mk(true));
  }
  if (ctx && !reduce) {
    resize();
    var n = W < 700 ? 12 : 24;
    for (var i = 0; i < n; i++) parts.push(mk(false));
    running = true; requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(loop); }
    });
  }
})();

/* 羊羹 一棹 — main.js（HTML 版の動きをそのまま移植＋WordPress 用の追加） */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = el('text', { x: x, y: y, 'class': cls || 'tx', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = s;
    return t;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // seeded random (deterministic drawings)
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  var uid = 0;
  function hatch(svg, gap, cls) {
    var id = 'h' + (++uid);
    var defs = svg.querySelector('defs') || el('defs', {}, svg);
    var p = el('pattern', { id: id, width: gap, height: gap, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    if (cls === 'st-cut') el('rect', { width: gap, height: gap, fill: '#f6eeec' }, p);
    el('line', { x1: 0, y1: 0, x2: 0, y2: gap, 'class': cls || 'st-3' }, p);
    return 'url(#' + id + ')';
  }
  // horizontal dimension line with arrows-ticks
  function dimH(g, x1, x2, y, label, ext1, ext2) {
    if (ext1 !== undefined) el('line', { x1: x1, y1: ext1, x2: x1, y2: y + 5, 'class': 'dim' }, g);
    if (ext2 !== undefined) el('line', { x1: x2, y1: ext2, x2: x2, y2: y + 5, 'class': 'dim' }, g);
    el('line', { x1: x1, y1: y, x2: x2, y2: y, 'class': 'dim' }, g);
    el('path', { d: 'M' + (x1 - 3) + ' ' + (y + 3) + 'L' + (x1 + 3) + ' ' + (y - 3) + 'M' + (x2 - 3) + ' ' + (y + 3) + 'L' + (x2 + 3) + ' ' + (y - 3), 'class': 'st-2' }, g);
    if (label) txt(g, (x1 + x2) / 2, y - 6, label);
  }
  function dimV(g, x, y1, y2, label, ext1, ext2) {
    if (ext1 !== undefined) el('line', { x1: ext1, y1: y1, x2: x - 5, y2: y1, 'class': 'dim' }, g);
    if (ext2 !== undefined) el('line', { x1: ext2, y1: y2, x2: x - 5, y2: y2, 'class': 'dim' }, g);
    el('line', { x1: x, y1: y1, x2: x, y2: y2, 'class': 'dim' }, g);
    el('path', { d: 'M' + (x - 3) + ' ' + (y1 + 3) + 'L' + (x + 3) + ' ' + (y1 - 3) + 'M' + (x - 3) + ' ' + (y2 + 3) + 'L' + (x + 3) + ' ' + (y2 - 3), 'class': 'st-2' }, g);
    if (label) {
      var t = txt(g, x - 8, (y1 + y2) / 2, label);
      t.setAttribute('transform', 'rotate(-90 ' + (x - 8) + ' ' + ((y1 + y2) / 2) + ')');
    }
  }

  /* ---------------- HERO: the bar sliced by scroll ---------------- */
  var bar = document.getElementById('bar');
  var hero = document.getElementById('top');
  var cutN = document.getElementById('cutN');
  var heroLines = hero ? hero.querySelectorAll('.ln') : [];
  var N = 12, S = 4, W = 15 * S, H = 38 * S, DX = 64, DY = -38, X0 = 60, Y0 = 190, GAP = 14;
  var barLayer, cutFill, barK = -1;

  function drawBar(k) {
    if (!bar) return;
    if (Math.abs(k - barK) < 0.002) return;
    barK = k;
    if (!barLayer) {
      cutFill = hatch(bar, 4, 'st-cut');
      barLayer = el('g', {}, bar);
    }
    while (barLayer.firstChild) barLayer.removeChild(barLayer.firstChild);
    // cut j (1..11) lies between slice j-1 and j; cuts proceed from the right end
    function cutAmt(j) { return clamp(k - (N - 1 - j), 0, 1); }
    var off = [0];
    for (var i = 1; i < N; i++) off[i] = off[i - 1] + GAP * easeOut(cutAmt(i));
    // ground line
    el('line', { x1: 20, y1: Y0 + H + 0.5, x2: 1040, y2: Y0 + H + 0.5, 'class': 'st-3' }, barLayer);
    // group contiguous (uncut) slices so an uncut bar reads as one solid
    var groups = [], start = 0;
    for (i = 1; i <= N; i++) {
      if (i === N || cutAmt(i) > 0) { groups.push([start, i - 1]); start = i; }
    }
    groups.forEach(function (gr) {
      var x = X0 + gr[0] * W + off[gr[0]], w = (gr[1] - gr[0] + 1) * W;
      var g = el('g', {}, barLayer);
      el('polygon', { points: [x, Y0, x + w, Y0, x + w + DX, Y0 + DY, x + DX, Y0 + DY].join(' '), 'class': 'face-top' }, g);
      el('polygon', { points: [x + w, Y0, x + w + DX, Y0 + DY, x + w + DX, Y0 + DY + H, x + w, Y0 + H].join(' '), 'class': 'face-cut', fill: cutFill }, g);
      el('rect', { x: x, y: Y0, width: w, height: H, 'class': 'face-front' }, g);
      el('line', { x1: x + 1, y1: Y0 + 3, x2: x + w - 1, y2: Y0 + 3, 'class': 'st-3' }, g);
      if (gr[0] === gr[1] && (gr[1] === N - 1 ? 1 : cutAmt(gr[1] + 1)) >= 1 && (gr[0] === 0 || cutAmt(gr[0]) >= 1)) {
        dimH(g, x, x + W, Y0 + H + 28, '15', Y0 + H + 4, Y0 + H + 4);
      }
    });
    // knife: the cut in progress
    var cur = -1;
    for (var j = N - 1; j >= 1; j--) { var a = cutAmt(j); if (a > 0 && a < 1) { cur = j; break; } }
    if (cur > 0) {
      var kx = X0 + cur * W + off[cur - 1] + GAP * easeOut(cutAmt(cur)) * 0.5;
      el('line', { x1: kx, y1: Y0 + DY - 40, x2: kx, y2: Y0 + H + 10, 'class': 'st-az', 'stroke-dasharray': '4 3' }, barLayer);
      txt(barLayer, kx, Y0 + DY - 48, 'CUT ' + ('0' + (N - cur)).slice(-2), 'tx-s tx-az');
    }
    // overall dimension
    var right = X0 + N * W + off[N - 1];
    dimH(barLayer, X0, right, Y0 + H + 62, 'L = 180  ( 15 × 12 )', Y0 + H + 34, Y0 + H + 34);
    dimV(barLayer, X0 - 22, Y0, Y0 + H, '38');
    var pieces = 1;
    for (j = 1; j < N; j++) if (cutAmt(j) >= 1) pieces++;
    if (cutN) cutN.textContent = ('0' + pieces).slice(-2);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function heroProgress() {
    if (!hero) return 0;
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - window.innerHeight;
    if (span <= 0) return 1;
    return clamp(-r.top / span, 0, 1);
  }
  function updateHero(p) {
    drawBar(clamp(p / 0.88, 0, 1) * (N - 1));
    for (var i = 0; i < heroLines.length; i++) {
      var at = parseFloat(heroLines[i].getAttribute('data-at')) || 0;
      heroLines[i].classList.toggle('is-on', p >= at - 0.001);
    }
  }

  /* ---------------- header meter: the page as a bar ---------------- */
  var meter = document.getElementById('meter');
  var meterRects = [];
  if (meter) {
    for (var m = 0; m < N; m++) meterRects.push(el('rect', { x: m * 9, y: 2, width: 9, height: 8, fill: '#f3f4f4', stroke: '#62666d', 'stroke-width': .6 }, meter));
  }
  function updateMeter() {
    if (!meter) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var k = max > 0 ? clamp(window.scrollY / max, 0, 1) * (N - 1) : 0;
    var off = 0;
    for (var i = 0; i < N; i++) {
      if (i > 0) off += 2 * clamp(k - (i - 1), 0, 1);
      meterRects[i].setAttribute('x', (i * 9 + off).toFixed(2));
      meterRects[i].setAttribute('fill', (i <= Math.floor(k)) ? '#e3e5e7' : '#fbfbfa');
    }
  }

  /* ---------------- 三面図 ---------------- */
  function drawPlan() {
    var svg = document.getElementById('plan');
    if (!svg) return;
    var s = 3.6, L = 180 * s, Wd = 52 * s, Ht = 38 * s, x0 = 60, ty = 96, fy = 350, sx = 770;
    var g = el('g', {}, svg);
    var hf = hatch(svg, 5, 'st-3');
    // plan (top view)
    el('rect', { x: x0, y: ty, width: L, height: Wd, 'class': 'st' }, g);
    el('line', { x1: x0 - 20, y1: ty + Wd / 2, x2: x0 + L + 20, y2: ty + Wd / 2, 'class': 'st-cl' }, g);
    for (var i = 1; i < 12; i++) {
      el('line', { x1: x0 + i * 15 * s, y1: ty, x2: x0 + i * 15 * s, y2: ty + Wd, 'class': 'st-dash' }, g);
      el('line', { x1: x0 + i * 15 * s, y1: fy, x2: x0 + i * 15 * s, y2: fy + Ht, 'class': 'st-dash' }, g);
    }
    // section line A-A
    var ax = x0 + 90 * s;
    el('line', { x1: ax, y1: ty - 22, x2: ax, y2: ty + Wd + 22, 'class': 'st-az', 'stroke-dasharray': '10 3 2 3' }, g);
    el('path', { d: 'M' + ax + ' ' + (ty - 22) + 'h14m-5 -4l5 4l-5 4M' + ax + ' ' + (ty + Wd + 22) + 'h14m-5 -4l5 4l-5 4', 'class': 'st-az' }, g);
    txt(g, ax + 24, ty - 18, 'A', 'tx tx-az');
    txt(g, ax + 24, ty + Wd + 26, 'A', 'tx tx-az');
    txt(g, x0, ty - 30, '平面図', 'tx-j', 'start');
    dimV(g, x0 + L + 46, ty, ty + Wd, '52', x0 + L + 4, x0 + L + 4);
    // front
    el('rect', { x: x0, y: fy, width: L, height: Ht, 'class': 'st' }, g);
    el('line', { x1: x0, y1: fy + 3, x2: x0 + L, y2: fy + 3, 'class': 'st-3' }, g);
    txt(g, x0, fy - 16, '正面図', 'tx-j', 'start');
    dimV(g, x0 - 26, fy, fy + Ht, '38', x0 - 4, x0 - 4);
    dimH(g, x0, x0 + 15 * s, fy + Ht + 30, '15', fy + Ht + 4, fy + Ht + 4);
    dimH(g, x0, x0 + L, fy + Ht + 70, '180', fy + Ht + 36, fy + Ht + 36);
    // projection guides
    el('line', { x1: x0 + L + 4, y1: fy, x2: sx - 8, y2: fy, 'class': 'st-dash' }, g);
    el('line', { x1: x0 + L + 4, y1: fy + Ht, x2: sx - 8, y2: fy + Ht, 'class': 'st-dash' }, g);
    // section A-A (side)
    el('rect', { x: sx, y: fy, width: Wd, height: Ht, fill: hf, 'class': 'st' }, g);
    el('line', { x1: sx + Wd / 2, y1: fy - 20, x2: sx + Wd / 2, y2: fy + Ht + 20, 'class': 'st-cl' }, g);
    txt(g, sx, fy - 16, '断面 A-A', 'tx-j', 'start');
    dimH(g, sx, sx + Wd, fy + Ht + 30, '52', fy + Ht + 4, fy + Ht + 4);
    dimV(g, sx + Wd + 30, fy, fy + Ht, '38', sx + Wd + 4, sx + Wd + 4);
    // callouts
    el('path', { d: 'M' + (x0 + 30) + ' ' + (fy + 3) + 'L' + (x0 + 60) + ' ' + (fy - 34) + 'h120', 'class': 'dim' }, g);
    txt(g, x0 + 64, fy - 40, '糖膜（表面の結晶） t≒0.5', 'tx-s', 'start');
    el('path', { d: 'M' + (x0 + 5 * 15 * s + 27) + ' ' + (ty + Wd - 10) + 'L' + (x0 + 5 * 15 * s + 60) + ' ' + (ty + Wd + 40) + 'h110', 'class': 'dim' }, g);
    txt(g, x0 + 5 * 15 * s + 64, ty + Wd + 34, '切り分け目安 @15', 'tx-s', 'start');
    // weight block
    var by = 538;
    el('rect', { x: sx - 60, y: by, width: 260, height: 60, 'class': 'st-2' }, g);
    el('line', { x1: sx - 60, y1: by + 30, x2: sx + 200, y2: by + 30, 'class': 'st-3' }, g);
    el('line', { x1: sx + 40, y1: by, x2: sx + 40, y2: by + 60, 'class': 'st-3' }, g);
    txt(g, sx - 50, by + 20, '質量', 'tx-j', 'start');
    txt(g, sx + 50, by + 20, '500 g  ±5', 'tx', 'start');
    txt(g, sx - 50, by + 50, '半棹', 'tx-j', 'start');
    txt(g, sx + 50, by + 50, '90 × 52 × 38  /  250 g', 'tx', 'start');
  }

  /* ---------------- cross sections ---------------- */
  var NOTES = {
    ogura: ['小豆粒 φ4–5', 11],
    matcha: ['宇治抹茶 2.5%', 23],
    yuzu: ['青柚子皮 細切り', 37],
    kuri: ['栗甘露煮 15–20', 41],
    kokuto: ['黒糖・和三盆', 53]
  };
  function drawXsec(svg) {
    var kind = svg.getAttribute('data-xsec');
    if (!NOTES[kind]) return;
    var r = rng(NOTES[kind][1] * 977 + 3);
    var x = 80, y = 46, w = 260, h = 190;
    var g = el('g', {}, svg);
    var clipId = 'c' + (++uid);
    var cp = el('clipPath', { id: clipId }, el('defs', {}, svg));
    el('rect', { x: x, y: y, width: w, height: h }, cp);
    var gap = kind === 'kokuto' ? 3 : (kind === 'matcha' ? 0 : 7);
    var inner = el('g', { 'clip-path': 'url(#' + clipId + ')' }, g);
    el('rect', { x: x, y: y, width: w, height: h, fill: gap ? hatch(svg, gap, 'st-3') : '#fff' }, inner);
    var lx = x + w * .5, ly = y + h * .5, i;
    if (kind === 'ogura') {
      for (i = 0; i < 46; i++) {
        var bx = x + 10 + r() * (w - 20), by = y + 14 + Math.pow(r(), .8) * (h - 24), a = r() * 180;
        el('ellipse', { cx: bx, cy: by, rx: 11, ry: 7.5, transform: 'rotate(' + a + ' ' + bx + ' ' + by + ')', fill: '#fff', 'class': 'st-2' }, inner);
        el('line', { x1: bx - 4, y1: by, x2: bx + 4, y2: by, transform: 'rotate(' + a + ' ' + bx + ' ' + by + ')', 'class': 'st-3' }, inner);
        if (i === 20) { lx = bx; ly = by; }
      }
    } else if (kind === 'matcha') {
      for (i = 0; i < 900; i++) el('circle', { cx: x + r() * w, cy: y + r() * h, r: .7 + r() * .5, fill: '#9a9ea5' }, inner);
      lx = x + w * .62; ly = y + h * .55;
    } else if (kind === 'yuzu') {
      for (i = 0; i < 60; i++) {
        var px = x + r() * w, py = y + 8 + r() * (h - 12), pa = r() * 360, pl = 6 + r() * 9;
        el('path', { d: 'M' + px + ' ' + py + 'q' + pl / 2 + ' -3 ' + pl + ' 0', transform: 'rotate(' + pa + ' ' + px + ' ' + py + ')', 'class': 'st' , 'stroke-width': 1.4 }, inner);
        if (i === 30) { lx = px; ly = py; }
      }
    } else if (kind === 'kuri') {
      var C = [[x + 58, y + 64, 38], [x + 168, y + 110, 46], [x + 92, y + 150, 30], [x + 226, y + 40, 28], [x + 18, y + 170, 24]];
      for (i = 0; i < C.length; i++) {
        var cx = C[i][0], cy = C[i][1], cr = C[i][2], d = '';
        for (var t = 0; t <= 12; t++) {
          var an = t / 12 * Math.PI * 2, rr = cr * (.82 + r() * .3);
          var qx = cx + Math.cos(an) * rr, qy = cy + Math.sin(an) * rr * .8;
          d += (t ? 'L' : 'M') + qx.toFixed(1) + ' ' + qy.toFixed(1);
        }
        el('path', { d: d + 'Z', fill: '#fff', 'class': i === 1 ? 'st-az' : 'st', 'stroke-linejoin': 'round', 'stroke-width': i === 1 ? 1.2 : 1 }, inner);
        for (var q = 0; q < 6; q++) {
          var ox = cx + (r() - .5) * cr, oy = cy + (r() - .5) * cr * .8;
          el('path', { d: 'M' + ox + ' ' + oy + 'q4 -3 9 0', 'class': 'st-3' }, inner);
        }
      }
      lx = C[1][0] + 20; ly = C[1][1] + 10;
    } else if (kind === 'kokuto') {
      lx = x + w * .7; ly = y + h * .6;
    }
    el('rect', { x: x, y: y, width: w, height: h, 'class': 'st' }, g);
    el('line', { x1: x, y1: y + 4, x2: x + w, y2: y + 4, 'class': 'st-2' }, g);
    dimH(g, x, x + w, y - 22, '52', y - 4, y - 4);
    dimV(g, x + w + 30, y, y + h, '38', x + w + 4, x + w + 4);
    // leader
    el('circle', { cx: lx, cy: ly, r: 2.2, fill: '#33363b' }, g);
    el('path', { d: 'M' + lx + ' ' + ly + 'L' + (x + w + 8) + ' ' + (y + h + 34) + 'H' + (x + w + 78), 'class': 'dim' }, g);
    txt(g, x + w + 78, y + h + 28, NOTES[kind][0], 'tx-s', 'end');
    txt(g, x, y + h + 30, 'A-A', 'tx', 'start');
  }

  /* ---------------- ratio bars ---------------- */
  function drawRatio(box) {
    var parts = box.getAttribute('data-ratio').split(',').map(function (s) { var a = s.split(':'); return [a[0], parseFloat(a[1])]; });
    var ttl = document.createElement('p'); ttl.className = 'ratio__ttl'; ttl.textContent = '配合比（重量）'; ttl.setAttribute('aria-hidden', 'true');
    var barEl = document.createElement('div'); barEl.className = 'ratio__bar'; barEl.setAttribute('aria-hidden', 'true');
    var lg = document.createElement('p'); lg.className = 'ratio__legend'; lg.setAttribute('aria-hidden', 'true');
    parts.forEach(function (p) {
      var seg = document.createElement('span'); seg.className = 'ratio__seg';
      seg.style.flexGrow = p[1]; seg.style.flexBasis = '0';
      barEl.appendChild(seg);
      var it = document.createElement('span'); it.innerHTML = p[0] + '<span class="n">' + p[1] + '%</span>';
      lg.appendChild(it);
    });
    box.appendChild(ttl); box.appendChild(barEl); box.appendChild(lg);
  }

  /* ---------------- wrapping ---------------- */
  function drawWrap() {
    var svg = document.getElementById('wrapSvg');
    if (!svg) return;
    var g = el('g', {}, svg);
    var x = 40, y = 150, w = 300, h = 70, dx = 70, dy = -44;
    el('polygon', { points: [x, y, x + w, y, x + w + dx, y + dy, x + dx, y + dy].join(' '), 'class': 'face-top' }, g);
    el('polygon', { points: [x + w, y, x + w + dx, y + dy, x + w + dx, y + dy + h, x + w, y + h].join(' '), fill: '#fff', 'class': 'st' }, g);
    el('rect', { x: x, y: y, width: w, height: h, 'class': 'face-front' }, g);
    // paper folds on the end
    el('path', { d: 'M' + (x + w) + ' ' + y + 'L' + (x + w + dx * .5) + ' ' + (y + dy * .5 + h * .5) + 'L' + (x + w) + ' ' + (y + h) + 'M' + (x + w + dx * .5) + ' ' + (y + dy * .5 + h * .5) + 'L' + (x + w + dx) + ' ' + (y + dy + h * .5), 'class': 'st-3' }, g);
    el('line', { x1: x + 12, y1: y + h * .62, x2: x + w - 12, y2: y + h * .62, 'class': 'st-dash' }, g);
    // kake-gami label
    var lx = x + 70;
    el('rect', { x: lx, y: y, width: 34, height: h, fill: '#fff', 'class': 'st-2' }, g);
    el('polygon', { points: [lx, y, lx + 34, y, lx + 34 + dx, y + dy, lx + dx, y + dy].join(' '), fill: '#fff', 'class': 'st-2' }, g);
    var t = txt(g, lx + 17, y + 20, '一', 'tx-j'); t.setAttribute('font-size', '13');
    t = txt(g, lx + 17, y + 40, '棹', 'tx-j'); t.setAttribute('font-size', '13');
    // string
    var sx = x + w * .68;
    el('path', { d: 'M' + sx + ' ' + (y + h) + 'V' + y + 'L' + (sx + dx) + ' ' + (y + dy), 'class': 'st-az', 'stroke-width': 1.2 }, g);
    var kx = sx + dx * .5, ky = y + dy * .5;
    el('path', { d: 'M' + kx + ' ' + ky + 'c-26 -30 -46 -6 0 0c22 -32 46 -10 0 0l-18 34M' + kx + ' ' + ky + 'l12 36', 'class': 'st-az', 'stroke-width': 1 }, g);
    dimH(g, x, x + w, y + h + 34, '180 + 包み 10', y + h + 4, y + h + 4);
    txt(g, x + dx + 10, y + dy - 14, '楮紙 / 麻紐', 'tx-s', 'start');
  }

  /* ---------------- map ---------------- */
  function drawMap() {
    var svg = document.getElementById('map');
    if (!svg) return;
    var g = el('g', {}, svg);
    el('rect', { x: .5, y: .5, width: 359, height: 219, 'class': 'st-3' }, g);
    el('line', { x1: 0, y1: 176, x2: 360, y2: 176, 'class': 'st-2', 'stroke-width': 6, stroke: '#e8eaec' }, g);
    el('line', { x1: 0, y1: 176, x2: 360, y2: 176, 'class': 'st-2' }, g);
    el('line', { x1: 70, y1: 0, x2: 70, y2: 220, 'class': 'st-2' }, g);
    el('line', { x1: 70, y1: 110, x2: 300, y2: 110, 'class': 'st-3' }, g);
    el('line', { x1: 70, y1: 50, x2: 360, y2: 50, 'class': 'st-3' }, g);
    el('line', { x1: 230, y1: 110, x2: 230, y2: 176, 'class': 'st-3' }, g);
    el('circle', { cx: 88, cy: 190, r: 5, 'class': 'st' }, g);
    txt(g, 100, 206, '市バス「〇〇」', 'tx-s', 'start');
    el('path', { d: 'M88 185 V122 H 268', 'class': 'st-az', 'stroke-dasharray': '4 3' }, g);
    el('rect', { x: 270, y: 100, width: 20, height: 20, fill: '#8c2f2b' }, g);
    txt(g, 280, 92, '一棹', 'tx-j');
    txt(g, 150, 102, '二本目の路地', 'tx-s');
    txt(g, 300, 168, '〇〇通', 'tx-s');
    txt(g, 58, 30, '〇〇通', 'tx-s', 'end');
    el('path', { d: 'M335 16 v20 M335 16 l-4 8 M335 16 l4 8', 'class': 'st-2' }, g);
    txt(g, 335, 48, 'N', 'tx-s');
  }

  /* ---------------- reveal ---------------- */
  function setupReveal() {
    var groups = document.querySelectorAll('.reveal, .reveal-stagger');
    Array.prototype.forEach.call(groups, function (gr) {
      var kids = gr.classList.contains('reveal') ? gr.querySelectorAll('.ln') : gr.children;
      Array.prototype.forEach.call(kids, function (k, i) { k.style.setProperty('--i', i); });
    });
    if (!('IntersectionObserver' in window) || reduce) {
      Array.prototype.forEach.call(groups, function (g) { g.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(groups, function (g) { io.observe(g); });
  }

  /* ---------------- nav ---------------- */
  var hd = document.getElementById('hd');
  var btn = document.getElementById('navBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var open = hd.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.querySelector('.hd__btnTxt').textContent = open ? '閉じる' : '目次';
    });
    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
      a.addEventListener('click', function () {
        hd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
        btn.querySelector('.hd__btnTxt').textContent = '目次';
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('is-open')) btn.click(); });
  }

  /* ---------------- init ---------------- */
  drawPlan();
  Array.prototype.forEach.call(document.querySelectorAll('[data-xsec]'), drawXsec);
  Array.prototype.forEach.call(document.querySelectorAll('[data-ratio]'), drawRatio);
  drawWrap();
  drawMap();
  setupReveal();

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var p = reduce ? 1 : heroProgress();
      if (root.classList.contains('is-shot') && window.scrollY < 10) p = 0.62;
      updateHero(p);
      updateMeter();
      if (hd) hd.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.8);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  setTimeout(onScroll, 400);
  setTimeout(onScroll, 1500);
})();

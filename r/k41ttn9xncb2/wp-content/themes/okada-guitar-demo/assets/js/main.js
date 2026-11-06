/* Okada Guitar Demo：メニュー・出現・弦の揺れ */
(function () {
	'use strict';
	var doc = document, html = doc.documentElement, body = doc.body;
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var shot = function () { return html.classList.contains('is-shot'); };

	/* 帯＋ヘッダーの高さ（アンカー位置・ドロワーの余白に使う） */
	var topbar = doc.getElementById('topbar');
	function setTop() { if (topbar) html.style.setProperty('--topbar-h', topbar.offsetHeight + 'px'); }
	setTop(); window.addEventListener('resize', setTop);

	/* ドロワー */
	var btn = doc.querySelector('.menu-btn'), drawer = doc.getElementById('drawer');
	if (btn && drawer) {
		var toggle = function (open) {
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
			drawer.classList.toggle('is-open', open);
			drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
			body.classList.toggle('is-drawer-open', open);
		};
		btn.addEventListener('click', function () { toggle(btn.getAttribute('aria-expanded') !== 'true'); });
		drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
	}

	/* 出現 */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || reduce) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	}

	/* 弦：はじくと、減衰しながら揺れる（2次ベジェの制御点を上下に動かす） */
	function Str(path) {
		this.p = path;
		var bb = path.ownerSVGElement.viewBox.baseVal;
		this.x0 = parseFloat(path.getAttribute('data-x0') || 0);
		this.x1 = parseFloat(path.getAttribute('data-x1') || (bb ? bb.width : 1000));
		this.y = parseFloat(path.getAttribute('data-y'));
		this.amp = 0; this.t0 = 0; this.f = 0;
	}
	Str.prototype.draw = function (off) {
		var xm = (this.x0 + this.x1) / 2;
		this.p.setAttribute('d', 'M' + this.x0 + ' ' + this.y + ' Q' + xm + ' ' + (this.y + off) + ' ' + this.x1 + ' ' + this.y);
	};
	var active = [], raf = 0;
	function tick(now) {
		active = active.filter(function (s) {
			var t = (now - s.t0) / 1000;
			if (t < 0) return true;
			var a = s.amp * Math.exp(-t * 1.8);
			if (a < 0.15) { s.draw(0); return false; }
			s.draw(a * Math.sin(t * s.f * Math.PI * 2));
			return true;
		});
		raf = active.length ? requestAnimationFrame(tick) : 0;
	}
	function pluck(s, amp, delay, freq) {
		if (reduce || shot()) return;
		s.amp = amp; s.f = freq; s.t0 = performance.now() + (delay || 0);
		if (active.indexOf(s) < 0) active.push(s);
		if (!raf) raf = requestAnimationFrame(tick);
	}
	var groups = [];
	doc.querySelectorAll('.js-pluck').forEach(function (svg) {
		var list = [];
		svg.querySelectorAll('.string').forEach(function (p, i) { list.push(new Str(p)); });
		groups.push({ svg: svg, list: list });
	});
	function strum(g, base) {
		g.list.forEach(function (s, i) { pluck(s, base * (1 - i * 0.06), i * 70, 7 + i * 1.3); });
	}

	/* 読み込み完了：FV のサウンドホールを出し、弦をひと撫で */
	function ready() {
		body.classList.add('is-ready');
		var fv = doc.querySelector('.fv .js-pluck');
		groups.forEach(function (g) {
			if (g.svg === fv) {
				setTimeout(function () { strum(g, 16); }, 700);
			}
		});
	}
	if (doc.readyState === 'complete') ready(); else window.addEventListener('load', ready);

	/* 区切りの弦：画面に入ったら一度だけ揺れる */
	if ('IntersectionObserver' in window && !reduce) {
		var sio = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				groups.forEach(function (g) { if (g.svg === en.target && !g.svg.closest('.fv')) strum(g, 7); });
				sio.unobserve(en.target);
			});
		}, { threshold: 0.6 });
		groups.forEach(function (g) { if (!g.svg.closest('.fv')) sio.observe(g.svg); });
	}

	/* FV：マウスで弦をなでると、その弦が鳴る（パソコンのみ） */
	var fvSvg = doc.querySelector('.fv .js-strum');
	if (fvSvg && window.matchMedia('(hover: hover)').matches) {
		var g0 = groups.filter(function (g) { return g.svg === fvSvg; })[0];
		var lastY = null;
		fvSvg.addEventListener('pointermove', function (e) {
			var pt = fvSvg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
			var m = fvSvg.getScreenCTM(); if (!m) return;
			var loc = pt.matrixTransform(m.inverse());
			if (lastY !== null && g0) {
				g0.list.forEach(function (s, i) {
					if (loc.x < s.x0 || loc.x > s.x1) return;
					if ((lastY - s.y) * (loc.y - s.y) < 0) pluck(s, 9, 0, 7 + i * 1.3);
				});
			}
			lastY = loc.y;
		});
		fvSvg.addEventListener('pointerleave', function () { lastY = null; });
	}
})();

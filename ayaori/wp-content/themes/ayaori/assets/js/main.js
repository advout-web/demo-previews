/**
 * Ayaori — main.js
 * ローディング（円相と落款）／墨がにじむ文字／金箔／ヘッダー／目次／章ドット／サービスのタブ／綴りの横ドラッグ
 */
(function () {
	'use strict';

	var doc = document.documentElement;
	var body = document.body;
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var isShot = function () { return doc.classList.contains('is-shot'); };
	var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

	/* ---------- 文字の分割 ---------- */
	function split(el, cls) {
		var text = el.textContent;
		if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', text); }
		el.textContent = '';
		/* 欧文（.js-split）は単語ごとに .word で包み、単語の途中で改行されないようにする */
		var byWord = cls === 'char';
		var i = 0;
		text.split(byWord ? /(\s+)/ : /(?!)/).forEach(function (part) {
			if (!part) { return; }
			if (byWord && /^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
			var parent = el;
			if (byWord) {
				parent = document.createElement('span');
				parent.className = 'word';
				parent.setAttribute('aria-hidden', 'true');
				el.appendChild(parent);
			}
			Array.prototype.forEach.call(part, function (ch) {
				var s = document.createElement('span');
				s.className = cls;
				s.setAttribute('aria-hidden', 'true');
				s.textContent = ch;
				s.style.setProperty('--i', i++);
				parent.appendChild(s);
			});
		});
	}
	document.querySelectorAll('.js-ink').forEach(function (el) { split(el, 'ink-c'); });
	document.querySelectorAll('.js-split').forEach(function (el) { split(el, 'char'); });

	/* ---------- 出現 ---------- */
	var revealSel = '.reveal, .reveal-stagger, .reveal-mask, .js-ink, .js-split, .js-ink-lines';
	function revealAll() { document.querySelectorAll(revealSel).forEach(function (el) { el.classList.add('is-in'); }); }
	function startReveal() {
		if (!('IntersectionObserver' in window) || reduce) { revealAll(); return; }
		/* .reveal-mask は clip-path: circle(0%) で面積ゼロになり交差判定されないため、親要素を監視する */
		var proxies = new Map();
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) { return; }
				(proxies.get(e.target) || [e.target]).forEach(function (el) { el.classList.add('is-in'); });
				io.unobserve(e.target);
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
		document.querySelectorAll(revealSel).forEach(function (el) {
			if (!el.classList.contains('reveal-mask') || !el.parentElement) { io.observe(el); return; }
			var p = el.parentElement;
			if (!proxies.has(p)) { proxies.set(p, p.matches(revealSel) ? [p] : []); io.observe(p); }
			proxies.get(p).push(el);
		});
	}

	/* ---------- ローディング ---------- */
	var loader = document.querySelector('.loader');
	var countEl = document.querySelector('.js-loader-count');
	var loaded = false;
	window.addEventListener('load', function () { loaded = true; });
	function finishLoading() {
		if (body.classList.contains('is-ready')) { return; }
		body.classList.add('is-ready');
		startReveal();
		setTimeout(function () { body.classList.add('is-loaded'); }, 2000);
	}
	if (!loader || reduce) {
		finishLoading();
	} else if (loader.classList.contains('loader--short')) {
		setTimeout(finishLoading, 800);
	} else {
		var start = performance.now();
		(function tick(now) {
			if (isShot()) { finishLoading(); return; }
			var t = clamp((now - start) / 2600, 0, 1);
			var p = loaded ? t : Math.min(t, 0.9);
			if (countEl) { countEl.textContent = Math.round(p * 100); }
			if (p >= 1) { setTimeout(finishLoading, 300); return; }
			requestAnimationFrame(tick);
		})(start);
		setTimeout(finishLoading, 6500);
	}

	/* ---------- 金箔 ---------- */
	var leafBox = document.querySelector('.gold-leaf');
	if (leafBox && !reduce) {
		var n = window.innerWidth < 640 ? 10 : 20;
		for (var i = 0; i < n; i++) {
			var leaf = document.createElement('i');
			leaf.style.left = (Math.random() * 100) + '%';
			leaf.style.setProperty('--s', (5 + Math.random() * 9).toFixed(1) + 'px');
			leaf.style.setProperty('--d', (12 + Math.random() * 14).toFixed(1) + 's');
			leaf.style.setProperty('--delay', (-Math.random() * 26).toFixed(1) + 's');
			leaf.style.setProperty('--x', (Math.random() * 120 - 60).toFixed(0) + 'px');
			leafBox.appendChild(leaf);
		}
	}

	/* ---------- ヘッダー（縮む・隠れる・進捗） ---------- */
	var header = document.getElementById('site-header');
	var progress = document.querySelector('.site-header__progress');
	var supportsTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
	var lastY = window.scrollY;
	function onScroll() {
		var y = window.scrollY;
		if (header) {
			header.classList.toggle('is-scrolled', y > 40);
			header.classList.toggle('is-hidden', !isShot() && y > 500 && y > lastY && !body.classList.contains('is-menu-open'));
		}
		if (progress && !supportsTimeline) {
			var max = doc.scrollHeight - window.innerHeight;
			progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0);
		}
		lastY = y;
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* ---------- 目次（全画面メニュー） ---------- */
	var menuBtn = document.querySelector('.menu-btn');
	var drawer = document.getElementById('drawer');
	function setMenu(open) {
		if (!menuBtn || !drawer) { return; }
		menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		menuBtn.querySelector('.menu-btn__label').textContent = open ? '閉じる' : '目次';
		drawer.classList.toggle('is-open', open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.classList.toggle('is-menu-open', open);
		body.classList.toggle('is-locked', open);
	}
	if (menuBtn && drawer) {
		menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
		drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); } });
	}

	/* ---------- 章ドット ---------- */
	var dots = document.querySelectorAll('.dots a');
	if (dots.length && 'IntersectionObserver' in window) {
		var dio = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) { return; }
				var id = e.target.getAttribute('data-sec');
				dots.forEach(function (d) { d.classList.toggle('is-active', d.getAttribute('data-sec') === id); });
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		document.querySelectorAll('section[data-sec]').forEach(function (s) { dio.observe(s); });
	}

	/* ---------- サービスのタブ ---------- */
	document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
		var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
		var panels = wrap.querySelectorAll('[role="tabpanel"]');
		function select(idx, focus) {
			tabs.forEach(function (t, i) {
				var on = i === idx;
				t.setAttribute('aria-selected', on ? 'true' : 'false');
				t.tabIndex = on ? 0 : -1;
				panels[i].classList.toggle('is-active', on);
				panels[i].hidden = !on;
			});
			if (focus) { tabs[idx].focus(); }
		}
		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { select(i, false); });
			t.addEventListener('keydown', function (e) {
				var k = e.key;
				if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
				if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
			});
		});
		select(0, false);
	});

	/* ---------- 綴り：横ドラッグ ---------- */
	document.querySelectorAll('.js-drag').forEach(function (band) {
		var down = false, startX = 0, startLeft = 0, moved = false;
		band.addEventListener('pointerdown', function (e) {
			if (e.pointerType !== 'mouse') { return; }
			down = true; moved = false; startX = e.clientX; startLeft = band.scrollLeft;
			band.classList.add('is-dragging');
		});
		window.addEventListener('pointermove', function (e) {
			if (!down) { return; }
			var dx = e.clientX - startX;
			if (Math.abs(dx) > 4) { moved = true; }
			band.scrollLeft = startLeft - dx;
		});
		window.addEventListener('pointerup', function () { down = false; band.classList.remove('is-dragging'); });
		band.addEventListener('click', function (e) { if (moved) { e.preventDefault(); } }, true);
		band.addEventListener('wheel', function (e) {
			if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.shiftKey) { band.scrollLeft += e.deltaY; e.preventDefault(); }
		}, { passive: false });
	});

	/* ---------- スクリーンショット用 ---------- */
	window.addEventListener('load', function () {
		if (isShot()) {
			body.classList.add('is-ready', 'is-loaded');
			revealAll();
		}
	});
})();

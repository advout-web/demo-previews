/**
 * いそだ設備 リニューアル提案デモ main.js（依存ライブラリなし）
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var body = doc.body;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- 見本の帯の高さをヘッダー位置に反映 ---------- */
	var band = doc.getElementById('demo-band');
	function setBand() {
		if (band) root.style.setProperty('--demo-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* ---------- FV 開始 ---------- */
	requestAnimationFrame(function () {
		requestAnimationFrame(function () { body.classList.add('is-ready'); });
	});

	/* ---------- ヘッダー：スクロールで縮む ---------- */
	var header = doc.getElementById('site-header');
	var spine = doc.querySelector('.spine__water');
	var cssScroll = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
	var ticking = false;
	function onScroll() {
		ticking = false;
		var y = window.scrollY || window.pageYOffset;
		if (header) header.classList.toggle('is-scrolled', y > 40);
		if (spine && !cssScroll && !reduceMotion) {
			var max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
			spine.style.setProperty('--p', Math.min(1, 0.08 + 0.92 * (y / max)).toFixed(3));
		}
	}
	window.addEventListener('scroll', function () {
		if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
	}, { passive: true });
	onScroll();

	/* ---------- ドロワー ---------- */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function setDrawer(open) {
		if (!btn || !drawer) return;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		drawer.classList.toggle('is-open', open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.style.overflow = open ? 'hidden' : '';
	}
	if (btn) {
		btn.addEventListener('click', function () { setDrawer(btn.getAttribute('aria-expanded') !== 'true'); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
		drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
	}

	/* ---------- スクロール出現 ---------- */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || reduceMotion) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	}
})();

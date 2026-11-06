/**
 * Hair&Esthe calme Demo - main.js（依存ライブラリなし）
 * ・帯の高さを CSS 変数へ ・ドロワー ・スクロール出現 ・読み込み完了で is-ready
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var body = doc.body;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- 帯の高さ ---------- */
	var band = doc.querySelector('.demo-band');
	function setBand() {
		if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* ---------- 読み込み完了 ---------- */
	if (!root.classList.contains('is-shot')) body.classList.add('js-pre');
	function ready() {
		requestAnimationFrame(function () {
			body.classList.add('is-ready');
			body.classList.remove('js-pre');
		});
	}
	if (reduceMotion) {
		ready();
	} else if (doc.readyState === 'complete') {
		setTimeout(ready, 80);
	} else {
		window.addEventListener('load', function () { setTimeout(ready, 80); });
		setTimeout(ready, 2500);
	}

	/* ---------- ヘッダーの影 ---------- */
	var header = doc.getElementById('site-header');
	function onScroll() {
		if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
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
		body.classList.toggle('is-drawer-open', open);
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () {
			setDrawer(btn.getAttribute('aria-expanded') !== 'true');
		});
		drawer.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', function () { setDrawer(false); });
		});
		doc.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setDrawer(false);
		});
	}

	/* ---------- スクロール出現 ---------- */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || reduceMotion) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	}
})();

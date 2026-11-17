/**
 * ランチサービスポポロ（リニューアルご提案の見本）main.js（依存ライブラリなし）
 */
(function () {
	'use strict';

	var doc = document;
	var body = doc.body;
	var root = doc.documentElement;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- ふたを開ける（読み込み時に一度だけ） ---------- */
	function ready() { body.classList.add('is-ready'); }
	if (reduceMotion || root.classList.contains('is-shot')) {
		ready();
	} else {
		setTimeout(ready, 300);
	}

	/* ---------- ヘッダーの高さ（ドロワーの位置） ---------- */
	var topbar = doc.querySelector('.topbar');
	function setTopbarH() {
		if (topbar) root.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
	}
	setTopbarH();
	window.addEventListener('resize', setTopbarH);

	/* ---------- メニュー（スマホ） ---------- */
	var btn = doc.querySelector('.menu-btn');
	var nav = doc.getElementById('gnav');
	function closeMenu() {
		if (!btn || !nav) return;
		btn.setAttribute('aria-expanded', 'false');
		nav.classList.remove('is-open');
		body.style.overflow = '';
	}
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') !== 'true';
			setTopbarH();
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
			body.style.overflow = open ? 'hidden' : '';
		});
		doc.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') closeMenu();
		});
		window.addEventListener('resize', function () {
			if (window.innerWidth > 960) closeMenu();
		});
	}

	/* ---------- スクロールで出現 ---------- */
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

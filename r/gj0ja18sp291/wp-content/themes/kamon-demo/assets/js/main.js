/**
 * Kamon Demo - main.js（依存ライブラリなし）
 */
(function () {
	'use strict';
	var doc = document;
	var body = doc.body;
	var root = doc.documentElement;

	/* 提案用の帯の高さ → ヘッダー位置 */
	var band = doc.querySelector('.demo-band');
	function setBand() {
		if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* 読み込み完了 → 見出しのマスク表示 */
	requestAnimationFrame(function () {
		setTimeout(function () { body.classList.add('is-ready'); }, 120);
	});

	/* ドロワー */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	if (btn && drawer) {
		var toggle = function (open) {
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			drawer.classList.toggle('is-open', open);
			drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
			body.style.overflow = open ? 'hidden' : '';
		};
		btn.addEventListener('click', function () { toggle(btn.getAttribute('aria-expanded') !== 'true'); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
	}

	/* スクロール出現 */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	} else {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	}

	/* 見本のフォームは送信しない */
	doc.querySelectorAll('form.demo-form').forEach(function (f) {
		f.addEventListener('submit', function (e) { e.preventDefault(); });
	});
})();

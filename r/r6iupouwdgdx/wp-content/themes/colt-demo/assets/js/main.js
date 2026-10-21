/**
 * COLT Demo Theme - main.js（依存ライブラリなし）
 * 動き：M-EDIT（札が順にめくれて現れる・行ごとの文字・写真の寄り）。I-CSS＋I-SDA＋I-SVG。
 */
(function () {
	'use strict';

	var doc = document;
	var body = doc.body;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- 読み込み完了 → FV 開始 ---------- */
	function ready() { body.classList.add('is-ready'); }
	if (doc.readyState === 'complete') { requestAnimationFrame(ready); }
	else { window.addEventListener('load', ready); setTimeout(ready, 2500); }

	/* ---------- ヘッダー：スクロールで縮む ---------- */
	var stack = doc.getElementById('topstack');
	var onScroll = function () {
		var y = window.scrollY || window.pageYOffset;
		if (stack) stack.classList.toggle('is-scrolled', y > 40);
		body.classList.toggle('show-pagetop', y > 600);
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* ---------- ドロワー ---------- */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function setDrawer(open) {
		if (!btn || !drawer) return;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.classList.toggle('is-drawer-open', open);
	}
	if (btn) {
		btn.addEventListener('click', function () {
			setDrawer(btn.getAttribute('aria-expanded') !== 'true');
		});
	}
	if (drawer) {
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
	}
	doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

	/* ---------- スクロールで現れる ---------- */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger, .draw-on-view');
	if (reduceMotion || !('IntersectionObserver' in window)) {
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
		targets.forEach(function (el) {
			if (el.classList.contains('reveal-stagger')) {
				Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', i); });
			}
			io.observe(el);
		});
	}

	/* ---------- ページの先頭へ ---------- */
	var top = doc.querySelector('.pagetop');
	if (top) {
		top.addEventListener('click', function (e) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
		});
	}
})();

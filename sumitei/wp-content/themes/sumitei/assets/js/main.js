/* 澄邸 main.js：ドロワー／スクロール出現／ヘッダー／FV の扉（body.is-ready で CSS が開く） */
(function () {
	'use strict';
	var html = document.documentElement;
	var body = document.body;

	// ドロワー（スマホ）
	var btn = document.querySelector('.menu-btn');
	var drawer = document.getElementById('drawer');
	function setDrawer(open) {
		body.classList.toggle('is-drawer-open', open);
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () { setDrawer(!body.classList.contains('is-drawer-open')); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) { setDrawer(false); } });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrawer(false); } });
	}

	// スクロール出現
	var targets = document.querySelectorAll('.reveal, .reveal-stagger, .js-split');
	if (!('IntersectionObserver' in window) || html.classList.contains('is-shot')) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	// ヘッダー：スクロールしたら背景を付ける
	var header = document.querySelector('.site-header');
	var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// ローディング：トップページにだけ .loader がある。最低 2 秒見せてから is-ready（下層ページはすぐ is-ready）
	var loader = document.querySelector('.loader');
	var calmL = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var t0L = performance.now();
	var MIN = loader && !html.classList.contains('is-shot') && !calmL ? 2000 : 0;
	var readyL = function () {
		setTimeout(function () {
			body.classList.add('is-ready');
			if (loader) { setTimeout(function () { loader.remove(); }, 1400); }
		}, Math.max(0, MIN - (performance.now() - t0L)));
	};
	if (document.readyState === 'complete') { readyL(); } else { window.addEventListener('load', readyL); }
	setTimeout(function () { body.classList.add('is-ready'); }, 4500);
})();

/* ぽけっと不動産 main.js：ドロワー／スクロール出現／ステッカーの貼りつけ */
(function () {
	'use strict';
	var html = document.documentElement;
	var body = document.body;

	// ドロワー
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

	// スクロール出現（.reveal / .reveal-stagger / .js-split に is-in）
	var targets = document.querySelectorAll('.reveal, .reveal-stagger, .js-split');
	if (!('IntersectionObserver' in window) || html.classList.contains('is-shot')) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	// ステッカー：貼り終わったら animation を外し、ホバーでめくれるようにする
	document.querySelectorAll('.stickers .sticker').forEach(function (el) {
		el.addEventListener('animationend', function (e) {
			if (e.animationName === 'slap') { el.style.animation = 'none'; el.style.opacity = '1'; }
		});
	});

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

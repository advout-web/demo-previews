/* ル・コロネード銀座 main.js：ドロワー／スクロール出現／立面図の作図と灯り／ローディング */
(function () {
	'use strict';
	var html = document.documentElement;
	var body = document.body;
	var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var shot = html.classList.contains('is-shot');

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
		drawer.addEventListener('click', function (e) { if (e.target.closest('a') || e.target === drawer) { setDrawer(false); } });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrawer(false); } });
	}

	// スクロール出現
	var targets = document.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || shot) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	// 見せ場：立面図。前半（0〜0.55）で線を6段階に描き、後半で1F から順に窓へ灯りをともす
	var elev = document.querySelector('.elev');
	if (elev) {
		var groups = elev.querySelectorAll('.g');
		var wins = elev.querySelectorAll('.win');
		var items = elev.querySelectorAll('.elev__legend li');
		var svg = elev.querySelector('.elev__svg');
		var DRAW = 0.55;
		var nf = items.length;
		var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
		var render = function (p) {
			var t = p / DRAW * groups.length;
			groups.forEach(function (g, k) { g.style.setProperty('--d', clamp(t - k).toFixed(3)); });
			svg.style.setProperty('--lab', clamp((p - DRAW + 0.06) / 0.06).toFixed(2));
			var f = p < DRAW ? -1 : Math.min(nf - 1, Math.floor((p - DRAW) / (1 - DRAW) * nf));
			wins.forEach(function (w) { w.classList.toggle('is-lit', +w.getAttribute('data-f') <= f); });
			items.forEach(function (li, k) { li.classList.toggle('is-on', k <= f); li.classList.toggle('is-active', k === f); });
		};
		if (calm) {
			elev.classList.add('is-static');
			render(0.999);
		} else if (shot) {
			render(0.8);
		} else {
			var ticking = false;
			var update = function () {
				ticking = false;
				var r = elev.getBoundingClientRect();
				var range = elev.offsetHeight - window.innerHeight;
				render(Math.max(0, Math.min(0.999, -r.top / range)));
			};
			window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
			window.addEventListener('resize', update);
			update();
		}
	}

	// ローディング：トップページにだけ .loader がある。最低 1.6 秒見せてから is-ready（下層ページはすぐ is-ready）
	var loader = document.querySelector('.loader');
	var t0 = performance.now();
	var MIN = loader && !shot && !calm ? 2000 : 0;
	var ready = function () {
		setTimeout(function () {
			body.classList.add('is-ready');
			if (loader) { setTimeout(function () { loader.remove(); }, 700); }
		}, Math.max(0, MIN - (performance.now() - t0)));
	};
	if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); }
	setTimeout(function () { body.classList.add('is-ready'); if (loader && loader.parentNode) { loader.remove(); } }, 4000);
})();

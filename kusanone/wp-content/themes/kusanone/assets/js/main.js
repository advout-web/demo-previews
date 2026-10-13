/* くさのね市場 main.js：ドロワー／スクロール出現／標本棚の引き出し／ローディング */
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

	// 見せ場：標本棚。スクロールに合わせて引き出しを上から1段ずつひらく（ひらくのは常に1段）
	var cab = document.querySelector('.cab');
	if (cab) {
		var drws = cab.querySelectorAll('.drw');
		var n = drws.length;
		var cur = -1;
		var render = function (p) {
			var i = Math.min(n - 1, Math.floor(p * n));
			if (i === cur) { return; }
			cur = i;
			drws.forEach(function (d, k) { d.classList.toggle('is-open', k === i); });
		};
		if (calm) {
			cab.classList.add('is-static');
		} else if (shot) {
			render(0.25);
		} else {
			var ticking = false;
			var update = function () {
				ticking = false;
				var r = cab.getBoundingClientRect();
				var range = cab.offsetHeight - window.innerHeight;
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
	var MIN = loader && !shot && !calm ? 1600 : 0;
	var ready = function () {
		setTimeout(function () {
			body.classList.add('is-ready');
			if (loader) { setTimeout(function () { loader.remove(); }, 700); }
		}, Math.max(0, MIN - (performance.now() - t0)));
	};
	if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); }
	setTimeout(function () { body.classList.add('is-ready'); if (loader && loader.parentNode) { loader.remove(); } }, 4000);
})();

/* ピコット・ステーション main.js：ドロワー／スクロール出現／エレベーター／CONTINUE のカウント／ローディング */
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

	// 見せ場：エレベーター。区間ごとに「最初の 3 割で上の階へ移動 → 残りは扉が開いて停車」
	var elev = document.querySelector('.elev');
	if (elev) {
		var floors = elev.querySelectorAll('.elev__floor');
		var panels = elev.querySelectorAll('.elev__panel');
		var num = elev.querySelector('.elev__num');
		var n = panels.length;
		var MOVE = 0.3;
		var current = -1;
		var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
		var setFloor = function (i) {
			if (i === current) { return; }
			current = i;
			panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
			floors.forEach(function (f, k) { f.classList.toggle('is-on', n - 1 - k === i); });
			num.textContent = panels[i].querySelector('.elev__code').textContent;
		};
		var render = function (p) {
			var seg = Math.min(n - 1, Math.floor(p * n));
			var t = p * n - seg;
			var pos = seg === 0 ? 0 : seg - 1 + ease(Math.min(1, t / MOVE));
			var moving = seg > 0 && t < MOVE;
			elev.style.setProperty('--pos', pos.toFixed(3));
			elev.classList.toggle('is-moving', moving);
			elev.classList.toggle('is-open', !moving);
			setFloor(moving ? seg - 1 : seg);
			if (moving) { num.textContent = panels[Math.round(pos)].querySelector('.elev__code').textContent; }
		};
		if (calm) {
			elev.classList.add('is-static');
		} else if (shot) {
			render(0.5);
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

	// CONTINUE? のカウントダウン（9 → 0 をくり返す）
	var count = document.querySelector('.continue__count span');
	if (count && !calm && !shot) {
		var c = 9;
		setInterval(function () { c = c === 0 ? 9 : c - 1; count.textContent = c; }, 1000);
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

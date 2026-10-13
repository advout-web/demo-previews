/* LINEA main.js：ドロワー／スクロール出現／固定して横に流れるギャラリー */
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

	// ギャラリー：縦スクロール量を横移動に変換し、各写真を斜めにワイプして出す
	var gal = document.querySelector('.gal');
	if (gal) {
		var track = gal.querySelector('.gal__track');
		var imgs = gal.querySelectorAll('.gal__img');
		var now = gal.querySelector('.gal__now');
		var bar = gal.querySelector('.gal__bar');
		var mqWide = window.matchMedia('(min-width: 901px)');
		var mqCalm = window.matchMedia('(prefers-reduced-motion: reduce)');
		var ticking = false;
		var active = function () { return mqWide.matches && !mqCalm.matches && !html.classList.contains('is-shot'); };
		var update = function () {
			ticking = false;
			if (!active()) {
				track.style.transform = '';
				imgs.forEach(function (im) { im.style.removeProperty('--p'); });
				return;
			}
			var r = gal.getBoundingClientRect();
			var vh = window.innerHeight;
			var vw = window.innerWidth;
			var p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
			var dist = track.scrollWidth - vw + 120;
			track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
			bar.style.setProperty('--prog', p.toFixed(3));
			var idx = 0;
			imgs.forEach(function (im, i) {
				var b = im.getBoundingClientRect();
				// 写真の左端が画面右端から 55% の位置まで来るあいだに 0 → 1
				var v = Math.min(1, Math.max(0, (vw - b.left) / (vw * 0.55)));
				im.style.setProperty('--p', v.toFixed(3));
				if (v > 0.5) { idx = i; }
			});
			if (now) { now.textContent = String(idx + 1).padStart(2, '0'); }
		};
		var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		window.addEventListener('load', update);
		update();
	}

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
	// AMBIENT：ローディングの数字を 000→100 に
	var lc = document.querySelector('.loader__count');
	if (lc && MIN) {
		var tl = function (t) { var p = Math.min(1, (t - t0L) / MIN); lc.textContent = String(Math.round(p * 100)).padStart(3, '0'); if (p < 1) { requestAnimationFrame(tl); } };
		requestAnimationFrame(tl);
	}
})();

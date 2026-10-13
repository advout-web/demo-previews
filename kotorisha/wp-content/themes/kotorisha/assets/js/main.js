/* ことり舎不動産 main.js：ドロワー／スクロール出現／線画の家を一筆ずつ描く */
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

	// 線画：スクロールの進み具合に合わせて、屋根 → 柱と縁側 → 庭の木 → ことり の順に描く
	var draw = document.querySelector('.draw__grid');
	var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (draw && !calm && !html.classList.contains('is-shot')) {
		var groups = Array.prototype.map.call(draw.querySelectorAll('.draw__g'), function (g) {
			return Array.prototype.map.call(g.querySelectorAll('path, rect, circle'), function (el) {
				var len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 1000);
				el.style.strokeDasharray = len + ' ' + len;
				el.style.strokeDashoffset = len;
				return { el: el, len: len };
			});
		});
		var steps = draw.querySelectorAll('.draw__step');
		var now = draw.querySelector('.draw__now');
		var nums = ['一', '二', '三', '四'];
		var ticking = false;
		var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
		var update = function () {
			ticking = false;
			var r = draw.getBoundingClientRect();
			var vh = window.innerHeight;
			var p = clamp((vh * 0.55 - r.top) / Math.max(1, r.height - vh * 0.7));
			var stage = p * groups.length;
			groups.forEach(function (items, gi) {
				var local = clamp(stage - gi);
				items.forEach(function (it, k) {
					var v = clamp(local * items.length - k);
					it.el.style.strokeDashoffset = (it.len * (1 - v)).toFixed(1);
				});
			});
			var active = Math.min(groups.length - 1, Math.floor(stage));
			steps.forEach(function (s, i) { s.classList.toggle('is-active', i === active); });
			if (now) { now.textContent = nums[active] || nums[0]; }
		};
		var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
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
})();

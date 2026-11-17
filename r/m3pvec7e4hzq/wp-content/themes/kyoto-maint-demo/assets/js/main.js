/**
 * 京都メンテナンス様 見本テーマ main.js（ライブラリなし）
 * メニューの開閉・スクロールでの出現・ビフォーアフターのつまみ
 */
(function () {
	'use strict';
	var doc = document;
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	doc.body.classList.add('is-ready');

	/* メニュー */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	if (btn && drawer) {
		var setOpen = function (open) {
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			drawer.hidden = !open;
		};
		btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); } });
		window.addEventListener('resize', function () { if (window.innerWidth > 1040) { setOpen(false); } });
	}

	/* 出現 */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || reduce || doc.documentElement.classList.contains('is-shot')) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	}

	/* ビフォー・アフターのつまみ */
	doc.querySelectorAll('.ba-slider').forEach(function (box) {
		var range = box.querySelector('.ba-slider__range');
		if (!range) { return; }
		var set = function (v) { box.style.setProperty('--pos', v + '%'); };
		range.addEventListener('input', function () { set(range.value); });
		/* 初めて見えたときに一度だけ、左右に少し動かして「動かせる」ことを見せる */
		if (reduce || !('IntersectionObserver' in window)) { return; }
		var hinted = false;
		var ob = new IntersectionObserver(function (en) {
			if (!en[0].isIntersecting || hinted) { return; }
			hinted = true; ob.disconnect();
			var t0 = null;
			var step = function (t) {
				if (t0 === null) { t0 = t; }
				var p = Math.min((t - t0) / 1800, 1);
				var v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p * 0.2);
				if (p >= 1) { v = 50; }
				set(v.toFixed(1)); range.value = Math.round(v);
				if (p < 1) { requestAnimationFrame(step); }
			};
			setTimeout(function () { requestAnimationFrame(step); }, 600);
		}, { threshold: 0.6 });
		ob.observe(box);
	});
})();

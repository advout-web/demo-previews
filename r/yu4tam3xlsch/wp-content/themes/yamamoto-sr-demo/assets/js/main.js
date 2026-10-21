/**
 * 山本社会保険労務士事務所 リニューアルご提案デモ - main.js（依存ライブラリなし）
 */
(function () {
	'use strict';

	var doc = document;
	var body = doc.body;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var header = doc.getElementById('site-header');

	/* ---------- ヘッダーの高さ（sticky の位置合わせ用） ---------- */
	function setHeaderHeight() {
		if (header) doc.documentElement.style.setProperty('--hh', header.offsetHeight + 'px');
	}
	setHeaderHeight();
	window.addEventListener('resize', setHeaderHeight);

	/* ---------- 表示開始（FV の文字・チェック・表題の線） ---------- */
	requestAnimationFrame(function () {
		setTimeout(function () { body.classList.add('is-ready'); }, reduceMotion ? 0 : 120);
	});

	/* ---------- スクロールで出現 ---------- */
	var targets = doc.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window && !reduceMotion) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) {
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		targets.forEach(function (el) { io.observe(el); });
	} else {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	}

	/* ---------- ヘッダーの影 ---------- */
	var ticking = false;
	window.addEventListener('scroll', function () {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(function () {
			if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
			ticking = false;
		});
	}, { passive: true });

	/* ---------- ドロワー（目次） ---------- */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function setDrawer(open) {
		if (!btn || !drawer) return;
		setHeaderHeight();
		drawer.classList.toggle('is-open', open);
		body.classList.toggle('is-drawer', open);
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.style.overflow = open ? 'hidden' : '';
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () { setDrawer(!drawer.classList.contains('is-open')); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
	}

	/* ---------- 業務案内のタブ ---------- */
	doc.querySelectorAll('[data-tabs]').forEach(function (wrap) {
		var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
		function select(tab, focus) {
			tabs.forEach(function (t) {
				var on = t === tab;
				t.setAttribute('aria-selected', on ? 'true' : 'false');
				t.tabIndex = on ? 0 : -1;
				var panel = doc.getElementById(t.getAttribute('aria-controls'));
				if (panel) panel.hidden = !on;
			});
			if (focus) tab.focus();
		}
		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { select(t, false); });
			t.addEventListener('keydown', function (e) {
				var n = null;
				if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
				if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
				if (n) { e.preventDefault(); select(n, true); }
			});
		});
	});
})();

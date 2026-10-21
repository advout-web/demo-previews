/**
 * 司法書士村上事務所（ご提案用の見本） main.js（依存ライブラリなし）
 * - 読み込み時に body.is-ready（FV の一度だけの動きの合図）
 * - ヘッダー：下へスクロールで隠れ、上へで現れる
 * - スマホのメニュー
 * - 取り扱い業務のタブ（矢印キー対応）
 */
(function () {
	'use strict';

	var doc = document;
	var body = doc.body;

	/* ---------- 読み込み完了 ---------- */
	requestAnimationFrame(function () {
		requestAnimationFrame(function () { body.classList.add('is-ready'); });
	});

	/* ---------- ヘッダーの出し入れ ---------- */
	var header = doc.getElementById('site-header');
	var lastY = window.scrollY;
	var ticking = false;
	window.addEventListener('scroll', function () {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(function () {
			var y = window.scrollY;
			if (header && !body.classList.contains('is-drawer-open')) {
				header.classList.toggle('is-hidden', y > 240 && y > lastY);
			}
			lastY = y;
			ticking = false;
		});
	}, { passive: true });

	/* ---------- スマホのメニュー ---------- */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function setDrawer(open) {
		if (!btn || !drawer) return;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.classList.toggle('is-drawer-open', open);
		var label = btn.querySelector('.menu-btn__label');
		if (label) label.textContent = open ? '閉じる' : 'メニュー';
	}
	if (btn) {
		btn.addEventListener('click', function () {
			setDrawer(btn.getAttribute('aria-expanded') !== 'true');
		});
	}
	if (drawer) {
		drawer.addEventListener('click', function (e) {
			if (e.target.closest('a')) setDrawer(false);
		});
	}
	doc.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && body.classList.contains('is-drawer-open')) {
			setDrawer(false);
			btn.focus();
		}
	});

	/* ---------- タブ ---------- */
	doc.querySelectorAll('[data-tabs]').forEach(function (root) {
		var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
		function select(tab, focus) {
			tabs.forEach(function (t) {
				var on = t === tab;
				t.setAttribute('aria-selected', on ? 'true' : 'false');
				t.tabIndex = on ? 0 : -1;
				var panel = doc.getElementById(t.getAttribute('aria-controls'));
				if (panel) panel.hidden = !on;
			});
			if (focus) tab.focus();
			if (tab.scrollIntoView && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) {
				tab.parentNode.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
			}
		}
		tabs.forEach(function (tab, i) {
			tab.addEventListener('click', function () { select(tab, false); });
			tab.addEventListener('keydown', function (e) {
				var next = null;
				if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
				if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
				if (e.key === 'Home') next = tabs[0];
				if (e.key === 'End') next = tabs[tabs.length - 1];
				if (next) { e.preventDefault(); select(next, true); }
			});
		});
	});
})();

/**
 * KA応援 川勝高博税理士事務所（ご提案の見本）- main.js（依存ライブラリなし）
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var body = doc.body;

	/* ---------- 見本の帯の高さ（折り返しても本文と重ならないように） ---------- */
	var band = doc.querySelector('.demo-band');
	function setBand() {
		if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* ---------- 読み込み後に FV を開始（一度だけの演出） ---------- */
	requestAnimationFrame(function () {
		requestAnimationFrame(function () { body.classList.add('is-ready'); });
	});

	/* ---------- スマホのメニュー ---------- */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function setDrawer(open) {
		root.classList.toggle('is-drawer-open', open);
		if (btn) {
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		}
		if (drawer) drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
	}
	if (btn) {
		btn.addEventListener('click', function () {
			setDrawer(!root.classList.contains('is-drawer-open'));
		});
	}
	doc.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') setDrawer(false);
	});
	if (drawer) {
		drawer.addEventListener('click', function (e) {
			if (e.target.closest('a')) setDrawer(false);
		});
	}

	/* ---------- スクロールでの出現 ---------- */
	var items = doc.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
		return;
	}
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-in');
				io.unobserve(entry.target);
			}
		});
	}, { rootMargin: '0px 0px -8% 0px' });
	items.forEach(function (el) { io.observe(el); });
})();

/**
 * 良建築設計事務所 リニューアルご提案の見本 - main.js（依存ライブラリなし）
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var body = doc.body;

	/* ---------- 見本の帯の高さ ---------- */
	var band = doc.querySelector('.demo-band');
	function setBand() {
		if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* ---------- 読み込み後に FV の動きを始める ---------- */
	function ready() { body.classList.add('is-ready'); }
	if (doc.readyState === 'complete') {
		ready();
	} else {
		window.addEventListener('load', ready);
		setTimeout(ready, 2500);
	}

	/* ---------- メニュー ---------- */
	var btn = doc.querySelector('.menu-btn');
	var nav = doc.getElementById('gnav');
	function closeMenu() {
		if (!btn) return;
		btn.setAttribute('aria-expanded', 'false');
		nav.classList.remove('is-open');
		body.classList.remove('is-menu-open');
	}
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') !== 'true';
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
			body.classList.toggle('is-menu-open', open);
		});
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
		nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
	}

	/* ---------- スクロールで出現 ---------- */
	var items = doc.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window && !root.classList.contains('is-shot')) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) {
					en.target.classList.add('is-in');
					io.unobserve(en.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach(function (el) { io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add('is-in'); });
	}

	/* ---------- 作品の写真の切り替え（今のサイトのマウスオーバーと同じ働き） ---------- */
	var gallery = doc.querySelector('[data-gallery]');
	if (gallery) {
		var main = gallery.querySelector('.js-main');
		var before = gallery.querySelector('.js-before');
		var msg = gallery.querySelector('.js-msg');
		var thumbs = gallery.querySelectorAll('.thumb');
		var show = function (t) {
			if (main && t.dataset.src) main.src = t.dataset.src;
			if (before && t.dataset.before) before.src = t.dataset.before;
			if (msg && typeof t.dataset.msg !== 'undefined') msg.textContent = t.dataset.msg;
			thumbs.forEach(function (x) {
				x.classList.toggle('is-current', x === t);
				x.setAttribute('aria-pressed', x === t ? 'true' : 'false');
			});
		};
		thumbs.forEach(function (t) {
			t.addEventListener('click', function () { show(t); });
			t.addEventListener('mouseenter', function () { show(t); });
		});
	}
})();

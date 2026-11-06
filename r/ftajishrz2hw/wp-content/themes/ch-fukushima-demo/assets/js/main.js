/**
 * Cut House Fukushima Demo - main.js（依存ライブラリなし）
 * 帯の高さ・メニュー開閉・出現・見本フォームの送信止め
 */
(function () {
	'use strict';
	var doc = document;
	var root = doc.documentElement;

	/* 見本の帯の高さをヘッダーの固定位置に反映 */
	var band = doc.querySelector('.demo-band');
	function setBand() { if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px'); }
	setBand();
	window.addEventListener('resize', setBand);

	/* メニュー開閉 */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function toggle(open) {
		if (!btn || !drawer) return;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		drawer.classList.toggle('is-open', open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		doc.body.style.overflow = open ? 'hidden' : '';
	}
	if (btn) btn.addEventListener('click', function () { toggle(btn.getAttribute('aria-expanded') !== 'true'); });
	if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
	doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });

	/* 出現 */
	var targets = doc.querySelectorAll('.reveal, .reveal-stagger');
	if ('IntersectionObserver' in window && !root.classList.contains('is-shot')) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
		}, { rootMargin: '0px 0px -8% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	} else {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	}
	doc.body.classList.add('is-ready');

	/* 見本のフォーム：送信しない */
	var form = doc.querySelector('.form-demo form');
	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var msg = form.querySelector('.form-demo__msg');
			if (msg) msg.textContent = 'このフォームは見本のため、送信できません。お問合せはお電話かメールでお願いいたします。';
		});
	}
})();

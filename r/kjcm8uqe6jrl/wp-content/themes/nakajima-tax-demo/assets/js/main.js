/* 中嶋税理士事務所（リニューアルご提案の見本） */
(function () {
	'use strict';

	document.body.classList.add('is-ready');

	// スマホのメニュー
	var btn = document.querySelector('.menu-btn');
	var nav = document.getElementById('gnav');
	if (btn && nav) {
		var close = function () {
			nav.classList.remove('is-open');
			btn.setAttribute('aria-expanded', 'false');
		};
		btn.addEventListener('click', function () {
			var open = nav.classList.toggle('is-open');
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				close();
				btn.focus();
			}
		});
		window.addEventListener('resize', function () {
			if (window.innerWidth > 767) { close(); }
		});
	}
})();

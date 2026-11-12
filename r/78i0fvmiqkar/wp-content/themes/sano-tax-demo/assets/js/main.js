/* 佐野税理士事務所 見本：メニューの開閉と、そろばん・締切線の一度だけの動き */
(function () {
	'use strict';
	var btn = document.querySelector('.menu-btn');
	var nav = document.getElementById('gnav');
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') !== 'true';
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				btn.setAttribute('aria-expanded', 'false');
				nav.classList.remove('is-open');
				btn.focus();
			}
		});
	}

	var items = document.querySelectorAll('.reveal');
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce || !('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) {
					// 少し待ってから珠をはじく（読み込み直後に見えるように）
					setTimeout(function () { en.target.classList.add('is-in'); }, 250);
					io.unobserve(en.target);
				}
			});
		}, { threshold: 0.3 });
		items.forEach(function (el) { io.observe(el); });
	}
	window.addEventListener('load', function () { document.body.classList.add('is-ready'); });
})();

/* Kukankobo Demo */
(function () {
	'use strict';
	var root = document.documentElement;

	// 見本の帯の高さをヘッダー位置に反映
	var band = document.querySelector('.demo-band');
	function setBand() {
		if (band) { root.style.setProperty('--band-h', band.offsetHeight + 'px'); }
	}
	setBand();
	window.addEventListener('resize', setBand);

	// メニュー
	var btn = document.querySelector('.menu-btn');
	var nav = document.getElementById('gnav');
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') !== 'true';
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
			document.body.style.overflow = open ? 'hidden' : '';
		});
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) {
				btn.setAttribute('aria-expanded', 'false');
				nav.classList.remove('is-open');
				document.body.style.overflow = '';
			}
		});
	}

	// スクロールで出現
	var items = document.querySelectorAll('.reveal, .reveal-stagger, .js-split');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		items.forEach(function (el) { io.observe(el); });

		// FV の気流は画面外で止める
		var fv = document.querySelector('.fv');
		if (fv) {
			new IntersectionObserver(function (entries) {
				fv.classList.toggle('is-paused', !entries[0].isIntersecting);
			}).observe(fv);
		}
	} else {
		items.forEach(function (el) { el.classList.add('is-in'); });
	}

	window.addEventListener('load', function () { document.body.classList.add('is-ready'); });
})();

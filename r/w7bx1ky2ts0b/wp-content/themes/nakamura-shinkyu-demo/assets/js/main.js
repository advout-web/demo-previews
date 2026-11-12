(function () {
	'use strict';
	var html = document.documentElement;
	var ready = function () { document.body.classList.add('is-ready'); };
	if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); }
	setTimeout(ready, 1500);

	// メニュー（スマホ）
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
				btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); btn.focus();
			}
		});
	}

	// スクロールで出現
	var items = document.querySelectorAll('.reveal, .reveal-stagger');
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (html.classList.contains('is-shot') || reduce || !('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
		return;
	}
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (en) {
			if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
		});
	}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
	items.forEach(function (el) { io.observe(el); });
})();

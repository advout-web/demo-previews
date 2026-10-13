/* 金星堂 — メニュー開閉・出現・招待状（封蝋が割れ、フラップが開き、カードがせり上がる） */
(function () {
	var root = document.documentElement;
	var hd = document.querySelector('.hd');
	var tg = document.querySelector('.hd__toggle');
	if (tg) {
		tg.addEventListener('click', function () {
			var open = hd.classList.toggle('is-open');
			tg.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		document.querySelectorAll('.hd__nav a').forEach(function (a) {
			a.addEventListener('click', function () { hd.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); });
		});
	}
	var still = root.classList.contains('is-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches;
	var items = document.querySelectorAll('.reveal');
	if (still || !('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach(function (el) { io.observe(el); });
	}
	var inv = document.querySelector('.invite');
	if (!inv) { return; }
	if (still) { inv.classList.add('is-open'); return; }
	function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
	var ticking = false;
	function update() {
		ticking = false;
		var r = inv.getBoundingClientRect();
		var range = inv.offsetHeight - window.innerHeight;
		var p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 1;
		var flap = seg(p, 0.16, 0.36);
		inv.style.setProperty('--seal', seg(p, 0.04, 0.16).toFixed(3));
		inv.style.setProperty('--flap', flap.toFixed(3));
		inv.style.setProperty('--rise', seg(p, 0.38, 0.68).toFixed(3));
		inv.style.setProperty('--away', seg(p, 0.66, 0.88).toFixed(3));
		inv.classList.toggle('is-open', flap > 0.5);
	}
	window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
	window.addEventListener('resize', update);
	update();
})();

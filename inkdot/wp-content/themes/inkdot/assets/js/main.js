/* INKDOT — メニュー開閉・出現・FV の見当合わせ */
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
	var items = document.querySelectorAll('.reveal');
	if (root.classList.contains('is-shot') || !('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach(function (el) { io.observe(el); });
	}
	var fv = document.querySelector('.fv');
	if (!fv) { return; }
	var pct = fv.querySelector('.fv__pct');
	var still = root.classList.contains('is-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches;
	function set(p) {
		fv.style.setProperty('--p', p.toFixed(3));
		pct.textContent = Math.round(p * 100);
		fv.classList.toggle('is-done', p > 0.995);
	}
	if (still) { set(1); return; }
	var ticking = false;
	function update() {
		ticking = false;
		var r = fv.getBoundingClientRect();
		var range = fv.offsetHeight - window.innerHeight;
		var p = range > 0 ? Math.min(1, Math.max(0, -r.top / (range * 0.8))) : 1;
		set(p);
	}
	window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
	window.addEventListener('resize', update);
	update();
})();

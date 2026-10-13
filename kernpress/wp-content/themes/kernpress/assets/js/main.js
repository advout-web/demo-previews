/* KERN PRESS — メニュー開閉・出現・写真の断裁 */
(function () {
	var root = document.documentElement;
	var hd = document.querySelector('.hd');
	var tg = document.querySelector('.hd__toggle');
	if (tg) {
		tg.addEventListener('click', function () {
			var open = hd.classList.toggle('is-open');
			tg.setAttribute('aria-expanded', open ? 'true' : 'false');
			tg.textContent = open ? 'Close' : 'Menu';
		});
		document.querySelectorAll('.hd__nav a').forEach(function (a) {
			a.addEventListener('click', function () { hd.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); tg.textContent = 'Menu'; });
		});
	}
	var items = document.querySelectorAll('.reveal, .trim');
	function show(el) {
		el.classList.add('is-in');
		if (el.classList.contains('trim')) { setTimeout(function () { el.classList.add('is-cut'); }, 1700); }
	}
	if (root.classList.contains('is-shot') || !('IntersectionObserver' in window)) {
		items.forEach(show);
		return;
	}
	/* .trim は img を clip-path で隠すが、figure 自体には面積があるので figure を直接監視する */
	var io = new IntersectionObserver(function (es) {
		es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
	}, { rootMargin: '0px 0px -10% 0px' });
	items.forEach(function (el) { io.observe(el); });
})();

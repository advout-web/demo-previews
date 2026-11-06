/* しんたに事務所 リニューアルご提案用デモ（依存ライブラリなし） */
(function () {
	'use strict';
	var doc = document, root = doc.documentElement, body = doc.body;

	/* 帯の高さ（折り返しで変わる）をヘッダー位置に反映 */
	var bar = doc.querySelector('.demo-bar');
	function setBar() { if (bar) root.style.setProperty('--bar-h', bar.offsetHeight + 'px'); }
	setBar();
	window.addEventListener('resize', setBar);

	/* メニュー */
	var btn = doc.querySelector('.hd__menu'), drawer = doc.getElementById('drawer');
	function close() {
		if (!drawer) return;
		btn.setAttribute('aria-expanded', 'false');
		drawer.classList.remove('is-open'); body.classList.remove('menu-open');
		setTimeout(function () { if (btn.getAttribute('aria-expanded') === 'false') drawer.hidden = true; }, 350);
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () {
			if (btn.getAttribute('aria-expanded') === 'true') { close(); return; }
			drawer.hidden = false; btn.setAttribute('aria-expanded', 'true'); body.classList.add('menu-open');
			requestAnimationFrame(function () { drawer.classList.add('is-open'); });
		});
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
	}

	/* 出現 */
	doc.querySelectorAll('.reveal-stagger').forEach(function (el) {
		Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', i); });
	});
	var targets = doc.querySelectorAll('.reveal,.reveal-stagger');
	if ('IntersectionObserver' in window && !root.classList.contains('is-shot')) {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
		}, { rootMargin: '0px 0px -8% 0px' });
		targets.forEach(function (t) { io.observe(t); });
	} else {
		targets.forEach(function (t) { t.classList.add('is-in'); });
	}
	body.classList.add('is-ready');
})();

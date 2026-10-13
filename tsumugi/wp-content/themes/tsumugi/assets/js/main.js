/* つむぎ活版舎 — メニュー開閉・出現・見出しを活字で押す */
(function () {
	var root = document.documentElement;
	var hd = document.querySelector('.hd');
	var tg = document.querySelector('.hd__toggle');
	if (tg) {
		tg.addEventListener('click', function () {
			var open = hd.classList.toggle('is-open');
			tg.setAttribute('aria-expanded', open ? 'true' : 'false');
			tg.firstElementChild.textContent = open ? '閉じる' : '目次';
		});
		document.querySelectorAll('.hd__nav a').forEach(function (a) {
			a.addEventListener('click', function () { hd.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); tg.firstElementChild.textContent = '目次'; });
		});
	}
	/* 見出しを1文字ずつ span.ch に分ける（<br> は残す。読み上げ用に元の文を aria-label へ） */
	document.querySelectorAll('.press').forEach(function (el) {
		var i = 0;
		el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ''));
		Array.prototype.slice.call(el.childNodes).forEach(function (n) {
			if (n.nodeType !== 3) { return; }
			var frag = document.createElement('span');
			frag.className = 'ln';
			n.textContent.replace(/\s+/g, '').split('').forEach(function (ch) {
				var s = document.createElement('span');
				s.className = 'ch';
				s.setAttribute('aria-hidden', 'true');
				s.style.setProperty('--i', i++);
				s.textContent = ch;
				frag.appendChild(s);
			});
			n.parentNode.replaceChild(frag, n);
		});
	});
	var items = document.querySelectorAll('.reveal, .press');
	if (root.classList.contains('is-shot') || !('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
		return;
	}
	var io = new IntersectionObserver(function (es) {
		es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
	}, { rootMargin: '0px 0px -10% 0px' });
	items.forEach(function (el) { io.observe(el); });
})();

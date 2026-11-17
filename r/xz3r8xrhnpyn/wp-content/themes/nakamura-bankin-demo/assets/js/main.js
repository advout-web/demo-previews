/* Nakamura Bankin Demo */
(function () {
	'use strict';
	var html = document.documentElement;
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var shot = html.classList.contains('is-shot') || /[?&]shot=1/.test(location.search);

	/* メニューの開閉 */
	var btn = document.querySelector('.menu-btn');
	var nav = document.getElementById('gnav');
	if (btn && nav) {
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') === 'true';
			btn.setAttribute('aria-expanded', open ? 'false' : 'true');
			document.body.classList.toggle('is-menu-open', !open);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
				btn.setAttribute('aria-expanded', 'false');
				document.body.classList.remove('is-menu-open');
				btn.focus();
			}
		});
	}

	/* 出現 */
	var targets = document.querySelectorAll('.reveal, .reveal-stagger');
	if (reduce || shot || !('IntersectionObserver' in window)) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -10% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	/* FV：板を一度だけ折り曲げる */
	var roof = document.getElementById('roof');
	var sheet = document.getElementById('roof-sheet');
	if (roof && sheet) {
		var seams = sheet.getAttribute('data-seams').split(',').map(Number);
		var base = Number(sheet.getAttribute('data-base'));
		var h = Number(sheet.getAttribute('data-h'));
		var draw = function (t) {
			/* t: 0..1（折り目ごとに少しずつ遅らせる） */
			var pts = ['0,' + base];
			seams.forEach(function (x, i) {
				var local = Math.min(1, Math.max(0, t * 1.6 - i * 0.15));
				var e = 1 - Math.pow(1 - local, 3);
				var y = base - h * e;
				var w = 12 - 6 * e; /* 立ち上がるほど幅が詰まる */
				pts.push((x - 12) + ',' + base, (x - w / 2 - 0) + ',' + y.toFixed(1), (x + w / 2) + ',' + y.toFixed(1), (x + 12) + ',' + base);
			});
			pts.push('600,' + base);
			sheet.setAttribute('points', pts.join(' '));
		};
		var done = function () { draw(1); roof.classList.add('is-folded'); };
		if (reduce || shot) {
			done();
			roof.classList.add('is-static');
		} else {
			draw(0);
			var start = null;
			var dur = 1400;
			var step = function (ts) {
				if (start === null) { start = ts; }
				var t = Math.min(1, (ts - start) / dur);
				draw(t);
				if (t < 1) { requestAnimationFrame(step); } else { roof.classList.add('is-folded'); }
			};
			setTimeout(function () { requestAnimationFrame(step); }, 350);
		}
	}

	window.addEventListener('load', function () { document.body.classList.add('is-ready'); });
})();

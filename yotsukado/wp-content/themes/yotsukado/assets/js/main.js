/* ヨツカド main.js：ドロワー／スクロール出現／人の形の図の並び替え／営業中の表示／ローディング */
(function () {
	'use strict';
	var html = document.documentElement;
	var body = document.body;
	var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var shot = html.classList.contains('is-shot');

	// ドロワー
	var btn = document.querySelector('.menu-btn');
	var drawer = document.getElementById('drawer');
	function setDrawer(open) {
		body.classList.toggle('is-drawer-open', open);
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () { setDrawer(!body.classList.contains('is-drawer-open')); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a') || e.target === drawer) { setDrawer(false); } });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrawer(false); } });
	}

	// スクロール出現
	var targets = document.querySelectorAll('.reveal, .reveal-stagger');
	if (!('IntersectionObserver' in window) || shot) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	// 見せ場：人の形の図。0＝散らばる → 1＝時間帯ごとの柱 → 2＝棟ごとのかたまり。位置は図の大きさから計算する
	var iso = document.querySelector('.iso');
	if (iso) {
		var chart = iso.querySelector('.iso__chart');
		var figs = Array.prototype.slice.call(iso.querySelectorAll('.fig'));
		var HOURS = [3, 5, 7, 5, 9, 8, 3];
		var AREAS = [16, 10, 6, 8];
		var AREA_C = ['c-y', 'c-o', 'c-g', ''];
		var seed = 7;
		var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
		var scatter = figs.map(function () { return [rnd(), rnd()]; });
		var state = -1;
		var place = function (st) {
			var W = chart.clientWidth, H = chart.clientHeight;
			var fw = figs[0].offsetWidth, fh = figs[0].offsetHeight;
			var k = 0;
			figs.forEach(function (f) { f.classList.remove('c-y', 'c-g', 'c-o'); });
			if (st === 0) {
				figs.forEach(function (f, i) {
					f.style.setProperty('--x', (scatter[i][0] * (W - fw)).toFixed(1) + 'px');
					f.style.setProperty('--y', (scatter[i][1] * (H - fh)).toFixed(1) + 'px');
				});
			} else if (st === 1) {
				HOURS.forEach(function (n, c) {
					var cx = (c + 0.5) * W / HOURS.length - fw / 2;
					for (var r = 0; r < n; r++, k++) {
						var f = figs[k];
						f.style.setProperty('--x', cx.toFixed(1) + 'px');
						f.style.setProperty('--y', (H - (r + 1) * fh * 1.04).toFixed(1) + 'px');
						if (n >= 8) { f.classList.add('c-y'); }
					}
				});
			} else {
				var per = W / AREAS.length;
				var cols = Math.max(2, Math.min(4, Math.floor((per - 8) / (fw * 1.25))));
				AREAS.forEach(function (n, g) {
					var x0 = g * per + (per - cols * fw * 1.25) / 2;
					for (var i = 0; i < n; i++, k++) {
						var f = figs[k];
						f.style.setProperty('--x', (x0 + (i % cols) * fw * 1.25).toFixed(1) + 'px');
						f.style.setProperty('--y', (H - (Math.floor(i / cols) + 1) * fh * 1.04).toFixed(1) + 'px');
						if (AREA_C[g]) { f.classList.add(AREA_C[g]); }
					}
				});
			}
		};
		var setState = function (st, force) {
			if (st === state && !force) { return; }
			state = st;
			iso.setAttribute('data-state', st);
			place(st);
		};
		if (calm) {
			iso.classList.add('is-static');
			setState(2);
		} else if (shot) {
			setState(1);
		} else {
			var ticking = false;
			var update = function () {
				ticking = false;
				var r = iso.getBoundingClientRect();
				var p = Math.max(0, Math.min(0.999, -r.top / (iso.offsetHeight - window.innerHeight)));
				setState(p < 0.22 ? 0 : (p < 0.62 ? 1 : 2));
			};
			window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
			update();
		}
		window.addEventListener('resize', function () { place(state); });
	}

	// いまの時刻と、営業中の店の数（表の data-open / data-close から計算）
	var clock = document.querySelector('.fv__clock');
	var openEl = document.querySelector('.js-open');
	var rows = document.querySelectorAll('.shops__table tbody tr');
	if (rows.length) {
		var toMin = function (t) { var a = t.split(':'); return +a[0] * 60 + +a[1]; };
		var tickNow = function () {
			var d = new Date();
			var m = d.getHours() * 60 + d.getMinutes();
			var open = 0;
			rows.forEach(function (tr) {
				var o = toMin(tr.dataset.open), c = toMin(tr.dataset.close);
				var st = m < o ? '準備中' : (m < c ? '営業中' : '本日終了');
				tr.classList.toggle('is-open', st === '営業中');
				tr.querySelector('.state').textContent = st;
				if (st === '営業中') { open++; }
			});
			if (clock) { clock.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
			if (openEl && openEl.textContent !== String(open)) {
				openEl.textContent = open;
				openEl.classList.remove('is-tick'); void openEl.offsetWidth; openEl.classList.add('is-tick');
			}
		};
		tickNow();
		setInterval(tickNow, 30000);
	}

	// ローディング：トップページにだけ .loader がある。最低 1.6 秒見せてから is-ready（下層ページはすぐ is-ready）
	var loader = document.querySelector('.loader');
	var t0 = performance.now();
	var MIN = loader && !shot && !calm ? 1600 : 0;
	var ready = function () {
		setTimeout(function () {
			body.classList.add('is-ready');
			if (loader) { setTimeout(function () { loader.remove(); }, 700); }
		}, Math.max(0, MIN - (performance.now() - t0)));
	};
	if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); }
	setTimeout(function () { body.classList.add('is-ready'); if (loader && loader.parentNode) { loader.remove(); } }, 4000);
})();

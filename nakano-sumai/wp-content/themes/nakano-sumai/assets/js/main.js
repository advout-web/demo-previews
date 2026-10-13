/* 中野すまい相談室 main.js：ローディング（トップのみ）／ドロワー／スクロール出現／予算シミュレーター／数字のカウント */
(function () {
	'use strict';
	var html = document.documentElement;
	var body = document.body;
	var shot = html.classList.contains('is-shot');
	var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ローディング：トップページにだけ .loader がある。最低 1.6 秒見せてから is-ready
	var loader = document.querySelector('.loader');
	var start = performance.now();
	var MIN = loader && !shot && !calm ? 1600 : 0;
	if (loader && MIN) {
		var cnt = loader.querySelector('.loader__count');
		var tick = function (t) {
			var p = Math.min(1, (t - start) / MIN);
			cnt.textContent = Math.round(p * 100);
			loader.style.setProperty('--p', p.toFixed(3));
			if (p < 1) { requestAnimationFrame(tick); }
		};
		requestAnimationFrame(tick);
	}
	var ready = function () {
		setTimeout(function () {
			body.classList.add('is-ready');
			if (loader) { setTimeout(function () { loader.remove(); }, 1000); }
		}, Math.max(0, MIN - (performance.now() - start)));
	};
	if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); }
	setTimeout(function () { body.classList.add('is-ready'); }, 4000);

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
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) { setDrawer(false); } });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrawer(false); } });
	}

	// 数字のカウントアップ（.count）
	var countUp = function (el) {
		var to = parseFloat(el.getAttribute('data-to'));
		var dec = (el.getAttribute('data-to').split('.')[1] || '').length;
		if (shot || calm || !to) { return; }
		var t0 = performance.now();
		var step = function (t) {
			var p = Math.min(1, (t - t0) / 1200);
			el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec);
			if (p < 1) { requestAnimationFrame(step); }
		};
		requestAnimationFrame(step);
	};

	// スクロール出現
	var targets = document.querySelectorAll('.reveal, .reveal-stagger, .js-split');
	if (!('IntersectionObserver' in window) || shot) {
		targets.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) {
					en.target.classList.add('is-in');
					en.target.querySelectorAll('.count').forEach(countUp);
					io.unobserve(en.target);
				}
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
		targets.forEach(function (el) { io.observe(el); });
	}

	// 予算シミュレーター
	var sim = document.querySelector('[data-sim]');
	if (sim) {
		var $ = function (s) { return sim.querySelector(s); };
		var range = $('[data-range]');
		var plan = $('[data-plan]');
		var bars = sim.querySelectorAll('[data-bar]');
		var mode = 'rent';
		var MODES = {
			rent: { label: '月々の家賃', min: 6, max: 25, val: 9, o1: '初期費用の目安', o2: '年収の目安',
				note: '※ 中野区周辺の家賃の目安と、家賃の4.5ヶ月分を初期費用、年収の30％を家賃の上限とした簡易計算です。実際の金額は物件により異なります。' },
			buy: { label: '月々の返済額', min: 8, max: 30, val: 12, o1: '借入額の目安', o2: '年収の目安',
				note: '※ 金利1.0％・35年・元利均等返済、返済額を年収の25％とした簡易計算です。実際の借入額は金融機関の審査により異なります。' }
		};
		var plans = [['1R・1K', 0], ['1DK〜1LDK', 1], ['2LDK', 2], ['3LDK〜', 3]];
		var prev = '';
		var update = function () {
			var v = parseFloat(range.value);
			var m = MODES[mode];
			var o1, o2, idx;
			$('[data-value]').textContent = v.toFixed(1);
			if (mode === 'rent') {
				o1 = (v * 4.5).toFixed(1);
				o2 = Math.round(v * 12 / 0.3);
				idx = v < 8 ? 0 : v < 13 ? 1 : v < 19 ? 2 : 3;
				$('[data-o1-unit]').textContent = '万円';
			} else {
				var r = 0.01 / 12;
				var loan = v * (1 - Math.pow(1 + r, -420)) / r;
				o1 = Math.round(loan / 10) * 10;
				o2 = Math.round(v * 12 / 0.25);
				idx = loan < 3500 ? 1 : loan < 5500 ? 2 : 3;
				$('[data-o1-unit]').textContent = '万円';
			}
			$('[data-o1]').textContent = Number(o1).toLocaleString('ja-JP');
			$('[data-o2]').textContent = Number(o2).toLocaleString('ja-JP');
			var txt = mode === 'buy' && idx === 3 ? '3LDK・戸建て' : plans[idx][0];
			if (txt !== prev) {
				plan.textContent = txt;
				var box = plan.parentNode;
				box.classList.remove('is-flash'); void box.offsetWidth; box.classList.add('is-flash');
				prev = txt;
			}
			bars.forEach(function (b, i) { b.classList.toggle('is-on', i === idx); });
		};
		var setMode = function (md) {
			mode = md;
			var m = MODES[md];
			range.min = m.min; range.max = m.max; range.value = m.val;
			$('[data-label]').textContent = m.label;
			$('[data-min]').textContent = m.min + '万円';
			$('[data-max]').textContent = m.max + '万円';
			$('[data-o1-label]').textContent = m.o1;
			$('[data-o2-label]').textContent = m.o2;
			$('[data-note]').textContent = m.note;
			sim.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-mode') === md ? 'true' : 'false'); });
			update();
		};
		range.addEventListener('input', update);
		sim.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
		update();
	}
})();

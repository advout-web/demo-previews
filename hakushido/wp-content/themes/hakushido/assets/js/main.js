/* 白紙堂 — メニュー開閉・出現・見積りシミュレーター（数字が回って切り替わる） */
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

	var form = document.querySelector('.sim');
	if (!form) { return; }
	var D = JSON.parse(form.getAttribute('data-sim'));
	var WD = ['日', '月', '火', '水', '木', '金', '土'];

	/* 文字列を、数字は 0〜9 の縦の列、それ以外は1文字に分けて表示し、列を動かして数字を切り替える */
	function odo(el, str) {
		el.setAttribute('aria-label', str);
		var shape = str.replace(/\d/g, '0');
		if (el.getAttribute('data-shape') !== shape) {
			el.setAttribute('data-shape', shape);
			el.innerHTML = '';
			var di = 0;
			str.split('').forEach(function (c) {
				var s = document.createElement('span');
				s.setAttribute('aria-hidden', 'true');
				if (/\d/.test(c)) {
					s.className = 'dg';
					var col = document.createElement('span');
					col.className = 'dg__col';
					col.style.setProperty('--i', di++);
					for (var n = 0; n < 10; n++) { var d = document.createElement('span'); d.textContent = n; col.appendChild(d); }
					s.appendChild(col);
				} else {
					s.className = 'ch';
					s.textContent = c;
				}
				el.appendChild(s);
			});
			el.offsetWidth; /* 0 の位置から回り始めるように一度描画させる */
		}
		var cols = el.querySelectorAll('.dg__col');
		var digits = str.replace(/\D/g, '');
		cols.forEach(function (col, i) { col.style.transform = 'translateY(' + (-1.2 * +digits[i]) + 'em)'; });
	}
	function addBizDays(n) {
		var d = new Date();
		while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) { n--; } }
		return d;
	}
	function val(name) { return form.querySelector('input[name="' + name + '"]:checked').value; }
	var outPrice = form.querySelector('[data-odo="price"]');
	var outUnit = form.querySelector('[data-odo="unit"]');
	var outDate = form.querySelector('[data-odo="date"]');
	function update() {
		var qi = +val('qty');
		var sp = D.speeds[+val('speed')];
		var total = Math.round(D.prices[val('item')][qi] * D.papers[+val('paper')][1] * sp[3] / 10) * 10;
		var unit = Math.round(total / D.qty[qi] * 10) / 10;
		var day = addBizDays(sp[2]);
		odo(outPrice, '¥' + total.toLocaleString('ja-JP'));
		odo(outUnit, '¥' + unit.toFixed(1));
		odo(outDate, (day.getMonth() + 1) + '月' + day.getDate() + '日（' + WD[day.getDay()] + '）');
	}
	form.addEventListener('change', update);
	update();
})();

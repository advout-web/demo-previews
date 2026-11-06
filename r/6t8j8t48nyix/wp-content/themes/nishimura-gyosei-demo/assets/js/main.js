/**
 * 西村泰成行政書士事務所（見本）main.js（依存ライブラリなし）
 * - 見本の帯の高さをヘッダー位置に反映
 * - メニューの開閉
 * - 画面に入った要素の出現（.reveal → .is-in）
 * - 見本フォームの送信ボタン（何も送らない）
 */
(function () {
	'use strict';
	var doc = document;
	var root = doc.documentElement;

	/* 見本の帯の高さ */
	var band = doc.getElementById('demo-band');
	function setBand() {
		if (band) root.style.setProperty('--band-h', band.offsetHeight + 'px');
	}
	setBand();
	window.addEventListener('resize', setBand);

	/* 読み込み完了（床の誘導線を引く） */
	function ready() { doc.body.classList.add('is-ready'); }
	if (doc.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); setTimeout(ready, 2500); }

	/* メニュー */
	var btn = doc.querySelector('.menu-btn');
	var drawer = doc.getElementById('drawer');
	function toggle(open) {
		if (!btn || !drawer) return;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		drawer.classList.toggle('is-open', open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		doc.body.style.overflow = open ? 'hidden' : '';
	}
	if (btn && drawer) {
		btn.addEventListener('click', function () { toggle(btn.getAttribute('aria-expanded') !== 'true'); });
		drawer.addEventListener('click', function (e) { if (e.target === drawer || e.target.closest('a')) toggle(false); });
		doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
	}

	/* 出現 */
	var items = doc.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach(function (el, i) { el.style.transitionDelay = Math.min(i, 4) * 90 + 'ms'; io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add('is-in'); });
	}

	/* 見本フォーム */
	doc.querySelectorAll('.js-sample-submit').forEach(function (b) {
		b.addEventListener('click', function () {
			var out = b.closest('form').querySelector('.sf-result');
			if (out) out.textContent = 'これは見本のため、送信されていません。お問い合わせはライン又はメールをご利用ください。';
		});
	});
})();

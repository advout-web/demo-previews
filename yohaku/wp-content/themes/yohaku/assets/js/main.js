/**
 * YOHAKU — main.js
 * ローディング、慣性スクロール（Lenis）、ヘッダー、全画面メニュー、出現アニメーション、
 * 右端の目次、サービス一覧のホバー写真、丸いリンクの吸い寄せ。
 */
(function () {
	'use strict';

	var doc = document.documentElement;
	var body = document.body;
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var isShot = function () { return doc.classList.contains('is-shot'); };
	var isFront = body.classList.contains('is-front');

	/* ---------- 文字を1文字ずつ span に分ける ---------- */
	var counter = 0;
	function split(el, continuous) {
		if (el.dataset.splitDone) return;
		el.dataset.splitDone = '1';
		var i = continuous ? counter : 0;
		var walk = function (node) {
			Array.prototype.slice.call(node.childNodes).forEach(function (child) {
				if (child.nodeType === 3) {
					var frag = document.createDocumentFragment();
					Array.from(child.textContent).forEach(function (c) {
						if (/\s/.test(c)) { frag.appendChild(document.createTextNode(c)); return; }
						var s = document.createElement('span');
						s.className = 'ch';
						s.style.setProperty('--i', i++);
						s.textContent = c;
						frag.appendChild(s);
					});
					child.parentNode.replaceChild(frag, child);
				} else if (child.nodeType === 1 && child.tagName !== 'BR') {
					walk(child);
				}
			});
		};
		walk(el);
		if (continuous) counter = i;
	}
	document.querySelectorAll('.js-split').forEach(function (el) { split(el, false); });
	document.querySelectorAll('.js-chars').forEach(function (el) { split(el, true); });

	/* ---------- 慣性スクロール（Lenis） ---------- */
	var lenis = null;
	if (!reduce && window.Lenis && !isShot()) {
		lenis = new window.Lenis({ duration: 1.25, smoothWheel: true });
		var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
		requestAnimationFrame(raf);
	}
	var scrollToTarget = function (target) {
		if (lenis) { lenis.scrollTo(target, { offset: -60 }); return; }
		var el = typeof target === 'number' ? null : target;
		window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY - 60 : target, behavior: reduce ? 'auto' : 'smooth' });
	};
	document.addEventListener('click', function (e) {
		var a = e.target.closest('a[href*="#"]');
		if (!a) return;
		var url = new URL(a.href, location.href);
		if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
		var t = document.querySelector(url.hash);
		if (!t) return;
		e.preventDefault();
		scrollToTarget(t);
	});

	/* ---------- ローディング ---------- */
	var loader = document.querySelector('.loader');
	var readyDone = false;
	function ready() {
		if (readyDone) return;
		readyDone = true;
		body.classList.add('is-ready');
	}
	if (!loader || isShot() || reduce) {
		if (loader) loader.classList.add('is-gone');
		ready();
	} else {
		var minTime = isFront ? 2100 : 1100;
		var t0 = Date.now();
		var finish = function () {
			var wait = Math.max(0, minTime - (Date.now() - t0));
			setTimeout(function () {
				loader.classList.add('is-out');
				setTimeout(ready, 350);
				setTimeout(function () { loader.classList.add('is-gone'); }, 1200);
			}, wait);
		};
		if (document.readyState === 'complete') finish();
		else window.addEventListener('load', finish);
		setTimeout(finish, 5000);
	}

	/* ---------- ヘッダー ---------- */
	var header = document.getElementById('site-header');
	var pagetop = document.querySelector('.pagetop');
	var lastY = window.scrollY;
	var onScroll = function () {
		var y = window.scrollY;
		if (header) {
			header.classList.toggle('is-scrolled', y > 40);
			if (!body.classList.contains('is-locked')) {
				if (y > 300 && y > lastY + 4) header.classList.add('is-hidden');
				else if (y < lastY - 4 || y < 300) header.classList.remove('is-hidden');
			}
		}
		if (pagetop) pagetop.classList.toggle('is-show', y > 700);
		lastY = y;
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
	if (pagetop) {
		pagetop.addEventListener('click', function (e) { e.preventDefault(); scrollToTarget(0); });
	}

	/* ---------- 全画面メニュー ---------- */
	var menuBtn = document.querySelector('.menu-btn');
	var drawer = document.getElementById('drawer');
	if (menuBtn && drawer) {
		var label = menuBtn.querySelector('.menu-btn__label');
		var setOpen = function (open) {
			menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
			drawer.classList.toggle('is-open', open);
			drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
			body.classList.toggle('is-locked', open);
			if (lenis) { if (open) lenis.stop(); else lenis.start(); }
			if (label) label.textContent = open ? 'とじる' : 'メニュー';
			if (open) {
				header.classList.remove('is-hidden');
				var f = drawer.querySelector('a');
				if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 400);
			}
		};
		menuBtn.addEventListener('click', function () { setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'); });
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setOpen(false); menuBtn.focus(); }
		});
	}

	/* ---------- スクロール出現 ---------- */
	var targets = document.querySelectorAll('.reveal, .reveal-stagger, .js-split');
	if ('IntersectionObserver' in window && !isShot()) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
			});
		}, { rootMargin: '0px 0px -12% 0px' });
		targets.forEach(function (t) { io.observe(t); });
	} else {
		targets.forEach(function (t) { t.classList.add('is-in'); });
	}

	/* ---------- 右端の目次：今いるセクション ---------- */
	var indexLinks = document.querySelectorAll('.index-nav a');
	if (indexLinks.length && 'IntersectionObserver' in window) {
		var secIo = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				indexLinks.forEach(function (a) { a.classList.toggle('is-current', a.dataset.sec === en.target.id); });
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		document.querySelectorAll('.js-sec').forEach(function (s) { secIo.observe(s); });
	}

	/* ---------- サービス一覧：ホバーで写真がカーソルについてくる ---------- */
	var float = document.querySelector('.sv-float');
	if (float && window.matchMedia('(hover: hover) and (min-width: 861px)').matches) {
		var img = float.querySelector('img');
		var fx = 0, fy = 0, tx = 0, ty = 0, running = false;
		var loop = function () {
			fx += (tx - fx) * 0.12;
			fy += (ty - fy) * 0.12;
			float.style.transform = 'translate(' + (fx - 150) + 'px,' + (fy - 112) + 'px)';
			if (running) requestAnimationFrame(loop);
		};
		document.querySelectorAll('.sv-index__link').forEach(function (link) {
			link.addEventListener('pointerenter', function (e) {
				img.src = link.dataset.photo;
				tx = fx = e.clientX; ty = fy = e.clientY;
				float.classList.add('is-show');
				if (!running) { running = true; loop(); }
			});
			link.addEventListener('pointermove', function (e) { tx = e.clientX + 40; ty = e.clientY; });
			link.addEventListener('pointerleave', function () { float.classList.remove('is-show'); running = false; });
		});
	}

	/* ---------- 丸いリンク：カーソルに少し吸い寄せられる ---------- */
	if (!reduce && window.matchMedia('(hover: hover)').matches) {
		document.querySelectorAll('.js-magnet').forEach(function (el) {
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.2 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.2 + 'px)';
			});
			el.addEventListener('pointerleave', function () { el.style.transform = ''; });
		});
	}
})();

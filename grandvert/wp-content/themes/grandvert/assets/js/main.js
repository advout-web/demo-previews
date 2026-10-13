/**
 * Grand Vert — main.js
 * ローディング／慣性スクロール（Lenis）／FV の場面転換・横に流れるサービス・ページを貫く線（GSAP ScrollTrigger）／
 * 出現アニメーション／全画面メニュー／記事リストのホバー写真
 */
(function () {
	'use strict';

	var doc = document.documentElement;
	var body = document.body;
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var isShot = function () { return doc.classList.contains('is-shot'); };
	var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
	var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
	var lenis = null;

	/* ---------- 文字の下ごしらえ ---------- */
	document.querySelectorAll('.js-mask').forEach(function (el) {
		var lines = Array.prototype.filter.call(el.children, function (c) { return c.tagName === 'SPAN'; });
		if (!lines.length) {
			var s = document.createElement('span');
			s.innerHTML = el.innerHTML;
			el.innerHTML = '';
			el.appendChild(s);
			lines = [s];
		}
		lines.forEach(function (line, i) {
			var inner = document.createElement('span');
			inner.className = 'm-in';
			inner.innerHTML = line.innerHTML;
			line.innerHTML = '';
			line.appendChild(inner);
			line.style.setProperty('--l', i);
		});
	});
	document.querySelectorAll('.js-vertical').forEach(function (el) {
		var text = el.textContent;
		if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', text); }
		el.textContent = '';
		Array.prototype.forEach.call(text, function (ch, i) {
			var s = document.createElement('span');
			s.className = 'vc';
			s.setAttribute('aria-hidden', 'true');
			s.textContent = ch;
			s.style.setProperty('--i', i);
			el.appendChild(s);
		});
	});
	document.querySelectorAll('.js-split').forEach(function (el) {
		var text = el.textContent;
		el.textContent = '';
		Array.prototype.forEach.call(text, function (ch, i) {
			var s = document.createElement('span');
			s.className = 'char';
			s.textContent = ch;
			s.style.setProperty('--i', i);
			el.appendChild(s);
		});
	});
	// 並んだ .js-rise に順番の遅れを付ける
	document.querySelectorAll('.js-rise').forEach(function (el) {
		var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('js-rise'); });
		el.style.setProperty('--d', sibs.indexOf(el) % 6);
	});

	/* ---------- 出現アニメーション ---------- */
	var revealSel = '.js-fade, .js-rise, .js-mask, .js-clip, .js-vertical, .reveal, .reveal-stagger, .reveal-mask, .js-split';
	function revealAll() { document.querySelectorAll(revealSel).forEach(function (el) { el.classList.add('is-in'); }); }
	function startReveal() {
		if (!('IntersectionObserver' in window) || reduce) { revealAll(); return; }
		/* clip-path で面積ゼロにして隠す要素（.reveal-mask, .js-clip）は交差判定されないため、親要素を監視する */
		var proxies = new Map();
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) { return; }
				(proxies.get(e.target) || [e.target]).forEach(function (el) { el.classList.add('is-in'); });
				io.unobserve(e.target);
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
		document.querySelectorAll(revealSel).forEach(function (el) {
			if (!el.matches('.reveal-mask, .js-clip') || !el.parentElement) { io.observe(el); return; }
			var p = el.parentElement;
			if (!proxies.has(p)) { proxies.set(p, p.matches(revealSel) ? [p] : []); io.observe(p); }
			proxies.get(p).push(el);
		});
	}

	/* ---------- ローディング ---------- */
	var loader = document.querySelector('.loader');
	var countEl = document.querySelector('.js-loader-count');
	var loaded = false;
	function finishLoading() {
		if (body.classList.contains('is-ready')) { return; }
		body.classList.add('is-ready');
		startReveal();
		setTimeout(function () { body.classList.add('is-loaded'); }, 1700);
	}
	if (!loader || reduce) {
		finishLoading();
	} else if (loader.classList.contains('loader--short')) {
		setTimeout(finishLoading, 700);
	} else {
		var start = performance.now();
		(function tick(now) {
			if (isShot()) { finishLoading(); return; }
			var t = clamp((now - start) / 2200, 0, 1);
			var p = loaded ? t : Math.min(t, 0.88);
			var eased = 1 - Math.pow(1 - p, 3);
			if (countEl) { countEl.textContent = Math.round(eased * 100); }
			loader.style.setProperty('--p', eased.toFixed(3));
			if (p >= 1) { setTimeout(finishLoading, 300); return; }
			requestAnimationFrame(tick);
		})(start);
		setTimeout(finishLoading, 6000);
	}

	/* ---------- ヘッダー・サイドナビ・追従ボタン ---------- */
	var header = document.getElementById('site-header');
	var sideProgress = document.querySelector('.sidenav__progress');
	var floatCta = document.querySelector('.float-cta');
	var lastY = window.scrollY;
	function onScroll() {
		var y = window.scrollY;
		var vh = window.innerHeight;
		if (header) {
			header.classList.toggle('is-scrolled', y > 30);
			header.classList.toggle('is-hidden', !isShot() && y > 600 && y > lastY && !body.classList.contains('is-menu-open'));
		}
		var max = doc.scrollHeight - vh;
		if (sideProgress) { sideProgress.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0); }
		if (floatCta) { floatCta.classList.toggle('is-show', y > vh * 0.7); }
		lastY = y;
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* ---------- 全画面メニュー ---------- */
	var menuBtn = document.querySelector('.menu-btn');
	var drawer = document.getElementById('drawer');
	function setMenu(open) {
		if (!menuBtn || !drawer) { return; }
		menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		drawer.classList.toggle('is-open', open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
		body.classList.toggle('is-menu-open', open);
		body.classList.toggle('is-locked', open);
		if (lenis) { if (open) { lenis.stop(); } else { lenis.start(); } }
	}
	if (menuBtn && drawer) {
		menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
		drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); } });
	}

	/* ---------- 記事リスト：カーソル位置に写真 ---------- */
	var hoverBox = document.querySelector('.hover-img');
	if (hoverBox && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
		var hx = 0, hy = 0, tx = 0, ty = 0, raf = null;
		var follow = function () {
			hx += (tx - hx) * 0.15; hy += (ty - hy) * 0.15;
			hoverBox.style.transform = 'translate3d(' + (hx + 24) + 'px,' + (hy - 100) + 'px,0)';
			raf = requestAnimationFrame(follow);
		};
		document.querySelectorAll('.js-hover-img').forEach(function (link) {
			link.addEventListener('pointerenter', function (e) {
				var img = link.querySelector('img');
				hoverBox.innerHTML = img ? '<img src="' + img.currentSrc + '" alt="">' : '';
				hx = tx = e.clientX; hy = ty = e.clientY;
				hoverBox.classList.add('is-show');
				if (!raf) { follow(); }
			});
			link.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
			link.addEventListener('pointerleave', function () {
				hoverBox.classList.remove('is-show');
				cancelAnimationFrame(raf); raf = null;
			});
		});
	}

	/* ---------- FV：場面転換（スクロール量に連動） ---------- */
	var fv = document.querySelector('.fv');
	var scenes = document.querySelectorAll('.scene');
	var fvBar = document.querySelector('.fv__progress');
	function setScene(p) {
		if (!scenes.length) { return; }
		var idx = clamp(Math.floor(p * scenes.length * 0.999), 0, scenes.length - 1);
		scenes.forEach(function (s, i) {
			s.classList.toggle('is-active', i === idx);
			s.classList.toggle('is-past', i < idx);
		});
		if (fvBar) { fvBar.style.setProperty('--p', p.toFixed(3)); }
	}

	/* ---------- GSAP 系（読み込み完了後に初期化） ---------- */
	function initMotion() {
		if (isShot() || reduce) { return; }

		if (typeof window.Lenis !== 'undefined') {
			lenis = new window.Lenis({ duration: 1.25, smoothWheel: true });
			document.querySelectorAll('a[href*="#"]').forEach(function (a) {
				a.addEventListener('click', function (e) {
					var url = new URL(a.href, location.href);
					if (url.pathname !== location.pathname || !url.hash) { return; }
					var target = document.querySelector(url.hash);
					if (!target) { return; }
					e.preventDefault();
					lenis.scrollTo(target, { offset: -60 });
				});
			});
		}

		if (!hasGsap) {
			if (lenis) { (function rafLoop(t) { lenis.raf(t); requestAnimationFrame(rafLoop); })(performance.now()); }
			if (fv) {
				window.addEventListener('scroll', function () {
					var r = fv.getBoundingClientRect();
					setScene(clamp(-r.top / (r.height - window.innerHeight), 0, 1));
				}, { passive: true });
			}
			return;
		}

		var gsap = window.gsap;
		var ST = window.ScrollTrigger;
		gsap.registerPlugin(ST);
		if (lenis) {
			lenis.on('scroll', ST.update);
			gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
			gsap.ticker.lagSmoothing(0);
		}

		if (fv) {
			ST.create({ trigger: fv, start: 'top top', end: 'bottom bottom', onUpdate: function (self) { setScene(self.progress); } });
		}

		// サービス：縦スクロールで横に流れる
		var service = document.querySelector('.service');
		var track = document.querySelector('.service__track');
		if (service && track) {
			ST.matchMedia({
				'(min-width: 961px)': function () {
					service.classList.add('is-pinned');
					var dist = function () { return Math.max(0, track.scrollWidth - (window.innerWidth - parseFloat(getComputedStyle(body).paddingLeft || 0))); };
					var tween = gsap.to(track, {
						x: function () { return -dist(); },
						ease: 'none',
						scrollTrigger: { trigger: service, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true }
					});
					return function () { service.classList.remove('is-pinned'); tween.scrollTrigger.kill(); tween.kill(); gsap.set(track, { clearProps: 'transform' }); };
				}
			});
		}

		// 視差
		document.querySelectorAll('.js-parallax').forEach(function (img) {
			gsap.fromTo(img, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
		});

		// フッターの大きな英字
		var fword = document.querySelector('.js-footer-word');
		if (fword) {
			gsap.fromTo(fword, { xPercent: 10 }, { xPercent: -24, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
		}

		// ページを貫く一本の線
		var thread = document.querySelector('.thread');
		var main = document.querySelector('.site-main');
		if (thread && main) {
			var path = thread.querySelector('.thread__path');
			path.setAttribute('pathLength', '1');
			var startEl = document.querySelector('.about');
			var build = function () {
				var w = main.clientWidth;
				var h = main.scrollHeight;
				var y0 = startEl ? startEl.offsetTop : 0;
				thread.setAttribute('width', w);
				thread.setAttribute('height', h);
				thread.style.height = h + 'px';
				var d = 'M' + (w * 0.94) + ' ' + y0;
				var seg = Math.max(700, window.innerHeight * 0.9);
				var left = true;
				for (var y = y0; y < h - seg * 0.5; y += seg) {
					var x = left ? w * 0.05 : w * 0.95;
					d += ' C' + (left ? w * 0.94 : w * 0.06) + ' ' + (y + seg * 0.45) + ' ' + x + ' ' + (y + seg * 0.55) + ' ' + x + ' ' + (y + seg);
					left = !left;
				}
				path.setAttribute('d', d);
			};
			build();
			gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: startEl || main, start: 'top 70%', endTrigger: main, end: 'bottom bottom', scrub: 0.6 } });
			ST.addEventListener('refreshInit', build);
		}

		window.addEventListener('load', function () { ST.refresh(); });
		setTimeout(function () { ST.refresh(); }, 1200);
	}

	window.addEventListener('load', function () {
		loaded = true;
		if (isShot()) {
			body.classList.add('is-ready', 'is-loaded');
			revealAll();
			setScene(0);
			return;
		}
		initMotion();
	});
})();

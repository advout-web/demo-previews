/* Maison Lumière — interactions（HTML 版の動きをそのまま移植＋WordPress 用の追加） */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* long fades */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }
  // the opening scene fades in on load
  window.requestAnimationFrame(function () {
    document.querySelectorAll('.ouverture .reveal, .phero .reveal').forEach(function (el) { el.classList.add('is-in'); });
  });

  /* carte (menu overlay) */
  var btn = document.querySelector('.hdr-btn');
  var carte = document.getElementById('carte');
  if (!btn || !carte) return;
  var txt = btn.querySelector('.hdr-btn-txt');
  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    txt.textContent = open ? 'Fermer' : 'La Carte';
    if (open) {
      carte.hidden = false;
      requestAnimationFrame(function () { carte.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      var first = carte.querySelector('a'); if (first) first.focus({ preventScroll: true });
    } else {
      carte.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { if (btn.getAttribute('aria-expanded') === 'false') carte.hidden = true; }, 700);
    }
  }
  btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
  carte.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
  });

  /* course pager */
  var pager = document.querySelector('.pager');
  var courses = document.querySelectorAll('.course');
  if (pager && courses.length && document.getElementById('chef')) {
  var pli = pager.querySelectorAll('li');
  function onScroll() {
    var mid = window.innerHeight / 2, cur = null;
    courses.forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.top < mid && r.bottom > mid) cur = c.id;
    });
    var first = courses[0].getBoundingClientRect().top;
    var last = document.getElementById('chef').getBoundingClientRect().top;
    pager.classList.toggle('is-on', first < window.innerHeight * 0.6 && last > window.innerHeight * 0.4);
    pli.forEach(function (li) { li.classList.toggle('is-cur', li.getAttribute('data-for') === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  }

  /* reservation request (demo) — WordPress 版では Contact Form 7 を使用 */
  var form = document.getElementById('rc-form');
  if (!form) return;
  var msg = form.querySelector('.rc-msg');
  var dateIn = form.querySelector('input[type="date"]');
  var t = new Date(); t.setDate(t.getDate() + 2);
  dateIn.min = t.toISOString().slice(0, 10);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      msg.textContent = 'ご希望日・お名前・メールアドレスをご記入ください。';
      var bad = form.querySelector(':invalid'); if (bad) bad.focus();
      return;
    }
    msg.textContent = 'Merci. ——デザインサンプルのため、実際には送信されません。';
    form.reset();
  });
})();

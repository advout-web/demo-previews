/* TEINTE — swatch book interactions（HTML 版の動きをそのまま移植＋WordPress 用の追加） */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- mobile nav ---- */
  var btn = document.getElementById("navBtn");
  var nav = document.getElementById("nav");
  function setNav(open) {
    if (!btn || !nav) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && nav) {
    btn.addEventListener("click", function () { setNav(btn.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* ---- reveal ---- */
  var revs = document.querySelectorAll(".reveal, .reveal-stagger, .cta");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add("is-in"); });
  }
  requestAnimationFrame(function () {
    setTimeout(function () {
      document.querySelectorAll(".js-split").forEach(function (el) { el.classList.add("is-in"); });
    }, 120);
  });

  /* ---- detail page: accent colour of the macaron ---- */
  var dsw = document.querySelector(".dsw[data-accent]");
  if (dsw) root.style.setProperty("--accent", dsw.getAttribute("data-accent"));

  /* ---- swatch book (front page only) ---- */
  var book = document.getElementById("collection");
  if (!book || !document.getElementById("track")) return;
  var pin = document.getElementById("pin");
  var track = document.getElementById("track");
  var cnt = document.getElementById("cnt");
  var bar = document.getElementById("bar");
  var pages = Array.prototype.slice.call(track.children);
  var PAPER = "#F4F2EE";
  var DEF_ACC = "#D98BA0";

  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) {
    return "rgb(" + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(",") + ")";
  }
  var info = pages.map(function (p) {
    return {
      el: p,
      sw: p.classList.contains("sw"),
      bg: hex(p.dataset.bg || PAPER),
      acc: hex(p.dataset.accent || DEF_ACC),
      img: p.querySelector(".sw__photo img")
    };
  });
  // outro keeps the last accent; cover takes the first
  info[0].acc = info[1].acc;
  info[info.length - 1].acc = info[info.length - 2].acc;

  var mqDesk = window.matchMedia("(min-width: 821px)");
  var desk = mqDesk.matches;
  var dist = 0, vw = 0, lefts = [], centers = [], active = -1, ticking = false;
  var swCount = info.filter(function (i) { return i.sw; }).length;

  function measure() {
    desk = mqDesk.matches;
    vw = desk ? window.innerWidth : track.clientWidth;
    lefts = pages.map(function (p) { return p.offsetLeft; });
    centers = pages.map(function (p, i) { return lefts[i] + p.offsetWidth / 2; });
    if (desk) {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      book.style.height = (dist + window.innerHeight) + "px";
    } else {
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      book.style.height = "";
      track.style.transform = "";
    }
    update();
  }

  function update() {
    ticking = false;
    var x;
    if (desk) {
      var y = window.scrollY - book.offsetTop;
      x = Math.min(Math.max(y, 0), dist);
      track.style.transform = "translate3d(" + (-x) + "px,0,0)";
    } else {
      x = track.scrollLeft;
    }
    var c = x + vw / 2;
    // fractional page position between centers
    var i = 0;
    while (i < centers.length - 1 && c > centers[i + 1]) i++;
    var f = 0;
    if (i < centers.length - 1 && c > centers[i]) f = (c - centers[i]) / (centers[i + 1] - centers[i]);
    var j = Math.min(i + 1, info.length - 1);
    // ease the glide so colour settles while a page is centred
    var e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    pin.style.backgroundColor = mix(info[i].bg, info[j].bg, e);
    root.style.setProperty("--accent", mix(info[i].acc, info[j].acc, e));

    var a = f < .5 ? i : j;
    if (a !== active) {
      if (active > -1) info[active].el.classList.remove("is-active");
      info[a].el.classList.add("is-active");
      active = a;
      var n = 0;
      for (var k = 1; k <= a && k <= swCount; k++) n = k;
      cnt.textContent = (n < 10 ? "0" : "") + n;
    }
    bar.style.transform = "scaleX(" + (dist ? x / dist : 0) + ")";

    if (!reduce) {
      info.forEach(function (p, k) {
        if (!p.img) return;
        var d = (centers[k] - c) / vw;
        if (Math.abs(d) > 1.6) return;
        p.img.style.setProperty("--px", (d * -9).toFixed(2) + "%");
      });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener("scroll", function () { if (desk) req(); }, { passive: true });
  track.addEventListener("scroll", function () { if (!desk) req(); }, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  if (mqDesk.addEventListener) mqDesk.addEventListener("change", measure);
  measure();

  /* chips + anchors into the book */
  document.querySelectorAll(".chips a").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var k = +a.dataset.i + 1; // +1 for cover page
      var beh = reduce ? "auto" : "smooth";
      if (desk) {
        window.scrollTo({ top: book.offsetTop + Math.min(lefts[k], dist), behavior: beh });
      } else {
        window.scrollTo({ top: book.getBoundingClientRect().top + window.scrollY - 64, behavior: beh });
        track.scrollTo({ left: lefts[k], behavior: beh });
      }
    });
  });
})();

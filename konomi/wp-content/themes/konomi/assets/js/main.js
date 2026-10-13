/* 木の実舎 — interactions（HTML 版の動きをそのまま移植＋WordPress 用の追加） */
(function () {
  "use strict";
  var MONTHS = window.MONTHS || [];
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* background tint + fruit accent per month */
  var TINT = ["#f0ede3", "#f4eae2", "#f6e8e1", "#f5eae7", "#f1eedd", "#f5e6e0",
              "#f5e7e6", "#ebebe4", "#f1e8e3", "#f5e8d6", "#f2e6d3", "#eceee7"];
  var FRUIT = ["#a57412", "#b93a3a", "#b93a3a", "#b0566c", "#b4423c", "#97283a",
               "#ad3550", "#4c5a8a", "#6c3557", "#b13e2c", "#9b5a2e", "#86475a"];
  var SEASON = { winter: "冬", spring: "春", summer: "夏", autumn: "秋" };

  /* ---------- mobile nav ---------- */
  var btn = document.querySelector(".nav-btn");
  var nav = document.getElementById("gnav");
  function closeNav() { if (!btn || !nav) return; btn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- detail page: tint by month ---------- */
  var dhero = document.querySelector("[data-month]");
  if (dhero) {
    var dm = +dhero.getAttribute("data-month") - 1;
    root.style.setProperty("--bg", TINT[dm]);
    root.style.setProperty("--fruit", FRUIT[dm]);
  }

  /* ---------- wheel (front page only) ---------- */
  var wheel = document.querySelector(".wheel");
  if (!wheel || !MONTHS.length) { reveal(); return; }
  var tablist = document.querySelector(".wheel__months");
  var tabs = [];
  MONTHS.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "wm";
    b.id = "tab-" + d.m;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "month-panel");
    b.setAttribute("aria-label", d.m + "月 " + d.fruit);
    b.style.setProperty("--a", i * 30);
    b.textContent = d.m;
    b.addEventListener("click", function () { setMonth(d.m); });
    b.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight" || k === "ArrowDown") n = d.m % 12 + 1;
      if (k === "ArrowLeft" || k === "ArrowUp") n = (d.m + 10) % 12 + 1;
      if (k === "Home") n = 1;
      if (k === "End") n = 12;
      if (n) { e.preventDefault(); setMonth(n); tabs[n - 1].focus(); }
    });
    tablist.appendChild(b);
    tabs.push(b);
  });

  var $ = function (id) { return document.getElementById(id); };
  var panel = $("month-panel");
  var photoFig = document.querySelector(".month__photo");
  var drawBox = document.querySelector(".month__draw");
  var center = { en: document.querySelector(".wc__en"), num: document.querySelector(".wc__num"), wa: document.querySelector(".wc__wa") };
  var chartMs = document.querySelectorAll(".chart__m");
  var chartCells = document.querySelectorAll(".chart__c");
  var cards = document.querySelectorAll(".rcard");
  var current = 0, rot = 0;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  function fill(d) {
    var i = d.m - 1;
    $("mp-photo").src = d.photo;
    $("mp-photo").alt = d.alt;
    $("mp-draw").src = d.draw;
    $("mp-draw").alt = d.dalt;
    $("mp-num").textContent = d.m;
    $("mp-en").textContent = d.en;
    $("mp-season").textContent = SEASON[d.season];
    $("mp-fruit").textContent = d.fruit;
    $("mp-title").innerHTML = d.title;
    $("mp-text").textContent = d.text;
    $("mp-itemname").textContent = d.item;
    $("mp-price").textContent = d.price;
    $("mp-item").setAttribute("href", d.url || "#card-" + d.m);
    $("mp-note").textContent = d.note;
    $("mp-by").textContent = d.fplace + "　" + d.fname;
    center.en.textContent = d.en.slice(0, 3) + ".";
    center.num.textContent = d.m;
    center.wa.textContent = d.wa + "・" + SEASON[d.season];
    root.style.setProperty("--bg", TINT[i]);
    root.style.setProperty("--fruit", FRUIT[i]);
  }

  function redraw() {
    drawBox.classList.remove("is-drawing");
    void drawBox.offsetWidth;
    drawBox.classList.add("is-drawing");
  }

  function setMonth(m, first) {
    if (m === current) return;
    var d = MONTHS[m - 1];
    /* shortest rotation so the chosen month sits under the leaf pin */
    var target = -(m - 1) * 30;
    var delta = ((target - rot) % 360 + 540) % 360 - 180;
    rot = rot + delta;
    wheel.style.setProperty("--rot", rot);
    tabs.forEach(function (t, k) {
      var on = k === m - 1;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", "tab-" + m);
    chartMs.forEach(function (b) { b.classList.toggle("is-now", +b.dataset.go === m); });
    chartCells.forEach(function (c) { c.classList.toggle("is-now-col", +c.dataset.col === m); });
    cards.forEach(function (c) {
      var on = +c.dataset.m === m;
      c.classList.toggle("is-now", on);
      var row = c.parentNode;
      if (on && row.scrollWidth > row.clientWidth + 4) row.scrollLeft = c.offsetLeft - row.offsetLeft - 16;
    });
    current = m;

    if (first || reduce) { fill(d); redraw(); return; }
    panel.classList.add("is-swap");
    photoFig.classList.add("is-swap");
    setTimeout(function () {
      fill(d);
      var img = $("mp-photo");
      var done = function () { photoFig.classList.remove("is-swap"); };
      if (img.complete) done(); else { img.onload = done; img.onerror = done; }
      panel.classList.remove("is-swap");
      redraw();
    }, 380);
  }

  document.querySelectorAll(".mnav").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = +b.dataset.step;
      setMonth((current - 1 + s + 12) % 12 + 1);
    });
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () {
      setMonth(+b.dataset.go);
      if (b.classList.contains("rcard__go")) {
        document.getElementById("almanac").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
    });
  });

  /* swipe on the photo (mobile) */
  var sx = null;
  panel.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  panel.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60) setMonth((current - 1 + (dx < 0 ? 1 : -1) + 12) % 12 + 1);
    sx = null;
  });

  setMonth(window.KM_NOW || new Date().getMonth() + 1, true);
  reveal();

  /* ---------- scroll reveal / drawing on view ---------- */
  function reveal() {
  var els = document.querySelectorAll(".reveal, .draw-on-view");
  if ("IntersectionObserver" in window && !root.classList.contains("is-shot")) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }
  }
})();

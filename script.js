/* Open-Set Recognition + XAI · Coming Soon
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header + mobile nav ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); }
  });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) sectionObs.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero background: cases flowing through 8 steps ---------- */
  var canvas = document.getElementById("bg-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, nodes = [], tokens = [], running = true, raf = null, last = 0, spawn = 0;
    function layout() {
      nodes = [];
      var n = 8, x0 = W < 900 ? W * 0.08 : W * 0.5, x1 = W < 900 ? W * 0.92 : W * 0.95, y = W < 900 ? H * 0.82 : H * 0.62;
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1);
        nodes.push({ x: x0 + (x1 - x0) * t, y: y + Math.sin(t * Math.PI * 1.5) * (W < 900 ? 22 : 60) });
      }
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout(); tokens = []; draw();
    }
    function newToken() {
      var r = Math.random();
      return { seg: 0, t: 0, speed: 0.0007 + Math.random() * 0.0005, wait: 0,
        kind: r < 0.16 ? "delay" : r < 0.21 ? "error" : "ok", at: Math.floor(Math.random() * 7) };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(59,130,246,0.18)"; ctx.setLineDash([4, 6]);
      ctx.beginPath(); nodes.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.stroke(); ctx.setLineDash([]);
      nodes.forEach(function (p) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fillStyle = "rgba(10,17,34,0.9)"; ctx.fill();
        ctx.strokeStyle = "rgba(34,211,238,0.35)"; ctx.stroke();
      });
      tokens.forEach(function (k) {
        var a = nodes[k.seg], b = nodes[Math.min(k.seg + 1, nodes.length - 1)];
        var x = a.x + (b.x - a.x) * k.t, y = a.y + (b.y - a.y) * k.t;
        var col = k.kind === "delay" && k.wait > 0 ? "251,191,36" : k.kind === "error" && k.seg === k.at && k.wait > 0 ? "248,113,113" : "34,211,238";
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = "rgba(" + col + ",0.85)"; ctx.fill();
        if (col !== "34,211,238") { ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.strokeStyle = "rgba(" + col + ",0.35)"; ctx.stroke(); }
      });
    }
    function step(ts) {
      var dt = last ? Math.min(50, ts - last) : 16; last = ts;
      spawn -= dt; if (spawn <= 0 && tokens.length < 14) { tokens.push(newToken()); spawn = 700 + Math.random() * 900; }
      tokens.forEach(function (k) {
        if (k.wait > 0) { k.wait -= dt; return; }
        k.t += k.speed * dt;
        if (k.t >= 1) {
          k.t = 0; k.seg++;
          if (k.kind !== "ok" && k.seg === k.at) k.wait = k.kind === "delay" ? 2200 : 1400;
        }
      });
      tokens = tokens.filter(function (k) { return k.seg < nodes.length - 1; });
      draw();
      if (running) raf = requestAnimationFrame(step);
    }
    function start() { if (!running && !reduceMotion) { running = true; last = 0; raf = requestAnimationFrame(step); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    if (reduceMotion) running = false; else raf = requestAnimationFrame(step);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }

  /* ---------- DMAIC tabs ---------- */
  var dmTabs = Array.prototype.slice.call(document.querySelectorAll(".dm-tab"));
  dmTabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      dmTabs.forEach(function (o) {
        var on = o === t;
        o.classList.toggle("is-active", on); o.setAttribute("aria-selected", String(on)); o.tabIndex = on ? 0 : -1;
        document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
      });
    });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return; var nx = dmTabs[(i + d + dmTabs.length) % dmTabs.length]; nx.focus(); nx.click();
    });
  });

  /* ---------- Interactive analysis (computed from the dataset) ---------- */
  var D = window.ONB;
  var dash = document.getElementById("dash"), tip = document.getElementById("tip");
  function showTip(html, target) {
    tip.innerHTML = html; tip.hidden = false;
    var db = dash.getBoundingClientRect(), tb = target.getBoundingClientRect();
    tip.style.left = "0px"; tip.style.top = "0px";
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var x = Math.max(8, Math.min(db.width - tw - 8, tb.left - db.left + tb.width / 2 - tw / 2));
    var y = tb.top - db.top - th - 10; if (y < 4) y = tb.bottom - db.top + 10;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { if (tip) tip.hidden = true; }
  function hover(node, fn) {
    node.addEventListener("mouseenter", function () { showTip(fn(), node); });
    node.addEventListener("mouseleave", hideTip);
    node.addEventListener("focus", function () { showTip(fn(), node); });
    node.addEventListener("blur", hideTip);
  }
  var pct = function (v) { return (v * 100).toFixed(1) + "%"; };

  if (D && dash) {
    var sel = { o: document.getElementById("f-office"), d: document.getElementById("f-dept"), h: document.getElementById("f-officer") };
    var LIST = { o: D.offices, d: D.departments, h: D.officers };
    var IDX = { o: 0, d: 1, h: 2 };
    var state = { o: "", d: "", h: "", step: "", reason: "" };
    Object.keys(sel).forEach(function (k) {
      LIST[k].forEach(function (v, i) { var op = document.createElement("option"); op.value = String(i); op.textContent = v; sel[k].appendChild(op); });
      sel[k].addEventListener("change", function () { state[k] = sel[k].value; update(); });
    });

    function rowsExcept(skip) {
      return D.rows.filter(function (r) {
        for (var k in IDX) { if (skip.indexOf(k) > -1 || state[k] === "") continue; if (r[IDX[k]] !== +state[k]) return false; }
        if (skip.indexOf("step") < 0 && state.step !== "" && r[3].charAt(+state.step) === "0") return false;
        if (skip.indexOf("reason") < 0 && state.reason !== "" && r[4] !== +state.reason) return false;
        return true;
      });
    }
    function toggle(k, v) { state[k] = state[k] === String(v) ? "" : String(v); update(); }

    function kpis(rows) {
      var n = rows.length, t = 0, del = 0, err = 0, clean = 0;
      rows.forEach(function (r) {
        t += r[5];
        for (var i = 0; i < 8; i++) { var c = r[3].charAt(i); if (c === "1") del++; else if (c === "2") err++; }
        if (r[3] === "00000000") clean++;
      });
      document.getElementById("k-n").textContent = n;
      document.getElementById("k-avg").textContent = n ? (t / n).toFixed(1) + " min" : "–";
      document.getElementById("k-del").textContent = n ? pct(del / (n * 8)) : "–";
      document.getElementById("k-err").textContent = n ? pct(err / (n * 8)) : "–";
      document.getElementById("k-clean").textContent = n ? pct(clean / n) : "–";
    }

    var NS = "http://www.w3.org/2000/svg";
    function el(n, a, txt) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
    function hist(rows) {
      var box = document.getElementById("hist"); box.innerHTML = "";
      var w = box.clientWidth || 900, h = box.clientHeight || 280, pl = 40, pr = 12, pt = 14, pb = 32;
      var lo = 30, hi = 160, bw = 5, nb = (hi - lo) / bw, bins = [];
      for (var i = 0; i < nb; i++) bins.push(0);
      var sum = 0;
      rows.forEach(function (r) { sum += r[5]; var b = Math.min(nb - 1, Math.max(0, Math.floor((r[5] - lo) / bw))); bins[b]++; });
      var max = Math.max.apply(null, bins) || 1; max = Math.ceil(max / 10) * 10;
      var X = function (v) { return pl + (w - pl - pr) * (v - lo) / (hi - lo); }, Y = function (c) { return pt + (h - pt - pb) * (1 - c / max); };
      var svg = el("svg", { viewBox: "0 0 " + w + " " + h, class: "trend-svg" });
      for (var g = 0; g <= 4; g++) { var c = max * g / 4; svg.appendChild(el("line", { x1: pl, x2: w - pr, y1: Y(c), y2: Y(c), class: "grid" })); svg.appendChild(el("text", { x: pl - 8, y: Y(c) + 4, class: "axis", "text-anchor": "end" }, String(c))); }
      var step = w < 520 ? 30 : 15;
      for (var m = lo; m <= hi; m += step) svg.appendChild(el("text", { x: X(m), y: h - 10, class: "axis", "text-anchor": "middle" }, m + (m === hi ? " min" : "")));
      svg.appendChild(el("rect", { x: X(lo), y: pt, width: X(45) - X(lo), height: h - pt - pb, class: "goal-zone" }));
      svg.appendChild(el("text", { x: X(lo) + 6, y: pt + 14, class: "goal-label" }, "target < 45"));
      bins.forEach(function (c, i) {
        var x = X(lo + i * bw) + 1, bwPx = Math.max(1, X(lo + bw) - X(lo) - 2);
        var r = el("rect", { x: x, y: Y(c), width: bwPx, height: Math.max(0, Y(0) - Y(c)), class: "hbar" + (lo + i * bw >= 120 ? " hot" : ""), tabindex: "0" });
        hover(r, function () { return "<strong>" + (lo + i * bw) + "–" + (lo + (i + 1) * bw) + " min</strong><span>Cases <b>" + c + "</b></span>"; });
        svg.appendChild(r);
      });
      if (rows.length) {
        var avg = sum / rows.length;
        svg.appendChild(el("line", { x1: X(avg), x2: X(avg), y1: pt, y2: h - pb, class: "avg-line" }));
        svg.appendChild(el("text", { x: X(avg) + 6, y: pt + 14, class: "avg-label" }, "avg " + avg.toFixed(1)));
      }
      box.appendChild(svg);
    }

    function steps(rows) {
      var box = document.getElementById("steps"); box.innerHTML = "";
      D.steps.forEach(function (s, i) {
        var c = [0, 0, 0]; rows.forEach(function (r) { c[+r[3].charAt(i)]++; });
        var n = rows.length || 1, on = state.step === String(i), dim = state.step !== "" && !on;
        var b = document.createElement("button"); b.type = "button";
        b.className = "step-row" + (on ? " on" : "") + (dim ? " dim" : "");
        b.setAttribute("aria-pressed", String(on));
        b.setAttribute("aria-label", s + ": " + pct(c[1] / n) + " delayed, " + pct(c[2] / n) + " errors. Press to filter to problem cases for this step.");
        b.innerHTML = '<span class="bar-name"></span><span class="stack3"><i class="s-ok"></i><i class="s-del"></i><i class="s-err"></i></span><span class="bar-val"></span>';
        b.querySelector(".bar-name").textContent = s;
        var is = b.querySelectorAll(".stack3 i");
        is[0].style.width = (c[0] / n * 100) + "%"; is[1].style.width = (c[1] / n * 100) + "%"; is[2].style.width = (c[2] / n * 100) + "%";
        b.querySelector(".bar-val").textContent = pct(c[1] / n) + " delayed · " + pct(c[2] / n) + " errors";
        b.addEventListener("click", function () { toggle("step", i); });
        hover(b, function () { return "<strong>" + s + "</strong><span>Completed <b>" + c[0] + "</b></span><span>Delayed <b>" + c[1] + "</b></span><span>Error <b>" + c[2] + "</b></span>"; });
        box.appendChild(b);
      });
    }

    function barList(id, labels, values, counts, key, fmt, unitTip) {
      var box = document.getElementById(id); box.innerHTML = "";
      var valid = values.filter(function (v) { return v != null; });
      var max = Math.max.apply(null, valid) || 1, min = key === "reason" ? 0 : Math.min.apply(null, valid) * 0.92;
      labels.forEach(function (lab, i) {
        var v = values[i], on = state[key] === String(i), dim = state[key] !== "" && !on;
        var b = document.createElement("button"); b.type = "button";
        b.className = "bar-row" + (on ? " on" : "") + (dim ? " dim" : "");
        b.setAttribute("aria-pressed", String(on));
        b.setAttribute("aria-label", lab + ": " + (v == null ? "no cases" : fmt(v)) + ". Press to filter.");
        b.innerHTML = '<span class="bar-name"></span><span class="bar-track"><span class="bar-fill m-rev"></span></span><span class="bar-val"></span>';
        b.querySelector(".bar-name").textContent = lab;
        b.querySelector(".bar-fill").style.width = v == null ? "0%" : (6 + 94 * (v - min) / ((max - min) || 1)).toFixed(1) + "%";
        b.querySelector(".bar-val").textContent = v == null ? "–" : key === "reason" ? v + " cases" : fmt(v) + " · " + counts[i] + " cases";
        b.addEventListener("click", function () {
          if (key in sel) { state[key] = on ? "" : String(i); update(); } else toggle(key, i);
        });
        hover(b, function () { return "<strong>" + lab + "</strong>" + (key === "reason" ? "" : "<span>" + unitTip + " <b>" + (v == null ? "–" : fmt(v)) + "</b></span>") + "<span>Cases <b>" + counts[i] + "</b></span>"; });
        box.appendChild(b);
      });
    }
    function avgBy(rows, idx, n) {
      var s = [], c = []; for (var i = 0; i < n; i++) { s.push(0); c.push(0); }
      rows.forEach(function (r) { s[r[idx]] += r[5]; c[r[idx]]++; });
      return { v: s.map(function (x, i) { return c[i] ? x / c[i] : null; }), c: c };
    }

    function chips() {
      var box = document.getElementById("chips"); box.innerHTML = "";
      var items = [];
      ["o", "d", "h"].forEach(function (k) { if (state[k] !== "") items.push([k, LIST[k][+state[k]]]); });
      if (state.step !== "") items.push(["step", D.steps[+state.step] + ": delayed or error"]);
      if (state.reason !== "") items.push(["reason", D.reasons[+state.reason]]);
      if (!items.length) { var s = document.createElement("span"); s.className = "chips-empty"; s.textContent = "No filters: showing all 600 cases"; box.appendChild(s); return; }
      items.forEach(function (it) {
        var b = document.createElement("button"); b.type = "button"; b.className = "chip";
        b.innerHTML = "<span></span><i aria-hidden=\"true\">×</i>"; b.querySelector("span").textContent = it[1];
        b.setAttribute("aria-label", "Remove filter " + it[1]);
        b.addEventListener("click", function () { state[it[0]] = ""; update(); });
        box.appendChild(b);
      });
    }

    function update() {
      hideTip();
      Object.keys(sel).forEach(function (k) { sel[k].value = state[k]; });
      var all = rowsExcept([]);
      kpis(all); hist(all);
      steps(rowsExcept(["step"]));
      var rr = rowsExcept(["reason"]), rc = D.reasons.map(function () { return 0; });
      rr.forEach(function (r) { if (r[4] >= 0) rc[r[4]]++; });
      barList("reasons", D.reasons, rc, rc, "reason", function (v) { return String(v); }, "Cases");
      var a;
      a = avgBy(rowsExcept(["o"]), 0, D.offices.length); barList("by-office", D.offices, a.v, a.c, "o", function (v) { return v.toFixed(1) + " min"; }, "Avg time");
      a = avgBy(rowsExcept(["d"]), 1, D.departments.length); barList("by-dept", D.departments, a.v, a.c, "d", function (v) { return v.toFixed(1) + " min"; }, "Avg time");
      a = avgBy(rowsExcept(["h"]), 2, D.officers.length); barList("by-officer", D.officers, a.v, a.c, "h", function (v) { return v.toFixed(1) + " min"; }, "Avg time");
      chips();
    }
    document.getElementById("f-reset").addEventListener("click", function () { state = { o: "", d: "", h: "", step: "", reason: "" }; update(); });
    update();
    var lw = 0, rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { var w = document.getElementById("hist").clientWidth; if (w !== lw) { lw = w; hist(rowsExcept([])); } }, 150); });
  }

  /* ---------- Before / after process view ---------- */
  var pipe = document.getElementById("pipe");
  if (pipe && D) {
    var auto = { "Offer Letter": "Offer letter email sent and tracked by UiPath", "Folder": "Folder created automatically by UiPath", "Final Email": "Final email sent automatically by UiPath" };
    var stats = D.steps.map(function (s, i) { var c = [0, 0, 0]; D.rows.forEach(function (r) { c[+r[3].charAt(i)]++; }); return c; });
    var mode = "before";
    function drawPipe() {
      pipe.innerHTML = "";
      D.steps.forEach(function (s, i) {
        var li = document.createElement("li");
        var isAuto = mode === "after" && auto[s];
        li.className = "pipe-step" + (isAuto ? " is-auto" : "") + (mode === "before" ? " is-manual" : "");
        var c = stats[i], n = D.rows.length;
        var detail = mode === "before"
          ? "Manual · " + pct(c[1] / n) + " delayed · " + pct(c[2] / n) + " errors"
          : isAuto ? auto[s] : "Handled by HR · logged to the tracker automatically";
        li.innerHTML = '<span class="pipe-num"></span><h3></h3><p></p><span class="pipe-tag"></span>';
        li.querySelector(".pipe-num").textContent = String(i + 1).padStart(2, "0");
        li.querySelector("h3").textContent = s;
        li.querySelector("p").textContent = detail;
        li.querySelector(".pipe-tag").textContent = mode === "before" ? "Manual" : isAuto ? "Automated" : "Human + auto-log";
        pipe.appendChild(li);
      });
      document.getElementById("pipe-note").textContent = mode === "before"
        ? "Delay and error rates are from the 600-case dataset."
        : "Based on the project's automation scope: emails, folder creation and Excel tracker updates in UiPath. This is the designed future state, not a measured result.";
    }
    document.querySelectorAll(".mode-toggle button").forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode");
        document.querySelectorAll(".mode-toggle button").forEach(function (o) { var on = o === b; o.classList.toggle("is-on", on); o.setAttribute("aria-checked", String(on)); });
        drawPipe();
      });
    });
    drawPipe();
  }
})();

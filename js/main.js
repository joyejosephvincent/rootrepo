/* Sociyaal site scripts. Plain JavaScript, no dependencies. */
(function () {
  /* ---------- Settings you can change ---------- */
  var CONFIG = {
    // Paste a form-service URL here (for example a Formspree endpoint) so enquiries arrive by email.
    // Leave empty to let visitors send their enquiry by email or WhatsApp instead.
    endpoint: "",
    email: "hello@sociyaal.com",
    phone: "+91 822 093 0144",
    whatsapp: "918220930144"
  };

  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }

  /* ---------- Toast ---------- */
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("on"); }, 2200);
  }

  /* ---------- Menu overlay ---------- */
  var overlay = $("#menu"), burger = $("#burger");
  function openMenu() { overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false"); burger.setAttribute("aria-expanded", "true"); doc.body.style.overflow = "hidden"; }
  function closeMenu() { overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true"); burger.setAttribute("aria-expanded", "false"); doc.body.style.overflow = ""; }
  if (burger && overlay) {
    burger.addEventListener("click", openMenu);
    $("#menuClose").addEventListener("click", closeMenu);
    overlay.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }
  window.__closeMenu = closeMenu;

  /* ---------- Active nav link ---------- */
  window.__setActive = function (page) {
    $$("[data-nav]").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-nav") === page); });
  };
  if (doc.body.getAttribute("data-page")) window.__setActive(doc.body.getAttribute("data-page"));

  /* ---------- Reveal on scroll ---------- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else {
    $$(".rv").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Work filters ---------- */
  $$(".filters").forEach(function (bar) {
    var grid = bar.parentNode.querySelector(".work");
    $$("button", bar).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", bar).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var f = b.getAttribute("data-f"), shown = 0;
        $$(".tile", grid).forEach(function (t) {
          var ok = f === "all" || t.getAttribute("data-c") === f;
          t.setAttribute("data-hide", ok ? "0" : "1"); if (ok) shown++;
        });
        grid.classList.toggle("eq", f !== "all");
      });
    });
  });

  /* ---------- Quotes carousel ---------- */
  $$(".q-wrap").forEach(function (w) {
    if (w.hasAttribute("data-auto")) return; // auto-scrolling rows are handled in the v2 section below
    var tr = $(".q-track", w), step = function () { var q = $(".q", tr); return q ? q.offsetWidth + 20 : 300; };
    var p = $(".q-prev", w), n = $(".q-next", w);
    if (p) p.addEventListener("click", function () { tr.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (n) n.addEventListener("click", function () { tr.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  /* ---------- Copy buttons ---------- */
  function copy(text, msg) {
    function fallback() {
      var ta = doc.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      doc.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = doc.execCommand("copy"); } catch (_) {}
      doc.body.removeChild(ta); toast(ok ? msg : "Select the text and copy it");
    }
    try { navigator.clipboard.writeText(text).then(function () { toast(msg); }, fallback); } catch (_) { fallback(); }
  }
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), "Copied"); }); });

  /* ---------- Plan buttons remember the plan for the enquiry form ---------- */
  window.__plan = "";
  doc.addEventListener("click", function (e) {
    var a = e.target.closest("[data-plan]");
    if (a) { window.__plan = a.getAttribute("data-plan"); try { sessionStorage.setItem("soc-plan", window.__plan); } catch (_) {} }
  });

  /* ---------- Enquiry form ---------- */
  var form = $("#enqForm");
  if (form) {
    var done = $("#done"), summary = $("#summary"), sel = $("#plan");
    var pre = window.__plan;
    try { pre = pre || new URLSearchParams(location.search).get("plan") || sessionStorage.getItem("soc-plan") || ""; } catch (_) {}
    window.__fillPlan = function () {
      var p = window.__plan; try { p = p || sessionStorage.getItem("soc-plan") || ""; } catch (_) {}
      if (p && sel) sel.value = p;
    };
    if (pre && sel) sel.value = pre;

    var bad = function (id, on) { $("#" + id).classList.toggle("bad", on); };
    var val = function (id) { return $("#" + id).value.trim(); };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svcs = $$("input[name=svc]:checked", form).map(function (i) { return i.value; });
      var okName = val("name").length > 0,
          okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email")),
          okSvc = svcs.length > 0,
          okMsg = val("msg").length >= 10;
      bad("f-name", !okName); bad("f-email", !okEmail); bad("f-svc", !okSvc); bad("f-msg", !okMsg);
      if (!(okName && okEmail && okSvc && okMsg)) {
        var first = $(".bad", form); if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      var payload = {
        name: val("name"), brand: val("brand"), email: val("email"), phone: val("phone"),
        services: svcs.join(", "), plan: val("plan") || "Not sure yet",
        budget: val("budget") || "Prefer to discuss", message: val("msg")
      };
      var text = ["Enquiry for Sociyaal", "",
        "Name: " + payload.name, "Brand: " + (payload.brand || "-"), "Email: " + payload.email,
        "Phone: " + (payload.phone || "-"), "Services: " + payload.services, "Plan: " + payload.plan,
        "Monthly budget: " + payload.budget, "", "About the project:", payload.message].join("\n");

      function showSent() {
        $("#doneTitle").textContent = "Thank you, we have your enquiry.";
        $("#doneText").textContent = "We reply fast. Here is a copy of what you sent.";
        $("#sendActs").hidden = true;
        summary.textContent = text; form.hidden = true; done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      function showManual() {
        $("#doneTitle").textContent = "Your enquiry is ready to send.";
        $("#doneText").innerHTML = "Choose how you would like to send it. It goes straight to the Sociyaal team.";
        $("#mailBtn").setAttribute("href", "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Enquiry from " + payload.name) + "&body=" + encodeURIComponent(text));
        $("#waBtn").setAttribute("href", "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text));
        $("#sendActs").hidden = false;
        summary.textContent = text; form.hidden = true; done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (CONFIG.endpoint) {
        fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { if (r.ok) showSent(); else showManual(); })
          .catch(showManual);
      } else { showManual(); }
    });
    ["name", "email", "msg"].forEach(function (id) { $("#" + id).addEventListener("input", function () { bad("f-" + id, false); }); });
    form.addEventListener("change", function () { bad("f-svc", false); });
    $("#copyAll").addEventListener("click", function () { copy(summary.textContent, "Enquiry copied"); });
    $("#edit").addEventListener("click", function () { done.hidden = true; form.hidden = false; });
  }

  /* ---------- Theme toggle (remembers the choice, otherwise follows the device) ---------- */
  var root = doc.documentElement;
  function curTheme() {
    return root.getAttribute("data-theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  var themeBtn = $("#themeBtn");
  function syncTheme() { if (themeBtn) { var d = curTheme() === "dark"; themeBtn.setAttribute("aria-label", d ? "Switch to light theme" : "Switch to dark theme"); themeBtn.setAttribute("aria-pressed", d ? "true" : "false"); } }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = curTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("soc-theme", next); } catch (_) {}
      syncTheme();
    });
    syncTheme();
  }

  /* ---------- Scroll effects ---------- */
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prog = $("#progress i"), topBtn = $("#topBtn");
  if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  // Count-up numbers
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")), pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
    if (reduce) { el.textContent = pre + target + suf; return; }
    var t0 = null, dur = 1400;
    function tick(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(target * e) + suf; if (k < 1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); cio.unobserve(x.target); } }); }, { threshold: 0.4 });
    $$("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  // Word-by-word statement highlight and parallax, driven by scroll
  $$(".statement").forEach(function (st) {
    var out = [];
    st.childNodes.forEach(function (n) {
      var bold = n.nodeType === 1 && n.tagName === "B";
      (n.textContent || "").split(/\s+/).filter(Boolean).forEach(function (w) { out.push('<span class="w' + (bold ? " b" : "") + '">' + w + "</span>"); });
    });
    st.innerHTML = out.join(" ");
  });

  // Moving background layer: blobs and shapes drift on gentle curves as the page scrolls
  var bgs = $$("[data-bg]");
  function moveBg(y) {
    root.style.setProperty("--sy", y);
    if (reduce) return;
    bgs.forEach(function (el) {
      var k = parseFloat(el.getAttribute("data-bg")), ph = k * 1.7;
      var amp = el.classList.contains("bl") ? 90 : 46;
      var x = Math.sin(y / (700 + k * 60) + ph) * amp;
      var yy = Math.cos(y / (900 + k * 70) + ph) * amp - y * (0.02 * (k % 4));
      var r = y * (0.04 + k * 0.006) * (k % 2 ? 1 : -1);
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + yy.toFixed(1) + "px,0) rotate(" + r.toFixed(1) + "deg)";
    });
  }
  var words = $$(".statement .w"), floats = $$("[data-speed]");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight, max = Math.max(1, doc.documentElement.scrollHeight - vh);
    moveBg(y);
    if (prog) prog.style.transform = "scaleX(" + Math.min(1, y / max) + ")";
    if (topBtn) topBtn.classList.toggle("on", y > 700);
    if (reduce) { words.forEach(function (w) { w.classList.add("on"); }); return; }
    floats.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var sp = parseFloat(el.getAttribute("data-speed")), mid = r.top + r.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (-mid * sp).toFixed(1) + "px,0) rotate(" + (mid * sp * 0.15).toFixed(1) + "deg)";
    });
    $$(".statement").forEach(function (st) {
      var r = st.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var k = (vh * 0.85 - r.top) / (vh * 0.55 + r.height), ws = $$(".w", st);
      ws.forEach(function (w, i) { w.classList.toggle("on", i / ws.length < k); });
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  window.addEventListener("hashchange", function () { setTimeout(onScroll, 60); });
  onScroll();

  /* ---------- YouTube video box (paste your link into data-yt on the .video element in index.html) ---------- */
  $$(".video").forEach(function (box) {
    var url = box.getAttribute("data-yt") || "", m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    var play = $(".play", box);
    play.addEventListener("click", function () {
      if (!m) { toast("Video coming soon"); return; }
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0";
      f.title = "Sociyaal video"; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
      box.appendChild(f); box.classList.add("playing");
    });
  });
})();

/* =====================================================================
   v2 additions: click ripple, testimonials auto-scroll, package hover,
   raised hand, footer spotlight
   ===================================================================== */
(function () {
  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Click ripple: a colour wave from the exact click point ---------- */
  doc.addEventListener("pointerdown", function (e) {
    var host = e.target.closest(".btn,.tile,.s9,.svc,.plan,.fab,.mini,.filters button,.q-nav button,.post,.socials a");
    if (!host || reduce) return;
    var r = host.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    var s = doc.createElement("span");
    s.className = "rip";
    s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
  }, { passive: true });

  /* ---------- Testimonials: auto scroll until a small photo is clicked ---------- */
  $$(".q-wrap[data-auto]").forEach(function (wrap) {
    var track = $(".q-track", wrap), toggle = $(".q-toggle", wrap), state = $(".q-state", wrap);
    var prev = $(".q-prev", wrap), next = $(".q-next", wrap);
    var cards = $$(".q", track), first = cards[0], dup = $(".q[data-dup]", track);
    if (!track || !first) return;
    var loopW = 0, pos = 0, lastSet = 0, playing = !reduce, last = null, held = false, SPEED = 38;

    function measure() { loopW = dup ? dup.offsetLeft - first.offsetLeft : 0; }
    function setState() {
      wrap.classList.toggle("paused", !playing);
      if (state) state.textContent = playing ? "Auto scrolling" : "Paused";
      if (toggle) { toggle.textContent = playing ? "Pause" : "Play"; toggle.setAttribute("aria-pressed", playing ? "false" : "true"); }
    }
    function clearPick() {
      $$(".q.picked", track).forEach(function (c) { c.classList.remove("picked"); });
      $$(".q-av[aria-pressed=true]", track).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    }
    function play() { clearPick(); playing = true; last = null; pos = track.scrollLeft; setState(); }
    function pause() { playing = false; setState(); }

    function tick(t) {
      if (last === null) last = t;
      var dt = Math.min(64, t - last); last = t;
      if (playing && !held && loopW) {
        if (Math.abs(track.scrollLeft - lastSet) > 2) pos = track.scrollLeft;
        pos += SPEED * dt / 1000;
        if (pos >= loopW) pos -= loopW;
        track.scrollLeft = pos; lastSet = track.scrollLeft;
        if (Math.abs(lastSet - pos) > 1) pos = lastSet;
      }
      requestAnimationFrame(tick);
    }

    /* Clicking a small photo stops the scrolling on that testimonial; click it again to resume */
    track.addEventListener("click", function (e) {
      var av = e.target.closest(".q-av"); if (!av) return;
      var card = av.closest(".q"), already = av.getAttribute("aria-pressed") === "true";
      if (already) { play(); return; }
      clearPick(); pause();
      av.setAttribute("aria-pressed", "true"); card.classList.add("picked");
      var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
    });
    if (toggle) toggle.addEventListener("click", function () { if (playing) pause(); else play(); });

    function step() { return first.offsetWidth + 20; }
    function go(dir) {
      if (dir < 0 && track.scrollLeft < step() && loopW) track.scrollLeft += loopW;
      track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { pos = track.scrollLeft; lastSet = pos; }, 450);
    }
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    /* Keep the loop seamless when somebody scrolls by hand */
    track.addEventListener("scroll", function () {
      if (loopW && track.scrollLeft >= loopW + 4 && !playing) track.scrollLeft -= loopW;
    }, { passive: true });
    /* Do not fight a finger or mouse while it is dragging the row */
    ["pointerdown", "touchstart"].forEach(function (ev) { track.addEventListener(ev, function () { held = true; }, { passive: true }); });
    ["pointerup", "pointercancel", "touchend", "mouseleave"].forEach(function (ev) { track.addEventListener(ev, function () { setTimeout(function () { held = false; pos = track.scrollLeft; lastSet = pos; }, 120); }, { passive: true }); });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure(); setState();
    if (!reduce) requestAnimationFrame(tick);
  });

  /* ---------- What we do: auto-scrolling services (pauses on hover or touch, Pause button, arrows) ---------- */
  $$(".sv-wrap[data-auto]").forEach(function (wrap) {
    var track = $(".sv-track", wrap), toggle = $(".sv-toggle", wrap), state = $(".sv-state", wrap);
    var prev = $(".sv-prev", wrap), next = $(".sv-next", wrap);
    var first = $(".sv", track), dup = $(".sv[data-dup]", track);
    if (!track || !first) return;
    var loopW = 0, pos = 0, lastSet = 0, playing = !reduce, last = null, held = false, hover = false, SPEED = 42;
    function measure() { loopW = dup ? dup.offsetLeft - first.offsetLeft : 0; }
    function setState() {
      wrap.classList.toggle("paused", !playing);
      if (state) state.textContent = playing ? "Auto scrolling" : "Paused";
      if (toggle) { toggle.textContent = playing ? "Pause" : "Play"; toggle.setAttribute("aria-pressed", playing ? "false" : "true"); }
    }
    function tick(t) {
      if (last === null) last = t;
      var dt = Math.min(64, t - last); last = t;
      if (playing && !held && !hover && loopW) {
        if (Math.abs(track.scrollLeft - lastSet) > 2) pos = track.scrollLeft;
        pos += SPEED * dt / 1000;
        if (pos >= loopW) pos -= loopW;
        track.scrollLeft = pos; lastSet = track.scrollLeft;
        if (Math.abs(lastSet - pos) > 1) pos = lastSet;
      }
      requestAnimationFrame(tick);
    }
    if (toggle) toggle.addEventListener("click", function () { playing = !playing; last = null; pos = track.scrollLeft; setState(); });
    function step() { return first.offsetWidth + 20; }
    function go(dir) {
      if (dir < 0 && track.scrollLeft < step() && loopW) track.scrollLeft += loopW;
      track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { pos = track.scrollLeft; lastSet = pos; }, 450);
    }
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", function () {
      if (loopW && track.scrollLeft >= loopW + 4 && (!playing || hover || held)) track.scrollLeft -= loopW;
    }, { passive: true });
    track.addEventListener("mouseenter", function () { hover = true; });
    track.addEventListener("mouseleave", function () { hover = false; pos = track.scrollLeft; lastSet = pos; });
    ["pointerdown", "touchstart"].forEach(function (ev) { track.addEventListener(ev, function () { held = true; }, { passive: true }); });
    ["pointerup", "pointercancel", "touchend"].forEach(function (ev) { track.addEventListener(ev, function () { setTimeout(function () { held = false; pos = track.scrollLeft; lastSet = pos; }, 120); }, { passive: true }); });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure(); setState();
    if (!reduce) requestAnimationFrame(tick);
  });

  /* ---------- Packages: spotlight and gentle 3D tilt that follow the mouse ---------- */
  $$(".plan").forEach(function (p) {
    $$("li", p).forEach(function (li, i) { li.style.setProperty("--k", i); });
    if (reduce) return;
    p.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      p.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      p.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      p.style.setProperty("--ry", ((x - .5) * 7).toFixed(2) + "deg");
      p.style.setProperty("--rx", ((.5 - y) * 6).toFixed(2) + "deg");
    });
    p.addEventListener("pointerleave", function () { p.style.setProperty("--rx", "0deg"); p.style.setProperty("--ry", "0deg"); });
  });

  /* ---------- Footer cells: soft spotlight under the cursor ---------- */
  $$(".fcell").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Raised hand: lifts as the call-to-action scrolls into view ---------- */
  var hands = $$(".hand");
  if (hands.length && !reduce) {
    var tk = false;
    function lift() {
      tk = false;
      var vh = window.innerHeight;
      hands.forEach(function (h) {
        var r = h.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9 + r.height * 0.3)));
        h.style.transform = "translate3d(0," + ((1 - p) * 110 - 10).toFixed(1) + "px,0)";
        h.style.opacity = (0.25 + p * 0.75).toFixed(2);
      });
    }
    window.addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(lift); } }, { passive: true });
    window.addEventListener("resize", lift);
    lift();
  }
})();

/* ==========================================================================
   Alba — Nail Atelier · Interacciones ("nácar nocturno")
   Sin dependencias. Todo el contenido editable vive en business-config.js
   ========================================================================== */
(function () {
  "use strict";

  var config = window.NACRE_CONFIG || {};
  var business = config.business || {};
  var services = Array.isArray(config.services) ? config.services : [];
  var gallery = Array.isArray(config.gallery) ? config.gallery : [];
  var filtersCfg = Array.isArray(config.galleryFilters) ? config.galleryFilters : [];

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var motion = root.classList.contains("motion");
  var menuOpen = false;

  var ARROW = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var NAIL = '<svg class="svc-nail" aria-hidden="true" viewBox="0 0 20 32"><path d="M2 30C1 22 1.5 9 10 1c8.5 8 9 21 8 29-2.5 1.6-13.5 1.6-16 0Z"/></svg>';
  var ICONS = {
    pin: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    clock: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    chat: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 19.5l1.3-3.9A8 8 0 1 1 8.6 19z"/></svg>',
    camera: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="0.6"/></svg>'
  };
  var ADVICE = { id: "asesoria", name: "Aún no lo sé, quiero asesoría", color: "conic-gradient(#F6C9D4 0 33%, #CDB9F2 0 66%, #E7C99B 0)" };

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val === null || val === undefined || val === false) return;
        if (key === "text") node.textContent = val;
        else if (key === "html") node.innerHTML = val;
        else if (key === "className") node.className = val;
        else node.setAttribute(key, val === true ? "" : val);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function isFilled(value) {
    return typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined;
  }

  function scrollToEl(target) {
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  function isLight(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return true;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.3;
  }

  function whatsappDigits() {
    var digits = String(business.whatsapp || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits : "";
  }

  function formatPhone(digits) {
    if (/^521?\d{10}$/.test(digits)) {
      var local = digits.slice(-10);
      return "+52 " + local.slice(0, 2) + " " + local.slice(2, 6) + " " + local.slice(6);
    }
    return "+" + digits;
  }

  function formatPrice(service) {
    if (typeof service.price !== "number") return "";
    var amount = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: config.currency || "MXN",
      maximumFractionDigits: 0
    }).format(service.price);
    return (service.priceFrom ? "Desde " : "") + amount + " " + (config.currency || "MXN");
  }

  function categoryFor(id) {
    return filtersCfg.filter(function (f) { return f.id === id; })[0] || { id: id, label: id, color: "#F6C9D4" };
  }

  /* Sustituye imágenes que no cargan por un marcador con las mismas proporciones */
  function guardImage(img) {
    function replace() {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      var w = parseInt(img.getAttribute("width"), 10) || 4;
      var h = parseInt(img.getAttribute("height"), 10) || 5;
      var ph = el("div", {
        className: "img-fallback",
        role: img.alt ? "img" : null,
        "aria-label": img.alt || null,
        style: "aspect-ratio:" + w + "/" + h
      }, [el("span", { text: "Imagen pendiente" })]);
      img.replaceWith(ph);
    }
    img.addEventListener("error", replace);
    if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) replace();
  }

  /* Un solo bucle de scroll para todos los efectos */
  var scrollFns = [];
  var scrollQueued = false;
  function onScroll(fn) { scrollFns.push(fn); }
  function runScroll() {
    scrollQueued = false;
    var y = window.scrollY || window.pageYOffset;
    scrollFns.forEach(function (fn) { fn(y); });
  }
  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(runScroll);
  }

  /* ---------- Imágenes configurables ---------- */
  function applyConfigImages() {
    var images = config.images || {};
    $all("[data-config-image]").forEach(function (img) {
      var data = images[img.getAttribute("data-config-image")];
      if (data && data.src) {
        if (img.getAttribute("src") !== data.src) img.setAttribute("src", data.src);
        if (data.alt) img.setAttribute("alt", data.alt);
        if (data.width) img.setAttribute("width", data.width);
        if (data.height) img.setAttribute("height", data.height);
      }
      guardImage(img);
    });
    // Las uñas flotantes son decorativas: si alguna falta, simplemente no se muestra
    $all(".hn img, .closing-nails img").forEach(function (img) {
      function drop() { (img.closest(".hn") || img).remove(); }
      img.addEventListener("error", drop);
      if (img.complete && img.naturalWidth === 0) drop();
    });
  }

  /* ---------- Titulares letra por letra ---------- */
  function splitChars() {
    $all("[data-chars]").forEach(function (heading) {
      var label = heading.textContent.replace(/\s+/g, " ").trim();
      var visual = el("span", { "aria-hidden": "true" });
      var ci = 0;
      function walk(node, target) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(" ")); return; }
              var word = el("span", { className: "split-word" });
              Array.from(part).forEach(function (ch) {
                word.appendChild(el("span", { className: "split-char", style: "--ci:" + ci++, text: ch }));
              });
              target.appendChild(word);
            });
          } else if (child.nodeType === 1) {
            if (child.tagName === "EM") {
              ci += 2;
              target.appendChild(el("em", { className: "split-em", style: "--ci:" + ci, text: child.textContent.trim() }));
              ci += 2;
            } else {
              var clone = child.cloneNode(false);
              walk(child, clone);
              target.appendChild(clone);
            }
          }
        });
      }
      walk(heading, visual);
      heading.textContent = "";
      heading.appendChild(el("span", { className: "visually-hidden", text: label }));
      heading.appendChild(visual);
    });

    var word = $("[data-footer-word]");
    if (word) {
      var text = word.textContent.trim();
      var vis = el("span", { "aria-hidden": "true" });
      Array.from(text).forEach(function (ch, i) { vis.appendChild(el("span", { className: "fw-l", style: "--i:" + i, text: ch })); });
      word.textContent = "";
      word.appendChild(vis);
      word.classList.add("is-split");
    }
  }

  /* ---------- Apariciones al hacer scroll ---------- */
  function initReveal() {
    var targets = $all(".reveal, [data-chars], .mask-reveal, .svc, [data-footer-word]");
    if (!motion || !("IntersectionObserver" in window)) {
      targets.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    targets.forEach(function (n) { observer.observe(n); });
  }

  /* ---------- Cabecera: se oculta al bajar y vuelve al subir ---------- */
  function initHeader() {
    var header = $("[data-header]");
    if (!header) return;
    var desktop = window.matchMedia("(min-width: 900px)");
    var lastY = window.scrollY;
    onScroll(function (y) {
      if (menuOpen || !desktop.matches || y < 240 || header.contains(document.activeElement)) {
        header.classList.remove("is-hidden");
      } else if (y > lastY + 6) {
        header.classList.add("is-hidden");
      } else if (y < lastY - 6) {
        header.classList.remove("is-hidden");
      }
      lastY = y;
    });
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
  }

  /* ---------- Menú a pantalla completa (celular) ---------- */
  function initMenu() {
    var toggle = $("[data-menu-toggle]");
    var nav = $("[data-nav]");
    var header = $("[data-header]");
    var label = $("[data-menu-label]");
    if (!toggle || !nav) return;
    var desktop = window.matchMedia("(min-width: 900px)");
    var outside = [$("main"), $(".site-footer"), $(".logo"), $(".header-cta")];

    function setMenu(open, returnFocus) {
      menuOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Cerrar menú" : "Abrir menú";
      nav.classList.toggle("is-open", open);
      header.classList.toggle("menu-is-open", open);
      outside.forEach(function (node) {
        if (!node) return;
        if (open) node.setAttribute("inert", "");
        else node.removeAttribute("inert");
      });
      root.style.overflow = open ? "hidden" : "";
      if (open) {
        header.classList.remove("is-hidden");
        window.setTimeout(function () { var first = $("a", nav); if (first) first.focus(); }, reducedMotion ? 0 : 120);
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () { setMenu(!menuOpen, true); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a") && menuOpen) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) setMenu(false, true); });
    var onChange = function () { if (desktop.matches && menuOpen) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else desktop.addListener(onChange);
  }

  function initActiveNav() {
    var links = $all(".nav-list a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = map[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("main section[id]").forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Portada: uñas flotantes con profundidad ---------- */
  function initHero() {
    var hero = $("[data-hero]");
    if (!hero || reducedMotion) return;
    var nails = $all(".hn", hero);
    var depth = nails.map(function (n) { return parseFloat(n.getAttribute("data-depth")) || 0.5; });
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function tick() {
      raf = null;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      nails.forEach(function (n, i) {
        n.style.setProperty("--px", (cx * depth[i] * 70).toFixed(2) + "px");
        n.style.setProperty("--py", (cy * depth[i] * 56).toFixed(2) + "px");
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = window.requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = window.requestAnimationFrame(tick); }

    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        kick();
      });
      hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
    }

    onScroll(function (y) {
      if (y > window.innerHeight * 1.3) return;
      nails.forEach(function (n, i) { n.style.setProperty("--sy", (-y * depth[i] * 0.45).toFixed(1) + "px"); });
    });
  }

  /* ---------- Destello que sigue al cursor ---------- */
  function initCursorGlow() {
    var glow = $("[data-cursor-glow]");
    if (!glow) return;
    if (reducedMotion || !finePointer) { glow.remove(); return; }
    var x = 0, y = 0, gx = 0, gy = 0, raf = null, started = false;
    function tick() {
      raf = null;
      gx += (x - gx) * 0.16;
      gy += (y - gy) * 0.16;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      if (Math.abs(x - gx) + Math.abs(y - gy) > 0.5) raf = window.requestAnimationFrame(tick);
    }
    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!started) { gx = x; gy = y; started = true; }
      glow.classList.add("is-on");
      if (!raf) raf = window.requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { glow.classList.remove("is-on"); });
  }

  /* ---------- Botones magnéticos ---------- */
  function initMagnetic() {
    if (reducedMotion || !finePointer) return;
    $all("[data-magnetic]").forEach(function (btn) {
      var t = [0, 0];
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left - t[0] + r.width / 2);
        var dy = e.clientY - (r.top - t[1] + r.height / 2);
        t = [dx * 0.28, dy * 0.4];
        btn.style.translate = t[0].toFixed(1) + "px " + t[1].toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { t = [0, 0]; btn.style.translate = ""; });
    });
  }

  /* ---------- Servicios ---------- */
  function renderServices() {
    var list = $("[data-services]");
    if (!list) return;
    var solid = [false, true, true, false, true, false];
    services.forEach(function (service, i) {
      var tone = solid[i % solid.length] ? (isLight(service.color) ? "light" : "deep") : null;
      var meta = [formatPrice(service), service.duration].filter(isFilled).join(" · ");
      var media = null;
      if (isFilled(service.image)) {
        var img = el("img", { src: service.image, alt: "", loading: "lazy", decoding: "async", width: 800, height: 1000 });
        guardImage(img);
        media = el("div", { className: "svc-media", "aria-hidden": "true" }, [img]);
      }
      list.appendChild(el("li", {
        className: "svc" + (i === 0 ? " svc-a" : ""),
        style: "--c:" + (service.color || "#F49AAE") + ";--i:" + i,
        "data-tone": tone
      }, [
        media,
        el("p", { className: "svc-top", "aria-hidden": "true", html: NAIL + "<span>" + pad(i + 1) + "</span>" }),
        el("h3", { className: "svc-name", text: service.name }),
        el("p", { className: "svc-desc", text: service.description }),
        meta ? el("p", { className: "svc-meta", text: meta }) : null,
        el("button", {
          type: "button",
          className: "svc-cta",
          "data-service": service.id,
          "aria-label": "Consultar " + service.name,
          html: "Consultar " + ARROW
        })
      ]));
    });

    var note = $("[data-pricing-note]");
    if (note && isFilled(config.pricingNote)) { note.textContent = config.pricingNote; note.hidden = false; }

    list.addEventListener("pointermove", function (e) {
      var card = e.target.closest(".svc");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      card.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    });
    list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-service]");
      if (btn) Booking.chooseService(btn.getAttribute("data-service"));
    });
  }

  /* ---------- Galería horizontal ---------- */
  var Gallery = (function () {
    var section, pin, viewport, track, filtersWrap, statusEl, progressEl, hintEl;
    var current = "todos", visible = [];
    var pinned = false, distance = 0, pinTop = 0, lastX = 0, lastLeft = 0;
    var skew = 0, skewTarget = 0, skewRaf = null;
    var mqPin = window.matchMedia("(min-width: 900px) and (min-height: 620px)");

    function init() {
      section = $("[data-designs]");
      track = $("[data-gallery]");
      if (!section || !track) return;
      pin = $("[data-pin]", section);
      viewport = $("[data-track-viewport]", section);
      filtersWrap = $("[data-filters]", section);
      statusEl = $("[data-gallery-status]", section);
      progressEl = $("[data-track-progress]", section);
      hintEl = $("[data-track-hint]", section);

      renderFilters();
      build(false);
      renderNote();

      track.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-open]");
        if (btn) Lightbox.open(Number(btn.getAttribute("data-open")), btn);
      });
      track.addEventListener("pointermove", function (e) {
        var media = e.target.closest(".card-media");
        if (!media) return;
        var r = media.getBoundingClientRect();
        media.style.setProperty("--cx", (e.clientX - r.left).toFixed(0) + "px");
        media.style.setProperty("--cy", (e.clientY - r.top).toFixed(0) + "px");
      });
      track.addEventListener("focusin", onFocus);
      viewport.addEventListener("scroll", onNativeScroll, { passive: true });

      setupPin();
      if (mqPin.addEventListener) mqPin.addEventListener("change", setupPin);
      else mqPin.addListener(setupPin);
      window.addEventListener("resize", measure);
      window.addEventListener("load", measure);
      onScroll(update);
    }

    function renderFilters() {
      filtersCfg.forEach(function (filter) {
        var count = filter.id === "todos"
          ? gallery.length
          : gallery.filter(function (d) { return d.category === filter.id; }).length;
        if (!count) return;
        filtersWrap.appendChild(el("button", {
          type: "button",
          className: "filter",
          "data-filter": filter.id,
          "aria-pressed": String(filter.id === current)
        }, [
          el("span", { className: "filter-dot", style: "--dot:" + filter.color, "aria-hidden": "true" }),
          el("span", { text: filter.label }),
          el("span", { className: "filter-count", text: String(count) })
        ]));
      });
      filtersWrap.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-filter]");
        if (!btn) return;
        btn.classList.remove("is-pop");
        void btn.offsetWidth;
        btn.classList.add("is-pop");
        if (btn.getAttribute("data-filter") !== current) apply(btn.getAttribute("data-filter"));
      });
    }

    function build(animate) {
      visible = [];
      gallery.forEach(function (d, i) {
        if (current === "todos" || d.category === current) visible.push(i);
      });
      track.innerHTML = "";
      visible.forEach(function (index, k) {
        var d = gallery[index];
        var c = categoryFor(d.category);
        var img = el("img", { src: d.image, alt: "", width: d.width, height: d.height, decoding: "async" });
        guardImage(img);
        track.appendChild(el("li", {
          className: "card" + (animate && !reducedMotion ? " is-in" : ""),
          style: "--ar:" + (d.width || 4) + "/" + (d.height || 5) + ";--n:" + k
        }, [
          el("button", {
            type: "button",
            className: "card-btn",
            "data-open": index,
            "aria-haspopup": "dialog",
            "aria-label": "Ver en grande: " + d.name + " (" + c.label + ")"
          }, [
            el("span", { className: "card-media" }, [img, el("span", { className: "card-view", "aria-hidden": "true", text: "Ver" })]),
            el("span", { className: "card-info" }, [
              el("span", { className: "card-cat" }, [el("i", { style: "--dot:" + c.color }), c.label]),
              el("span", { className: "card-name", text: d.name }),
              el("span", { className: "card-idx", text: pad(k + 1) + "/" + pad(visible.length) })
            ])
          ])
        ]));
      });
    }

    function renderNote() {
      var note = $("[data-gallery-note]");
      if (!note || !config.galleryNote) return;
      var nonStudio = gallery.filter(function (d) { return d.source !== "studio"; });
      if (!nonStudio.length) return;
      var hasIllustration = nonStudio.some(function (d) { return d.source === "illustration"; });
      note.textContent = hasIllustration ? config.galleryNote.illustration : config.galleryNote.inspiration;
      note.hidden = false;
    }

    function apply(filterId) {
      current = filterId;
      $all("[data-filter]", filtersWrap).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filterId));
      });
      function swap() {
        track.classList.remove("is-out");
        build(true);
        measure();
        if (pinned && window.scrollY > pinTop) window.scrollTo({ top: pinTop, behavior: "instant" });
        viewport.scrollLeft = 0;
        var label = categoryFor(filterId).label;
        statusEl.textContent = "Mostrando " + visible.length + (visible.length === 1 ? " diseño" : " diseños") +
          (filterId === "todos" ? "" : " de " + label);
      }
      if (reducedMotion) { swap(); return; }
      track.classList.add("is-out");
      window.setTimeout(swap, 300);
    }

    function setupPin() {
      pinned = mqPin.matches && !reducedMotion;
      section.classList.toggle("is-pinned", pinned);
      if (!pinned) {
        pin.style.height = "";
        track.style.transform = "";
      }
      if (hintEl) hintEl.textContent = pinned ? "Sigue bajando para recorrer la galería" : "Desliza para ver más";
      measure();
    }

    function padding() {
      var cs = window.getComputedStyle(viewport);
      return { left: parseFloat(cs.paddingLeft) || 0, right: parseFloat(cs.paddingRight) || 0 };
    }

    function measure() {
      if (!track) return;
      if (pinned) {
        var p = padding();
        distance = Math.max(0, track.offsetWidth + p.left + p.right - viewport.clientWidth);
        pin.style.height = (window.innerHeight + distance) + "px";
        pinTop = pin.getBoundingClientRect().top + window.scrollY;
        update(window.scrollY);
      } else {
        onNativeScroll();
      }
    }

    function update(y) {
      if (!pinned) return;
      var p = distance ? clamp((y - pinTop) / distance, 0, 1) : 0;
      var x = -p * distance;
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      progressEl.style.setProperty("--tp", Math.max(0.06, p).toFixed(3));
      kick(x - lastX);
      lastX = x;
    }

    function onNativeScroll() {
      if (pinned || !viewport) return;
      var max = viewport.scrollWidth - viewport.clientWidth;
      var left = viewport.scrollLeft;
      progressEl.style.setProperty("--tp", Math.max(0.06, max > 0 ? left / max : 1).toFixed(3));
      kick(lastLeft - left);
      lastLeft = left;
    }

    /* Inclinación ligera según la velocidad del desplazamiento */
    function kick(velocity) {
      if (reducedMotion || !velocity) return;
      skewTarget = clamp(velocity * 0.12, -6, 6);
      if (!skewRaf) skewRaf = window.requestAnimationFrame(skewTick);
    }
    function skewTick() {
      skewRaf = null;
      skew += (skewTarget - skew) * 0.2;
      skewTarget *= 0.82;
      if (Math.abs(skew) < 0.02 && Math.abs(skewTarget) < 0.02) {
        skew = 0;
        track.style.setProperty("--skew", "0deg");
        return;
      }
      track.style.setProperty("--skew", skew.toFixed(2) + "deg");
      skewRaf = window.requestAnimationFrame(skewTick);
    }

    /* Con teclado, lleva la tarjeta enfocada al centro de la pantalla */
    function onFocus(e) {
      if (!pinned) return;
      var card = e.target.closest(".card");
      if (!card) return;
      viewport.scrollLeft = 0;
      var p = padding();
      var inTrack = card.offsetLeft - track.offsetLeft;
      var wanted = inTrack + p.left - (viewport.clientWidth - card.offsetWidth) / 2;
      var t = clamp(wanted, 0, distance);
      window.scrollTo({ top: pinTop + t, behavior: "instant" });
    }

    function visibleIndexes() { return visible.slice(); }
    function openerFor(index) { return $('[data-open="' + index + '"]', track); }

    return { init: init, visibleIndexes: visibleIndexes, openerFor: openerFor };
  })();

  /* ---------- Vista ampliada ---------- */
  var Lightbox = (function () {
    var dialog, img, title, cat, count, note, similarBtn;
    var current = 0, list = [], opener = null, skipFocusReturn = false;

    function init() {
      dialog = $("[data-lightbox]");
      if (!dialog) return;
      img = $("[data-lightbox-img]", dialog);
      title = $("[data-lightbox-title]", dialog);
      cat = $("[data-lightbox-cat]", dialog);
      count = $("[data-lightbox-count]", dialog);
      note = $("[data-lightbox-note]", dialog);
      similarBtn = $("[data-lightbox-similar]", dialog);

      $("[data-lightbox-close]", dialog).addEventListener("click", close);
      $("[data-lightbox-prev]", dialog).addEventListener("click", function () { step(-1); });
      $("[data-lightbox-next]", dialog).addEventListener("click", function () { step(1); });
      similarBtn.addEventListener("click", function () {
        skipFocusReturn = true;
        close();
        Booking.chooseDesign(gallery[current]);
      });
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog || e.target.hasAttribute("data-lightbox-stage")) close();
      });
      dialog.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      });
      dialog.addEventListener("close", function () {
        root.style.overflow = "";
        if (!skipFocusReturn && opener && document.contains(opener)) opener.focus({ preventScroll: true });
        skipFocusReturn = false;
      });

      var startX = null;
      var stage = $("[data-lightbox-stage]", dialog);
      stage.addEventListener("pointerdown", function (e) { startX = e.clientX; });
      stage.addEventListener("pointerup", function (e) {
        if (startX === null) return;
        var dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      });
    }

    function fill(design) {
      var c = categoryFor(design.category);
      img.removeAttribute("data-fallback");
      img.src = design.image;
      img.alt = design.alt || design.name;
      img.width = design.width;
      img.height = design.height;
      title.textContent = design.name;
      cat.textContent = c.label;
      cat.style.setProperty("--dot", c.color);
      count.textContent = (list.indexOf(current) + 1) + " de " + list.length;
      similarBtn.setAttribute("aria-label", "Quiero un diseño similar a " + design.name);
      if (design.source !== "studio" && config.galleryNote) {
        note.textContent = design.source === "illustration" ? config.galleryNote.illustration : config.galleryNote.inspiration;
        note.hidden = false;
      } else {
        note.hidden = true;
      }
    }

    function show(index, dir) {
      var design = gallery[index];
      if (!design) return;
      current = index;
      if (!dir || reducedMotion) { fill(design); return; }
      img.classList.add(dir > 0 ? "out-left" : "out-right");
      window.setTimeout(function () {
        fill(design);
        img.classList.remove("out-left", "out-right");
        img.classList.add(dir > 0 ? "out-right" : "out-left");
        void img.offsetWidth;
        img.classList.remove("out-left", "out-right");
      }, 220);
    }

    /* La imagen "vuela" desde la tarjeta hasta la vista ampliada */
    function flyFrom(trigger) {
      var from = trigger && $(".card-media img", trigger);
      if (!from || reducedMotion || typeof img.animate !== "function") return;
      var a = from.getBoundingClientRect();
      function run() {
        var b = img.getBoundingClientRect();
        if (!b.width || !a.width) return;
        img.animate([
          { transform: "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px) scale(" + (a.width / b.width) + ")", borderRadius: "26px" },
          { transform: "none", borderRadius: "28px" }
        ], { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      }
      img.style.transformOrigin = "0 0";
      if (img.complete && img.naturalWidth) window.requestAnimationFrame(run);
      else img.addEventListener("load", function () { window.requestAnimationFrame(run); }, { once: true });
    }

    function open(index, trigger) {
      if (!dialog || typeof dialog.showModal !== "function") {
        Booking.chooseDesign(gallery[index]);
        return;
      }
      opener = trigger || Gallery.openerFor(index);
      list = Gallery.visibleIndexes();
      show(index);
      root.style.overflow = "hidden";
      dialog.showModal();
      $("[data-lightbox-close]", dialog).focus();
      flyFrom(opener);
    }

    function step(dir) {
      if (!list.length) return;
      var pos = list.indexOf(current);
      show(list[(pos + dir + list.length) % list.length], dir);
    }

    function close() { if (dialog && dialog.open) dialog.close(); }

    return { init: init, open: open };
  })();

  /* ---------- Estudio: tarjetas que se apilan ---------- */
  function initStack() {
    var cards = $all("[data-stack] .stack-card");
    if (cards.length < 2 || reducedMotion) return;
    onScroll(function () {
      var rects = cards.map(function (c) { return c.getBoundingClientRect(); });
      cards.forEach(function (card, i) {
        var bottom = rects[i].top + card.offsetHeight;
        var cover = 0;
        for (var j = i + 1; j < cards.length; j++) {
          cover += clamp((bottom - rects[j].top) / card.offsetHeight, 0, 1);
        }
        card.style.setProperty("--s", (1 - cover * 0.05).toFixed(4));
        card.style.setProperty("--shade", (cover * 0.16).toFixed(3));
      });
    });
  }

  /* ---------- Solicitud de cita en 4 pasos ---------- */
  var Booking = (function () {
    var form, card, section, result, statusBox, submitBtn, dateInput, chip, chipImg, chipName;
    var panels, stepBtns, bar, countEl, announceEl, prevBtn, nextBtn, review, quickWrap;
    var step = 1, selectedDesign = null, touched = {};
    var STEP_FIELDS = { 1: ["service"], 2: ["preferred_date", "preferred_time"], 3: ["customer_name", "phone", "email"] };
    var STEP_NAMES = ["Servicio", "Fecha y horario", "Tus datos", "Revisar y enviar"];

    function todayISO(offset) {
      var d = new Date();
      if (offset) d.setDate(d.getDate() + offset);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function parseLocalDate(value) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
      if (!m) return null;
      var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return d.getMonth() === Number(m[2]) - 1 ? d : null;
    }

    function formatDate(value) {
      var d = parseLocalDate(value);
      if (!d) return value;
      return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    function init() {
      form = $("[data-booking-form]");
      card = $("[data-booking-card]");
      section = $("#cita");
      if (!form) return;
      result = $("[data-booking-result]");
      statusBox = $("[data-form-status]", form);
      submitBtn = $("[data-submit]", form);
      dateInput = $("#preferred_date", form);
      chip = $("[data-selected-design]", form);
      chipImg = $("[data-selected-design-img]", form);
      chipName = $("[data-selected-design-name]", form);
      panels = $all("[data-step-panel]", form);
      stepBtns = $all("[data-wizard-steps] [data-goto]", form);
      bar = $("[data-wizard-bar]", form);
      countEl = $("[data-step-current]", form);
      announceEl = $("[data-step-announce]", form);
      prevBtn = $("[data-prev]", form);
      nextBtn = $("[data-next]", form);
      review = $("[data-review]", form);
      quickWrap = $("[data-quick-dates]", form);

      var options = $("[data-service-options]", form);
      var serviceNails = {
        "manicura": "pearl",
        "gel-semipermanente": "cherry",
        "unas-acrilicas": "champ",
        "refuerzo": "french",
        "nail-art": "aurora",
        "retiro-mantenimiento": "lilac",
        "asesoria": "aurora"
      };
      services.concat([ADVICE]).forEach(function (s) {
        options.appendChild(el("label", { className: "tile" }, [
          el("input", { type: "radio", name: "service", value: s.id }),
          el("span", null, [
            el("img", {
              className: "tile-nail",
              src: "assets/img/nail-" + (serviceNails[s.id] || "pearl") + "-realistic.png",
              width: "30", height: "52", alt: "", "aria-hidden": "true", decoding: "async"
            }),
            s.name
          ])
        ]));
      });

      dateInput.min = todayISO();
      dateInput.addEventListener("focus", function () { dateInput.min = todayISO(); });
      buildQuickDates();

      $("[data-remove-design]", form).addEventListener("click", function () {
        setDesign(null);
        var first = $('input[name="service"]', form);
        if (first) first.focus();
      });

      prevBtn.addEventListener("click", function () { goTo(step - 1); });
      nextBtn.addEventListener("click", function () { goTo(step + 1); });
      form.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-goto]");
        if (btn) goTo(Number(btn.getAttribute("data-goto")));
      });
      form.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName === "INPUT" && step < 4) {
          e.preventDefault();
          goTo(step + 1);
        }
      });
      form.addEventListener("submit", onSubmit);
      form.addEventListener("input", onChange);
      form.addEventListener("change", onChange);

      show(1, null, false);
    }

    function buildQuickDates() {
      if (!quickWrap) return;
      var now = new Date();
      var toSat = (6 - now.getDay() + 7) % 7 || 7;
      var picks = [{ label: "Mañana", offset: 1 }];
      if (toSat > 1) picks.push({ label: "Este sábado", offset: toSat });
      picks.push({ label: "En una semana", offset: 7 });
      picks.forEach(function (p) {
        var iso = todayISO(p.offset);
        var btn = el("button", {
          type: "button", className: "quick-date", "data-date": iso, "aria-pressed": "false",
          "aria-label": p.label + ", " + formatDate(iso), text: p.label
        });
        btn.addEventListener("click", function () {
          dateInput.value = iso;
          dateInput.dispatchEvent(new Event("change", { bubbles: true }));
        });
        quickWrap.appendChild(btn);
      });
      quickWrap.hidden = false;
    }

    function syncQuickDates() {
      if (!quickWrap) return;
      $all("[data-date]", quickWrap).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-date") === dateInput.value));
      });
    }

    function value(name) {
      var field = form.elements[name];
      if (!field) return "";
      if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) return field.value || "";
      return String(field.value || "").trim();
    }

    function onChange(e) {
      var name = e.target.name;
      if (name === "preferred_date") syncQuickDates();
      if (name && touched[name]) validateField(name);
      updateChrome();
    }

    function fieldBox(name) {
      if (name === "service") return $("#service-group", form);
      if (name === "preferred_time") return $("#preferred_time-group", form);
      return form.elements[name] ? form.elements[name].closest(".field") : null;
    }

    function setError(name, message) {
      var err = $("#" + name + "-error", form);
      var box = fieldBox(name);
      var control = form.elements[name];
      if (!err) return;
      err.textContent = message || "";
      err.hidden = !message;
      if (box) box.classList.toggle("is-invalid", !!message);
      if (control && control.setAttribute) {
        if (message) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      }
    }

    function checkField(name) {
      var v = value(name);
      if (name === "customer_name") {
        if (!v) return "Escribe tu nombre para saber a quién responder.";
        if (v.length < 2) return "Revisa tu nombre: parece incompleto.";
      } else if (name === "phone") {
        var digits = v.replace(/\D/g, "");
        if (!v) return "Déjanos un teléfono para confirmar tu cita.";
        if (digits.length < 10 || digits.length > 13) return "Escribe un teléfono de 10 dígitos.";
      } else if (name === "email") {
        if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Revisa tu correo: parece incompleto.";
      } else if (name === "service") {
        if (!v) return "Elige un servicio o la opción de asesoría.";
      } else if (name === "preferred_date") {
        var date = parseLocalDate(v);
        if (!v) return "Elige la fecha que prefieres.";
        if (!date) return "Escribe una fecha válida.";
        if (date < parseLocalDate(todayISO())) return "Elige una fecha a partir de hoy.";
      } else if (name === "preferred_time") {
        if (!v) return "Elige el horario que prefieres.";
      }
      return "";
    }

    function validateField(name) {
      touched[name] = true;
      var message = checkField(name);
      setError(name, message);
      return !message;
    }

    function stepValid(n) {
      return (STEP_FIELDS[n] || []).every(function (name) { return !checkField(name); });
    }

    function validateStep(n) {
      var ok = true;
      (STEP_FIELDS[n] || []).forEach(function (name) { if (!validateField(name)) ok = false; });
      return ok;
    }

    function focusFirstInvalid(n) {
      var name = (STEP_FIELDS[n] || []).filter(function (f) { return checkField(f); })[0];
      if (!name) return;
      var box = fieldBox(name);
      if (box && !reducedMotion) {
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
      }
      var control = form.elements[name];
      if (typeof RadioNodeList !== "undefined" && control instanceof RadioNodeList) {
        control = $('input[name="' + name + '"]:checked', form) || control[0];
      }
      if (control) control.focus();
    }

    function goTo(target) {
      if (target < 1 || target > 4 || target === step) return;
      if (target > step) {
        for (var s = step; s < target; s++) {
          if (!validateStep(s)) {
            if (s !== step) show(s, "prev", false);
            focusFirstInvalid(s);
            return;
          }
        }
      }
      show(target, target > step ? "next" : "prev", true);
    }

    function show(n, dir, focus) {
      step = n;
      var panel = null;
      panels.forEach(function (p) {
        var on = Number(p.getAttribute("data-step-panel")) === n;
        p.hidden = !on;
        p.classList.remove("from-next", "from-prev");
        if (on) {
          panel = p;
          if (dir && !reducedMotion) { void p.offsetWidth; p.classList.add(dir === "next" ? "from-next" : "from-prev"); }
        }
      });
      if (n === 4) renderReview();
      updateChrome();
      if (dir) announceEl.textContent = "Paso " + n + " de 4: " + STEP_NAMES[n - 1];
      if (focus && panel) {
        $(".step-title", panel).focus({ preventScroll: true });
        var r = card.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.5) card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    }

    function updateChrome() {
      if (!bar) return;
      if (countEl) countEl.textContent = step;
      bar.style.setProperty("--wp", (step / 4).toFixed(2));
      stepBtns.forEach(function (btn) {
        var n = Number(btn.getAttribute("data-goto"));
        if (n === step) btn.setAttribute("aria-current", "step");
        else btn.removeAttribute("aria-current");
        btn.classList.toggle("is-done", n < 4 && n !== step && stepValid(n));
      });
      prevBtn.style.visibility = step === 1 ? "hidden" : "";
      nextBtn.hidden = step === 4;
    }

    function serviceName(id) {
      if (id === ADVICE.id) return "Asesoría para elegir servicio";
      var s = services.filter(function (x) { return x.id === id; })[0];
      return s ? s.name : id;
    }

    function collect() {
      return {
        name: value("customer_name").replace(/\s+/g, " "),
        phone: value("phone"),
        email: value("email"),
        service: serviceName(value("service")),
        dateISO: value("preferred_date"),
        date: formatDate(value("preferred_date")),
        time: value("preferred_time"),
        design: selectedDesign ? selectedDesign.name : "",
        notes: value("notes")
      };
    }

    function rowsFor(data) {
      var rows = [["Servicio", data.service, 1]];
      if (data.design) rows.push(["Diseño de referencia", data.design, 1]);
      rows.push(["Fecha", data.date, 2], ["Horario", data.time, 2], ["Nombre", data.name, 3], ["Teléfono", data.phone, 3]);
      if (data.email) rows.push(["Correo", data.email, 3]);
      if (data.notes) rows.push(["Tu idea", data.notes, 3]);
      return rows;
    }

    function renderReview() {
      review.innerHTML = "";
      rowsFor(collect()).forEach(function (r, i) {
        review.appendChild(el("div", { style: "--i:" + i }, [
          el("dt", { text: r[0] }),
          el("dd", null, [
            el("span", { text: r[1] || "—" }),
            el("button", { type: "button", className: "link-btn", "data-goto": r[2], "aria-label": "Cambiar " + r[0].toLowerCase(), text: "Cambiar" })
          ])
        ]));
      });
    }

    function payloadFor(data, endpoint) {
      var p = {
        "Nombre": data.name,
        "Teléfono": data.phone,
        "Servicio": data.service,
        "Fecha preferida": data.date + " (" + data.dateISO + ")",
        "Horario preferido": data.time,
        _subject: (config.booking && config.booking.subject) || "Nueva solicitud de cita"
      };
      if (data.email) { p["Correo"] = data.email; p.email = data.email; p._replyto = data.email; }
      if (data.design) p["Diseño de referencia"] = data.design;
      if (data.notes) p["Comentarios"] = data.notes;
      if (/formsubmit\.co/.test(endpoint)) { p._template = "table"; p._captcha = "false"; }
      return p;
    }

    function summary(data) {
      return el("dl", { className: "review" }, rowsFor(data).map(function (r, i) {
        return el("div", { style: "--i:" + i }, [el("dt", { text: r[0] }), el("dd", null, [el("span", { text: r[1] })])]);
      }));
    }

    function showResult(kind, data) {
      result.innerHTML = "";
      var first = data.name.split(" ")[0];
      var sent = kind === "sent";
      var demo = kind === "demo";
      var nodes = [
        el("div", {
          className: "polish" + (sent ? "" : " is-preview"),
          "aria-hidden": "true",
          html: '<span class="polish-fill"></span><svg viewBox="0 0 24 24">' +
            (sent || demo ? '<path class="draw" d="M5 12.5l4.5 4.5L19 7.5"/>' : '<path class="draw" d="M12 6.5v7M12 17v.5"/>') + "</svg>"
        }),
        sent ? null : el("p", { className: "result-badge", text: "Demostración" }),
        el("h3", { className: "result-title", text: sent || demo ? "¡Solicitud completada, " + first + "!" : "Tu solicitud está lista, " + first + "." }),
        el("p", {
          className: "result-text",
          text: sent
            ? "Recibimos tu solicitud. El estudio revisará la disponibilidad y te contactará al " + data.phone + " para confirmar tu cita. Hasta entonces, tu cita no está confirmada."
            : "Recuerda guardar tu fecha preferida y tener a mano tu diseño de referencia. El estudio te contactará para confirmar los detalles cuando reciba tu solicitud."
        }),
        summary(data),
        resetButton(sent || demo ? "Hacer otra solicitud" : "Volver al formulario", sent || demo)
      ];
      nodes.forEach(function (n) { if (n) result.appendChild(n); });
      form.hidden = true;
      result.hidden = false;
      card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      result.focus({ preventScroll: true });
    }

    function resetButton(label, clear) {
      var btn = el("button", { type: "button", className: "btn btn-pearl", html: "<span>" + label + "</span>" });
      btn.addEventListener("click", function () {
        if (clear) {
          form.reset();
          setDesign(null);
          touched = {};
          ["service", "customer_name", "phone", "email", "preferred_date", "preferred_time"].forEach(function (n) { setError(n, ""); });
          syncQuickDates();
        }
        result.hidden = true;
        form.hidden = false;
        statusBox.hidden = true;
        show(clear ? 1 : 4, clear ? "prev" : null, true);
      });
      return btn;
    }

    function setLoading(on) {
      submitBtn.classList.toggle("is-loading", on);
      submitBtn.setAttribute("aria-busy", String(on));
      $(".btn-label", submitBtn).textContent = on ? "Enviando…" : "Enviar solicitud";
    }

    function onSubmit(e) {
      e.preventDefault();
      if (step < 4) { goTo(step + 1); return; }
      statusBox.hidden = true;
      for (var s = 1; s <= 3; s++) {
        if (!validateStep(s)) {
          show(s, "prev", false);
          focusFirstInvalid(s);
          return;
        }
      }

      var data = collect();
      var endpoint = config.booking && isFilled(config.booking.endpoint) ? config.booking.endpoint.trim() : "";

      // Campo trampa lleno = bot: no se envía nada
      if (value("_gotcha")) { showResult("demo", data); return; }

      setLoading(true);
      if (!endpoint) {
        window.setTimeout(function () {
          setLoading(false);
          showResult("demo", data);
        }, reducedMotion ? 0 : 700);
        return;
      }

      var controller = "AbortController" in window ? new AbortController() : null;
      var timeout = window.setTimeout(function () { if (controller) controller.abort(); }, 15000);
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payloadFor(data, endpoint)),
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.success === false || body.success === "false") throw new Error("send-failed");
        });
      }).then(function () {
        window.clearTimeout(timeout);
        setLoading(false);
        showResult("sent", data);
      }).catch(function () {
        window.clearTimeout(timeout);
        setLoading(false);
        statusBox.innerHTML = "";
        statusBox.appendChild(el("strong", { text: "No pudimos enviar tu solicitud." }));
        statusBox.appendChild(el("p", { text: "Revisa tu conexión e inténtalo de nuevo. Tus datos siguen aquí." }));
        statusBox.hidden = false;
        statusBox.focus();
      });
    }

    function setDesign(design) {
      selectedDesign = design || null;
      if (!chip) return;
      if (selectedDesign) {
        chipImg.src = selectedDesign.image;
        chipName.textContent = selectedDesign.name;
        chip.hidden = false;
        chip.classList.remove("is-new");
        void chip.offsetWidth;
        chip.classList.add("is-new");
      } else {
        chip.hidden = true;
        chipImg.removeAttribute("src");
        chipName.textContent = "";
      }
      if (step === 4) renderReview();
    }

    function showForm() {
      if (form.hidden) { result.hidden = true; form.hidden = false; }
    }

    function focusLater(target) {
      window.setTimeout(function () { if (target) target.focus({ preventScroll: true }); }, reducedMotion ? 0 : 650);
    }

    function chooseDesign(design) {
      if (!form || !design) return;
      showForm();
      setDesign(design);
      show(1, step === 1 ? null : "prev", false);
      scrollToEl(section);
      focusLater($('input[name="service"]:checked', form) || $('input[name="service"]', form));
    }

    function chooseService(id) {
      if (!form) return;
      showForm();
      var radio = $('input[name="service"][value="' + id + '"]', form);
      if (radio) radio.checked = true;
      setError("service", "");
      show(2, step === 2 ? null : "next", false);
      announceEl.textContent = serviceName(id) + " elegido. Paso 2 de 4: " + STEP_NAMES[1];
      scrollToEl(section);
      focusLater($("#step-2-title", form));
    }

    return { init: init, chooseDesign: chooseDesign, chooseService: chooseService };
  })();

  /* ---------- Preguntas frecuentes en formato chat ---------- */
  function initChat() {
    var log = $("[data-chat-log]");
    var questions = $("[data-chat-questions]");
    if (!log || !questions || !Array.isArray(config.faq) || !config.faq.length) return;
    var answers = {};
    var queue = Promise.resolve();

    function bubble(kind, text) {
      var b = el("p", { className: "bubble bubble-" + kind, text: text });
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }
    function wait(ms) { return new Promise(function (resolve) { window.setTimeout(resolve, ms); }); }

    bubble("studio", "Hola. Estas son las dudas más comunes antes de una cita: elige una pregunta y te respondo aquí.");

    config.faq.forEach(function (item, i) {
      var btn = el("button", { type: "button", className: "chat-q", text: item.q });
      btn.addEventListener("click", function () {
        if (answers[i]) {
          var target = answers[i];
          log.scrollTop = target.offsetTop - log.offsetTop - 12;
          target.classList.remove("is-flash");
          void target.offsetWidth;
          target.classList.add("is-flash");
          return;
        }
        answers[i] = true;
        btn.classList.add("is-asked");
        queue = queue.then(function () {
          bubble("user", item.q);
          if (reducedMotion) { answers[i] = bubble("studio", item.a); return; }
          return wait(250).then(function () {
            var typing = el("p", { className: "bubble bubble-studio typing", "aria-hidden": "true", html: "<i></i><i></i><i></i>" });
            log.appendChild(typing);
            log.scrollTop = log.scrollHeight;
            return wait(600 + Math.min(900, item.a.length * 3)).then(function () {
              typing.remove();
              answers[i] = bubble("studio", item.a);
            });
          });
        });
      });
      questions.appendChild(btn);
    });
  }

  /* ---------- Contacto ---------- */
  function renderContact() {
    var list = $("[data-contact-list]");
    if (!list) return;
    var showPending = config.showPendingDetails === true;
    var addr = business.address || {};
    var ig = business.instagram || {};
    var digits = whatsappDigits();

    function group(label, icon, values, link) {
      var dds = values.filter(isFilled).map(function (v) { return el("dd", { text: v }); });
      if (link) dds.push(el("dd", null, [link]));
      if (!dds.length) {
        if (!showPending) return;
        dds.push(el("dd", { className: "pending", text: "Por confirmar" }));
      }
      list.appendChild(el("div", { className: "contact-item" }, [
        el("dt", null, [el("span", { className: "contact-icon", "aria-hidden": "true", html: ICONS[icon] }), label])
      ].concat(dds)));
    }

    function extLink(href, text) {
      return el("a", { className: "contact-link", href: href, target: "_blank", rel: "noopener", html: text + ARROW });
    }

    var cityLine = [addr.neighborhood, addr.city].filter(isFilled).join(", ");
    var stateLine = [addr.state, isFilled(addr.postalCode) ? "C.P. " + addr.postalCode : ""].filter(isFilled).join(", ");
    group("Dirección de muestra", "pin", [addr.street, cityLine, stateLine], isFilled(addr.mapsUrl) ? extLink(addr.mapsUrl, "Cómo llegar") : null);

    var hours = Array.isArray(business.hours) ? business.hours : [];
    group("Horario", "clock", hours.map(function (h) { return [h.days, h.hours].filter(isFilled).join(" · "); }));

    group("WhatsApp", "chat", digits ? [formatPhone(digits)] : [], digits ? extLink("https://wa.me/" + digits, "Escribir por WhatsApp") : null);

    var igUrl = isFilled(ig.url) ? ig.url : (isFilled(ig.handle) ? "https://www.instagram.com/" + ig.handle.replace(/^@/, "") + "/" : "");
    group("Instagram", "camera", isFilled(ig.handle) ? ["@" + ig.handle.replace(/^@/, "")] : [], igUrl ? extLink(igUrl, "Ver Instagram") : null);

    if (!list.children.length) list.hidden = true;
  }

  /* ---------- Datos estructurados (solo con datos reales) ---------- */
  function injectStructuredData() {
    var addr = business.address || {};
    var digits = whatsappDigits();
    var hasAddress = addr.isSample !== true && isFilled(addr.street) && isFilled(addr.city);
    if (!hasAddress && !digits) return;
    var data = {
      "@context": "https://schema.org",
      "@type": "NailSalon",
      name: [business.name, business.descriptor].filter(isFilled).join(" — ")
    };
    if (isFilled(business.siteUrl)) data.url = business.siteUrl;
    if (digits) data.telephone = "+" + digits;
    if (hasAddress) {
      data.address = {
        "@type": "PostalAddress",
        streetAddress: addr.street,
        addressLocality: addr.city,
        addressRegion: addr.state || undefined,
        postalCode: addr.postalCode || undefined,
        addressCountry: addr.country || "MX"
      };
    }
    var ig = business.instagram || {};
    if (isFilled(ig.url)) data.sameAs = [ig.url];
    document.head.appendChild(el("script", { type: "application/ld+json", text: JSON.stringify(data) }));
  }

  /* ---------- Cierre: el texto se llena con el scroll ---------- */
  function initFillText() {
    var span = $("[data-fill]");
    if (!span || !motion) return;
    var heading = span.parentElement;
    var closing = $("[data-closing]");
    onScroll(function () {
      var r = heading.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = clamp((vh * 0.92 - r.top) / (r.height * 0.7 + vh * 0.35), 0, 1).toFixed(3);
      span.style.setProperty("--p", p);
      if (closing) closing.style.setProperty("--cp", p);
    });
  }

  /* ---------- Inicio ---------- */
  function init() {
    var failed = false;
    function run(fn) {
      try { fn(); } catch (err) {
        failed = true;
        if (window.console && console.error) console.error(err);
      }
    }
    run(applyConfigImages);
    run(splitChars);
    run(renderServices);
    run(Gallery.init);
    run(Lightbox.init);
    run(Booking.init);
    run(initChat);
    run(renderContact);
    run(injectStructuredData);
    run(initMenu);
    run(initHeader);
    run(initActiveNav);
    run(initHero);
    run(initCursorGlow);
    run(initMagnetic);
    run(initStack);
    run(initFillText);
    run(initReveal);
    run(function () {
      var year = $("[data-year]");
      if (year) year.textContent = new Date().getFullYear();
    });

    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll);
    runScroll();

    if (failed) {
      root.classList.remove("motion");
    } else {
      window.__nacreReady = true;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { root.classList.add("is-loaded"); });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

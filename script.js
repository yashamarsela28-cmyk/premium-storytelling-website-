/* ==========================================================
   PREMIUM HEADPHONE STORYTELLING WEBSITE
   script.js
   Long-form professional vanilla JavaScript
   ========================================================== */

(() => {
  "use strict";

  /* ==========================================================
     CONFIG
     ========================================================== */
  const CONFIG = {
    navOffset: 80,
    revealThreshold: 0.15,
    counterDuration: 1800,
    enableTiltWidth: 900,
    backTopShowAt: 500,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  /* ==========================================================
     HELPERS
     ========================================================== */
  const qs = (sel, scope = document) => scope.querySelector(sel);
  const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const lerp = (start, end, amt) => start + (end - start) * amt;

  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, limit = 100) => {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const prefersReducedMotion = () => CONFIG.reducedMotion;

  /* ==========================================================
     READY
     ========================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initBodyReady();
    initSmoothAnchors();
    initNavbar();
    initHero();
    initRevealSystem();
    initCounters();
    initFAQ();
    initButtons();
    initProgressBar();
    initBackToTop();
    initGalleryTilt();
    initParallax();
    initSectionSpy();
    initKeyboardRGB();
    initResizeHandling();
  });

  /* ==========================================================
     BODY READY
     ========================================================== */
  function initBodyReady() {
    document.body.classList.add("js-ready");
  }

  /* ==========================================================
     SMOOTH SCROLL
     ========================================================== */
  function initSmoothAnchors() {
    qsa('a[href^="#"]').forEach(link => {
      link.addEventListener("click", e => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = qs(id);
        if (!target) return;

        e.preventDefault();

        const y =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          CONFIG.navOffset;

        window.scrollTo({
          top: y,
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
      });
    });
  }

  /* ==========================================================
     NAVBAR
     ========================================================== */
  function initNavbar() {
    const nav =
      qs(".navbar") ||
      qs(".header") ||
      qs("header") ||
      qs("nav");

    if (!nav) return;

    const onScroll = throttle(() => {
      const scrolled = window.scrollY > 20;

      nav.classList.toggle("is-scrolled", scrolled);
      nav.classList.toggle("is-top", !scrolled);
    }, 50);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    initMobileMenu(nav);
  }

  function initMobileMenu(nav) {
    const toggle =
      qs(".menu-toggle") ||
      qs(".nav-toggle") ||
      qs("[data-menu-toggle]");

    const menu =
      qs(".nav-menu") ||
      qs(".menu") ||
      qs(".navbar-menu");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
      toggle.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });
  }

  /* ==========================================================
     HERO
     ========================================================== */
  function initHero() {
    const hero =
      qs(".hero") ||
      qs("[class*='hero']");

    if (!hero) return;

    const title =
      qs("h1", hero) ||
      qs(".hero-title", hero);

    const subtitle =
      qs("p", hero) ||
      qs(".hero-subtitle", hero);

    const buttons = qsa(".btn, button, a.btn", hero);

    const product =
      qs(".hero-product", hero) ||
      qs(".hero-image", hero) ||
      qs("img", hero);

    if (!prefersReducedMotion()) {
      setTimeout(() => title?.classList.add("animate-in"), 120);
      setTimeout(() => subtitle?.classList.add("animate-in"), 350);

      buttons.forEach((btn, i) => {
        setTimeout(() => btn.classList.add("animate-in"), 450 + i * 130);
      });
    }

    if (product && window.innerWidth > 900) {
      hero.addEventListener("mousemove", e => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const rx = y * -8;
        const ry = x * 10;

        product.style.transform =
          `translate3d(${x * 12}px, ${y * 12}px, 0)
           rotateX(${rx}deg)
           rotateY(${ry}deg)`;
      });

      hero.addEventListener("mouseleave", () => {
        product.style.transform = "";
      });
    }
  }

  /* ==========================================================
     REVEAL SYSTEM
     ========================================================== */
  function initRevealSystem() {
    const targets = qsa(`
      section,
      .section,
      .card,
      .panel,
      .gallery-card,
      .product-card,
      [data-reveal]
    `);

    if (!targets.length) return;

    targets.forEach(el => el.classList.add("reveal-init"));

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.revealThreshold
      }
    );

    targets.forEach(el => io.observe(el));
  }

  /* ==========================================================
     COUNTERS
     ========================================================== */
  function initCounters() {
    const counters = qsa("[data-count], .counter, .stat-number");

    if (!counters.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    counters.forEach(counter => io.observe(counter));
  }

  function animateCounter(el) {
    const target =
      parseInt(el.dataset.count || el.textContent.replace(/\D/g, ""), 10) || 0;

    const suffix = el.dataset.suffix || "";
    const start = performance.now();

    function frame(now) {
      const progress = clamp(
        (now - start) / CONFIG.counterDuration,
        0,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);

      el.textContent = value + suffix;

      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ==========================================================
     FAQ
     ========================================================== */
  function initFAQ() {
    const items = qsa(".faq-item, .accordion-item, [data-faq]");

    if (!items.length) return;

    items.forEach(item => {
      const trigger =
        qs(".faq-question", item) ||
        qs(".accordion-title", item) ||
        qs("button", item) ||
        item;

      const panel =
        qs(".faq-answer", item) ||
        qs(".accordion-content", item) ||
        qs(".content", item);

      if (!trigger || !panel) return;

      trigger.setAttribute("tabindex", "0");

      const toggle = () => {
        const isOpen = item.classList.contains("open");

        items.forEach(i => i.classList.remove("open"));
        qsa(".faq-answer, .accordion-content, .content", document)
          .forEach(p => p.style.maxHeight = null);

        if (!isOpen) {
          item.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      };

      trigger.addEventListener("click", toggle);

      trigger.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ==========================================================
     BUTTON FX
     ========================================================== */
  function initButtons() {
    const buttons = qsa(".btn, button, [class*='btn']");

    buttons.forEach(btn => {
      btn.addEventListener("mouseenter", () => {
        btn.classList.add("hovered");
      });

      btn.addEventListener("mouseleave", () => {
        btn.classList.remove("hovered");
      });

      btn.addEventListener("click", e => ripple(btn, e));
    });
  }

  function ripple(btn, e) {
    const circle = document.createElement("span");
    circle.className = "ripple";

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    circle.style.width = size + "px";
    circle.style.height = size + "px";
    circle.style.left = e.clientX - rect.left - size / 2 + "px";
    circle.style.top = e.clientY - rect.top - size / 2 + "px";

    btn.appendChild(circle);

    setTimeout(() => circle.remove(), 650);
  }

  /* ==========================================================
     PROGRESS BAR
     ========================================================== */
  function initProgressBar() {
    let bar = qs(".scroll-progress");

    if (!bar) {
      bar = document.createElement("div");
      bar.className = "scroll-progress";
      document.body.appendChild(bar);
    }

    const onScroll = throttle(() => {
      const h =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress = h > 0 ? (window.scrollY / h) * 100 : 0;

      bar.style.width = progress + "%";
    }, 10);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ==========================================================
     BACK TO TOP
     ========================================================== */
  function initBackToTop() {
    let btn = qs(".back-to-top");

    if (!btn) {
      btn = document.createElement("button");
      btn.className = "back-to-top";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = "↑";
      document.body.appendChild(btn);
    }

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });

    const onScroll = throttle(() => {
      btn.classList.toggle(
        "visible",
        window.scrollY > CONFIG.backTopShowAt
      );
    }, 50);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ==========================================================
     GALLERY TILT
     ========================================================== */
  function initGalleryTilt() {
    if (window.innerWidth < CONFIG.enableTiltWidth) return;

    const cards = qsa(".gallery-card, .card, .product-card");

    cards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const rx = y * -8;
        const ry = x * 10;

        card.style.transform =
          `perspective(1000px)
           rotateX(${rx}deg)
           rotateY(${ry}deg)
           translateY(-6px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ==========================================================
     PARALLAX
     ========================================================== */
  function initParallax() {
    const layers = qsa("[data-parallax], .parallax");

    if (!layers.length || prefersReducedMotion()) return;

    const onScroll = throttle(() => {
      const scrollY = window.scrollY;

      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.parallax || 0.2);
        layer.style.transform =
          `translate3d(0, ${scrollY * speed}px, 0)`;
      });
    }, 16);

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ==========================================================
     SECTION SPY
     ========================================================== */
  function initSectionSpy() {
    const sections = qsa("section[id]");
    const links = qsa('nav a[href^="#"], .navbar a[href^="#"]');

    if (!sections.length || !links.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;

          links.forEach(link => {
            const active =
              link.getAttribute("href") === `#${id}`;

            link.classList.toggle("active", active);
          });
        });
      },
      { threshold: 0.55 }
    );

    sections.forEach(sec => io.observe(sec));
  }

  /* ==========================================================
     RGB EASTER EGG
     Type: rgb
     ========================================================== */
  function initKeyboardRGB() {
    let typed = "";

    document.addEventListener("keydown", e => {
      typed += e.key.toLowerCase();
      typed = typed.slice(-3);

      if (typed === "rgb") {
        document.body.classList.toggle("rgb-mode");
      }
    });
  }

  /* ==========================================================
     RESIZE
     ========================================================== */
  function initResizeHandling() {
    window.addEventListener(
      "resize",
      debounce(() => {
        document.body.classList.add("resizing");

        setTimeout(() => {
          document.body.classList.remove("resizing");
        }, 200);
      }, 150)
    );
  }
})();

/* =========================
   Advanced Scroll Pack
   ========================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = $(".header");
const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);

function smoothScrollTo(targetEl) {
  const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset() - 12;
  window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
}
/* Mobile menu toggle */
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  // Close menu when clicking a link
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    });
  });
}

/* Anchor smooth scroll with header offset */
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const el = document.querySelector(href);
    if (!el) return;

    e.preventDefault();
    smoothScrollTo(el);
    history.pushState(null, "", href);
  });
});

/* Scroll progress bar */
(function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.innerHTML = `<span class="scroll-progress__bar" aria-hidden="true"></span>`;
  document.body.appendChild(bar);

  const inner = $(".scroll-progress__bar", bar);

  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    inner.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* Back to top */
(function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "↑";
  document.body.appendChild(btn);

  const toggle = () => {
    btn.classList.toggle("back-to-top--show", window.scrollY > 600);
  };

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
})();

/* Scroll Spy */
(function initScrollSpy() {
  const navLinks = $$(".nav__link");
  if (!navLinks.length) return;

  const sections = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((h) => h && h.startsWith("#"))
    .map((h) => document.querySelector(h))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
    });
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(visible.target.id);
      },
      { rootMargin: `-${headerOffset() + 20}px 0px -55% 0px`, threshold: [0.2, 0.35, 0.5, 0.65] }
    );

    sections.forEach((s) => obs.observe(s));
  }
})();

/* Reveal on scroll */
(function initReveal() {
  if (prefersReducedMotion) return;

  const revealTargets = [
    ...$$(".hero__content, .hero__visual"),
    ...$$(".card"),
    ...$$(".photo-card"),
    ...$$(".about__content, .contact__copy, .form"),
    ...$$(".section-title"),
    ...$$(".about__profile")
  ];

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("reveal--in"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal--in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  revealTargets.forEach((el) => obs.observe(el));
})();

/* Contact form validation */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const required = ["firstName", "lastName", "email", "subject", "message"];
    const missing = required.filter((k) => !String(data.get(k) || "").trim());
    const email = String(data.get("email") || "").trim();

    if (missing.length) {
      statusEl.textContent = "Please fill all fields before submitting.";
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      statusEl.textContent = "Please enter a valid email address.";
      return;
    }

    statusEl.textContent = "Thank you! Your message has been sent.";
    form.reset();

    setTimeout(() => (statusEl.textContent = ""), 3500);
  });
}

/* Floating widget -> contact */
document.querySelector(".floating-widget")?.addEventListener("click", () => {
  const contact = document.getElementById("contact");
  if (contact) smoothScrollTo(contact);
});

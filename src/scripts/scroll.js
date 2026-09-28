/*
 * Scroll system: Lenis smooth scroll + GSAP ScrollTrigger choreography.
 * Everything here is enhancement. Default HTML/CSS state is final and
 * readable; nothing is hidden unless this script is running, and
 * prefers-reduced-motion skips all of it except the nav state.
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Nav: solid after the fold edge, hides on scroll-down ---------- */
const nav = document.querySelector("[data-nav]");
let lastY = window.scrollY;
function navState(y) {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", y > 24);
  const goingDown = y > lastY + 2;
  const goingUp = y < lastY - 2;
  if (goingDown && y > 320) nav.classList.add("is-hidden");
  else if (goingUp || y < 120) nav.classList.remove("is-hidden");
  lastY = y;
}
navState(window.scrollY);
/* Keyboard users must always see the nav when focus lands in it */
nav?.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

if (reduce) {
  window.addEventListener("scroll", () => navState(window.scrollY), { passive: true });
} else {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
  lenis.on("scroll", (e) => {
    ScrollTrigger.update();
    navState(e.scroll);
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  /* In-page anchors (skip link etc.) go through Lenis */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id && id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Growth type: headings widen from condensed as they enter ---------- */
  gsap.utils.toArray("[data-stretch]").forEach((el) => {
    gsap.fromTo(
      el,
      { fontStretch: "68%" },
      {
        fontStretch: "125%",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          end: "top 55%",
          scrub: 0.6,
        },
      },
    );
  });

  /* ---------- Ticker: scroll velocity pushes the marquee ---------- */
  document.querySelectorAll("[data-ticker]").forEach((band) => {
    const track = band.querySelector(".ticker-track");
    if (!track) return;
    let x = 0;
    let dir = -1;
    let boost = 0;
    lenis.on("scroll", (e) => {
      boost = Math.min(Math.abs(e.velocity) * 0.6, 14);
      if (e.direction) dir = e.direction === 1 ? -1 : 1;
    });
    gsap.ticker.add(() => {
      const half = track.scrollWidth / 2;
      if (!half) return;
      x += dir * (0.55 + boost);
      boost *= 0.92;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
    band.classList.add("is-driven");
  });

  /* ---------- Metrics: rows wipe in, numerals widen ---------- */
  gsap.utils.toArray("[data-metric-row]").forEach((row) => {
    const fig = row.querySelector(".stat");
    const bar = row.querySelector(".m-bar i");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: "top 85%", toggleActions: "play none none none" },
    });
    tl.from(row, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.out" });
    if (fig) tl.from(fig, { fontStretch: "70%", duration: 1.3, ease: "expo.out" }, 0);
    if (bar) tl.from(bar, { scaleX: 0, duration: 1.4, ease: "expo.out" }, 0.15);
  });

  /* ---------- Services: stacked panels tip back as the next one lands ---------- */
  const panels = gsap.utils.toArray("[data-stack] > .svc");
  panels.forEach((panel, i) => {
    if (i === panels.length - 1) return;
    gsap.fromTo(panel, { scale: 1, rotateX: 0, filter: "brightness(1)" }, {
      scale: 0.92,
      rotateX: 8,
      filter: "brightness(0.8)",
      ease: "none",
      scrollTrigger: {
        trigger: panels[i + 1],
        start: "top bottom",
        end: "top 20%",
        scrub: true,
      },
    });
  });

  /* ---------- Quotes: gentle counter-rotation while passing ---------- */
  gsap.utils.toArray("[data-drift]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { rotate: i % 2 ? 3 : -3, y: 40 },
      {
        rotate: i % 2 ? -1 : 1,
        y: -20,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  /* ---------- Footer: giant name rises and widens into view ---------- */
  const giant = document.querySelector("[data-giant]");
  if (giant) {
    gsap.fromTo(
      giant,
      { yPercent: 40, fontStretch: "62%" },
      {
        yPercent: 0,
        fontStretch: "125%",
        ease: "none",
        scrollTrigger: { trigger: giant, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
      },
    );
  }

  /* Fonts change widths; re-measure once they land */
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* ---------- Work ledger: cursor-following preview (fine pointer only) ---------- */
const preview = document.querySelector("[data-preview]");
if (preview && finePointer) {
  const rows = document.querySelectorAll("[data-preview-row]");
  const title = preview.querySelector("[data-pv-teaser]");
  const tag = preview.querySelector("[data-pv-tag]");
  let px = 0,
    py = 0,
    tx = 0,
    ty = 0,
    raf = 0;
  const loop = () => {
    px += (tx - px) * 0.18;
    py += (ty - py) * 0.18;
    preview.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${(tx - px) * 0.04}deg)`;
    raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  const move = (e) => {
    tx = e.clientX + 24;
    ty = e.clientY - preview.offsetHeight / 2;
    if (!raf) raf = requestAnimationFrame(loop);
  };
  rows.forEach((row) => {
    row.addEventListener("pointerenter", (e) => {
      if (title) title.textContent = row.getAttribute("data-teaser") || "";
      if (tag) tag.textContent = row.getAttribute("data-tag") || "";
      if (!preview.classList.contains("is-on")) {
        px = tx = e.clientX + 24;
        py = ty = e.clientY - preview.offsetHeight / 2;
      }
      preview.classList.add("is-on");
    });
    row.addEventListener("pointermove", move);
    row.addEventListener("pointerleave", () => preview.classList.remove("is-on"));
  });
}

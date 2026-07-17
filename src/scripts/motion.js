/*
 * Count-up metrics + pointer 3D tilt.
 * HTML ships final values; these only run with JS, fine pointers,
 * and no reduced-motion preference. No-JS users see finished states.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Count-up on scroll into view ---- */
  var counters = document.querySelectorAll("[data-countup]");
  if (!reduce && counters.length && "IntersectionObserver" in window) {
    var fmt = function (el, n) {
      var v = Math.round(n);
      el.textContent =
        el.getAttribute("data-format") === "comma"
          ? v.toLocaleString("en-US")
          : String(v);
    };
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-target"));
      if (!isFinite(target)) return;
      var t0 = null;
      var dur = 1200;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4); /* ease-out quart */
        fmt(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      fmt(el, 0);
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  }

  /* ---- Pointer-tracking 3D tilt ---- */
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!reduce && finePointer) {
    var MAX = 6; /* degrees */
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.willChange = "transform";
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(700px) rotateX(" +
          (-y * MAX).toFixed(2) +
          "deg) rotateY(" +
          (x * MAX).toFixed(2) +
          "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }
})();

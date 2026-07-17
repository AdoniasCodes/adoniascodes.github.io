/*
 * Scroll reveals + hero rise. Content is fully visible without JS;
 * the `.js` class (added inline in Base.astro before first paint)
 * arms the CSS gate, and reduced-motion CSS overrides everything.
 */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Arm the hero rise on the next paint frames rather than window load,
     so slow asset loads never keep the hero hidden. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add("loaded");
    });
  });

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        return; /* already on screen: never hide it */
      }
      el.classList.add("will-reveal");
      io.observe(el);
    });
  }
})();

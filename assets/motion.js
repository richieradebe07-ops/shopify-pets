/**
 * RL Paws Co. — shared motion utilities: scroll-reveal and magnetic buttons.
 * Everything here is transform/opacity only and fully gated behind
 * prefers-reduced-motion: reduce.
 */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Scroll reveal ---- */
  var revealTargets = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---- Magnetic buttons ---- */
  if (!reduceMotion && canHover) {
    var RADIUS = 40;
    var STRENGTH = 0.35;

    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        var distance = Math.sqrt(relX * relX + relY * relY);

        if (distance < RADIUS + rect.width / 2) {
          btn.style.transform =
            'translate3d(' + relX * STRENGTH + 'px,' + relY * STRENGTH + 'px,0)';
        }
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
})();

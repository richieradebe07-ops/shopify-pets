(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function formatValue(value, decimals) {
    return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function setFinal(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var decimals = parseInt(el.dataset.decimals, 10) || 0;
    el.textContent = formatValue(target, decimals);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(setFinal);
    return;
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var decimals = parseInt(el.dataset.decimals, 10) || 0;
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target * eased, decimals);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
})();

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-announcement-bar]').forEach(function (bar) {
    var storageKey = bar.dataset.storageKey;
    var dismissed = false;
    try {
      dismissed = sessionStorage.getItem(storageKey) === '1';
    } catch (e) {
      dismissed = false;
    }

    if (dismissed) {
      bar.hidden = true;
      return;
    }

    var dismissBtn = bar.querySelector('[data-announcement-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        bar.hidden = true;
        try {
          sessionStorage.setItem(storageKey, '1');
        } catch (e) {
          /* storage unavailable — dismissal just won't persist */
        }
      });
    }

    var items = bar.querySelectorAll('[data-announcement-item]');
    if (items.length < 2 || reduceMotion) return;

    var track = bar.querySelector('[data-announcement-track]');
    var interval = parseInt(bar.dataset.rotateSeconds, 10) || 5;
    var current = 0;
    var timer;

    function advance() {
      items[current].classList.remove('is-active');
      current = (current + 1) % items.length;
      items[current].classList.add('is-active');
    }

    function start() {
      timer = window.setInterval(advance, interval * 1000);
    }

    function stop() {
      window.clearInterval(timer);
    }

    start();
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
  });
})();

(function () {
  document.querySelectorAll('[data-carousel-track]').forEach(function (track) {
    var wrapper = track.closest('.testimonial-carousel');
    if (!wrapper) return;

    var prevBtn = wrapper.querySelector('[data-carousel-prev]');
    var nextBtn = wrapper.querySelector('[data-carousel-next]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function scrollByCard(direction) {
      var card = track.querySelector('[data-carousel-slide]');
      if (!card) return;
      var amount = card.getBoundingClientRect().width + 16;
      track.scrollBy({
        left: amount * direction,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollByCard(1); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') scrollByCard(1);
      if (e.key === 'ArrowLeft') scrollByCard(-1);
    });
  });
})();

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reduceMotion || !canHover) return;

  var MAX_TILT = 6;

  document.querySelectorAll('[data-tilt-card]').forEach(function (card) {
    var media = card.querySelector('.product-card__media');
    if (!media) return;

    card.addEventListener('mousemove', function (e) {
      var rect = media.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var rotateY = (px - 0.5) * MAX_TILT * 2;
      var rotateX = (0.5 - py) * MAX_TILT * 2;
      media.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      media.style.transform = 'rotateX(0) rotateY(0)';
    });
  });
})();

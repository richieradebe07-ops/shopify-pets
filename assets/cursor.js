/**
 * RL Paws Co. — custom paw cursor (desktop, fine-pointer only).
 * Never runs on touch devices or under prefers-reduced-motion: reduce.
 * Pure transform-based trailing; never calls preventDefault, so it can
 * never block or delay a click.
 */
(function () {
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canHover || reduceMotion) return;

  var PAW_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
    '<ellipse cx="12" cy="15.5" rx="5.4" ry="4.6"/>' +
    '<ellipse cx="5.6" cy="9.2" rx="2.1" ry="2.6" transform="rotate(-18 5.6 9.2)"/>' +
    '<ellipse cx="10.2" cy="5.6" rx="2.2" ry="2.8" transform="rotate(-6 10.2 5.6)"/>' +
    '<ellipse cx="14.6" cy="5.4" rx="2.2" ry="2.8" transform="rotate(6 14.6 5.4)"/>' +
    '<ellipse cx="18.6" cy="8.8" rx="2.1" ry="2.6" transform="rotate(18 18.6 8.8)"/>' +
    '</svg>';

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.innerHTML = PAW_SVG;

  var ring = document.createElement('div');
  ring.className = 'cursor-ring';

  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add('has-custom-cursor');

  var mouseX = -100;
  var mouseY = -100;
  var ringX = -100;
  var ringY = -100;
  var LERP = 0.15;
  var hasMoved = false;

  var INTERACTIVE_SELECTOR =
    'a, button, [role="button"], input[type="submit"], input[type="button"], .btn, summary';
  var FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

  window.addEventListener(
    'mousemove',
    function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;

      dot.style.transform = 'translate3d(' + (mouseX - 10) + 'px,' + (mouseY - 10) + 'px,0)';

      var overField = e.target.closest && e.target.closest(FIELD_SELECTOR);
      dot.classList.toggle('is-hidden-field', !!overField);
      ring.classList.toggle('is-hidden-field', !!overField);

      var overInteractive = e.target.closest && e.target.closest(INTERACTIVE_SELECTOR);
      ring.classList.toggle('is-active', !!overInteractive && !overField);
    },
    { passive: true }
  );

  window.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  window.addEventListener('mouseenter', function () {
    dot.style.opacity = '';
    ring.style.opacity = '';
  });

  function tick() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    if (hasMoved) {
      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

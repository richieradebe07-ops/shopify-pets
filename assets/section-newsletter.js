(function () {
  document.querySelectorAll('.newsletter__form').forEach(function (form) {
    var input = form.querySelector('[data-newsletter-input]');
    var error = form.querySelector('[data-newsletter-error]');
    if (!input || !error) return;

    form.addEventListener('submit', function (e) {
      if (!input.checkValidity()) {
        e.preventDefault();
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    });

    input.addEventListener('input', function () {
      if (!error.hidden) {
        error.hidden = true;
        input.removeAttribute('aria-invalid');
      }
    });
  });
})();

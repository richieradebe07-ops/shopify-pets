(function () {
  var header = document.querySelector('[data-site-header]');
  if (!header) return;

  /* ---- Sticky shrink + blur ---- */
  if (header.hasAttribute('data-sticky-shrink')) {
    var SCROLL_THRESHOLD = 8;
    var ticking = false;

    function updateScrolled() {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(updateScrolled);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateScrolled();
  }

  /* ---- Mobile nav drawer ---- */
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backdrop = document.querySelector('[data-mobile-nav-backdrop]');
  var navToggle = document.querySelector('[data-mobile-nav-toggle]');
  var navClose = document.querySelector('[data-mobile-nav-close]');

  function openMobileNav() {
    mobileNav.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      mobileNav.classList.add('is-open');
      backdrop.classList.add('is-open');
    });
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var firstFocusable = mobileNav.querySelector('a, button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      mobileNav.hidden = true;
      backdrop.hidden = true;
    }, 320);
    navToggle.focus();
  }

  if (mobileNav && navToggle) {
    navToggle.addEventListener('click', openMobileNav);
    if (navClose) navClose.addEventListener('click', closeMobileNav);
    backdrop.addEventListener('click', closeMobileNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  }

  /* ---- Search panel + lightweight predictive search ---- */
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      var isHidden = searchPanel.hasAttribute('hidden');
      if (isHidden) {
        searchPanel.hidden = false;
        searchToggle.setAttribute('aria-expanded', 'true');
        var input = searchPanel.querySelector('[data-search-input]');
        if (input) input.focus();
      } else {
        searchPanel.hidden = true;
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });

    var searchInput = searchPanel.querySelector('[data-search-input]');
    var resultsEl = searchPanel.querySelector('[data-search-results]');
    var debounceTimer;

    if (searchInput && resultsEl && window.fetch) {
      searchInput.addEventListener('input', function () {
        var query = searchInput.value.trim();
        window.clearTimeout(debounceTimer);

        if (query.length < 2) {
          resultsEl.hidden = true;
          resultsEl.innerHTML = '';
          return;
        }

        debounceTimer = window.setTimeout(function () {
          fetch(
            '/search/suggest.json?q=' +
              encodeURIComponent(query) +
              '&resources[type]=product&resources[limit]=5&resources[options][fields]=title,product_type'
          )
            .then(function (res) {
              return res.json();
            })
            .then(function (data) {
              var products =
                (data.resources && data.resources.results && data.resources.results.products) || [];
              if (!products.length) {
                resultsEl.hidden = true;
                resultsEl.innerHTML = '';
                return;
              }
              resultsEl.innerHTML = products
                .map(function (p) {
                  return (
                    '<a class="search-result" href="' +
                    p.url +
                    '">' +
                    (p.image ? '<img src="' + p.image + '" alt="" width="48" height="48">' : '') +
                    '<span class="search-result__meta"><span>' +
                    p.title +
                    '</span><span class="search-result__price">' +
                    p.price +
                    '</span></span></a>'
                  );
                })
                .join('');
              resultsEl.hidden = false;
            })
            .catch(function () {
              /* predictive search is a progressive enhancement — full
                 results page (form submit) still works without it */
            });
        }, 220);
      });
    }
  }
})();

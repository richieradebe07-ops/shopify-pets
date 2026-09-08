(function () {
  var section = document.querySelector('[data-product-section]');
  if (!section) return;

  var variantsEl = document.querySelector('[data-product-variants]');
  var variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];

  /* ---- Variant pills ---- */
  var pills = section.querySelectorAll('[data-option-pill]');
  var variantIdInput = section.querySelector('[data-selected-variant-id]');
  var priceEl = section.querySelector('[data-product-price]');
  var priceCurrentEl = section.querySelector('[data-price-current]');
  var priceCompareEl = section.querySelector('[data-price-compare]');
  var addToCartBtn = section.querySelector('[data-add-to-cart-btn]');
  var addToCartLabel = section.querySelector('[data-add-to-cart-label]');
  var mainImage = section.querySelector('[data-gallery-main-image]');

  function getSelectedOptions() {
    var groups = {};
    pills.forEach(function (pill) {
      if (pill.classList.contains('is-selected')) {
        groups[pill.dataset.optionIndex] = pill.dataset.value;
      }
    });
    var maxIndex = Math.max.apply(
      null,
      Array.prototype.map.call(pills, function (p) {
        return parseInt(p.dataset.optionIndex, 10);
      })
    );
    var options = [];
    for (var i = 0; i <= maxIndex; i++) {
      options.push(groups[i]);
    }
    return options;
  }

  function findMatchingVariant(options) {
    return variants.filter(function (v) {
      return options.every(function (opt, i) {
        return opt === undefined || v.options[i] === opt;
      });
    })[0];
  }

  function updateForVariant(variant) {
    if (!variant) return;

    if (variantIdInput) variantIdInput.value = variant.id;

    if (priceCurrentEl) priceCurrentEl.textContent = variant.price_formatted;
    if (priceCompareEl) {
      if (variant.compare_at_price > variant.price) {
        priceCompareEl.textContent = variant.compare_at_price_formatted;
        priceCompareEl.hidden = false;
        priceEl.classList.add('is-on-sale');
      } else {
        priceCompareEl.hidden = true;
        priceEl.classList.remove('is-on-sale');
      }
    }

    if (addToCartBtn) {
      addToCartBtn.disabled = !variant.available;
    }
    if (addToCartLabel) {
      addToCartLabel.textContent = variant.available
        ? addToCartLabel.dataset.available || addToCartLabel.textContent
        : addToCartLabel.dataset.soldOut || 'Sold out';
    }

    if (mainImage && variant.featured_image) {
      mainImage.src = variant.featured_image;
    }

    if (window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }

    var stickyPrice = document.querySelector('[data-sticky-price]');
    if (stickyPrice) stickyPrice.textContent = variant.price_formatted;
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var groupPills = section.querySelectorAll(
        '[data-option-pill][data-option-index="' + pill.dataset.optionIndex + '"]'
      );
      groupPills.forEach(function (p) {
        p.classList.remove('is-selected');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('is-selected');
      pill.setAttribute('aria-checked', 'true');

      var match = findMatchingVariant(getSelectedOptions());
      if (match) updateForVariant(match);
    });
  });

  /* ---- Quantity stepper ---- */
  var qtyInput = section.querySelector('[data-qty-input]');
  var qtyDecrease = section.querySelector('[data-qty-decrease]');
  var qtyIncrease = section.querySelector('[data-qty-increase]');

  if (qtyInput && qtyDecrease && qtyIncrease) {
    qtyDecrease.addEventListener('click', function () {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });
    qtyIncrease.addEventListener('click', function () {
      qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });
  }

  /* ---- Gallery: thumbnails + lightbox ---- */
  var thumbs = section.querySelectorAll('[data-gallery-thumb]');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      thumbs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-current', 'false');
      });
      thumb.classList.add('is-active');
      thumb.setAttribute('aria-current', 'true');
      if (mainImage) mainImage.src = thumb.dataset.fullSrc;
    });
  });

  var lightbox = section.querySelector('[data-gallery-lightbox]');
  var lightboxImage = section.querySelector('[data-gallery-lightbox-image]');
  var lightboxTrigger = section.querySelector('[data-gallery-main-trigger]');
  var lightboxClose = section.querySelector('[data-gallery-lightbox-close]');

  if (lightbox && lightboxImage && lightboxTrigger) {
    lightboxTrigger.addEventListener('click', function () {
      lightboxImage.src = mainImage ? mainImage.src : '';
      lightbox.hidden = false;
    });
    if (lightboxClose) {
      lightboxClose.addEventListener('click', function () {
        lightbox.hidden = true;
      });
    }
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) lightbox.hidden = true;
    });
  }

  /* ---- Delivery estimate ---- */
  var deliveryEl = section.querySelector('[data-delivery-estimate]');
  if (deliveryEl) {
    var minDays = parseInt(deliveryEl.dataset.minDays, 10) || 2;
    var maxDays = parseInt(deliveryEl.dataset.maxDays, 10) || 5;

    function addBusinessDays(date, days) {
      var result = new Date(date);
      var added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        var day = result.getDay();
        if (day !== 0 && day !== 6) added++;
      }
      return result;
    }

    var formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    var minDate = formatter.format(addBusinessDays(new Date(), minDays));
    var maxDate = formatter.format(addBusinessDays(new Date(), maxDays));
    var textEl = deliveryEl.querySelector('[data-delivery-estimate-text]');
    if (textEl) {
      textEl.textContent =
        deliveryEl.dataset.prefix + ' ' + minDate + ' – ' + maxDate + ' ' + deliveryEl.dataset.suffix;
    }
  }

  /* ---- Sticky add-to-cart bar ---- */
  var stickyBar = document.querySelector('[data-sticky-atc]');
  if (stickyBar && addToCartBtn && 'IntersectionObserver' in window) {
    var stickyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          stickyBar.hidden = false;
          stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    stickyObserver.observe(addToCartBtn);

    var stickyAddBtn = stickyBar.querySelector('[data-sticky-add-to-cart]');
    if (stickyAddBtn) {
      stickyAddBtn.addEventListener('click', function () {
        var form = section.querySelector('#ProductForm');
        if (form && form.requestSubmit) {
          form.requestSubmit();
        } else if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }
  }

  /* ---- Frequently bought together ---- */
  var fbtGrid = section.querySelector('[data-fbt-grid]');
  if (fbtGrid) {
    var fbtCheckboxes = fbtGrid.querySelectorAll('[data-fbt-checkbox]');
    var fbtTotalEl = section.querySelector('[data-fbt-total]');
    var fbtAddAllBtn = section.querySelector('[data-fbt-add-all]');
    var basePrice = parseInt(fbtGrid.dataset.currentPrice, 10) || 0;

    function formatCents(cents) {
      var amount = cents / 100;
      return window.Intl
        ? new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
        : amount.toFixed(2);
    }

    function updateFbtTotal() {
      var total = basePrice;
      fbtCheckboxes.forEach(function (cb) {
        if (cb.checked) total += parseInt(cb.dataset.price, 10) || 0;
      });
      if (fbtTotalEl) {
        var currencyPrefix = (priceCurrentEl && priceCurrentEl.textContent.match(/^[^\d]*/)[0]) || 'R';
        fbtTotalEl.textContent = currencyPrefix + formatCents(total);
      }
    }

    fbtCheckboxes.forEach(function (cb) {
      cb.addEventListener('change', updateFbtTotal);
    });

    if (fbtAddAllBtn) {
      fbtAddAllBtn.addEventListener('click', function () {
        var items = [{ id: variantIdInput ? variantIdInput.value : null, quantity: 1 }];
        fbtCheckboxes.forEach(function (cb) {
          if (cb.checked) items.push({ id: cb.dataset.variantId, quantity: 1 });
        });

        fbtAddAllBtn.disabled = true;
        fbtAddAllBtn.classList.add('is-loading');

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items, sections: 'cart-drawer' }),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            var drawer = document.getElementById('CartDrawer');
            if (drawer && data.sections && data.sections['cart-drawer']) {
              var fresh = new DOMParser()
                .parseFromString(data.sections['cart-drawer'], 'text/html')
                .querySelector('#CartDrawer');
              if (fresh) drawer.innerHTML = fresh.innerHTML;
            }
            return fetch('/cart.js').then(function (r) { return r.json(); });
          })
          .then(function (cart) {
            document.querySelectorAll('[data-cart-count]').forEach(function (el) {
              el.textContent = cart.item_count;
              el.hidden = cart.item_count === 0;
            });
            if (window.RLPawsCart) window.RLPawsCart.open();
          })
          .finally(function () {
            fbtAddAllBtn.disabled = false;
            fbtAddAllBtn.classList.remove('is-loading');
          });
      });
    }
  }
})();

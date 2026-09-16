/**
 * RL Paws Co. — global Ajax cart controller.
 * Owns the cart drawer's open/close state and every cart mutation
 * (add / change quantity / remove), using Shopify's Ajax Cart API with
 * the `sections` param so the drawer's own Liquid markup renders the
 * result — no client-side templating of cart line items.
 */
(function () {
  var drawer = document.getElementById('CartDrawer');
  var backdrop = document.querySelector('[data-cart-drawer-backdrop]');
  if (!drawer || !backdrop) return;

  var openTriggers = document.querySelectorAll('[data-cart-drawer-toggle]');

  function parseSection(html, selector) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector(selector);
  }

  function setBusy(isBusy) {
    drawer.classList.toggle('is-loading', isBusy);
    drawer.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function renderDrawer(response) {
    if (response.sections && response.sections['cart-drawer']) {
      var fresh = parseSection(response.sections['cart-drawer'], '#CartDrawer');
      if (fresh) drawer.innerHTML = fresh.innerHTML;
    }
    if (typeof response.item_count === 'number') {
      updateCartCount(response.item_count);
    }
  }

  function openDrawer() {
    drawer.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    openTriggers.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
    });
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    openTriggers.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    window.setTimeout(function () {
      drawer.hidden = true;
      backdrop.hidden = true;
    }, 320);
  }

  openTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-drawer-close]') || e.target === backdrop) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ---- Mutations ---- */

  function changeLine(line, quantity) {
    setBusy(true);
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity, sections: 'cart-drawer' }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(renderDrawer)
      .finally(function () {
        setBusy(false);
      });
  }

  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-cart-item]');
    if (!item) return;
    var line = parseInt(item.dataset.line, 10);

    if (e.target.closest('[data-cart-qty-increase]')) {
      var qtyEl = item.querySelector('[data-cart-qty]');
      changeLine(line, parseInt(qtyEl.textContent, 10) + 1);
    } else if (e.target.closest('[data-cart-qty-decrease]')) {
      var currentQty = parseInt(item.querySelector('[data-cart-qty]').textContent, 10);
      changeLine(line, Math.max(0, currentQty - 1));
    } else if (e.target.closest('[data-cart-remove]')) {
      changeLine(line, 0);
    }
  });

  /* ---- Add to cart: product forms + quick-add buttons ---- */

  function addToCart(formData, options) {
    options = options || {};
    formData.append('sections', 'cart-drawer');

    return fetch('/cart/add.js', { method: 'POST', body: formData })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (err) { throw err; });
        return res.json();
      })
      .then(function (item) {
        return fetch('/cart.js')
          .then(function (res) { return res.json(); })
          .then(function (cart) {
            renderDrawer({ sections: item.sections, item_count: cart.item_count });
            if (!options.silent) openDrawer();
          });
      });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-cart-add-form], .product__form');
    if (!form) return;
    e.preventDefault();

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setBusy(true);

    addToCart(new FormData(form))
      .catch(function (err) {
        var errorEl = form.querySelector('[data-cart-form-error]');
        if (errorEl) {
          errorEl.textContent = (err && err.description) || 'Could not add this item to your cart.';
          errorEl.hidden = false;
        }
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
        setBusy(false);
      });
  });

  document.addEventListener('click', function (e) {
    var quickAdd = e.target.closest('[data-quick-add]');
    if (!quickAdd || quickAdd.disabled) return;

    var variantId = quickAdd.dataset.variantId;
    if (!variantId) return;

    var formData = new FormData();
    formData.append('id', variantId);
    formData.append('quantity', 1);

    quickAdd.disabled = true;
    quickAdd.classList.add('is-loading');

    addToCart(formData)
      .catch(function () {
        quickAdd.classList.add('is-error');
        window.setTimeout(function () {
          quickAdd.classList.remove('is-error');
        }, 1600);
      })
      .finally(function () {
        quickAdd.disabled = false;
        quickAdd.classList.remove('is-loading');
      });
  });

  window.RLPawsCart = { open: openDrawer, close: closeDrawer, addToCart: addToCart };
})();

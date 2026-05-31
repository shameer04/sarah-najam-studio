"use strict";
/* ============================================================
   Sarah najam Studio — script.js
   ============================================================ */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const pkr = n => `PKR ${Number(n).toLocaleString('en-PK')}`;

// Sanitize user input to prevent XSS
function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const SHIPPING = 250; // flat rate PKR
const SUPABASE_URL = 'https://ixmdcwcswmwcwjrtyuoy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_J4xkUnkTBUinqXdXIH2IGg_8mhAM5O3';


/* ── Loader ────────────────────────────────────────────────── */
(function () {
  const loader = $('#loader');
  if (!loader) return;
  const start = Date.now();
  function hide() { const wait = Math.max(0, 1600 - (Date.now() - start)); setTimeout(() => loader.classList.add('hidden'), wait); }
  document.readyState === 'complete' ? hide() : window.addEventListener('load', hide);
  setTimeout(() => loader.classList.add('hidden'), 3000);
})();

/* ── Navbar: solid on pages without a hero ─────────────────── */
(function () {
  const nav = $('#navbar');
  if (!nav) return;
  const hasHero = !!document.querySelector('.hero');
  if (!hasHero) nav.classList.add('scrolled');
  const fn = () => { if (hasHero) nav.classList.toggle('scrolled', window.scrollY > 60); };
  window.addEventListener('scroll', fn, { passive: true });
  fn();
})();

/* ── Mobile menu ───────────────────────────────────────────── */
(function () {
  const btn = $('#hamburger'), menu = $('#mobileMenu'), overlay = $('#mobileOverlay'), close = $('#mobileClose');
  if (!btn || !menu) return;
  const open = () => { menu.classList.add('open'); overlay && overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const shut = () => { menu.classList.remove('open'); overlay && overlay.classList.remove('active'); document.body.style.overflow = ''; };
  btn.addEventListener('click', open);
  close && close.addEventListener('click', shut);
  overlay && overlay.addEventListener('click', shut);
  document.addEventListener('keydown', e => e.key === 'Escape' && shut());
  $$('a', menu).forEach(a => a.addEventListener('click', shut));
  const shopRow = $('#mobileShopRow'), shopSub = $('#mobileShopSub');
  if (shopRow && shopSub) shopRow.addEventListener('click', () => { shopRow.classList.toggle('open'); shopSub.classList.toggle('open'); });
})();

/* ── Desktop shop dropdown ─────────────────────────────────── */
(function () {
  const parent = $('.shop-parent');
  if (!parent) return;
  const arrowBtn = $('.shop-arrow', parent);
  if (!arrowBtn) return;
  arrowBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); parent.classList.toggle('dropdown-open'); });
  document.addEventListener('click', e => { if (!parent.contains(e.target)) parent.classList.remove('dropdown-open'); });
})();

/* ── Scroll reveal ─────────────────────────────────────────── */
(function () {
  const els = $$('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── Back to top ───────────────────────────────────────────── */
(function () {
  const btn = $('#backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Footer year ───────────────────────────────────────────── */
(function () { $$('.footer-year').forEach(el => el.textContent = new Date().getFullYear()); })();

/* ── Newsletter ────────────────────────────────────────────── */
(function () {
  $$('.footer__nl-form').forEach(form => {
    const input = form.querySelector('.footer__nl-input'), btn = form.querySelector('.footer__nl-btn');
    if (!input || !btn) return;
    btn.addEventListener('click', () => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        input.style.borderColor = '#c0392b'; setTimeout(() => input.style.borderColor = '', 2000); return;
      }
      btn.textContent = 'Thank you ✓'; input.value = '';
      setTimeout(() => btn.textContent = 'Subscribe', 3000);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   CART — localStorage
══════════════════════════════════════════════════════════════ */
const CART_KEY = 'sarah_cart';
function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }
let cart = loadCart();

function refreshCartUI() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasItems = cart.length > 0;
  const shipping = hasItems ? SHIPPING : 0;
  const grandTotal = subtotal + shipping;
  const count = cart.reduce((s, i) => s + i.qty, 0);

  /* ── Sidebar ── */
  const itemsEl = $('#cartItems');
  if (itemsEl) {
    itemsEl.innerHTML = '';
    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    } else {
      cart.forEach(item => {
        const d = document.createElement('div');
        d.className = 'cart-item';
        d.innerHTML = `
          <div class="cart-item__img" style="${item.image ? `background-image:url(${sanitize(item.image)});background-size:cover;background-position:center;` : ''}"></div>
          <div class="cart-item__details">
            <p class="cart-item__name">${sanitize(item.name)}</p>
            <p class="cart-item__price">${pkr(item.price)}</p>
          </div>
          <div class="cart-item__controls">
            <button class="cart-qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="cart-qty">${item.qty}</span>
            <button class="cart-qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="cart-item__remove" data-action="rem" data-id="${item.id}" aria-label="Remove">×</button>
          </div>`;
        itemsEl.appendChild(d);
      });
    }
  }
  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = pkr(grandTotal);
  $$('.cart-count').forEach(el => { el.textContent = count; });

  /* ── Cart page ── */
  const cartTableBody = $('#cartTableBody');
  if (cartTableBody) {
    cartTableBody.innerHTML = '';
    if (!cart.length) {
      cartTableBody.innerHTML = '<div class="cart-table__empty"><p>Your bag is empty. <a href="shop.html">Continue shopping →</a></p></div>';
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-table__row';
        row.innerHTML = `
          <div class="cart-table__product">
            <div class="cart-table__thumb" style="${item.image ? `background-image:url(${sanitize(item.image)});background-size:cover;background-position:center;` : ''}"></div>
            <div class="cart-table__product-info">
              <p class="cart-table__name">${sanitize(item.name)}</p>
              <button class="cart-table__remove" data-action="rem" data-id="${item.id}" type="button">Remove</button>
            </div>
          </div>
          <div class="cart-table__cell" data-label="Price">${pkr(item.price)}</div>
          <div class="cart-table__cell cart-table__qty" data-label="Qty">
            <button type="button" data-action="dec" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" data-id="${item.id}">+</button>
          </div>
          <div class="cart-table__cell" data-label="Subtotal">${pkr(item.price * item.qty)}</div>`;
        cartTableBody.appendChild(row);
      });
    }
    const cps = $('#cartPageSubtotal'), cpt = $('#cartPageTotal'), csh = $('#cartPageShipping');
    if (cps) cps.textContent = pkr(subtotal);
    if (csh) csh.textContent = hasItems ? pkr(SHIPPING) : 'PKR 0';
    if (cpt) cpt.innerHTML = `<strong>${pkr(grandTotal)}</strong>`;
  }

  /* ── Checkout summary ── */
  const checkoutItems = $('#checkoutItems');
  if (checkoutItems) {
    checkoutItems.innerHTML = '';
    if (!cart.length) {
      checkoutItems.innerHTML = '<p style="font-size:0.8rem;color:var(--mid-gray);">No items in bag.</p>';
    } else {
      cart.forEach(item => {
        const p = document.createElement('p');
        p.className = 'checkout-summary__items';
        p.textContent = `${sanitize(item.name)} × ${item.qty}`;
        checkoutItems.appendChild(p);
      });
    }
    const cs = $('#checkoutSubtotal'), ct = $('#checkoutTotal');
    if (cs) cs.textContent = pkr(subtotal);
    if (ct) ct.innerHTML = `<strong>${pkr(grandTotal)}</strong>`;
  }
}

function addToCart(id, name, price, image = '') {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; } else { cart.push({ id, name, price: parseInt(price), qty: 1, image }); }
  saveCart(cart); refreshCartUI();
  const sidebar = $('#cartSidebar'), overlay = $('#cartOverlay');
  sidebar && sidebar.classList.add('open'); overlay && overlay.classList.add('visible');
}

/* Cart sidebar open/close */
(function () {
  const cartBtn = $('#cartBtn'), sidebar = $('#cartSidebar'), overlay = $('#cartOverlay'), closeBtn = $('#cartClose');
  const openC = () => { sidebar && sidebar.classList.add('open'); overlay && overlay.classList.add('visible'); };
  const closeC = () => { sidebar && sidebar.classList.remove('open'); overlay && overlay.classList.remove('visible'); };
  cartBtn && cartBtn.addEventListener('click', openC);
  closeBtn && closeBtn.addEventListener('click', closeC);
  overlay && overlay.addEventListener('click', closeC);
})();

/* Global click delegation */
document.addEventListener('click', e => {
  const t = e.target;

  /* Add to bag */
  if (t.classList.contains('btn-add') && t.tagName === 'BUTTON') {
    e.stopPropagation();
    const card = t.closest('[data-id]');
    if (card) addToCart(card.dataset.id, card.dataset.name, card.dataset.price, card.dataset.image || '');
    return;
  }

  /* Wishlist */
  if (t.classList.contains('product-card__wish')) {
    e.stopPropagation();
    t.classList.toggle('active');
    t.textContent = t.classList.contains('active') ? '♥' : '♡';
    return;
  }

  /* Cart qty / remove */
  const action = t.dataset.action, id = t.dataset.id;
  if (action && id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    if (action === 'inc') { cart[idx].qty++; }
    else if (action === 'dec') { cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
    else if (action === 'rem') { cart.splice(idx, 1); }
    saveCart(cart); refreshCartUI(); return;
  }

  /* Product card → PDP */
  if (!t.closest('button') && !t.closest('a')) {
    const card = t.closest('.product-card[data-href]');
    if (card) window.location.href = card.dataset.href;
  }
});

refreshCartUI();

/* ── PDP add button ────────────────────────────────────────── */
(function () {
  const btn = $('#pdpAddBtn');
  if (!btn) return;
  if (btn.dataset.instock === 'false') {
    btn.textContent = 'Out of Stock';
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    return;
  }
  btn.addEventListener('click', () => {
    addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.image || '');
    btn.textContent = 'Added ✓';
    setTimeout(() => btn.textContent = 'Add to Bag', 2000);
  });
})();

/* ── Payment method toggle ─────────────────────────────────── */
(function () {
  const radios = $$('input[name="paymentMethod"]'), bankDetails = $('#bankDetails');
  if (!radios.length || !bankDetails) return;
  radios.forEach(r => r.addEventListener('change', () => {
    bankDetails.style.display = (r.value === 'bank' && r.checked) ? 'block' : 'none';
  }));
})();

/* ── Checkout form ─────────────────────────────────────────── */
(function () {
  const form = $('#checkoutForm');
  if (!form) return;

  const citySelect = $('#coCity');
  const cityOtherWrap = $('#coCityOtherWrap');
  if (citySelect && cityOtherWrap) {
    citySelect.addEventListener('change', () => {
      if (citySelect.value === 'Other') {
        cityOtherWrap.style.display = 'flex';
      } else {
        cityOtherWrap.style.display = 'none';
        const coCityOther = $('#coCityOther');
        if (coCityOther) coCityOther.value = '';
      }
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!cart.length) { alert('Your bag is empty!'); return; }

    const name = $('#coName')?.value.trim() || '';
    const email = $('#coEmail')?.value.trim() || '';
    const phone = $('#coPhone')?.value.trim() || '';
    const address = $('#coAddress')?.value.trim() || '';
    const citySelectVal = $('#coCity')?.value || '';
    const city = citySelectVal === 'Other' ? ($('#coCityOther')?.value.trim() || '') : citySelectVal;
    const notes = $('#coNotes')?.value.trim() || '';
    const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    let ok = true;
    const markErr = sel => { const inp = $(sel); if (!inp) return; inp.style.borderColor = '#c0392b'; setTimeout(() => inp.style.borderColor = '', 2000); };
    if (!name) { ok = false; markErr('#coName'); }
    if (!phone) { ok = false; markErr('#coPhone'); }
    if (!address) { ok = false; markErr('#coAddress'); }
    if (!city) { 
      ok = false; 
      if (citySelectVal === 'Other') markErr('#coCityOther');
      else markErr('#coCity'); 
    }
    if (!ok) return;

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const grandTotal = subtotal + SHIPPING;
    const itemsHTML = cart.map(i => `
  <div style="display:flex; align-items:center; margin-bottom:12px;">
    <img src="${i.image}" style="width:60px; height:60px; object-fit:cover; border-radius:6px; margin-right:10px;" />
    <div>
      <p style="margin:0;"><strong>${i.name}</strong></p>
      <p style="margin:0; font-size:12px;">Qty: ${i.qty}</p>
      <p style="margin:0; font-size:12px;">${pkr(i.price * i.qty)}</p>
    </div>
  </div>
`).join('');
    const payLabel = payment === 'bank' ? 'Bank Transfer (Meezan Bank)' : 'Cash on Delivery';

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Placing order...';
    btn.disabled = true;

    try {
      const orderID = Date.now().toString().slice(-4);

console.log("Sending order email to:", email); 

      // Send professional order email
await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    type: "order",
    name,
    email,
    items: itemsHTML,
    total: grandTotal,
    orderID,
    address,
    city,
    phone,
    payment: payLabel
  })
});

await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          order_number: orderID,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          address: `${address}, ${city}`,
          // CHANGE THIS LINE BELOW:
          items: cart.map(i => `${i.name} (x${i.qty})`).join(', '), 
          subtotal,
          total: grandTotal,
          payment_method: payLabel,
          notes,
          status: 'pending',
          created_at: new Date().toISOString()
        })
      });

      // Automatically deduct purchased quantities from the inventory
      await Promise.all(cart.map(async i => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/decrement_stock`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_id: String(i.id), p_qty: i.qty })
        });
        if (!res.ok) {
          console.error('Failed to decrement stock for', i.name, await res.text());
        }
      }));

      cart = []; saveCart(cart); refreshCartUI();
      form.reset();
      const bankDetails = $('#bankDetails');
      if (bankDetails) bankDetails.style.display = 'none';
      btn.textContent = 'Place Order';
      btn.disabled = false;

      const modal = $('#successModal');
      if (modal) {
        const succOrderNum = $('#succOrderNum');
        if (succOrderNum) succOrderNum.textContent = '#' + orderID;
        const succFirstName = $('#succFirstName');
        if (succFirstName) succFirstName.textContent = name.split(' ')[0] || 'Customer';
        const succEmail = $('#succEmail');
        if (succEmail) succEmail.textContent = email || 'shopsarahnajamstudio@outlook.com';
        const succAddressOut = $('#succAddressOut');
        if (succAddressOut) succAddressOut.textContent = `${name}\n${address}, ${city}\n${phone}\n${email || ''}`.trim();
        const succPayment = $('#succPayment');
        if (succPayment) succPayment.textContent = payLabel;
        modal.classList.add('active');
      }

    } catch (err) {
      btn.textContent = 'Place Order';
      btn.disabled = false;
      alert('Something went wrong. Please try again!');
    }
  });
})();

/* ── Product filter ────────────────────────────────────────── */
(function () {
  const btns = $$('.filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      $$('[data-category]').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
})();

/* ── Contact form ──────────────────────────────────────────── */
(function () {
  const form = $('#contactForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    [{ id: 'cName', errId: 'errName', msg: 'Please enter your name.' },
     { id: 'cEmail', errId: 'errEmail', msg: 'Please enter a valid email.', email: true },
     { id: 'cMsg', errId: 'errMsg', msg: 'Please write your message.' }].forEach(f => {
      const inp = $(`#${f.id}`), err = $(`#${f.errId}`), wrap = inp && inp.closest('.form-field');
      if (!inp) return;
      let valid = inp.value.trim() !== '';
      if (f.email) valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
      if (!valid) {
        ok = false; if (err) err.textContent = f.msg;
        if (wrap) { wrap.classList.remove('error'); void wrap.offsetWidth; wrap.classList.add('error'); }
      } else { if (err) err.textContent = ''; wrap && wrap.classList.remove('error'); }
    });
    if (!ok) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          name: $('#cName').value.trim(),
          email: $('#cEmail').value.trim(),
          phone: $('#cPhone')?.value.trim() || '',
          message: $('#cMsg').value.trim(),
          created_at: new Date().toISOString()
        })
      });

      await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    type: "contact",
    name: $('#cName').value.trim(),
    email: $('#cEmail').value.trim(),
    message: $('#cMsg').value.trim()
  })
});

      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;

      const modal = $('#successModal');
      if (modal) modal.classList.add('active');

    } catch (err) {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again!');
    }
  });
})();

/* ── FAQ accordion ─────────────────────────────────────────── */
(function () {
  $$('.faq__item').forEach(item => {
    const q = $('.faq__q', item), a = $('.faq__a', item);
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq__item.open').forEach(i => { i.classList.remove('open'); const ia = $('.faq__a', i); if (ia) ia.style.maxHeight = '0'; });
      if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
})();

/* ── Smooth anchor scroll ──────────────────────────────────── */
(function () {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
})();

/* ── Modal Close ───────────────────────────────────────────── */
(function () {
  const closeBtns = $$('#modalClose, .modal-overlay');
  if (!closeBtns.length) return;
  closeBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target === btn) {
        const wrap = btn.closest('.modal-overlay') || btn;
        wrap.classList.remove('active');
      }
    });
  });
})();

/* ── Product Card Review Stars ─────────────────────────────── */
(function () {
  function injectCardStars() {
    const cards = $$('.product-card[data-href]');
    if (!cards.length) return;

    // Extract slugs from card hrefs
    const slugMap = new Map();
    cards.forEach(card => {
      const href = card.dataset.href || '';
      const match = href.match(/[?&]slug=([^&]+)/);
      if (match) {
        const slug = match[1];
        if (!slugMap.has(slug)) slugMap.set(slug, []);
        slugMap.get(slug).push(card);
      }
    });
    if (!slugMap.size) return;

    // Fetch all reviews
    fetch(`${SUPABASE_URL}/rest/v1/reviews?select=product_slug,rating`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
    .then(r => r.json())
    .then(reviews => {
      if (!Array.isArray(reviews)) return;

      // Group by slug
      const stats = {};
      reviews.forEach(r => {
        if (!stats[r.product_slug]) stats[r.product_slug] = { total: 0, count: 0 };
        stats[r.product_slug].total += r.rating;
        stats[r.product_slug].count++;
      });

      // Inject stars into cards
      slugMap.forEach((cardList, slug) => {
        const s = stats[slug];
        if (!s || !s.count) return;
        const avg = Math.round(s.total / s.count);
        let starsHTML = '<div class="product-card__stars">';
        for (let i = 1; i <= 5; i++) {
          starsHTML += `<span class="${i <= avg ? 'pc-star' : 'pc-star-empty'}">★</span>`;
        }
        starsHTML += `<span class="pc-star-count">(${s.count})</span></div>`;

        cardList.forEach(card => {
          const nameEl = card.querySelector('.product-card__name');
          if (nameEl && !card.querySelector('.product-card__stars')) {
            nameEl.insertAdjacentHTML('afterend', starsHTML);
          }
        });
      });
    })
    .catch(() => {});
  }

  // Run after a delay to let inline Supabase scripts render products
  setTimeout(injectCardStars, 1500);
  // Also run again after a longer delay in case products load slowly
  setTimeout(injectCardStars, 3500);
})();

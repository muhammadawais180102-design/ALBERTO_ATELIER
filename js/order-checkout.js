/* ALBERTO ATELIER — ORDER REQUEST DEMONSTRATION
 * Uses browser localStorage only; no server, API, payment gateway or auto-email.
 * Customers must manually send the prepared email for the store to receive a request.
 */
(function () {
  'use strict';
  const ORDER_KEY = 'alberto_atelier_order_requests_v1';
  const SELLER_EMAIL = 'muhammadawais180102@gmail.com';
  const $ = id => document.getElementById(id);
  const modal = $('aaOrderDialog');
  const button = $('checkoutBtn');
  if (!modal || !button || typeof getCart !== 'function') return;
  const form = $('aaOrderForm');
  const initialForm = $('aaOrderFormView');
  const successView = $('aaOrderSuccessView');
  const errorNode = $('aaOrderError');
  const hist = $('aaOrderHistory');
  const money = new Intl.NumberFormat('en-PK', { style:'currency', currency:'PKR', maximumFractionDigits:0 });
  let lastFocus = null;
  let currentOrder = null;

  function orders() {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(o => o && o.id && Array.isArray(o.items)) : [];
    } catch (_) { return []; }
  }
  function putOrders(list) {
    // Keep only the latest demo records; never transmit automatically.
    localStorage.setItem(ORDER_KEY, JSON.stringify(list.slice(0, 30)));
  }
  function totalCart(cart) {
    return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  }
  function clean(str, max) { return String(str || '').trim().replace(/\s+/g, ' ').slice(0, max); }
  function appendText(parent, tag, text, className) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    n.textContent = text;
    parent.appendChild(n);
    return n;
  }
  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('en-PK', {dateStyle:'medium',timeStyle:'short'});
  }
  function renderSummary(cart) {
    const box = $('aaOrderSummaryItems');
    box.replaceChildren();
    for (const item of cart) {
      const row = document.createElement('div');
      row.className = 'aa-order-summary__row';
      appendText(row, 'span', item.name + ' × ' + item.quantity);
      appendText(row, 'strong', money.format(Number(item.price) * item.quantity));
      box.appendChild(row);
    }
    const quantity = cart.reduce((sum,item)=>sum + item.quantity, 0);
    $('aaOrderItemCount').textContent = quantity + (quantity === 1 ? ' ITEM' : ' ITEMS');
    $('aaOrderTotal').textContent = money.format(totalCart(cart));
  }
  function openDialog() {
    const cart = getCart();
    if (!cart.length) { showToast('Your bag is empty. Add a watch first.'); return; }
    currentOrder = null;
    errorNode.textContent = '';
    $('aaOrderSuccessStatus').textContent = '';
    initialForm.hidden = false;
    successView.hidden = true;
    renderSummary(cart);
    try {
      if (window.AlbertoDemoAccount && window.AlbertoDemoAccount.getSession) {
        const session = window.AlbertoDemoAccount.getSession();
        if (session) {
          if (!$('aaOrderName').value) $('aaOrderName').value = session.name || '';
          if (!$('aaOrderEmail').value) $('aaOrderEmail').value = session.email || '';
        }
      }
    } catch (_) { /* optional sign-in is a demo */ }
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => $('aaOrderName').focus());
  }
  function closeDialog() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function generateReference() {
    let part = '';
    if (window.crypto && crypto.getRandomValues) {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      part = [...values].map(n=>n.toString(36)).join('').slice(0,10).toUpperCase();
    } else {
      part = (String(Date.now()) + String(Math.floor(Math.random()*1e5))).slice(-10);
    }
    return 'AA-' + part;
  }
  function orderText(order) {
    const rows = order.items.map(i => `${i.name} x ${i.quantity} — ${money.format(i.price * i.quantity)}`);
    return [
      'ALBERTO ATELIER — ORDER REQUEST (NOT YET CONFIRMED)',
      'Reference: ' + order.id,
      'Created: ' + formatTimestamp(order.createdAt),
      '', 'CUSTOMER',
      'Name: ' + order.customer.name,
      'Phone: ' + order.customer.phone,
      'Email: ' + order.customer.email,
      'Address: ' + order.customer.address,
      'City: ' + order.customer.city,
      'Postal: ' + (order.customer.postal || '—'),
      'Instructions: ' + (order.customer.note || '—'),
      '', 'WATCHES', ...rows,
      '', 'Subtotal: ' + money.format(order.subtotal),
      'Delivery charges: To be confirmed by seller',
      'Payment: Not processed',
      '', 'Please confirm stock, total including delivery, and payment method.'
    ].join('\n');
  }
  function emailOrder(order) {
    const subject = encodeURIComponent('Alberto Atelier — Order Request ' + order.id);
    const body = encodeURIComponent(orderText(order));
    window.location.href = 'mailto:' + SELLER_EMAIL + '?subject=' + subject + '&body=' + body;
    $('aaOrderSuccessStatus').textContent = 'Email composer requested. Please press Send there; saving alone does not notify the store.';
  }
  async function copyOrder(order) {
    const text = orderText(order);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand('copy');
        area.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      $('aaOrderSuccessStatus').textContent = 'Request details copied. Share them with the store to complete your enquiry.';
    } catch (_) {
      $('aaOrderSuccessStatus').textContent = 'Copy blocked by browser. Use Send by Email instead.';
    }
  }
  function renderHistory() {
    const list = orders();
    hist.replaceChildren();
    $('aaClearOrders').hidden = !list.length;
    if (!list.length) {
      appendText(hist, 'p', 'No saved requests yet. Your references will appear here after you save an enquiry.', 'aa-orders__empty');
      return;
    }
    for (const order of list) {
      const item = document.createElement('article');
      item.className = 'aa-orders__item';
      const details = document.createElement('div');
      appendText(details, 'strong', order.id);
      appendText(details,'div', formatTimestamp(order.createdAt) + ' · ' + money.format(order.subtotal) + ' · Saved locally', 'aa-orders__meta');
      const actions = document.createElement('div');
      actions.className = 'aa-orders__actions';
      const mail = appendText(actions,'button','Send Email');
      mail.type = 'button';
      mail.addEventListener('click', () => emailOrder(order));
      const detailsBtn = appendText(actions,'button','View Request');
      detailsBtn.type = 'button';
      detailsBtn.addEventListener('click', () => showSuccess(order));
      item.append(details,actions);
      hist.appendChild(item);
    }
  }
  function showSuccess(order) {
    currentOrder = order;
    initialForm.hidden = true;
    successView.hidden = false;
    $('aaSuccessReference').textContent = order.id;
    $('aaSuccessInfo').textContent = `${order.items.reduce((n,i)=>n+i.quantity,0)} watch(es) · Subtotal ${money.format(order.subtotal)} · ${order.customer.city}`;
    $('aaOrderSuccessStatus').textContent = '';
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => $('aaOrderSend').focus());
  }
  function handleSubmit(event) {
    event.preventDefault();
    errorNode.textContent = '';
    if (!form.reportValidity()) return;
    const cart = getCart();
    if (!cart.length) {
      errorNode.textContent = 'Your bag is empty. Please add an item before requesting an order.';
      return;
    }
    const customer = {
      name:clean($('aaOrderName').value,90),
      phone:clean($('aaOrderPhone').value,24),
      email:clean($('aaOrderEmail').value,120),
      address:clean($('aaOrderAddress').value,300),
      city:clean($('aaOrderCity').value,80),
      postal:clean($('aaOrderPostal').value,20),
      note:clean($('aaOrderNote').value,300)
    };
    if (customer.name.length < 2 || customer.address.length < 8 || customer.city.length < 2 || customer.phone.replace(/\D/g, '').length < 8) {
      errorNode.textContent = 'Please enter a valid full name, phone number, delivery address and city.';
      return;
    }
    const order = {
      id:generateReference(), createdAt:Date.now(), status:'saved-locally',
      customer,
      items:cart.map(i => ({id:i.id,name:i.name,price:Number(i.price),quantity:Number(i.quantity)})),
      subtotal:totalCart(cart)
    };
    try {
      putOrders([order, ...orders()]);
    } catch (_) {
      errorNode.textContent = 'Browser storage is unavailable. Request was not saved; allow site storage and retry.';
      return;
    }
    // The order is saved before the shopping bag is cleared; no money is charged.
    saveCart([]);
    renderCart();
    form.reset();
    renderHistory();
    showSuccess(order);
  }

  button.addEventListener('click', openDialog);
  form.addEventListener('submit', handleSubmit);
  $('aaOrderClose').addEventListener('click', closeDialog);
  $('aaOrderDone').addEventListener('click', closeDialog);
  $('aaOrderSend').addEventListener('click', () => { if (currentOrder) emailOrder(currentOrder); });
  $('aaOrderCopy').addEventListener('click', () => { if (currentOrder) copyOrder(currentOrder); });
  $('aaClearOrders').addEventListener('click', () => {
    if (!confirm('Delete all locally saved demo order requests from this browser?')) return;
    try { localStorage.removeItem(ORDER_KEY); renderHistory(); } catch (_) { showToast('Unable to clear stored orders.'); }
  });
  modal.addEventListener('click', event => { if (event.target === modal) closeDialog(); });
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled])'))
      .filter(el => !el.closest('[hidden]') && el.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('storage', event => { if (event.key === ORDER_KEY) renderHistory(); });
  renderHistory();
})();

/* ALBERTO ATELIER — PACKAGE / TROLLEY MICRO-ANIMATION
   Call AlbertoCartMotion.play(existingButton) AFTER the cart is saved.
   Preferred placement: near the shopping bag icon on the right.
*/
(function () {
  'use strict';

  let active = null;
  let cleanupTimer = null;

  function clearActive() {
    if (cleanupTimer) clearTimeout(cleanupTimer);
    cleanupTimer = null;
    if (active) active.remove();
    active = null;
  }

  function findBagAnchor(button) {
    return document.querySelector('.nav-actions .nav-icon[aria-label="Shopping cart"], .nav-actions a[href$="cart.html"], .nav-icon[aria-label="Shopping cart"], a[href*="cart.html"]') || button;
  }

  function setPositionVars(bubble, anchor) {
    if (!anchor) return false;
    const rect = anchor.getBoundingClientRect();
    if (!rect || !rect.width) return false;
    bubble.style.setProperty('--ac-anchor-top', rect.bottom + 'px');
    bubble.style.setProperty('--ac-anchor-left', rect.right + 'px');
    return true;
  }

  function play(button) {
    if (!button) return;
    clearActive();

    const bubble = document.createElement('div');
    bubble.className = 'ac-cart-motion';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.innerHTML = `
      <div class="ac-cart-motion__stage">
        <div class="ac-cart-motion__belt"></div>
        <div class="ac-cart-motion__box">
          <span class="ac-cart-motion__box-front"></span>
          <span class="ac-cart-motion__flap ac-cart-motion__flap--left"></span>
          <span class="ac-cart-motion__flap ac-cart-motion__flap--right"></span>
        </div>
        <div class="ac-cart-motion__cart">
          <svg viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true">
            <path d="M5 8h9l6 27c.7 3 2.6 4 5 4h27l6-23H17"
              stroke="currentColor" stroke-width="2.6" stroke-linecap="round"
              stroke-linejoin="round"/>
            <path d="M23 28h30" stroke="currentColor" stroke-width="1.4" opacity=".6"/>
            <circle cx="27" cy="47" r="4" fill="#d5b26d" stroke="currentColor"/>
            <circle cx="49" cy="47" r="4" fill="#d5b26d" stroke="currentColor"/>
          </svg>
        </div>
        <span class="ac-cart-motion__plus">+1</span>
        <span class="ac-cart-motion__added">
          <span class="ac-cart-motion__check">✓</span> Added
        </span>
      </div>`;

    document.body.appendChild(bubble);
    active = bubble;

    const anchor = findBagAnchor(button);
    if (setPositionVars(bubble, anchor)) {
      bubble.classList.add('ac-cart-motion--near-bag');
    } else {
      bubble.classList.add('ac-cart-motion--dock-right');
    }

    const reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cleanupTimer = setTimeout(clearActive, reducedMotion ? 1250 : 4500);
  }

  window.AlbertoCartMotion = Object.freeze({ play });
})();

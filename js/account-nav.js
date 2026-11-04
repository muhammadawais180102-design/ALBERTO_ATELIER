/* Header account affordance. Never modifies cart, theme or navigation logic. */
(() => {
  'use strict';
  const api = window.AlbertoDemoAccount;
  if (!api) return;
  const session = api.getSession();
  document.querySelectorAll('[data-aa-account-link]').forEach(link => {
    link.setAttribute('aria-label', session ? 'My demo account' : 'Sign In');
    link.title = session ? 'My demo account • ' + session.name : 'Sign In / Register';
    const label = link.querySelector('.aa-signin-cta__text');
    if (label) label.textContent = session ? 'My Account' : 'Sign In';
    const icon = link.querySelector('i');
    if (icon && session) {
      icon.classList.remove('bi-person-circle', 'bi-person');
      icon.classList.add('bi-person-check');
    }
  });
})();

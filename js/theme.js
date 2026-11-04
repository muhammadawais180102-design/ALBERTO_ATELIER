/* Alberto Atelier — exclusive light/dark presentation layer.
   Independent of cart/account/navigation logic. */
(() => {
  'use strict';
  const KEY = 'alberto_atelier_theme';
  let theme = 'dark';
  try {
    theme = localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch (_) { /* Storage may be blocked; dark remains the default. */ }

  const root = document.documentElement;
  root.setAttribute('data-aa-theme', theme);
  root.style.colorScheme = theme;

  function updateControls() {
    const isLight = theme === 'light';
    document.querySelectorAll('.aa-theme-switch').forEach(button => {
      button.setAttribute('aria-pressed', String(isLight));
      button.setAttribute('aria-label', isLight ? 'Switch to night mode' : 'Switch to light mode');
      button.title = isLight ? 'Switch to night mode' : 'Switch to light mode';
      const label = button.querySelector('.aa-theme-switch__label');
      if (label) label.textContent = isLight ? 'NIGHT' : 'DAY';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isLight ? '#f6f1e7' : '#08090b';
  }

  function applyTheme(next, persist = true) {
    theme = next === 'light' ? 'light' : 'dark';
    root.setAttribute('data-aa-theme', theme);
    root.style.colorScheme = theme;
    if (persist) {
      try { localStorage.setItem(KEY, theme); } catch (_) { /* ignore */ }
    }
    updateControls();
  }

  function init() {
    updateControls();
    document.querySelectorAll('.aa-theme-switch').forEach(button => {
      button.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.addEventListener('storage', event => {
    if (event.key === KEY) applyTheme(event.newValue === 'light' ? 'light' : 'dark', false);
  });
})();

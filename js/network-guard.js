/* Alberto Atelier — keep site pages working, cache an animated offline page.
   Root pages: <script src="./js/network-guard.js" defer></script>
   Nested pages: <script src="../js/network-guard.js" defer></script> */
(() => {
  'use strict';
  const activeScript = document.currentScript;
  if (!activeScript) return;
  const root = new URL('../', activeScript.src);
  const offlinePage = new URL('system/offline.html', root);
  const workerURL = new URL('offline-worker.js', root);
  const previews = ['system/404.html', 'system/offline.html'];
  if (previews.some(p => location.pathname === new URL(p, root).pathname)) return;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register(workerURL.href, { scope: root.pathname })
      .catch(err => console.warn('Alberto offline worker unavailable:', err));
  }

  let redirecting = false;
  function showOfflinePage() {
    if (redirecting || location.pathname === offlinePage.pathname) return;
    redirecting = true;
    try { sessionStorage.setItem('albertoReturn', location.pathname + location.search + location.hash); }
    catch (error) { /* Private browsing may restrict storage. */ }
    location.replace(offlinePage.href);
  }

  // This is a browser connectivity signal, not an internet speed/reachability test.
  window.addEventListener('offline', showOfflinePage);
  if (!navigator.onLine) showOfflinePage();
})();

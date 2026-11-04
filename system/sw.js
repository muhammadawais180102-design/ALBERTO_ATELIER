/* Alberto Atelier: cache animated offline page and its extracted CSS/JS.
   The original website behavior is unchanged; the offline fallback now remains
   complete even though its styles and script live in separate files. */
const CACHE = 'alberto-video-404-integrated-v5-system';
const base = self.registration.scope;
const OFFLINE = new URL('system/offline.html', base).href;
const OFFLINE_CSS = new URL('css/offline.css', base).href;
const OFFLINE_JS = new URL('js/offline.js', base).href;
const THEME_CSS = new URL('css/theme.css', base).href;
const THEME_JS = new URL('js/theme.js', base).href;
const OFFLINE_ASSETS = [OFFLINE, OFFLINE_CSS, OFFLINE_JS, THEME_CSS, THEME_JS];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(names => Promise.all(
      names.filter(name => name.startsWith('alberto-video-404-') && name !== CACHE)
           .map(name => caches.delete(name))
    ))
  ]));
});
self.addEventListener('fetch', event => {
  const requested = event.request.url;
  if (OFFLINE_ASSETS.includes(requested) && requested !== OFFLINE) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    return;
  }
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(async () =>
    (await caches.match(OFFLINE)) || new Response('Offline', {
      status: 503, headers: {'Content-Type': 'text/plain'}
    })
  ));
});

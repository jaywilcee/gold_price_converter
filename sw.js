const CACHE = 'gold-converter-v1';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (event) => {
  const req = event.request; const url = new URL(req.url);
  if (url.pathname.startsWith('/api/spot')) {
    // Network-first for fresh prices, fallback to cache
    event.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }
  // Cache-first for static assets
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
const CACHE = 'abbadie-v11';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/assets/abbadia-night.svg', '/og.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/index.html')
      .then((response) => response.text())
      .then((html) => [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]))
      .then((assets) => caches.open(CACHE).then((cache) => cache.addAll([...CORE, ...assets])))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('abbadie-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    // All game resources are static and same-origin. Vite serves them with
    // Vary: Origin, while module requests and pre-cache requests differ there.
    caches.match(event.request, { cacheName: CACHE, ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response.ok) return response;
      return caches.open(CACHE).then((cache) => cache.put(event.request, response.clone())).then(() => response);
    }).catch(() => event.request.mode === 'navigate' ? caches.match('/index.html') : undefined)),
  );
});

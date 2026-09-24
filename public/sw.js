/* VOLTARA service worker — offline shell + cached VOLTARA Originals.
 * The build step replaces the precache list and cache version below.
 * Third-party games are never cached. */

self.__VOLTARA_PRECACHE__ = [];
const CACHE = 'voltara-dev';
const RUNTIME = 'voltara-runtime';
const FONT_CACHE = 'voltara-fonts';
const SCOPE = new URL(self.registration.scope);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(self.__VOLTARA_PRECACHE__.map((p) => new URL(p, SCOPE).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('voltara-') && ![CACHE, RUNTIME, FONT_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: cache-first so typography survives offline.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req, { ignoreVary: true }).then(
          (hit) =>
            hit ||
            fetch(req).then((res) => {
              cache.put(req, res.clone());
              return res;
            }),
        ),
      ),
    );
    return;
  }

  // Everything else cross-origin (third-party games, ad providers) passes through untouched.
  if (url.origin !== SCOPE.origin) return;

  // Navigations: network first, fall back to the cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req, { ignoreVary: true }).then((hit) => hit || caches.match(new URL('index.html', SCOPE).href, { ignoreVary: true })),
      ),
    );
    return;
  }

  // Same-origin assets and local games: stale-while-revalidate.
  event.respondWith(
    caches.match(req, { ignoreVary: true }).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(hit ? CACHE : RUNTIME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit || Response.error());
      return hit || network;
    }),
  );
});

// Network-first so every update shows up right away; falls back to cache offline.
const CACHE = 'sing-along-studio';
const CORE = ['./', './index.html', './app.js', './sep.js', './mdx.js', './aiworker.js', './manifest.webmanifest', './icon-192.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
// GitHub Pages can't send COOP/COEP headers, so add them here: the page becomes
// cross-origin isolated and the AI can run on several CPU cores.
const isolate = r => {
  if (!r || r.status === 0 || r.type === 'opaque' || r.type === 'opaqueredirect') return r;
  const h = new Headers(r.headers);
  h.set('Cross-Origin-Embedder-Policy', 'credentialless');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
};
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return isolate(res); })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => isolate(r) || caches.match('./index.html').then(isolate)))
  );
});

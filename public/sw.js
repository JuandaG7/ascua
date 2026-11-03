// Permite abrir la app sin internet. Busca primero la versión nueva en la red
// (así los cambios subidos a GitHub llegan solos) y si no hay red usa la copia guardada.
const CACHE = "ascua-v1";
const BASE = new URL(self.registration.scope).pathname;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Solo archivos de la app. El chat va a api.anthropic.com y no se toca.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    Promise.race([fetch(req), timeout(4000)])
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req, { ignoreSearch: req.mode === "navigate" });
        if (cached) return cached;
        if (req.mode === "navigate") return (await caches.match(BASE)) ?? Response.error();
        return Response.error();
      }),
  );
});

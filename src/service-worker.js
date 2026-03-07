import { build, files, version } from "$service-worker";
import { Worker } from "@arkade-os/sdk";

const worker = new Worker();
worker.start(false).catch(console.error);

const CACHE_BUILD = `coinos-build-${version}`;
const CACHE_PAGES = `coinos-pages-${version}`;
const CACHE_PUBLIC = `coinos-public-${version}`;

const ESSENTIAL_STATIC = files.filter(
  (f) =>
    f.endsWith(".woff2") ||
    f.endsWith(".woff") ||
    f.endsWith(".png") ||
    f.endsWith(".webp") ||
    f.endsWith(".webmanifest") ||
    f === "/favicon.ico",
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_BUILD)
      .then((cache) =>
        Promise.allSettled(
          [...build, ...ESSENTIAL_STATIC].map((url) =>
            cache.add(url).catch(() => {}),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("coinos-") && k !== CACHE_BUILD && k !== CACHE_PAGES && k !== CACHE_PUBLIC)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Build assets — cache-first (fingerprinted/immutable)
  if (build.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }

  // Navigation HTML — network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_PAGES).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  // __data.json (SvelteKit client-side navigation) — network-first
  if (url.pathname.endsWith("__data.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_PAGES).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Public API (avatars etc) — cache-first
  if (url.pathname.startsWith("/api/public/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_PUBLIC).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Static files from ESSENTIAL_STATIC — cache-first
  if (ESSENTIAL_STATIC.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }
});

self.addEventListener("push", (event) => {
  const { title, body, url } = event.data.json();
  const icon = "/images/icon.png";
  const badge = "/images/badge.png";
  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    data: { url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const path = event.notification.data.url || "/";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(clients.openWindow(target));
});

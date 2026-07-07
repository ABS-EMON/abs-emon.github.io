---
---
// Service worker for the Research Lab PWA
// Cache name is versioned - bump CACHE_VERSION whenever you change
// cached assets so old caches get cleared out on the next visit.
const CACHE_VERSION = "v1";
const CACHE_NAME = "research-lab-cache-" + CACHE_VERSION;
const BASEURL = "{{ site.baseurl }}";

// Core files needed for the app shell / offline fallback.
const PRECACHE_URLS = [
  BASEURL + "/",
  BASEURL + "/offline.html",
  BASEURL + "/css/main.css",
  BASEURL + "/images/favicon.ico",
  BASEURL + "/images/logo/lab-logo.png",
  BASEURL + "/images/slider/slider-image.png",
  BASEURL + "/manifest.json"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS).catch(function () {
        // Ignore individual failures (e.g. a file that doesn't exist yet)
        // so installation of the service worker doesn't fail entirely.
      });
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name.indexOf("research-lab-cache-") === 0 && name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Network-first for HTML pages (so content stays fresh),
// cache-first for everything else (css/js/images/fonts),
// with an offline fallback page for navigations.
self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match(BASEURL + "/offline.html");
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then(function (response) {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          // Nothing cached and network failed - just let it fail.
        });
    })
  );
});

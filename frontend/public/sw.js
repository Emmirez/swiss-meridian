// Minimal service worker — required for PWA installability.
// Not doing offline caching yet, just enables the install prompt.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through — no caching logic yet, just needs to exist
});
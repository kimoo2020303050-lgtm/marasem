/* Service Worker — MARASEM — مراسم PWA
   Shell: Cache-First | Google Sheets (GViz) & Apps Script: Network-Only (بيانات حية دائماً) */
const CACHE = "marasem-pwa-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // البيانات الحية لا تُخزّن أبداً: الشيت، Apps Script، الخرائط
  if (url.hostname.includes("google.com") || url.hostname.includes("googleapis.com") || url.hostname.includes("script.google")) return;
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && url.origin === location.origin) {
          const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
});

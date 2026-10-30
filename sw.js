/* ============================================================
   KOCOA – Service Worker (PWA)
   Macht die App nach dem ersten Online-Aufruf offline lauffähig
   und ermöglicht auf iPad (Safari → "Zum Home-Bildschirm") und
   Windows (Edge → "Als App installieren") den Betrieb als
   eigenständige, installierte App – ohne App Store, ohne Adminrechte.

   Strategie:
   - Die App-Hülle (index.html, manifest, Icons) wird beim ersten
     Besuch fest zwischengespeichert ("precache") → App startet danach
     auch komplett offline.
   - Karten-/Höhen-Kacheln von swisstopo & Co. werden NICHT hier
     zwischengespeichert: dafür hat die App ihre eigene
     Offline-Paket-Funktion (IndexedDB). Solche Fremd-Anfragen reicht
     der Service Worker einfach ans Netz durch.

   WICHTIG: Bei jeder neuen App-Version die Zahl in CACHE erhöhen
   (z. B. kocoa-v2), damit die alte Hülle sicher ersetzt wird.
   ============================================================ */

const CACHE = 'kocoa-v191-T431-2026-10-30';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

/* T323: Installation scheitert nicht mehr komplett, wenn ein Icon fehlt – Pflicht sind nur './' und './index.html',
   der Rest wird bestmöglich geladen. Vorher liess ein einziges fehlendes Bild die App nie offline-fähig werden. */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        await cache.addAll(['./', './index.html']);
        await Promise.all(APP_SHELL.slice(2).map(u => cache.add(u).catch(() => {})));
      })
      .then(() => self.skipWaiting())
  );
});

/* T323: die App fragt den Cache-Namen ab (🩺 Diagnose) */
self.addEventListener('message', event => {
  try {
    if (event.data && event.data.t === 'kocoa:cache?' && event.source) event.source.postMessage({ t: 'kocoa:cache', cache: CACHE });
    if (event.data && event.data.t === 'kocoa:skipWaiting') self.skipWaiting();
  } catch (e) {}
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Nur GET behandeln
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Fremd-Herkunft (Kartenserver usw.): unverändert ans Netz durchreichen.
  // Die App verwaltet ihre eigenen Offline-Kartenpakete selbst.
  if (url.origin !== self.location.origin) return;

  // T288: Proxy-Pfad für SLF-Messwerte (Netlify _redirects) nie zwischenspeichern – immer frisch
  if (url.pathname.indexOf('/imis-api/') !== -1) return;

  // Eigene Dateien: zuerst Cache, sonst Netz (und dabei nachladen).
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        // Erfolgreiche Antworten der eigenen Herkunft mitcachen
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => {
        // Offline und nicht im Cache: für Navigationen die App-Hülle liefern
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

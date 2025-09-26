const STATIC_CACHE_NAME = 'le-centre-scientifique-static-v3';
const DYNAMIC_CACHE_NAME = 'le-centre-scientifique-dynamic-v3';

// Fichiers de l'application shell à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icone.png',
  '/manifest.webmanifest'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('[Service Worker] Mise en cache des ressources statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key.startsWith('center-scientific-of-mathematics')) {
          console.log('[Service Worker] Suppression de l\'ancien cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
        console.log('[Service Worker] Anciens caches supprimés.');
        return self.clients.claim();
    })
  );
});

// Stratégie de cache: "Stale While Revalidate" pour le contenu dynamique
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(err => {
    console.warn('[Service Worker] Fetch failed; serving from cache if available.', err);
  });

  return cachedResponse || fetchPromise;
};

// Stratégie de cache: "Cache First" pour les ressources statiques
const cacheFirst = async (request) => {
    const cacheResponse = await caches.match(request);
    return cacheResponse || fetch(request);
};

// Interception des requêtes fetch
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Pour les chapitres et le manifest, utiliser "stale-while-revalidate"
  if (url.pathname.startsWith('/chapters/') || url.pathname === '/manifest.json') {
    event.respondWith(staleWhileRevalidate(request));
  } 
  // Pour les assets statiques de l'app shell, utiliser "cache-first"
  else if (STATIC_ASSETS.some(asset => url.pathname === new URL(asset, self.location.origin).pathname)) {
    event.respondWith(cacheFirst(request));
  }
  // Le navigateur gère le reste (CDN, etc.)
});
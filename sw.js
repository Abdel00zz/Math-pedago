const STATIC_CACHE_NAME = 'le-centre-scientifique-static-v2';
const DYNAMIC_CACHE_NAME = 'le-centre-scientifique-dynamic-v2';

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
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[Service Worker] Suppression de l\'ancien cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Stratégie de cache: "Stale While Revalidate" pour le contenu dynamique (JSON)
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    // IMPORTANT: Vérifier le type de réponse avant de mettre en cache les fichiers JSON.
    // Cela empêche la mise en cache du fallback index.html pour un fichier manquant.
    const contentType = networkResponse.headers.get('content-type');
    if (networkResponse.ok && contentType && contentType.includes('application/json')) {
        cache.put(request, networkResponse.clone());
    } else {
        console.warn(`[Service Worker] Réponse non mise en cache pour ${request.url}. Status: ${networkResponse.status}, Content-Type: ${contentType}`);
    }
    return networkResponse;
  }).catch(err => {
    // Si le fetch échoue, on se fie à la réponse en cache.
    console.warn('[Service Worker] Fetch a échoué; service depuis le cache si disponible.', err);
  });

  // Servir depuis le cache si disponible, sinon attendre la réponse réseau.
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

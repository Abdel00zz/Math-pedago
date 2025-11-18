// Version auto-générée basée sur le timestamp de build
// IMPORTANT: Ce timestamp doit être mis à jour à chaque déploiement
const CACHE_VERSION = 'v' + (self.CACHE_TIMESTAMP || '20250118-001');
const STATIC_CACHE_NAME = 'le-centre-scientifique-static-' + CACHE_VERSION;
const DYNAMIC_CACHE_NAME = 'le-centre-scientifique-dynamic-' + CACHE_VERSION;

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
  console.log('[Service Worker] Activation... Version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        // Supprimer tous les anciens caches (différents de la version actuelle)
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          if (key.startsWith('le-centre-scientifique-') || key.startsWith('center-scientific-of-mathematics')) {
            console.log('[Service Worker] Suppression de l\'ancien cache', key);
            return caches.delete(key);
          }
        }
      }));
    }).then(() => {
        console.log('[Service Worker] Anciens caches supprimés.');
        // Prendre le contrôle de tous les clients immédiatement
        return self.clients.claim();
    }).then(() => {
        // Notifier tous les clients qu'une mise à jour est disponible
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            console.log('[Service Worker] Notification de mise à jour au client');
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION,
              message: 'Nouveau contenu disponible. Rechargez la page pour voir les mises à jour.'
            });
          });
        });
    })
  );
});

// Stratégie de cache: "Network First" pour les chapitres (développement)
const networkFirstForChapters = async (request) => {
  const url = new URL(request.url);

  // Si la requête contient un cache-buster (?t=timestamp), forcer le réseau
  const hasCacheBuster = url.searchParams.has('t') || url.searchParams.has('v');

  try {
    // Essayer d'abord le réseau
    const networkResponse = await fetch(request, {
      cache: hasCacheBuster ? 'reload' : 'default'
    });

    if (networkResponse.ok) {
      // Mettre à jour le cache uniquement pour les requêtes réussies
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      // Créer une requête sans le cache-buster pour la mise en cache
      const cacheRequest = hasCacheBuster ?
        new Request(url.origin + url.pathname, { method: request.method }) :
        request;
      cache.put(cacheRequest, networkResponse.clone());
      return networkResponse;
    }
  } catch (err) {
    console.warn('[Service Worker] Network failed; trying cache.', err);
  }

  // Fallback sur le cache si le réseau échoue
  // Utiliser la requête sans cache-buster pour chercher dans le cache
  const cacheRequest = hasCacheBuster ?
    new Request(url.origin + url.pathname, { method: request.method }) :
    request;

  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(cacheRequest);

  if (cachedResponse) {
    console.log('[Service Worker] Utilisation du cache pour:', url.pathname);
    return cachedResponse;
  }

  throw new Error('No network and no cache available');
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

  // Pour les chapitres et le manifest, utiliser "network-first" (toujours frais)
  if (url.pathname.startsWith('/chapters/') || url.pathname === '/manifest.json') {
    event.respondWith(networkFirstForChapters(request));
  } 
  // Pour les assets statiques de l'app shell, utiliser "cache-first"
  else if (STATIC_ASSETS.some(asset => url.pathname === new URL(asset, self.location.origin).pathname)) {
    event.respondWith(cacheFirst(request));
  }
  // Le navigateur gère le reste (CDN, etc.)
});
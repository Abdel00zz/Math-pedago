// Service Worker désactivé.
// Ce fichier est conservé pour éviter les erreurs 404 sur les anciennes installations de la PWA,
// mais il ne contient plus de logique de mise en cache ou d'interception de requêtes.

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      // Supprimer tous les anciens caches de cette application
      return Promise.all(keyList.map(key => {
        if (key.startsWith('le-centre-scientifique')) {
          return caches.delete(key);
        }
      }));
    }).then(() => {
        console.log('[Service Worker] Anciens caches supprimés.');
        return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Ne fait rien, laisse le navigateur gérer la requête normalement.
  return;
});

// Service Worker pour les notifications push et badge dynamique
const CACHE_NAME = 'ppi-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icone.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: 'Vous avez de nouvelles activités à consulter !',
    icon: '/icone.png',
    badge: '/icone.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir les activités',
        icon: '/icone.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icone.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Plateforme Pédagogique';
    
    // Mise à jour du badge avec le nombre de notifications
    if (data.badgeCount) {
      self.registration.setAppBadge(data.badgeCount);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Plateforme Pédagogique', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Ne rien faire, la notification est déjà fermée
  } else {
    // Clic sur la notification principale
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Logique de synchronisation des données
  try {
    // Vérifier s'il y a de nouvelles notifications
    const response = await fetch('/api/notifications/check');
    const data = await response.json();
    
    if (data.hasNewNotifications) {
      // Mettre à jour le badge
      self.registration.setAppBadge(data.notificationCount);
      
      // Envoyer une notification si nécessaire
      if (data.shouldNotify) {
        self.registration.showNotification('Nouvelles activités', {
          body: `Vous avez ${data.notificationCount} nouvelle(s) notification(s)`,
          icon: '/icone.png',
          badge: '/icone.png'
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

// Fonction pour mettre à jour le badge
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count;
    if (count > 0) {
      self.registration.setAppBadge(count);
    } else {
      self.registration.clearAppBadge();
    }
  }
});
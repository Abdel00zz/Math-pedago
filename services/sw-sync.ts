/**
 * Module de synchronisation entre Service Worker et localStorage
 * Assure la cohérence des caches lors des mises à jour
 */

import { storageService } from './StorageService';

/**
 * Initialise l'écoute des messages du Service Worker
 * À appeler au démarrage de l'application
 */
export function initServiceWorkerSync() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW Sync] Service Worker non supporté');
    return;
  }

  // Écouter les messages du Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('[SW Sync] Mise à jour SW détectée:', event.data.version);

      // Synchroniser le localStorage avec la nouvelle version du SW
      storageService.syncWithServiceWorkerVersion(event.data.version);
    }
  });

  console.log('[SW Sync] Écoute des messages SW initialisée');
}

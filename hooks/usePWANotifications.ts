import { useEffect, useCallback, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface PWANotificationOptions {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const usePWANotifications = () => {
  const { notifications } = useNotification();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Vérifier le support des notifications et du service worker
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Obtenir l'enregistrement du service worker
        navigator.serviceWorker.ready.then((reg) => {
          setRegistration(reg);
        });
      }
    };

    checkSupport();
  }, []);

  // Mettre à jour le badge avec le nombre de notifications
  useEffect(() => {
    const updateBadge = async () => {
      if (registration && 'setAppBadge' in navigator) {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        try {
          if (unreadCount > 0) {
            await (navigator as any).setAppBadge(unreadCount);
            
            // Envoyer un message au service worker pour synchroniser
            if (registration.active) {
              registration.active.postMessage({
                type: 'UPDATE_BADGE',
                count: unreadCount
              });
            }
          } else {
            await (navigator as any).clearAppBadge();
            
            if (registration.active) {
              registration.active.postMessage({
                type: 'UPDATE_BADGE',
                count: 0
              });
            }
          }
        } catch (error) {
          console.warn('Erreur lors de la mise à jour du badge:', error);
        }
      }
    };

    updateBadge();
  }, [notifications, registration]);

  // Demander la permission pour les notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }, [isSupported]);

  // Envoyer une notification push
  const sendNotification = useCallback(async (options: PWANotificationOptions): Promise<boolean> => {
    if (!isSupported || permission !== 'granted' || !registration) {
      return false;
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: options.body || 'Nouvelle notification',
        icon: options.icon || '/icone.png',
        badge: options.badge || '/icone.png',
        tag: options.tag || 'ppi-notification',
        requireInteraction: options.requireInteraction || false,
        vibrate: [200, 100, 200],
        data: {
          timestamp: Date.now(),
          url: window.location.origin
        },
        actions: [
          {
            action: 'view',
            title: 'Voir',
            icon: '/icone.png'
          },
          {
            action: 'dismiss',
            title: 'Ignorer',
            icon: '/icone.png'
          }
        ]
      };

      await registration.showNotification(
        options.title || 'Plateforme Pédagogique',
        notificationOptions
      );

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return false;
    }
  }, [isSupported, permission, registration]);

  // Programmer une notification pour plus tard
  const scheduleNotification = useCallback(async (
    delay: number,
    options: PWANotificationOptions
  ): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    setTimeout(() => {
      sendNotification(options);
    }, delay);

    return true;
  }, [isSupported, permission, sendNotification]);

  // Envoyer une notification de rappel d'étude
  const sendStudyReminder = useCallback(async (chapterTitle: string): Promise<boolean> => {
    return sendNotification({
      title: 'Rappel d\'étude 📚',
      body: `N'oubliez pas de continuer votre travail sur "${chapterTitle}"`,
      tag: 'study-reminder',
      requireInteraction: true
    });
  }, [sendNotification]);

  // Envoyer une notification de félicitations
  const sendCongratulations = useCallback(async (achievement: string): Promise<boolean> => {
    return sendNotification({
      title: 'Félicitations ! 🎉',
      body: achievement,
      tag: 'congratulations',
      requireInteraction: false
    });
  }, [sendNotification]);

  // Envoyer une notification de nouveau contenu
  const sendNewContentNotification = useCallback(async (contentTitle: string): Promise<boolean> => {
    return sendNotification({
      title: 'Nouveau contenu disponible 📖',
      body: `"${contentTitle}" est maintenant disponible`,
      tag: 'new-content',
      requireInteraction: false
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
    sendStudyReminder,
    sendCongratulations,
    sendNewContentNotification,
    badgeCount: notifications.filter(n => !n.read).length
  };
};
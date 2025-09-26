import { useState, useEffect, useCallback } from 'react';
import { PushNotificationService } from '../services/PushNotificationService';
import { useNotification } from '../context/NotificationContext';

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permission: NotificationPermission;
    isEnabled: boolean;
    requestPermission: () => Promise<boolean>;
    showPushNotification: (title: string, body: string, options?: any) => Promise<boolean>;
    scheduleNotification: (title: string, body: string, delayMs: number) => number;
    cancelNotification: (id: number) => void;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
    const pushService = PushNotificationService.getInstance();
    const { addNotification } = useNotification();
    
    const [permission, setPermission] = useState<NotificationPermission>(pushService.permissionStatus);
    const [isSupported] = useState(pushService.isNotificationSupported);

    useEffect(() => {
        // Écouter les changements de permission (rare mais possible)
        const checkPermission = () => {
            setPermission(Notification.permission);
        };

        // Vérifier la permission périodiquement
        const interval = setInterval(checkPermission, 5000);
        return () => clearInterval(interval);
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        const granted = await pushService.requestPermission();
        setPermission(pushService.permissionStatus);
        
        if (granted) {
            addNotification('Notifications push activées ! Vous recevrez maintenant des alertes système.', 'success');
        } else {
            addNotification('Permission refusée. Vous pouvez l\'activer dans les paramètres du navigateur.', 'warning');
        }
        
        return granted;
    }, [pushService, addNotification]);

    const showPushNotification = useCallback(async (
        title: string, 
        body: string, 
        options: any = {}
    ): Promise<boolean> => {
        const success = await pushService.showNotification(title, { 
            body, 
            tag: 'centre-scientifique',
            requireInteraction: false,
            ...options 
        });
        
        if (!success && isSupported) {
            // Fallback: afficher la notification dans l'app si la push notification échoue
            addNotification(body, 'info');
        }
        
        return success;
    }, [pushService, isSupported, addNotification]);

    const scheduleNotification = useCallback((
        title: string, 
        body: string, 
        delayMs: number
    ): number => {
        return pushService.scheduleNotification(title, body, delayMs);
    }, [pushService]);

    const cancelNotification = useCallback((id: number): void => {
        pushService.cancelScheduledNotification(id);
    }, [pushService]);

    return {
        isSupported,
        permission,
        isEnabled: pushService.isEnabled,
        requestPermission,
        showPushNotification,
        scheduleNotification,
        cancelNotification,
    };
};
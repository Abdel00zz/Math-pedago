import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastNotification, ToastNotificationType } from '../types';

interface NotificationContextType {
    addNotification: (
        title: string,
        type?: ToastNotificationType,
        options?: Partial<Omit<ToastNotification, 'id' | 'title' | 'type'>>
    ) => void;
    notifications: ToastNotification[];
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<ToastNotification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback(
        (
            title: string,
            type: ToastNotificationType = 'success',
            options: Partial<Omit<ToastNotification, 'id' | 'title' | 'type'>> = {}
        ) => {
            const id = uuidv4();
            const duration = options.duration || 5000;
            const newNotification: ToastNotification = {
                id,
                title,
                message: options.message || '',
                type,
                action: options.action,
                duration,
            };

            setNotifications(prev => [newNotification, ...prev]);
            
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        },
        [removeNotification]
    );

    return (
        <NotificationContext.Provider value={{ addNotification, notifications, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

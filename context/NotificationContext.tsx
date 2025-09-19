
import React, { createContext, useState, useCallback, ReactNode, useContext, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    addNotification: (message: string, type?: NotificationType) => void;
    notifications: Notification[];
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const timeouts = useRef<Record<string, NodeJS.Timeout>>({});

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (timeouts.current[id]) {
            clearTimeout(timeouts.current[id]);
            delete timeouts.current[id];
        }
    }, []);

    const addNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = uuidv4();
        setNotifications(prev => [...prev, { id, message, type }]);
        timeouts.current[id] = setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    useEffect(() => {
        return () => {
            Object.values(timeouts.current).forEach(clearTimeout);
        };
    }, []);

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

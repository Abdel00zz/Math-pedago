import React from 'react';
import { UINotification } from '../hooks/useNotificationGenerator';
import Modal from './Modal';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: UINotification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications }) => {
    const formatTimestamp = (timestamp: number): string => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const diffDays = Math.floor(diffSeconds / 86400);

        const isSameDay = (d1: Date, d2: Date) => 
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        if (isSameDay(now, date)) {
            const diffHours = Math.floor(diffSeconds / 3600);
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffSeconds / 60);
                if (diffMinutes < 1) return "à l'instant";
                if (diffMinutes === 1) return "il y a 1 minute";
                return `il y a ${diffMinutes} minutes`;
            }
            if (diffHours === 1) return "il y a 1 heure";
            return `il y a ${diffHours} heures`;
        }
        
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        if (isSameDay(yesterday, date)) {
            return `Hier`;
        }

        if (diffDays < 7) {
            return date.toLocaleDateString('fr-FR', { weekday: 'long' });
        }

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="" // Le titre est géré à l'intérieur pour un style personnalisé
            className="sm:max-w-xl"
        >
            <div className="p-2">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-playfair text-text">Notifications</h2>
                    <div className="w-24 h-px bg-border-hover mx-auto mt-3"></div>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto -mr-4 pr-4">
                    {notifications.length > 0 ? (
                        <ul className="space-y-4">
                            {notifications.map((notif, index) => (
                                <li key={index} className="p-4 bg-background/50 border-l-4 border-primary/50 rounded-r-lg">
                                    <div className="font-garamond">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-text text-lg pr-4">{notif.title}</h4>
                                            {notif.timestamp && (
                                                <span className="text-sm font-medium text-text-secondary flex-shrink-0 whitespace-nowrap">
                                                    {formatTimestamp(notif.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-text-secondary text-base mt-1" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-secondary">
                            <span className="material-symbols-outlined text-5xl">notifications_off</span>
                            <p className="text-lg font-garamond mt-4">Vous n'avez aucune nouvelle notification.</p>
                            <p className="text-base font-garamond italic mt-1">Tout est à jour !</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NotificationCenter;
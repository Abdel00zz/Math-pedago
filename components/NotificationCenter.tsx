import React from 'react';
// Fix: The UINotification type is defined in '../types' and should be imported from there directly.
import { UINotification } from '../types';
import Modal from './Modal';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: UINotification[];
}

const getIconForNotification = (title: string): string => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('mis à jour')) return 'update';
    if (lowerCaseTitle.includes('nouveau') || lowerCaseTitle.includes('disponible')) return 'new_releases';
    if (lowerCaseTitle.includes('imminente')) return 'podcasts';
    if (lowerCaseTitle.includes('score') || lowerCaseTitle.includes('travail') || lowerCaseTitle.includes('bravo') || lowerCaseTitle.includes('terminé')) return 'emoji_events';
    if (lowerCaseTitle.includes('bienvenue')) return 'waving_hand';
    return 'notifications';
};

const timeAgo = (timestamp: number): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return `il y a ${years} an${years > 1 ? 's' : ''}`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return `il y a ${Math.floor(interval)} mois`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return `il y a ${minutes} min`;
    }
    return "à l'instant";
};


const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications }) => {
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
                            {notifications.map((notif) => (
                                <li key={notif.id} className="p-4 bg-background/50 rounded-lg flex items-start gap-4 border border-border transition-all hover:border-border-hover hover:bg-surface/50">
                                     <span className="material-symbols-outlined text-primary mt-1">
                                        {getIconForNotification(notif.title)}
                                    </span>
                                    <div className="font-garamond flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-text text-lg">{notif.title}</h4>
                                            <span className="text-xs text-text-secondary whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
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
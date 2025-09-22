import React from 'react';
import { UINotification } from '../hooks/useNotificationGenerator';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: UINotification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications }) => {
    if (!isOpen) return null;

    return (
        // Transparent backdrop to catch outside clicks
        <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
            aria-hidden="true"
        >
            {/* Popover panel */}
            <div 
                className="absolute w-full max-w-sm bg-surface border border-border shadow-claude transition-opacity duration-300 origin-bottom-right sm:origin-top-right animate-fadeIn notification-popover-arrow right-4 bottom-20 sm:bottom-auto sm:top-14 rounded-xl"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-label="Notifications"
            >
                <div className="p-4 border-b border-border">
                    <h3 className="font-bold text-text font-serif">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {notifications.map((notif, index) => (
                                <li key={index} className="p-4 flex items-start gap-3 hover:bg-background/50 transition-colors">
                                    <span className="mt-1.5 flex-shrink-0 w-2 h-2 bg-primary rounded-full"></span>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-text text-sm">{notif.title}</h4>
                                        <p className="text-text-secondary text-sm" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center p-8 text-secondary">
                            <p className="text-sm font-serif">Vous n'avez aucune nouvelle notification.</p>
                            <p className="text-xs mt-1">Tout est à jour !</p>
                        </div>
                    )}
                </div>
                 <div className="p-2 border-t border-border text-center">
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-primary hover:underline font-serif">Afficher tout</a>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
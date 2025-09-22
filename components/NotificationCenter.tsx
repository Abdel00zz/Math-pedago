import React from 'react';
import { UINotification } from '../hooks/useNotificationGenerator';
import Modal from './Modal';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: UINotification[];
}

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
                            {notifications.map((notif, index) => (
                                <li key={index} className="p-4 bg-background/50 border-l-4 border-primary/50 rounded-r-lg">
                                    <div className="font-garamond">
                                        <h4 className="font-semibold text-text text-lg">{notif.title}</h4>
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
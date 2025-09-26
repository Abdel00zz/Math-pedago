import React, { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import Modal from './Modal';

interface PushNotificationSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ isOpen, onClose }) => {
    const { 
        isSupported, 
        permission, 
        isEnabled, 
        requestPermission, 
        showPushNotification 
    } = usePushNotifications();
    
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestPermission = async () => {
        setIsRequesting(true);
        await requestPermission();
        setIsRequesting(false);
    };

    const handleTestNotification = async () => {
        const success = await showPushNotification(
            'Test Notification',
            'Ceci est un test de notification push du Centre Scientifique !',
            { requireInteraction: false }
        );
        
        if (!success) {
            console.warn('Test de notification échoué');
        }
    };

    const getPermissionStatus = () => {
        switch (permission) {
            case 'granted':
                return { text: 'Autorisé', color: 'text-success', icon: 'check_circle' };
            case 'denied':
                return { text: 'Refusé', color: 'text-error', icon: 'block' };
            default:
                return { text: 'Non demandé', color: 'text-warning', icon: 'help' };
        }
    };

    const status = getPermissionStatus();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notifications Push" className="sm:max-w-md">
            <div className="mt-4 space-y-6">
                {!isSupported ? (
                    <div className="text-center p-6 bg-error/10 border border-error/20 rounded-lg">
                        <span className="material-symbols-outlined text-4xl text-error">browser_not_supported</span>
                        <h3 className="text-lg font-bold text-error mt-2">Non Supporté</h3>
                        <p className="text-text-secondary mt-2">
                            Votre navigateur ne supporte pas les notifications push.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Statut actuel */}
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-2xl ${status.color}`}>
                                    {status.icon}
                                </span>
                                <div>
                                    <h3 className="font-bold text-text">État des Notifications</h3>
                                    <p className={`text-sm ${status.color}`}>{status.text}</p>
                                </div>
                            </div>
                        </div>

                        {/* Explication */}
                        <div className="text-text-secondary text-sm leading-relaxed">
                            <p>
                                Les notifications push vous permettent de recevoir des alertes directement 
                                sur votre appareil, même lorsque l'application n'est pas ouverte.
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Rappels de séances en direct</li>
                                <li>Nouveaux chapitres disponibles</li>
                                <li>Messages d'encouragement</li>
                                <li>Notifications de progression</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {permission !== 'granted' && (
                                <button
                                    onClick={handleRequestPermission}
                                    disabled={isRequesting || permission === 'denied'}
                                    className="font-button w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed"
                                >
                                    {isRequesting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Demande en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">notifications_active</span>
                                            <span>Activer les Notifications</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {isEnabled && (
                                <button
                                    onClick={handleTestNotification}
                                    className="font-button w-full flex items-center justify-center gap-2 px-6 py-2 font-medium text-primary bg-primary-light border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    <span>Tester une Notification</span>
                                </button>
                            )}

                            {permission === 'denied' && (
                                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                                    <p className="text-warning font-medium">Permission refusée</p>
                                    <p className="text-text-secondary mt-1">
                                        Pour activer les notifications, accédez aux paramètres de votre navigateur 
                                        et autorisez les notifications pour ce site.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default PushNotificationSettings;
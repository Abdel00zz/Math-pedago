import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from '../context/NotificationContext';
import { ToastNotificationType } from '../types';

interface NotificationWithState {
    id: string;
    isLeaving: boolean;
}

export const Notifications: React.FC = () => {
    const { notifications, removeNotification } = useNotification();
    const [notificationStates, setNotificationStates] = useState<Map<string, NotificationWithState>>(new Map());

    // Synchroniser les états avec les notifications
    useEffect(() => {
        setNotificationStates(prev => {
            const newMap = new Map<string, NotificationWithState>(prev);

            // Ajouter les nouvelles notifications
            notifications.forEach(notif => {
                if (!newMap.has(notif.id)) {
                    newMap.set(notif.id, { id: notif.id, isLeaving: false });
                }
            });

            // Marquer comme "leaving" les notifications qui ont disparu
            const currentIds = new Set(notifications.map(n => n.id));
            newMap.forEach((state, id) => {
                const s = state as NotificationWithState;
                if (!currentIds.has(id) && !s.isLeaving) {
                    newMap.set(id, { ...s, isLeaving: true });
                    // Supprimer complètement après l'animation
                    setTimeout(() => {
                        setNotificationStates(m => {
                            const updated = new Map<string, NotificationWithState>(m);
                            updated.delete(id);
                            return updated;
                        });
                    }, 400);
                }
            });

            return newMap;
        });
    }, [notifications]);

    const portalRoot = document.body;
    if (!portalRoot) return null;

    // Design minimaliste et doux
    const typeInfo: { [key in ToastNotificationType]: {
        icon: string;
        bgColor: string;
        iconColor: string;
        borderColor: string;
    } } = {
        success: {
            icon: 'check_circle',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-200'
        },
        warning: {
            icon: 'info',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200'
        },
        error: {
            icon: 'error',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200'
        },
        info: {
            icon: 'info',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        },
    };

    // Filtrer les notifications à afficher (y compris celles qui partent)
    const displayNotifications = notifications.filter(notif =>
        notificationStates.has(notif.id)
    );

    if (displayNotifications.length === 0 && notificationStates.size === 0) {
        return null;
    }

    return ReactDOM.createPortal(
        <div
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
            role="region"
            aria-label="Notifications"
        >
            {displayNotifications.map((notif) => {
                const info = typeInfo[notif.type];
                const state = notificationStates.get(notif.id);
                const isLeaving = state?.isLeaving || false;

                const handleDismiss = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                };

                return (
                    <div
                        key={notif.id}
                        role="alert"
                        aria-live="polite"
                        aria-atomic="true"
                        className={`
                            relative w-full rounded-xl border ${info.borderColor} ${info.bgColor}
                            pointer-events-auto shadow-sm
                            transition-all duration-300 ease-out
                            ${isLeaving
                                ? 'opacity-0 -translate-y-4 scale-95'
                                : 'opacity-100 translate-y-0 scale-100'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform',
                        }}
                    >
                        {/* Contenu */}
                        <div className="flex items-start gap-3 p-4">
                            {/* Icône simple */}
                            <div className="flex-shrink-0 mt-0.5">
                                <span className={`material-symbols-outlined !text-xl ${info.iconColor}`}>
                                    {info.icon}
                                </span>
                            </div>

                            {/* Contenu textuel */}
                            <div className="flex-1 min-w-0">
                                {notif.title && (
                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
                                        {notif.title}
                                    </h4>
                                )}
                                {notif.message && (
                                    <p
                                        className="text-sm text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                )}
                            </div>

                            {/* Bouton fermer simple */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-gray-200/50
                                          transition-colors duration-150 flex items-center justify-center
                                          text-gray-400 hover:text-gray-600"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined !text-base">close</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

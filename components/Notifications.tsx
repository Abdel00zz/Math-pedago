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

    // Style minimaliste et épuré
    const typeInfo: { [key in ToastNotificationType]: { 
        icon: string; 
        bgColor: string;
        borderColor: string;
        textColor: string;
        iconBg: string;
    } } = {
        success: { 
            icon: 'check_circle', 
            bgColor: 'bg-white',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700',
            iconBg: 'bg-emerald-50'
        },
        warning: { 
            icon: 'info', 
            bgColor: 'bg-white',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700',
            iconBg: 'bg-amber-50'
        },
        error: { 
            icon: 'error_outline', 
            bgColor: 'bg-white',
            borderColor: 'border-rose-200',
            textColor: 'text-rose-700',
            iconBg: 'bg-rose-50'
        },
        info: { 
            icon: 'info', 
            bgColor: 'bg-white',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            iconBg: 'bg-blue-50'
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
            className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-1.5 w-full max-w-xs pointer-events-none"
            role="region"
            aria-label="Notifications"
        >
            {displayNotifications.map((notif) => {
                const info = typeInfo[notif.type];
                const state = notificationStates.get(notif.id);
                const isLeaving = state?.isLeaving || false;

                const handleActionClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (notif.action) {
                        notif.action.onClick();
                    }
                    removeNotification(notif.id);
                };

                const handleDismiss = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                };

                const isClickable = !!notif.action;

                return (
                    <div
                        key={notif.id}
                        role="alert"
                        aria-live="polite"
                        aria-atomic="true"
                        onClick={isClickable ? handleActionClick : undefined}
                        className={`
                            relative w-full rounded-lg
                            ${info.bgColor}
                            border ${info.borderColor}
                            shadow-sm
                            pointer-events-auto
                            transition-all duration-300 ease-out
                            ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
                            ${isLeaving
                                ? 'opacity-0 translate-x-8 scale-95'
                                : 'opacity-100 translate-x-0 scale-100 animate-slideInFromRight'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform',
                        }}
                    >
                        <div className="flex items-center gap-2 p-2">
                            {/* Icône minimaliste centrée verticalement */}
                            <div className="flex-shrink-0">
                                <div className={`w-6 h-6 rounded-md ${info.iconBg} flex items-center justify-center`}>
                                    <span className={`material-symbols-outlined !text-sm ${info.textColor}`}>
                                        {info.icon}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow min-w-0">
                                {notif.title && (
                                    <h4 className={`font-semibold text-xs leading-tight ${info.textColor}`}>
                                        {notif.title}
                                    </h4>
                                )}
                                {notif.message && (
                                    <div
                                        id={notif.id}
                                        className="text-[0.7rem] text-gray-600 leading-snug"
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                )}
                                
                                {notif.action && (
                                    <button
                                        onClick={handleActionClick}
                                        className={`mt-1 px-2 py-1 text-[0.65rem] font-medium rounded
                                            ${info.textColor} ${info.iconBg}
                                            hover:opacity-80
                                            transition-opacity duration-200`}
                                        aria-label={notif.action.label}
                                    >
                                        {notif.action.label}
                                    </button>
                                )}
                            </div>

                            {/* Bouton de fermeture minimaliste */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-5 h-5 rounded hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined !text-sm">close</span>
                            </button>
                        </div>

                        {/* Barre de progression fine en bas */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
                            <div 
                                className={`h-full ${info.iconBg}`}
                                style={{
                                    width: '100%',
                                    animation: `shrink ${notif.duration || 3000}ms linear forwards`
                                }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

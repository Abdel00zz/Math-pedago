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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 w-full max-w-lg px-4 pointer-events-none"
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
                            relative w-full rounded-xl
                            ${info.bgColor}
                            border ${info.borderColor}
                            shadow-md
                            pointer-events-auto
                            transition-all duration-300 ease-out
                            ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
                            ${isLeaving
                                ? 'opacity-0 -translate-y-4 scale-95'
                                : 'opacity-100 translate-y-0 scale-100 animate-slideInFromTop'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform',
                        }}
                    >
                        <div className="flex items-start gap-3 p-3.5">
                            {/* Icône minimaliste */}
                            <div className="flex-shrink-0">
                                <div className={`w-9 h-9 rounded-lg ${info.iconBg} flex items-center justify-center`}>
                                    <span className={`material-symbols-outlined !text-lg ${info.textColor}`}>
                                        {info.icon}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow min-w-0 pt-0.5">
                                {notif.title && (
                                    <h4 className={`font-semibold text-sm leading-snug mb-0.5 ${info.textColor}`}>
                                        {notif.title}
                                    </h4>
                                )}
                                {notif.message && (
                                    <div
                                        id={notif.id}
                                        className="text-xs text-gray-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                )}
                                
                                {notif.action && (
                                    <button
                                        onClick={handleActionClick}
                                        className={`mt-2 px-3 py-1.5 text-xs font-medium rounded-md
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
                                className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined !text-base">close</span>
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

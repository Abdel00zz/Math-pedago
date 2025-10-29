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
                    }, 300);
                }
            });

            return newMap;
        });
    }, [notifications]);

    const portalRoot = document.body;
    if (!portalRoot) return null;

    // Use subtle, theme-coherent toast styles (soft background + colored accent)
    const typeInfo: { [key in ToastNotificationType]: { bg: string; borderColor: string; icon: string; iconColor: string } } = {
        // success uses the app primary as a gentle accent; other types use subtle accent colors
        success: { bg: 'bg-surface/90', borderColor: 'border-primary/40', icon: 'check_circle', iconColor: 'text-primary' },
        warning: { bg: 'bg-surface/90', borderColor: 'border-amber-400/25', icon: 'warning', iconColor: 'text-amber-400' },
        error: { bg: 'bg-surface/90', borderColor: 'border-red-400/25', icon: 'error', iconColor: 'text-red-400' },
        info: { bg: 'bg-surface/90', borderColor: 'border-blue-400/25', icon: 'info', iconColor: 'text-blue-400' },
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
            className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[1000] flex flex-col-reverse gap-3 w-full max-w-sm pointer-events-none"
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
                            relative w-full p-3 rounded-lg
                            flex items-start gap-3 text-text overflow-hidden
                            border backdrop-blur-sm pointer-events-auto
                            transition-all duration-250 ease-out
                            ${info.bg} ${info.borderColor}
                            ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''}
                            ${isLeaving
                                ? 'opacity-0 translate-x-full scale-95'
                                : 'opacity-100 translate-x-0 scale-100 animate-slideInRight'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform',
                        }}
                    >
                        {/* Background subtle icon */}
                        <div className="flex-shrink-0 mt-0.5 z-10">
                            <span className={`material-symbols-outlined !text-2xl ${info.iconColor}`}>{info.icon}</span>
                        </div>

                        <div className="flex-grow z-10 min-w-0">
                            {notif.title && (
                                <h4 className="font-semibold text-text font-title text-base leading-tight break-words">
                                    {notif.title}
                                </h4>
                            )}
                            {notif.message && (
                                <p
                                    className="text-sm text-text-secondary font-sans mt-1 leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: notif.message }}
                                />
                            )}
                        </div>

                        <div className="flex-shrink-0 flex items-start gap-2 z-10">
                            {notif.action && (
                                <button
                                    onClick={handleActionClick}
                                    className="px-3 py-1.5 text-xs font-bold bg-white/25 hover:bg-white/35 active:bg-white/40 rounded-md transition-all flex-shrink-0 font-button shadow-lg"
                                    aria-label={notif.action.label}
                                >
                                    {notif.action.label}
                                </button>
                            )}

                            <button
                                onClick={handleDismiss}
                                className="p-1.5 -mr-1 -mt-1 rounded-full hover:bg-white/25 active:bg-white/35 transition-all flex-shrink-0"
                                aria-label="Fermer la notification"
                            >
                                <span className="material-symbols-outlined !text-xl">close</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

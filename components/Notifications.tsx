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

    // Minimalist shadcn-inspired styles - subtle, clean, monochromatic
    const typeInfo: { [key in ToastNotificationType]: { icon: string; iconColor: string } } = {
        success: { icon: 'check_circle', iconColor: 'text-green-600' },
        warning: { icon: 'warning', iconColor: 'text-amber-600' },
        error: { icon: 'error', iconColor: 'text-red-600' },
        info: { icon: 'info', iconColor: 'text-blue-600' },
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
                            relative w-full p-4 rounded-lg
                            flex items-start gap-3 overflow-hidden
                            bg-white border border-slate-200
                            shadow-sm pointer-events-auto
                            transition-all duration-250 ease-out
                            ${isClickable ? 'cursor-pointer hover:border-slate-300' : ''}
                            ${isLeaving
                                ? 'opacity-0 translate-x-full scale-95'
                                : 'opacity-100 translate-x-0 scale-100 animate-slideInRight'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform',
                        }}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <span className={`material-symbols-outlined !text-xl ${info.iconColor}`}>{info.icon}</span>
                        </div>

                        <div className="flex-grow min-w-0">
                            {notif.title && (
                                <h4 className="font-semibold text-slate-900 text-sm leading-tight break-words">
                                    {notif.title}
                                </h4>
                            )}
                            {notif.message && (
                                <p
                                    className="text-sm text-slate-600 mt-1 leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: notif.message }}
                                />
                            )}
                        </div>

                        <div className="flex-shrink-0 flex items-start gap-2">
                            {notif.action && (
                                <button
                                    onClick={handleActionClick}
                                    className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors flex-shrink-0"
                                    aria-label={notif.action.label}
                                >
                                    {notif.action.label}
                                </button>
                            )}

                            <button
                                onClick={handleDismiss}
                                className="p-1 -mr-1 -mt-1 rounded-md hover:bg-slate-100 transition-colors flex-shrink-0 text-slate-400 hover:text-slate-600"
                                aria-label="Fermer la notification"
                            >
                                <span className="material-symbols-outlined !text-lg">close</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

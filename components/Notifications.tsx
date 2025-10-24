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
            const newMap = new Map(prev);

            // Ajouter les nouvelles notifications
            notifications.forEach(notif => {
                if (!newMap.has(notif.id)) {
                    newMap.set(notif.id, { id: notif.id, isLeaving: false });
                }
            });

            // Marquer comme "leaving" les notifications qui ont disparu
            const currentIds = new Set(notifications.map(n => n.id));
            newMap.forEach((state, id) => {
                if (!currentIds.has(id) && !state.isLeaving) {
                    newMap.set(id, { ...state, isLeaving: true });
                    // Supprimer complètement après l'animation
                    setTimeout(() => {
                        setNotificationStates(m => {
                            const updated = new Map(m);
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

    const typeInfo: { [key in ToastNotificationType]: { bg: string; borderColor: string; icon: string; iconColor: string } } = {
        success: { bg: 'bg-green-500', borderColor: 'border-green-400', icon: 'check_circle', iconColor: 'text-green-100' },
        warning: { bg: 'bg-amber-500', borderColor: 'border-amber-400', icon: 'warning', iconColor: 'text-amber-100' },
        error: { bg: 'bg-red-500', borderColor: 'border-red-400', icon: 'error', iconColor: 'text-red-100' },
        info: { bg: 'bg-blue-500', borderColor: 'border-blue-400', icon: 'info', iconColor: 'text-blue-100' },
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
            className="fixed top-5 right-5 sm:top-8 sm:right-8 z-[1000] space-y-3 w-full max-w-sm pointer-events-none"
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
                            relative w-full p-4 rounded-xl shadow-2xl
                            flex items-start gap-4 text-white overflow-hidden
                            border-2 backdrop-blur-sm pointer-events-auto
                            transition-all duration-300 ease-out
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
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 !text-8xl text-white/10 select-none -rotate-12 pointer-events-none">{info.icon}</span>

                        <div className="flex-shrink-0 mt-0.5 z-10">
                            <span className={`material-symbols-outlined !text-2xl ${info.iconColor} drop-shadow-lg`}>{info.icon}</span>
                        </div>

                        <div className="flex-grow z-10 min-w-0">
                            {notif.title && (
                                <h4 className="font-bold text-white font-title text-lg leading-tight break-words">
                                    {notif.title}
                                </h4>
                            )}
                            {notif.message && (
                                <p
                                    className="text-sm text-white/95 font-sans mt-1 leading-relaxed break-words"
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

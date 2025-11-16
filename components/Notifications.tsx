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
        textColor: string;
        accent: string;
    } } = {
        success: { 
            icon: 'check_circle', 
            textColor: 'text-emerald-700',
            accent: 'text-emerald-500'
        },
        warning: { 
            icon: 'info', 
            textColor: 'text-amber-700',
            accent: 'text-amber-500'
        },
        error: { 
            icon: 'error_outline', 
            textColor: 'text-rose-700',
            accent: 'text-rose-500'
        },
        info: { 
            icon: 'info', 
            textColor: 'text-blue-700',
            accent: 'text-blue-500'
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
            className="fixed top-6 right-6 z-[1000] flex flex-col items-end gap-2 w-full max-w-sm pointer-events-none"
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
                            relative w-full sm:w-72 rounded-2xl
                            bg-white/92 backdrop-blur border border-slate-200/40
                            shadow-lg/40 pointer-events-auto
                            transition-all duration-250 ease-out
                            ${isClickable ? 'cursor-pointer hover:shadow-xl/40' : 'hover:shadow-xl/40'}
                            ${isLeaving
                                ? 'opacity-0 -translate-y-4 scale-95'
                                : 'opacity-100 translate-y-0 scale-100'
                            }
                        `}
                        style={{
                            transitionProperty: 'opacity, transform, box-shadow',
                        }}
                    >
                        <div className="flex items-center gap-3 px-3 py-2">
                            {/* Icône minimaliste centrée verticalement */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className={`relative w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm border border-slate-200/60`}>
                                        <span className={`material-symbols-outlined text-3xl ${info.accent}`}>
                                            {info.icon}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow min-w-0">
                                {notif.title && (
                                    <h4 className={`font-semibold text-sm leading-snug tracking-tight text-slate-900`}>
                                        {notif.title}
                                    </h4>
                                )}
                                {notif.message && (
                                    <div
                                        id={notif.id}
                                        className="text-[0.75rem] text-slate-500 leading-snug mt-0.5"
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                )}
                                
                                {notif.action && (
                                    <button
                                        onClick={handleActionClick}
                                        className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[0.7rem] font-medium
                                            rounded-full border border-slate-200/60
                                            text-slate-700 bg-white/85
                                            hover:bg-white hover:border-slate-300
                                            transition-colors duration-200`}
                                        aria-label={notif.action.label}
                                    >
                                        {notif.action.label}
                                    </button>
                                )}
                            </div>

                            {/* Bouton de fermeture minimaliste */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-6 h-6 rounded-lg bg-transparent hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        {/* Barre de progression supprimée pour une esthétique ultra minimaliste */}
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

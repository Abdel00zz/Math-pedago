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

    // Design pédagogique, doux et artistique
    const typeInfo: { [key in ToastNotificationType]: {
        icon: string;
        gradient: string;
        shadowColor: string;
        emoji: string;
    } } = {
        success: {
            icon: 'task_alt',
            gradient: 'from-emerald-400/90 via-teal-400/90 to-cyan-400/90',
            shadowColor: 'rgba(16, 185, 129, 0.3)',
            emoji: '✨'
        },
        warning: {
            icon: 'lightbulb',
            gradient: 'from-amber-400/90 via-orange-400/90 to-yellow-400/90',
            shadowColor: 'rgba(245, 158, 11, 0.3)',
            emoji: '💡'
        },
        error: {
            icon: 'info',
            gradient: 'from-rose-400/90 via-pink-400/90 to-red-400/90',
            shadowColor: 'rgba(239, 68, 68, 0.3)',
            emoji: 'ℹ️'
        },
        info: {
            icon: 'celebration',
            gradient: 'from-blue-400/90 via-indigo-400/90 to-violet-400/90',
            shadowColor: 'rgba(59, 130, 246, 0.3)',
            emoji: '🎯'
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-4 w-full max-w-md pointer-events-none px-4 sm:px-0"
            role="region"
            aria-label="Notifications pédagogiques"
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
                            relative w-full rounded-2xl overflow-hidden
                            pointer-events-auto
                            transition-all duration-400 ease-out
                            ${isLeaving
                                ? 'opacity-0 -translate-y-8 scale-90'
                                : 'opacity-100 translate-y-0 scale-100'
                            }
                        `}
                        style={{
                            animation: !isLeaving ? 'gentleFloat 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
                            transitionProperty: 'opacity, transform',
                            boxShadow: `0 10px 40px ${info.shadowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1) inset`,
                        }}
                    >
                        {/* Gradient de fond artistique */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-95`} />

                        {/* Motif décoratif subtil */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                                 radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
                                backgroundSize: '30px 30px, 40px 40px',
                            }}
                        />

                        {/* Contenu */}
                        <div className="relative flex items-start gap-4 p-5">
                            {/* Icône avec cercle lumineux */}
                            <div className="flex-shrink-0 relative">
                                <div
                                    className="absolute inset-0 bg-white/30 rounded-full blur-md"
                                    style={{ transform: 'scale(1.2)' }}
                                />
                                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                    <span className="material-symbols-outlined !text-3xl text-white drop-shadow-lg">
                                        {info.icon}
                                    </span>
                                </div>
                            </div>

                            {/* Contenu textuel */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl" role="img" aria-hidden="true">{info.emoji}</span>
                                    {notif.title && (
                                        <h4 className="font-bold text-white text-base leading-tight drop-shadow-md">
                                            {notif.title}
                                        </h4>
                                    )}
                                </div>
                                {notif.message && (
                                    <p
                                        className="text-sm text-white/95 leading-relaxed drop-shadow-sm font-medium"
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                )}
                            </div>

                            {/* Bouton fermer élégant */}
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30
                                          transition-all duration-200 flex items-center justify-center border border-white/20
                                          hover:scale-110 active:scale-95"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined !text-lg text-white">close</span>
                            </button>
                        </div>

                        {/* Barre de progression animée */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                                className="h-full bg-white/40"
                                style={{
                                    animation: `progressBar ${notif.duration || 3000}ms linear forwards`,
                                    transformOrigin: 'left',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};

import React, { createContext, useState, useCallback, ReactNode, useContext, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import katex from 'katex';
import { ToastNotification, ToastNotificationType } from '../types';

interface NotificationContextType {
    addNotification: (
        title: string,
        type?: ToastNotificationType,
        options?: Partial<Omit<ToastNotification, 'id' | 'title' | 'type'>>
    ) => void;
    // Add higher-level helpers
    addMotivationalNotification: (studentName: string, message?: string) => void;
    addTargetedNotification: (targetId: string, title: string, options?: Partial<Omit<ToastNotification, 'id' | 'title'>>) => void;
    notifications: ToastNotification[];
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configuration intelligente
const MAX_VISIBLE_NOTIFICATIONS = 3; // Limite de notifications visibles
const MAX_QUEUE_SIZE = 10; // Limite de la file d'attente
const DUPLICATE_WINDOW_MS = 3000; // Fenêtre de détection de doublons
const AUTO_CLEANUP_INTERVAL = 60000; // Nettoyage toutes les minutes

// Fonction pour générer un hash de notification (pour détecter les doublons)
const generateNotificationHash = (title: string, message: string): string => {
    return `${title}:${message}`.toLowerCase().trim();
};

const containsMathExpressions = (text: string): boolean => /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/.test(text);

const mathCompilationCache = new Map<string, string>();

const compileMathMessage = (message: string): string => {
    if (typeof window === 'undefined') {
        return message;
    }

    if (!containsMathExpressions(message)) {
        return message;
    }

    const cached = mathCompilationCache.get(message);
    if (cached) {
        return cached;
    }

    try {
        let result = message;

        // Traiter les math display ($$...$$)
        result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    strict: false,
                });
            } catch (e) {
                console.warn('[NotificationContext] KaTeX display error:', e);
                return match;
            }
        });

        // Traiter les math inline ($...$)
        result = result.replace(/\$([^\$]+?)\$/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    strict: false,
                });
            } catch (e) {
                console.warn('[NotificationContext] KaTeX inline error:', e);
                return match;
            }
        });

        mathCompilationCache.set(message, result);
        return result;
    } catch (error) {
        console.warn('[NotificationContext] Unable to prepare math message:', error);
        return message;
    }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<ToastNotification[]>([]);
    const [queue, setQueue] = useState<ToastNotification[]>([]);
    const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const recentHashesRef = useRef<Map<string, number>>(new Map());
    const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Nettoyage automatique des hashes anciens
    useEffect(() => {
        cleanupIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const hashes = recentHashesRef.current;
            for (const [hash, timestamp] of hashes.entries()) {
                if (now - timestamp > DUPLICATE_WINDOW_MS) {
                    hashes.delete(hash);
                }
            }
        }, AUTO_CLEANUP_INTERVAL);

        return () => {
            if (cleanupIntervalRef.current) {
                clearInterval(cleanupIntervalRef.current);
            }
        };
    }, []);

    // Nettoyer tous les timers au démontage
    useEffect(() => {
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    // Fonction pour traiter la file d'attente
    const processQueue = useCallback(() => {
        setQueue(currentQueue => {
            if (currentQueue.length === 0) return currentQueue;

            setNotifications(currentNotifs => {
                if (currentNotifs.length < MAX_VISIBLE_NOTIFICATIONS) {
                    const [next, ...remaining] = currentQueue;

                    // Programmer la suppression
                    const timer = setTimeout(() => {
                        removeNotification(next.id);
                    }, next.duration || 5000);

                    timersRef.current.set(next.id, timer);

                    // Traiter le reste de la queue après un délai
                    if (remaining.length > 0) {
                        setTimeout(processQueue, 500);
                    }

                    return [next, ...currentNotifs];
                }
                return currentNotifs;
            });

            return currentQueue.slice(1);
        });
    }, []);

    const removeNotification = useCallback((id: string) => {
        // Nettoyer le timer
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }

        setNotifications(prev => {
            const filtered = prev.filter(n => n.id !== id);
            // Traiter la queue si une notification a été supprimée
            if (filtered.length < prev.length) {
                setTimeout(processQueue, 300);
            }
            return filtered;
        });
    }, [processQueue]);

    const clearAll = useCallback(() => {
        // Nettoyer tous les timers
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();

        setNotifications([]);
        setQueue([]);
        recentHashesRef.current.clear();
    }, []);

    const scheduleNotificationDisplay = useCallback((notification: ToastNotification, hasMath: boolean) => {
        const baseDuration = notification.duration ?? 5000;
        const effectiveDuration = hasMath ? Math.max(baseDuration, 6000) : baseDuration;
        const notificationWithDuration: ToastNotification = {
            ...notification,
            duration: effectiveDuration,
        };

        setNotifications(prev => {
            if (prev.length < MAX_VISIBLE_NOTIFICATIONS) {
                const timer = setTimeout(() => {
                    removeNotification(notificationWithDuration.id);
                }, effectiveDuration);

                timersRef.current.set(notificationWithDuration.id, timer);
                return [notificationWithDuration, ...prev];
            }

            setQueue(currentQueue => {
                if (currentQueue.length >= MAX_QUEUE_SIZE) {
                    console.warn("File d'attente de notifications pleine");
                    return currentQueue;
                }
                return [...currentQueue, notificationWithDuration];
            });

            return prev;
        });
    }, [removeNotification]);

    // Core function used internally by wrappers
    const coreAddNotification = useCallback(
        (notification: Omit<ToastNotification, 'id'>) => {
            const title = notification.title || '';
            // Validation
            if (!title || title.trim() === '') {
                console.warn('Notification ignorée : titre vide');
                return;
            }

            const message = notification.message || '';
            const hash = generateNotificationHash(title, message);

            // Détection de doublons
            const now = Date.now();
            const lastShown = recentHashesRef.current.get(hash);
            if (lastShown && now - lastShown < DUPLICATE_WINDOW_MS) {
                console.log('Notification dupliquée ignorée:', title);
                return;
            }

            // Enregistrer le hash dès maintenant pour éviter les doublons pendant la compilation
            recentHashesRef.current.set(hash, now);

            const id = uuidv4();
            const hasMath = containsMathExpressions(message);

            const baseNotification: ToastNotification = {
                id,
                title: notification.title,
                message,
                type: notification.type || 'info',
                action: notification.action,
                duration: notification.duration,
            };

            const finalize = (preparedMessage: string) => {
                scheduleNotificationDisplay(
                    { ...baseNotification, message: preparedMessage },
                    hasMath
                );
            };

            if (hasMath) {
                try {
                    const preparedMessage = compileMathMessage(message);
                    finalize(preparedMessage);
                } catch (error) {
                    console.warn('[NotificationContext] Fallback vers message brut (KaTeX indisponible):', error);
                    finalize(message);
                }
            } else {
                finalize(message);
            }
        },
        [scheduleNotificationDisplay]
    );

    // Backwards-compatible wrapper keeping original signature
    const addNotification = useCallback(
        (
            title: string,
            type: ToastNotificationType = 'success',
            options: Partial<Omit<ToastNotification, 'id' | 'title' | 'type'>> = {}
        ) => coreAddNotification({ title, message: options.message || '', type, action: options.action, duration: options.duration }),
        [coreAddNotification]
    );

    // Higher-level helpers
    const addMotivationalNotification = useCallback((studentName: string, message?: string) => {
        const title = `Bravo ${studentName} !`;
        const msg = message || "Continue comme ça — petit objectif atteint 🎯";
        
        // Durée adaptative : plus longue si la notification contient des formules mathématiques
        const containsMath = /\$[^$]+\$/.test(msg);
        const duration = containsMath ? 7000 : 6000;
        
        coreAddNotification({ title, message: msg, type: 'success', duration });
    }, [coreAddNotification]);

    const addTargetedNotification = useCallback((targetId: string, title: string, options: Partial<Omit<ToastNotification, 'id' | 'title'>> = {}) => {
        // targetId can be stored in message metadata or used by consumers; keep simple for now
        const prefixedMessage = options.message ? `${options.message} (Cible: ${targetId})` : `(Cible: ${targetId})`;
        coreAddNotification({ title, message: prefixedMessage, type: options.type || 'info', action: options.action, duration: options.duration });
    }, [coreAddNotification]);

    return (
        <NotificationContext.Provider value={{ addNotification, notifications, removeNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

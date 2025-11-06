import React, { createContext, useState, useCallback, ReactNode, useContext, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
const DURATION_REDUCTION_FACTOR = 0.7; // Réduction de 30 %
const MIN_DURATION_MS = 1200; // Garder une durée minimale lisible

// Fonction pour générer un hash de notification (pour détecter les doublons)
const generateNotificationHash = (title: string, message: string): string => {
    return `${title}:${message}`.toLowerCase().trim();
};

const containsMathExpressions = (text: string): boolean => /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/.test(text);

const mathCompilationCache = new Map<string, string>();

const compileMathMessage = async (message: string): Promise<string> => {
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

    let mathJax = window.MathJax;
    if (!mathJax) {
        await new Promise<void>((resolve) => {
            const start = performance.now();
            const attempt = () => {
                mathJax = window.MathJax;
                if (mathJax || performance.now() - start > 1200) {
                    resolve();
                } else {
                    setTimeout(attempt, 25);
                }
            };
            attempt();
        });
    }

    if (!mathJax) {
        return message;
    }

    try {
        if (mathJax.startup?.promise) {
            await mathJax.startup.promise;
        }

        const adaptor = mathJax.startup?.adaptor;
        const tex2chtmlPromise = mathJax.tex2chtmlPromise;
        const tex2chtml = mathJax.tex2chtml;

        if (!adaptor || (!tex2chtmlPromise && !tex2chtml)) {
            return message;
        }

        const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
        let result = '';
        let lastIndex = 0;
        const matches = [...message.matchAll(mathRegex)];

        if (matches.length === 0) {
            mathCompilationCache.set(message, message);
            return message;
        }

        for (const match of matches) {
            const index = match.index ?? 0;
            result += message.slice(lastIndex, index);

            const rawMath = (match[1] ?? match[2] ?? '').trim();
            const display = Boolean(match[1]);

            if (!rawMath) {
                result += match[0];
                lastIndex = index + match[0].length;
                continue;
            }

            try {
                mathJax.texReset?.();
                const node = tex2chtml
                    ? tex2chtml(rawMath, { display })
                    : await tex2chtmlPromise!(rawMath, { display });
                result += adaptor.outerHTML(node);
            } catch (compileError) {
                console.warn('[NotificationContext] MathJax compile error:', compileError);
                result += match[0];
            }

            lastIndex = index + match[0].length;
        }

        result += message.slice(lastIndex);
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
            const targetDuration = hasMath ? Math.max(baseDuration, 6000) : baseDuration;
            const effectiveDuration = Math.max(
                MIN_DURATION_MS,
                Math.round(targetDuration * DURATION_REDUCTION_FACTOR)
            );
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
                compileMathMessage(message)
                    .then(finalize)
                    .catch(error => {
                        console.warn('[NotificationContext] Fallback vers message brut (MathJax indisponible):', error);
                        finalize(message);
                    });
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

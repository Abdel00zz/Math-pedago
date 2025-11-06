import React, { useState, useEffect, useMemo } from 'react';

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures
const UPDATE_INTERVAL_MS = 60000; // 1 minute

interface SessionStatusProps {
    dates: string[];
}

type SessionStatusInfo = 
    | { status: 'live'; text: string; icon: string }
    | { status: 'upcoming'; prefix: string; text: string; icon: string }
    | { status: 'past'; text: string; icon: string }
    | { status: 'none'; text: string; icon: string };

// ✅ OPTIMISATION 1: Cache pour les dates parsées (évite reparsing constant)
const parsedDatesCache = new Map<string, Date[]>();

const getParsedDates = (dates: string[]): Date[] => {
    const cacheKey = dates.join('|');
    
    if (parsedDatesCache.has(cacheKey)) {
        return parsedDatesCache.get(cacheKey)!;
    }
    
    const parsed = dates
        .map(d => new Date(d))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
    
    parsedDatesCache.set(cacheKey, parsed);
    
    // Limiter la taille du cache
    if (parsedDatesCache.size > 50) {
        const firstKey = parsedDatesCache.keys().next().value;
        parsedDatesCache.delete(firstKey);
    }
    
    return parsed;
};

const SessionStatus: React.FC<SessionStatusProps> = React.memo(({ dates }) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), UPDATE_INTERVAL_MS);
        return () => clearInterval(timer);
    }, []);

    // ✅ OPTIMISATION 2: Mémorisation des dates parsées
    const parsedDates = useMemo(() => {
        if (!Array.isArray(dates) || dates.length === 0) {
            return [];
        }
        return getParsedDates(dates);
    }, [dates]);

    // ✅ OPTIMISATION 3: Calcul du status mémorisé et optimisé
    const sessionInfo = useMemo((): SessionStatusInfo => {
        if (parsedDates.length === 0) {
            return { status: 'none', text: 'Aucune séance programmée', icon: 'event_busy' };
        }

        const nowTime = now.getTime();

        // Vérifier si une session est en cours
        const liveSession = parsedDates.find(date => {
            const dateTime = date.getTime();
            const sessionEnd = dateTime + SESSION_DURATION_MS;
            return nowTime >= dateTime && nowTime <= sessionEnd;
        });

        if (liveSession) {
            const timeFormat: Intl.DateTimeFormatOptions = { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'Europe/Paris' 
            };
            const startTimeString = liveSession.toLocaleTimeString('fr-FR', timeFormat).replace(':', 'h');
            const endTimeString = new Date(liveSession.getTime() + SESSION_DURATION_MS)
                .toLocaleTimeString('fr-FR', timeFormat)
                .replace(':', 'h');
            
            return { 
                status: 'live', 
                text: `En direct (${startTimeString} - ${endTimeString})`,
                icon: 'podcasts'
            };
        }

        // Trouver la prochaine session
        const nextSession = parsedDates.find(date => date.getTime() > nowTime);
        
        if (nextSession) {
            const nextSessionTime = nextSession.getTime();
            const timeDiff = nextSessionTime - nowTime;
            const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            const timeFormat: Intl.DateTimeFormatOptions = { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'Europe/Paris' 
            };
            const timeString = nextSession.toLocaleTimeString('fr-FR', timeFormat).replace(':', 'h');
            
            // ✅ OPTIMISATION 4: Calculs de dates simplifiés
            const nowDate = now.getDate();
            const nextDate = nextSession.getDate();
            const tomorrow = new Date(nowTime + 24 * 60 * 60 * 1000);
            
            let formattedDate: string;
            
            if (daysUntil === 0 && nextDate === nowDate) {
                formattedDate = `Aujourd'hui à ${timeString}`;
            } else if (daysUntil <= 1 && nextDate === tomorrow.getDate()) {
                formattedDate = `Demain à ${timeString}`;
            } else {
                formattedDate = new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    ...timeFormat
                }).format(nextSession).replace(':', 'h');
            }
            
            return { 
                status: 'upcoming', 
                prefix: 'Prochaine séance Live : ',
                text: formattedDate,
                icon: 'update'
            };
        }

        // Toutes les sessions sont passées
        return { 
            status: 'past', 
            text: 'Session terminée', 
            icon: 'history'
        };

    }, [parsedDates, now]);

    // ✅ OPTIMISATION 5: Render optimisé avec switch
    switch (sessionInfo.status) {
        case 'live':
            return (
                <div className="flex items-center gap-2.5 text-text font-semibold">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold tracking-wide">LIVE</span>
                        <span className="text-gray-900 text-sm font-medium">{sessionInfo.text}</span>
                    </span>
                </div>
            );
        case 'upcoming':
            return (
                <div className="flex flex-col items-start gap-1.5 font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-800 font-semibold tracking-wide text-xs">
                            Prochaine séance:
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-red-600 serif-text tracking-tight">
                            {sessionInfo.text}
                        </p>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100/60 text-emerald-700 px-2 py-0.5 rounded-full">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40 animate-pulse"></span>
                            <span className="font-bold text-xs tracking-wider">LIVE</span>
                        </span>
                    </div>
                </div>
            );
        case 'past':
        case 'none':
            return (
                <div className="flex items-center gap-2 text-text-secondary italic">
                    <span className="material-symbols-outlined !text-sm">{sessionInfo.icon}</span>
                    <p className="text-sm serif-text">{sessionInfo.text}</p>
                </div>
            );
        default:
            return null;
    }
});

// ✅ OPTIMISATION 6: Fonction utilitaire pour nettoyer le cache si besoin
export const clearSessionCache = () => {
    parsedDatesCache.clear();
};

export default SessionStatus;
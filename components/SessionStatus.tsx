import React, { useState, useEffect, useMemo } from 'react';

// Constantes
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

const SessionStatus: React.FC<SessionStatusProps> = React.memo(({ dates }) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), UPDATE_INTERVAL_MS);
        return () => clearInterval(timer);
    }, []);

    const sessionInfo = useMemo((): SessionStatusInfo => {
        if (!Array.isArray(dates) || dates.length === 0) {
            return { status: 'none', text: 'Aucune séance programmée', icon: 'event_busy' };
        }
        
        const parsedDates = dates
            .map(d => new Date(d))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());

        if (parsedDates.length === 0) {
            return { status: 'none', text: 'Date invalide', icon: 'error_outline' };
        }

        // Vérifier si une session est en cours
        const liveSession = parsedDates.find(date => {
            const sessionEnd = new Date(date.getTime() + SESSION_DURATION_MS);
            return now >= date && now <= sessionEnd;
        });

        if (liveSession) {
            const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' };
            const startTimeString = liveSession.toLocaleTimeString('fr-FR', timeFormat).replace(':', 'h');
            const endTimeString = new Date(liveSession.getTime() + SESSION_DURATION_MS).toLocaleTimeString('fr-FR', timeFormat).replace(':', 'h');
            return { 
                status: 'live', 
                text: `En direct (${startTimeString} - ${endTimeString})`,
                icon: 'podcasts'
            };
        }

        // Trouver la prochaine session
        const nextSession = parsedDates.find(date => date > now);
        if (nextSession) {
            const timeDiff = nextSession.getTime() - now.getTime();
            const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            let formattedDate;
            const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' };
            const timeString = nextSession.toLocaleTimeString('fr-FR', timeFormat).replace(':', 'h');
            
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            if (daysUntil === 0 && nextSession.getDate() === now.getDate()) {
                formattedDate = `Aujourd'hui à ${timeString}`;
            } else if (daysUntil <= 1 && nextSession.getDate() === tomorrow.getDate()) {
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

        // S'il y a des dates, mais qu'elles sont toutes passées
        if(parsedDates.length > 0) {
            return { 
                status: 'past', 
                text: 'Session terminée', 
                icon: 'history'
            };
        }
        
        // Fallback
        return { status: 'none', text: 'Aucune séance programmée', icon: 'event_busy' };

    }, [dates, now]);

    switch (sessionInfo.status) {
        case 'live':
            return (
                <div className="flex items-center gap-2 text-text font-semibold">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-base serif-text">{sessionInfo.text}</p>
                </div>
            );
        case 'upcoming':
            return (
                <div className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-success animate-blink"></span>
                    <p className="text-base serif-text">
                        <span className="text-success">{sessionInfo.prefix}</span>
                        <span className="text-text-secondary">{sessionInfo.text}</span>
                    </p>
                </div>
            );
        case 'past':
        case 'none': {
            const textStyle = "text-text-secondary italic";
            return (
                <div className={`flex items-center gap-2 ${textStyle}`}>
                    <span className="material-symbols-outlined !text-base">{sessionInfo.icon}</span>
                    <p className="text-base serif-text">{sessionInfo.text}</p>
                </div>
            );
        }
        default:
            return null;
    }
});

export default SessionStatus;
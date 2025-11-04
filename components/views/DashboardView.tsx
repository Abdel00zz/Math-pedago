import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Chapter } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import { useNotification } from '../../context/NotificationContext';
import ChapterSection from '../ChapterSection';
import GlobalActionButtons from '../GlobalActionButtons';
import StandardHeader from '../StandardHeader';

// ✅ OPTIMISATION 1: Suppression du code mort (CacheService, useThemePreference, useIdleDetection)
// Ces hooks/services étaient créés mais jamais utilisés

interface CategorizedActivities {
    inProgress: Chapter[];
    completed: Chapter[];
    upcoming: Chapter[];
}

const DashboardView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const { profile, activities, progress, chapterOrder } = state;

    // ✅ OPTIMISATION 3: Calcul du greeting mémorisé (ne change qu'une fois par session)
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Bonjour';
        if (hour >= 12 && hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []).trim(); // Ensure no whitespace duplicates

    const className = useMemo(() => {
        if (!profile) return '';
        return CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || '';
    }, [profile]);

    const typedNameStyles = useMemo(() => ({ '--name-length': Math.max(profile?.name?.length ?? 0, 8) } as React.CSSProperties), [profile?.name]);
    const [typedName, setTypedName] = useState(profile?.name ?? '');
    const [isTypingName, setIsTypingName] = useState(false);

    useEffect(() => {
        if (!profile?.name) {
            setTypedName('');
            setIsTypingName(false);
            return;
        }

        const target = profile.name;
        setTypedName('');
        setIsTypingName(true);

        const letters = Array.from(target);
        const baseDelay = Math.max(45, 140 - letters.length * 4);
        let index = 0;

        const interval = window.setInterval(() => {
            index += 1;
            setTypedName(letters.slice(0, index).join(''));

            if (index >= letters.length) {
                window.clearInterval(interval);
                setIsTypingName(false);
            }
        }, baseDelay);

        return () => window.clearInterval(interval);
    }, [profile?.name]);

    const formatClassNameHTML = useCallback((name: string): string => {
        return name.replace(/(\d+)(ère|ème|er|re|e)/gi, '$1<sup>$2</sup>');
    }, []);

    // ✅ OPTIMISATION 4: Catégorisation optimisée avec reduce
    const categorizedActivities = useMemo((): CategorizedActivities => {
        if (!profile) return { inProgress: [], completed: [], upcoming: [] };

        const allUserActivities = chapterOrder
            .map(id => activities[id])
            .filter(Boolean);

        return allUserActivities.reduce<CategorizedActivities>(
            (acc, chapter) => {
                const chapterProgress = progress[chapter.id];
                if (chapterProgress?.isWorkSubmitted) {
                    acc.completed.push(chapter);
                } else if (chapter.isActive) {
                    acc.inProgress.push(chapter);
                } else {
                    acc.upcoming.push(chapter);
                }
                return acc;
            },
            { inProgress: [], completed: [], upcoming: [] }
        );
    }, [activities, progress, profile, chapterOrder]);

    // ✅ OPTIMISATION 5: handleChapterSelect avec useCallback
    const handleChapterSelect = useCallback((chapterId: string) => {
        const chapter = activities[chapterId];
        if (chapter && (chapter.isActive || progress[chapterId]?.isWorkSubmitted)) {
            // If the chapter had an update flag, mark it as seen and remove related UI notifications
            if (progress[chapterId]?.hasUpdate) {
                dispatch({ type: 'MARK_UPDATE_SEEN', payload: { chapterId } });
                addNotification('Contenu consulté', 'info', { message: `Vous avez ouvert le chapitre "${chapter.chapter}".`, duration: 3000 });
            }

            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        } else {
            // Gérer le cas où le chapitre est verrouillé
            addNotification('Chapitre verrouillé', 'warning', {
                message: `Le chapitre "${chapter?.chapter || 'sélectionné'}" n'est pas encore disponible.`,
                duration: 3000
            });
        }
    }, [activities, progress, dispatch, addNotification]);

    if (!profile) {
        return (
            <>
                <GlobalActionButtons />
                <div className="dashboard-shell">
                    <div className="dashboard-empty-card">
                        <span className="material-symbols-outlined !text-4xl text-text-secondary block mb-3">warning</span>
                        <h2 className="text-xl font-semibold text-text mb-2">Profil introuvable</h2>
                        <p className="font-sans text-sm text-text-secondary">
                            Veuillez vous reconnecter pour accéder à votre espace personnel.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    const { inProgress, completed, upcoming } = categorizedActivities;
    const hasAnyActivity = inProgress.length > 0 || completed.length > 0 || upcoming.length > 0;
    
    return (
        <>
            <GlobalActionButtons />

                        <div className="dashboard-shell">
                <div className="dashboard-header-minimal">
                    <div className="dashboard-hero">
                        <div className="dashboard-hero__greeting">
                            <h1 className="dashboard-hero__title">
                                <span className="dashboard-hero__title-salutation">{greeting}</span>
                                <span className="dashboard-hero__title-comma">,</span>
                                <span className={`student-name-animated dashboard-hero__title-name`} style={typedNameStyles}>
                                    <span className={`${isTypingName ? 'is-typing' : 'is-complete'}`}>
                                        {typedName}
                                    </span>
                                </span>
                                <span className="dashboard-hero__title-exclamation">!</span>
                            </h1>
                            <div 
                                className="dashboard-hero__meta" 
                                dangerouslySetInnerHTML={{ __html: formatClassNameHTML(className) }}
                            />
                        </div>

                    </div>
                </div>

                {hasAnyActivity ? (
                    <div className="dashboard-section-stack">
                        <ChapterSection
                            title="Chapitres en cours"
                            chapters={inProgress}
                            progress={progress}
                            onSelect={handleChapterSelect}
                        />
                        <ChapterSection
                            title="Chapitres achevés"
                            chapters={completed}
                            progress={progress}
                            onSelect={handleChapterSelect}
                            icon="✓"
                        />
                        <ChapterSection
                            title="Chapitres à venir"
                            chapters={upcoming}
                            progress={progress}
                            onSelect={handleChapterSelect}
                        />
                    </div>
                ) : (
                    <div className="dashboard-empty-card">
                        <span className="text-4xl sm:text-5xl text-text-disabled block mb-3">◎</span>
                        <h2 className="text-lg sm:text-xl font-semibold text-text mb-2">Aucun chapitre disponible</h2>
                        <p className="font-sans text-sm sm:text-base text-text-secondary italic">
                            Les chapitres pour votre classe seront bientôt révélés.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="dashboard-cta"
                            type="button"
                        >
                            Rafraîchir la page
                        </button>
                    </div>
                )}

                <footer className="dashboard-footer">
                    <span className="dashboard-footer__brand">Center Scientific</span>
                    <div className="dashboard-footer__divider" />
                    <span className="dashboard-footer__title">of Mathematics</span>
                    <p className="dashboard-footer__tagline">
                        © {new Date().getFullYear()} · Votre parcours d'apprentissage interactif
                    </p>
                </footer>
            </div>
        </>
    );
};

export default DashboardView;
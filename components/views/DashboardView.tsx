import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import { useNotification } from '../../context/NotificationContext';
import ChapterSection from '../ChapterSection';
import GlobalActionButtons from '../GlobalActionButtons';
import StandardHeader from '../StandardHeader';
import { LESSON_PROGRESS_REFRESH_EVENT } from '../../utils/lessonProgressHelpers';
import { sortChaptersByActiveSession, hasActiveSession, hasUpcomingSession } from '../../utils/chapterStatusHelpers';

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

    // 🔥 SOLUTION RADICALE: Forcer un refresh global quand le Dashboard est monté
    useEffect(() => {
        console.log('🔥 DashboardView mounted - broadcasting global refresh');
        // Dispatch un événement global pour forcer tous les ChapterCard à se rafraîchir
        window.dispatchEvent(new CustomEvent(LESSON_PROGRESS_REFRESH_EVENT, { 
            detail: { lessonId: 'GLOBAL_REFRESH' } 
        }));
    }, []); // Au montage seulement

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
        const withSup = name.replace(/(\d+)\s*(ère|ème|er|re|e)/gi, (_, number, suffix) => `${number}<sup>${suffix}</sup>`);
        return withSup.replace(/<\/sup>\s*(?=\S)/gi, '</sup>&nbsp;');
    }, []);

    // ✅ OPTIMISATION 4: Catégorisation optimisée avec reduce basée sur les statuts
    // Trier pour mettre les chapitres avec séances actives en premier
    const categorizedActivities = useMemo((): CategorizedActivities => {
        if (!profile) return { inProgress: [], completed: [], upcoming: [] };

        // Dédupliquer chapterOrder pour éviter les cartes en double
        const uniqueChapterOrder = Array.from(new Set(chapterOrder));

        // Construire la liste des activités à afficher depuis l'ordre fourni
        const rawActivities = uniqueChapterOrder
            .map(id => activities[id])
            .filter(Boolean) as typeof activities[keyof typeof activities][];

        // DEDUPE BY TITLE - certains chapitres (différents id/file) peuvent partager le même titre
        // Exemple: '1bsm_generalites...' et '1bsm_etude_des_fonctions' utilisent le même titre.
        // On choisit une représentation unique par titre en priorisant :
        // 1) celui qui est actif (isActive === true)
        // 2) ensuite celui qui a une session live
        // 3) ensuite celui qui a une session à venir
        // 4) enfin le premier rencontré
        const dedupedByTitle: { [normalizedTitle: string]: typeof rawActivities[number] } = {};

        const normalize = (s: string) => s.trim().toLowerCase();

        for (const ch of rawActivities) {
            const key = normalize(ch.chapter || ch.title || String(ch.id || ''));
            if (!dedupedByTitle[key]) {
                dedupedByTitle[key] = ch;
                continue;
            }

            const existing = dedupedByTitle[key];

            // If new one is active, prefer it
            if (ch.isActive && !existing.isActive) {
                dedupedByTitle[key] = ch;
                continue;
            }

            // Prefer one with live session
            const chLive = hasActiveSession(ch.sessionDates || []);
            const exLive = hasActiveSession(existing.sessionDates || []);
            if (chLive && !exLive) {
                dedupedByTitle[key] = ch;
                continue;
            }

            // Prefer one with upcoming session
            const chUpcoming = hasUpcomingSession(ch.sessionDates || []);
            const exUpcoming = hasUpcomingSession(existing.sessionDates || []);
            if (chUpcoming && !exUpcoming) {
                dedupedByTitle[key] = ch;
                continue;
            }

            // Otherwise keep existing (first encountered)
        }

        const allUserActivities = Object.values(dedupedByTitle);

        const categorized = allUserActivities.reduce<CategorizedActivities>(
            (acc, chapter) => {
                const chapterProgress = progress[chapter.id];
                const status = chapterProgress?.status || 'a-venir';

                // Utiliser le statut pour catégoriser intelligemment
                if (status === 'acheve') {
                    acc.completed.push(chapter);
                } else if (status === 'en-cours') {
                    acc.inProgress.push(chapter);
                } else {
                    acc.upcoming.push(chapter);
                }
                return acc;
            },
            { inProgress: [], completed: [], upcoming: [] }
        );

        // Trier chaque catégorie pour placer les chapitres avec séances actives en premier
        return {
            inProgress: sortChaptersByActiveSession(categorized.inProgress),
            completed: sortChaptersByActiveSession(categorized.completed),
            upcoming: sortChaptersByActiveSession(categorized.upcoming),
        };
    }, [activities, progress, profile, chapterOrder]);

    // ✅ OPTIMISATION 5: handleChapterSelect avec useCallback
    const handleChapterSelect = useCallback((chapterId: string) => {
        const chapter = activities[chapterId];
        if (chapter && (chapter.isActive || progress[chapterId]?.isWorkSubmitted)) {
            // If the chapter had an update flag, mark it as seen and remove related UI notifications
            if (progress[chapterId]?.hasUpdate) {
                dispatch({ type: 'MARK_UPDATE_SEEN', payload: { chapterId } });
                addNotification('Nouveau contenu', 'info', { 
                    message: `<strong>${chapter.chapter}</strong> a été mis à jour`, 
                    duration: 3000 
                });
            }

            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        } else {
            // Gérer le cas où le chapitre n'est pas encore disponible
            addNotification('Patience !', 'info', {
                message: `Ce chapitre sera bientôt disponible`,
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

    const summaryMetrics = useMemo(() => {
    const progressValues = Object.values(progress || {}) as ChapterProgress[];
        const quizSubmitted = progressValues.filter(item => item?.quiz?.isSubmitted).length;
        const workSubmitted = progressValues.filter(item => item?.isWorkSubmitted).length;
        const updatesCount = progressValues.filter(item => item?.hasUpdate).length;

        const workCaption = workSubmitted > 0
            ? `${workSubmitted} ${workSubmitted > 1 ? 'chapitres réussis' : 'chapitre réussi'}`
            : 'Premiers pas à faire';

        const updatesCaption = updatesCount > 0
            ? `${updatesCount} ${updatesCount > 1 ? 'mises à jour' : 'mise à jour'}`
            : 'Nouveaux défis à découvrir';

        return [
            {
                id: 'in-progress',
                label: 'En apprentissage',
                icon: 'auto_stories',
                value: inProgress.length,
                caption: inProgress.length > 0 ? 'Votre parcours actuel' : 'Prêt à démarrer',
                tone: 'progress' as const,
            },
            {
                id: 'completed',
                label: 'Maîtrisés',
                icon: 'workspace_premium',
                value: completed.length,
                caption: completed.length > 0 ? workCaption : 'Objectifs à atteindre',
                tone: 'completed' as const,
            },
            {
                id: 'quiz',
                label: 'Quiz validés',
                icon: 'fact_check',
                value: quizSubmitted,
                caption: quizSubmitted > 0 ? 'Résultats enregistrés' : 'Évaluations à venir',
                tone: 'quiz' as const,
            },
            {
                id: 'upcoming',
                label: 'Disponibles',
                icon: 'explore',
                value: upcoming.length,
                caption: updatesCaption,
                tone: 'upcoming' as const,
            },
        ];
    }, [inProgress.length, completed.length, upcoming.length, progress]);

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

                <section className="dashboard-summary" aria-label="Sommaire de progression">
                    {summaryMetrics.map((metric) => (
                        <article key={metric.id} className="dashboard-summary__item" data-tone={metric.tone}>
                            <header className="dashboard-summary__header">
                                <span className="material-symbols-outlined" aria-hidden="true">{metric.icon}</span>
                                <span>{metric.label}</span>
                            </header>
                            <p className="dashboard-summary__value">{metric.value}</p>
                            <p className="dashboard-summary__caption">{metric.caption}</p>
                        </article>
                    ))}
                </section>

                {hasAnyActivity ? (
                    <div className="dashboard-section-stack">
                        {/* Regrouper "En cours" et "Disponibles" pour une meilleure organisation pédagogique */}
                        {(inProgress.length > 0 || upcoming.length > 0) && (
                            <>
                                {inProgress.length > 0 && (
                                    <ChapterSection
                                        title="🎯 Votre apprentissage en cours"
                                        chapters={inProgress}
                                        progress={progress}
                                        onSelect={handleChapterSelect}
                                    />
                                )}
                                {upcoming.length > 0 && (
                                    <ChapterSection
                                        title="📚 Chapitres disponibles"
                                        chapters={upcoming}
                                        progress={progress}
                                        onSelect={handleChapterSelect}
                                        variant="upcoming"
                                    />
                                )}
                            </>
                        )}
                        {completed.length > 0 && (
                            <ChapterSection
                                title="✅ Chapitres réussis"
                                chapters={completed}
                                progress={progress}
                                onSelect={handleChapterSelect}
                                icon="✓"
                            />
                        )}
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
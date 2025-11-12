/**
 * Utilitaire pour synchroniser la navigation de l'application avec l'historique du navigateur
 * Permet l'utilisation des boutons retour/avancer du navigateur
 */

import { AppState } from '../types';

export interface NavigationState {
    view: string;
    chapterId?: string | null;
    subView?: string | null;
    review?: boolean;
    concoursType?: string | null;
    concoursId?: string | null;
    concoursYear?: string | null;
    concoursTheme?: string | null;
    concoursMode?: 'theme' | 'year' | null;
}

/**
 * Construit l'URL correspondant à un état de navigation
 */
export function buildURL(navState: NavigationState): string {
    const { view, chapterId, subView, review, concoursType, concoursId, concoursYear, concoursMode } = navState;

    switch (view) {
        case 'login':
            return '/';

        case 'dashboard':
            return '/dashboard';

        case 'activity':
            if (!chapterId) return '/dashboard';
            const reviewParam = review ? '?review=true' : '';
            if (subView) {
                return `/activity/${chapterId}/${subView}${reviewParam}`;
            }
            return `/activity/${chapterId}${reviewParam}`;

        case 'concours':
            return '/concours';

        case 'concours-list':
            if (concoursType) {
                const modeParam = concoursMode ? `?mode=${concoursMode}` : '';
                return `/concours/${concoursType}${modeParam}`;
            }
            return '/concours';

        case 'concours-year':
            if (concoursType && concoursYear) {
                return `/concours/${concoursType}/${concoursYear}`;
            }
            return '/concours';

        case 'concours-resume':
            return concoursId ? `/concours/resume/${concoursId}` : '/concours';

        case 'concours-quiz':
            return concoursId ? `/concours/quiz/${concoursId}` : '/concours';

        default:
            return `/${view}`;
    }
}

/**
 * Parse l'URL pour extraire l'état de navigation
 */
export function parseURL(url: string): NavigationState | null {
    const path = url.split('?')[0];
    const params = new URLSearchParams(url.split('?')[1] || '');

    // Page d'accueil / login
    if (path === '/' || path === '') {
        return { view: 'login' };
    }

    // Dashboard
    if (path === '/dashboard') {
        return { view: 'dashboard' };
    }

    // Activity avec pattern /activity/:chapterId ou /activity/:chapterId/:subView
    const activityMatch = path.match(/^\/activity\/([^\/]+)(?:\/([^\/]+))?$/);
    if (activityMatch) {
        const [, chapterId, subView] = activityMatch;
        return {
            view: 'activity',
            chapterId,
            subView: subView || null,
            review: params.get('review') === 'true'
        };
    }

    // Concours principal
    if (path === '/concours') {
        return { view: 'concours' };
    }

    // Résumé concours /concours/resume/:id
    const resumeMatch = path.match(/^\/concours\/resume\/(.+)$/);
    if (resumeMatch) {
        return {
            view: 'concours-resume',
            concoursId: resumeMatch[1]
        };
    }

    // Quiz concours /concours/quiz/:id
    const quizMatch = path.match(/^\/concours\/quiz\/(.+)$/);
    if (quizMatch) {
        return {
            view: 'concours-quiz',
            concoursId: quizMatch[1]
        };
    }

    // Année de concours /concours/:type/:year (4 chiffres)
    const yearMatch = path.match(/^\/concours\/([^\/]+)\/(\d{4})$/);
    if (yearMatch) {
        return {
            view: 'concours-year',
            concoursType: yearMatch[1],
            concoursYear: yearMatch[2]
        };
    }

    // Liste des concours /concours/:type
    const concoursListMatch = path.match(/^\/concours\/([^\/]+)$/);
    if (concoursListMatch) {
        const mode = params.get('mode') as 'theme' | 'year' | null;
        return {
            view: 'concours-list',
            concoursType: concoursListMatch[1],
            concoursMode: mode
        };
    }

    return null;
}

/**
 * Extrait l'état de navigation depuis l'AppState
 */
export function extractNavigationState(state: AppState): NavigationState {
    return {
        view: state.view,
        chapterId: state.currentChapterId,
        subView: state.activitySubView,
        review: state.isReviewMode,
        concoursType: state.currentConcoursType,
        concoursId: state.currentConcoursId,
        concoursYear: state.currentConcoursYear,
        concoursTheme: state.currentConcoursTheme,
        concoursMode: state.concoursNavigationMode
    };
}

/**
 * Pousse un nouvel état dans l'historique du navigateur
 */
export function pushNavigationState(navState: NavigationState, title?: string): void {
    const url = buildURL(navState);
    const stateData = { ...navState };
    window.history.pushState(stateData, title || '', url);
}

/**
 * Remplace l'état actuel dans l'historique (sans créer nouvelle entrée)
 */
export function replaceNavigationState(navState: NavigationState, title?: string): void {
    const url = buildURL(navState);
    const stateData = { ...navState };
    window.history.replaceState(stateData, title || '', url);
}

/**
 * Récupère l'état de navigation actuel depuis l'URL ou l'état du navigateur
 */
export function getCurrentNavigationState(): NavigationState | null {
    // D'abord essayer de récupérer depuis window.history.state
    if (window.history.state && window.history.state.view) {
        return window.history.state as NavigationState;
    }

    // Sinon parser l'URL
    return parseURL(window.location.pathname);
}

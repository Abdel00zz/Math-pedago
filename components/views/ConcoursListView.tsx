import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo, ConcoursExamen } from '../../types';

interface ThemeGroup {
    theme: string;
    fichiers: Array<{
        id: string;
        file: string;
        annee: string;
        theme: string;
    }>;
}

const ConcoursListView: React.FC = () => {
    const dispatch = useAppDispatch();
    const state = useAppState();
    const [concoursInfo, setConcoursInfo] = useState<ConcoursInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'annee' | 'theme'>('annee');
    const [themes, setThemes] = useState<{ [theme: string]: any[] }>({});

    useEffect(() => {
        const concoursType = state.currentConcoursType || localStorage.getItem('currentConcoursType');
        const savedMode = state.concoursNavigationMode || localStorage.getItem('concoursNavigationMode') as 'annee' | 'theme' | null;

        if (savedMode) {
            setFilterMode(savedMode);
        }

        if (!concoursType) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('currentConcoursType', concoursType);

        fetch('/concours/index.json')
            .then(res => res.json())
            .then((data: ConcoursIndex) => {
                const concours = data.concours.find(c => c.id === concoursType);
                if (concours) {
                    setConcoursInfo(concours);
                    const themeMap: { [theme: string]: any[] } = {};
                    concours.examens.forEach(exam => {
                        exam.fichiers.forEach(fichier => {
                            if (!themeMap[fichier.theme]) {
                                themeMap[fichier.theme] = [];
                            }
                            themeMap[fichier.theme].push({ ...fichier, annee: exam.annee });
                        });
                    });
                    setThemes(themeMap);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement des concours:', err);
                setLoading(false);
            });
    }, [dispatch, state.currentConcoursType, state.concoursNavigationMode]);

    const handleYearClick = (annee: string) => {
        localStorage.setItem('currentConcoursYear', annee);
        localStorage.setItem('concoursNavigationMode', 'year');
        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'concours-year',
                concoursYear: annee,
                concoursMode: 'year'
            }
        });
    };

    const handleThemeClick = (theme: string, fichiers: any[]) => {
        // En mode thème, on navigue directement vers le résumé agrégé
        localStorage.setItem('currentConcoursTheme', theme);
        localStorage.setItem('concoursNavigationMode', 'theme');
        // Stocker tous les fichiers du thème pour agrégation
        localStorage.setItem('concoursThemeFiles', JSON.stringify(fichiers.map(f => ({ ...f }))));
        // On utilise le premier fichier comme référence
        const firstFile = fichiers[0];
        localStorage.setItem('currentConcoursId', firstFile.id);
        localStorage.setItem('currentConcoursFile', firstFile.file);

        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'concours-resume',
                concoursTheme: theme,
                concoursMode: 'theme'
            }
        });
    };

    const handleModeChange = (mode: 'annee' | 'theme') => {
        setFilterMode(mode);
        localStorage.setItem('concoursNavigationMode', mode);
        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'concours-list',
                concoursMode: mode
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!concoursInfo) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <p className="text-white">Concours introuvable</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            {/* SVG Pattern Background */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="concours-list-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="white" opacity="0.4"/>
                            <circle cx="0" cy="0" r="2" fill="white" opacity="0.3"/>
                            <circle cx="60" cy="60" r="2" fill="white" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#concours-list-pattern)" />
                </svg>
            </div>

            <StandardHeader title={`Concours ${concoursInfo.name}`} />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-light text-white mb-3 tracking-tight drop-shadow-lg">
                        Concours {concoursInfo.name}
                    </h1>
                    <p className="text-base text-white/90 font-light drop-shadow">
                        {concoursInfo.description}
                    </p>
                </div>

                <div className="flex gap-4 mb-12">
                    <button
                        onClick={() => handleModeChange('annee')}
                        className={`px-6 py-3 text-sm font-light transition-all rounded-xl ${
                            filterMode === 'annee'
                                ? 'bg-white text-indigo-600 shadow-lg'
                                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg'
                        }`}
                    >
                        Par année
                    </button>
                    <button
                        onClick={() => handleModeChange('theme')}
                        className={`px-6 py-3 text-sm font-light transition-all rounded-xl ${
                            filterMode === 'theme'
                                ? 'bg-white text-indigo-600 shadow-lg'
                                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg'
                        }`}
                    >
                        Par thème
                    </button>
                </div>

                {filterMode === 'annee' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {concoursInfo.examens.map((exam: ConcoursExamen) => {
                                const quizCount = exam.fichiers.length;
                                return (
                                    <button
                                        key={exam.annee}
                                        onClick={() => handleYearClick(exam.annee)}
                                        className="group text-left bg-white/90 backdrop-blur-sm hover:bg-white transition-all p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        <div className="mb-6">
                                            <div className="text-5xl font-light text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {exam.annee}
                                            </div>
                                            <div className="inline-block px-3 py-1 bg-indigo-50 text-xs text-indigo-700 font-light rounded-lg">
                                                {quizCount} {quizCount > 1 ? 'quiz disponibles' : 'quiz disponible'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                                            Voir les thèmes
                                            <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(themes).map(([theme, fichiers]: [string, any[]]) => {
                                const quizCount = fichiers.length;
                                const years = fichiers.map(f => f.annee).sort().reverse();
                                return (
                                    <button
                                        key={theme}
                                        onClick={() => handleThemeClick(theme, fichiers)}
                                        className="group text-left bg-white/90 backdrop-blur-sm hover:bg-white transition-all p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                                {theme}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {years.map(year => (
                                                    <span key={year} className="inline-block px-2 py-1 bg-purple-50 text-xs text-purple-700 font-light rounded">
                                                        {year}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="inline-block px-3 py-1 bg-indigo-50 text-xs text-indigo-700 font-light rounded-lg">
                                                {quizCount} {quizCount > 1 ? 'quiz disponibles' : 'quiz disponible'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                                            Voir le résumé et tous les quiz
                                            <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <p className="text-sm text-gray-700 font-light">
                        {filterMode === 'annee' ? (
                            <>
                                <strong>Navigation par année :</strong> Choisissez une année pour voir tous les thèmes
                                de ce concours. Chaque thème contient un résumé pédagogique et un quiz.
                            </>
                        ) : (
                            <>
                                <strong>Navigation par thème :</strong> Choisissez un thème pour accéder à un résumé
                                complet regroupant les points essentiels de toutes les années, ainsi que tous les quiz
                                disponibles sur ce thème.
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConcoursListView;

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
// StandardHeader removed per concours design change
import type { ConcoursIndex, ConcoursInfo, ConcoursExamen } from '../../types';
import ConcoursBackground from '../ConcoursBackground';

const ConcoursYearView: React.FC = () => {
    const dispatch = useAppDispatch();
    const state = useAppState();
    const [concoursInfo, setConcoursInfo] = useState<ConcoursInfo | null>(null);
    const [yearData, setYearData] = useState<ConcoursExamen | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(0);

    useEffect(() => {
        const concoursType = state.currentConcoursType || localStorage.getItem('currentConcoursType');
        const year = state.currentConcoursYear || localStorage.getItem('currentConcoursYear');

        if (!concoursType || !year) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('currentConcoursType', concoursType);
        localStorage.setItem('currentConcoursYear', year);
        localStorage.setItem('concoursNavigationMode', 'year');

        fetch('/concours/index.json')
            .then(res => res.json())
            .then((data: ConcoursIndex) => {
                const concours = data.concours.find(c => c.id === concoursType);
                if (concours) {
                    setConcoursInfo(concours);
                    const examData = concours.examens.find(e => e.annee === year);
                    if (examData) {
                        setYearData(examData);

                        // Charger tous les fichiers pour compter les questions
                        Promise.all(
                            examData.fichiers.map(fichier =>
                                fetch(fichier.file).then(r => r.json())
                            )
                        ).then(allData => {
                            const total = allData.reduce((sum, data) => sum + (data.quiz?.length || 0), 0);
                            setTotalQuestions(total);
                        });
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement des concours:', err);
                setLoading(false);
            });
    }, [dispatch, state.currentConcoursType, state.currentConcoursYear]);

    const handleThemeClick = (concoursId: string, file: string, theme: string) => {
        localStorage.setItem('currentConcoursId', concoursId);
        localStorage.setItem('currentConcoursFile', file);
        localStorage.setItem('currentConcoursTheme', theme);
        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'concours-resume',
                concoursId,
                concoursTheme: theme,
                concoursMode: 'year'
            }
        });
    };

    const handleStartGlobalQuiz = () => {
        if (!yearData) return;

        // Stocker tous les fichiers de l'année pour le quiz global
        const allFiles = yearData.fichiers.map(f => f.file);
        localStorage.setItem('concoursQuizFiles', JSON.stringify(allFiles));
        localStorage.setItem('concoursQuizMode', 'year');
        localStorage.setItem('concoursQuizYear', yearData.annee);

        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'concours-quiz',
                concoursMode: 'year',
                concoursYear: yearData.annee
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

    if (!concoursInfo || !yearData) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <p className="text-white">Année introuvable</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <ConcoursBackground variant="year" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-light text-white mb-3 tracking-tight drop-shadow-lg">
                        Concours {concoursInfo.name} {yearData.annee}
                    </h1>
                    <p className="text-base text-white/90 font-light drop-shadow">
                        {yearData.fichiers.length} {yearData.fichiers.length > 1 ? 'chapitres disponibles' : 'chapitre disponible'}
                    </p>
                </div>

                {/* Bouton Quiz Global - En haut */}
                <div className="mb-12">
                    <button
                        onClick={handleStartGlobalQuiz}
                        className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined !text-4xl">quiz</span>
                                    <h2 className="text-3xl font-light">
                                        Quiz Complet {yearData.annee}
                                    </h2>
                                </div>
                                <p className="text-white/90 text-sm font-light">
                                    {totalQuestions} questions couvrant tous les chapitres de cette année
                                </p>
                            </div>
                            <span className="material-symbols-outlined !text-5xl group-hover:translate-x-2 transition-transform">
                                arrow_forward
                            </span>
                        </div>
                    </button>
                </div>

                {/* Chapitres/Thèmes */}
                <div className="mb-8">
                    <h2 className="text-2xl font-light text-white mb-6 tracking-tight drop-shadow">
                        Réviser par chapitre
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {yearData.fichiers.map(fichier => (
                        <button
                            key={fichier.id}
                            onClick={() => handleThemeClick(fichier.id, fichier.file, fichier.theme)}
                            className="group text-left bg-white/90 backdrop-blur-sm hover:bg-white transition-all p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                    <div className="mb-2 flex justify-center">
                                        <div className="border border-gray-200 rounded-md px-3 py-1 bg-white text-center">
                                            <h3 className="text-lg font-medium text-gray-900 m-0">{fichier.theme}</h3>
                                        </div>
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-indigo-50 text-xs text-indigo-700 font-light rounded-lg">
                                        Résumé pédagogique
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                                Voir le résumé
                                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-indigo-600 !text-3xl">lightbulb</span>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Stratégie de révision</h3>
                            <p className="text-sm text-gray-700 font-light leading-relaxed">
                                <strong>1. Révisez chaque chapitre :</strong> Lisez attentivement les résumés pédagogiques
                                qui contiennent les formules essentielles et les pièges à éviter.
                                <br /><br />
                                <strong>2. Testez vos connaissances :</strong> Une fois tous les chapitres révisés,
                                lancez le quiz complet pour évaluer votre maîtrise globale du concours {yearData.annee}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcoursYearView;

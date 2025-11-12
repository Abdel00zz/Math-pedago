import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo, ConcoursExamen } from '../../types';

const ConcoursYearView: React.FC = () => {
    const dispatch = useAppDispatch();
    const state = useAppState();
    const [concoursInfo, setConcoursInfo] = useState<ConcoursInfo | null>(null);
    const [yearData, setYearData] = useState<ConcoursExamen | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const concoursType = state.currentConcoursType || sessionStorage.getItem('currentConcoursType');
        const year = state.currentConcoursYear || sessionStorage.getItem('currentConcoursYear');

        if (!concoursType || !year) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        fetch('/concours/index.json')
            .then(res => res.json())
            .then((data: ConcoursIndex) => {
                const concours = data.concours.find(c => c.id === concoursType);
                if (concours) {
                    setConcoursInfo(concours);
                    const examData = concours.examens.find(e => e.annee === year);
                    setYearData(examData || null);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement des concours:', err);
                setLoading(false);
            });
    }, [dispatch, state.currentConcoursType, state.currentConcoursYear]);

    const handleThemeClick = (concoursId: string, file: string, theme: string) => {
        sessionStorage.setItem('currentConcoursId', concoursId);
        sessionStorage.setItem('currentConcoursFile', file);
        sessionStorage.setItem('currentConcoursTheme', theme);
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

    const handleBackClick = () => {
        window.history.back();
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
            {/* SVG Pattern Background */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="concours-year-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="white" opacity="0.4"/>
                            <circle cx="0" cy="0" r="2" fill="white" opacity="0.3"/>
                            <circle cx="60" cy="60" r="2" fill="white" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#concours-year-pattern)" />
                </svg>
            </div>

            <StandardHeader onBack={handleBackClick} title={`Concours ${concoursInfo.name} ${yearData.annee}`} />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-light text-white mb-3 tracking-tight drop-shadow-lg">
                        Concours {concoursInfo.name} {yearData.annee}
                    </h1>
                    <p className="text-base text-white/90 font-light drop-shadow">
                        {yearData.fichiers.length} {yearData.fichiers.length > 1 ? 'thèmes disponibles' : 'thème disponible'}
                    </p>
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
                                    <h3 className="text-lg font-normal text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {fichier.theme}
                                    </h3>
                                    <div className="inline-block px-3 py-1 bg-indigo-50 text-xs text-indigo-700 font-light rounded-lg">
                                        Concours {yearData.annee}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                                Voir le résumé et le quiz
                                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <p className="text-sm text-gray-700 font-light">
                        Pour chaque thème, commencez par lire attentivement le résumé pédagogique.
                        Il contient les formules essentielles, les pièges à éviter et les astuces qui vous
                        aideront à réussir le quiz.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConcoursYearView;

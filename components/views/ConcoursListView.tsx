import React, { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo, ConcoursExamen } from '../../types';

const ConcoursListView: React.FC = () => {
    const { dispatch } = useAppState();
    const [concoursInfo, setConcoursInfo] = useState<ConcoursInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'annee' | 'theme'>('annee');
    const [themes, setThemes] = useState<{ [theme: string]: any[] }>({});

    useEffect(() => {
        const concoursType = sessionStorage.getItem('currentConcoursType');
        if (!concoursType) {
            // Retour à la page des concours si pas de type sélectionné
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        // Charger l'index des concours
        fetch('/concours/index.json')
            .then(res => res.json())
            .then((data: ConcoursIndex) => {
                const concours = data.concours.find(c => c.id === concoursType);
                if (concours) {
                    setConcoursInfo(concours);
                    // Organiser par thèmes
                    const themeMap: { [theme: string]: any[] } = {};
                    concours.examens.forEach(exam => {
                        exam.fichiers.forEach(fichier => {
                            if (!themeMap[fichier.theme]) {
                                themeMap[fichier.theme] = [];
                            }
                            themeMap[fichier.theme].push({
                                ...fichier,
                                annee: exam.annee,
                            });
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
    }, [dispatch]);

    const handleThemeClick = (concoursId: string, file: string) => {
        sessionStorage.setItem('currentConcoursId', concoursId);
        sessionStorage.setItem('currentConcoursFile', file);
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours-resume' },
        });
    };

    const handleBackClick = () => {
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours' },
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!concoursInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Concours introuvable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <StandardHeader
                onBack={handleBackClick}
                title={`Concours ${concoursInfo.name}`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{concoursInfo.icon}</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Concours {concoursInfo.name}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {concoursInfo.description}
                    </p>
                </div>

                {/* Filter Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                        <button
                            onClick={() => setFilterMode('annee')}
                            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 flex items-center ${
                                filterMode === 'annee'
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <span className="material-symbols-outlined mr-2">calendar_month</span>
                            Par année
                        </button>
                        <button
                            onClick={() => setFilterMode('theme')}
                            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 flex items-center ${
                                filterMode === 'theme'
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <span className="material-symbols-outlined mr-2">topic</span>
                            Par thème
                        </button>
                    </div>
                </div>

                {/* Content based on filter mode */}
                {filterMode === 'annee' ? (
                    // Vue par année
                    <div className="space-y-8">
                        {concoursInfo.examens.map((exam: ConcoursExamen) => (
                            <div key={exam.annee} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className={`bg-gradient-to-r ${concoursInfo.color} p-6 text-white`}>
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined text-4xl mr-4">event</span>
                                        <div>
                                            <h2 className="text-3xl font-bold">Année {exam.annee}</h2>
                                            <p className="text-white/90 mt-1">
                                                {exam.fichiers.length} thème{exam.fichiers.length > 1 ? 's' : ''} disponible{exam.fichiers.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {exam.fichiers.map(fichier => (
                                            <div
                                                key={fichier.id}
                                                onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                                className="group cursor-pointer bg-gray-50 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 rounded-lg p-5 transition-all duration-200 border-2 border-transparent hover:border-primary hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                                            {fichier.theme}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <span className="material-symbols-outlined text-sm mr-1">quiz</span>
                                                            <span>Quiz disponible</span>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                                        arrow_forward
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Vue par thème
                    <div className="space-y-6">
                        {Object.entries(themes).map(([theme, fichiers]: [string, any[]]) => (
                            <div key={theme} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined text-4xl mr-4">category</span>
                                        <div>
                                            <h2 className="text-2xl font-bold">{theme}</h2>
                                            <p className="text-white/90 mt-1">
                                                {fichiers.length} sujet{fichiers.length > 1 ? 's' : ''} disponible{fichiers.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {fichiers.map(fichier => (
                                            <div
                                                key={fichier.id}
                                                onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                                className="group cursor-pointer bg-gray-50 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 rounded-lg p-5 transition-all duration-200 border-2 border-transparent hover:border-primary hover:shadow-md text-center"
                                            >
                                                <div className="text-3xl font-bold text-primary mb-2">{fichier.annee}</div>
                                                <div className="text-sm text-gray-600 mb-3">Concours {concoursInfo.name}</div>
                                                <div className="flex items-center justify-center text-sm text-gray-500">
                                                    <span className="material-symbols-outlined text-sm mr-1">play_arrow</span>
                                                    <span>Commencer</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-4">
                        <span className="material-symbols-outlined text-3xl text-primary">lightbulb</span>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">💡 Conseil</h3>
                            <p className="text-gray-700">
                                Pour chaque thème, commencez par lire attentivement le résumé pédagogique.
                                Il contient les formules essentielles, les pièges à éviter et les astuces qui vous
                                aideront à réussir le quiz !
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcoursListView;

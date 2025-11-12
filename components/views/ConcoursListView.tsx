import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo, ConcoursExamen } from '../../types';

const ConcoursListView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursInfo, setConcoursInfo] = useState<ConcoursInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'annee' | 'theme'>('annee');
    const [themes, setThemes] = useState<{ [theme: string]: any[] }>({});

    useEffect(() => {
        const concoursType = sessionStorage.getItem('currentConcoursType');
        if (!concoursType) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

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
    }, [dispatch]);

    const handleThemeClick = (concoursId: string, file: string) => {
        sessionStorage.setItem('currentConcoursId', concoursId);
        sessionStorage.setItem('currentConcoursFile', file);
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-resume' } });
    };

    const handleBackClick = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
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

            <StandardHeader onBack={handleBackClick} title={`Concours ${concoursInfo.name}`} />

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
                        onClick={() => setFilterMode('annee')}
                        className={`px-6 py-3 text-sm font-light transition-all rounded-xl ${
                            filterMode === 'annee'
                                ? 'bg-white text-indigo-600 shadow-lg'
                                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg'
                        }`}
                    >
                        Par année
                    </button>
                    <button
                        onClick={() => setFilterMode('theme')}
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
                    <div className="space-y-12">
                        {concoursInfo.examens.map((exam: ConcoursExamen) => (
                            <div key={exam.annee} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-light text-gray-900 mb-6">
                                    Année {exam.annee}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {exam.fichiers.map(fichier => (
                                        <button
                                            key={fichier.id}
                                            onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                            className="group text-left bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all p-6 rounded-xl shadow hover:shadow-lg"
                                        >
                                            <h3 className="text-base font-normal text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                                                {fichier.theme}
                                            </h3>
                                            <div className="text-xs text-indigo-600 font-light">
                                                Quiz disponible
                                            </div>
                                            <div className="mt-4 text-sm text-indigo-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                                Commencer
                                                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(themes).map(([theme, fichiers]: [string, any[]]) => (
                            <div key={theme} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-light text-gray-900 mb-6">
                                    {theme}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {fichiers.map(fichier => (
                                        <button
                                            key={fichier.id}
                                            onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                            className="group text-center bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all p-6 rounded-xl shadow hover:shadow-lg"
                                        >
                                            <div className="text-3xl font-light text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                                                {fichier.annee}
                                            </div>
                                            <div className="text-xs text-indigo-600 font-light">
                                                Concours {concoursInfo.name}
                                            </div>
                                            <div className="mt-4 text-sm text-indigo-600 font-medium inline-flex items-center justify-center gap-2">
                                                Commencer
                                                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

export default ConcoursListView;

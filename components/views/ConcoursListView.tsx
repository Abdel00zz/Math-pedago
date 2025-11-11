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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!concoursInfo) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Concours introuvable</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <StandardHeader onBack={handleBackClick} title={`Concours ${concoursInfo.name}`} />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-tight">
                        Concours {concoursInfo.name}
                    </h1>
                    <p className="text-base text-gray-600 font-light">
                        {concoursInfo.description}
                    </p>
                </div>

                <div className="flex gap-4 mb-12">
                    <button
                        onClick={() => setFilterMode('annee')}
                        className={`px-6 py-3 text-sm font-light transition-all ${
                            filterMode === 'annee'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
                        }`}
                    >
                        Par année
                    </button>
                    <button
                        onClick={() => setFilterMode('theme')}
                        className={`px-6 py-3 text-sm font-light transition-all ${
                            filterMode === 'theme'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
                        }`}
                    >
                        Par thème
                    </button>
                </div>

                {filterMode === 'annee' ? (
                    <div className="space-y-12">
                        {concoursInfo.examens.map((exam: ConcoursExamen) => (
                            <div key={exam.annee} className="border-t border-gray-200 pt-8">
                                <h2 className="text-2xl font-light text-gray-900 mb-6">
                                    Année {exam.annee}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {exam.fichiers.map(fichier => (
                                        <button
                                            key={fichier.id}
                                            onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                            className="group text-left border border-gray-200 hover:border-gray-900 transition-all p-6"
                                        >
                                            <h3 className="text-base font-normal text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                                                {fichier.theme}
                                            </h3>
                                            <div className="text-xs text-gray-500 font-light">
                                                Quiz disponible
                                            </div>
                                            <div className="mt-4 text-sm text-gray-900 group-hover:translate-x-2 transition-transform inline-block">
                                                Commencer →
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
                            <div key={theme} className="border-t border-gray-200 pt-8">
                                <h2 className="text-2xl font-light text-gray-900 mb-6">
                                    {theme}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {fichiers.map(fichier => (
                                        <button
                                            key={fichier.id}
                                            onClick={() => handleThemeClick(fichier.id, fichier.file)}
                                            className="group text-center border border-gray-200 hover:border-gray-900 transition-all p-6"
                                        >
                                            <div className="text-3xl font-light text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                                                {fichier.annee}
                                            </div>
                                            <div className="text-xs text-gray-500 font-light">
                                                Concours {concoursInfo.name}
                                            </div>
                                            <div className="mt-4 text-sm text-gray-900">
                                                Commencer →
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20 border-t border-gray-200 pt-12">
                    <p className="text-sm text-gray-600 font-light">
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

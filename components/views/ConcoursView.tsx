import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo } from '../../types';

const ConcoursView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursData, setConcoursData] = useState<ConcoursIndex | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/concours/index.json')
            .then(res => res.json())
            .then((data: ConcoursIndex) => {
                setConcoursData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement des concours:', err);
                setLoading(false);
            });
    }, []);

    const handleConcoursClick = (concoursType: string) => {
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours-list' },
        });
        sessionStorage.setItem('currentConcoursType', concoursType);
    };

    const handleBackClick = () => {
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'login' },
        });
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

    return (
        <div className="min-h-screen bg-white">
            <StandardHeader onBack={handleBackClick} title="Préparation Concours" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-16">
                    <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                        Préparation aux Concours
                    </h1>
                    <p className="text-lg text-gray-600 font-light max-w-2xl">
                        Entraînez-vous avec des sujets de concours organisés par thème.
                        Chaque thème comprend un résumé complet et des quiz pour valider vos connaissances.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {concoursData?.concours.map((concours: ConcoursInfo) => (
                        <button
                            key={concours.id}
                            onClick={() => handleConcoursClick(concours.id)}
                            className="group text-left bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300 p-8 rounded-none"
                        >
                            <h2 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                                {concours.name}
                            </h2>
                            <p className="text-sm text-gray-600 mb-6 font-light">
                                {concours.description}
                            </p>

                            <div className="space-y-2 text-xs text-gray-500 font-light">
                                <div>
                                    {concours.examens.length} année{concours.examens.length > 1 ? 's' : ''} disponible{concours.examens.length > 1 ? 's' : ''}
                                </div>
                                <div>
                                    {concours.examens.reduce((acc, exam) => acc + exam.fichiers.length, 0)} thème{concours.examens.reduce((acc, exam) => acc + exam.fichiers.length, 0) > 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {concours.examens.map(exam => (
                                        <span
                                            key={exam.annee}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-light"
                                        >
                                            {exam.annee}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-gray-900 group-hover:translate-x-2 transition-transform inline-block">
                                Accéder →
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-20 border-t border-gray-200 pt-12">
                    <h3 className="text-lg font-light text-gray-900 mb-6">Comment utiliser cette plateforme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 font-light">
                        <div>
                            <span className="font-normal">1.</span> Choisissez votre concours
                        </div>
                        <div>
                            <span className="font-normal">2.</span> Sélectionnez un thème par année ou par thématique
                        </div>
                        <div>
                            <span className="font-normal">3.</span> Révisez le résumé pédagogique complet
                        </div>
                        <div>
                            <span className="font-normal">4.</span> Testez vos connaissances avec le quiz
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcoursView;

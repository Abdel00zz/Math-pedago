import React, { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursIndex, ConcoursInfo } from '../../types';

const ConcoursView: React.FC = () => {
    const { dispatch } = useAppState();
    const [concoursData, setConcoursData] = useState<ConcoursIndex | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Charger l'index des concours
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
            payload: {
                view: 'concours-list',
            },
        });
        // Stocker le type de concours sélectionné
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des concours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <StandardHeader
                onBack={handleBackClick}
                title="Préparation Concours"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        🎓 Préparation aux Concours
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Entraînez-vous avec des sujets de concours organisés par thème.
                        Chaque thème comprend un résumé pédagogique complet et des quiz pour valider vos connaissances.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {concoursData?.concours.map((concours: ConcoursInfo) => (
                        <div
                            key={concours.id}
                            onClick={() => handleConcoursClick(concours.id)}
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        >
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                {/* Card Header avec gradient */}
                                <div className={`bg-gradient-to-r ${concours.color} p-8 text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                                    <div className="relative z-10">
                                        <div className="text-6xl mb-4">{concours.icon}</div>
                                        <h2 className="text-3xl font-bold mb-2">{concours.name}</h2>
                                        <p className="text-white/90 text-sm">{concours.description}</p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Nombre d'années disponibles */}
                                        <div className="flex items-center text-gray-600">
                                            <span className="material-symbols-outlined text-primary mr-2">calendar_month</span>
                                            <span className="font-medium">
                                                {concours.examens.length} année{concours.examens.length > 1 ? 's' : ''} disponible{concours.examens.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {/* Nombre de thèmes */}
                                        <div className="flex items-center text-gray-600">
                                            <span className="material-symbols-outlined text-primary mr-2">topic</span>
                                            <span className="font-medium">
                                                {concours.examens.reduce((acc, exam) => acc + exam.fichiers.length, 0)} thème{concours.examens.reduce((acc, exam) => acc + exam.fichiers.length, 0) > 1 ? 's' : ''} au total
                                            </span>
                                        </div>

                                        {/* Liste des années */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Années disponibles :</p>
                                            <div className="flex flex-wrap gap-2">
                                                {concours.examens.map(exam => (
                                                    <span
                                                        key={exam.annee}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                                    >
                                                        {exam.annee}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton d'action */}
                                    <div className="mt-6">
                                        <div className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold text-center group-hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                                            <span>Accéder aux sujets</span>
                                            <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Section */}
                <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <span className="material-symbols-outlined text-4xl text-primary">info</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser cette plateforme ?</h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined text-success mr-2 mt-1">check_circle</span>
                                    <p><strong>1. Choisissez votre concours</strong> : Médecine, ENSA ou ENSAM</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined text-success mr-2 mt-1">check_circle</span>
                                    <p><strong>2. Sélectionnez un thème</strong> : Par année ou par thématique mathématique</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined text-success mr-2 mt-1">check_circle</span>
                                    <p><strong>3. Révisez le résumé</strong> : Prenez le temps de lire l'essentiel du thème (définitions, formules, pièges, astuces)</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined text-success mr-2 mt-1">check_circle</span>
                                    <p><strong>4. Passez le quiz</strong> : Testez vos connaissances avec des questions type concours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcoursView;

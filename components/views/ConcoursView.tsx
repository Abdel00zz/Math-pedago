import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
// StandardHeader removed per concours design change
import Modal from '../Modal';
import type { ConcoursIndex, ConcoursInfo } from '../../types';

const ConcoursView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursData, setConcoursData] = useState<ConcoursIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);

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
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            {/* SVG Pattern Background */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                    <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="geom-grad-1" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0%" stopColor="#f6f9ff" />
                                <stop offset="100%" stopColor="#fff8fb" />
                            </linearGradient>

                            <pattern id="hex-pattern" width="80" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                                <g fill="none" strokeOpacity="0.06" stroke="#2b6cb0" strokeWidth="1">
                                    <path d="M40 0 L80 20 L80 50 L40 70 L0 50 L0 20 Z" />
                                </g>
                            </pattern>

                            <filter id="blur-soft" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="40" />
                            </filter>
                        </defs>

                        {/* Background gradient base */}
                        <rect width="1200" height="800" fill="url(#geom-grad-1)" />

                        {/* Large, soft geometric shapes (blurred) */}
                        <g filter="url(#blur-soft)" opacity="0.18">
                            <rect x="-120" y="-60" width="420" height="420" rx="60" fill="#DDE8FF" transform="rotate(-20 90 150)" />
                            <rect x="860" y="60" width="520" height="520" rx="80" fill="#FFE9E9" transform="rotate(15 1110 320)" />
                            <circle cx="600" cy="540" r="260" fill="#F3E8FF" />
                        </g>

                        {/* Geometric motif overlay (hexagons pattern, subtle) */}
                        <rect width="1200" height="800" fill="url(#hex-pattern)" opacity="0.035" />

                        {/* Accent lines for structure */}
                        <g stroke="#ffffff" strokeWidth="1" opacity="0.06">
                            <path d="M80 200 L1120 200" />
                            <path d="M60 420 L1140 420" />
                            <path d="M40 640 L1160 640" />
                        </g>
                    </svg>
                </div>

            {/* Bouton Aide */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
                <button
                    onClick={() => setHelpModalOpen(true)}
                    className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center bg-white/90 backdrop-blur-sm text-indigo-600 transition-all duration-200 hover:bg-white hover:shadow-lg focus:outline-none rounded-xl"
                    aria-label="Aide"
                    type="button"
                >
                    <span className="material-symbols-outlined !text-2xl sm:!text-3xl">help_outline</span>
                </button>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                <div className="mb-16">
                    <h1 className="text-4xl font-light text-white mb-4 tracking-tight drop-shadow-lg">
                        Préparation aux Concours
                    </h1>
                    <p className="text-lg text-white/90 font-light max-w-2xl drop-shadow">
                        Entraînez-vous avec des sujets de concours organisés par thème.
                        Chaque thème comprend un résumé complet et des quiz pour valider vos connaissances.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {concoursData?.concours.map((concours: ConcoursInfo) => (
                        <button
                            key={concours.id}
                            onClick={() => handleConcoursClick(concours.id)}
                            className="group text-left bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1"
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

                            <div className="mt-6 pt-6">
                                <div className="flex flex-wrap gap-2">
                                    {concours.examens.map(exam => (
                                        <span
                                            key={exam.annee}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-light rounded-lg"
                                        >
                                            {exam.annee}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-indigo-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                Accéder
                                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <h3 className="text-lg font-light text-gray-900 mb-6">Comment utiliser cette plateforme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 font-light">
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

            {/* Modale d'aide */}
            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setHelpModalOpen(false)}
                title="Guide d'utilisation - Concours"
                titleClassName="text-2xl font-light text-gray-900"
                hideHeaderBorder={false}
                className="sm:max-w-3xl"
            >
                <div className="p-6 space-y-6 text-gray-700 font-light">
                    <div>
                        <h3 className="text-lg font-normal text-gray-900 mb-3">Comment utiliser la plateforme de préparation aux concours</h3>
                        <p className="text-sm leading-relaxed">
                            Cette plateforme vous permet de vous préparer efficacement aux concours de Médecine, ENSAM et ENSA.
                            Chaque concours propose des thèmes organisés par année avec des résumés complets et des quiz de validation.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-l-2 border-gray-200 pl-4">
                            <h4 className="text-base font-normal text-gray-900 mb-2">1. Choisir votre concours</h4>
                            <p className="text-sm leading-relaxed">
                                Sélectionnez le concours qui vous intéresse : Médecine, ENSAM ou ENSA. Chaque concours contient
                                plusieurs années d'examens avec des thèmes spécifiques.
                            </p>
                        </div>

                        <div className="border-l-2 border-gray-200 pl-4">
                            <h4 className="text-base font-normal text-gray-900 mb-2">2. Sélectionner un thème</h4>
                            <p className="text-sm leading-relaxed">
                                Parcourez les thèmes disponibles par année. Chaque thème correspond à un sujet d'examen
                                avec son résumé pédagogique et son quiz associé.
                            </p>
                        </div>

                        <div className="border-l-2 border-gray-200 pl-4">
                            <h4 className="text-base font-normal text-gray-900 mb-2">3. Réviser le résumé</h4>
                            <p className="text-sm leading-relaxed">
                                Le résumé est organisé en sections thématiques. Lisez attentivement chaque section,
                                validez les points que vous maîtrisez avec les cases à cocher. Une barre de progression
                                vous aide à suivre votre avancement.
                            </p>
                        </div>

                        <div className="border-l-2 border-gray-200 pl-4">
                            <h4 className="text-base font-normal text-gray-900 mb-2">4. Tester vos connaissances</h4>
                            <p className="text-sm leading-relaxed">
                                Une fois le résumé terminé, passez au quiz pour valider vos acquis.
                                Les questions sont basées sur les points clés du résumé.
                            </p>
                        </div>

                        <div className="border-l-2 border-gray-200 pl-4">
                            <h4 className="text-base font-normal text-gray-900 mb-2">5. Analyser vos résultats</h4>
                            <p className="text-sm leading-relaxed">
                                À la fin du quiz, consultez vos résultats et identifiez les points à renforcer.
                                Vous pouvez toujours revenir au résumé pour approfondir.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h4 className="text-base font-normal text-gray-900 mb-3">Conseils de révision</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>Commencez par lire l'intégralité du résumé avant de passer au quiz</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>Utilisez les cases à cocher pour marquer les points que vous maîtrisez</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>Naviguez entre les sections avec les boutons Précédent/Suivant</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-400">•</span>
                                <span>Prenez votre temps, la qualité de la révision est plus importante que la vitesse</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 p-4 mt-6">
                        <p className="text-xs text-gray-600 text-center">
                            Pour toute question ou suggestion, n'hésitez pas à contacter votre professeur
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ConcoursView;

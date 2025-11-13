import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
// StandardHeader removed per concours design change
import FormattedText from '../FormattedText';
import type { ConcoursData, ConcoursResumeSection } from '../../types';

const ConcoursResumeView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursData, setConcoursData] = useState<ConcoursData | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [navigationMode, setNavigationMode] = useState<'theme' | 'year' | null>(null);

    useEffect(() => {
        const concoursFile = localStorage.getItem('currentConcoursFile');
        const mode = localStorage.getItem('concoursNavigationMode') as 'theme' | 'year' | null;

        setNavigationMode(mode);

        if (!concoursFile) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        fetch(concoursFile)
            .then(res => res.json())
            .then((data: ConcoursData) => {
                setConcoursData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement du concours:', err);
                setLoading(false);
            });
    }, [dispatch]);

    const handleStartQuiz = () => {
        if (!confirmed) {
            setConfirmed(true);
            return;
        }
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-quiz' } });
    };

    // Pas de styles spéciaux nécessaires dans la version minimaliste

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

    if (!concoursData) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
                <p className="text-white">Concours introuvable</p>
            </div>
        );
    }

    const currentSection = concoursData.resume.sections[currentSectionIndex];
    const totalSections = concoursData.resume.sections.length;
    const isFirstSection = currentSectionIndex === 0;
    const isLastSection = currentSectionIndex === totalSections - 1;

    const goToNextSection = () => {
        if (!isLastSection) {
            setCurrentSectionIndex(prev => prev + 1);
        }
    };

    const goToPreviousSection = () => {
        if (!isFirstSection) {
            setCurrentSectionIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #fafbfc 0%, #f5f6f8 50%, #fafbfc 100%)',
        }}>
            {/* Modern Seyes background with geometric patterns - High Resolution */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        {/* High resolution grid pattern (8px squares) */}
                        <pattern id="seyes-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                            {/* Vertical lines */}
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#e1e4e8" strokeWidth="0.5" opacity="0.35" />
                            {/* Horizontal lines */}
                            <line x1="0" y1="0" x2="8" y2="0" stroke="#e1e4e8" strokeWidth="0.5" opacity="0.35" />
                        </pattern>

                        {/* Main horizontal lines (every 32px for text lines) */}
                        <pattern id="main-lines" width="100%" height="32" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="31.5" x2="100%" y2="31.5" stroke="#cbd5e0" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                        </pattern>

                        {/* Geometric accent patterns */}
                        <pattern id="geo-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
                            {/* Small triangles */}
                            <polygon points="60,20 65,28 55,28" fill="#3b82f6" opacity="0.03" />
                            <polygon points="30,60 35,68 25,68" fill="#ef4444" opacity="0.03" />
                            <polygon points="90,90 95,98 85,98" fill="#8b5cf6" opacity="0.03" />

                            {/* Circles */}
                            <circle cx="20" cy="100" r="3" fill="#3b82f6" opacity="0.04" />
                            <circle cx="100" cy="40" r="2.5" fill="#ef4444" opacity="0.04" />

                            {/* Small squares */}
                            <rect x="70" y="70" width="4" height="4" fill="#3b82f6" opacity="0.03" transform="rotate(45 72 72)" />
                            <rect x="110" y="15" width="3" height="3" fill="#8b5cf6" opacity="0.03" transform="rotate(45 111.5 16.5)" />
                        </pattern>

                        {/* Gradient for depth */}
                        <linearGradient id="depth-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                            <stop offset="100%" stopColor="#f1f3f5" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Base grid pattern */}
                    <rect width="100%" height="100%" fill="url(#seyes-grid)" />

                    {/* Main writing lines */}
                    <rect width="100%" height="100%" fill="url(#main-lines)" />

                    {/* Geometric decorative pattern */}
                    <rect width="100%" height="100%" fill="url(#geo-pattern)" />

                    {/* Depth gradient overlay */}
                    <rect width="100%" height="100%" fill="url(#depth-gradient)" />

                    {/* Left margin line (red, elegant) */}
                    <line x1="72" y1="0" x2="72" y2="100%" stroke="#ef4444" strokeWidth="2.5" opacity="0.18" strokeLinecap="round" />
                    <line x1="74" y1="0" x2="74" y2="100%" stroke="#ef4444" strokeWidth="0.5" opacity="0.12" />
                </svg>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* En-tête minimaliste */}
                <div className="mb-12">
                    <div className="text-xs text-gray-500 mb-3 font-medium tracking-wider uppercase">
                        {concoursData.concours} · {concoursData.annee}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {concoursData.resume.title}
                    </h1>
                    <p className="text-base text-gray-700 leading-relaxed max-w-3xl">
                        <FormattedText text={concoursData.resume.introduction} />
                    </p>
                </div>

                {/* Progression minimaliste */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Section {currentSectionIndex + 1} / {totalSections}
                    </div>
                </div>

                {/* Section actuelle - Tout dans un seul cadre style cahier */}
                <div className="mb-12 bg-white shadow-sm border border-gray-300">
                    <div className="px-12 py-10">
                        {/* Titre de la section avec couleur selon le type */}
                        <h2 className={`text-2xl font-bold mb-8 pb-3 border-b-2 ${
                            currentSection.type === 'definitions' ? 'text-blue-600 border-blue-600' :
                            currentSection.type === 'formules' ? 'text-blue-600 border-blue-600' :
                            currentSection.type === 'methodes' ? 'text-gray-900 border-gray-900' :
                            currentSection.type === 'pieges' ? 'text-red-600 border-red-600' :
                            currentSection.type === 'reflexion' ? 'text-blue-600 border-blue-600' :
                            currentSection.type === 'astuces' ? 'text-gray-900 border-gray-900' :
                            'text-gray-900 border-gray-900'
                        }`}>
                            {currentSection.title}
                        </h2>

                        {/* Liste des items avec puces chics et modernes */}
                        <div className="space-y-5">
                            {currentSection.items.map((item: string, itemIndex: number) => {
                                const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');

                                // Choix de la puce selon le type de section
                                const getBulletIcon = () => {
                                    if (isWarning) {
                                        // Triangle d'alerte pour les warnings
                                        return (
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.1" />
                                                <circle cx="10" cy="13" r="1" fill="currentColor" />
                                                <line x1="10" y1="8" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        );
                                    }

                                    switch (currentSection.type) {
                                        case 'definitions':
                                            // Hexagone pour définitions
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 2L16 6V14L10 18L4 14V6L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" opacity="0.15" />
                                                </svg>
                                            );
                                        case 'formules':
                                            // Étoile pour formules
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 2L11.5 7.5L17 7.5L12.5 11L14 16.5L10 13L6 16.5L7.5 11L3 7.5L8.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.15" />
                                                </svg>
                                            );
                                        case 'methodes':
                                            // Carré pour méthodes
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="4" y="4" width="12" height="12" stroke="currentColor" strokeWidth="2" rx="2" fill="currentColor" opacity="0.15" />
                                                    <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            );
                                        case 'pieges':
                                            // Lightning bolt pour pièges
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 2L5 11H10L9 18L15 9H10L11 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" opacity="0.15" />
                                                </svg>
                                            );
                                        case 'reflexion':
                                            // Ampoule pour réflexion
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
                                                    <path d="M8 12v3h4v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            );
                                        case 'astuces':
                                            // Diamant pour astuces
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 2L16 8L10 18L4 8L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" opacity="0.15" />
                                                    <path d="M4 8h12M10 8v10M7 5l3 3 3-3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                                                </svg>
                                            );
                                        default:
                                            // Cercle par défaut
                                            return (
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
                                                </svg>
                                            );
                                    }
                                };

                                return (
                                    <div
                                        key={itemIndex}
                                        className={`flex gap-4 leading-loose ${
                                            isWarning ? 'text-red-600 font-medium text-base' : 'text-gray-900 text-base'
                                        }`}
                                    >
                                        <div className={`${
                                            isWarning ? 'text-red-600' :
                                            currentSection.type === 'definitions' || currentSection.type === 'formules' || currentSection.type === 'reflexion'
                                                ? 'text-blue-600'
                                                : 'text-gray-900'
                                        }`}>
                                            {getBulletIcon()}
                                        </div>
                                        <div className="flex-1">
                                            <FormattedText text={item} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Navigation minimaliste */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={goToPreviousSection}
                        disabled={isFirstSection}
                        className={`px-6 py-2 text-sm font-medium border transition-all ${
                            isFirstSection
                                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                        }`}
                    >
                        ← Précédent
                    </button>

                    <button
                        onClick={goToNextSection}
                        disabled={isLastSection}
                        className={`px-6 py-2 text-sm font-medium transition-all ${
                            isLastSection
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                        Suivant →
                    </button>
                </div>

                {/* Section de confirmation - Uniquement en mode thème */}
                {isLastSection && navigationMode === 'theme' && (
                    <div className="mt-16 bg-white shadow-sm border border-gray-300 p-8">
                        {!confirmed ? (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Avez-vous terminé de réviser ce thème ?
                                </h3>
                                <p className="text-sm text-gray-700 mb-8 max-w-2xl">
                                    Assurez-vous d'avoir bien compris toutes les sections avant de commencer le quiz.
                                </p>
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all"
                                >
                                    J'ai terminé la révision
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Vous êtes prêt
                                </h3>
                                <p className="text-sm text-gray-700 mb-8">
                                    Le quiz contient {concoursData.quiz.length} questions.
                                </p>
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all inline-flex items-center gap-2"
                                >
                                    Commencer le quiz
                                    <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Message informatif en mode année */}
                {isLastSection && navigationMode === 'year' && (
                    <div className="mt-16 bg-white shadow-sm border-l-4 border-blue-600 p-8">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-blue-600 !text-3xl">info</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Résumé terminé</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Vous avez terminé ce chapitre ! Le quiz complet de l'année {concoursData.annee} est disponible
                                    dans la vue principale de l'année. Il regroupe toutes les questions de tous les chapitres.
                                    <br /><br />
                                    Utilisez le bouton retour de votre navigateur pour revenir à la liste des chapitres et accéder au quiz global.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcoursResumeView;

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
        <div className="min-h-screen relative overflow-hidden concours-math-red" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        }}>
            {/* Modern geometric background with flowing lines and shapes */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="concoursGradientResume" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff9a9e" stopOpacity="0.15" />
                            <stop offset="50%" stopColor="#fecfef" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#ffecd2" stopOpacity="0.15" />
                        </linearGradient>
                        <filter id="blurSmallResume" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="60" />
                        </filter>
                        <pattern id="concours-wave-resume" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.04" />
                            <path d="M0,30 Q15,20 30,30 T60,30" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#concoursGradientResume)" />

                    <g filter="url(#blurSmallResume)" opacity="0.35">
                        <circle cx="15%" cy="25%" r="180" fill="#ffd89b" />
                        <circle cx="85%" cy="15%" r="200" fill="#ff6b95" />
                        <ellipse cx="50%" cy="80%" rx="300" ry="150" fill="#fa709a" />
                        <rect x="70%" y="50%" width="250" height="180" rx="90" fill="#fee140" />
                    </g>

                    <rect width="100%" height="100%" fill="url(#concours-wave-resume)" opacity="0.08" />

                    {/* Flowing curves */}
                    <path d="M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z" fill="white" opacity="0.02" />
                    <path d="M0,200 Q300,150 600,200 T1200,200" stroke="white" strokeWidth="2" fill="none" opacity="0.04" />
                </svg>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* En-tête */}
                <div className="mb-16">
                    <div className="text-xs text-white/70 mb-4 font-light tracking-wider uppercase drop-shadow">
                        {concoursData.concours} · {concoursData.annee}
                    </div>
                    <h1 className="text-4xl font-light text-white mb-4 tracking-tight drop-shadow-lg">
                        {concoursData.resume.title}
                    </h1>
                    <p className="text-base text-white/90 font-light leading-relaxed max-w-3xl drop-shadow">
                        <FormattedText text={concoursData.resume.introduction} />
                    </p>
                </div>

                {/* Progression avec badge */}
                <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-sm text-amber-800 font-medium rounded-xl">
                            Section {currentSectionIndex + 1} / {totalSections}
                        </div>
                        <div className="text-sm text-gray-700 font-medium">
                            {currentSection.title}
                        </div>
                    </div>
                </div>

                {/* Section actuelle */}
                <div className="mb-12 space-y-5">
                    {currentSection.items.map((item: string, itemIndex: number) => {
                        const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');

                        return (
                            <div
                                key={itemIndex}
                                className={`rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                    isWarning
                                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-400'
                                        : 'bg-gradient-to-br from-amber-50 to-yellow-50'
                                }`}
                            >
                                <div className="p-8">
                                    <div className={`text-base leading-relaxed ${
                                        isWarning ? 'text-gray-800' : 'text-gray-800'
                                    }`}>
                                        <FormattedText text={item} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={goToPreviousSection}
                        disabled={isFirstSection}
                        className={`px-6 py-3 text-sm font-light transition-all rounded-xl ${
                            isFirstSection
                                ? 'bg-white/60 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-900 hover:shadow-lg hover:-translate-x-1'
                        }`}
                    >
                        ← Précédent
                    </button>

                    <button
                        onClick={goToNextSection}
                        disabled={isLastSection}
                        className={`px-6 py-3 text-sm font-light transition-all rounded-xl ${
                            isLastSection
                                ? 'bg-white/60 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:translate-x-1'
                        }`}
                    >
                        Suivant →
                    </button>
                </div>

                {/* Section de confirmation - Uniquement en mode thème */}
                {isLastSection && navigationMode === 'theme' && (
                    <div className="mt-16 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                        {!confirmed ? (
                            <div>
                                <h3 className="text-lg font-light text-gray-900 mb-4">
                                    Avez-vous terminé de réviser ce thème ?
                                </h3>
                                <p className="text-sm text-gray-600 font-light mb-8 max-w-2xl">
                                    Assurez-vous d'avoir bien compris toutes les sections avant de commencer le quiz.
                                </p>
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-light hover:shadow-lg transition-all rounded-xl"
                                >
                                    J'ai terminé la révision
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-light text-gray-900 mb-4">
                                    Vous êtes prêt
                                </h3>
                                <p className="text-sm text-gray-600 font-light mb-8">
                                    Le quiz contient {concoursData.quiz.length} questions.
                                </p>
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-light hover:shadow-lg transition-all rounded-xl inline-flex items-center gap-2"
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
                    <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-indigo-100">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-indigo-600 !text-3xl">info</span>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Résumé terminé</h3>
                                <p className="text-sm text-gray-700 font-light leading-relaxed">
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

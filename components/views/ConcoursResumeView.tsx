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
            background: '#f8f9fa',
        }}>
            {/* Seyes (ruled notebook) background pattern */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        {/* Horizontal lines pattern like a notebook */}
                        <pattern id="seyes-lines" width="100%" height="32" patternUnits="userSpaceOnUse">
                            {/* Main line (darker) */}
                            <line x1="0" y1="31" x2="100%" y2="31" stroke="#d1d5db" strokeWidth="1" opacity="0.4" />
                            {/* Light guide lines */}
                            <line x1="0" y1="8" x2="100%" y2="8" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                            <line x1="0" y1="16" x2="100%" y2="16" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                            <line x1="0" y1="24" x2="100%" y2="24" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                        {/* Vertical margin line (red) */}
                        <line id="margin-line" x1="80" y1="0" x2="80" y2="100%" stroke="#ef4444" strokeWidth="2" opacity="0.15" />
                    </defs>

                    {/* Apply the seyes pattern */}
                    <rect width="100%" height="100%" fill="url(#seyes-lines)" />

                    {/* Add the margin line */}
                    <use href="#margin-line" />
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

                        {/* Liste des items sans séparation - tout dans le même bloc */}
                        <div className="space-y-5">
                            {currentSection.items.map((item: string, itemIndex: number) => {
                                const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');

                                return (
                                    <div
                                        key={itemIndex}
                                        className={`leading-loose ${
                                            isWarning ? 'text-red-600 font-medium text-base' : 'text-gray-900 text-base'
                                        }`}
                                    >
                                        <FormattedText text={item} />
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

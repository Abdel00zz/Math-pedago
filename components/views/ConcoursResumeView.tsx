import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import FormattedText from '../FormattedText';
import type { ConcoursData, ConcoursResumeSection } from '../../types';

const ConcoursResumeView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursData, setConcoursData] = useState<ConcoursData | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
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

    const toggleItemCheck = (itemId: string) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden concours-math-red" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            {/* SVG Pattern Background */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="concours-resume-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="white" opacity="0.4"/>
                            <circle cx="0" cy="0" r="2" fill="white" opacity="0.3"/>
                            <circle cx="60" cy="60" r="2" fill="white" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#concours-resume-pattern)" />
                </svg>
            </div>

            <StandardHeader title="Résumé du thème" />

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

                {/* Progression avec badge et barre */}
                <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="inline-block px-3 py-1 bg-indigo-100 text-xs text-indigo-700 font-light rounded-lg">
                            Section {currentSectionIndex + 1} / {totalSections}
                        </div>
                        <div className="text-xs text-gray-600 font-light">
                            {checkedItems.size} / {currentSection.items.length} validés
                        </div>
                    </div>
                    <div className="h-2 bg-gray-100 overflow-hidden rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${currentSection.items.length > 0 ? (checkedItems.size / currentSection.items.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Section actuelle */}
                <div className="mb-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    {/* En-tête de section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-light text-gray-900">
                            {currentSection.title}
                        </h2>
                    </div>

                    {/* Liste des items */}
                    <div className="space-y-4">
                        {currentSection.items.map((item: string, itemIndex: number) => {
                            const itemId = `${currentSectionIndex}-${itemIndex}`;
                            const isChecked = checkedItems.has(itemId);
                            const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');

                            return (
                                <div
                                    key={itemIndex}
                                    className={`bg-white rounded-xl shadow-sm hover:shadow transition-all ${
                                        isWarning ? 'border-l-4 border-l-red-400' : ''
                                    } ${isChecked ? 'bg-gradient-to-br from-green-50 to-emerald-50' : ''}`}
                                >
                                    <div className="p-6">
                                        <div className="flex gap-4 items-start">
                                            {/* Contenu */}
                                            <div className="flex-1 text-sm text-gray-700 font-light leading-relaxed">
                                                <FormattedText text={item} />
                                            </div>

                                            {/* Checkbox rond à droite */}
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => toggleItemCheck(itemId)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                                                        isChecked
                                                            ? 'bg-green-600 border-green-600'
                                                            : 'border-gray-300 hover:border-gray-500'
                                                    }`}
                                                >
                                                    {isChecked && (
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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

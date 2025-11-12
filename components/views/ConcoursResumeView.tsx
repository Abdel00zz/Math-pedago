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

    useEffect(() => {
        const concoursFile = sessionStorage.getItem('currentConcoursFile');
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

    const handleBackClick = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-list' } });
    };

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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!concoursData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Concours introuvable</p>
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
        <div className="min-h-screen bg-white concours-math-red">
            <StandardHeader onBack={handleBackClick} title="Résumé du thème" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* En-tête */}
                <div className="mb-16">
                    <div className="text-xs text-gray-500 mb-4 font-light tracking-wider uppercase">
                        {concoursData.concours} · {concoursData.annee}
                    </div>
                    <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                        {concoursData.resume.title}
                    </h1>
                    <p className="text-base text-gray-600 font-light leading-relaxed max-w-3xl">
                        <FormattedText text={concoursData.resume.introduction} />
                    </p>
                </div>

                {/* Progression avec badge et barre */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="inline-block px-3 py-1 bg-gray-100 text-xs text-gray-600 font-light">
                            Section {currentSectionIndex + 1} / {totalSections}
                        </div>
                        <div className="text-xs text-gray-500 font-light">
                            {checkedItems.size} / {currentSection.items.length} validés
                        </div>
                    </div>
                    <div className="h-2 bg-gray-100 overflow-hidden">
                        <div
                            className="h-full bg-green-600 transition-all duration-500"
                            style={{ width: `${currentSection.items.length > 0 ? (checkedItems.size / currentSection.items.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Section actuelle */}
                <div className="mb-12">
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
                                    className={`border border-gray-200 transition-colors ${
                                        isWarning ? 'border-l-2 border-l-red-500' : ''
                                    } ${isChecked ? 'bg-gray-50' : 'bg-white'}`}
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
                        className={`px-6 py-3 border text-sm font-light transition-colors ${
                            isFirstSection
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 text-gray-900 hover:border-gray-900'
                        }`}
                    >
                        ← Précédent
                    </button>

                    <button
                        onClick={goToNextSection}
                        disabled={isLastSection}
                        className={`px-6 py-3 border text-sm font-light transition-colors ${
                            isLastSection
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-900 bg-gray-900 text-white hover:bg-gray-700 hover:border-gray-700'
                        }`}
                    >
                        Suivant →
                    </button>
                </div>

                {/* Section de confirmation */}
                {isLastSection && (
                    <div className="mt-16">
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
                                    className="px-8 py-3 border border-gray-900 bg-gray-900 text-white text-sm font-light hover:bg-gray-700 hover:border-gray-700 transition-colors"
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
                                    className="px-8 py-3 border border-gray-900 bg-gray-900 text-white text-sm font-light hover:bg-gray-700 hover:border-gray-700 transition-colors"
                                >
                                    Commencer le quiz →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcoursResumeView;

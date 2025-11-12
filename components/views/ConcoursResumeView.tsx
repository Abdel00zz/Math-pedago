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
    const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [revisionMode, setRevisionMode] = useState(false);

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

    const getSectionStyle = (type: string) => {
        const styles: { [key: string]: { bg: string; title: string; icon: string; iconBg: string } } = {
            definitions: {
                bg: 'bg-blue-50',
                title: 'text-blue-700',
                icon: 'menu_book',
                iconBg: 'bg-blue-100',
            },
            formules: {
                bg: 'bg-purple-50',
                title: 'text-purple-700',
                icon: 'calculate',
                iconBg: 'bg-purple-100',
            },
            methodes: {
                bg: 'bg-green-50',
                title: 'text-green-700',
                icon: 'lightbulb',
                iconBg: 'bg-green-100',
            },
            pieges: {
                bg: 'bg-red-50',
                title: 'text-red-700',
                icon: 'warning',
                iconBg: 'bg-red-100',
            },
            reflexion: {
                bg: 'bg-indigo-50',
                title: 'text-indigo-700',
                icon: 'psychology',
                iconBg: 'bg-indigo-100',
            },
            astuces: {
                bg: 'bg-amber-50',
                title: 'text-amber-700',
                icon: 'emoji_objects',
                iconBg: 'bg-amber-100',
            },
        };
        return styles[type] || { bg: 'bg-gray-50', title: 'text-gray-700', icon: 'info', iconBg: 'bg-gray-100' };
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
    const style = getSectionStyle(currentSection.type);

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

    const toggleItemReveal = (itemId: string) => {
        setRevealedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
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

    const revealAllItems = () => {
        const allItemIds = currentSection.items.map((_, idx) => `${currentSectionIndex}-${idx}`);
        setRevealedItems(new Set(allItemIds));
    };

    const hideAllItems = () => {
        setRevealedItems(new Set());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <StandardHeader onBack={handleBackClick} title="Résumé du thème" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* En-tête minimaliste */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                            <span className="material-symbols-outlined text-sm">school</span>
                            {concoursData.concours} · {concoursData.annee}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            {concoursData.resume.title}
                        </h1>
                        <div className="text-sm text-gray-600 leading-relaxed">
                            <FormattedText text={concoursData.resume.introduction} />
                        </div>
                    </div>
                </div>

                {/* Indicateur de progression */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                            Section {currentSectionIndex + 1} sur {totalSections}
                        </span>
                        <span className="text-xs text-gray-500">
                            {Math.round(((currentSectionIndex + 1) / totalSections) * 100)}% complété
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                            style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Navigation par points */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {concoursData.resume.sections.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSectionIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentSectionIndex
                                    ? 'w-8 bg-blue-600'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Aller à la section ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Barre d'outils interactive */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setRevisionMode(!revisionMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                revisionMode
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {revisionMode ? 'visibility_off' : 'visibility'}
                            </span>
                            Mode révision {revisionMode ? 'ON' : 'OFF'}
                        </button>
                        {revisionMode && (
                            <>
                                <button
                                    onClick={revealAllItems}
                                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Tout révéler
                                </button>
                                <button
                                    onClick={hideAllItems}
                                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Tout masquer
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="material-symbols-outlined text-sm">info</span>
                        {revisionMode ? 'Cliquez sur les cartes pour révéler le contenu' : 'Mode lecture active'}
                    </div>
                </div>

                {/* Section actuelle - Design interactif */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 animate-fadeIn">
                    {/* En-tête de section */}
                    <div className={`${style.bg} px-6 py-4 border-b border-gray-200`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`${style.iconBg} rounded-lg p-2 animate-pulse`}>
                                    <span className={`material-symbols-outlined ${style.title} text-xl`}>
                                        {style.icon}
                                    </span>
                                </div>
                                <h2 className={`text-lg font-semibold ${style.title}`}>
                                    {currentSection.title}
                                </h2>
                            </div>
                            <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full">
                                {checkedItems.size} / {currentSection.items.length} compris
                            </div>
                        </div>
                    </div>

                    {/* Contenu de section - interactif */}
                    <div className="px-6 py-6 space-y-3">
                        {currentSection.items.map((item: string, itemIndex: number) => {
                            const itemId = `${currentSectionIndex}-${itemIndex}`;
                            const isRevealed = revealedItems.has(itemId);
                            const isChecked = checkedItems.has(itemId);
                            const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');
                            const isFormula = item.includes('=') || item.includes('→');
                            const isMethod = item.includes('Pour') || item.includes('Utiliser');

                            let baseStyle = 'bg-gray-50 rounded-lg border border-gray-100';
                            let hoverStyle = 'hover:shadow-md hover:scale-[1.02]';

                            if (isWarning) {
                                baseStyle = `${style.bg} border border-red-200 rounded-lg`;
                                hoverStyle = 'hover:shadow-lg hover:scale-[1.02] hover:border-red-300';
                            } else if (isFormula) {
                                baseStyle = 'bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200';
                                hoverStyle = 'hover:shadow-lg hover:scale-[1.02] hover:from-blue-100 hover:to-purple-100';
                            } else if (isMethod) {
                                baseStyle = 'bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500';
                                hoverStyle = 'hover:shadow-md hover:scale-[1.02] hover:from-green-100 hover:to-emerald-100';
                            }

                            return (
                                <div
                                    key={itemIndex}
                                    className={`relative p-4 text-sm text-gray-700 leading-relaxed transition-all duration-300 cursor-pointer ${baseStyle} ${hoverStyle} ${
                                        isChecked ? 'ring-2 ring-green-500 ring-offset-2' : ''
                                    }`}
                                    onClick={() => revisionMode && toggleItemReveal(itemId)}
                                >
                                    {/* Badge de type */}
                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                        {isWarning && (
                                            <span className="text-lg animate-bounce">⚠️</span>
                                        )}
                                        {isFormula && (
                                            <span className="material-symbols-outlined text-purple-600 text-lg">calculate</span>
                                        )}
                                        {isMethod && (
                                            <span className="material-symbols-outlined text-green-600 text-lg">lightbulb</span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleItemCheck(itemId);
                                            }}
                                            className={`p-1 rounded-full transition-all ${
                                                isChecked
                                                    ? 'bg-green-500 text-white scale-110'
                                                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Contenu */}
                                    {revisionMode && !isRevealed ? (
                                        <div className="flex items-center justify-center py-8 text-gray-400">
                                            <div className="text-center">
                                                <span className="material-symbols-outlined text-4xl mb-2 animate-pulse">touch_app</span>
                                                <p className="text-xs">Cliquez pour révéler</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`pr-16 ${revisionMode && isRevealed ? 'animate-fadeIn' : ''}`}>
                                            {isMethod && (
                                                <span className="inline-block mr-2 text-green-600 font-bold text-lg">→</span>
                                            )}
                                            <FormattedText text={item} />
                                        </div>
                                    )}

                                    {/* Indicateur de progression */}
                                    {revisionMode && isRevealed && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-slideInUp" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation - Minimaliste */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={goToPreviousSection}
                        disabled={isFirstSection}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            isFirstSection
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Précédent
                    </button>

                    <button
                        onClick={goToNextSection}
                        disabled={isLastSection}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            isLastSection
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                    >
                        Suivant
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>

                {/* Section de confirmation - Version minimaliste */}
                {isLastSection && (
                    <div className="mt-8 animate-fadeIn">
                        {!confirmed ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <span className="material-symbols-outlined text-blue-600 text-3xl">quiz</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Avez-vous terminé de réviser ce thème ?
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                            Assurez-vous d'avoir bien compris toutes les sections avant de commencer le quiz.
                                        </p>
                                        <button
                                            onClick={handleStartQuiz}
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            J'ai terminé la révision
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-green-600 text-3xl">verified</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                                            Vous êtes prêt ! 🎯
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Le quiz contient <span className="font-bold text-green-700">{concoursData.quiz.length} questions</span>.
                                        </p>
                                        <button
                                            onClick={handleStartQuiz}
                                            className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                                            Commencer le quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcoursResumeView;

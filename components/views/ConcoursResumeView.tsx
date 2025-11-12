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
        const styles: { [key: string]: { border: string; bg: string; title: string } } = {
            definitions: {
                border: 'border-blue-500',
                bg: 'bg-blue-50',
                title: 'text-blue-700',
            },
            formules: {
                border: 'border-purple-500',
                bg: 'bg-purple-50',
                title: 'text-purple-700',
            },
            methodes: {
                border: 'border-green-500',
                bg: 'bg-green-50',
                title: 'text-green-700',
            },
            pieges: {
                border: 'border-red-500',
                bg: 'bg-red-50',
                title: 'text-red-700',
            },
            reflexion: {
                border: 'border-indigo-500',
                bg: 'bg-indigo-50',
                title: 'text-indigo-700',
            },
            astuces: {
                border: 'border-amber-500',
                bg: 'bg-amber-50',
                title: 'text-amber-700',
            },
        };
        return styles[type] || { border: 'border-gray-300', bg: 'bg-gray-50', title: 'text-gray-700' };
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

    return (
        <div className="min-h-screen bg-white">
            <StandardHeader onBack={handleBackClick} title="Résumé du thème" />

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 pb-8 border-b-2 border-gray-200">
                    <div className="text-xs text-gray-500 mb-4 font-light tracking-wider uppercase">
                        {concoursData.concours} · {concoursData.annee}
                    </div>
                    <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                        {concoursData.resume.title}
                    </h1>
                    <p className="text-base text-gray-600 font-light leading-relaxed">
                        <FormattedText text={concoursData.resume.introduction} />
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-10 mb-16">
                    {concoursData.resume.sections.map((section: ConcoursResumeSection, index: number) => {
                        const style = getSectionStyle(section.type);

                        return (
                            <div key={index} className={`border-l-4 ${style.border} pl-8`}>
                                <h2 className={`text-lg font-normal ${style.title} mb-6`}>
                                    {section.title}
                                </h2>

                                <div className="space-y-4">
                                    {section.items.map((item: string, itemIndex: number) => {
                                        // Détection de type d'item pour styling spécial
                                        const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');
                                        const isFormula = item.includes('=') || item.includes('→');
                                        const isMethod = item.includes('Pour') || item.includes('Utiliser');

                                        let itemStyle = 'border-l-2 border-gray-200 pl-4 py-2';

                                        if (isWarning) {
                                            itemStyle = `border-2 ${style.border} ${style.bg} p-4`;
                                        } else if (isFormula) {
                                            itemStyle = 'border border-gray-200 p-4 bg-gray-50';
                                        } else if (isMethod) {
                                            itemStyle = 'pl-6 relative';
                                        }

                                        return (
                                            <div
                                                key={itemIndex}
                                                className={`text-sm text-gray-700 leading-relaxed ${itemStyle}`}
                                            >
                                                {isMethod && (
                                                    <span className="absolute left-0 top-2 text-gray-400">→</span>
                                                )}
                                                <FormattedText text={item} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Carte mentale (si c'est un thème qui le nécessite) */}
                {concoursData.theme.toLowerCase().includes('complexe') && (
                    <div className="mb-16 border-2 border-gray-200 p-8">
                        <h3 className="text-base font-normal text-gray-900 mb-8 text-center">
                            Carte mentale : Les nombres complexes
                        </h3>
                        <div className="flex flex-col items-center space-y-6">
                            <div className="border-2 border-blue-500 bg-blue-50 px-6 py-3 text-center">
                                <span className="text-blue-700 font-medium">$z = a + ib$</span>
                            </div>
                            <div className="text-gray-400 text-2xl">↓</div>
                            <div className="grid grid-cols-3 gap-6 w-full">
                                <div className="border border-gray-300 p-4 text-center">
                                    <div className="text-xs text-gray-500 mb-2">Module</div>
                                    <div className="text-sm">$|z| = \sqrt{a^2 + b^2}$</div>
                                </div>
                                <div className="border border-gray-300 p-4 text-center">
                                    <div className="text-xs text-gray-500 mb-2">Argument</div>
                                    <div className="text-sm">$\arg(z) = \theta$</div>
                                </div>
                                <div className="border border-gray-300 p-4 text-center">
                                    <div className="text-xs text-gray-500 mb-2">Conjugué</div>
                                    <div className="text-sm">$\overline{z} = a - ib$</div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-2xl">↓</div>
                            <div className="border-2 border-purple-500 bg-purple-50 px-6 py-3 text-center">
                                <span className="text-purple-700 font-medium">$z = |z| e^{i\theta}$</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation */}
                <div className="border-t-2 border-gray-200 pt-8">
                    {!confirmed ? (
                        <div>
                            <h3 className="text-base font-normal text-gray-900 mb-4">
                                Avez-vous terminé de réviser ce thème ?
                            </h3>
                            <p className="text-sm text-gray-600 font-light mb-6 leading-relaxed">
                                Assurez-vous d'avoir bien compris les définitions, formules et méthodes avant de commencer le quiz.
                            </p>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-gray-900 text-white px-8 py-3 text-sm font-light hover:bg-gray-700 transition-colors"
                            >
                                J'ai terminé la révision
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-base font-normal text-gray-900 mb-4">
                                Vous êtes prêt
                            </h3>
                            <p className="text-sm text-gray-600 font-light mb-6 leading-relaxed">
                                Le quiz contient {concoursData.quiz.length} questions. Prenez votre temps et n'hésitez pas à utiliser les indices.
                            </p>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-gray-900 text-white px-8 py-3 text-sm font-light hover:bg-gray-700 transition-colors"
                            >
                                Commencer le quiz →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConcoursResumeView;

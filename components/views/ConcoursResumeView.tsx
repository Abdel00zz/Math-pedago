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

    return (
        <div className="min-h-screen bg-white">
            <StandardHeader onBack={handleBackClick} title="Résumé du thème" />

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 pb-8">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl shadow-xl p-8 text-white animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-4 font-medium tracking-wider uppercase">
                            <span className="material-symbols-outlined text-sm">school</span>
                            {concoursData.concours} · {concoursData.annee}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-tight">
                            {concoursData.resume.title}
                        </h1>
                        <div className="text-lg text-gray-200 leading-relaxed bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <FormattedText text={concoursData.resume.introduction} />
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8 mb-16">
                    {concoursData.resume.sections.map((section: ConcoursResumeSection, index: number) => {
                        const style = getSectionStyle(section.type);

                        return (
                            <div
                                key={index}
                                className="animate-slideInUp bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Section Header with Icon */}
                                <div className={`${style.bg} px-6 py-4 flex items-center gap-3`}>
                                    <div className={`${style.iconBg} rounded-full p-2 flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined ${style.title} text-2xl`}>
                                            {style.icon}
                                        </span>
                                    </div>
                                    <h2 className={`text-xl font-semibold ${style.title}`}>
                                        {section.title}
                                    </h2>
                                </div>

                                {/* Section Content */}
                                <div className="px-6 py-5 space-y-4">
                                    {section.items.map((item: string, itemIndex: number) => {
                                        // Détection de type d'item pour styling spécial
                                        const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');
                                        const isFormula = item.includes('=') || item.includes('→');
                                        const isMethod = item.includes('Pour') || item.includes('Utiliser');

                                        let itemStyle = 'bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200';

                                        if (isWarning) {
                                            itemStyle = `${style.bg} border-2 border-${section.type === 'pieges' ? 'red' : 'gray'}-300 rounded-lg p-4 shadow-sm`;
                                        } else if (isFormula) {
                                            itemStyle = 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 font-medium';
                                        } else if (isMethod) {
                                            itemStyle = 'bg-white border-l-4 border-green-400 pl-5 py-3 rounded-r-lg';
                                        }

                                        return (
                                            <div
                                                key={itemIndex}
                                                className={`text-base text-gray-800 leading-relaxed ${itemStyle} animate-fadeIn`}
                                                style={{ animationDelay: `${(index * 100) + (itemIndex * 50)}ms` }}
                                            >
                                                {isMethod && (
                                                    <span className="inline-block mr-2 text-green-500 font-bold">→</span>
                                                )}
                                                {isWarning && (
                                                    <span className="inline-block mr-2">⚠️</span>
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
                    <div className="mb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-lg p-8 animate-fadeIn">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-indigo-600 text-3xl">account_tree</span>
                            <h3 className="text-2xl font-semibold text-gray-900">
                                Carte mentale : Les nombres complexes
                            </h3>
                        </div>
                        <div className="flex flex-col items-center space-y-6">
                            {/* Forme algébrique */}
                            <div className="bg-white border-3 border-blue-500 rounded-xl shadow-md px-8 py-4 text-center transform hover:scale-105 transition-transform duration-300">
                                <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">Forme algébrique</div>
                                <span className="text-blue-700 font-semibold text-lg">
                                    <FormattedText text="$z = a + ib$" />
                                </span>
                            </div>

                            {/* Flèche */}
                            <div className="text-gray-400 text-3xl animate-bounce">↓</div>

                            {/* Propriétés */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                                <div className="bg-white rounded-xl shadow-md p-5 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border-t-4 border-blue-400">
                                    <div className="flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-blue-500 text-2xl mr-2">straighten</span>
                                        <div className="text-sm text-gray-700 font-semibold">Module</div>
                                    </div>
                                    <div className="text-base text-gray-800 font-medium">
                                        <FormattedText text="$|z| = \\sqrt{a^2 + b^2}$" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-5 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border-t-4 border-purple-400">
                                    <div className="flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-purple-500 text-2xl mr-2">rotate_right</span>
                                        <div className="text-sm text-gray-700 font-semibold">Argument</div>
                                    </div>
                                    <div className="text-base text-gray-800 font-medium">
                                        <FormattedText text="$\\arg(z) = \\theta$" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-5 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-400">
                                    <div className="flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-indigo-500 text-2xl mr-2">swap_vert</span>
                                        <div className="text-sm text-gray-700 font-semibold">Conjugué</div>
                                    </div>
                                    <div className="text-base text-gray-800 font-medium">
                                        <FormattedText text="$\\overline{z} = a - ib$" />
                                    </div>
                                </div>
                            </div>

                            {/* Flèche */}
                            <div className="text-gray-400 text-3xl animate-bounce" style={{ animationDelay: '150ms' }}>↓</div>

                            {/* Forme exponentielle */}
                            <div className="bg-white border-3 border-purple-500 rounded-xl shadow-md px-8 py-4 text-center transform hover:scale-105 transition-transform duration-300">
                                <div className="text-xs text-purple-600 font-semibold mb-2 uppercase tracking-wider">Forme exponentielle</div>
                                <span className="text-purple-700 font-semibold text-lg">
                                    <FormattedText text="$z = |z| e^{i\\theta}$" />
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation */}
                <div className="mt-8">
                    {!confirmed ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-8 animate-fadeIn">
                            <div className="flex items-start gap-4 mb-6">
                                <span className="material-symbols-outlined text-blue-600 text-4xl">quiz</span>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                        Avez-vous terminé de réviser ce thème ?
                                    </h3>
                                    <p className="text-base text-gray-700 leading-relaxed">
                                        Assurez-vous d'avoir bien compris les <span className="font-semibold text-blue-700">définitions</span>,
                                        <span className="font-semibold text-purple-700"> formules</span> et
                                        <span className="font-semibold text-green-700"> méthodes</span> avant de commencer le quiz.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                J'ai terminé la révision
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md p-8 animate-fadeIn border-2 border-green-200">
                            <div className="flex items-start gap-4 mb-6">
                                <span className="material-symbols-outlined text-green-600 text-4xl">verified</span>
                                <div>
                                    <h3 className="text-2xl font-semibold text-green-900 mb-3 flex items-center gap-2">
                                        Vous êtes prêt ! 🎯
                                    </h3>
                                    <p className="text-base text-gray-700 leading-relaxed mb-4">
                                        Le quiz contient <span className="font-bold text-green-700">{concoursData.quiz.length} questions</span>.
                                        Prenez votre temps et n'hésitez pas à utiliser les indices si nécessaire.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-green-200">
                                        <span className="material-symbols-outlined text-amber-500 text-xl">tips_and_updates</span>
                                        <span>Conseil : Lisez bien chaque question avant de répondre</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 animate-pulse"
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                Commencer le quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConcoursResumeView;

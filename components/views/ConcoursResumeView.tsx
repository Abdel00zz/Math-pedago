import React, { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import type { ConcoursData, ConcoursResumeSection } from '../../types';

const ConcoursResumeView: React.FC = () => {
    const { dispatch } = useAppState();
    const [concoursData, setConcoursData] = useState<ConcoursData | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const concoursFile = sessionStorage.getItem('currentConcoursFile');
        if (!concoursFile) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        // Charger les données du concours
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
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours-list' },
        });
    };

    const handleStartQuiz = () => {
        if (!confirmed) {
            setConfirmed(true);
            return;
        }
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours-quiz' },
        });
    };

    const getSectionIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            definitions: '📚',
            formules: '🔢',
            methodes: '💡',
            pieges: '⚠️',
            reflexion: '🧠',
            astuces: '✨',
        };
        return icons[type] || '📌';
    };

    const getSectionColor = (type: string) => {
        const colors: { [key: string]: string } = {
            definitions: 'from-blue-500 to-cyan-500',
            formules: 'from-purple-500 to-pink-500',
            methodes: 'from-yellow-500 to-orange-500',
            pieges: 'from-red-500 to-orange-500',
            reflexion: 'from-indigo-500 to-purple-500',
            astuces: 'from-green-500 to-emerald-500',
        };
        return colors[type] || 'from-gray-500 to-gray-600';
    };

    const renderMarkdown = (text: string) => {
        // Simple markdown renderer pour **bold** et autres formats basiques
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du résumé...</p>
                </div>
            </div>
        );
    }

    if (!concoursData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Concours introuvable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <StandardHeader
                onBack={handleBackClick}
                title="Résumé du thème"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-sm font-semibold mb-4">
                            <span className="material-symbols-outlined text-sm mr-2">school</span>
                            {concoursData.concours} - {concoursData.annee}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {concoursData.resume.title}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {concoursData.resume.introduction}
                        </p>
                    </div>
                </div>

                {/* Sections du résumé */}
                <div className="space-y-6 mb-8">
                    {concoursData.resume.sections.map((section: ConcoursResumeSection, index: number) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
                        >
                            {/* Section Header */}
                            <div className={`bg-gradient-to-r ${getSectionColor(section.type)} p-6 text-white`}>
                                <div className="flex items-center">
                                    <span className="text-4xl mr-4">{getSectionIcon(section.type)}</span>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>
                            </div>

                            {/* Section Content */}
                            <div className="p-6">
                                <div className="space-y-3">
                                    {section.items.map((item: string, itemIndex: number) => (
                                        <div
                                            key={itemIndex}
                                            className="flex items-start bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-shrink-0 mt-1 mr-3">
                                                {section.type === 'pieges' ? (
                                                    <span className="material-symbols-outlined text-red-500">warning</span>
                                                ) : section.type === 'methodes' || section.type === 'astuces' ? (
                                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                ) : (
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                                )}
                                            </div>
                                            <div
                                                className="flex-1 text-gray-800 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirmation et bouton de démarrage du quiz */}
                <div className="bg-white rounded-2xl shadow-lg p-8 sticky bottom-4">
                    {!confirmed ? (
                        <div>
                            <div className="flex items-start mb-6">
                                <span className="material-symbols-outlined text-4xl text-primary mr-4">task_alt</span>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Avez-vous terminé de réviser ce thème ?
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Assurez-vous d'avoir bien compris les définitions, formules et méthodes avant de commencer le quiz.
                                        Vous pouvez revenir consulter ce résumé à tout moment pendant le quiz.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined mr-2">check_circle</span>
                                Oui, j'ai terminé la révision
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-start mb-6">
                                <span className="material-symbols-outlined text-4xl text-success mr-4">verified</span>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Parfait ! Vous êtes prêt(e) 🎯
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Le quiz contient {concoursData.quiz.length} questions. Prenez votre temps et n'hésitez pas à utiliser les indices si nécessaire.
                                        Bonne chance ! 🍀
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartQuiz}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
                            >
                                <span className="material-symbols-outlined mr-2">play_arrow</span>
                                Commencer le quiz
                                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Info supplémentaire */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>💡 Astuce : Utilisez la touche <kbd className="px-2 py-1 bg-gray-200 rounded">Retour</kbd> pour revenir à ce résumé si nécessaire</p>
                </div>
            </div>
        </div>
    );
};

export default ConcoursResumeView;

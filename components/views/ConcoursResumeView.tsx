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
                <div className="mb-12 pb-8 border-b border-gray-200">
                    <div className="text-xs text-gray-500 mb-4 font-light">
                        {concoursData.concours} - {concoursData.annee}
                    </div>
                    <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                        {concoursData.resume.title}
                    </h1>
                    <p className="text-base text-gray-600 font-light leading-relaxed">
                        {concoursData.resume.introduction}
                    </p>
                </div>

                <div className="space-y-12 mb-16">
                    {concoursData.resume.sections.map((section: ConcoursResumeSection, index: number) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-8">
                            <h2 className="text-lg font-normal text-gray-900 mb-6">{section.title}</h2>
                            <div className="space-y-3">
                                {section.items.map((item: string, itemIndex: number) => (
                                    <div key={itemIndex} className="text-sm text-gray-700 font-light leading-relaxed">
                                        <FormattedText text={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-8">
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

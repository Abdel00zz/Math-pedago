import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
// StandardHeader removed per concours design change
import FormattedText from '../FormattedText';
import ConcoursBackground from '../ConcoursBackground';
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

        // If navigationMode is 'theme' we may have multiple files to aggregate
        const themeFilesRaw = localStorage.getItem('concoursThemeFiles');

        if (navigationMode === 'theme' && themeFilesRaw) {
            try {
                const files = JSON.parse(themeFilesRaw) as Array<{ file: string }>;
                // Fetch all files and aggregate resume sections and quizzes
                Promise.all(files.map(f => fetch(f.file).then(r => r.json()).catch(() => null)))
                    .then(all => {
                        const valid = all.filter(Boolean) as ConcoursData[];
                        if (valid.length === 0) {
                            setLoading(false);
                            return;
                        }

                        // Use first file metadata as base
                        const base = valid[0];
                        const combinedSections = valid.reduce((acc: ConcoursResumeSection[], d) => {
                            if (d?.resume?.sections && Array.isArray(d.resume.sections)) {
                                return acc.concat(d.resume.sections);
                            }
                            return acc;
                        }, []);

                        const combinedQuiz = valid.reduce((acc: any[], d) => acc.concat(d.quiz || []), []);

                        const aggregated: ConcoursData = {
                            ...base,
                            resume: {
                                title: base.resume.title || `${base.concours} — Résumé agrégé`,
                                introduction: base.resume.introduction || '',
                                sections: combinedSections
                            },
                            quiz: combinedQuiz
                        } as any;

                        setConcoursData(aggregated);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Erreur lors de l\'agrégation des fichiers:', err);
                        setLoading(false);
                    });
            } catch (e) {
                console.error('Format de concoursThemeFiles invalide', e);
                setLoading(false);
            }

            return;
        }

        // Default: single file
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
            <ConcoursBackground variant="resume" />

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

                {/* Progression removed per design — cleaner, Coursera-like flow */}

                {/* Section actuelle - Tout dans un seul cadre style cahier */}
                <div className="mb-12 bg-white shadow-sm border border-gray-300">
                    <div className="px-12 py-10">
                        {/* Titre de la section - encadré centré (pas de soulignement) */}
                        <div className="mb-8 flex justify-center">
                            <div className="border border-gray-200 rounded-md px-6 py-2 bg-white text-center">
                                <h2 className="text-2xl font-semibold text-red-600 m-0">
                                    {currentSection.title}
                                </h2>
                            </div>
                        </div>

                        {/* Liste des items avec puces carrées, alignées */}
                        <div className="space-y-5">
                            {currentSection.items.map((item: string, itemIndex: number) => {
                                const isWarning = item.includes('ATTENTION') || item.includes('DANGER') || item.includes('PIÈGE');
                                // Uniform square bullet (shifted slightly down for better optical alignment)
                                const getBulletIcon = () => {
                                    const common = { width: 10, height: 10, rx: 1 };
                                    if (isWarning) {
                                        return (
                                            <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="3" width="10" height="10" rx="2" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
                                            </svg>
                                        );
                                    }

                                    // color by section type but square shape
                                    switch (currentSection.type) {
                                        case 'definitions':
                                        case 'formules':
                                        case 'reflexion':
                                            return (
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="10" height="10" rx="2" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1" />
                                                </svg>
                                            );
                                        case 'methodes':
                                            return (
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="10" height="10" rx="2" fill="#f3f4f6" stroke="#111827" strokeWidth="1" />
                                                </svg>
                                            );
                                        case 'pieges':
                                            return (
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="10" height="10" rx="2" fill="#fff1f2" stroke="#ef4444" strokeWidth="1" />
                                                </svg>
                                            );
                                        case 'astuces':
                                            return (
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="10" height="10" rx="2" fill="#f8fafc" stroke="#111827" strokeWidth="1" />
                                                </svg>
                                            );
                                        default:
                                            return (
                                                <svg className="w-4 h-4 flex-shrink-0 translate-y-1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="10" height="10" rx="2" fill="#f8fafc" stroke="#111827" strokeWidth="1" />
                                                </svg>
                                            );
                                    }
                                };

                                return (
                                    <div
                                        key={itemIndex}
                                        className={`flex items-start gap-4 leading-loose ${
                                            isWarning ? 'text-red-600 font-medium text-base' : 'text-gray-900 text-base'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 ${
                                            isWarning ? 'text-red-600' : (currentSection.type === 'definitions' || currentSection.type === 'formules' || currentSection.type === 'reflexion' ? 'text-blue-600' : 'text-gray-900')
                                        }`}>
                                            {getBulletIcon()}
                                        </div>
                                        <div className="flex-1 text-base leading-relaxed">
                                            <div className={`${isWarning ? 'text-red-600 font-medium' : (currentSection.type === 'definitions' || currentSection.type === 'formules' || currentSection.type === 'reflexion' ? 'text-blue-700' : 'text-gray-900')}`}>
                                                <FormattedText text={item} />
                                            </div>
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

                {/* Section de confirmation - Uniquement en mode thème (simplifiée) */}
                {isLastSection && navigationMode === 'theme' && (
                    <div className="mt-12 bg-white shadow-sm border border-gray-200 p-6 rounded-lg flex items-center justify-between gap-6">
                        <div>
                            <div className="text-lg font-medium text-gray-900">Résumé terminé</div>
                            <div className="text-sm text-gray-600">Prêt à tester vos connaissances ?</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-list' } })}
                                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                            >
                                Retour aux thèmes
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-quiz' } })}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                                Quiz ({concoursData.quiz.length})
                            </button>
                        </div>
                    </div>
                )}

                {/* Message informatif en mode année (simplifié) */}
                {isLastSection && navigationMode === 'year' && (
                    <div className="mt-12 bg-white shadow-sm border border-gray-200 p-6 rounded-lg flex items-center justify-between gap-6">
                        <div>
                            <div className="text-lg font-medium text-gray-900">Résumé terminé</div>
                            <div className="text-sm text-gray-600">Le quiz complet de l'année est disponible.</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-year' } })}
                                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                            >
                                Revenir à l'année
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-quiz', concoursMode: 'year' } })}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                                Quiz complet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcoursResumeView;

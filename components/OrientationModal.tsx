import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import MathContent from './MathContent';
import { CLASS_OPTIONS } from '../constants';
import { Chapter, SECTION_ORDER } from '../types/chapter';
import { getChaptersForClass } from '../data/chaptersData';

interface OrientationModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
}

const OrientationModal: React.FC<OrientationModalProps> = ({ isOpen, onClose, classId }) => {
    const [openChapterId, setOpenChapterId] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<'all' | Chapter['section']>('all');

    const chapters = useMemo(() => getChaptersForClass(classId), [classId]);

    const classLabel = useMemo(() => {
        const match = CLASS_OPTIONS.find(option => option.value === classId);
        return match ? match.label : `Classe ${classId.toUpperCase()}`;
    }, [classId]);

    const sections = useMemo(() => {
        const grouped: Record<Chapter['section'], Chapter[]> = {
            Algèbre: [],
            Analyse: [],
            Géométrie: []
        };

        chapters.forEach(chapter => {
            grouped[chapter.section].push(chapter);
        });

        return grouped;
    }, [chapters]);

    const totals = useMemo(() => {
        let totalContents = 0;
        let totalCapacities = 0;
        const counts: Record<Chapter['section'], number> = {
            Algèbre: 0,
            Analyse: 0,
            Géométrie: 0
        };

        chapters.forEach(chapter => {
            totalContents += chapter.contents.length;
            totalCapacities += chapter.capacities.length;
            counts[chapter.section] += 1;
        });

        return {
            totalChapters: chapters.length,
            totalContents,
            totalCapacities,
            perSection: SECTION_ORDER.map(section => ({
                section,
                count: counts[section]
            }))
        };
    }, [chapters]);

    const availableSections = useMemo(
        () => SECTION_ORDER.filter(section => sections[section].length > 0),
        [sections]
    );

    // Optimisation: Reset seulement quand on change de section ET que le chapitre ouvert n'existe pas dans la nouvelle section
    useEffect(() => {
        if (activeSection === 'all') {
            return;
        }

        const current = sections[activeSection];
        if (!current.length) {
            setOpenChapterId(null);
            return;
        }

        // Ne reset que si un chapitre est ouvert ET qu'il n'existe pas dans la section active
        if (openChapterId !== null) {
            const existsInSection = current.some(chapter => chapter.id === openChapterId);
            if (!existsInSection) {
                setOpenChapterId(null); // Fermer au lieu d'ouvrir automatiquement le premier
            }
        }
    }, [activeSection, sections, openChapterId]);

    const toggleChapter = (id: number) => {
        setOpenChapterId(prev => (prev === id ? null : id));
    };

    const handleSectionChange = (section: 'all' | Chapter['section']) => {
        setActiveSection(section);
    };

    const sectionsToDisplay = activeSection === 'all'
        ? availableSections
        : availableSections.includes(activeSection)
            ? [activeSection]
            : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Programme d'Orientation"
            titleClassName="text-2xl font-bold text-foreground"
            hideHeaderBorder={true}
            className="sm:max-w-6xl md:max-w-7xl landscape:max-w-[95vw] landscape:max-h-[90vh]"
        >
            <div className="pt-2 pb-6 px-2 max-h-[85vh] landscape:max-h-[80vh] overflow-y-auto space-y-8 text-foreground">
                {/* Header avec background SVG */}
                <div className="relative px-4 pt-4 pb-6 rounded-lg overflow-hidden"
                     style={{
                         background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
                     }}>
                    <div className="absolute inset-0 opacity-30">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-primary" opacity="0.3"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{classLabel}</h3>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Un aperçu complet du programme, des contenus et des capacités à maîtriser.
                        </p>
                    </div>
                    
                    <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Chapitres</p>
                            <p className="mt-1 text-3xl font-semibold text-primary">{totals.totalChapters}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Contenus</p>
                            <p className="mt-1 text-3xl font-semibold text-primary">{totals.totalContents}</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Capacités</p>
                            <p className="mt-1 text-3xl font-semibold text-primary">{totals.totalCapacities}</p>
                        </div>
                    </div>
                </div>

                {chapters.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-lg font-semibold text-muted-foreground">Programme en cours de préparation</p>
                        <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt pour découvrir les chapitres.</p>
                    </div>
                ) : (
                    <div className="px-4 space-y-8">
                        {/* Filtres */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleSectionChange('all')}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                                    activeSection === 'all'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-transparent text-foreground hover:bg-accent border-border'
                                }`}
                            >
                                Tout
                            </button>
                            {availableSections.map(section => (
                                <button
                                    key={section}
                                    type="button"
                                    onClick={() => handleSectionChange(section)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                                        activeSection === section
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-transparent text-foreground hover:bg-accent border-border'
                                    }`}
                                >
                                    {section}
                                </button>
                            ))}
                        </div>

                        {/* Liste des chapitres */}
                        <div className="space-y-10">
                            {sectionsToDisplay.map(section => {
                                const sectionChapters = sections[section];

                                if (!sectionChapters.length) {
                                    return null;
                                }

                                return (
                                    <div key={section} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                                            <h4 className="text-2xl font-bold tracking-tight text-foreground">{section}</h4>
                                        </div>

                                        <div className="space-y-3">
                                            {sectionChapters.map((chapter, index) => (
                                                <div
                                                    key={chapter.id}
                                                    className="border border-border bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleChapter(chapter.id)}
                                                        className="w-full p-5 text-left flex items-center justify-between"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                                                Chapitre {index + 1}
                                                            </p>
                                                            <h5 className="mt-1 text-lg font-bold text-foreground">
                                                                <MathContent content={chapter.title} inline={true} />
                                                            </h5>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 ml-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-base">list_alt</span>
                                                                <span className="font-semibold">{chapter.contents.length}</span>
                                                            </div>
                                                             <div className="flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                                <span className="font-semibold">{chapter.capacities.length}</span>
                                                            </div>
                                                            <span
                                                                className={`material-symbols-outlined transition-transform duration-300 ${
                                                                    openChapterId === chapter.id ? 'rotate-180' : ''
                                                                }`}
                                                            >
                                                                expand_more
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {openChapterId === chapter.id && (
                                                        <div className="px-5 pb-5 pt-4 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/20 dark:to-gray-900/20">
                                                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                                                <div>
                                                                    <h6 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                                                                        <span className="material-symbols-outlined text-lg text-primary">list_alt</span>
                                                                        Contenus
                                                                    </h6>
                                                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                                                        {chapter.contents.map(content => (
                                                                            <li key={content}>
                                                                                <MathContent content={content} inline={true} />
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                <div>
                                                                    <h6 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                                                                        <span className="material-symbols-outlined text-lg text-primary">check_circle</span>
                                                                        Capacités
                                                                    </h6>
                                                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                                                        {chapter.capacities.map(capacity => (
                                                                            <li key={capacity}>
                                                                                <MathContent content={capacity} inline={true} />
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrientationModal;
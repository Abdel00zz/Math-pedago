/**
 * StructureNavigator - Panneau de navigation dans la structure de la leçon
 */

import React, { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon,
    TrashIcon,
    BookOpenIcon
} from '../icons';

interface LessonHeader {
    title: string;
    subtitle?: string;
    chapter?: string;
    classe?: string;
    academicYear?: string;
}

interface LessonSection {
    title: string;
    intro?: string;
    subsections: LessonSubsection[];
}

interface LessonSubsection {
    title: string;
    elements: any[];
}

interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

interface StructureNavigatorProps {
    lesson: LessonContent;
    expandedSections: Set<string>;
    onToggleSection: (id: string) => void;
    onUpdateHeader: (field: keyof LessonHeader, value: string) => void;
    onAddSection: () => void;
    onScrollToElement: (sectionIdx: number, subsectionIdx: number, elementIdx: number) => void;
}

export const StructureNavigator: React.FC<StructureNavigatorProps> = ({
    lesson,
    expandedSections,
    onToggleSection,
    onUpdateHeader,
    onAddSection,
    onScrollToElement
}) => {
    return (
        <div className="lesson-editor-panel">
            <div className="lesson-editor-panel__header">
                <div className="lesson-editor-panel__title">
                    <BookOpenIcon className="lesson-editor-panel__title-icon" />
                    Structure de la Leçon
                </div>
            </div>

            <div className="lesson-editor-panel__content">
                {/* Header inputs */}
                <div className="header-editor">
                    <div className="header-field">
                        <label className="header-field-label">Titre de la leçon</label>
                        <input
                            type="text"
                            className="header-field-input header-field-input--large"
                            value={lesson.header.title}
                            onChange={(e) => onUpdateHeader('title', e.target.value)}
                            placeholder="Ex: Les équations du second degré"
                        />
                    </div>

                    <div className="header-field">
                        <label className="header-field-label">Sous-titre (optionnel)</label>
                        <input
                            type="text"
                            className="header-field-input"
                            value={lesson.header.subtitle || ''}
                            onChange={(e) => onUpdateHeader('subtitle', e.target.value)}
                            placeholder="Ex: Résolution et applications"
                        />
                    </div>

                    <div className="header-field">
                        <label className="header-field-label">Chapitre</label>
                        <input
                            type="text"
                            className="header-field-input"
                            value={lesson.header.chapter || ''}
                            onChange={(e) => onUpdateHeader('chapter', e.target.value)}
                            placeholder="Ex: Chapitre 3"
                        />
                    </div>

                    <div className="header-field">
                        <label className="header-field-label">Classe</label>
                        <input
                            type="text"
                            className="header-field-input"
                            value={lesson.header.classe || ''}
                            onChange={(e) => onUpdateHeader('classe', e.target.value)}
                            placeholder="Ex: 1ère année BSM"
                        />
                    </div>

                    <div className="header-field">
                        <label className="header-field-label">Année académique</label>
                        <input
                            type="text"
                            className="header-field-input"
                            value={lesson.header.academicYear || ''}
                            onChange={(e) => onUpdateHeader('academicYear', e.target.value)}
                            placeholder="Ex: 2024-2025"
                        />
                    </div>
                </div>

                {/* Sections list */}
                <div style={{ marginTop: '1.5rem' }}>
                    {lesson.sections.map((section, sIdx) => {
                        const sectionId = `section-${sIdx}`;
                        const isExpanded = expandedSections.has(sectionId);

                        return (
                            <div key={sIdx} className="section-navigator-item">
                                <div
                                    className="section-navigator-header"
                                    onClick={() => onToggleSection(sectionId)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '0.5rem',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    {isExpanded ? (
                                        <ChevronDownIcon style={{ width: '1rem', height: '1rem', color: '#64748b' }} />
                                    ) : (
                                        <ChevronRightIcon style={{ width: '1rem', height: '1rem', color: '#64748b' }} />
                                    )}
                                    <span className="section-number">{sIdx + 1}</span>
                                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                                        {section.title || `Section ${sIdx + 1}`}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                                        {section.subsections.map((subsection, ssIdx) => (
                                            <div
                                                key={ssIdx}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    marginBottom: '0.375rem',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                                                    {subsection.title || `Sous-section ${ssIdx + 1}`}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                                    {subsection.elements.length} élément{subsection.elements.length !== 1 ? 's' : ''}
                                                </div>

                                                {/* Quick element navigation */}
                                                {subsection.elements.length > 0 && (
                                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        {subsection.elements.map((_, eIdx) => (
                                                            <button
                                                                key={eIdx}
                                                                onClick={() => onScrollToElement(sIdx, ssIdx, eIdx)}
                                                                style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    background: '#f1f5f9',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.75rem',
                                                                    color: '#64748b',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left'
                                                                }}
                                                            >
                                                                → Élément {eIdx + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        className="btn btn--primary"
                        onClick={onAddSection}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        <PlusIcon style={{ width: '1rem', height: '1rem' }} />
                        Ajouter une Section
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * EditorPanel - Panneau d'édition principal avec sections/subsections/éléments
 */

import React, { useRef } from 'react';
import {
    PlusIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ImageIcon
} from '../icons';

type LessonElementType =
    | 'p'
    | 'table'
    | 'definition-box'
    | 'theorem-box'
    | 'proposition-box'
    | 'property-box'
    | 'example-box'
    | 'remark-box'
    | 'practice-box'
    | 'explain-box';

interface LessonElement {
    type: LessonElementType;
    content?: string | string[] | any[];
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    columns?: boolean;
    image?: any;
}

interface LessonSubsection {
    title: string;
    elements: LessonElement[];
}

interface LessonSection {
    title: string;
    intro?: string;
    subsections: LessonSubsection[];
}

interface LessonContent {
    header: any;
    sections: LessonSection[];
}

interface EditorPanelProps {
    lesson: LessonContent;
    elementRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
    onUpdateElement: (sIdx: number, ssIdx: number, eIdx: number, field: string, value: any) => void;
    onDeleteElement: (sIdx: number, ssIdx: number, eIdx: number) => void;
    onMoveElementUp: (sIdx: number, ssIdx: number, eIdx: number) => void;
    onMoveElementDown: (sIdx: number, ssIdx: number, eIdx: number) => void;
    onOpenImageModal: (sIdx: number, ssIdx: number, eIdx: number) => void;
    onUpdateSection: (sIdx: number, field: string, value: any) => void;
    onUpdateSubsection: (sIdx: number, ssIdx: number, field: string, value: any) => void;
    onAddSubsection: (sIdx: number) => void;
    onAddElement: (sIdx: number, ssIdx: number, type: LessonElementType) => void;
    onMoveSectionUp: (sIdx: number) => void;
    onMoveSectionDown: (sIdx: number) => void;
    onMoveSubsectionUp: (sIdx: number, ssIdx: number) => void;
    onMoveSubsectionDown: (sIdx: number, ssIdx: number) => void;
    onDeleteSection: (sIdx: number) => void;
}

const ELEMENT_CONFIGS = {
    'p': { label: 'Paragraphe', icon: '📝', color: 'gray' },
    'table': { label: 'Tableau', icon: '📊', color: 'blue' },
    'definition-box': { label: 'Définition', icon: '📘', color: 'blue' },
    'theorem-box': { label: 'Théorème', icon: '🔷', color: 'green' },
    'proposition-box': { label: 'Proposition', icon: '🔶', color: 'teal' },
    'property-box': { label: 'Propriété', icon: '⚡', color: 'indigo' },
    'example-box': { label: 'Exemple', icon: '💡', color: 'orange' },
    'remark-box': { label: 'Remarque', icon: '📌', color: 'purple' },
    'practice-box': { label: 'Exercice', icon: '✏️', color: 'red' },
    'explain-box': { label: 'Analyse', icon: '💭', color: 'cyan' },
} as const;

export const EditorPanel: React.FC<EditorPanelProps> = ({
    lesson,
    elementRefs,
    onUpdateElement,
    onDeleteElement,
    onMoveElementUp,
    onMoveElementDown,
    onOpenImageModal,
    onUpdateSection,
    onUpdateSubsection,
    onAddSubsection,
    onAddElement,
    onMoveSectionUp,
    onMoveSectionDown,
    onMoveSubsectionUp,
    onMoveSubsectionDown,
    onDeleteSection
}) => {
    const [collapsedSections, setCollapsedSections] = React.useState<Set<number>>(new Set());
    const [showElementMenu, setShowElementMenu] = React.useState<string | null>(null);

    const toggleSectionCollapse = (sIdx: number) => {
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(sIdx)) {
            newCollapsed.delete(sIdx);
        } else {
            newCollapsed.add(sIdx);
        }
        setCollapsedSections(newCollapsed);
    };

    return (
        <div className="lesson-editor-panel__content">
            <div style={{ padding: '0.5rem 0' }}>
                {lesson.sections.map((section, sIdx) => {
                    const isCollapsed = collapsedSections.has(sIdx);

                    return (
                        <div key={sIdx} className="section-editor">
                            <div className="section-header">
                                <button
                                    onClick={() => toggleSectionCollapse(sIdx)}
                                    className="section-btn"
                                    title={isCollapsed ? 'Déplier' : 'Replier'}
                                >
                                    {isCollapsed ? (
                                        <ChevronRightIcon style={{ width: '1rem', height: '1rem' }} />
                                    ) : (
                                        <ChevronDownIcon style={{ width: '1rem', height: '1rem' }} />
                                    )}
                                </button>
                                <span className="section-number">{sIdx + 1}</span>
                                <input
                                    type="text"
                                    className="section-title-input"
                                    value={section.title}
                                    onChange={(e) => onUpdateSection(sIdx, 'title', e.target.value)}
                                    placeholder={`Section ${sIdx + 1}`}
                                />
                                <div className="section-actions">
                                    <button
                                        onClick={() => onMoveSectionUp(sIdx)}
                                        disabled={sIdx === 0}
                                        className="section-btn"
                                        title="Déplacer vers le haut"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => onMoveSectionDown(sIdx)}
                                        disabled={sIdx === lesson.sections.length - 1}
                                        className="section-btn"
                                        title="Déplacer vers le bas"
                                    >
                                        ▼
                                    </button>
                                    <button
                                        onClick={() => onDeleteSection(sIdx)}
                                        className="section-btn section-btn--danger"
                                        title="Supprimer la section"
                                    >
                                        <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                    </button>
                                </div>
                            </div>

                            {!isCollapsed && (
                                <>
                                    {/* Section intro */}
                                    {section.intro !== undefined ? (
                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                📄 Texte Introductif
                                            </label>
                                            <textarea
                                                value={section.intro}
                                                onChange={(e) => onUpdateSection(sIdx, 'intro', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '6px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem',
                                                    lineHeight: '1.5'
                                                }}
                                                rows={3}
                                                placeholder="Ce texte apparaîtra après le titre, sans encadrement..."
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onUpdateSection(sIdx, 'intro', '')}
                                            className="btn btn--secondary"
                                            style={{ marginBottom: '1rem', fontSize: '0.8rem' }}
                                        >
                                            <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                            Ajouter un texte introductif
                                        </button>
                                    )}

                                    {/* Subsections */}
                                    {section.subsections.map((subsection, ssIdx) => (
                                        <div key={ssIdx} className="subsection-editor">
                                            <div className="subsection-header">
                                                <span className="subsection-bullet" />
                                                <input
                                                    type="text"
                                                    className="subsection-title-input"
                                                    value={subsection.title}
                                                    onChange={(e) => onUpdateSubsection(sIdx, ssIdx, 'title', e.target.value)}
                                                    placeholder={`Sous-section ${ssIdx + 1}`}
                                                />
                                                <button
                                                    onClick={() => onMoveSubsectionUp(sIdx, ssIdx)}
                                                    disabled={ssIdx === 0}
                                                    className="section-btn"
                                                    title="Déplacer vers le haut"
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    onClick={() => onMoveSubsectionDown(sIdx, ssIdx)}
                                                    disabled={ssIdx === section.subsections.length - 1}
                                                    className="section-btn"
                                                    title="Déplacer vers le bas"
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            {/* Elements */}
                                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {subsection.elements.map((element, eIdx) => {
                                                    const config = ELEMENT_CONFIGS[element.type];
                                                    const elementPath = `s${sIdx}-ss${ssIdx}-e${eIdx}`;

                                                    return (
                                                        <div
                                                            key={eIdx}
                                                            ref={el => elementRefs.current[elementPath] = el}
                                                            style={{
                                                                padding: '1rem',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '8px',
                                                                background: 'white'
                                                            }}
                                                        >
                                                            {/* Element header */}
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                                    <span>{config.icon}</span>
                                                                    <span>{config.label}</span>
                                                                </span>
                                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                    <button
                                                                        onClick={() => onMoveElementUp(sIdx, ssIdx, eIdx)}
                                                                        disabled={eIdx === 0}
                                                                        className="section-btn"
                                                                        title="Déplacer vers le haut"
                                                                    >
                                                                        ▲
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onMoveElementDown(sIdx, ssIdx, eIdx)}
                                                                        disabled={eIdx === subsection.elements.length - 1}
                                                                        className="section-btn"
                                                                        title="Déplacer vers le bas"
                                                                    >
                                                                        ▼
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onOpenImageModal(sIdx, ssIdx, eIdx)}
                                                                        className="section-btn"
                                                                        title={element.image ? "Remplacer l'image" : "Ajouter une image"}
                                                                        style={element.image ? { background: '#dbeafe', borderColor: '#3b82f6', color: '#1e40af' } : {}}
                                                                    >
                                                                        <ImageIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onDeleteElement(sIdx, ssIdx, eIdx)}
                                                                        className="section-btn section-btn--danger"
                                                                        title="Supprimer"
                                                                    >
                                                                        <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Element content based on type */}
                                                            {element.type === 'p' || element.type === 'table' ? (
                                                                <textarea
                                                                    value={element.content as string}
                                                                    onChange={(e) => onUpdateElement(sIdx, ssIdx, eIdx, 'content', e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '0.75rem',
                                                                        border: '1px solid #cbd5e1',
                                                                        borderRadius: '6px',
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '0.875rem'
                                                                    }}
                                                                    rows={element.type === 'table' ? 6 : 4}
                                                                    placeholder={element.type === 'table' ? 'Format tableau Markdown...' : 'Contenu du paragraphe...'}
                                                                />
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                    {/* Preamble */}
                                                                    <textarea
                                                                        value={element.preamble || ''}
                                                                        onChange={(e) => onUpdateElement(sIdx, ssIdx, eIdx, 'preamble', e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.75rem',
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.875rem'
                                                                        }}
                                                                        rows={2}
                                                                        placeholder="Préambule (titre de la box)..."
                                                                    />

                                                                    {/* List type selector */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
                                                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>Type de liste:</label>
                                                                        <select
                                                                            value={element.listType || 'none'}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value === 'none' ? undefined : e.target.value as 'bullet' | 'numbered';
                                                                                onUpdateElement(sIdx, ssIdx, eIdx, 'listType', value);
                                                                            }}
                                                                            style={{
                                                                                padding: '0.375rem 0.75rem',
                                                                                border: '1px solid #93c5fd',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            <option value="none">Aucune (texte simple)</option>
                                                                            <option value="bullet">⭐ Puces</option>
                                                                            <option value="numbered">① Numérotée</option>
                                                                        </select>

                                                                        {/* Columns checkbox */}
                                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={element.columns || false}
                                                                                onChange={(e) => onUpdateElement(sIdx, ssIdx, eIdx, 'columns', e.target.checked)}
                                                                                style={{ width: '1rem', height: '1rem' }}
                                                                            />
                                                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>🔲 Mode colonnes</span>
                                                                        </label>
                                                                    </div>

                                                                    {/* Content */}
                                                                    <textarea
                                                                        value={Array.isArray(element.content) ? element.content.join('\n') : element.content}
                                                                        onChange={(e) => onUpdateElement(sIdx, ssIdx, eIdx, 'content', e.target.value.split('\n'))}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.75rem',
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '6px',
                                                                            fontFamily: 'monospace',
                                                                            fontSize: '0.875rem',
                                                                            lineHeight: '1.5'
                                                                        }}
                                                                        rows={6}
                                                                        placeholder={
                                                                            element.listType === 'bullet' ? "Une ligne = une puce ⭐\n>> pour désactiver la puce" :
                                                                            element.listType === 'numbered' ? "Une ligne = un numéro ①\n>> pour désactiver le numéro" :
                                                                            "Contenu du cadre..."
                                                                        }
                                                                    />

                                                                    {/* Help text */}
                                                                    {element.listType && (
                                                                        <div style={{ fontSize: '0.75rem', color: '#1e40af', background: '#eff6ff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                                                            <div><strong>💡 Aide:</strong> Chaque ligne = {element.listType === 'bullet' ? 'une étoile ⭐' : 'un numéro ①②③'}</div>
                                                                            <div style={{ marginTop: '0.25rem', color: '#7c3aed' }}>
                                                                                <strong>🎯 NoBullet:</strong> Commencez par <code style={{ padding: '0.125rem 0.375rem', background: '#ede9fe', borderRadius: '3px' }}>&gt;&gt;</code> pour masquer
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Image display */}
                                                            {element.image && (
                                                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>
                                                                            <ImageIcon style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
                                                                            Image attachée
                                                                        </h4>
                                                                    </div>
                                                                    <img
                                                                        src={element.image.dataUrl}
                                                                        alt={element.image.filename}
                                                                        style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid #93c5fd' }}
                                                                    />
                                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                                        {element.image.filename}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add element button */}
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        className="btn btn--secondary"
                                                        onClick={() => {
                                                            const menuId = `${sIdx}-${ssIdx}`;
                                                            setShowElementMenu(showElementMenu === menuId ? null : menuId);
                                                        }}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <PlusIcon style={{ width: '1rem', height: '1rem' }} />
                                                        Ajouter un élément
                                                    </button>

                                                    {showElementMenu === `${sIdx}-${ssIdx}` && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            marginTop: '0.5rem',
                                                            background: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                            padding: '0.5rem',
                                                            zIndex: 10,
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                                            gap: '0.5rem'
                                                        }}>
                                                            {(Object.entries(ELEMENT_CONFIGS) as [LessonElementType, typeof ELEMENT_CONFIGS[LessonElementType]][]).map(([type, config]) => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => {
                                                                        onAddElement(sIdx, ssIdx, type);
                                                                        setShowElementMenu(null);
                                                                    }}
                                                                    style={{
                                                                        padding: '0.5rem',
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: '6px',
                                                                        background: 'white',
                                                                        cursor: 'pointer',
                                                                        textAlign: 'left',
                                                                        fontSize: '0.8rem'
                                                                    }}
                                                                >
                                                                    <div><span>{config.icon}</span> {config.label}</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add subsection button */}
                                    <button
                                        className="btn btn--secondary"
                                        onClick={() => onAddSubsection(sIdx)}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                        Ajouter une sous-section
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

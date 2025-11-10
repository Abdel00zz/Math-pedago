/**
 * ElementEditor - Éditeur pour un élément individuel de leçon
 */

import React from 'react';
import { LessonElement, ELEMENT_CONFIGS } from './types';

interface ElementEditorProps {
    element: LessonElement;
    onChange: (element: LessonElement) => void;
    isActive?: boolean;
}

export const ElementEditor: React.FC<ElementEditorProps> = ({
    element,
    onChange,
    isActive = false,
}) => {
    const config = ELEMENT_CONFIGS[element.type];

    const handleContentChange = (value: string) => {
        onChange({ ...element, content: value });
    };

    const handlePreambleChange = (value: string) => {
        onChange({ ...element, preamble: value });
    };

    const isBoxType = element.type.endsWith('-box');
    const showPreamble = isBoxType;

    return (
        <div className={`element-editor ${isActive ? 'element-editor--active' : ''}`}>
            <style>{`
                .element-editor {
                    padding: 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    margin-bottom: 1rem;
                    transition: all 0.2s;
                }

                .element-editor--active {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .element-editor:hover {
                    border-color: #cbd5e1;
                }

                .element-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .element-icon {
                    font-size: 1.5rem;
                }

                .element-label {
                    font-weight: 600;
                    color: #334155;
                }

                .element-type-badge {
                    margin-left: auto;
                    padding: 0.25rem 0.625rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .badge-gray { background: #f1f5f9; color: #64748b; }
                .badge-blue { background: #dbeafe; color: #1e40af; }
                .badge-green { background: #d1fae5; color: #065f46; }
                .badge-teal { background: #ccfbf1; color: #115e59; }
                .badge-indigo { background: #e0e7ff; color: #3730a3; }
                .badge-orange { background: #ffedd5; color: #9a3412; }
                .badge-purple { background: #f3e8ff; color: #6b21a8; }
                .badge-red { background: #fee2e2; color: #991b1b; }
                .badge-cyan { background: #cffafe; color: #155e75; }

                .element-field {
                    margin-bottom: 1rem;
                }

                .element-field-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 0.5rem;
                }

                .element-field-hint {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 0.25rem;
                }

                .element-input,
                .element-textarea {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    transition: all 0.2s;
                    line-height: 1.6;
                }

                .element-input:focus,
                .element-textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .element-textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                .element-textarea--large {
                    min-height: 200px;
                }

                .format-hints {
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: #f8fafc;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    line-height: 1.6;
                    color: #64748b;
                }

                .format-hint-item {
                    margin: 0.25rem 0;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                }

                .format-hint-code {
                    background: white;
                    padding: 0.125rem 0.375rem;
                    border-radius: 3px;
                    font-weight: 600;
                    color: #6366f1;
                }
            `}</style>

            <div className="element-header">
                <span className="element-icon">{config.icon}</span>
                <span className="element-label">{config.label}</span>
                <span className={`element-type-badge badge-${config.color}`}>
                    {element.type}
                </span>
            </div>

            {showPreamble && (
                <div className="element-field">
                    <label className="element-field-label">
                        Titre / Préambule
                    </label>
                    <input
                        type="text"
                        className="element-input"
                        value={element.preamble || ''}
                        onChange={(e) => handlePreambleChange(e.target.value)}
                        placeholder="ex: **Fonction numérique** :"
                    />
                    <div className="element-field-hint">
                        Utilise **texte** pour le gras, $f(x)$ pour les formules
                    </div>
                </div>
            )}

            <div className="element-field">
                <label className="element-field-label">
                    Contenu
                </label>
                <textarea
                    className={`element-textarea ${isBoxType ? 'element-textarea--large' : ''}`}
                    value={typeof element.content === 'string' ? element.content : JSON.stringify(element.content, null, 2)}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={getPlaceholder(element.type)}
                />

                <div className="format-hints">
                    <div className="format-hint-item">
                        <strong>Formatage :</strong>
                    </div>
                    <div className="format-hint-item">
                        • <span className="format-hint-code">**gras**</span> = texte en gras
                    </div>
                    <div className="format-hint-item">
                        • <span className="format-hint-code">$f(x)$</span> = formule mathématique inline
                    </div>
                    <div className="format-hint-item">
                        • <span className="format-hint-code">$$...$$</span> = formule centrée
                    </div>
                    <div className="format-hint-item">
                        • <span className="format-hint-code">!></span> = alert box (attention)
                    </div>
                    <div className="format-hint-item">
                        • <span className="format-hint-code">?></span> = tip box (astuce)
                    </div>
                    {element.type === 'p' && (
                        <>
                            <div className="format-hint-item">
                                • <span className="format-hint-code">{'>>'}</span> = ligne sans puce
                            </div>
                            <div className="format-hint-item">
                                • <span className="format-hint-code">___réponse___</span> = texte à trous
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

function getPlaceholder(type: string): string {
    const placeholders: Record<string, string> = {
        'p': 'Texte du paragraphe...\nou tableau JSON pour une liste:\n["Premier point", "Deuxième point"]',
        'table': '| Colonne 1 | Colonne 2 |\\n|----------|----------|\\n| Valeur 1 | Valeur 2 |',
        'definition-box': 'Une fonction est...',
        'theorem-box': 'Soit $f$ une fonction...',
        'proposition-box': 'On peut démontrer que...',
        'property-box': 'Les propriétés suivantes sont vérifiées...',
        'example-box': 'Soit $f(x) = x^2$...',
        'remark-box': 'Attention : ne pas confondre...',
        'practice-box': 'Exercice : Calculer...',
        'explain-box': 'Analysons le comportement de...',
    };
    return placeholders[type] || 'Contenu...';
}

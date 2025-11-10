/**
 * ElementToolbar - Barre d'outils contextuelle pour l'édition d'éléments
 */

import React, { useState } from 'react';
import { LessonElementType, ELEMENT_CONFIGS } from './types';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, CopyIcon } from '../icons';

interface ElementToolbarProps {
    onAddElement: (type: LessonElementType) => void;
    onDeleteElement?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDuplicate?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    compact?: boolean;
}

const ChevronUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
    onAddElement,
    onDeleteElement,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    canMoveUp = false,
    canMoveDown = false,
    compact = false,
}) => {
    const [showElementMenu, setShowElementMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredElements = Object.entries(ELEMENT_CONFIGS).filter(([key, config]) =>
        config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            green: 'bg-green-100 text-green-700 hover:bg-green-200',
            teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
            indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
            orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
            purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
            red: 'bg-red-100 text-red-700 hover:bg-red-200',
            cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className={`element-toolbar ${compact ? 'element-toolbar--compact' : ''}`}>
            <style>{`
                .element-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    position: sticky;
                    top: 1rem;
                    z-index: 10;
                    margin-bottom: 1rem;
                }

                .element-toolbar--compact {
                    padding: 0.5rem;
                    gap: 0.25rem;
                }

                .toolbar-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.375rem;
                    padding: 0.5rem 0.875rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .toolbar-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .toolbar-btn--primary {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border-color: #4338ca;
                }

                .toolbar-btn--primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    transform: translateY(-1px);
                }

                .toolbar-btn--secondary {
                    background: white;
                    color: #64748b;
                    border-color: #e2e8f0;
                }

                .toolbar-btn--secondary:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .toolbar-btn--danger {
                    background: white;
                    color: #ef4444;
                    border-color: #fee2e2;
                }

                .toolbar-btn--danger:hover:not(:disabled) {
                    background: #fef2f2;
                    border-color: #fecaca;
                }

                .toolbar-divider {
                    width: 1px;
                    height: 1.5rem;
                    background: #e2e8f0;
                    margin: 0 0.25rem;
                }

                .element-menu {
                    position: relative;
                }

                .element-menu-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    padding: 0.75rem;
                    min-width: 320px;
                    max-height: 500px;
                    overflow-y: auto;
                    z-index: 50;
                }

                .element-menu-search {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                    transition: all 0.2s;
                }

                .element-menu-search:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .element-menu-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.5rem;
                }

                .element-menu-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .element-menu-item:hover {
                    transform: translateX(4px);
                }

                .element-menu-item-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .element-menu-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .element-menu-item-label {
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-bottom: 0.125rem;
                }

                .element-menu-item-description {
                    font-size: 0.75rem;
                    color: #64748b;
                    line-height: 1.4;
                }

                .bg-gray-100 { background-color: #f1f5f9; }
                .text-gray-700 { color: #334155; }
                .hover\\:bg-gray-200:hover { background-color: #e2e8f0; }

                .bg-blue-100 { background-color: #dbeafe; }
                .text-blue-700 { color: #1d4ed8; }
                .hover\\:bg-blue-200:hover { background-color: #bfdbfe; }

                .bg-green-100 { background-color: #d1fae5; }
                .text-green-700 { color: #047857; }
                .hover\\:bg-green-200:hover { background-color: #a7f3d0; }

                .bg-teal-100 { background-color: #ccfbf1; }
                .text-teal-700 { color: #0f766e; }
                .hover\\:bg-teal-200:hover { background-color: #99f6e4; }

                .bg-indigo-100 { background-color: #e0e7ff; }
                .text-indigo-700 { color: #4338ca; }
                .hover\\:bg-indigo-200:hover { background-color: #c7d2fe; }

                .bg-orange-100 { background-color: #ffedd5; }
                .text-orange-700 { color: #c2410c; }
                .hover\\:bg-orange-200:hover { background-color: #fed7aa; }

                .bg-purple-100 { background-color: #f3e8ff; }
                .text-purple-700 { color: #7c3aed; }
                .hover\\:bg-purple-200:hover { background-color: #e9d5ff; }

                .bg-red-100 { background-color: #fee2e2; }
                .text-red-700 { color: #b91c1c; }
                .hover\\:bg-red-200:hover { background-color: #fecaca; }

                .bg-cyan-100 { background-color: #cffafe; }
                .text-cyan-700 { color: #0e7490; }
                .hover\\:bg-cyan-200:hover { background-color: #a5f3fc; }
            `}</style>

            {/* Bouton Ajouter avec menu */}
            <div className="element-menu">
                <button
                    className="toolbar-btn toolbar-btn--primary"
                    onClick={() => setShowElementMenu(!showElementMenu)}
                >
                    <PlusIcon />
                    <span>Ajouter élément</span>
                </button>

                {showElementMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowElementMenu(false)}
                        />
                        <div className="element-menu-dropdown">
                            <input
                                type="text"
                                className="element-menu-search"
                                placeholder="Rechercher un élément..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />

                            <div className="element-menu-grid">
                                {filteredElements.map(([key, config]) => (
                                    <div
                                        key={key}
                                        className={`element-menu-item ${getColorClass(config.color)}`}
                                        onClick={() => {
                                            onAddElement(key as LessonElementType);
                                            setShowElementMenu(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <div className="element-menu-item-icon">
                                            {config.icon}
                                        </div>
                                        <div className="element-menu-item-content">
                                            <div className="element-menu-item-label">
                                                {config.label}
                                            </div>
                                            <div className="element-menu-item-description">
                                                {config.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Actions sur l'élément */}
            {(onMoveUp || onMoveDown || onDuplicate || onDeleteElement) && (
                <>
                    <div className="toolbar-divider" />

                    {onMoveUp && (
                        <button
                            className="toolbar-btn toolbar-btn--secondary"
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            title="Monter"
                        >
                            <ChevronUpIcon />
                        </button>
                    )}

                    {onMoveDown && (
                        <button
                            className="toolbar-btn toolbar-btn--secondary"
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            title="Descendre"
                        >
                            <ChevronDownIcon />
                        </button>
                    )}

                    {onDuplicate && (
                        <button
                            className="toolbar-btn toolbar-btn--secondary"
                            onClick={onDuplicate}
                            title="Dupliquer"
                        >
                            <CopyIcon />
                        </button>
                    )}

                    {onDeleteElement && (
                        <button
                            className="toolbar-btn toolbar-btn--danger"
                            onClick={onDeleteElement}
                            title="Supprimer"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

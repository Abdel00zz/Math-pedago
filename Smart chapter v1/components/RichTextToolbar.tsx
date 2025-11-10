/**
 * RichTextToolbar - Barre d'outils pour l'édition de texte
 * Supporte : Gras, Italique, Souligné, Barré, Listes, etc.
 */

import React, { useRef } from 'react';
import { ImageIcon } from './icons';

interface RichTextToolbarProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    onImageClick?: () => void;
    elementType?: 'p' | 'box';
    listType?: 'bullet' | 'numbered' | undefined;
    onListTypeChange?: (type: 'bullet' | 'numbered' | undefined) => void;
    columns?: boolean;
    onColumnsChange?: (columns: boolean) => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
    value,
    onChange,
    onImageClick,
    elementType = 'p',
    listType,
    onListTypeChange,
    columns,
    onColumnsChange
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Obtenir la sélection actuelle dans le textarea
    const getSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return { start: 0, end: 0, text: '' };

        return {
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
            text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
        };
    };

    // Insérer du texte à la position du curseur
    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { start, end, text } = getSelection();
        const currentValue = typeof value === 'string' ? value : value.join('\n');

        const newText = currentValue.substring(0, start) + before + text + after + currentValue.substring(end);

        if (typeof value === 'string') {
            onChange(newText);
        } else {
            onChange(newText.split('\n'));
        }

        // Repositionner le curseur
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + text.length);
        }, 0);
    };

    // Actions de formatage
    const makeBold = () => insertText('**', '**');
    const makeItalic = () => insertText('*', '*');
    const makeUnderline = () => insertText('<u>', '</u>');
    const makeStrikethrough = () => insertText('~~', '~~');

    return (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            {/* BARRE D'OUTILS EN HAUT */}
            <div className="bg-gray-50 border-b border-gray-300 px-3 py-2">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Formatage de texte */}
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-1">Formatage:</span>

                    <button
                        onClick={makeBold}
                        className="toolbar-btn"
                        title="Gras (**texte**)"
                        type="button"
                    >
                        <span className="font-bold">B</span>
                    </button>

                    <button
                        onClick={makeItalic}
                        className="toolbar-btn"
                        title="Italique (*texte*)"
                        type="button"
                    >
                        <span className="italic">I</span>
                    </button>

                    <button
                        onClick={makeUnderline}
                        className="toolbar-btn"
                        title="Souligné (<u>texte</u>)"
                        type="button"
                    >
                        <span className="underline">U</span>
                    </button>

                    <button
                        onClick={makeStrikethrough}
                        className="toolbar-btn"
                        title="Barré (~~texte~~)"
                        type="button"
                    >
                        <span className="line-through">S</span>
                    </button>

                    {/* Séparateur */}
                    {(elementType === 'box' && onListTypeChange) || onImageClick ? (
                        <div className="h-6 w-px bg-gray-400 mx-1"></div>
                    ) : null}

                    {/* Listes (uniquement pour les boxes) */}
                    {elementType === 'box' && onListTypeChange && (
                        <>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-1">Listes:</span>

                            <button
                                onClick={() => onListTypeChange(listType === 'bullet' ? undefined : 'bullet')}
                                className={`toolbar-btn ${listType === 'bullet' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                                title="Liste à puces"
                                type="button"
                            >
                                ⭐
                            </button>

                            <button
                                onClick={() => onListTypeChange(listType === 'numbered' ? undefined : 'numbered')}
                                className={`toolbar-btn ${listType === 'numbered' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                                title="Liste numérotée"
                                type="button"
                            >
                                ①
                            </button>

                            {/* Séparateur avant Colonnes */}
                            {onColumnsChange && <div className="h-6 w-px bg-gray-400 mx-1"></div>}

                            {/* Bouton Colonnes */}
                            {onColumnsChange && (
                                <>
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-1">Colonnes:</span>
                                    <button
                                        onClick={() => onColumnsChange(!columns)}
                                        className={`toolbar-btn ${columns ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
                                        title="Afficher en colonnes côte à côte"
                                        type="button"
                                    >
                                        🔲
                                    </button>
                                </>
                            )}

                            {onImageClick && <div className="h-6 w-px bg-gray-400 mx-1"></div>}
                        </>
                    )}

                    {/* Image */}
                    {onImageClick && (
                        <button
                            onClick={onImageClick}
                            className="toolbar-btn"
                            title="Ajouter une image"
                            type="button"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Aide rapide */}
                <div className="text-xs text-gray-600 mt-2 flex flex-wrap items-center gap-4">
                    <span className="font-semibold">💡 Astuce:</span>
                    <span>Sélectionnez du texte puis cliquez sur un bouton</span>
                    {listType && !columns && (
                        <span>• Ligne avec <code className="bg-gray-200 px-1 rounded">&gt;&gt;</code> = titre non listé</span>
                    )}
                    {columns && (
                        <span>• <span className="font-semibold">🔲 Mode colonnes:</span> Utilisez <code className="bg-gray-200 px-1 rounded">|</code> pour séparer les colonnes (ex: Item 1 | Item 2 | Item 3)</span>
                    )}
                </div>
            </div>

            {/* ZONE DE TEXTE EN BAS */}
            <textarea
                ref={textareaRef}
                value={typeof value === 'string' ? value : value.join('\n')}
                onChange={(e) => {
                    if (typeof value === 'string') {
                        onChange(e.target.value);
                    } else {
                        onChange(e.target.value.split('\n'));
                    }
                }}
                className="w-full px-3 py-3 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset resize-none"
                rows={elementType === 'p' ? 4 : 6}
                placeholder={
                    columns && listType ?
                        `Mode colonnes activé 🔲\nUtilisez | pour séparer les colonnes\n\nExemple:\n$(u+v)'$ | $u' + v'$\n$(uv)'$ | $u'v + uv'$\n$(u/v)'$ | $(u'v - uv')/v^2$` :
                    listType === 'bullet' ?
                        'Contenu (une ligne = une puce ⭐)\nExemple : Première idée\n>> Titre intermédiaire\nDeuxième idée' :
                    listType === 'numbered' ?
                        'Contenu (une ligne = un numéro ①②③)\nExemple : Première étape\n>> Titre intermédiaire\nDeuxième étape' :
                    'Tapez votre texte ici...\n\nUtilisez les boutons ci-dessus pour formater le texte.'
                }
            />
        </div>
    );
};

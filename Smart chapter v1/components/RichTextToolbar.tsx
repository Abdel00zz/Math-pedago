/**
 * RichTextToolbar - Barre d'outils complète pour l'édition de texte
 * Supporte : Gras, Italique, Listes, Math, Images, etc.
 */

import React, { useRef } from 'react';
import {
    PlusIcon,
    ImageIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from './icons';

interface RichTextToolbarProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    onImageClick?: () => void;
    elementType?: 'p' | 'box';
    listType?: 'bullet' | 'numbered' | undefined;
    onListTypeChange?: (type: 'bullet' | 'numbered' | undefined) => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
    value,
    onChange,
    onImageClick,
    elementType = 'p',
    listType,
    onListTypeChange
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

    const insertInlineMath = () => insertText('$', '$');
    const insertDisplayMath = () => insertText('$$\n', '\n$$');

    const insertFraction = () => insertText('$\\frac{', '}{}$');
    const insertSqrt = () => insertText('$\\sqrt{', '}$');
    const insertPower = () => insertText('$', '^{}$');
    const insertSubscript = () => insertText('$', '_{}$');

    const insertGreek = (letter: string) => insertText(`$\\${letter}$`, '');

    const insertSymbol = (symbol: string) => insertText(symbol, '');

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-3">
            {/* Référence au textarea (caché) */}
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
                className="form-textarea font-mono text-sm"
                rows={elementType === 'p' ? 4 : 6}
                placeholder={
                    listType === 'bullet' ? 'Contenu (une ligne = une puce ⭐)' :
                    listType === 'numbered' ? 'Contenu (une ligne = un numéro ①②③)' :
                    'Contenu du texte...'
                }
            />

            {/* Barre d'outils - Formatage de base */}
            <div className="flex flex-wrap gap-2 items-center border-t border-gray-200 pt-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-2">Formatage:</span>

                <button
                    onClick={makeBold}
                    className="toolbar-btn"
                    title="Gras (Ctrl+B)"
                    type="button"
                >
                    <span className="font-bold">B</span>
                </button>

                <button
                    onClick={makeItalic}
                    className="toolbar-btn"
                    title="Italique (Ctrl+I)"
                    type="button"
                >
                    <span className="italic">I</span>
                </button>

                <button
                    onClick={makeUnderline}
                    className="toolbar-btn"
                    title="Souligné"
                    type="button"
                >
                    <span className="underline">U</span>
                </button>

                <button
                    onClick={makeStrikethrough}
                    className="toolbar-btn"
                    title="Barré"
                    type="button"
                >
                    <span className="line-through">S</span>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* Listes */}
                {elementType === 'box' && onListTypeChange && (
                    <>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-2">Listes:</span>

                        <button
                            onClick={() => onListTypeChange(listType === 'bullet' ? undefined : 'bullet')}
                            className={`toolbar-btn ${listType === 'bullet' ? 'bg-blue-100 text-blue-700' : ''}`}
                            title="Liste à puces"
                            type="button"
                        >
                            ⭐
                        </button>

                        <button
                            onClick={() => onListTypeChange(listType === 'numbered' ? undefined : 'numbered')}
                            className={`toolbar-btn ${listType === 'numbered' ? 'bg-blue-100 text-blue-700' : ''}`}
                            title="Liste numérotée"
                            type="button"
                        >
                            ①
                        </button>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    </>
                )}

                {/* Image */}
                {onImageClick && (
                    <>
                        <button
                            onClick={onImageClick}
                            className="toolbar-btn"
                            title="Ajouter une image"
                            type="button"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    </>
                )}
            </div>

            {/* Barre d'outils - Mathématiques */}
            <div className="flex flex-wrap gap-2 items-center border-t border-gray-200 pt-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-2">Math:</span>

                <button
                    onClick={insertInlineMath}
                    className="toolbar-btn"
                    title="Formule en ligne $...$"
                    type="button"
                >
                    <span className="font-mono text-xs">$x$</span>
                </button>

                <button
                    onClick={insertDisplayMath}
                    className="toolbar-btn"
                    title="Formule centrée $$...$$"
                    type="button"
                >
                    <span className="font-mono text-xs">$$$$</span>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                <button
                    onClick={insertFraction}
                    className="toolbar-btn"
                    title="Fraction \frac{a}{b}"
                    type="button"
                >
                    <span className="font-mono text-xs">a/b</span>
                </button>

                <button
                    onClick={insertSqrt}
                    className="toolbar-btn"
                    title="Racine carrée \sqrt{x}"
                    type="button"
                >
                    <span className="font-mono text-xs">√x</span>
                </button>

                <button
                    onClick={insertPower}
                    className="toolbar-btn"
                    title="Puissance x^n"
                    type="button"
                >
                    <span className="font-mono text-xs">x<sup>n</sup></span>
                </button>

                <button
                    onClick={insertSubscript}
                    className="toolbar-btn"
                    title="Indice x_n"
                    type="button"
                >
                    <span className="font-mono text-xs">x<sub>n</sub></span>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* Lettres grecques */}
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-1">Grec:</span>

                {['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'omega'].map(letter => (
                    <button
                        key={letter}
                        onClick={() => insertGreek(letter)}
                        className="toolbar-btn"
                        title={`\\${letter}`}
                        type="button"
                    >
                        <span className="font-mono text-xs">{letter[0]}</span>
                    </button>
                ))}
            </div>

            {/* Barre d'outils - Symboles mathématiques */}
            <div className="flex flex-wrap gap-2 items-center border-t border-gray-200 pt-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mr-2">Symboles:</span>

                {[
                    { symbol: '$\\leq$', label: '≤', title: 'Inférieur ou égal' },
                    { symbol: '$\\geq$', label: '≥', title: 'Supérieur ou égal' },
                    { symbol: '$\\neq$', label: '≠', title: 'Différent' },
                    { symbol: '$\\approx$', label: '≈', title: 'Approximativement égal' },
                    { symbol: '$\\in$', label: '∈', title: 'Appartient' },
                    { symbol: '$\\notin$', label: '∉', title: "N'appartient pas" },
                    { symbol: '$\\subset$', label: '⊂', title: 'Inclus' },
                    { symbol: '$\\cup$', label: '∪', title: 'Union' },
                    { symbol: '$\\cap$', label: '∩', title: 'Intersection' },
                    { symbol: '$\\infty$', label: '∞', title: 'Infini' },
                    { symbol: '$\\forall$', label: '∀', title: 'Pour tout' },
                    { symbol: '$\\exists$', label: '∃', title: 'Il existe' },
                    { symbol: '$\\sum$', label: '∑', title: 'Somme' },
                    { symbol: '$\\prod$', label: '∏', title: 'Produit' },
                    { symbol: '$\\int$', label: '∫', title: 'Intégrale' },
                ].map(({ symbol, label, title }) => (
                    <button
                        key={symbol}
                        onClick={() => insertSymbol(symbol)}
                        className="toolbar-btn"
                        title={title}
                        type="button"
                    >
                        <span className="font-mono text-sm">{label}</span>
                    </button>
                ))}
            </div>

            {/* Aide */}
            <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                <div><span className="font-semibold">💡 Astuce:</span> Sélectionnez du texte puis cliquez sur un bouton de formatage</div>
                <div><span className="font-semibold">📐 Math:</span> Utilisez $ pour formules inline, $$ pour formules centrées</div>
                {listType && (
                    <div><span className="font-semibold">📝 Listes:</span> Commencez une ligne par &gt;&gt; pour la masquer de la liste</div>
                )}
            </div>
        </div>
    );
};

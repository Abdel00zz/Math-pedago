/**
 * RichTextEditor v3 - Éditeur avec KaTeX et interface optimisée
 * - KaTeX au lieu de MathJax (plus rapide)
 * - Mode colonnes intégré dans la toolbar
 * - Interface moderne et aérée
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon } from './icons';

// Déclaration TypeScript pour KaTeX
declare global {
    interface Window {
        katex?: any;
        renderMathInElement?: any;
    }
}

// Types pour les props
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    elementType?: string;
    onImageClick?: () => void;
    hasImage?: boolean;
    listType?: 'bullet' | 'numbered' | undefined;
    onListTypeChange?: (type: 'bullet' | 'numbered' | undefined) => void;
    columns?: boolean;
    onColumnsChange?: (columns: boolean) => void;
}

/**
 * Composant de prévisualisation avec support KaTeX
 */
const LivePreview: React.FC<{ content: string }> = ({ content }) => {
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;

        // Traiter le contenu Markdown de base
        let processed = content;

        // Protéger les expressions LaTeX
        const mathExpressions: string[] = [];
        let mathIndex = 0;

        processed = processed.replace(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/g, (match) => {
            const placeholder = `__MATH_${mathIndex}__`;
            mathExpressions.push(match);
            mathIndex++;
            return placeholder;
        });

        // Markdown basique
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        processed = processed.replace(/<u>([^<]+)<\/u>/g, '<u>$1</u>');
        processed = processed.replace(/<mark>([^<]+)<\/mark>/g, '<mark style="background-color: #fef08a; padding: 0 4px;">$1</mark>');

        // Callouts
        processed = processed.replace(/^!>\s*(.+)$/gm, '<div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; margin: 8px 0; border-radius: 4px;">⚠️ $1</div>');
        processed = processed.replace(/^\?>\s*(.+)$/gm, '<div style="background-color: #ecfeff; border-left: 4px solid #06b6d4; padding: 12px; margin: 8px 0; border-radius: 4px;">💡 $1</div>');

        // Textes à trous
        processed = processed.replace(/___([^_]+)___/g, '<span style="background-color: #e0f2fe; border-bottom: 2px dashed #0369a1; padding: 2px 8px; font-family: monospace;">$1</span>');

        // Liens
        processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');

        // Sauts de ligne
        processed = processed.replace(/\n/g, '<br>');

        // Restaurer les expressions LaTeX
        mathExpressions.forEach((mathExpr, idx) => {
            processed = processed.replace(`__MATH_${idx}__`, mathExpr);
        });

        el.innerHTML = processed || '<span style="color: #9ca3af;">Aperçu...</span>';

        // Appliquer KaTeX
        const renderMath = () => {
            if (!window.renderMathInElement || !el) return;

            try {
                window.renderMathInElement(el, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false,
                    errorColor: '#cc0000'
                });
            } catch (error) {
                console.error('KaTeX error:', error);
            }
        };

        // Attendre que KaTeX soit chargé
        if (window.renderMathInElement) {
            renderMath();
        } else {
            const checkKatex = setInterval(() => {
                if (window.renderMathInElement) {
                    clearInterval(checkKatex);
                    renderMath();
                }
            }, 50);
            setTimeout(() => clearInterval(checkKatex), 2000);
        }
    }, [content]);

    return (
        <div
            ref={previewRef}
            className="preview-content p-4 bg-white border border-gray-300 rounded-lg min-h-[120px] text-sm leading-relaxed"
            style={{ fontSize: '0.9rem', lineHeight: '1.6' }}
        />
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Saisissez votre contenu...',
    rows = 8,
    elementType,
    onImageClick,
    hasImage = false,
    listType,
    onListTypeChange,
    columns,
    onColumnsChange
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showMathMenu, setShowMathMenu] = useState(false);
    const [showCalloutMenu, setShowCalloutMenu] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    // Fonction pour insérer du texte à la position du curseur
    const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || placeholder;

        const newValue =
            value.substring(0, start) +
            before + textToInsert + after +
            value.substring(end);

        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            const newStart = start + before.length;
            const newEnd = newStart + textToInsert.length;
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);
    }, [value, onChange]);

    // Fonctions de formatage
    const makeBold = () => insertText('**', '**', 'texte gras');
    const makeItalic = () => insertText('*', '*', 'texte italique');
    const makeUnderline = () => insertText('<u>', '</u>', 'texte souligné');
    const makeHighlight = () => insertText('<mark>', '</mark>', 'texte surligné');
    const makeLink = () => {
        const url = prompt('URL du lien:');
        if (url) insertText('[', `](${url})`, 'texte du lien');
    };

    // Insérer formules LaTeX
    const insertInlineMath = () => insertText('$', '$', 'formule');
    const insertBlockMath = () => insertText('$$\n', '\n$$', 'formule mathématique');
    const insertFraction = () => insertText('$\\frac{', '}{b}$', 'a');
    const insertSqrt = () => insertText('$\\sqrt{', '}$', 'x');
    const insertSum = () => insertText('$\\sum_{i=1}^{n} ', '$', 'expression');
    const insertIntegral = () => insertText('$\\int_{a}^{b} ', ' dx$', 'f(x)');

    // Insérer callouts
    const insertWarning = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const atLineStart = lineStart === start;
        insertText(atLineStart ? '!> ' : '\n!> ', '', 'Message d\'attention');
    };

    const insertTip = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const atLineStart = lineStart === start;
        insertText(atLineStart ? '?> ' : '\n?> ', '', 'Conseil ou astuce');
    };

    const insertBlank = () => insertText('___', '___', 'réponse');

    return (
        <div className="rich-text-editor w-full">
            {/* Barre d'outils moderne */}
            <div className="toolbar bg-gradient-to-r from-slate-50 via-white to-slate-50 border-2 border-gray-300 border-b-0 rounded-t-xl p-4 shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Groupe: Formatage */}
                    <div className="flex items-center gap-1 px-3 border-r-2 border-gray-300">
                        <button
                            type="button"
                            onClick={makeBold}
                            className="toolbar-btn"
                            title="Gras (Ctrl+B)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px', fontWeight: '700' }}>format_bold</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeItalic}
                            className="toolbar-btn"
                            title="Italique (Ctrl+I)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>format_italic</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeUnderline}
                            className="toolbar-btn"
                            title="Souligné (Ctrl+U)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>format_underlined</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeHighlight}
                            className="toolbar-btn"
                            title="Surligner"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>format_ink_highlighter</span>
                        </button>
                    </div>

                    {/* Groupe: Listes */}
                    {onListTypeChange && (
                        <div className="flex items-center gap-1 px-3 border-r-2 border-gray-300">
                            <label className="text-xs font-bold text-gray-700 mr-1">Liste:</label>
                            <select
                                value={listType || 'none'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onListTypeChange(val === 'none' ? undefined : val as 'bullet' | 'numbered');
                                }}
                                className="px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-semibold bg-white hover:bg-blue-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                                style={{ minWidth: '160px' }}
                            >
                                <option value="none">Aucune</option>
                                <option value="bullet">⭐ Puces</option>
                                <option value="numbered">① Numérotée</option>
                            </select>
                        </div>
                    )}

                    {/* Groupe: Mode colonnes */}
                    {onColumnsChange && (
                        <div className="flex items-center gap-2 px-3 border-r-2 border-gray-300">
                            <button
                                type="button"
                                onClick={() => onColumnsChange(!columns)}
                                className={`toolbar-btn flex items-center gap-1.5 px-3 ${columns ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : ''}`}
                                title="Mode colonnes (affichage côte à côte)"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>view_column</span>
                                <span className="text-xs font-semibold">Colonnes</span>
                            </button>
                        </div>
                    )}

                    {/* Groupe: Math */}
                    <div className="relative px-3 border-r-2 border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMathMenu(!showMathMenu);
                                setShowCalloutMenu(false);
                            }}
                            className={`toolbar-btn ${showMathMenu ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-400' : ''}`}
                            title="Formules mathématiques (KaTeX)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>function</span>
                        </button>

                        {showMathMenu && (
                            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-400 rounded-xl shadow-2xl z-50 min-w-64" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                <div className="p-2">
                                    <button type="button" onClick={() => { insertInlineMath(); setShowMathMenu(false); }} className="menu-item">
                                        <code className="bg-purple-100 px-2.5 py-1.5 rounded text-xs font-mono font-bold">$...$</code>
                                        <span className="font-medium">Formule en ligne</span>
                                    </button>
                                    <button type="button" onClick={() => { insertBlockMath(); setShowMathMenu(false); }} className="menu-item">
                                        <code className="bg-purple-100 px-2.5 py-1.5 rounded text-xs font-mono font-bold">$$...$$</code>
                                        <span className="font-medium">Formule centrée</span>
                                    </button>
                                    <div className="border-t-2 border-gray-200 my-2"></div>
                                    <button type="button" onClick={() => { insertFraction(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-xl font-serif font-bold">a/b</span>
                                        <span className="font-medium">Fraction</span>
                                    </button>
                                    <button type="button" onClick={() => { insertSqrt(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-xl font-serif font-bold">√x</span>
                                        <span className="font-medium">Racine carrée</span>
                                    </button>
                                    <button type="button" onClick={() => { insertSum(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-2xl font-serif font-bold">∑</span>
                                        <span className="font-medium">Somme</span>
                                    </button>
                                    <button type="button" onClick={() => { insertIntegral(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-2xl font-serif font-bold">∫</span>
                                        <span className="font-medium">Intégrale</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe: Callouts */}
                    <div className="relative px-3 border-r-2 border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCalloutMenu(!showCalloutMenu);
                                setShowMathMenu(false);
                            }}
                            className={`toolbar-btn ${showCalloutMenu ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-400' : ''}`}
                            title="Encadrés spéciaux"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>campaign</span>
                        </button>

                        {showCalloutMenu && (
                            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-400 rounded-xl shadow-2xl z-50 min-w-72">
                                <div className="p-2">
                                    <button type="button" onClick={() => { insertWarning(); setShowCalloutMenu(false); }} className="menu-item">
                                        <span className="text-orange-600 text-2xl">⚠️</span>
                                        <div>
                                            <div className="font-bold text-orange-900">Attention</div>
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">!&gt; message</code>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => { insertTip(); setShowCalloutMenu(false); }} className="menu-item">
                                        <span className="text-cyan-600 text-2xl">💡</span>
                                        <div>
                                            <div className="font-bold text-cyan-900">Conseil</div>
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">?&gt; astuce</code>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe: Autres */}
                    <div className="flex items-center gap-1 px-3 border-r-2 border-gray-300">
                        <button
                            type="button"
                            onClick={makeLink}
                            className="toolbar-btn"
                            title="Insérer un lien"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>link</span>
                        </button>
                        <button
                            type="button"
                            onClick={insertBlank}
                            className="toolbar-btn"
                            title="Texte à trou"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>text_fields</span>
                        </button>
                    </div>

                    {/* Groupe: Contrôles */}
                    <div className="flex items-center gap-1 px-3">
                        {onImageClick && (
                            <button
                                type="button"
                                onClick={onImageClick}
                                className={`toolbar-btn ${hasImage ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400' : ''}`}
                                title={hasImage ? "Modifier l'image" : "Ajouter une image"}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>image</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`toolbar-btn ${showPreview ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : ''}`}
                            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                                {showPreview ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Aide rapide */}
                <details className="mt-3 pt-3 border-t-2 border-gray-300">
                    <summary className="cursor-pointer text-xs font-bold text-gray-800 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span>
                        Aide rapide
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">**gras**</code> → <strong>gras</strong></div>
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">*italique*</code> → <em>italique</em></div>
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">$x^2$</code> → formule</div>
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">___rep___</code> → trou</div>
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">!&gt; att</code> → attention</div>
                        <div><code className="bg-white px-1.5 py-0.5 rounded font-bold">?&gt; tip</code> → conseil</div>
                    </div>
                </details>
            </div>

            {/* Zone d'édition avec aperçu */}
            <div className={`editor-area grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-0 border-2 border-gray-300 border-t-0 rounded-b-xl overflow-hidden`}>
                {/* Textarea */}
                <div className={`${showPreview ? 'border-r-2 border-gray-300' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full px-5 py-4 rounded-none font-mono text-sm text-gray-900 focus:ring-4 focus:ring-blue-400 focus:border-transparent resize-y border-0 focus:outline-none bg-gray-50"
                        style={{ minHeight: `${rows * 32}px` }}
                        onKeyDown={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                                switch(e.key) {
                                    case 'b': e.preventDefault(); makeBold(); break;
                                    case 'i': e.preventDefault(); makeItalic(); break;
                                    case 'u': e.preventDefault(); makeUnderline(); break;
                                }
                            }
                        }}
                    />
                </div>

                {/* Aperçu en temps réel */}
                {showPreview && (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 overflow-auto" style={{ maxHeight: `${rows * 32}px` }}>
                        <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5 pb-2 border-b border-gray-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>preview</span>
                            Aperçu en direct (KaTeX)
                        </div>
                        <LivePreview content={value} />
                    </div>
                )}
            </div>

            {/* Fermer les menus si on clique ailleurs */}
            {(showMathMenu || showCalloutMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowMathMenu(false);
                        setShowCalloutMenu(false);
                    }}
                />
            )}

            {/* Styles CSS inline */}
            <style>{`
                .toolbar-btn {
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.2s ease-in-out;
                    background: white;
                    border: 2px solid #e5e7eb;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .toolbar-btn:hover {
                    background-color: #f9fafb;
                    border-color: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15);
                }
                .toolbar-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .menu-item {
                    width: 100%;
                    text-align: left;
                    padding: 12px 16px;
                    border-radius: 8px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.875rem;
                    background: white;
                    border: none;
                    cursor: pointer;
                    margin-bottom: 4px;
                }
                .menu-item:hover {
                    background-color: #f3f4f6;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
};

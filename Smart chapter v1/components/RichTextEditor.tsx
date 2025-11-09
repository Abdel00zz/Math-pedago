/**
 * RichTextEditor v2 - Éditeur de texte riche optimisé pour les leçons
 * Avec aperçu en temps réel MathJax et interface moderne
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon } from './icons';

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
}

/**
 * Composant de prévisualisation avec support MathJax
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

        // Appliquer MathJax
        const typeset = async () => {
            if (!window.MathJax || !el) return;

            try {
                if (window.MathJax.startup?.promise) {
                    await window.MathJax.startup.promise;
                }
                if (window.MathJax.typesetClear) {
                    try {
                        window.MathJax.typesetClear([el]);
                    } catch {}
                }
                if (window.MathJax.typesetPromise) {
                    await window.MathJax.typesetPromise([el]);
                }
            } catch (error) {
                console.error('MathJax error:', error);
            }
        };

        const timeoutId = setTimeout(typeset, 100);
        return () => clearTimeout(timeoutId);
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
    onListTypeChange
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
            {/* Barre d'outils améliorée */}
            <div className="toolbar bg-gradient-to-r from-slate-50 to-slate-100 border border-gray-300 border-b-0 rounded-t-lg p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Groupe: Formatage */}
                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={makeBold}
                            className="toolbar-btn"
                            title="Gras (Ctrl+B)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 'bold' }}>format_bold</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeItalic}
                            className="toolbar-btn"
                            title="Italique (Ctrl+I)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontStyle: 'italic' }}>format_italic</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeUnderline}
                            className="toolbar-btn"
                            title="Souligné (Ctrl+U)"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>format_underlined</span>
                        </button>
                        <button
                            type="button"
                            onClick={makeHighlight}
                            className="toolbar-btn"
                            title="Surligner"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>format_ink_highlighter</span>
                        </button>
                    </div>

                    {/* Groupe: Listes (intégré) */}
                    {onListTypeChange && (
                        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                            <select
                                value={listType || 'none'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onListTypeChange(val === 'none' ? undefined : val as 'bullet' | 'numbered');
                                }}
                                className="px-3 py-1.5 border border-gray-400 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                style={{ minWidth: '140px' }}
                            >
                                <option value="none">Sans liste</option>
                                <option value="bullet">⭐ Puces</option>
                                <option value="numbered">① Numérotée</option>
                            </select>
                        </div>
                    )}

                    {/* Groupe: Math */}
                    <div className="relative px-2 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMathMenu(!showMathMenu);
                                setShowCalloutMenu(false);
                            }}
                            className={`toolbar-btn ${showMathMenu ? 'bg-purple-100 text-purple-700' : ''}`}
                            title="Formules mathématiques"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>function</span>
                        </button>

                        {showMathMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl z-50 min-w-60" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                <div className="p-1.5">
                                    <button type="button" onClick={() => { insertInlineMath(); setShowMathMenu(false); }} className="menu-item">
                                        <code className="bg-purple-100 px-2 py-1 rounded text-xs font-mono">$...$</code>
                                        <span>Formule en ligne</span>
                                    </button>
                                    <button type="button" onClick={() => { insertBlockMath(); setShowMathMenu(false); }} className="menu-item">
                                        <code className="bg-purple-100 px-2 py-1 rounded text-xs font-mono">$$...$$</code>
                                        <span>Formule centrée</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button type="button" onClick={() => { insertFraction(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-lg font-serif">a/b</span>
                                        <span>Fraction</span>
                                    </button>
                                    <button type="button" onClick={() => { insertSqrt(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-lg font-serif">√x</span>
                                        <span>Racine carrée</span>
                                    </button>
                                    <button type="button" onClick={() => { insertSum(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-xl font-serif">∑</span>
                                        <span>Somme</span>
                                    </button>
                                    <button type="button" onClick={() => { insertIntegral(); setShowMathMenu(false); }} className="menu-item">
                                        <span className="text-xl font-serif">∫</span>
                                        <span>Intégrale</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe: Callouts */}
                    <div className="relative px-2 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCalloutMenu(!showCalloutMenu);
                                setShowMathMenu(false);
                            }}
                            className={`toolbar-btn ${showCalloutMenu ? 'bg-orange-100 text-orange-700' : ''}`}
                            title="Encadrés spéciaux"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>campaign</span>
                        </button>

                        {showCalloutMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl z-50 min-w-64">
                                <div className="p-1.5">
                                    <button type="button" onClick={() => { insertWarning(); setShowCalloutMenu(false); }} className="menu-item">
                                        <span className="text-orange-500 text-xl">⚠️</span>
                                        <div>
                                            <div className="font-semibold">Attention</div>
                                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">!&gt; message</code>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => { insertTip(); setShowCalloutMenu(false); }} className="menu-item">
                                        <span className="text-cyan-500 text-xl">💡</span>
                                        <div>
                                            <div className="font-semibold">Conseil</div>
                                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">?&gt; astuce</code>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe: Autres */}
                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={makeLink}
                            className="toolbar-btn"
                            title="Insérer un lien"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>link</span>
                        </button>
                        <button
                            type="button"
                            onClick={insertBlank}
                            className="toolbar-btn"
                            title="Texte à trou"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>text_fields</span>
                        </button>
                    </div>

                    {/* Groupe: Image & Aperçu */}
                    <div className="flex items-center gap-1 px-2">
                        {onImageClick && (
                            <button
                                type="button"
                                onClick={onImageClick}
                                className={`toolbar-btn ${hasImage ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : ''}`}
                                title={hasImage ? "Modifier l'image" : "Ajouter une image"}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>image</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`toolbar-btn ${showPreview ? 'bg-green-100 text-green-700' : ''}`}
                            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                {showPreview ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Aide rapide compacte */}
                <details className="mt-2 pt-2 border-t border-gray-300">
                    <summary className="cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>help</span>
                        Aide rapide
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                        <div><code className="bg-gray-100 px-1 rounded">**gras**</code> → <strong>gras</strong></div>
                        <div><code className="bg-gray-100 px-1 rounded">*italique*</code> → <em>italique</em></div>
                        <div><code className="bg-gray-100 px-1 rounded">$x^2$</code> → formule</div>
                        <div><code className="bg-gray-100 px-1 rounded">___rep___</code> → trou</div>
                        <div><code className="bg-gray-100 px-1 rounded">!&gt; att</code> → attention</div>
                        <div><code className="bg-gray-100 px-1 rounded">?&gt; tip</code> → conseil</div>
                    </div>
                </details>
            </div>

            {/* Zone d'édition avec aperçu */}
            <div className={`editor-area grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-0 border border-gray-300 border-t-0`}>
                {/* Textarea */}
                <div className={`${showPreview ? 'border-r border-gray-300' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full px-4 py-3 rounded-none rounded-bl-lg font-mono text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y border-0 focus:outline-none"
                        style={{ minHeight: `${rows * 28}px` }}
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
                    <div className="bg-gray-50 p-2 rounded-br-lg overflow-auto" style={{ maxHeight: `${rows * 28}px` }}>
                        <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>preview</span>
                            Aperçu en direct
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
                    padding: 6px 10px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    background: white;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .toolbar-btn:hover {
                    background-color: #f3f4f6;
                    border-color: #d1d5db;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .toolbar-btn:active {
                    transform: translateY(0);
                }
                .menu-item {
                    width: 100%;
                    text-align: left;
                    padding: 10px 14px;
                    border-radius: 6px;
                    transition: background 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.875rem;
                    background: white;
                    border: none;
                    cursor: pointer;
                }
                .menu-item:hover {
                    background-color: #f3f4f6;
                }
            `}</style>
        </div>
    );
};

/**
 * RichTextEditor - Éditeur de texte riche pour les leçons
 * Barre d'outils avec formatage, LaTeX, images, etc.
 */

import React, { useState, useRef, useCallback } from 'react';
import { ImageIcon } from './icons';

// Types pour les props
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    elementType?: string; // Type d'élément pour afficher des options spécifiques
    onImageClick?: () => void; // Callback pour ouvrir le modal d'image
    hasImage?: boolean; // Indique si l'élément a déjà une image
}

// Icônes SVG pour la barre d'outils
const BoldIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
);

const ItalicIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4 M8 20h8 M15 4L9 20" />
    </svg>
);

const UnderlineIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 19h12 M8 5v8a4 4 0 0 0 8 0V5" />
    </svg>
);

const ListBulletIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16 M4 12h16 M4 18h16" />
    </svg>
);

const ListNumberIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h12 M9 12h12 M9 19h12 M5 5v3 M5 12v3 M5 19v3" />
    </svg>
);

const MathIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <text x="12" y="16" textAnchor="middle" fontSize="14" fontFamily="serif" fontStyle="italic" fill="currentColor">∑</text>
    </svg>
);

const LinkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
    </svg>
);

const HighlightIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.75 3c.414 0 .75.336.75.75v4.5a.75.75 0 0 1-1.5 0V4.81l-7.72 7.72a.75.75 0 0 1-1.06-1.06l7.72-7.72h-3.44a.75.75 0 0 1 0-1.5h4.5zM3 13.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 3 13.25zm0 4a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 3 17.25zm0 4a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75z"/>
    </svg>
);

const AlertIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const LightBulbIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const BlankIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="10" width="18" height="4" rx="1" strokeWidth={2} fill="none" strokeDasharray="3 3"/>
    </svg>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Saisissez votre contenu...',
    rows = 6,
    elementType,
    onImageClick,
    hasImage = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showMathMenu, setShowMathMenu] = useState(false);
    const [showCalloutMenu, setShowCalloutMenu] = useState(false);

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

        // Remettre le focus et sélectionner le texte inséré
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
        if (url) {
            insertText('[', `](${url})`, 'texte du lien');
        }
    };

    // Insérer une liste
    const insertBulletList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);

        // Si on est au début d'une ligne, insérer "- "
        if (currentLine.trim() === '') {
            insertText('- ', '', '');
        } else {
            // Sinon, aller à la ligne et insérer "- "
            insertText('\n- ', '', '');
        }
    };

    const insertNumberedList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);

        if (currentLine.trim() === '') {
            insertText('1. ', '', '');
        } else {
            insertText('\n1. ', '', '');
        }
    };

    // Insérer des formules LaTeX
    const insertInlineMath = () => insertText('$', '$', 'formule');
    const insertBlockMath = () => insertText('$$\n', '\n$$', 'formule mathématique');
    const insertFraction = () => insertText('$\\frac{', '}{b}$', 'a');
    const insertSqrt = () => insertText('$\\sqrt{', '}$', 'x');
    const insertSum = () => insertText('$\\sum_{i=1}^{n} ', '$', 'expression');
    const insertIntegral = () => insertText('$\\int_{a}^{b} ', ' dx$', 'f(x)');

    // Insérer des callouts
    const insertWarning = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const atLineStart = lineStart === start;

        if (atLineStart) {
            insertText('!> ', '', 'Message d\'attention');
        } else {
            insertText('\n!> ', '', 'Message d\'attention');
        }
    };

    const insertTip = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const atLineStart = lineStart === start;

        if (atLineStart) {
            insertText('?> ', '', 'Conseil ou astuce');
        } else {
            insertText('\n?> ', '', 'Conseil ou astuce');
        }
    };

    // Insérer un blank (fill-in-the-blank)
    const insertBlank = () => insertText('___', '___', 'réponse');

    return (
        <div className="w-full">
            {/* Barre d'outils */}
            <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gradient-to-r from-gray-50 to-gray-100 p-2">
                <div className="flex flex-wrap items-center gap-1">
                    {/* Groupe Formatage de texte */}
                    <div className="flex items-center gap-0.5 px-1 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={makeBold}
                            className="p-2 rounded hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition-colors"
                            title="Gras (Ctrl+B)"
                        >
                            <BoldIcon />
                        </button>
                        <button
                            type="button"
                            onClick={makeItalic}
                            className="p-2 rounded hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition-colors"
                            title="Italique (Ctrl+I)"
                        >
                            <ItalicIcon />
                        </button>
                        <button
                            type="button"
                            onClick={makeUnderline}
                            className="p-2 rounded hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition-colors"
                            title="Souligné (Ctrl+U)"
                        >
                            <UnderlineIcon />
                        </button>
                        <button
                            type="button"
                            onClick={makeHighlight}
                            className="p-2 rounded hover:bg-yellow-100 text-gray-700 hover:text-yellow-700 transition-colors"
                            title="Surligner"
                        >
                            <HighlightIcon />
                        </button>
                    </div>

                    {/* Groupe Listes */}
                    <div className="flex items-center gap-0.5 px-1 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={insertBulletList}
                            className="p-2 rounded hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
                            title="Liste à puces"
                        >
                            <ListBulletIcon />
                        </button>
                        <button
                            type="button"
                            onClick={insertNumberedList}
                            className="p-2 rounded hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
                            title="Liste numérotée"
                        >
                            <ListNumberIcon />
                        </button>
                    </div>

                    {/* Groupe Math - Menu déroulant */}
                    <div className="relative px-1 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMathMenu(!showMathMenu);
                                setShowCalloutMenu(false);
                            }}
                            className={`p-2 rounded transition-colors ${
                                showMathMenu
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                            }`}
                            title="Formules mathématiques"
                        >
                            <MathIcon />
                        </button>

                        {showMathMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 min-w-48">
                                <div className="p-1">
                                    <button
                                        type="button"
                                        onClick={() => { insertInlineMath(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">$...$</code>
                                        <span>Formule en ligne</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { insertBlockMath(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">$$...$$</code>
                                        <span>Formule centrée</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => { insertFraction(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <span className="text-base">a/b</span>
                                        <span>Fraction</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { insertSqrt(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <span className="text-base">√x</span>
                                        <span>Racine carrée</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { insertSum(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <span className="text-base">∑</span>
                                        <span>Somme</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { insertIntegral(); setShowMathMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                        <span className="text-base">∫</span>
                                        <span>Intégrale</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe Callouts - Menu déroulant */}
                    <div className="relative px-1 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCalloutMenu(!showCalloutMenu);
                                setShowMathMenu(false);
                            }}
                            className={`p-2 rounded transition-colors ${
                                showCalloutMenu
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'hover:bg-orange-100 text-gray-700 hover:text-orange-700'
                            }`}
                            title="Encadrés spéciaux"
                        >
                            <AlertIcon />
                        </button>

                        {showCalloutMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 min-w-56">
                                <div className="p-1">
                                    <button
                                        type="button"
                                        onClick={() => { insertWarning(); setShowCalloutMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                    >
                                        <span className="text-orange-500 text-base">⚠️</span>
                                        <div>
                                            <div className="font-medium">Attention</div>
                                            <code className="text-xs bg-gray-100 px-1 rounded">!&gt; message</code>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { insertTip(); setShowCalloutMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-2"
                                    >
                                        <span className="text-cyan-500 text-base">💡</span>
                                        <div>
                                            <div className="font-medium">Conseil</div>
                                            <code className="text-xs bg-gray-100 px-1 rounded">?&gt; astuce</code>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Groupe Autres */}
                    <div className="flex items-center gap-0.5 px-1 border-r border-gray-300">
                        <button
                            type="button"
                            onClick={makeLink}
                            className="p-2 rounded hover:bg-blue-100 text-gray-700 hover:text-blue-700 transition-colors"
                            title="Insérer un lien"
                        >
                            <LinkIcon />
                        </button>
                        <button
                            type="button"
                            onClick={insertBlank}
                            className="p-2 rounded hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 transition-colors"
                            title="Texte à trou (fill-in-the-blank)"
                        >
                            <BlankIcon />
                        </button>
                    </div>

                    {/* Bouton Image (si disponible) */}
                    {onImageClick && (
                        <div className="px-1">
                            <button
                                type="button"
                                onClick={onImageClick}
                                className={`p-2 rounded transition-colors ${
                                    hasImage
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        : 'hover:bg-blue-100 text-gray-700 hover:text-blue-700'
                                }`}
                                title={hasImage ? "Modifier l'image" : "Ajouter une image"}
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Aide rapide */}
                <div className="mt-2 pt-2 border-t border-gray-300">
                    <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800 font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">help</span>
                            Aide rapide
                        </summary>
                        <div className="mt-2 space-y-1 bg-white rounded p-2 border border-gray-200">
                            <div><code className="bg-gray-100 px-1 rounded">**gras**</code> → <strong>gras</strong></div>
                            <div><code className="bg-gray-100 px-1 rounded">*italique*</code> → <em>italique</em></div>
                            <div><code className="bg-gray-100 px-1 rounded">$x^2$</code> → formule en ligne</div>
                            <div><code className="bg-gray-100 px-1 rounded">___réponse___</code> → texte à trou</div>
                            <div><code className="bg-gray-100 px-1 rounded">!&gt; attention</code> → encadré orange</div>
                            <div><code className="bg-gray-100 px-1 rounded">?&gt; conseil</code> → encadré cyan</div>
                            <div><code className="bg-gray-100 px-1 rounded">&gt;&gt; texte</code> → ligne sans puce</div>
                        </div>
                    </details>
                </div>
            </div>

            {/* Zone de texte */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2 border border-gray-300 rounded-b-lg font-mono text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                onKeyDown={(e) => {
                    // Raccourcis clavier
                    if (e.ctrlKey || e.metaKey) {
                        switch(e.key) {
                            case 'b':
                                e.preventDefault();
                                makeBold();
                                break;
                            case 'i':
                                e.preventDefault();
                                makeItalic();
                                break;
                            case 'u':
                                e.preventDefault();
                                makeUnderline();
                                break;
                        }
                    }
                }}
            />

            {/* Fermer les menus si on clique ailleurs */}
            {(showMathMenu || showCalloutMenu) && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => {
                        setShowMathMenu(false);
                        setShowCalloutMenu(false);
                    }}
                />
            )}
        </div>
    );
};

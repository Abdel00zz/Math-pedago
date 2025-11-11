/**
 * KaTeX Helper - Utilitaires pour compiler et afficher les formules mathématiques
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Compile une chaîne contenant du LaTeX inline ($...$) et display ($$...$$)
 * Retourne du JSX avec les formules compilées
 */
export function renderMathText(text: string): JSX.Element[] {
    if (!text) return [<span key="empty"></span>];

    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    let keyIndex = 0;

    // Pattern pour détecter les formules LaTeX
    // $$...$$ pour display math (centré)
    // $...$ pour inline math
    const mathRegex = /\$\$([^\$]+)\$\$|\$([^\$]+)\$/g;

    let match;
    while ((match = mathRegex.exec(text)) !== null) {
        // Texte avant la formule
        if (match.index > currentIndex) {
            const beforeText = text.substring(currentIndex, match.index);
            parts.push(<span key={`text-${keyIndex++}`} dangerouslySetInnerHTML={{ __html: formatText(beforeText) }} />);
        }

        // La formule elle-même
        const isDisplay = match[0].startsWith('$$');
        const formula = isDisplay ? match[1] : match[2];

        try {
            const html = katex.renderToString(formula, {
                displayMode: isDisplay,
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: false,
                macros: {
                    "\\R": "\\mathbb{R}",
                    "\\N": "\\mathbb{N}",
                    "\\Z": "\\mathbb{Z}",
                    "\\Q": "\\mathbb{Q}",
                    "\\C": "\\mathbb{C}",
                }
            });

            parts.push(
                <span
                    key={`math-${keyIndex++}`}
                    className={isDisplay ? 'block my-4' : 'inline-block'}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            );
        } catch (e) {
            // En cas d'erreur, afficher la formule brute
            parts.push(
                <span key={`error-${keyIndex++}`} className="text-red-600 font-mono text-sm bg-red-50 px-2 py-1 rounded">
                    {match[0]}
                </span>
            );
        }

        currentIndex = match.index + match[0].length;
    }

    // Texte après la dernière formule
    if (currentIndex < text.length) {
        const afterText = text.substring(currentIndex);
        parts.push(<span key={`text-${keyIndex++}`} dangerouslySetInnerHTML={{ __html: formatText(afterText) }} />);
    }

    return parts.length > 0 ? parts : [<span key="empty"></span>];
}

/**
 * Formate le texte avec support du formatage Markdown basique
 * **gras**, *italique*, __souligné__, ~~barré~~
 */
function formatText(text: string): string {
    return text
        // Gras: **text**
        .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
        // Italique: *text*
        .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
        // Souligné: <u>text</u> ou __text__
        .replace(/<u>([^<]+)<\/u>/g, '<u>$1</u>')
        .replace(/__([^_]+)__/g, '<u>$1</u>')
        // Barré: ~~text~~
        .replace(/~~([^~]+)~~/g, '<del>$1</del>')
        // Préserver les retours à la ligne
        .replace(/\n/g, '<br/>');
}

/**
 * Compile une seule formule LaTeX
 */
export function renderSingleMath(formula: string, displayMode: boolean = false): string {
    try {
        return katex.renderToString(formula, {
            displayMode,
            throwOnError: false,
            errorColor: '#cc0000'
        });
    } catch (e) {
        return `<span class="text-red-600">${formula}</span>`;
    }
}

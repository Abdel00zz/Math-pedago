import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathContentProps {
    content: string;
    className?: string;
    inline?: boolean;
}

/**
 * Traite uniquement le Markdown de base (gras/italique)
 * SANS toucher aux délimiteurs LaTeX $ $ et $$ $$
 */
const processMarkdown = (text: string): string => {
    if (!text) return text;

    let processed = text;

    // Protéger temporairement les expressions LaTeX
    const mathExpressions: string[] = [];
    let mathIndex = 0;

    // Sauvegarder les expressions $...$ et $$...$$
    processed = processed.replace(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/g, (match) => {
        const placeholder = `__MATH_${mathIndex}__`;
        mathExpressions.push(match);
        mathIndex++;
        return placeholder;
    });

    // Maintenant convertir le Markdown sans toucher aux maths
    // **texte** → <strong>texte</strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // *texte* → <em>texte</em> (mais pas si déjà dans **)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Restaurer les expressions LaTeX
    mathExpressions.forEach((mathExpr, idx) => {
        processed = processed.replace(`__MATH_${idx}__`, mathExpr);
    });

    return processed;
};

/**
 * Rendre les formules mathématiques avec KaTeX
 */
const renderMathWithKaTeX = (text: string, containerElement: HTMLElement) => {
    let html = text;

    // Render display math ($$...$$)
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, mathContent) => {
        try {
            return katex.renderToString(mathContent, {
                displayMode: true,
                throwOnError: false,
                trust: true, // Permet d'utiliser des commandes HTML
                strict: false,
            });
        } catch (error) {
            console.error('KaTeX display math error:', error);
            return `<span class="katex-error" style="color: red;">${match}</span>`;
        }
    });

    // Render inline math ($...$)
    html = html.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
        try {
            return katex.renderToString(mathContent, {
                displayMode: false,
                throwOnError: false,
                trust: true,
                strict: false,
            });
        } catch (error) {
            console.error('KaTeX inline math error:', error);
            return `<span class="katex-error" style="color: red;">${match}</span>`;
        }
    });

    containerElement.innerHTML = html;
};

/**
 * MathContent - Composant pour afficher du contenu avec formules KaTeX
 * Utilise KaTeX pour le rendu mathématique (plus rapide que MathJax)
 */
const MathContent: React.FC<MathContentProps> = ({ content, className = '', inline = true }) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const latestContent = useRef<string>('');

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Traiter le Markdown en protégeant les expressions LaTeX
        const processedContent = processMarkdown(content);

        if (latestContent.current !== processedContent) {
            try {
                renderMathWithKaTeX(processedContent, el);
                latestContent.current = processedContent;
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                el.innerHTML = processedContent;
            }
        }
    }, [content]);

    const Tag = inline ? 'span' : 'div';
    const combinedClassName = ['math-content', className].filter(Boolean).join(' ');

    return (
        <Tag
            ref={(node) => {
                containerRef.current = node as HTMLElement | null;
            }}
            className={combinedClassName}
        />
    );
};

export default MathContent;

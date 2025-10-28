import React from 'react';
import { MathJax } from 'better-react-mathjax';

interface FormattedTextProps {
    text: string;
    className?: string;
    /**
     * Variant détermine le style de base à appliquer
     * - 'question': Pour les en-têtes de questions (plus grand, gras)
     * - 'answer': Pour les options de réponse (taille moyenne)
     * - 'explanation': Pour les explications (plus petit, italique)
     * - 'body': Texte normal par défaut
     */
    variant?: 'question' | 'answer' | 'explanation' | 'body';
}

/**
 * FormattedText component renders text with inline math formulas
 * Math should be enclosed in $ or \( \) delimiters
 * Example: "Calculate $x^2 + 3$ where $x = 5$"
 *
 * AMÉLIORATIONS:
 * - Harmonisation automatique des tailles math/texte
 * - Support de variants pour différents contextes
 * - Alignement baseline parfait
 * - Adaptation automatique des couleurs selon le contexte
 */
const FormattedText: React.FC<FormattedTextProps> = ({
    text,
    className = '',
    variant = 'body'
}) => {
    // Classes de base selon le variant
    const variantClasses = {
        question: 'question-header',
        answer: 'answer-option',
        explanation: 'explanation-text',
        body: ''
    };

    const baseClass = variantClasses[variant];

    return (
        <span className={`formatted-text ${baseClass} ${className}`.trim()}>
            <MathJax inline dynamic>
                {text}
            </MathJax>
        </span>
    );
};

export default FormattedText;

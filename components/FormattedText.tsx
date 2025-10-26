import React from 'react';
import { MathJax } from 'better-react-mathjax';

interface FormattedTextProps {
    text: string;
    className?: string;
}

/**
 * FormattedText component renders text with inline math formulas
 * Math should be enclosed in $ or \( \) delimiters
 * Example: "Calculate $x^2 + 3$ where $x = 5$"
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
    return (
        <span className={`formatted-text ${className}`}>
            <MathJax inline dynamic>
                {text}
            </MathJax>
            <style jsx>{`
                :global(.formatted-text) {
                    line-height: 1.7;
                }

                /* Harmonize math font size with surrounding text */
                :global(.formatted-text .MathJax) {
                    font-size: inherit !important;
                }

                :global(.formatted-text mjx-container) {
                    display: inline-flex !important;
                    align-items: center;
                    vertical-align: middle;
                    margin: 0 0.15em;
                }

                :global(.formatted-text mjx-math) {
                    display: inline-flex !important;
                    align-items: center;
                }

                /* Ensure consistent baseline alignment */
                :global(.formatted-text mjx-container[jax="SVG"]) {
                    vertical-align: -0.1ex;
                }
            `}</style>
        </span>
    );
};

export default FormattedText;

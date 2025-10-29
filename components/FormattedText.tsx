import React from 'react';
import MathContent from './MathContent';

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
        <MathContent 
            content={text}
            className={`formatted-text ${className}`}
            inline={true}
        />
    );
};

export default FormattedText;

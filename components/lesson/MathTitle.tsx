import React, { useEffect, useRef } from 'react';

interface MathTitleProps {
    children: string;
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

export const MathTitle: React.FC<MathTitleProps> = ({ children, className, tag = 'span' }) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (ref.current && window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise([ref.current]).catch((err: Error) => {
                console.warn('Erreur rendu MathJax dans titre:', err);
            });
        }
    }, [children]);

    const Tag = tag;
    
    return (
        <Tag ref={ref as any} className={className}>
            {children}
        </Tag>
    );
};

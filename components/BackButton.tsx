import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    showLabel?: boolean;
    className?: string;
}

/**
 * Composant de bouton Retour unifié pour toute la plateforme
 * Design moderne avec animation et états hover/active
 */
const BackButton: React.FC<BackButtonProps> = ({ 
    onClick, 
    label = "Retour", 
    showLabel = false,
    className = "" 
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative
                inline-flex items-center justify-center
                ${showLabel ? 'gap-2.5 px-5 py-3' : 'w-11 h-11'}
                bg-surface/90 
                backdrop-blur-sm
                border border-border/60
                hover:border-primary/50
                rounded-xl
                text-text-secondary 
                hover:text-primary
                transition-all duration-300 ease-out
                shadow-soft 
                hover:shadow-medium
                hover:shadow-primary/10
                hover:scale-[1.05]
                active:scale-[0.95]
                font-medium
                text-sm
                ${className}
            `}
            aria-label={label}
        >
            {/* Icône de flèche avec animation */}
            <span className="material-symbols-outlined !text-xl transition-transform duration-300 group-hover:-translate-x-1">
                arrow_back
            </span>
            
            {/* Texte du bouton (conditionnel) */}
            {showLabel && (
                <span className="font-sans tracking-wide">
                    {label}
                </span>
            )}
            
            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
    );
};

export default BackButton;

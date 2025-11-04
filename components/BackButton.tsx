import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

/**
 * Composant de bouton Retour unifié pour toute la plateforme
 * Style moderne élégant et minimaliste
 */
const BackButton: React.FC<BackButtonProps> = ({
    onClick,
    label = "Retour",
    className = "",
}) => {
    return (
        <button
            onClick={onClick}
            className={`coursera-btn coursera-btn--back ${className}`}
            aria-label={label}
            title={label}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                arrow_back
            </span>
        </button>
    );
};

export default BackButton;

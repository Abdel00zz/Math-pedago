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
    // No-op: platform-wide back buttons have been removed.
    return null;
};

export default BackButton;

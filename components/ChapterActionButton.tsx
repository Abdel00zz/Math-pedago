import React from 'react';
import { ChapterStatus } from '../types';
import { useAppDispatch } from '../context/AppContext';

interface ChapterActionButtonProps {
    chapterId: string;
    status: ChapterStatus;
    isCompleted: boolean;
    onStartChapter?: () => void;
}

/**
 * Bouton d'action contextuel pour les chapitres
 * Affiche des actions différentes selon le statut du chapitre
 */
const ChapterActionButton: React.FC<ChapterActionButtonProps> = ({
    chapterId,
    status,
    isCompleted,
    onStartChapter
}) => {
    const dispatch = useAppDispatch();

    const handleStartChapter = (e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher la navigation vers le chapitre
        dispatch({ type: 'START_CHAPTER', payload: { chapterId } });
        if (onStartChapter) onStartChapter();
    };

    // Chapitres à venir : bouton pour commencer
    if (status === 'a-venir') {
        return (
            <button
                onClick={handleStartChapter}
                className="chapter-action-button chapter-action-button--start"
                title="Commencer ce chapitre"
            >
                <span className="material-symbols-outlined">play_arrow</span>
                <span>Commencer</span>
            </button>
        );
    }

    // Chapitres en cours : indicateur (pas d'action)
    if (status === 'en-cours') {
        return (
            <div className="chapter-action-button chapter-action-button--current">
                <span className="material-symbols-outlined">pending</span>
                <span>En cours</span>
            </div>
        );
    }

    // Chapitres achevés : indicateur de succès
    if (status === 'acheve') {
        return (
            <div className="chapter-action-button chapter-action-button--completed">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Terminé</span>
            </div>
        );
    }

    return null;
};

export default ChapterActionButton;

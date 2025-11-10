/**
 * EditorToolbar - Barre d'outils principale de l'éditeur
 */

import React from 'react';
import { UndoIcon, RedoIcon, EyeIcon, SaveIcon, RefreshIcon } from '../icons';

interface EditorToolbarProps {
    historyIndex: number;
    historyLength: number;
    onUndo: () => void;
    onRedo: () => void;
    previewMode: boolean;
    onTogglePreview: () => void;
    onSave: () => void;
    isSaving: boolean;
    canSave: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    historyIndex,
    historyLength,
    onUndo,
    onRedo,
    previewMode,
    onTogglePreview,
    onSave,
    isSaving,
    canSave
}) => {
    return (
        <div className="lesson-editor-panel__header">
            <div className="lesson-editor-panel__title">
                <RefreshIcon className="lesson-editor-panel__title-icon" />
                Éditeur de Leçon
            </div>

            <div className="lesson-editor-panel__actions">
                <button
                    className="btn btn--secondary"
                    onClick={onUndo}
                    disabled={historyIndex <= 0}
                    title="Annuler (Ctrl+Z)"
                >
                    <UndoIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                    Annuler
                </button>

                <button
                    className="btn btn--secondary"
                    onClick={onRedo}
                    disabled={historyIndex >= historyLength - 1}
                    title="Rétablir (Ctrl+Y)"
                >
                    <RedoIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                    Rétablir
                </button>

                <button
                    className="btn btn--secondary"
                    onClick={onTogglePreview}
                    title={previewMode ? 'Retour à l\'édition' : 'Aperçu'}
                >
                    <EyeIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                    {previewMode ? 'Édition' : 'Aperçu'}
                </button>

                <button
                    className="btn btn--success"
                    onClick={onSave}
                    disabled={isSaving || !canSave}
                    title="Sauvegarder (Ctrl+S)"
                >
                    <SaveIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
};

/**
 * ImageManagerModern - Gestionnaire d'images modernisé pour les leçons
 * Version adaptée pour le système de leçons principal
 */

import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, SaveIcon, EditIcon, TrashIcon, PlusIcon, UploadCloudIcon } from './icons';

export interface LessonImageConfig {
    src: string;
    alt: string;
    caption?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'inline';
    align?: 'left' | 'center' | 'right';
    width?: string;
    size?: 'small' | 'medium' | 'large' | 'full' | 'custom';
}

interface ImageManagerModernProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage?: LessonImageConfig | null;
    onSave: (imageConfig: LessonImageConfig) => void;
    onDelete?: () => void;
    lessonPath?: string; // Chemin du dossier de la leçon pour le stockage
}

interface ImageWithMetadata extends LessonImageConfig {
    id: string;
    file?: File;
    preview?: string;
}

export const ImageManagerModern: React.FC<ImageManagerModernProps> = ({
    isOpen,
    onClose,
    currentImage,
    onSave,
    onDelete,
    lessonPath
}) => {
    const [editedImage, setEditedImage] = useState<ImageWithMetadata | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentImage) {
            setEditedImage({
                ...currentImage,
                id: 'current',
                size: currentImage.size || 'medium',
                position: currentImage.position || 'center',
                align: currentImage.align || 'center'
            });
            setPreviewUrl(currentImage.src || null);
        } else {
            setEditedImage({
                id: 'new',
                src: '',
                alt: '',
                caption: '',
                position: 'center',
                align: 'center',
                size: 'medium',
                width: '400px'
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    }, [currentImage, isOpen]);

    if (!isOpen || !editedImage) return null;

    const handleFieldChange = (field: keyof ImageWithMetadata, value: any) => {
        setEditedImage(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreviewUrl(result);
                
                // Auto-fill alt if empty
                if (!editedImage?.alt) {
                    handleFieldChange('alt', file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!editedImage) return;

        // Si un nouveau fichier est sélectionné, on met à jour le src
        let finalSrc = editedImage.src;
        if (selectedFile) {
            // Dans un vrai cas, il faudrait uploader le fichier
            // Pour l'instant on utilise le preview base64
            finalSrc = previewUrl || editedImage.src;
        }

        const finalConfig: LessonImageConfig = {
            src: finalSrc,
            alt: editedImage.alt,
            caption: editedImage.caption,
            position: editedImage.position,
            align: editedImage.align,
            width: editedImage.size === 'custom' ? editedImage.width : getSizeWidth(editedImage.size || 'medium'),
            size: editedImage.size
        };

        onSave(finalConfig);
        handleClose();
    };

    const handleClose = () => {
        setEditedImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    const handleDeleteClick = () => {
        if (window.confirm('Voulez-vous vraiment supprimer cette image ?')) {
            if (onDelete) {
                onDelete();
            }
            handleClose();
        }
    };

    const getSizeWidth = (size: string): string => {
        switch (size) {
            case 'small': return '200px';
            case 'medium': return '400px';
            case 'large': return '600px';
            case 'full': return '100%';
            default: return '400px';
        }
    };

    const sizeOptions = [
        { value: 'small', label: '📱 Petit', width: '200px' },
        { value: 'medium', label: '💻 Moyen', width: '400px' },
        { value: 'large', label: '🖥️ Grand', width: '600px' },
        { value: 'full', label: '📺 Pleine largeur', width: '100%' },
        { value: 'custom', label: '⚙️ Personnalisé', width: 'Sur mesure' }
    ];

    const positionOptions = [
        { value: 'top', label: '⬆️ En haut', desc: 'Au-dessus du contenu' },
        { value: 'bottom', label: '⬇️ En bas', desc: 'Sous le contenu' },
        { value: 'left', label: '⬅️ À gauche', desc: 'Côté gauche avec texte à droite' },
        { value: 'right', label: '➡️ À droite', desc: 'Côté droit avec texte à gauche' },
        { value: 'center', label: '🎯 Centré', desc: 'Au centre de la section' },
        { value: 'inline', label: '📝 Inline', desc: 'Dans le flux du texte' }
    ];

    const alignmentOptions = [
        { value: 'left', label: '⬅️ Gauche' },
        { value: 'center', label: '🎯 Centré' },
        { value: 'right', label: '➡️ Droite' }
    ];

    const isNewImage = !currentImage;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <ImageIcon className="!text-2xl text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isNewImage ? 'Ajouter une image' : 'Éditer l\'image'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Personnalisez l'affichage et les propriétés
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors text-3xl font-bold leading-none">&times;</button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Preview & File */}
                        <div className="space-y-5">
                            {/* Upload/Change File */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {isNewImage ? 'Sélectionner une image' : 'Remplacer l\'image (optionnel)'}
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <UploadCloudIcon className="!text-2xl text-blue-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-gray-700 font-medium">
                                        {selectedFile ? selectedFile.name : (isNewImage ? 'Cliquez pour sélectionner' : 'Cliquez pour changer')}
                                    </span>
                                </button>
                                {selectedFile && (
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                        ✓ Fichier sélectionné: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>

                            {/* URL directe (alternative) */}
                            {!selectedFile && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ou entrez une URL
                                    </label>
                                    <input
                                        type="text"
                                        value={editedImage.src}
                                        onChange={(e) => {
                                            handleFieldChange('src', e.target.value);
                                            setPreviewUrl(e.target.value);
                                        }}
                                        placeholder="https://example.com/image.png ou /path/to/image.png"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        URL absolue ou chemin relatif à partir du dossier public
                                    </p>
                                </div>
                            )}

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Aperçu</label>
                                <div className="relative border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[300px] overflow-hidden">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={editedImage.alt || 'Preview'}
                                            className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                                            onError={() => {
                                                setPreviewUrl(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="!text-6xl mb-2 opacity-50" />
                                            <p className="text-sm">Aucun aperçu disponible</p>
                                            <p className="text-xs mt-1">Sélectionnez un fichier ou entrez une URL</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Caption & Alt */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Légende <span className="text-gray-400 font-normal">(optionnel)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editedImage.caption || ''}
                                        onChange={(e) => handleFieldChange('caption', e.target.value)}
                                        placeholder="Description qui apparaîtra sous l'image"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Texte alternatif (Alt) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editedImage.alt}
                                        onChange={(e) => handleFieldChange('alt', e.target.value)}
                                        placeholder="Description pour l'accessibilité"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        required
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                        <span className="text-blue-500">ℹ️</span> Important pour l'accessibilité et le référencement
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Configuration */}
                        <div className="space-y-6">
                            {/* Size */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Taille</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {sizeOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFieldChange('size', opt.value)}
                                            className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                                editedImage.size === opt.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md scale-105'
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="text-sm font-medium">{opt.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opt.width}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Size */}
                                {editedImage.size === 'custom' && (
                                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <label className="block text-xs font-semibold text-blue-700 mb-2">Largeur personnalisée</label>
                                        <input
                                            type="text"
                                            value={editedImage.width || '400px'}
                                            onChange={(e) => handleFieldChange('width', e.target.value)}
                                            placeholder="400px, 50%, etc."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Utilisez px, %, em, rem, etc.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Position</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {positionOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFieldChange('position', opt.value)}
                                            className={`px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                                                editedImage.position === opt.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md'
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="text-sm font-medium">{opt.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Alignement</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {alignmentOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFieldChange('align', opt.value)}
                                            className={`px-4 py-2.5 rounded-lg border-2 transition-all ${
                                                editedImage.align === opt.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md'
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Summary */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-indigo-700 mb-3">Résumé de la configuration</h4>
                                <div className="space-y-2 text-xs text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taille:</span>
                                        <span className="font-semibold">{editedImage.size}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Position:</span>
                                        <span className="font-semibold">{editedImage.position}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Alignement:</span>
                                        <span className="font-semibold">{editedImage.align}</span>
                                    </div>
                                    {editedImage.size === 'custom' && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Largeur:</span>
                                            <span className="font-semibold font-mono">{editedImage.width}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                    <div>
                        {!isNewImage && onDelete && (
                            <button
                                onClick={handleDeleteClick}
                                className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                                <TrashIcon className="!text-base" />
                                Supprimer l'image
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!editedImage.alt || (!selectedFile && !editedImage.src)}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-transparent rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <SaveIcon className="!text-lg" />
                            {isNewImage ? 'Ajouter l\'image' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

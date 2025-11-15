/**
 * ImageManagerV2 - Gestionnaire d'images modernisé avec réédition via modal
 * Permet d'attacher, rééditer et gérer toutes les images d'un élément
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChapterData, ExerciseImage, FileSystemDirectoryHandle } from '../types';
import { TrashIcon, UploadCloudIcon, ImageIcon, EditIcon, PlusIcon } from './icons';

interface ImageManagerV2Props {
    images: ExerciseImage[];
    chapter: ChapterData;
    onClose: () => void;
    onSave: (images: ExerciseImage[]) => void;
    dirHandle: FileSystemDirectoryHandle | null;
}

interface ImageEditModalProps {
    isOpen: boolean;
    image: ExerciseImage | null;
    previewUrl: string | null;
    onClose: () => void;
    onSave: (updatedImage: ExerciseImage) => void;
    onFileChange?: (file: File) => void;
}

// Modal de réédition d'une image existante ou création d'une nouvelle
const ImageEditModal: React.FC<ImageEditModalProps> = ({ 
    isOpen, 
    image, 
    previewUrl, 
    onClose, 
    onSave,
    onFileChange 
}) => {
    const [editedImage, setEditedImage] = useState<ExerciseImage | null>(image);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(previewUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedImage(image);
        setLocalPreview(previewUrl);
        setSelectedFile(null);
    }, [image, previewUrl]);

    if (!isOpen || !editedImage) return null;

    const handleFieldChange = (field: keyof ExerciseImage, value: any) => {
        setEditedImage(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLocalPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            
            if (onFileChange) {
                onFileChange(file);
            }
        }
    };

    const handleSave = () => {
        if (editedImage) {
            onSave(editedImage);
            onClose();
        }
    };

    const sizeOptions = [
        { value: 'small', label: '📱 Petit', desc: '200px' },
        { value: 'medium', label: '💻 Moyen', desc: '400px' },
        { value: 'large', label: '🖥️ Grand', desc: '600px' },
        { value: 'full', label: '📺 Pleine largeur', desc: '100%' },
        { value: 'custom', label: '⚙️ Personnalisé', desc: 'Sur mesure' }
    ];

    const positionOptions = [
        { value: 'top', label: '⬆️ En haut', desc: 'Au-dessus du contenu' },
        { value: 'bottom', label: '⬇️ En bas', desc: 'Sous le contenu' },
        { value: 'left', label: '⬅️ À gauche', desc: 'Côté gauche' },
        { value: 'right', label: '➡️ À droite', desc: 'Côté droit' },
        { value: 'center', label: '🎯 Centré', desc: 'Au centre' },
        { value: 'inline', label: '📝 Inline', desc: 'Dans le flux' }
    ];

    const alignmentOptions = [
        { value: 'left', label: '⬅️ Gauche' },
        { value: 'center', label: '🎯 Centré' },
        { value: 'right', label: '➡️ Droite' },
        { value: 'justify', label: '↔️ Justifié' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <EditIcon className="!text-2xl text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Éditer l'image</h2>
                            <p className="text-sm text-gray-600 mt-0.5">Personnalisez l'affichage et les propriétés</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors text-3xl font-bold leading-none">&times;</button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Preview & File */}
                        <div className="space-y-5">
                            {/* Image Preview */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Aperçu de l'image</label>
                                <div className="relative border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[300px] overflow-hidden">
                                    {localPreview ? (
                                        <img
                                            src={localPreview}
                                            alt={editedImage.alt || editedImage.caption}
                                            className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="!text-6xl mb-2 opacity-50" />
                                            <p className="text-sm">Aucun aperçu disponible</p>
                                            <p className="font-mono text-xs mt-2 break-all px-4">{editedImage.path}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Change File */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Remplacer le fichier (optionnel)</label>
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
                                        {selectedFile ? selectedFile.name : 'Cliquez pour changer l\'image'}
                                    </span>
                                </button>
                                {selectedFile && (
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                        ✓ Nouveau fichier sélectionné: <strong>{selectedFile.name}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Path Info */}
                            <div className="bg-gray-100 rounded-lg p-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Chemin du fichier</label>
                                <p className="font-mono text-xs text-gray-700 break-all">{editedImage.path}</p>
                            </div>

                            {/* Caption & Alt */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Légende</label>
                                    <input
                                        type="text"
                                        value={editedImage.caption}
                                        onChange={(e) => handleFieldChange('caption', e.target.value)}
                                        placeholder="Description qui apparaîtra sous l'image"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Texte alternatif (Alt)</label>
                                    <input
                                        type="text"
                                        value={editedImage.alt}
                                        onChange={(e) => handleFieldChange('alt', e.target.value)}
                                        placeholder="Description pour l'accessibilité"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                        <span className="text-blue-500">ℹ️</span> Important pour l'accessibilité et le SEO
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
                                            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Size */}
                                {editedImage.size === 'custom' && (
                                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <label className="block text-xs font-semibold text-blue-700 mb-3">Dimensions personnalisées</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Largeur (px)</label>
                                                <input
                                                    type="number"
                                                    value={editedImage.custom_width || ''}
                                                    onChange={(e) => handleFieldChange('custom_width', e.target.value ? parseInt(e.target.value) : null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    min="50"
                                                    max="1200"
                                                    placeholder="400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Hauteur (px)</label>
                                                <input
                                                    type="number"
                                                    value={editedImage.custom_height || ''}
                                                    onChange={(e) => handleFieldChange('custom_height', e.target.value ? parseInt(e.target.value) : null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    min="50"
                                                    max="1200"
                                                    placeholder="300"
                                                />
                                            </div>
                                        </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    {alignmentOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFieldChange('alignment', opt.value)}
                                            className={`px-4 py-2.5 rounded-lg border-2 transition-all ${
                                                editedImage.alignment === opt.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md'
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {selectedFile && (
                            <span className="flex items-center gap-2 text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Nouveau fichier prêt à être appliqué
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-transparent rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                        >
                            <EditIcon className="!text-lg" />
                            Appliquer les modifications
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const ImageManagerV2: React.FC<ImageManagerV2Props> = ({ 
    images: initialImages, 
    chapter, 
    onClose, 
    onSave, 
    dirHandle 
}) => {
    const [images, setImages] = useState<ExerciseImage[]>(() => JSON.parse(JSON.stringify(initialImages)));
    const [selectedIndex, setSelectedIndex] = useState<number | null>(images.length > 0 ? 0 : null);
    const [isUploading, setIsUploading] = useState(false);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [pendingFileReplace, setPendingFileReplace] = useState<{ index: number, file: File } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            Object.values(previews).forEach(URL.revokeObjectURL);
        };
    }, [previews]);

    const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

    const handleOpenEditModal = (index: number) => {
        setSelectedIndex(index);
        setEditModalOpen(true);
    };

    const handleSaveEditedImage = (updatedImage: ExerciseImage) => {
        if (selectedIndex === null) return;
        
        const newImages = [...images];
        newImages[selectedIndex] = updatedImage;
        setImages(newImages);
        
        // Si un fichier est en attente de remplacement, le traiter
        if (pendingFileReplace && pendingFileReplace.index === selectedIndex) {
            handleReplaceFile(pendingFileReplace.file, selectedIndex);
            setPendingFileReplace(null);
        }
    };

    const handleReplaceFile = async (file: File, index: number) => {
        if (!dirHandle) {
            alert("Project directory handle is missing.");
            return;
        }

        try {
            const picturesDir = await dirHandle.getDirectoryHandle('pictures', { create: true });
            const classDir = await picturesDir.getDirectoryHandle(chapter.class_type, { create: true });
            const chapterDir = await classDir.getDirectoryHandle(chapter.id, { create: true });

            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const filename = `img_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const fileHandle = await chapterDir.getFileHandle(filename, { create: true });

            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            const relativePath = `pictures/${chapter.class_type}/${chapter.id}/${filename}`;
            const objectUrl = URL.createObjectURL(file);

            const newImages = [...images];
            newImages[index] = { ...newImages[index], path: relativePath };
            setImages(newImages);

            // Update preview
            setPreviews(prev => ({ ...prev, [relativePath]: objectUrl }));
        } catch (error) {
            console.error("Error replacing image file:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleImportNewImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!dirHandle) {
            alert("Project directory handle is missing.");
            return;
        }

        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);

        try {
            const picturesDir = await dirHandle.getDirectoryHandle('pictures', { create: true });
            const classDir = await picturesDir.getDirectoryHandle(chapter.class_type, { create: true });
            const chapterDir = await classDir.getDirectoryHandle(chapter.id, { create: true });

            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const filename = `img_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const fileHandle = await chapterDir.getFileHandle(filename, { create: true });

            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            const relativePath = `pictures/${chapter.class_type}/${chapter.id}/${filename}`;

            const newImage: ExerciseImage = {
                id: `img_${Date.now()}`,
                path: relativePath,
                caption: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
                size: 'medium',
                position: 'center',
                alignment: 'center',
                alt: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            };

            setPreviews(prev => ({ ...prev, [newImage.path]: objectUrl }));

            setImages(prevImages => {
                const updatedImages = [...prevImages, newImage];
                setSelectedIndex(updatedImages.length - 1);
                return updatedImages;
            });
        } catch (error) {
            URL.revokeObjectURL(objectUrl);
            console.error("Error saving image:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteImage = (index: number) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette image ?")) return;

        const imageToDelete = images[index];
        if (previews[imageToDelete.path]) {
            URL.revokeObjectURL(previews[imageToDelete.path]);
            const newPreviews = { ...previews };
            delete newPreviews[imageToDelete.path];
            setPreviews(newPreviews);
        }

        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);

        if (selectedIndex === index) {
            setSelectedIndex(newImages.length > 0 ? 0 : null);
        } else if (selectedIndex && selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const previewUrl = selectedImage ? previews[selectedImage.path] : null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <ImageIcon className="!text-3xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Gestionnaire d'images</h2>
                                <p className="text-sm text-gray-600 mt-0.5">{images.length} image{images.length > 1 ? 's' : ''} attachée{images.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors text-3xl font-bold leading-none">&times;</button>
                    </header>

                    {/* Body */}
                    <div className="flex-grow flex overflow-hidden">
                        {/* Left Sidebar - Image List */}
                        <aside className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <button
                                    onClick={handleImportNewImage}
                                    disabled={isUploading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
                                >
                                    <PlusIcon className="!text-xl" />
                                    {isUploading ? 'Import en cours...' : 'Ajouter une image'}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto p-3">
                                {images.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
                                        <ImageIcon className="!text-6xl mb-3 opacity-30" />
                                        <p className="text-sm font-medium">Aucune image</p>
                                        <p className="text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {images.map((img, index) => (
                                            <div
                                                key={img.id || index}
                                                onClick={() => setSelectedIndex(index)}
                                                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                                                    selectedIndex === index
                                                        ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                                                        : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                                        {previews[img.path] ? (
                                                            <img src={previews[img.path]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="!text-2xl text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                            {img.caption || img.path.split('/').pop()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {img.size} • {img.position}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(index); }}
                                                        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        title="Éditer"
                                                    >
                                                        <EditIcon className="!text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(index); }}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="!text-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Right - Preview & Quick Info */}
                        <main className="flex-1 p-6 overflow-y-auto bg-white">
                            {selectedImage ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-800">Aperçu</h3>
                                        <button
                                            onClick={() => selectedIndex !== null && handleOpenEditModal(selectedIndex)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                                        >
                                            <EditIcon className="!text-base" />
                                            Éditer cette image
                                        </button>
                                    </div>

                                    {/* Large Preview */}
                                    <div className="border-2 border-gray-200 rounded-xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[400px]">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt={selectedImage.alt || selectedImage.caption}
                                                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <ImageIcon className="!text-8xl mb-4 opacity-30" />
                                                <p className="text-sm font-medium">Aperçu non disponible</p>
                                                <p className="font-mono text-xs mt-2 break-all px-8">{selectedImage.path}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-blue-700 mb-2">Légende</h4>
                                            <p className="text-sm text-gray-800">{selectedImage.caption || <em className="text-gray-400">Non définie</em>}</p>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-green-700 mb-2">Texte alternatif</h4>
                                            <p className="text-sm text-gray-800">{selectedImage.alt || <em className="text-gray-400">Non défini</em>}</p>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-purple-700 mb-2">Configuration</h4>
                                            <p className="text-sm text-gray-800">
                                                Taille: <strong>{selectedImage.size}</strong><br />
                                                Position: <strong>{selectedImage.position}</strong><br />
                                                Alignement: <strong>{selectedImage.alignment}</strong>
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-orange-700 mb-2">Chemin</h4>
                                            <p className="font-mono text-xs text-gray-700 break-all">{selectedImage.path}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-center">
                                    <div>
                                        <ImageIcon className="!text-8xl mb-4 opacity-20" />
                                        <p className="text-lg font-medium">Sélectionnez une image</p>
                                        <p className="text-sm mt-1">ou ajoutez-en une nouvelle</p>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>

                    {/* Footer */}
                    <footer className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50 gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => onSave(images)}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-transparent rounded-lg shadow-md hover:from-green-700 hover:to-emerald-700 transition-all"
                        >
                            Enregistrer les modifications
                        </button>
                    </footer>
                </div>
            </div>

            {/* Edit Modal */}
            <ImageEditModal
                isOpen={editModalOpen}
                image={selectedImage}
                previewUrl={previewUrl}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveEditedImage}
                onFileChange={(file) => {
                    if (selectedIndex !== null) {
                        setPendingFileReplace({ index: selectedIndex, file });
                    }
                }}
            />
        </>
    );
};

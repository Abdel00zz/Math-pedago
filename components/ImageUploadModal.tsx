/**
 * ImageUploadModal - Modal avancé pour l'upload et le positionnement d'images
 */

import React, { useState, useRef } from 'react';
import { ImageIcon, SaveIcon } from './icons';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (imageConfig: ImageConfig) => void;
}

export interface ImageConfig {
    file: File;
    caption: string;
    alt: string;
    size: 'small' | 'medium' | 'large' | 'full' | 'custom';
    customWidth?: number;
    customHeight?: number;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'inline' | 'float-left' | 'float-right';
    alignment: 'left' | 'center' | 'right' | 'justify';
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [alt, setAlt] = useState('');
    const [size, setSize] = useState<ImageConfig['size']>('medium');
    const [customWidth, setCustomWidth] = useState(400);
    const [customHeight, setCustomHeight] = useState(300);
    const [position, setPosition] = useState<ImageConfig['position']>('center');
    const [alignment, setAlignment] = useState<ImageConfig['alignment']>('center');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            
            // Auto-fill alt text with filename
            if (!alt) {
                setAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
            }
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            alert('Veuillez sélectionner une image');
            return;
        }

        const config: ImageConfig = {
            file: selectedFile,
            caption,
            alt: alt || selectedFile.name,
            size,
            customWidth: size === 'custom' ? customWidth : undefined,
            customHeight: size === 'custom' ? customHeight : undefined,
            position,
            alignment
        };

        onUpload(config);
        handleClose();
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption('');
        setAlt('');
        setSize('medium');
        setPosition('center');
        setAlignment('center');
        onClose();
    };

    const sizePresets = {
        small: { width: 200, height: 'auto' },
        medium: { width: 400, height: 'auto' },
        large: { width: 600, height: 'auto' },
        full: { width: '100%', height: 'auto' },
        custom: { width: customWidth, height: customHeight }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="!text-3xl text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Insérer une image</h2>
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Upload & Preview */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier image</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ImageIcon className="!text-2xl text-gray-400" />
                                    <span className="text-gray-600">
                                        {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner une image'}
                                    </span>
                                </button>
                            </div>

                            {/* Preview */}
                            {previewUrl && (
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
                                    <div className="relative bg-white border border-gray-200 rounded p-4 flex items-center justify-center min-h-[200px]">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '300px',
                                                width: size === 'custom' ? `${customWidth}px` : sizePresets[size].width,
                                                height: size === 'custom' ? `${customHeight}px` : sizePresets[size].height,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Caption & Alt Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Légende (optionnel)</label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Description qui apparaîtra sous l'image"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Texte alternatif</label>
                                <input
                                    type="text"
                                    value={alt}
                                    onChange={(e) => setAlt(e.target.value)}
                                    placeholder="Description pour l'accessibilité"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">Important pour l'accessibilité et le SEO</p>
                            </div>
                        </div>

                        {/* Right Column - Configuration */}
                        <div className="space-y-4">
                            {/* Size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['small', 'medium', 'large', 'full', 'custom'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                size === s
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                                    : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                        >
                                            {s === 'small' && '📱 Petit (200px)'}
                                            {s === 'medium' && '💻 Moyen (400px)'}
                                            {s === 'large' && '🖥️ Grand (600px)'}
                                            {s === 'full' && '📺 Pleine largeur'}
                                            {s === 'custom' && '⚙️ Personnalisé'}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Size Inputs */}
                                {size === 'custom' && (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Largeur (px)</label>
                                            <input
                                                type="number"
                                                value={customWidth}
                                                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 400)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                min="50"
                                                max="1200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Hauteur (px)</label>
                                            <input
                                                type="number"
                                                value={customHeight}
                                                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 300)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                min="50"
                                                max="1200"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { value: 'top', label: '⬆️ En haut', desc: 'Au-dessus du texte' },
                                        { value: 'bottom', label: '⬇️ En bas', desc: 'Sous le texte' },
                                        { value: 'left', label: '⬅️ À gauche', desc: 'Côté gauche' },
                                        { value: 'right', label: '➡️ À droite', desc: 'Côté droit' },
                                        { value: 'center', label: '🎯 Centré', desc: 'Au centre' },
                                        { value: 'inline', label: '📝 Inline', desc: 'Dans le texte' },
                                        { value: 'float-left', label: '↖️ Float gauche', desc: 'Texte entoure à droite' },
                                        { value: 'float-right', label: '↗️ Float droite', desc: 'Texte entoure à gauche' }
                                    ] as const).map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => setPosition(p.value)}
                                            className={`px-3 py-2 rounded-lg border-2 transition-colors text-left ${
                                                position === p.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                                    : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="text-sm font-medium">{p.label}</div>
                                            <div className="text-xs text-gray-500">{p.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alignement</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { value: 'left', label: '⬅️ Gauche', icon: '├' },
                                        { value: 'center', label: '🎯 Centré', icon: '┼' },
                                        { value: 'right', label: '➡️ Droite', icon: '┤' },
                                        { value: 'justify', label: '↔️ Justifié', icon: '═' }
                                    ] as const).map((a) => (
                                        <button
                                            key={a.value}
                                            onClick={() => setAlignment(a.value)}
                                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                alignment === a.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                                    : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                        >
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {selectedFile && (
                            <span>
                                Fichier: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <SaveIcon className="w-5 h-5" />
                            Insérer l'image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

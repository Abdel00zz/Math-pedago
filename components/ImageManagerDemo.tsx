/**
 * Démonstration du nouveau système de gestion d'images
 * Ce fichier montre comment intégrer ImageManagerModern dans vos composants
 */

import React, { useState } from 'react';
import { ImageManagerModern, LessonImageConfig } from './ImageManagerModern';
import { ImageIcon, EditIcon, TrashIcon } from './icons';

// Exemple d'élément de leçon avec image
interface LessonElementWithImage {
    type: 'example-box' | 'definition-box' | 'paragraph';
    preamble?: string;
    content: string;
    image?: LessonImageConfig;
}

export const ImageManagerDemo: React.FC = () => {
    const [element, setElement] = useState<LessonElementWithImage>({
        type: 'example-box',
        preamble: 'Exemple avec image',
        content: 'Voici un exemple de contenu avec une image attachée.',
        image: undefined
    });

    const [showImageManager, setShowImageManager] = useState(false);

    const handleAddImage = () => {
        setShowImageManager(true);
    };

    const handleSaveImage = (imageConfig: LessonImageConfig) => {
        setElement(prev => ({
            ...prev,
            image: imageConfig
        }));
        setShowImageManager(false);
    };

    const handleDeleteImage = () => {
        setElement(prev => ({
            ...prev,
            image: undefined
        }));
        setShowImageManager(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        📷 Démonstration du Gestionnaire d'Images
                    </h1>
                    <p className="text-gray-600">
                        Testez le nouveau système de gestion d'images avec réédition et configuration avancée
                    </p>
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contrôles</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                        >
                            <ImageIcon className="!text-xl" />
                            {element.image ? 'Éditer l\'image' : 'Ajouter une image'}
                        </button>
                        {element.image && (
                            <button
                                onClick={handleDeleteImage}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
                            >
                                <TrashIcon className="!text-xl" />
                                Supprimer l'image
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aperçu de l'élément</h2>
                    
                    {/* Example Box with Image */}
                    <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                        <header className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-300">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-semibold">
                                💡 Exemple
                            </span>
                            {element.preamble && (
                                <>
                                    <span className="text-blue-400">|</span>
                                    <span className="font-semibold text-blue-800">{element.preamble}</span>
                                </>
                            )}
                        </header>

                        {/* Content with Image */}
                        {element.image ? (
                            <div className={`flex ${
                                element.image.position === 'left' || element.image.position === 'right' 
                                    ? 'flex-row gap-6 items-start' 
                                    : 'flex-col gap-4'
                            }`}>
                                {/* Image */}
                                {(element.image.position === 'top' || element.image.position === 'left') && (
                                    <div 
                                        className={`relative group cursor-pointer ${
                                            element.image.position === 'left' || element.image.position === 'right'
                                                ? 'flex-shrink-0'
                                                : 'w-full'
                                        }`}
                                        style={{ width: element.image.width }}
                                        onClick={handleAddImage}
                                    >
                                        <img
                                            src={element.image.src}
                                            alt={element.image.alt}
                                            className={`rounded-lg border-2 border-blue-300 w-full ${
                                                element.image.align === 'center' ? 'mx-auto' :
                                                element.image.align === 'right' ? 'ml-auto' : ''
                                            }`}
                                        />
                                        {element.image.caption && (
                                            <p className="text-sm text-gray-600 italic mt-2 text-center">
                                                {element.image.caption}
                                            </p>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <EditIcon className="!text-base" />
                                                Éditer l'image
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1">
                                    <p className="text-gray-800 leading-relaxed">{element.content}</p>
                                </div>

                                {/* Image (right/bottom) */}
                                {(element.image.position === 'bottom' || element.image.position === 'right') && (
                                    <div 
                                        className={`relative group cursor-pointer ${
                                            element.image.position === 'left' || element.image.position === 'right'
                                                ? 'flex-shrink-0'
                                                : 'w-full'
                                        }`}
                                        style={{ width: element.image.width }}
                                        onClick={handleAddImage}
                                    >
                                        <img
                                            src={element.image.src}
                                            alt={element.image.alt}
                                            className={`rounded-lg border-2 border-blue-300 w-full ${
                                                element.image.align === 'center' ? 'mx-auto' :
                                                element.image.align === 'right' ? 'ml-auto' : ''
                                            }`}
                                        />
                                        {element.image.caption && (
                                            <p className="text-sm text-gray-600 italic mt-2 text-center">
                                                {element.image.caption}
                                            </p>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <EditIcon className="!text-base" />
                                                Éditer l'image
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-800 leading-relaxed mb-4">{element.content}</p>
                                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-white">
                                    <ImageIcon className="!text-5xl text-blue-300 mx-auto mb-2" />
                                    <p className="text-gray-500 mb-3">Aucune image attachée</p>
                                    <button
                                        onClick={handleAddImage}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                    >
                                        <ImageIcon className="!text-base" />
                                        Ajouter une image
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* JSON Output */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Sortie JSON</h2>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {JSON.stringify(element, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Image Manager Modal */}
            <ImageManagerModern
                isOpen={showImageManager}
                currentImage={element.image}
                onClose={() => setShowImageManager(false)}
                onSave={handleSaveImage}
                onDelete={element.image ? handleDeleteImage : undefined}
                lessonPath="/chapters/demo/lessons"
            />
        </div>
    );
};

// Exemple d'utilisation dans un éditeur de leçon
export const LessonEditorImageIntegration: React.FC = () => {
    const [elements, setElements] = useState<LessonElementWithImage[]>([
        {
            type: 'definition-box',
            preamble: 'Définition',
            content: 'Une fonction est une relation qui associe à chaque élément...',
        },
        {
            type: 'example-box',
            preamble: 'Exemple visuel',
            content: 'Considérons le graphique suivant...',
            image: {
                src: '/chapters/1bsm/lessons/pictures/example_graph.png',
                alt: 'Graphique d\'exemple',
                caption: 'Figure 1: Représentation graphique',
                position: 'right',
                align: 'center',
                width: '300px',
                size: 'medium'
            }
        }
    ]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showImageManager, setShowImageManager] = useState(false);

    const handleEditImage = (index: number) => {
        setEditingIndex(index);
        setShowImageManager(true);
    };

    const handleSaveImage = (imageConfig: LessonImageConfig) => {
        if (editingIndex !== null) {
            setElements(prev => {
                const updated = [...prev];
                updated[editingIndex] = {
                    ...updated[editingIndex],
                    image: imageConfig
                };
                return updated;
            });
        }
        setShowImageManager(false);
        setEditingIndex(null);
    };

    const handleDeleteImage = () => {
        if (editingIndex !== null) {
            setElements(prev => {
                const updated = [...prev];
                updated[editingIndex] = {
                    ...updated[editingIndex],
                    image: undefined
                };
                return updated;
            });
        }
        setShowImageManager(false);
        setEditingIndex(null);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Éditeur de leçon - Gestion d'images</h1>
            
            <div className="space-y-4">
                {elements.map((element, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4 border-2 border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-sm font-semibold text-gray-600">{element.type}</span>
                                <p className="font-bold text-gray-800">{element.preamble}</p>
                            </div>
                            <button
                                onClick={() => handleEditImage(index)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center gap-1"
                            >
                                <ImageIcon className="!text-sm" />
                                {element.image ? 'Éditer image' : 'Ajouter image'}
                            </button>
                        </div>
                        <p className="text-gray-700 text-sm">{element.content}</p>
                        {element.image && (
                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                ✓ Image attachée: {element.image.alt} ({element.image.size}, {element.image.position})
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ImageManagerModern
                isOpen={showImageManager}
                currentImage={editingIndex !== null ? elements[editingIndex].image : null}
                onClose={() => {
                    setShowImageManager(false);
                    setEditingIndex(null);
                }}
                onSave={handleSaveImage}
                onDelete={editingIndex !== null && elements[editingIndex].image ? handleDeleteImage : undefined}
            />
        </div>
    );
};

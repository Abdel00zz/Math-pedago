import React, { useState } from 'react';
import { Manifest, ManifestEntry } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, XCircleIcon } from './icons';

interface ManifestEditorProps {
    manifest: Manifest;
    activeClass: string;
    onClose: () => void;
    onSave: (updatedManifest: Manifest) => void;
}

export const ManifestEditor: React.FC<ManifestEditorProps> = ({
    manifest,
    activeClass,
    onClose,
    onSave
}) => {
    const [editedManifest, setEditedManifest] = useState<Manifest>(JSON.parse(JSON.stringify(manifest)));
    const [newEntry, setNewEntry] = useState<Partial<ManifestEntry>>({
        id: '',
        file: '',
        isActive: true,
        version: ''
    });

    const handleAddEntry = () => {
        if (!newEntry.id || !newEntry.file) {
            alert('Veuillez remplir l\'ID et le nom du fichier');
            return;
        }

        const entry: ManifestEntry = {
            id: newEntry.id,
            file: newEntry.file,
            isActive: newEntry.isActive ?? true,
            version: newEntry.version || '000000'
        };

        const updated = { ...editedManifest };
        if (!updated[activeClass]) {
            updated[activeClass] = [];
        }
        updated[activeClass] = [...updated[activeClass], entry];
        setEditedManifest(updated);

        // Reset form
        setNewEntry({
            id: '',
            file: '',
            isActive: true,
            version: ''
        });
    };

    const handleDeleteEntry = (index: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
            return;
        }

        const updated = { ...editedManifest };
        updated[activeClass] = updated[activeClass].filter((_, i) => i !== index);
        setEditedManifest(updated);
    };

    const handleUpdateEntry = (index: number, field: keyof ManifestEntry, value: any) => {
        const updated = { ...editedManifest };
        updated[activeClass][index] = {
            ...updated[activeClass][index],
            [field]: value
        };
        setEditedManifest(updated);
    };

    const handleSave = () => {
        onSave(editedManifest);
        onClose();
    };

    const entries = editedManifest[activeClass] || [];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
                    <div>
                        <h2 className="text-base font-bold text-white">Éditeur de Manifest</h2>
                        <p className="text-xs text-purple-100 mt-0.5">Classe: {activeClass}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                        title="Fermer (Échap)"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Add New Entry Form */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">➕ Ajouter un nouveau chapitre</h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">ID du chapitre</label>
                                <input
                                    type="text"
                                    value={newEntry.id}
                                    onChange={(e) => setNewEntry({ ...newEntry, id: e.target.value })}
                                    placeholder="ex: ch_logique"
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Nom du fichier</label>
                                <input
                                    type="text"
                                    value={newEntry.file}
                                    onChange={(e) => setNewEntry({ ...newEntry, file: e.target.value })}
                                    placeholder="ex: tcs/logique.json"
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={newEntry.isActive ?? true}
                                    onChange={(e) => setNewEntry({ ...newEntry, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="font-semibold text-gray-700">Actif par défaut</span>
                            </label>
                            <button
                                onClick={handleAddEntry}
                                className="ml-auto px-4 py-2 text-xs font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md shadow-md hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-1.5"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Ajouter
                            </button>
                        </div>
                    </div>

                    {/* Existing Entries */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                            📚 Chapitres existants ({entries.length})
                        </h3>
                        {entries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-xs">
                                Aucun chapitre dans cette classe. Ajoutez-en un ci-dessus.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {entries.map((entry, index) => (
                                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all">
                                        <div className="grid grid-cols-12 gap-2 items-center">
                                            {/* ID */}
                                            <div className="col-span-3">
                                                <label className="block text-[9px] font-bold text-gray-600 mb-1 uppercase">ID</label>
                                                <input
                                                    type="text"
                                                    value={entry.id}
                                                    onChange={(e) => handleUpdateEntry(index, 'id', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* File */}
                                            <div className="col-span-5">
                                                <label className="block text-[9px] font-bold text-gray-600 mb-1 uppercase">Fichier</label>
                                                <input
                                                    type="text"
                                                    value={entry.file}
                                                    onChange={(e) => handleUpdateEntry(index, 'file', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                                                />
                                            </div>

                                            {/* Version */}
                                            <div className="col-span-2">
                                                <label className="block text-[9px] font-bold text-gray-600 mb-1 uppercase">Version</label>
                                                <input
                                                    type="text"
                                                    value={entry.version || ''}
                                                    onChange={(e) => handleUpdateEntry(index, 'version', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                                                />
                                            </div>

                                            {/* Active */}
                                            <div className="col-span-1 flex items-center justify-center">
                                                <label className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase">Actif</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.isActive}
                                                        onChange={(e) => handleUpdateEntry(index, 'isActive', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                </label>
                                            </div>

                                            {/* Delete */}
                                            <div className="col-span-1 flex items-end justify-center pb-1">
                                                <button
                                                    onClick={() => handleDeleteEntry(index)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-md shadow-md hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-1.5"
                    >
                        <SaveIcon className="w-4 h-4" />
                        Sauvegarder le Manifest
                    </button>
                </footer>
            </div>
        </div>
    );
};

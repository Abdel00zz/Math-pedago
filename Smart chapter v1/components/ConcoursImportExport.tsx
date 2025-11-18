/**
 * ConcoursImportExport - Interface professionnelle d'import/export de concours
 */

import React, { useState } from 'react';
import { ConcoursData } from '../types';
import { concoursManager } from '../utils/concoursManager';
import {
    UploadCloudIcon,
    DownloadIcon,
    CheckCircleIcon,
    XCircleIcon,
    FolderIcon,
    DocumentTextIcon
} from './icons';

interface ConcoursImportExportProps {
    onClose: () => void;
    onImportSuccess?: () => void;
}

const DownloadIcon: React.FC<any> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

export const ConcoursImportExport: React.FC<ConcoursImportExportProps> = ({ onClose, onImportSuccess }) => {
    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
    const [selectedType, setSelectedType] = useState<string>('medecine');
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [exportList, setExportList] = useState<{ id: string; theme: string; annee: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const concoursTypes = [
        { id: 'medecine', name: 'Médecine' },
        { id: 'ensa', name: 'ENSA' },
        { id: 'ensam', name: 'ENSAM' }
    ];

    // Import d'un fichier JSON
    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setImportStatus({ type: null, message: '' });

        try {
            const content = await file.text();
            const concours: ConcoursData = JSON.parse(content);

            // Valider les données
            if (!concours.id || !concours.concours || !concours.annee || !concours.theme) {
                throw new Error('Fichier JSON invalide : champs obligatoires manquants');
            }

            // Importer via le manager
            await concoursManager.importConcours(content, selectedType);

            setImportStatus({
                type: 'success',
                message: `Concours "${concours.theme}" (${concours.annee}) importé avec succès !`
            });

            if (onImportSuccess) {
                onImportSuccess();
            }
        } catch (error) {
            console.error('Import error:', error);
            setImportStatus({
                type: 'error',
                message: `Erreur lors de l'import : ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    // Charger la liste des concours pour l'export
    const loadExportList = async () => {
        setLoading(true);
        try {
            const allConcours = await concoursManager.listAllConcours();
            const list = allConcours.map(c => ({
                id: c.id,
                theme: c.theme,
                annee: c.file.includes('/') ? c.file.split('/')[2]?.split('-')[0] || '' : ''
            }));
            setExportList(list);
        } catch (error) {
            console.error('Error loading export list:', error);
        } finally {
            setLoading(false);
        }
    };

    // Exporter un concours
    const handleExport = async (concoursId: string, theme: string) => {
        setLoading(true);
        try {
            const jsonContent = await concoursManager.exportConcours(concoursId);

            // Créer un fichier de téléchargement
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${concoursId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setImportStatus({
                type: 'success',
                message: `Concours "${theme}" exporté avec succès !`
            });
        } catch (error) {
            console.error('Export error:', error);
            setImportStatus({
                type: 'error',
                message: `Erreur lors de l'export : ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'export') {
            loadExportList();
        }
    }, [activeTab]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex-shrink-0 flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <FolderIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Import / Export de Concours</h2>
                            <p className="text-sm text-gray-600 mt-0.5">Gérez vos fichiers de concours professionnellement</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Tabs */}
                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
                    <nav className="flex gap-2 px-8">
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`
                                px-6 py-3 text-sm font-semibold border-b-3 transition-all
                                ${activeTab === 'import'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                                }
                            `}
                        >
                            <UploadCloudIcon className="w-5 h-5 inline mr-2" />
                            Importer
                        </button>
                        <button
                            onClick={() => setActiveTab('export')}
                            className={`
                                px-6 py-3 text-sm font-semibold border-b-3 transition-all
                                ${activeTab === 'export'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                                }
                            `}
                        >
                            <DownloadIcon className="w-5 h-5 inline mr-2" />
                            Exporter
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Status Messages */}
                    {importStatus.type && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                            importStatus.type === 'success'
                                ? 'bg-green-50 border-2 border-green-300 text-green-800'
                                : 'bg-red-50 border-2 border-red-300 text-red-800'
                        }`}>
                            {importStatus.type === 'success' ? (
                                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            )}
                            <div>{importStatus.message}</div>
                        </div>
                    )}

                    {activeTab === 'import' ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Importer un Concours</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Sélectionnez un fichier JSON de concours à importer. Le fichier sera automatiquement
                                    ajouté au répertoire approprié et l'index sera mis à jour.
                                </p>
                            </div>

                            {/* Type selection */}
                            <div className="form-group">
                                <label className="form-label">Type de Concours</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="form-select"
                                >
                                    {concoursTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* File upload */}
                            <div className="form-group">
                                <label className="form-label">Fichier JSON</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileImport}
                                        disabled={loading}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-3 file:px-6
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100
                                            file:cursor-pointer cursor-pointer
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="form-help">
                                    Formats acceptés : .json • Max 10MB
                                </p>
                            </div>

                            {/* Info box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Structure attendue
                                </h4>
                                <pre className="text-xs text-blue-800 bg-blue-100/50 p-3 rounded-lg overflow-x-auto">
{`{
  "id": "medecine-2024-theme",
  "concours": "Médecine",
  "annee": "2024",
  "theme": "Thème mathématique",
  "resume": { ... },
  "quiz": [ ... ]
}`}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Exporter un Concours</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Sélectionnez un concours à exporter au format JSON.
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-gray-600">Chargement des concours...</p>
                                </div>
                            ) : exportList.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Aucun concours disponible pour l'export</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {exportList.map((concours) => (
                                        <div
                                            key={concours.id}
                                            className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{concours.theme}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    ID: {concours.id} • Année: {concours.annee}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleExport(concours.id, concours.theme)}
                                                disabled={loading}
                                                className="btn btn-primary"
                                            >
                                                <DownloadIcon className="w-5 h-5" />
                                                Exporter
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 flex justify-end items-center px-8 py-5 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Fermer
                    </button>
                </footer>
            </div>
        </div>
    );
};

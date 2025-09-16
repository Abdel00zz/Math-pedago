import React, { useContext, useEffect, useState, useMemo } from 'react';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import { CLASS_OPTIONS } from '../constants';
import { AppContext } from '../context/AppContext';
import { Chapter } from '../types';

const ExportView: React.FC<{ json: string; onDone: () => void }> = ({ json, onDone }) => {
    const { addNotification } = useNotification();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(json)
            .then(() => {
                addNotification('Configuration copiée dans le presse-papiers !');
                setCopied(true);
            })
            .catch(() => addNotification('Erreur lors de la copie.', 'error'));
    };

    return (
        <div className="bg-primary/5 p-4 rounded-lg mt-4 border border-primary/20">
            <h3 className="font-bold text-lg text-primary font-serif">Étape 1 : Copier la nouvelle configuration</h3>
            <p className="text-sm text-secondary mt-1 mb-3">
                Cliquez sur le bouton pour copier le contenu ci-dessous.
            </p>
            <textarea
                readOnly
                value={json}
                className="w-full h-40 p-2 font-mono text-sm border rounded-md bg-light-gray/50 text-dark-gray focus:ring-2 focus:ring-primary"
            />
            <button
                onClick={handleCopy}
                className={`w-full sm:w-auto mt-2 px-4 py-2 font-bold text-white rounded-lg transition active:scale-95 ${copied ? 'bg-success' : 'bg-primary hover:bg-opacity-90'}`}
            >
                {copied ? 'Copié !' : 'Copier le JSON'}
            </button>
            <h3 className="font-bold text-lg text-primary font-serif mt-6">Étape 2 : Mettre à jour et commiter</h3>
            <p className="text-sm text-secondary mt-1">
                Collez ce contenu pour remplacer intégralement celui du fichier <code>public/manifest.json</code> de votre projet. Ensuite, faites un "commit" de ce fichier et poussez les changements sur votre dépôt Git. Vercel déploiera automatiquement la mise à jour.
            </p>

            <div className="mt-6 text-right">
                <button
                    onClick={onDone}
                    className="px-4 py-2 font-semibold text-secondary bg-light-gray rounded-lg hover:bg-border-color"
                >
                    Terminé
                </button>
            </div>
        </div>
    );
};


const AdminModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { state: appState } = useContext(AppContext);
    const [draftChapters, setDraftChapters] = useState<{ [id: string]: Chapter }>({});
    const [isDirty, setIsDirty] = useState(false);
    const [exportJson, setExportJson] = useState<string | null>(null);
    
    useEffect(() => {
        if (isOpen) {
            // When modal opens, create a deep copy of the app's chapters for safe editing
            setDraftChapters(JSON.parse(JSON.stringify(appState.activities)));
            setIsDirty(false);
            setExportJson(null);
        }
    }, [isOpen, appState.activities]);

    const chaptersByClass = useMemo(() => {
        const grouped: { [classId: string]: Chapter[] } = {};

        Object.values(draftChapters).forEach(chapter => {
            if (!grouped[chapter.class]) {
                grouped[chapter.class] = [];
            }
            grouped[chapter.class].push(chapter);
        });

        for (const classId in grouped) {
            grouped[classId].sort((a, b) => a.chapter.localeCompare(b.chapter));
        }
        
        const sortedGrouped: { [classId: string]: Chapter[] } = {};
        const knownClassIds = new Set(CLASS_OPTIONS.map(opt => opt.value));

        CLASS_OPTIONS.forEach(opt => {
            if (grouped[opt.value]) {
                sortedGrouped[opt.value] = grouped[opt.value];
            }
        });

        Object.keys(grouped).forEach(classId => {
            if (!knownClassIds.has(classId)) {
                sortedGrouped[classId] = grouped[classId];
            }
        });

        return sortedGrouped;
    }, [draftChapters]);

    const handleToggle = (chapterId: string) => {
        setDraftChapters(prev => {
            const newChapters = { ...prev };
            if (newChapters[chapterId]) {
                newChapters[chapterId].isActive = !newChapters[chapterId].isActive;
            }
            return newChapters;
        });
        setIsDirty(true);
    };

    const handleSaveChanges = () => {
        const manifestToExport: { [classId: string]: { id: string; file: string; isActive: boolean }[] } = {};

        Object.values(draftChapters).forEach(chapter => {
            const { class: classId, id, file, isActive } = chapter;
            if (!manifestToExport[classId]) {
                manifestToExport[classId] = [];
            }
            manifestToExport[classId].push({ id, file, isActive });
        });
        
        // Ensure consistent sorting
        for(const classId in manifestToExport) {
            manifestToExport[classId].sort((a,b) => a.id.localeCompare(b.id));
        }

        setExportJson(JSON.stringify(manifestToExport, null, 2));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Panneau d'Administration" className="max-w-full sm:max-w-4xl">
            <div className="mt-6">
                {exportJson ? (
                    <ExportView json={exportJson} onDone={onClose} />
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 bg-light-gray/60 rounded-lg border">
                            <p className="text-sm text-secondary">
                                Activez ou désactivez les chapitres. Cliquez sur "Enregistrer" pour générer la configuration à commiter.
                            </p>
                            {isDirty && (
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-4 py-2 font-bold text-white bg-success rounded-lg hover:bg-opacity-90 transition active:scale-95 flex-shrink-0 animate-pulse"
                                >
                                    Enregistrer les modifications...
                                </button>
                            )}
                        </div>

                        <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto p-1">
                            {Object.keys(chaptersByClass).length === 0 ? (
                                <p className="text-center text-secondary py-8">Aucun chapitre détecté. Vérifiez le fichier <code>/public/manifest.json</code>.</p>
                            ) : (
                                Object.entries(chaptersByClass).map(([classId, chapters]) => (
                                    <div key={classId}>
                                        <h3 className="text-lg font-bold font-serif text-primary border-b-2 border-primary/20 pb-2 mb-3">
                                            {CLASS_OPTIONS.find(c => c.value === classId)?.label || `Classe : ${classId.toUpperCase()}`}
                                        </h3>
                                        <div className="space-y-3">
                                            {chapters.map(chapter => (
                                                <div key={chapter.id} className="flex items-center justify-between p-3 bg-light-gray/60 rounded-xl border border-border-color/50 transition-shadow hover:shadow-sm">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-2.5 w-2.5 rounded-full ${chapter.isActive ? 'bg-success' : 'bg-secondary'}`} title={chapter.isActive ? 'Actif' : 'Inactif'}></div>
                                                            <p className="text-md font-semibold text-dark-gray truncate">{chapter.chapter}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <label className="relative inline-flex items-center cursor-pointer" title={chapter.isActive ? 'Désactiver' : 'Activer'}>
                                                            <input type="checkbox" checked={chapter.isActive} onChange={() => handleToggle(chapter.id)} className="sr-only peer" />
                                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default AdminModal;

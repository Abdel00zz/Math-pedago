/**
 * ConcoursManager - Gestionnaire professionnel des concours
 * Gère l'index.json, les versions, l'import/export et la synchronisation
 */

import { ConcoursData } from '../types';

export interface ConcoursIndex {
    concours: ConcoursType[];
}

export interface ConcoursType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    examens: ConcoursExamen[];
}

export interface ConcoursExamen {
    annee: string;
    fichiers: ConcoursFile[];
}

export interface ConcoursFile {
    id: string;
    theme: string;
    file: string;
    version?: string;
    lastModified?: string;
}

export class ConcoursManager {
    private dirHandle: FileSystemDirectoryHandle | null = null;
    private index: ConcoursIndex | null = null;

    /**
     * Initialise le gestionnaire avec un handle de répertoire
     */
    async initialize(projectDirHandle: FileSystemDirectoryHandle) {
        this.dirHandle = projectDirHandle;
        await this.loadIndex();
    }

    /**
     * Charge l'index.json depuis public/concours/
     */
    async loadIndex(): Promise<ConcoursIndex | null> {
        if (!this.dirHandle) {
            throw new Error('ConcoursManager not initialized');
        }

        try {
            const publicDir = await this.dirHandle.getDirectoryHandle('public');
            const concoursDir = await publicDir.getDirectoryHandle('concours');
            const indexFile = await concoursDir.getFileHandle('index.json');
            const file = await indexFile.getFile();
            const content = await file.text();
            this.index = JSON.parse(content);
            return this.index;
        } catch (error) {
            console.error('Error loading concours index:', error);
            // Créer un index vide si inexistant
            this.index = {
                concours: [
                    {
                        id: 'medecine',
                        name: 'Médecine',
                        description: 'Préparation au concours de médecine',
                        icon: '',
                        color: '',
                        examens: []
                    },
                    {
                        id: 'ensa',
                        name: 'ENSA',
                        description: 'Préparation au concours de l\'École Nationale des Sciences Appliquées',
                        icon: '',
                        color: '',
                        examens: []
                    },
                    {
                        id: 'ensam',
                        name: 'ENSAM',
                        description: 'Préparation au concours de l\'École Nationale Supérieure d\'Arts et Métiers',
                        icon: '',
                        color: '',
                        examens: []
                    }
                ]
            };
            return this.index;
        }
    }

    /**
     * Sauvegarde l'index.json
     */
    async saveIndex(): Promise<void> {
        if (!this.dirHandle || !this.index) {
            throw new Error('ConcoursManager not initialized or index not loaded');
        }

        try {
            const publicDir = await this.dirHandle.getDirectoryHandle('public', { create: true });
            const concoursDir = await publicDir.getDirectoryHandle('concours', { create: true });
            const indexFile = await concoursDir.getFileHandle('index.json', { create: true });
            const writable = await indexFile.createWritable();
            await writable.write(JSON.stringify(this.index, null, 2));
            await writable.close();
        } catch (error) {
            console.error('Error saving concours index:', error);
            throw error;
        }
    }

    /**
     * Charge un fichier concours depuis public/concours/
     */
    async loadConcoursFile(filePath: string): Promise<ConcoursData | null> {
        if (!this.dirHandle) {
            throw new Error('ConcoursManager not initialized');
        }

        try {
            // Supprimer le '/' initial et 'concours/' du chemin
            const cleanPath = filePath.replace(/^\//, '').replace(/^concours\//, '');
            const pathParts = cleanPath.split('/');

            const publicDir = await this.dirHandle.getDirectoryHandle('public');
            const concoursDir = await publicDir.getDirectoryHandle('concours');

            // Naviguer dans les sous-dossiers
            let currentDir = concoursDir;
            for (let i = 0; i < pathParts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(pathParts[i]);
            }

            const fileName = pathParts[pathParts.length - 1];
            const fileHandle = await currentDir.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const content = await file.text();
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error loading concours file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Sauvegarde un fichier concours dans public/concours/
     */
    async saveConcoursFile(concours: ConcoursData, concoursType: string): Promise<string> {
        if (!this.dirHandle) {
            throw new Error('ConcoursManager not initialized');
        }

        try {
            const publicDir = await this.dirHandle.getDirectoryHandle('public', { create: true });
            const concoursDir = await publicDir.getDirectoryHandle('concours', { create: true });
            const typeDir = await concoursDir.getDirectoryHandle(concoursType, { create: true });

            // Générer le nom de fichier: {annee}-{theme-slug}.json
            const themeSlug = this.slugify(concours.theme);
            const fileName = `${concours.annee}-${themeSlug}.json`;
            const filePath = `/concours/${concoursType}/${fileName}`;

            const fileHandle = await typeDir.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(concours, null, 2));
            await writable.close();

            return filePath;
        } catch (error) {
            console.error('Error saving concours file:', error);
            throw error;
        }
    }

    /**
     * Ajoute ou met à jour un concours dans l'index
     */
    async addOrUpdateConcoursInIndex(
        concours: ConcoursData,
        concoursType: string,
        filePath: string
    ): Promise<void> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            throw new Error('Failed to load index');
        }

        const concoursEntry = this.index.concours.find(c => c.id === concoursType);
        if (!concoursEntry) {
            throw new Error(`Concours type ${concoursType} not found in index`);
        }

        // Chercher ou créer l'année
        let yearEntry = concoursEntry.examens.find(e => e.annee === concours.annee);
        if (!yearEntry) {
            yearEntry = {
                annee: concours.annee,
                fichiers: []
            };
            concoursEntry.examens.push(yearEntry);
            // Trier les années par ordre décroissant
            concoursEntry.examens.sort((a, b) => parseInt(b.annee) - parseInt(a.annee));
        }

        // Chercher ou créer le fichier
        let fileEntry = yearEntry.fichiers.find(f => f.id === concours.id);
        if (!fileEntry) {
            fileEntry = {
                id: concours.id,
                theme: concours.theme,
                file: filePath,
                version: this.generateVersion(),
                lastModified: new Date().toISOString()
            };
            yearEntry.fichiers.push(fileEntry);
        } else {
            // Mettre à jour
            fileEntry.theme = concours.theme;
            fileEntry.file = filePath;
            fileEntry.version = this.generateVersion();
            fileEntry.lastModified = new Date().toISOString();
        }

        await this.saveIndex();
    }

    /**
     * Supprime un concours de l'index
     */
    async removeConcoursFromIndex(concoursId: string, concoursType: string): Promise<void> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            throw new Error('Failed to load index');
        }

        const concoursEntry = this.index.concours.find(c => c.id === concoursType);
        if (!concoursEntry) {
            return;
        }

        for (const yearEntry of concoursEntry.examens) {
            yearEntry.fichiers = yearEntry.fichiers.filter(f => f.id !== concoursId);
        }

        // Supprimer les années vides
        concoursEntry.examens = concoursEntry.examens.filter(e => e.fichiers.length > 0);

        await this.saveIndex();
    }

    /**
     * Liste tous les concours disponibles
     */
    async listAllConcours(): Promise<ConcoursFile[]> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            return [];
        }

        const allFiles: ConcoursFile[] = [];
        for (const concoursType of this.index.concours) {
            for (const year of concoursType.examens) {
                allFiles.push(...year.fichiers);
            }
        }

        return allFiles;
    }

    /**
     * Récupère tous les concours d'une année spécifique
     */
    async getConcoursForYear(concoursType: string, year: string): Promise<ConcoursFile[]> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            return [];
        }

        const concoursEntry = this.index.concours.find(c => c.id === concoursType);
        if (!concoursEntry) {
            return [];
        }

        const yearEntry = concoursEntry.examens.find(e => e.annee === year);
        return yearEntry ? yearEntry.fichiers : [];
    }

    /**
     * Importe un concours depuis un fichier JSON
     */
    async importConcours(fileContent: string, concoursType: string): Promise<void> {
        const concours: ConcoursData = JSON.parse(fileContent);

        // Valider le concours
        if (!concours.id || !concours.concours || !concours.annee || !concours.theme) {
            throw new Error('Invalid concours data: missing required fields');
        }

        // Sauvegarder le fichier
        const filePath = await this.saveConcoursFile(concours, concoursType);

        // Mettre à jour l'index
        await this.addOrUpdateConcoursInIndex(concours, concoursType, filePath);
    }

    /**
     * Exporte un concours vers JSON
     */
    async exportConcours(concoursId: string): Promise<string> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            throw new Error('Index not loaded');
        }

        // Trouver le fichier dans l'index
        let filePath: string | null = null;
        for (const concoursType of this.index.concours) {
            for (const year of concoursType.examens) {
                const file = year.fichiers.find(f => f.id === concoursId);
                if (file) {
                    filePath = file.file;
                    break;
                }
            }
            if (filePath) break;
        }

        if (!filePath) {
            throw new Error(`Concours ${concoursId} not found in index`);
        }

        const concours = await this.loadConcoursFile(filePath);
        if (!concours) {
            throw new Error(`Failed to load concours file ${filePath}`);
        }

        return JSON.stringify(concours, null, 2);
    }

    /**
     * Génère un slug à partir d'un texte
     */
    private slugify(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par -
            .replace(/^-+|-+$/g, ''); // Supprimer les - au début et à la fin
    }

    /**
     * Génère une version basée sur la date
     */
    private generateVersion(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        return `v${year}.${month}.${day}-${hour}${minute}`;
    }

    /**
     * Récupère les statistiques globales
     */
    async getStatistics(): Promise<{
        totalConcours: number;
        byType: Record<string, number>;
        byYear: Record<string, number>;
    }> {
        if (!this.index) {
            await this.loadIndex();
        }

        if (!this.index) {
            return { totalConcours: 0, byType: {}, byYear: {} };
        }

        const stats = {
            totalConcours: 0,
            byType: {} as Record<string, number>,
            byYear: {} as Record<string, number>
        };

        for (const concoursType of this.index.concours) {
            stats.byType[concoursType.id] = 0;

            for (const year of concoursType.examens) {
                const count = year.fichiers.length;
                stats.totalConcours += count;
                stats.byType[concoursType.id] += count;
                stats.byYear[year.annee] = (stats.byYear[year.annee] || 0) + count;
            }
        }

        return stats;
    }
}

// Instance singleton
export const concoursManager = new ConcoursManager();

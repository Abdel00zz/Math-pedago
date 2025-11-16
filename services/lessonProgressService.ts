import type { LessonElementPath } from '../types';
import { storageService, STORAGE_KEYS } from './StorageService';

export interface LessonNodeState {
    completed: boolean;
    timestamp: number;
}

export type LessonProgressRecord = Record<string, LessonNodeState>;

interface StoredLessonProgress {
    [lessonId: string]: LessonProgressRecord;
}

interface LessonProgressMeta {
    lastSectionId?: string;
    lastSubsectionId?: string;
    updatedAt?: number;
}

interface StoredLessonMeta {
    [lessonId: string]: LessonProgressMeta;
}

const LEGACY_STORAGE_KEY = 'pedago.lessonProgress.v1';
const LEGACY_META_STORAGE_KEY = 'pedago.lessonProgressMeta.v1';
const LESSON_STORAGE_VERSION = '2.0.0';
const LESSON_META_VERSION = '1.0.0';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export class LessonProgressService {
    private readMetaStorage(): StoredLessonMeta {
        const storedMeta = storageService.getWithVersion<StoredLessonMeta>(
            STORAGE_KEYS.LESSON_META,
            LESSON_META_VERSION,
            {}
        );

        if (storedMeta) {
            return storedMeta;
        }

        if (!isBrowser) {
            return {};
        }

        const legacyRaw = window.localStorage.getItem(LEGACY_META_STORAGE_KEY);
        if (!legacyRaw) {
            return {};
        }

        try {
            const parsed = JSON.parse(legacyRaw) as StoredLessonMeta;
            const saved = storageService.set(STORAGE_KEYS.LESSON_META, parsed, { version: LESSON_META_VERSION });
            if (saved) {
                window.localStorage.removeItem(LEGACY_META_STORAGE_KEY);
            }
            return parsed;
        } catch (error) {
            console.warn('[LessonProgressService] Impossible de parser les métadonnées de leçon:', error);
            return {};
        }
    }

    private writeMetaStorage(data: StoredLessonMeta) {
        const saved = storageService.set(STORAGE_KEYS.LESSON_META, data, { version: LESSON_META_VERSION });

        if (!saved && isBrowser) {
            try {
                window.localStorage.setItem(LEGACY_META_STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.warn('[LessonProgressService] Impossible d\'enregistrer les métadonnées de leçon:', error);
            }
            return;
        }

        if (saved && isBrowser) {
            window.localStorage.removeItem(LEGACY_META_STORAGE_KEY);
        }
    }

    private readStorage(): StoredLessonProgress {
        const storedProgress = storageService.getWithVersion<StoredLessonProgress>(
            STORAGE_KEYS.LESSONS,
            LESSON_STORAGE_VERSION,
            {}
        );

        if (storedProgress) {
            return storedProgress;
        }

        if (!isBrowser) {
            return {};
        }

        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!legacyRaw) {
            return {};
        }

        try {
            const parsed = JSON.parse(legacyRaw) as StoredLessonProgress;
            const saved = storageService.set(STORAGE_KEYS.LESSONS, parsed, { version: LESSON_STORAGE_VERSION });
            if (saved) {
                window.localStorage.removeItem(LEGACY_STORAGE_KEY);
            }
            return parsed;
        } catch (error) {
            console.warn('[LessonProgressService] Impossible de parser la donnée locale:', error);
            return {};
        }
    }

    private writeStorage(data: StoredLessonProgress) {
        const saved = storageService.set(STORAGE_KEYS.LESSONS, data, { version: LESSON_STORAGE_VERSION });

        if (!saved && isBrowser) {
            try {
                window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.warn('[LessonProgressService] Impossible de sérialiser la donnée locale:', error);
            }
            return;
        }

        if (saved && isBrowser) {
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
    }

    getLastVisited(lessonId: string): LessonProgressMeta | undefined {
        const storage = this.readMetaStorage();
        return storage[lessonId];
    }

    setLastVisited(lessonId: string, meta: LessonProgressMeta) {
        if (!isBrowser) {
            return;
        }

        const storage = this.readMetaStorage();

        if (!meta.lastSectionId && !meta.lastSubsectionId) {
            if (storage[lessonId]) {
                delete storage[lessonId];
                this.writeMetaStorage(storage);
            }
            return;
        }

        storage[lessonId] = {
            ...storage[lessonId],
            ...meta,
            updatedAt: Date.now(),
        };

        this.writeMetaStorage(storage);
    }

    getLessonProgress(lessonId: string): LessonProgressRecord {
        const storage = this.readStorage();
        return storage[lessonId] ?? {};
    }

    ensureLessonNodes(lessonId: string, nodeIds: string[]): LessonProgressRecord {
        const storage = this.readStorage();
        const existing = storage[lessonId] ?? {};

        // Créer un Set des nodeIds valides pour recherche rapide
        const validNodeIds = new Set(nodeIds);
        
        // Nettoyer les anciens nodes qui n'existent plus dans le JSON
        const cleaned: LessonProgressRecord = {};
        let mutated = false;
        
        // Conserver seulement les nodes qui existent encore dans le JSON
        Object.keys(existing).forEach((nodeId) => {
            if (validNodeIds.has(nodeId)) {
                cleaned[nodeId] = existing[nodeId];
            } else {
                // Node obsolète détecté
                mutated = true;
            }
        });

        // Ajouter les nouveaux nodes
        nodeIds.forEach((nodeId) => {
            if (!cleaned[nodeId]) {
                cleaned[nodeId] = {
                    completed: false,
                    timestamp: Date.now(),
                };
                mutated = true;
            }
        });

        if (mutated) {
            storage[lessonId] = cleaned;
            this.writeStorage(storage);
        }

        return cleaned;
    }

    saveLessonProgress(lessonId: string, progress: LessonProgressRecord) {
        const storage = this.readStorage();
        storage[lessonId] = progress;
        this.writeStorage(storage);
    }

    markNode(lessonId: string, nodeId: string, completed: boolean): LessonProgressRecord {
        const storage = this.readStorage();
        const lessonProgress = storage[lessonId] ?? {};

        lessonProgress[nodeId] = {
            completed,
            timestamp: Date.now(),
        };

        storage[lessonId] = lessonProgress;
        this.writeStorage(storage);
        return lessonProgress;
    }

    toggleNode(lessonId: string, nodeId: string): LessonProgressRecord {
        const storage = this.readStorage();
        const lessonProgress = storage[lessonId] ?? {};
        const current = lessonProgress[nodeId]?.completed ?? false;
        return this.markNode(lessonId, nodeId, !current);
    }

    clearLesson(lessonId: string) {
        const storage = this.readStorage();
        if (storage[lessonId]) {
            delete storage[lessonId];
            this.writeStorage(storage);
        }

        const metaStorage = this.readMetaStorage();
        if (metaStorage[lessonId]) {
            delete metaStorage[lessonId];
            this.writeMetaStorage(metaStorage);
        }
    }
}

export const encodeLessonPath = (path: LessonElementPath): string => {
    return path.map((segment) => String(segment)).join('.');
};

export const lessonProgressService = new LessonProgressService();

import type { LessonElementPath } from '../types';

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

const STORAGE_KEY = 'pedago.lessonProgress.v1';
const META_STORAGE_KEY = 'pedago.lessonProgressMeta.v1';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeParse = (value: string | null): StoredLessonProgress => {
    if (!value) return {};
    try {
        return JSON.parse(value) as StoredLessonProgress;
    } catch (error) {
        console.warn('[LessonProgressService] Impossible de parser la donnée locale:', error);
        return {};
    }
};

const safeStringify = (value: StoredLessonProgress): string => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.warn('[LessonProgressService] Impossible de sérialiser la donnée locale:', error);
        return '{}';
    }
};

export class LessonProgressService {
    private readMetaStorage(): StoredLessonMeta {
        if (!isBrowser) {
            return {};
        }

        const raw = window.localStorage.getItem(META_STORAGE_KEY);
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw) as StoredLessonMeta;
        } catch (error) {
            console.warn('[LessonProgressService] Impossible de parser les métadonnées de leçon:', error);
            return {};
        }
    }

    private writeMetaStorage(data: StoredLessonMeta) {
        if (!isBrowser) {
            return;
        }

        try {
            window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('[LessonProgressService] Impossible d\'enregistrer les métadonnées de leçon:', error);
        }
    }

    private readStorage(): StoredLessonProgress {
        if (!isBrowser) {
            return {};
        }

        const raw = window.localStorage.getItem(STORAGE_KEY);
        return safeParse(raw);
    }

    private writeStorage(data: StoredLessonProgress) {
        if (!isBrowser) {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, safeStringify(data));
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

        let mutated = false;
        nodeIds.forEach((nodeId) => {
            if (!existing[nodeId]) {
                existing[nodeId] = {
                    completed: false,
                    timestamp: Date.now(),
                };
                mutated = true;
            }
        });

        if (mutated) {
            storage[lessonId] = existing;
            this.writeStorage(storage);
        }

        return existing;
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

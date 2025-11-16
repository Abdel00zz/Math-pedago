/**
 * Service dédié à la persistance de l'état des blancs révélés
 */

import { storageService, STORAGE_KEYS } from './StorageService';

const STORAGE_VERSION = '1.0.0';

type BlankRevealPerLesson = Record<string, boolean>;
interface BlankRevealStorage {
    [lessonId: string]: BlankRevealPerLesson;
}

const getDefaultStorage = (): BlankRevealStorage => ({});

class BlankRevealService {
    private readStorage(): BlankRevealStorage {
        return storageService.getWithVersion<BlankRevealStorage>(
            STORAGE_KEYS.LESSON_BLANKS,
            STORAGE_VERSION,
            getDefaultStorage()
        ) || getDefaultStorage();
    }

    private writeStorage(storage: BlankRevealStorage) {
        storageService.set(STORAGE_KEYS.LESSON_BLANKS, storage, { version: STORAGE_VERSION });
    }

    getLessonState(lessonId: string): BlankRevealPerLesson {
        const storage = this.readStorage();
        return storage[lessonId] ?? {};
    }

    getRevealedBlankIds(lessonId: string): string[] {
        const lessonState = this.getLessonState(lessonId);
        return Object.entries(lessonState)
            .filter(([, isRevealed]) => isRevealed)
            .map(([blankId]) => blankId);
    }

    setBlankReveal(lessonId: string, blankId: string, revealed: boolean) {
        if (!lessonId || !blankId) {
            return;
        }

        const storage = this.readStorage();
        const lessonState = { ...(storage[lessonId] ?? {}) };

        if (revealed) {
            if (lessonState[blankId]) {
                return;
            }
            lessonState[blankId] = true;
        } else {
            if (!lessonState[blankId]) {
                return;
            }
            delete lessonState[blankId];
        }

        storage[lessonId] = lessonState;
        this.writeStorage(storage);
    }

    clearLesson(lessonId: string) {
        const storage = this.readStorage();
        if (storage[lessonId]) {
            delete storage[lessonId];
            this.writeStorage(storage);
        }
    }
}

export const blankRevealService = new BlankRevealService();

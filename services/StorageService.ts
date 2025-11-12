/**
 * Service Centralisé de Gestion du localStorage
 *
 * Ce service fournit une interface unifiée pour tous les accès au localStorage,
 * avec gestion du versioning, des migrations, du cache et des erreurs de quota.
 *
 * @version 1.0.0
 * @author Math-pedago
 */

// Types
export interface StorageConfig {
  compress?: boolean;
  ttl?: number; // Time to live en millisecondes
  version?: string;
}

export interface CachedData<T = any> {
  data: T;
  version: string;
  timestamp: number;
  expiresAt: number | null;
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  quotaUsagePercent: number;
}

// Constantes
const STORAGE_KEYS = {
  APP_STATE: 'math-pedago:app:v5.0',
  LESSONS: 'math-pedago:lessons:v2.0',
  LESSON_CACHE: 'math-pedago:lesson-cache:v1.0',
  CONCOURS: 'math-pedago:concours:v1.0',
  UI_CACHE: 'math-pedago:ui-cache:v1.0',
  PENDING: 'math-pedago:pending:v1.0',
  MIGRATIONS: 'math-pedago:migrations:v1.0',
} as const;

const OLD_KEYS_TO_MIGRATE = [
  'pedagoEleveData_V4.7_React',
  'pedagoEleveData_V4.6_React',
  'pedago.lessonProgress.v1',
  'pedago.lessonProgressMeta.v1',
];

const QUOTA_WARNING_THRESHOLD = 0.8; // 80%
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB (limite approximative localStorage)

/**
 * Service de gestion du localStorage avec fonctionnalités avancées
 */
class StorageService {
  private isBrowser: boolean;
  private quotaWarningShown: boolean = false;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // ==================== MÉTHODES PUBLIQUES ====================

  /**
   * Récupère une donnée du localStorage avec gestion du cache
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    if (!this.isBrowser) return defaultValue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;

      const cached: CachedData<T> = JSON.parse(raw);

      // Vérifier l'expiration
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        this.remove(key);
        return defaultValue;
      }

      return cached.data;
    } catch (error) {
      console.error(`[StorageService] Erreur lecture clé "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Sauvegarde une donnée dans le localStorage avec versioning
   */
  set<T = any>(key: string, data: T, config: StorageConfig = {}): boolean {
    if (!this.isBrowser) return false;

    try {
      const cached: CachedData<T> = {
        data,
        version: config.version || '1.0.0',
        timestamp: Date.now(),
        expiresAt: config.ttl ? Date.now() + config.ttl : null,
      };

      const serialized = JSON.stringify(cached);

      // Vérifier le quota avant de sauvegarder
      if (!this.checkQuota(serialized.length)) {
        console.warn('[StorageService] Quota localStorage proche de la limite');
        this.handleQuotaWarning();
        // Tenter un nettoyage automatique
        this.cleanup();
        // Réessayer
        if (!this.checkQuota(serialized.length)) {
          throw new Error('localStorage quota exceeded');
        }
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[StorageService] Erreur sauvegarde clé "${key}":`, error);

      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }

      return false;
    }
  }

  /**
   * Supprime une clé du localStorage
   */
  remove(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Erreur suppression clé "${key}":`, error);
    }
  }

  /**
   * Vérifie si une donnée existe et est valide
   */
  has(key: string): boolean {
    if (!this.isBrowser) return false;
    const data = this.get(key);
    return data !== undefined;
  }

  /**
   * Récupère une donnée avec vérification de version
   */
  getWithVersion<T = any>(key: string, expectedVersion: string, defaultValue?: T): T | undefined {
    if (!this.isBrowser) return defaultValue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;

      const cached: CachedData<T> = JSON.parse(raw);

      // Vérifier la version
      if (cached.version !== expectedVersion) {
        console.log(`[StorageService] Version mismatch pour "${key}": ${cached.version} vs ${expectedVersion}`);
        this.remove(key);
        return defaultValue;
      }

      // Vérifier l'expiration
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        this.remove(key);
        return defaultValue;
      }

      return cached.data;
    } catch (error) {
      console.error(`[StorageService] Erreur lecture avec version clé "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Cache une leçon avec sa version
   */
  cacheLessonContent(chapterId: string, lessonData: any, version: string): void {
    const cacheKey = `${STORAGE_KEYS.LESSON_CACHE}:${chapterId}`;
    this.set(cacheKey, lessonData, {
      version,
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
  }

  /**
   * Récupère une leçon du cache si la version correspond
   */
  getCachedLesson(chapterId: string, expectedVersion: string): any | null {
    const cacheKey = `${STORAGE_KEYS.LESSON_CACHE}:${chapterId}`;
    return this.getWithVersion(cacheKey, expectedVersion, null);
  }

  /**
   * Invalide le cache d'une leçon
   */
  invalidateLessonCache(chapterId: string): void {
    const cacheKey = `${STORAGE_KEYS.LESSON_CACHE}:${chapterId}`;
    this.remove(cacheKey);
  }

  /**
   * Invalide tous les caches de leçons
   */
  invalidateAllLessonCaches(): void {
    if (!this.isBrowser) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.LESSON_CACHE)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.remove(key));
    console.log(`[StorageService] ${keysToRemove.length} caches de leçons invalidés`);
  }

  /**
   * Nettoie les données expirées et anciennes
   */
  cleanup(): number {
    if (!this.isBrowser) return 0;

    let cleaned = 0;
    const now = Date.now();
    const keysToRemove: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Supprimer les anciennes clés à migrer
        if (OLD_KEYS_TO_MIGRATE.includes(key)) {
          keysToRemove.push(key);
          continue;
        }

        // Supprimer les données expirées
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const cached: CachedData = JSON.parse(raw);
            if (cached.expiresAt && now > cached.expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Données corrompues, supprimer
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        this.remove(key);
        cleaned++;
      });

      if (cleaned > 0) {
        console.log(`[StorageService] ${cleaned} entrées nettoyées`);
      }

      return cleaned;
    } catch (error) {
      console.error('[StorageService] Erreur lors du nettoyage:', error);
      return cleaned;
    }
  }

  /**
   * Migre les données des anciennes versions
   */
  migrate(): void {
    if (!this.isBrowser) return;

    console.log('[StorageService] Démarrage de la migration...');

    // Vérifier si migration déjà effectuée
    const migrated = this.get<boolean>(`${STORAGE_KEYS.MIGRATIONS}:v5.0-done`);
    if (migrated) {
      console.log('[StorageService] Migration déjà effectuée');
      return;
    }

    try {
      // Migrer pedagoEleveData_V4.7_React → math-pedago:app:v5.0
      const oldAppData = localStorage.getItem('pedagoEleveData_V4.7_React');
      if (oldAppData) {
        try {
          const parsed = JSON.parse(oldAppData);
          this.set(STORAGE_KEYS.APP_STATE, parsed, { version: '5.0.0' });
          console.log('[StorageService] Données app migrées');
        } catch (error) {
          console.error('[StorageService] Erreur migration app:', error);
        }
      }

      // Migrer pedago.lessonProgress.v1 → math-pedago:lessons:v2.0
      const oldLessons = localStorage.getItem('pedago.lessonProgress.v1');
      if (oldLessons) {
        try {
          const parsed = JSON.parse(oldLessons);
          this.set(STORAGE_KEYS.LESSONS, parsed, { version: '2.0.0' });
          console.log('[StorageService] Données leçons migrées');
        } catch (error) {
          console.error('[StorageService] Erreur migration leçons:', error);
        }
      }

      // Marquer la migration comme effectuée
      this.set(`${STORAGE_KEYS.MIGRATIONS}:v5.0-done`, true);

      // Nettoyer les anciennes clés
      this.cleanup();

      console.log('[StorageService] Migration terminée avec succès');
    } catch (error) {
      console.error('[StorageService] Erreur lors de la migration:', error);
    }
  }

  /**
   * Obtient des statistiques sur l'utilisation du localStorage
   */
  getStats(): StorageStats {
    if (!this.isBrowser) {
      return { totalSize: 0, itemCount: 0, quotaUsagePercent: 0 };
    }

    let totalSize = 0;
    let itemCount = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
            itemCount++;
          }
        }
      }

      const quotaUsagePercent = (totalSize / MAX_STORAGE_SIZE) * 100;

      return {
        totalSize,
        itemCount,
        quotaUsagePercent: Math.min(quotaUsagePercent, 100),
      };
    } catch (error) {
      console.error('[StorageService] Erreur calcul stats:', error);
      return { totalSize: 0, itemCount: 0, quotaUsagePercent: 0 };
    }
  }

  /**
   * Vide complètement le localStorage (avec confirmation)
   */
  clear(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.clear();
      console.log('[StorageService] localStorage vidé');
    } catch (error) {
      console.error('[StorageService] Erreur lors du vidage:', error);
    }
  }

  /**
   * Exporte toutes les données du localStorage
   */
  export(): Record<string, any> {
    if (!this.isBrowser) return {};

    const exported: Record<string, any> = {};

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              exported[key] = JSON.parse(value);
            } catch {
              exported[key] = value;
            }
          }
        }
      }
    } catch (error) {
      console.error('[StorageService] Erreur lors de l\'export:', error);
    }

    return exported;
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Vérifie si le quota est suffisant pour sauvegarder
   */
  private checkQuota(additionalSize: number): boolean {
    const stats = this.getStats();
    const projectedSize = stats.totalSize + additionalSize;
    const projectedUsage = (projectedSize / MAX_STORAGE_SIZE) * 100;

    return projectedUsage < 100;
  }

  /**
   * Gère l'avertissement de quota proche de la limite
   */
  private handleQuotaWarning(): void {
    if (this.quotaWarningShown) return;

    const stats = this.getStats();
    if (stats.quotaUsagePercent >= QUOTA_WARNING_THRESHOLD * 100) {
      console.warn(`[StorageService] ⚠️ localStorage à ${stats.quotaUsagePercent.toFixed(1)}% de capacité`);

      // Dispatch un événement pour notifier l'UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storage-quota-warning', {
          detail: {
            usage: stats.quotaUsagePercent,
            size: stats.totalSize,
            limit: MAX_STORAGE_SIZE
          }
        }));
      }

      this.quotaWarningShown = true;
    }
  }

  /**
   * Gère le dépassement de quota
   */
  private handleQuotaExceeded(): void {
    console.error('[StorageService] ❌ localStorage quota dépassé');

    // Dispatch un événement pour notifier l'UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
    }

    // Tenter un nettoyage agressif
    const cleaned = this.cleanup();
    console.log(`[StorageService] ${cleaned} entrées supprimées lors du nettoyage d'urgence`);
  }
}

// Export singleton
export const storageService = new StorageService();

// Export des clés pour usage externe
export { STORAGE_KEYS };

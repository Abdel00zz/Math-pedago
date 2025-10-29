import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Configuration pour le hook useMathJax
 */
interface MathJaxConfig {
  /**
   * Délai avant le rendu (en ms) pour éviter les rendus multiples
   * @default 100
   */
  delay?: number;
  
  /**
   * Identifiant unique pour le conteneur (optionnel)
   * Si fourni, seul ce conteneur sera rendu
   */
  containerId?: string;
  
  /**
   * Callback après le rendu réussi
   */
  onSuccess?: () => void;
  
  /**
   * Callback en cas d'erreur
   */
  onError?: (error: Error) => void;

  /**
   * Mode debug pour afficher les logs détaillés
   * @default false
   */
  debug?: boolean;

  /**
   * Nettoyer le cache MathJax avant le rendu
   * @default true
   */
  clearCache?: boolean;
}

/**
 * Statistiques de rendu MathJax
 */
interface MathJaxStats {
  renderCount: number;
  totalDuration: number;
  averageDuration: number;
  lastDuration: number;
  lastRenderTime: number;
  errors: number;
}

/**
 * Hook personnalisé pour gérer le rendu MathJax de manière optimale
 * 
 * Fonctionnalités :
 * - Debouncing intelligent pour éviter les rendus multiples
 * - Support du rendu ciblé par conteneur
 * - Nettoyage automatique du cache MathJax
 * - Callbacks de succès et d'erreur
 * - Statistiques de performance
 * - Mode debug détaillé
 * 
 * @param dependencies - Tableau de dépendances qui déclenchent le re-rendu
 * @param config - Configuration optionnelle
 * 
 * @example
 * ```tsx
 * const MyComponent = ({ content, data }) => {
 *   const stats = useMathJax([content, data], { 
 *     delay: 150,
 *     containerId: 'math-content',
 *     debug: true
 *   });
 *   
 *   return (
 *     <div id="math-content">
 *       {content}
 *       <p>Rendus: {stats.renderCount}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useMathJax = (
  dependencies: any[] = [],
  config: MathJaxConfig = {}
): MathJaxStats => {
  const {
    delay = 100,
    containerId,
    onSuccess,
    onError,
    debug = false,
    clearCache = true
  } = config;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState<MathJaxStats>({
    renderCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
    lastRenderTime: 0,
    errors: 0
  });

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[MathJax Hook] ${message}`, ...args);
    }
  }, [debug]);

  useEffect(() => {
    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      log('⏸️ Timeout précédent annulé');
    }

    // Vérifier que MathJax est chargé
    if (!window.MathJax?.typesetPromise) {
      console.warn('[MathJax Hook] ⚠️ MathJax n\'est pas encore chargé');
      return;
    }

    log('⏳ Planification du rendu dans', delay, 'ms');

    // Délai avant le rendu pour éviter les appels multiples (debouncing)
    timeoutRef.current = setTimeout(() => {
      const startTime = performance.now();
      const renderTime = Date.now();
      
      log('🚀 Début du rendu MathJax');

      // Déterminer le conteneur à renderer
      let container: HTMLElement | undefined;
      if (containerId) {
        container = document.getElementById(containerId) || undefined;
        if (!container) {
          console.warn(`[MathJax Hook] ⚠️ Conteneur "${containerId}" introuvable`);
        } else {
          log('📦 Rendu ciblé sur conteneur:', containerId);
        }
      } else {
        log('🌐 Rendu du document entier');
      }

      // Nettoyer le cache MathJax pour le conteneur
      if (clearCache && container && window.MathJax?.typesetClear) {
        try {
          window.MathJax.typesetClear([container]);
          log('🧹 Cache MathJax nettoyé');
        } catch (err) {
          console.warn('[MathJax Hook] Erreur lors du nettoyage du cache:', err);
        }
      }

      // Effectuer le rendu
      const elements = container ? [container] : undefined;
      
      window.MathJax.typesetPromise(elements)
        .then(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          setStats(prev => {
            const newRenderCount = prev.renderCount + 1;
            const newTotalDuration = prev.totalDuration + duration;
            
            return {
              renderCount: newRenderCount,
              totalDuration: newTotalDuration,
              averageDuration: newTotalDuration / newRenderCount,
              lastDuration: duration,
              lastRenderTime: renderTime,
              errors: prev.errors
            };
          });

          log(
            `✅ Rendu terminé en ${duration.toFixed(2)}ms`,
            containerId ? `(conteneur: ${containerId})` : '(document entier)'
          );
          
          onSuccess?.();
        })
        .catch((error: Error) => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          setStats(prev => ({
            ...prev,
            lastDuration: duration,
            lastRenderTime: renderTime,
            errors: prev.errors + 1
          }));

          console.error('[MathJax Hook] ❌ Erreur lors du rendu:', error);
          log('💥 Erreur après', duration.toFixed(2), 'ms');
          
          onError?.(error);
        });
    }, delay);

    // Cleanup : annuler le timeout si le composant est démonté
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        log('🧹 Cleanup: timeout annulé');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return stats;
};

/**
 * Hook pour forcer un re-rendu MathJax manuel
 * 
 * Utile pour déclencher le rendu après une action utilisateur
 * ou un changement dynamique qui n'est pas dans les dépendances
 * 
 * @param config - Configuration optionnelle
 * @returns Fonction pour déclencher le rendu
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const triggerMathJax = useMathJaxTrigger({ debug: true });
 *   
 *   const handleContentUpdate = async () => {
 *     setContent(newContent);
 *     
 *     // Forcer le rendu immédiatement
 *     await triggerMathJax('math-content');
 *     console.log('Formules rendues!');
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleContentUpdate}>Mettre à jour</button>
 *       <div id="math-content">{content}</div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useMathJaxTrigger = (config: Pick<MathJaxConfig, 'debug' | 'clearCache'> = {}) => {
  const { debug = false, clearCache = true } = config;

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[MathJax Trigger] ${message}`, ...args);
    }
  }, [debug]);

  return useCallback((containerId?: string) => {
    if (!window.MathJax?.typesetPromise) {
      console.warn('[MathJax Trigger] ⚠️ MathJax n\'est pas chargé');
      return Promise.reject(new Error('MathJax not loaded'));
    }

    log('🚀 Déclenchement manuel du rendu');

    const startTime = performance.now();
    let container: HTMLElement | undefined;

    if (containerId) {
      container = document.getElementById(containerId) || undefined;
      if (!container) {
        console.warn(`[MathJax Trigger] ⚠️ Conteneur "${containerId}" introuvable`);
      } else {
        log('📦 Cible:', containerId);
      }
    }

    // Nettoyer le cache
    if (clearCache && container && window.MathJax?.typesetClear) {
      try {
        window.MathJax.typesetClear([container]);
        log('🧹 Cache nettoyé');
      } catch (err) {
        console.warn('[MathJax Trigger] Erreur nettoyage cache:', err);
      }
    }

    const elements = container ? [container] : undefined;

    return window.MathJax.typesetPromise(elements)
      .then(() => {
        const duration = performance.now() - startTime;
        log(`✅ Rendu terminé en ${duration.toFixed(2)}ms`);
      })
      .catch((error: Error) => {
        const duration = performance.now() - startTime;
        console.error('[MathJax Trigger] ❌ Erreur après', duration.toFixed(2), 'ms:', error);
        throw error;
      });
  }, [log, clearCache]);
};

/**
 * Hook pour vérifier si MathJax est prêt
 * 
 * Utile pour afficher un loader pendant le chargement de MathJax
 * ou conditionner le rendu de contenu mathématique
 * 
 * @param config - Configuration optionnelle
 * @returns true si MathJax est chargé et prêt, false sinon
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isReady = useMathJaxReady({ debug: true });
 *   
 *   if (!isReady) {
 *     return <div className="loading">Chargement de MathJax...</div>;
 *   }
 *   
 *   return <div>$E = mc^2$</div>;
 * };
 * ```
 */
export const useMathJaxReady = (config: Pick<MathJaxConfig, 'debug'> = {}): boolean => {
  const { debug = false } = config;
  const [isReady, setIsReady] = useState(false);
  const checkCountRef = useRef(0);

  useEffect(() => {
    const checkMathJax = () => {
      checkCountRef.current++;
      
      if (window.MathJax?.typesetPromise) {
        if (debug) {
          console.log(`[MathJax Ready] ✅ MathJax prêt (après ${checkCountRef.current} vérifications)`);
        }
        setIsReady(true);
      } else {
        if (debug && checkCountRef.current === 1) {
          console.log('[MathJax Ready] ⏳ Attente de MathJax...');
        }
        setTimeout(checkMathJax, 100);
      }
    };

    checkMathJax();
  }, [debug]);

  return isReady;
};

/**
 * Hook avancé avec état de chargement et gestion d'erreurs
 * 
 * Combine plusieurs fonctionnalités pour une gestion complète
 * 
 * @param dependencies - Dépendances pour le rendu
 * @param config - Configuration complète
 * @returns État complet avec statistiques, ready, loading, error
 * 
 * @example
 * ```tsx
 * const MyComponent = ({ content }) => {
 *   const { stats, isReady, isLoading, error } = useMathJaxAdvanced(
 *     [content],
 *     { 
 *       delay: 150, 
 *       debug: true,
 *       onSuccess: () => console.log('Succès!'),
 *       onError: (err) => console.error('Erreur:', err)
 *     }
 *   );
 *   
 *   if (!isReady) return <div>Initialisation MathJax...</div>;
 *   if (isLoading) return <div>Rendu en cours...</div>;
 *   if (error) return <div>Erreur: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       {content}
 *       <p>Rendus: {stats.renderCount}, Moyenne: {stats.averageDuration.toFixed(2)}ms</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useMathJaxAdvanced = (
  dependencies: any[] = [],
  config: MathJaxConfig = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isReady = useMathJaxReady({ debug: config.debug });

  const wrappedConfig: MathJaxConfig = {
    ...config,
    onSuccess: () => {
      setIsLoading(false);
      setError(null);
      config.onSuccess?.();
    },
    onError: (err) => {
      setIsLoading(false);
      setError(err);
      config.onError?.(err);
    }
  };

  useEffect(() => {
    if (isReady) {
      setIsLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const stats = useMathJax(dependencies, wrappedConfig);

  return {
    stats,
    isReady,
    isLoading,
    error
  };
};

/**
 * Déclaration TypeScript pour window.MathJax v4
 */
declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements: HTMLElement[]) => void;
      startup?: {
        promise?: Promise<void>;
      };
      tex2chtmlPromise?: (math: string, options?: any) => Promise<HTMLElement>;
      tex2svgPromise?: (math: string, options?: any) => Promise<HTMLElement>;
      tex2chtml?: (math: string, options?: any) => HTMLElement;
      tex2svg?: (math: string, options?: any) => HTMLElement;
    };
  }
}

export default useMathJax;

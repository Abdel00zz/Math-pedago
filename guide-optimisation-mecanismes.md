# Guide d'Optimisation des Mécanismes Critiques
## Plateforme Maths Mind - Performance et Fiabilité
### Version 1.0 - Document Technique

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Gestion d'État Optimisée](#gestion-détat-optimisée)
3. [Performance de Rendu](#performance-de-rendu)
4. [Gestion du Cache et Persistance](#gestion-du-cache-et-persistance)
5. [Optimisation des Quiz](#optimisation-des-quiz)
6. [Système de Progression](#système-de-progression)
7. [Gestion des Erreurs](#gestion-des-erreurs)
8. [Chargement des Données](#chargement-des-données)
9. [Optimisation Mobile](#optimisation-mobile)
10. [Métriques et Monitoring](#métriques-et-monitoring)

---

## 🎯 1. Vue d'Ensemble

### Mécanismes Critiques Identifiés

```markdown
PRIORITÉ HAUTE:
1. Système de sauvegarde automatique
2. Validation et soumission des quiz
3. Tracking de progression en temps réel
4. Gestion de session utilisateur
5. Synchronisation des données

PRIORITÉ MOYENNE:
1. Chargement des exercices
2. Rendu des formules mathématiques
3. Navigation entre activités
4. Système de notifications
5. Export des résultats
```

### Objectifs de Performance

```markdown
Core Web Vitals Cibles:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.5s
- Bundle Size: < 200KB (JS principal)
```

---

## 🔄 2. Gestion d'État Optimisée

### Architecture Redux Optimisée

```typescript
// store/index.ts - Configuration optimisée
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Configuration de persistence sélective
const persistConfig = {
  key: 'mathsmind-root',
  storage,
  whitelist: ['user', 'progress'], // Ne persister que l'essentiel
  blacklist: ['ui', 'temp'],
  throttle: 1000, // Limiter les écritures
};

// Middleware de performance
const performanceMiddleware = store => next => action => {
  const start = performance.now();
  const result = next(action);
  const duration = performance.now() - start;
  
  if (duration > 16) { // Plus qu'une frame (16ms)
    console.warn(`Action lente: ${action.type} (${duration.toFixed(2)}ms)`);
  }
  
  return result;
};

// Store avec optimisations
export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        warnAfter: 100, // Alerter si action > 100ms
      },
      immutableCheck: {
        warnAfter: 100,
      },
    }).concat(performanceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});
```

### Context API avec Mémorisation

```typescript
// contexts/AppContext.tsx - Version optimisée
import React, { createContext, useReducer, useMemo, useCallback } from 'react';

// Diviser les contextes pour éviter les re-renders inutiles
const StateContext = createContext(null);
const DispatchContext = createContext(null);

// Reducer optimisé avec Immer
import { produce } from 'immer';

const appReducer = produce((draft, action) => {
  switch (action.type) {
    case 'UPDATE_PROGRESS':
      // Mutation directe avec Immer (immutable sous le capot)
      draft.progress[action.payload.id] = action.payload.data;
      break;
    
    case 'BATCH_UPDATE':
      // Traitement par batch pour réduire les renders
      action.payload.forEach(update => {
        draft[update.key] = update.value;
      });
      break;
  }
});

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Mémoriser les valeurs de contexte
  const stateValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, []);
  
  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatchValue}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

// Hooks personnalisés pour accès optimisé
export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
};
```

---

## ⚡ 3. Performance de Rendu

### React.memo et useMemo Stratégique

```typescript
// components/QuizQuestion.tsx - Composant optimisé
import React, { memo, useMemo, useCallback } from 'react';

interface QuizQuestionProps {
  question: Question;
  userAnswer: string | null;
  onAnswer: (answer: string) => void;
  isReviewMode: boolean;
}

// Comparaison personnalisée pour éviter re-renders inutiles
const areEqual = (prev: QuizQuestionProps, next: QuizQuestionProps) => {
  return (
    prev.question.id === next.question.id &&
    prev.userAnswer === next.userAnswer &&
    prev.isReviewMode === next.isReviewMode
  );
};

const QuizQuestion = memo<QuizQuestionProps>(({
  question,
  userAnswer,
  onAnswer,
  isReviewMode
}) => {
  // Calcul coûteux mémorisé
  const formattedOptions = useMemo(() => 
    question.options.map(opt => ({
      ...opt,
      isSelected: userAnswer === opt.id,
      isCorrect: isReviewMode && opt.isCorrect
    })),
    [question.options, userAnswer, isReviewMode]
  );
  
  // Callback mémorisé pour éviter re-création
  const handleAnswer = useCallback((answerId: string) => {
    if (!isReviewMode) {
      onAnswer(answerId);
    }
  }, [onAnswer, isReviewMode]);
  
  return (
    <div className="quiz-question">
      {/* Rendu optimisé */}
    </div>
  );
}, areEqual);
```

### Virtualisation des Listes

```typescript
// components/ExerciseList.tsx - Liste virtualisée
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const ExerciseList = ({ exercises }) => {
  const Row = memo(({ index, style }) => (
    <div style={style}>
      <ExerciseCard exercise={exercises[index]} />
    </div>
  ));
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={exercises.length}
          itemSize={120} // Hauteur fixe par item
          overscanCount={3} // Pré-render 3 items
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};
```

---

## 💾 4. Gestion du Cache et Persistance

### IndexedDB pour Stockage Robuste

```typescript
// services/storage.service.ts
class StorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'MathsMindDB';
  private readonly VERSION = 2;
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Stores optimisés avec index
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { 
            keyPath: 'key' 
          });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }
  
  // Sauvegarde avec retry et timeout
  async save(storeName: string, data: any): Promise<void> {
    const maxRetries = 3;
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await this.saveWithTimeout(storeName, data, 5000);
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) throw error;
        await this.delay(1000 * attempts); // Backoff exponentiel
      }
    }
  }
  
  private async saveWithTimeout(
    storeName: string, 
    data: any, 
    timeout: number
  ): Promise<void> {
    return Promise.race([
      this.performSave(storeName, data),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]) as Promise<void>;
  }
  
  private async performSave(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Ajouter timestamp pour cache invalidation
      const dataWithMeta = {
        ...data,
        timestamp: Date.now(),
        version: this.VERSION
      };
      
      const request = store.put(dataWithMeta);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // Récupération avec cache
  async get(storeName: string, key: any): Promise<any> {
    const cached = await this.getFromCache(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    const fresh = await this.getFromStore(storeName, key);
    await this.updateCache(key, fresh);
    return fresh;
  }
  
  private isExpired(item: any): boolean {
    const MAX_AGE = 1000 * 60 * 60; // 1 heure
    return Date.now() - item.timestamp > MAX_AGE;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const storage = new StorageService();
```

### Service Worker pour Cache Réseau

```javascript
// sw.js - Service Worker optimisé
const CACHE_VERSION = 'v2';
const CACHE_NAME = `mathsmind-${CACHE_VERSION}`;

// Assets à pré-cacher
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Stratégies de cache par type
const CACHE_STRATEGIES = {
  'api/activities': 'network-first',
  'api/progress': 'network-first',
  'static': 'cache-first',
  'images': 'cache-first',
  'fonts': 'cache-first'
};

// Installation avec pré-cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Stratégies de récupération
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Déterminer la stratégie
  const strategy = getStrategy(url.pathname);
  
  switch (strategy) {
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(fetch(request));
  }
});

// Stratégie Network First avec fallback
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Fallback pour pages offline
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Stratégie Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
  const networkResponse = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}
```

---

## 📝 5. Optimisation des Quiz

### Système de Quiz Performant

```typescript
// services/quiz.service.ts
class QuizService {
  private currentQuiz: Quiz | null = null;
  private answers: Map<string, string> = new Map();
  private startTime: number = 0;
  private saveDebounce: NodeJS.Timeout | null = null;
  
  // Initialisation avec préchargement
  async startQuiz(quizId: string): Promise<Quiz> {
    // Charger le quiz et précharger les questions suivantes
    const quiz = await this.loadQuiz(quizId);
    this.currentQuiz = quiz;
    this.startTime = Date.now();
    
    // Précharger les ressources (images, formules)
    this.preloadResources(quiz);
    
    return quiz;
  }
  
  // Sauvegarde automatique avec debounce
  saveAnswer(questionId: string, answer: string): void {
    this.answers.set(questionId, answer);
    
    // Debounce pour éviter trop de sauvegardes
    if (this.saveDebounce) clearTimeout(this.saveDebounce);
    
    this.saveDebounce = setTimeout(() => {
      this.persistAnswers();
    }, 1000); // Sauvegarder après 1 seconde d'inactivité
  }
  
  // Validation optimisée
  async submitQuiz(): Promise<QuizResult> {
    if (!this.currentQuiz) throw new Error('No active quiz');
    
    // Calculer le score en parallèle
    const [score, detailedResults] = await Promise.all([
      this.calculateScore(),
      this.generateDetailedResults()
    ]);
    
    const result: QuizResult = {
      quizId: this.currentQuiz.id,
      score,
      answers: Array.from(this.answers.entries()),
      timeSpent: Date.now() - this.startTime,
      detailedResults,
      timestamp: Date.now()
    };
    
    // Sauvegarder en arrière-plan
    this.saveResultAsync(result);
    
    return result;
  }
  
  private async calculateScore(): Promise<number> {
    let correct = 0;
    const total = this.currentQuiz!.questions.length;
    
    for (const question of this.currentQuiz!.questions) {
      const userAnswer = this.answers.get(question.id);
      if (userAnswer === question.correctAnswer) {
        correct++;
      }
    }
    
    return Math.round((correct / total) * 100);
  }
  
  private async persistAnswers(): Promise<void> {
    const data = {
      quizId: this.currentQuiz?.id,
      answers: Array.from(this.answers.entries()),
      timestamp: Date.now()
    };
    
    try {
      // Sauvegarder localement d'abord
      await storage.save('quiz-progress', data);
      
      // Puis synchroniser avec le serveur
      if (navigator.onLine) {
        await api.saveQuizProgress(data);
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
      // Mettre en queue pour retry
      this.queueForRetry(data);
    }
  }
  
  private preloadResources(quiz: Quiz): void {
    // Précharger images et formules mathématiques
    quiz.questions.forEach(q => {
      if (q.imageUrl) {
        const img = new Image();
        img.src = q.imageUrl;
      }
      
      if (q.formula && window.MathJax) {
        // Pré-render les formules MathJax
        window.MathJax.typesetPromise([q.formula]);
      }
    });
  }
}
```

---

## 📊 6. Système de Progression

### Tracking de Progression Optimisé

```typescript
// services/progression.service.ts
class ProgressionService {
  private progressCache: Map<string, Progress> = new Map();
  private updateQueue: Progress[] = [];
  private syncInterval: number = 30000; // 30 secondes
  
  constructor() {
    // Synchronisation périodique
    setInterval(() => this.syncProgress(), this.syncInterval);
    
    // Synchronisation avant fermeture
    window.addEventListener('beforeunload', () => {
      this.syncProgress(true); // Force sync
    });
  }
  
  // Mise à jour optimisée avec batch
  updateProgress(activityId: string, data: Partial<Progress>): void {
    const existing = this.progressCache.get(activityId) || {};
    const updated = { ...existing, ...data, lastUpdated: Date.now() };
    
    this.progressCache.set(activityId, updated);
    this.updateQueue.push(updated);
    
    // Batch update après accumulation
    if (this.updateQueue.length >= 10) {
      this.flushUpdates();
    }
  }
  
  // Calcul de progression global
  calculateOverallProgress(): ProgressSummary {
    const activities = Array.from(this.progressCache.values());
    
    const summary = activities.reduce((acc, activity) => {
      acc.totalActivities++;
      acc.completedActivities += activity.isCompleted ? 1 : 0;
      acc.totalPoints += activity.points || 0;
      acc.totalTime += activity.timeSpent || 0;
      
      // Calcul du pourcentage par type
      if (activity.type === 'quiz') {
        acc.quizProgress.push(activity.score || 0);
      } else if (activity.type === 'exercise') {
        acc.exerciseProgress.push(activity.completion || 0);
      }
      
      return acc;
    }, {
      totalActivities: 0,
      completedActivities: 0,
      totalPoints: 0,
      totalTime: 0,
      quizProgress: [] as number[],
      exerciseProgress: [] as number[]
    });
    
    // Moyennes
    summary.averageQuizScore = this.average(summary.quizProgress);
    summary.averageExerciseCompletion = this.average(summary.exerciseProgress);
    summary.overallProgress = (summary.completedActivities / summary.totalActivities) * 100;
    
    return summary;
  }
  
  private async syncProgress(force = false): Promise<void> {
    if (this.updateQueue.length === 0 && !force) return;
    
    try {
      const updates = [...this.updateQueue];
      this.updateQueue = [];
      
      // Envoyer par batch
      await api.batchUpdateProgress(updates);
      
      // Mettre à jour le cache local
      await Promise.all(
        updates.map(update => 
          storage.save('progress', update)
        )
      );
    } catch (error) {
      // Remettre dans la queue en cas d'erreur
      this.updateQueue.unshift(...updates);
      console.error('Progress sync failed:', error);
    }
  }
  
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
}
```

---

## 🚨 7. Gestion des Erreurs

### Error Boundary Global

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to monitoring service
    this.logErrorToService(error, errorInfo);
    
    // Sauvegarder l'état pour récupération
    this.saveStateForRecovery();
  }
  
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId
    };
    
    // Envoyer à Sentry ou autre service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: errorInfo }
      });
    }
    
    // Log local pour debug
    console.error('Error caught by boundary:', errorData);
  }
  
  private saveStateForRecovery(): void {
    try {
      const stateSnapshot = {
        lastRoute: window.location.pathname,
        timestamp: Date.now(),
        // Sauvegarder l'état critique
      };
      
      localStorage.setItem('error-recovery', JSON.stringify(stateSnapshot));
    } catch (e) {
      console.error('Failed to save recovery state:', e);
    }
  }
  
  retry = (): void => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <h2>Une erreur est survenue</h2>
          <details>
            <summary>Détails techniques</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          
          {this.state.retryCount < 3 && (
            <button onClick={this.retry}>
              Réessayer ({3 - this.state.retryCount} tentatives restantes)
            </button>
          )}
          
          <button onClick={() => window.location.href = '/'}>
            Retour à l'accueil
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 📱 8. Optimisation Mobile

### Responsive et Touch Optimisé

```typescript
// hooks/useResponsive.ts
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    hasTouch: 'ontouchstart' in window
  });
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768,
          isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
          isDesktop: window.innerWidth >= 1024,
          hasTouch: 'ontouchstart' in window
        });
      }, 150); // Debounce
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return dimensions;
};

// Composant optimisé pour mobile
const MobileOptimizedQuiz = () => {
  const { isMobile, hasTouch } = useResponsive();
  
  // Lazy load des composants lourds sur mobile
  const HeavyComponent = isMobile 
    ? lazy(() => import('./MobileVersion'))
    : lazy(() => import('./DesktopVersion'));
  
  return (
    <Suspense fallback={<MobileLoader />}>
      <HeavyComponent />
    </Suspense>
  );
};
```

---

## 📈 9. Métriques et Monitoring

### Performance Monitoring

```typescript
// services/monitoring.service.ts
class MonitoringService {
  private metrics: Map<string, any> = new Map();
  
  constructor() {
    this.initializePerformanceObserver();
    this.trackVitals();
  }
  
  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Observer pour LCP
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set('lcp', entry.startTime);
          this.reportMetric('lcp', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Observer pour FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set('fid', entry.processingStart - entry.startTime);
          this.reportMetric('fid', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
      
      // Observer pour CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('cls', clsValue);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  private trackVitals(): void {
    // Mesurer le temps de chargement
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.set('loadTime', navigation.loadEventEnd - navigation.fetchStart);
      this.metrics.set('domReady', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      this.metrics.set('ttfb', navigation.responseStart - navigation.fetchStart);
      
      this.reportAllMetrics();
    });
  }
  
  trackCustomMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    this.reportMetric(name, value);
  }
  
  private reportMetric(name: string, value: number): void {
    // Envoyer à Google Analytics ou autre service
    if (window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value)
      });
    }
  }
  
  private reportAllMetrics(): void {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: Object.fromEntries(this.metrics),
      device: this.getDeviceInfo()
    };
    
    // Envoyer au backend
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(console.error);
  }
  
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.har
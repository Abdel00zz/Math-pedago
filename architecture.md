# Architecture

## 1. Vue d'ensemble

Le projet **Math-pedago** est une plateforme pédagogique front-end construite avec **React 19**, **TypeScript** et empaquetée avec **Vite**. L'application tourne entièrement côté client, consomme des contenus structurés stockés dans `public/chapters/**/*.json` et persiste l'état apprenant dans `localStorage`. L'objectif est de proposer une expérience complète de cours : progression de leçon, quiz interactifs, exercices corrigés, vidéos et notifications pilotées côté UI.

```
index.tsx → <AppProvider> + <NotificationProvider> + <ErrorBoundary>
           ↳ App.tsx → vue courante (login | dashboard | work-plan | activity)
             ↳ components/views/**
             ↳ context/** (AppContext, LessonProgressContext, NotificationContext…)
             ↳ services/** (persistance, calculs de progression)
             ↳ utils/** (parseurs JSON, helpers de progression)
             ↳ public/chapters/** (contenu métier)
```

## 2. Stack & commandes

- **Build tooling** : Vite 6, @vitejs/plugin-react.
- **Langage** : TypeScript strict, modules ECMAScript.
- **UI** : React 19 (hooks, context, suspense-ready).
- **Notifications** : file d'attente custom avec UUID.
- **Persistence** : `localStorage` (clé `pedago.*`).
- **Scripts** : `npm run dev` (serveur Vite), `npm run build`, `npm run preview`.

## 3. Structure de dossiers

| Dossier / fichier | Rôle principal |
| --- | --- |
| `App.tsx` | Routeur de vue basé sur l'état global `AppContext`.
| `api/submit-work.ts` | Stub d'API (ex. Vercel function) pour soumissions.
| `components/` | Bibliothèque UI (modales, cartes, notifications, vues).
| `components/views/` | Pages de haut niveau (Login, Dashboard, ChapterHub, Activity, LessonView...).
| `components/lesson/` | Modules dédiés aux leçons (navigator, affichage, modales solution).
| `components/quiz/` | Mécanismes quiz (MCQ, ordering, résultats).
| `context/` | Context providers (App, Notification, LessonProgress, BoxNumbering...).
| `hooks/` | Hooks ciblés (MathJax, IntersectionObserver, notifications).
| `services/` | Services applicatifs (lessonProgressService, lessonProgressHelpers).
| `utils/` | Parseurs et helpers (lessonContentParser, lessonParser...).
| `public/chapters/**` | Contenu JSON des cours et assets associés.
| `src/styles/**` | Système de styles modulaires (main-theme, lesson-boxes, quiz...).
| `types.ts` | Modèle de données : profils, chapitres, leçons, quiz, vidéos, etc.

## 4. Bootstrap & providers

1. `index.tsx`
   - Configure `window.diagnoseMathJax` pour debug.
   - Monte l'application dans `#root` sous `React.StrictMode`.
   - Empile les providers :
     1. `<ErrorBoundary>` : capture les erreurs inattendues.
     2. `<NotificationProvider>` : queue de toasts UI.
     3. `<AppProvider>` : état global des parcours apprenants.
2. `App.tsx`
   - Récupère l'état via `useAppState()`.
   - Sélectionne la vue courante (`login`, `dashboard`, `work-plan`, `activity`).
   - Injecte `<Notifications />` en overlay global.

## 5. Gestion d'état globale (`AppContext`)

- **Reducer unique** (`appReducer`) orchestrant toutes les transitions majeures :
  - Authentification et navigation (`INIT`, `LOGIN`, `CHANGE_VIEW`).
  - Progression quiz (navigation, réponses, soumission, mode review, durée, hints).
  - Suivi des vidéos (marquage « Bien assimilé », durée).
  - Suivi de lecture de la leçon (`UPDATE_LESSON_PROGRESS`).
  - Exercises (feedback granularité, durée cumulée).
  - Soumission de travail & gestion des mises à jour (flags `hasUpdate`, `submittedVersion`).
  - Synchronisation du catalogue (`SYNC_ACTIVITIES`) avec détection de version per-chapter et génération de notifications.
- **Données clés** :
  - `profile`, `chapterOrder`, `activities` (contenu chapitres), `progress` (par chapitre), `activityVersions`.
  - `currentChapterId`, `activitySubView` (`lesson`, `quiz`, `exercises`, `videos`).
  - `isReviewMode` pour quiz.
- **Persistance** : interactions fréquentes avec `localStorage` via constantes `DB_KEY`, cleaning des notifications liées (`pedagoUiNotifications_V1`).
- **Hooks exposés** : `useAppState()`, `useAppDispatch()` (non montré mais standard dans contexte).

## 6. Notifications (`NotificationContext`)

- File d'attente contrôlée avec limites : 3 visibles, 10 en attente.
- Détection de doublons à courte fenêtre (`DUPLICATE_WINDOW_MS`).
- Nettoyage automatique (intervalle 60s).
- API : `addNotification`, `removeNotification`, `clearAll`, `notifications[]`.
- Gestion fine des timers via `useRef<Map<string, Timeout>>` pour auto-dismiss.
- Persist sur `window` via CustomEvent `notificationsUpdated` quand des updates sont purgées (intégré côté AppContext).

## 7. Progression de leçon (`LessonProgressContext`)

- Construit un **outline hiérarchique** (sections → sous-sections → sous-sous-sections) à partir du `LessonContent` JSON.
- Génère des IDs d'ancrage (`section-1-…`) et encode les paragraphes via `encodeLessonPath`.
- Utilise `lessonProgressService` pour lire/écrire dans `localStorage` :
  - `pedago.lessonProgress.v1` (état par paragraphe).
  - `pedago.lessonProgressMeta.v1` (section/subsection active, timestamps).
- Expose des actions : `markNode`, `toggleNode`, `markAllNodesUpTo`, `scrollToAnchor`.
- Suivi en temps réel de la section active via hooks `useSectionObserver` & `useSubsectionObserver` (IntersectionObserver).
- Fournit un résumé `ProgressSummary` (total, completed, percentage).
- Gestion du scroll container via ref optionnel pour permettre un TOC synchronisé.

## 8. Autres contextes

- `NumberingContext` & `BoxNumberingContext` : gèrent les compteurs (numérotation d'exemples, définitions, etc.) synchronisés avec les leçons.
- `LessonProgressContextNew.tsx` (expérimental / alternative logic).

## 9. Modèle de données (`types.ts`)

- Centralise les interfaces TypeScript :
  - `Profile`, `Chapter`, `QuizProgress`, `VideosProgress`, `LessonProgress`, `Exercise`, `Video`, etc.
  - Structures richement typées pour les leçons (sections, éléments, boîtes interactives, images, etc.).
- Permet un typage strict des JSON chargés depuis `public/chapters/**`.

## 10. Contenu & parsing

- **Source** : fichiers JSON par chapitre (`public/chapters/<class>/<chapter>.json`).
- `utils/lessonContentParser.tsx` & `utils/lessonParser.tsx` :
  - Convertissent le JSON en composants React (`LessonElement`).
  - Gèrent images, boîtes d'information, contenu mathématique.
- `hooks/useMathJax.ts` : prépare les rendus MathJax, expose un diagnostic global.
- `mathText.ts` / `mathJaxDiagnostic.ts` : conversions utilitaires pour le contenu mathématique.

## 11. Vues principales (`components/views/`)

| Vue | Rôle |
| --- | --- |
| `LoginView` | Authentification simplifiée / sélection de profil.
| `DashboardView` | Vue d'ensemble, cartes chapitres (`ChapterCard`), actions globales.
| `ChapterHubView` | Sommaire détaillé des étapes (lecture, vidéos, quiz, exercices, soumission).
| `ActivityView` | Conteneur multi-onglets (LessonView, Quiz, Exercises, Videos) bascule via `activitySubView`.
| `LessonView` | Contextualise `LessonProgressProvider`, affiche le contenu parsed, TOC (`LessonNavigator`).

### Sous-composants clés

- `LessonDisplay` : rendu hiérarchique de la leçon.
- `LessonNavigator` : sommaire sticky, auto-scroll, surlignage.
- `Exercises` : module d'exercices avec hints, feedback.
- `quiz/` : `Quiz`, `MCQQuestion`, `OrderingQuestion`, `QuizResult`, etc.
- `GlobalActionButtons`, `GlobalWorkSubmit` : actions transverses (soumission, téléchargement, etc.).
- `Modal`, `HelpModal`, `HintModal`, `SolutionModal` : infrastructure modale commune.
- `Notifications` : portail ReactDOM pour toasts (utilise `NotificationContext`).

## 12. Services & helpers

- `lessonProgressService.ts`
  - API CRUD sur `localStorage` pour progression & métadonnées.
  - Expose `markNode`, `toggleNode`, `ensureLessonNodes`, `setLastVisited`, etc.
- `lessonProgressHelpers.ts`
  - Coordination entre service et UI (dispatch d'updates, normalisation).
- `lessonParser.tsx`, `lessonContentParser.tsx`
  - Transformations JSON → JSX, injection `MathContent`, mapping d'images.
- `lessonProgressService` est singleton (instancié à l'export).

## 13. Gestion des ressources & styles

- Styles globaux `src/styles/main-theme.css` :
  - Variables CSS (typographie, couleurs, spacing).
  - Background SVG futuriste (`--app-pattern`, `--card-pattern`).
  - Layouts responsive (breakpoints 768px, 1024px...).
- Styles modulaires par domaine :
  - `lesson-boxes.css` (boîtes de contenu unifiées).
  - `lesson-navigator.css` (sommaire, animations, responsive landscape).
  - `dashboard.css`, `quiz.css`, `chapter-hub.css`, `lesson-content.css`, etc.
- Ressources static : manifest PWA (`public/manifest.webmanifest`), images dans `public/pictures/**`.

## 14. Flux utilisateur global

1. **Login** : profil sélectionné → `AppContext` passe en `dashboard`.
2. **Dashboard** : affichage des chapitres disponibles (`activities` synchronisées au démarrage via `SYNC_ACTIVITIES`).
3. **Chapter Hub** : navigation par étape, suivi d'avancement (lecture, vidéos, quiz, exercices, soumission).
4. **Activity View** :
   - `LessonView` : progression paragraphes, TOC auto-scroll, contenu MathJax.
   - `Videos` : marquage `Bien assimilé`, suivi durée.
   - `Quiz` : MCQ + ordering, sauvegarde réponses, mode review.
   - `Exercises` : hints, feedback `Facile/Moyen/Difficile`.
5. **Notifications** : affichent les updates (nouvelle version chapitre, resubmission requise, etc.).

## 15. Persistance & synchronisation

- **State local** : `localStorage` (progression, notifications UI, meta leçon).
- **Chapitres** : chargés depuis JSON, versionnés (`chapter.version`), comparés à `activityVersions` pour détecter les mises à jour.
- **Soumission de travail** : flag `isWorkSubmitted` et `submittedVersion`. `hasUpdate` déclenché si une nouvelle version chapitre arrive après soumission.

## 16. Points d'extension

- Ajouter un nouveau type d'activité :
  - Étendre `ActivityView` (nouvelle `activitySubView`).
  - Étendre `AppContext` (progress + actions).
  - Ajouter styles dédiés.
- Ajouter un format de box de leçon :
  - Étendre `types.ts` (`LessonInfoBoxElement`).
  - Mappage dans `lessonContentParser`.
  - Styles ciblés dans `lesson-boxes.css`.
- Connecter une API backend :
  - Utiliser `services/` pour uniformiser les appels.
  - Engranger persistance server-side au lieu de `localStorage`.

## 17. Tests & validation (à prévoir)

Le dépôt actuel ne contient pas encore de suites de tests automatisés. Recommandations :
- Tests unitaires sur reducers (`AppContext`) et services (`lessonProgressService`).
- Tests d'intégration UI (React Testing Library) pour les vues principales.
- Lint/format check (ESLint, Prettier) à ajouter dans la toolchain Vite.

## 18. Patterns de Design & Bonnes Pratiques

### Architecture Patterns Utilisés

1. **Compound Components Pattern**
   - Les composants comme `Quiz`, `LessonNavigator` utilisent des sous-composants compositionnels
   - Permet une flexibilité et réutilisabilité maximale

2. **Provider Pattern**
   - Centralisation de l'état via Context API
   - Séparation claire entre logique métier et présentation

3. **Render Props & Custom Hooks**
   - Hooks personnalisés (`useMathJax`, `useSectionObserver`)
   - Réutilisation de la logique sans duplication

4. **Service Layer Pattern**
   - Services dédiés (`lessonProgressService`)
   - Séparation de la logique de persistance

### Conventions de Code

```typescript
// Nomenclature des fichiers
- Composants: PascalCase (LessonNavigator.tsx)
- Hooks: camelCase avec préfixe 'use' (useMathJax.ts)
- Services: camelCase (lessonProgressService.ts)
- Types: types.ts centralisé
- Styles: kebab-case (lesson-navigator.css)

// Structure des composants
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks d'état
  const [state, setState] = useState();

  // 2. Hooks de contexte
  const context = useContext();

  // 3. Refs
  const ref = useRef();

  // 4. Callbacks mémorisés
  const handler = useCallback(() => {}, []);

  // 5. Effects
  useEffect(() => {}, []);

  // 6. Render
  return <div>...</div>;
};
```

## 19. Performance & Optimisation

### Stratégies Actuelles

1. **Mémorisation**
   - `useMemo` pour calculs coûteux (progression, navigation window)
   - `useCallback` pour handlers stables
   - Évite re-renders inutiles

2. **Lazy Loading**
   - Chargement différé des chapitres (JSON dynamique)
   - Composants MathJax rendus à la demande

3. **Optimisations CSS**
   - `contain: layout style` sur navigateur
   - Transitions limitées aux éléments non-critiques
   - Variables CSS pour cohérence et performance

4. **Virtual Scrolling Potentiel**
   - Pour les longues listes de questions quiz
   - TOC avec fenêtrage glissant (déjà implémenté)

### Recommandations d'Amélioration

```typescript
// 1. Code Splitting par route
const DashboardView = lazy(() => import('./components/views/DashboardView'));
const ActivityView = lazy(() => import('./components/views/ActivityView'));

// 2. Image optimization
// Utiliser WebP avec fallback PNG
// Lazy loading des images via Intersection Observer

// 3. Service Worker pour mise en cache
// Progressive Web App avec offline support

// 4. Debounce/Throttle pour scroll events
const debouncedScroll = useDebouncedCallback(handleScroll, 100);
```

## 20. Accessibilité (A11y)

### Conformité WCAG 2.1

1. **Navigation au clavier**
   - Support des touches fléchées dans quiz
   - Focus visible sur tous les éléments interactifs
   - Skip links pour navigation rapide

2. **ARIA Labels**
   - `aria-label` sur boutons d'action
   - `aria-expanded` sur éléments pliables
   - `role="navigation"` sur sommaire

3. **Contraste & Lisibilité**
   - Ratio de contraste minimum 4.5:1
   - Tailles de police ajustables via CSS variables
   - Mode sombre (prévu via `darkMode: "class"`)

4. **Screen Readers**
   - Sémantique HTML appropriée
   - Messages de progression annoncés
   - États des quiz verbalisés

### Améliorations Futures

```tsx
// 1. Annonces dynamiques
<div role="status" aria-live="polite" aria-atomic="true">
  {progressMessage}
</div>

// 2. Skip navigation
<a href="#main-content" className="skip-link">
  Aller au contenu principal
</a>

// 3. Préférences utilisateur
const [fontSize, setFontSize] = useState('medium');
const [reducedMotion, setReducedMotion] = useState(false);
```

## 21. Architecture Évolutive - Roadmap

### Phase 1: Stabilisation (Court terme)
- [ ] Tests unitaires et d'intégration
- [ ] Documentation des composants (Storybook)
- [ ] Audit de performance (Lighthouse)
- [ ] Correction des bugs identifiés

### Phase 2: Amélioration UX (Moyen terme)
- [ ] Mode hors ligne complet (Service Worker)
- [ ] Animations et transitions fluides
- [ ] Feedback utilisateur enrichi
- [ ] Personnalisation du thème

### Phase 3: Scalabilité (Long terme)
- [ ] Backend API pour synchronisation multi-appareils
- [ ] Système de gamification (badges, points)
- [ ] Collaboration temps réel (commentaires, forums)
- [ ] Analytics et tableaux de bord professeur

### Architecture Cible

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Student  │  │ Teacher  │  │  Admin Panel     │  │
│  │ Portal   │  │ Dashboard│  │  (Futur)         │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↕
        ┌───────────────────────────────┐
        │     API Gateway (REST/GraphQL) │
        └───────────────────────────────┘
                        ↕
    ┌───────────────────────────────────────┐
    │         Microservices Layer           │
    │  ┌──────────┐  ┌──────────┐  ┌─────┐ │
    │  │ Auth     │  │ Progress │  │ CMS │ │
    │  │ Service  │  │ Service  │  │     │ │
    │  └──────────┘  └──────────┘  └─────┘ │
    └───────────────────────────────────────┘
                        ↕
        ┌───────────────────────────────┐
        │   Database Layer (PostgreSQL)  │
        │   Cache Layer (Redis)          │
        └───────────────────────────────┘
```

## 22. Sécurité & Conformité

### Pratiques Actuelles
- Validation côté client (TypeScript strict)
- Sanitization des inputs utilisateur
- Pas de données sensibles en localStorage

### Recommandations
1. **HTTPS obligatoire** en production
2. **Content Security Policy (CSP)** headers
3. **RGPD compliance** pour données utilisateur
4. **Rate limiting** sur API futures
5. **Authentication/Authorization** robuste (JWT, OAuth)

```typescript
// Exemple de validation renforcée
const validateAnswer = (answer: unknown): string => {
  if (typeof answer !== 'string') {
    throw new Error('Invalid answer type');
  }

  const sanitized = DOMPurify.sanitize(answer);
  if (sanitized.length > MAX_ANSWER_LENGTH) {
    throw new Error('Answer too long');
  }

  return sanitized;
};
```

## 23. Monitoring & Observabilité

### Métriques Clés à Suivre
1. **Performance**
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

2. **Engagement**
   - Taux de completion des leçons
   - Temps moyen par activité
   - Taux de réussite aux quiz

3. **Erreurs**
   - Taux d'erreur JavaScript
   - Erreurs de chargement de ressources
   - Échecs de sauvegarde localStorage

### Outils Recommandés
```typescript
// Error tracking (Sentry exemple)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Analytics (Google Analytics / Plausible)
const trackEvent = (category: string, action: string, label?: string) => {
  if (window.gtag) {
    window.gtag('event', action, { category, label });
  }
};
```

---

## Conclusion

Ce document couvre l'architecture fonctionnelle, technique et évolutive de **Math-pedago**. Il sert de guide de référence pour :
- Les nouveaux contributeurs souhaitant comprendre le projet
- Les développeurs travaillant sur des évolutions
- Les décideurs techniques planifiant la roadmap
- Les auditeurs de code et de sécurité

**Math-pedago** est conçu pour être une plateforme éducative moderne, performante et accessible, avec une architecture solide permettant une évolution progressive vers un écosystème complet d'apprentissage en ligne.

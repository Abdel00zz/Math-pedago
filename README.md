# 📚 Math-pedago - Center Scientific of Mathematics

> Plateforme pédagogique interactive pour l'apprentissage des mathématiques, développée par Boudouh Abdelmalek au Maroc.

[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/Abdel00zz/Math-pedago)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Stockage des données](#-stockage-des-données)
- [Format des JSON](#-format-des-json)
- [Système de navigation](#-système-de-navigation)
- [Modales (Orientation & Aide)](#-modales-orientation--aide)
- [Soumission du travail via Resend](#-soumission-du-travail-via-resend)
- [Suivi de progression](#-suivi-de-progression)
- [Validation des JSON](#-validation-des-json)
- [Gestion des erreurs (ErrorBoundary)](#-gestion-des-erreurs-errorboundary)
- [Système de chronométrage des quiz](#-système-de-chronométrage-des-quiz)
- [Sommaire des concours](#-sommaire-des-concours)
- [Installation et développement](#-installation-et-développement)
- [Technologies utilisées](#-technologies-utilisées)

---

## 🎯 Vue d'ensemble

**Math-pedago** est une plateforme pédagogique complète permettant aux élèves d'apprendre les mathématiques de manière interactive et autonome, disponible 24h/24 et 7j/7.

### Fonctionnalités principales

- 📖 **Leçons interactives** avec définitions, théorèmes et exemples
- 🎥 **Capsules vidéo** pour illustrer les concepts
- 📝 **Quiz interactifs** avec corrections détaillées
- ✏️ **Exercices pratiques** avec auto-évaluation
- 🎯 **Concours** (ENSA, Médecine, etc.) avec résumés et quiz
- 📊 **Suivi de progression** en temps réel
- 📧 **Envoi du travail** au professeur via email
- 🌐 **Support bilingue** (Français/Arabe)
- 📱 **Progressive Web App (PWA)** installable

---

## 🏗️ Architecture

L'application suit une architecture React moderne avec gestion d'état centralisée :

```
Math-pedago/
├── index.html                      # Point d'entrée HTML
├── index.tsx                       # Point d'entrée React
├── App.tsx                         # Composant racine avec routage
│
├── components/                     # Composants React
│   ├── views/                      # Vues principales
│   │   ├── LoginView.tsx          # Authentification
│   │   ├── DashboardView.tsx      # Tableau de bord
│   │   ├── ChapterHubView.tsx     # Plan de travail (3 étapes)
│   │   ├── ActivityView.tsx       # Activités (Leçon/Vidéos/Quiz/Exercices)
│   │   ├── LessonView.tsx         # Vue de la leçon
│   │   └── Concours*.tsx          # Vues concours
│   │
│   ├── quiz/                       # Composants quiz
│   ├── lesson/                     # Composants leçon
│   ├── OrientationModal.tsx        # Modal programme d'orientation
│   ├── HelpModal.tsx               # Modal aide bilingue
│   ├── GlobalWorkSubmit.tsx        # Bouton soumission travail
│   └── ...
│
├── context/                        # Context API React
│   ├── AppContext.tsx             # État global de l'application
│   ├── LessonProgressContext.tsx  # Progression des leçons
│   └── NotificationContext.tsx    # Notifications
│
├── services/                       # Services métier
│   ├── StorageService.ts          # Gestion localStorage
│   └── lessonProgressService.ts   # Suivi progression
│
├── utils/                          # Utilitaires
│   ├── lessonProgressHelpers.ts   # Calculs de progression
│   ├── jsonValidator.ts           # Validation JSON
│   └── ...
│
├── api/                            # API backend
│   └── submit-work.ts             # Endpoint Resend
│
├── public/                         # Fichiers statiques
│   └── concours/                  # Fichiers JSON concours
│       └── ensa/
│           ├── 2024-*.json
│           └── 2025-*.json
│
└── types/                          # Types TypeScript
    └── chapter.ts
```

### Flux de navigation

```
LoginView
    ↓
DashboardView
    ↓
ChapterHubView (3 étapes)
    ├── Étape 1: Leçon (100% requis)
    ├── Étape 2: Quiz (requis leçon complète)
    └── Étape 3: Exercices (requis quiz terminé)
    ↓
ActivityView
    ├── Leçon → LessonView
    ├── Vidéos → VideoCapsules
    ├── Quiz → Quiz
    └── Exercices → Exercises
    ↓
GlobalWorkSubmit (quand tout est terminé)
```

---

## 💾 Stockage des données

L'application utilise **localStorage** pour persister les données côté client. Le service `StorageService` centralise tous les accès avec :

### Architecture du service

```typescript
// services/StorageService.ts
class StorageService {
  get<T>(key: string, defaultValue?: T): T | undefined
  set<T>(key: string, data: T, config?: StorageConfig): boolean
  remove(key: string): void
  has(key: string): boolean
  getWithVersion<T>(key: string, expectedVersion: string): T | undefined
  cleanup(): number
  migrate(): void
  getStats(): StorageStats
}
```

### Clés de stockage

```typescript
STORAGE_KEYS = {
  APP_STATE: 'math-pedago:app:v5.0',           // État global
  LESSONS: 'math-pedago:lessons:v2.0',         // Progression leçons
  LESSON_META: 'math-pedago:lessons-meta:v1.0', // Métadonnées
  LESSON_BLANKS: 'math-pedago:lesson-blanks:v1.0', // Révélations
  LESSON_CACHE: 'math-pedago:lesson-cache:v1.0',   // Cache JSON
  CONCOURS: 'math-pedago:concours:v1.0',       // Données concours
  UI_CACHE: 'math-pedago:ui-cache:v1.0',       // Cache UI
  PENDING: 'math-pedago:pending:v1.0',         // Actions en attente
  MIGRATIONS: 'math-pedago:migrations:v1.0'    # Historique migrations
}
```

### Format des données stockées

Chaque entrée est stockée avec métadonnées :

```typescript
interface CachedData<T> {
  data: T;                    // Données réelles
  version: string;            // Version du schéma
  timestamp: number;          // Date de création
  expiresAt: number | null;   // Date d'expiration (TTL)
}
```

### Exemple de données stockées

```json
// localStorage['math-pedago:app:v5.0']
{
  "data": {
    "studentName": "Ahmed",
    "classId": "tc",
    "currentChapterId": "1",
    "view": "activity",
    "activities": { ... },
    "progress": {
      "1": {
        "lesson": { "isRead": true, "scrollProgress": 100 },
        "quiz": { "isSubmitted": true, "score": 85 },
        "exercises": {
          "ex1": { "feedback": "easy", "timestamp": 1699999999 }
        }
      }
    }
  },
  "version": "5.0.0",
  "timestamp": 1699999999000,
  "expiresAt": null
}
```

### Gestion du quota

- **Limite** : ~5MB (limite standard localStorage)
- **Seuil d'alerte** : 80% d'utilisation
- **Nettoyage automatique** : Suppression des données expirées
- **TTL** : Cache leçons = 7 jours

### Migrations

Le service gère automatiquement les migrations entre versions :

```typescript
// Anciennes clés migrées automatiquement
OLD_KEYS = [
  'pedagoEleveData_V4.7_React',
  'pedago.lessonProgress.v1',
  'pedago.lessonProgressMeta.v1'
]
```

### API publique

```typescript
// Lecture
const data = storageService.get('math-pedago:app:v5.0');

// Écriture
storageService.set('math-pedago:app:v5.0', appState, {
  version: '5.0.0',
  ttl: 7 * 24 * 60 * 60 * 1000 // 7 jours
});

// Cache de leçon
storageService.cacheLessonContent('tc-1', lessonData, '1.0');
const cached = storageService.getCachedLesson('tc-1', '1.0');

// Statistiques
const stats = storageService.getStats();
// { totalSize: 245678, itemCount: 12, quotaUsagePercent: 4.9 }

// Nettoyage
storageService.cleanup(); // Retourne nombre d'entrées supprimées
```

---

## 📄 Format des JSON

### Structure d'un concours

Les fichiers JSON des concours (ex: `public/concours/ensa/2024-probabilites.json`) suivent cette structure :

```json
{
  "id": "ensa-2024-probabilites",
  "concours": "ENSA",
  "annee": "2024",
  "theme": "Probabilités",

  "resume": {
    "title": "Probabilités - L'essentiel",
    "introduction": "Texte d'introduction avec formules $P(A) = \\frac{n(A)}{n(\\Omega)}$",
    "sections": [
      {
        "type": "definitions",
        "titre": "Définitions clés",
        "items": [
          "**Univers** : Ensemble de tous les résultats possibles $\\Omega$",
          "**Événement** : Sous-ensemble de $\\Omega$"
        ]
      },
      {
        "type": "formules",
        "titre": "Formules essentielles",
        "items": [
          "**Probabilité conditionnelle** : $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
          "**Formule de Bayes** : $P(B|A) = \\frac{P(A|B) \\cdot P(B)}{P(A)}$"
        ]
      },
      {
        "type": "methodes",
        "titre": "Méthodes pratiques",
        "items": [
          "**Pour calculer une probabilité** : Identifier l'univers, compter les cas favorables",
          "**Arbre de probabilités** : Multiplier sur les branches, additionner les chemins"
        ]
      },
      {
        "type": "pieges",
        "titre": "Pièges à éviter",
        "items": [
          "**ATTENTION** : $P(A \\cup B) \\neq P(A) + P(B)$ si $A$ et $B$ ne sont pas disjoints",
          "**PIÈGE** : Ne pas confondre indépendance et incompatibilité"
        ]
      },
      {
        "type": "reflexion",
        "titre": "Points de réflexion",
        "items": [
          "**Événements indépendants** : $P(A \\cap B) = P(A) \\times P(B)$"
        ]
      }
    ]
  },

  "quiz": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Soit $A$ et $B$ deux événements indépendants. Si $P(A) = 0.3$ et $P(B) = 0.4$, quelle est $P(A \\cap B)$ ?",
      "choices": [
        { "id": "a", "text": "$0.12$", "isCorrect": true },
        { "id": "b", "text": "$0.7$", "isCorrect": false },
        { "id": "c", "text": "$0.1$", "isCorrect": false },
        { "id": "d", "text": "$0.42$", "isCorrect": false }
      ],
      "explanation": "Pour des événements **indépendants**, $P(A \\cap B) = P(A) \\times P(B) = 0.3 \\times 0.4 = 0.12$",
      "hint": "Rappel : Deux événements sont indépendants si $P(A \\cap B) = P(A) \\times P(B)$"
    },
    {
      "id": "q2",
      "type": "ordering",
      "question": "Ordonner les étapes pour calculer $P(A|B)$ :",
      "items": [
        { "id": "1", "text": "Calculer $P(A \\cap B)$", "correctOrder": 1 },
        { "id": "2", "text": "Calculer $P(B)$", "correctOrder": 2 },
        { "id": "3", "text": "Diviser : $\\frac{P(A \\cap B)}{P(B)}$", "correctOrder": 3 }
      ],
      "explanation": "La formule de probabilité conditionnelle nécessite d'abord de connaître $P(A \\cap B)$ et $P(B)$.",
      "hint": "Rappel de la formule : $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$"
    }
  ]
}
```

### Types de questions

#### 1. MCQ (Multiple Choice Question)
```json
{
  "type": "mcq",
  "question": "Texte avec support $LaTeX$",
  "choices": [
    { "id": "a", "text": "Choix 1", "isCorrect": true },
    { "id": "b", "text": "Choix 2", "isCorrect": false }
  ],
  "explanation": "Explication détaillée",
  "hint": "Indice optionnel"
}
```

#### 2. Ordering (Ordonnancement)
```json
{
  "type": "ordering",
  "question": "Question",
  "items": [
    { "id": "1", "text": "Étape 1", "correctOrder": 1 },
    { "id": "2", "text": "Étape 2", "correctOrder": 2 }
  ],
  "explanation": "Explication",
  "hint": "Indice"
}
```

### Sections du résumé

| Type | Couleur | Usage |
|------|---------|-------|
| `definitions` | Bleu | Définitions mathématiques |
| `formules` | Violet | Formules essentielles |
| `methodes` | Vert | Méthodes de résolution |
| `pieges` | Rouge | Erreurs courantes (mots-clés : ATTENTION, DANGER, PIÈGE) |
| `reflexion` | Indigo | Points de réflexion |

### Support LaTeX

Toutes les chaînes supportent LaTeX via MathJax :
- **Inline** : `$formule$` → `$P(A) = 0.5$`
- **Display** : `$$formule$$` → `$$\int_0^1 f(x)dx$$`

---

## 🧭 Système de navigation

### Structure à 3 étapes

L'application impose un ordre séquentiel strict :

```
┌─────────────────────────────────────────────────────────┐
│                   CHAPTER HUB VIEW                      │
│                 (Plan de travail)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ÉTAPE 1: LEÇON                               │  │
│  │  • Progression : 0-100%                        │  │
│  │  • Requis : Aucun                              │  │
│  │  • Débloque : Quiz (à 100%)                    │  │
│  └─────────────────────────────────────────────────┘  │
│                         ↓                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ÉTAPE 2: QUIZ                                 │  │
│  │  • Verrouillé tant que Leçon < 100%            │  │
│  │  • Requis : Leçon complète                     │  │
│  │  • Débloque : Exercices                        │  │
│  └─────────────────────────────────────────────────┘  │
│                         ↓                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ÉTAPE 3: EXERCICES                            │  │
│  │  • Verrouillé tant que Quiz non soumis         │  │
│  │  • Requis : Quiz terminé                       │  │
│  │  • Débloque : Bouton "Envoyer mon travail"     │  │
│  └─────────────────────────────────────────────────┘  │
│                         ↓                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  FINALISATION                                  │  │
│  │  • Tous les exercices évalués                  │  │
│  │  • Bouton "Envoyer mon travail" activé         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Logique de déblocage

```typescript
// components/views/ActivityView.tsx
const disabledStages = (() => {
  const disabled: LessonStage[] = [];

  // 1. Vérifier si leçon existe
  const hasLesson = !!(chapter.lesson || chapter.lessonFile);

  // 2. Vérifier progression leçon (95% minimum)
  const lessonPercent = Math.max(
    lessonMeta?.scrollProgress ?? 0,
    lessonMeta?.checklistPercentage ?? 0
  );
  const isLessonDone = lessonMeta?.isRead || lessonPercent >= 95;

  // 3. Vérifier quiz
  const quizDone = chapterProgress?.quiz?.isSubmitted;

  // 4. Bloquer les étapes selon les conditions
  if (!hasLesson) disabled.push('lesson');
  if (!isLessonDone) disabled.push('quiz', 'exercises');
  else if (!quizDone) disabled.push('exercises');

  return disabled;
})();
```

### Composant StageBreadcrumb

Le fil d'Ariane permet de naviguer rapidement :

```typescript
<StageBreadcrumb
  currentStage="quiz"
  onNavigateHome={() => goTo('dashboard')}
  onNavigateSteps={() => goTo('work-plan')}
  onSelectStage={(stage) => goTo(stage)}
  disabledStages={['exercises']} // Verrouillé si quiz non fait
/>
```

Rendu :
```
Page principale → Plan de travail → [Leçon] [Vidéos] [Quiz] [Exercices 🔒]
```

### Cas d'usage

#### Scénario 1 : Début de chapitre
```typescript
{
  lesson: { scrollProgress: 0, isRead: false },
  quiz: { isSubmitted: false },
  exercises: {}
}
// → Quiz et Exercices verrouillés
```

#### Scénario 2 : Leçon complétée
```typescript
{
  lesson: { scrollProgress: 100, isRead: true },
  quiz: { isSubmitted: false },
  exercises: {}
}
// → Quiz déverrouillé, Exercices verrouillés
```

#### Scénario 3 : Quiz terminé
```typescript
{
  lesson: { scrollProgress: 100, isRead: true },
  quiz: { isSubmitted: true, score: 85 },
  exercises: {}
}
// → Tout déverrouillé
```

### Navigation entre les vues

```typescript
// App.tsx - Routage basé sur state.view
const renderView = () => {
  switch (state.view) {
    case 'login': return <LoginView />;
    case 'dashboard': return <DashboardView />;
    case 'work-plan': return <ChapterHubView />;
    case 'activity': return <ActivityView />;
    case 'concours': return <ConcoursView />;
    case 'concours-list': return <ConcoursListView />;
    case 'concours-resume': return <ConcoursResumeView />;
    case 'concours-quiz': return <ConcoursQuizView />;
    default: return <LoginView />;
  }
};
```

### Changement de vue

```typescript
// Via dispatch
dispatch({
  type: 'CHANGE_VIEW',
  payload: {
    view: 'activity',
    chapterId: '1',
    subView: 'quiz'
  }
});
```

---

## 🎨 Modales (Orientation & Aide)

### Modal d'orientation

**Composant** : `components/OrientationModal.tsx`

**But** : Afficher le programme complet d'une classe avec contenus et capacités.

**Déclenchement** : Clic sur bouton "Programme" dans le Dashboard.

#### Structure

```typescript
<OrientationModal
  isOpen={showOrientation}
  onClose={() => setShowOrientation(false)}
  classId="tc" // tronc commun
/>
```

#### Contenu

- **En-tête** : Statistiques globales
  - Nombre total de chapitres
  - Nombre total de contenus
  - Nombre total de capacités

- **Filtres** : Par section (Algèbre, Analyse, Géométrie)

- **Chapitres accordéon** :
  ```
  📖 Chapitre 1 : Nombres complexes
      ├── Contenus (8)
      │   ├── Forme algébrique
      │   ├── Forme trigonométrique
      │   └── ...
      └── Capacités (12)
          ├── Calculer un module
          ├── Résoudre dans ℂ
          └── ...
  ```

#### Données source

```typescript
// data/chaptersData.ts
export const chapters: Chapter[] = [
  {
    id: 1,
    title: "Nombres complexes",
    section: "Algèbre",
    contents: [
      "Ensemble $\\mathbb{C}$ des nombres complexes",
      "Forme algébrique $z = a + ib$",
      // ...
    ],
    capacities: [
      "Déterminer le module et l'argument d'un nombre complexe",
      "Résoudre dans $\\mathbb{C}$ une équation du second degré",
      // ...
    ]
  }
];
```

### Modal d'aide

**Composant** : `components/HelpModal.tsx`

**But** : Guide d'utilisation bilingue (Français/Arabe).

**Déclenchement** : Clic sur bouton "?" dans le header.

#### Structure

```typescript
<HelpModal
  isOpen={showHelp}
  onClose={() => setShowHelp(false)}
/>
```

#### Contenu bilingue

**Onglets** :
- 🇫🇷 Français
- 🇦🇪 العربية (RTL)

**Sections** :

1. **📖 Leçons interactives**
   - Exploration des cours
   - Navigation entre sections
   - Maîtrise des concepts

2. **🎥 Capsules vidéos**
   - Vidéos courtes et ciblées
   - Explications visuelles

3. **📝 Quiz interactifs**
   - Tests de connaissances
   - Corrections détaillées

4. **✏️ Exercices & Auto-évaluation**
   - 🟢 **J'ai réussi facilement** : Maîtrise !
   - 🟡 **J'ai réfléchi** : Bien, la pratique consolide
   - 🔴 **C'était un défi** : À discuter en cours

5. **✅ Finaliser et envoyer**
   - Envoi du travail
   - Résumé de progression

6. **📞 Contact**
   - Facebook : [Maths New Horizons](https://web.facebook.com/Maths.new.horizons)
   - WhatsApp : +212 674 680 119
   - Gmail : bdh.malek@gmail.com

#### Particularités techniques

```typescript
// Support RTL pour l'arabe
<div dir="rtl">
  <h3>! مرحباً بكم في المركز العلمي للرياضيات</h3>
</div>
```

---

## 📧 Soumission du travail via Resend

### Workflow complet

```
┌────────────────────────────────────────────────────────────┐
│  1. Étudiant termine toutes les activités                 │
│     ✅ Leçon 100%                                          │
│     ✅ Quiz soumis                                         │
│     ✅ Tous exercices évalués                              │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  2. Bouton "Envoyer mon travail" activé                   │
│     <GlobalWorkSubmit isReady={true} />                   │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  3. Modal de confirmation                                  │
│     <ConfirmationModal                                     │
│       chapterTitle="Nombres complexes"                     │
│       onSubmit={handleSubmit} />                           │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  4. Collecte des données de progression                    │
│     - Nom de l'étudiant                                    │
│     - Titre du chapitre                                    │
│     - Progression leçon (paragraphes, pourcentage)         │
│     - Score quiz (brut, pourcentage)                       │
│     - Feedback exercices (easy/medium/hard)                │
│     - Durée totale (secondes)                              │
│     - Date de soumission                                   │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  5. Appel API /api/submit-work                            │
│     POST avec {studentName, chapterTitle, progressData}    │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  6. Serveur Vercel reçoit la requête                      │
│     - Validation des champs requis                         │
│     - Parsing du JSON progressData                         │
│     - Génération du nom de fichier                         │
│     - Conversion JSON → Buffer                             │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  7. Envoi email via Resend API                            │
│     - from: 'Math Pedago <onboarding@resend.dev>'        │
│     - to: 'bdh.malek@gmail.com'                           │
│     - subject: ✅ Nouveau travail: Ahmed - Complexes      │
│     - html: Email stylisé avec récapitulatif              │
│     - attachments: progression_ahmed_1699999999.json       │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  8. Réponse API                                            │
│     { success: true, messageId: 'abc123' }                │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│  9. Interface utilisateur                                  │
│     - Dispatch: SUBMIT_WORK                                │
│     - Notification: "Travail envoyé avec succès !"         │
│     - Confettis pendant 5 secondes 🎉                      │
│     - Marquage chapitre comme "submitted"                  │
└────────────────────────────────────────────────────────────┘
```

### Composant GlobalWorkSubmit

```typescript
// components/GlobalWorkSubmit.tsx
<GlobalWorkSubmit
  isReady={allExercisesDone && quizSubmitted && lessonComplete}
  isSubmitted={chapterProgress.isSubmitted}
  chapterId="1"
  chapterTitle="Nombres complexes"
/>
```

#### États du bouton

```typescript
// Désactivé (gris)
isReady = false
→ "Terminez le quiz et évaluez tous les exercices"

// Activé (bleu)
isReady = true && !isSubmitted
→ "Envoyer mon travail au professeur"

// Déjà soumis (vert)
isSubmitted = true
→ "✅ Travail déjà envoyé"
```

### Structure de l'API

**Endpoint** : `api/submit-work.ts` (Vercel Serverless Function)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validation
  const { studentName, chapterTitle, progressData } = req.body;

  // Parsing
  const parsedData = typeof progressData === 'string'
    ? JSON.parse(progressData)
    : progressData;

  // Création fichier JSON
  const filename = `progression_${sanitizedName}_${timestamp}.json`;
  const jsonBuffer = Buffer.from(JSON.stringify(parsedData, null, 2), 'utf-8');

  // Envoi email
  const data = await resend.emails.send({
    from: 'Math Pedago <onboarding@resend.dev>',
    to: 'bdh.malek@gmail.com',
    subject: `✅ Nouveau travail soumis: ${studentName} - ${chapterTitle}`,
    html: `<html>...</html>`,
    attachments: [{ filename, content: jsonBuffer }]
  });

  return res.status(200).json({ success: true, messageId: data.id });
}
```

### Contenu de l'email

**HTML stylisé** avec tableau récapitulatif :

| Champ | Valeur |
|-------|--------|
| 👤 Étudiant | Ahmed Ben Ali |
| 📖 Chapitre | Nombres complexes |
| 📊 Progression Leçon | 15/15 paragraphes (100%) |
| 📝 Score Quiz | 8/10 (80%) |
| ⏱️ Durée Totale | 45 minutes |
| 📅 Date de Soumission | 2024-11-15 14:32 |
| ✏️ Exercices Évalués | 5 exercices |

**Pièce jointe JSON** :

```json
{
  "studentName": "Ahmed Ben Ali",
  "classId": "tc",
  "chapterId": "1",
  "chapterTitle": "Nombres complexes",
  "submissionDate": "2024-11-15T14:32:18.123Z",
  "results": [
    {
      "lesson": {
        "completed": 15,
        "total": 15,
        "percentage": 100,
        "durationSeconds": 1200
      },
      "quiz": {
        "score": 80,
        "scoreRaw": "8/10",
        "attempts": 1,
        "durationSeconds": 600
      },
      "exercisesFeedback": {
        "ex1": { "feedback": "easy", "timestamp": 1699999999 },
        "ex2": { "feedback": "medium", "timestamp": 1699999999 },
        "ex3": { "feedback": "hard", "timestamp": 1699999999 }
      },
      "totalDurationSeconds": 2700
    }
  ]
}
```

### Configuration Resend

**Variables d'environnement** (`.env`) :

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RECIPIENT_EMAIL=bdh.malek@gmail.com
FROM_EMAIL=Math Pedago <onboarding@resend.dev>
```

**Installation** :

```bash
npm install resend
```

### Gestion des erreurs

```typescript
try {
  const response = await fetch('/api/submit-work', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, chapterTitle, progressData })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  addNotification('Travail envoyé avec succès !', 'success');
} catch (error) {
  console.error('Erreur envoi:', error);
  addNotification('Erreur lors de l\'envoi', 'error');
}
```

---

## 📊 Suivi de progression

### Service de progression

**Fichier** : `services/lessonProgressService.ts`

#### Suivi leçon

```typescript
// Marquer un paragraphe comme lu
markParagraphAsRead(lessonId: string, paragraphIndex: number): void

// Calculer progression
getLessonProgress(lessonId: string): {
  completed: number;
  total: number;
  percentage: number;
}

// Événement de mise à jour
window.dispatchEvent(new CustomEvent('lesson-progress-update', {
  detail: { lessonId, progress }
}));
```

#### Suivi quiz

```typescript
interface QuizProgress {
  isSubmitted: boolean;
  score: number;           // 0-100
  scoreRaw: string;        // "8/10"
  attempts: number;
  lastAttemptDate: string;
  durationSeconds: number;
}
```

#### Suivi exercices

```typescript
type ExerciseFeedback = 'easy' | 'medium' | 'hard';

interface ExerciseProgress {
  [exerciseId: string]: {
    feedback: ExerciseFeedback;
    timestamp: number;
  }
}
```

### Composant de progression

```typescript
// Barre de progression leçon
<div className="progress-bar">
  <div style={{ width: `${lessonCompletion.percentage}%` }}>
    {lessonCompletion.completed} / {lessonCompletion.total}
  </div>
</div>

// Badge statut chapitre
<Badge status={getChapterStatus(progress)}>
  {/* completed | in_progress | not_started */}
</Badge>
```

### Calcul du statut global

```typescript
// utils/chapterStatusHelpers.ts
export function getChapterStatus(progress: ChapterProgress): ChapterStatus {
  const { lesson, quiz, exercises } = progress;

  // Tout fait + soumis
  if (progress.isSubmitted) return 'completed';

  // Leçon + Quiz + Exercices
  const lessonDone = lesson?.isRead || lesson?.scrollProgress >= 95;
  const quizDone = quiz?.isSubmitted;
  const exercisesDone = Object.keys(exercises || {}).length >= 3;

  if (lessonDone && quizDone && exercisesDone) return 'ready_to_submit';
  if (lessonDone || quizDone) return 'in_progress';

  return 'not_started';
}
```

### Persistance

Toutes les progressions sont sauvegardées en temps réel dans localStorage via `StorageService` :

```typescript
// Après chaque action
storageService.set('math-pedago:app:v5.0', updatedState);
```

---

## ✅ Validation des JSON

L'application intègre un **système de validation robuste** pour détecter automatiquement les erreurs dans les fichiers JSON.

### Architecture du validateur

**Fichier** : `utils/jsonValidator.ts`

```typescript
interface ValidationError {
  type: 'structure' | 'math' | 'content' | 'parsing';
  severity: 'error' | 'warning';
  message: string;
  file?: string;
  line?: number;
  path?: string; // Chemin JSON (ex: "sections[0].subsections[1].elements[3]")
  suggestion?: string;
  code?: string; // Code d'erreur
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

### Types de validation

#### 1. Validation de structure

Détecte les erreurs de syntaxe JSON et de structure :

```typescript
// ❌ ERREUR détectée
{
  "type": "p",
  "content": ["item 1", "item 2"],  // Tableau au lieu de string
  "listType": "bullet"  // Conflit: type="p" avec listType
}

// Code erreur: TYPE_P_WITH_LISTTYPE
// Suggestion: "Retirez 'type: p'. Les éléments avec listType n'ont pas besoin de type."
```

**Règles validées** :
- `type` doit être parmi les types valides : `p`, `table`, `definition-box`, `theorem-box`, etc.
- Un élément avec `listType` ne peut **PAS** avoir `type: "p"`
- `content` doit être une chaîne si `type: "p"`, un tableau si `listType` est présent
- `sections`, `subsections`, `elements` doivent être des tableaux

#### 2. Validation mathématique (LaTeX)

Détecte les formules LaTeX mal formées :

```typescript
// Vérifications automatiques :
- Délimiteurs $ non fermés (nombre impair)
- Délimiteurs \( \) non appariés
- Délimiteurs \[ \] non appariés
- Accolades {} déséquilibrées dans les formules
- Commandes \frac, \sqrt mal formées
```

**Exemples d'erreurs détectées** :

```typescript
// ❌ Formule non fermée
"La formule est $x^2 + 3x"  // $ manquant
// Code: UNCLOSED_MATH_DELIMITER

// ❌ Accolades déséquilibrées
"$\frac{a{b}$"  // } manquant
// Code: UNBALANCED_BRACES

// ❌ Commande mal formée
"$\frac a + b$"  // Doit être \frac{a}{b}
// Code: MALFORMED_FRAC
```

#### 3. Validation de contenu

Vérifie la cohérence des données :

```typescript
// Practice-box avec solution manquante
{
  "type": "practice-box",
  "content": ["Question 1", "Question 2"],
  "solution": ["Réponse 1"]  // ❌ Nombre différent
}
// Code: SOLUTION_MISMATCH
// Suggestion: "Assurez-vous qu'il y a une solution pour chaque question"
```

### API de validation

```typescript
// Valider une leçon
import { validateLesson, formatValidationResults } from './utils/jsonValidator';

const result = validateLesson(lessonData, 'tc-nombres-complexes.json', jsonText);

if (!result.valid) {
  console.log(formatValidationResults(result));
  /*
  ═══ ERREURS ═══

  1. 🏗️ ❌ ERREUR [TYPE_P_WITH_LISTTYPE]
     📍 Fichier: tc-nombres-complexes.json:45
     🔍 Chemin: sections[0].subsections[2].elements[3]
     💬 Erreur: un élément avec "listType" ne peut pas avoir "type": "p"
     💡 Solution: Retirez la propriété "type": "p" de cet élément
  */
}

// Valider un chapitre (quiz + exercices)
const chapterResult = validateChapter(chapterData, 'tc-1.json', jsonText);
```

### Détection automatique du numéro de ligne

Le validateur **calcule automatiquement** le numéro de ligne de l'erreur dans le fichier JSON source :

```typescript
function findLineNumber(jsonText: string, path: string): number {
  // Parse le chemin: "sections[0].subsections[1].elements[3]"
  // Trouve la ligne correspondante dans le JSON
  return lineNumber;
}
```

### Formatage des erreurs

```typescript
formatValidationError(error);
/*
🏗️ ❌ ERREUR [INVALID_ELEMENT_TYPE]
📍 Fichier: lesson.json:123
🔍 Chemin: sections[2].subsections[0].elements[5].type
💬 Type d'élément invalide: "custom-box"
💡 Solution: Types valides: p, table, definition-box, theorem-box, etc.
*/
```

### Codes d'erreur complets

| Code | Type | Description |
|------|------|-------------|
| `INVALID_ELEMENT_TYPE` | structure | Type d'élément non reconnu |
| `TYPE_P_WITH_LISTTYPE` | structure | Conflit type="p" avec listType |
| `LISTTYPE_REQUIRES_ARRAY` | structure | content doit être un tableau avec listType |
| `PARAGRAPH_REQUIRES_STRING` | structure | content doit être une chaîne pour type="p" |
| `MISSING_SECTIONS` | structure | Propriété "sections" manquante |
| `MISSING_SUBSECTIONS` | structure | Propriété "subsections" manquante |
| `MISSING_ELEMENTS` | structure | Propriété "elements" manquante |
| `UNCLOSED_MATH_DELIMITER` | math | Délimiteur $ non fermé |
| `UNCLOSED_PAREN_DELIMITER` | math | Délimiteur \( \) non fermé |
| `UNCLOSED_BRACKET_DELIMITER` | math | Délimiteur \[ \] non fermé |
| `UNBALANCED_BRACES` | math | Accolades {} déséquilibrées |
| `MALFORMED_FRAC` | math | Commande \frac mal formée |
| `MALFORMED_SQRT` | math | Commande \sqrt mal formée |
| `MISSING_SOLUTION` | content | Solution manquante pour practice-box |
| `SOLUTION_MISMATCH` | content | Nombre solutions ≠ nombre questions |
| `VALIDATION_ERROR` | parsing | Erreur lors de la validation |

### Intégration dans l'application

Le validateur est utilisé :
1. **Au chargement des fichiers JSON** (détection précoce)
2. **Dans ErrorBoundary** (diagnostic des erreurs runtime)
3. **En développement** (tests automatiques)

---

## 🛡️ Gestion des erreurs (ErrorBoundary)

L'application utilise un **ErrorBoundary React** intelligent qui détecte et analyse les erreurs pour fournir des messages clairs et des solutions.

### Architecture

**Fichier** : `components/ErrorBoundary.tsx`

```typescript
interface ParsedErrorInfo {
  type: 'structure' | 'math' | 'content' | 'runtime' | 'unknown';
  title: string;
  message: string;
  file?: string;
  line?: number;
  path?: string;
  suggestion?: string;
  details?: string;
}
```

### Détection intelligente des erreurs

L'ErrorBoundary **analyse automatiquement** les messages d'erreur pour identifier le problème :

#### 1. Erreur `.trim is not a function`

```typescript
// Détection
if (errorMessage.includes('.trim is not a function')) {
  return {
    type: 'structure',
    title: 'Erreur de structure JSON',
    message: 'Un élément de type "p" contient un tableau au lieu d\'une chaîne',
    suggestion: 'Retirez "type": "p" et utilisez "listType": "bullet"'
  };
}
```

**Cause** : Un paragraphe (`type: "p"`) reçoit un tableau au lieu d'une chaîne.

**Solution affichée** :
```
❌ INCORRECT:
{
  "type": "p",
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}

✅ CORRECT:
{
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}
```

#### 2. Erreur `map is not a function`

```typescript
if (errorMessage.includes('map is not a function')) {
  return {
    type: 'structure',
    title: 'Erreur de type de données',
    message: 'Un tableau était attendu mais une autre valeur a été fournie',
    suggestion: 'Vérifiez que "sections", "elements" sont bien des tableaux []'
  };
}
```

#### 3. Erreur LaTeX/Math

```typescript
if (errorMessage.includes('KaTeX') || errorMessage.includes('$')) {
  return {
    type: 'math',
    title: 'Erreur dans une formule mathématique',
    message: 'Une formule LaTeX est mal formée',
    suggestion: 'Vérifiez les $ fermés, accolades {} équilibrées'
  };
}
```

**Exemples de formules correctes affichés** :
```javascript
// Inline math:
"La formule est $x^2 + 3x + 2$"

// Fraction:
"$\\frac{a}{b}$" ou "$\\dfrac{a}{b}$"

// Racine:
"$\\sqrt{x}$" ou "$\\sqrt[3]{x}$"
```

#### 4. Erreur `Cannot read property`

```typescript
if (errorMessage.includes('Cannot read property')) {
  return {
    type: 'content',
    title: 'Propriété manquante',
    message: 'Tentative d\'accès à une propriété sur undefined/null',
    suggestion: 'Vérifiez que toutes les propriétés requises sont présentes'
  };
}
```

### Extraction du fichier source

L'ErrorBoundary **extrait automatiquement** le nom du fichier depuis la stack trace :

```typescript
private extractFileFromStack(stack: string): string {
  // Chercher "lessons/xxx.json" ou "chapters/xxx.json"
  const jsonMatch = stack.match(/(?:lessons|chapters|public)\/[^\s)]+\.json/);
  if (jsonMatch) return jsonMatch[0];

  // Chercher le composant React
  const componentMatch = stack.match(/at (\w+) \(/);
  if (componentMatch) return `Component: ${componentMatch[1]}`;

  return 'Stack trace non disponible';
}
```

### Interface utilisateur

L'ErrorBoundary affiche une page d'erreur **claire et actionnable** :

```
┌─────────────────────────────────────────────────┐
│ 🏗️  Erreur de structure JSON                    │
│ Type: STRUCTURE                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ ❌ Un élément de type "p" contient un tableau   │
│    au lieu d'une chaîne de caractères          │
│                                                 │
│ 📍 Fichier concerné: tc-1.json                 │
│                                                 │
│ 💡 Comment corriger:                            │
│    Retirez "type": "p" et utilisez             │
│    "listType": "bullet" ou "numbered"          │
│                                                 │
│ ✅ Exemple de structure correcte:               │
│    [Code example...]                            │
│                                                 │
│ 🔧 Détails techniques (pour développeurs)      │
│    [Collapsible stack trace...]                │
│                                                 │
│ [← Retour]  [🔄 Recharger l'application]       │
│                                                 │
│ 💡 Besoin d'aide? Vérifiez la console (F12)    │
└─────────────────────────────────────────────────┘
```

### Codes couleur par type

| Type | Icône | Couleur |
|------|-------|---------|
| `structure` | 🏗️ | Rouge |
| `math` | 🔢 | Bleu |
| `content` | 📝 | Jaune |
| `runtime` | ⚙️ | Violet |

### Actions disponibles

```typescript
// Bouton "Retour"
handleGoBack = () => window.history.back();

// Bouton "Recharger"
handleReset = () => window.location.reload();
```

### Lifecycle React

```typescript
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    // Capture l'erreur
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }
}
```

### Intégration

```typescript
// index.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Toute erreur non gérée dans l'application est **automatiquement capturée**, analysée et présentée de manière compréhensible à l'utilisateur.

---

## ⏱️ Système de chronométrage des quiz

Les quiz intègrent un **système de chronométrage précis** qui mesure le temps passé sur chaque question et le temps total.

### Architecture du timer

**Fichier** : `components/quiz/Quiz.tsx`

```typescript
// Références pour le timer
const timerRef = useRef<number | null>(null);
const latestTimeRef = useRef<number>(0);

// État du temps écoulé (en secondes)
const [timeSpent, setTimeSpent] = useState(() => persistedDuration);
```

### Démarrage automatique

Le timer démarre **automatiquement** quand l'utilisateur entre dans le quiz :

```typescript
useEffect(() => {
  // Ne pas démarrer si en mode révision ou quiz déjà soumis
  if (isReviewMode || isSubmitted) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return;
  }

  // Démarrer le timer (incrémente chaque seconde)
  timerRef.current = window.setInterval(() => {
    setTimeSpent(prev => prev + 1);
  }, 1000);

  // Cleanup
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [isReviewMode, isSubmitted]);
```

### Persistance du temps

Le temps est **sauvegardé en temps réel** pour éviter toute perte en cas de fermeture accidentelle :

#### 1. Sauvegarde au démontage du composant

```typescript
useEffect(() => {
  if (!chapter) return;

  return () => {
    // Sauvegarder avant de quitter
    dispatch({
      type: 'SET_QUIZ_DURATION',
      payload: {
        chapterId: chapter.id,
        duration: latestTimeRef.current
      }
    });
  };
}, [chapter, dispatch]);
```

#### 2. Sauvegarde avant fermeture du navigateur

```typescript
useEffect(() => {
  if (!chapter) return;

  const handleBeforeUnload = () => {
    dispatch({
      type: 'SET_QUIZ_DURATION',
      payload: {
        chapterId: chapter.id,
        duration: latestTimeRef.current
      }
    });
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [chapter, dispatch]);
```

#### 3. Sauvegarde lors de la soumission

```typescript
useEffect(() => {
  if (!chapter) return;
  if (isReviewMode || isSubmitted) {
    // Sauvegarder immédiatement
    dispatch({
      type: 'SET_QUIZ_DURATION',
      payload: {
        chapterId: chapter.id,
        duration: latestTimeRef.current
      }
    });
  }
}, [chapter, dispatch, isReviewMode, isSubmitted]);
```

### Affichage du temps

Le temps est formaté en **MM:SS** et affiché en permanence :

```typescript
const formattedTime = useMemo(() => {
  const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
  const seconds = (timeSpent % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}, [timeSpent]);

// Affichage
<div className="timer">
  ⏱️ {formattedTime}
</div>
```

**Exemples** :
- `00:45` → 45 secondes
- `05:30` → 5 minutes 30 secondes
- `12:08` → 12 minutes 8 secondes

### Restauration du temps

Quand l'utilisateur revient au quiz, le temps est **restauré** :

```typescript
const {
  duration: persistedDuration = 0  // Temps sauvegardé
} = quizProgress || {};

const [timeSpent, setTimeSpent] = useState(() => persistedDuration);

useEffect(() => {
  setTimeSpent(persistedDuration);
  latestTimeRef.current = persistedDuration;
}, [persistedDuration]);
```

### Utilisation de `useRef` pour la précision

```typescript
// latestTimeRef garde toujours la valeur la plus récente
// Évite les problèmes de closure dans les callbacks
useEffect(() => {
  latestTimeRef.current = timeSpent;
}, [timeSpent]);
```

### États du timer

| État | Timer actif | Sauvegarde |
|------|-------------|------------|
| **Quiz en cours** | ✅ Oui (incrémente) | ✅ Automatique |
| **Quiz soumis** | ❌ Non (arrêté) | ✅ Sauvegardé |
| **Mode révision** | ❌ Non (arrêté) | ✅ Sauvegardé |
| **Fermeture navigateur** | ⏸️ Suspendu | ✅ Avant fermeture |
| **Changement de page** | ⏸️ Suspendu | ✅ Au démontage |

### Intégration dans la progression

Le temps est inclus dans le rapport de soumission :

```json
{
  "quiz": {
    "score": 80,
    "scoreRaw": "8/10",
    "durationSeconds": 450,  // 7 minutes 30 secondes
    "attempts": 1
  }
}
```

### Avantages du système

1. **Précision** : Incrémentation à la seconde près
2. **Persistance** : Aucune perte de données
3. **Performance** : Utilisation de `useRef` pour éviter les re-renders inutiles
4. **Fiabilité** : Sauvegarde multiple (démontage, beforeunload, soumission)
5. **UX** : Affichage temps réel formaté

---

## 📖 Sommaire des concours

Le système de **résumé des concours** permet d'agréger et d'afficher les contenus pédagogiques de manière flexible.

### Architecture

**Fichier** : `components/views/ConcoursResumeView.tsx`

```typescript
interface ConcoursData {
  id: string;
  concours: string;
  annee: string;
  theme: string;
  resume: {
    title: string;
    introduction: string;
    sections: ConcoursResumeSection[];
  };
  quiz: QuizQuestion[];
}

interface ConcoursResumeSection {
  type: 'definitions' | 'formules' | 'methodes' | 'pieges' | 'reflexion';
  titre: string;
  items: string[];
}
```

### Modes de navigation

Le système supporte **2 modes** :

#### 1. Mode "année" (single file)

Charge un seul fichier JSON pour une année spécifique :

```typescript
// localStorage
localStorage.setItem('currentConcoursFile', '/public/concours/ensa/2024-probabilites.json');
localStorage.setItem('concoursNavigationMode', 'year');

// Chargement
fetch(concoursFile)
  .then(res => res.json())
  .then((data: ConcoursData) => {
    setConcoursData(data);
  });
```

#### 2. Mode "thème" (multiple files aggregation)

Agrège **plusieurs fichiers JSON** pour un même thème sur différentes années :

```typescript
// localStorage
localStorage.setItem('concoursNavigationMode', 'theme');
localStorage.setItem('concoursThemeFiles', JSON.stringify([
  { file: '/public/concours/ensa/2018-probabilites.json' },
  { file: '/public/concours/ensa/2022-probabilites.json' },
  { file: '/public/concours/ensa/2024-probabilites.json' }
]));

// Chargement et agrégation
Promise.all(files.map(f => fetch(f.file).then(r => r.json())))
  .then(all => {
    const valid = all.filter(Boolean) as ConcoursData[];

    // Combiner les sections de résumé
    const combinedSections = valid.reduce((acc, d) => {
      return acc.concat(d.resume.sections);
    }, []);

    // Combiner les quiz
    const combinedQuiz = valid.reduce((acc, d) => {
      return acc.concat(d.quiz || []);
    }, []);

    // Créer un objet agrégé
    const aggregated: ConcoursData = {
      ...base,
      resume: {
        title: `${base.theme} — Résumé agrégé`,
        introduction: base.resume.introduction,
        sections: combinedSections
      },
      quiz: combinedQuiz
    };

    setConcoursData(aggregated);
  });
```

### Structure des sections

Chaque section a un **type** qui détermine son style visuel :

```typescript
type SectionType = 'definitions' | 'formules' | 'methodes' | 'pieges' | 'reflexion';
```

| Type | Couleur | Icône | Usage |
|------|---------|-------|-------|
| `definitions` | Bleu | 📘 | Définitions mathématiques clés |
| `formules` | Violet | 🔮 | Formules essentielles à retenir |
| `methodes` | Vert | 💡 | Méthodes et astuces de résolution |
| `pieges` | Rouge | ⚠️ | Pièges courants et erreurs à éviter |
| `reflexion` | Indigo | 🤔 | Points de réflexion importants |

### Exemple de résumé agrégé

```json
{
  "id": "ensa-probabilites-theme",
  "concours": "ENSA",
  "theme": "Probabilités",
  "resume": {
    "title": "Probabilités — Résumé agrégé (2018-2024)",
    "introduction": "Compilation des concepts essentiels...",
    "sections": [
      // De 2018
      {
        "type": "definitions",
        "titre": "Concepts de base (2018)",
        "items": [
          "**Univers** : $\\Omega$",
          "**Événement** : Sous-ensemble de $\\Omega$"
        ]
      },
      // De 2022
      {
        "type": "formules",
        "titre": "Formules avancées (2022)",
        "items": [
          "**Bayes** : $P(B|A) = \\frac{P(A|B) \\cdot P(B)}{P(A)}$"
        ]
      },
      // De 2024
      {
        "type": "methodes",
        "titre": "Nouvelles méthodes (2024)",
        "items": [
          "**Arbres pondérés** : Multiplier sur branches"
        ]
      }
    ]
  },
  "quiz": [
    /* Questions de 2018, 2022, 2024 combinées */
  ]
}
```

### Navigation entre sections

L'interface permet de naviguer entre les sections :

```typescript
const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

// Section précédente
const handlePrevSection = () => {
  setCurrentSectionIndex(prev => Math.max(0, prev - 1));
};

// Section suivante
const handleNextSection = () => {
  setCurrentSectionIndex(prev =>
    Math.min(concoursData.resume.sections.length - 1, prev + 1)
  );
};
```

### Affichage des sections

Chaque section utilise le composant `FormattedText` pour le rendu LaTeX :

```typescript
<FormattedText content={item} />
// Rend: "**Formule** : $x^2 + 3x + 2$"
// → <strong>Formule</strong> : [MathJax rendered]
```

### Détection des pièges

Les items contenant **ATTENTION**, **DANGER**, ou **PIÈGE** reçoivent un style spécial :

```typescript
const isPiege = item.match(/\*\*(ATTENTION|DANGER|PIÈGE)\*\*/);

if (isPiege) {
  // Bordure rouge, fond rouge clair
  className = "border-l-4 border-red-500 bg-red-50 p-3";
}
```

**Exemple** :
```json
{
  "type": "pieges",
  "items": [
    "**ATTENTION** : $|z + z'| \\neq |z| + |z'|$ en général"
  ]
}
```

Rendu :
```
┌─────────────────────────────────────────┐
│ ⚠️ PIÈGES À ÉVITER                      │
├─────────────────────────────────────────┤
│ ⚠️ ATTENTION : |z + z'| ≠ |z| + |z'|   │
│    en général                           │
│    [Bordure rouge, fond rouge clair]   │
└─────────────────────────────────────────┘
```

### Transition vers le quiz

Une fois le résumé lu, l'utilisateur peut passer au quiz :

```typescript
const [confirmed, setConfirmed] = useState(false);

const handleStartQuiz = () => {
  if (!confirmed) {
    setConfirmed(true);  // Demander confirmation
    return;
  }
  // Passer au quiz
  dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-quiz' } });
};
```

### Avantages de l'agrégation

1. **Vue complète** : Compile tous les concepts d'un thème sur plusieurs années
2. **Révision optimale** : Évite les redondances, regroupe les notions
3. **Évolution** : Montre l'évolution des sujets dans le temps
4. **Flexibilité** : Peut afficher mode année OU mode thème sans changement de code
5. **Performance** : Chargement parallèle avec `Promise.all()`

---

## 🚀 Installation et développement

### Prérequis

- **Node.js** : v18+ recommandé
- **npm** : v9+
- **Git**

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Abdel00zz/Math-pedago.git
cd Math-pedago

# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RECIPIENT_EMAIL=bdh.malek@gmail.com
FROM_EMAIL=Math Pedago <onboarding@resend.dev>
```

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173
```

### Build production

```bash
# Construire l'application
npm run build

# Prévisualiser la build
npm run preview
```

### Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déploiement production
vercel --prod
```

**Configuration Vercel** :
- Framework Preset : **Vite**
- Root Directory : `./`
- Build Command : `npm run build`
- Output Directory : `dist`

### Structure de développement

```bash
# Lancer le dev
npm run dev

# Tests TypeScript
npx tsc --noEmit

# Formater le code
npx prettier --write "**/*.{ts,tsx,json,css}"
```

---

## 🛠️ Technologies utilisées

### Frontend

| Techno | Version | Usage |
|--------|---------|-------|
| **React** | 19.1.1 | Framework UI |
| **TypeScript** | 5.8.2 | Typage statique |
| **Vite** | 6.2.0 | Build tool |
| **Tailwind CSS** | 4.1.16 | Styling |
| **MathJax** | 3.x | Rendu LaTeX |

### Backend

| Techno | Version | Usage |
|--------|---------|-------|
| **Vercel Functions** | - | Serverless API |
| **Resend** | 6.2.2 | Service email |

### Gestion d'état

- **React Context API** (AppContext, LessonProgressContext)
- **localStorage** via `StorageService`

### PWA

- **Service Worker** (`sw.js`)
- **Manifest** (`manifest.webmanifest`)
- **Installable** sur mobile et desktop

### Utilitaires

- **uuid** : Génération d'identifiants uniques
- **KaTeX** : Alternative LaTeX (backup)

---

## 📂 Fichiers importants

| Fichier | Description |
|---------|-------------|
| `index.tsx` | Point d'entrée React |
| `App.tsx` | Routeur principal |
| `services/StorageService.ts` | Gestion localStorage |
| `api/submit-work.ts` | Endpoint Resend |
| `context/AppContext.tsx` | État global |
| `components/GlobalWorkSubmit.tsx` | Soumission travail |
| `components/OrientationModal.tsx` | Programme d'orientation |
| `components/HelpModal.tsx` | Guide d'aide |
| `public/concours/**/*.json` | Données concours |
| `sw.js` | Service Worker PWA |

---

## 📝 Conventions de code

### Nommage

- **Composants** : PascalCase (`GlobalWorkSubmit.tsx`)
- **Fichiers** : camelCase (`storageService.ts`)
- **Constants** : UPPER_SNAKE_CASE (`STORAGE_KEYS`)
- **Types** : PascalCase (`ChapterProgress`)

### Structure composant

```typescript
// Imports
import React, { useState, useEffect } from 'react';
import { useAppState } from './context/AppContext';

// Types
interface MyComponentProps {
  title: string;
  isActive?: boolean;
}

// Composant
const MyComponent: React.FC<MyComponentProps> = ({ title, isActive = false }) => {
  // Hooks
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Side effects
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {title}
    </div>
  );
};

export default MyComponent;
```

---

## 🤝 Contribution

Cette plateforme est développée par **Boudouh Abdelmalek** au Maroc.

Pour toute suggestion ou question :
- 📧 Email : bdh.malek@gmail.com
- 💬 WhatsApp : +212 674 680 119
- 📘 Facebook : [Maths New Horizons](https://web.facebook.com/Maths.new.horizons)

---

## 📄 Licence

Copyright © 2024 Boudouh Abdelmalek - Tous droits réservés.

---

## 🙏 Remerciements

Merci aux étudiants qui utilisent cette plateforme et contribuent à son amélioration continue ! 🎓

---

**Made with ❤️ in Morocco 🇲🇦**

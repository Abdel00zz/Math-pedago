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

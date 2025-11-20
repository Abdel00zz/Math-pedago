# Documentation Composant Concours

## Vue d'ensemble

Le composant **Concours** est un système complet de préparation aux examens (Médecine, ENSA, ENSAM) intégré à la plateforme Math-pedago. Il offre une expérience d'apprentissage structurée avec des résumés pédagogiques et des quiz interactifs, organisés selon deux modes de navigation intelligents : **par année** ou **par thème**.

---

## Architecture générale

### Composants principaux

Le système Concours est composé de **6 composants React** situés dans `/components/` et `/components/views/`:

| Composant | Fichier | Rôle |
|-----------|---------|------|
| **ConcoursView** | `components/views/ConcoursView.tsx:1-272` | Page d'accueil affichant les concours disponibles |
| **ConcoursListView** | `components/views/ConcoursListView.tsx:1-266` | Navigation par année ou par thème |
| **ConcoursYearView** | `components/views/ConcoursYearView.tsx` | Affichage des chapitres d'une année spécifique |
| **ConcoursResumeView** | `components/views/ConcoursResumeView.tsx:1-150+` | Présentation des résumés pédagogiques |
| **ConcoursQuizView** | `components/views/ConcoursQuizView.tsx:1-150+` | Interface de quiz interactive |
| **ConcoursBackground** | `components/ConcoursBackground.tsx` | Composant de fond SVG réutilisable |

### Schéma de navigation

```
ConcoursView (accueil)
    │
    ├─→ ConcoursListView (mode par année)
    │       ├─→ ConcoursYearView (chapitres de l'année)
    │       │       ├─→ ConcoursResumeView (résumé d'un chapitre)
    │       │       └─→ ConcoursQuizView (quiz global de l'année)
    │       └─→ [retour navigateur]
    │
    └─→ ConcoursListView (mode par thème)
            ├─→ ConcoursResumeView (résumé agrégé multi-années)
            │       └─→ ConcoursQuizView (quiz du thème toutes années)
            └─→ [retour navigateur]
```

---

## Système de navigation bi-modal

### Mode 1 : Navigation par année

**Objectif** : Explorer tous les thèmes d'une année spécifique

**Flux utilisateur** :
1. **ConcoursView** → Sélection du concours (ex: ENSA)
2. **ConcoursListView** → Choix de l'année (ex: 2024)
3. **ConcoursYearView** → Liste des thèmes + bouton "Quiz Global"
   - Clic sur un thème → **ConcoursResumeView** (résumé seul)
   - Clic sur "Quiz Global" → **ConcoursQuizView** (toutes les questions de l'année)

**Exemple** :
- ENSA 2024 contient 4 thèmes : Nombres complexes, Suites et limites, Calcul intégral, Probabilités
- Le Quiz Global agrège les questions des 4 thèmes

**Stockage localStorage** :
```javascript
currentConcoursType: "ensa"
currentConcoursYear: "2024"
concoursNavigationMode: "year"
concoursQuizFiles: ["/.../2024-nombres-complexes.json", "/.../2024-suites-limites.json", ...]
concoursQuizMode: "year"
```

### Mode 2 : Navigation par thème

**Objectif** : Étudier un thème spécifique à travers plusieurs années

**Flux utilisateur** :
1. **ConcoursView** → Sélection du concours (ex: ENSA)
2. **ConcoursListView** → Choix du thème (ex: "Nombres complexes")
3. **ConcoursResumeView** → Résumé agrégé intelligent
   - Fusionne les sections de 2025, 2024, 2022, 2018
   - Bouton "Passer au Quiz"
4. **ConcoursQuizView** → Questions du thème de toutes les années

**Exemple** :
- Thème "Nombres complexes" disponible dans : ENSA 2025, 2024, 2022
- Le résumé fusionne les 3 fichiers
- Le quiz contient toutes les questions de ce thème (toutes années)

**Stockage localStorage** :
```javascript
currentConcoursType: "ensa"
currentConcoursTheme: "Nombres complexes"
concoursNavigationMode: "theme"
concoursThemeFiles: [{"file": "/.../2025-nombres-complexes.json", "annee": "2025"}, ...]
currentConcoursFile: "/concours/ensa/2025-nombres-complexes.json"
```

---

## Types de données (TypeScript)

### Définitions principales (`types.ts:300-369`)

```typescript
// Structure d'une section de résumé
export interface ConcoursResumeSection {
    type: 'definitions' | 'formules' | 'methodes' | 'pieges' | 'reflexion' | 'astuces';
    title: string;
    items: string[]; // Support syntaxe KaTeX ($...$)
}

// Résumé pédagogique complet
export interface ConcoursResume {
    title: string;
    introduction: string;
    sections: ConcoursResumeSection[];
}

// Question de quiz (hérite de Question)
export interface ConcoursQuestion extends Question {
    theme: string;
    type: 'mcq' | 'ordering';
    question: string;
    options?: Option[]; // Pour MCQ
    steps?: string[]; // Pour ordering
    hints: string[];
    explanation: string;
}

// Fichier de concours complet
export interface ConcoursData {
    id: string; // ex: "ensa-2024-nombres-complexes"
    concours: string; // "Médecine", "ENSA", "ENSAM"
    annee: string;
    theme: string;
    resume: ConcoursResume;
    quiz: ConcoursQuestion[];
}

// Structure d'un examen dans index.json
export interface ConcoursExamen {
    annee: string;
    fichiers: {
        id: string;
        theme: string;
        file: string; // Chemin vers le JSON
    }[];
}

// Informations sur un concours
export interface ConcoursInfo {
    id: string; // "medecine", "ensa", "ensam"
    name: string;
    description: string;
    icon: string;
    color: string;
    examens: ConcoursExamen[];
}

// Index global des concours
export interface ConcoursIndex {
    concours: ConcoursInfo[];
}

// Progression de l'utilisateur
export interface ConcoursQuizProgress {
    answers: { [qId: string]: string | string[] };
    currentQuestionIndex: number;
    duration: number;
    hintsUsed: number;
    score?: number;
    completed: boolean;
}

export interface ConcoursProgress {
    [concoursId: string]: {
        resumeRead: boolean;
        quiz: ConcoursQuizProgress;
    };
}
```

---

## Fichiers de données

### Structure des répertoires

```
public/concours/
├── index.json                          # Index global (liste des concours)
├── guide_concours.json                 # Guide de création de fichiers
├── medecine/
│   ├── 2024-nombres-complexes.json
│   └── 2023-suites-numeriques.json
├── ensa/
│   ├── 2025-nombres-complexes.json
│   ├── 2025-suites-limites.json
│   ├── 2025-integrales.json
│   ├── 2025-probabilites.json
│   ├── 2024-nombres-complexes.json
│   ├── 2024-suites-limites.json
│   ├── 2024-integrales.json
│   ├── 2024-probabilites.json
│   ├── 2022-nombres-complexes.json
│   ├── 2022-suites-limites.json
│   ├── 2022-integrales.json
│   ├── 2022-probabilites.json
│   ├── 2018-suites-limites.json
│   ├── 2018-fonctions-analyse.json
│   ├── 2018-geometrie-espace.json
│   └── 2018-probabilites.json
└── ensam/
    └── 2024-fonctions.json
```

### Fichier index.json

**Rôle** : Catalogue de tous les concours disponibles

**Structure** (`public/concours/index.json:1-162`) :
```json
{
  "concours": [
    {
      "id": "medecine",
      "name": "Médecine",
      "description": "Préparation au concours de médecine",
      "icon": "",
      "color": "",
      "examens": [
        {
          "annee": "2024",
          "fichiers": [
            {
              "id": "medecine-2024-nombres-complexes",
              "theme": "Les nombres complexes",
              "file": "/concours/medecine/2024-nombres-complexes.json"
            }
          ]
        }
      ]
    },
    {
      "id": "ensa",
      "name": "ENSA",
      "description": "Préparation au concours de l'École Nationale des Sciences Appliquées",
      "examens": [...]
    },
    {
      "id": "ensam",
      "name": "ENSAM",
      "description": "Préparation au concours de l'École Nationale Supérieure d'Arts et Métiers",
      "examens": [...]
    }
  ]
}
```

**Concours disponibles** :
- **Médecine** : 2 années (2023-2024), 2 thèmes
- **ENSA** : 4 années (2018, 2022, 2024, 2025), 16 fichiers
- **ENSAM** : 1 année (2024), 1 thème

### Fichier de concours individuel

**Exemple** : `/concours/ensa/2024-nombres-complexes.json`

```json
{
  "id": "ensa-2024-nombres-complexes",
  "concours": "ENSA",
  "annee": "2024",
  "theme": "Nombres complexes",
  "resume": {
    "title": "Les nombres complexes - L'essentiel",
    "introduction": "Les nombres complexes permettent de résoudre $x^2 + 1 = 0$...",
    "sections": [
      {
        "type": "definitions",
        "title": "Définitions clés à retenir par cœur",
        "items": [
          "**Unité imaginaire** : $i^2 = -1$",
          "**Forme algébrique** : $z = a + ib$ où $a, b \\in \\mathbb{R}$"
        ]
      },
      {
        "type": "formules",
        "title": "Formules essentielles",
        "items": [
          "**Module** : $|z| = \\sqrt{a^2 + b^2}$",
          "**Conjugué** : $\\overline{a + ib} = a - ib$"
        ]
      },
      {
        "type": "pieges",
        "title": "Pièges à éviter absolument",
        "items": [
          "**ATTENTION** : $|z + z'| \\neq |z| + |z'|$ en général",
          "**DANGER** : $\\arg(zz') = \\arg(z) + \\arg(z')$ modulo $2\\pi$"
        ]
      }
    ]
  },
  "quiz": [
    {
      "id": "q1",
      "theme": "Nombres complexes",
      "question": "Calculer le module de $z = 3 + 4i$",
      "type": "mcq",
      "options": [
        { "id": "a", "text": "5", "isCorrect": true },
        { "id": "b", "text": "7", "isCorrect": false },
        { "id": "c", "text": "$\\sqrt{7}$", "isCorrect": false },
        { "id": "d", "text": "12", "isCorrect": false }
      ],
      "explanation": "$|z| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$",
      "hints": [
        "Utilise la formule $|a + ib| = \\sqrt{a^2 + b^2}$",
        "Calcule $3^2 + 4^2$",
        "C'est un triangle pythagoricien classique (3-4-5)"
      ]
    },
    {
      "id": "q2",
      "theme": "Nombres complexes",
      "question": "Ordonner les étapes pour calculer le module de $z$",
      "type": "ordering",
      "steps": [
        "Identifier $a$ et $b$ dans $z = a + ib$",
        "Calculer $a^2 + b^2$",
        "Prendre la racine carrée",
        "Écrire $|z| = \\sqrt{a^2 + b^2}$"
      ],
      "explanation": "Pour calculer le module, on suit ces étapes dans l'ordre.",
      "hints": [
        "Commence par identifier les parties réelle et imaginaire",
        "La dernière étape est d'écrire le résultat final"
      ]
    }
  ]
}
```

### Guide de création (`guide_concours.json`)

**Contenu détaillé** : Documentation complète pour créer de nouveaux fichiers de concours
- Structure générale obligatoire
- Types de sections (definitions, formules, methodes, pieges, reflexion, astuces)
- Syntaxe KaTeX (formules mathématiques)
- Format des questions MCQ et ordering
- Bonnes pratiques
- Exemple complet

---

## Fonctionnalités détaillées

### 1. ConcoursView (Page d'accueil)

**Fichier** : `components/views/ConcoursView.tsx`

**Responsabilités** :
- Affichage des concours disponibles (Médecine, ENSA, ENSAM)
- Chargement de `/concours/index.json`
- Navigation vers **ConcoursListView**
- Modal d'aide interactive

**Caractéristiques visuelles** :
- Gradient de fond violet : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Motif SVG hexagonal en arrière-plan
- Cartes pour chaque concours avec:
  - Nom et description
  - Nombre d'années disponibles
  - Nombre total de thèmes
  - Badges pour chaque année

**Exemple de carte** :
```
┌─────────────────────────────┐
│ ENSA                        │
│ Préparation au concours...  │
│                             │
│ 4 années disponibles        │
│ 16 thèmes                   │
│                             │
│ [2025] [2024] [2022] [2018] │
│                             │
│ Accéder →                   │
└─────────────────────────────┘
```

**Modal d'aide** :
- Guide en 5 étapes
- Conseils de révision
- Instructions détaillées

### 2. ConcoursListView (Navigation)

**Fichier** : `components/views/ConcoursListView.tsx`

**Responsabilités** :
- Toggle entre mode "Par année" et "Par thème"
- Agrégation intelligente des thèmes (pour mode thème)
- Sauvegarde du mode dans localStorage

**Mode "Par année"** :
- Affiche des cartes pour chaque année (ex: 2024, 2023, 2022)
- Indique le nombre de quiz par année
- Navigation vers **ConcoursYearView**

**Mode "Par thème"** :
- Regroupe les thèmes identiques de toutes les années
- Affiche les badges d'années disponibles pour chaque thème
- Navigation directe vers **ConcoursResumeView** (agrégé)

**Exemple de carte (mode thème)** :
```
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │ Nombres complexes     │   │
│ └───────────────────────┘   │
│                             │
│ [2025] [2024] [2022]        │
│ 3 quiz disponibles          │
│                             │
│ Voir le résumé et tous →   │
│ les quiz                    │
└─────────────────────────────┘
```

**Agrégation intelligente** :
```javascript
// Création de la map thème → fichiers
const themeMap: { [theme: string]: any[] } = {};
concours.examens.forEach(exam => {
    exam.fichiers.forEach(fichier => {
        if (!themeMap[fichier.theme]) {
            themeMap[fichier.theme] = [];
        }
        themeMap[fichier.theme].push({ ...fichier, annee: exam.annee });
    });
});
```

### 3. ConcoursYearView (Chapitres d'une année)

**Fichier** : `components/views/ConcoursYearView.tsx`

**Responsabilités** :
- Affichage de tous les chapitres d'une année spécifique
- Bouton "Quiz Global" pour toute l'année
- Navigation vers résumé ou quiz

**Éléments d'interface** :
- Titre de l'année en grand
- Bouton proéminent "Quiz Global de l'année"
- Cartes pour chaque chapitre/thème

**Fonctionnalité Quiz Global** :
```javascript
// Collecte de tous les fichiers de l'année
const allFiles = exam.fichiers.map(f => f.file);
localStorage.setItem('concoursQuizFiles', JSON.stringify(allFiles));
localStorage.setItem('concoursQuizMode', 'year');
```

### 4. ConcoursResumeView (Résumés pédagogiques)

**Fichier** : `components/views/ConcoursResumeView.tsx`

**Responsabilités** :
- Affichage des résumés avec support KaTeX
- Navigation par section avec boutons Précédent/Suivant
- Agrégation multi-fichiers en mode thème
- Cases à cocher pour marquer les points maîtrisés
- Barre de progression

**Types de sections avec code couleur** :
| Type | Couleur | Icône | Description |
|------|---------|-------|-------------|
| `definitions` | Bleu | 📘 | Définitions clés à retenir par cœur |
| `formules` | Violet | 🧮 | Formules essentielles |
| `methodes` | Vert | 🛠️ | Méthodes et astuces |
| `pieges` | Rouge | ⚠️ | Pièges à éviter absolument |
| `reflexion` | Indigo | 💡 | Points de réflexion importants |
| `astuces` | Ambre | ✨ | Astuces supplémentaires |

**Rendu spécial pour les pièges** :
```javascript
// Items contenant ATTENTION, DANGER, PIÈGE ont un cadre coloré
const isWarning = item.match(/\*\*(ATTENTION|DANGER|PIÈGE)\*\*/);
```

**Agrégation en mode thème** :
```javascript
// Fusion de toutes les sections des fichiers du thème
const combinedSections = valid.reduce((acc, d) => {
    if (d?.resume?.sections && Array.isArray(d.resume.sections)) {
        return acc.concat(d.resume.sections);
    }
    return acc;
}, []);
```

**Navigation par section** :
- Boutons Précédent/Suivant
- Indicateur de progression (ex: "Section 2/5")
- Bouton "Passer au Quiz" en fin de résumé

### 5. ConcoursQuizView (Quiz interactif)

**Fichier** : `components/views/ConcoursQuizView.tsx`

**Responsabilités** :
- Gestion de deux types de questions : MCQ et Ordering
- Système d'indices progressifs
- Chronomètre automatique
- Calcul du score et statistiques
- Écran de résultats détaillé

**Types de questions** :

**A. Questions à choix multiples (MCQ)** :
```jsx
<MCQQuestion
    question={currentQuestion}
    selectedAnswer={answers[currentQuestion.id] as string}
    onAnswerChange={handleAnswerChange}
/>
```

**B. Questions d'ordonnancement** :
```jsx
<OrderingQuestion
    question={currentQuestion}
    selectedOrder={answers[currentQuestion.id] as string[]}
    onOrderChange={handleAnswerChange}
/>
```

**Système d'indices** :
- Les indices sont révélés un par un
- Compteur d'indices utilisés (pénalité possible)
- Navigation Précédent/Suivant entre les indices

**Chronomètre** :
```javascript
useEffect(() => {
    timerRef.current = window.setInterval(() => {
        setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
}, [isFinished]);
```

**Calcul du score** :
```javascript
const calculateScore = () => {
    let correctCount = 0;
    concoursData.quiz.forEach((q) => {
        const userAnswer = answers[q.id];
        if (q.type === 'ordering') {
            if (JSON.stringify(q.steps) === JSON.stringify(userAnswer)) {
                correctCount++;
            }
        } else {
            const correctOption = q.options?.find(o => o.isCorrect);
            if (userAnswer === correctOption?.id) {
                correctCount++;
            }
        }
    });
    return (correctCount / concoursData.quiz.length) * 100;
};
```

**Écran de résultats** :
- Score en pourcentage
- Temps total passé
- Nombre d'indices utilisés
- Nombre de bonnes réponses / total
- Bouton pour revenir au résumé
- Bouton pour recommencer le quiz

**Agrégation en mode année** :
```javascript
// Charger tous les fichiers de l'année
const files: string[] = JSON.parse(localStorage.getItem('concoursQuizFiles'));
Promise.all(files.map(file => fetch(file).then(r => r.json())))
    .then((allData) => {
        const allQuestions = allData.flatMap(d => d.quiz || []);
        // Créer un quiz agrégé
    });
```

### 6. ConcoursBackground (Arrière-plan SVG)

**Fichier** : `components/ConcoursBackground.tsx`

**Responsabilités** :
- Composant réutilisable pour les fonds SVG
- Support de 3 variants : 'list', 'year', 'resume'
- Motifs géométriques cohérents

**Variants** :
```typescript
interface ConcoursBackgroundProps {
    variant: 'list' | 'year' | 'resume';
}
```

**Utilisation** :
```jsx
<ConcoursBackground variant="list" />
```

---

## Intégration avec l'application

### App.tsx

**Routes définies** :
```typescript
case 'concours':
    return <ConcoursView />;
case 'concours-list':
    return <ConcoursListView />;
case 'concours-year':
    return <ConcoursYearView />;
case 'concours-resume':
    return <ConcoursResumeView />;
case 'concours-quiz':
    return <ConcoursQuizView />;
```

**Note** : `ConcoursYearView` est défini dans AppContext mais pas encore activé dans App.tsx

### AppContext.tsx

**État du concours** :
```typescript
interface AppState {
    // ... autres états
    currentConcoursType?: string;
    currentConcoursYear?: string;
    currentConcoursTheme?: string;
    concoursMode?: 'year' | 'theme';
    concoursNavigationMode?: 'year' | 'theme';
}
```

**Actions disponibles** :
```typescript
dispatch({
    type: 'CHANGE_VIEW',
    payload: {
        view: 'concours-list',
        concoursYear: '2024',
        concoursMode: 'year'
    }
});
```

### Gestion de l'état avec localStorage

**Clés utilisées** :
| Clé | Type | Usage |
|-----|------|-------|
| `currentConcoursType` | string | Type de concours (medecine, ensa, ensam) |
| `currentConcoursYear` | string | Année sélectionnée (mode année) |
| `currentConcoursTheme` | string | Thème sélectionné (mode thème) |
| `currentConcoursId` | string | ID du concours actuel |
| `currentConcoursFile` | string | Chemin du fichier JSON |
| `concoursNavigationMode` | string | Mode de navigation ('year' ou 'theme') |
| `concoursQuizFiles` | JSON | Liste des fichiers pour quiz global (mode année) |
| `concoursThemeFiles` | JSON | Liste des fichiers du thème (mode thème) |
| `concoursQuizMode` | string | Mode du quiz ('year' ou 'theme') |
| `concoursQuizYear` | string | Année pour quiz global |

**Avantages de localStorage** :
- Persistance entre sessions
- Navigation navigateur (retour/avancer) fonctionnelle
- Restauration de l'état après rechargement

---

## Fonctionnalités avancées

### 1. Support KaTeX

Toutes les formules mathématiques utilisent la syntaxe KaTeX entre `$...$` :

```javascript
import FormattedText from '../FormattedText';

<FormattedText text="La formule $e^{i\\pi} + 1 = 0$ est magnifique" />
```

**Exemples de syntaxe** :
- Fractions : `$\frac{a}{b}$`
- Racines : `$\sqrt{x}$`, `$\sqrt[n]{x}$`
- Exposants : `$x^2$`, `$e^{i\theta}$`
- Ensembles : `$\mathbb{R}$`, `$\mathbb{C}$`
- Fonctions : `$\sin x$`, `$\cos x$`, `$\ln x$`
- Opérateurs : `$\times$`, `$\neq$`, `$\leq$`
- Flèches : `$\Rightarrow$`, `$\Leftrightarrow$`
- Sommes : `$\sum_{i=1}^{n}$`
- Limites : `$\lim_{x \to 0}$`
- Intégrales : `$\int_{a}^{b}$`

### 2. Agrégation intelligente

**En mode thème** :
- Fusion automatique des résumés de plusieurs années
- Concaténation des sections par type
- Agrégation des questions de quiz

**En mode année** :
- Quiz global regroupant toutes les questions de l'année
- Conserve l'attribution du thème pour chaque question

**Code d'agrégation** :
```javascript
// Agrégation des sections
const combinedSections = validFiles.reduce((acc, data) => {
    return acc.concat(data.resume.sections);
}, []);

// Agrégation des quiz
const combinedQuiz = validFiles.reduce((acc, data) => {
    return acc.concat(data.quiz || []);
}, []);
```

### 3. Système de progression

**Suivi utilisateur** :
- Cases à cocher pour chaque point du résumé
- Barre de progression globale
- Sauvegarde de l'état du quiz
- Mémorisation des réponses

**Structure de progression** :
```typescript
interface ConcoursProgress {
    [concoursId: string]: {
        resumeRead: boolean;
        quiz: {
            answers: { [qId: string]: string | string[] };
            currentQuestionIndex: number;
            duration: number;
            hintsUsed: number;
            score?: number;
            completed: boolean;
        };
    };
}
```

### 4. Navigation navigateur intégrée

**Fonctionnement** :
- Les boutons retour/avancer du navigateur fonctionnent automatiquement
- Pas de boutons "Retour" manuels dans l'interface
- Synchronisation avec l'historique du navigateur via AppContext
- État préservé dans localStorage pour restauration

### 5. Design responsive

**Breakpoints** :
- Mobile : Grille 1 colonne
- Tablette (md) : Grille 2 colonnes
- Desktop (lg) : Grille 3 colonnes

**Classes Tailwind** :
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Guide de création de contenu

### 1. Créer un nouveau fichier de concours

**Étape 1** : Créer le fichier JSON dans `/public/concours/{type}/`

**Étape 2** : Suivre la structure du guide (`guide_concours.json`)

**Étape 3** : Mettre à jour `/public/concours/index.json`

**Template minimal** :
```json
{
  "id": "exemple-2024-theme",
  "concours": "Exemple",
  "annee": "2024",
  "theme": "Mon thème",
  "resume": {
    "title": "Mon thème - L'essentiel",
    "introduction": "Introduction avec support de $formules$...",
    "sections": [
      {
        "type": "definitions",
        "title": "Définitions clés",
        "items": [
          "**Définition 1** : Texte avec $formule$",
          "**Définition 2** : ..."
        ]
      }
    ]
  },
  "quiz": [
    {
      "id": "q1",
      "theme": "Mon thème",
      "question": "Question avec $math$",
      "type": "mcq",
      "options": [
        { "id": "a", "text": "Option A", "isCorrect": true },
        { "id": "b", "text": "Option B", "isCorrect": false }
      ],
      "explanation": "Explication détaillée...",
      "hints": [
        "Indice 1",
        "Indice 2"
      ]
    }
  ]
}
```

### 2. Bonnes pratiques

**Résumés** :
- Utiliser des titres clairs et explicites
- Inclure des exemples concrets dans les méthodes
- Varier les types de sections (definitions, formules, methodes, pieges)
- Mettre en gras les mots-clés avec `**mot-clé**`

**Formules KaTeX** :
- Toujours tester dans un éditeur KaTeX avant commit
- Échapper les backslashes : `\\`
- Utiliser `$...$` pour les formules inline

**Questions** :
- Fournir 2-3 indices progressifs par question
- Rédiger des explications pédagogiques détaillées
- Varier les types de pièges (calcul, théorie, cas limites)
- Maintenir une cohérence dans le niveau de difficulté

**Pièges** :
- Utiliser les mots-clés : ATTENTION, DANGER, PIÈGE
- Ces mots-clés déclenchent un style visuel spécial (cadre coloré)
- Exemple : `**ATTENTION** : Ne pas confondre...`

### 3. Mise à jour de l'index

Après création d'un nouveau fichier, mettre à jour `index.json` :

```json
{
  "concours": [
    {
      "id": "ensa",
      "name": "ENSA",
      "description": "...",
      "examens": [
        {
          "annee": "2025",
          "fichiers": [
            {
              "id": "ensa-2025-nouveau-theme",
              "theme": "Nouveau thème",
              "file": "/concours/ensa/2025-nouveau-theme.json"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Statistiques du système

### Contenu disponible (au moment de cette documentation)

**Concours Médecine** :
- Années : 2023, 2024
- Thèmes : 2
- Fichiers : 2

**Concours ENSA** :
- Années : 2018, 2022, 2024, 2025
- Thèmes : 13 uniques
- Fichiers : 16
- Thèmes récurrents :
  - Nombres complexes (4 années)
  - Suites et limites (4 années)
  - Calcul intégral (3 années)
  - Probabilités (4 années)

**Concours ENSAM** :
- Années : 2024
- Thèmes : 1
- Fichiers : 1

**Total global** :
- 3 concours
- 7 années uniques
- 19 fichiers de contenu
- Support de 16+ thèmes mathématiques

---

## Architecture technique

### Dépendances

**React** :
- Hooks : `useState`, `useEffect`, `useRef`, `useMemo`
- Context API via `AppContext`

**Composants réutilisés** :
- `FormattedText` : Rendu KaTeX
- `Modal` : Modale d'aide
- `MCQQuestion` : Questions à choix multiples
- `OrderingQuestion` : Questions d'ordonnancement

**Bibliothèques externes** :
- KaTeX : Rendu des formules mathématiques
- Tailwind CSS : Styles
- Material Symbols : Icônes

### Performance

**Optimisations** :
- Chargement lazy des fichiers JSON
- Mise en cache avec localStorage
- Agrégation côté client (évite les appels multiples)
- Pas de re-render inutile (useMemo pour les calculs coûteux)

**Gestion des erreurs** :
```javascript
fetch(concoursFile)
    .then(res => res.json())
    .then(data => setConcoursData(data))
    .catch(err => {
        console.error('Erreur lors du chargement:', err);
        setLoading(false);
    });
```

### Accessibilité

**ARIA** :
- Labels descriptifs : `aria-label="Aide"`
- `aria-hidden={true}` pour les décorations SVG
- Navigation clavier supportée

**Sémantique HTML** :
- Utilisation de `<button>` pour les actions
- Headings hiérarchiques (`<h1>`, `<h2>`, `<h3>`)

---

## Points d'extension

### 1. Ajouter un nouveau type de question

**Étape 1** : Créer le composant de question
```typescript
// components/quiz/NewQuestionType.tsx
export const NewQuestionType: React.FC<QuestionProps> = ({ question, ... }) => {
    // Implémentation
};
```

**Étape 2** : Mettre à jour ConcoursQuizView
```jsx
{currentQuestion.type === 'new-type' && (
    <NewQuestionType question={currentQuestion} ... />
)}
```

**Étape 3** : Mettre à jour le guide
```json
{
  "format_quiz": {
    "types_de_questions": {
      "new-type": "Description du nouveau type"
    }
  }
}
```

### 2. Ajouter un nouveau type de section

**Étape 1** : Mettre à jour le type TypeScript
```typescript
export interface ConcoursResumeSection {
    type: 'definitions' | 'formules' | 'methodes' | 'pieges' | 'reflexion' | 'astuces' | 'nouveau-type';
    // ...
}
```

**Étape 2** : Ajouter le style dans ConcoursResumeView
```javascript
const getSectionStyle = (type: string) => {
    switch (type) {
        case 'nouveau-type':
            return { color: 'teal', icon: '🆕' };
        // ...
    }
};
```

### 3. Ajouter une carte mentale personnalisée

**Localisation** : `ConcoursResumeView.tsx`

**Code à modifier** :
```jsx
{concoursData.theme === 'Nouveau thème' && (
    <div className="my-8">
        <h3>Carte mentale</h3>
        <svg>
            {/* Votre carte mentale SVG */}
        </svg>
    </div>
)}
```

### 4. Personnaliser le système de scoring

**Localisation** : `ConcoursQuizView.tsx:138-160`

**Exemple** : Ajouter une pénalité pour les indices
```javascript
const calculateScore = () => {
    let baseScore = (correctCount / totalQuestions) * 100;
    let penalty = hintsUsed * 2; // -2 points par indice
    return Math.max(0, baseScore - penalty);
};
```

---

## Maintenance et évolution

### Tâches courantes

**Ajouter un nouveau concours** :
1. Créer le dossier `/public/concours/{nouveau-concours}/`
2. Ajouter les fichiers JSON
3. Mettre à jour `index.json`
4. Tester les deux modes de navigation

**Ajouter une année à un concours existant** :
1. Créer les fichiers `{annee}-{theme}.json`
2. Ajouter l'année dans `index.json`
3. Vérifier l'agrégation en mode thème

**Corriger une erreur dans un fichier** :
1. Localiser le fichier dans `/public/concours/{type}/`
2. Modifier le JSON
3. Tester le rendu KaTeX si formules modifiées
4. Vérifier le quiz associé

### Tests recommandés

**Avant chaque commit** :
- Valider la syntaxe JSON (avec un linter)
- Tester le rendu KaTeX des formules
- Vérifier les deux modes de navigation
- Tester l'agrégation (si thème existe dans plusieurs années)
- Vérifier le quiz et les réponses correctes

**Tests de régression** :
- Navigation retour/avancer du navigateur
- Persistance localStorage
- Responsive design (mobile, tablette, desktop)
- Accessibilité clavier

---

## FAQ

### Q1 : Comment fonctionne l'agrégation en mode thème ?

**R** : Lorsqu'un thème existe dans plusieurs années (ex: "Nombres complexes" en 2025, 2024, 2022), le système :
1. Charge tous les fichiers du thème
2. Fusionne les sections de résumé en les concaténant
3. Agrège toutes les questions de quiz
4. Affiche le tout dans une seule vue

**Code** : `ConcoursResumeView.tsx:30-76`

### Q2 : Quelle est la différence entre sessionStorage et localStorage ?

**R** : Le système utilise **localStorage** (pas sessionStorage) pour :
- Persistance entre sessions
- Support de la navigation navigateur (retour/avancer)
- Restauration de l'état après rechargement

### Q3 : Comment ajouter des emojis dans le contenu ?

**R** : **Évitez les emojis** dans le contenu pédagogique selon les bonnes pratiques. Utilisez plutôt :
- Des icônes Material Symbols
- Des codes couleur pour différencier les sections
- Du texte en gras pour l'emphase

### Q4 : Le composant ConcoursYearView n'apparaît pas, pourquoi ?

**R** : `ConcoursYearView` est défini dans le code mais **n'est pas encore activé dans App.tsx**. Pour l'activer :
```typescript
// App.tsx
case 'concours-year':
    return <ConcoursYearView />;
```

### Q5 : Comment fonctionne le Quiz Global ?

**R** : Le Quiz Global (mode année) :
1. Collecte tous les fichiers de l'année sélectionnée
2. Charge tous les JSON en parallèle
3. Extrait et agrège toutes les questions
4. Les présente dans un seul quiz
5. Conserve l'attribution du thème pour chaque question

**Code** : `ConcoursQuizView.tsx:32-71`

### Q6 : Puis-je utiliser du HTML dans les items ?

**R** : Non, utilisez **Markdown** et **KaTeX** :
- Gras : `**texte**`
- Italique : `*texte*`
- Formules : `$formule$`
- Code : `` `code` ``

### Q7 : Comment créer une question avec plusieurs bonnes réponses ?

**R** : Actuellement, seul le type MCQ avec une seule bonne réponse est supporté. Pour ajouter le support de réponses multiples :
1. Créer un nouveau composant `MultiSelectQuestion`
2. Mettre à jour les types TypeScript
3. Adapter le calcul du score

### Q8 : Les formules KaTeX ne s'affichent pas, que faire ?

**R** : Vérifiez :
1. Syntaxe correcte (échapper les backslashes : `\\`)
2. Délimiteurs corrects (`$...$`)
3. Import de FormattedText : `<FormattedText text="..." />`
4. Console pour erreurs KaTeX

---

## Ressources

### Documentation externe

- **KaTeX** : https://katex.org/docs/supported.html
- **React Context API** : https://react.dev/reference/react/useContext
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Material Symbols** : https://fonts.google.com/icons

### Fichiers clés à consulter

- Guide de création : `/public/concours/guide_concours.json`
- Index global : `/public/concours/index.json`
- Types TypeScript : `/types.ts:300-369`
- Contexte app : `/context/AppContext.tsx`

### Outils recommandés

- **Éditeur JSON** : VS Code avec extension JSON
- **Test KaTeX** : https://katex.org/ (playground en ligne)
- **Validation JSON** : JSONLint (https://jsonlint.com/)

---

## Changelog

### Version actuelle (1.0)

**Composants principaux** :
- ConcoursView (page d'accueil)
- ConcoursListView (navigation bi-modale)
- ConcoursYearView (chapitres par année)
- ConcoursResumeView (résumés pédagogiques)
- ConcoursQuizView (quiz interactif)
- ConcoursBackground (arrière-plans SVG)

**Fonctionnalités** :
- Navigation par année ou par thème
- Agrégation intelligente multi-fichiers
- Support KaTeX complet
- Système d'indices progressifs
- Chronomètre et scoring
- Persistance localStorage
- Responsive design
- Accessibilité ARIA

**Contenu** :
- 3 concours (Médecine, ENSA, ENSAM)
- 19 fichiers de contenu
- 16+ thèmes mathématiques

---

## Conclusion

Le composant **Concours** est un système complet et sophistiqué de préparation aux examens, offrant :

- **Flexibilité** : Deux modes de navigation (année/thème)
- **Intelligence** : Agrégation automatique multi-fichiers
- **Pédagogie** : Résumés structurés + quiz interactifs
- **Performance** : Chargement optimisé, mise en cache
- **Expérience utilisateur** : Design moderne, responsive, accessible
- **Extensibilité** : Architecture modulaire, facile à étendre

Cette documentation couvre l'ensemble du système, de l'architecture technique aux bonnes pratiques de création de contenu. Pour toute question supplémentaire, consultez le code source ou le guide de création (`guide_concours.json`).

---

**Dernière mise à jour** : 2025-11-20
**Auteur** : Documentation générée pour Math-pedago
**Version** : 1.0

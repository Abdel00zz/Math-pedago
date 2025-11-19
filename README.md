# 📚 Math-pedago - Center Scientific of Mathematics

> Plateforme pédagogique interactive pour l'apprentissage des mathématiques au Maroc.
> Développée par **Boudouh Abdelmalek** - Disponible 24/7

[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/Abdel00zz/Math-pedago)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg)](https://www.typescriptlang.org/)

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Authentification & Sécurité](#-authentification--sécurité)
- [Stockage des données](#-stockage-des-données)
- [Concours - Structure JSON](#-concours---structure-json)
- [Système de navigation](#-système-de-navigation)
- [Validation & Gestion des erreurs](#-validation--gestion-des-erreurs)
- [Chronométrage des quiz](#-chronométrage-des-quiz)
- [Soumission du travail (Resend)](#-soumission-du-travail-resend)
- [Installation & Déploiement](#-installation--déploiement)
- [Mises à jour & Versioning](#-mises-à-jour--versioning)
- [Optimisations & Améliorations](#-optimisations--améliorations)
- [Technologies](#-technologies)

---

## 🎯 Vue d'ensemble

**Math-pedago** est une PWA pédagogique complète pour l'enseignement des mathématiques avec :

### ✨ Fonctionnalités

- 📖 **Leçons interactives** avec MathJax/LaTeX
- 🎥 **Capsules vidéo** intégrées
- 📝 **Quiz chronométrés** avec corrections détaillées
- ✏️ **Auto-évaluation** des exercices (facile/moyen/difficile)
- 🎯 **Concours** (ENSA, Médecine, ENSAM) avec agrégation multi-années
- 📊 **Suivi progression** en temps réel (localStorage)
- 📧 **Envoi travail** au professeur via Resend
- 🌐 **Bilingue** Français/Arabe (RTL)
- 📱 **PWA** installable offline

### 🎓 Public cible

- **Lycéens** : Tronc Commun, 1ère Bac, 2ème Bac
- **Candidats concours** : Médecine, ENSA, ENSAM

---

## 🏗️ Architecture

```
Math-pedago/
├── index.tsx                    # Entry point + ErrorBoundary
├── App.tsx                      # Router (view state machine)
├── components/
│   ├── views/                   # Pages principales
│   │   ├── LoginView           # Authentification
│   │   ├── DashboardView       # Accueil élève
│   │   ├── ChapterHubView      # Plan de travail (3 étapes)
│   │   ├── ActivityView        # Leçon/Vidéos/Quiz/Exercices
│   │   └── Concours*View       # Système concours
│   ├── ErrorBoundary.tsx       # Gestion erreurs intelligente
│   ├── GlobalWorkSubmit.tsx    # Bouton soumission
│   ├── OrientationModal.tsx    # Programme d'orientation
│   └── HelpModal.tsx           # Aide bilingue
├── context/
│   ├── AppContext.tsx          # État global (reducer)
│   └── NotificationContext.tsx # Système de notifications
├── services/
│   └── StorageService.ts       # Wrapper localStorage avancé
├── utils/
│   ├── jsonValidator.ts        # Validation JSON/LaTeX
│   └── lessonProgressHelpers.ts
├── api/
│   └── submit-work.ts          # Vercel Function (Resend)
└── public/
    └── concours/               # JSON des concours
        ├── ensa/
        ├── ensam/
        └── medecine/
```

### Flux de navigation

```
Login → Dashboard → ChapterHub (3 étapes séquentielles) → Activities → Submit
                ↓
          ConcoursView (navigation année/thème)
```

---

## 🔐 Authentification & Sécurité

### Système de connexion

**Fichier** : `components/views/LoginView.tsx`

#### Mode scolaire
```typescript
interface LoginData {
  studentName: string;    // Nom complet (bloqué après 1ère saisie)
  classId: string;        // 'tc' | '1bac' | '2bac'
}
```

**Restrictions** :
- ✅ Nom **permanent** après première saisie (clavier bloqué)
- ✅ Classe modifiable (changement d'année scolaire)
- ✅ Données stockées dans `localStorage['math-pedago:app:v5.0']`

#### Mode concours
```typescript
classId: 'concours' // Accès direct sans restriction
```

### Sécurité

| Aspect | Implémentation |
|--------|----------------|
| **Authentification** | Locale (pas de backend auth) |
| **Données sensibles** | Aucune (pas de mots de passe) |
| **XSS** | React escape automatique |
| **Injection SQL** | N/A (pas de BDD) |
| **HTTPS** | Forcé en production (Vercel) |
| **CSP** | Configuré dans `index.html` |

**Note** : L'application est conçue pour un usage pédagogique sans données sensibles. L'authentification locale suffit pour le tracking de progression.

---

## 💾 Stockage des données

### StorageService (localStorage wrapper)

**Fichier** : `services/StorageService.ts`

```typescript
class StorageService {
  // Opérations de base
  get<T>(key: string, defaultValue?: T): T | undefined
  set<T>(key: string, data: T, config?: StorageConfig): boolean
  remove(key: string): void
  has(key: string): boolean

  // Versioning
  getWithVersion<T>(key: string, expectedVersion: string): T | undefined

  // Cache spécifique leçons
  cacheLessonContent(lessonId: string, content: any, version: string): void
  getCachedLesson(lessonId: string, expectedVersion: string): any

  // Maintenance
  cleanup(): number           // Supprime données expirées
  migrate(): void            // Migre anciennes versions
  getStats(): StorageStats   // Statistiques usage
}
```

### Clés de stockage

```typescript
STORAGE_KEYS = {
  APP_STATE: 'math-pedago:app:v5.0',           // État global + progression
  LESSONS: 'math-pedago:lessons:v2.0',         // Progression leçons
  LESSON_CACHE: 'math-pedago:lesson-cache:v1.0', // Cache JSON leçons (TTL: 7j)
  CONCOURS: 'math-pedago:concours:v1.0',       // Données concours
  MIGRATIONS: 'math-pedago:migrations:v1.0'    // Historique migrations
}
```

### Gestion du quota

- **Limite** : ~5MB (standard localStorage)
- **Seuil alerte** : 80%
- **Nettoyage auto** : Données expirées + anciennes clés
- **Backup** : Export JSON manuel possible

---

## 🎯 Concours - Structure JSON

### Architecture des fichiers

```
public/concours/
├── guide_concours.json          # Documentation format
├── index.json                   # Index tous concours
└── {concours}/                  # ensa | ensam | medecine
    ├── 2018-{theme}.json
    ├── 2022-{theme}.json
    └── 2024-{theme}.json
```

### Format JSON complet

```json
{
  "id": "ensa-2024-probabilites",
  "concours": "ENSA",
  "annee": "2024",
  "theme": "Probabilités",

  "resume": {
    "title": "Probabilités - L'essentiel",
    "introduction": "Texte markdown avec $LaTeX$",
    "sections": [
      {
        "type": "definitions",    // definitions | formules | methodes | pieges | reflexion
        "titre": "Définitions clés",
        "items": [
          "**Univers** : Ensemble $\\Omega$ de tous les résultats possibles",
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
          "**Arbre de probabilités** : Multiplier sur les branches, additionner les chemins"
        ]
      },
      {
        "type": "pieges",
        "titre": "Pièges à éviter",
        "items": [
          "**ATTENTION** : $P(A \\cup B) \\neq P(A) + P(B)$ si non disjoints",
          "**PIÈGE** : Indépendance ≠ Incompatibilité"
        ]
      },
      {
        "type": "reflexion",
        "titre": "Points de réflexion",
        "items": [
          "Le **module** mesure la distance à l'origine"
        ]
      }
    ]
  },

  "quiz": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Soit $A$ et $B$ indépendants. Si $P(A) = 0.3$ et $P(B) = 0.4$, alors $P(A \\cap B)$ = ?",
      "choices": [
        { "id": "a", "text": "$0.12$", "isCorrect": true },
        { "id": "b", "text": "$0.7$", "isCorrect": false },
        { "id": "c", "text": "$0.1$", "isCorrect": false }
      ],
      "explanation": "Pour événements **indépendants** : $P(A \\cap B) = P(A) \\times P(B) = 0.12$",
      "hint": "Rappel : $P(A \\cap B) = P(A) \\times P(B)$ si indépendants"
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
      "explanation": "Formule : $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
      "hint": "Commencer par l'intersection"
    }
  ]
}
```

### Types de sections (styling automatique)

| Type | Couleur | Icône | Comportement |
|------|---------|-------|--------------|
| `definitions` | 🔵 Bleu | 📘 | Fond bleu clair |
| `formules` | 🟣 Violet | 🔮 | Fond violet clair |
| `methodes` | 🟢 Vert | 💡 | Fond vert clair |
| `pieges` | 🔴 Rouge | ⚠️ | **Bordure rouge épaisse** si contient ATTENTION/DANGER/PIÈGE |
| `reflexion` | 🟣 Indigo | 🤔 | Fond indigo clair |

### Agrégation multi-années (mode thème)

```typescript
// Mode "année" : 1 seul fichier
localStorage.setItem('concoursNavigationMode', 'year');
localStorage.setItem('currentConcoursFile', '/public/concours/ensa/2024-probabilites.json');

// Mode "thème" : agrégation de plusieurs années
localStorage.setItem('concoursNavigationMode', 'theme');
localStorage.setItem('concoursThemeFiles', JSON.stringify([
  { file: '/public/concours/ensa/2018-probabilites.json' },
  { file: '/public/concours/ensa/2022-probabilites.json' },
  { file: '/public/concours/ensa/2024-probabilites.json' }
]));

// Résultat : sections combinées de toutes les années
```

**Avantages** :
- Vue complète d'un thème sur plusieurs années
- Révision optimale (évolution des sujets)
- Chargement parallèle (`Promise.all()`)

---

## 🧭 Système de navigation

### Structure à 3 étapes séquentielles

```
CHAPTER HUB (Plan de travail)
│
├── ÉTAPE 1: LEÇON (0-100%)
│   └── Débloque → Quiz (à 95%+)
│
├── ÉTAPE 2: QUIZ
│   └── Débloque → Exercices (après soumission)
│
└── ÉTAPE 3: EXERCICES
    └── Débloque → Bouton "Envoyer mon travail"
```

### Logique de déblocage

```typescript
// ActivityView.tsx:162-175
const disabledStages = (() => {
  const disabled: LessonStage[] = [];
  const lessonDone = lessonProgress >= 95 || isRead;
  const quizDone = quiz?.isSubmitted;

  if (!lessonDone) disabled.push('quiz', 'exercises');
  else if (!quizDone) disabled.push('exercises');

  return disabled;
})();
```

### Fil d'Ariane interactif

```
Page principale → Plan de travail → [Leçon] [Vidéos] [Quiz 🔒] [Exercices 🔒]
```

---

## ✅ Validation & Gestion des erreurs

### Validation JSON (`utils/jsonValidator.ts`)

**Types de validation** :
1. **Structure** : type="p" avec listType, tableaux requis
2. **Math** : Délimiteurs LaTeX ($, \(, \[), accolades {}, commandes (\frac, \sqrt)
3. **Contenu** : Cohérence practice-box/solutions

**Codes d'erreur** (15 au total) :
- `TYPE_P_WITH_LISTTYPE` : Conflit type paragraphe
- `UNCLOSED_MATH_DELIMITER` : $ non fermé
- `UNBALANCED_BRACES` : Accolades déséquilibrées
- `MALFORMED_FRAC` : \frac mal formé
- `SOLUTION_MISMATCH` : Nombre solutions ≠ questions

**Sortie** :
```
🏗️ ❌ ERREUR [TYPE_P_WITH_LISTTYPE]
📍 Fichier: tc-1.json:45
🔍 Chemin: sections[0].subsections[2].elements[3]
💬 Erreur: type="p" avec listType
💡 Solution: Retirer "type": "p"
```

### ErrorBoundary (`components/ErrorBoundary.tsx`)

**Détection intelligente** :
- `.trim is not a function` → Erreur structure JSON
- `map is not a function` → Type incorrect (non-tableau)
- `KaTeX` error → Formule LaTeX mal formée
- `Cannot read property` → Propriété manquante

**UI** : Page d'erreur claire avec exemples de code correct/incorrect, boutons Retour/Recharger

---

## ⏱️ Chronométrage des quiz

**Timer automatique** (components/quiz/Quiz.tsx:15-150)

```typescript
const timerRef = useRef<number | null>(null);
const [timeSpent, setTimeSpent] = useState(persistedDuration);

// Démarre auto, s'arrête si soumis
useEffect(() => {
  if (isSubmitted) return;
  timerRef.current = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
  return () => clearInterval(timerRef.current);
}, [isSubmitted]);
```

**Persistance multi-niveau** :
1. Démontage composant
2. `beforeunload` (fermeture navigateur)
3. Soumission quiz

**Format** : MM:SS (ex: `07:45` = 7 min 45 sec)

---

## 📧 Soumission du travail (Resend)

**Endpoint** : `api/submit-work.ts` (Vercel Function)

```typescript
POST /api/submit-work
{
  studentName: "Ahmed Ben Ali",
  chapterTitle: "Nombres complexes",
  progressData: {
    lesson: { completed: 15, total: 15, percentage: 100 },
    quiz: { score: 85, scoreRaw: "8/10", durationSeconds: 450 },
    exercises: { ex1: "easy", ex2: "medium" }
  }
}
```

**Email envoyé** :
- **To** : bdh.malek@gmail.com
- **From** : Math Pedago <onboarding@resend.dev>
- **Subject** : ✅ Nouveau travail: Ahmed - Nombres complexes
- **Attachment** : `progression_ahmed_1699999999.json`

**Config** :
```env
RESEND_API_KEY=re_xxxx
RECIPIENT_EMAIL=bdh.malek@gmail.com
```

---

## 🚀 Installation & Déploiement

### Installation locale

```bash
git clone https://github.com/Abdel00zz/Math-pedago.git
cd Math-pedago
npm install
npm run dev  # http://localhost:5173
```

### Variables d'environnement

```env
# .env.local
RESEND_API_KEY=re_xxxx
RECIPIENT_EMAIL=bdh.malek@gmail.com
FROM_EMAIL=Math Pedago <onboarding@resend.dev>
```

### Déploiement Vercel

**Méthode 1 : CLI**
```bash
npm i -g vercel
vercel           # Preview
vercel --prod    # Production
```

**Méthode 2 : GitHub Integration**
1. Connecter repo GitHub à Vercel
2. Push → déploiement auto
3. Ajouter variables d'env dans Settings

**Configuration Vercel** :
- Framework : **Vite**
- Build Command : `npm run build`
- Output Directory : `dist`
- Root Directory : `./`

**Domaines** :
- Production : `math-pedago.vercel.app`
- Custom : Configurer dans Vercel Dashboard

### Build & Preview

```bash
npm run build    # Build production
npm run preview  # Test build localement
```

---

## 🔄 Mises à jour & Versioning

### Système de versions

**Format** : `MAJOR.MINOR.PATCH` (Semantic Versioning)

```typescript
// Version actuelle
VERSION = '5.0.0'

// Clés de stockage versionnées
'math-pedago:app:v5.0'
'math-pedago:lessons:v2.0'
```

### Migrations automatiques

```typescript
// StorageService.ts:migrate()
OLD_KEYS = [
  'pedagoEleveData_V4.7_React',  // v4.7
  'pedago.lessonProgress.v1',    // v1
]

// Migration auto au démarrage
storageService.migrate();  // Transfère données anciennes clés → nouvelles
```

### Changelog

**v5.0.0** (actuel)
- ✅ React 19 + TypeScript 5.8
- ✅ Nouveau système de concours (agrégation multi-années)
- ✅ ErrorBoundary intelligent
- ✅ Validation JSON avancée
- ✅ PWA optimisée

**v4.7** (legacy)
- Système de progression de base
- Leçons statiques

### Procédure de mise à jour

1. **Version mineure** (5.0 → 5.1) :
   ```bash
   git pull origin main
   npm install
   npm run build
   vercel --prod
   ```

2. **Version majeure** (5.0 → 6.0) :
   - Créer migration dans `StorageService`
   - Tester sur branche staging
   - Backup localStorage des utilisateurs
   - Déployer progressivement

### Monitoring versions

```typescript
// Vérifier version utilisateur
const appState = storageService.get('math-pedago:app:v5.0');
if (!appState) {
  // Utilisateur sur ancienne version → migrer
  storageService.migrate();
}
```

---

## 🚀 Optimisations & Améliorations

### Optimisations actuelles

✅ **Performance**
- `useMemo()` pour calculs coûteux
- `useRef()` pour éviter re-renders inutiles (timer quiz)
- Code splitting React.lazy() (non implémenté, voir ci-dessous)
- Cache leçons (TTL: 7j) dans localStorage

✅ **Bundle size**
- Vite tree-shaking
- MathJax chargé dynamiquement
- Material Symbols via CDN

✅ **UX**
- Loading states (spinners)
- Notifications toast
- PWA offline-ready

### Améliorations proposées

#### 1. **Backend & BDD**
**Problème actuel** : Tout dans localStorage (limite 5MB, pas de sync multi-device)

**Solution** :
```typescript
// Backend Node.js/Express + PostgreSQL
POST /api/auth/login         // JWT authentification
GET  /api/progress/:userId   // Sync progression
POST /api/submit-work        // Déjà existant (Resend)

// Schema BDD
users { id, name, email, class, password_hash }
progress { user_id, chapter_id, lesson_progress, quiz_score, exercises }
```

**Avantages** :
- Sync multi-device
- Statistiques professeur
- Backup automatique

#### 2. **Code Splitting**
**Problème** : Bundle initial trop gros (~2MB)

**Solution** :
```typescript
// Lazy load vues
const ConcoursView = lazy(() => import('./views/ConcoursView'));
const LessonView = lazy(() => import('./views/LessonView'));

<Suspense fallback={<Spinner />}>
  <ConcoursView />
</Suspense>
```

**Gain estimé** : -40% taille initiale

#### 3. **Analytics & Monitoring**
```typescript
// Intégrer Vercel Analytics ou Plausible
import Analytics from '@vercel/analytics';

// Tracking événements
trackEvent('quiz_completed', { score: 85, duration: 450 });
trackEvent('lesson_progress', { chapterId: '1', percentage: 100 });
```

**Métriques utiles** :
- Temps moyen par chapitre
- Taux abandon quiz
- Scores moyens par classe

#### 4. **Mode hors ligne avancé**
**Actuel** : PWA basique

**Amélioration** :
```typescript
// Service Worker + Cache API
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/concours/')) {
    // Cache stratégie: Cache First
    event.respondWith(caches.match(event.request).then(...));
  }
});
```

#### 5. **Interface professeur**
```typescript
// Dashboard professeur
GET /api/admin/students           // Liste élèves
GET /api/admin/stats/:classId     // Statistiques classe
GET /api/admin/submissions        // Travaux soumis

// Vue stats
<TeacherDashboard>
  <ClassStats averageScore={78} completionRate={85%} />
  <StudentList students={[...]} />
</TeacherDashboard>
```

#### 6. **Tests automatisés**
```bash
# Ajouter suite de tests
npm install -D vitest @testing-library/react

# Tests unitaires
describe('StorageService', () => {
  it('should save and retrieve data', () => {...});
});

# Tests E2E
npm install -D playwright
npx playwright test
```

#### 7. **Dark Mode**
```typescript
// Déjà préparé dans tailwind.config
const [theme, setTheme] = useState<'light' | 'dark'>('light');

<button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

#### 8. **Gamification**
```typescript
// Système de badges
interface Badge {
  id: string;
  title: string;
  icon: string;
  condition: (progress: Progress) => boolean;
}

const badges: Badge[] = [
  { id: 'first-quiz', title: 'Premier Quiz', icon: '🎯', condition: p => p.quizCount >= 1 },
  { id: 'perfect-score', title: 'Sans Faute', icon: '💯', condition: p => p.quiz?.score === 100 },
  { id: 'speed-demon', title: 'Rapide', icon: '⚡', condition: p => p.quiz?.duration < 300 }
];
```

#### 9. **Accessibilité (A11y)**
```typescript
// WCAG 2.1 AA
- Ajouter aria-labels manquants
- Support navigation clavier complète
- Contraste couleurs conforme
- Screen reader friendly
```

#### 10. **CI/CD**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: vercel --prod
```

### Roadmap priorité

1. 🔴 **Backend + BDD** (essentiel pour scaling)
2. 🟠 **Code Splitting** (performance)
3. 🟡 **Analytics** (mesurer usage)
4. 🟢 **Tests** (fiabilité)
5. 🔵 **Interface professeur** (valeur ajoutée)

---

## 🛠️ Technologies

### Frontend
- **React** 19.1.1 - UI framework
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool
- **Tailwind CSS** 4.1.16 - Styling
- **MathJax** 3.x - LaTeX rendering

### Backend
- **Vercel Functions** - Serverless API
- **Resend** 6.2.2 - Email service

### État & Storage
- **React Context API** - Global state
- **localStorage** - Client persistence

### PWA
- **Service Worker** (`sw.js`)
- **Manifest** (`manifest.webmanifest`)

---

## 📞 Contact & Support

**Développeur** : Boudouh Abdelmalek 🇲🇦

- 📧 Email : bdh.malek@gmail.com
- 💬 WhatsApp : +212 674 680 119
- 📘 Facebook : [Maths New Horizons](https://web.facebook.com/Maths.new.horizons)

---

## 📄 Licence

Copyright © 2024 Boudouh Abdelmalek - Tous droits réservés.

---

**Made with ❤️ in Morocco 🇲🇦**

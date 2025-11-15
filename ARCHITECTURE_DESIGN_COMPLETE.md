# 🎨 Architecture de Design Complète - Math-pedago

**Date:** 2025-01-15
**Projet:** Math-pedago
**Analyse:** Système complet de mise en page et de style

---

## 📁 Structure des Fichiers CSS

### Hiérarchie

```
src/styles/
├── global.css              # Variables globales + Reset CSS
├── main-theme.css          # Thème principal (vide, migré)
├── coursera-theme.css      # Thème Coursera unifié (2248 lignes)
├── typography.css          # Typographie (vide, migré)
├── lesson-content.css      # Styles contenus de leçon (200+ lignes)
├── lesson-boxes.css        # Boîtes théorème/définition (200+ lignes)
├── quiz.css                # Interface quiz (973 lignes)
├── dashboard.css           # Dashboard + cartes chapitre (1816 lignes)
├── chapter-hub.css         # Hub de chapitre (295 lignes)
└── design-system.css       # Smart chapter v1 (legacy)
```

**Total:** ~11 fichiers CSS | ~6500+ lignes de code

---

## 🎯 Système de Variables CSS Globales

### Variables de Couleurs (`global.css`)

```css
:root {
  /* Palette primaire */
  --primary-color: #0056D2;           /* Bleu principal */
  --primary-color-dark: #004BB8;      /* Bleu foncé */
  --primary-color-light: #3B82F6;     /* Bleu clair */
  --secondary-color: #2D7FF9;         /* Bleu secondaire */

  /* Palette Coursera */
  --coursera-black: #1f2937;          /* Noir principal */
  --coursera-white: #FFFFFF;          /* Blanc */
  --coursera-text: #282828;           /* Texte principal */
  --coursera-text-light: #475569;     /* Texte secondaire */

  /* Bordures et backgrounds */
  --border-color: #e0e7ff;
  --card-background-color: #FFFFFF;
  --surface-card: rgba(255, 255, 255, 0.95);

  /* État et feedback */
  --success-color: #22c55e;
  --error-color: #ef476f;
  --warning-color: #f59e0b;

  /* Layout */
  --header-height: 4rem;
  --sidebar-width: 250px;
}
```

### Variables Typographiques

```css
:root {
  /* Familles de polices */
  --font-display: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  /* Poids de police */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Hauteurs de ligne */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Variables d'Espacement et Responsive

```css
:root {
  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.25s ease;
  --transition-slow: 0.35s ease;
}
```

---

## 🏗️ Architecture des Composants Layout

### 1. Header Standard (`StandardHeader.tsx` + `coursera-theme.css:728-942`)

#### Variants

**Default:**
```tsx
<StandardHeader
  title="Titre"
  subtitle="Sous-titre"
  badgeText="Badge"
  badgeIcon="assignment"
/>
```

**Dashboard:**
```css
.dashboard-hero {
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.5vw, 1rem);
  align-items: center;
  text-align: center;
}

.dashboard-hero__title {
  font-size: clamp(1.8rem, 4.2vw, 2.8rem);
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937, #4f46e5);
  background-clip: text;
  color: transparent; /* Effet gradient sur texte */
}
```

**Lesson:**
```css
.standard-header--lesson {
  display: flex;
  flex-direction: column;
  gap: clamp(0.85rem, 2.5vw, 1.5rem);
  align-items: center;
  text-align: center;
}

.standard-header--lesson .standard-header__title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  padding-left: 40px; /* Espace pour bouton retour */
  padding-right: 40px;
}
```

#### Animations

```css
.student-name-animated {
  background: linear-gradient(
    100deg,
    #6366f1 0%,
    #22d3ee 40%,
    #60a5fa 70%,
    #6366f1 100%
  );
  background-size: 180% auto;
  background-clip: text;
  color: transparent;
  animation: nameGlow 7s ease-in-out infinite;
}

.student-name-animated::after {
  /* Curseur clignotant */
  content: '';
  width: 2px;
  height: 70%;
  background: rgba(99, 102, 241, 0.8);
  animation: caretBlink 0.65s steps(1) infinite;
}
```

---

### 2. Dashboard Cards (`dashboard.css:384-1816`)

#### Card Anatomy

```
┌─────────────────────────────────┐
│ ▌ [Status Badge]                │ ← Bande colorée gauche (6px)
│ ▌                               │
│ ▌ [Eyebrow] CHAPITRE 1          │
│ ▌ [Title] Nombres entiers       │
│ ▌                               │
│ ▌ [Session] 5 leçons • 3 quiz  │
│ ▌                               │
│ ▌ [Stats] 📚 5 leçons  ✅ 2/3  │
│ ▌                               │
└─────────────────────────────────┘
```

#### Status Variants avec Couleurs

```css
/* À faire - Orange */
.dashboard-card[data-status="todo"] {
  --card-surface: #fff7ed;
  --card-foreground: #7c2d12;
  --card-accent: #f97316;
  --card-accent-rgb: 249, 115, 22;
  --card-border-color: #fed7aa;
}

/* En cours - Jaune */
.dashboard-card[data-status="progress"] {
  --card-surface: #fefce8;
  --card-foreground: #713f12;
  --card-accent: #eab308;
  --card-accent-rgb: 234, 179, 8;
}

/* Complété - Vert */
.dashboard-card[data-status="completed"] {
  --card-surface: #f0fdf4;
  --card-foreground: #14532d;
  --card-accent: #22c55e;
  --card-accent-rgb: 34, 197, 94;
}

/* Mise à jour - Violet */
.dashboard-card[data-status="update"] {
  --card-surface: #faf5ff;
  --card-foreground: #581c87;
  --card-accent: #a855f7;
  --card-accent-rgb: 168, 85, 247;
}

/* Verrouillé - Gris */
.dashboard-card[data-status="locked"] {
  --card-surface: #f8fafc;
  --card-foreground: #334155;
  --card-accent: #94a3b8;
  --card-accent-rgb: 148, 163, 184;
}
```

#### Effets Hover

```css
.dashboard-card:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    0 12px 35px rgba(15, 23, 42, 0.12),
    0 6px 15px rgba(15, 23, 42, 0.08),
    0 0 0 1px rgba(var(--card-accent-rgb), 0.15);
  border-color: var(--card-accent);
}

.dashboard-card::before {
  /* Bande colorée gauche */
  width: 6px;
  background: linear-gradient(180deg, var(--card-accent), var(--card-accent));
  box-shadow: 0 0 15px rgba(var(--card-accent-rgb), 0.3);
  transition: width 0.32s cubic-bezier(0.34, 1.25, 0.64, 1);
}

.dashboard-card:hover::before {
  width: 10px; /* S'élargit au hover */
  box-shadow: 0 0 25px rgba(var(--card-accent-rgb), 0.5);
}
```

---

### 3. Chapter Cards V2 - Moderne (`dashboard.css:1074-1816`)

#### Layout 3 Colonnes

```
┌────────────────────────────────────────────┐
│ [Progress Ring] │ [Content] │ [Status]     │
│                 │           │              │
│      75%        │ CHAPITRE  │  🔓 TODO     │
│                 │ Titre     │              │
│                 │ 5 leçons  │              │
│                 │ ✅ 3/5    │              │
└────────────────────────────────────────────┘
```

#### Progress Ring SVG

```tsx
<svg className="chapter-card-v2__progress-svg">
  <circle
    className="chapter-card-v2__progress-bg"
    cx="50" cy="50" r="42"
    fill="none"
    stroke="rgba(226, 232, 240, 0.6)"
    stroke-width="6"
  />
  <circle
    className="chapter-card-v2__progress-bar"
    cx="50" cy="50" r="42"
    fill="none"
    stroke-width="6"
    stroke-linecap="round"
    stroke-dasharray="264"
    stroke-dashoffset={264 * (1 - progress / 100)}
  />
</svg>
```

#### Effets Glassmorphism

```css
.chapter-card-v2__bg {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98),
    rgba(249, 250, 251, 0.95)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.08),
    0 4px 8px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
```

#### Sessions Actives - Effet Holographique

```css
.chapter-card-v2.has-active-session .chapter-card-v2__bg {
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%),
    url("data:image/svg+xml,...crystal pattern..."),
    linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 245, 255, 0.8));
  backdrop-filter: blur(20px);
  animation: holographic-rotate 8s linear infinite;
}

@keyframes holographic-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

### 4. Lesson Layout (`lesson-content.css` + `lesson-boxes.css`)

#### Structure Hierarchique

```
lesson-shell
└── lesson-shell__body
    └── lesson-canvas
        └── lesson-experience
            ├── lesson-navigator (sidebar)
            └── lesson-experience__content
                └── lesson-stack
                    ├── lesson-section
                    │   ├── lesson-section__header
                    │   │   ├── lesson-section__index (1, 2, 3...)
                    │   │   └── lesson-section__title
                    │   └── lesson-section__body
                    │       └── lesson-subsection
                    │           ├── lesson-subsection__header
                    │           └── lesson-subsection__body
                    │               └── lesson-paragraph
                    └── lesson-box (théorème, définition...)
```

#### Lesson Boxes - Types et Couleurs

```css
/* Théorème - Bleu profond */
.lesson-box--theorem {
  --lesson-accent: #3B82F6;
  border: 2px solid #3B82F6;
}

/* Définition - Violet */
.lesson-box--definition {
  --lesson-accent: #8B5CF6;
  border: 2px solid #8B5CF6;
}

/* Propriété - Cyan */
.lesson-box--property {
  --lesson-accent: #06B6D4;
  border: 2px solid #06B6D4;
}

/* Méthode - Orange */
.lesson-box--method {
  --lesson-accent: #F59E0B;
  border: 2px solid #F59E0B;
}

/* Attention - Rouge */
.lesson-box--warning {
  --lesson-accent: #EF4444;
  border: 2px solid #EF4444;
}

/* Exercice - Vert */
.lesson-box--exercise {
  --lesson-accent: #10B981;
  border: 2px solid #10B981;
}
```

#### Lesson Navigator - Sidebar Sticky

```css
.lesson-navigator {
  position: relative;
  padding: 1.2rem;
  background: linear-gradient(135deg, #fafbff, #f3f5ff);
  border: 2px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  box-shadow:
    0 10px 30px rgba(99, 102, 241, 0.12),
    0 4px 12px rgba(79, 70, 229, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

@media (min-width: 1024px) {
  .lesson-navigator {
    position: sticky;
    top: 5.5rem;
    max-width: 340px;
    height: fit-content;
  }
}
```

#### Lesson Paragraphs - Interactifs

```css
.lesson-paragraph {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.04);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  transition: all 0.22s ease;
}

.lesson-paragraph:hover {
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(0, 86, 210, 0.08);
}

/* Paragraphe complété */
.lesson-paragraph--completed {
  background: rgba(9, 132, 67, 0.08);
  border-color: rgba(9, 132, 67, 0.18);
  box-shadow: 0 16px 30px rgba(9, 132, 67, 0.15);
}
```

---

### 5. Quiz Interface (`quiz.css:1-973`)

#### Question Layout

```
┌────────────────────────────────────┐
│ [Quiz Header]                      │
│ Quiz de Mathématiques              │
│ Question 2/10 • 15:00              │
├────────────────────────────────────┤
│ [Question Panel]                   │
│ ② Quel est le résultat de...?     │
├────────────────────────────────────┤
│ [Options]                          │
│ ○ Réponse A                        │
│ ○ Réponse B                        │
│ ● Réponse C (sélectionnée)         │
│ ○ Réponse D                        │
├────────────────────────────────────┤
│ [Actions]                          │
│ [Valider]        [Passer]          │
└────────────────────────────────────┘
```

#### Navigation Dots

```css
.quiz-nav-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid rgba(66, 85, 255, 0.35);
  background: #ffffff;
  color: var(--primary-color);
  font-weight: 600;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.quiz-nav-dot--current {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
  box-shadow: 0 18px 38px rgba(66, 85, 255, 0.3);
  transform: scale(1.05);
}

.quiz-nav-dot--answered {
  border-color: rgba(66, 85, 255, 0.45);
}

.quiz-nav-dot--pending {
  background: rgba(239, 71, 111, 0.16);
  border-color: rgba(239, 71, 111, 0.42);
  color: #8b1d33;
}
```

#### Quiz Options - États

```css
.quiz-option {
  padding: clamp(1rem, 1.9vw, 1.4rem) clamp(1.2rem, 2.2vw, 1.8rem);
  background: rgba(255, 255, 255, 0.96);
  border: 2px solid rgba(148, 163, 184, 0.24);
  border-radius: clamp(14px, 2vw, 18px);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quiz-option.selected {
  background: rgba(66, 85, 255, 0.1);
  border-color: rgba(66, 85, 255, 0.45);
  color: var(--primary-color);
  box-shadow: 0 10px 26px rgba(66, 85, 255, 0.18);
}

.quiz-option.correct {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.36);
  color: #047857;
  box-shadow: 0 12px 26px rgba(34, 197, 94, 0.2);
}

.quiz-option.incorrect {
  background: rgba(239, 71, 111, 0.12);
  border-color: rgba(239, 71, 111, 0.36);
  color: #b91c1c;
  box-shadow: 0 12px 26px rgba(239, 71, 111, 0.18);
}
```

---

## 🎭 Animations et Effets

### Animations Globales

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Effet shimmer pour boutons */
@keyframes shimmerSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Effets Hover Complexes

```css
/* Bouton avec effet de brillance */
.learning-step__button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transition: transform 0.6s;
}

.learning-step__button--primary:hover::before {
  transform: translateX(200%);
}
```

### Effets de Pulsation

```css
@keyframes statusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.9;
  }
}

.chapter-card-v2.has-active-session .chapter-card-v2__status-content {
  animation: statusPulse 3s ease-in-out infinite;
}
```

---

## 📱 Système Responsive - Breakpoints

### Architecture Mobile-First

```css
/* Base: Mobile (320px+) */
.dashboard-card {
  padding: clamp(1.25rem, 2.1vw, 1.8rem);
}

/* Small Tablet (640px+) */
@media (min-width: 640px) {
  .quiz-nav-dot {
    width: 2.75rem;
    height: 2.75rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .lesson-canvas {
    padding-left: clamp(2.5rem, 3vw, 3.5rem);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .lesson-navigator {
    position: sticky;
    top: 5.5rem;
  }

  .lesson-experience {
    flex-direction: row;
  }
}

/* Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .dashboard-section__items {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Breakpoints Spécifiques

| Device | Max Width | Adjustments |
|--------|-----------|-------------|
| **Phone** | 480px | Padding réduit, font 0.875rem, stack vertical |
| **Small Tablet** | 640px | Padding médium, font 0.95rem, grids simplifiés |
| **Tablet** | 768px | Layout 2 colonnes, sidebar collapse |
| **Desktop** | 1024px | Layout 3 colonnes, sidebar sticky |
| **Large** | 1280px+ | Grids multi-colonnes, espacements larges |

### Optimisations Landscape Mobile

```css
@media (max-height: 600px) and (orientation: landscape) {
  .quiz-container {
    padding: 0.625rem 1rem;
  }

  .quiz-question-text {
    font-size: 0.9375rem;
    line-height: 1.4;
  }

  .font-button {
    padding: 0.625rem 1.125rem;
    min-height: 40px;
  }
}

@media (max-height: 450px) and (orientation: landscape) {
  .quiz-content {
    padding: 0.625rem 0.875rem;
    border-radius: 10px;
  }

  .quiz-nav-dot {
    width: 1.875rem;
    height: 1.875rem;
  }
}
```

---

## 🔤 Système Typographique

### Hiérarchie des Titres

```css
/* H1 - Titre principal */
h1, .h1 {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  font-family: var(--font-display);
}

/* H2 - Sous-titre */
h2, .h2 {
  font-size: clamp(1.5rem, 3.2vw, 2.25rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

/* H3 - Titre de section */
h3, .h3 {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  line-height: 1.3;
}

/* H4 - Titre de sous-section */
h4, .h4 {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 600;
  line-height: 1.4;
}
```

### Corps de Texte

```css
/* Paragraphe standard */
p {
  font-size: clamp(0.95rem, 1.7vw, 1.08rem);
  line-height: 1.65;
  color: var(--coursera-text);
  font-family: var(--font-body);
}

/* Texte petit */
.text-sm {
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  line-height: 1.5;
}

/* Texte très petit */
.text-xs {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  line-height: 1.4;
}
```

### Polices Spécialisées

```css
/* Dashboard hero */
.dashboard-hero__title {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

/* Quiz title */
.quiz-title {
  font-family: 'Manrope', 'Fira Sans', 'Inter', sans-serif;
  font-size: clamp(1.8rem, 3.6vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}

/* Chapter cards */
.chapter-card-v2__title {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

---

## 🎨 Palette de Couleurs Détaillée

### Couleurs Primaires

| Usage | Couleur | Hex | RGB |
|-------|---------|-----|-----|
| Bleu principal | ![#0056D2](https://via.placeholder.com/15/0056D2/000000?text=+) | `#0056D2` | `0, 86, 210` |
| Bleu foncé | ![#004BB8](https://via.placeholder.com/15/004BB8/000000?text=+) | `#004BB8` | `0, 75, 184` |
| Bleu clair | ![#3B82F6](https://via.placeholder.com/15/3B82F6/000000?text=+) | `#3B82F6` | `59, 130, 246` |
| Bleu secondaire | ![#2D7FF9](https://via.placeholder.com/15/2D7FF9/000000?text=+) | `#2D7FF9` | `45, 127, 249` |

### Couleurs d'État (Dashboard Cards)

| État | Couleur | Surface | Foreground |
|------|---------|---------|------------|
| **Todo** | Orange | `#fff7ed` | `#7c2d12` |
| **Progress** | Jaune | `#fefce8` | `#713f12` |
| **Completed** | Vert | `#f0fdf4` | `#14532d` |
| **Update** | Violet | `#faf5ff` | `#581c87` |
| **Locked** | Gris | `#f8fafc` | `#334155` |

### Couleurs de Feedback

| Type | Couleur | Usage |
|------|---------|-------|
| **Success** | `#22c55e` | Validation, succès |
| **Error** | `#ef476f` | Erreurs, échecs |
| **Warning** | `#f59e0b` | Avertissements |
| **Info** | `#3b82f6` | Informations |

### Couleurs des Lesson Boxes

| Type | Couleur | Hex |
|------|---------|-----|
| **Théorème** | Bleu profond | `#3B82F6` |
| **Définition** | Violet | `#8B5CF6` |
| **Propriété** | Cyan | `#06B6D4` |
| **Méthode** | Orange | `#F59E0B` |
| **Attention** | Rouge | `#EF4444` |
| **Exercice** | Vert | `#10B981` |

---

## 🧩 Composants Réutilisables

### Boutons Coursera

```css
/* Bouton primaire */
.coursera-btn--primary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(0, 86, 210, 0.95), rgba(37, 99, 235, 0.92));
  color: #ffffff;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.coursera-btn--primary:hover {
  background: linear-gradient(135deg, rgba(0, 86, 210, 1), rgba(37, 99, 235, 1));
  box-shadow: 0 16px 36px rgba(37, 99, 235, 0.32);
  transform: translateY(-2px);
}

/* Bouton secondaire */
.coursera-btn--secondary {
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #475569;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.coursera-btn--secondary:hover {
  background: rgba(248, 250, 252, 1);
  border-color: rgba(59, 130, 246, 0.4);
  color: #1d4ed8;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

/* Bouton retour */
.coursera-btn--back {
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: saturate(180%) blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: rgba(30, 41, 59, 0.85);
}

.coursera-btn--back:hover {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(59, 130, 246, 0.35);
  color: rgba(37, 99, 235, 0.95);
}
```

### Cards Coursera

```css
.coursera-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  padding: clamp(1.5rem, 3vw, 2.2rem);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.coursera-card--interactive:hover {
  transform: translateY(-6px);
  border-color: rgba(89, 178, 246, 0.45);
  box-shadow: 0 36px 72px rgba(58, 131, 247, 0.24);
}

.coursera-card--compact {
  padding: clamp(1rem, 2vw, 1.5rem);
  border-radius: 16px;
}

.coursera-card--quiz {
  max-width: 48rem;
  margin: 0 auto;
}
```

---

## 🎯 Styles des Listes - Détails Complets

### Listes Numérotées (Exercices)

```css
/* Liste principale - Numéros modernes sans cercle */
.exercise-list-main {
  list-style: none;
  counter-reset: exercise-counter;
  margin-left: 1.5rem;
}

.exercise-list-main > li::before {
  content: counter(exercise-counter);
  position: absolute;
  left: 0;
  top: 0.15rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #4255ff;
  font-family: 'Inter', sans-serif;
  min-width: 1.8rem;
  text-align: right;
}

/* Sous-questions - Format "1." avec point */
.exercise-list-sub > li::before {
  content: counter(sub-counter) ".";
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(66, 85, 255, 0.85);
}
```

### Puces Académiques

```css
/* Niveau 1 - Losange bleu rotaté 45° */
ul.exercise-list-bullet > li::before {
  content: "";
  position: absolute;
  left: 0.3rem;
  top: 0.65rem;
  width: 0.45rem;
  height: 0.45rem;
  background: linear-gradient(
    135deg,
    #4255ff 0%,
    rgba(95, 125, 255, 0.85) 100%
  );
  border-radius: 1px;
  transform: rotate(45deg);
}

/* Niveau 2 - Tiret horizontal */
ul.exercise-list-bullet ul > li::before {
  content: "—";
  background: none;
  transform: none;
  font-weight: 600;
  color: rgba(66, 85, 255, 0.65);
  font-size: 0.9rem;
}
```

### Puces Étoiles (Générales)

Voir `ANALYSE_STYLES_LISTES.md` pour le SVG complet de l'étoile avec gradient.

---

## 📐 Grilles et Layouts

### Grid Dashboard

```css
.dashboard-section__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: clamp(1.1rem, 2vw, 1.5rem);
}

@media (min-width: 1280px) {
  .dashboard-section__items {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Flexbox Lesson

```css
.lesson-experience {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

@media (min-width: 1024px) {
  .lesson-experience {
    flex-direction: row;
    align-items: flex-start;
  }

  .lesson-navigator {
    max-width: 340px;
    flex: 0 0 340px;
  }

  .lesson-experience__content {
    flex: 1;
  }
}
```

---

## ⚡ Optimisations de Performance

### CSS Optimizations

```css
/* Transitions désactivées pour performance */
.lesson-paragraph {
  /* NO transitions on paragraph hover for better performance */
  background: rgba(255, 255, 255, 0.6);
}

/* Will-change pour animations complexes */
.chapter-card-v2:hover {
  will-change: transform, box-shadow;
}

/* Transform au lieu de margin/padding */
.dashboard-card:hover {
  transform: translateY(-6px); /* GPU-accelerated */
  /* NOT: margin-top: -6px; */
}
```

### Lazy Loading Classes

```css
/* Animation uniquement au mount */
.chapter-card-v2 {
  animation: fadeInUp 0.4s cubic-bezier(0.34, 1.25, 0.64, 1) backwards;
}

.chapter-card-v2:nth-child(1) { animation-delay: 0.05s; }
.chapter-card-v2:nth-child(2) { animation-delay: 0.1s; }
.chapter-card-v2:nth-child(3) { animation-delay: 0.15s; }
```

---

## 🔧 Utilitaires et Helpers

### Spacing Utilities (clamp)

```css
/* Padding responsive */
padding: clamp(1rem, 2vw, 1.5rem);

/* Gap responsive */
gap: clamp(0.75rem, 1.5vw, 1.25rem);

/* Margin responsive */
margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
```

### Shadow System

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.25);

/* Usage spécialisé */
.card-shadow {
  box-shadow:
    0 30px 60px rgba(15, 23, 42, 0.12),
    0 2px 6px rgba(15, 23, 42, 0.05);
}
```

### Backdrop Filter

```css
.glass-morphism {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
}
```

---

## 📊 Métriques et Statistiques

### Tailles de Fichiers

| Fichier | Lignes | Taille | Complexité |
|---------|--------|--------|------------|
| `coursera-theme.css` | 2248 | ~70KB | ⭐⭐⭐⭐⭐ |
| `dashboard.css` | 1816 | ~58KB | ⭐⭐⭐⭐⭐ |
| `quiz.css` | 973 | ~32KB | ⭐⭐⭐⭐ |
| `chapter-hub.css` | 295 | ~9KB | ⭐⭐⭐ |
| `lesson-content.css` | 200+ | ~7KB | ⭐⭐⭐ |
| `lesson-boxes.css` | 200+ | ~7KB | ⭐⭐⭐ |
| **Total** | **~6500** | **~190KB** | - |

### Breakpoints Utilisés

```
320px  → Phone (très petit)
375px  → Phone (petit)
480px  → Phone (standard)
640px  → Large phone / Small tablet
768px  → Tablet
1024px → Desktop
1280px → Large desktop
```

**Total:** 7 breakpoints principaux + variantes landscape

### Animations Comptées

- `fadeIn` (2 variants)
- `slideInUp` (1 variant)
- `fadeInUp` (1 variant)
- `shimmerSweep` (boutons)
- `holographic-rotate` (cards actives)
- `neon-pulse` (cards upcoming)
- `statusPulse` (status badges)
- `caretBlink` (curseur)
- `nameGlow` (nom animé)
- `spin` (loading)

**Total:** 10+ animations principales

---

## 🚀 Recommandations d'Usage

### Pour Ajouter un Nouveau Module

1. **Créer un fichier CSS dédié** : `src/styles/mon-module.css`
2. **Utiliser les variables globales** : `var(--primary-color)`, etc.
3. **Suivre la convention de nommage** : `.mon-module__element`
4. **Implémenter les breakpoints standards** : 640px, 768px, 1024px
5. **Utiliser `clamp()` pour le responsive** : `font-size: clamp(0.95rem, 1.7vw, 1.08rem)`

### Pour Modifier un Style Existant

1. **Identifier le fichier source** dans cette documentation
2. **Vérifier les variables CSS** utilisées
3. **Tester sur tous les breakpoints**
4. **Vérifier les effets hover/focus**
5. **Valider la performance** (pas de transitions inutiles)

### Best Practices

✅ **À faire:**
- Utiliser `clamp()` pour toutes les tailles
- Utiliser `transform` pour les animations
- Préférer `backdrop-filter` pour les effets de flou
- Utiliser des transitions `cubic-bezier()` personnalisées
- Respecter les variables globales

❌ **À éviter:**
- Hardcoder des valeurs fixes
- Utiliser `margin`/`padding` pour animer
- Oublier les breakpoints mobiles
- Surcharger avec trop de box-shadow
- Négliger l'accessibilité (focus, ARIA)

---

## 📝 Conclusion

Cette architecture CSS/design du projet Math-pedago démontre :

- ✅ **Modularité** : 11 fichiers CSS bien organisés
- ✅ **Maintenabilité** : Variables CSS centralisées
- ✅ **Responsive** : 7 breakpoints + landscape
- ✅ **Performance** : Animations GPU-accelerated
- ✅ **Accessibilité** : Focus visible, ARIA support
- ✅ **Cohérence** : Système de design unifié
- ✅ **Créativité** : Effets holographiques, glassmorphism
- ✅ **Scalabilité** : Composants réutilisables

**Total : ~6500 lignes de CSS soigneusement crafté** pour une expérience utilisateur moderne et performante.

---

**Auteur:** Claude AI
**Version:** 1.0
**Date:** 2025-01-15

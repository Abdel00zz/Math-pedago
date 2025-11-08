# 📚 GUIDE COMPLET DE CRÉATION DE LEÇONS PÉDAGOGIQUES

## 🎯 Vue d'Ensemble du Système

Ce guide détaille **l'architecture complète** du système de leçons interactives de l'application **Pedago**, une plateforme d'apprentissage des mathématiques. Le système permet de créer des cours structurés, interactifs et pédagogiques au format JSON.

---

## 📐 ARCHITECTURE GLOBALE

### 🔧 Technologies Utilisées

- **Frontend** : React + TypeScript
- **Rendu LaTeX** : KaTeX 0.16+ (plus rapide et léger que MathJax)
- **Styling** : CSS moderne avec variables CSS dynamiques
- **Parsing** : Parser personnalisé avec support Markdown/LaTeX

### 🗂️ Composants Principaux

```
📦 Système de Leçons
├── 📄 types.ts                    → Définitions TypeScript
├── 🎨 lesson-boxes.css            → Styles des boîtes pédagogiques
├── 🎨 lesson-content.css          → Styles du contenu
├── ⚙️ lessonContentParser.tsx     → Parser de contenu
├── 🧩 LessonElement.tsx           → Composant de rendu des éléments
├── 📊 LessonDisplay.tsx           → Affichage de la leçon
├── 🔢 NumberingContext.tsx        → Gestion de la numérotation
└── 📝 [fichiers JSON]             → Contenu des leçons
```

---

## 📊 STRUCTURE JSON D'UNE LEÇON

### 🏗️ Structure Racine

```typescript
interface LessonContent {
    header: LessonHeaderData;     // En-tête de la leçon
    sections: LessonSection[];    // Sections principales
}
```

#### 🎓 En-tête (Header)

```json
{
  "header": {
    "title": "Généralités sur les Fonctions Numériques",
    "subtitle": "Étude et représentation",
    "classe": "1ère Bac Sciences Mathématiques",
    "chapter": "Chapitre 2",
    "academicYear": "2025-2026"
  }
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `title` | `string` | ✅ | Titre principal de la leçon |
| `subtitle` | `string` | ❌ | Sous-titre descriptif |
| `classe` | `string` | ❌ | Niveau scolaire (ex: "1ère Bac SM") |
| `chapter` | `string` | ❌ | Numéro du chapitre (ex: "Chapitre 2") |
| `academicYear` | `string` | ❌ | Année académique (ex: "2025-2026") |

---

### 📑 Structure des Sections

```typescript
interface LessonSection {
    title: string;                      // Titre de la section
    intro?: string;                     // Introduction optionnelle
    subsections: LessonSubsection[];    // Sous-sections
}

interface LessonSubsection {
    title: string;                      // Titre de la sous-section
    subsubsections?: LessonSubsubsection[]; // Sous-sous-sections (optionnel)
    elements?: LessonElement[];         // Éléments de contenu
}

interface LessonSubsubsection {
    title: string;                      // Titre de la sous-sous-section
    elements: LessonElement[];          // Éléments de contenu
}
```

#### 📌 Exemple de Structure Hiérarchique

```json
{
  "sections": [
    {
      "title": "Fonctions de Référence",
      "subsections": [
        {
          "title": "Fonction Trinôme",
          "elements": [
            { "type": "p", "content": "Introduction..." },
            { "type": "definition-box", "content": "..." }
          ]
        },
        {
          "title": "Fonction Homographique",
          "subsubsections": [
            {
              "title": "Définition et ensemble de définition",
              "elements": [...]
            },
            {
              "title": "Propriétés et variations",
              "elements": [...]
            }
          ]
        }
      ]
    }
  ]
}
```

**⚠️ Important : Numérotation Automatique**

L'application **génère automatiquement** la numérotation hiérarchique :
- Les **sections** sont numérotées : **I.**, **II.**, **III.**...
- Les **subsections** sont numérotées : **1.**, **2.**, **3.**...
- Les **subsubsections** sont lettrées : **a)**, **b)**, **c)**...

**❌ NE PAS FAIRE :**
```json
"title": "I. Fonctions de Référence"     // ❌ Numérotation manuelle
"title": "1. Fonction Trinôme"           // ❌ Numérotation manuelle
"title": "a) Définition"                 // ❌ Numérotation manuelle
```

**✅ À FAIRE :**
```json
"title": "Fonctions de Référence"       // ✅ Sans numérotation
"title": "Fonction Trinôme"             // ✅ Sans numérotation
"title": "Définition"                   // ✅ Sans numérotation
```

**Rendu automatique dans l'application :**
```
I. Fonctions de Référence
  1. Fonction Trinôme
     a) Définition et ensemble de définition
     b) Propriétés et variations
  2. Fonction Homographique
```

---

## 🎨 TYPES D'ÉLÉMENTS DE CONTENU

Le système propose **5 catégories d'éléments** pour structurer les leçons de manière pédagogique.

---

### 📝 1. PARAGRAPHE TEXTE (`type: "p"`)

Le **paragraphe** est l'élément de contenu le plus simple et flexible.

```typescript
interface LessonTextElement {
    type: 'p';
    content: string | string[];    // Texte ou liste
}
```

#### ✍️ Texte Simple

```json
{
  "type": "p",
  "content": "Une **fonction numérique** est une relation qui associe à chaque nombre réel $x$ **au plus** un nombre réel $y$."
}
```

**Formatage supporté :**
- **Gras** : `**texte en gras**`
- *Italique* : `*texte en italique*` (si supporté)
- LaTeX inline : `$f(x)$`, `$\mathbb{R}$`
- LaTeX display : `$$\int_0^1 f(x)dx$$`

#### 📋 Liste avec Puces

```json
{
  "type": "p",
  "content": [
    "Premier point de la liste",
    "Deuxième point avec formule : $x^2 + 1$",
    "Troisième point"
  ]
}
```

**Rendu :** Liste à puces avec étoiles stylisées (⭐)

**⚠️ IMPORTANT - Puces automatiques :**
- ✅ Les puces sont **automatiquement ajoutées** par l'application
- ❌ **NE PAS** ajouter de symboles manuels (`•`, `-`, `*`, `⭐`) dans le texte
- ❌ **NE PAS** écrire "• Premier point" ou "- Premier point"
- ✅ Écrire simplement : "Premier point de la liste"

**Exemple incorrect :**
```json
"content": [
  "• Premier point",        // ❌ Puce manuelle
  "- Deuxième point"        // ❌ Tiret manuel
]
```

**Exemple correct :**
```json
"content": [
  "Premier point",          // ✅ Sans symbole
  "Deuxième point"          // ✅ Sans symbole
]
```

#### 🚫 Liste Sans Puces (NoBullet)

Utilisez le préfixe `>>` pour désactiver les puces sur certaines lignes :

```json
{
  "type": "p",
  "content": [
    ">> **Cas particuliers importants :**",
    "Si $b = 0$, alors la fonction est linéaire",
    "Si $a = 0$, alors la fonction est constante",
    ">> **Remarque** : Ces cas sont dégénérés"
  ]
}
```

**Rendu :**
```
Cas particuliers importants :
⭐ Si b = 0, alors la fonction est linéaire
⭐ Si a = 0, alors la fonction est constante
Remarque : Ces cas sont dégénérés
```

---

### 📊 2. TABLEAU (`type: "table"`)

Support des tableaux Markdown avec rendu LaTeX.

```typescript
interface LessonTableElement {
    type: 'table';
    content: string;               // Tableau au format Markdown
}
```

#### 📝 Syntaxe Markdown

```json
{
  "type": "table",
  "content": "| Fonction | Domaine de définition |\n|----------|----------------------|\n| $f(x) = \\frac{1}{x}$ | $\\mathbb{R}^*$ |\n| $f(x) = \\sqrt{x}$ | $\\mathbb{R}^+$ |\n| $f(x) = x^2$ | $\\mathbb{R}$ |"
}
```

**Rendu :** Tableau stylisé avec bordures, header coloré et hover effects.

**⚠️ Important :**
- Les lignes doivent être séparées par `\n`
- La ligne de séparation `|-----|-----|` est obligatoire
- Support complet de LaTeX dans les cellules

---

### 🎯 3. BOÎTES PÉDAGOGIQUES (InfoBox)

Les boîtes sont des éléments encadrés pour mettre en valeur des contenus importants.

```typescript
interface LessonInfoBoxElement {
    type: 'definition-box' | 'theorem-box' | 'proposition-box' | 
          'property-box' | 'remark-box' | 'example-box';
    content?: string | string[];   // Contenu principal
    preamble?: string;             // Préambule/introduction
    listType?: 'bullet' | 'number' | 'numbered';
}
```

#### 🏷️ Types de Boîtes Pédagogiques

Le système propose **6 types de boîtes** pour structurer le contenu mathématique :

| Type | Badge Affiché | Couleur | Style | Utilisation |
|------|---------------|---------|-------|-------------|
| `definition-box` | **Définition N** | 🔵 Bleu | Standard | Définitions formelles et rigoureuses |
| `theorem-box` | **Théorème N** | 🟢 Vert | Standard | Théorèmes mathématiques à démontrer |
| `proposition-box` | **Proposition N** | 🔵 Cyan | Standard | Propositions et assertions |
| `property-box` | **Propriété N** | 🟣 Violet | Standard | Propriétés importantes à connaître |
| `remark-box` | **Remarque** | 🟣 Violet clair | **Inline** | Remarques et précisions (sans numéro) |
| `example-box` | **Exemple** | 🟠 Orange | **Inline** | Exemples d'application (sans numéro) |

**Légende :**
- **N** : Numéro automatique (Définition 1, Théorème 2, etc.)
- **Standard** : Boîte avec numérotation automatique
- **Inline** : Boîte sans numérotation, style épuré

#### 🔢 Numérotation Automatique

Les boîtes sont **automatiquement numérotées** par type :
- Définition 1, Définition 2, ...
- Théorème 1, Théorème 2, ...
- Propriété 1, Propriété 2, ...

**Exception :** Les boîtes `remark-box` et `example-box` utilisent un **style inline** (sans numérotation).

---

#### 📦 Exemples de Boîtes

##### 🔵 Définition

```json
{
  "type": "definition-box",
  "preamble": "**Fonction numérique** :",
  "content": "Une fonction numérique $f$ est une relation qui associe à chaque élément $x$ d'un ensemble $D_f \\subseteq \\mathbb{R}$ **au plus** un élément $y = f(x)$ dans $\\mathbb{R}$.\n\nOn note : $f : D_f \\to \\mathbb{R}$, $x \\mapsto f(x)$"
}
```

**Rendu :**
```
┌─────────────────────────────────────────┐
│ Définition 1                            │
├─────────────────────────────────────────┤
│ Fonction numérique :                    │
│ Une fonction numérique f est une...    │
└─────────────────────────────────────────┘
```

##### 🟢 Théorème

```json
{
  "type": "theorem-box",
  "preamble": "**Théorème des valeurs intermédiaires** :",
  "content": "Soit $f$ une fonction continue sur un intervalle $[a, b]$.\n\nPour tout réel $k$ compris entre $f(a)$ et $f(b)$, il existe au moins un réel $c \\in [a, b]$ tel que $f(c) = k$."
}
```

##### 🟣 Propriété avec Liste

```json
{
  "type": "property-box",
  "preamble": "**Opérations sur les fonctions** :",
  "content": [
    "Si $f$ et $g$ sont paires, alors $f + g$ est paire",
    "Si $f$ et $g$ sont impaires, alors $f + g$ est impaire",
    "Si $f$ est paire et $g$ est impaire, alors $f \\times g$ est impaire"
  ],
  "listType": "bullet"
}
```

##### 🟠 Exemple (Style Inline)

```json
{
  "type": "example-box",
  "preamble": "**Application** :",
  "content": "Déterminer la parité de $f(x) = x^2 + 2$.\n\nOn a : $f(-x) = (-x)^2 + 2 = x^2 + 2 = f(x)$\n\nDonc $f$ est **paire**."
}
```

**Caractéristique :** Box inline avec bordure colorée mais **sans numérotation**.

**⚠️ IMPORTANT - Ne pas commencer par "Exemple" :**
- ❌ **NE PAS** écrire : `"content": "Exemple : Soit la fonction..."`
- ❌ **NE PAS** écrire : `"preamble": "Exemple 1 :"`
- ✅ Le badge "**Exemple**" est automatiquement ajouté par l'application
- ✅ Commencer directement par le contenu : `"preamble": "**Application** :"` ou `"content": "Déterminer..."`

**Exemple incorrect :**
```json
{
  "type": "example-box",
  "content": "Exemple : Calculer la dérivée..."  // ❌
}
```

**Exemple correct :**
```json
{
  "type": "example-box",
  "preamble": "**Application** :",              // ✅
  "content": "Calculer la dérivée..."           // ✅
}
```

##### 🟣 Remarque (Style Inline)

```json
{
  "type": "remark-box",
  "content": "**Attention** : Une fonction peut n'être ni paire ni impaire. Exemple : $f(x) = x + 1$"
}
```

---

### ⚙️ 4. BOÎTES INTERACTIVES (InteractiveBox)

Les boîtes interactives incluent des **exercices** et des **analyses** avec solutions.

```typescript
interface LessonInteractiveBoxElement {
    type: 'practice-box' | 'explain-box';
    content?: string | string[];   // Questions/contenu
    statement?: string;            // Énoncé principal
    solution?: string | string[];  // Solution détaillée
}
```

#### 🎯 Types de Boîtes Interactives

| Type | Nom Français | Couleur | Utilisation |
|------|--------------|---------|-------------|
| `practice-box` | **Exercice** | 🔴 Rouge (#DB3A34) | Exercices d'application |
| `explain-box` | **Analyse** | 🔵 Cyan (#0891B2) | Analyses détaillées |

---

#### 💡 Practice Box (Exercice)

```json
{
  "type": "practice-box",
  "statement": "Soit la fonction $f(x) = \\frac{x^2 - 4}{x - 2}$ définie sur $\\mathbb{R} \\setminus \\{2\\}$.",
  "content": [
    "Déterminer le domaine de définition de $f$",
    "Simplifier l'expression de $f(x)$ pour $x \\neq 2$",
    "Peut-on prolonger $f$ par continuité en $x = 2$ ?"
  ],
  "solution": [
    "$D_f = \\mathbb{R} \\setminus \\{2\\}$ car le dénominateur s'annule en $x = 2$.",
    "Pour $x \\neq 2$ : $f(x) = \\frac{(x-2)(x+2)}{x-2} = x + 2$",
    "Oui, on peut définir $\\tilde{f}(x) = x + 2$ sur $\\mathbb{R}$ qui prolonge $f$ par continuité."
  ]
}
```

**Rendu :**
- Boîte rouge avec badge "Exercice 1"
- Bouton 💡 pour afficher la solution dans une **modale**
- **Questions numérotées automatiquement** : 1., 2., 3. (généré par l'application)
- **Solutions numérotées automatiquement** : 1, 2, 3 avec badges circulaires

**⚠️ Important :** 
- **NE PAS** ajouter de numérotation manuelle (`1.`, `2.`, etc.) dans le texte
- L'application gère automatiquement la numérotation séquentielle
- Chaque élément du tableau `content` devient une question numérotée
- Chaque élément du tableau `solution` devient une étape numérotée

---

#### 🔍 Explain Box (Analyse)

```json
{
  "type": "explain-box",
  "statement": "**Analyse du comportement asymptotique**",
  "content": "Étudier le comportement de $f(x) = \\frac{2x^2 + 3}{x + 1}$ lorsque $x \\to +\\infty$",
  "solution": "On effectue une division selon les puissances décroissantes :\n\n$$\\frac{2x^2 + 3}{x + 1} = 2x - 2 + \\frac{5}{x+1}$$\n\nLorsque $x \\to +\\infty$ : $\\frac{5}{x+1} \\to 0$\n\nDonc : $f(x) \\sim 2x - 2$ (asymptote oblique)"
}
```

---

## 🎨 FORMATAGE AVANCÉ

### ✨ 1. Texte à Trous (Fill-in-the-Blank)

Syntaxe interactive pour les révisions actives.

#### 🔤 Syntaxe

```
___réponse___
```

#### 📝 Exemples

```json
{
  "type": "p",
  "content": "La dérivée de $x^n$ est ___$nx^{n-1}$___. Pour $n = 3$, on obtient ___$3x^2$___."
}
```

**Rendu interactif :**
- Pointillés cliquables : `·····`
- Au clic : révèle la réponse avec animation
- Tooltip : "Réfléchis, puis clique pour vérifier"

#### ⚠️ ATTENTION - Fill-in-blanks et Syntaxe LaTeX

**🔴 IMPORTANT - Séparation texte/LaTeX :**

Pour que la syntaxe LaTeX soit **correctement compilée** par KaTeX, il est **crucial de séparer** :
- Le **texte ordinaire** (hors des `$...$`)
- Les **expressions mathématiques** (dans `$...$` ou `$$...$$`)

**❌ MAUVAISE pratique - LaTeX mélangé au fill-in-blank :**
```json
{
  "content": "La fonction est définie sur ___$\\mathbb{R}$ sauf $0$___"
  // ❌ LaTeX mal séparé, risque d'erreur de compilation KaTeX
}
```

**✅ BONNE pratique - LaTeX séparé du fill-in-blank :**

**Option 1 - Fill-in sur du texte simple :**
```json
{
  "content": "La fonction est définie sur ___$\\mathbb{R}$___ sauf ___$0$___"
  // ✅ Chaque réponse contient UNE expression LaTeX complète
}
```

**Option 2 - Fill-in hors LaTeX :**
```json
{
  "content": "La fonction est définie sur $\\mathbb{R}$ sauf $0$, donc son domaine est ___$\\mathbb{R}^*$___"
  // ✅ LaTeX compilé normalement, fill-in sur réponse isolée
}
```

**Option 3 - Fill-in sur valeur numérique (idéal) :**
```json
{
  "content": "Pour $x = 3$, on calcule $f(3) = 3^2 - 4 = 9 - 4 = ___5___$"
  // ✅ Fill-in sur nombre simple, LaTeX séparé
}
```

**Règles à respecter :**
1. ✅ **Un fill-in = une réponse complète** (expression LaTeX entière OU texte)
2. ✅ **LaTeX dans `$...$`**, fill-in autour : `___$expression$___`
3. ✅ **Préférer les valeurs numériques** dans les fill-in quand possible
4. ❌ **Ne jamais couper** une expression LaTeX en deux avec `___`
5. ❌ **Ne pas mélanger** texte et LaTeX dans une même réponse

**Exemples détaillés :**

```json
// ✅ CORRECT - Valeurs numériques simples
{
  "content": "Si $x = ___2___$ alors $f(x) = 2^2 = ___4___$"
}

// ✅ CORRECT - Expression LaTeX complète dans fill-in
{
  "content": "La dérivée est $f'(x) = ___$2x + 3$___$"
}

// ✅ CORRECT - Plusieurs blancs bien séparés
{
  "content": "Le domaine est $\\mathbb{R} \\setminus \\{___0___\\}$ car $x \\neq ___0___$"
}

// ❌ INCORRECT - LaTeX coupé
{
  "content": "Le résultat est ___$3x^2 +___ 5$"  // LaTeX mal formé !
}

// ❌ INCORRECT - Texte et LaTeX mélangés
{
  "content": "___La réponse est $x = 3$___"  // Préférer séparer
}
```

**💡 Conseil pédagogique :**
- Pour les **calculs intermédiaires** : fill-in sur **valeurs numériques** (5, -3, 0...)
- Pour les **résultats finaux** : fill-in sur **expressions complètes** (`___$x^2 - 1$___`)
- Pour les **domaines** : fill-in sur **ensembles** (`___$\\mathbb{R}$___`, `___$]-\\infty, 0[___`)

#### 🎯 Utilisation Pédagogique

**⚠️ IMPORTANT - Fill-in-blanks EXCLUSIVEMENT dans les exemples :**

Les fill-in-blanks (`___réponse___`) doivent être utilisés **UNIQUEMENT dans les `example-box`** pour :
- ✅ Rendre les exemples **interactifs** et **pédagogiques**
- ✅ Encourager la **réflexion active** de l'étudiant
- ✅ Permettre l'**auto-évaluation** sur des cas concrets

**❌ NE PAS utiliser dans :**
- Définitions (`definition-box`) : Doivent rester formelles et complètes
- Théorèmes (`theorem-box`) : Énoncés rigoureux sans blancs
- Propriétés (`property-box`) : Formulations précises
- Remarques (`remark-box`) : Précisions claires

**Exemple correct - Dans example-box :**
```json
{
  "type": "example-box",
  "preamble": "**Application** :",
  "content": "Soit $f(x) = x^2 - 4x + 3$. Pour trouver le sommet, on calcule :\n\n$x_s = -\\frac{b}{2a} = -\\frac{___-4___}{2 \\times 1} = ___2___$\n\nDonc le sommet est au point $(___2___, f(2)) = (2, ___-1___)$"
}
```

**Exemple incorrect - Dans definition-box :**
```json
{
  "type": "definition-box",
  "content": "Une fonction $f$ est paire si $f(-x) = ___f(x)___$"  // ❌ Pas dans une définition !
}
```

**Bonnes pratiques pour les fill-in-blanks :**
- ✅ Placer les blancs sur des **calculs intermédiaires** dans les exemples
- ✅ Blancs sur des **résultats** à déduire
- ✅ Varier : valeurs numériques, expressions algébriques, résultats finaux
- ❌ Éviter trop de blancs dans un même exemple (3-5 maximum)
- ❌ Ne jamais mettre de blancs dans les définitions formelles

---

### ⚠️ 2. Callouts (Alertes et Astuces)

Syntaxe spéciale pour attirer l'attention.

#### 🚨 Alert Box (Attention)

**Syntaxe :** `!> texte`

```json
{
  "type": "p",
  "content": "!> **Attention** : Une fonction continue n'est pas nécessairement dérivable. Contre-exemple : $f(x) = |x|$ en $x = 0$."
}
```

**Rendu :** Box orange avec icône ⚠️

---

#### 💡 Tip Box (Astuce)

**Syntaxe :** `?> texte`

```json
{
  "type": "p",
  "content": "?> **Astuce** : Pour déterminer si une fonction est paire ou impaire, calculez toujours $f(-x)$ et comparez avec $f(x)$ et $-f(x)$."
}
```

**Rendu :** Box cyan avec icône 💡

---

### 📐 3. Formatage LaTeX

#### 🔢 Inline Math

```json
"content": "Soit $f(x) = x^2 + 3x + 2$, alors $f'(x) = 2x + 3$"
```

#### 📊 Display Math

```json
"content": "La formule du discriminant est :\n\n$$\\Delta = b^2 - 4ac$$"
```

#### 🎯 Ensembles Mathématiques

```json
"content": "Soit $f : \\mathbb{R} \\to \\mathbb{R}^+$"
```

Symboles disponibles :
- `\mathbb{R}` : ℝ (réels)
- `\mathbb{N}` : ℕ (naturels)
- `\mathbb{Z}` : ℤ (entiers)
- `\mathbb{Q}` : ℚ (rationnels)
- `\mathbb{C}` : ℂ (complexes)

---

## 🎨 SYSTÈME DE COULEURS ET STYLES

### 🎨 Palette de Couleurs des Boîtes

```css
/* Boîtes principales (avec numérotation) */
--definition-accent: #0056D2;      /* Bleu profond */
--theorem-accent: #1B873F;         /* Vert émeraude */
--proposition-accent: #0E8688;     /* Cyan */
--property-accent: #5C3BFF;        /* Violet */

/* Boîtes inline (sans numérotation) */
--example-accent: #E96D2F;         /* Orange */
--remark-accent: #8B5CF6;          /* Violet clair */

/* Boîtes interactives */
--practice-accent: #DB3A34;        /* Rouge */
--explain-accent: #0891B2;         /* Cyan */
```

### 🎨 Anatomie d'une Boîte

```
┌────────────────────────────────────────┐
│ ╔═══════════════════════════════════╗  │ ← Header
│ ║ [Badge] Définition 1          [🔎]║  │   - Badge numéroté
│ ╚═══════════════════════════════════╝  │   - Bouton action (si applicable)
├────────────────────────────────────────┤
│ Préambule (optionnel)                  │ ← Preamble (texte d'intro)
├────────────────────────────────────────┤
│ Contenu principal avec :               │ ← Body
│ • Listes                               │
│ • Formules LaTeX                       │
│ • Paragraphes                          │
└────────────────────────────────────────┘
```

#### CSS Variables Dynamiques

Chaque boîte utilise des **CSS variables** pour un theming flexible :

```css
.lesson-box {
    --lesson-accent: #0056D2;           /* Couleur principale */
    --lesson-accent-soft: rgba(0, 86, 210, 0.08);
    --lesson-accent-strong: rgba(0, 86, 210, 0.18);
}
```

---

## 🔄 MÉCANISMES DE PARSING

### 🧠 Parser de Contenu (`lessonContentParser.tsx`)

Le parser transforme le JSON en composants React avec rendu LaTeX.

#### 🔄 Flux de Parsing

```
JSON String
    ↓
normalizeLineBreaks()    → Conversion \n
    ↓
parseContent()           → Détection type de contenu
    ↓
parseLine()              → Parsing inline (blanks, bold)
    ↓
MathContent              → Rendu LaTeX avec KaTeX
    ↓
React Component
```

#### 🎯 Détection Automatique

Le parser détecte automatiquement :
- ✅ **Tableaux Markdown** : `| ... | ... |`
- ✅ **Callouts** : `!>` ou `?>`
- ✅ **Fill-in-blanks** : `___texte___`
- ✅ **Listes** : `Array<string>`
- ✅ **NoBullet** : Préfixe `>>`

#### 📝 Exemple de Parsing

**Input JSON :**
```json
{
  "content": "La fonction est ___croissante___ sur l'intervalle $[0, +\\infty[$."
}
```

**Étapes de parsing :**
1. `parseLine()` détecte `___croissante___`
2. Crée un composant `<Blank>` avec contenu "croissante"
3. KaTeX render `$[0, +\\infty[$`
4. Résultat : Texte avec blank interactif et LaTeX

---

## 🔢 SYSTÈME DE NUMÉROTATION

### 🎯 Contexte de Numérotation (`NumberingContext.tsx`)

Gestion centralisée de la numérotation automatique des boîtes.

#### 🏷️ Types Numérotés

```typescript
interface NumberingCounters {
    'definition-box': number;      // Définition 1, 2, 3...
    'theorem-box': number;         // Théorème 1, 2, 3...
    'proposition-box': number;     // Proposition 1, 2, 3...
    'property-box': number;        // Propriété 1, 2, 3...
    'example-box': number;         // (inline, pas de numéro)
    'remark-box': number;          // (inline, pas de numéro)
    'practice-box': number;        // Exercice 1, 2, 3...
    'explain-box': number;         // Analyse 1, 2, 3...
}
```

#### 🔄 Réinitialisation par Leçon

Les compteurs sont **réinitialisés** à chaque nouvelle leçon pour éviter les incohérences.

```typescript
useEffect(() => {
    resetNumbering(); // Remise à zéro au chargement
}, [lessonId]);
```

---

## 🎯 EXEMPLES COMPLETS

### 📘 Exemple 1 : Leçon Simple

```json
{
  "header": {
    "title": "La Fonction Affine",
    "subtitle": "Introduction",
    "classe": "3ème Collège",
    "chapter": "Chapitre 4"
  },
  "sections": [
    {
      "title": "Définition",
      "subsections": [
        {
          "title": "Forme générale",
          "elements": [
            {
              "type": "p",
              "content": "Une fonction affine est une fonction qui s'écrit sous la forme $f(x) = ax + b$ où $a$ et $b$ sont des **constantes réelles**."
            },
            {
              "type": "definition-box",
              "preamble": "**Fonction affine** :",
              "content": "Une fonction $f : \\mathbb{R} \\to \\mathbb{R}$ est affine si elle s'écrit :\n\n$$f(x) = ax + b$$\n\navec $a$ et $b$ réels."
            },
            {
              "type": "example-box",
              "content": "**Exemples** :\n• $f(x) = 2x + 3$ (fonction affine)\n• $g(x) = -x + 1$ (fonction affine)\n• $h(x) = 5$ (fonction constante, cas particulier avec $a = 0$)"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 📗 Exemple 2 : Leçon Avancée avec Exercice

```json
{
  "header": {
    "title": "Dérivation et Étude de Fonctions",
    "classe": "1ère Bac Sciences Mathématiques"
  },
  "sections": [
    {
      "title": "Formules de Dérivation",
      "subsections": [
        {
          "title": "Dérivées usuelles",
          "elements": [
            {
              "type": "property-box",
              "preamble": "**Tableau des dérivées** :",
              "content": [
                ">> **Fonctions de référence**",
                "$(x^n)' = nx^{n-1}$",
                "$\\left(\\frac{1}{x}\\right)' = -\\frac{1}{x^2}$",
                "$\\left(\\sqrt{x}\\right)' = \\frac{1}{2\\sqrt{x}}$",
                ">> **Fonctions trigonométriques**",
                "$(\\sin x)' = \\cos x$",
                "$(\\cos x)' = -\\sin x$"
              ],
              "listType": "bullet"
            },
            {
              "type": "p",
              "content": "?> **Astuce** : Mémorisez ces formules car elles sont fondamentales pour tous les calculs de dérivées."
            }
          ]
        },
        {
          "title": "Application",
          "elements": [
            {
              "type": "practice-box",
              "statement": "Soit $f(x) = \\frac{x^2 - 1}{x + 2}$ définie sur $\\mathbb{R} \\setminus \\{-2\\}$.",
              "content": [
                "Calculer la dérivée $f'(x)$",
                "Étudier le signe de $f'(x)$",
                "Dresser le tableau de variations de $f$"
              ],
              "solution": [
                "On utilise la formule $(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$ :\n\nAvec $u = x^2 - 1$ et $v = x + 2$ :\n$$f'(x) = \\frac{2x(x+2) - (x^2-1)}{(x+2)^2} = \\frac{x^2 + 4x + 1}{(x+2)^2}$$",
                "Le dénominateur est toujours positif. On résout $x^2 + 4x + 1 = 0$ :\n$$\\Delta = 12 \\quad \\Rightarrow \\quad x_1 = -2-\\sqrt{3}, \\quad x_2 = -2+\\sqrt{3}$$",
                "Tableau de variations :\n\n| $x$ | $-\\infty$ | $-2-\\sqrt{3}$ | $-2$ | $-2+\\sqrt{3}$ | $+\\infty$ |\n|-----|-----------|---------------|------|---------------|----------|\n| $f'(x)$ | $+$ | $0$ | $-$ | $\\vert$ | $-$ | $0$ | $+$ |\n| $f(x)$ | ↗ | Max | ↘ | $\\vert$ | ↘ | Min | ↗ |"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📚 BONNES PRATIQUES

### ✅ Structure et Organisation

1. **Hiérarchie claire** : Section → Subsection → Elements
2. **Titres descriptifs sans numérotation** : "Introduction", "Définition", "Cas particuliers" (la numérotation est automatique)
3. **Progression logique** : Définition → Propriétés → Exemples → Exercices
4. **Pas de numérotation manuelle** : Les sections, subsections et listes sont numérotées automatiquement par l'application

### ✅ Contenu Pédagogique

1. **Choisir le bon type de boîte** :
   - `definition-box` : Définitions formelles et rigoureuses
   - `theorem-box` : Énoncés de théorèmes à démontrer
   - `proposition-box` : Propositions et assertions mathématiques
   - `property-box` : Propriétés importantes à retenir
   - `example-box` : Exemples concrets d'application
   - `remark-box` : Remarques, précisions, mises en garde

2. **Exemples variés** : Au moins un exemple par concept avec `example-box`
   - ❌ Ne PAS commencer par "Exemple :" (ajouté automatiquement)
   - ✅ Commencer directement par le contenu ou avec `"preamble": "**Application** :"`

3. **Exercices progressifs** : Utiliser `practice-box` avec solutions détaillées

4. **Fill-in-blanks pédagogiques** : 
   - ✅ UNIQUEMENT dans les `example-box` (exemples interactifs)
   - ❌ JAMAIS dans les `definition-box`, `theorem-box`, `property-box`
   - ✅ Placer les blancs sur des calculs intermédiaires et résultats
   - ✅ 3-5 blancs maximum par exemple
   - ⚠️ **SÉPARER le LaTeX du fill-in-blank** : `___$\mathbb{R}$___` et non `___$\mathbb{R}$ sauf $0$___`

5. **Listes sans symboles manuels** :
   - ✅ Les puces sont automatiquement ajoutées
   - ❌ Ne PAS ajouter `•`, `-`, `*` dans le texte

6. **Callouts pédagogiques** :
   - `!>` pour les alertes et mises en garde importantes
   - `?>` pour les astuces et conseils méthodologiques

### ✅ Formatage LaTeX

1. **Inline vs Display** :
   - Inline `$...$` : Formules courtes dans le texte
   - Display `$$...$$` : Équations importantes, isolées
2. **Espacement** : Laisser une ligne vide avant/après `$$...$$`
3. **Fractions** : Préférer `\frac{a}{b}` à `a/b`
4. **Parenthèses adaptées** : `\left( ... \right)` pour les grandes expressions
5. **⚠️ Fill-in-blanks et LaTeX** :
   - ✅ **Séparer** la syntaxe LaTeX : `___$x^2$___` (expression complète)
   - ✅ Préférer les **valeurs numériques** : `___5___`, `___-3___`
   - ❌ Ne pas couper une expression LaTeX : `___$3x^2 +___` (incorrect)
   - ❌ Ne pas mélanger texte et LaTeX : `___La réponse est $x$___` (à éviter)







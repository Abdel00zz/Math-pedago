# 📘 Guide Complet : Leçons de Mathématiques en JSON

## 🎯 Objectif
Ce guide vous permet de transformer n'importe quelle leçon de mathématiques (PDF, Word, papier) en un fichier JSON parfaitement structuré pour le système Smart Chapter.

---

## 📋 Table des matières
1. [Structure Générale](#structure-générale)
2. [En-tête de la Leçon](#en-tête-de-la-leçon)
3. [Sections et Sous-sections](#sections-et-sous-sections)
4. [Types d'Éléments](#types-déléments)
5. [Formatage du Texte](#formatage-du-texte)
6. [Formules Mathématiques](#formules-mathématiques)
7. [Listes et Puces](#listes-et-puces)
8. [Colonnes Parallèles](#colonnes-parallèles)
9. [Images](#images)
10. [Exemples Complets](#exemples-complets)
11. [Checklist de Validation](#checklist-de-validation)

---

## 📐 Structure Générale

### Squelette de base
```json
{
  "header": {
    "title": "Titre de la leçon",
    "subtitle": "Sous-titre optionnel",
    "chapter": "Chapitre 1",
    "classe": "2nde",
    "academicYear": "2024-2025"
  },
  "sections": [
    {
      "title": "I. Titre de la section",
      "intro": "Texte d'introduction optionnel",
      "subsections": [
        {
          "title": "1. Titre de la sous-section",
          "elements": []
        }
      ]
    }
  ]
}
```

### ⚠️ Règles Importantes
- ✅ Toujours utiliser des **guillemets doubles** `"` pour les clés et valeurs
- ✅ Pas de virgule après le dernier élément d'un objet ou tableau
- ✅ Échapper les guillemets dans le contenu : `\"`
- ✅ Les retours à la ligne dans le JSON doivent être explicites avec `\n`

---

## 📄 En-tête de la Leçon

### Champs disponibles

| Champ | Type | Obligatoire | Description | Exemple |
|-------|------|-------------|-------------|---------|
| `title` | string | ✅ Oui | Titre principal de la leçon | `"Fonctions dérivées"` |
| `subtitle` | string | ⚪ Non | Sous-titre ou précision | `"Définition et propriétés"` |
| `chapter` | string | ⚪ Non | Numéro/nom du chapitre | `"Chapitre 3 : Analyse"` |
| `classe` | string | ⚪ Non | Niveau scolaire | `"1ère S"` |
| `academicYear` | string | ⚪ Non | Année scolaire | `"2024-2025"` |

### Exemple complet
```json
{
  "header": {
    "title": "Dérivation et applications",
    "subtitle": "Étude locale des fonctions",
    "chapter": "Chapitre 4 : Analyse",
    "classe": "Terminale S",
    "academicYear": "2024-2025"
  },
  "sections": []
}
```

---

## 🗂️ Sections et Sous-sections

### Structure hiérarchique
```
Leçon
└── Section (I, II, III...)
    ├── Introduction (optionnel)
    └── Sous-sections (1, 2, 3...)
        └── Éléments (paragraphes, définitions, théorèmes...)
```

### Exemple de section
```json
{
  "title": "I. Introduction aux fonctions continues",
  "intro": "Une fonction continue est une fonction dont la courbe peut être tracée sans lever le crayon.",
  "subsections": [
    {
      "title": "1. Définition intuitive",
      "elements": [
        {
          "type": "p",
          "content": "Intuitivement, une fonction est continue si..."
        }
      ]
    },
    {
      "title": "2. Définition formelle",
      "elements": []
    }
  ]
}
```

### 💡 Conseils
- Utilisez des numérotations claires : `I.`, `II.` pour les sections, `1.`, `2.` pour les sous-sections
- Le champ `intro` est parfait pour un paragraphe d'introduction général
- Gardez les titres courts et descriptifs

---

## 🧩 Types d'Éléments

### Liste complète des types

| Type | Icône | Couleur | Usage |
|------|-------|---------|-------|
| `p` | 📝 | Gris | Paragraphe de texte simple |
| `table` | 📊 | Gris | Tableau (format Markdown) |
| `definition-box` | 📘 | Bleu | Définition mathématique |
| `theorem-box` | 🔷 | Vert | Théorème |
| `proposition-box` | 🔶 | Turquoise | Proposition |
| `property-box` | ⚡ | Indigo | Propriété |
| `example-box` | 💡 | Orange | Exemple d'application |
| `remark-box` | 📌 | Violet | Remarque ou note |
| `practice-box` | ✏️ | Rouge | Exercice d'entraînement |
| `explain-box` | 💭 | Cyan | Explication ou analyse |

### 1️⃣ Paragraphe simple (`p`)

Pour du texte normal, sans cadre.

```json
{
  "type": "p",
  "content": "Les fonctions polynômes sont continues sur $\\mathbb{R}$. Cela signifie que leur courbe ne présente aucune rupture."
}
```

**Quand l'utiliser :**
- Texte introductif
- Explications simples
- Transitions entre les concepts

### 2️⃣ Tableau (`table`)

Pour présenter des données en tableau (format Markdown).

```json
{
  "type": "table",
  "content": "| x | -∞ | 0 | +∞ |\n|---|---|---|---|\n| f'(x) | - | 0 | + |\n| f(x) | +∞ ↘ | 0 | ↗ +∞ |"
}
```

**Format Markdown attendu :**
```
| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Valeur 1  | Valeur 2  | Valeur 3  |
```

### 3️⃣ Boîtes pédagogiques (définition, théorème, etc.)

Structure complète :
```json
{
  "type": "definition-box",
  "preamble": "Définition 1 : Fonction continue",
  "listType": "bullet",
  "columns": false,
  "content": [
    "Une fonction $f$ est continue en $a$ si...",
    ">> Condition nécessaire",
    "La limite en $a$ existe et vaut $f(a)$"
  ]
}
```

**Champs disponibles :**

| Champ | Type | Description |
|-------|------|-------------|
| `type` | string | Type de la boîte (voir tableau ci-dessus) |
| `preamble` | string | Titre/énoncé de la boîte (ex: "Théorème 1") |
| `content` | string[] | Tableau de lignes de contenu |
| `listType` | string | `"bullet"` (⭐), `"numbered"` (①②③) ou `undefined` |
| `columns` | boolean | `true` pour colonnes parallèles, `false` sinon |
| `image` | object | Optionnel : image attachée (voir section Images) |

---

## ✍️ Formatage du Texte

### Syntaxe disponible

| Format | Syntaxe | Exemple | Rendu |
|--------|---------|---------|-------|
| **Gras** | `**texte**` | `**Important**` | **Important** |
| *Italique* | `*texte*` | `*remarque*` | *remarque* |
| <u>Souligné</u> | `<u>texte</u>` | `<u>essentiel</u>` | <u>essentiel</u> |
| ~~Barré~~ | `~~texte~~` | `~~obsolète~~` | ~~obsolète~~ |

### Exemples d'utilisation
```json
{
  "type": "p",
  "content": "**Attention :** Ne pas confondre *continuité* et <u>dérivabilité</u>."
}
```

```json
{
  "type": "remark-box",
  "preamble": "Remarque importante",
  "content": [
    "La **dérivabilité** implique la continuité",
    "Mais la *réciproque* est ~~vraie~~ **fausse** !"
  ]
}
```

---

## 🔢 Formules Mathématiques

### Syntaxe KaTeX

Le système utilise **KaTeX** pour le rendu des formules mathématiques.

### Types de formules

#### 1. Formule inline (dans le texte)
**Syntaxe :** `$formule$`

```json
{
  "type": "p",
  "content": "Soit $f(x) = x^2 + 2x + 1$ une fonction polynôme."
}
```

**Rendu :** Soit f(x) = x² + 2x + 1 une fonction polynôme.

#### 2. Formule display (centrée)
**Syntaxe :** `$$formule$$`

```json
{
  "type": "p",
  "content": "La formule de dérivation est :\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$"
}
```

### Symboles mathématiques courants

| Type | Symbole | Code LaTeX |
|------|---------|------------|
| **Ensembles** | ℕ, ℤ, ℚ, ℝ, ℂ | `\mathbb{N}`, `\mathbb{Z}`, `\mathbb{Q}`, `\mathbb{R}`, `\mathbb{C}` |
| **Opérateurs** | ≤, ≥, ≠, ≈ | `\leq`, `\geq`, `\neq`, `\approx` |
| **Ensembles** | ∈, ∉, ⊂, ∪, ∩ | `\in`, `\notin`, `\subset`, `\cup`, `\cap` |
| **Logique** | ∀, ∃ | `\forall`, `\exists` |
| **Calcul** | ∑, ∏, ∫ | `\sum`, `\prod`, `\int` |
| **Autres** | ∞, →, ⇒ | `\infty`, `\to`, `\Rightarrow` |
| **Lettres grecques** | α, β, γ, δ, θ, λ, μ, π, σ, ω | `\alpha`, `\beta`, `\gamma`, `\delta`, `\theta`, `\lambda`, `\mu`, `\pi`, `\sigma`, `\omega` |

### Constructions complexes

#### Fractions
```
$\frac{a}{b}$          →  a/b
$\frac{x^2 + 1}{x - 1}$ →  (x² + 1)/(x - 1)
```

#### Racines
```
$\sqrt{x}$             →  √x
$\sqrt[3]{x}$          →  ³√x
```

#### Puissances et indices
```
$x^2$                  →  x²
$x^{n+1}$              →  x^(n+1)
$x_n$                  →  xₙ
$x_{i,j}$              →  xᵢ,ⱼ
```

#### Limites et dérivées
```
$\lim_{x \to 0} f(x)$  →  lim(x→0) f(x)
$f'(x)$                →  f'(x)
$f''(x)$               →  f''(x)
```

#### Intégrales et sommes
```
$\int_{a}^{b} f(x) dx$     →  ∫ₐᵇ f(x) dx
$\sum_{i=1}^{n} i$         →  Σᵢ₌₁ⁿ i
$\prod_{k=1}^{n} k$        →  Πₖ₌₁ⁿ k
```

### Exemple complet avec formules
```json
{
  "type": "theorem-box",
  "preamble": "Théorème 1 : Dérivée d'un produit",
  "content": [
    "Soient $u$ et $v$ deux fonctions dérivables sur $\\mathbb{R}$.",
    "Alors $(uv)' = u'v + uv'$",
    ">> Démonstration",
    "On utilise la définition de la dérivée :",
    "$$(uv)'(x) = \\lim_{h \\to 0} \\frac{u(x+h)v(x+h) - u(x)v(x)}{h}$$"
  ]
}
```

---

## 📝 Listes et Puces

### Types de listes

#### 1. Liste à puces (`"listType": "bullet"`)

```json
{
  "type": "property-box",
  "preamble": "Propriété : Dérivées usuelles",
  "listType": "bullet",
  "content": [
    "$(x^n)' = nx^{n-1}$",
    "$e^x' = e^x$",
    "$\\ln(x)' = \\frac{1}{x}$",
    "$(\\sin x)' = \\cos x$",
    "$(\\cos x)' = -\\sin x$"
  ]
}
```

**Rendu :**
```
⚡ Propriété : Dérivées usuelles
   ⭐ (xⁿ)' = nxⁿ⁻¹
   ⭐ eˣ' = eˣ
   ⭐ ln(x)' = 1/x
   ⭐ (sin x)' = cos x
   ⭐ (cos x)' = -sin x
```

#### 2. Liste numérotée (`"listType": "numbered"`)

```json
{
  "type": "practice-box",
  "preamble": "Exercice : Étapes de résolution",
  "listType": "numbered",
  "content": [
    "Déterminer le domaine de définition de $f$",
    "Calculer la dérivée $f'(x)$",
    "Étudier le signe de $f'(x)$",
    "Dresser le tableau de variations",
    "Tracer la courbe représentative"
  ]
}
```

**Rendu :**
```
✏️ Exercice : Étapes de résolution
   ① Déterminer le domaine de définition de f
   ② Calculer la dérivée f'(x)
   ③ Étudier le signe de f'(x)
   ④ Dresser le tableau de variations
   ⑤ Tracer la courbe représentative
```

#### 3. Sans liste (paragraphes simples)

```json
{
  "type": "definition-box",
  "preamble": "Définition : Suite convergente",
  "content": [
    "Une suite $(u_n)$ converge vers $\\ell$ si :",
    "Pour tout $\\varepsilon > 0$, il existe $N \\in \\mathbb{N}$ tel que :",
    "Pour tout $n \\geq N$, on a $|u_n - \\ell| < \\varepsilon$"
  ]
}
```

### Titres intermédiaires avec `>>`

Pour insérer un titre ou sous-titre dans une liste sans puce ni numéro :

```json
{
  "type": "example-box",
  "preamble": "Exemples de limites",
  "listType": "bullet",
  "content": [
    ">> Limites finies",
    "$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
    "$\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$",
    ">> Limites infinies",
    "$\\lim_{x \\to +\\infty} e^x = +\\infty$",
    "$\\lim_{x \\to +\\infty} \\ln x = +\\infty$"
  ]
}
```

**Rendu :**
```
💡 Exemples de limites
   Limites finies               ← Sans puce
   ⭐ lim(x→0) sin(x)/x = 1
   ⭐ lim(x→0) (eˣ-1)/x = 1
   Limites infinies             ← Sans puce
   ⭐ lim(x→+∞) eˣ = +∞
   ⭐ lim(x→+∞) ln x = +∞
```

---

## 🔲 Colonnes Parallèles

### Concept

Les colonnes parallèles permettent d'afficher du contenu côte à côte, comme dans un tableau, mais avec des listes.

### Syntaxe

- Activer : `"columns": true`
- Doit avoir une liste : `"listType": "bullet"` ou `"numbered"`
- Séparateur : **pipe** `|` entre chaque colonne
- Les lignes `>>` servent de titres (optionnel)

### Exemple simple (2 colonnes)

```json
{
  "type": "property-box",
  "preamble": "Règles de dérivation",
  "listType": "bullet",
  "columns": true,
  "content": [
    "$(u+v)' | $u' + v'$",
    "$(uv)' | $u'v + uv'$",
    "$\\left(\\frac{u}{v}\\right)' | $\\frac{u'v - uv'}{v^2}$"
  ]
}
```

**Rendu :**
```
⚡ Règles de dérivation
   ⭐ (u+v)'        ⭐ u' + v'
   ⭐ (uv)'         ⭐ u'v + uv'
   ⭐ (u/v)'        ⭐ (u'v - uv')/v²
```

### Exemple avec 3 colonnes

```json
{
  "type": "example-box",
  "preamble": "Tableau de valeurs",
  "listType": "numbered",
  "columns": true,
  "content": [
    "$x$ | $f(x)$ | $f'(x)$",
    "$0$ | $1$ | $0$",
    "$1$ | $e$ | $e$",
    "$2$ | $e^2$ | $2e^2$"
  ]
}
```

**Rendu :**
```
💡 Tableau de valeurs
   ① x         ① f(x)      ① f'(x)
   ① 0         ① 1         ① 0
   ① 1         ① e         ① e
   ① 2         ① e²        ① 2e²
```

### Cas d'usage

✅ **Bon usage :**
- Règles de calcul (formule → résultat)
- Tableaux de valeurs
- Avant/Après comparaisons
- Propriétés et leurs conséquences

❌ **Mauvais usage :**
- Paragraphes longs (difficiles à lire en colonnes)
- Plus de 4 colonnes (trop étroit)
- Contenu de tailles très différentes

---

## 🖼️ Images

### Structure de base

```json
{
  "type": "definition-box",
  "preamble": "Définition : Tangente",
  "content": ["La tangente en un point..."],
  "image": {
    "src": "/chapters/2nde/lessons/pictures/tangente.png",
    "alt": "Illustration de la tangente",
    "caption": "Figure 1 : Tangente à une courbe",
    "position": "bottom",
    "align": "center",
    "width": "80%"
  }
}
```

### Champs disponibles

| Champ | Type | Obligatoire | Valeurs possibles | Description |
|-------|------|-------------|-------------------|-------------|
| `src` | string | ✅ Oui | Chemin relatif | Chemin de l'image (ex: `/chapters/2nde/lessons/pictures/nom.png`) |
| `alt` | string | ⚪ Non | Texte libre | Texte alternatif pour accessibilité |
| `caption` | string | ⚪ Non | Texte libre | Légende affichée sous l'image |
| `position` | string | ⚪ Non | `"top"`, `"bottom"` | Position de l'image dans la box |
| `align` | string | ⚪ Non | `"left"`, `"center"`, `"right"` | Alignement horizontal |
| `width` | string | ⚪ Non | `"30%"`, `"50%"`, `"80%"`, `"100%"` | Largeur de l'image |

### Exemples

#### Image centrée simple
```json
{
  "image": {
    "src": "/chapters/1ere/lessons/pictures/courbe_exponentielle.png",
    "caption": "Courbe de la fonction exponentielle"
  }
}
```

#### Image à gauche, petite
```json
{
  "image": {
    "src": "/chapters/terminale/lessons/pictures/repere.png",
    "alt": "Repère orthonormé",
    "caption": "Figure 2 : Repère $(O, \\vec{i}, \\vec{j})$",
    "position": "top",
    "align": "left",
    "width": "40%"
  }
}
```

### 💡 Conseils
- Utilisez des **noms de fichiers descriptifs** : `derivee_produit.png` plutôt que `img1.png`
- **Optimisez les images** : PNG pour les schémas, JPEG pour les photos
- Les images sont stockées dans : `/chapters/{classe}/lessons/pictures/`
- Pensez à ajouter des **légendes** pour le contexte pédagogique

---

## 📚 Exemples Complets

### Exemple 1 : Leçon simple sur les fonctions

```json
{
  "header": {
    "title": "Les fonctions affines",
    "subtitle": "Généralités et représentation graphique",
    "chapter": "Chapitre 2 : Fonctions",
    "classe": "3ème",
    "academicYear": "2024-2025"
  },
  "sections": [
    {
      "title": "I. Définition",
      "intro": "Une fonction affine est une fonction qui associe à chaque nombre $x$ un nombre de la forme $ax + b$.",
      "subsections": [
        {
          "title": "1. Forme générale",
          "elements": [
            {
              "type": "definition-box",
              "preamble": "Définition : Fonction affine",
              "content": [
                "Une fonction $f$ est **affine** si elle s'écrit sous la forme :",
                "$f(x) = ax + b$",
                "où $a$ et $b$ sont deux nombres réels fixés."
              ]
            },
            {
              "type": "remark-box",
              "preamble": "Remarque",
              "content": [
                "Si $a = 0$, la fonction est *constante*",
                "Si $b = 0$, la fonction est *linéaire*"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "II. Représentation graphique",
      "subsections": [
        {
          "title": "1. Propriété fondamentale",
          "elements": [
            {
              "type": "property-box",
              "preamble": "Propriété : Représentation",
              "content": [
                "La représentation graphique d'une fonction affine est une **droite**"
              ]
            },
            {
              "type": "example-box",
              "preamble": "Exemple",
              "listType": "numbered",
              "content": [
                "Soit $f(x) = 2x + 1$",
                "Calculons quelques valeurs",
                "Traçons les points dans un repère"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Exemple 2 : Théorème avec démonstration

```json
{
  "type": "theorem-box",
  "preamble": "Théorème de Pythagore",
  "listType": "bullet",
  "content": [
    "Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
    ">> Formule",
    "Si $ABC$ est rectangle en $A$, alors :",
    "$BC^2 = AB^2 + AC^2$",
    ">> Démonstration",
    "On utilise la notion d'aire pour démontrer ce résultat..."
  ],
  "image": {
    "src": "/chapters/4eme/lessons/pictures/pythagore.png",
    "caption": "Triangle rectangle ABC",
    "width": "50%",
    "align": "center"
  }
}
```

### Exemple 3 : Règles de dérivation avec colonnes

```json
{
  "type": "property-box",
  "preamble": "Propriété : Opérations sur les dérivées",
  "listType": "bullet",
  "columns": true,
  "content": [
    "$(u + v)' | $u' + v'$",
    "$(ku)' | $ku'$ (où $k \\in \\mathbb{R}$)",
    "$(uv)' | $u'v + uv'$",
    "$\\left(\\frac{1}{u}\\right)' | $-\\frac{u'}{u^2}$",
    "$\\left(\\frac{u}{v}\\right)' | $\\frac{u'v - uv'}{v^2}$"
  ]
}
```

### Exemple 4 : Exercice guidé

```json
{
  "type": "practice-box",
  "preamble": "Exercice 1 : Étude de fonction",
  "listType": "numbered",
  "content": [
    "Soit $f(x) = x^3 - 3x + 2$",
    ">> Objectif",
    "Étudier les variations de cette fonction",
    ">> Questions",
    "Déterminer le domaine de définition",
    "Calculer $f'(x)$",
    "Résoudre $f'(x) = 0$",
    "Dresser le tableau de variations",
    "En déduire les extremums locaux"
  ]
}
```

---

## ✅ Checklist de Validation

Avant de finaliser votre JSON, vérifiez :

### Structure générale
- [ ] Le fichier commence par `{` et se termine par `}`
- [ ] Toutes les clés utilisent des guillemets doubles `"`
- [ ] Pas de virgule après le dernier élément
- [ ] L'indentation est cohérente (2 ou 4 espaces)

### En-tête
- [ ] Le champ `title` est présent et non vide
- [ ] Les champs optionnels utilisent des valeurs appropriées
- [ ] Les formules mathématiques sont correctement échappées

### Sections
- [ ] Chaque section a un `title` et un tableau `subsections`
- [ ] Les titres de sections suivent une numérotation (I, II, III...)
- [ ] Les sous-sections ont un `title` et un tableau `elements`

### Éléments
- [ ] Tous les éléments ont un champ `type` valide
- [ ] Les `content` sont soit `string` (pour `p` et `table`) soit `string[]` (pour les boxes)
- [ ] Les formules mathématiques utilisent `$...$` ou `$$...$$`
- [ ] Les backslashes sont échappés : `\\` dans les formules

### Listes et colonnes
- [ ] `listType` est `"bullet"`, `"numbered"` ou absent
- [ ] `columns` est `true` ou `false` (ou absent)
- [ ] Les colonnes utilisent le séparateur `|` correctement
- [ ] Les titres intermédiaires commencent par `>>`

### Images
- [ ] Le chemin `src` est correct et complet
- [ ] Les valeurs de `position`, `align`, `width` sont valides
- [ ] Les légendes sont descriptives

### Formules mathématiques
- [ ] Les symboles spéciaux utilisent la syntaxe LaTeX
- [ ] Les accolades sont présentes pour les indices/exposants : `x^{n+1}` et non `x^n+1`
- [ ] Les ensembles utilisent `\mathbb{R}`, pas juste `R`
- [ ] Les fractions utilisent `\frac{num}{den}`

### Formatage
- [ ] Le gras utilise `**texte**`
- [ ] L'italique utilise `*texte*`
- [ ] Le souligné utilise `<u>texte</u>`
- [ ] Le barré utilise `~~texte~~`

---

## 🎓 Conseils Pédagogiques

### Organisation du contenu

1. **Commencez par la structure** : Identifiez d'abord les grandes sections et sous-sections
2. **Définissez avant d'expliquer** : Donnez toujours les définitions avant les exemples
3. **Utilisez la progression** : Théorème → Démonstration → Exemple → Exercice
4. **Variez les éléments** : Alternez texte, définitions, exemples pour maintenir l'intérêt

### Choix des types d'éléments

| Situation | Type recommandé |
|-----------|----------------|
| Nouvelle notion | `definition-box` |
| Résultat important | `theorem-box` ou `proposition-box` |
| Règle générale | `property-box` |
| Illustration pratique | `example-box` |
| Point d'attention | `remark-box` |
| Application à faire | `practice-box` |
| Explication détaillée | `explain-box` |
| Texte de liaison | `p` (paragraphe) |

### Formules mathématiques

- Utilisez `$...$` pour les formules **courtes** dans le texte
- Utilisez `$$...$$` pour les formules **importantes** à mettre en valeur
- Ajoutez des **espaces** autour des opérateurs : `a + b` plutôt que `a+b`
- Utilisez `\left( \right)` pour les **grandes parenthèses** qui s'adaptent à la taille

### Images et schémas

- Les **schémas géométriques** doivent être clairs et épurés
- Les **graphiques** doivent avoir des axes légendés
- Préférez les **SVG** pour la netteté (ou PNG haute résolution)
- Ajoutez toujours une **légende explicative**

---

## 🔧 Outils et Astuces

### Validation JSON

Utilisez un validateur JSON en ligne pour vérifier la syntaxe :
- [jsonlint.com](https://jsonlint.com/)
- [jsonformatter.org](https://jsonformatter.org/)

### Éditeurs recommandés

- **VS Code** avec l'extension "JSON" pour la coloration syntaxique
- **Sublime Text** avec le package "Pretty JSON"
- **Notepad++** avec le plugin "JSON Viewer"

### Raccourcis utiles

- `Ctrl + F` : Rechercher un motif (utile pour vérifier les guillemets)
- `Ctrl + H` : Remplacer (pour corriger en masse)
- `Ctrl + Shift + L` : Formater le JSON automatiquement (VS Code)

### Conversion PDF → JSON

**Étapes recommandées :**

1. **Extraction du texte** : Utilisez un outil OCR si nécessaire
2. **Identification de la structure** : Repérez sections, sous-sections, théorèmes
3. **Copie progressive** : Copiez section par section dans le JSON
4. **Formatage des formules** : Convertissez les formules en LaTeX
5. **Ajout des images** : Enregistrez et référencez les images
6. **Validation** : Testez le JSON dans l'application

---

## 📞 Support et Questions

### Problèmes courants

#### Erreur : "Unexpected token"
➡️ Vérifiez les virgules (pas de virgule après le dernier élément d'un tableau ou objet)

#### Les formules ne s'affichent pas
➡️ Vérifiez que vous utilisez `$` ou `$$` et que les backslashes sont doublés : `\\`

#### Les colonnes ne fonctionnent pas
➡️ Assurez-vous que `listType` est défini ET que `columns` est `true`

#### L'image ne s'affiche pas
➡️ Vérifiez le chemin `src` et que le fichier existe dans le dossier `pictures/`

---

## 📖 Références

### Documentation KaTeX
- [Liste complète des symboles](https://katex.org/docs/supported.html)
- [Guide de référence](https://katex.org/docs/support_table.html)

### Markdown
- [Guide Markdown](https://www.markdownguide.org/)
- [Tableaux Markdown](https://www.markdownguide.org/extended-syntax/#tables)

---

**Version du guide : 2.0**
**Dernière mise à jour : 2025-01-10**
**Compatible avec : Smart Chapter v1**

---

## 🎉 Conclusion

Vous avez maintenant toutes les clés pour créer des leçons de mathématiques parfaitement structurées en JSON !

**Résumé des points clés :**
- Structure hiérarchique : Header → Sections → Sous-sections → Éléments
- 10 types d'éléments pédagogiques différents
- Formatage riche : gras, italique, formules LaTeX
- Listes à puces, numérotées, et colonnes parallèles
- Support complet des images avec légendes

**Bonne création de contenu ! 📚✨**

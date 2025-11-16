# Guide de Rédaction des Leçons JSON - Version IA-Optimisée

## 🎯 Guide pour Outils d'Intelligence Artificielle

Ce guide est conçu pour permettre aux outils IA de générer automatiquement des leçons JSON parfaitement conformes à la plateforme Math-pedago.

---

## 📋 Table des Matières
1. [Structure Obligatoire](#structure-obligatoire)
2. [Types d'Éléments Disponibles](#types-déléments-disponibles)
3. [Règles de Validation](#règles-de-validation)
4. [Principes Pédagogiques](#principes-pédagogiques)
5. [Exemples Complets](#exemples-complets)
6. [Checklist de Validation](#checklist-de-validation)
7. [Erreurs Fréquentes à Éviter](#erreurs-fréquentes-à-éviter)

---

## Structure Obligatoire (sans numérotation visible)

**RÈGLE GLOBALE SUR LES TITRES**  
Les IA **ne doivent jamais générer** de numérotation explicite dans les titres ou sous‑titres du JSON.
- ❌ Interdit : "1. Introduction", "2) Définitions", "A) Propriétés" dans `title`, `subtitle`, `sections[].title`, `subsections[].title` ou `preamble`.
- ✅ Autorisé : Titres descriptifs simples comme "Introduction", "Définition de la dérivée", "Propriétés utiles".
- ✅ Si une progression numérotée est nécessaire, utiliser une **liste** avec `listType: "numbered"` à l’intérieur du `content`, jamais dans les titres.

### Architecture JSON Complète

```json
{
  "header": {
    "title": "string (OBLIGATOIRE)",
    "subtitle": "string (OBLIGATOIRE)",
    "classe": "string (OBLIGATOIRE)",
    "chapter": "string (OPTIONNEL)",
    "academicYear": "string (OPTIONNEL, format: YYYY-YYYY)"
  },
  "sections": [
    {
      "title": "string (OBLIGATOIRE)",
      "subsections": [
        {
          "title": "string (OBLIGATOIRE)",
          "elements": [
            {
              "type": "string (OBLIGATOIRE)",
              "content": "string OU array (OBLIGATOIRE)"
            }
          ]
        }
      ]
    }
  ]
}
```

### Règles Structurelles STRICTES

#### ✅ OBLIGATOIRE
- **Header** : Doit contenir au minimum `title`, `subtitle`, et `classe`
- **Sections** : Au moins 1 section avec un `title`
- **Subsections** : Au moins 1 subsection par section avec un `title`
- **Elements** : Au moins 1 élément par subsection avec `type` et `content`

#### ❌ INTERDIT
- Pas de propriétés supplémentaires non documentées dans le header
- Pas de sections vides (sans subsections)
- Pas de subsections vides (sans elements)
- Pas d'éléments sans type ou sans content

#### ⚠️ ATTENTION
- Les tableaux ne peuvent contenir QUE des objets du même type
- Les strings doivent être échappées correctement (`\"`, `\\n`)
- Les formules LaTeX doivent utiliser `\\` pour les commandes

---

## Types d'Éléments Disponibles

### 📦 Types d'Éléments et Leurs Propriétés

#### 1. `definition-box` - Définitions Mathématiques

**Usage** : Pour les définitions formelles de concepts mathématiques.

**Propriétés** :
```json
{
  "type": "definition-box",
  "preamble": "string (OPTIONNEL) - Titre ou introduction",
  "content": "string OU array (OBLIGATOIRE) - Contenu de la définition"
}
```

**Exemple complet** :
```json
{
  "type": "definition-box",
  "preamble": "**Fonction numérique** :",
  "content": "Une fonction $f$ est une relation qui associe à chaque élément $x$ de $\\mathbb{R}$ **au plus un élément** $y$ de $\\mathbb{R}$.\n\n**Notation** : $f : \\mathbb{R} \\to \\mathbb{R}$, $x \\mapsto f(x) = y$"
}
```

**Règles** :
- ✅ Utiliser pour des définitions précises et formelles
- ✅ Inclure les notations mathématiques
- ❌ Ne pas mélanger avec des exemples dans la même box

---

#### 2. `example-box` - Exemples et Applications

**Usage** : Pour illustrer des concepts par des exemples concrets.

**Propriétés** :
```json
{
  "type": "example-box",
  "preamble": "string (OPTIONNEL) - Titre de l'exemple",
  "content": "string OU array (OBLIGATOIRE) - Contenu",
  "listType": "string (OPTIONNEL) - 'bullet' ou 'numbered'"
}
```

**Exemple avec string** :
```json
{
  "type": "example-box",
  "preamble": "**Calcul d'une dérivée** :",
  "content": "Soit $f(x) = x^2 + 3x$. Calculons $f'(x)$ :\n\n$$f'(x) = 2x + 3$$\n\nDonc pour $x = 1$ : $f'(1) = ___5___$"
}
```

**Exemple avec array** :
```json
{
  "type": "example-box",
  "preamble": "**Exemples de domaines** :",
  "listType": "bullet",
  "content": [
    "**Polynômes** : $D_f = \\mathbb{R}$",
    "**Racine carrée** : $D_f = [0 ; +\\infty[$",
    "**Fonction inverse** : $D_f = \\mathbb{R}^*$"
  ]
}
```

**Règles** :
- ✅ Utiliser `listType: "bullet"` pour des exemples indépendants
- ✅ Utiliser `listType: "numbered"` pour des étapes séquentielles
- ✅ Les éléments de liste peuvent contenir du LaTeX
- ❌ Ne pas utiliser de puces manuelles (•, -, *) quand listType est défini

---

#### 3. `practice-box` - Exercices avec Solutions

**Usage** : Pour les exercices d'application avec solutions détaillées.

**Propriétés** :
```json
{
  "type": "practice-box",
  "statement": "string (OBLIGATOIRE) - Énoncé de l'exercice",
  "content": "string OU array (OBLIGATOIRE) - Questions",
  "listType": "string (OPTIONNEL) - 'numbered' recommandé pour questions",
  "solution": "array (OBLIGATOIRE) - Solutions détaillées",
  "placeholder": "string (OPTIONNEL) - Indice ou aide"
}
```

**Exemple simple** :
```json
{
  "type": "practice-box",
  "statement": "Calculer la dérivée de $f(x) = 3x^2 + 2x - 1$",
  "content": "Déterminer $f'(x)$",
  "solution": [
    "En appliquant les règles de dérivation :\n\n$f'(x) = 3 \\times 2x + 2 \\times 1 - 0 = 6x + 2$"
  ]
}
```

**Exemple avec plusieurs questions** :
```json
{
  "type": "practice-box",
  "statement": "Étude d'une fonction polynomiale\n\nSoit $f(x) = x^2 - 4x + 3$",
  "listType": "numbered",
  "content": [
    "Calculer $f(0)$ et $f(2)$",
    "Déterminer les racines de $f$",
    "Dresser le tableau de variations"
  ],
  "solution": [
    "$f(0) = 3$ et $f(2) = 4 - 8 + 3 = -1$",
    "$f(x) = 0 \\Leftrightarrow x^2 - 4x + 3 = 0$\n\n$\\Delta = 16 - 12 = 4$\n\n$x_1 = \\dfrac{4 + 2}{2} = 3$ et $x_2 = \\dfrac{4 - 2}{2} = 1$",
    "$f'(x) = 2x - 4 = 0 \\Leftrightarrow x = 2$\n\nTableau :\n\n| $x$ | $-\\infty$ | | $2$ | | $+\\infty$ |\n|-----|-----------|---|-----|---|----------|\n| $f(x)$ | $+\\infty$ | ↘ | $-1$ | ↗ | $+\\infty$ |"
  ],
  "placeholder": "Pensez à utiliser le discriminant pour la question 2"
}
```

**Règles STRICTES** :
- ✅ **OBLIGATOIRE** : Le nombre d'éléments dans `solution` DOIT être égal au nombre d'éléments dans `content` (ou 1 si content est une string)
- ✅ Chaque solution doit être détaillée étape par étape
- ✅ Utiliser `listType: "numbered"` pour des questions multiples
- ❌ Ne jamais laisser une solution vide
- ❌ Ne pas mettre "Solution :" dans le texte de la solution (c'est automatique)
- ❌ **INTERDIT** : Ne JAMAIS mettre "**Exercice 1** :", "**Exercice 2** :", etc. dans le `statement` ou `preamble`
- ✅ Mettre directement le titre descriptif : "Étude d'une fonction", "Calcul de dérivées", etc.

---

#### 4. `property-box` - Propriétés Mathématiques

**Usage** : Pour énoncer des propriétés, règles ou théorèmes secondaires.

**Propriétés** :
```json
{
  "type": "property-box",
  "preamble": "string (OPTIONNEL) - Titre de la propriété",
  "content": "string OU array (OBLIGATOIRE) - Énoncé",
  "listType": "string (OPTIONNEL) - 'bullet' pour plusieurs propriétés"
}
```

**Exemple** :
```json
{
  "type": "property-box",
  "preamble": "**Règles de dérivation** :",
  "listType": "bullet",
  "content": [
    "$(u + v)' = u' + v'$",
    "$(ku)' = ku'$ où $k$ est une constante",
    "$(uv)' = u'v + uv'$",
    "$\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$ pour $v \\neq 0$"
  ]
}
```

**Règles** :
- ✅ Pour des propriétés importantes mais pas des théorèmes majeurs
- ✅ Utiliser array avec `listType: "bullet"` pour lister plusieurs propriétés
- ❌ Ne pas utiliser pour des définitions (utiliser definition-box)

---

#### 5. `theorem-box` - Théorèmes Importants

**Usage** : Pour les théorèmes fondamentaux et résultats majeurs.

**Propriétés** :
```json
{
  "type": "theorem-box",
  "preamble": "string (OPTIONNEL) - Nom du théorème",
  "content": "string (OBLIGATOIRE) - Énoncé du théorème"
}
```

**Exemple** :
```json
{
  "type": "theorem-box",
  "preamble": "**Théorème des valeurs intermédiaires** :",
  "content": "Soit $f$ une fonction continue sur un intervalle $[a ; b]$.\n\nPour tout réel $k$ compris entre $f(a)$ et $f(b)$, il existe au moins un réel $c \\in [a ; b]$ tel que :\n$$f(c) = k$$"
}
```

**Règles** :
- ✅ Réserver pour les théorèmes majeurs du programme
- ✅ Énoncer clairement les hypothèses et la conclusion
- ❌ Ne pas confondre avec property-box (moins important)

---

#### 6. `remark-box` - Remarques, Astuces et Alertes

**Usage** : Pour des remarques importantes, astuces ou mises en garde.

**Propriétés** :
```json
{
  "type": "remark-box",
  "preamble": "string (OPTIONNEL) - Titre de la remarque",
  "content": "string OU array (OBLIGATOIRE) - Contenu"
}
```

**Préfixes spéciaux dans le content** :
- `!>` : Alerte/Attention (affichage en orange)
- `?>` : Astuce/Conseil (affichage en cyan)
- Sans préfixe : Remarque normale

**⚠️ IMPORTANT** : Ne jamais imbriquer les astuces dans les remarques. Créer des `remark-box` séparés :
- Un `remark-box` avec `!>` pour les remarques/attention
- Un autre `remark-box` avec `?>` pour les astuces

Ne PAS faire :
```json
{
  "type": "remark-box",
  "content": "!> **Attention** : ...\n\n?> **Astuce** : ..."
}
```

```json
{
  "type": "remark-box",
  "content": "!> **Attention** : ..."
},
{
  "type": "remark-box",
  "content": "?> **Astuce** : ..."
}
```

**Exemples** :
```json
{
  "type": "p",
  "content": "!> **Attention** : Ne pas confondre $f'(a)$ (nombre dérivé en $a$) avec $f'(x)$ (fonction dérivée)."
}
```

```json
{
  "type": "p",
  "content": "?> **Astuce** : Pour vérifier qu'une fonction est paire, il suffit de vérifier que $f(-x) = f(x)$ pour quelques valeurs de $x$."
}
```

```json
{
  "type": "remark-box",
  "preamble": "**Remarque importante** :",
  "content": "Si $f$ est paire ou impaire, on peut réduire son étude à $\\mathbb{R}^+ \\cap D_f$ puis utiliser la symétrie."
}
```

**Règles** :
- ✅ Utiliser `!>` pour les erreurs fréquentes des élèves
- ✅ Utiliser `?>` pour les astuces de calcul
- ✅ Sans préfixe pour les remarques générales
- ❌ Ne pas mettre plusieurs types de préfixes dans le même remark-box

---

#### 7. `p` - Paragraphe Simple

**Usage** : Pour du texte explicatif sans cadre particulier.

**Propriétés** :
```json
{
  "type": "p",
  "content": "string OU array (OBLIGATOIRE) - Texte"
}
```

**Exemple avec string** :
```json
{
  "type": "p",
  "content": "Dans cette section, nous allons étudier les fonctions continues et leur propriétés fondamentales."
}
```

**Exemple avec array (liste)** :
```json
{
  "type": "p",
  "content": [
    ">> **Méthode pour étudier une fonction** :",
    "Déterminer l'ensemble de définition",
    "Étudier la parité si possible",
    "Calculer la dérivée",
    "Dresser le tableau de variations",
    ">> **Important** : Ne pas oublier les limites aux bornes"
  ]
}
```

**Préfixe spécial `>>`** :
- **Usage** : Désactive la puce pour une ligne spécifique
- **Utile pour** :
  - Les titres/sous-titres dans une liste
  - Les notes/remarques intercalées
  - Les séparateurs visuels
- **Position** : Au début de la ligne, avant tout texte

**Exemple d'utilisation dans remark-box** :
```json
{
  "type": "remark-box",
  "preamble": "**Points clés** :",
  "listType": "bullet",
  "content": [
    ">> **Définition** :",
    "Une fonction est continue si...",
    "Une fonction est dérivable si...",
    ">> **Attention** :",
    "Ne pas confondre continuité et dérivabilité"
  ]
}
```

**Règles** :
- ✅ Utiliser pour des explications courtes
- ✅ Peut contenir du LaTeX inline avec `$...$`
- ✅ Utiliser array pour des listes courtes sans numérotation particulière
- ❌ Ne pas utiliser pour des définitions formelles (utiliser definition-box)

---

#### 8. Types Alternatifs (Moins Utilisés)

**Certains fichiers utilisent des types simplifiés** :

```json
{
  "type": "definition",
  "title": "string",
  "content": "string"
}
```

```json
{
  "type": "example",
  "content": "string"
}
```

```json
{
  "type": "motivation",
  "content": "string"
}
```

```json
{
  "type": "method",
  "title": "string",
  "content": "string"
}
```

```json
{
  "type": "rule",
  "title": "string",
  "content": "string"
}
```

```json
{
  "type": "property",
  "content": "string"
}
```

**⚠️ RECOMMANDATION pour les IA** : Préférer les types avec `-box` (definition-box, example-box, etc.) qui sont plus riches et mieux supportés.

---

## Règles de Validation

### Validation du JSON

#### ✅ Structure Valide
```json
{
  "header": { "title": "...", "subtitle": "...", "classe": "..." },
  "sections": [
    {
      "title": "...",
      "subsections": [
        {
          "title": "...",
          "elements": [
            { "type": "...", "content": "..." }
          ]
        }
      ]
    }
  ]
}
```

#### ❌ Structure Invalide
```json
{
  "header": { "title": "..." },
  "sections": []
}
```
**Erreur** : sections vide, manque subtitle et classe

```json
{
  "header": { "title": "...", "subtitle": "...", "classe": "..." },
  "sections": [
    {
      "subsections": []
    }
  ]
}
```
**Erreur** : manque title dans section, subsections vide

---

### Validation du LaTeX

#### ✅ LaTeX Correct
```json
"content": "La dérivée de $x^2$ est $2x$"
"content": "$$f(x) = \\frac{a}{b}$$"
"content": "$\\mathbb{R}$, $\\mathbb{N}$, $\\mathbb{Z}$"
"content": "$\\dfrac{1}{2}$ ou $\\displaystyle\\frac{1}{2}$"
```

#### ❌ LaTeX Incorrect
```json
"content": "La dérivée de x^2 est 2x"
```
**Erreur** : manque les `$` pour le LaTeX inline

```json
"content": "$$f(x) = \frac{a}{b}$$"
```
**Erreur** : `\f` doit être `\\f` dans JSON (échappement)

```json
"content": "$\mathbb{R}$"
```
**Erreur** : `\m` doit être `\\m`

---

### Validation des Fill-in-Blank

#### ✅ Fill-in-Blank Correct
```json
"content": "La dérivée de $x^3$ est $___3x^2___$"
"content": "Si $a > b$, alors $-a ___<___ -b$"
"content": "Donc $f(2) = ___-1___$"
```

**Règles** :
- Format : `___réponse___` (3 underscores de chaque côté)
- Peut contenir du LaTeX : `___3x^2___`
- Peut être un nombre : `___-1___`, `___\\frac{1}{2}___`
- Peut être un symbole : `___<___`, `___\\leq___`

#### ❌ Fill-in-Blank Incorrect
```json
"content": "La réponse est _____"
```
**Erreur** : manque le contenu entre les underscores

```json
"content": "La réponse est __ 5 __"
```
**Erreur** : doit être 3 underscores, pas 2

```json
"content": "Donc $f(0) = 0$ ✓"
```
**Erreur** : Ne pas utiliser le symbole ✓ (coche)

```json
{
  "type": "definition-box",
  "content": "Une fonction est ___dérivable___ si..."
}
```
**Erreur** : Ne jamais utiliser fill-in-blank dans les définitions

#### 🎯 Où Utiliser Fill-in-Blank
- ✅ Dans example-box pour des calculs
- ✅ Dans practice-box pour guider l'élève
- ❌ JAMAIS dans definition-box
- ❌ JAMAIS dans theorem-box
- ❌ JAMAIS dans property-box

---

### Éviter les Accolades/Cases LaTeX

**⚠️ RÈGLE IMPORTANTE** : Éviter `\begin{cases}...\end{cases}` pour présenter des résultats.

#### ❌ À ÉVITER
```json
{
  "type": "theorem-box",
  "content": "$$f(x) = \\begin{cases} x^2 & \\text{si } x \\geq 0 \\\\ -x & \\text{si } x < 0 \\end{cases}$$"
}
```

#### ✅ PRÉFÉRER : Utiliser des listes à puces
```json
{
  "type": "theorem-box",
  "preamble": "**Définition par morceaux** :",
  "content": "La fonction $f$ est définie par :",
  "listType": "bullet",
  "subContent": [
    "$f(x) = x^2$ si $x \\geq 0$",
    "$f(x) = -x$ si $x < 0$"
  ]
}
```

**Exception** : Les `\begin{cases}` sont autorisés dans les énoncés d'exercices (`statement`) quand c'est la définition originale d'une fonction.

---

### Validation des Listes

**⚠️ RÈGLE OBLIGATOIRE** : Toute liste doit avoir un `listType` défini !
- Listes numérotées : `"listType": "numbered"`
- Listes à puces : `"listType": "bullet"`

#### ✅ Liste Correcte avec listType
```json
{
  "type": "example-box",
  "preamble": "**Exemples** :",
  "listType": "bullet",
  "content": [
    "Premier exemple",
    "Deuxième exemple",
    "Troisième exemple"
  ]
}
```

```json
{
  "type": "property-box",
  "preamble": "**Règles de dérivation** :",
  "listType": "numbered",
  "content": [
    "Règle 1 : $(u + v)' = u' + v'$",
    "Règle 2 : $(ku)' = ku'$",
    "Règle 3 : $(uv)' = u'v + uv'$"
  ]
}
```

#### ✅ Liste Sans Puces (avec >>)
```json
{
  "type": "p",
  "content": [
    ">> **Étapes** :",
    "Étape 1 avec puce",
    "Étape 2 avec puce",
    ">> **Note** : sans puce"
  ]
}
```

#### ❌ Liste Incorrecte
```json
{
  "type": "example-box",
  "listType": "bullet",
  "content": [
    "• Premier exemple",
    "- Deuxième exemple",
    "* Troisième exemple"
  ]
}
```
**Erreur** : Ne pas mettre de puces manuelles quand listType est défini

---

### Validation des Tableaux Markdown

**⚠️ IMPORTANT : TABLEAUX DE VARIATION INTERDITS**

**❌ NE PAS CRÉER de tableaux de variation dans le JSON** - Ils seront injectés manuellement comme images.

Si un exercice demande "Dresser le tableau de variations" :
- ✅ Garder la question dans le `content`
- ✅ Dans la solution, décrire verbalement : "$f$ est croissante sur $]-\infty, -1]$ puis décroissante sur $[-1, 1]$..."
- ❌ Ne PAS inclure le tableau markdown dans la solution

**Exception** : Les tableaux de signes pour factorisation peuvent être gardés.

#### ✅ Tableau de Signes (AUTORISÉ)
```json
"content": "Tableau de signes :\n\n| $x$ | $-\\infty$ | | $-1$ | | $3$ | | $+\\infty$ |\n|-----|-----------|---|------|---|-----|---|----------|\n| $x+1$ | | $-$ | $0$ | $+$ | $+$ | $+$ | |\n| $x-3$ | | $-$ | $-$ | $-$ | $0$ | $+$ | |"
```

#### ❌ Tableau de Variations (INTERDIT)
```json
"content": "Tableau de variations :\n\n| $x$ | $-\\infty$ | | $2$ | | $+\\infty$ |\n|-----|-----------|---|-----|---|----------|\n| $f(x)$ | $+\\infty$ | ↘ | $-1$ | ↗ | $+\\infty$ |"
```
**Erreur** : Les tableaux de variations seront injectés manuellement

---

## Principes Pédagogiques

### Progression Pédagogique

**Ordre recommandé dans une subsection** :
1. **Paragraphe d'introduction** (`p`) : Contexte et motivation
2. **Définition** (`definition-box`) : Concept formel
3. **Propriétés** (`property-box` ou `theorem-box`) : Résultats théoriques
4. **Exemples** (`example-box`) : Applications concrètes
5. **Remarques** (`remark-box`) : Astuces et pièges
6. **Exercices** (`practice-box`) : Pratique avec solutions

**Exemple de structure complète** :
```json
{
  "title": "La Dérivée",
  "subsections": [
    {
      "title": "Définition du Nombre Dérivé",
      "elements": [
        {
          "type": "p",
          "content": "Le nombre dérivé mesure la vitesse de variation instantanée d'une fonction."
        },
        {
          "type": "definition-box",
          "preamble": "**Nombre dérivé** :",
          "content": "..."
        },
        {
          "type": "property-box",
          "preamble": "**Interprétation géométrique** :",
          "content": "..."
        },
        {
          "type": "example-box",
          "preamble": "**Calcul par définition** :",
          "content": "..."
        },
        {
          "type": "p",
          "content": "?> **Astuce** : ..."
        },
        {
          "type": "practice-box",
          "statement": "...",
          "content": [...],
          "solution": [...]
        }
      ]
    }
  ]
}
```

---

### Langage et Style

#### ✅ Style Recommandé
- Phrases courtes et directes
- Vocabulaire précis mais accessible
- Progression du simple au complexe
- Exemples avec nombres simples (2, 3, 5) avant les cas généraux

**Exemples** :
- ✅ "On considère la fonction $f$ définie par..."
- ✅ "Calculons la dérivée de..."
- ✅ "Pour tout $x \\in \\mathbb{R}$..."

#### ❌ Style à Éviter
- ❌ Phrases longues et complexes
- ❌ Double négations
- ❌ Jargon non expliqué
- ❌ "Soit $f$ une fonction..." (trop formel)

---

### Contexte Marocain

**Adapter le vocabulaire** :
- ✅ Ensemble de définition (pas "domaine")
- ✅ Sens de variations (pas "monotonie" seul)
- ✅ Tableau de variations (pas "tableau de variation")
- ✅ Classes : "1ère Bac Sciences Mathématiques", "2ème Bac Sciences Expérimentales"

**Notation marocaine** :
- ✅ $]a ; b[$ pour intervalle ouvert (pas $(a, b)$)
- ✅ $D_f$ pour ensemble de définition
- ✅ $\\mathbb{R}^*$ pour réels non nuls
- ✅ $\\mathbb{N}^*$ pour entiers naturels non nuls

---

## Exemples Complets

### Exemple 1 : Leçon Minimale Valide

```json
{
  "header": {
    "title": "Les Équations du Premier Degré",
    "subtitle": "Résolution et applications",
    "classe": "1ère Bac Sciences Mathématiques"
  },
  "sections": [
    {
      "title": "Résolution d'Équations",
      "subsections": [
        {
          "title": "Équations de la Forme ax + b = 0",
          "elements": [
            {
              "type": "definition-box",
              "preamble": "**Équation du premier degré** :",
              "content": "Une équation de la forme $ax + b = 0$ avec $a \\neq 0$ admet une unique solution :\n\n$$x = \\dfrac{-b}{a}$$"
            },
            {
              "type": "example-box",
              "preamble": "**Exemple** :",
              "content": "Résoudre $3x + 6 = 0$\n\n$$x = \\dfrac{-6}{3} = ___-2___$$"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Exemple 2 : Leçon Complète avec Tous les Types

```json
{
  "header": {
    "title": "La Dérivation",
    "subtitle": "Nombre dérivé et fonction dérivée",
    "classe": "1ère Bac Sciences Mathématiques",
    "chapter": "Chapitre 10",
    "academicYear": "2025-2026"
  },
  "sections": [
    {
      "title": "Nombre Dérivé",
      "subsections": [
        {
          "title": "Définition",
          "elements": [
            {
              "type": "p",
              "content": "Le nombre dérivé en un point mesure la vitesse de variation instantanée de la fonction en ce point."
            },
            {
              "type": "definition-box",
              "preamble": "**Nombre dérivé** :",
              "content": "Soit $f$ une fonction définie sur un intervalle $I$ et $a \\in I$.\n\nOn dit que $f$ est **dérivable en $a$** si la limite suivante existe et est finie :\n\n$$f'(a) = \\lim_{h \\to 0} \\dfrac{f(a + h) - f(a)}{h}$$"
            },
            {
              "type": "property-box",
              "preamble": "**Interprétation géométrique** :",
              "content": "Le nombre dérivé $f'(a)$ représente le coefficient directeur de la tangente à la courbe de $f$ au point d'abscisse $a$."
            },
            {
              "type": "example-box",
              "preamble": "**Calcul par définition** :",
              "content": "Calculer la dérivée de $f(x) = x^2$ en $a = 2$.\n\n$$f'(2) = \\lim_{h \\to 0} \\dfrac{(2 + h)^2 - 4}{h}$$\n\n$$= \\lim_{h \\to 0} \\dfrac{4 + 4h + h^2 - 4}{h}$$\n\n$$= \\lim_{h \\to 0} \\dfrac{4h + h^2}{h}$$\n\n$$= \\lim_{h \\to 0} (4 + h) = ___4___$$"
            },
            {
              "type": "p",
              "content": "?> **Astuce** : Factoriser par $h$ au numérateur permet de simplifier avant de calculer la limite."
            },
            {
              "type": "p",
              "content": "!> **Attention** : Si la limite n'existe pas ou est infinie, la fonction n'est pas dérivable en ce point."
            },
            {
              "type": "practice-box",
              "statement": "**Exercice** : Calculer par définition les dérivées suivantes",
              "listType": "numbered",
              "content": [
                "Dérivée de $f(x) = 3x$ en $a = 1$",
                "Dérivée de $g(x) = x^2 + 2x$ en $a = 0$",
                "Dérivée de $h(x) = \\dfrac{1}{x}$ en $a = 2$"
              ],
              "solution": [
                "$f'(1) = \\lim_{h \\to 0} \\dfrac{3(1 + h) - 3}{h} = \\lim_{h \\to 0} \\dfrac{3h}{h} = 3$",
                "$g'(0) = \\lim_{h \\to 0} \\dfrac{h^2 + 2h}{h} = \\lim_{h \\to 0} (h + 2) = 2$",
                "$h'(2) = \\lim_{h \\to 0} \\dfrac{\\frac{1}{2 + h} - \\frac{1}{2}}{h} = \\lim_{h \\to 0} \\dfrac{2 - (2 + h)}{2h(2 + h)} = \\lim_{h \\to 0} \\dfrac{-h}{2h(2 + h)} = -\\dfrac{1}{4}$"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Fonction Dérivée",
      "subsections": [
        {
          "title": "Dérivées des Fonctions Usuelles",
          "elements": [
            {
              "type": "theorem-box",
              "preamble": "**Dérivées usuelles** :",
              "content": "Soit $n \\in \\mathbb{N}^*$. On a les dérivées suivantes :\n\n| Fonction | Dérivée |\n|----------|----------|\n| $f(x) = c$ | $f'(x) = 0$ |\n| $f(x) = x$ | $f'(x) = 1$ |\n| $f(x) = x^n$ | $f'(x) = nx^{n-1}$ |\n| $f(x) = \\dfrac{1}{x}$ | $f'(x) = -\\dfrac{1}{x^2}$ |"
            },
            {
              "type": "property-box",
              "preamble": "**Opérations sur les dérivées** :",
              "listType": "bullet",
              "content": [
                "$(u + v)' = u' + v'$",
                "$(ku)' = ku'$ où $k$ est une constante",
                "$(uv)' = u'v + uv'$",
                "$\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$ pour $v \\neq 0$"
              ]
            },
            {
              "type": "example-box",
              "preamble": "**Applications** :",
              "listType": "numbered",
              "content": [
                "$f(x) = x^5$ → $f'(x) = ___5x^4___$",
                "$f(x) = 3x^2 + 2x - 1$ → $f'(x) = ___6x + 2___$",
                "$f(x) = (x + 1)(x - 2)$ → $f'(x) = (x - 2) + (x + 1) = ___2x - 1___$"
              ]
            },
            {
              "type": "practice-box",
              "statement": "**Exercice** : Calculer les dérivées des fonctions suivantes",
              "listType": "numbered",
              "content": [
                "$f(x) = 4x^3 - 3x^2 + 2x - 5$",
                "$g(x) = (2x + 1)(x - 3)$",
                "$h(x) = \\dfrac{x^2 + 1}{x}$"
              ],
              "solution": [
                "$f'(x) = 4 \\times 3x^2 - 3 \\times 2x + 2 - 0 = 12x^2 - 6x + 2$",
                "Méthode 1 : $(uv)' = u'v + uv'$\n\n$g'(x) = 2(x - 3) + (2x + 1) = 2x - 6 + 2x + 1 = 4x - 5$\n\nMéthode 2 : Développer puis dériver\n\n$g(x) = 2x^2 - 5x - 3$\n\n$g'(x) = 4x - 5$",
                "$h(x) = \\dfrac{x^2 + 1}{x} = x + \\dfrac{1}{x}$\n\n$h'(x) = 1 - \\dfrac{1}{x^2}$\n\nOu avec la formule du quotient :\n\n$h'(x) = \\dfrac{2x \\times x - (x^2 + 1) \\times 1}{x^2} = \\dfrac{2x^2 - x^2 - 1}{x^2} = \\dfrac{x^2 - 1}{x^2}$"
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

## Checklist de Validation

### ✅ Avant de Générer le JSON

1. **Structure**
   - [ ] Header avec `title`, `subtitle`, `classe`
   - [ ] Au moins 1 section avec `title`
   - [ ] Au moins 1 subsection par section avec `title`
   - [ ] Au moins 1 élément par subsection

2. **Types d'Éléments**
   - [ ] Tous les éléments ont un `type` valide
   - [ ] Tous les éléments ont un `content`
   - [ ] Les `practice-box` ont un `solution`
   - [ ] Nombre de solutions = nombre de questions
   - [ ] **INTERDIT** : Pas de "**Exercice X** :" dans `statement` ou `preamble`
   - [ ] Titres descriptifs directs : "Étude de fonction", "Calcul de limites", etc.
   - [ ] Éviter `\begin{cases}` : utiliser listes à puces avec `subContent`

3. **LaTeX**
   - [ ] Toutes les formules sont entre `$...$` ou `$$...$$`
   - [ ] Tous les backslash sont doublés : `\\`
   - [ ] Ensembles de nombres : `\\mathbb{R}`, `\\mathbb{N}`, etc.
   - [ ] Fractions : `\\frac{a}{b}` ou `\\dfrac{a}{b}`

4. **Fill-in-Blank**
   - [ ] Format correct : `___réponse___` (3 underscores)
   - [ ] Utilisé seulement dans examples et exercises
   - [ ] Jamais dans definitions, theorems, properties

5. **Listes**
   - [ ] `listType` **OBLIGATOIRE** si `content` est un array
   - [ ] Utiliser `"numbered"` pour listes numérotées
   - [ ] Utiliser `"bullet"` pour listes à puces
   - [ ] Pas de puces manuelles (•, -, *) si `listType` est défini
   - [ ] Utiliser `>>` au début de ligne pour désactiver la puce (titres, notes)
   - [ ] Pas d'imbrication astuces/remarques : créer des remark-box séparés

6. **Tableaux**
   - [ ] **INTERDIT** : Pas de tableaux de variation (seront injectés comme images)
   - [ ] Tableaux de signes autorisés uniquement
   - [ ] 2 lignes vides avant : `\n\n`
   - [ ] Ligne de séparation présente
   - [ ] LaTeX dans les cellules

7. **Pédagogie**
   - [ ] Progression logique (définition → exemple → exercice)
   - [ ] Langage clair et accessible
   - [ ] Exemples avant généralisation
   - [ ] Solutions détaillées étape par étape

---

### ✅ Après Génération du JSON

1. **Validation JSON**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('fichier.json', 'utf8'))"
   ```

2. **Vérifications Manuelles**
   - [ ] Toutes les sections sont complètes
   - [ ] Pas de content vide
   - [ ] Pas de solution manquante
   - [ ] LaTeX rendu correctement (si prévisualisation)

3. **Test de Cohérence**
   - [ ] Les exercices correspondent au niveau de la classe
   - [ ] Les exemples illustrent bien les définitions
   - [ ] Les solutions sont correctes mathématiquement
   - [ ] Le vocabulaire est cohérent (contexte marocain)

---

## Erreurs Fréquentes à Éviter

### ❌ Erreur 1 : Structure Incomplète
```json
{
  "header": {
    "title": "Les Fonctions"
  },
  "sections": []
}
```
**Problème** : Manque `subtitle` et `classe` dans header, sections vide

**✅ Correction** :
```json
{
  "header": {
    "title": "Les Fonctions",
    "subtitle": "Étude et propriétés",
    "classe": "1ère Bac Sciences Mathématiques"
  },
  "sections": [
    {
      "title": "...",
      "subsections": [...]
    }
  ]
}
```

---

### ❌ Erreur 2 : Practice-box Sans Solutions
```json
{
  "type": "practice-box",
  "statement": "Résoudre les équations suivantes",
  "content": ["$x + 1 = 0$", "$2x - 3 = 0$"]
}
```
**Problème** : Manque le champ `solution`

**✅ Correction** :
```json
{
  "type": "practice-box",
  "statement": "Résoudre les équations suivantes",
  "listType": "numbered",
  "content": ["$x + 1 = 0$", "$2x - 3 = 0$"],
  "solution": [
    "$x = -1$",
    "$x = \\dfrac{3}{2}$"
  ]
}
```

---

### ❌ Erreur 3 : LaTeX Non Échappé
```json
{
  "content": "La fonction $\mathbb{R} \to \mathbb{R}$"
}
```
**Problème** : `\m` et `\t` non échappés

**✅ Correction** :
```json
{
  "content": "La fonction $\\mathbb{R} \\to \\mathbb{R}$"
}
```

---

### ❌ Erreur 4 : Fill-in-Blank dans Définition
```json
{
  "type": "definition-box",
  "content": "Une fonction est ___dérivable___ si..."
}
```
**Problème** : Fill-in-blank interdit dans les définitions

**✅ Correction** :
```json
{
  "type": "definition-box",
  "content": "Une fonction est **dérivable** si..."
}
```

---

### ❌ Erreur 5 : Incohérence Nombre Questions/Solutions
```json
{
  "type": "practice-box",
  "statement": "Exercice",
  "content": ["Question 1", "Question 2", "Question 3"],
  "solution": ["Réponse 1", "Réponse 2"]
}
```
**Problème** : 3 questions mais seulement 2 solutions

**✅ Correction** :
```json
{
  "type": "practice-box",
  "statement": "Exercice",
  "listType": "numbered",
  "content": ["Question 1", "Question 2", "Question 3"],
  "solution": ["Réponse 1", "Réponse 2", "Réponse 3"]
}
```

---

### ❌ Erreur 6 : Puces Manuelles avec listType
```json
{
  "type": "example-box",
  "listType": "bullet",
  "content": [
    "• Premier exemple",
    "• Deuxième exemple"
  ]
}
```
**Problème** : Les puces sont automatiques avec `listType`

**✅ Correction** :
```json
{
  "type": "example-box",
  "listType": "bullet",
  "content": [
    "Premier exemple",
    "Deuxième exemple"
  ]
}
```

---

### ❌ Erreur 7 : Mauvais Format de Tableau
```json
{
  "content": "| x | -∞ | 2 |\n| f(x) | +∞ | -1 |"
}
```
**Problème** : Manque ligne de séparation et saut de lignes

**✅ Correction** :
```json
{
  "content": "Tableau de variations :\n\n| $x$ | $-\\infty$ | | $2$ | | $+\\infty$ |\n|-----|-----------|---|-----|---|----------|\n| $f(x)$ | $+\\infty$ | ↘ | $-1$ | ↗ | $+\\infty$ |"
}
```

---

## Guide Spécifique pour IA

### Instructions pour Génération Automatique

#### Workflow Recommandé

```
1. ANALYSER le contenu source (PDF, texte)
  ↓
2. STRUCTURER en sections logiques
  ↓
3. IDENTIFIER les types d'éléments (définition, exemple, etc.)
  ↓
4. GÉNÉRER le JSON section par section
  ↓
5. VALIDER le JSON (syntaxe + structure)
  ↓
6. VÉRIFIER la cohérence pédagogique
```

#### Priorités de génération

**PRIORITÉ 1 – STRUCTURE**
- Header complet obligatoire
- Au moins 3 sections minimum
- Chaque section avec 1-3 subsections
- Chaque subsection avec 3-10 éléments

**PRIORITÉ 2 – CONTENU**
- Toujours inclure des exemples après les définitions
- Toujours inclure au moins 2 exercices avec solutions
- Utiliser fill-in-blank dans 30% des exemples

**PRIORITÉ 3 – QUALITÉ**
- Solutions détaillées étape par étape
- LaTeX correct partout
- Progression pédagogique logique

#### 3. Template de Génération

```json
{
  "header": {
    "title": "[EXTRAIRE DU SOURCE]",
    "subtitle": "[GÉNÉRER DESCRIPTION COURTE]",
    "classe": "[IDENTIFIER NIVEAU]",
    "chapter": "[OPTIONNEL]",
    "academicYear": "2025-2026"
  },
  "sections": [
    {
      "title": "[SECTION 1: CONCEPTS DE BASE]",
      "subsections": [
        {
          "title": "[SOUS-SECTION 1.1]",
          "elements": [
            {"type": "p", "content": "[INTRO]"},
            {"type": "definition-box", "preamble": "...", "content": "..."},
            {"type": "example-box", "preamble": "...", "content": "..."},
            {"type": "remark-box", "content": "?> ..."},
            {"type": "practice-box", "statement": "...", "content": [...], "solution": [...]}
          ]
        }
      ]
    },
    {
      "title": "[SECTION 2: APPLICATIONS]",
      "subsections": [
        {
          "title": "[SOUS-SECTION 2.1]",
          "elements": [
            {"type": "property-box", "preamble": "...", "content": "..."},
            {"type": "example-box", "preamble": "...", "content": "..."},
            {"type": "practice-box", "statement": "...", "content": [...], "solution": [...]}
          ]
        }
      ]
    }
  ]
}
```

#### 4. Règles Automatiques

**Pour chaque DÉFINITION** :
- Type : `definition-box`
- Inclure un `preamble` avec le nom en gras
- Content avec formules LaTeX
- Suivre d'un `example-box`

**Pour chaque EXEMPLE** :
- Type : `example-box`
- Inclure des calculs détaillés
- Ajouter 1-2 fill-in-blank par exemple
- Si plusieurs exemples : utiliser array + listType

**Pour chaque EXERCICE** :
- Type : `practice-box`
- Statement clair
- Content en array si plusieurs questions
- Solution en array avec autant d'éléments que de questions
- Solutions détaillées avec étapes

**Pour chaque PROPRIÉTÉ** :
- Type : `property-box` ou `theorem-box`
- Distinguer : theorem-box pour résultats majeurs
- property-box pour règles et formules

---

## Ressources LaTeX

### Symboles Courants

```
Ensembles : \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{Q}, \\mathbb{C}
Flèches : \\to, \\mapsto, \\Rightarrow, \\Leftrightarrow, \\rightarrow
Comparaison : \\leq, \\geq, \\neq, \\equiv
Opérations : \\times, \\div, \\pm, \\mp
Logique : \\forall, \\exists, \\in, \\notin, \\subset, \\cap, \\cup
Limites : \\lim, \\lim_{x \\to a}, \\lim_{h \\to 0}
Fractions : \\frac{a}{b}, \\dfrac{a}{b}
Racines : \\sqrt{x}, \\sqrt[n]{x}
Sommes : \\sum_{i=1}^{n}, \\prod_{i=1}^{n}
Intégrales : \\int_{a}^{b}
```

### Variations
```
Croissance : ↗ (caractère Unicode direct)
Décroissance : ↘ (caractère Unicode direct)
```

---

## Version et Mise à Jour

**Version** : 3.0 - IA-Optimisée
**Dernière mise à jour** : Novembre 2025
**Public cible** : Outils d'Intelligence Artificielle
**Compatibilité** : Math-pedago Platform

---

## Support

Pour toute question ou suggestion d'amélioration :
- Créer une issue sur le repository
- Proposer des exemples de cas non couverts
- Signaler des ambiguïtés dans les instructions

---

**FIN DU GUIDE**

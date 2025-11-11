# Guide de Rédaction des Leçons JSON

## 📋 Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [Structure générale](#structure-générale)
- [Types d'éléments](#types-déléments)
- [Principes pédagogiques](#principes-pédagogiques)
- [Exemples pratiques](#exemples-pratiques)

---

## Vue d'ensemble

Ce guide présente la structure JSON standardisée pour créer des leçons mathématiques interactives destinées aux élèves de 1ère Bac Sciences Mathématiques au Maroc.

### Objectifs
- ✅ Structure hiérarchique claire (header → sections → subsections → elements)
- ✅ Boxes typées pour chaque type de contenu
- ✅ Exercices avec solutions détaillées
- ✅ Langage adapté au contexte marocain

---

## Structure Générale

### Architecture du fichier JSON

```json
{
  "header": {
    "title": "Titre du chapitre",
    "subtitle": "Sous-titre explicatif",
    "chapter": "Chapitre X",
    "classe": "1ère Bac Sciences Mathématiques",
    "academicYear": "2025-2026"
  },
  "sections": [
    {
      "title": "Titre de la section principale",
      "subsections": [
        {
          "title": "Titre de la sous-section",
          "elements": [
            // Éléments de contenu (boxes, paragraphes, exercices)
          ]
        }
      ]
    }
  ]
}
```

### Hiérarchie
1. **Header** : Métadonnées du cours
2. **Sections** : Grandes parties du cours
3. **Subsections** : Sous-parties thématiques
4. **Elements** : Contenu pédagogique (définitions, exemples, exercices)

---

## Types d'Éléments

### Boxes Pédagogiques

Chaque élément a un `type` qui détermine son apparence et sa fonction pédagogique.

#### Definition Box

Pour les définitions mathématiques formelles.

```json
{
  "type": "definition-box",
  "preamble": "**Titre de la définition** :",
  "content": "Contenu de la définition avec formules $LaTeX$"
}
```

**Exemple** :
```json
{
  "type": "definition-box",
  "preamble": "**Fonction numérique** :",
  "content": "Toute relation $f$ qui associe à chaque élément $x$ de $\\mathbb{R}$ **au plus un** élément $y$ de $\\mathbb{R}$.\n\nOn note : $f : \\mathbb{R} \\to \\mathbb{R}$, $x \\mapsto f(x) = y$"
}
```

#### Example Box

Pour les exemples d'application et démonstrations.

```json
{
  "type": "example-box",
  "preamble": "**Titre de l'exemple** :",
  "content": "Développement de l'exemple avec calculs",
  "listType": "bullet"  // Optionnel
}
```

**Avec liste** :
```json
{
  "type": "example-box",
  "preamble": "Exemples d'ensembles de définition :",
  "listType": "bullet",
  "content": [
    "**Polynômes** : $D_f = \\mathbb{R}$",
    "**Racine carrée** : $D_f = [0 ; +\\infty[$",
    "**Fonction rationnelle** : Exclure les valeurs annulant le dénominateur"
  ]
}
```

#### Practice Box

Pour les exercices avec solutions détaillées.

```json
{
  "type": "practice-box",
  "statement": "Énoncé de l'exercice",
  "listType": "numbered",  // Optionnel
  "content": [
    "Question 1",
    "Question 2"
  ],
  "solution": [
    "Solution détaillée de la question 1",
    "Solution détaillée de la question 2"
  ]
}
```

**Exemple complet** :
```json
{
  "type": "practice-box",
  "statement": "Déterminer l'ensemble de définition des fonctions suivantes :",
  "listType": "numbered",
  "content": [
    "$f(x) = \\sqrt{3-x}$",
    "$f(x) = \\dfrac{1}{x^2-4}$"
  ],
  "solution": [
    "$3-x \\geq 0 \\Leftrightarrow x \\leq 3$ donc $D_f = ]-\\infty ; 3]$",
    "$x^2-4 \\neq 0 \\Leftrightarrow x \\neq \\pm 2$ donc $D_f = \\mathbb{R} \\setminus \\{-2;2\\}$"
  ]
}
```

#### Property Box

Pour les propriétés et théorèmes.

```json
{
  "type": "property-box",
  "preamble": "**Nom de la propriété** :",
  "content": "Énoncé de la propriété"
}
```

#### Theorem Box

Pour les théorèmes importants.

```json
{
  "type": "theorem-box",
  "preamble": "**Nom du théorème** :",
  "content": "Énoncé du théorème"
}
```

#### Remark Box

Pour les remarques, astuces et alertes.

```json
{
  "type": "remark-box",
  "preamble": "**Remarque** :",  // Optionnel
  "content": "!> Alerte importante\n\n?> Astuce utile\n\nRemarque normale"
}
```

**Préfixes spéciaux** :
- `!>` : Alerte/Attention (box orange)
- `?>` : Astuce/Conseil (box cyan)

### Paragraphes simples

Pour du texte sans cadre.

```json
{
  "type": "p",
  "content": "Texte simple avec **formatage** et formules $x^2$"
}
```

**Avec liste** :
```json
{
  "type": "p",
  "content": [
    ">> **Titre sans puce**",
    "Premier point avec puce",
    "Deuxième point avec puce",
    ">> **Autre titre sans puce**"
  ]
}
```

Le préfixe `>>` désactive la puce pour cette ligne.

---

## Principes Pédagogiques

### Rédaction Claire

#### ✅ À FAIRE
- Langage simple : "On considère la fonction $f$" plutôt que "Soit $f$"
- Phrases courtes et directes
- Exemples avec nombres simples
- Progression du simple au complexe

#### ❌ À ÉVITER
- Double négations
- Phrases longues
- Jargon non expliqué
- Numérotation manuelle des sections/paragraphes

### Organisation du Contenu

**Structure recommandée pour une section** :
1. **Définition** (`definition-box`) : Concept formel
2. **Propriétés** (`property-box` ou `theorem-box`) : Énoncés théoriques
3. **Exemples** (`example-box`) : Applications concrètes
4. **Remarques** (`remark-box`) : Astuces et alertes
5. **Exercices** (`practice-box`) : Pratique avec solutions

### Utilisation des Boxes

**Séparation sémantique** - Ne pas mélanger :
- ❌ Définition dans une `remark-box`
- ❌ Propriété dans une `example-box`
- ❌ Exemple dans une `definition-box`

**Bon usage** :
```json
{
  "type": "definition-box",
  "preamble": "**Fonction paire** :",
  "content": "Une fonction $f$ est paire si $f(-x) = f(x)$"
}
```

Puis séparément :
```json
{
  "type": "remark-box",
  "content": "?> Astuce : La courbe d'une fonction paire est symétrique par rapport à l'axe des ordonnées"
}
```

### Textes à Trous

#### ✅ BON USAGE
Dans les exemples et exercices uniquement :
```json
{
  "type": "example-box",
  "content": "Si $f(x) = 3x^2$, alors $f'(x) = ___6x___"
}
```

#### ❌ MAUVAIS USAGE
Jamais dans les définitions :
```json
{
  "type": "definition-box",
  "content": "Une fonction est ___dérivable___ si..."  // ✗ NON
}
```

### Formules LaTeX

**Inline** (`$...$`) : formules courtes
```json
"content": "La dérivée de $x^2$ est $2x$"
```

**Display** (`$$...$$`) : formules importantes
```json
"content": "$$f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$"
```

**Display inline** : pour fractions en taille normale
```json
"content": "Le résultat est $\\displaystyle \\frac{1}{2}$ ou $\\dfrac{1}{2}$"
```

---

## Exemples Pratiques

### Exemple : Section complète

```json
{
  "title": "Ensemble de définition",
  "subsections": [
    {
      "title": "Définition",
      "elements": [
        {
          "type": "definition-box",
          "preamble": "**Ensemble de définition** :",
          "content": "L'ensemble de définition d'une fonction $f$ est l'ensemble des éléments ayant une image par $f$. On le note $D_f$."
        },
        {
          "type": "remark-box",
          "content": "!> **Remarque** : $D_f$ est toujours un intervalle ou une réunion d'intervalles."
        },
        {
          "type": "example-box",
          "preamble": "**Exemples** :",
          "listType": "bullet",
          "content": [
            "Polynômes : $D_f = \\mathbb{R}$",
            "Racine carrée : $D_f = [0 ; +\\infty[$",
            "Fonction rationnelle : exclure les zéros du dénominateur"
          ]
        },
        {
          "type": "practice-box",
          "statement": "Déterminer $D_f$ pour :",
          "listType": "numbered",
          "content": [
            "$f(x) = \\sqrt{3-x}$",
            "$f(x) = \\dfrac{1}{x^2-4}$"
          ],
          "solution": [
            "$3-x \\geq 0 \\Leftrightarrow x \\leq 3$ donc $D_f = ]-\\infty ; 3]$",
            "$x^2-4 \\neq 0 \\Leftrightarrow x \\neq \\pm 2$ donc $D_f = \\mathbb{R}\\setminus\\{-2;2\\}$"
          ]
        }
      ]
    }
  ]
}
```

### Exemple : Démonstration

```json
{
  "type": "example-box",
  "preamble": "**Démonstration** : $f(x) = 3x^2 + 1$ est paire",
  "content": "**Preuve** :\n\n1. $D_f = \\mathbb{R}$ donc pour tout $x$, $-x \\in \\mathbb{R}$ ✓\n\n2. Calculons $f(-x)$ :\n   $$f(-x) = 3(-x)^2 + 1 = 3x^2 + 1 = f(x)$$\n\n3. Donc $f(-x) = f(x)$, la fonction est **paire** ✓"
}
```

### Exemple : Exercice complet

```json
{
  "type": "practice-box",
  "statement": "Soit $f(x) = x^2 - 4x + 1$ définie sur $\\mathbb{R}$",
  "listType": "numbered",
  "content": [
    "Calculer le taux de variation",
    "Étudier les variations sur $[2; +\\infty[$",
    "Dresser le tableau de variations"
  ],
  "solution": [
    "Soient $x, y \\in \\mathbb{R}$ :\n$$T = \\frac{f(x)-f(y)}{x-y} = x+y-4$$",
    "Sur $[2; +\\infty[$ : $x \\geq 2$ et $y \\geq 2$\n\nDonc $x+y \\geq 4$ et $T \\geq 0$\n\n$f$ est croissante ✓",
    "$f(2) = 4-8+1 = -3$\n\n| $x$ | $-\\infty$ | | $2$ | | $+\\infty$ |\n|---|---|---|---|---|---|\n| $f(x)$ | | ↘ | $-3$ | ↗ | |"
  ]
}
```

---

## Checklist de Validation

### Structure
- [ ] Header complet (titre, sous-titre, classe, année)
- [ ] Sections → Subsections → Elements
- [ ] Tous les éléments ont un `type` valide

### Contenu
- [ ] Pas de numérotation manuelle
- [ ] Formules LaTeX correctes
- [ ] Textes à trous dans exemples/exercices uniquement
- [ ] Alertes `!>` et astuces `?>` bien utilisées

### Boxes
- [ ] Type approprié pour chaque élément
- [ ] `preamble` pour introduire le contenu
- [ ] Séparation claire : définition ≠ exemple ≠ remarque

### Exercices
- [ ] Tous ont un champ `solution`
- [ ] Type correct (mcq, input, fill)
- [ ] Options correctes pour les QCM
- [ ] Solutions détaillées étape par étape

### Pédagogie
- [ ] Langage simple et direct
- [ ] Progression logique
- [ ] Exemples avant généralisation
- [ ] Contexte clair pour l'élève

---

## Ressources

### Formules LaTeX
- Inline : `$expression$`
- Display : `$$expression$$`
- Fractions : `\frac{a}{b}` ou `\dfrac{a}{b}`
- Ensembles : `\mathbb{R}`, `\mathbb{N}`, `\mathbb{Z}`
- Flèches : `\to`, `\mapsto`, `\Rightarrow`, `\Leftrightarrow`

### Types de Boxes Disponibles
- `definition-box` : Définitions
- `example-box` : Exemples
- `practice-box` : Exercices
- `property-box` : Propriétés
- `theorem-box` : Théorèmes
- `remark-box` : Remarques/Astuces

### Préfixes Spéciaux
- `>>` : Désactive les puces dans les listes
- `!>` : Alerte (box orange)
- `?>` : Astuce (box cyan)
- `___texte___` : Texte à trou

---

**Version** : 2.0  
**Dernière mise à jour** : Novembre 2025  
**Public cible** : Créateurs de contenu pédagogique

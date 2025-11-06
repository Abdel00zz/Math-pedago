# Guide de Structure des Leçons (Lessons)

Ce document décrit la structure JSON pour créer des leçons interactives avec formatage avancé.

## Structure Globale d'une Leçon

```json
{
  "class": "1bsm",
  "chapter": "La Dérivation",
  "lesson": {
    "title": "Introduction à la dérivation",
    "sections": [
      {
        "title": "Définition et interprétation",
        "subsections": [
          {
            "title": "Nombre dérivé",
            "intro": "Texte introductif optionnel sans cadre",
            "elements": []
          }
        ]
      }
    ]
  }
}
```

## Types de Contenu

### 1. Texte Introductif (intro)

Texte qui apparaît après le titre de section, **sans cadre**.

```json
{
  "title": "Les nombres dérivés",
  "intro": "La notion de dérivée est fondamentale en analyse. Elle permet de mesurer la variation instantanée d'une fonction.",
  "elements": [...]
}
```

**Rendu** : Texte simple, sans background, directement après le titre.

### 2. Paragraphes Standards

```json
{
  "type": "p",
  "content": "Texte avec **gras** et formules $f'(x)$"
}
```

### 3. Listes avec Puces Flexibles

#### Syntaxe Standard (avec puces)
```json
{
  "type": "p",
  "content": [
    "Premier point avec puce",
    "Deuxième point avec puce",
    "Troisième point avec puce"
  ]
}
```

#### Syntaxe Sans Puces (NoBullet)
Pour désactiver les puces sur certaines lignes, utilisez le préfixe `>>` :

```json
{
  "type": "p",
  "content": [
    ">> Titre de section (sans puce)",
    "Premier point avec puce",
    "Deuxième point avec puce",
    ">> Note finale (sans puce)"
  ]
}
```

**Rendu** :
- Les lignes avec `>>` sont affichées sans puce
- Les autres lignes gardent leurs puces
- Idéal pour titres, notes, ou séparateurs

#### Exemple Pratique
```json
{
  "type": "text",
  "content": [
    ">> **Propriétés importantes**",
    "La dérivée mesure le taux de variation",
    "Une fonction dérivable est continue",
    ">> **Attention** : La réciproque est fausse !"
  ]
}
```

### 4. Boxes avec Alertes et Astuces

#### Box d'Attention (!>)
```json
{
  "type": "text",
  "content": "!> Attention : Une fonction continue n'est pas nécessairement dérivable."
}
```

**Rendu** : Box orange avec icône d'alerte.

#### Box d'Astuce (?>)
```json
{
  "type": "text",
  "content": "?> Astuce : Pour calculer une dérivée complexe, décomposez-la en fonctions simples."
}
```

**Rendu** : Box cyan avec icône d'ampoule.

### 5. Boxes avec Colonnes (NOUVEAU)

Pour afficher du contenu en deux colonnes dans une box :

```json
{
  "type": "box",
  "boxType": "result",
  "columns": true,
  "content": [
    {
      "title": "Fonction",
      "items": [
        "$f(x) = x^2$",
        "$g(x) = \\sin(x)$",
        "$h(x) = e^x$"
      ]
    },
    {
      "title": "Dérivée",
      "items": [
        "$f'(x) = 2x$",
        "$g'(x) = \\cos(x)$",
        "$h'(x) = e^x$"
      ]
    }
  ]
}
```

**Rendu** : Box avec deux colonnes côte à côte.

#### Exemple avec 3+ colonnes
```json
{
  "type": "box",
  "boxType": "formula",
  "columns": true,
  "content": [
    {
      "title": "Fonction",
      "items": ["$u(x)$", "$v(x)$"]
    },
    {
      "title": "Opération",
      "items": ["$u + v$", "$u \\times v$"]
    },
    {
      "title": "Dérivée",
      "items": ["$u' + v'$", "$u'v + uv'$"]
    }
  ]
}
```

### 6. Texte à Trous (Fill-in-blank)

Utilisez la syntaxe `___réponse___` :

```json
{
  "type": "text",
  "content": "La dérivée de $x^2$ est ___$2x$___"
}
```

**Rendu** : Pointillés cliquables qui révèlent la réponse.

### 7. Tableaux

```json
{
  "type": "text",
  "content": "| Fonction | Dérivée |\n|----------|----------|\n| $x^n$ | $nx^{n-1}$ |\n| $e^x$ | $e^x$ |"
}
```

### 8. Images

```json
{
  "type": "image",
  "config": {
    "src": "/pictures/1bsm/derivee_graphique.png",
    "alt": "Graphique de la dérivée",
    "width": "80%",
    "align": "center",
    "position": "bottom",
    "caption": "Représentation graphique de f et f'"
  }
}
```

**Positions** : `top`, `bottom`, `left`, `right`, `center`

## Types de Boxes

### Box Définition
```json
{
  "type": "box",
  "boxType": "definition",
  "title": "Nombre Dérivé",
  "content": "Le nombre dérivé de $f$ en $a$ est..."
}
```

### Box Théorème
```json
{
  "type": "box",
  "boxType": "theorem",
  "title": "Théorème de Rolle",
  "content": "Si $f$ est continue sur $[a,b]$..."
}
```

### Box Propriété
```json
{
  "type": "box",
  "boxType": "property",
  "title": "Dérivée d'une somme",
  "content": "$(u+v)' = u' + v'$"
}
```

### Box Exemple
```json
{
  "type": "box",
  "boxType": "example",
  "title": "Exemple d'application",
  "content": "Soit $f(x) = x^3 + 2x$..."
}
```

### Box Formule
```json
{
  "type": "box",
  "boxType": "formula",
  "title": "Formules de dérivation",
  "content": [
    "$(x^n)' = nx^{n-1}$",
    "$(e^x)' = e^x$",
    "$(\\ln x)' = \\frac{1}{x}$"
  ]
}
```

### Box Résultat
```json
{
  "type": "box",
  "boxType": "result",
  "title": "Conclusion",
  "content": "La fonction admet un maximum en $x = 2$"
}
```

## Exemple Complet de Leçon

```json
{
  "class": "1bsm",
  "chapter": "La Dérivation",
  "lesson": {
    "title": "Calcul de dérivées",
    "sections": [
      {
        "title": "I. Dérivées des fonctions usuelles",
        "intro": "Nous allons établir les formules de dérivation des fonctions de référence.",
        "paragraphs": [
          {
            "type": "box",
            "boxType": "formula",
            "title": "Tableau des dérivées",
            "columns": true,
            "content": [
              {
                "title": "Fonction",
                "items": [
                  "$f(x) = k$ (constante)",
                  "$f(x) = x$",
                  "$f(x) = x^n$",
                  "$f(x) = \\frac{1}{x}$",
                  "$f(x) = \\sqrt{x}$"
                ]
              },
              {
                "title": "Dérivée",
                "items": [
                  "$f'(x) = 0$",
                  "$f'(x) = 1$",
                  "$f'(x) = nx^{n-1}$",
                  "$f'(x) = -\\frac{1}{x^2}$",
                  "$f'(x) = \\frac{1}{2\\sqrt{x}}$"
                ]
              }
            ]
          },
          {
            "type": "text",
            "content": "!> Attention : La fonction $f(x) = \\sqrt{x}$ n'est dérivable que pour $x > 0$"
          }
        ]
      },
      {
        "title": "II. Opérations sur les dérivées",
        "intro": "Les règles de calcul permettent de dériver des fonctions complexes.",
        "paragraphs": [
          {
            "type": "box",
            "boxType": "property",
            "title": "Propriétés",
            "content": [
              ">> **Somme et différence**",
              "$(u + v)' = u' + v'$",
              "$(u - v)' = u' - v'$",
              ">> **Produit et quotient**",
              "$(uv)' = u'v + uv'$",
              "$(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$"
            ]
          },
          {
            "type": "box",
            "boxType": "example",
            "title": "Exemple 1",
            "content": "Calculer la dérivée de $f(x) = (2x+1)(x^2-3)$\n\nOn pose $u(x) = 2x+1$ et $v(x) = x^2-3$\n\nAlors : $u'(x) = ___2___ $ et $v'(x) = ___2x___$\n\nD'où : $f'(x) = 2(x^2-3) + (2x+1)(2x) = ___6x^2 + 2x - 6___$"
          },
          {
            "type": "text",
            "content": "?> Astuce : Pour dériver un quotient, pensez toujours à vérifier que le dénominateur ne s'annule pas."
          }
        ]
      },
      {
        "title": "III. Application : Sens de variation",
        "paragraphs": [
          {
            "type": "text",
            "content": "Le signe de la dérivée permet de déterminer les variations d'une fonction :"
          },
          {
            "type": "box",
            "boxType": "result",
            "columns": true,
            "content": [
              {
                "title": "Signe de $f'(x)$",
                "items": [
                  "$f'(x) > 0$",
                  "$f'(x) < 0$",
                  "$f'(x) = 0$"
                ]
              },
              {
                "title": "Variation de $f$",
                "items": [
                  "$f$ est croissante",
                  "$f$ est décroissante",
                  "$f$ est constante ou extremum"
                ]
              }
            ]
          },
          {
            "type": "image",
            "config": {
              "src": "/pictures/1bsm/derivee_variation.png",
              "alt": "Lien entre dérivée et variation",
              "width": "70%",
              "align": "center",
              "caption": "Interprétation graphique du signe de la dérivée"
            }
          }
        ]
      }
    ]
  }
}
```

## Résumé des Nouvelles Fonctionnalités

✅ **Texte introductif** : `intro` pour texte sans cadre après le titre  
✅ **Puces flexibles** : `>>` pour désactiver les puces sur certaines lignes  
✅ **Boxes colonnes** : `columns: true` pour affichage multi-colonnes  
✅ **Boxes enrichies** : 6 types (definition, theorem, property, example, formula, result)  
✅ **Alertes inline** : `!>` (attention) et `?>` (astuce)  
✅ **Fill-in-blank** : `___réponse___` pour texte à trous interactif  
✅ **Images positionnées** : 5 positions possibles avec caption  
✅ **Tableaux Markdown** : Support natif avec MathJax  

## Migration des Anciennes Leçons

Pour migrer vos leçons existantes :

1. Ajoutez `intro` pour les premiers paragraphes descriptifs
2. Utilisez `>>` pour les titres dans les listes
3. Convertissez les tableaux en boxes colonnes quand approprié
4. Ajoutez `!>` et `?>` pour les remarques importantes

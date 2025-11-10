# Guide d'attention — Rédaction des leçons JSON

But: ce guide est destiné aux auteurs/éditeurs de contenus (enseignants, développeurs de cours) et vise à :
- clarifier la structure JSON attendue pour les chapitres / leçons / exercices,
- donner des règles rédactionnelles simples et pédagogiques pour un public d'élèves marocains,
- rappeler des conventions techniques importantes (ex. : champ `solution` pour les exercices, utilisation de `___...___` pour les trous dans les formules).

Ce document est volontairement direct et pratique. Il reformule légèrement les textes pour les rendre plus clairs sans altérer l'esprit mathématique.

---

## Principes généraux de rédaction

1) Ne pas numéroter les lignes ou ajouter des puces textuelles explicites dans les paragraphes JSON. Les listes doivent être déclarées en tant que tableaux JSON (voir plus bas). Les numéros de pas, étapes ou sous‑énoncés doivent être des éléments du tableau.

2) Distinguer clairement :
- listes à puces (non ordonnées) : tableau simple d'éléments (ex : `"contents": ["point A", "point B"]`),
- listes numérotées : utiliser un tableau mais préciser dans la méta‑donnée si nécessaire (ex : `"listType": "numbered"`) ou ranger chaque étape dans un tableau d'objets avec un champ `index` quand l'ordre est important.

3) Pour les exercices, n'oubliez jamais le paramètre `solution`. Le champ `solution` doit contenir la réponse correcte (chaîne, tableau de chaînes ou structure selon le type d'exercice). Il permet à l'application d'afficher/valider la correction et aux enseignants d'avoir la clé.

4) N'utilisez pas les zones d'« astuce » (ou `tip`) pour y placer des remarques qui sont en réalité des définitions ou des propriétés. Gardez chaque type d'élément dans sa zone sémantique : définition dans `definition` (ou `sections`), propriété dans `properties`/`proposition` (ou au moins dans le texte principal), astuce/hint uniquement pour aider l'élève.

5) Lors de la rédaction de définitions, propositions ou exemples, évitez de commencer la phrase par un mot générique inutile (ex : "Propriété :", "Exemple :", "Remarque :") — préférez intégrer l'idée en une phrase naturelle et pédagogique. Si vous voulez marquer le bloc comme une « propriété » ou un « exemple », utilisez une clé JSON explicite (`type: "property"` ou `type: "example"`) plutôt que d'écrire le mot au début du texte.

6) Reformulez légèrement les phrases pour plus de clarté (focalisez sur la lisibilité pour des élèves marocains) mais conservez la rigueur mathématique. Exemples :
- remplacer « Soit f une fonction » par « On considère la fonction f » ;
- éviter les phrases longues et les double négations ;
- séparer les étapes en éléments de tableau.

---

## Règles techniques (structure JSON typique)

Les chapitres sont chargés depuis `public/chapters/<class>/<file>.json`. Un chapitre contient typiquement :

- `class` : identifiant de la classe (ex : `"1bsm"`)
- `chapter` : titre affiché (ex : `"Généralités sur les Fonctions"`)
- `sessionDates` : tableau ISO de dates (ex : `["2025-11-10T17:00:00Z"]`)
- `lessonFile` : chemin relatif vers `public/chapters/<class>/lessons/<file>.json`
- `videos`, `quiz`, `exercises`, `exercises` : tableaux optionnels
- `version`, `isActive` : métadonnées de publication

Le fichier de leçon (ex : `public/chapters/1bsm/lessons/xxxxx.json`) contient :
- `title` : titre de la leçon
- `sections` : tableau d'objets `{ title?: string, content: string | string[] | blocks[] }`

Contenu :
- Pour un paragraphe simple : une chaîne de caractères.
- Pour une liste : un tableau de chaînes (liste à puces) ou un tableau d'objets si chaque élément a une méta (ex : `{ text: "...", hint: "..." }`).
- Pour des blocs spécialisés (definition, proposition, example) : utiliser un objet avec `type` et `body` plutôt que de préfixer le texte.

---

## Conventions pour les exercices

Chaque objet d'exercice doit inclure au minimum :
- `id` : identifiant unique
- `title` : titre de l'exercice
- `statement` : énoncé (chaîne ou template)
- `type` : `"mcq"`, `"input"`, `"fill"`, etc.
- `solution` : la/les réponses correctes


Exemple minimal (MCQ) :

{
  "id": "exo1",
  "title": "Domaine d'une fonction rationnelle",
  "statement": "Trouver l'ensemble de définition de $f(x)=\frac{2x+5}{x-4}$.",
  "type": "mcq",
  "options": [
    { "text": "\u211a", "is_correct": false },
    { "text": "\u211a \\ {4} (ex: \"\\mathbb{R}\\setminus\{4\}\")", "is_correct": true }
  ],
  "solution": "\\mathbb{R} \\setminus {4}"
  
}

Remarques sur `solution` :
- Pour `mcq`, `solution` peut être l'index ou le texte correct.
- Pour `input` ou `fill`, `solution` peut être une chaîne ou un tableau de chaînes acceptables.
- Le champ `steps` contient la correction pédagogique et n'est pas obligé d'être affiché aux élèves (contrôler via UI).

---

## Fill-in-the-blank (trous) — Emplacement et syntaxe

-- Dans le texte courant, utilisez la syntaxe `___réponse___` pour marquer un trou (fill-in-the-blank). Le parser du projet reconnaît `___...___` et, pour les formules mathématiques, un pré‑traitement le transforme en structure compatible MathJax.

  - Forcer le style d'affichage (`\\displaystyle`) :
    - Préférez `$$...$$` pour les formules longues ou centrées — dans ce cas MathJax applique déjà le style d'affichage.
    - Si vous gardez la formule en inline (`$...$`) mais souhaitez la taille/espacement d'une expression en style affiché (fractions larges, sommes/intégrales avec limites), ajoutez `\\displaystyle` au début de l'expression inline. Exemple : `$\\displaystyle \\frac{1}{2}$` rendra une fraction en style affiché dans le flux de texte.
    - Exemple comparatif :
      - inline sans `\\displaystyle` : `$\\frac{1}{2}$` (fraction compacte),
      - inline avec `\\displaystyle` : `$\\displaystyle \\frac{1}{2}$` (fraction plus grande, style affiché),
      - display (préféré pour les grandes équations) : `$$\\frac{1}{2}$$` (pas besoin de `\\displaystyle`).
    - Remarque : MathJax supporte aussi `\\dfrac{...}{...}` (package amsmath) qui a un effet similaire à `\\displaystyle\\frac{...}{...}` en inline.

- Dans les formules LaTeX inline ou display, on peut écrire : `$\___{expression}___$` ou mieux : `$ ... ___answer___ ... $` (le parser interne convertit `___answer___` en un élément rendu caché qui sera révélé au clic).

- Placez toujours les trous dans des exemples ou des exercices (pas dans les déclarations formelles de définition ou de propriété), afin que l'élève comprenne le contexte et sache ce qui est attendu.

Exemple d'extrait de leçon (JSON) :

{
  "title": "Exemple : fonction carrée",
  "sections": [
    {
      "title": "Exemple simple",
      "content": [
        "Considérons la fonction $f(x)=x^2$. Si $x=2$, alors $f(x)=___4___ .",
        "Remarque : le résultat est un nombre positif."
      ]
    }
  ]
}

Ici `___4___` sera rendu comme un champ cliquable (caché) et révélé au besoin.

---

## Recommandations rédactionnelles pour le public marocain

- Utilisez un langage simple et direct. Par exemple, préférez : « On considère la fonction f » plutôt que « Soit f une fonction ». Ce n'est pas incorrect, mais la première formulation est plus familière pour des élèves.

- Séparez les étapes de raisonnement en listes courtes (2–4 éléments). Si un résultat nécessite un raisonnement long, découpez‑le en sous‑paragraphes.

- Utilisez des exemples concrets (nombres simples) avant d'exposer une version générale.

- Respectez les notations mathématiques habituelles (LaTeX). Evitez d'introduire des abréviations locales non standard.





## Exemples pratiques complets

Ci‑dessous trois exemples complets destinés à être copiés dans un fichier de leçon (`public/chapters/<class>/lessons/<file>.json`). Tous les exemples utilisent la syntaxe LaTeX avec `$...$` pour l'inline et `$$...$$` pour l'affichage centré lorsque nécessaire.

Exemple 1 — paragraphe, liste et un trou inline dans une formule :

{
  "title": "Généralités sur les fonctions",
  "sections": [
    {
      "title": "Définitions",
      "content": [
        "Une fonction associe à chaque $x$ un unique $y$.",
        {
          "listType": "bulleted",
          "items": [
            "fonction paire : $f(-x)=f(x)$",
            "fonction impaire : $f(-x)=-f(x)$"
          ]
        }
      ]
    },
    {
      "title": "Exemple simple",
      "content": [
        "Si $f(x)=x^2$, alors $f(3)=___9___$.",
        "Remarque : le résultat est positif."
      ]
    }
  ]

}

Exemple 2 — display math (équation centrée) contenant un trou :

{
  "title": "Intégrale simple",
  "sections": [
    {
      "title": "Calcul d'une aire",
      "content": [
        "On calcule l'aire sous la courbe :",
        "$$\int_0^1 x\,dx = ___\\tfrac{1}{2}___$$",
        "Conclusion : l'aire vaut $1/2$."
      ]
    }
  ]

}

Exemple 3 — démonstration guidée avec plusieurs trous (utilisez des trous courts) :

{
  "title": "Exemple : dérivée de $x^2$",
  "sections": [
    {
      "title": "Démonstration étape par étape",
      "content": [
        "Soit $f(x)=x^2$. On calcule $f'(x)$ par la limite :",
        "$f'(x)=\lim_{h\to 0} \frac{(x+h)^2-x^2}{h} = \lim_{h\to 0} \frac{2xh + h^2}{h}$.",
        "Simplifier : $= \lim_{h\to 0} (2x + h) = ___2x___$.",
        "Ainsi $f'(x)=2x$."
      ]
    }
  ]

}

Remarques sur ces exemples :
- Utilisez `$...$` pour l'inline ; employez `$$...$$` seulement pour des équations longues ou centrées.
- Les trous `___...___` doivent rester courts (valeurs, expressions simples, fractions courtes comme `___\\tfrac{1}{2}___`).
- Placez les trous à l'intérieur des `$...$` si la réponse fait partie d'une formule.




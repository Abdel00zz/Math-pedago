# Smart Chapter Manager - Guide Complet

Outil d'édition avancé pour créer et gérer les chapitres de cours avec leçons, quiz et exercices.

## 🆕 Nouvelles Fonctionnalités (2025)

### 1. **Texte Introductif sans Cadre**
- Ajoutez un texte d'introduction après le titre de section
- S'affiche sans encadrement pour une meilleure lisibilité
- Bouton "+ Ajouter un texte introductif" dans chaque section

**Utilisation** :
```json
{
  "title": "I. Les Dérivées",
  "intro": "La notion de dérivée est fondamentale en analyse...",
  "subsections": [...]
}
```

### 2. **Système NoBullet (>> préfixe)**
- Désactivez les puces sur certaines lignes dans une liste
- Idéal pour les titres, notes ou séparateurs

**Syntaxe** :
```
>> **Titre de section** (pas de puce)
Premier point (avec puce ⭐)
Deuxième point (avec puce ⭐)
>> Note importante (pas de puce)
```

**Comment faire** :
1. Dans une box avec `listType: "bullet"` ou `"numbered"`
2. Commencez une ligne par `>>` suivi d'un espace
3. La puce/numéro sera automatiquement masquée

### 3. **Mode Colonnes pour Boxes**
- Affichez le contenu en colonnes côte à côte
- Parfait pour tableaux de formules ou comparaisons
- Case à cocher "🔲 Mode colonnes" disponible

**Exemple** :
```json
{
  "type": "box",
  "boxType": "formula",
  "columns": true,
  "content": [
    ">> **Fonction**",
    "$f(x) = x^2$",
    "$g(x) = \\sin(x)$",
    ">> **Dérivée**",
    "$f'(x) = 2x$",
    "$g'(x) = \\cos(x)$"
  ]
}
```

## 📝 Types d'Éléments

### Éléments de Base
- **Paragraphe** 📝 : Texte simple
- **Tableau** 📊 : Format Markdown

### Boxes Théoriques
- **Définition** 📘 : Définitions mathématiques
- **Théorème** 🔷 : Théorèmes importants
- **Proposition** 🔶 : Propositions mathématiques
- **Propriété** ⚡ : Propriétés clés

### Boxes Pratiques
- **Exemple** 💡 : Exemples d'application
- **Remarque** 📌 : Notes et observations
- **Exercice** ✏️ : Pratique guidée
- **Analyse** 💭 : Explications détaillées

## 🎨 Formatage du Contenu

### Texte à Trous
Utilisez `___réponse___` pour créer des blancs interactifs :
```
La dérivée de $x^2$ est ___$2x$___
```

### Alertes Inline
- `!> Attention : ...` → Box d'alerte orange
- `?> Astuce : ...` → Box d'astuce cyan

### MathJax
Formules mathématiques avec LaTeX :
- Inline : `$f(x) = x^2$`
- Block : `$$\int_0^1 f(x)dx$$`

## 🖼️ Gestion des Images

### Ajouter une Image
1. Cliquez sur l'icône 📷 dans un élément
2. Sélectionnez l'image depuis votre ordinateur
3. Configurez :
   - **Taille** : Small (30%), Medium (50%), Large (80%), Full (100%), ou personnalisée
   - **Position** : Top, Bottom, Left, Right, Center
   - **Alignement** : Left, Center, Right
   - **Légende** : Texte descriptif optionnel

### Stockage
Les images sont automatiquement sauvegardées dans :
```
chapters/{classe}/lessons/pictures/
```

## ⌨️ Raccourcis Clavier

- **Ctrl+Z** : Annuler
- **Ctrl+Y** : Refaire
- **Ctrl+S** : Sauvegarder (suggéré)

## 🏗️ Structure des Fichiers

### Leçon
```json
{
  "header": {
    "title": "Introduction à la dérivation",
    "subtitle": "Concepts fondamentaux",
    "chapter": "Chapitre 3",
    "classe": "1BSM",
    "academicYear": "2024-2025"
  },
  "sections": [
    {
      "title": "I. Définition",
      "intro": "Texte introductif optionnel...",
      "subsections": [
        {
          "title": "1. Nombre dérivé",
          "elements": [
            {
              "type": "definition-box",
              "preamble": "Introduction...",
              "listType": "bullet",
              "columns": false,
              "content": [
                ">> **Points clés**",
                "Point 1 avec puce",
                "Point 2 avec puce"
              ],
              "image": {
                "src": "/chapters/1bsm/lessons/pictures/derivee.png",
                "alt": "Graphique dérivée",
                "caption": "Interprétation graphique",
                "position": "bottom",
                "align": "center",
                "width": "80%"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 💡 Conseils d'Utilisation

### Structuration du Contenu
1. **Sections** : Grandes parties (I, II, III)
2. **Sous-sections** : Points détaillés (1, 2, 3)
3. **Éléments** : Contenu spécifique (définitions, exemples)

### Boxes avec Colonnes
Utilisez pour :
- Tableaux de formules (fonction ↔ dérivée)
- Comparaisons (avant ↔ après)
- Propriétés multiples

### NoBullet
Utilisez `>>` pour :
- Titres de sous-sections dans une liste
- Notes en fin de liste
- Séparateurs visuels

## 🔄 Workflow Recommandé

1. **Créer la structure**
   - Définir sections et sous-sections
   - Ajouter les titres

2. **Ajouter le contenu**
   - Textes introductifs
   - Éléments (définitions, exemples, etc.)
   - Images illustratives

3. **Enrichir avec formatage**
   - NoBullet pour structure
   - Mode colonnes pour tableaux
   - Texte à trous pour interactivité

4. **Tester et Sauvegarder**
   - Aperçu pour vérifier le rendu
   - Sauvegarder régulièrement

## 🐛 Dépannage

### Les puces ne s'affichent pas
- Vérifiez que `listType` est défini sur `"bullet"` ou `"numbered"`
- Le contenu doit être un tableau de strings

### Les colonnes ne fonctionnent pas
- Activez la case "Mode colonnes"
- Le contenu doit être formaté correctement
- Fonctionne uniquement avec les boxes (pas paragraphes/tableaux)

### Images non trouvées
- Vérifiez le chemin : `/chapters/{classe}/lessons/pictures/`
- L'image doit être dans le bon dossier de classe
- Nom de fichier respecte la casse

## 📚 Exemples Pratiques

### Exemple 1 : Box Formule avec Colonnes
```json
{
  "type": "property-box",
  "preamble": "Règles de dérivation :",
  "listType": "bullet",
  "columns": true,
  "content": [
    ">> **Opération**",
    "$(u+v)'$",
    "$(uv)'$",
    "$(u/v)'$",
    ">> **Résultat**",
    "$u' + v'$",
    "$u'v + uv'$",
    "$(u'v - uv')/v^2$"
  ]
}
```

### Exemple 2 : Exemple avec NoBullet
```json
{
  "type": "example-box",
  "preamble": "Application pratique :",
  "listType": "numbered",
  "content": [
    ">> **Calculer la dérivée de :**",
    "$f(x) = x^3 + 2x$",
    "$g(x) = \\sin(x) \\cdot x^2$",
    ">> **Solution :**",
    "$f'(x) = ___3x^2 + 2___$",
    "$g'(x) = ___\\cos(x) \\cdot x^2 + \\sin(x) \\cdot 2x___$"
  ]
}
```

## 🎓 Meilleures Pratiques

1. **Cohérence** : Utilisez le même style pour toutes les leçons
2. **Hiérarchie** : Sections > Sous-sections > Éléments
3. **Images** : Utilisez des noms descriptifs
4. **MathJax** : Testez les formules complexes
5. **NoBullet** : Uniquement pour structure, pas contenu principal
6. **Colonnes** : Maximum 3 colonnes pour lisibilité

## 📞 Support

Pour toute question ou suggestion d'amélioration, consultez la documentation complète dans `guide_lesson_structure.md`.

---

**Version** : 2.0 (Novembre 2025)
**Dernières mises à jour** : Texte intro, NoBullet, Mode colonnes

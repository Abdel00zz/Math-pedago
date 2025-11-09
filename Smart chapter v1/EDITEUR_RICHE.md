# 📝 Éditeur de Contenu Riche - Smart Chapter v1

## 🎯 Vue d'ensemble

L'éditeur de contenu riche a été intégré dans **Smart Chapter v1** pour améliorer l'expérience d'édition des leçons. Il remplace les zones de texte simples par un éditeur moderne avec une barre d'outils complète.

## ✨ Fonctionnalités

### 🎨 Formatage de Texte

#### Gras, Italique, Souligné
- **Gras** : `**texte**` ou Ctrl+B
- *Italique* : `*texte*` ou Ctrl+I
- <u>Souligné</u> : `<u>texte</u>` ou Ctrl+U
- <mark>Surligné</mark> : `<mark>texte</mark>`

### 📋 Listes

- **Liste à puces** : Bouton 🔘 ou tapez `- ` au début d'une ligne
- **Liste numérotée** : Bouton 🔢 ou tapez `1. ` au début d'une ligne

### 🔬 Formules Mathématiques (LaTeX)

Le menu Math (∑) propose plusieurs options :

1. **Formule en ligne** : `$formule$`
   - Exemple : `$x^2 + y^2 = z^2$`

2. **Formule centrée** : `$$formule$$`
   - Exemple :
     ```
     $$
     \int_a^b f(x) dx
     $$
     ```

3. **Raccourcis rapides** :
   - Fraction : `$\frac{a}{b}$`
   - Racine carrée : `$\sqrt{x}$`
   - Somme : `$\sum_{i=1}^{n} expression$`
   - Intégrale : `$\int_{a}^{b} f(x) dx$`

### 💡 Encadrés Spéciaux (Callouts)

Le menu Alerte (⚠️) propose :

1. **Attention** (encadré orange) :
   ```
   !> Message important
   ```

2. **Conseil** (encadré cyan) :
   ```
   ?> Astuce ou conseil
   ```

### 🖼️ Images

- Bouton **Image** intégré dans la barre d'outils
- Cliquez sur l'icône 🖼️ pour :
  - Ajouter une nouvelle image
  - Modifier une image existante (bouton en bleu si image présente)
- Configuration complète (position, taille, légende, etc.)

### 🔗 Autres Fonctionnalités

1. **Liens** :
   - Bouton 🔗
   - Format : `[texte du lien](https://url.com)`

2. **Texte à trou** (fill-in-the-blank) :
   - Bouton ⬜
   - Format : `___réponse___`
   - Utilisé pour les exercices interactifs

### 🎓 Syntaxe Spéciale Math Pedago

- **NoBullet** : Ligne sans puce dans une liste
  ```
  >> Titre de section (sans puce)
  Premier point avec puce
  Deuxième point avec puce
  ```

## 🚀 Utilisation

### Dans l'Éditeur de Leçons

L'éditeur riche est maintenant utilisé pour :

1. ✅ **Paragraphes** (type `p`)
2. ✅ **Tableaux** (type `table`)
3. ✅ **Texte introductif** des sections
4. ✅ **Préambule** des boxes (définitions, théorèmes, etc.)
5. ✅ **Contenu** des boxes

### Exemple d'Utilisation

```markdown
## Édition d'un Théorème

**Préambule** :
!> Important : Ce théorème est fondamental

**Contenu** :
Soit $f$ une fonction continue sur $[a,b]$.

Alors :
$$
\int_a^b f(x) dx = F(b) - F(a)
$$

où $F$ est une primitive de $f$.
```

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+B` / `Cmd+B` | Gras |
| `Ctrl+I` / `Cmd+I` | Italique |
| `Ctrl+U` / `Cmd+U` | Souligné |

## 📚 Aide Rapide

Une section d'aide rapide est disponible dans chaque éditeur :
- Cliquez sur "📚 Aide rapide" pour voir les syntaxes principales
- Exemples en temps réel de formatage
- Rappel des codes spéciaux

## 🎨 Interface

### Barre d'Outils

La barre d'outils est organisée en groupes logiques :

1. **Formatage de texte** : Gras, Italique, Souligné, Surligné
2. **Listes** : Puces, Numérotation
3. **Mathématiques** : Menu déroulant avec formules LaTeX
4. **Callouts** : Menu déroulant avec encadrés spéciaux
5. **Autres** : Liens, Textes à trous
6. **Image** : Bouton d'image (si disponible pour l'élément)

### Style Visuel

- Design moderne avec dégradé de couleurs
- Boutons avec effet hover
- Indicateurs visuels (bouton image en bleu si image présente)
- Menus déroulants pour les options avancées

## 🔄 Compatibilité

L'éditeur riche est **100% compatible** avec :
- ✅ Les fichiers JSON existants
- ✅ Le système d'affichage des leçons
- ✅ MathJax pour le rendu LaTeX
- ✅ Les fonctionnalités interactives (textes à trous)
- ✅ Le système d'images existant

## 💾 Sauvegarde

- Les modifications sont automatiquement intégrées à l'historique (Undo/Redo)
- Le formatage est préservé dans le JSON
- Aucun changement de structure de données nécessaire

## 🎯 Avantages

1. **Interface intuitive** : Boutons clairs avec icônes
2. **Gain de temps** : Insertion rapide de formatage
3. **Moins d'erreurs** : Syntaxe générée automatiquement
4. **Découvrabilité** : Les fonctionnalités sont visibles
5. **Aide contextuelle** : Aide rapide intégrée
6. **Robustesse** : Build réussi sans erreurs TypeScript

## 🔧 Développement

### Structure

- **Composant** : `components/RichTextEditor.tsx`
- **Intégration** : `components/LessonEditor.tsx`
- **Types** : TypeScript strict activé
- **Dépendances** : Aucune dépendance externe ajoutée

### Extensibilité

Le composant `RichTextEditor` est conçu pour être :
- ✅ Réutilisable
- ✅ Configurable (props pour personnaliser)
- ✅ Maintenable (code bien commenté)
- ✅ Extensible (facile d'ajouter de nouveaux boutons)

---

**Créé pour Math Pedago** - Smart Chapter v1
Version: 1.0.0
Date: Novembre 2025

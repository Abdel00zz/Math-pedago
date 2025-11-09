# 📝 Éditeur de Contenu Riche v2 - Smart Chapter v1

## 🎯 Vue d'ensemble

L'éditeur de contenu riche **version 2** a été entièrement refondu pour offrir une expérience d'édition moderne et professionnelle. Il intègre maintenant un **aperçu en temps réel avec MathJax**, des **icônes Material Symbols**, et une interface optimisée.

## ✨ Nouveautés de la Version 2

### 🔥 Aperçu en Temps Réel
- **Prévisualisation côte à côte** avec l'éditeur
- **Rendu instantané** des formules mathématiques LaTeX avec MathJax
- **Support complet** du formatage Markdown (gras, italique, souligné, surligné)
- **Affichage des callouts** (attention, conseil) avec styles colorés
- **Rendu des textes à trous** et des liens
- **Bouton pour masquer/afficher** l'aperçu (icône 👁️)

### 🎨 Interface Modernisée
- **Icônes Material Symbols** professionnelles (remplace les SVG)
- **Barre d'outils redesignée** avec design élégant
- **Espacement amélioré** et zones aérées
- **Zones d'édition agrandies** (3-10 lignes au lieu de 2-6)
- **Effets hover** sur les boutons
- **Indicateurs visuels** clairs (ex: bouton image en bleu si présent)

### 📋 Type de Liste Intégré
- **Sélecteur dans la barre d'outils** au lieu d'un contrôle séparé
- **3 options** : Sans liste / ⭐ Puces / ① Numérotée
- **Interface cohérente** avec le reste de l'éditeur
- **Moins de redondance** visuelle

## 🛠️ Fonctionnalités Complètes

### 🎨 Formatage de Texte

| Bouton | Syntaxe | Raccourci | Rendu |
|--------|---------|-----------|-------|
| **B** | `**texte**` | Ctrl+B | **gras** |
| *I* | `*texte*` | Ctrl+I | *italique* |
| <u>U</u> | `<u>texte</u>` | Ctrl+U | <u>souligné</u> |
| 🖍️ | `<mark>texte</mark>` | - | surligné |

### 📋 Listes

Le sélecteur de liste dans la barre d'outils offre :

1. **Sans liste** : Texte simple, sans puces ni numéros
2. **⭐ Puces** : Chaque ligne devient une puce
3. **① Numérotée** : Chaque ligne devient un numéro

💡 **Astuce** : Commencez une ligne par `>>` pour la masquer (utile pour les titres de sections)

### 🔬 Formules Mathématiques (LaTeX)

Le menu **Math** (icône fonction ∑) propose :

#### Formules de base
- **Formule en ligne** : `$formule$`
  - Exemple : `$x^2 + y^2 = z^2$` → $x^2 + y^2 = z^2$
- **Formule centrée** : `$$formule$$`
  - Exemple :
    ```
    $$
    \int_a^b f(x) dx = F(b) - F(a)
    $$
    ```

#### Raccourcis rapides
- **Fraction** : `$\frac{a}{b}$` → $\frac{a}{b}$
- **Racine carrée** : `$\sqrt{x}$` → $\sqrt{x}$
- **Somme** : `$\sum_{i=1}^{n} a_i$` → $\sum_{i=1}^{n} a_i$
- **Intégrale** : `$\int_{a}^{b} f(x) dx$` → $\int_{a}^{b} f(x) dx$

✨ **Aperçu instantané** : Les formules sont rendues en temps réel dans le panneau d'aperçu !

### 💡 Encadrés Spéciaux (Callouts)

Le menu **Callouts** (icône 📢) propose :

1. **Attention** (orange) :
   ```
   !> Message important
   ```
   → Encadré orange avec icône ⚠️

2. **Conseil** (cyan) :
   ```
   ?> Astuce ou conseil
   ```
   → Encadré cyan avec icône 💡

### 🖼️ Images

- **Bouton Image** intégré (icône 🖼️)
- **Indicateur visuel** : Bouton en bleu avec bordure si une image est attachée
- **Modal de configuration** pour :
  - Taille (Small, Medium, Large, Full, Custom)
  - Position (Top, Bottom, Left, Right, Center)
  - Alignement (Left, Center, Right)
  - Légende et texte alternatif
- **Sauvegarde automatique** dans `chapters/{class}/lessons/pictures/`

### 🔗 Autres Fonctionnalités

1. **Liens** (icône 🔗) :
   - Format : `[texte du lien](https://url.com)`
   - Exemple : `[Math Pedago](https://mathpedago.com)`

2. **Texte à trou** (icône T) :
   - Format : `___réponse___`
   - Utilisé pour les exercices interactifs
   - Rendu avec style spécial dans l'aperçu

## 🚀 Utilisation

### Interface en Deux Colonnes

L'éditeur affiche maintenant **deux panneaux côte à côte** :

```
┌─────────────────────────────────────────┐
│  Barre d'outils avec tous les boutons  │
├──────────────────┬──────────────────────┤
│                  │                      │
│   📝 Éditeur     │   👁️ Aperçu        │
│   (Textarea)     │   (Rendu en direct) │
│                  │                      │
└──────────────────┴──────────────────────┘
```

### Dans l'Éditeur de Leçons

L'éditeur riche v2 est utilisé pour :

1. ✅ **Paragraphes** (type `p`) - 4 lignes par défaut
2. ✅ **Tableaux** (type `table`) - 6 lignes
3. ✅ **Texte introductif** des sections - 3 lignes
4. ✅ **Préambule** des boxes - 3 lignes
5. ✅ **Contenu** des boxes - 10 lignes avec sélecteur de liste

### Exemple Complet

```markdown
## Théorème de Pythagore

**Préambule** :
!> Ce théorème est **fondamental** en géométrie

**Type de liste** : ⭐ Puces

**Contenu** :
>> Dans un triangle rectangle :
Le carré de l'*hypoténuse* est égal à la somme des carrés des deux autres côtés
Formule : $c^2 = a^2 + b^2$
?> Pense au triangle 3-4-5 pour vérifier !
```

**Aperçu en direct** :
> ⚠️ Ce théorème est **fondamental** en géométrie
>
> **Dans un triangle rectangle :**
> - Le carré de l'*hypoténuse* est égal à la somme des carrés des deux autres côtés
> - Formule : $c^2 = a^2 + b^2$
>
> 💡 Pense au triangle 3-4-5 pour vérifier !

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+B` / `Cmd+B` | Gras |
| `Ctrl+I` / `Cmd+I` | Italique |
| `Ctrl+U` / `Cmd+U` | Souligné |

## 📚 Aide Rapide

Une section d'aide rapide déroulante est disponible dans chaque éditeur :
- Cliquez sur **"📚 Aide rapide"** pour afficher/masquer
- Affiche les 6 syntaxes les plus courantes
- Format compact en 2 colonnes

## 🎨 Organisation de la Barre d'Outils

La barre d'outils est organisée en **6 groupes** séparés par des lignes verticales :

1. **Formatage** : B, I, U, Surligné
2. **Listes** : Sélecteur (Sans liste / Puces / Numérotée)
3. **Math** : Menu déroulant avec formules LaTeX
4. **Callouts** : Menu déroulant (Attention / Conseil)
5. **Autres** : Liens, Textes à trous
6. **Contrôles** : Image, Aperçu (masquer/afficher)

### Menus Déroulants

- **Clic** sur Math (∑) ou Callouts (📢) pour ouvrir le menu
- **Sélection** insère automatiquement la syntaxe
- **Fermeture** automatique après insertion
- **Clic extérieur** ferme le menu

## 🔄 Compatibilité

L'éditeur riche v2 est **100% rétrocompatible** :
- ✅ Fichiers JSON existants (aucune modification nécessaire)
- ✅ Système d'affichage des leçons
- ✅ MathJax pour le rendu LaTeX
- ✅ Fonctionnalités interactives (textes à trous)
- ✅ Système d'images existant
- ✅ Mode colonnes pour les boxes

## 💾 Sauvegarde

- **Historique Undo/Redo** : Chaque modification est enregistrée
- **Format JSON préservé** : Structure des données inchangée
- **Sauvegarde manuelle** : Bouton "Sauvegarder" dans la barre supérieure

## 🎯 Avantages de la Version 2

| Fonctionnalité | v1 | v2 |
|----------------|----|----|
| Aperçu en temps réel | ❌ | ✅ |
| Rendu MathJax instantané | ❌ | ✅ |
| Icônes professionnelles | SVG | Material Symbols |
| Type de liste | Contrôle séparé | Intégré dans toolbar |
| Zones d'édition | Petites (2-6 lignes) | Grandes (3-10 lignes) |
| Interface | Basique | Moderne et aérée |
| Aide rapide | Toujours visible | Déroulante (gain d'espace) |

## 🔧 Aspects Techniques

### Structure

- **Composant** : `components/RichTextEditor.tsx` (v2)
- **Intégration** : `components/LessonEditor.tsx`
- **MathJax** : Configuration dans `index.html`
- **Icônes** : Material Symbols Outlined (Google Fonts)
- **Types** : TypeScript strict activé

### Dépendances

- ✅ **Aucune nouvelle dépendance NPM**
- ✅ **CDN uniquement** :
  - Tailwind CSS
  - Material Symbols (Google Fonts)
  - MathJax 3 (CDN jsDelivr)

### Performance

- **Build optimisé** : 286 KB (gzippé : 84 KB)
- **Rendu MathJax** : Timeout de 100ms pour éviter les re-renders excessifs
- **Pas de lag** lors de la saisie
- **Aperçu** : Mise à jour fluide en temps réel

### Extensibilité

Le composant `RichTextEditor` accepte les props :

```typescript
interface RichTextEditorProps {
    value: string;                                    // Contenu
    onChange: (value: string) => void;                // Callback changement
    placeholder?: string;                             // Texte placeholder
    rows?: number;                                    // Hauteur (défaut: 8)
    elementType?: string;                             // Type d'élément
    onImageClick?: () => void;                        // Callback bouton image
    hasImage?: boolean;                               // Indique si image présente
    listType?: 'bullet' | 'numbered' | undefined;     // Type de liste
    onListTypeChange?: (type) => void;                // Callback changement liste
}
```

## 📊 Statistiques

- **Lignes de code** : ~480 lignes (RichTextEditor.tsx)
- **Composants React** : 2 (`RichTextEditor` + `LivePreview`)
- **Boutons de formatage** : 10
- **Menus déroulants** : 2
- **Modes** : 2 (édition + aperçu)
- **Raccourcis clavier** : 3

## 🎓 Guide d'Utilisation Rapide

### Pour les Débutants

1. **Écrivez** votre contenu dans la zone de gauche
2. **Utilisez** les boutons pour formater (gras, italique, etc.)
3. **Vérifiez** l'aperçu en temps réel à droite
4. **Cliquez** sur "Aide rapide" si vous oubliez une syntaxe

### Pour les Utilisateurs Avancés

1. **Tapez directement** la syntaxe Markdown (plus rapide)
2. **Utilisez** les raccourcis clavier (Ctrl+B, Ctrl+I, Ctrl+U)
3. **Masquez** l'aperçu si vous n'en avez pas besoin (bouton 👁️)
4. **Exploitez** les menus Math et Callouts pour les contenus complexes

### Astuces Pro

- **Texte à trou** : Sélectionnez le texte puis cliquez sur le bouton T
- **Formule LaTeX** : Tapez `$` puis votre formule puis `$` (aperçu instantané!)
- **Liste sans puce** : Commencez par `>>` pour créer un titre dans une liste
- **Mode colonnes** : Activez pour afficher le contenu en 2 colonnes

---

**Créé pour Math Pedago** - Smart Chapter v1
Version: 2.0.0
Date: Novembre 2025
Auteur: Claude Code + Math Pedago Team

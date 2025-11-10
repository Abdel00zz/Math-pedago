# 📚 Éditeur de Leçons - Architecture Modulaire

## 🎯 Vue d'ensemble

L'éditeur de leçons a été refactorisé en composants modulaires pour une meilleure maintenabilité, performance et expérience utilisateur.

## 🏗️ Architecture

### Structure des composants

```
lesson-editor/
├── types.ts                 # Types TypeScript partagés
├── LessonPreview.tsx        # Aperçu en temps réel avec MathJax
├── ElementToolbar.tsx       # Barre d'outils pour ajouter/gérer les éléments
├── ElementEditor.tsx        # Éditeur pour un élément individuel
├── editor-styles.css        # Styles modernes et cohérents
├── index.ts                 # Exports centralisés
└── README.md               # Cette documentation
```

### Composants principaux

#### 1. **LessonPreview** - Aperçu en temps réel

Affiche un aperçu rendu de la leçon avec :
- ✅ Rendu MathJax automatique
- ✅ Styles identiques à l'affichage final
- ✅ Mise à jour en temps réel
- ✅ Support des boîtes pédagogiques
- ✅ Formatage Markdown

**Props :**
```typescript
interface LessonPreviewProps {
    lesson: LessonContent;
    highlightedPath?: string | null;
}
```

#### 2. **ElementToolbar** - Barre d'outils

Barre d'outils moderne pour gérer les éléments :
- ✅ Menu déroulant avec recherche
- ✅ Icônes et descriptions pour chaque type
- ✅ Actions : ajouter, déplacer, dupliquer, supprimer
- ✅ Design moderne et intuitif

**Props :**
```typescript
interface ElementToolbarProps {
    onAddElement: (type: LessonElementType) => void;
    onDeleteElement?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDuplicate?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    compact?: boolean;
}
```

#### 3. **ElementEditor** - Éditeur d'élément

Éditeur contextuel pour chaque type d'élément :
- ✅ Interface adaptée au type d'élément
- ✅ Préambule pour les boîtes
- ✅ Validation en temps réel
- ✅ Aide intégrée pour le formatage

**Props :**
```typescript
interface ElementEditorProps {
    element: LessonElement;
    onChange: (element: LessonElement) => void;
    isActive?: boolean;
}
```

## 🎨 Design System

### Couleurs des éléments

| Type | Couleur | Usage |
|------|---------|-------|
| `definition-box` | Bleu (#6366f1) | Définitions formelles |
| `theorem-box` | Bleu (#3b82f6) | Théorèmes |
| `proposition-box` | Vert (#10b981) | Propositions |
| `property-box` | Ambre (#f59e0b) | Propriétés |
| `example-box` | Violet (#8b5cf6) | Exemples |
| `remark-box` | Vert (#10b981) | Remarques |
| `practice-box` | Rouge (#ef4444) | Exercices |
| `explain-box` | Cyan (#06b6d4) | Analyses |

### Layout

- **Grid 2 colonnes** : Éditeur | Aperçu
- **Responsive** : 1 colonne sur mobile
- **Spacing** : système cohérent avec gap/padding
- **Scrollbars** : personnalisés pour une meilleure UX

## 💡 Utilisation

### Exemple d'intégration

```typescript
import {
    LessonPreview,
    ElementToolbar,
    ElementEditor,
    LessonContent
} from './lesson-editor';

function MyEditor() {
    const [lesson, setLesson] = useState<LessonContent>(...);

    return (
        <div className="lesson-editor-container">
            {/* Panneau éditeur */}
            <div className="lesson-editor-panel">
                <ElementToolbar
                    onAddElement={(type) => handleAddElement(type)}
                    onDeleteElement={() => handleDelete()}
                />
                <ElementEditor
                    element={currentElement}
                    onChange={(el) => handleElementChange(el)}
                />
            </div>

            {/* Panneau aperçu */}
            <div className="lesson-editor-panel">
                <LessonPreview lesson={lesson} />
            </div>
        </div>
    );
}
```

## ✨ Fonctionnalités

### Formatage supporté

- **Gras** : `**texte**`
- **Math inline** : `$f(x)$`
- **Math display** : `$$...$$`
- **Alert box** : `!> Attention...`
- **Tip box** : `?> Astuce...`
- **Sans puce** : `>> texte`
- **Fill-in-blank** : `___réponse___`

### Types d'éléments

1. **Paragraphe** (`p`) - Texte simple ou liste
2. **Tableau** (`table`) - Tableau Markdown
3. **Définition** (`definition-box`) - Définitions formelles
4. **Théorème** (`theorem-box`) - Théorèmes mathématiques
5. **Proposition** (`proposition-box`) - Propositions
6. **Propriété** (`property-box`) - Propriétés importantes
7. **Exemple** (`example-box`) - Exemples d'application
8. **Remarque** (`remark-box`) - Remarques et notes
9. **Exercice** (`practice-box`) - Exercices pratiques
10. **Analyse** (`explain-box`) - Analyses détaillées

## 🚀 Performance

- ✅ **Composants mémorisés** : évite les re-renders inutiles
- ✅ **Lazy loading** : MathJax chargé uniquement si nécessaire
- ✅ **Debouncing** : pour les mises à jour de l'aperçu
- ✅ **Virtual scrolling** : pour les grandes leçons (à venir)

## 📝 TODO

- [ ] Drag & drop pour réorganiser les éléments
- [ ] Raccourcis clavier
- [ ] Mode plein écran pour l'aperçu
- [ ] Export en différents formats
- [ ] Historique undo/redo amélioré
- [ ] Collaboration temps réel

## 🔧 Maintenance

Pour ajouter un nouveau type d'élément :

1. Ajouter le type dans `types.ts`
2. Ajouter la configuration dans `ELEMENT_CONFIGS`
3. Ajouter le style dans `LessonPreview.tsx`
4. Tester le rendu dans `ElementEditor.tsx`

## 📚 Ressources

- [Guide de structure JSON](../../../guide_lesson_structure.md)
- [Guide complet](../../../GUIDE_COMPLET_CREATION_LECONS.md)
- [Documentation MathJax](https://www.mathjax.org/)

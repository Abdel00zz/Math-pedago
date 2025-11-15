# Guide du Système de Gestion d'Images Modernisé

## 📋 Vue d'ensemble

Le système de gestion d'images a été complètement modernisé pour offrir une expérience utilisateur optimale avec :
- ✅ **Réédition d'images existantes** via modal
- ✅ **Interface moderne et intuitive**
- ✅ **Aperçu en temps réel**
- ✅ **Support de multiples formats** (PNG, JPEG, SVG, GIF, WebP)
- ✅ **Configuration complète** (taille, position, alignement)
- ✅ **Système unifié** entre Smart Chapter V1 et leçons principales

---

## 🎯 Composants disponibles

### 1. ImageManagerV2 (Smart Chapter V1)

**Fichier**: `Smart chapter v1/components/ImageManagerV2.tsx`

**Utilisation**:
```tsx
import { ImageManagerV2 } from './components/ImageManagerV2';

// Dans votre composant
const [showImageManager, setShowImageManager] = useState(false);

<ImageManagerV2
  images={exerciseImages}
  chapter={currentChapter}
  onClose={() => setShowImageManager(false)}
  onSave={(updatedImages) => {
    // Sauvegarder les images modifiées
    updateExerciseImages(updatedImages);
    setShowImageManager(false);
  }}
  dirHandle={directoryHandle}
/>
```

**Fonctionnalités**:
- Gestion de plusieurs images par exercice/leçon
- Modal d'édition dédié pour chaque image
- Remplacement de fichier pour images existantes
- Aperçu instantané avec preview
- Suppression sécurisée avec confirmation
- Liste latérale avec vignettes

---

### 2. ImageManagerModern (Leçons principales)

**Fichier**: `components/ImageManagerModern.tsx`

**Utilisation**:
```tsx
import { ImageManagerModern } from './components/ImageManagerModern';

// Pour ajouter une nouvelle image
<ImageManagerModern
  isOpen={showImageModal}
  onClose={() => setShowImageModal(false)}
  onSave={(imageConfig) => {
    // Ajouter l'image à l'élément
    addImageToElement(imageConfig);
  }}
  lessonPath="/chapters/1bsm/lessons"
/>

// Pour éditer une image existante
<ImageManagerModern
  isOpen={showImageModal}
  currentImage={existingImage}
  onClose={() => setShowImageModal(false)}
  onSave={(imageConfig) => {
    // Mettre à jour l'image
    updateImage(imageConfig);
  }}
  onDelete={() => {
    // Supprimer l'image
    removeImage();
  }}
  lessonPath="/chapters/1bsm/lessons"
/>
```

**Fonctionnalités**:
- Modal unique pour ajout et édition
- Support URL ou upload de fichier
- Validation du texte alternatif (obligatoire)
- Configuration complète de l'affichage
- Suppression optionnelle
- Preview en temps réel

---

## 🔧 Configuration des images

### Tailles disponibles

| Taille | Largeur | Usage recommandé |
|--------|---------|------------------|
| **Petit** (small) | 200px | Icônes, petites illustrations |
| **Moyen** (medium) | 400px | Images standard dans le contenu |
| **Grand** (large) | 600px | Images importantes, schémas détaillés |
| **Pleine largeur** (full) | 100% | Bannières, graphiques larges |
| **Personnalisé** (custom) | Variable | Contrôle précis (px, %, em, rem) |

### Positions disponibles

| Position | Description | Rendu |
|----------|-------------|-------|
| **En haut** (top) | Au-dessus du contenu | Image puis texte |
| **En bas** (bottom) | Sous le contenu | Texte puis image |
| **À gauche** (left) | Côté gauche, texte à droite | Image ← → Texte (flex-row) |
| **À droite** (right) | Côté droit, texte à gauche | Texte ← → Image (flex-row) |
| **Centré** (center) | Au centre de la section | Image centrée, texte en dessous |
| **Inline** (inline) | Dans le flux du texte | Image intégrée au paragraphe |

### Alignements disponibles

- **Gauche** (left): Aligné à gauche
- **Centré** (center): Aligné au centre
- **Droite** (right): Aligné à droite

---

## 💡 Exemples d'utilisation

### Exemple 1: Ajouter une image à un exemple

```tsx
// Dans LessonEditor ou QuizEditor
const handleAddImage = () => {
  setImageModalOpen(true);
  setCurrentEditingImage(null); // Nouvelle image
};

const handleSaveImage = (imageConfig: LessonImageConfig) => {
  const updatedElement = {
    ...currentElement,
    image: imageConfig
  };
  updateElement(updatedElement);
};

// Dans le JSX
<button onClick={handleAddImage}>
  Ajouter une image
</button>

<ImageManagerModern
  isOpen={imageModalOpen}
  currentImage={currentElement.image}
  onClose={() => setImageModalOpen(false)}
  onSave={handleSaveImage}
  onDelete={() => {
    const updatedElement = { ...currentElement };
    delete updatedElement.image;
    updateElement(updatedElement);
    setImageModalOpen(false);
  }}
/>
```

### Exemple 2: Éditer une image existante

```tsx
// Clic sur l'image dans le preview
const handleEditImage = () => {
  setImageModalOpen(true);
  // currentElement.image existe déjà
};

<div onClick={handleEditImage} className="cursor-pointer relative group">
  <img src={currentElement.image.src} alt={currentElement.image.alt} />
  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 
                  flex items-center justify-center opacity-0 group-hover:opacity-100 
                  transition-all">
    <span className="text-white font-semibold">✏️ Éditer</span>
  </div>
</div>
```

### Exemple 3: Gestionnaire multi-images (Smart Chapter V1)

```tsx
// Dans ExerciseEditor
const [showImageManager, setShowImageManager] = useState(false);

const handleManageImages = () => {
  setShowImageManager(true);
};

const handleSaveImages = (updatedImages: ExerciseImage[]) => {
  const updatedExercise = {
    ...currentExercise,
    images: updatedImages
  };
  saveExercise(updatedExercise);
  setShowImageManager(false);
};

// Dans le JSX
<button onClick={handleManageImages}>
  📷 Gérer les images ({exercise.images?.length || 0})
</button>

<ImageManagerV2
  images={exercise.images || []}
  chapter={chapter}
  onClose={() => setShowImageManager(false)}
  onSave={handleSaveImages}
  dirHandle={projectDirHandle}
/>
```

---

## 🎨 Personnalisation

### Styles personnalisés

Les composants utilisent Tailwind CSS. Pour personnaliser:

```tsx
// Modifier les couleurs d'accent
className="bg-blue-600" → className="bg-purple-600"

// Changer les tailles de modal
className="max-w-5xl" → className="max-w-6xl"

// Ajuster les espacements
className="p-6" → className="p-8"
```

### Ajouter de nouvelles positions

```tsx
const positionOptions = [
  // ... positions existantes
  { value: 'split', label: '🔀 Divisé', desc: 'Image et texte côte à côte 50/50' }
];

// Dans ContentWithImage
if (position === 'split') {
  return (
    <div className="grid grid-cols-2 gap-6">
      <LessonImage config={image} />
      <div>{children}</div>
    </div>
  );
}
```

---

## 🔄 Migration depuis l'ancien système

### Smart Chapter V1

**Ancien système** (ImageManager.tsx):
```tsx
<ImageManager
  images={images}
  chapter={chapter}
  onClose={onClose}
  onSave={onSave}
  dirHandle={dirHandle}
/>
```

**Nouveau système** (ImageManagerV2.tsx):
```tsx
<ImageManagerV2
  images={images}
  chapter={chapter}
  onClose={onClose}
  onSave={onSave}
  dirHandle={dirHandle}
/>
```

✅ **Interface identique** - Changez juste le nom du composant!

### Leçons principales

**Ancien système** (ImageUploadModal.tsx):
```tsx
<ImageUploadModal
  isOpen={isOpen}
  onClose={onClose}
  onUpload={(config) => {
    // Conversion nécessaire
    const imageConfig = {
      src: uploadedPath,
      alt: config.alt,
      // ...
    };
  }}
/>
```

**Nouveau système** (ImageManagerModern.tsx):
```tsx
<ImageManagerModern
  isOpen={isOpen}
  onClose={onClose}
  onSave={(imageConfig) => {
    // Directement utilisable
    addImage(imageConfig);
  }}
/>
```

---

## 📊 Comparaison des fonctionnalités

| Fonctionnalité | Ancien système | Nouveau système |
|----------------|----------------|-----------------|
| Édition d'images existantes | ❌ Non | ✅ Oui (modal dédié) |
| Remplacement de fichier | ❌ Non | ✅ Oui |
| Aperçu en temps réel | ⚠️ Limité | ✅ Complet |
| Interface moderne | ❌ Non | ✅ Oui (gradients, animations) |
| Multi-images | ⚠️ Basic | ✅ Avancé (vignettes, sélection) |
| Validation | ⚠️ Minimale | ✅ Complète (alt obligatoire) |
| Accessibilité | ⚠️ Basic | ✅ Excellente (labels, aria) |
| Responsive | ⚠️ Limité | ✅ Complet (mobile-first) |

---

## 🚀 Fonctionnalités avancées

### Remplacement de fichier

L'utilisateur peut maintenant remplacer le fichier d'une image existante tout en conservant ses métadonnées (légende, position, etc.):

1. Cliquer sur "Éditer" sur une image
2. Cliquer sur "Remplacer le fichier"
3. Sélectionner le nouveau fichier
4. L'aperçu se met à jour instantanément
5. Enregistrer pour appliquer

### Gestion de preview

```tsx
// Clean up des previews pour éviter les fuites mémoire
useEffect(() => {
  return () => {
    Object.values(previews).forEach(URL.revokeObjectURL);
  };
}, [previews]);
```

### Upload progressif

Pour gérer de gros fichiers:

```tsx
const [uploadProgress, setUploadProgress] = useState(0);

const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      setUploadProgress(percent);
    }
  });
  
  // ... upload logic
};
```

---

## 🐛 Dépannage

### L'aperçu ne s'affiche pas

**Problème**: L'image ne s'affiche pas dans le preview

**Solutions**:
1. Vérifier que l'URL est correcte
2. Vérifier les CORS si URL externe
3. Vérifier le format de fichier (PNG, JPEG, SVG, GIF, WebP)
4. Regarder la console pour les erreurs

### Les images ne se sauvegardent pas

**Problème**: Les modifications ne sont pas enregistrées

**Solutions**:
1. Vérifier que `dirHandle` est passé correctement
2. Vérifier les permissions du File System Access API
3. Vérifier que le callback `onSave` est appelé
4. Vérifier la console pour les erreurs

### Les positions ne fonctionnent pas

**Problème**: L'image ne s'affiche pas à la bonne position

**Solutions**:
1. Vérifier que `ContentWithImage` est utilisé
2. Vérifier les styles CSS (flex, grid)
3. Vérifier le breakpoint responsive (sm:, md:)
4. Tester avec différentes tailles d'écran

---

## 📝 Checklist d'intégration

- [ ] Importer le composant approprié
- [ ] Passer les props requises (images, onSave, onClose)
- [ ] Implémenter le callback `onSave` pour persister les données
- [ ] Ajouter un bouton pour ouvrir le gestionnaire
- [ ] Tester l'ajout d'image
- [ ] Tester l'édition d'image
- [ ] Tester la suppression d'image
- [ ] Tester le remplacement de fichier
- [ ] Vérifier l'accessibilité (alt text)
- [ ] Vérifier le responsive (mobile, tablette, desktop)

---

## 🎓 Ressources

- **Composants**: 
  - `Smart chapter v1/components/ImageManagerV2.tsx`
  - `components/ImageManagerModern.tsx`
- **Types**: Voir les interfaces dans les fichiers
- **Exemples**: Voir les exemples d'utilisation ci-dessus
- **Support**: Consultez le code source pour plus de détails

---

**Dernière mise à jour**: Novembre 2025
**Version**: 2.0
**Auteur**: Math-Pedago Team

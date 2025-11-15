# Smart Chapter Manager v1

##  Vue d'ensemble

Smart Chapter Manager v1 - Éditeur web moderne pour chapitres pédagogiques
-  Interface React 19 + TypeScript
-  ImageManagerV2 (système d'images optimisé)
-  File System Access API
-  Multi-classes (1BSM, 2BSE, TCS, etc.)

##  Démarrage

### Installation
```bash
cd "Smart chapter v1"
npm install
```

### Développement
```bash
npm run dev
# http://localhost:3000
```

##  Configuration

**Port**: 3000 (fixe pour éviter conflits avec app principale sur 5173)

**Env**: Créez .env.local
```env
GEMINI_API_KEY=your_key
```

##  Nettoyage effectué

Fichiers obsolètes supprimés:
-  ImageManager.tsx
-  ImageUploadModal.tsx  
-  LessonEditor_old.tsx

 Utilise ImageManagerV2.tsx (moderne)

##  Documentation

- GUIDE_UTILISATION.md
- AMELIORATIONS.md
- ../docs/IMAGE_SYSTEM_GUIDE.md

---
Version 1.0.0 | React 19 + Vite + TypeScript

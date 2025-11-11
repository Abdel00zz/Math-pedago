# 📁 Structure du Projet Math-Pedago

## 🎯 Vue d'ensemble

Ce dépôt contient **trois versions complètement séparées et indépendantes** de Math-Pedago :

```
Math-pedago/
├── math-pedago-nextjs/       ⭐ VERSION MODERNE (Next.js 15 + shadcn/ui)
├── Smart chapter v1/          📚 VERSION ORIGINALE (Vite + React)
├── shadcnv1/                  💾 BACKUP de la version Next.js
└── [Fichiers originaux...]    🔧 Scripts et outils Python
```

---

## ⭐ Version 1: Math-Pedago Next.js (VERSION RECOMMANDÉE)

**📂 Emplacement**: `/math-pedago-nextjs/`

### Caractéristiques
- ✅ **100% séparée et autonome** - Aucune dépendance sur les autres versions
- ✅ **Technologies ultra-modernes**:
  - Next.js 15 avec App Router
  - React 19
  - TypeScript 5.7
  - shadcn/ui + Radix UI
  - Tailwind CSS 3.4
  - Framer Motion (animations fluides)
  - Zustand (state management)
  - TanStack Query (server state)
- ✅ **Architecture optimisée**:
  - Performance hooks personnalisés
  - Error boundaries
  - Loading states et skeletons
  - Dark mode avec next-themes
  - Animations GPU-accélérées

### Lancer cette version

```bash
cd math-pedago-nextjs
npm install     # Première fois seulement
npm run dev     # Développement
```

Ou utilisez le script de démarrage :

```bash
cd math-pedago-nextjs
./start.sh
```

**URL**: http://localhost:3000

### Documentation complète
- 📖 `math-pedago-nextjs/README.md` - Guide de démarrage
- 🏗️ `math-pedago-nextjs/ARCHITECTURE_V2.md` - Architecture détaillée
- ⚡ `math-pedago-nextjs/OPTIMIZATIONS.md` - Optimisations et performances

---

## 📚 Version 2: Smart Chapter V1 (Version Originale)

**📂 Emplacement**: `/Smart chapter v1/`

### Caractéristiques
- Technologies: Vite + React + TypeScript
- Application SPA classique
- Système de leçons avec JSON
- Interface Lucide React

### Lancer cette version

```bash
cd "Smart chapter v1"
npm install
npm run dev
```

**URL**: http://localhost:5173 (port Vite)

---

## 💾 Version 3: shadcnv1 (Backup)

**📂 Emplacement**: `/shadcnv1/`

Cette version est une **sauvegarde** de la version Next.js. Elle est identique à `math-pedago-nextjs/` mais conservée pour historique.

---

## 🔧 Fichiers Racine

Le dossier racine contient:
- **Scripts Python**: `admin_app.py`, `optimize_structure.py`, etc.
- **Scripts Batch**: `*.bat` pour Windows
- **Dossiers de données**: `api/`, `data/`, `PDF/`, `public/`
- **Documentation**: Guides et documentation générale

---

## 🚀 Quelle version utiliser ?

### Pour le développement moderne ⭐

👉 **Utilisez `math-pedago-nextjs/`**

C'est la version la plus avancée avec:
- Meilleures performances
- UI moderne et fluide
- Architecture scalable
- Technologies à jour

### Pour la compatibilité legacy 📚

👉 **Utilisez `Smart chapter v1/`**

Si vous avez besoin de la version originale Vite.

---

## ✅ Séparation Complète (100%)

### Indépendance garantie

Chaque version est **complètement autonome**:

1. **Zéro dépendance croisée**: Aucune version n'importe de fichiers d'une autre
2. **node_modules séparés**: Chaque version a ses propres dépendances
3. **Configurations séparées**: Configs TypeScript, ESLint, etc. indépendantes
4. **Builds séparés**: Les builds ne se chevauchent pas

### Test de séparation

Pour vérifier qu'il n'y a aucune dépendance:

```bash
# Test: Build de la version Next.js sans les autres dossiers
cd math-pedago-nextjs
npm run build  # ✅ Devrait fonctionner sans erreur
```

---

## 📊 Comparaison des Versions

| Fonctionnalité | Next.js (math-pedago-nextjs) | Vite (Smart chapter v1) |
|----------------|------------------------------|-------------------------|
| **Framework** | Next.js 15 | Vite + React |
| **React** | 19 | 18 |
| **TypeScript** | 5.7 | 5.x |
| **UI Library** | shadcn/ui + Radix | Lucide React |
| **Styling** | Tailwind CSS 3.4 | CSS/Tailwind |
| **State** | Zustand + TanStack Query | React State |
| **Animations** | Framer Motion | Basique |
| **SSR** | ✅ Oui | ❌ Non (SPA) |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Modernité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🛠️ Commandes Utiles

### Version Next.js (Recommandé)

```bash
cd math-pedago-nextjs

# Développement
npm run dev           # Lancer en dev avec Turbopack
npm run build         # Build de production
npm start             # Lancer en production

# Tests et qualité
npm run lint          # ESLint
npm run type-check    # Vérification TypeScript
npm run format        # Prettier
```

### Version Vite (Originale)

```bash
cd "Smart chapter v1"

npm run dev           # Lancer en dev
npm run build         # Build de production
```

---

## 📝 Notes Importantes

### Ne PAS confondre les versions

Chaque version tourne sur un **port différent**:
- **Next.js**: http://localhost:3000
- **Vite**: http://localhost:5173

Si vous voyez "Smart Chapter Manager" au lieu de "Math-Pedago", c'est que vous avez lancé la mauvaise version!

### Tuer les processus

Pour éviter les conflits de ports:

```bash
# Tuer tous les processus Node
pkill -f node

# Ou spécifiquement
pkill -f "node.*next"   # Next.js
pkill -f "node.*vite"   # Vite
```

---

## 📧 Support

Pour toute question sur:
- **Version Next.js**: Consultez `math-pedago-nextjs/README.md`
- **Version originale**: Consultez `Smart chapter v1/README.md`

---

**✨ Dernière mise à jour**: Version séparée créée le 11 novembre 2025

**🎯 Recommandation**: Utilisez `math-pedago-nextjs/` pour tous les nouveaux développements!

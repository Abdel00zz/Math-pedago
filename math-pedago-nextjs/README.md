# 🚀 Math-Pedago V2 - Next.js Edition

## ⭐ Version 100% Séparée et Autonome

**Cette version est complètement indépendante!**
- ✅ Zéro dépendance sur d'autres dossiers
- ✅ Dependencies propres (`node_modules` séparés)
- ✅ Configuration autonome
- ✅ Build indépendant

## ⚠️ Important

**Cette application utilise Next.js 15, PAS Vite!**

Cette version est **séparée** des autres versions:
- 📂 Vous êtes dans: `/math-pedago-nextjs/` (cette version)
- 📚 Version originale: `../Smart chapter v1/` (Vite)
- 💾 Backup: `../shadcnv1/` (sauvegarde)

## ✅ Démarrage Rapide

### 1. Installation (première fois seulement)
```bash
# Assurez-vous d'être dans le dossier math-pedago-nextjs
cd math-pedago-nextjs

# Installer les dépendances
npm install
```

### 2. Lancer en développement
```bash
npm run dev
```

Ou utilisez le script de démarrage:
```bash
./start.sh
```

### 3. Ouvrir dans le navigateur
```
http://localhost:3000
```

Vous devriez voir:
- **Titre**: "Math-Pedago | Plateforme Éducative de Mathématiques"
- **Page d'accueil**: Design moderne avec shadcn/ui
- **Menu**: Dashboard, Leçons, Quiz, Exercices, Vidéos

## 🔧 Autres Commandes

```bash
# Build de production
npm run build

# Lancer en production
npm start

# Vérifier les types
npm run type-check

# Linter
npm run lint

# Formater le code
npm run format
```

## 📊 Vérifier que c'est bien Next.js

Après `npm run dev`, vous devriez voir dans le terminal:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

## 🚫 Si vous voyez "Smart Chapter Manager"

C'est que vous avez lancé la mauvaise version! Pour corriger:

1. **Tuer tous les processus Node**:
   ```bash
   pkill -f node
   ```

2. **Relancer depuis CE dossier**:
   ```bash
   cd /home/user/Math-pedago/math-pedago-nextjs
   npm run dev
   ```

3. **Vérifier l'URL**: Doit être `http://localhost:3000`

## 📁 Structure de Cette Version

```
math-pedago-nextjs/       ← DOSSIER AUTONOME
├── src/
│   ├── app/             ← Application Next.js
│   │   ├── (platform)/ ← Routes de la plateforme
│   │   │   ├── dashboard/
│   │   │   ├── lessons/
│   │   │   ├── quiz/
│   │   │   ├── exercises/
│   │   │   ├── videos/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/          ← 13 composants shadcn/ui
│   │   ├── layouts/     ← Sidebar, Header
│   │   └── shared/      ← ErrorBoundary, LoadingSpinner...
│   ├── lib/
│   │   ├── hooks/       ← 5 hooks de performance
│   │   ├── utils/
│   │   └── constants/
│   ├── store/           ← Zustand stores
│   └── types/
├── public/              ← Assets statiques
├── package.json         ← Dependencies Next.js
├── next.config.js       ← Config Next.js
├── start.sh             ← Script de démarrage
└── README.md            ← Ce fichier
```

## ✨ Fonctionnalités

### Interface Utilisateur
- 🎨 **Dashboard interactif** avec animations Framer Motion fluides
- 🌓 **Dark mode** natif avec next-themes
- 📱 **Design responsive** pour tous les appareils
- ✨ **Composants modernes** shadcn/ui + Radix UI
- 🎬 **Animations GPU-accélérées** pour une UX premium

### Fonctionnalités Pédagogiques
- 📚 **Leçons interactives** avec rendu LaTeX (KaTeX)
- 🧠 **Quiz intelligents** avec feedback instantané
- ✍️ **Exercices pratiques** avec indices et corrections
- 🎥 **Capsules vidéo** YouTube intégrées
- 📊 **Suivi de progression** personnalisé

### Architecture Technique
- ⚡ **Performance optimale** avec Next.js 15 + Turbopack
- 🎯 **Hooks personnalisés**: useMounted, useDebounce, useIntersectionObserver...
- 🛡️ **Error boundaries** pour une expérience sans crash
- 💀 **Loading states** avec Skeletons élégants
- 💾 **State management** avec Zustand + localStorage
- 🔔 **Toasts modernes** avec Sonner
- ♿ **Accessible** (WCAG 2.1 AA)

## 📚 Stack Technique

- **Framework**: Next.js 15 (App Router, Server Components, Turbopack)
- **UI**: React 19 + TypeScript 5.7
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Animations**: Framer Motion
- **Math**: KaTeX + react-katex
- **Validation**: Zod
- **Forms**: React Hook Form

## 📖 Documentation Complémentaire

- 🏗️ [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) - Architecture détaillée
- ⚡ [OPTIMIZATIONS.md](./OPTIMIZATIONS.md) - Guide d'optimisation
- 📋 [../STRUCTURE.md](../STRUCTURE.md) - Structure complète du projet

---

## 💡 Indépendance Garantie

Cette version est **100% autonome**:
- ✅ Aucun import depuis `../Smart chapter v1/`
- ✅ Aucun import depuis `../shadcnv1/`
- ✅ Tous les chemins utilisent `@/*` (aliases TypeScript internes)
- ✅ Build et run complètement indépendants

---

**✨ Profitez de Math-Pedago V2 avec Next.js!**

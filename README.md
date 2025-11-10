# Math-Pedago V2.0 🚀

Plateforme éducative ultra-moderne pour l'apprentissage des mathématiques, construite avec les dernières technologies web.

## ✨ Stack Technique

- **Framework**: Next.js 15 (App Router, Server Components, Turbopack)
- **UI**: React 19 + TypeScript 5.7
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Animations**: Framer Motion
- **Math Rendering**: KaTeX
- **Validation**: Zod
- **Forms**: React Hook Form

## 🎯 Fonctionnalités

- 📚 **Leçons interactives** avec rendu LaTeX et table des matières
- 🧠 **Quiz intelligents** avec feedback instantané
- ✍️ **Exercices pratiques** avec indices et corrections détaillées
- 🎥 **Capsules vidéo** YouTube intégrées
- 📊 **Suivi de progression** avec analytics
- 🎨 **Mode sombre** natif
- 📱 **Design responsive** pour tous les appareils
- ⚡ **Performance optimale** avec Next.js 15
- ♿ **Accessible** (WCAG 2.1 AA)

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

### Scripts disponibles

```bash
npm run dev          # Démarrer en mode développement avec Turbopack
npm run build        # Build de production
npm run start        # Démarrer le serveur de production
npm run lint         # Linter le code
npm run type-check   # Vérifier les types TypeScript
npm run format       # Formater le code avec Prettier
npm test             # Lancer les tests unitaires
npm run test:e2e     # Lancer les tests E2E
```

## 📁 Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── (platform)/        # Groupe de routes plateforme
│   │   ├── dashboard/
│   │   ├── lessons/
│   │   ├── quiz/
│   │   ├── exercises/
│   │   ├── videos/
│   │   ├── progress/
│   │   └── settings/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/            # Composants réutilisables
│   ├── ui/               # shadcn/ui components
│   ├── layouts/          # Layouts (sidebar, header)
│   └── shared/           # Composants partagés
│
├── features/             # Modules par fonctionnalité
│   ├── lessons/
│   ├── quiz/
│   ├── exercises/
│   ├── videos/
│   └── progress/
│
├── lib/                  # Utilitaires
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── schemas/
│
├── store/               # State management (Zustand)
│   ├── use-progress-store.ts
│   ├── use-settings-store.ts
│   └── use-notification-store.ts
│
└── types/               # Types TypeScript globaux
    └── index.ts
```

## 🎨 Architecture

Le projet suit une architecture **Feature-Sliced Design** avec:

- ✅ Séparation claire des responsabilités
- ✅ Modules autonomes par fonctionnalité
- ✅ State management avec Zustand (léger et performant)
- ✅ Server Components + Client Components
- ✅ Type safety avec TypeScript strict
- ✅ Composants UI accessibles avec Radix UI
- ✅ Système de design cohérent avec shadcn/ui

## 🔧 Configuration

### Thèmes

Le système de thèmes utilise `next-themes` avec support automatique du mode sombre/clair.

### Variables CSS

Les couleurs et styles sont configurables via CSS variables dans `globals.css`.

## 📊 State Management

- **Zustand** pour l'état global (settings, progress, notifications)
- **TanStack Query** pour le server state et le caching
- **React Hook Form** pour les formulaires
- **localStorage** pour la persistance

## 🎯 Niveaux supportés

- TCS - Tronc Commun Scientifique
- 1BSE - 1ère Bac Sciences Expérimentales
- 1BSM - 1ère Bac Sciences Mathématiques
- 2BSE - 2ème Bac Sciences Expérimentales
- 2BSM - 2ème Bac Sciences Mathématiques
- 2BECO - 2ème Bac Sciences Économiques

## 🤝 Contribution

Les contributions sont les bienvenues! Voir [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) pour les détails d'architecture.

## 📝 License

Copyright © 2024 Math-Pedago Team

---

Construit avec ❤️ en utilisant les meilleures technologies modernes

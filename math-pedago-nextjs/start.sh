#!/bin/bash

# Script pour lancer Math-Pedago V2 Next.js (version 100% séparée)

echo "🚀 Démarrage de Math-Pedago V2 Next.js..."
echo "📂 Version séparée et autonome"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "next.config.js" ]; then
    echo "❌ Erreur: Ce script doit être lancé depuis le dossier math-pedago-nextjs"
    echo "   Dossier actuel: $(pwd)"
    exit 1
fi

# Tuer les anciens processus
echo "🔄 Arrêt des anciens processus Node..."
pkill -f "node.*next" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
sleep 1

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo ""
echo "✅ Lancement de l'application Next.js..."
echo "📍 URL: http://localhost:3000"
echo "⏹️  Pour arrêter: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lancer Next.js
npm run dev

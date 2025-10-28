import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { MathJaxContext } from 'better-react-mathjax';
import ErrorBoundary from './components/ErrorBoundary';
import './src/styles/typography.css';

/**
 * Configuration MathJax optimisée pour harmonisation parfaite avec le texte
 *
 * AMÉLIORATIONS:
 * - Scale ajusté à 1.0 pour correspondre exactement à la taille du texte
 * - Héritage des polices pour intégration transparente
 * - Rendu SVG pour qualité optimale à toutes les résolutions
 * - Cache global pour performances
 */
const config = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    // Support des macros LaTeX courantes
    macros: {
      RR: '{\\mathbb{R}}',
      NN: '{\\mathbb{N}}',
      ZZ: '{\\mathbb{Z}}',
      QQ: '{\\mathbb{Q}}',
      CC: '{\\mathbb{C}}',
    },
    // Package AMS pour symboles mathématiques avancés
    packages: ['base', 'ams', 'noerrors', 'noundefined']
  },
  svg: {
    fontCache: 'global',
    scale: 1.0, // Échelle 1:1 avec le texte - CSS typography.css gère le sizing
    minScale: 0.8,
    mtextInheritFont: true, // Hérite Inter/Plus Jakarta Sans
    merrorInheritFont: true,
    mathmlSpacing: false,
    displayAlign: 'center',
    displayIndent: '0',
    // Optimisations visuelles
    exFactor: 0.5, // Taille des indices/exposants
    blacker: 0, // Épaisseur des traits (0 = défaut)
    internalSpeechTitles: false // Pas de titres interne (perf)
  },
  chtml: {
    scale: 1.0,
    matchFontHeight: true, // Match avec hauteur du texte
    mtextInheritFont: true,
    merrorInheritFont: true,
    // Adaptation responsive
    adaptiveCSS: true,
    // Largeur minimale pour display math
    minWidth: '100%'
  },
  options: {
    enableMenu: false, // Désactive menu contextuel MathJax
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    processHtmlClass: 'formatted-text', // Ne traite que nos composants
    renderActions: {
      addMenu: [],
      checkLoading: []
    },
    // Amélioration de la performance
    compileCache: {
      maxSize: 100 // Cache pour expressions compilées
    }
  },
  // Configuration du loader
  loader: {
    load: ['[tex]/ams', '[tex]/noerrors', '[tex]/noundefined']
  }
};

// Wait for the DOM to be fully loaded before mounting the app
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
            <MathJaxContext version={3} config={config}>
                <NotificationProvider>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </NotificationProvider>
            </MathJaxContext>
        </ErrorBoundary>
      </React.StrictMode>
    );
});
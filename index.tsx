import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { MathJaxContext } from 'better-react-mathjax';
import ErrorBoundary from './components/ErrorBoundary';

const config = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: {
    fontCache: 'global',
    scale: 0.95, // Reduced for more compact math display
    minScale: 1,
    mtextInheritFont: true, // Inherit font from surrounding text for better integration
    merrorInheritFont: true,
    mathmlSpacing: false,
    displayAlign: 'center',
    displayIndent: '0'
  },
  chtml: {
    scale: 0.95,
    matchFontHeight: true, // Match the height of surrounding text
    mtextInheritFont: true,
    merrorInheritFont: true
  },
  options: {
    enableMenu: false, // Disable MathJax context menu for cleaner UX
    renderActions: {
      addMenu: [],
      checkLoading: []
    }
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
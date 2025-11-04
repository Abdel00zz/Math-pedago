import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { diagnoseMathJax } from './utils/mathJaxDiagnostic';
import './src/styles/main-theme.css';

// Exposer le diagnostic MathJax globalement
if (typeof window !== 'undefined') {
    (window as any).diagnoseMathJax = diagnoseMathJax;
    console.log('🔍 Diagnostic MathJax chargé! Tapez: window.diagnoseMathJax()');
}

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
            <NotificationProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </NotificationProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
});
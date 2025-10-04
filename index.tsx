import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { MathJaxContext } from 'better-react-mathjax';
import ErrorBoundary from './components/ErrorBoundary';

const config = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']]
  },
  svg: {
    fontCache: 'global',
    scale: 0.9
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
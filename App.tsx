import React, { useEffect } from 'react';
import { useAppState } from './context/AppContext';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import ChapterHubView from './components/views/ChapterHubView';
import ActivityView from './components/views/ActivityView';
import { Notifications } from './components/Notifications';
import { usePWANotifications } from './hooks/usePWANotifications';

const App: React.FC = () => {
    const state = useAppState();
    const { requestPermission, isSupported } = usePWANotifications();

    // Demander la permission pour les notifications au démarrage
    useEffect(() => {
        const initializePWA = async () => {
            if (isSupported) {
                // Demander la permission après un court délai pour une meilleure UX
                setTimeout(async () => {
                    const granted = await requestPermission();
                    if (granted) {
                        console.log('Notifications PWA activées');
                    }
                }, 2000);
            }
        };

        initializePWA();
    }, [isSupported, requestPermission]);

    const renderView = () => {
        switch (state.view) {
            case 'login':
                return <LoginView />;
            case 'dashboard':
                return <DashboardView />;
            case 'work-plan':
                return <ChapterHubView />;
            case 'activity':
                return <ActivityView />;
            default:
                return <LoginView />;
        }
    };
    
    return (
        <div className="bg-background text-text min-h-screen font-sans">
            <main className="p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
            <Notifications />
        </div>
    );
};

export default App;
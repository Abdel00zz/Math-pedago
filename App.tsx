import React from 'react';
import { useAppState } from './context/AppContext';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import ChapterHubView from './components/views/ChapterHubView';
import ActivityView from './components/views/ActivityView';
import ConcoursView from './components/views/ConcoursView';
import ConcoursListView from './components/views/ConcoursListView';
import ConcoursResumeView from './components/views/ConcoursResumeView';
import ConcoursQuizView from './components/views/ConcoursQuizView';
import { Notifications } from './components/Notifications';
import MobileOrientationPrompt from './components/MobileOrientationPrompt';

const App: React.FC = () => {
    const state = useAppState();

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
            case 'concours':
                return <ConcoursView />;
            case 'concours-list':
                return <ConcoursListView />;
            case 'concours-resume':
                return <ConcoursResumeView />;
            case 'concours-quiz':
                return <ConcoursQuizView />;
            default:
                return <LoginView />;
        }
    };
    
    return (
        <div className="app-shell font-sans">
            <main className="app-shell__main">
                {renderView()}
            </main>
            <Notifications />
            <MobileOrientationPrompt />
        </div>
    );
};

export default App;
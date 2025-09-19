import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import ChapterHubView from './components/views/ChapterHubView';
import ActivityView from './components/views/ActivityView';
import { Notifications } from './components/Notifications';
import OrientationGuide from './components/OrientationGuide';
import GlobalWorkSubmit from './components/GlobalWorkSubmit';

const App: React.FC = () => {
    const { state } = useContext(AppContext);

    const renderView = () => {
        switch (state.view) {
            case 'login':
                return <LoginView />;
            case 'dashboard':
                return <DashboardView />;
            case 'chapter-hub':
                return <ChapterHubView />;
            case 'activity':
                return <ActivityView />;
            default:
                return <LoginView />;
        }
    };

    return (
        <div className="bg-background text-text-primary min-h-screen font-sans">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 relative z-10">
                {state.profile && <GlobalWorkSubmit />}
                {renderView()}
            </main>
            <Notifications />
            <OrientationGuide />
        </div>
    );
};

export default App;
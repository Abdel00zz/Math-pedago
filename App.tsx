import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import ChapterHubView from './components/views/ChapterHubView';
import ActivityView from './components/views/ActivityView';
import { Notifications } from './components/Notifications';

const AppBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden opacity-15" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="text-primary/50">
            <defs>
                 <style>
                    {`
                        @keyframes draw {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                        .path-flow {
                            stroke-dasharray: 1000;
                            stroke-dashoffset: 1000;
                            animation: draw 60s linear infinite;
                        }
                    `}
                </style>
            </defs>
            
            {/* <!-- Animated Flowing Lines --> */}
            <path d="M-5% 10% Q 20% 25%, 45% 50% T 80% 80% L 105% 90%" stroke="currentColor" strokeWidth="0.5" fill="none" className="path-flow" style={{animationDuration: '75s'}} />
            <path d="M105% 5% Q 80% 30%, 50% 55% T 15% 75% L -5% 85%" stroke="currentColor" strokeWidth="0.3" fill="none" className="path-flow" style={{animationDuration: '50s', animationDirection: 'reverse'}} />

            {/* <!-- Famous Formulas --> */}
            <text x="10%" y="20%" fontFamily="serif" fontSize="22" fill="currentColor" transform="rotate(-10 150 150)">
                {'$e^{i\\pi} + 1 = 0$'}
            </text>
            <text x="65%" y="15%" fontFamily="sans-serif" fontSize="18" fill="currentColor" transform="rotate(5 900 100)">
                 {'$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$'}
            </text>
            <text x="5%" y="85%" fontFamily="sans-serif" fontSize="20" fill="currentColor" transform="rotate(8 100 800)">
                {'$f(x) = a_0 + \\sum_{n=1}^{\\infty} (a_n \\cos(nx) + b_n \\sin(nx))$'}
            </text>
             <text x="70%" y="80%" fontFamily="serif" fontSize="24" fill="currentColor" transform="rotate(-5 1100 750)">
                {'$i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi$'}
            </text>

            {/* <!-- Geometric Elements --> */}
            <g transform="translate(85%, 40%) scale(0.8) rotate(15)" stroke="currentColor" strokeWidth="0.8" fill="none">
                {/* Dodecahedron wireframe */}
                <path d="M 0 -50 L 47.55 -15.45 L 29.39 40.45 L -29.39 40.45 L -47.55 -15.45 Z" />
                <path d="M 0 -20 L 19.02 -6.18 L 11.76 16.18 L -11.76 16.18 L -19.02 -6.18 Z" />
                <path d="M 0 -50 L 0 -20 M 47.55 -15.45 L 19.02 -6.18 M 29.39 40.45 L 11.76 16.18 M -29.39 40.45 L -11.76 16.18 M -47.55 -15.45 L -19.02 -6.18" />
            </g>

            <circle cx="20%" cy="55%" r="50" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="5 5"/>
            <circle cx="20%" cy="55%" r="30" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
    </div>
);


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
            <AppBackground />
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                {renderView()}
            </main>
            <Notifications />
        </div>
    );
};

export default App;
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const OrientationGuide: React.FC = () => {
    const { state } = useContext(AppContext);
    const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show modal only on activity view, on mobile, in portrait mode
    if (state.view !== 'activity' || !isMobile || !isPortrait) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-[9999] p-2 animate-fadeIn">
            <div className="bg-white rounded-lg p-3 text-center max-w-[200px] mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl text-blue-500 mb-1">screen_rotation</span>
                <h3 className="text-base font-bold text-slate-800 mb-0.5">Mode paysage</h3>
                <p className="text-xs text-slate-600 font-fira">
                    Pivotez pour une meilleure vue
                </p>
            </div>
        </div>
    );
};

export default OrientationGuide;
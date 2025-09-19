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
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-[9999] p-8 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 text-center max-w-xs mx-auto shadow-2xl">
                <span className="material-symbols-outlined text-6xl text-blue-500 mb-4">screen_rotation</span>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Une meilleure expérience</h3>
                <p className="text-slate-600">
                    Pour profiter pleinement du contenu, veuillez faire pivoter votre appareil en mode paysage.
                </p>
            </div>
        </div>
    );
};

export default OrientationGuide;
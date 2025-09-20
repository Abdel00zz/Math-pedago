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

    // Show modal only on mobile, in landscape mode
    if (!isMobile || isPortrait) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-[9999] p-2 animate-fadeIn">
            <div className="text-center">
                <h3 className="text-base font-bold text-white mb-0.5">Mode portrait recommandé</h3>
                <p className="text-xs text-slate-300 font-fira">
                    Pour une meilleure expérience, veuillez pivoter votre appareil.
                </p>
            </div>
        </div>
    );
};

export default OrientationGuide;
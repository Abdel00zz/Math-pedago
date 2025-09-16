import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { CLASS_OPTIONS } from '../../constants';

const LoginBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-5" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="math-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                    <text x="10" y="30" fontFamily="Fira Sans, sans-serif" fontSize="12" fill="#1f2937">∫(x)dx</text>
                    <text x="100" y="70" fontFamily="Fira Sans, sans-serif" fontSize="14" fill="#1f2937">E=mc²</text>
                    <text x="20" y="150" fontFamily="Fira Sans, sans-serif" fontSize="16" fill="#1f2937">α+β=γ</text>
                    <text x="150" y="180" fontFamily="Fira Sans, sans-serif" fontSize="10" fill="#1f2937">ƒ(x)=ax²+bx+c</text>
                    <text x="80" y="120" fontFamily="Fira Sans, sans-serif" fontSize="18" fill="#1f2937">π</text>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#math-pattern)" />
        </svg>
    </div>
);

const LoginView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { addNotification } = useNotification();
    const [name, setName] = useState('');
    const [classId, setClassId] = useState(CLASS_OPTIONS[0].value);

    const handleLogin = () => {
        if (!name.trim()) {
            addNotification("Veuillez entrer votre nom.", "error");
            return;
        }
        dispatch({ type: 'LOGIN', payload: { name: name.trim(), classId } });
    };

    const handleContinue = () => {
        if(state.profile) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
        }
    }
    
    const loggedInView = (
        <>
            <div className="text-center">
                 <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-primary/10 rounded-full">
                    <span className="text-6xl">🦉</span>
                </div>
                <h2 className="text-3xl font-bold text-dark-gray font-serif">Bienvenue !</h2>
                <p className="mt-2 text-secondary">Continuer en tant que :</p>
                <p className="mt-4 text-2xl font-bold text-primary">{state.profile?.name}</p>
                <p className="text-sm text-secondary">{CLASS_OPTIONS.find(c => c.value === state.profile?.classId)?.label}</p>
            </div>
            <div className="pt-4">
                <button
                    onClick={handleContinue}
                    className="w-full px-4 py-3 font-bold text-white bg-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:-translate-y-1 active:scale-95"
                >
                    Continuer
                </button>
            </div>
        </>
    );

    const loggedOutView = (
         <>
            <div className="text-center">
                 <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-primary/10 rounded-full">
                    <span className="text-6xl">🦉</span>
                </div>
                <h2 className="text-3xl font-bold text-primary font-serif">
                    Bienvenue sur Pédago Maths
                </h2>
                <p className="text-xl text-secondary mt-2 leading-tight max-w-xs mx-auto">
                    Évaluez vos compétences, entraînez-vous et maîtrisez chaque défi.
                </p>
            </div>
            <div className="space-y-6">
                <div>
                    <label htmlFor="student-name" className="block text-sm font-medium text-dark-gray">Nom complet</label>
                    <input
                        type="text"
                        id="student-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Ex: Marie Curie"
                        className="w-full px-3 py-2 mt-1 text-dark-gray bg-light-gray/50 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="class-selector" className="block text-sm font-medium text-dark-gray">Votre classe</label>
                    <select
                        id="class-selector"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-dark-gray bg-light-gray/50 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        {CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full px-4 py-3 font-bold text-white bg-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:-translate-y-1 active:scale-95"
                >
                    Accéder à mes activités
                </button>
            </div>
        </>
    );

    return (
        <div className="flex items-center justify-center min-h-screen sm:-mt-20">
            <div className="relative w-full max-w-md p-8 space-y-8 bg-card-bg rounded-2xl shadow-lg animate-slideInUp overflow-hidden">
                <LoginBackground />
                <div className="relative z-10">
                    {state.profile ? loggedInView : loggedOutView}
                </div>
            </div>
        </div>
    );
};

export default LoginView;
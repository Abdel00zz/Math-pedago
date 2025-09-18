import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { CLASS_OPTIONS } from '../../constants';

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

                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Bienvenue !</h2>
                <p className="text-gray-600 mb-4">Continuer en tant que :</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{state.profile?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{CLASS_OPTIONS.find(c => c.value === state.profile?.classId)?.label}</p>
                </div>
            </div>
            <div className="pt-2">
                <button
                    onClick={handleContinue}
                    className="w-full px-6 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
                    Continuer
                </button>
            </div>
        </>
    );

    const loggedOutView = (
         <>
            <div className="text-center mb-8">

                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Connexion</h2>
                <p className="text-gray-600 text-sm">Accédez à votre espace d'apprentissage</p>
            </div>
            <div className="space-y-6">
                <div>
                    <label htmlFor="student-name" className="block text-sm font-semibold text-gray-700 mb-3">Nom complet</label>
                    <input
                        type="text"
                        id="student-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Entrez votre nom"
                        className="w-full px-4 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    />
                </div>
                <div>
                    <label htmlFor="class-selector" className="block text-sm font-semibold text-gray-700 mb-3">Votre classe</label>
                    <select
                        id="class-selector"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full px-4 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    >
                        {CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full px-6 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
Commencer l'aventure
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex min-h-screen">
                {/* Section Image - Partie gauche */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 text-center text-white px-8">
                        <div className="mb-8">
                            <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="text-8xl">🦉</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                Pédago Math - Votre succès commence ici !
                            </h1>
                            <p className="text-xl text-blue-100 mb-6">
                                Transformez votre apprentissage des mathématiques avec nos 4 piliers fondamentaux
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-lg font-semibold">
                                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                                    <span className="text-yellow-300">✨</span> Motiver
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                                    <span className="text-green-300">📈</span> Progresser
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                                    <span className="text-blue-300">💎</span> Enrichir
                                </div>
                                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                                    <span className="text-purple-300">🏗️</span> Consolider
                                </div>
                            </div>
                        </div>
                        
                        {/* Éléments décoratifs */}
                        <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-32 right-16 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
                        <div className="absolute top-1/2 right-8 w-12 h-12 bg-pink-300/20 rounded-full animate-pulse delay-1000"></div>
                        

                    </div>
                </div>
                
                {/* Section Connexion - Partie droite */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md relative">
                        <header className="text-center mb-2 pt-4">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                Pédago Math
                            </h1>
                            <p className="text-gray-600 text-sm font-medium">
                                Excellez en mathématiques avec passion et détermination.
                            </p>
                        </header>
                        
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative backdrop-blur-sm">

                            
                            <div className="mt-4">
                                {state.profile ? loggedInView : loggedOutView}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
     );
};

export default LoginView;
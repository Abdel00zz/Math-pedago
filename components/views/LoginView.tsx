import React, { useState, FormEvent, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import { Profile } from '../../types';

const LoginView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const [name, setName] = useState(state.profile?.name || '');
    const [classId, setClassId] = useState(CLASS_OPTIONS[0]?.value || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (state.profile?.name) {
            setName(state.profile.name);
        }
    }, [state.profile]);

    const hasPreloadedName = !!state.profile?.name;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!hasPreloadedName && !name.trim()) {
            setError('Veuillez entrer votre nom complet.');
            return;
        }
        if (!classId) {
            setError('Veuillez sélectionner votre classe.');
            return;
        }
        setError('');
        const profile: Profile = { name: name.trim(), classId };
        dispatch({ type: 'LOGIN', payload: profile });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn p-4 bg-gradient-to-br from-slate-50 to-blue-50/40">
            <div className="w-full max-w-md p-10 space-y-8 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/20">
                
                <div className="text-center">
                    {/* Logo carré amélioré avec effets subtils */}
                    <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center border-2 border-slate-200/80 hover:border-primary/40 p-6 px-8 rounded-xl mb-8 bg-gradient-to-br from-white to-slate-50/30 shadow-inner transition-all duration-300 group">
                        {/* Effet de brillance subtil */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500"></div>
                        
                        {/* Contenu du logo */}
                        <span className="relative font-brand text-2xl tracking-widest text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
                            Le Centre
                        </span>
                        
                        {/* Séparateur amélioré */}
                        <div className="relative flex items-center justify-center my-3">
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                            <div className="absolute w-2 h-2 bg-primary/60 rounded-full"></div>
                        </div>
                        
                        <span className="relative font-brand text-5xl text-primary font-semibold -mt-1 leading-none tracking-tight transition-all duration-300 group-hover:text-primary/90 group-hover:scale-105">
                            Scientifique
                        </span>
                        
                        {/* Points décoratifs subtils */}
                        <div className="absolute top-4 right-4 w-1 h-1 bg-primary/30 rounded-full opacity-60"></div>
                        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-primary/20 rounded-full opacity-40"></div>
                    </div>

                    {/* Messages de bienvenue améliorés */}
                    {hasPreloadedName ? (
                        <div className="mt-6 space-y-2">
                            <h2 className="text-4xl font-playfair text-slate-800 leading-tight">
                                Bon retour, <span className="text-primary font-medium">{name}</span> !
                            </h2>
                            <p className="mt-3 text-slate-600 font-garamond italic text-base leading-relaxed">
                                Veuillez sélectionner votre nouvelle classe pour continuer.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-2">
                            <h2 className="text-4xl font-playfair text-slate-800 font-medium">Bienvenue</h2>
                            <p className="mt-3 text-slate-600 font-garamond italic text-base leading-relaxed">
                                Entrez vos informations pour commencer votre parcours.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Champ nom avec améliorations subtiles */}
                    <div className="group">
                        <label htmlFor="name" className="block text-lg font-medium text-slate-700 font-garamond mb-2 transition-colors group-focus-within:text-primary">
                            Nom complet
                        </label>
                        <div className="relative">
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-2 py-3 bg-white/80 border-0 border-b-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-primary transition-all duration-300 font-garamond text-lg placeholder-slate-400 ${
                                    hasPreloadedName 
                                        ? 'bg-slate-50/80 text-slate-500 cursor-not-allowed border-b-slate-300' 
                                        : 'hover:border-slate-300 hover:bg-white'
                                }`}
                                placeholder="Entrez votre nom"
                                required
                                readOnly={hasPreloadedName}
                            />
                            {/* Indicateur de focus subtil */}
                            {!hasPreloadedName && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
                            )}
                        </div>
                    </div>

                    {/* Champ classe avec améliorations */}
                    <div className="group">
                        <label htmlFor="classId" className="block text-lg font-medium text-slate-700 font-garamond mb-2 transition-colors group-focus-within:text-primary">
                            Sélectionnez votre classe
                        </label>
                        <div className="relative">
                            <select
                                id="classId"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="w-full px-2 py-3 bg-white/80 border-0 border-b-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-primary transition-all duration-300 cursor-pointer font-garamond text-lg hover:border-slate-300 hover:bg-white appearance-none"
                                required
                            >
                                {CLASS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value} className="py-2">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {/* Flèche personnalisée */}
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                            {/* Indicateur de focus */}
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                    </div>

                    {/* Message d'erreur amélioré */}
                    {error && (
                        <div className="p-4 bg-red-50/80 border border-red-200/60 rounded-lg backdrop-blur-sm animate-slideIn">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                                <p className="text-sm text-red-700 text-center font-garamond font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Bouton submit amélioré */}
                    <button
                        type="submit"
                        className="relative w-full px-4 py-4 font-serif font-bold tracking-wider uppercase text-sm text-white bg-gradient-to-r from-primary to-primary/90 rounded-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                    >
                        {/* Effet de brillance au survol */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative">
                            {hasPreloadedName ? 'Mettre à jour' : 'Commencer maintenant'}
                        </span>
                    </button>
                </form>

                {/* Message informatif pour nouveaux utilisateurs */}
                {!hasPreloadedName && (
                    <div className="mt-8 relative p-4 bg-gradient-to-r from-slate-50/80 to-blue-50/60 rounded-lg border border-slate-200/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                               
                            </div>
                            <p className="text-base text-slate-700 font-serif leading-relaxed text-center">
                                Explorez un univers d'excellence en <strong className="font-semibold text-primary">mathématiques</strong>. Nos ressources interactives sont conçues pour votre réussite.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Styles pour les animations personnalisées */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoginView;
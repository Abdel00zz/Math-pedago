import React, { useState, FormEvent, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import { Profile } from '../../types';

const LoginView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const [name, setName] = useState(state.profile?.name || '');
    const [classId, setClassId] = useState(state.profile?.classId || CLASS_OPTIONS[0]?.value || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (state.profile?.name) {
            setName(state.profile.name);
        }
        if (state.profile?.classId) {
            setClassId(state.profile.classId);
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
        <div className="flex items-center justify-center min-h-[80vh] animate-fadeIn p-4">
            <div className="w-full max-w-md landscape:max-w-4xl bg-surface border border-border rounded-2xl shadow-claude">
                
                <div className="flex flex-col landscape:flex-row landscape:gap-10 landscape:items-center p-6 sm:p-8">
                    
                    {/* Colonne Gauche: Logo */}
                    <div className="flex-shrink-0 landscape:w-2/5 flex justify-center items-center">
                        <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center border border-border p-4 px-2 rounded-xl bg-background/50 shadow-inner group transition-all duration-300 hover:border-border-hover">
                            <span className="font-brand text-xl tracking-widest text-text-secondary transition-colors duration-300 group-hover:text-text">
                                Le Centre
                            </span>
                            <div className="w-12 h-px bg-border my-2"></div>
                            <span className="font-brand text-4xl text-primary font-semibold leading-none tracking-tight transition-all duration-300 group-hover:text-primary/90 group-hover:scale-105">
                                Scientifique
                            </span>
                        </div>
                    </div>

                    {/* Colonne Droite: Formulaire et Messages */}
                    <div className="flex-grow landscape:w-3/5 mt-6 landscape:mt-0">
                         <div className="text-center mb-8">
                            {hasPreloadedName ? (
                                <>
                                    <h2 className="text-4xl font-playfair text-text leading-tight">
                                        Bon retour, <span className="text-primary font-medium">{name}</span> !
                                    </h2>
                                    <p className="mt-2 text-text-secondary font-garamond italic text-base">
                                        Veuillez confirmer ou sélectionner votre classe.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-4xl font-playfair text-text font-medium">Bienvenue</h2>
                                    <p className="mt-2 text-text-secondary font-garamond italic text-base">
                                        Commencez votre parcours d'apprentissage.
                                    </p>
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-base font-medium text-text-secondary font-garamond mb-2">
                                    Nom complet
                                </label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none group-focus-within:text-primary transition-colors">
                                        person
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-50/80 border border-slate-300/70 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-garamond text-lg placeholder:text-text-disabled ${
                                            hasPreloadedName 
                                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                                                : 'hover:border-slate-400/70 hover:bg-slate-50'
                                        }`}
                                        placeholder="Votre nom et prénom"
                                        required
                                        readOnly={hasPreloadedName}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="classId" className="block text-base font-medium text-text-secondary font-garamond mb-2">
                                    Votre classe
                                </label>
                                <div className="relative group">
                                     <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none group-focus-within:text-primary transition-colors">
                                        school
                                    </span>
                                    <select
                                        id="classId"
                                        value={classId}
                                        onChange={(e) => setClassId(e.target.value)}
                                        className="w-full pl-12 pr-10 py-3 bg-slate-50/80 border border-slate-300/70 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer font-garamond text-lg hover:border-slate-400/70 hover:bg-slate-50 appearance-none"
                                        required
                                    >
                                        {CLASS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary">
                                        <span className="material-symbols-outlined text-text-disabled">unfold_more</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-error text-center font-garamond font-medium">{error}</p>
                            )}

                            <button
                                type="submit"
                                className="relative w-full px-4 py-4 font-serif font-bold tracking-wider uppercase text-sm text-white bg-primary rounded-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="relative">
                                    {hasPreloadedName ? 'Accéder à mon espace' : 'Commencer'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                {!hasPreloadedName && (
                    <div className="border-t border-border bg-background/50 p-6 rounded-b-2xl">
                         <div className="flex items-center justify-center gap-3 text-center">
                             
                            <p className="text-base text-text-secondary font-serif leading-relaxed">
                                Explorez l'excellence en <strong className="font-semibold text-text">mathématiques</strong>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginView;
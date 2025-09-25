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
        <div className="flex items-center justify-center min-h-screen animate-fadeIn p-4 bg-[#fbf9f1]">
            <div className="w-full max-w-md bg-[#fffcf5] border border-[#d7ccc8] rounded-lg shadow-xl shadow-[#5d4037]/10 p-8 sm:p-12">
                
                {/* Header: Logo */}
                <div className="text-center mb-8 border-2 border-[#a1887f]/50 p-6 rounded-lg">
                    <span className="font-brand text-5xl text-primary font-semibold tracking-tight">
                        Le Centre
                    </span>
                    <div className="w-16 h-px bg-[#d7ccc8] my-2 mx-auto"></div>
                    <span className="font-brand text-2xl tracking-widest text-[#a1887f]">
                        Scientifique
                    </span>
                </div>

                {/* Welcome Message */}
                <div className="text-center mb-10">
                    {hasPreloadedName ? (
                        <>
                            <h2 className="text-3xl font-playfair text-[#4e342e] leading-tight">
                                Bon retour, <span className="text-[#8d6e63] font-medium">{name}</span> !
                            </h2>
                            <p className="mt-2 text-[#a1887f] font-garamond italic text-base">
                                Confirmez votre classe pour continuer.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-playfair text-[#4e342e] font-medium">Bienvenue</h2>
                            <p className="mt-2 text-[#a1887f] font-garamond italic text-base">
                                Commencez votre parcours d'apprentissage.
                            </p>
                        </>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#a1887f] font-garamond mb-2">
                            Nom complet
                        </label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#a1887f]/80 pointer-events-none group-focus-within:text-[#5d4037] transition-colors">
                                drive_file_rename_outline
                            </span>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pl-8 pr-4 py-2 bg-transparent border-0 border-b-2 border-[#d7ccc8] focus:outline-none focus:border-[#8d6e63] focus:ring-0 transition-colors duration-300 font-garamond text-lg text-[#4e342e] placeholder:text-[#a1887f]/60 ${
                                    hasPreloadedName 
                                        ? 'bg-[#d7ccc8]/20 text-[#a1887f] cursor-not-allowed' 
                                        : ''
                                }`}
                                placeholder="Votre nom et prénom"
                                required
                                readOnly={hasPreloadedName}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="classId" className="block text-sm font-medium text-[#a1887f] font-garamond mb-2">
                            Votre classe
                        </label>
                        <div className="relative group">
                             <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#a1887f]/80 pointer-events-none group-focus-within:text-[#5d4037] transition-colors">
                                account_balance
                            </span>
                            <select
                                id="classId"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="w-full pl-8 pr-10 py-2 bg-transparent border-0 border-b-2 border-[#d7ccc8] focus:outline-none focus:border-[#8d6e63] focus:ring-0 transition-colors duration-300 cursor-pointer font-garamond text-lg text-[#4e342e] appearance-none"
                                required
                            >
                                {CLASS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#5d4037]">
                                <span className="material-symbols-outlined text-[#a1887f]/80">unfold_more</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-error text-center font-garamond font-medium">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-brand tracking-widest text-base text-[#fbf9f1] bg-[#5d4037] rounded-md shadow-lg shadow-[#5d4037]/20 hover:bg-[#4e342e] hover:-translate-y-px transition-all duration-300 active:scale-[0.98] mt-4"
                    >
                        {hasPreloadedName ? 'Accéder à mon espace' : 'Commencer'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginView;
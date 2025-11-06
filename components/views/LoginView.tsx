import React, { useState, FormEvent, useEffect, Dispatch, SetStateAction } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import { Profile } from '../../types';

// --- Sous-composants pour la clarté ---

const LoginHeader: React.FC = () => (
    <div className="mb-12 flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <span className="material-symbols-outlined !text-3xl leading-none">psychology_alt</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-slate-500">Centre scientifique</p>
            <h1
                className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
            >
                Mathématiques
            </h1>
            <p className="max-w-sm text-sm text-slate-500">
                Connectez-vous pour reprendre votre progression personnalisée et accéder à vos ressources.
            </p>
        </div>
    </div>
);

const WelcomeMessage: React.FC<{ hasPreloadedName: boolean; name: string }> = ({ hasPreloadedName, name }) => (
    <div className="mb-10 text-center">
        {hasPreloadedName ? (
            <>
                <h2
                    className="text-2xl font-semibold text-slate-900 sm:text-[1.7rem]"
                    style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
                >
                    Bon retour, <span className="text-slate-600 font-medium">{name}</span> !
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                    Vérifiez votre classe pour poursuivre sans perdre votre progression.
                </p>
            </>
        ) : (
            <>
                <h2
                    className="text-2xl font-semibold text-slate-900 sm:text-[1.7rem]"
                    style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
                >
                    Bienvenue
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                    Complétez les informations ci-dessous pour démarrer votre parcours d'apprentissage.
                </p>
            </>
        )}
    </div>
);

interface LoginFormProps {
    name: string;
    setName: Dispatch<SetStateAction<string>>;
    classId: string;
    setClassId: Dispatch<SetStateAction<string>>;
    error: string;
    handleSubmit: (e: FormEvent) => void;
    hasPreloadedName: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ name, setName, classId, setClassId, error, handleSubmit, hasPreloadedName }) => (
    <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
            <label
                htmlFor="name"
                className="block text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-500"
            >
                Nom complet
            </label>
            <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    drive_file_rename_outline
                </span>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-base text-slate-900 shadow-sm transition-all duration-200 focus:border-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400 ${
                        hasPreloadedName ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
                    }`}
                    placeholder="Votre nom et prénom"
                    required
                    readOnly={hasPreloadedName}
                    style={{ fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}
                />
            </div>
        </div>

        <div className="space-y-2">
            <label
                htmlFor="classId"
                className="block text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-500"
            >
                Votre classe
            </label>
            <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    account_balance
                </span>
                <select
                    id="classId"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-12 py-3 text-base text-slate-900 shadow-sm transition-all duration-200 focus:border-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    required
                    style={{ fontFamily: "'Roboto Slab', 'Roboto', serif" }}
                >
                    {CLASS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value} style={{ fontFamily: "'Roboto Slab', 'Roboto', serif" }}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined">unfold_more</span>
                </div>
            </div>
        </div>

        {error && (
            <p className="text-center text-sm font-medium text-rose-500">{error}</p>
        )}

        <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold tracking-[0.12em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_44px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-slate-900/15 active:scale-[0.99]"
            style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
        >
            {hasPreloadedName ? 'Accéder à mon espace' : 'Commencer'}
        </button>
    </form>
);


// --- Composant principal ---

const LoginView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    
    const [name, setName] = useState(state.profile?.name || '');
    const [classId, setClassId] = useState(state.profile?.classId || CLASS_OPTIONS[0]?.value || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (state.profile?.name) setName(state.profile.name);
        if (state.profile?.classId) setClassId(state.profile.classId);
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eef2ff] via-[#f7f9ff] to-white px-4 py-10 sm:px-6">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-12">
                <LoginHeader />
                <WelcomeMessage hasPreloadedName={hasPreloadedName} name={name} />
                <LoginForm
                    name={name}
                    setName={setName}
                    classId={classId}
                    setClassId={setClassId}
                    error={error}
                    handleSubmit={handleSubmit}
                    hasPreloadedName={hasPreloadedName}
                />
            </div>
        </div>
    );
};

export default LoginView;
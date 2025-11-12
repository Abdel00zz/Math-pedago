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

const WelcomeMessage: React.FC<{ hasPreloadedName: boolean; name: string; mode: 'school' | 'concours' }> = ({ hasPreloadedName, name, mode }) => (
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
                    {mode === 'concours'
                        ? 'Préparez vos concours avec des ressources ciblées et des entraînements.'
                        : 'Vérifiez votre classe pour poursuivre sans perdre votre progression.'}
                </p>
            </>
        ) : (
            <>
                <h2
                    className="text-2xl font-semibold text-slate-900 sm:text-[1.7rem]"
                    style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
                >
                    {mode === 'concours' ? 'Préparez vos concours' : 'Bienvenue'}
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                    {mode === 'concours'
                        ? 'Accédez à des résumés et quiz spécifiques pour Médecine, ENSAM et ENSA.'
                        : 'Complétez les informations ci-dessous pour démarrer votre parcours d\'apprentissage.'}
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
    mode: 'school' | 'concours';
}

const LoginForm: React.FC<LoginFormProps> = ({ name, setName, classId, setClassId, error, handleSubmit, hasPreloadedName, mode }) => {
    const schoolClassOptions = CLASS_OPTIONS.filter(opt => opt.value !== 'concours');

    return (
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

            {mode === 'school' && (
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
                            {schoolClassOptions.map(option => (
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
            )}

            {error && (
                <p className="text-center text-sm font-medium text-rose-500">{error}</p>
            )}

            <button
                type="submit"
                className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold tracking-[0.12em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_44px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-slate-900/15 active:scale-[0.99]"
                style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
            >
                {mode === 'concours' ? 'Accéder aux concours' : 'Accéder à mon espace'}
            </button>
        </form>
    );
};


// --- Composant principal ---

const LoginView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();

    const [name, setName] = useState(state.profile?.name || '');
    const [mode, setMode] = useState<'school' | 'concours'>(
        state.profile?.classId === 'concours' ? 'concours' : 'school'
    );

    // Initialiser classId avec la première classe scolaire non-concours
    const getDefaultSchoolClass = () => {
        const firstSchoolClass = CLASS_OPTIONS.find(opt => opt.value !== 'concours');
        return firstSchoolClass?.value || 'tcs';
    };

    const [classId, setClassId] = useState(
        state.profile?.classId && state.profile.classId !== 'concours'
            ? state.profile.classId
            : getDefaultSchoolClass()
    );
    const [error, setError] = useState('');

    useEffect(() => {
        if (state.profile?.name) setName(state.profile.name);
        if (state.profile?.classId) {
            if (state.profile.classId === 'concours') {
                setMode('concours');
            } else {
                setMode('school');
                setClassId(state.profile.classId);
            }
        }
    }, [state.profile]);

    const hasPreloadedName = !!state.profile?.name;

    const handleModeChange = (newMode: 'school' | 'concours') => {
        setMode(newMode);
        if (newMode === 'school') {
            // Retour au mode scolaire : réinitialiser sur une classe non-concours
            const firstSchoolClass = CLASS_OPTIONS.find(opt => opt.value !== 'concours');
            setClassId(firstSchoolClass?.value || '');
        } else {
            // Mode concours : on assignera 'concours' au submit
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!hasPreloadedName && !name.trim()) {
            setError('Veuillez entrer votre nom complet.');
            return;
        }

        // Déterminer le classId final selon le mode
        const finalClassId = mode === 'concours' ? 'concours' : classId;

        if (!finalClassId) {
            setError('Veuillez sélectionner votre classe.');
            return;
        }

        setError('');
        const profile: Profile = { name: name.trim(), classId: finalClassId };
        dispatch({ type: 'LOGIN', payload: profile });

        // Rediriger selon le mode
        if (mode === 'concours') {
            dispatch({
                type: 'CHANGE_VIEW',
                payload: { view: 'concours' }
            });
        } else {
            // Mode classe scolaire : rediriger vers le dashboard
            dispatch({
                type: 'CHANGE_VIEW',
                payload: { view: 'dashboard' }
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eef2ff] via-[#f7f9ff] to-white px-4 py-10 sm:px-6">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-12">
                <LoginHeader />

                {/* Toggle Mode avec design pill - UNIQUEMENT pour les nouveaux utilisateurs */}
                {!hasPreloadedName && (
                    <div className="mb-8 flex justify-center">
                        <div className="inline-flex rounded-full bg-slate-100/80 p-1 shadow-inner">
                            <button
                                type="button"
                                onClick={() => handleModeChange('school')}
                                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                                    mode === 'school'
                                        ? 'bg-white text-slate-900 shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                                style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="material-symbols-outlined !text-lg">school</span>
                                    Classe scolaire
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('concours')}
                                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                                    mode === 'concours'
                                        ? 'bg-white text-slate-900 shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                                style={{ fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif" }}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="material-symbols-outlined !text-lg">emoji_events</span>
                                    Préparation concours
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                <WelcomeMessage hasPreloadedName={hasPreloadedName} name={name} mode={mode} />
                <LoginForm
                    name={name}
                    setName={setName}
                    classId={classId}
                    setClassId={setClassId}
                    error={error}
                    handleSubmit={handleSubmit}
                    hasPreloadedName={hasPreloadedName}
                    mode={mode}
                />
            </div>
        </div>
    );
};

export default LoginView;
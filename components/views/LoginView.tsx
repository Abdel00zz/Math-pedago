import React, { useState, FormEvent, useEffect, Dispatch, SetStateAction } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import { Profile } from '../../types';

// --- Sous-composants pour la clarté ---

const LoginHeader: React.FC = () => (
    <div className="text-center mb-12 flex flex-col items-center animate-fade-in">
        {/* Modern Icon Badge */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-button-hover animate-bounce-in">
            <span className="material-symbols-outlined !text-5xl text-white">functions</span>
        </div>
        <h1 className="font-display text-display-md text-text-primary font-bold tracking-tight">
            Center Scientific
        </h1>
        <p className="font-sans text-body-lg text-text-secondary mt-2 tracking-wide">
            <span className="text-primary font-semibold animate-pulse-subtle">
                of Mathematics
            </span>
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-6 rounded-full"></div>
    </div>
);

const WelcomeMessage: React.FC<{ hasPreloadedName: boolean; name: string }> = ({ hasPreloadedName, name }) => (
    <div className="text-center mb-10 animate-slide-in-up">
        {hasPreloadedName ? (
            <>
                <h2 className="text-display-sm font-display text-text-primary leading-tight">
                    Bon retour, <span className="text-primary font-bold">{name}</span> !
                </h2>
                <p className="mt-3 text-text-secondary font-sans text-body-md">
                    Confirmez votre classe pour continuer votre parcours.
                </p>
            </>
        ) : (
            <>
                <h2 className="text-display-sm font-display text-text-primary font-bold">Bienvenue</h2>
                <p className="mt-3 text-text-secondary font-sans text-body-md">
                    Commencez votre parcours d'excellence en mathématiques.
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
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="name" className="block text-label-lg font-sans text-text-primary mb-2">
                Nom complet
            </label>
            <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none group-focus-within:text-primary transition-colors duration-200">
                    person
                </span>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 bg-background-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-sans text-body-md text-text-primary placeholder:text-text-tertiary ${
                        hasPreloadedName ? 'bg-background-tertiary text-text-secondary cursor-not-allowed' : 'hover:border-border-hover'
                    }`}
                    placeholder="Votre nom et prénom"
                    required
                    readOnly={hasPreloadedName}
                />
            </div>
        </div>

        <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="classId" className="block text-label-lg font-sans text-text-primary mb-2">
                Votre classe
            </label>
            <div className="relative group">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none group-focus-within:text-primary transition-colors duration-200">
                    school
                </span>
                <select
                    id="classId"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-background-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer font-sans text-body-md text-text-primary appearance-none hover:border-border-hover"
                    required
                >
                    {CLASS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary">
                    <span className="material-symbols-outlined text-text-tertiary">expand_more</span>
                </div>
            </div>
        </div>

        {error && (
            <div className="bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-lg text-sm font-sans font-medium text-center animate-scale-in">
                {error}
            </div>
        )}

        <button
            type="submit"
            className="w-full px-6 py-4 font-sans font-semibold text-body-lg text-white bg-primary rounded-xl shadow-button hover:bg-primary-600 hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] mt-6 animate-bounce-in"
            style={{ animationDelay: '0.3s' }}
        >
            {hasPreloadedName ? 'Accéder à mon espace' : 'Commencer mon parcours'}
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
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
            <div className="w-full max-w-lg bg-white border border-border rounded-3xl shadow-2xl p-8 sm:p-12 animate-scale-in">
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
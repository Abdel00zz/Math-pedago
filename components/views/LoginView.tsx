import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { CLASS_OPTIONS } from '../../constants';
import Logo from '../Logo';

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
        <div className="w-full flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-slate-800">Heureux de vous revoir,</h2>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{state.profile?.name}</p>
            <p className="text-md text-slate-500 mt-2">{CLASS_OPTIONS.find(c => c.value === state.profile?.classId)?.label}</p>
            <button
                onClick={handleContinue}
                className="w-full mt-10 px-6 py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
            >
                Continuer vers mon espace
            </button>
        </div>
    );

    const loggedOutView = (
        <>
            <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">Bienvenue !</h1>
            <p className="text-slate-500 mb-8 text-center">Prêt à relever de nouveaux défis ?</p>
            <div className="space-y-6">
                <div>
                    <label htmlFor="student-name" className="block text-sm font-medium text-slate-600 mb-2">Nom complet</label>
                    <input
                        type="text"
                        id="student-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Entrez votre nom et prénom"
                        className="w-full px-4 py-3 text-slate-900 bg-slate-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                    />
                </div>
                <div>
                    <label htmlFor="class-selector" className="block text-sm font-medium text-slate-600 mb-2">Votre classe</label>
                    <select
                        id="class-selector"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full px-4 py-3 text-slate-900 bg-slate-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                    >
                        {CLASS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full px-6 py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 mt-4"
                >
                    Commencer l'aventure
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Logo className="mb-10 justify-center" />
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
                    {state.profile ? loggedInView : loggedOutView}
                </div>
                <footer className="text-center mt-8">
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} <a href="/" className="font-medium text-indigo-600 hover:underline">Maths Mind</a>. Tous droits réservés.</p>
                </footer>
            </div>
        </div>
     );
};

export default LoginView;
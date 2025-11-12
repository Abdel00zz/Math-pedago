import React from 'react';
import FormattedText from '../FormattedText';

interface MindMapCardProps {
    theme: string;
}

const MindMapCard: React.FC<MindMapCardProps> = ({ theme }) => {
    const themeNormalized = theme.toLowerCase();

    // Carte mentale pour les nombres complexes
    if (themeNormalized.includes('complexe')) {
        return (
            <div className="mb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-indigo-600 text-2xl">account_tree</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Carte mentale : Les nombres complexes
                    </h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white border-2 border-blue-500 rounded-lg shadow px-6 py-3 text-center transform hover:scale-105 transition-transform duration-200">
                        <div className="text-xs text-blue-600 font-semibold mb-1 uppercase">Forme algébrique</div>
                        <span className="text-blue-700 font-semibold"><FormattedText text="$z = a + ib$" /></span>
                    </div>
                    <div className="text-gray-400 text-2xl">↓</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                        <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow border-t-2 border-blue-400">
                            <div className="text-xs text-gray-700 font-semibold mb-2">Module</div>
                            <div className="text-sm"><FormattedText text="$|z| = \\sqrt{a^2 + b^2}$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow border-t-2 border-purple-400">
                            <div className="text-xs text-gray-700 font-semibold mb-2">Argument</div>
                            <div className="text-sm"><FormattedText text="$\\arg(z) = \\theta$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow border-t-2 border-indigo-400">
                            <div className="text-xs text-gray-700 font-semibold mb-2">Conjugué</div>
                            <div className="text-sm"><FormattedText text="$\\overline{z} = a - ib$" /></div>
                        </div>
                    </div>
                    <div className="text-gray-400 text-2xl">↓</div>
                    <div className="bg-white border-2 border-purple-500 rounded-lg shadow px-6 py-3 text-center transform hover:scale-105 transition-transform duration-200">
                        <div className="text-xs text-purple-600 font-semibold mb-1 uppercase">Forme exponentielle</div>
                        <span className="text-purple-700 font-semibold"><FormattedText text="$z = |z| e^{i\\theta}$" /></span>
                    </div>
                </div>
            </div>
        );
    }

    // Carte mentale pour les suites numériques
    if (themeNormalized.includes('suite')) {
        return (
            <div className="mb-12 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-teal-600 text-2xl">timeline</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Carte mentale : Les suites numériques
                    </h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white border-2 border-teal-500 rounded-lg shadow px-6 py-3 text-center">
                        <div className="text-xs text-teal-600 font-semibold mb-1 uppercase">Suite $(u_n)$</div>
                        <span className="text-teal-700 font-semibold"><FormattedText text="$u_n = f(n)$" /></span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-green-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Suite arithmétique</div>
                            <div className="space-y-2 text-sm">
                                <div><FormattedText text="$u_{n+1} = u_n + r$" /></div>
                                <div><FormattedText text="$u_n = u_0 + nr$" /></div>
                                <div><FormattedText text="$S_n = \\frac{n(u_0 + u_n)}{2}$" /></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-emerald-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Suite géométrique</div>
                            <div className="space-y-2 text-sm">
                                <div><FormattedText text="$u_{n+1} = q \\cdot u_n$" /></div>
                                <div><FormattedText text="$u_n = u_0 \\cdot q^n$" /></div>
                                <div><FormattedText text="$S_n = u_0 \\frac{1-q^{n+1}}{1-q}$" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400 text-2xl">↓</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Convergence</div>
                            <div className="text-xs"><FormattedText text="$\\lim_{n \\to +\\infty} u_n = l$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Monotonie</div>
                            <div className="text-xs"><FormattedText text="$u_{n+1} - u_n \\geq 0$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Bornée</div>
                            <div className="text-xs"><FormattedText text="$m \\leq u_n \\leq M$" /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Carte mentale pour les fonctions
    if (themeNormalized.includes('fonction')) {
        return (
            <div className="mb-12 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-orange-600 text-2xl">functions</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Carte mentale : Étude de fonctions
                    </h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white border-2 border-orange-500 rounded-lg shadow px-6 py-3 text-center">
                        <span className="text-orange-700 font-semibold"><FormattedText text="$f: I \\to \\mathbb{R}$" /></span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-orange-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Dérivabilité</div>
                            <div className="space-y-2 text-sm">
                                <div><FormattedText text="$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$" /></div>
                                <div className="text-xs text-gray-600">• $f'(x) > 0$ : croissante</div>
                                <div className="text-xs text-gray-600">• $f'(x) < 0$ : décroissante</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-amber-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Continuité</div>
                            <div className="space-y-2 text-sm">
                                <div><FormattedText text="$\\lim_{x \\to a} f(x) = f(a)$" /></div>
                                <div className="text-xs text-gray-600">• Pas de rupture</div>
                                <div className="text-xs text-gray-600">• TVI applicable</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Limite</div>
                            <div className="text-xs"><FormattedText text="$\\lim_{x \\to a} f(x)$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Asymptote</div>
                            <div className="text-xs"><FormattedText text="$y = ax + b$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Point critique</div>
                            <div className="text-xs"><FormattedText text="$f'(x) = 0$" /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Carte mentale pour les probabilités
    if (themeNormalized.includes('probabilit')) {
        return (
            <div className="mb-12 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-pink-600 text-2xl">casino</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Carte mentale : Probabilités
                    </h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white border-2 border-pink-500 rounded-lg shadow px-6 py-3 text-center">
                        <span className="text-pink-700 font-semibold"><FormattedText text="$P: \\Omega \\to [0,1]$" /></span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-pink-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Lois discrètes</div>
                            <div className="space-y-2 text-sm">
                                <div className="text-xs"><strong>Bernoulli:</strong> <FormattedText text="$P(X=1)=p$" /></div>
                                <div className="text-xs"><strong>Binomiale:</strong> <FormattedText text="$B(n,p)$" /></div>
                                <div className="text-xs"><FormattedText text="$P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}$" /></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 border-t-2 border-rose-400">
                            <div className="text-xs text-gray-700 font-semibold mb-3">Lois continues</div>
                            <div className="space-y-2 text-sm">
                                <div className="text-xs"><strong>Uniforme:</strong> <FormattedText text="$\\mathcal{U}([a,b])$" /></div>
                                <div className="text-xs"><strong>Normale:</strong> <FormattedText text="$\\mathcal{N}(\\mu, \\sigma^2)$" /></div>
                                <div className="text-xs"><strong>Exponentielle:</strong> <FormattedText text="$\\mathcal{E}(\\lambda)$" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Espérance</div>
                            <div className="text-xs"><FormattedText text="$E(X) = \\sum x_i p_i$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Variance</div>
                            <div className="text-xs"><FormattedText text="$V(X) = E(X^2) - E(X)^2$" /></div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Indépendance</div>
                            <div className="text-xs"><FormattedText text="$P(A \\cap B) = P(A)P(B)$" /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Carte mentale pour les dérivées (carte générique)
    if (themeNormalized.includes('deriv') || themeNormalized.includes('calcul')) {
        return (
            <div className="mb-12 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-cyan-600 text-2xl">show_chart</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Carte mentale : Dérivées usuelles
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-cyan-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(x^n)' = nx^{n-1}$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-blue-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(e^x)' = e^x$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-sky-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(\\ln x)' = \\frac{1}{x}$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-cyan-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(\\sin x)' = \\cos x$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-blue-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(\\cos x)' = -\\sin x$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-sky-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(\\tan x)' = 1 + \\tan^2 x$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-cyan-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(u+v)' = u' + v'$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-blue-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(uv)' = u'v + uv'$" /></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow border-l-2 border-sky-400">
                        <div className="text-xs text-gray-600 mb-1"><FormattedText text="$(\\frac{u}{v})' = \\frac{u'v-uv'}{v^2}$" /></div>
                    </div>
                </div>
            </div>
        );
    }

    // Pas de carte mentale pour ce thème
    return null;
};

export default MindMapCard;

/**
 * 🔍 DIAGNOSTIC MATHJAX
 * Outil de diagnostic complet pour identifier les problèmes MathJax
 * Tapez `window.diagnoseMathJax()` dans la console F12
 */

export const diagnoseMathJax = () => {
    console.clear();
    console.log('🔍 ========== DIAGNOSTIC MATHJAX ==========');
    console.log('');
    
    // 1. Vérifier si MathJax est chargé
    console.log('📦 1. VÉRIFICATION DU CHARGEMENT DE MATHJAX');
    console.log('   window.MathJax existe:', !!window.MathJax);
    
    if (window.MathJax) {
        console.log('   ✅ MathJax est chargé!');
        console.log('   - typesetPromise:', !!window.MathJax.typesetPromise);
        console.log('   - typesetClear:', !!window.MathJax.typesetClear);
        console.log('   - startup:', !!window.MathJax.startup);
    } else {
        console.error('   ❌ MathJax N\'EST PAS CHARGÉ!');
        console.error('   🔧 Solution: Vérifiez que le script MathJax est dans index.html');
        return;
    }
    
    console.log('');
    
    // 2. Vérifier la configuration MathJax
    console.log('⚙️  2. CONFIGURATION MATHJAX');
    const config = (window as any).MathJax;
    if (config.tex) {
        console.log('   Configuration TeX:', config.tex);
    } else {
        console.log('   Configuration globale:', config);
    }
    
    console.log('');
    
    // 3. Rechercher les expressions LaTeX dans le DOM
    console.log('🔎 3. RECHERCHE D\'EXPRESSIONS LATEX DANS LE DOM');
    const allText = document.body.innerText;
    const dollarMatches = allText.match(/\$[^$]+\$/g);
    const doubleDollarMatches = allText.match(/\$\$[^$]+\$\$/g);
    
    console.log('   Expressions $...$ trouvées:', dollarMatches?.length || 0);
    if (dollarMatches && dollarMatches.length > 0) {
        console.log('   Exemples:', dollarMatches.slice(0, 5));
    }
    
    console.log('   Expressions $$...$$ trouvées:', doubleDollarMatches?.length || 0);
    if (doubleDollarMatches && doubleDollarMatches.length > 0) {
        console.log('   Exemples:', doubleDollarMatches.slice(0, 3));
    }
    
    console.log('');
    
    // 4. Vérifier les conteneurs MathJax rendus
    console.log('📊 4. CONTENEURS MATHJAX RENDUS');
    const mjxContainers = document.querySelectorAll('mjx-container');
    console.log('   Conteneurs mjx-container:', mjxContainers.length);
    
    if (mjxContainers.length > 0) {
        console.log('   ✅ MathJax a rendu des formules!');
        console.log('   Premier conteneur:', mjxContainers[0]);
    } else {
        console.warn('   ⚠️  AUCUN conteneur MathJax trouvé!');
        if (dollarMatches && dollarMatches.length > 0) {
            console.error('   ❌ Des expressions $ $ existent mais ne sont PAS rendues!');
        }
    }
    
    console.log('');
    
    // 5. Vérifier les éléments avec classe math-content
    console.log('🎯 5. ÉLÉMENTS MATH-CONTENT');
    const mathContentElements = document.querySelectorAll('.math-content');
    console.log('   Éléments .math-content:', mathContentElements.length);
    
    if (mathContentElements.length > 0) {
        mathContentElements.forEach((el, idx) => {
            if (idx < 3) {
                const hasDollar = /\$/.test(el.innerHTML);
                const hasMjx = el.querySelector('mjx-container') !== null;
                console.log(`   Element ${idx + 1}:`, {
                    hasDollarSigns: hasDollar,
                    hasMathJaxRender: hasMjx,
                    innerHTML: el.innerHTML.substring(0, 100) + '...'
                });
            }
        });
    }
    
    console.log('');
    
    // 6. Test de rendu manuel
    console.log('🧪 6. TEST DE RENDU MANUEL');
    console.log('   Pour tester manuellement, exécutez:');
    console.log('   window.MathJax.typesetPromise([document.body])');
    
    console.log('');
    console.log('========================================');
    console.log('');
    
    // Résumé
    if (!window.MathJax) {
        console.error('❌ PROBLÈME: MathJax n\'est pas chargé');
        console.log('🔧 SOLUTION: Ajoutez le script MathJax dans index.html');
    } else if (dollarMatches && dollarMatches.length > 0 && mjxContainers.length === 0) {
        console.error('❌ PROBLÈME: Des expressions $ $ existent mais ne sont PAS rendues');
        console.log('🔧 SOLUTION POSSIBLE 1: Les délimiteurs ne sont pas configurés');
        console.log('🔧 SOLUTION POSSIBLE 2: MathJax ne détecte pas les expressions');
        console.log('🔧 SOLUTION POSSIBLE 3: Conflit avec le traitement Markdown');
        console.log('');
        console.log('Essayez de forcer le rendu:');
        console.log('window.MathJax.typesetPromise([document.body])');
    } else if (mjxContainers.length > 0) {
        console.log('✅ TOUT FONCTIONNE! MathJax rend correctement les formules');
    } else {
        console.log('ℹ️  Aucune expression LaTeX trouvée dans le DOM');
    }
};

// Exposer globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
    (window as any).diagnoseMathJax = diagnoseMathJax;
    console.log('🔍 Diagnostic MathJax disponible! Tapez: window.diagnoseMathJax()');
}

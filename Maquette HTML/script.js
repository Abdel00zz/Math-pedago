/**
 * Math-pedago - Script principal
 * Fonctionnalités interactives pour la maquette HTML
 */

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Math-pedago - Maquette chargée avec succès ✓');

    initializeAnimations();
    initializeScrollEffects();
    initializeNavigation();
    initializeLocalStorage();
});

// ============================================
// ANIMATIONS
// ============================================

function initializeAnimations() {
    // Intersection Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe 'animate-on-scroll'
    document.querySelectorAll('.feature-card, .class-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// EFFETS DE SCROLL
// ============================================

function initializeScrollEffects() {
    // Smooth scroll pour tous les liens anchor
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background au scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.15)';
            } else {
                navbar.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            }
        });
    }
}

// ============================================
// NAVIGATION
// ============================================

function initializeNavigation() {
    // Activer le lien de navigation correspondant à la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// LOCAL STORAGE
// ============================================

function initializeLocalStorage() {
    // Charger les données utilisateur si disponibles
    const userName = localStorage.getItem('userName');
    const userProfile = localStorage.getItem('userProfile');

    if (userName && userProfile) {
        console.log(`Utilisateur connecté: ${userName} (${userProfile})`);
    }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Sauvegarder la progression d'un chapitre
 */
function saveProgress(chapterId, stepId, progress) {
    const key = `chapter_${chapterId}_${stepId}`;
    const data = {
        progress: progress,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Progression sauvegardée: ${key} = ${progress}%`);
}

/**
 * Récupérer la progression d'un chapitre
 */
function getProgress(chapterId, stepId) {
    const key = `chapter_${chapterId}_${stepId}`;
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

/**
 * Marquer un chapitre comme complété
 */
function markChapterComplete(chapterId) {
    const completedChapters = JSON.parse(localStorage.getItem('completedChapters') || '[]');
    if (!completedChapters.includes(chapterId)) {
        completedChapters.push(chapterId);
        localStorage.setItem('completedChapters', JSON.stringify(completedChapters));
        console.log(`Chapitre complété: ${chapterId}`);

        // Afficher une notification de succès
        showNotification('Félicitations ! Chapitre complété 🎉', 'success');
    }
}

/**
 * Vérifier si un chapitre est complété
 */
function isChapterComplete(chapterId) {
    const completedChapters = JSON.parse(localStorage.getItem('completedChapters') || '[]');
    return completedChapters.includes(chapterId);
}

/**
 * Afficher une notification
 */
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    notification.textContent = message;

    // Ajouter au body
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Formater une durée en minutes
 */
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
}

/**
 * Calculer le pourcentage de progression
 */
function calculateProgress(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Générer un ID unique
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Débounce une fonction
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle une fonction
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// STATISTIQUES
// ============================================

/**
 * Obtenir les statistiques de l'utilisateur
 */
function getUserStats() {
    const completedChapters = JSON.parse(localStorage.getItem('completedChapters') || '[]');
    const quizScores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    const exerciseScores = JSON.parse(localStorage.getItem('exerciseScores') || '[]');

    // Calculer le taux de réussite moyen
    const allScores = [...quizScores, ...exerciseScores];
    const averageScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    // Calculer le temps d'étude total (simulé)
    const studyTime = localStorage.getItem('totalStudyTime') || '0';

    return {
        completedChapters: completedChapters.length,
        averageScore: averageScore,
        totalStudyTime: parseInt(studyTime),
        badges: JSON.parse(localStorage.getItem('badges') || '[]').length
    };
}

/**
 * Mettre à jour le temps d'étude
 */
function updateStudyTime(minutes) {
    const currentTime = parseInt(localStorage.getItem('totalStudyTime') || '0');
    localStorage.setItem('totalStudyTime', (currentTime + minutes).toString());
}

/**
 * Ajouter un badge
 */
function addBadge(badgeId, badgeName) {
    const badges = JSON.parse(localStorage.getItem('badges') || '[]');
    if (!badges.find(b => b.id === badgeId)) {
        badges.push({ id: badgeId, name: badgeName, earnedAt: new Date().toISOString() });
        localStorage.setItem('badges', JSON.stringify(badges));
        showNotification(`Nouveau badge gagné : ${badgeName} 🏆`, 'success');
    }
}

// ============================================
// ANIMATIONS CSS AJOUTÉES DYNAMIQUEMENT
// ============================================

// Ajouter les keyframes pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

// Rendre certaines fonctions accessibles globalement
window.MathPedago = {
    saveProgress,
    getProgress,
    markChapterComplete,
    isChapterComplete,
    showNotification,
    getUserStats,
    updateStudyTime,
    addBadge,
    formatDuration,
    calculateProgress
};

console.log('Math-pedago - Fonctionnalités chargées ✓');

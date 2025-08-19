/**
 * Fichier principal de l'application
 * Initialise et configure les différentes fonctionnalités
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio initialisé');
    
    // Initialiser les fonctionnalités de base
    initApp();
    
    // Initialiser les fonctionnalités avancées
    initAdvancedFeatures();
    
    // Initialiser les écouteurs d'événements
    initEventListeners();
});

/**
 * Initialise les fonctionnalités de base de l'application
 */
function initApp() {
    // Détecter les fonctionnalités du navigateur
    detectBrowserFeatures();
    
    // Initialiser le thème
    if (window.ThemeManager) {
        ThemeManager.init();
    }
    
    // Initialiser le chargement du contenu
    if (window.ContentLoader) {
        ContentLoader.initContentLoading();
    }
    
    // Initialiser les animations
    if (window.Animations) {
        Animations.init();
    }
    
    // Initialiser les interactions
    if (window.Interactions) {
        Interactions.init();
    }
}

/**
 * Initialise les fonctionnalités avancées
 */
function initAdvancedFeatures() {
    // Initialiser le service worker pour le mode hors ligne
    if ('serviceWorker' in navigator) {
        initServiceWorker();
    }
    
    // Initialiser les web workers si nécessaire
    if (window.Worker) {
        initWebWorkers();
    }
    
    // Initialiser les fonctionnalités de performance
    initPerformanceMonitoring();
    
    // Initialiser les fonctionnalités de partage
    if (window.SocialShare) {
        SocialShare.init();
    }
}

/**
 * Initialise les écouteurs d'événements globaux
 */
function initEventListeners() {
    // Gérer le changement d'orientation de l'appareil
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Gérer les changements de connexion
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Gérer la visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Gérer le défilement pour la navigation fixe
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (!header) return;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Défilement vers le bas
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Défilement vers le haut
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Détecte les fonctionnalités du navigateur
 */
function detectBrowserFeatures() {
    const html = document.documentElement;
    
    // Détecter les fonctionnalités CSS
    if ('CSS' in window && 'supports' in CSS) {
        html.classList.add('css-supports-api');
    }
    
    // Détecter les fonctionnalités JS
    if ('IntersectionObserver' in window) {
        html.classList.add('has-intersection-observer');
    }
    
    if ('ResizeObserver' in window) {
        html.classList.add('has-resize-observer');
    }
    
    if ('MutationObserver' in window) {
        html.classList.add('has-mutation-observer');
    }
    
    // Détecter le type d'appareil
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        html.classList.add('touch-device');
    } else {
        html.classList.add('no-touch-device');
    }
    
    // Détecter le mode sombre du système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark-mode');
    }
}

/**
 * Initialise le Service Worker
 */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker enregistré avec succès:', registration.scope);
                    
                    // Vérifier les mises à jour
                    registration.update();
                })
                .catch(function(error) {
                    console.error('Échec de l\'enregistrement du ServiceWorker:', error);
                });
        });
    }
}

/**
 * Initialise les Web Workers
 */
function initWebWorkers() {
    // Exemple d'initialisation d'un Web Worker
    if (window.Worker) {
        // Initialiser les workers si nécessaire
        // const worker = new Worker('/js/workers/example.worker.js');
    }
}

/**
 * Initialise la surveillance des performances
 */
function initPerformanceMonitoring() {
    // Surveiller les métriques de performance
    if ('performance' in window) {
        // Enregistrer le temps de chargement de la page
        window.addEventListener('load', function() {
            setTimeout(() => {
                const timing = performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                
                console.log(`Temps de chargement de la page: ${pageLoadTime}ms`);
                
                // Envoyer les données à votre service d'analyse
                if (window.ga) {
                    ga('send', 'timing', 'Page Load', 'load', pageLoadTime);
                }
            }, 0);
        });
    }
    
    // Surveiller la mémoire (si disponible)
    if ('memory' in performance) {
        setInterval(() => {
            console.log(`Utilisation mémoire: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
        }, 30000); // Toutes les 30 secondes
    }
}

/**
 * Gère le changement d'orientation de l'appareil
 */
function handleOrientationChange() {
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    document.documentElement.setAttribute('data-orientation', orientation);
    
    // Émettre un événement personnalisé
    const event = new CustomEvent('orientationChanged', {
        detail: { orientation }
    });
    
    document.dispatchEvent(event);
}

/**
 * Gère les changements d'état de la connexion
 */
function handleOnlineStatusChange() {
    const isOnline = navigator.onLine;
    const statusElement = document.getElementById('connection-status');
    
    if (statusElement) {
        statusElement.textContent = isOnline ? 'En ligne' : 'Hors ligne';
        statusElement.className = isOnline ? 'online' : 'offline';
    }
    
    // Émettre un événement personnalisé
    const event = new CustomEvent('connectionChanged', {
        detail: { isOnline }
    });
    
    document.dispatchEvent(event);
    
    // Afficher une notification
    if (!isOnline) {
        showNotification('Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.');
    }
}

/**
 * Gère les changements de visibilité de la page
 */
function handleVisibilityChange() {
    const isVisible = document.visibilityState === 'visible';
    
    // Émettre un événement personnalisé
    const event = new CustomEvent('visibilityChanged', {
        detail: { isVisible }
    });
    
    document.dispatchEvent(event);
    
    // Mettre à jour le titre de l'onglet si nécessaire
    if (isVisible) {
        document.title = document.querySelector('meta[property="og:title"]').content;
    } else {
        document.title = 'Revenez nous voir !';
    }
}

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (info, success, warning, error)
 * @param {number} duration - Durée d'affichage en millisecondes (0 pour ne pas fermer automatiquement)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    // Ajouter le message
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    notification.appendChild(messageElement);
    
    // Ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.setAttribute('aria-label', 'Fermer la notification');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    notification.appendChild(closeButton);
    
    // Ajouter la notification au DOM
    const container = document.getElementById('notifications') || document.body;
    container.appendChild(notification);
    
    // Forcer un recalcul pour activer la transition
    notification.offsetHeight;
    notification.classList.add('show');
    
    // Fermer automatiquement après la durée spécifiée
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    return notification;
}

/**
 * Ferme une notification
 * @param {HTMLElement} notification - L'élément de notification à fermer
 */
function closeNotification(notification) {
    if (!notification) return;
    
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Supprimer l'élément après l'animation
    notification.addEventListener('transitionend', function handler() {
        notification.removeEventListener('transitionend', handler);
        notification.remove();
    });
}

/**
 * Initialise l'application
 */
function startApp() {
    console.log('Démarrage de l\'application...');
    
    // Vérifier si le navigateur prend en charge les fonctionnalités requises
    if (!('querySelector' in document) || !('addEventListener' in window)) {
        // Afficher un message pour les navigateurs obsolètes
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="browser-warning-content">
                <h2>Navigateur non pris en charge</h2>
                <p>Votre navigateur est obsolète et ne prend pas en charge toutes les fonctionnalités de ce site.</p>
                <p>Veuillez mettre à jour votre navigateur ou en utiliser un autre comme <a href="https://www.google.com/chrome/" target="_blank" rel="noopener">Chrome</a>, 
                <a href="https://www.mozilla.org/firefox/" target="_blank" rel="noopener">Firefox</a>, 
                <a href="https://www.microsoft.com/edge" target="_blank" rel="noopener">Edge</a> ou 
                <a href="https://www.apple.com/safari/" target="_blank" rel="noopener">Safari</a>.</p>
            </div>
        `;
        
        document.body.insertBefore(warning, document.body.firstChild);
        return;
    }
    
    // Initialiser le thème
    if (window.ThemeManager) {
        ThemeManager.init();
    }
    
    // Initialiser les composants UI
    initUIComponents();
    
    // Initialiser les gestionnaires d'événements
    initEventHandlers();
    
    // Charger les données initiales
    loadInitialData();
}

// Démarrer l'application lorsque le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Exposer les fonctions au scope global
window.App = {
    init: initApp,
    showNotification,
    closeNotification,
    handleOrientationChange,
    handleOnlineStatusChange,
    handleVisibilityChange
};

// Initialiser l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'API IntersectionObserver est disponible
    if (!('IntersectionObserver' in window)) {
        // Charger le polyfill si nécessaire
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
        document.head.appendChild(script);
    }
    
    // Initialiser l'application
    if (window.App && typeof window.App.init === 'function') {
        window.App.init();
    }
});

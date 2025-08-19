/**
 * Gestion des événements personnalisés et communication entre modules
 */

// Créer un gestionnaire d'événements centralisé
const EventBus = {
    // Stocke les écouteurs d'événements
    listeners: {},
    
    /**
     * Enregistre un écouteur d'événement
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction à appeler lorsque l'événement est déclenché
     * @returns {Function} Fonction pour supprimer l'écouteur
     */
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push(callback);
        
        // Retourne une fonction pour supprimer l'écouteur
        return () => this.off(eventName, callback);
    },
    
    /**
     * Supprime un écouteur d'événement
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction à supprimer
     */
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        
        this.listeners[eventName] = this.listeners[eventName].filter(
            listener => listener !== callback
        );
    },
    
    /**
     * Déclenche un événement
     * @param {string} eventName - Nom de l'événement
     * @param {*} data - Données à transmettre aux écouteurs
     */
    emit(eventName, data = {}) {
        if (!this.listeners[eventName]) return;
        
        // Créer un objet d'événement personnalisé
        const event = {
            type: eventName,
            data,
            timestamp: Date.now(),
            preventDefault: false,
            defaultPrevented: false,
            stopPropagation: false,
            stopImmediatePropagation: false
        };
        
        // Appeler tous les écouteurs
        for (const listener of this.listeners[eventName]) {
            if (event.stopImmediatePropagation) break;
            
            try {
                listener({
                    ...event,
                    preventDefault() {
                        event.preventDefault = true;
                        event.defaultPrevented = true;
                    },
                    stopPropagation() {
                        event.stopPropagation = true;
                    },
                    stopImmediatePropagation() {
                        event.stopImmediatePropagation = true;
                    }
                });
            } catch (error) {
                console.error(`Erreur dans l'écouteur pour l'événement ${eventName}:`, error);
            }
            
            if (event.stopPropagation) break;
        }
    }
};

// Événements personnalisés pour l'application
const AppEvents = {
    // Événements liés à l'authentification
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_ERROR: 'auth:error',
    
    // Événements liés au chargement des données
    DATA_LOADING: 'data:loading',
    DATA_LOADED: 'data:loaded',
    DATA_ERROR: 'data:error',
    
    // Événements liés à l'interface utilisateur
    UI_NAVIGATE: 'ui:navigate',
    UI_MODAL_OPEN: 'ui:modal:open',
    UI_MODAL_CLOSE: 'ui:modal:close',
    UI_NOTIFICATION_SHOW: 'ui:notification:show',
    UI_NOTIFICATION_HIDE: 'ui:notification:hide',
    
    // Événements liés au thème
    THEME_CHANGE: 'theme:change',
    THEME_LOADED: 'theme:loaded',
    
    // Événements liés au formulaire
    FORM_SUBMIT: 'form:submit',
    FORM_VALIDATE: 'form:validate',
    FORM_ERROR: 'form:error',
    FORM_SUCCESS: 'form:success',
    
    // Événements liés au routage
    ROUTE_CHANGE: 'route:change',
    ROUTE_LOADING: 'route:loading',
    ROUTE_LOADED: 'route:loaded',
    
    // Événements liés aux performances
    PERF_METRIC: 'perf:metric',
    PERF_TIMING: 'perf:timing',
    
    // Événements liés aux erreurs
    ERROR_BOUNDARY: 'error:boundary',
    ERROR_UNHANDLED: 'error:unhandled',
    
    // Événements personnalisés pour les fonctionnalités spécifiques
    PROJECT_VIEW: 'project:view',
    PROJECT_LIKE: 'project:like',
    PROJECT_SHARE: 'project:share',
    
    BLOG_VIEW: 'blog:view',
    BLOG_COMMENT: 'blog:comment',
    BLOG_SHARE: 'blog:share',
    
    CONTACT_FORM_SUBMIT: 'contact:form:submit',
    CONTACT_FORM_SUCCESS: 'contact:form:success',
    CONTACT_FORM_ERROR: 'contact:form:error',
    
    // Événements système
    ONLINE_STATUS_CHANGE: 'system:online:change',
    VISIBILITY_CHANGE: 'system:visibility:change',
    ORIENTATION_CHANGE: 'system:orientation:change',
    RESIZE: 'system:resize',
    SCROLL: 'system:scroll'
};

// Enregistrer les événements globaux
function initGlobalEventListeners() {
    // Gérer les changements de connectivité
    window.addEventListener('online', () => {
        EventBus.emit(AppEvents.ONLINE_STATUS_CHANGE, { isOnline: true });
    });
    
    window.addEventListener('offline', () => {
        EventBus.emit(AppEvents.ONLINE_STATUS_CHANGE, { isOnline: false });
    });
    
    // Gérer les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
        EventBus.emit(AppEvents.VISIBILITY_CHANGE, {
            isVisible: document.visibilityState === 'visible'
        });
    });
    
    // Gérer les changements d'orientation
    window.addEventListener('orientationchange', () => {
        EventBus.emit(AppEvents.ORIENTATION_CHANGE, {
            orientation: window.orientation,
            isPortrait: window.innerHeight > window.innerWidth
        });
    });
    
    // Optimisation du redimensionnement avec debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            EventBus.emit(AppEvents.RESIZE, {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            });
        }, 100);
    });
    
    // Optimisation du défilement avec debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            EventBus.emit(AppEvents.SCROLL, {
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                scrollHeight: document.documentElement.scrollHeight,
                scrollWidth: document.documentElement.scrollWidth
            });
        }, 50);
    });
    
    // Gérer les erreurs non capturées
    window.addEventListener('error', (event) => {
        EventBus.emit(AppEvents.ERROR_UNHANDLED, {
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });
        
        // Permettre à d'autres gestionnaires de recevoir l'événement
        return false;
    });
    
    // Gérer les promesses non capturées
    window.addEventListener('unhandledrejection', (event) => {
        EventBus.emit(AppEvents.ERROR_UNHANDLED, {
            message: 'Unhandled Promise Rejection',
            reason: event.reason,
            promise: event.promise
        });
    });
}

// Initialiser le système d'événements
document.addEventListener('DOMContentLoaded', () => {
    initGlobalEventListeners();
    
    // Émettre un événement lorsque le DOM est chargé
    EventBus.emit(AppEvents.ROUTE_LOADED, {
        path: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search
    });
});

// Exposer les objets au scope global
window.EventBus = EventBus;
window.AppEvents = AppEvents;

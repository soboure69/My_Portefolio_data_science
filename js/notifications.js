/**
 * Gestionnaire de notifications et messages utilisateur
 * Fournit des méthodes pour afficher différents types de notifications
 */

class NotificationManager {
    constructor() {
        // Configuration par défaut
        this.defaultOptions = {
            type: 'info',         // Type de notification: 'info', 'success', 'warning', 'error'
            position: 'top-right', // Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'center'
            duration: 5000,       // Durée d'affichage en ms (0 = ne pas fermer automatiquement)
            dismissible: true,    // Peut être fermée par l'utilisateur
            showIcon: true,       // Afficher une icône
            showProgress: true,   // Afficher une barre de progression
            maxWidth: '400px',    // Largeur maximale
            animation: 'fade',    // Animation: 'fade', 'slide', 'scale', 'none'
            closeOnClick: true,   // Fermer au clic
            pauseOnHover: true,   // Mettre en pause le décompte au survol
            className: '',        // Classe CSS personnalisée
            container: null       // Conteneur personnalisé (par défaut: body)
        };
        
        // Icônes par défaut (utilisant Font Awesome)
        this.icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle'
        };
        
        // Conteneur principal des notifications
        this.container = null;
        
        // Liste des notifications actives
        this.activeNotifications = new Set();
        
        // Initialiser le gestionnaire
        this.init();
    }
    
    /**
     * Initialiser le gestionnaire de notifications
     */
    init() {
        // Créer le conteneur principal s'il n'existe pas
        if (!document.querySelector('.notifications-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notifications-container');
        }
        
        // Écouter les clics sur le conteneur pour la fermeture au clic
        this.container.addEventListener('click', (e) => {
            const notification = e.target.closest('.notification');
            if (notification && notification.dataset.closeOnClick === 'true') {
                this.remove(notification.id);
            }
        });
        
        console.log('Gestionnaire de notifications initialisé');
    }
    
    /**
     * Afficher une notification
     * @param {string} message - Le message à afficher
     * @param {Object} options - Options de la notification
     * @returns {string} L'ID de la notification créée
     */
    show(message, options = {}) {
        // Fusionner les options avec les valeurs par défaut
        const config = { ...this.defaultOptions, ...options };
        
        // Créer un ID unique pour la notification
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification ${config.type} ${config.className} ${config.animation}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.dataset.position = config.position;
        notification.dataset.closeOnClick = config.closeOnClick;
        
        // Créer le contenu de la notification
        let notificationContent = '';
        
        // Ajouter l'icône si activée
        if (config.showIcon && this.icons[config.type]) {
            notificationContent += `
                <div class="notification-icon">
                    <i class="fas fa-${this.icons[config.type]}"></i>
                </div>
            `;
        }
        
        // Ajouter le message
        notificationContent += `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Ajouter le bouton de fermeture si activé
        if (config.dismissible) {
            notificationContent += `
                <button class="notification-close" aria-label="Fermer">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        // Ajouter la barre de progression si activée
        if (config.duration > 0 && config.showProgress) {
            notificationContent += `
                <div class="notification-progress">
                    <div class="notification-progress-bar"></div>
                </div>
            `;
        }
        
        notification.innerHTML = notificationContent;
        
        // Ajouter la notification au conteneur approprié
        const targetContainer = config.container || this.container;
        
        // Créer un conteneur pour la position spécifiée s'il n'existe pas
        let positionContainer = targetContainer.querySelector(`.notifications-${config.position}`);
        if (!positionContainer) {
            positionContainer = document.createElement('div');
            positionContainer.className = `notifications-position notifications-${config.position}`;
            targetContainer.appendChild(positionContainer);
        }
        
        // Ajouter la notification au conteneur de position
        positionContainer.appendChild(notification);
        
        // Forcer un recalcul pour activer la transition
        notification.offsetHeight;
        notification.classList.add('show');
        
        // Démarrer le minuteur de fermeture automatique si une durée est spécifiée
        let timeoutId;
        if (config.duration > 0) {
            // Démarrer la barre de progression
            if (config.showProgress) {
                const progressBar = notification.querySelector('.notification-progress-bar');
                if (progressBar) {
                    progressBar.style.transition = `width ${config.duration}ms linear`;
                    // Forcer un recalcul pour démarrer la transition
                    progressBar.offsetWidth;
                    progressBar.style.width = '0%';
                }
            }
            
            // Configurer la fermeture automatique
            timeoutId = setTimeout(() => {
                this.remove(id);
            }, config.duration);
            
            // Mettre en pause la fermeture automatique au survol si activé
            if (config.pauseOnHover) {
                notification.addEventListener('mouseenter', () => {
                    clearTimeout(timeoutId);
                    
                    // Mettre en pause l'animation de la barre de progression
                    const progressBar = notification.querySelector('.notification-progress-bar');
                    if (progressBar) {
                        const computedStyle = window.getComputedStyle(progressBar);
                        const width = computedStyle.getPropertyValue('width');
                        progressBar.style.transition = 'none';
                        progressBar.style.width = width;
                    }
                });
                
                notification.addEventListener('mouseleave', () => {
                    // Reprendre l'animation de la barre de progression
                    const progressBar = notification.querySelector('.notification-progress-bar');
                    if (progressBar) {
                        const remainingWidth = parseInt(progressBar.style.width || '100%');
                        const remainingTime = (remainingWidth / 100) * config.duration;
                        
                        progressBar.style.transition = `width ${remainingTime}ms linear`;
                        // Forcer un recalcul pour redémarrer la transition
                        progressBar.offsetWidth;
                        progressBar.style.width = '0%';
                    }
                    
                    // Redémarrer le minuteur de fermeture
                    timeoutId = setTimeout(() => {
                        this.remove(id);
                    }, (parseInt(progressBar?.style.width || '100') / 100) * config.duration);
                });
            }
        }
        
        // Gérer le clic sur le bouton de fermeture
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.remove(id);
            });
        }
        
        // Stocker les informations de la notification
        this.activeNotifications.add({
            id,
            element: notification,
            timeoutId,
            config
        });
        
        // Retourner l'ID de la notification
        return id;
    }
    
    /**
     * Supprimer une notification par son ID
     * @param {string} id - L'ID de la notification à supprimer
     */
    remove(id) {
        // Trouver la notification dans la liste des notifications actives
        let notification = null;
        for (const item of this.activeNotifications) {
            if (item.id === id) {
                notification = item;
                break;
            }
        }
        
        if (!notification) return;
        
        // Annuler le minuteur de fermeture automatique
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        
        // Ajouter une classe pour déclencher l'animation de sortie
        notification.element.classList.remove('show');
        notification.element.classList.add('hide');
        
        // Supprimer l'élément du DOM après l'animation
        notification.element.addEventListener('transitionend', () => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        }, { once: true });
        
        // Supprimer la notification de la liste des notifications actives
        this.activeNotifications.delete(notification);
    }
    
    /**
     * Supprimer toutes les notifications
     */
    clearAll() {
        this.activeNotifications.forEach(notification => {
            this.remove(notification.id);
        });
    }
    
    /**
     * Méthodes utilitaires pour les types de notifications courants
     */
    
    // Afficher une notification d'information
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }
    
    // Afficher une notification de succès
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }
    
    // Afficher un avertissement
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }
    
    // Afficher une erreur
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }
    
    // Afficher une notification de chargement
    loading(message = 'Chargement...', options = {}) {
        const id = this.show(message, { 
            ...options, 
            type: 'info',
            showIcon: true,
            duration: 0, // Ne pas fermer automatiquement
            dismissible: false
        });
        
        // Remplacer l'icône par un indicateur de chargement
        const notification = document.getElementById(id);
        if (notification) {
            const icon = notification.querySelector('.notification-icon i');
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
        }
        
        return id;
    }
    
    // Mettre à jour une notification existante
    update(id, message, options = {}) {
        // Supprimer la notification existante
        this.remove(id);
        
        // Créer une nouvelle notification avec les options mises à jour
        return this.show(message, options);
    }
}

// Créer une instance globale du gestionnaire de notifications
const notificationManager = new NotificationManager();

// Méthodes d'aide globales pour un accès facile
window.Notify = {
    // Afficher une notification
    show: (message, options) => notificationManager.show(message, options),
    
    // Méthodes raccourcies
    info: (message, options) => notificationManager.info(message, options),
    success: (message, options) => notificationManager.success(message, options),
    warning: (message, options) => notificationManager.warning(message, options),
    error: (message, options) => notificationManager.error(message, options),
    loading: (message, options) => notificationManager.loading(message, options),
    
    // Gestion des notifications
    remove: (id) => notificationManager.remove(id),
    clearAll: () => notificationManager.clearAll(),
    update: (id, message, options) => notificationManager.update(id, message, options)
};

// Initialiser le gestionnaire lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si le conteneur existe déjà
    if (!document.querySelector('.notifications-container')) {
        notificationManager.init();
    }
});

// Exporter l'instance et la classe
window.NotificationManager = NotificationManager;
window.notificationManager = notificationManager;

export { NotificationManager, notificationManager as default };

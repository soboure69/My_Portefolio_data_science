// Gestion des interactions utilisateur
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les gestionnaires d'événements
    initEventDelegation();
    initModals();
    initTabs();
    initAccordions();
    initTooltips();
    initFormValidation();
    
    // Détecter les appareils tactiles
    detectTouchDevice();
});

// Délégation d'événements pour une meilleure performance
function initEventDelegation() {
    // Gestion des clics sur le document
    document.addEventListener('click', function(e) {
        // Gérer les clics sur les boutons de menu mobile
        if (e.target.matches('.menu-toggle, .menu-toggle *')) {
            e.preventDefault();
            document.body.classList.toggle('menu-open');
            return;
        }
        
        // Gérer les clics sur les liens du menu mobile
        if (e.target.matches('.mobile-menu a')) {
            document.body.classList.remove('menu-open');
        }
        
        // Gérer les clics sur les liens de retour en haut
        if (e.target.closest('.back-to-top')) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // Gestion des touches du clavier
    document.addEventListener('keydown', function(e) {
        // Fermer le menu mobile avec la touche Échap
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            document.body.classList.remove('menu-open');
        }
        
        // Navigation au clavier dans les menus déroulants
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const dropdown = document.querySelector('.dropdown-menu[aria-expanded="true"]');
            if (dropdown) {
                e.preventDefault();
                handleDropdownKeyboardNav(e, dropdown);
            }
        }
    });
    
    // Gestion du défilement pour la navigation fixe
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const currentScroll = window.pageYOffset;
        
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

// Gestion des modales
function initModals() {
    // Fermer la modale lors du clic sur le fond
    document.addEventListener('click', function(e) {
        if (e.target.matches('.modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[aria-hidden="false"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

// Ouvrir une modale
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Stocker l'élément actif pour le focus plus tard
    const activeElement = document.activeElement;
    modal.setAttribute('data-previous-focus', activeElement.id || '');
    
    // Afficher la modale
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Déplacer le focus vers la modale
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
        focusable[0].focus();
    }
    
    // Piéger le focus à l'intérieur de la modale
    trapFocus(modal);
}

// Fermer une modale
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Masquer la modale
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Restaurer le focus sur l'élément précédent
    const previousFocusId = modal.getAttribute('data-previous-focus');
    if (previousFocusId) {
        const previousFocus = document.getElementById(previousFocusId);
        if (previousFocus) previousFocus.focus();
    }
}

// Piéger le focus dans une modale
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function trapTabKey(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });
}

// Gestion des onglets
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const tabs = tabContainer.querySelectorAll('[role="tab"]');
        const tabPanels = tabContainer.querySelectorAll('[role="tabpanel"]');
        
        // Masquer tous les panneaux sauf le premier
        tabPanels.forEach((panel, index) => {
            if (index !== 0) {
                panel.setAttribute('hidden', '');
            } else {
                panel.removeAttribute('hidden');
                tabs[0].setAttribute('aria-selected', 'true');
            }
        });
        
        // Gérer les clics sur les onglets
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // Désactiver tous les onglets
                tabs.forEach(t => {
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });
                
                // Masquer tous les panneaux
                tabPanels.forEach(panel => {
                    panel.setAttribute('hidden', '');
                });
                
                // Activer l'onglet cliqué
                this.setAttribute('aria-selected', 'true');
                this.removeAttribute('tabindex');
                this.focus();
                
                // Afficher le panneau correspondant
                const panelId = this.getAttribute('aria-controls');
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.removeAttribute('hidden');
                }
            });
            
            // Gérer la navigation au clavier
            tab.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    
                    // Déterminer la direction
                    const direction = e.key === 'ArrowLeft' ? -1 : 1;
                    const targetIndex = (index + direction + tabs.length) % tabs.length;
                    
                    // Activer l'onglet cible
                    tabs[targetIndex].click();
                    tabs[targetIndex].focus();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    tabs[0].click();
                    tabs[0].focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    tabs[tabs.length - 1].click();
                    tabs[tabs.length - 1].focus();
                }
            });
        });
    });
}

// Gestion des accordéons
function initAccordions() {
    document.querySelectorAll('.accordion').forEach(accordion => {
        const button = accordion.querySelector('[aria-expanded]');
        const content = accordion.querySelector('[aria-hidden]');
        
        if (!button || !content) return;
        
        button.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            content.setAttribute('aria-hidden', expanded);
            
            // Animer la hauteur du contenu
            if (!expanded) {
                content.style.height = 'auto';
                const height = content.offsetHeight + 'px';
                content.style.height = '0';
                
                // Forcer un recalcul pour démarrer l'animation
                content.offsetHeight;
                
                content.style.height = height;
                
                // Supprimer la hauteur après l'animation
                const onTransitionEnd = function() {
                    content.style.height = '';
                    content.removeEventListener('transitionend', onTransitionEnd);
                };
                
                content.addEventListener('transitionend', onTransitionEnd);
            } else {
                content.style.height = content.offsetHeight + 'px';
                
                // Forcer un recalcul pour démarrer l'animation
                content.offsetHeight;
                
                content.style.height = '0';
            }
        });
        
        // Gérer la touche Entrée/Espace
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Gestion des infobulles
function initTooltips() {
    let activeTooltip = null;
    
    document.addEventListener('mouseover', function(e) {
        const element = e.target.closest('[data-tooltip]');
        if (!element || activeTooltip) return;
        
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        // Créer l'infobulle
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        // Positionner l'infobulle
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
        
        document.body.appendChild(tooltip);
        activeTooltip = tooltip;
        
        // Supprimer l'infobulle lors du départ de la souris
        const onMouseLeave = function() {
            if (activeTooltip) {
                document.body.removeChild(activeTooltip);
                activeTooltip = null;
                element.removeEventListener('mouseleave', onMouseLeave);
            }
        };
        
        element.addEventListener('mouseleave', onMouseLeave);
    });
}

// Validation des formulaires
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        // Empêcher la soumission par défaut
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            this.classList.add('was-validated');
            
            // Ajouter une validation personnalisée si nécessaire
            validateForm(this);
        }, false);
        
        // Validation en temps réel
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
}

// Validation personnalisée des formulaires
function validateForm(form) {
    let isValid = true;
    
    // Exemple de validation personnalisée
    const password = form.querySelector('input[type="password"]');
    if (password) {
        if (password.value.length < 8) {
            showValidationError(password, 'Le mot de passe doit contenir au moins 8 caractères');
            isValid = false;
        }
    }
    
    // Ajouter d'autres validations personnalisées ici
    
    return isValid;
}

// Afficher un message d'erreur de validation
function showValidationError(input, message) {
    let errorElement = input.nextElementSibling;
    
    if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    
    errorElement.textContent = message;
    input.classList.add('is-invalid');
}

// Détecter les appareils tactiles
function detectTouchDevice() {
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.documentElement.classList.add('touch-device');
    } else {
        document.documentElement.classList.add('no-touch-device');
    }
}

// Gestion de la navigation au clavier dans les menus déroulants
function handleDropdownKeyboardNav(e, dropdown) {
    const items = dropdown.querySelectorAll('[role="menuitem"]');
    const currentItem = document.activeElement;
    let index = Array.from(items).indexOf(currentItem);
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        index = (index + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        index = (index - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
        e.preventDefault();
        index = 0;
    } else if (e.key === 'End') {
        e.preventDefault();
        index = items.length - 1;
    } else if (e.key === 'Escape') {
        e.preventDefault();
        dropdown.setAttribute('aria-expanded', 'false');
        const toggle = document.querySelector(`[aria-controls="${dropdown.id}"]`);
        if (toggle) toggle.focus();
        return;
    }
    
    if (index >= 0 && index < items.length) {
        items[index].focus();
    }
}

// Exporter les fonctions
window.Interactions = {
    openModal,
    closeModal,
    initTabs,
    initAccordions,
    initTooltips,
    validateForm
};

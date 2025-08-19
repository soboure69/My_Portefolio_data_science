// Gestion de l'accessibilité
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les fonctionnalités d'accessibilité
    initAccessibility();
    
    // Améliorer la navigation au clavier
    enhanceKeyboardNavigation();
    
    // Gérer les attributs ARIA dynamiques
    manageAriaAttributes();
    
    // Ajouter un sélecteur de taille de texte
    addTextSizeControls();
    
    // Ajouter un mode contraste élevé
    addHighContrastToggle();
    
    // Ajouter un lecteur d'écran
    addScreenReaderOnlyStyles();
    
    // Initialiser les composants accessibles
    initAccessibleComponents();
});

// Initialiser les fonctionnalités d'accessibilité de base
function initAccessibility() {
    // Ajouter la classe 'js-enabled' pour les améliorations progressives
    document.documentElement.classList.add('js-enabled');
    
    // Ajouter un attribut de langue si non défini
    if (!document.documentElement.lang) {
        document.documentElement.lang = 'fr';
    }
    
    // Ajouter un titre de page significatif s'il est manquant
    if (!document.title) {
        const h1 = document.querySelector('h1');
        if (h1) {
            document.title = `${h1.textContent} | Portfolio Data Science`;
        } else {
            document.title = 'Portfolio Data Science';
        }
    }
    
    // Vérifier et ajouter des attributs alt manquants aux images
    addMissingAltAttributes();
    
    // Vérifier le contraste des couleurs
    checkColorContrast();
}

// Améliorer la navigation au clavier
function enhanceKeyboardNavigation() {
    // Ajouter la navigation par tabulation aux éléments interactifs
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = document.querySelectorAll(focusableElements);
    
    // Ajouter tabindex="-1" aux éléments interactifs qui n'ont pas d'index de tabulation
    focusableContent.forEach(element => {
        if (element.getAttribute('tabindex') === null && 
            (element.getAttribute('role') === 'button' || 
             element.getAttribute('role') === 'link')) {
            element.setAttribute('tabindex', '0');
        }
    });
    
    // Gérer la navigation par tabulation dans les modales et les menus déroulants
    document.addEventListener('keydown', function(e) {
        // Vérifier si la touche Tab est enfoncée
        if (e.key === 'Tab') {
            // Gérer la navigation dans les modales
            const modal = document.querySelector('.modal[role="dialog"][aria-modal="true"]');
            if (modal && modal.style.display !== 'none') {
                handleModalTabNavigation(e, modal);
            }
            
            // Gérer la navigation dans les menus déroulants
            const dropdown = document.querySelector('.dropdown-menu[aria-expanded="true"]');
            if (dropdown) {
                handleDropdownTabNavigation(e, dropdown);
            }
        }
        
        // Fermer les menus déroulants avec la touche Échap
        if (e.key === 'Escape') {
            const openDropdowns = document.querySelectorAll('.dropdown-menu[aria-expanded="true"]');
            openDropdowns.forEach(dropdown => {
                dropdown.setAttribute('aria-expanded', 'false');
                const toggle = document.querySelector(`[aria-controls="${dropdown.id}"]`);
                if (toggle) {
                    toggle.focus();
                }
            });
            
            // Fermer les modales avec la touche Échap
            const openModal = document.querySelector('.modal[aria-modal="true"]');
            if (openModal && openModal.style.display !== 'none') {
                closeModal(openModal.id);
            }
        }
    });
    
    // Gérer le focus pour les éléments masqués
    document.addEventListener('focusin', function(e) {
        const target = e.target;
        
        // Vérifier si l'élément cible est dans un élément masqué
        if (isElementHidden(target)) {
            // Trouver le premier élément focusable parent non masqué
            let parent = target.parentElement;
            while (parent && parent !== document.body) {
                if (!isElementHidden(parent) && parent.getAttribute('tabindex') !== '-1') {
                    parent.focus();
                    break;
                }
                parent = parent.parentElement;
            }
        }
    });
}

// Vérifier si un élément est masqué
function isElementHidden(element) {
    if (!element) return true;
    
    const style = window.getComputedStyle(element);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           element.getAttribute('aria-hidden') === 'true' ||
           element.hasAttribute('hidden') ||
           element.getAttribute('role') === 'presentation';
}

// Gérer la navigation par tabulation dans les modales
function handleModalTabNavigation(event, modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Si seul l'élément modal est focusable, empêcher la tabulation
    if (focusableElements.length === 1) {
        event.preventDefault();
        return;
    }
    
    // Si la touche Maj+Tab est enfoncée et que le focus est sur le premier élément
    if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
    } 
    // Si la touche Tab est enfoncée et que le focus est sur le dernier élément
    else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
    }
}

// Gérer la navigation par tabulation dans les menus déroulants
function handleDropdownTabNavigation(event, dropdown) {
    const focusableElements = dropdown.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Si la touche Maj+Tab est enfoncée et que le focus est sur le premier élément
    if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
    } 
    // Si la touche Tab est enfoncée et que le focus est sur le dernier élément
    else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
    }
}

// Gérer les attributs ARIA dynamiques
function manageAriaAttributes() {
    // Mettre à jour les attributs aria-expanded pour les boutons de bascule
    document.querySelectorAll('[aria-expanded]').forEach(button => {
        button.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            
            // Mettre à jour l'attribut aria-controls si nécessaire
            const controls = this.getAttribute('aria-controls');
            if (controls) {
                const controlledElement = document.getElementById(controls);
                if (controlledElement) {
                    controlledElement.setAttribute('aria-hidden', expanded);
                    
                    // Gérer le focus pour l'accessibilité
                    if (!expanded) {
                        const firstFocusable = controlledElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (firstFocusable) {
                            setTimeout(() => firstFocusable.focus(), 0);
                        }
                    }
                }
            }
        });
    });
    
    // Mettre à jour les attributs aria-current pour la navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll(`a[href*="${currentPage}"]`).forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.setAttribute('aria-current', 'page');
        }
    });
    
    // Ajouter des attributs ARIA aux éléments interactifs personnalisés
    document.querySelectorAll('.custom-checkbox, .custom-radio, .custom-select').forEach(element => {
        if (!element.hasAttribute('role')) {
            if (element.classList.contains('custom-checkbox')) {
                element.setAttribute('role', 'checkbox');
                if (!element.hasAttribute('aria-checked')) {
                    element.setAttribute('aria-checked', 'false');
                }
            } else if (element.classList.contains('custom-radio')) {
                element.setAttribute('role', 'radio');
                if (!element.hasAttribute('aria-checked')) {
                    element.setAttribute('aria-checked', 'false');
                }
            } else if (element.classList.contains('custom-select')) {
                element.setAttribute('role', 'combobox');
                element.setAttribute('aria-haspopup', 'listbox');
                if (!element.hasAttribute('aria-expanded')) {
                    element.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });
}

// Ajouter des attributs alt manquants aux images
function addMissingAltAttributes() {
    document.querySelectorAll('img:not([alt])').forEach(img => {
        // Vérifier si l'image est décorative
        const isDecorative = img.getAttribute('role') === 'presentation' || 
                            img.getAttribute('aria-hidden') === 'true' ||
                            img.parentElement.getAttribute('role') === 'presentation';
        
        if (isDecorative) {
            img.setAttribute('alt', '');
            img.setAttribute('role', 'presentation');
        } else {
            // Essayer de générer un texte alternatif à partir du contexte
            const altText = generateAltText(img);
            img.setAttribute('alt', altText);
        }
    });
    
    // Ajouter des étiquettes aux éléments de formulaire
    document.querySelectorAll('input:not([id]), select:not([id]), textarea:not([id])').forEach(input => {
        if (!input.id) {
            const uniqueId = 'input-' + Math.random().toString(36).substr(2, 9);
            input.id = uniqueId;
            
            // Créer une étiquette si elle n'existe pas
            if (!input.previousElementSibling || 
                !input.previousElementSibling.matches('label') || 
                !input.previousElementSibling.getAttribute('for')) {
                const label = document.createElement('label');
                label.setAttribute('for', uniqueId);
                label.textContent = input.getAttribute('placeholder') || 'Champ de saisie';
                input.insertAdjacentElement('beforebegin', label);
            }
        }
    });
}

// Générer un texte alternatif pour une image
function generateAltText(img) {
    // Essayer de trouver un contexte pour générer un texte alternatif
    if (img.getAttribute('data-alt')) {
        return img.getAttribute('data-alt');
    }
    
    if (img.title) {
        return img.title;
    }
    
    const parent = img.parentElement;
    if (parent && parent.getAttribute('aria-label')) {
        return parent.getAttribute('aria-label');
    }
    
    // Essayer de trouver un texte à proximité
    const figcaption = img.closest('figure')?.querySelector('figcaption');
    if (figcaption) {
        return figcaption.textContent.trim();
    }
    
    const heading = img.previousElementSibling;
    if (heading && /^h[1-6]$/i.test(heading.tagName)) {
        return heading.textContent.trim();
    }
    
    // Texte alternatif générique si aucun contexte n'est trouvé
    return 'Image sans description';
}

// Vérifier le contraste des couleurs
function checkColorContrast() {
    // Cette fonction nécessiterait une implémentation plus complexe pour analyser le contraste
    // Pour l'instant, nous nous contentons d'ajouter une classe si le contraste est insuffisant
    const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
    
    elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        
        // Vérifier le contraste (simplifié)
        if (!hasSufficientContrast(bgColor, textColor)) {
            element.classList.add('low-contrast');
        }
    });
}

// Vérifier si le contraste est suffisant (simplifié)
function hasSufficientContrast(bgColor, textColor) {
    // Implémentation simplifiée - utiliser une bibliothèque comme tinycolor2 pour une vérification précise
    return true; // À implémenter correctement
}

// Ajouter des contrôles de taille de texte
function addTextSizeControls() {
    // Créer le conteneur des contrôles
    const controls = document.createElement('div');
    controls.className = 'accessibility-controls';
    controls.setAttribute('role', 'toolbar');
    controls.setAttribute('aria-label', 'Contrôles d\'accessibilité');
    
    // Bouton pour augmenter la taille du texte
    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'text-size-control';
    increaseBtn.setAttribute('aria-label', 'Augmenter la taille du texte');
    increaseBtn.innerHTML = '<span aria-hidden="true">A+</span>';
    increaseBtn.addEventListener('click', () => changeTextSize(1.2));
    
    // Bouton pour réinitialiser la taille du texte
    const resetBtn = document.createElement('button');
    resetBtn.className = 'text-size-control';
    resetBtn.setAttribute('aria-label', 'Réinitialiser la taille du texte');
    resetBtn.innerHTML = '<span aria-hidden="true">A</span>';
    resetBtn.addEventListener('click', () => changeTextSize(1));
    
    // Bouton pour diminuer la taille du texte
    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'text-size-control';
    decreaseBtn.setAttribute('aria-label', 'Diminuer la taille du texte');
    decreaseBtn.innerHTML = '<span aria-hidden="true">A-</span>';
    decreaseBtn.addEventListener('click', () => changeTextSize(0.8));
    
    // Ajouter les boutons au conteneur
    controls.appendChild(increaseBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(decreaseBtn);
    
    // Ajouter les contrôles à la page
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(controls);
    } else {
        document.body.insertBefore(controls, document.body.firstChild);
    }
    
    // Charger la taille du texte sauvegardée
    const savedTextSize = localStorage.getItem('textSize');
    if (savedTextSize) {
        changeTextSize(parseFloat(savedTextSize), false);
    }
}

// Changer la taille du texte
function changeTextSize(factor, savePreference = true) {
    const html = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(html).fontSize) || 16;
    const newSize = Math.max(12, Math.min(24, currentSize * factor));
    
    // Appliquer la nouvelle taille
    html.style.fontSize = `${newSize}px`;
    
    // Sauvegarder la préférence
    if (savePreference) {
        localStorage.setItem('textSize', newSize / 16); // Enregistrer le facteur d'échelle
    }
}

// Ajouter un bouton de basculement de contraste élevé
function addHighContrastToggle() {
    const toggle = document.createElement('button');
    toggle.id = 'high-contrast-toggle';
    toggle.className = 'accessibility-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML = '<span aria-hidden="true">☀️</span> <span class="sr-only">Mode contraste élevé</span>';
    
    // Vérifier la préférence enregistrée
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
        document.documentElement.classList.add('high-contrast');
        toggle.setAttribute('aria-pressed', 'true');
    }
    
    // Gérer le clic sur le bouton
    toggle.addEventListener('click', function() {
        const isPressed = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', !isPressed);
        document.documentElement.classList.toggle('high-contrast');
        localStorage.setItem('high-contrast', !isPressed);
    });
    
    // Ajouter le bouton à la page
    const controls = document.querySelector('.accessibility-controls');
    if (controls) {
        controls.appendChild(toggle);
    } else {
        document.body.insertBefore(toggle, document.body.firstChild);
    }
}

// Ajouter des styles pour le lecteur d'écran uniquement
function addScreenReaderOnlyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: #000;
            color: white;
            padding: 8px;
            z-index: 100;
            transition: top 0.3s;
        }
        
        .skip-link:focus {
            top: 0;
        }
        
        .focus-visible:focus {
            outline: 3px solid #4d90fe;
            outline-offset: 2px;
        }
    `;
    
    document.head.appendChild(style);
    
    // Ajouter un lien d'évitement
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Aller au contenu principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialiser les composants accessibles
function initAccessibleComponents() {
    // Initialiser les composants personnalisés
    initCustomSelects();
    initCustomCheckboxes();
    initCustomRadios();
    initModalDialogs();
    initTooltips();
    initTabs();
    initAccordions();
    initCarousels();
}

// Initialiser les sélecteurs personnalisés
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(select => {
        // À implémenter: créer un sélecteur personnalisé accessible
    });
}

// Initialiser les cases à cocher personnalisées
function initCustomCheckboxes() {
    document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
        // À implémenter: créer une case à cocher personnalisée accessible
    });
}

// Initialiser les boutons radio personnalisés
function initCustomRadios() {
    document.querySelectorAll('.custom-radio').forEach(radio => {
        // À implémenter: créer un bouton radio personnalisé accessible
    });
}

// Initialiser les boîtes de dialogue modales
function initModalDialogs() {
    document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
        // À implémenter: créer une boîte de dialogue modale accessible
    });
}

// Initialiser les infobulles
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        // À implémenter: créer une infobulle accessible
    });
}

// Initialiser les onglets
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        // À implémenter: créer des onglets accessibles
    });
}

// Initialiser les accordéons
function initAccordions() {
    document.querySelectorAll('.accordion').forEach(accordion => {
        // À implémenter: créer un accordéon accessible
    });
}

// Initialiser les carrousels
function initCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        // À implémenter: créer un carrousel accessible
    });
}

// Exposer les fonctions au scope global
window.Accessibility = {
    initAccessibility,
    enhanceKeyboardNavigation,
    manageAriaAttributes,
    addMissingAltAttributes,
    checkColorContrast,
    addTextSizeControls,
    addHighContrastToggle,
    addScreenReaderOnlyStyles,
    initAccessibleComponents
};

// Détection des fonctionnalités
if ('querySelector' in document && 'addEventListener' in window) {
    // Le navigateur prend en charge les fonctionnalités nécessaires
    document.documentElement.classList.add('js');
}

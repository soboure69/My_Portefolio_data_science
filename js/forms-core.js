/**
 * Gestion des formulaires - Version allégée
 * Fournit les fonctionnalités essentielles de validation et de soumission
 */

class FormManager {
    constructor() {
        this.config = {
            classes: {
                error: 'error',
                valid: 'valid',
                loading: 'loading'
            },
            selectors: {
                form: 'form[data-validate]',
                input: 'input, textarea, select',
                submit: '[type="submit"]'
            },
            messages: {
                required: 'Ce champ est obligatoire',
                email: 'Email invalide',
                pattern: 'Format incorrect'
            }
        };
        
        this.forms = new Map();
        this.init();
    }
    
    init() {
        document.querySelectorAll(this.config.selectors.form).forEach(form => {
            this.setupForm(form);
        });
        
        // Gérer les formulaires chargés dynamiquement
        const observer = new MutationObserver(() => {
            document.querySelectorAll(this.config.selectors.form).forEach(form => {
                if (!this.forms.has(form)) {
                    this.setupForm(form);
                }
            });
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
    
    setupForm(form) {
        if (this.forms.has(form)) return;
        
        const formData = {
            element: form,
            inputs: [],
            state: 'pristine'
        };
        
        // Configurer les champs
        form.querySelectorAll(this.config.selectors.input).forEach(input => {
            this.setupInput(input, formData);
        });
        
        // Gérer la soumission
        form.addEventListener('submit', (e) => this.handleSubmit(e, formData));
        
        this.forms.set(form, formData);
    }
    
    setupInput(input, formData) {
        // Ignorer les boutons
        if (input.type === 'submit' || input.type === 'button') return;
        
        formData.inputs.push(input);
        
        // Validation en temps réel
        input.addEventListener('blur', () => this.validateInput(input));
        
        // Réinitialiser l'état de validation lors de la modification
        input.addEventListener('input', () => {
            if (input.classList.contains(this.config.classes.error)) {
                this.clearError(input);
            }
        });
    }
    
    validateInput(input) {
        let isValid = true;
        let message = '';
        
        // Vérification requise
        if (input.required && !input.value.trim()) {
            isValid = false;
            message = this.config.messages.required;
        }
        
        // Validation d'email
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                message = this.config.messages.email;
            }
        }
        
        // Validation par motif
        if (input.pattern) {
            const regex = new RegExp(input.pattern);
            if (!regex.test(input.value)) {
                isValid = false;
                message = input.dataset.error || this.config.messages.pattern;
            }
        }
        
        // Mettre à jour l'interface
        if (!isValid) {
            this.showError(input, message);
        } else {
            this.clearError(input);
        }
        
        return isValid;
    }
    
    showError(input, message) {
        this.clearError(input);
        
        // Ajouter la classe d'erreur
        input.classList.add(this.config.classes.error);
        
        // Créer le message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Insérer après le champ
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    
    clearError(input) {
        input.classList.remove(this.config.classes.error);
        
        // Supprimer le message d'erreur existant
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
    }
    
    async handleSubmit(e, formData) {
        e.preventDefault();
        
        let isValid = true;
        
        // Valider tous les champs
        formData.inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            return false;
        }
        
        // Préparer les données du formulaire
        const formDataObj = new FormData(formData.element);
        const data = {};
        
        for (let [key, value] of formDataObj.entries()) {
            data[key] = value;
        }
        
        // Gérer la soumission
        try {
            formData.state = 'loading';
            formData.element.classList.add(this.config.classes.loading);
            
            // Désactiver le bouton de soumission
            const submitButton = formData.element.querySelector(this.config.selectors.submit);
            if (submitButton) {
                submitButton.disabled = true;
            }
            
            // Ici, vous pouvez ajouter votre logique d'envoi AJAX
            console.log('Données du formulaire:', data);
            
            // Simuler un délai de requête
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simuler une réponse réussie
            this.handleSuccess(formData);
            
        } catch (error) {
            this.handleError(formData, error);
        }
    }
    
    handleSuccess(formData) {
        formData.state = 'submitted';
        formData.element.classList.remove(this.config.classes.loading);
        
        // Réactiver le bouton de soumission
        const submitButton = formData.element.querySelector(this.config.selectors.submit);
        if (submitButton) {
            submitButton.disabled = false;
        }
        
        // Afficher un message de succès ou rediriger
        console.log('Formulaire soumis avec succès');
        
        // Réinitialiser le formulaire si nécessaire
        if (formData.element.dataset.resetOnSuccess) {
            formData.element.reset();
        }
        
        // Déclencher un événement personnalisé
        const event = new CustomEvent('form:success', { 
            detail: { form: formData.element },
            bubbles: true
        });
        
        formData.element.dispatchEvent(event);
    }
    
    handleError(formData, error) {
        formData.state = 'error';
        formData.element.classList.remove(this.config.classes.loading);
        
        // Réactiver le bouton de soumission
        const submitButton = formData.element.querySelector(this.config.selectors.submit);
        if (submitButton) {
            submitButton.disabled = false;
        }
        
        console.error('Erreur lors de la soumission du formulaire:', error);
        
        // Afficher un message d'erreur global
        const errorContainer = formData.element.querySelector('.form-errors') || 
                             this.createErrorContainer(formData.element);
        
        errorContainer.textContent = 'Une erreur est survenue. Veuillez réessayer.';
        errorContainer.style.display = 'block';
        
        // Déclencher un événement personnalisé
        const event = new CustomEvent('form:error', { 
            detail: { 
                form: formData.element,
                error: error
            },
            bubbles: true
        });
        
        formData.element.dispatchEvent(event);
    }
    
    createErrorContainer(form) {
        const container = document.createElement('div');
        container.className = 'form-errors';
        container.style.display = 'none';
        container.style.color = 'red';
        container.style.margin = '10px 0';
        
        // Insérer au début du formulaire
        form.insertBefore(container, form.firstChild);
        
        return container;
    }
}

// Initialiser le gestionnaire de formulaires
document.addEventListener('DOMContentLoaded', () => {
    window.formManager = new FormManager();
});

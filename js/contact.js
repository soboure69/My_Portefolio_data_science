// Gestion du formulaire de contact
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialisation des champs du formulaire
    initFormFields();
});

// Fonction pour gérer la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Désactiver le bouton de soumission
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Envoi en cours...
    `;
    
    try {
        // Récupérer les données du formulaire
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        
        // Valider les champs du formulaire
        const validationErrors = validateForm(formValues);
        
        if (Object.keys(validationErrors).length > 0) {
            displayFormErrors(validationErrors);
            return;
        }
        
        // Envoyer le formulaire
        const response = await submitForm(formValues);
        
        if (response.success) {
            // Afficher le message de succès
            showFormMessage(
                'Message envoyé avec succès ! Je vous répondrai dès que possible.',
                'success'
            );
            
            // Réinitialiser le formulaire
            form.reset();
        } else {
            throw new Error(response.message || 'Une erreur est survenue lors de l\'envoi du message.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire :', error);
        
        // Afficher le message d'erreur
        showFormMessage(
            error.message || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.',
            'error'
        );
    } finally {
        // Réactiver le bouton de soumission
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Fonction pour valider les champs du formulaire
function validateForm(formData) {
    const errors = {};
    
    // Valider le nom
    if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Veuillez entrer votre nom.';
    }
    
    // Valider l'email
    if (!formData.email || formData.email.trim() === '') {
        errors.email = 'Veuillez entrer votre adresse email.';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Veuillez entrer une adresse email valide.';
    }
    
    // Valider le sujet
    if (!formData.subject || formData.subject.trim() === '') {
        errors.subject = 'Veuvez entrer un sujet.';
    }
    
    // Valider le message
    if (!formData.message || formData.message.trim() === '') {
        errors.message = 'Veuillez entrer votre message.';
    } else if (formData.message.length < 10) {
        errors.message = 'Votre message doit contenir au moins 10 caractères.';
    }
    
    return errors;
}

// Fonction pour vérifier si une adresse email est valide
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour afficher les erreurs de validation
function displayFormErrors(errors) {
    // Supprimer les messages d'erreur existants
    const existingErrorMessages = document.querySelectorAll('.error-message');
    existingErrorMessages.forEach(el => el.remove());
    
    // Supprimer les classes d'erreur des champs
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('has-error');
    });
    
    // Afficher les nouvelles erreurs
    Object.entries(errors).forEach(([field, message]) => {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('has-error');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message text-red-500 text-sm mt-1';
                errorElement.textContent = message;
                
                input.insertAdjacentElement('afterend', errorElement);
            }
        }
    });
    
    // Faire défiler jusqu'au premier champ en erreur
    const firstErrorField = document.querySelector('.has-error');
    if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Fonction pour afficher un message à l'utilisateur
function showFormMessage(message, type = 'info') {
    // Supprimer les messages existants
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(el => el.remove());
    
    // Créer le nouvel élément de message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message p-4 mb-6 rounded-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' : 
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
    }`;
    
    messageElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                  type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                  '<i class="fas fa-info-circle"></i>'}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button type="button" class="close-message text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Ajouter le message avant le formulaire
    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(messageElement, form);
    
    // Ajouter un écouteur d'événement pour fermer le message
    const closeButton = messageElement.querySelector('.close-message');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            messageElement.remove();
        });
    }
    
    // Fermer automatiquement le message après 10 secondes
    setTimeout(() => {
        if (document.body.contains(messageElement)) {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }
    }, 10000);
}

// Fonction pour initialiser les champs du formulaire
function initFormFields() {
    // Ajouter des écouteurs d'événements pour la validation en temps réel
    const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('has-error');
                
                const errorMessage = formGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    });
    
    // Initialiser les tooltips
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', showTooltip);
        trigger.addEventListener('mouseleave', hideTooltip);
        trigger.addEventListener('focus', showTooltip);
        trigger.addEventListener('blur', hideTooltip);
    });
}

// Fonction pour afficher un tooltip
function showTooltip(event) {
    const tooltipText = this.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    // Supprimer les tooltips existants
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    // Créer le tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip absolute z-50 bg-gray-900 text-white text-xs rounded px-2 py-1';
    tooltip.textContent = tooltipText;
    
    // Positionner le tooltip
    const rect = this.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 30}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    
    // Ajouter le tooltip au document
    document.body.appendChild(tooltip);
    
    // Ajuster la position après l'ajout pour obtenir les dimensions réelles
    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    
    // Vérifier si le tooltip dépasse de l'écran
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
    }
    if (tooltipRect.left < 0) {
        tooltip.style.left = '10px';
    }
}

// Fonction pour masquer un tooltip
function hideTooltip() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// Fonction pour soumettre le formulaire (à personnaliser selon votre backend)
async function submitForm(formData) {
    // Ici, vous devez implémenter la logique pour envoyer les données du formulaire
    // à votre serveur ou à un service tiers comme Formspree, Netlify Forms, etc.
    
    // Exemple avec l'API Fetch (à adapter selon votre backend)
    try {
        const response = await fetch('https://votre-api.com/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi du formulaire');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw new Error('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
    }
    
    // Pour une solution sans backend, vous pouvez utiliser un service comme Formspree ou EmailJS
    // Voici un exemple avec EmailJS (nécessite une configuration préalable) :
    /*
    try {
        await emailjs.send(
            'votre_service_id',
            'votre_template_id',
            formData,
            'votre_utilisateur_id'
        );
        return { success: true };
    } catch (error) {
        console.error('Erreur EmailJS:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.');
    }
    */
}

// Exporter les fonctions pour une utilisation dans d'autres fichiers
window.ContactForm = {
    initFormFields,
    handleFormSubmit,
    validateForm,
    displayFormErrors,
    showFormMessage,
    submitForm
};

// Gestion du thème (sombre/clair) et des préférences utilisateur
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le thème
    initTheme();
    
    // Configurer le sélecteur de thème
    setupThemeToggle();
    
    // Sauvegarder les préférences utilisateur
    saveUserPreferences();
});

// Initialiser le thème en fonction des préférences
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Vérifier le thème sauvegardé ou utiliser les préférences système
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = prefersDarkScheme.matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) themeToggle.checked = true;
    }
    
    // Mettre à jour l'icône du thème
    updateThemeIcon();
    
    // Détecter les changements de préférence système
    prefersDarkScheme.addListener(e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            updateThemeIcon();
        }
    });
}

// Configurer le bouton de bascule du thème
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        updateThemeIcon();
    });
    
    // Ajouter un gestionnaire pour le clavier
    themeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.checked = !this.checked;
            this.dispatchEvent(new Event('change'));
        }
    });
}

// Mettre à jour l'icône du thème
function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const themeIcons = document.querySelectorAll('.theme-icon');
    const themeToggle = document.getElementById('theme-toggle');
    
    themeIcons.forEach(icon => {
        const iconType = icon.getAttribute('data-icon');
        
        if (isDark && iconType === 'moon') {
            icon.classList.add('hidden');
        } else if (!isDark && iconType === 'sun') {
            icon.classList.add('hidden');
        } else {
            icon.classList.remove('hidden');
        }
    });
    
    // Mettre à jour l'aria-label pour l'accessibilité
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', isDark ? 'Basculer en mode clair' : 'Basculer en mode sombre');
    }
}

// Sauvegarder les préférences utilisateur
function saveUserPreferences() {
    // Détecter la préférence de réduction de mouvement
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.documentElement.classList.add('reduce-motion');
    }
    
    // Détecter la préférence de contraste
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    
    if (prefersHighContrast) {
        document.documentElement.classList.add('high-contrast');
    }
    
    // Détecter la préférence de transparence
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    
    if (prefersReducedTransparency) {
        document.documentElement.classList.add('reduce-transparency');
    }
}

// Basculer entre les thèmes manuellement
function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = !themeToggle.checked;
        themeToggle.dispatchEvent(new Event('change'));
    } else {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
    }
}

// Réinitialiser les préférences de thème aux paramètres système
function resetThemeToSystem() {
    localStorage.removeItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersDarkScheme.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = prefersDarkScheme.matches;
    }
    
    updateThemeIcon();
}

// Exposer les fonctions au scope global
window.Theme = {
    toggleTheme,
    resetThemeToSystem,
    updateThemeIcon
};

// Détecter les changements de préférences système
window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcon();
    }
});

// Détecter les changements de réduction de mouvement
window.matchMedia('(prefers-reduced-motion: reduce)').addListener(e => {
    if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
    } else {
        document.documentElement.classList.remove('reduce-motion');
    }
});

// Détecter les changements de contraste
window.matchMedia('(prefers-contrast: more)').addListener(e => {
    if (e.matches) {
        document.documentElement.classList.add('high-contrast');
    } else {
        document.documentElement.classList.remove('high-contrast');
    }
});

// Détecter les changements de transparence
if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    document.documentElement.classList.add('reduce-transparency');
}

// Ajouter des classes pour le chargement progressif
document.documentElement.classList.add('js-enabled');

// Initialiser les animations après le chargement de la page
window.addEventListener('load', function() {
    document.documentElement.classList.add('loaded');
});

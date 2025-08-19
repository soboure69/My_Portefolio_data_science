/**
 * Gestionnaire de thème pour l'application
 * Gère le mode sombre/clair et la persistance des préférences utilisateur
 */

class ThemeManager {
    constructor() {
        // Définir les noms des classes et des attributs
        this.classes = {
            dark: 'dark-theme',
            light: 'light-theme',
            system: 'system-theme'
        };
        
        // Définir les clés de stockage
        this.storageKey = 'user-theme-preference';
        
        // État actuel du thème
        this.currentTheme = null;
        
        // Référence à l'élément racine
        this.root = document.documentElement;
        
        // Écouter les changements de préférence système
        this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.prefersLightScheme = window.matchMedia('(prefers-color-scheme: light)');
        this.prefersNoPreference = window.matchMedia('(prefers-color-scheme: no-preference)');
    }
    
    /**
     * Initialiser le gestionnaire de thème
     */
    init() {
        // Vérifier si le thème est déjà défini dans le stockage local
        const savedTheme = this.getSavedTheme();
        
        // Appliquer le thème sauvegardé ou utiliser les préférences système
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('system');
        }
        
        // Écouter les changements de préférence système
        this.prefersDarkScheme.addListener(() => this.handleSystemThemeChange());
        this.prefersLightScheme.addListener(() => this.handleSystemThemeChange());
        
        // Initialiser les écouteurs d'événements pour les contrôles de thème
        this.initThemeSwitchers();
        
        // Émettre un événement personnalisé pour indiquer que le thème est chargé
        document.dispatchEvent(new CustomEvent('theme:loaded', {
            detail: { theme: this.currentTheme }
        }));
        
        console.log('Gestionnaire de thème initialisé avec le thème:', this.currentTheme);
    }
    
    /**
     * Définir le thème actuel
     * @param {string} theme - Le nom du thème à appliquer ('dark', 'light' ou 'system')
     */
    setTheme(theme) {
        // Valider le thème
        if (!['dark', 'light', 'system'].includes(theme)) {
            console.warn(`Thème non valide: ${theme}. Utilisation du thème système.`);
            theme = 'system';
        }
        
        // Mettre à jour le thème actuel
        this.currentTheme = theme;
        
        // Supprimer toutes les classes de thème existantes
        Object.values(this.classes).forEach(className => {
            this.root.classList.remove(className);
        });
        
        // Appliquer le thème sélectionné
        if (theme === 'system') {
            this.applySystemTheme();
            this.root.classList.add(this.classes.system);
        } else {
            this.root.classList.add(this.classes[theme]);
            this.root.setAttribute('data-theme', theme);
        }
        
        // Sauvegarder la préférence utilisateur
        this.saveThemePreference(theme);
        
        // Mettre à jour les contrôles de l'interface utilisateur
        this.updateThemeSwitchers(theme);
        
        // Émettre un événement personnalisé pour indiquer le changement de thème
        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { theme }
        }));
        
        console.log('Thème défini sur:', theme);
    }
    
    /**
     * Appliquer le thème système
     */
    applySystemTheme() {
        if (this.prefersDarkScheme.matches) {
            this.root.classList.add(this.classes.dark);
            this.root.setAttribute('data-theme', 'dark');
        } else if (this.prefersLightScheme.matches) {
            this.root.classList.add(this.classes.light);
            this.root.setAttribute('data-theme', 'light');
        } else {
            // Par défaut, utiliser le thème clair
            this.root.classList.add(this.classes.light);
            this.root.setAttribute('data-theme', 'light');
        }
    }
    
    /**
     * Gérer le changement de thème système
     */
    handleSystemThemeChange() {
        if (this.currentTheme === 'system') {
            this.applySystemTheme();
            
            // Émettre un événement personnalisé pour indiquer le changement de thème
            document.dispatchEvent(new CustomEvent('theme:system-changed', {
                detail: { 
                    isDark: this.prefersDarkScheme.matches,
                    isLight: this.prefersLightScheme.matches
                }
            }));
            
            console.log('Thème système changé:', this.prefersDarkScheme.matches ? 'sombre' : 'clair');
        }
    }
    
    /**
     * Basculer entre les thèmes sombre et clair
     */
    toggleTheme() {
        if (this.currentTheme === 'dark') {
            this.setTheme('light');
        } else if (this.currentTheme === 'light') {
            this.setTheme('dark');
        } else {
            // Si le thème est sur 'system', basculer en fonction du thème système actuel
            this.setTheme(this.prefersDarkScheme.matches ? 'light' : 'dark');
        }
    }
    
    /**
     * Obtenir le thème actuellement actif (en tenant compte du thème système)
     * @returns {string} 'dark' ou 'light'
     */
    getActiveTheme() {
        if (this.currentTheme === 'system') {
            return this.prefersDarkScheme.matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }
    
    /**
     * Sauvegarder la préférence de thème de l'utilisateur
     * @param {string} theme - Le nom du thème à sauvegarder
     */
    saveThemePreference(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('Impossible d\'enregistrer la préférence de thème:', error);
        }
    }
    
    /**
     * Obtenir le thème sauvegardé
     * @returns {string|null} Le nom du thème sauvegardé ou null
     */
    getSavedTheme() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (error) {
            console.warn('Impossible de récupérer la préférence de thème:', error);
            return null;
        }
    }
    
    /**
     * Réinitialiser les préférences de thème
     */
    resetThemePreference() {
        try {
            localStorage.removeItem(this.storageKey);
            this.setTheme('system');
            console.log('Préférences de thème réinitialisées');
        } catch (error) {
            console.warn('Impossible de réinitialiser les préférences de thème:', error);
        }
    }
    
    /**
     * Initialiser les commutateurs de thème dans l'interface utilisateur
     */
    initThemeSwitchers() {
        // Sélectionner tous les boutons de basculement de thème
        const themeSwitchers = document.querySelectorAll('[data-theme-switch]');
        
        themeSwitchers.forEach(switcher => {
            switcher.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = switcher.getAttribute('data-theme-switch');
                this.setTheme(theme);
            });
        });
        
        // Sélectionner le sélecteur de thème
        const themeSelect = document.querySelector('[data-theme-selector]');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
        
        // Mettre à jour l'état initial des commutateurs
        this.updateThemeSwitchers(this.currentTheme);
    }
    
    /**
     * Mettre à jour l'état des commutateurs de thème
     * @param {string} theme - Le thème actuel
     */
    updateThemeSwitchers(theme) {
        // Mettre à jour les boutons de basculement
        document.querySelectorAll('[data-theme-switch]').forEach(switcher => {
            const switcherTheme = switcher.getAttribute('data-theme-switch');
            const isActive = switcherTheme === theme;
            
            switcher.setAttribute('aria-pressed', isActive);
            switcher.classList.toggle('active', isActive);
            
            // Mettre à jour les icônes si elles existent
            const icon = switcher.querySelector('i, svg');
            if (icon) {
                const iconName = switcherTheme === 'dark' ? 'moon' : 
                                switcherTheme === 'light' ? 'sun' : 'adjust';
                
                // Mettre à jour l'icône (ajuster en fonction de votre bibliothèque d'icônes)
                if (icon.tagName === 'I') {
                    icon.className = `fas fa-${iconName}`;
                } else if (icon.tagName === 'svg') {
                    // Mettre à jour l'icône SVG si nécessaire
                }
            }
        });
        
        // Mettre à jour le sélecteur de thème
        const themeSelect = document.querySelector('[data-theme-selector]');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }
    
    /**
     * Activer le mode sombre
     */
    enableDarkMode() {
        this.setTheme('dark');
    }
    
    /**
     * Activer le mode clair
     */
    enableLightMode() {
        this.setTheme('light');
    }
    
    /**
     * Utiliser les préférences système
     */
    useSystemPreference() {
        this.setTheme('system');
    }
}

// Créer une instance globale du gestionnaire de thème
const themeManager = new ThemeManager();

// Initialiser le gestionnaire de thème lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});

// Exporter l'instance et la classe
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;

export { ThemeManager, themeManager as default };

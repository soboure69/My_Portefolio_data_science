/**
 * Gestion du chargement paresseux (lazy loading) des images et iframes
 * Améliore les performances en ne chargeant les éléments que lorsqu'ils sont visibles à l'écran
 */

class LazyLoader {
    constructor() {
        // Configuration par défaut
        this.config = {
            // Sélecteurs des éléments à charger de manière paresseuse
            selectors: {
                images: 'img[data-src]:not(.lazy-loaded)',
                iframes: 'iframe[data-src]:not(.lazy-loaded)',
                backgrounds: '[data-bg]:not(.lazy-loaded)',
                videos: 'video[data-src]:not(.lazy-loaded)',
                sources: 'source[data-src]:not(.lazy-loaded)',
                pictures: 'picture source[data-srcset]:not(.lazy-loaded)'
            },
            
            // Options de l'Intersection Observer
            observerOptions: {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            },
            
            // Délai avant de charger les éléments (ms)
            loadDelay: 100,
            
            // Activer le chargement progressif des images
            enableProgressiveLoading: true,
            
            // Qualité des images de préchargement (0-1)
            previewQuality: 0.1,
            
            // Activer le mode debug
            debug: false
        };
        
        // Référence à l'instance de l'Intersection Observer
        this.observer = null;
        
        // État du lazy loader
        this.isInitialized = false;
        
        // Éléments en attente de chargement
        this.pendingElements = new Set();
    }
    
    /**
     * Initialiser le lazy loader
     * @param {Object} options - Options de configuration
     */
    init(options = {}) {
        // Fusionner les options avec la configuration par défaut
        this.config = { ...this.config, ...options };
        
        // Vérifier la compatibilité du navigateur
        if (!('IntersectionObserver' in window)) {
            this.loadAll(); // Charger immédiatement si pas de support
            return;
        }
        
        // Créer une instance d'Intersection Observer
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.config.observerOptions);
        
        // Détecter les éléments existants
        this.observeElements();
        
        // Écouter les changements dynamiques dans le DOM
        this.observeDOMChanges();
        
        // Marquer comme initialisé
        this.isInitialized = true;
        
        this.log('Lazy loader initialisé');
    }
    
    /**
     * Observer les éléments existants dans le DOM
     */
    observeElements() {
        // Observer tous les éléments correspondant aux sélecteurs
        Object.values(this.config.selectors).forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.observeElement(element);
            });
        });
    }
    
    /**
     * Observer un élément spécifique
     * @param {HTMLElement} element - L'élément à observer
     */
    observeElement(element) {
        if (!element || !this.observer) return;
        
        // Vérifier si l'élément est déjà en cours de chargement
        if (element.classList.contains('lazy-loading') || element.classList.contains('lazy-loaded')) {
            return;
        }
        
        // Marquer l'élément comme en attente
        this.pendingElements.add(element);
        
        // Ajouter des classes pour le style
        element.classList.add('lazy');
        
        // Observer l'élément
        this.observer.observe(element);
        
        // Charger l'élément après un délai si l'API IntersectionObserver n'est pas disponible
        if (!('IntersectionObserver' in window)) {
            setTimeout(() => this.loadElement(element), this.config.loadDelay);
        }
    }
    
    /**
     * Gérer les intersections détectées par l'Intersection Observer
     * @param {Array} entries - Les entrées d'intersection
     * @param {Object} observer - L'instance de l'Intersection Observer
     */
    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Arrêter d'observer l'élément
                observer.unobserve(element);
                
                // Charger l'élément
                this.loadElement(element);
                
                // Supprimer de la liste des éléments en attente
                this.pendingElements.delete(element);
            }
        });
    }
    
    /**
     * Charger un élément de manière paresseuse
     * @param {HTMLElement} element - L'élément à charger
     */
    loadElement(element) {
        if (!element) return;
        
        // Vérifier si l'élément est déjà chargé ou en cours de chargement
        if (element.classList.contains('lazy-loading') || element.classList.contains('lazy-loaded')) {
            return;
        }
        
        // Marquer comme en cours de chargement
        element.classList.add('lazy-loading');
        
        // Délai avant le chargement
        setTimeout(() => {
            try {
                // Charger en fonction du type d'élément
                if (element.tagName === 'IMG') {
                    this.loadImage(element);
                } else if (element.tagName === 'IFRAME') {
                    this.loadIframe(element);
                } else if (element.tagName === 'VIDEO') {
                    this.loadVideo(element);
                } else if (element.tagName === 'SOURCE') {
                    this.loadSource(element);
                } else if (element.hasAttribute('data-bg')) {
                    this.loadBackground(element);
                }
                
                // Marquer comme chargé
                element.classList.remove('lazy');
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-loaded');
                
                // Déclencher un événement personnalisé
                this.triggerEvent(element, 'lazyloaded');
                
                this.log(`Élément chargé: ${element.tagName}`, element);
            } catch (error) {
                console.error('Erreur lors du chargement paresseux:', error);
                
                // Déclencher un événement d'erreur
                this.triggerEvent(element, 'lazyloaderror', { error });
                
                // Réessayer après un délai
                if (element.retryCount === undefined) {
                    element.retryCount = 0;
                }
                
                if (element.retryCount < 3) {
                    element.retryCount++;
                    setTimeout(() => this.loadElement(element), 1000 * element.retryCount);
                } else {
                    element.classList.add('lazy-error');
                }
            }
        }, this.config.loadDelay);
    }
    
    /**
     * Charger une image de manière paresseuse
     * @param {HTMLImageElement} img - L'élément image à charger
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        const sizes = img.getAttribute('data-sizes') || img.sizes;
        
        if (!src && !srcset) {
            throw new Error('Aucune source valide trouvée pour l\'image');
        }
        
        // Charger une image de prévisualisation de faible qualité si activé
        if (this.config.enableProgressiveLoading && !img.hasAttribute('data-no-preview')) {
            const previewSrc = this.getPreviewImageUrl(src);
            
            // Créer une image fantôme pour le préchargement
            const tempImg = new Image();
            
            // D'abord charger la prévisualisation
            tempImg.onload = () => {
                // Mettre à jour l'image avec la prévisualisation
                img.src = previewSrc;
                img.classList.add('lazy-preview');
                
                // Puis charger l'image complète
                this.loadFullImage(img, src, srcset, sizes);
            };
            
            tempImg.onerror = () => {
                // En cas d'erreur, charger directement l'image complète
                this.loadFullImage(img, src, srcset, sizes);
            };
            
            tempImg.src = previewSrc;
        } else {
            // Charger directement l'image complète
            this.loadFullImage(img, src, srcset, sizes);
        }
    }
    
    /**
     * Charger l'image complète après la prévisualisation
     */
    loadFullImage(img, src, srcset, sizes) {
        const fullImage = new Image();
        
        fullImage.onload = () => {
            // Mettre à jour l'image avec la version complète
            if (src) img.src = src;
            if (srcset) img.srcset = srcset;
            if (sizes) img.sizes = sizes;
            
            // Supprimer les attributs data-*
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            img.removeAttribute('data-sizes');
            
            // Ajouter une classe pour indiquer que le chargement est terminé
            img.classList.remove('lazy-preview');
            img.classList.add('lazy-full');
            
            // Déclencher un événement personnalisé
            this.triggerEvent(img, 'lazyfull');
        };
        
        fullImage.onerror = (error) => {
            console.error('Erreur lors du chargement de l\'image complète:', error);
            this.triggerEvent(img, 'lazyerror', { error });
        };
        
        // Démarrer le chargement
        if (srcset) {
            fullImage.srcset = srcset;
            if (sizes) fullImage.sizes = sizes;
        } else {
            fullImage.src = src;
        }
    }
    
    /**
     * Charger un iframe de manière paresseuse
     * @param {HTMLIFrameElement} iframe - L'élément iframe à charger
     */
    loadIframe(iframe) {
        const src = iframe.getAttribute('data-src');
        
        if (!src) {
            throw new Error('Aucune source valide trouvée pour l\'iframe');
        }
        
        // Mettre à jour la source de l'iframe
        iframe.src = src;
        
        // Supprimer l'attribut data-src
        iframe.removeAttribute('data-src');
    }
    
    /**
     * Charger une vidéo de manière paresseuse
     * @param {HTMLVideoElement} video - L'élément vidéo à charger
     */
    loadVideo(video) {
        const src = video.getAttribute('data-src');
        
        if (!src) {
            throw new Error('Aucune source valide trouvée pour la vidéo');
        }
        
        // Mettre à jour la source de la vidéo
        video.src = src;
        
        // Charger également les sources enfants
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
            source.src = source.getAttribute('data-src');
            source.removeAttribute('data-src');
        });
        
        // Supprimer l'attribut data-src
        video.removeAttribute('data-src');
        
        // Charger la vidéo
        video.load();
    }
    
    /**
     * Charger une balise source de manière paresseuse
     * @param {HTMLSourceElement} source - L'élément source à charger
     */
    loadSource(source) {
        const src = source.getAttribute('data-src');
        const srcset = source.getAttribute('data-srcset');
        
        if (!src && !srcset) {
            throw new Error('Aucune source valide trouvée pour l\'élément source');
        }
        
        // Mettre à jour les attributs
        if (src) {
            source.src = src;
            source.removeAttribute('data-src');
        }
        
        if (srcset) {
            source.srcset = srcset;
            source.removeAttribute('data-srcset');
        }
        
        // Recharger le parent (picture ou video)
        const parent = source.parentElement;
        if (parent) {
            if (parent.tagName === 'PICTURE') {
                const img = parent.querySelector('img');
                if (img) img.src = img.src; // Forcer le rechargement
            } else if (parent.tagName === 'VIDEO' || parent.tagName === 'AUDIO') {
                parent.load();
            }
        }
    }
    
    /**
     * Charger une image d'arrière-plan de manière paresseuse
     * @param {HTMLElement} element - L'élément avec un arrière-plan à charger
     */
    loadBackground(element) {
        const bgUrl = element.getAttribute('data-bg');
        
        if (!bgUrl) {
            throw new Error('Aucune URL d\'arrière-plan spécifiée');
        }
        
        // Charger l'image en arrière-plan
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Mettre à jour l'arrière-plan
            element.style.backgroundImage = `url(${bgUrl})`;
            element.removeAttribute('data-bg');
            element.classList.add('lazy-bg-loaded');
        };
        
        tempImg.onerror = (error) => {
            console.error('Erreur lors du chargement de l\'arrière-plan:', error);
            this.triggerEvent(element, 'lazyerror', { error });
        };
        
        tempImg.src = bgUrl;
    }
    
    /**
     * Obtenir l'URL d'une image de prévisualisation
     * @param {string} url - URL de l'image originale
     * @returns {string} URL de l'image de prévisualisation
     */
    getPreviewImageUrl(url) {
        // Cette méthode peut être personnalisée en fonction de votre service d'images
        // Par exemple, avec Cloudinary, Imgix, ou un service similaire
        
        // Exemple simple pour les services qui supportent les paramètres de qualité
        if (url.includes('?')) {
            return `${url}&q=${this.config.previewQuality * 100}&w=20`;
        } else {
            return `${url}?q=${this.config.previewQuality * 100}&w=20`;
        }
    }
    
    /**
     * Charger immédiatement tous les éléments paresseux
     */
    loadAll() {
        const elements = [
            ...document.querySelectorAll(Object.values(this.config.selectors).join(', '))
        ];
        
        elements.forEach(element => {
            this.loadElement(element);
        });
    }
    
    /**
     * Mettre à jour les observateurs après des changements dynamiques dans le DOM
     */
    update() {
        if (!this.isInitialized) return;
        
        // Arrêter d'observer tous les éléments actuels
        this.observer.disconnect();
        
        // Réinitialiser la liste des éléments en attente
        this.pendingElements.clear();
        
        // Recommencer l'observation
        this.observeElements();
    }
    
    /**
     * Observer les changements dans le DOM pour les éléments ajoutés dynamiquement
     */
    observeDOMChanges() {
        // Utiliser MutationObserver pour détecter les ajouts d'éléments
        const observer = new MutationObserver(mutations => {
            let shouldUpdate = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                this.update();
            }
        });
        
        // Commencer à observer le document avec les paramètres configurés
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Déclencher un événement personnalisé
     * @private
     */
    triggerEvent(element, eventName, detail = {}) {
        const event = new CustomEvent(`lazy:${eventName}`, {
            bubbles: true,
            cancelable: true,
            detail: {
                element,
                ...detail
            }
        });
        
        element.dispatchEvent(event);
    }
    
    /**
     * Journalisation en mode debug
     * @private
     */
    log(message, data = null) {
        if (this.config.debug) {
            console.log(`[LazyLoader] ${message}`, data || '');
        }
    }
}

// Créer une instance globale du lazy loader
const lazyLoader = new LazyLoader();

// Initialiser le lazy loader lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    lazyLoader.init();
});

// Exposer l'instance et la classe
window.LazyLoader = LazyLoader;
window.lazyLoader = lazyLoader;

export { LazyLoader, lazyLoader as default };

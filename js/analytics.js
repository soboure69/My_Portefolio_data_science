// Gestion des analyses et du suivi des performances
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser Google Analytics
    initGoogleAnalytics();
    
    // Suivre les événements de navigation
    trackNavigation();
    
    // Suivre les performances de chargement de la page
    trackPagePerformance();
    
    // Suivre les erreurs JavaScript
    trackJavaScriptErrors();
    
    // Suivre les clics sur les liens externes
    trackOutboundLinks();
    
    // Suivre les téléchargements de fichiers
    trackFileDownloads();
    
    // Suivre les soumissions de formulaire
    trackFormSubmissions();
    
    // Suivre le défilement de la page
    trackScrollDepth();
    
    // Suivre le temps passé sur la page
    trackTimeOnPage();
});

// Initialiser Google Analytics
function initGoogleAnalytics() {
    // Vérifier si Google Analytics est déjà chargé
    if (window.ga && window.ga.create) {
        return;
    }
    
    // ID de propriété Google Analytics (à remplacer par le vôtre)
    const GA_TRACKING_ID = 'UA-XXXXXXXXX-X';
    
    // Créer le script Google Analytics
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    
    // Initialiser Google Analytics
    window.ga('create', GA_TRACKING_ID, 'auto');
    window.ga('set', 'anonymizeIp', true);
    window.ga('set', 'transport', 'beacon');
    window.ga('send', 'pageview');
    
    // Envoyer un événement personnalisé pour le chargement de la page
    sendAnalyticsEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
}

// Envoyer un événement personnalisé à Google Analytics
function sendAnalyticsEvent(eventName, eventParams = {}) {
    // Vérifier si Google Analytics est disponible
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
    
    // Vérifier si l'API de mesure Google Analytics est disponible
    if (typeof ga !== 'undefined') {
        ga('send', 'event', eventParams);
    }
    
    // Journalisation pour le débogage
    console.debug(`[Analytics] Event: ${eventName}`, eventParams);
}

// Suivre les événements de navigation
function trackNavigation() {
    // Suivre les clics sur les liens de navigation
    document.querySelectorAll('nav a, .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const linkText = this.textContent.trim();
            const linkHref = this.getAttribute('href');
            
            sendAnalyticsEvent('navigation_click', {
                event_category: 'Navigation',
                event_label: linkText || linkHref,
                link_url: linkHref,
                link_text: linkText
            });
        });
    });
    
    // Suivre les clics sur les boutons d'action
    document.querySelectorAll('button, .btn, [role="button"]').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonId = this.id || '';
            const buttonClass = this.className || '';
            
            sendAnalyticsEvent('button_click', {
                event_category: 'UI Interaction',
                event_label: buttonText || buttonId || 'Sans texte',
                button_id: buttonId,
                button_classes: buttonClass
            });
        });
    });
}

// Suivre les performances de chargement de la page
function trackPagePerformance() {
    // Utiliser l'API Performance Timeline pour mesurer les métriques de performance
    if (window.performance) {
        // Attendre que la page soit complètement chargée
        window.addEventListener('load', function() {
            // Obtenir les entrées de performance
            const timing = window.performance.timing;
            const navigation = performance.getEntriesByType('navigation')[0];
            
            // Calculer les métriques de performance
            const metrics = {
                // Temps de chargement total de la page
                pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                
                // Temps avant le premier rendu
                firstPaint: 0,
                
                // Temps avant que le contenu principal ne soit chargé
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                
                // Taille de la page (en octets)
                pageSize: 0,
                
                // Nombre de requêtes réseau
                networkRequests: 0
            };
            
            // Obtenir les métriques de peinture (First Paint, First Contentful Paint, etc.)
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    metrics.firstPaint = Math.round(entry.startTime);
                }
            });
            
            // Obtenir la taille de la page et le nombre de requêtes
            if (navigation && navigation.type === 'navigate') {
                const resources = performance.getEntriesByType('resource');
                metrics.networkRequests = resources.length;
                
                // Calculer la taille totale de la page
                let totalSize = 0;
                resources.forEach(resource => {
                    if (resource.transferSize) {
                        totalSize += resource.transferSize;
                    } else if (resource.encodedBodySize) {
                        totalSize += resource.encodedBodySize;
                    }
                });
                metrics.pageSize = totalSize;
            }
            
            // Envoyer les métriques à Google Analytics
            sendAnalyticsEvent('page_performance', {
                event_category: 'Performance',
                ...metrics
            });
            
            // Afficher les métriques dans la console pour le débogage
            console.log('[Analytics] Page Performance:', metrics);
        });
    }
}

// Suivre les erreurs JavaScript
function trackJavaScriptErrors() {
    // Capturer les erreurs non gérées
    window.addEventListener('error', function(event) {
        const error = event.error || event;
        
        // Ignorer les erreurs CORS
        if (error.message && error.message.includes('Script error')) {
            return;
        }
        
        // Envoyer l'erreur à Google Analytics
        sendAnalyticsEvent('js_error', {
            event_category: 'Error',
            event_label: error.message || 'Unknown error',
            error_message: error.message,
            error_stack: error.stack,
            error_filename: event.filename,
            error_lineno: event.lineno,
            error_colno: event.colno
        });
        
        // Afficher l'erreur dans la console
        console.error('JavaScript Error:', error);
    });
    
    // Capturer les promesses non gérées
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason || 'Unknown promise rejection';
        
        // Envoyer l'erreur à Google Analytics
        sendAnalyticsEvent('unhandled_promise_rejection', {
            event_category: 'Error',
            event_label: error.message || 'Unhandled Promise Rejection',
            error_message: error.message,
            error_stack: error.stack
        });
        
        // Afficher l'erreur dans la console
        console.error('Unhandled Promise Rejection:', error);
    });
}

// Suivre les clics sur les liens externes
function trackOutboundLinks() {
    document.addEventListener('click', function(event) {
        let target = event.target;
        
        // Trouver l'élément <a> parent si nécessaire
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            
            // Sortir de la boucle si on atteint le document
            if (target === document) {
                target = null;
                break;
            }
        }
        
        // Vérifier si c'est un lien externe
        if (target && target.hostname && target.hostname !== window.location.hostname) {
            // Envoyer l'événement à Google Analytics
            sendAnalyticsEvent('outbound_link_click', {
                event_category: 'Outbound Link',
                event_label: target.href,
                link_url: target.href,
                link_text: target.textContent.trim()
            });
            
            // Ajouter un délai pour permettre à l'événement d'être envoyé avant la navigation
            if (!target.target || target.target === '_self') {
                event.preventDefault();
                
                setTimeout(function() {
                    window.location.href = target.href;
                }, 150);
            }
        }
    });
}

// Suivre les téléchargements de fichiers
function trackFileDownloads() {
    const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'];
    
    document.addEventListener('click', function(event) {
        let target = event.target;
        
        // Trouver l'élément <a> parent si nécessaire
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            
            // Sortir de la boucle si on atteint le document
            if (target === document) {
                target = null;
                break;
            }
        }
        
        // Vérifier si c'est un lien de téléchargement
        if (target && target.href) {
            const isDownload = target.download || 
                              target.getAttribute('download') !== null ||
                              fileExtensions.some(ext => target.href.toLowerCase().includes(ext));
            
            if (isDownload) {
                // Envoyer l'événement à Google Analytics
                sendAnalyticsEvent('file_download', {
                    event_category: 'Download',
                    event_label: target.href,
                    file_url: target.href,
                    file_name: target.download || target.href.split('/').pop(),
                    file_extension: target.href.split('.').pop().toLowerCase()
                });
            }
        }
    });
}

// Suivre les soumissions de formulaire
function trackFormSubmissions() {
    document.addEventListener('submit', function(event) {
        const form = event.target;
        const formId = form.id || 'unnamed-form';
        const formName = form.getAttribute('name') || formId;
        
        // Envoyer l'événement à Google Analytics
        sendAnalyticsEvent('form_submit', {
            event_category: 'Form',
            event_label: formName,
            form_id: formId,
            form_name: formName,
            form_action: form.action || 'unknown',
            form_method: form.method || 'get'
        });
    });
}

// Suivre le défilement de la page
function trackScrollDepth() {
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = [];
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = Math.round((scrollPosition / pageHeight) * 100);
        
        // Vérifier les seuils atteints
        scrollThresholds.forEach(threshold => {
            if (scrollPercentage >= threshold && !trackedThresholds.includes(threshold)) {
                trackedThresholds.push(threshold);
                
                // Envoyer l'événement à Google Analytics
                sendAnalyticsEvent('scroll_depth', {
                    event_category: 'Engagement',
                    event_label: `Scrolled ${threshold}%`,
                    scroll_percentage: threshold,
                    scroll_position: scrollPosition,
                    page_height: pageHeight
                });
            }
        });
    }, { passive: true });
}

// Suivre le temps passé sur la page
function trackTimeOnPage() {
    let startTime = Date.now();
    let maxTime = 0;
    let isPageVisible = true;
    
    // Mettre à jour le temps quand la page devient visible/invisible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // La page est devenue invisible
            const timeSpent = Date.now() - startTime;
            maxTime = Math.max(maxTime, timeSpent);
            isPageVisible = false;
        } else {
            // La page est redevenue visible
            startTime = Date.now();
            isPageVisible = true;
        }
    });
    
    // Envoyer le temps passé sur la page lorsqu'elle est quittée
    window.addEventListener('beforeunload', function() {
        const timeSpent = isPageVisible ? Date.now() - startTime : maxTime;
        
        // Envoyer l'événement à Google Analytics
        sendAnalyticsEvent('time_on_page', {
            event_category: 'Engagement',
            event_label: 'Time Spent on Page',
            time_spent: timeSpent,
            time_spent_seconds: Math.round(timeSpent / 1000)
        });
    });
}

// Exposer les fonctions au scope global
window.Analytics = {
    initGoogleAnalytics,
    sendAnalyticsEvent,
    trackNavigation,
    trackPagePerformance,
    trackJavaScriptErrors,
    trackOutboundLinks,
    trackFileDownloads,
    trackFormSubmissions,
    trackScrollDepth,
    trackTimeOnPage
};

// Détection des fonctionnalités
if ('performance' in window === false) {
    console.warn('Performance API is not supported in this browser');
}

if ('sendBeacon' in navigator === false) {
    console.warn('sendBeacon API is not supported in this browser');
}

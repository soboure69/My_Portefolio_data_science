// Gestion du SEO et du partage sur les réseaux sociaux
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les métadonnées SEO dynamiques
    initSEOMetadata();
    
    // Configurer les boutons de partage
    setupSocialSharing();
    
    // Initialiser les balises Open Graph et Twitter Cards
    initSocialMetaTags();
    
    // Suivre les événements de partage
    trackSocialShares();
});

// Initialiser les métadonnées SEO dynamiques
function initSEOMetadata() {
    // Mettre à jour le titre de la page si nécessaire
    updatePageTitle();
    
    // Mettre à jour la méta description
    updateMetaDescription();
    
    // Ajouter des balises canoniques
    addCanonicalTag();
    
    // Gérer les balises hreflang pour le multilangue
    addHreflangTags();
}

// Mettre à jour le titre de la page
function updatePageTitle() {
    const pageTitle = document.querySelector('h1');
    if (!pageTitle) return;
    
    const titleSuffix = ' | Portfolio Data Science';
    const currentTitle = document.title;
    
    // Ne mettre à jour que si le titre est celui par défaut
    if (currentTitle === 'Document' || currentTitle === '') {
        document.title = pageTitle.textContent.trim() + titleSuffix;
    }
    
    // Ajouter un préfixe pour les pages d'erreur
    if (document.body.classList.contains('error-page')) {
        document.title = 'Erreur : ' + document.title;
    }
}

// Mettre à jour la méta description
function updateMetaDescription() {
    let metaDescription = document.querySelector('meta[name="description"]');
    const firstParagraph = document.querySelector('main p');
    
    // Créer la balise meta description si elle n'existe pas
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    
    // Utiliser le premier paragraphe comme description si elle n'est pas définie
    if ((!metaDescription.content || metaDescription.content === '') && firstParagraph) {
        metaDescription.content = firstParagraph.textContent
            .trim()
            .substring(0, 155) // Google tronque généralement à 155-160 caractères
            .replace(/\s+\S*$/, '') + '...'; // Ne pas couper un mot
    }
}

// Ajouter une balise canonique
function addCanonicalTag() {
    // Ne pas ajouter si une balise canonique existe déjà
    if (document.querySelector('link[rel="canonical"]')) return;
    
    const canonicalUrl = getCanonicalUrl();
    
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
}

// Obtenir l'URL canonique
function getCanonicalUrl() {
    // Utiliser l'URL canonique définie dans les données de la page si elle existe
    const canonicalMeta = document.querySelector('meta[property="og:url"]');
    if (canonicalMeta) return canonicalMeta.content;
    
    // Sinon, utiliser l'URL actuelle sans les paramètres de requête
    return window.location.href.split('?')[0];
}

// Ajouter des balises hreflang pour le multilangue
function addHreflangTags() {
    // Ne pas ajouter si des balises hreflang existent déjà
    if (document.querySelector('link[hreflang]')) return;
    
    // Récupérer la langue de la page
    const pageLanguage = document.documentElement.lang || 'fr';
    const baseUrl = window.location.origin;
    const path = window.location.pathname;
    
    // Ajouter la balise pour la langue actuelle
    addHreflangTag(pageLanguage, `${baseUrl}${path}`);
    
    // Exemple : ajouter une version anglaise si disponible
    if (pageLanguage === 'fr') {
        const englishPath = path.replace(/^\/fr/, '/en') || '/en';
        addHreflangTag('en', `${baseUrl}${englishPath}`);
    }
    
    // Ajouter la balise x-default
    addHreflangTag('x-default', `${baseUrl}${path}`);
}

// Ajouter une balise hreflang
function addHreflangTag(lang, url) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    document.head.appendChild(link);
}

// Initialiser les balises Open Graph et Twitter Cards
function initSocialMetaTags() {
    const title = document.title.replace(/\s*\|.*$/, ''); // Enlever le suffixe du titre
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const canonicalUrl = getCanonicalUrl();
    
    // Définir les métadonnées par défaut
    const defaultImage = `${window.location.origin}/images/og-image.jpg`;
    
    // Créer ou mettre à jour les balises Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:image', defaultImage);
    setMetaTag('property', 'og:site_name', 'Portfolio Data Science');
    setMetaTag('property', 'og:locale', document.documentElement.lang || 'fr_FR');
    
    // Créer ou mettre à jour les balises Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', defaultImage);
    
    // Ajouter des balises supplémentaires pour les articles de blog
    if (document.body.classList.contains('blog-post')) {
        const publishDate = document.querySelector('time[datetime]')?.getAttribute('datetime');
        const author = document.querySelector('[rel="author"]')?.textContent || '';
        
        if (publishDate) {
            setMetaTag('property', 'article:published_time', publishDate);
        }
        
        if (author) {
            setMetaTag('property', 'article:author', author);
            setMetaTag('name', 'twitter:creator', `@${author.replace(/\s+/g, '').toLowerCase()}`);
        }
    }
}

// Définir ou mettre à jour une balise meta
function setMetaTag(attr, name, content) {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[${attr}="${name}"]`);
    
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attr, name);
        document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
}

// Configurer les boutons de partage
function setupSocialSharing() {
    // Partage sur Twitter
    document.querySelectorAll('[data-share="twitter"]').forEach(button => {
        button.addEventListener('click', shareOnTwitter);
    });
    
    // Partage sur LinkedIn
    document.querySelectorAll('[data-share="linkedin"]').forEach(button => {
        button.addEventListener('click', shareOnLinkedIn);
    });
    
    // Partage sur Facebook
    document.querySelectorAll('[data-share="facebook"]').forEach(button => {
        button.addEventListener('click', shareOnFacebook);
    });
    
    // Partage par email
    document.querySelectorAll('[data-share="email"]').forEach(button => {
        button.addEventListener('click', shareByEmail);
    });
    
    // Copier le lien
    document.querySelectorAll('[data-share="copy"]').forEach(button => {
        button.addEventListener('click', copyUrlToClipboard);
    });
}

// Partager sur Twitter
function shareOnTwitter(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    const via = 'your_twitter_handle'; // Remplacer par votre pseudo Twitter
    
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}&via=${via}`, '_blank', 'width=550,height=420');
    
    // Suivre l'événement de partage
    trackShare('twitter');
}

// Partager sur LinkedIn
function shareOnLinkedIn(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
    
    // Suivre l'événement de partage
    trackShare('linkedin');
}

// Partager sur Facebook
function shareOnFacebook(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
    
    // Suivre l'événement de partage
    trackShare('facebook');
}

// Partager par email
function shareByEmail(e) {
    e.preventDefault();
    
    const subject = encodeURIComponent(`Je voulais partager cela avec toi : ${document.title}`);
    const body = encodeURIComponent(`Je suis tombé(e) sur cette page et j'ai pensé que cela pourrait t'intéresser :\n\n${window.location.href}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    // Suivre l'événement de partage
    trackShare('email');
}

// Copier l'URL dans le presse-papiers
async function copyUrlToClipboard(e) {
    e.preventDefault();
    
    try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Afficher un message de confirmation
        const button = e.currentTarget;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check mr-1"></i> Lien copié !';
        
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
        
        // Suivre l'événement de copie
        trackShare('copy');
    } catch (err) {
        console.error('Erreur lors de la copie du lien :', err);
    }
}

// Suivre les événements de partage
function trackShare(platform) {
    // Envoyer l'événement à Google Analytics si disponible
    if (window.gtag) {
        gtag('event', 'share', {
            'method': platform,
            'content_type': 'article',
            'item_id': window.location.pathname
        });
    }
    
    // Envoyer l'événement à d'autres outils d'analyse si nécessaire
    console.log(`Partagé sur ${platform}: ${window.location.href}`);
}

// Suivre les événements de partage (fonction globale pour les boutons natifs)
function trackSocialShares() {
    document.addEventListener('click', function(e) {
        const shareButton = e.target.closest('[data-share]');
        if (!shareButton) return;
        
        const platform = shareButton.getAttribute('data-share');
        trackShare(platform);
    });
}

// Exposer les fonctions au scope global
window.SEO = {
    initSEOMetadata,
    updatePageTitle,
    updateMetaDescription,
    shareOnTwitter,
    shareOnLinkedIn,
    shareOnFacebook,
    shareByEmail,
    copyUrlToClipboard
};

// Initialiser les métadonnées SEO au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEOMetadata);
} else {
    initSEOMetadata();
}

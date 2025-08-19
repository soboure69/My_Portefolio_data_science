// Gestion du partage sur les réseaux sociaux
document.addEventListener('DOMContentLoaded', function() {
    initShareButtons();
    initWebShareAPI();
    trackSocialShares();
});

// Initialiser les boutons de partage
function initShareButtons() {
    // Partage sur Facebook
    document.querySelectorAll('.share-facebook').forEach(button => {
        button.addEventListener('click', shareOnFacebook);
    });
    
    // Partage sur Twitter
    document.querySelectorAll('.share-twitter').forEach(button => {
        button.addEventListener('click', shareOnTwitter);
    });
    
    // Partage sur LinkedIn
    document.querySelectorAll('.share-linkedin').forEach(button => {
        button.addEventListener('click', shareOnLinkedIn);
    });
    
    // Partage par email
    document.querySelectorAll('.share-email').forEach(button => {
        button.addEventListener('click', shareByEmail);
    });
    
    // Copier le lien
    document.querySelectorAll('.share-copy').forEach(button => {
        button.addEventListener('click', copyUrlToClipboard);
    });
}

// Utiliser l'API Web Share si disponible
function initWebShareAPI() {
    if (navigator.share) {
        // Cacher les boutons de partage natifs
        document.querySelectorAll('.share-buttons').forEach(container => {
            container.classList.add('native-share-available');
        });
        
        // Ajouter le bouton de partage natif
        document.querySelectorAll('.share-native').forEach(button => {
            button.style.display = 'inline-flex';
            button.addEventListener('click', shareNative);
        });
    }
}

// Partager via l'API Web Share
async function shareNative() {
    try {
        const title = document.title;
        const text = getMetaContent('description') || '';
        const url = window.location.href;
        
        await navigator.share({
            title,
            text,
            url
        });
        
        // Suivre le partage réussi
        trackShare('native');
    } catch (err) {
        console.log('Erreur lors du partage:', err);
    }
}

// Partager sur Facebook
function shareOnFacebook(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    openShareWindow(shareUrl, 'Partager sur Facebook');
    trackShare('facebook');
}

// Partager sur Twitter
function shareOnTwitter(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    const via = 'votrenom'; // Remplacer par votre nom d'utilisateur Twitter
    const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&via=${via}`;
    
    openShareWindow(shareUrl, 'Partager sur Twitter');
    trackShare('twitter');
}

// Partager sur LinkedIn
function shareOnLinkedIn(e) {
    e.preventDefault();
    
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    
    openShareWindow(shareUrl, 'Partager sur LinkedIn');
    trackShare('linkedin');
}

// Partager par email
function shareByEmail(e) {
    e.preventDefault();
    
    const subject = encodeURIComponent(`Je voulais partager cela avec toi : ${document.title}`);
    const body = encodeURIComponent(`Je suis tombé(e) sur cette page et j'ai pensé que cela pourrait t'intéresser :\n\n${window.location.href}`);
    const shareUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.location.href = shareUrl;
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
        
        button.innerHTML = '<i class="fas fa-check"></i> Lien copié !';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
        
        trackShare('copy');
    } catch (err) {
        console.error('Erreur lors de la copie du lien :', err);
        alert('Impossible de copier le lien. Veuillez réessayer.');
    }
}

// Ouvrir une fenêtre de partage
function openShareWindow(url, title, width = 600, height = 400) {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
        url,
        title,
        `width=${width},height=${height},top=${top},left=${left},toolbar=0,menubar=0,location=0,status=0`
    );
}

// Suivre les partages sur les réseaux sociaux
function trackShare(platform) {
    // Envoyer l'événement à Google Analytics si disponible
    if (window.gtag) {
        gtag('event', 'share', {
            'method': platform,
            'content_type': 'page',
            'item_id': window.location.pathname
        });
    }
    
    // Envoyer l'événement à d'autres outils d'analyse si nécessaire
    console.log(`Partagé sur ${platform}: ${window.location.href}`);
}

// Obtenir le contenu d'une balise meta
function getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') : '';
}

// Exposer les fonctions au scope global
window.SocialShare = {
    shareOnFacebook,
    shareOnTwitter,
    shareOnLinkedIn,
    shareByEmail,
    copyUrlToClipboard,
    shareNative
};

// Gestion du blog et des articles
document.addEventListener('DOMContentLoaded', function() {
    // Charger les articles récents sur la page d'accueil
    if (document.getElementById('recent-posts')) {
        loadRecentPosts(3);
    }
    
    // Charger tous les articles sur la page du blog
    if (document.getElementById('blog-posts')) {
        loadAllPosts();
    }
    
    // Initialiser la recherche d'articles
    setupSearch();
    
    // Initialiser les filtres par catégorie
    setupCategoryFilters();
});

// Charger les articles récents
async function loadRecentPosts(limit = 3) {
    try {
        const response = await fetch('data/blog.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des articles');
        
        const posts = await response.json();
        const recentPosts = posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
        
        displayPosts(recentPosts, 'recent-posts');
    } catch (error) {
        console.error('Erreur:', error);
        showBlogError('Impossible de charger les articles récents');
    }
}

// Charger tous les articles
async function loadAllPosts() {
    try {
        const response = await fetch('data/blog.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des articles');
        
        const posts = await response.json();
        displayPosts(posts, 'blog-posts');
        updateCategories(posts);
    } catch (error) {
        console.error('Erreur:', error);
        showBlogError('Impossible de charger les articles');
    }
}

// Afficher les articles dans le conteneur spécifié
function displayPosts(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-600">Aucun article à afficher pour le moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => createPostCard(post)).join('');
    
    // Initialiser les animations pour les nouveaux éléments
    initPostAnimations();
}

// Créer une carte d'article
function createPostCard(post) {
    const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Limiter le texte de l'extrait
    const excerpt = post.excerpt || post.content.substring(0, 150) + '...';
    
    return `
        <article class="blog-post bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div class="h-48 overflow-hidden">
                <img src="${post.image || 'images/placeholder-blog.jpg'}" 
                     alt="${post.title}" 
                     class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='images/placeholder-blog.jpg'"
                >
            </div>
            <div class="p-6">
                <div class="flex items-center text-sm text-gray-500 mb-2">
                    <time datetime="${post.date}">
                        <i class="far fa-calendar-alt mr-1"></i> ${formattedDate}
                    </time>
                    ${post.author ? `
                        <span class="mx-2">•</span>
                        <span><i class="far fa-user mr-1"></i> ${post.author}</span>
                    ` : ''}
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 mb-2">
                    <a href="blog/${post.slug}.html" class="hover:text-indigo-600 transition-colors">
                        ${post.title}
                    </a>
                </h3>
                
                <p class="text-gray-600 mb-4">${excerpt}</p>
                
                <div class="flex flex-wrap justify-between items-center">
                    <div class="flex flex-wrap gap-2 mb-2">
                        ${post.categories ? post.categories.map(category => `
                            <span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                ${category}
                            </span>
                        `).join('') : ''}
                    </div>
                    
                    <a href="blog/${post.slug}.html" class="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Lire la suite
                        <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Mettre à jour la liste des catégories disponibles
function updateCategories(posts) {
    const categoriesContainer = document.getElementById('blog-categories');
    if (!categoriesContainer) return;
    
    // Extraire toutes les catégories uniques
    const categories = new Set();
    posts.forEach(post => {
        if (post.categories) {
            post.categories.forEach(category => categories.add(category));
        }
    });
    
    if (categories.size === 0) return;
    
    // Créer les éléments de catégorie
    const categoryElements = Array.from(categories).map(category => `
        <li>
            <button class="category-filter px-4 py-2 text-left w-full hover:bg-gray-100 rounded transition-colors" 
                    data-category="${category.toLowerCase()}">
                ${category}
            </button>
        </li>
    `).join('');
    
    categoriesContainer.innerHTML = categoryElements;
    
    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterPostsByCategory(category);
            
            // Mettre à jour le bouton actif
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.toggle('bg-indigo-50 text-indigo-700', btn === this);
            });
        });
    });
}

// Filtrer les articles par catégorie
function filterPostsByCategory(category) {
    const posts = document.querySelectorAll('.blog-post');
    
    posts.forEach(post => {
        const postCategories = post.getAttribute('data-categories') || '';
        if (category === 'all' || postCategories.includes(category)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
    
    // Faire défiler jusqu'aux résultats
    const blogSection = document.getElementById('blog-posts');
    if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Configurer la recherche d'articles
function setupSearch() {
    const searchInput = document.getElementById('blog-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        searchPosts(query);
    });
}

// Rechercher des articles
function searchPosts(query) {
    const posts = document.querySelectorAll('.blog-post');
    
    if (!query) {
        // Afficher tous les articles si la recherche est vide
        posts.forEach(post => {
            post.style.display = 'block';
        });
        return;
    }
    
    posts.forEach(post => {
        const title = post.querySelector('h3')?.textContent.toLowerCase() || '';
        const excerpt = post.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(query) || excerpt.includes(query)) {
            post.style.display = 'block';
            
            // Mettre en surbrillance les correspondances
            highlightText(post, query);
        } else {
            post.style.display = 'none';
        }
    });
}

// Mettre en surbrillance le texte de recherche
function highlightText(element, query) {
    const text = element.textContent;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    
    // Ne mettre à jour que si le contenu a changé
    if (element.innerHTML !== highlighted) {
        element.innerHTML = highlighted;
    }
}

// Initialiser les animations des articles
function initPostAnimations() {
    const posts = document.querySelectorAll('.blog-post');
    
    posts.forEach((post, index) => {
        // Délai d'animation en escalier
        post.style.animationDelay = `${index * 0.1}s`;
        post.classList.add('animate-fade-in-up');
    });
}

// Afficher une erreur
function showBlogError(message) {
    const container = document.getElementById('blog-posts') || document.body;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        <p class="font-bold">Erreur</p>
        <p>${message}</p>
    `;
    container.prepend(errorDiv);
}

// Exposer les fonctions au scope global
window.Blog = {
    loadRecentPosts,
    loadAllPosts,
    searchPosts
};

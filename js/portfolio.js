// Gestion de l'affichage des projets
document.addEventListener('DOMContentLoaded', function() {
    // Charger les projets depuis le fichier JSON
    loadProjects();
    
    // Filtrer les projets par catégorie
    setupProjectFilters();
});

// Charger les projets depuis le fichier JSON
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des projets');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Erreur:', error);
        showErrorMessage('Impossible de charger les projets. Veuillez réessayer plus tard.');
    }
}

// Afficher les projets dans la grille
function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-600">Aucun projet à afficher pour le moment.</p>
            </div>
        `;
        return;
    }
    
    projectsContainer.innerHTML = projects.map(project => createProjectCard(project)).join('');
    
    // Initialiser les animations pour les nouveaux éléments
    initProjectAnimations();
}

// Créer une carte de projet
function createProjectCard(project) {
    return `
        <div class="project-card group" data-categories="${project.categories ? project.categories.join(' ') : ''}">
            <div class="h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div class="relative overflow-hidden h-48">
                    <img src="${project.image || 'images/placeholder-project.jpg'}" 
                         alt="${project.title}" 
                         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='images/placeholder-project.jpg'"
                    >
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div>
                            <h3 class="text-white text-xl font-bold mb-1">${project.title}</h3>
                            <div class="flex flex-wrap gap-1">
                                ${project.tags ? project.tags.map(tag => 
                                    `<span class="text-xs bg-white/20 text-white px-2 py-1 rounded">${tag}</span>`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                    <p class="text-gray-600 mb-4 line-clamp-3">${project.description}</p>
                    <div class="flex justify-between items-center">
                        <a href="projects/${project.id}.html" class="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                            Voir le projet
                            <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                        ${project.github ? `
                            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700">
                                <i class="fab fa-github text-xl"></i>
                                <span class="sr-only">Code source</span>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configurer les filtres de projet
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filter');
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mettre à jour le bouton actif
            document.querySelector('.project-filter.active')?.classList.remove('active');
            this.classList.add('active');
            
            // Filtrer les projets
            const filter = this.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
}

// Filtrer les projets par catégorie
function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const categories = card.getAttribute('data-categories');
            card.style.display = categories.includes(filter) ? 'block' : 'none';
        }
    });
    
    // Animer les projets visibles
    initProjectAnimations();
}

// Initialiser les animations des projets
function initProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        if (card.style.display !== 'none') {
            // Délai d'animation en escalier
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in-up');
        }
    });
}

// Afficher un message d'erreur
function showErrorMessage(message) {
    const container = document.getElementById('projects-container') || document.body;
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
window.Portfolio = {
    loadProjects,
    displayProjects,
    filterProjects
};

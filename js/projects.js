// Fonction pour charger les projets depuis le fichier JSON
async function loadProjects() {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des projets');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('project-list').innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-red-500 text-xl mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                    <p>Impossible de charger les projets. Veuillez réessayer plus tard.</p>
                </div>
            </div>
        `;
    }
}

// Fonction pour afficher les projets dans la grille
function displayProjects(projects) {
    const projectList = document.getElementById('project-list');
    
    if (!projectList) return;
    
    if (projects.length === 0) {
        projectList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">Aucun projet à afficher pour le moment.</p>
            </div>
        `;
        return;
    }
    
    projectList.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="card overflow-hidden h-full flex flex-col">
                <div class="project-image h-48 overflow-hidden">
                    <img src="${project.image}" 
                         alt="${project.title}" 
                         class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                         onerror="this.onerror=null; this.src='../images/placeholder-project.jpg'"
                    >
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${project.tags.map(tag => `
                                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <a href="projects/${project.id}.html" 
                       class="mt-4 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Voir le projet
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
    
    // Ajouter les écouteurs d'événements pour les animations
    setupProjectHoverEffects();
}

// Fonction pour configurer les effets de survol des projets
function setupProjectHoverEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const img = card.querySelector('img');
        
        card.addEventListener('mouseenter', () => {
            card.classList.add('shadow-xl');
            if (img) {
                img.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('shadow-xl');
            if (img) {
                img.style.transform = 'scale(1.0)';
            }
        });
    });
}

// Fonction pour initialiser la page des projets
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si nous sommes sur la page des projets
    if (document.getElementById('project-list')) {
        loadProjects();
    }
    
    // Gestion du bouton de retour en haut de page
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.remove('opacity-0', 'invisible');
                backToTopBtn.classList.add('opacity-100', 'visible');
            } else {
                backToTopBtn.classList.remove('opacity-100', 'visible');
                backToTopBtn.classList.add('opacity-0', 'invisible');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Fonction pour afficher les détails d'un projet spécifique
async function loadProjectDetails(projectId) {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails du projet');
        }
        const projects = await response.json();
        const project = projects.find(p => p.id === parseInt(projectId));
        
        if (!project) {
            window.location.href = '/404.html';
            return;
        }
        
        displayProjectDetails(project);
    } catch (error) {
        console.error('Erreur:', error);
        window.location.href = '/404.html';
    }
}

// Fonction pour afficher les détails d'un projet
function displayProjectDetails(project) {
    const projectDetail = document.getElementById('project-detail');
    
    if (!projectDetail) return;
    
    projectDetail.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="h-64 md:h-96 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     class="max-h-full max-w-full object-cover"
                     onerror="this.onerror=null; this.src='../images/placeholder-project.jpg'"
                >
            </div>
            
            <div class="p-6 md:p-12">
                <div class="flex flex-col md:flex-row gap-12">
                    <div class="md:w-2/3">
                        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">${project.title}</h1>
                        
                        <div class="prose max-w-none text-gray-600 mb-8">
                            ${project.longDescription || project.description}
                        </div>
                        
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">Technologies utilisées</h3>
                            <div class="flex flex-wrap gap-2">
                                ${project.tags.map(tag => `
                                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${project.features ? `
                            <div class="mb-8">
                                <h3 class="text-xl font-semibold text-gray-900 mb-4">Fonctionnalités</h3>
                                <ul class="list-disc pl-5 space-y-2 text-gray-600">
                                    ${project.features.map(feature => `
                                        <li>${feature}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${project.challenges ? `
                            <div class="mb-8">
                                <h3 class="text-xl font-semibold text-gray-900 mb-4">Défis relevés</h3>
                                <ul class="list-disc pl-5 space-y-2 text-gray-600">
                                    ${project.challenges.map(challenge => `
                                        <li>${challenge}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="mt-8 flex flex-wrap gap-4">
                            ${project.demoUrl ? `
                                <a href="${project.demoUrl}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="btn btn-primary">
                                    <i class="fas fa-external-link-alt mr-2"></i>
                                    Voir la démo
                                </a>
                            ` : ''}
                            
                            ${project.githubUrl ? `
                                <a href="${project.githubUrl}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="btn bg-gray-800 text-white hover:bg-gray-900">
                                    <i class="fab fa-github mr-2"></i>
                                    Code source
                                </a>
                            ` : ''}
                            
                            <a href="../index.html#projets" 
                               class="btn border border-gray-300 text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Retour aux projets
                            </a>
                        </div>
                    </div>
                    
                    <div class="md:w-1/3">
                        <div class="bg-gray-50 p-6 rounded-lg sticky top-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Détails du projet</h3>
                            
                            ${project.date ? `
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-500">Date</h4>
                                    <p class="text-gray-900">${new Date(project.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                                </div>
                            ` : ''}
                            
                            ${project.client ? `
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-500">Client</h4>
                                    <p class="text-gray-900">${project.client}</p>
                                </div>
                            ` : ''}
                            
                            ${project.role ? `
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-500">Rôle</h4>
                                    <p class="text-gray-900">${project.role}</p>
                                </div>
                            ` : ''}
                            
                            ${project.duration ? `
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-500">Durée</h4>
                                    <p class="text-gray-900">${project.duration}</p>
                                </div>
                            ` : ''}
                            
                            <div class="mt-6 pt-6 border-t border-gray-200">
                                <h4 class="text-sm font-medium text-gray-500 mb-2">Partager ce projet</h4>
                                <div class="flex space-x-3">
                                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(project.title)}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       class="text-gray-500 hover:text-blue-500 transition-colors">
                                        <i class="fab fa-twitter text-xl"></i>
                                    </a>
                                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       class="text-gray-500 hover:text-blue-700 transition-colors">
                                        <i class="fab fa-linkedin text-xl"></i>
                                    </a>
                                    <a href="mailto:?subject=${encodeURIComponent(project.title)}&body=${encodeURIComponent('Regarde ce projet intéressant : ' + window.location.href)}" 
                                       class="text-gray-500 hover:text-red-500 transition-colors">
                                        <i class="fas fa-envelope text-xl"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mettre à jour le titre de la page
    document.title = `${project.title} - Mon Portfolio Data Science`;
    
    // Mettre à jour la méta description pour le SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', project.description);
    }
    
    // Ajouter des balises méta pour les réseaux sociaux (Open Graph et Twitter Cards)
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = project.title;
    document.head.appendChild(ogTitle);
    
    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.content = project.description;
    document.head.appendChild(ogDescription);
    
    const ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.content = new URL(project.image, window.location.origin).href;
    document.head.appendChild(ogImage);
    
    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = window.location.href;
    document.head.appendChild(ogUrl);
    
    const twitterCard = document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.content = 'summary_large_image';
    document.head.appendChild(twitterCard);
}

// Exporter les fonctions pour une utilisation dans d'autres fichiers
window.ProjectManager = {
    loadProjects,
    loadProjectDetails
};

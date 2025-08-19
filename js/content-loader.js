// Gestion du chargement dynamique du contenu
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le chargement du contenu
    initContentLoading();
    
    // Initialiser le chargement paresseux des images
    initLazyLoading();
    
    // Initialiser le chargement des iframes
    initLazyIframes();
    
    // Initialiser l'intersection observer pour le chargement différé
    initIntersectionObserver();
});

// Initialiser le chargement du contenu
function initContentLoading() {
    // Charger le contenu des sections dynamiquement
    loadSectionContent('projects', 'data/projects.json', renderProjects);
    loadSectionContent('blog', 'data/blog.json', renderBlogPosts);
    loadSectionContent('skills', 'data/skills.json', renderSkills);
    loadSectionContent('testimonials', 'data/testimonials.json', renderTestimonials);
    
    // Charger le contenu des pages dynamiques
    if (document.body.classList.contains('project-page')) {
        loadProjectDetails();
    }
    
    if (document.body.classList.contains('blog-post')) {
        loadBlogPost();
    }
}

// Charger le contenu d'une section
async function loadSectionContent(sectionId, dataUrl, renderFunction) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Afficher un indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Chargement en cours...</p>';
    section.appendChild(loadingIndicator);
    
    try {
        // Charger les données
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Supprimer l'indicateur de chargement
        section.removeChild(loadingIndicator);
        
        // Rendre le contenu
        if (typeof renderFunction === 'function') {
            renderFunction(section, data);
        } else {
            renderDefaultContent(section, data);
        }
        
        // Déclencher un événement personnalisé
        const event = new CustomEvent('contentLoaded', {
            detail: {
                sectionId,
                data
            }
        });
        
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error(`Erreur lors du chargement de ${dataUrl}:`, error);
        
        // Afficher un message d'erreur
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <p>Désolé, une erreur s'est produite lors du chargement du contenu.</p>
            <button class="btn btn-retry">Réessayer</button>
        `;
        
        // Remplacer l'indicateur de chargement par le message d'erreur
        if (section.contains(loadingIndicator)) {
            section.replaceChild(errorMessage, loadingIndicator);
        } else {
            section.appendChild(errorMessage);
        }
        
        // Gérer le clic sur le bouton de réessai
        const retryButton = errorMessage.querySelector('.btn-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                section.removeChild(errorMessage);
                loadSectionContent(sectionId, dataUrl, renderFunction);
            });
        }
    }
}

// Rendu par défaut du contenu (utilisé comme fallback)
function renderDefaultContent(container, data) {
    if (Array.isArray(data)) {
        const list = document.createElement('ul');
        list.className = 'content-list';
        
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.title || item.name || JSON.stringify(item);
            list.appendChild(listItem);
        });
        
        container.appendChild(list);
    } else if (typeof data === 'object') {
        const content = document.createElement('div');
        content.className = 'content-block';
        
        for (const [key, value] of Object.entries(data)) {
            const element = document.createElement('div');
            element.className = 'content-item';
            element.innerHTML = `<strong>${key}:</strong> ${JSON.stringify(value)}`;
            content.appendChild(element);
        }
        
        container.appendChild(content);
    } else {
        container.textContent = data;
    }
}

// Rendu des projets
function renderProjects(container, projects) {
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    
    projects.slice(0, 6).forEach(project => {
        const projectElement = document.createElement('article');
        projectElement.className = 'project-card';
        projectElement.innerHTML = `
            <div class="project-image">
                <img data-src="${project.image}" alt="${project.title}" class="lazy">
            </div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p class="project-excerpt">${project.excerpt}</p>
                <div class="project-meta">
                    <span class="project-category">${project.category}</span>
                    <span class="project-date">${formatDate(project.date)}</span>
                </div>
                <a href="${project.url}" class="btn btn-outline">Voir le projet</a>
            </div>
        `;
        
        grid.appendChild(projectElement);
    });
    
    container.appendChild(grid);
    
    // Ajouter un bouton "Voir plus" s'il y a plus de projets
    if (projects.length > 6) {
        const loadMoreButton = document.createElement('button');
        loadMoreButton.className = 'btn btn-load-more';
        loadMoreButton.textContent = 'Voir plus de projets';
        
        loadMoreButton.addEventListener('click', () => {
            // Implémenter le chargement de plus de projets
            console.log('Chargement de plus de projets...');
        });
        
        container.appendChild(loadMoreButton);
    }
}

// Rendu des articles de blog
function renderBlogPosts(container, posts) {
    const grid = document.createElement('div');
    grid.className = 'blog-grid';
    
    posts.slice(0, 3).forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'blog-card';
        postElement.innerHTML = `
            <div class="blog-image">
                <img data-src="${post.featuredImage}" alt="${post.title}" class="lazy">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-category">${post.category}</span>
                    <span class="blog-date">${formatDate(post.date)}</span>
                </div>
                <h3><a href="${post.url}">${post.title}</a></h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <a href="${post.url}" class="read-more">Lire la suite <span>&rarr;</span></a>
            </div>
        `;
        
        grid.appendChild(postElement);
    });
    
    container.appendChild(grid);
    
    // Ajouter un lien vers la page du blog
    const blogLink = document.createElement('div');
    blogLink.className = 'text-center mt-8';
    blogLink.innerHTML = '<a href="/blog/" class="btn btn-outline">Voir tous les articles</a>';
    container.appendChild(blogLink);
}

// Rendu des compétences
function renderSkills(container, skillsData) {
    const skillsByCategory = groupBy(skillsData.skills, 'category');
    
    for (const [category, skills] of Object.entries(skillsByCategory)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skills-category';
        categoryElement.innerHTML = `<h3>${category}</h3>`;
        
        const skillsList = document.createElement('div');
        skillsList.className = 'skills-list';
        
        skills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            skillElement.innerHTML = `
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">${skill.level}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0" data-width="${skill.level}"></div>
                </div>
            `;
            
            skillsList.appendChild(skillElement);
        });
        
        categoryElement.appendChild(skillsList);
        container.appendChild(categoryElement);
    }
    
    // Animer les barres de compétences lorsqu'elles deviennent visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.querySelector('.progress');
                if (progress) {
                    const width = progress.getAttribute('data-width');
                    progress.style.width = `${width}%`;
                }
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.skill-item').forEach(item => {
        observer.observe(item);
    });
}

// Rendu des témoignages
function renderTestimonials(container, testimonials) {
    const slider = document.createElement('div');
    slider.className = 'testimonials-slider';
    
    testimonials.forEach((testimonial, index) => {
        const testimonialElement = document.createElement('div');
        testimonialElement.className = 'testimonial';
        testimonialElement.innerHTML = `
            <div class="testimonial-content">
                <p>"${testimonial.quote}"</p>
            </div>
            <div class="testimonial-author">
                <img data-src="${testimonial.avatar}" alt="${testimonial.name}" class="lazy">
                <div class="author-info">
                    <h4>${testimonial.name}</h4>
                    <span class="author-title">${testimonial.position} chez ${testimonial.company}</span>
                </div>
            </div>
        `;
        
        slider.appendChild(testimonialElement);
    });
    
    container.appendChild(slider);
    
    // Initialiser le slider (à implémenter avec une bibliothèque comme Swiper.js ou en JS pur)
    initTestimonialSlider(slider);
}

// Charger les détails d'un projet
async function loadProjectDetails() {
    const projectId = getUrlParameter('id');
    if (!projectId) return;
    
    try {
        const response = await fetch(`/api/projects/${projectId}.json`);
        if (!response.ok) throw new Error('Projet non trouvé');
        
        const project = await response.json();
        renderProjectDetails(project);
    } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        showErrorMessage('Impossible de charger les détails du projet.');
    }
}

// Charger un article de blog
async function loadBlogPost() {
    const postId = getUrlParameter('id');
    if (!postId) return;
    
    try {
        const response = await fetch(`/api/posts/${postId}.json`);
        if (!response.ok) throw new Error('Article non trouvé');
        
        const post = await response.json();
        renderBlogPost(post);
    } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error);
        showErrorMessage('Impossible de charger l\'article.');
    }
}

// Initialiser le chargement paresseux des images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img.lazy');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Initialiser le chargement paresseux des iframes
function initLazyIframes() {
    const lazyIframes = document.querySelectorAll('iframe.lazy');
    
    const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.src = iframe.dataset.src;
                iframe.classList.remove('lazy');
                iframeObserver.unobserve(iframe);
            }
        });
    });
    
    lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
}

// Initialiser l'intersection observer pour le chargement différé
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Charger le contenu différé
                if (element.dataset.src) {
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                    } else if (element.tagName === 'IFRAME') {
                        element.src = element.dataset.src;
                    } else if (element.dataset.src.endsWith('.html')) {
                        fetch(element.dataset.src)
                            .then(response => response.text())
                            .then(html => {
                                element.innerHTML = html;
                                element.classList.add('loaded');
                            });
                    }
                    
                    // Ne plus observer cet élément
                    observer.unobserve(element);
                }
            }
        });
    }, {
        rootMargin: '200px',
        threshold: 0.01
    });
    
    // Observer les éléments avec data-src
    document.querySelectorAll('[data-src]').forEach(element => {
        observer.observe(element);
    });
}

// Fonctions utilitaires
function groupBy(array, key) {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
}

// Exposer les fonctions au scope global
window.ContentLoader = {
    loadSectionContent,
    initLazyLoading,
    initLazyIframes,
    initIntersectionObserver
};

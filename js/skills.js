// Gestion des compétences et certifications
document.addEventListener('DOMContentLoaded', function() {
    // Charger les compétences
    loadSkills();
    
    // Charger les certifications
    loadCertifications();
    
    // Initialiser les animations des barres de compétences
    initSkillBars();
});

// Charger les compétences depuis le fichier JSON
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des compétences');
        
        const skillsData = await response.json();
        displaySkills(skillsData);
    } catch (error) {
        console.error('Erreur:', error);
        showSkillsError('Impossible de charger les compétences');
    }
}

// Afficher les compétences
function displaySkills(skillsData) {
    const container = document.getElementById('skills-container');
    if (!container) return;
    
    // Grouper les compétences par catégorie
    const categories = {};
    skillsData.skills.forEach(skill => {
        if (!categories[skill.category]) {
            categories[skill.category] = [];
        }
        categories[skill.category].push(skill);
    });
    
    // Créer le HTML pour chaque catégorie
    let html = '';
    for (const [category, skills] of Object.entries(categories)) {
        html += `
            <div class="skill-category mb-12">
                <h3 class="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                    ${category}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${skills.map(skill => createSkillCard(skill)).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Animer les barres de compétences après un court délai
    setTimeout(animateSkillBars, 500);
}

// Créer une carte de compétence
function createSkillCard(skill) {
    return `
        <div class="skill-item bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
                ${skill.icon ? `
                    <div class="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg mr-4">
                        <i class="${skill.icon} text-xl"></i>
                    </div>
                ` : ''}
                <h4 class="text-lg font-semibold text-gray-800">${skill.name}</h4>
            </div>
            
            <div class="mb-2 flex justify-between text-sm text-gray-600">
                <span>Niveau</span>
                <span>${skill.level}%</span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="skill-level bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                     data-level="${skill.level}%" 
                     style="width: 0">
                </div>
            </div>
            
            ${skill.description ? `
                <p class="mt-3 text-gray-600 text-sm">${skill.description}</p>
            ` : ''}
            
            ${skill.tags && skill.tags.length > 0 ? `
                <div class="mt-3 flex flex-wrap gap-1">
                    ${skill.tags.map(tag => `
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Animer les barres de compétences
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    
    skillBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        bar.style.width = '0';
        
        // Utiliser requestAnimationFrame pour une animation fluide
        const animate = () => {
            const currentWidth = parseFloat(bar.style.width) || 0;
            const targetWidth = parseFloat(level);
            
            if (currentWidth < targetWidth) {
                bar.style.width = `${currentWidth + 1}%`;
                requestAnimationFrame(animate);
            }
        };
        
        // Démarrer l'animation avec un léger délai pour chaque barre
        setTimeout(animate, 100);
    });
}

// Initialiser les barres de compétences avec intersection observer
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    if (skillBars.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const level = bar.getAttribute('data-level');
                bar.style.width = level;
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

// Charger les certifications
async function loadCertifications() {
    try {
        const response = await fetch('data/certifications.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des certifications');
        
        const certifications = await response.json();
        displayCertifications(certifications);
    } catch (error) {
        console.error('Erreur:', error);
        showSkillsError('Impossible de charger les certifications');
    }
}

// Afficher les certifications
function displayCertifications(certifications) {
    const container = document.getElementById('certifications-container');
    if (!container) return;
    
    if (!certifications || certifications.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-600">Aucune certification à afficher pour le moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="certifications-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${certifications.map(cert => createCertificationCard(cert)).join('')}
        </div>
    `;
    
    // Initialiser les animations
    initCertificationAnimations();
}

// Créer une carte de certification
function createCertificationCard(cert) {
    const issueDate = new Date(cert.issueDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
    });
    
    const expiryDate = cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
    }) : null;
    
    return `
        <div class="certification-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div class="p-6">
                <div class="flex items-start">
                    ${cert.logo ? `
                        <img src="${cert.logo}" 
                             alt="${cert.issuer} logo" 
                             class="w-12 h-12 object-contain mr-4"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='images/placeholder-certification.png'"
                        >
                    ` : ''}
                    
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">${cert.name}</h3>
                        <p class="text-indigo-600 text-sm font-medium">${cert.issuer}</p>
                        
                        <div class="mt-3 text-sm text-gray-500">
                            <div class="flex items-center mb-1">
                                <i class="far fa-calendar-alt mr-2 w-4"></i>
                                <span>Délivré : ${issueDate}</span>
                            </div>
                            ${expiryDate ? `
                                <div class="flex items-center">
                                    <i class="fas fa-hourglass-half mr-2 w-4"></i>
                                    <span>Expire : ${expiryDate}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                ${cert.description ? `
                    <p class="mt-4 text-gray-600 text-sm">${cert.description}</p>
                ` : ''}
                
                <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    ${cert.credentialId ? `
                        <div class="text-xs text-gray-500">
                            <span class="font-medium">ID :</span> ${cert.credentialId}
                        </div>
                    ` : ''}
                    
                    <div class="flex space-x-2">
                        ${cert.credentialUrl ? `
                            <a href="${cert.credentialUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                               data-tooltip="Voir la certification">
                                <i class="fas fa-external-link-alt mr-1"></i>
                                Vérifier
                            </a>
                        ` : ''}
                        
                        ${cert.certificateUrl ? `
                            <a href="${cert.certificateUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center ml-3"
                               data-tooltip="Télécharger le certificat">
                                <i class="fas fa-file-pdf mr-1"></i>
                                PDF
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialiser les animations des certifications
function initCertificationAnimations() {
    const certifications = document.querySelectorAll('.certification-card');
    
    certifications.forEach((cert, index) => {
        // Délai d'animation en escalier
        cert.style.animationDelay = `${index * 0.1}s`;
        cert.classList.add('animate-fade-in-up');
    });
}

// Afficher une erreur
function showSkillsError(message) {
    const container = document.getElementById('skills-container') || 
                     document.getElementById('certifications-container') || 
                     document.body;
    
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
window.Skills = {
    loadSkills,
    loadCertifications,
    animateSkillBars
};

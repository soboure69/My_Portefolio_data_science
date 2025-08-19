// Gestion du menu mobile
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Fermer le menu mobile quand on clique sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Animation de frappe
const typingText = document.getElementById('typing-text');
if (typingText) {
    const texts = [
        'Data Scientist',
        'Machine Learning Engineer',
        'Data Analyst',
        'AI Enthusiast'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let pause = 2000;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            typingSpeed = pause;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Démarrer l'animation après un court délai
    setTimeout(type, 1000);
}

// Animation au défilement
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.classList.add('visible');
        }
    });
}

// Gestion du chargement des projets et articles
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();
        const projectList = document.getElementById('project-list');
        
        if (projectList) {
            projectList.innerHTML = projects.map(project => `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover fade-in" data-project-id="${project.id}">
                    <div class="project-image">
                        <img src="${project.image}" alt="${project.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display:none;" class="w-full h-full ${project.gradient} flex items-center justify-center">
                            <i class="${project.icon} text-white text-4xl"></i>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${project.tags.map(tag => `<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">${tag}</span>`).join('')}
                        </div>
                        <a href="projects/${project.id}.html" class="text-indigo-600 font-semibold hover:text-indigo-800 transition flex items-center">
                            Voir le projet <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
    }
}

// Charger les projets quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Animation au défilement
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Pour les éléments déjà visibles au chargement
    
    // Charger les projets
    loadProjects();
    
    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Envoi en cours...';
                
                // Ici, vous pouvez ajouter votre logique d'envoi de formulaire
                // Par exemple, en utilisant FormSubmit, Netlify Forms, ou une API personnalisée
                
                // Simulation d'envoi
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Afficher un message de succès
                alert('Votre message a été envoyé avec succès ! Je vous recontacterai bientôt.');
                contactForm.reset();
                
            } catch (error) {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
                alert('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});

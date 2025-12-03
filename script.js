// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Set minimum date for date input
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', today);
});

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const translateX = -currentSlide * 100;
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update active state
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

// Auto-advance carousel
setInterval(nextSlide, 5000);

// Smooth scroll to contact section
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form validation and submission
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Simple French phone number validation
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearAllErrors() {
    const errorFields = ['firstName', 'lastName', 'email', 'phone', 'date'];
    errorFields.forEach(field => clearError(field));
}

function validateForm(formData) {
    let isValid = true;
    clearAllErrors();

    // Validate first name
    if (!formData.firstName.trim()) {
        showError('firstName', 'Le prénom est obligatoire');
        isValid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
        showError('lastName', 'Le nom est obligatoire');
        isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
        showError('email', 'L\'email est obligatoire');
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showError('email', 'Adresse email invalide');
        isValid = false;
    }

    // Validate phone
    if (!formData.phone.trim()) {
        showError('phone', 'Le téléphone est obligatoire');
        isValid = false;
    } else if (!validatePhone(formData.phone)) {
        showError('phone', 'Numéro de téléphone invalide');
        isValid = false;
    }

    // Validate date
    if (!formData.preferredDate) {
        showError('date', 'Veuillez sélectionner une date');
        isValid = false;
    } else {
        const selectedDate = new Date(formData.preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError('date', 'La date doit être dans le futur');
            isValid = false;
        }
    }

    return isValid;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    const formData = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        preferredDate: form.preferredDate.value,
        message: form.message.value.trim()
    };

    if (!validateForm(formData)) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer ma demande';
        return;
    }

    try {
        // 🔥 Envoi au backend
        const response = await fetch('https://jubdev.fr/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Erreur serveur');

        showToast('Votre message a été envoyé avec succès !', 'success');
        form.reset();
    } catch (error) {
        console.error(error);
        showToast('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer ma demande';
    }
}


// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Add real-time validation for email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showError('email', 'Adresse email invalide');
            } else {
                clearError('email');
            }
        });
    }
    
    // Add real-time validation for phone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                showError('phone', 'Numéro de téléphone invalide');
            } else {
                clearError('phone');
            }
        });
    }
    
    // Clear errors when user starts typing
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const fieldName = this.name;
            if (fieldName) {
                clearError(fieldName);
            }
        });
    });
});

// Keyboard navigation for carousel
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        prevSlide();
    } else if (event.key === 'ArrowRight') {
        nextSlide();
    }
});

// Touch/swipe support for carousel
let startX = 0;
let isDragging = false;

const carousel = document.querySelector('.carousel-container');
if (carousel) {
    carousel.addEventListener('touchstart', function(event) {
        startX = event.touches[0].clientX;
        isDragging = true;
    });
    
    carousel.addEventListener('touchmove', function(event) {
        if (!isDragging) return;
        event.preventDefault();
    });
    
    carousel.addEventListener('touchend', function(event) {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = event.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });
}

// Intersection Observer for animations (optional enhancement)
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.property-details, .contact-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}
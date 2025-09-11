/**
 * Page Transitions and Scroll Animations
 * Works with the page-transitions.css file
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll progress indicator
    initScrollProgress();
    
    // Setup page transitions
    setupPageTransitions();
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Fix for content visibility
    ensureContentVisibility();
    
    // Force load images
    forceLoadImages();
});

/**
 * Force load all images that might be affected by lazy loading or animations
 */
function forceLoadImages() {
    // Force load all images
    document.querySelectorAll('img').forEach(img => {
        // Make sure the image is visible
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.style.display = '';
        
        // If image has lazy loading, force load it
        if (img.loading === 'lazy') {
            const src = img.getAttribute('src');
            if (src) {
                const newImg = new Image();
                newImg.src = src;
                newImg.onload = function() {
                    img.src = src; // Reload the image
                };
            }
        }
    });
    
    // Special fix for about image
    const aboutImage = document.querySelector('.position-relative.h-100 img');
    if (aboutImage) {
        aboutImage.style.visibility = 'visible';
        aboutImage.style.opacity = '1';
        aboutImage.style.position = 'absolute';
        aboutImage.style.width = '100%';
        aboutImage.style.height = '100%';
        aboutImage.style.objectFit = 'cover';
    }
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        scrollProgress.style.width = scrollPercent + '%';
    });
}

/**
 * Setup page transitions for links
 */
function setupPageTransitions() {
    const pageTransition = document.querySelector('.page-transition');
    
    // Add click event to all internal links that should trigger page transition
    document.querySelectorAll('a[href^="/"]:not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip transition for anchor links
            if (href.startsWith('/#')) {
                return;
            }
            
            // Prevent default link behavior
            e.preventDefault();
            
            // Show transition
            pageTransition.style.transition = 'transform 0.5s ease';
            pageTransition.style.transform = 'translateY(0)';
            
            // Navigate to new page after animation
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
    
    // Hide transition overlay when page loads
    window.addEventListener('pageshow', function() {
        pageTransition.style.transition = 'transform 0.5s ease 0.5s';
        pageTransition.style.transform = 'translateY(100%)';
        
        // Ensure content is visible
        ensureContentVisibility();
        
        // Force load images
        forceLoadImages();
    });
}

/**
 * Ensure all content is visible (fixes potential issues with animations)
 */
function ensureContentVisibility() {
    // Make sure main content is visible
    document.querySelectorAll('main, .container, .container-fluid, section').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = '';
    });
    
    // Fix specific container with about image
    const aboutSection = document.querySelector('.position-relative.h-100');
    if (aboutSection) {
        aboutSection.style.visibility = 'visible';
        aboutSection.style.opacity = '1';
        aboutSection.style.minHeight = '400px';
        aboutSection.style.display = 'block';
    }
    
    // Hide spinner if present
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('show');
    }
    
    // Ensure body is scrollable
    document.body.style.overflow = '';
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
}

/**
 * Setup scroll animations for elements with animation classes
 */
function setupScrollAnimations() {
    // Elements that will animate on scroll
    const animatedElements = document.querySelectorAll(
        '.text-reveal, .image-reveal, .stagger-list-item, .section-entrance'
    );
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -10% 0px' // Slightly before the element enters the viewport
    });
    
    // Observe all animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add animated classes to elements on document load
    addAnimationClasses();
}

/**
 * Add animation classes to common elements
 */
function addAnimationClasses() {
    // Add text-reveal to headings
    document.querySelectorAll('h1, h2, h3, .carousel-caption h5, .carousel-caption h1, .carousel-caption p').forEach(element => {
        if (!element.classList.contains('text-reveal')) {
            element.classList.add('text-reveal');
        }
    });
    
    // Add image-reveal to images in content areas, except the about image
    document.querySelectorAll('.container img:not(.navbar img):not(.position-absolute)').forEach(element => {
        if (!element.classList.contains('image-reveal')) {
            element.classList.add('image-reveal');
        }
    });
    
    // Add section-entrance to sections
    document.querySelectorAll('section, .container:not(.navbar-container)').forEach(element => {
        if (!element.classList.contains('section-entrance')) {
            element.classList.add('section-entrance');
        }
    });
    
    // Add stagger-list-item to list items in navigation
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(element => {
        if (!element.classList.contains('stagger-list-item')) {
            element.classList.add('stagger-list-item');
        }
    });
    
    // Add carousel-zoom to carousel images
    document.querySelectorAll('.owl-carousel-item').forEach(element => {
        if (!element.classList.contains('carousel-zoom')) {
            element.classList.add('carousel-zoom');
        }
    });
}

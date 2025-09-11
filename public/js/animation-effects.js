/**
 * Animation Effects for Resource Bank
 * This script adds animations that work alongside existing functionality
 * without breaking or replacing any existing features.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initPageLoadAnimations();
    initScrollAnimations();
    initHoverEffects();

    // Show loading animation only on first visit
    showLoadingAnimationIfNeeded();
});

/**
 * Initialize animations that happen on page load
 */
function initPageLoadAnimations() {
    // Add animation classes to elements that should animate on page load
    const header = document.querySelector('.navbar');
    if (header) {
        header.classList.add('animated', 'fade-in');
    }

    // Animate hero section elements if they exist
    const heroTitle = document.querySelector('.hero-title, .heading, h1');
    const heroSubtitle = document.querySelector('.hero-subtitle, h2');
    if (heroTitle) {
        heroTitle.classList.add('animated', 'fade-in-up');
    }
    if (heroSubtitle) {
        heroSubtitle.classList.add('animated', 'fade-in-up', 'delay-1');
    }

    // Animate nav items with staggered delay
    const navItems = document.querySelectorAll('.navbar-nav .nav-item, .navbar-nav a');
    navItems.forEach((item, index) => {
        item.classList.add('animated', 'fade-in');
        item.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
}

/**
 * Initialize scroll-based animations using Intersection Observer
 */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers that don't support Intersection Observer
        document.querySelectorAll('.reveal').forEach(item => {
            item.classList.add('visible');
        });
        return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with reveal class
    document.querySelectorAll('.reveal').forEach(element => {
        revealObserver.observe(element);
    });

    // Handle staggered animations
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all stagger items within this container
                const items = entry.target.querySelectorAll('.stagger-item');
                items.forEach(item => {
                    item.classList.add('animated', 'fade-in-up');
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    // Observe all stagger containers
    document.querySelectorAll('.stagger-container').forEach(container => {
        staggerObserver.observe(container);
    });
}

/**
 * Initialize hover effects
 */
function initHoverEffects() {
    // Add hover-lift effect to cards
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hover-lift');
    });

    // Add hover-highlight effect to navigation items
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.add('hover-highlight');
    });

    // Add hover-grow effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.classList.contains('btn-social')) {
            btn.classList.add('hover-grow');
        }
    });
}

/**
 * Show loading animation with bouncing ball on first visit
 */
function showLoadingAnimationIfNeeded() {
    // Check if this is the first visit in this session
    if (!sessionStorage.getItem('visited')) {
        // Create loading animation container
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-ball-container';
        
        // Create ball element
        const ball = document.createElement('div');
        ball.className = 'loading-ball';
        
        // Create loading text
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Welcome to Resource Bank';
        
        // Append elements
        loadingContainer.appendChild(ball);
        loadingContainer.appendChild(loadingText);
        document.body.appendChild(loadingContainer);
        
        // Hide main content until animation completes
        document.body.style.overflow = 'hidden';
        
        // Remove loading animation after delay
        setTimeout(() => {
            loadingContainer.style.opacity = '0';
            loadingContainer.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                loadingContainer.remove();
                document.body.style.overflow = '';
                
                // Mark as visited
                sessionStorage.setItem('visited', 'true');
            }, 500);
        }, 2000);
    }
}

/**
 * Helper function to add the reveal class to elements
 * This can be called for dynamic content
 */
function addRevealAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.classList.add('reveal');
    });
}

/**
 * Helper function to set up a staggered container with items
 * This can be called for dynamic content
 */
function setupStaggeredContainer(containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (container) {
        container.classList.add('stagger-container');
        const items = container.querySelectorAll(itemSelector);
        items.forEach(item => {
            item.classList.add('stagger-item');
        });
    }
}

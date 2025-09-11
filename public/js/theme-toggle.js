/**
 * Theme Toggle System - Inspired by dontboardme.com
 * Features:
 * - Detects and respects system preferences
 * - Smooth transitions between themes
 * - Saves user preference in localStorage
 * - Animated toggle switch
 * - Integrates with existing bouncing ball animation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the floating theme toggle element
    createThemeToggle();
    
    // Initialize theme based on saved preference or system preference
    initializeTheme();
    
    // Mark the body with a class to enable transition animations
    document.body.classList.add('theme-transition');
    
    // Add event listener to the navbar toggle if it exists
    const navbarToggle = document.getElementById('navbar-theme-toggle');
    if (navbarToggle) {
        navbarToggle.addEventListener('click', toggleTheme);
        
        // Add bubble effects to navbar toggle on hover
        addBubbleEffectToToggle(navbarToggle);
    }
    
    // Integrate with the existing bouncing ball animation
    integrateWithBallAnimation();
});

/**
 * Creates and injects the floating theme toggle into the DOM
 */
function createThemeToggle() {
    const toggleHtml = `
        <div class="theme-toggle-wrapper">
            <div class="theme-toggle" id="theme-toggle" role="button" aria-label="Toggle dark mode">
                <div class="toggle-icons">
                    <i class="fas fa-sun"></i>
                    <i class="fas fa-moon"></i>
                </div>
                <div class="toggle-circle"></div>
            </div>
            <div class="bubble-container"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toggleHtml);
    
    // Add click event listener to the toggle
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', toggleTheme);
        
        // Create floating bubbles for the toggle
        createFloatingBubbles();
    }
}

/**
 * Initializes the theme based on saved preference or system preference
 */
function initializeTheme() {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    console.log('Saved theme from localStorage:', savedTheme);
    
    if (savedTheme) {
        // Use saved theme
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.classList.add(`theme-${savedTheme}`);
        console.log('Applied saved theme:', savedTheme);
    } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDarkMode ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.add(`theme-${theme}`);
        
        // Save the system preference
        localStorage.setItem('theme', theme);
        console.log('Applied system theme:', theme);
    }
    
    // Add event listener for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only change if user hasn't manually set a preference
        if (!localStorage.getItem('theme') || localStorage.getItem('theme') === 'system') {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
    
    // Update all toggle buttons to reflect current theme
    updateToggleState();
    
    // Debug: Check current state
    console.log('Current data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Current body background:', getComputedStyle(document.body).backgroundColor);
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply the animation to all toggle switches
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.classList.add('animate');
    });
    
    // Add a subtle bounce animation to the page
    document.body.classList.add('theme-changing');
    
    // Set the new theme with a slight delay for animation
    setTimeout(() => {
        setTheme(newTheme);
        
        // Trigger bubble animations
        showBubbles();
        
        // Remove animation classes after transition
        setTimeout(() => {
            toggles.forEach(toggle => {
                toggle.classList.remove('animate');
            });
            document.body.classList.remove('theme-changing');
        }, 500);
    }, 100);
}

/**
 * Sets the specified theme and saves the preference
 * @param {string} theme - The theme to set ('light' or 'dark')
 */
function setTheme(theme) {
    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Apply new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Set the data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save the preference
    localStorage.setItem('theme', theme);
    
    // Update all toggle states
    updateToggleState();
    
    // Emit a custom event for other scripts to react
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: theme }
    }));
    
    console.log(`Theme changed to ${theme} mode`);
    console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    console.log('CSS variables:', getComputedStyle(document.documentElement).getPropertyValue('--text-color'));
    console.log('Body background after theme change:', getComputedStyle(document.body).backgroundColor);
    
    // Force a repaint to ensure CSS changes are applied
    document.body.offsetHeight;
    
    // Additional debugging
    console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Body classes:', document.body.className);
    console.log('Computed body background:', getComputedStyle(document.body).backgroundColor);
    console.log('Computed body color:', getComputedStyle(document.body).color);
}

/**
 * Updates all toggle switches to reflect the current theme state
 */
function updateToggleState() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const toggles = document.querySelectorAll('.theme-toggle');
    
    console.log('Updating toggle state for theme:', currentTheme);
    
    toggles.forEach(toggle => {
        // Remove both classes first
        toggle.classList.remove('dark-mode', 'light-mode');
        
        // Add the appropriate class
        if (currentTheme === 'dark') {
            toggle.classList.add('dark-mode');
            console.log('Added dark-mode class to toggle');
        } else {
            toggle.classList.add('light-mode');
            console.log('Added light-mode class to toggle');
        }
    });
}

/**
 * Creates floating bubbles for the theme toggle
 */
function createFloatingBubbles() {
    const bubbleContainer = document.querySelector('.bubble-container');
    if (!bubbleContainer) return;
    
    // Create bubbles
    for (let i = 0; i < 10; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        bubble.style.animationDuration = `${3 + Math.random() * 7}s`;
        bubbleContainer.appendChild(bubble);
    }
}

/**
 * Adds bubble effects to a toggle element
 * @param {HTMLElement} toggleElement - The toggle element to add bubbles to
 */
function addBubbleEffectToToggle(toggleElement) {
    if (!toggleElement) return;
    
    // Create bubble container
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'bubble-container';
    
    // Add bubbles
    for (let i = 0; i < 6; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 3}s`;
        bubble.style.animationDuration = `${2 + Math.random() * 4}s`;
        bubbleContainer.appendChild(bubble);
    }
    
    // Add container after toggle
    toggleElement.parentNode.insertBefore(bubbleContainer, toggleElement.nextSibling);
}

/**
 * Shows bubbles animation when theme changes
 */
function showBubbles() {
    const bubbleContainers = document.querySelectorAll('.bubble-container');
    
    bubbleContainers.forEach(container => {
        container.classList.add('active');
        
        setTimeout(() => {
            container.classList.remove('active');
        }, 2000);
    });
}

/**
 * Integrates theme toggle with the existing bouncing ball animation
 */
function integrateWithBallAnimation() {
    // Check if the ball animation exists (from your existing code)
    const ball = document.querySelector('.ball-animation');
    if (!ball) return;
    
    // Listen for theme changes to update ball colors
    document.addEventListener('themeChanged', function(e) {
        const theme = e.detail.theme;
        
        if (theme === 'dark') {
            // Update ball gradient in dark mode
            ball.style.background = 'radial-gradient(circle at 30% 30%, #4B6BFD, #06ADEF)';
            ball.style.boxShadow = '0 0 15px rgba(6, 173, 239, 0.6)';
        } else {
            // Reset to original gradient
            ball.style.background = 'radial-gradient(circle at 30% 30%, #ffffff, #06ADEF)';
            ball.style.boxShadow = '0 0 15px rgba(6, 173, 239, 0.3)';
        }
    });
}

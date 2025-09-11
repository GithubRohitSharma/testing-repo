/**
 * Lazy Loading Utility for NITJ IT Resource Bank
 * 
 * This utility provides functions to lazy load images, videos, and iframes
 * using the Intersection Observer API for better performance.
 */

(function() {
    'use strict';
    
    // Store all lazy elements to be observed
    const lazyElements = [];
    
    // Observer configuration
    const observerOptions = {
        root: null, // viewport is the root
        rootMargin: '50px 0px', // 50px margin before loading
        threshold: 0.01 // 1% visibility triggers loading
    };
    
    /**
     * Handle intersection with the viewport
     */
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Handle different element types
                if (element.tagName.toLowerCase() === 'img') {
                    loadImage(element);
                } else if (element.tagName.toLowerCase() === 'video') {
                    loadVideo(element);
                } else if (element.tagName.toLowerCase() === 'iframe') {
                    loadIframe(element);
                } else if (element.classList.contains('pdf-preview')) {
                    loadPdfPreview(element);
                }
                
                // Stop observing this element
                observer.unobserve(element);
                
                // Remove from our tracking array
                const index = lazyElements.indexOf(element);
                if (index !== -1) {
                    lazyElements.splice(index, 1);
                }
            }
        });
    }
    
    /**
     * Load an image
     */
    function loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }
    
    /**
     * Load a video
     */
    function loadVideo(video) {
        const src = video.dataset.src;
        if (src) {
            // If there's a poster, set it first
            if (video.dataset.poster) {
                video.poster = video.dataset.poster;
                video.removeAttribute('data-poster');
            }
            
            // Handle video source elements
            const sources = video.querySelectorAll('source[data-src]');
            sources.forEach(source => {
                source.src = source.dataset.src;
                source.removeAttribute('data-src');
            });
            
            // If no source elements but has data-src
            if (sources.length === 0 && src) {
                video.src = src;
                video.removeAttribute('data-src');
            }
            
            // Load the video
            video.load();
            video.classList.add('loaded');
        }
    }
    
    /**
     * Load an iframe (e.g., YouTube or PDF viewers)
     */
    function loadIframe(iframe) {
        const src = iframe.dataset.src;
        if (src) {
            iframe.src = src;
            iframe.removeAttribute('data-src');
            iframe.classList.add('loaded');
        }
    }
    
    /**
     * Load PDF preview
     */
    function loadPdfPreview(element) {
        const src = element.dataset.pdfSrc;
        if (src) {
            // Create an iframe for the PDF
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.className = 'pdf-iframe';
            element.appendChild(iframe);
            
            // Remove data attributes
            element.removeAttribute('data-pdf-src');
            element.classList.add('loaded');
        }
    }
    
    /**
     * Initialize lazy loading
     */
    function initLazyLoading() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(handleIntersection, observerOptions);
            
            // Get all elements with data-src or the lazy-load class
            const candidates = document.querySelectorAll(
                'img[data-src], video[data-src], iframe[data-src], .pdf-preview[data-pdf-src], .lazy-load'
            );
            
            candidates.forEach(element => {
                observer.observe(element);
                lazyElements.push(element);
            });
            
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            loadAllLazyElements();
        }
    }
    
    /**
     * Fallback: Load all lazy elements immediately
     */
    function loadAllLazyElements() {
        document.querySelectorAll('img[data-src]').forEach(loadImage);
        document.querySelectorAll('video[data-src]').forEach(loadVideo);
        document.querySelectorAll('iframe[data-src]').forEach(loadIframe);
        document.querySelectorAll('.pdf-preview[data-pdf-src]').forEach(loadPdfPreview);
    }
    
    /**
     * Apply lazy loading to dynamically added elements
     */
    function applyLazyLoading(element) {
        if (!element) return;
        
        // For a single element
        if (element.nodeType === 1) {
            addLazyElementToObserver(element);
        }
        // For multiple elements or a container
        else if (element.querySelectorAll) {
            const candidates = element.querySelectorAll(
                'img[data-src], video[data-src], iframe[data-src], .pdf-preview[data-pdf-src], .lazy-load'
            );
            candidates.forEach(addLazyElementToObserver);
        }
    }
    
    /**
     * Add a lazy element to the observer
     */
    function addLazyElementToObserver(element) {
        if ('IntersectionObserver' in window && !element.classList.contains('loaded')) {
            const observer = new IntersectionObserver(handleIntersection, observerOptions);
            observer.observe(element);
            lazyElements.push(element);
        } else {
            // Fallback or if element is already loaded
            if (element.tagName.toLowerCase() === 'img') {
                loadImage(element);
            } else if (element.tagName.toLowerCase() === 'video') {
                loadVideo(element);
            } else if (element.tagName.toLowerCase() === 'iframe') {
                loadIframe(element);
            } else if (element.classList.contains('pdf-preview')) {
                loadPdfPreview(element);
            }
        }
    }
    
    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', initLazyLoading);
    
    // Expose functions to global scope
    window.LazyLoader = {
        init: initLazyLoading,
        apply: applyLazyLoading
    };
})();

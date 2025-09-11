/**
 * Simple ball animation that waits for ALL content to load
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only show animation if not previously visited
    if (!sessionStorage.getItem('visited')) {
        createBallAnimation();
    } else {
        fixVisibilityIssues();
    }
});

function createBallAnimation() {
    console.log("Creating ball animation");
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#fff';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.flexDirection = 'column';
    
    // Create ball
    const ball = document.createElement('div');
    ball.style.width = '50px';
    ball.style.height = '50px';
    ball.style.borderRadius = '50%';
    ball.style.backgroundColor = '#06BBCC';
    ball.style.position = 'absolute';
    ball.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    ball.style.cursor = 'pointer';
    ball.style.transition = 'transform 0.2s ease';
    
    // Make ball larger on mobile for better touch targets
    if (window.innerWidth <= 768) {
        ball.style.width = '60px';
        ball.style.height = '60px';
    }
    
    // Create instruction
    const instruction = document.createElement('div');
    instruction.textContent = 'bounce a ball to get to the site';
    instruction.style.fontFamily = 'Poppins, sans-serif';
    instruction.style.fontSize = '18px';
    instruction.style.color = '#333';
    instruction.style.marginTop = '400px';
    instruction.style.opacity = '0.8';
    
    // Adjust instruction for mobile
    if (window.innerWidth <= 768) {
        instruction.style.fontSize = '16px';
        instruction.style.marginTop = '300px';
        instruction.style.padding = '0 20px';
        instruction.style.textAlign = 'center';
    }
    
    // Add loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'loading...';
    loadingText.style.fontFamily = 'Poppins, sans-serif';
    loadingText.style.fontSize = '16px';
    loadingText.style.color = '#06BBCC';
    loadingText.style.marginTop = '20px';
    loadingText.style.display = 'none';
    
    // Add elements to overlay
    overlay.appendChild(ball);
    overlay.appendChild(instruction);
    overlay.appendChild(loadingText);
    document.body.appendChild(overlay);
    
    // Hide overflow on body
    document.body.style.overflow = 'hidden';
    
    // Initialize ball position
    let ballX = window.innerWidth / 2 - 20;
    let ballY = window.innerHeight / 2 - 20;
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    
    // Track mouse position
    let mouseX = ballX;
    let mouseY = ballY;
    let isBouncing = false;
    
    // Mouse move event to make ball follow cursor
    document.addEventListener('mousemove', function(e) {
        if (isBouncing) return;
        
        mouseX = e.clientX - 20;
        mouseY = e.clientY - 20;
    });
    
    // Animation loop for ball
    function animateBall() {
        if (isBouncing) return;
        
        ballX += (mouseX - ballX) * 0.1;
        ballY += (mouseY - ballY) * 0.1;
        
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
        
        requestAnimationFrame(animateBall);
    }
    
    // Start animation
    animateBall();
    
    // Global loading state
    let facultyData = null;
    let schedulesData = null;
    let wasClicked = false;
    
    // Start loading immediately in the background
    startLoading();
    
    // Set emergency timeout (20 seconds)
    const MAX_WAIT = 20000;
    let emergencyTimer = null;
    
    // When ball is clicked
    ball.addEventListener('click', function() {
        if (isBouncing) return;
        
        console.log("Ball clicked");
        isBouncing = true;
        wasClicked = true;
        
        // Set emergency timeout
        emergencyTimer = setTimeout(function() {
            console.log("Emergency timeout reached, revealing site anyway");
            revealSite();
        }, MAX_WAIT);
        
        // Hide instruction, show loading
        instruction.style.display = 'none';
        loadingText.style.display = 'block';
        
        // First bounce animation
        ball.style.transition = 'all 0.3s cubic-bezier(0.42, 0, 0.58, 1)';
        ball.style.top = (window.innerHeight - 60) + 'px';
        
        // Then bounce up
        setTimeout(function() {
            ball.style.transition = 'all 0.7s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
            ball.style.top = '-100px';
            
            // Reveal site immediately after bounce animation
            setTimeout(function() {
                console.log("Ball animation complete, revealing site");
                revealSite();
            }, 700); // Wait for bounce animation to complete
        }, 300);
    });
    
    // Handle hover effects
    ball.addEventListener('mouseenter', function() {
        if (!isBouncing) ball.style.transform = 'scale(1.1)';
    });
    
    ball.addEventListener('mouseleave', function() {
        if (!isBouncing) ball.style.transform = 'scale(1)';
    });
    
    // Start loading actual content
    function startLoading() {
        console.log("Starting background loading");
        
        // Prefetch critical images
        preloadCriticalImages();
        
        // Load faculty data in background (non-blocking)
        fetch('/get-teachers')
            .then(response => response.json())
            .then(data => {
                console.log("Faculty data loaded:", data.length, "items");
                facultyData = data;
                // Update faculty display if site is already revealed
                if (facultyData) {
                    displayFaculty(facultyData);
                }
            })
            .catch(error => {
                console.error("Error loading faculty data:", error);
                facultyData = []; // Set empty fallback
            });
        
        // Load schedules data in background (non-blocking)
        fetch('/get-schedules')
            .then(response => response.json())
            .then(data => {
                console.log("Schedules data loaded:", data.length, "items");
                schedulesData = data;
                // Update schedules display if site is already revealed
                if (schedulesData) {
                    displaySchedules(schedulesData);
                }
            })
            .catch(error => {
                console.error("Error loading schedules data:", error);
                schedulesData = []; // Set empty fallback
            });
    }
    
    // Preload critical images
    function preloadCriticalImages() {
        console.log("Preloading critical images");
        const criticalImages = [
            '/img/carousel_1.jpg',
            '/img/carousel_2.jpg', 
            '/img/carousel_4.jpg',
            '/img/about.jpg'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Function to show the site
    function revealSite() {
        // Only run once
        if (overlay.dataset.revealing === "true") return;
        overlay.dataset.revealing = "true";
        
        console.log("Revealing site");
        
        // Clear emergency timer if set
        if (emergencyTimer) {
            clearTimeout(emergencyTimer);
            emergencyTimer = null;
        }
        
        // Mark as visited
        sessionStorage.setItem('visited', 'true');
        
        // Display content if available (non-blocking)
        if (facultyData && facultyData.length > 0) {
            displayFaculty(facultyData);
        }
        
        if (schedulesData && schedulesData.length > 0) {
            displaySchedules(schedulesData);
        }
        
        // Fade out overlay
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.opacity = '0';
        
        // Remove overlay after animation
        setTimeout(function() {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
            
            // Fix visibility issues
            fixVisibilityIssues();
            
            // Hide spinner if exists
            const spinner = document.getElementById('spinner');
            if (spinner) spinner.classList.remove('show');
            
            // Initialize UI components
            initUI();
            
            console.log("Site fully revealed");
        }, 500);
    }
}

// Display actual faculty data
function displayFaculty(data) {
    console.log("Displaying faculty:", data.length, "items");
    
    const container = document.getElementById('teachers');
    if (!container) {
        console.error("Faculty container not found");
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Add teachers
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 wow fadeInUp';
        card.setAttribute('data-wow-delay', '0.1s');
        card.innerHTML = `
            <div class="team-item bg-light">
                <div class="overflow-hidden">
                    <img class="img-fluid" src="${item.img}" alt="${item.name}">
                </div>
                <div class="position-relative d-flex justify-content-center" style="margin-top: -23px;">
                    <div class="bg-light d-flex justify-content-center pt-2 px-1">
                        <a class="btn btn-sm-square btn-primary mx-1" href="${item.web}"><i class="fas fa-user"></i></a>
                    </div>
                </div>
                <div class="text-center p-4">
                    <h5 class="mb-0">${item.name}</h5>
                    <small>${item.designation}</small>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display actual schedules data
function displaySchedules(data) {
    console.log("Displaying schedules:", data.length, "items");
    
    const container = document.getElementById('schedulesList');
    if (!container) {
        console.error("Schedules container not found");
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Add schedules
    data.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'testimonial-item text-center';
        scheduleItem.innerHTML = `
            <h5 class="mb-0">${item.name}</h5>
            <p>${item.day}</p>
            <a href="${item.document}" class="btn btn-primary" target="_blank">View</a>
        `;
        container.appendChild(scheduleItem);
    });
}

// Initialize UI components (carousels, animations)
function initUI() {
    console.log("Initializing UI components");
    
    // Initialize carousel
    if (window.jQuery && jQuery.fn.owlCarousel) {
        try {
            jQuery('#schedulesList').owlCarousel({
                autoplay: true, 
                smartSpeed: 1000,
                center: true,
                margin: 24,
                dots: true,
                loop: true,
                nav: false,
                responsive: {
                    0: { items: 1 },
                    768: { items: 2 },
                    992: { items: 3 }
                }
            });
        } catch (e) {
            console.error("Error initializing carousel:", e);
        }
    }
    
    // Initialize WOW animations
    if (window.WOW) {
        try {
            new WOW().init();
        } catch (e) {
            console.error("Error initializing WOW:", e);
        }
    }
}

// Fix visibility issues
function fixVisibilityIssues() {
    console.log("Fixing visibility issues");
    
    // Force all content to be visible
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    // Fix containers and sections
    document.querySelectorAll('.container, .container-fluid, main, section').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = '';
    });
    
    // Fix carousel content
    document.querySelectorAll('.owl-carousel, .owl-carousel-item, .owl-carousel .position-absolute').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = el.classList.contains('position-absolute') ? 'flex' : '';
    });
    
    // Fix carousel text
    document.querySelectorAll('.owl-carousel h1, .owl-carousel h5, .owl-carousel p, .owl-carousel a').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = 'block';
    });
    
    // Fix the IT Department text
    document.querySelectorAll('.display-3.text-white').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = 'block';
        
        if (el.textContent.includes('Developed for the Students of IT Department')) {
            el.style.fontWeight = 'bold';
            el.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        }
    });
    
    // Fix animated elements
    document.querySelectorAll('.animated').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.classList.add('visible');
    });
}

// Simple function to mark internal navigation
function markInternalNavigation() {
    localStorage.setItem('bruut-internal-nav', 'true');
    console.log('Marked internal navigation');
}

// Check if coming from internal navigation via URL parameter
function isInternalNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromInternal = urlParams.get('from') === 'internal';
    
    console.log('Main page - checking URL params:', fromInternal);
    
    // Clean up URL without page reload
    if (fromInternal) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    return fromInternal;
}

// Detect browser back/forward navigation
window.addEventListener('pageshow', function(event) {
    console.log('pageshow event triggered');
    console.log('persisted:', event.persisted);
    console.log('referrer:', document.referrer);
    
    // If page is being shown from cache (browser back/forward)
    if (event.persisted) {
        console.log('Page loaded from cache - likely browser back navigation');
        
        // Check if coming from a film page
        if (document.referrer && document.referrer.includes('film.html')) {
            console.log('Browser back from film page detected');
            
            // Set flag for glass transition
            localStorage.setItem('bruut-browser-back', 'true');
            
            // Trigger glass transition
            showGlassTransitionMainPage();
            return;
        }
    }
});

// Also listen for popstate (browser back/forward)
window.addEventListener('popstate', function(event) {
    console.log('popstate event triggered');
    console.log('state:', event.state);
    console.log('referrer:', document.referrer);
    
    // Check if coming from film page
    if (document.referrer && document.referrer.includes('film.html')) {
        console.log('Browser navigation from film page detected');
        localStorage.setItem('bruut-browser-back', 'true');
    }
});

// Update your isReturningToHome function to include browser back detection
function isReturningToHome() {
    const urlParams = new URLSearchParams(window.location.search);
    const returnParam = urlParams.get('return') === 'true';
    const browserBack = localStorage.getItem('bruut-browser-back') === 'true';
    
    console.log('Main page - checking return conditions:');
    console.log('URL return param:', returnParam);
    console.log('Browser back flag:', browserBack);
    console.log('Referrer:', document.referrer);
    
    // Clear browser back flag
    localStorage.removeItem('bruut-browser-back');
    
    // Clean up URL if returning via URL param
    if (returnParam) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Return true if any internal navigation detected
    const isReturning = returnParam || browserBack || 
                       (document.referrer && document.referrer.includes('film.html'));
    
    console.log('Final isReturning result:', isReturning);
    
    return isReturning;
}

// Enhanced glass transition with proper sequencing
function showGlassTransitionMainPage() {
    console.log('Starting 1-second glass transition on main page');
    
    // Immediately hide any existing loading screen
    const existingLoadingScreen = document.getElementById('loading-screen');
    if (existingLoadingScreen) {
        existingLoadingScreen.style.display = 'none';
        existingLoadingScreen.remove();
    }
    
    // Ensure body is ready
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    // Phase 1: Start with black overlay (0-200ms)
    const blackOverlay = document.createElement('div');
    blackOverlay.className = 'black-overlay';
    blackOverlay.id = 'transition-black';
    document.body.appendChild(blackOverlay);
    
    console.log('Phase 1: Black overlay created');
    
    // Phase 2: Create glass overlay behind black (at 100ms)
    setTimeout(() => {
        console.log('Phase 2: Creating glass overlay');
        
        const incomingGlass = document.createElement('div');
        incomingGlass.id = 'navigation-glass';
        incomingGlass.style.opacity = '0';
        incomingGlass.style.visibility = 'hidden';
        document.body.appendChild(incomingGlass);
        
        // Phase 3: Fade out black, show glass (200-500ms)
        setTimeout(() => {
            console.log('Phase 3: Fading to glass blur');
            
            blackOverlay.classList.add('fade-out');
            incomingGlass.classList.add('fade-in');
            
            // Phase 4: Hold glass blur briefly (500-700ms)
            setTimeout(() => {
                console.log('Phase 4: Holding glass blur');
                
                // Phase 5: Fade out glass, show content (700-1000ms)
                setTimeout(() => {
                    console.log('Phase 5: Fading out glass, showing content');
                    
                    incomingGlass.classList.remove('fade-in');
                    incomingGlass.classList.add('fade-out');
                    
                    // Clean up after animation completes
                    setTimeout(() => {
                        console.log('Transition complete - cleaning up');
                        
                        if (blackOverlay.parentNode) {
                            blackOverlay.parentNode.removeChild(blackOverlay);
                        }
                        if (incomingGlass.parentNode) {
                            incomingGlass.parentNode.removeChild(incomingGlass);
                        }
                    }, 300); // Wait for fade-out to complete
                    
                }, 200); // Hold glass for 200ms
            }, 300); // Glass fade-in duration
        }, 100); // Small delay for glass creation
    }, 100); // Small delay for black overlay
}

// Updated DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    // Check if returning from film page with simple URL parameter
    const isReturning = isReturningToHome();
    
    console.log('Main page - isReturning:', isReturning);
    
    if (isReturning) {
        // User is returning from film page - show glass transition ONLY
        console.log('Returning user detected - showing glass transition ONLY');
        
        // Immediately prevent any loading screen from showing
        document.body.classList.remove('loading');
        
        showGlassTransitionMainPage();
        
        // Initialize content immediately
        loadFilmsData();
        setCurrentYear();
        
        // Add logo click handler
        setTimeout(() => {
            const logoLink = document.querySelector('.navbar-brand');
            if (logoLink) {
                logoLink.addEventListener('click', function() {
                    window.location.href = 'index.html';
                });
            }
        }, 100);
        
    } else {
        // Normal first visit - show yellow loading animation
        console.log('First visit detected - showing yellow loading animation');
        
        document.body.classList.add('loading');
        
        const loadingPromise = loadSiteContent();
        
        setTimeout(() => {
            showPageContent();
        }, 500);
        
        setTimeout(() => {
            hideLoadingScreen();
        }, 2000);
        
        setTimeout(() => {
            const logoLink = document.querySelector('.navbar-brand');
            if (logoLink) {
                logoLink.addEventListener('click', function() {
                    window.location.href = 'index.html';
                });
            }
        }, 2500);
        
        try {
            await loadingPromise;
            console.log('Content loading complete');
        } catch (error) {
            console.error('Error during loading:', error);
        }
    }
});

// Function to show page content (called at 500ms)
function showPageContent() {
    // Remove loading class and show page content
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    console.log('Page content revealed at 500ms');
}

// Function to hide loading screen completely (called at 2000ms)
function hideLoadingScreen() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('loaded');
    }
    
    console.log('Loading screen hidden at 2000ms');
}

// Function to load all site content in background
async function loadSiteContent() {
    try {
        // Load films data
        await loadFilmsData();
        
        // Set current year
        setCurrentYear();
        
        // Preload critical images (first few carousel images)
        if (filmsData.length > 0) {
            const preloadPromises = filmsData.slice(0, 3).map(film => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve; // Don't fail if image doesn't load
                    img.src = `assets/images/${film.image}`;
                });
            });
            
            // Wait for first few images to load
            await Promise.all(preloadPromises);
        }
        
        console.log('All content loaded successfully');
        
    } catch (error) {
        console.error('Error loading site content:', error);
        throw error;
    }
}

let filmsData = [];
let currentFilmIndex = 0;
let currentTitlePosition = 0;
let sliderInterval;
let isTransitioning = false;
let titleWidths = [];
let titleElements = [];
let currentPadding = 50;

// Load films data from JSON (modified to return promise)
async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        filmsData = data.films;
        
        // Initialize slider immediately after data is loaded
        initializeSlider();
        
        return filmsData;
    } catch (error) {
        console.error('Error loading films data:', error);
        throw error;
    }
}

// Get current responsive padding
function getCurrentPadding() {
    if (window.innerWidth <= 576) {
        return 15;
    } else if (window.innerWidth <= 768) {
        return 20;
    } else if (window.innerWidth <= 992) {
        return 30;
    } else {
        return 50;
    }
}

// Get current responsive gap
function getCurrentGap() {
    if (window.innerWidth <= 576) {
        return 30;
    } else if (window.innerWidth <= 768) {
        return 40;
    } else if (window.innerWidth <= 992) {
        return 60;
    } else {
        return 80;
    }
}

// Glass effect navbar on scroll
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.scrollY > 50;
    
    if (scrolled) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Initialize the slider
function initializeSlider() {
    if (filmsData.length === 0) return;
    
    createImageCarousel();
    createInfiniteTitleTrack();
    
    // Small delay to ensure elements are rendered
    setTimeout(() => {
        calculateTitleData();
        
        // Start at first real slide
        currentFilmIndex = 1;
        currentTitlePosition = 0;
        
        updateImageCarousel(false);
        updateTitleTrack(false);
        updateTitleOpacity();
        
        startAutoSlider();
    }, 100);
    
    // Add click listeners
    document.addEventListener('click', handleTitleClick);
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Add resize listener to recalculate on screen size change
    window.addEventListener('resize', handleResize);
}

// Handle window resize
function handleResize() {
    // Recalculate everything on resize
    setTimeout(() => {
        calculateTitleData();
        updateTitleTrack(false);
    }, 100);
}

// Create image carousel
function createImageCarousel() {
    const heroSection = document.querySelector('.hero-section');
    
    // Remove existing elements
    const existingCarousel = heroSection.querySelector('.hero-carousel');
    const existingOverlay = heroSection.querySelector('.hero-overlay');
    const existingTitleOverlay = heroSection.querySelector('.title-overlay');
    
    if (existingCarousel) existingCarousel.remove();
    if (existingOverlay) existingOverlay.remove();
    if (existingTitleOverlay) existingTitleOverlay.remove();
    
    const carousel = document.createElement('div');
    carousel.className = 'hero-carousel';
    
    // Add clone of last slide at beginning
    const lastFilm = filmsData[filmsData.length - 1];
    const firstClone = document.createElement('div');
    firstClone.className = 'hero-slide clone';
    firstClone.innerHTML = `<div class="hero-image" style="background-image: url('assets/images/${lastFilm.image}')"></div>`;
    carousel.appendChild(firstClone);
    
    // Add all original slides
    filmsData.forEach((film, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.innerHTML = `<div class="hero-image" style="background-image: url('assets/images/${film.image}')"></div>`;
        carousel.appendChild(slide);
    });
    
    // Add clones of first two slides at end
    for (let i = 0; i < 2; i++) {
        const film = filmsData[i];
        const clone = document.createElement('div');
        clone.className = 'hero-slide clone';
        clone.innerHTML = `<div class="hero-image" style="background-image: url('assets/images/${film.image}')"></div>`;
        carousel.appendChild(clone);
    }
    
    heroSection.appendChild(carousel);
    
    // Add overlays
    const heroOverlay = document.createElement('div');
    heroOverlay.className = 'hero-overlay';
    heroSection.appendChild(heroOverlay);
    
    const titleOverlay = document.createElement('div');
    titleOverlay.className = 'title-overlay';
    heroSection.appendChild(titleOverlay);
}

// Create infinite title track with simple HTML tooltips
function createInfiniteTitleTrack() {
    const heroSection = document.querySelector('.hero-section');
    
    let titleContainer = heroSection.querySelector('.hero-titles-container');
    if (titleContainer) {
        titleContainer.remove();
    }
    
    titleContainer = document.createElement('div');
    titleContainer.className = 'hero-titles-container';
    
    const titleTrack = document.createElement('div');
    titleTrack.className = 'hero-titles-track';
    
    // Create many copies for truly infinite scrolling
    const totalCopies = 10;
    titleElements = [];
    
    for (let copy = 0; copy < totalCopies; copy++) {
        filmsData.forEach((film, index) => {
            const titleItem = document.createElement('div');
            titleItem.className = 'title-item';
            titleItem.setAttribute('data-film-index', index);
            titleItem.setAttribute('data-copy', copy);
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'title-tooltip';
            tooltip.textContent = 'More information';
            
            const titleText = document.createElement('span');
            titleText.className = 'title-text';
            titleText.textContent = film.title;
            titleText.setAttribute('data-url', film.url);
            titleText.setAttribute('data-index', index);
            
            // Simple structure
            titleItem.appendChild(tooltip);
            titleItem.appendChild(titleText);
            titleTrack.appendChild(titleItem);
            
            titleElements.push(titleItem);
        });
    }
    
    titleContainer.appendChild(titleTrack);
    heroSection.appendChild(titleContainer);
    
    // Debug: Log to console to verify structure
    console.log('Title track created with', titleElements.length, 'elements');
}

// Calculate title widths and positions with current responsive values
function calculateTitleData() {
    const titleTrack = document.querySelector('.hero-titles-track');
    const firstSetItems = titleTrack.querySelectorAll('.title-item[data-copy="0"]');
    
    titleWidths = [];
    let position = 0;
    const gap = getCurrentGap();
    currentPadding = getCurrentPadding();
    
    firstSetItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        
        titleWidths.push({
            width: rect.width,
            position: position,
            element: item
        });
        
        position += rect.width + gap;
    });
}

// Update image carousel
function updateImageCarousel(withTransition = true) {
    const imageCarousel = document.querySelector('.hero-carousel');
    if (!imageCarousel) return;
    
    if (withTransition) {
        imageCarousel.style.transition = 'transform 1s ease-in-out';
    } else {
        imageCarousel.style.transition = 'none';
    }
    
    const totalSlides = filmsData.length + 3;
    const translateX = -(currentFilmIndex * (100 / totalSlides));
    imageCarousel.style.transform = `translateX(${translateX}%)`;
    
    // Handle infinite loop for images
    if (withTransition) {
        setTimeout(() => {
            if (currentFilmIndex >= filmsData.length + 1) {
                currentFilmIndex = 1;
                updateImageCarousel(false);
            } else if (currentFilmIndex <= 0) {
                currentFilmIndex = filmsData.length;
                updateImageCarousel(false);
            }
        }, 1000);
    }
}

// Update title track with responsive positioning
function updateTitleTrack(withTransition = true) {
    const titleTrack = document.querySelector('.hero-titles-track');
    if (!titleTrack || titleWidths.length === 0) return;
    
    if (withTransition) {
        titleTrack.style.transition = 'transform 1s ease-in-out';
    } else {
        titleTrack.style.transition = 'none';
    }
    
    // Ensure position doesn't go negative and accounts for padding
    const minPosition = 0;
    const adjustedPosition = Math.max(minPosition, currentTitlePosition);
    
    titleTrack.style.transform = `translateX(-${adjustedPosition}px)`;
}

// Get current active film index
function getCurrentFilmIndex() {
    let filmIndex = currentFilmIndex - 1;
    if (filmIndex < 0) filmIndex = filmsData.length - 1;
    if (filmIndex >= filmsData.length) filmIndex = 0;
    return filmIndex;
}

// Update title opacity based on current position
function updateTitleOpacity() {
    const currentFilm = getCurrentFilmIndex();
    
    titleElements.forEach((item) => {
        const filmIndex = parseInt(item.getAttribute('data-film-index'));
        
        if (filmIndex === currentFilm) {
            item.classList.add('current');
            item.classList.remove('inactive');
        } else {
            item.classList.add('inactive');
            item.classList.remove('current');
        }
    });
}

// Keep your existing handleTitleClick the same
function handleTitleClick(event) {
    const target = event.target;
    
    if (target.classList.contains('title-text')) {
        const url = target.getAttribute('data-url');
        
        if (url) {
            if (document.body.classList.contains('page-transitioning')) {
                return;
            }
            
            event.preventDefault();
            
            // Stop carousel
            clearInterval(sliderInterval);
            
            // Start transition
            startGlassTransition(url);
        }
    }
}

// Enhanced outgoing transition with 1-second duration
function startGlassTransition(filmUrl) {
    console.log('Starting 1-second outgoing transition');
    
    // Add transitioning class for page blur
    document.body.classList.add('page-transitioning');
    
    // Phase 1: Blur current page (0-800ms)
    const glassOverlay = document.createElement('div');
    glassOverlay.id = 'navigation-glass';
    glassOverlay.style.opacity = '0';
    glassOverlay.style.visibility = 'hidden';
    document.body.appendChild(glassOverlay);
    
    // Stop carousel
    clearInterval(sliderInterval);
    
    console.log('Phase 1: Starting page blur');
    
    // Phase 2: Fade in glass overlay (200-800ms)
    setTimeout(() => {
        console.log('Phase 2: Adding glass overlay');
        glassOverlay.classList.add('fade-in');
        
        // Phase 3: Navigate after glass is fully visible (800-1000ms)
        setTimeout(() => {
            console.log('Phase 3: Navigating to film page');
            window.location.href = `film.html?film=${filmUrl}&from=internal`;
        }, 600); // Wait for glass transition
        
    }, 200); // Delay glass overlay
}

// Browser navigation detection (keep existing)
window.addEventListener('pageshow', function(event) {
    console.log('pageshow event triggered');
    console.log('persisted:', event.persisted);
    console.log('referrer:', document.referrer);
    
    if (event.persisted) {
        console.log('Page loaded from cache - likely browser back navigation');
        
        if (document.referrer && document.referrer.includes('film.html')) {
            console.log('Browser back from film page detected');
            localStorage.setItem('bruut-browser-back', 'true');
            
            // For cached pages, immediately trigger glass transition
            showGlassTransitionMainPage();
            return;
        }
    }
});

window.addEventListener('popstate', function(event) {
    console.log('popstate event triggered');
    console.log('state:', event.state);
    console.log('referrer:', document.referrer);
    
    if (document.referrer && document.referrer.includes('film.html')) {
        console.log('Browser navigation from film page detected');
        localStorage.setItem('bruut-browser-back', 'true');
    }
});

// Move to next slide (only called by auto-slider)
function nextSlide() {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    currentFilmIndex++;
    
    const currentFilm = getCurrentFilmIndex();
    const prevFilm = (currentFilm - 1 + filmsData.length) % filmsData.length;
    const titleWidth = titleWidths[prevFilm];
    const gap = getCurrentGap();
    
    currentTitlePosition += titleWidth.width + gap;
    
    updateImageCarousel();
    updateTitleTrack();
    updateTitleOpacity();
    
    setTimeout(() => {
        isTransitioning = false;
    }, 1000);
}

// Start auto slider (only automatic, no manual control)
function startAutoSlider() {
    sliderInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

// Reset auto slider
function resetAutoSlider() {
    clearInterval(sliderInterval);
    startAutoSlider();
}

// Set current year
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}
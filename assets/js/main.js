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

// Extract welcome name from URL
function getWelcomeNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const welcomeParam = urlParams.get('welcome');
    
    // Check if welcome parameter exists and contains valid characters
    if (welcomeParam && /^[a-zA-Z0-9\-]+$/.test(welcomeParam)) {
        // Replace hyphens with spaces and return
        return welcomeParam.replace(/-/g, ' ');
    }
    
    return null;
}

// Create welcome message with line break
function createWelcomeMessage() {
    const welcomeName = getWelcomeNameFromURL();
    if (!welcomeName) return;
    
    const heroSection = document.querySelector('.hero-section');
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    
    // Create with line break using innerHTML
    welcomeDiv.innerHTML = `Welcome,<br>${welcomeName}`;
    
    heroSection.appendChild(welcomeDiv);
}

// Load calendar data for showtimes
async function loadCalendarData() {
    try {
        const response = await fetch('calendar.json');
        const data = await response.json();
        return data.showtimes || [];
    } catch (error) {
        console.error('Error loading calendar data:', error);
        return [];
    }
}

// Create showtimes section
async function createShowtimesSection() {
    const calendarData = await loadCalendarData();
    const futureShowtimes = filterFutureShowtimes(calendarData);
    
    if (futureShowtimes.length === 0) return;
    
    // Find where to insert (before footer)
    const footer = document.querySelector('footer');
    
    const showtimesSection = document.createElement('section');
    showtimesSection.className = 'showtimes-section py-5 bg-dark text-white';
    showtimesSection.innerHTML = `
        <div class="container">
            <div class="row">
                <div class="col-lg-8">
                    <div class="film-description mb-8">
                        <h1>Showtimes</h1>
                        <p>Come see our films on the big screen.</p>
                        <br>
                        ${futureShowtimes.map(showtime => `
                            <div class="showtime-item">
                                <h3>${showtime.filmTitle} - ${formatDate(showtime.date)}</h3>
                                <h4>${showtime.time} - ${showtime.venue}</h4>
                                <p>${showtime.description} / <a href="${showtime.ticketUrl}" target="_blank">INFO & TICKETS</a></p>
                                <div class="footer-divider mb-4"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    footer.parentNode.insertBefore(showtimesSection, footer);
}

// Filter future showtimes
function filterFutureShowtimes(showtimes) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    return showtimes.filter(showtime => {
        const showtimeDate = new Date(showtime.date);
        return showtimeDate >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                   'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Update your isReturningToHome function to include browser back detection
function isReturningToHome() {
    const urlParams = new URLSearchParams(window.location.search);
    const returnParam = urlParams.get('return') === 'true';
    const fromInternal = urlParams.get('from') === 'internal';
    const browserBack = localStorage.getItem('bruut-browser-back') === 'true';
    
    // Check performance navigation API for reload detection
    const isPageReload = performance.navigation && performance.navigation.type === 1;
    const isPageReloadModern = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    console.log('Navigation detection:');
    console.log('URL return param:', returnParam);
    console.log('From internal param:', fromInternal);
    console.log('Browser back flag:', browserBack);
    console.log('Page reload (legacy):', isPageReload);
    console.log('Page reload (modern):', isPageReloadModern);
    console.log('Referrer:', document.referrer);
    
    // If it's a page reload, always show loading animation
    if (isPageReload || isPageReloadModern) {
        console.log('Page reload detected - will show loading animation');
        // Clear any flags that might interfere
        localStorage.removeItem('bruut-browser-back');
        return false; // Show loading animation
    }
    
    // Clear browser back flag
    localStorage.removeItem('bruut-browser-back');
    
    // Clean up URL if returning via URL param
    if (returnParam || fromInternal) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Return true only for genuine internal navigation (not reloads)
    const isReturning = (returnParam || fromInternal || browserBack) && 
                       !isPageReload && !isPageReloadModern;
    
    console.log('Final isReturning result:', isReturning);
    
    return isReturning;
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
            
            // Set flag for normal loading (no transition)
            localStorage.setItem('bruut-browser-back', 'true');
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

// Updated DOMContentLoaded section
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded triggered');
    
    // Always check for returning users first
    const isReturning = isReturningToHome();
    
    console.log('Main page - isReturning:', isReturning);
    
    if (isReturning) {
        // User is returning from film page - just load normally, no transition
        console.log('Returning user detected - loading normally without transition');
        
        // Immediately hide any loading screen and show content
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.add('loaded');
        }
        
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
        // Initialize content immediately
        await loadFilmsData();
        setCurrentYear();
        createWelcomeMessage();
        createShowtimesSection();
        
        // Add logo click handler
        setTimeout(() => {
            const logoLink = document.querySelector('.navbar-brand');
            if (logoLink) {
                logoLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    window.location.href = 'index.html?from=internal';
                });
            }
        }, 100);
        
    } else {
        // Normal first visit or page reload - show yellow loading animation
        console.log('First visit or reload detected - showing yellow loading animation');
        
        // Ensure loading screen is visible and body is in loading state
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'block';
            loadingScreen.style.visibility = 'visible';
            loadingScreen.style.opacity = '1';
            loadingScreen.classList.remove('loaded');
        }
        
        document.body.classList.add('loading');
        document.body.classList.remove('loaded');
        
        // Start loading content in background
        const loadingPromise = loadSiteContent();
        
        // Show page content at 500ms (but keep loading screen visible)
        setTimeout(() => {
            console.log('Revealing page content at 500ms');
            showPageContent();
            createWelcomeMessage();
        }, 500);
        
        // Hide loading screen at 2000ms
        setTimeout(() => {
            console.log('Hiding loading screen at 2000ms');
            hideLoadingScreen();
            createShowtimesSection();
        }, 2000);
        
        // Add logo click handler after everything is loaded
        setTimeout(() => {
            const logoLink = document.querySelector('.navbar-brand');
            if (logoLink) {
                logoLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    window.location.href = 'index.html?from=internal';
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
    // Remove loading class but keep loading screen visible
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    console.log('Page content revealed at 500ms (loading screen still visible)');
}

// Function to hide loading screen completely (called at 2000ms)
function hideLoadingScreen() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('loaded');
        console.log('Loading screen hidden at 2000ms');
    }
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

// Modified loadFilmsData to ensure it returns properly
async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        filmsData = data.films;
        
        console.log('Films data loaded, initializing slider...');
        
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

// Modified initializeSlider to add more logging
function initializeSlider() {
    if (filmsData.length === 0) {
        console.log('No films data available for slider');
        return;
    }
    
    console.log('Initializing slider with', filmsData.length, 'films');
    
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
        
        // IMPORTANT: Always start the auto slider
        console.log('Starting auto slider...');
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
    
    // Calculate total slides: 1 clone at start + original films + 2 clones at end
    const totalSlides = filmsData.length + 3;
    
    // Set dynamic carousel width (total slides * 100%)
    carousel.style.width = `${totalSlides * 100}%`;
    
    // Add clone of last slide at beginning
    const lastFilm = filmsData[filmsData.length - 1];
    const firstClone = document.createElement('div');
    firstClone.className = 'hero-slide clone';
    firstClone.style.width = `${100 / totalSlides}%`;
    firstClone.innerHTML = `<div class="hero-image" style="background-image: url('assets/images/${lastFilm.image}')"></div>`;
    carousel.appendChild(firstClone);
    
    // Add all original slides
    filmsData.forEach((film, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.style.width = `${100 / totalSlides}%`;
        slide.innerHTML = `<div class="hero-image" style="background-image: url('assets/images/${film.image}')"></div>`;
        carousel.appendChild(slide);
    });
    
    // Add clones of first two slides at end
    for (let i = 0; i < 2; i++) {
        const film = filmsData[i];
        const clone = document.createElement('div');
        clone.className = 'hero-slide clone';
        clone.style.width = `${100 / totalSlides}%`;
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
    
    console.log(`Created carousel with ${totalSlides} total slides (${filmsData.length} films + 3 clones)`);
}

// Create infinite title track with h1 elements (matching film page)
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
            
            // CRITICAL: Use h1 instead of span to match film page exactly
            const titleText = document.createElement('h1');
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
    
    console.log('Title track created with h1 elements:', titleElements.length, 'elements');
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
    
    // Calculate translation based on actual number of slides
    const totalSlides = filmsData.length + 3;
    const slideWidthPercent = 100 / totalSlides;
    const translateX = -(currentFilmIndex * slideWidthPercent);
    
    imageCarousel.style.transform = `translateX(${translateX}%)`;
    
    console.log(`Moving to slide ${currentFilmIndex}, translateX: ${translateX}%`);
    
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

// Simplified title click - just glass transition on departure
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
            
            // Start simple glass transition
            startSimpleGlassTransition(url);
        }
    }
}

// Simplified outgoing transition - just glass overlay, no page blur or zoom
function startSimpleGlassTransition(filmUrl) {
    console.log('Starting simple glass transition');
    
    // Add transitioning class to prevent multiple clicks
    document.body.classList.add('page-transitioning');
    
    // Create glass overlay with darker background
    const glassOverlay = document.createElement('div');
    glassOverlay.id = 'navigation-glass';
    glassOverlay.style.background = 'rgba(0, 0, 0, 0.9)'; // Darker instead of blur if needed
    glassOverlay.style.backdropFilter = 'blur(10px)';
    glassOverlay.style.webkitBackdropFilter = 'blur(10px)';
    glassOverlay.style.opacity = '0';
    glassOverlay.style.visibility = 'hidden';
    document.body.appendChild(glassOverlay);
    
    // Stop carousel
    clearInterval(sliderInterval);
    
    // Fade in glass overlay
    setTimeout(() => {
        glassOverlay.classList.add('fade-in');
        
        // Navigate after glass is visible
        setTimeout(() => {
            console.log('Navigating to film page');
            window.location.href = `film.html?film=${filmUrl}&from=internal`;
        }, 400); // Shorter delay
        
    }, 100);
}

// Add debugging to nextSlide
function nextSlide() {
    if (isTransitioning) {
        console.log('Skipping slide transition - already transitioning');
        return;
    }
    
    console.log('Moving to next slide from index:', currentFilmIndex);
    
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
        console.log('Slide transition completed');
    }, 1000);
}

// Modified startAutoSlider to add logging
function startAutoSlider() {
    // Clear any existing interval first
    if (sliderInterval) {
        clearInterval(sliderInterval);
        console.log('Cleared existing slider interval');
    }
    
    sliderInterval = setInterval(() => {
        console.log('Auto-advancing slide');
        nextSlide();
    }, 5000);
    
    console.log('Auto slider started with 5-second interval');
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

function debugCarouselState() {
    console.log('=== Carousel Debug Info ===');
    console.log('Films data length:', filmsData.length);
    console.log('Current film index:', currentFilmIndex);
    console.log('Is transitioning:', isTransitioning);
    console.log('Slider interval exists:', !!sliderInterval);
    console.log('Title elements length:', titleElements.length);
    console.log('Title widths length:', titleWidths.length);
    console.log('==========================');
}
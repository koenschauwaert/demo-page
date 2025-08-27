let filmsData = [];

// Check if coming from internal navigation via URL parameter
function isInternalNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromInternal = urlParams.get('from') === 'internal';
    
    console.log('Film page - checking URL params:', fromInternal);
    
    // Clean up URL without page reload (keep the film parameter)
    if (fromInternal) {
        const filmParam = urlParams.get('film');
        if (filmParam) {
            const cleanUrl = `${window.location.pathname}?film=${filmParam}`;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
    
    return fromInternal;
}

// Load films data from JSON
async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        filmsData = data.films;
        displayFilm();
    } catch (error) {
        console.error('Error loading films data:', error);
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

// Get film URL parameter
function getFilmFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('film');
}

// Display film details
function displayFilm() {
    const filmUrl = getFilmFromURL();
    const film = filmsData.find(f => f.url === filmUrl);
    
    if (!film) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('page-title').textContent = `${film.title} - BRUUT INC.`;
    
    const heroImage = document.querySelector('.hero-image-static');
    heroImage.style.backgroundImage = `url('assets/images/${film.image}')`;
    
    document.querySelector('.film-title').textContent = film.title;
    
    document.getElementById('film-desc').textContent = film.description;
    document.getElementById('film-director').textContent = film.director;
    document.getElementById('film-writer').textContent = film.writer;
    document.getElementById('film-cast').textContent = film.starring;
    document.getElementById('film-release').textContent = film.releaseDate;
}

// Set current year
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Update logo click for 1-second transition
function addNavigationEffects() {
    const logoLink = document.querySelector('.navbar-brand');
    console.log('Looking for logo:', logoLink);
    
    if (logoLink) {
        console.log('Logo found, adding click listener');
        
        logoLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            console.log('Logo clicked - starting 1-second transition');
            
            // Create glass overlay
            const glassOverlay = document.createElement('div');
            glassOverlay.id = 'navigation-glass';
            glassOverlay.style.opacity = '0';
            glassOverlay.style.visibility = 'hidden';
            document.body.appendChild(glassOverlay);
            
            // Start transition sequence
            setTimeout(() => {
                glassOverlay.classList.add('fade-in');
                
                setTimeout(() => {
                    window.location.href = 'index.html?return=true';
                }, 800); // Navigate after 800ms
                
            }, 200); // Start glass after 200ms
        });
    }
}

// Show yellow loading animation
function showYellowLoadingAnimation() {
    console.log('Showing yellow loading animation on film page');
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-yellow-bg"></div>
        <div class="loading-glass-layer"></div>
        <div class="loading-logo">
            <img src="assets/images/bruut-logo.webp" alt="BRUUT INC.">
        </div>
    `;
    
    document.body.insertBefore(loadingScreen, document.body.firstChild);
    document.body.classList.add('loading');
    
    setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }, 500);
    
    setTimeout(() => {
        if (loadingScreen.parentNode) {
            loadingScreen.classList.add('loaded');
        }
    }, 2000);
}

// Enhanced glass transition for film page with 1-second duration
function showGlassTransition() {
    console.log('Starting 1-second glass transition on film page');
    
    // Phase 1: Start with black overlay (0-200ms)
    const blackOverlay = document.createElement('div');
    blackOverlay.className = 'black-overlay';
    blackOverlay.id = 'film-transition-black';
    document.body.appendChild(blackOverlay);
    
    console.log('Film page - Phase 1: Black overlay created');
    
    // Phase 2: Create glass overlay behind black (at 100ms)
    setTimeout(() => {
        console.log('Film page - Phase 2: Creating glass overlay');
        
        const incomingGlass = document.createElement('div');
        incomingGlass.id = 'navigation-glass';
        incomingGlass.style.opacity = '0';
        incomingGlass.style.visibility = 'hidden';
        document.body.appendChild(incomingGlass);
        
        // Phase 3: Fade out black, show glass (200-500ms)
        setTimeout(() => {
            console.log('Film page - Phase 3: Fading to glass blur');
            
            blackOverlay.classList.add('fade-out');
            incomingGlass.classList.add('fade-in');
            
            // Phase 4: Hold glass blur briefly (500-700ms)
            setTimeout(() => {
                console.log('Film page - Phase 4: Holding glass blur');
                
                // Phase 5: Fade out glass, show content (700-1000ms)
                setTimeout(() => {
                    console.log('Film page - Phase 5: Fading out glass, showing content');
                    
                    incomingGlass.classList.remove('fade-in');
                    incomingGlass.classList.add('fade-out');
                    
                    // Clean up after animation completes
                    setTimeout(() => {
                        console.log('Film page - Transition complete - cleaning up');
                        
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

// Updated logo click for faster transition
const logoLink = document.querySelector('.navbar-brand');
if (logoLink) {
    logoLink.addEventListener('click', function(event) {
        event.preventDefault();
        
        console.log('Logo clicked - navigating to index.html?return=true');
        
        // Create glass overlay
        const glassOverlay = document.createElement('div');
        glassOverlay.id = 'navigation-glass';
        document.body.appendChild(glassOverlay);
        
        // Start faster animation
        glassOverlay.classList.add('fade-in');
        
        // Navigate after shorter delay
        setTimeout(() => {
            window.location.href = 'index.html?return=true';
        }, 300); // Reduced from 500ms
    });
}

// Add this to your film.js DOMContentLoaded function
document.addEventListener('DOMContentLoaded', function() {
    // Mark that we're on a film page for referrer detection
    localStorage.setItem('bruut-current-page', 'film');
    
    // Your existing code...
    const isInternal = isInternalNavigation();
    
    if (isInternal) {
        console.log('Internal navigation detected - showing glass transition');
        showGlassTransition();
    } else {
        console.log('External navigation detected - showing yellow loading animation');
        showYellowLoadingAnimation();
    }
    
    // Initialize film page
    loadFilmsData();
    setCurrentYear();
    window.addEventListener('scroll', handleNavbarScroll);
    addNavigationEffects();
});
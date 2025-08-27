let filmsData = [];
let currentFilmIndex = 0;
let currentTitlePosition = 0;
let sliderInterval;
let isTransitioning = false;
let titleWidths = [];
let titleElements = [];
let currentPadding = 50;

// Load films data from JSON
async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        filmsData = data.films;
        initializeSlider();
    } catch (error) {
        console.error('Error loading films data:', error);
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

// Create image carousel (same as before)
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

// Create infinite title track with many copies
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
            
            const titleText = document.createElement('span');
            titleText.className = 'title-text';
            titleText.textContent = film.title;
            titleText.setAttribute('data-url', film.url);
            titleText.setAttribute('data-index', index);
            
            titleItem.appendChild(titleText);
            titleTrack.appendChild(titleItem);
            
            titleElements.push(titleItem);
        });
    }
    
    titleContainer.appendChild(titleTrack);
    heroSection.appendChild(titleContainer);
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

// Handle title clicks - ONLY navigate to film pages
function handleTitleClick(event) {
    const target = event.target;
    
    if (target.classList.contains('title-text')) {
        const url = target.getAttribute('data-url');
        
        // Always navigate to the film page, regardless of current/inactive state
        if (url) {
            window.location.href = `film.html?film=${url}`;
        }
    }
}

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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFilmsData();
    setCurrentYear();
});
let filmsData = [];

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
    
    // Update page title
    document.getElementById('page-title').textContent = `${film.title} - BRUUT INC.`;
    
    // Update header image
    const heroImage = document.querySelector('.hero-image-static');
    heroImage.style.backgroundImage = `url('assets/images/${film.image}')`;
    
    // Update film title
    document.querySelector('.film-title').textContent = film.title;
    
    // Update film details
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFilmsData();
    setCurrentYear();
    window.addEventListener('scroll', handleNavbarScroll);
});
let filmsData = [];

function isInternalNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromInternal = urlParams.get('from') === 'internal';
    
    console.log('Film page - checking URL params:', fromInternal);
    
    if (fromInternal) {
        const filmParam = urlParams.get('film');
        if (filmParam) {
            const cleanUrl = `${window.location.pathname}?film=${filmParam}`;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
    
    return fromInternal;
}

async function loadFilmsData() {
    try {
        const response = await fetch('films.json');
        const data = await response.json();
        filmsData = data.films;
        console.log('Films data loaded:', filmsData);
        displayFilm();
    } catch (error) {
        console.error('Error loading films data:', error);
    }
}

function hasContent(value) {
    return value && value.trim() !== '' && value.toLowerCase() !== 'to be announced' && value.toLowerCase() !== 'tba';
}

function toggleInfoItem(itemId, elementId, value) {
    const item = document.getElementById(itemId);
    const element = document.getElementById(elementId);
    
    if (item && element && hasContent(value)) {
        element.textContent = value;
        item.style.display = 'block';
    } else if (item) {
        item.style.display = 'none';
    }
}

function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    
    return null;
}

function createTrailerPlayButton(trailerUrl) {
    const heroSection = document.querySelector('#film-header');
    
    if (!heroSection) {
        console.error('Hero section not found for trailer button');
        return;
    }
    
    const playButton = document.createElement('div');
    playButton.className = 'trailer-play-button';
    playButton.setAttribute('data-trailer-url', trailerUrl);
    
    fetch('assets/images/play-button.svg')
        .then(response => response.text())
        .then(svgContent => {
            playButton.innerHTML = svgContent;
        })
        .catch(error => {
            console.error('Error loading play button SVG:', error);
            playButton.innerHTML = '<div style="width: 0; height: 0; border-left: 20px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>';
        });
    
    playButton.addEventListener('click', () => openTrailerModal(trailerUrl));
    
    heroSection.appendChild(playButton);
}

function openTrailerModal(trailerUrl) {
    const embedUrl = getYouTubeEmbedUrl(trailerUrl);
    if (!embedUrl) return;
    
    const modal = document.createElement('div');
    modal.className = 'trailer-modal';
    modal.innerHTML = `
        <div class="trailer-modal-content">
            <div class="trailer-iframe-container">
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('trailer-modal-open');
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTrailerModal(modal);
        }
    });
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeTrailerModal(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeTrailerModal(modal) {
    modal.classList.remove('active');
    document.body.classList.remove('trailer-modal-open');
    
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.scrollY > 50;
    
    if (scrolled) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function getFilmFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('film');
}

function createFilmTitle(filmTitle) {
    const heroContent = document.querySelector('#film-header .hero-content .col-12');
    
    if (!heroContent) {
        console.error('Hero content container not found');
        return;
    }
    
    const existingTitle = heroContent.querySelector('.film-title');
    if (existingTitle) {
        existingTitle.remove();
    }
    
    const titleElement = document.createElement('h1');
    titleElement.className = 'film-title';
    titleElement.textContent = filmTitle;
    
    heroContent.appendChild(titleElement);
    console.log('Film title created:', filmTitle);
}

function populateMetaTags(film) {
    try {
        document.title = `${film.title} - BRUUT INC.`;
        
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = `${film.title} - BRUUT INC.`;
        }
        
        updateMetaTag('description', film.description.replace(/\n/g, ' ').substring(0, 160));
        updateMetaTag('keywords', `${film.title}, BRUUT INC, film, cinema, ${film.director}`);
        
        updateMetaProperty('og:title', `${film.title} - BRUUT INC.`);
        updateMetaProperty('og:description', film.description.replace(/\n/g, ' ').substring(0, 160));
        updateMetaProperty('og:image', `${window.location.origin}/assets/images/${film.image}`);
        updateMetaProperty('og:url', window.location.href);
        updateMetaProperty('og:type', 'video.movie');
        
        updateMetaName('twitter:card', 'summary_large_image');
        updateMetaName('twitter:title', `${film.title} - BRUUT INC.`);
        updateMetaName('twitter:description', film.description.replace(/\n/g, ' ').substring(0, 160));
        updateMetaName('twitter:image', `${window.location.origin}/assets/images/${film.image}`);
        
        console.log('Meta tags populated successfully');
    } catch (error) {
        console.error('Error populating meta tags:', error);
    }
}

function updateMetaTag(name, content) {
    try {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    } catch (error) {
        console.error('Error updating meta tag:', name, error);
    }
}

function updateMetaProperty(property, content) {
    try {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    } catch (error) {
        console.error('Error updating meta property:', property, error);
    }
}

function updateMetaName(name, content) {
    try {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    } catch (error) {
        console.error('Error updating meta name:', name, error);
    }
}

function displayFilm() {
    try {
        console.log('Starting displayFilm function');
        
        const filmUrl = getFilmFromURL();
        console.log('Film URL from params:', filmUrl);
        
        if (!filmUrl) {
            console.error('No film URL parameter found');
            window.location.href = 'index.html';
            return;
        }
        
        const film = filmsData.find(f => f.url === filmUrl);
        console.log('Found film:', film);
        
        if (!film) {
            console.error('Film not found in data:', filmUrl);
            window.location.href = 'index.html';
            return;
        }
        
        populateMetaTags(film);
        
        const heroImage = document.querySelector('.hero-image-static');
        if (heroImage) {
            heroImage.style.backgroundImage = `url('assets/images/${film.image}')`;
            console.log('Header image updated');
        } else {
            console.error('Hero image element not found');
        }
        
        createFilmTitle(film.title);
        
        const descElement = document.getElementById('film-desc');
        if (descElement) {
            descElement.innerHTML = film.description.replace(/\n/g, '<br>');
            console.log('Description updated');
        } else {
            console.error('Description element not found');
        }
        
        if (hasContent(film.trailer)) {
            createTrailerPlayButton(film.trailer);
            console.log('Trailer button created');
        }
        
        toggleInfoItem('duration-item', 'film-duration', film.duration);
        toggleInfoItem('release-item', 'film-release', film.releaseDate);
        toggleInfoItem('director-item', 'film-director', film.director);
        toggleInfoItem('writer-item', 'film-writer', film.writer);
        toggleInfoItem('production-item', 'film-production', film.production);
        toggleInfoItem('cinematography-item', 'film-cinematography', film.cinematography);
        toggleInfoItem('cast-item', 'film-cast', film.starring);
        
        console.log('Film display completed successfully');
        
    } catch (error) {
        console.error('Error in displayFilm:', error);
    }
}

function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function addNavigationEffects() {
    const logoLink = document.querySelector('.navbar-brand');
    
    if (logoLink) {
        logoLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            const glassOverlay = document.createElement('div');
            glassOverlay.id = 'navigation-glass';
            glassOverlay.style.background = 'rgba(0, 0, 0, 0.9)';
            glassOverlay.style.backdropFilter = 'blur(10px)';
            glassOverlay.style.webkitBackdropFilter = 'blur(10px)';
            document.body.appendChild(glassOverlay);
            
            glassOverlay.classList.add('fade-in');
            
            setTimeout(() => {
                window.location.href = 'index.html?from=internal';
            }, 400);
        });
    }
}

async function createShowtimesSection() {
    try {
        const calendarData = await loadCalendarData();
        const futureShowtimes = filterFutureShowtimes(calendarData);
        
        if (futureShowtimes.length === 0) return;
        
        const filmDetailsSection = document.getElementById('film-details');
        
        if (!filmDetailsSection) {
            console.error('Film details section not found');
            return;
        }
        
        const showtimesHTML = `
            <div class="container mt-5">
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
                                    <p>${showtime.description}</p>
                                    <p><a href="${showtime.ticketUrl}" target="_blank">INFO & TICKETS</a></p>
                                    <div class="footer-divider mb-4"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        filmDetailsSection.insertAdjacentHTML('beforeend', showtimesHTML);
        console.log('Showtimes section added');
    } catch (error) {
        console.error('Error creating showtimes section:', error);
    }
}

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

function filterFutureShowtimes(showtimes) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return showtimes.filter(showtime => {
        const showtimeDate = new Date(showtime.date);
        return showtimeDate >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                   'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function showYellowLoadingAnimation() {
    console.log('Showing yellow loading animation on film page');
    
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.zIndex = '50000';
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
        console.log('Film page content revealed at 500ms');
    }, 500);
    
    setTimeout(() => {
        if (loadingScreen.parentNode) {
            loadingScreen.classList.add('loaded');
            console.log('Film page loading screen hidden at 2000ms');
        }
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Film page DOMContentLoaded triggered');
    
    const isInternal = isInternalNavigation();
    
    const isPageReload = performance.navigation && performance.navigation.type === 1;
    const isPageReloadModern = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    console.log('Film page navigation detection:');
    console.log('Is internal:', isInternal);
    console.log('Is page reload (legacy):', isPageReload);
    console.log('Is page reload (modern):', isPageReloadModern);
    
    if (isInternal && !isPageReload && !isPageReloadModern) {
        console.log('Internal navigation detected - loading normally');
        
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
    } else {
        console.log('External navigation or reload detected - showing yellow loading animation');
        
        document.body.classList.add('loading');
        document.body.classList.remove('loaded');
        
        showYellowLoadingAnimation();
    }
    
    setTimeout(() => {
        loadFilmsData();
        setCurrentYear();
        createShowtimesSection();
        window.addEventListener('scroll', handleNavbarScroll);
        addNavigationEffects();
    }, 100);
});
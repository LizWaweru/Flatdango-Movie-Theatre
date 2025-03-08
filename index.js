const apiUrl = "https://deploy-link-ten.vercel.app";
let selectedTimeSlot = null;

// Function to fetch and display initial movie details
const fetchAndDisplayInitialMovie = () => {
    fetch(`${apiUrl}/films/1`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayMovieDetails(data);
            setupMobileMenu();
        })
        .catch(error => {
            console.error('Error fetching initial movie details:', error);
            document.getElementById('movie-info').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Sorry, we couldn't load the movie details. Please try again later.</p>
                </div>
            `;
        });
}

// Function to display movie details
function displayMovieDetails(movie) {
    const { title, runtime, showtime, tickets_sold, capacity, description, poster } = movie;
    const availableTickets = capacity - tickets_sold;
    
    // Update movie title
    document.querySelector('#movie-details h2').textContent = title;
    
    // Calculate rating (simulated based on available tickets percentage)
    const ratingPercentage = Math.min(100, (availableTickets / capacity) * 100);
    const stars = Math.round(ratingPercentage / 20 * 2) / 2; // Convert to 0-5 scale with half stars
    
    // Update movie info with new structure
    const movieInfo = `
        <img src="${poster}" alt="${title} Poster" class="movie-poster">
        <div class="movie-text">
            <div class="movie-meta">
                <span><i class="fas fa-clock"></i> <span id="runtime">${runtime}</span> min</span>
                <span><i class="fas fa-film"></i> <span id="showtime">${showtime}</span></span>
                <span><i class="fas fa-ticket-alt"></i> <span id="tickets-available">${availableTickets}</span> tickets left</span>
            </div>
            
            <div class="rating">
                ${generateStarRating(stars)}
            </div>
            
            <div class="badges">
                ${availableTickets < capacity * 0.2 ? '<span class="badge">Limited Seats</span>' : ''}
                ${tickets_sold === 0 ? '<span class="badge new-release">Just Released</span>' : ''}
            </div>
            
            <div class="movie-description">
                ${description}
            </div>
        </div>
    `;
    
    document.getElementById('movie-info').innerHTML = movieInfo;
    
    // Set up time slots
    setupTimeSlots(showtime);
    
    // Updating purchase button according to availability
    updatePurchaseButton(availableTickets, movie);
}

// Generate star rating HTML
function generateStarRating(stars) {
    let starsHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(stars)) {
            starsHTML += '<span class="star"><i class="fas fa-star"></i></span>';
        } else if (i - 0.5 <= stars) {
            starsHTML += '<span class="star"><i class="fas fa-star-half-alt"></i></span>';
        } else {
            starsHTML += '<span class="star"><i class="far fa-star"></i></span>';
        }
    }
    
    return starsHTML;
}

// Set up time slots with the current showtime highlighted
function setupTimeSlots(currentShowtime) {
    // Convert showtime to 12-hour format
    const timeSlots = document.querySelectorAll('.time-slot');
    
    // Reset all time slots
    timeSlots.forEach(slot => {
        slot.classList.remove('selected');
        slot.onclick = () => {
            // Remove selected class from all slots
            timeSlots.forEach(s => s.classList.remove('selected'));
            // Add selected class to clicked slot
            slot.classList.add('selected');
            selectedTimeSlot = slot.textContent;
        };
    });
    
    // Try to find and highlight the current showtime slot
    timeSlots.forEach(slot => {
        if (slot.textContent.trim() === currentShowtime) {
            slot.classList.add('selected');
            selectedTimeSlot = slot.textContent;
        }
    });
}

// Update purchase button state and event handler
function updatePurchaseButton(availableTickets, movie) {
    const purchaseBtn = document.getElementById('ticket-purchase');
    
    if (availableTickets === 0) {
        purchaseBtn.innerHTML = '<i class="fas fa-ban"></i> Sold Out';
        purchaseBtn.disabled = true;
        purchaseBtn.classList.add('sold-out');
    } else {
        purchaseBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Purchase Ticket';
        purchaseBtn.disabled = false;
        purchaseBtn.classList.remove('sold-out');
        
        // Remove existing event listeners (to prevent duplicates)
        const newPurchaseBtn = purchaseBtn.cloneNode(true);
        purchaseBtn.parentNode.replaceChild(newPurchaseBtn, purchaseBtn);
        
        // Add new event listener
        newPurchaseBtn.addEventListener('click', () => {
            if (!selectedTimeSlot) {
                alert('Please select a showtime.');
                return;
            }
            
            if (availableTickets > 0) {
                // Simulate a purchase by updating tickets_sold
                movie.tickets_sold++;
                
                // Show purchase confirmation
                const ticketConfirmation = document.createElement('div');
                ticketConfirmation.className = 'ticket-confirmation';
                ticketConfirmation.innerHTML = `
                    <div class="confirmation-content">
                        <i class="fas fa-check-circle"></i>
                        <h3>Ticket Purchased!</h3>
                        <p>Movie: ${movie.title}</p>
                        <p>Showtime: ${selectedTimeSlot}</p>
                        <p>Thank you for your purchase!</p>
                    </div>
                `;
                
                document.body.appendChild(ticketConfirmation);
                
                // Remove confirmation after animation
                setTimeout(() => {
                    ticketConfirmation.classList.add('show');
                    
                    setTimeout(() => {
                        ticketConfirmation.classList.remove('show');
                        setTimeout(() => {
                            document.body.removeChild(ticketConfirmation);
                        }, 500);
                    }, 2000);
                }, 10);
                
                // Update the displayed details
                displayMovieDetails(movie);
            }
        });
    }
}

// Function to fetch and display film menu
function fetchAndDisplayFilmMenu() {
    fetch(`${apiUrl}/films`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const filmList = document.getElementById('films');
            filmList.innerHTML = '';

            data.forEach(film => {
                const { id, title, tickets_sold, capacity } = film;
                const availableTickets = capacity - tickets_sold;
                const filmItem = document.createElement('li');
                
                // Add sold out or low tickets indicators
                let statusIcon = '';
                if (availableTickets === 0) {
                    statusIcon = '<i class="fas fa-ban"></i> ';
                } else if (availableTickets < capacity * 0.2) {
                    statusIcon = '<i class="fas fa-exclamation-circle"></i> ';
                }

                filmItem.innerHTML = `${statusIcon}${title}`;
                filmItem.classList.add('film', 'item');
                
                if (availableTickets === 0) {
                    filmItem.classList.add('sold-out');
                }

                filmItem.addEventListener('click', () => {
                    // Add active class to selected film and remove from others
                    document.querySelectorAll('.film.item').forEach(item => {
                        item.classList.remove('active');
                    });
                    filmItem.classList.add('active');
                    
                    // On mobile, close the menu when a film is selected
                    if (window.innerWidth < 768) {
                        document.getElementById('menu').classList.remove('open');
                    }
                    
                    // Fetch and display the selected film details
                    fetch(`${apiUrl}/films/${id}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Add fade-out and fade-in animation
                            const movieDetails = document.getElementById('movie-details');
                            movieDetails.style.opacity = 0;
                            
                            setTimeout(() => {
                                displayMovieDetails(data);
                                movieDetails.style.opacity = 1;
                            }, 300);
                        })
                        .catch(error => console.error('Error fetching movie details:', error));
                });

                filmList.appendChild(filmItem);
            });
            
            // Set the first film as active by default
            if (filmList.firstChild) {
                filmList.firstChild.classList.add('active');
            }
        })
        .catch(error => {
            console.error('Error fetching film menu:', error);
            document.getElementById('films').innerHTML = `
                <li class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Failed to load movies
                </li>
            `;
        });
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const menu = document.getElementById('menu');
            menu.classList.toggle('open');
        });
    }
}

// Add some CSS animations dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .ticket-confirmation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        .ticket-confirmation.show {
            opacity: 1;
        }
        
        .confirmation-content {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            color: #333;
            max-width: 80%;
            animation: scale-in 0.5s forwards;
        }
        
        .confirmation-content i {
            font-size: 50px;
            color: #4CAF50;
            margin-bottom: 20px;
        }
        
        @keyframes scale-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        #movie-details {
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Call the functions to initiate the application
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    fetchAndDisplayInitialMovie();
    fetchAndDisplayFilmMenu();
});
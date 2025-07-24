// scripts.js - Login functionality implementation

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await loginUser(email, password);
        });
    }
});

async function loginUser(email, password) {
    const response = await fetch('https://your-api-url/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html';
    } else {
        alert('Login failed: ' + response.statusText);
    }
}
// scripts.js - Index page functionality

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupPriceFilter();
});

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function fetchPlaces(token) {
    const response = await fetch('https://your-api-url/places', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.ok) {
        const places = await response.json();
        displayPlaces(places);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';
    
    places.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.className = 'place-card';
        placeDiv.setAttribute('data-price', place.price);
        placeDiv.innerHTML = `
            <h2>${place.name}</h2>
            <p>Price per night: $${place.price}</p>
            <a href="place.html" class="details-button">View Details</a>
        `;
        placesList.appendChild(placeDiv);
    });
}

function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    
 
    priceFilter.innerHTML = `
        <option value="">All</option>
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
    `;
    
  
    priceFilter.addEventListener('change', (event) => {
        const selectedPrice = event.target.value;
        const placeCards = document.querySelectorAll('.place-card');
        
        placeCards.forEach(card => {
            const placePrice = parseInt(card.getAttribute('data-price'));
            
            if (selectedPrice === '' || placePrice <= parseInt(selectedPrice)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const placeId = getPlaceIdFromURL();
    checkAuthentication(placeId);
});

function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function checkAuthentication(placeId) {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        addReviewSection.style.display = 'none';
    } else {
        addReviewSection.style.display = 'block';
        fetchPlaceDetails(token, placeId);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function fetchPlaceDetails(token, placeId) {
    const response = await fetch(`https://your-api-url/places/${placeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.ok) {
        const place = await response.json();
        displayPlaceDetails(place);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.querySelector('.place-details .place-info');
    placeDetailsSection.innerHTML = '';
    
    placeDetailsSection.innerHTML = `
        <h2>${place.name}</h2>
        <p><strong>Host:</strong> ${place.host}</p>
        <p><strong>Price per night:</strong> $${place.price}</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
    `;
    
    // Display reviews
    const reviewsSection = document.getElementById('reviews');
    const reviewsHTML = place.reviews.map(review => `
        <div class="review-card">
            <p><strong>${review.user}:</strong></p>
            <p>${review.comment}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
        </div>
    `).join('');
    
    reviewsSection.innerHTML = '<h3>Reviews</h3>' + reviewsHTML;
}



document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    const token = checkAuthentication();
    const placeId = getPlaceIdFromURL();

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const reviewText = document.getElementById('review-text').value;
            const rating = document.getElementById('rating').value;
            
            await submitReview(token, placeId, reviewText, rating);
        });
    }
});

function checkAuthentication() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function submitReview(token, placeId, reviewText, rating) {
    const response = await fetch('https://your-api-url/reviews', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            place_id: placeId, 
            review: reviewText,
            rating: rating 
        })
    });
    
    handleResponse(response);
}

function handleResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
    } else {
        alert('Failed to submit review');
    }
}
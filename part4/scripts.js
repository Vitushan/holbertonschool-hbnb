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
  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      window.location.href = 'index.html';
    } else {
      alert('Login failed: ' + response.statusText);
    }
  } catch (error) {
    alert('Error during login request.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('price-filter')) {
    setupPriceFilter();
  }
  if (document.getElementById('places-list')) {
    checkAuthenticationIndex();
  }
});

function checkAuthenticationIndex() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  if (!loginLink) return;

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }
}

async function fetchPlaces(token) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/places/', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error();
    const places = await response.json();
    displayPlaces(places);
  } catch {
    alert('Error: unable to connect to the API server. Make sure the backend is running.');
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (!placesList) return;
  placesList.innerHTML = '';
  places.forEach(place => {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-card';
    placeDiv.setAttribute('data-price', place.price);
    placeDiv.innerHTML = `
      <h2>${place.name}</h2>
      <p>Price per night: $${place.price}</p>
      <a href="place.html?id=${place.id}" class="details-button">View Details</a>
    `;
    placesList.appendChild(placeDiv);
  });
}

function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  if (!priceFilter) return;

  priceFilter.innerHTML = `
    <option value="">All</option>
    <option value="100">100</option>
    <option value="150">150</option>
    <option value="200">200</option>
  `;

  priceFilter.addEventListener('change', (event) => {
    const selectedPrice = event.target.value;
    const placeCards = document.querySelectorAll('.place-card');
    placeCards.forEach(card => {
      const placePrice = parseInt(card.getAttribute('data-price'), 10);
      if (selectedPrice === '' || placePrice <= parseInt(selectedPrice, 10)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.place-details .place-info')) {
    const placeId = getPlaceIdFromURL();
    checkAuthenticationPlace(placeId);
  }
});

function checkAuthenticationPlace(placeId) {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  if (!addReviewSection) return;

  if (!token) {
    addReviewSection.style.display = 'none';
  } else {
    addReviewSection.style.display = 'block';
    fetchPlaceDetails(token, placeId);
  }
}

async function fetchPlaceDetails(token, placeId) {
  if (!placeId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error();
    const place = await response.json();
    displayPlaceDetails(place);
  } catch {
    alert('Error: unable to retrieve place details.');
  }
}

function displayPlaceDetails(place) {
  const placeDetailsSection = document.querySelector('.place-details .place-info');
  if (!placeDetailsSection) return;
  placeDetailsSection.innerHTML = `
    <h2>${place.name}</h2>
    <p><strong>Host:</strong> ${place.host}</p>
    <p><strong>Price per night:</strong> $${place.price}</p>
    <p><strong>Description:</strong> ${place.description}</p>
    <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
  `;

  const reviewsSection = document.getElementById('reviews');
  if (!reviewsSection) return;
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
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();

    if (!token) {
      alert('You must be logged in to submit a review.');
      window.location.href = 'login.html';
      return;
    }
    if (!placeId) {
      alert('Place ID is missing. Cannot submit review.');
      return;
    }

    const reviewText = document.getElementById('review-text').value;
    const rating = document.getElementById('rating').value;
    await submitReview(token, placeId, reviewText, rating);
  });
});

async function submitReview(token, placeId, reviewText, rating) {
  try {
    const response = await fetch("http://localhost:5000/api/v1/reviews/", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        place_id: placeId,
        review: reviewText,
        rating: parseInt(rating, 10),
      }),
    });
    handleResponse(response);
  } catch {
    alert('Error submitting the review.');
  }
}

function handleResponse(response) {
  if (response.ok) {
    alert('Review submitted successfully!');
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) reviewForm.reset();
  } else {
    alert('Failed to submit review');
  }
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

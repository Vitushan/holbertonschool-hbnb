function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return "";
}


function updateLoginLinkVisibility() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  if (loginLink) loginLink.style.display = token ? 'none' : 'block';
  return token;
}


async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    document.cookie = `token=${data.access_token}; path=/`;
    window.location.href = 'index.html';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
}


async function fetchPlaces(token) {
  const res = await fetch('http://localhost:5000/api/v1/places', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
    const data = await res.json();
    displayPlaces(data);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (!placesList) return;
  placesList.innerHTML = '';
  places.forEach(place => {
    const card = document.createElement('div');
    card.classList.add('place-card');
    card.setAttribute('data-price', place.price);
    card.innerHTML = `
      <h2>${place.name}</h2>
      <p>Price per night: $${place.price}</p>
      <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">View Details</button>
    `;
    placesList.appendChild(card);
  });
}


function filterPlaces() {
  const maxPrice = document.getElementById('price-filter').value;
  const placesList = document.getElementById('places-list');
  if (!placesList) return;
  const places = placesList.children;
  for (let place of places) {
    const price = Number(place.getAttribute('data-price'));
    place.style.display = (maxPrice === "" || price <= Number(maxPrice)) ? 'block' : 'none';
  }
}


function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchPlaceDetails(token, placeId) {
  const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const data = await response.json();
    displayPlaceDetails(data);
    displayReviews(data.reviews || []);
  }
}

function displayPlaceDetails(place) {
  const placeDetails = document.getElementById('place-details');
  if (!placeDetails) return;
  const amenities = Array.isArray(place.amenities)
    ? place.amenities.map(a => `<li>${a}</li>`).join('')
    : '';
  placeDetails.innerHTML = `
    <h1>${place.name}</h1>
    <div class="place-info">
      <p><strong>Host:</strong> ${place.host || 'N/A'}</p>
      <p><strong>Price per night:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities:</strong></p>
      <ul>${amenities}</ul>
    </div>
  `;
}

function displayReviews(reviews) {
  const reviewsSection = document.getElementById('reviews');
  if (!reviewsSection) return;
  if (!reviews.length) {
    reviewsSection.innerHTML = '<h2>Reviews</h2><p>No reviews yet.</p>';
    return;
  }
  reviewsSection.innerHTML = '<h2>Reviews</h2>' + reviews.map(r => `
    <div class="review-card">
      <p><strong>${r.user_name || 'Anonymous'}:</strong></p>
      <p>${r.comment}</p>
      <p>Rating: ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</p>
    </div>
  `).join('');
}


async function submitReview(token, placeId, reviewText, rating) {
  const response = await fetch('http://localhost:5000/api/v1/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      review: reviewText,
      rating: Number(rating),
      place_id: placeId
    })
  });
  if (response.ok) {
    alert('Review successfully submitted!');

    fetchPlaceDetails(token, placeId);
    document.getElementById('review-form').reset();
  } else {
    alert('Failed to send review');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const token = updateLoginLinkVisibility();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await loginUser(email, password);
    });
    return;
  }


  const placesList = document.getElementById('places-list');
  if (placesList && token) {
    fetchPlaces(token);
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.innerHTML = `
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="">All</option>
      `;
      priceFilter.addEventListener('change', filterPlaces);
    }
    return;
  }

  const placeId = getPlaceIdFromURL();
  const placeDetailsSection = document.getElementById('place-details');
  if (placeDetailsSection && placeId) {
    const addReviewLink = document.getElementById('add-review-link');
    const reviewForm = document.getElementById('review-form');
    if (!token) {
      if (addReviewLink) addReviewLink.style.display = 'inline-block';
      if (reviewForm) reviewForm.style.display = 'none';
    } else {
      if (addReviewLink) addReviewLink.style.display = 'none';
      if (reviewForm) reviewForm.style.display = 'block';
      fetchPlaceDetails(token, placeId);
      if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const reviewText = document.getElementById('review-text').value.trim();
          const rating = document.getElementById('rating-select').value;
          if (!reviewText || !rating) {
            alert('Please fill all fields');
            return;
          }
          await submitReview(token, placeId, reviewText, rating);
        });
      }
    }
  }
});

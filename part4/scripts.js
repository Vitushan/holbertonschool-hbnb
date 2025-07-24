document.addEventListener('DOMContentLoaded', () => {
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
      checkAuthentication();
    });
  }

  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.innerHTML =
      `<option value="10">10</option>
      <option value="50">50</option>
      <option value="100">100</option>
      <option value="">All</option>`;

    priceFilter.addEventListener('change', (event) => {
      const maxPrice = event.target.value;
      const placeList = document.getElementById('places-list');
      const places = placeList.children;
      for (let i = 0; i < places.length; i++) {
        const place = places[i];
        const placePrice = Number(place.getAttribute('data-price'));
        if (maxPrice === "" || placePrice <= Number(maxPrice)) {
          place.style.display = 'block';
        } else {
          place.style.display = 'none';
        }
      }
    });
  }

  const reviewForm = document.getElementById('review-form');
  const token = checkAuthentication();
  const placeId = getPlaceIdFromURL();

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const reviewText = document.getElementById('review-text').value.trim();
      if (reviewText === '') {
        alert('Field is empty.');
        return;
      }
      await submitReview(token, placeId, reviewText);
    });
  }

  const placeIdFromURL = getPlaceIdFromURL();
  if (placeIdFromURL) {
    const tokenFromCookie = getCookie('token');
    if (tokenFromCookie) {
      fetchPlaceDetails(tokenFromCookie, placeIdFromURL);
    }
  }
});

async function loginUser(email, password) {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    if (loginLink) loginLink.style.display = 'block';
  } else {
    if (loginLink) loginLink.style.display = 'none';
    fetchPlaces(token);
  }

  return token;
}

function getCookie(name) {
  const cookieName = name + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(cookieName) === 0) {
      return c.substring(cookieName.length, c.length);
    }
  }
  return "";
}

async function fetchPlaces(token) {
  const response = await fetch('http://localhost:5000/api/v1/places', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const data = await response.json();
    displayPlaces(data);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach(place => {
    const newDiv = document.createElement('div');
    newDiv.setAttribute('data-price', place.price);
    newDiv.innerHTML = `
      <h3>${place.name}</h3>
      <p>${place.description}</p>
      <p>${place.location}</p>
      <p>Price: $${place.price}</p>
    `;
    placesList.appendChild(newDiv);
  });
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchPlaceDetails(token, placeId) {
  const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const data = await response.json();
    displayPlaceDetails(data);
  }
}

function displayPlaceDetails(place) {
  const placeDetails = document.getElementById('place-details');
  placeDetails.innerHTML = '';

  const newDiv = document.createElement('div');
  newDiv.innerHTML = `
    <h3>${place.name}</h3>
    <p>${place.description}</p>
    <p>${place.location}</p>
    <p>Price: $${place.price}</p>
    <h4>Amenities:</h4>
    <ul>
      ${place.amenities}
    </ul>
    <h4>Reviews:</h4>
    <ul>
      ${place.reviews}
    </ul>
  `;
  placeDetails.appendChild(newDiv);
}

async function submitReview(token, placeId, reviewText) {
  const response = await fetch('http://localhost:5000/api/v1/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      review: reviewText,
      place_id: placeId
    })
  });

  if (response.ok) {
    alert('Review successfully submitted!');
    document.getElementById('review-text').value = '';
  } else {
    alert('Failed to send review');
  }
}

function checkAuthentication() {
  const token = getCookie('token');
  if (!token) {
    window.location.href = 'index.html';
  }
  return token;
}

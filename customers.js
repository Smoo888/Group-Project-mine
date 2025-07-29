const clientId = 'CRH2eGUfAmm1gaQyAv3i0M3itsoYXSgv';
const clientSecret = 'jlOB0XJSrrGwbSWY';

// Function to get an access token from Amadeus API
async function getAccessToken() {
  // Send a POST request to the Amadeus OAuth endpoint to get an access token
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  // Parse and return the access token from the response
  const data = await response.json();
  return data.access_token;
}

// Function to search for flight offers using the Amadeus API
async function searchFlightOffers(token, origin, destination, date) {
  // Send a POST request to the flight offers endpoint
  const response = await fetch('https://test.api.amadeus.com/v2/shopping/flight-offers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,  // Use the token obtained earlier
      'Content-Type': 'application/json'
    },
    // Build the request body with search parameters
    body: JSON.stringify({
      currencyCode: "USD",
      originDestinations: [{
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: { date: date },  // Date of departure
        includeNearbyAirports: false  
      }],
      travelers: [{
        id: "1",
        travelerType: "ADULT"  // one adult traveler
      }],
      sources: ["GDS"]  // Search source is Global Distribution System
    })
  });

  // Parse and return the flight data
  return response.json();
}

// Add event listener to handle form submission
document.getElementById('flightForm').addEventListener('submit', async function (e) {
  e.preventDefault();  // Prevent the default form submission behavior

  // Get input values from the form and format them
  const origin = document.getElementById('origin').value.toUpperCase();
  const destination = document.getElementById('destination').value.toUpperCase();
  const departureDate = document.getElementById('departureDate').value;
  const resultsDiv = document.getElementById('results');  

  // Show loading message while waiting for API response
  resultsDiv.innerHTML = '<p>Loading flights...</p>';

  try {
    //Get access token
    const token = await getAccessToken();

    //search for flight offers
    const data = await searchFlightOffers(token, origin, destination, departureDate);

    // Check if flights were found
    if (!data.data || data.data.length === 0) {
      resultsDiv.innerHTML = '<p>No flights found.</p>';
      return;
    }

    // Clear previous results
    resultsDiv.innerHTML = '';

    // Loop through each flight offer and display it
    data.data.forEach(offer => {
      const price = offer.price?.total || 'N/A'; 
      const currency = offer.price?.currency || 'USD';  
      const segments = offer.itineraries[0]?.segments || []; 

      //HTML details for each flight
      const details = segments.map(seg => `
        <p><strong>${seg.departure.iataCode}</strong> → <strong>${seg.arrival.iataCode}</strong><br>
        ${new Date(seg.departure.at).toLocaleString()} → ${new Date(seg.arrival.at).toLocaleString()}<br>
        Airline: ${seg.carrierCode}</p>
      `).join('');

      // Create a div for the offer and append it to the results
      const div = document.createElement('div');
      div.className = 'flight-offer';
      div.innerHTML = `<h3>Price: ${currency} ${price}</h3>${details}`;
      resultsDiv.appendChild(div);
    });

  } catch (err) {
    // Handle errors
    console.error(err);
    resultsDiv.innerHTML = '<p>Error loading flight data.</p>';
  }
});

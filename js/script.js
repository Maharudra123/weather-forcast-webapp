// Event listener for the "Get Weather" button
document.getElementById('get-weather-btn').addEventListener('click', function () {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        document.getElementById('loader').style.display = 'block';  // Show loader
        document.getElementById('city-display').textContent = '';  // Clear previous city name

        // Fetch both current weather and forecast data together
        Promise.allSettled([getWeather(city), getForecast(city)])
            .then(() => {
                document.getElementById('loader').style.display = 'none';  // Hide loader after both are settled
            });
    } else {
        alert("Please enter a city name.");
    }
});

// Function to get current weather data
function getWeather(city) {
    const apiKey = '2da5cc7c625ea04134909b4dd8c9c1dd';  // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            // Populate the DOM with weather data
            document.getElementById('city-name').textContent = data.name;
            document.getElementById('temperature').textContent = data.main.temp;
            document.getElementById('humidity').textContent = data.main.humidity;
            document.getElementById('description').textContent = data.weather[0].description;

            // Set weather icon
            const iconCode = data.weather[0].icon;
            document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${iconCode}.png`;

            document.getElementById('current-weather').style.display = 'block';  // Show weather info
            
            // Update the city name display dynamically
            document.getElementById('city-display').textContent = `Weather data for ${data.name}`;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Unable to get weather data.");
        });
}

// Function to get 7-day weather forecast data
function getForecast(city) {
    const apiKey = '2da5cc7c625ea04134909b4dd8c9c1dd';  // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            const forecastContainer = document.getElementById('forecast-container');
            forecastContainer.innerHTML = '';  // Clear previous results
            forecastContainer.style.display = 'flex';  // Show forecast container

            const dates = [];
            const temperatures = [];

            for (let i = 0; i < data.list.length; i += 8) {  // Selects one forecast per day
                const dayData = data.list[i];
                const date = new Date(dayData.dt_txt).toLocaleDateString();
                const temperature = dayData.main.temp;
                const iconCode = dayData.weather[0].icon;

                dates.push(date);
                temperatures.push(temperature);

                // Create a card for each day's forecast
                const card = document.createElement('div');
                card.classList.add('forecast-card', 'col-md-2');

                card.innerHTML = `
                    <h5>${date}</h5>
                    <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
                    <p><strong>${temperature}°C</strong></p>
                    <p>${dayData.weather[0].description}</p>
                `;

                // Append the card to the forecast container
                forecastContainer.appendChild(card);
            }

            // Call the function to create the chart
            createTemperatureChart(dates, temperatures);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            alert("Unable to get forecast data.");
        });
}

// Declare a variable to hold the chart instance globally
let chartInstance = null;

// Function to generate the temperature graph
function createTemperatureChart(dates, temperatures) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    // Check if a previous chart exists, if so, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance and store it in the variable
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

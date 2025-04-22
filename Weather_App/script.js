const apiKey = '8ee79b8679d1cd0da271e86bfb4c4a33'; 
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('city');
const unitToggle = document.getElementById('unitToggle');

searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    const unit = unitToggle.checked ? 'imperial' : 'metric';

    if (city !== '') {
        showLoader();
        try {
            await getWeather(city, unit);
            await getForecast(city, unit);
        } catch (err) {
            showError(err.message);
        } finally {
            hideLoader();
        }
    } else {
        showError('Please enter a city name.');
    }
});

async function getWeather(city, unit = 'metric') {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        updateUI(data, unit);
        hideError();
    } catch (error) {
        throw error;
    }
}
// Function to get the 5-day forecast
async function getForecast(city, unit = 'metric') {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Could not retrieve forecast data.');
        }
        const data = await response.json();
        displayForecast(data, unit);
    } catch (error) {
        throw error;
    }
}
// Function to update the UI with weather data
function updateUI(data, unit) {
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('degree').textContent = unit === 'imperial' ? '°F' : '°C';
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    const iconCode = data.weather[0].icon;
    document.getElementById('icon').innerHTML = `<i class="wi ${getWeatherIconClass(iconCode)}"></i>`;
}
// Function to display the 5-day forecast
function displayForecast(data, unit) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '<h3>5-Day Forecast</h3>';

    const dailyData = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date] && item.dt_txt.includes('12:00:00')) {
            dailyData[date] = item;
        }
    });
    // Loop through the daily data and create forecast elements
    Object.keys(dailyData).slice(0, 5).forEach(date => {
        const item = dailyData[date];
        const iconClass = getWeatherIconClass(item.weather[0].icon);
        const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <p>${formattedDate}</p>
                <i class="wi ${iconClass} forecast-icon"></i>
                <p>${Math.round(item.main.temp)} ${unit === 'imperial' ? '°F' : '°C'}</p>
                <p>${item.weather[0].main}</p>
            </div>
        `;
    });
}
// Function to get the weather icon class based on the icon code
function getWeatherIconClass(iconCode) {
    const iconMap = {
        "01d": "wi-day-sunny", "01n": "wi-night-clear",
        "02d": "wi-day-cloudy", "02n": "wi-night-alt-cloudy",
        "03d": "wi-cloud", "03n": "wi-cloud",
        "04d": "wi-cloudy", "04n": "wi-cloudy",
        "09d": "wi-showers", "09n": "wi-showers",
        "10d": "wi-day-rain", "10n": "wi-night-alt-rain",
        "11d": "wi-thunderstorm", "11n": "wi-thunderstorm",
        "13d": "wi-snow", "13n": "wi-snow",
        "50d": "wi-fog", "50n": "wi-fog"
    };
    return iconMap[iconCode] || "wi-na";
}
// Function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}
// Function to hide error messages
function hideError() {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
}
// Function to show and hide the loader
function showLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
}
// Function to hide the loader
function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
}

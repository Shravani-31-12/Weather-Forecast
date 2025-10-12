
//  WeatherAPI.com



const apiKey = "0b26a5060d3649c485221603251210";

const weatherCard = document.querySelector(".weather-card");
const errorMessage = document.getElementById("errormsg");
const weeklyForecast = document.getElementById("weeklyForecast");
const forecastContainer = document.getElementById("forecastContainer");

// Inputs & Buttons
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

// Weather info
const cityName = document.getElementById("cityName");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");


//  Fetch Weather by City

async function getWeather(city) {
  try {
    errorMessage.classList.add("hidden");

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      city
    )}&days=7&aqi=no&alerts=no`;

    const response = await fetch(url);

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayWeather(data);
    displayForecast(data.forecast.forecastday);
  } catch (error) {
    showError(error.message);
  }
}


// Fetch Weather by Location

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`;
          const response = await fetch(url);
          if (!response.ok) throw new Error("Unable to fetch location weather");

          const data = await response.json();
          displayWeather(data);
          displayForecast(data.forecast.forecastday);
        } catch (error) {
          showError(error.message);
        }
      },
      () => showError("Location access denied")
    );
  } else {
    showError("Geolocation not supported by browser");
  }
}


//  Display Weather Details

function displayWeather(data) {
  weatherCard.classList.remove("hidden");
  cityName.textContent = `${data.location.name}, ${data.location.country}`;
  description.textContent = data.current.condition.text;
  temperature.textContent = `${Math.round(data.current.temp_c)} °C`;
  feelsLike.textContent = `${Math.round(data.current.feelslike_c)} °C`;
  humidity.textContent = `${data.current.humidity}%`;
  windSpeed.textContent = `${Math.round(data.current.wind_kph)} km/hr`;
  weatherIcon.src = `https:${data.current.condition.icon}`;
}


//  7-Day Forecast

function displayForecast(days) {
  forecastContainer.innerHTML = "";
  days.forEach((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const icon = day.day.condition.icon;
    const maxTemp = Math.round(day.day.maxtemp_c);
    const minTemp = Math.round(day.day.mintemp_c);

    forecastContainer.innerHTML += `
      <div class="forecast-day">
        <h4>${dayName}</h4>
        <img src="https:${icon}" alt="icon">
        <p>☀️ ${maxTemp}°C</p>
        <p>🌙 ${minTemp}°C</p>
      </div>
    `;
  });

  weeklyForecast.classList.remove("hidden");
}


//  Error Handler

function showError(message) {
  weatherCard.classList.add("hidden");
  weeklyForecast.classList.add("hidden");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}


//  Event Listeners

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
    cityInput.value = "";
  } else {
    showError("Please enter a city name");
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

locationBtn.addEventListener("click", getLocationWeather);

console.log(" Weather app (WeatherAPI) loaded successfully!");

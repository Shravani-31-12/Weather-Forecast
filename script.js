
const weatherCard = document.querySelector(".weather-card");
const errorMessage = document.getElementById("errormsg");
const weeklyForecast = document.getElementById("weeklyForecast");
const forecastContainer = document.getElementById("forecastContainer");

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike"); 
const humidity = document.getElementById("humidity");   
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");


function hideError() {
  if (errorMessage) {
    errorMessage.classList.add("hidden");
    errorMessage.style.display = "none";
  }
}
hideError();


function mapWeatherCodeToEmoji(code) {

  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if ((code >= 51 && code <= 55) || (code >= 56 && code <= 57)) return "🌦️";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️";
  if (code >= 95 && code <= 99) return "⛈️";
  
  return "🌤️";
}


function weatherCodeToText(code) {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if ((code >= 51 && code <= 55) || (code >= 56 && code <= 57)) return "Drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "Snow";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Cloudy";
}


function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
    errorMessage.style.display = "block";
  }
  if (weatherCard) weatherCard.classList.add("hidden");
  if (weeklyForecast) weeklyForecast.classList.add("hidden");
}

function displayWeatherLocationName(name, country) {
  cityName.textContent = country ? `${name}, ${country}` : name;
}

function displayCurrentWeather(current, placeName, country) {
  hideError();
  if (weatherCard) weatherCard.classList.remove("hidden");

  displayWeatherLocationName(placeName, country);

 
  const tempC = Math.round(current.temperature);
  temperature.textContent = `${tempC} °C`;
  description.textContent = weatherCodeToText(current.weathercode);
  windSpeed.textContent = `${Math.round(current.windspeed)} km/hr`;
  
  feelsLike.textContent = `--°C`;
  humidity.textContent = `--%`;

  
  const emoji = mapWeatherCodeToEmoji(current.weathercode);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><foreignObject width='100%' height='100%'><div xmlns='http://www.w3.org/1999/xhtml' style='font-size:64px;display:flex;align-items:center;justify-content:center;height:100%;background:transparent'>${emoji}</div></foreignObject></svg>`;
  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  weatherIcon.src = dataUrl;
  weatherIcon.alt = description.textContent || emoji;
}


function displayForecast(daily) {
  
  if (!daily || !daily.time || daily.time.length === 0) {
    weeklyForecast.classList.add("hidden");
    return;
  }

 
  forecastContainer.innerHTML = "";


  const days = daily.time.map((t, i) => ({
    date: t,
    max: Math.round(daily.temperature_2m_max[i]),
    min: Math.round(daily.temperature_2m_min[i]),
    code: daily.weathercode[i],
  })).slice(0, 7);

  days.forEach((d) => {
    const date = new Date(d.date + "T00:00:00"); // ensure parse
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., Mon
    const emoji = mapWeatherCodeToEmoji(d.code);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <h4>${dayName}</h4>
      <div class="forecast-emoji" aria-hidden="true" style="font-size:40px;margin:6px 0">${emoji}</div>
      <p>☀️ ${d.max}°C</p>
      <p>🌙 ${d.min}°C</p>
    `;
    forecastContainer.appendChild(card);
  });

  weeklyForecast.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  errorMessage.style.display = "none";

 
  setTimeout(() => {
    const firstCard = forecastContainer.querySelector(".forecast-day");
    if (firstCard) {
      const centerOffset = (forecastContainer.clientWidth - firstCard.clientWidth) / 2;
      forecastContainer.scrollTo({ left: Math.max(0, firstCard.offsetLeft - centerOffset), behavior: "smooth" });
    }
  }, 140);
}


async function fetchWeatherByCoords(lat, lon, placeName = "", country = "") {
  try {
    hideError();
   
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
   
    const endDateObj = new Date();
    endDateObj.setDate(today.getDate() + 6);
    const endDate = endDateObj.toISOString().slice(0, 10);

    const dailyParams = [
      "temperature_2m_max",
      "temperature_2m_min",
      "weathercode"
    ].join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&daily=${dailyParams}&current_weather=true&timezone=auto&start_date=${startDate}&end_date=${endDate}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Unable to fetch weather data");

    const data = await resp.json();

    if (!data || (!data.current_weather && !data.daily)) {
      throw new Error("Incomplete weather data");
    }

    
    if (data.current_weather) {
      displayCurrentWeather(data.current_weather, placeName || `${lat.toFixed(2)},${lon.toFixed(2)}`, country || "");
    } else {
    
      displayCurrentWeather({ temperature: data.daily.temperature_2m_max[0], windspeed: 0, weathercode: data.daily.weathercode[0] }, placeName || `${lat},${lon}`, country || "");
    }

    
    if (data.daily) {
      displayForecast(data.daily);
    } else {
      showError("Forecast data not available");
    }

  } catch (err) {
    console.error("fetchWeatherByCoords:", err);
    showError(err.message || "Failed to fetch weather");
  }
}


async function geocodeCity(city) {
  try {
    const q = encodeURIComponent(city);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=5&language=en&format=json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Geocoding failed");

    const data = await resp.json();
    if (!data || !data.results || data.results.length === 0) {
      throw new Error("City not found");
    }

    
    const pick = data.results[0];
    return {
      name: pick.name,
      country: pick.country,
      latitude: pick.latitude,
      longitude: pick.longitude,
      admin1: pick.admin1 || ""
    };
  } catch (err) {
    console.error("geocodeCity:", err);
    throw err;
  }
}


searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  try {
    hideError();
   
    const place = await geocodeCity(city);
    await fetchWeatherByCoords(place.latitude, place.longitude, place.name, place.country);
    cityInput.value = "";
  } catch (err) {
    
    showError(err.message || "Unable to find city");
  }
});


cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});


locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported by browser");
    return;
  }
  hideError();
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      try {
       
        const revUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
        const revResp = await fetch(revUrl);
        let placeLabel = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
        let country = "";
        if (revResp.ok) {
          const revData = await revResp.json();
          if (revData && revData.results && revData.results.length > 0) {
            placeLabel = revData.results[0].name;
            country = revData.results[0].country || "";
          }
        }
        await fetchWeatherByCoords(latitude, longitude, placeLabel, country);
      } catch (err) {
       
        await fetchWeatherByCoords(latitude, longitude, `${latitude.toFixed(2)},${longitude.toFixed(2)}`, "");
      }
    },
    (err) => {
      console.error("Geolocation error:", err);
      showError("Location access denied");
    }
  );
});


forecastContainer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    forecastContainer.scrollBy({ left: 120, behavior: "smooth" });
  } else if (e.key === "ArrowLeft") {
    forecastContainer.scrollBy({ left: -120, behavior: "smooth" });
  }
});


async function getWeatherForDefaultCity(cityName) {
  try {
    const place = await geocodeCity(cityName);
    await fetchWeatherByCoords(place.latitude, place.longitude, place.name, place.country);
  } catch (err) {
    console.warn("Default city load failed:", err);
  }
}

console.log("Open-Meteo weather script loaded (7-day forecast, emoji icons).");

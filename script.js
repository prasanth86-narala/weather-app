'use strict';


const CONFIG = {
  API_KEY: 'fc1a10de3ca37ee08b1300279832fa05',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  ICON_URL: 'https://openweathermap.org/img/wn',
  UNITS: 'metric',
  MAX_RECENT_SEARCHES: 5,
  STORAGE_KEYS: {
    RECENT: 'weatherApp:recentSearches',
    THEME: 'weatherApp:theme',
  },
};


const dom = {
  themeToggle: document.getElementById('themeToggle'),

  searchForm: document.getElementById('searchForm'),
  cityInput: document.getElementById('cityInput'),
  locateBtn: document.getElementById('locateBtn'),
  recentSearches: document.getElementById('recentSearches'),

  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  emptyState: document.getElementById('emptyState'),
  dashboard: document.getElementById('dashboard'),

  cityName: document.getElementById('cityName'),
  dateTime: document.getElementById('dateTime'),
  weatherIcon: document.getElementById('weatherIcon'),
  currentTemp: document.getElementById('currentTemp'),
  weatherDesc: document.getElementById('weatherDesc'),
  feelsLike: document.getElementById('feelsLike'),
  tempMax: document.getElementById('tempMax'),
  tempMin: document.getElementById('tempMin'),

  statHumidity: document.getElementById('statHumidity'),
  statWind: document.getElementById('statWind'),
  statPressure: document.getElementById('statPressure'),
  statVisibility: document.getElementById('statVisibility'),
  statSunrise: document.getElementById('statSunrise'),
  statSunset: document.getElementById('statSunset'),

  forecastStrip: document.getElementById('forecastStrip'),
};


const storage = {
  getRecentSearches() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addRecentSearch(cityLabel) {
    const current = storage.getRecentSearches().filter(
      (c) => c.toLowerCase() !== cityLabel.toLowerCase()
    );
    current.unshift(cityLabel);
    const trimmed = current.slice(0, CONFIG.MAX_RECENT_SEARCHES);
    localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT, JSON.stringify(trimmed));
    return trimmed;
  },

  getTheme() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
  },

  setTheme(theme) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  },
};


const weatherApi = {
 
  buildQuery(params) {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  },

  async request(endpoint, params) {
    const query = weatherApi.buildQuery({
      ...params,
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
    });
    const response = await fetch(`${CONFIG.BASE_URL}/${endpoint}?${query}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('City not found. Check the spelling and try again.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Add a valid OpenWeather API key in script.js.');
      }
      throw new Error('Weather service is unavailable right now. Please try again shortly.');
    }

    return response.json();
  },

  getCurrentByCity(city) {
    return weatherApi.request('weather', { q: city });
  },

  getCurrentByCoords(lat, lon) {
    return weatherApi.request('weather', { lat, lon });
  },

  getForecastByCoords(lat, lon) {
    return weatherApi.request('forecast', { lat, lon });
  },
};


const format = {
  temp(value) {
    return `${Math.round(value)}°`;
  },

  time(unixSeconds, timezoneOffsetSeconds = 0) {
    const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  },

  fullDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  },

  weekday(unixSeconds, timezoneOffsetSeconds = 0) {
    const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  },

  visibilityKm(meters) {
    return (meters / 1000).toFixed(1);
  },

  iconUrl(iconCode) {
    return `${CONFIG.ICON_URL}/${iconCode}@2x.png`;
  },
};


function groupForecastByDay(list) {
  const byDate = new Map();

  list.forEach((entry) => {
    const dateKey = entry.dt_txt.split(' ')[0];
    const hour = Number(entry.dt_txt.split(' ')[1].split(':')[0]);
    const distanceFromNoon = Math.abs(hour - 12);

    const existing = byDate.get(dateKey);
    if (!existing || distanceFromNoon < existing.distanceFromNoon) {
      byDate.set(dateKey, { entry, distanceFromNoon });
    }
  });

  return Array.from(byDate.values())
    .map(({ entry }) => entry)
    .slice(0, 5);
}


function renderCurrentWeather(data) {
  const { name, sys, main, weather, wind, visibility, timezone } = data;
  const [condition] = weather;

  dom.cityName.textContent = `${name}, ${sys.country}`;
  dom.dateTime.textContent = format.fullDate();

  dom.weatherIcon.src = format.iconUrl(condition.icon);
  dom.weatherIcon.alt = condition.description;

  dom.currentTemp.textContent = format.temp(main.temp);
  dom.weatherDesc.textContent = condition.description;
  dom.feelsLike.textContent = `Feels like ${format.temp(main.feels_like)}`;

  dom.tempMax.textContent = format.temp(main.temp_max);
  dom.tempMin.textContent = format.temp(main.temp_min);

  dom.statHumidity.innerHTML = `${main.humidity}<small>%</small>`;
  dom.statWind.innerHTML = `${wind.speed}<small>m/s</small>`;
  dom.statPressure.innerHTML = `${main.pressure}<small>hPa</small>`;
  dom.statVisibility.innerHTML = `${format.visibilityKm(visibility)}<small>km</small>`;
  dom.statSunrise.textContent = format.time(sys.sunrise, timezone);
  dom.statSunset.textContent = format.time(sys.sunset, timezone);

  applyAmbientMood(condition.icon);
}

function renderForecast(forecastData) {
  const days = groupForecastByDay(forecastData.list);
  const timezone = forecastData.city.timezone;

  dom.forecastStrip.innerHTML = days
    .map((day, index) => {
      const condition = day.weather[0];
      return `
        <article class="forecast-card" style="animation-delay:${index * 60}ms">
          <span class="forecast-card__day">${format.weekday(day.dt, timezone)}</span>
          <img class="forecast-card__icon" src="${format.iconUrl(condition.icon)}" alt="${condition.description}" />
          <span class="forecast-card__temp">${format.temp(day.main.temp_max)} <span>/ ${format.temp(day.main.temp_min)}</span></span>
        </article>
      `;
    })
    .join('');
}

function renderRecentSearches(cities) {
  dom.recentSearches.innerHTML = cities
    .map((city) => `<button type="button" class="recent__chip" data-city="${city}">${city}</button>`)
    .join('');
}


function applyAmbientMood(iconCode) {
  const moodColors = {
    '01': ['#ff9a3d', '#6c63ff'], 
    '02': ['#a0b4d8', '#6c63ff'],
    '03': ['#8892b0', '#5b6699'], 
    '04': ['#707d9e', '#4e5a82'], 
    '09': ['#4a7fc9', '#2d4a7a'],
    '10': ['#4a7fc9', '#6c63ff'], 
    '11': ['#3d3d6b', '#ff5c72'],
    '13': ['#bcd4f2', '#8f9fd8'], 
    '50': ['#9aa6c2', '#6f7aa0'], 
  };
  const prefix = iconCode.slice(0, 2);
  const [c1, c2] = moodColors[prefix] || moodColors['01'];
  document.documentElement.style.setProperty('--accent-amber', c1);
  document.documentElement.style.setProperty('--accent-violet', c2);
}


function setUiState(stateName, message) {
  const states = ['loading', 'error', 'empty', 'data'];
  states.forEach((name) => {
    const isActive = name === stateName;
    if (name === 'loading') dom.loadingState.hidden = !isActive;
    if (name === 'error') dom.errorState.hidden = !isActive;
    if (name === 'empty') dom.emptyState.hidden = !isActive;
    if (name === 'data') dom.dashboard.hidden = !isActive;
  });

  if (stateName === 'error' && message) {
    dom.errorMessage.textContent = message;
  }
}


async function loadWeatherByCity(city) {
  if (!city || !city.trim()) {
    setUiState('error', 'Please enter a city name to search.');
    return;
  }

  setUiState('loading');

  try {
    const current = await weatherApi.getCurrentByCity(city.trim());
    const forecast = await weatherApi.getForecastByCoords(current.coord.lat, current.coord.lon);

    renderCurrentWeather(current);
    renderForecast(forecast);
    setUiState('data');

    const updatedRecents = storage.addRecentSearch(`${current.name}, ${current.sys.country}`);
    renderRecentSearches(updatedRecents);
  } catch (error) {
    handleLookupError(error);
  }
}

async function loadWeatherByCoords(lat, lon) {
  setUiState('loading');

  try {
    const current = await weatherApi.getCurrentByCoords(lat, lon);
    const forecast = await weatherApi.getForecastByCoords(lat, lon);

    renderCurrentWeather(current);
    renderForecast(forecast);
    setUiState('data');

    const updatedRecents = storage.addRecentSearch(`${current.name}, ${current.sys.country}`);
    renderRecentSearches(updatedRecents);
  } catch (error) {
    handleLookupError(error);
  }
}

function handleLookupError(error) {
  const isNetworkError = error instanceof TypeError; // fetch throws TypeError on network failure
  const message = isNetworkError
    ? 'Network error. Check your internet connection and try again.'
    : error.message || 'Something went wrong. Please try again.';
  setUiState('error', message);
}


function handleSearchSubmit(event) {
  event.preventDefault();
  const city = dom.cityInput.value;
  loadWeatherByCity(city);
}

function handleRecentClick(event) {
  const chip = event.target.closest('[data-city]');
  if (!chip) return;
  dom.cityInput.value = chip.dataset.city;
  loadWeatherByCity(chip.dataset.city);
}

function handleLocateClick() {
  if (!navigator.geolocation) {
    setUiState('error', 'Geolocation is not supported by your browser.');
    return;
  }

  setUiState('loading');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadWeatherByCoords(latitude, longitude);
    },
    (geoError) => {
      const messages = {
        1: 'Location access was denied. Please search for a city instead.',
        2: 'Location is currently unavailable. Please search for a city instead.',
        3: 'Location request timed out. Please search for a city instead.',
      };
      setUiState('error', messages[geoError.code] || 'Unable to detect your location.');
    },
    { timeout: 10000 }
  );
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  dom.themeToggle.setAttribute('aria-pressed', String(!isDark));
  storage.setTheme(nextTheme);
}


function initTheme() {
  const savedTheme = storage.getTheme();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  dom.themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

function initRecentSearches() {
  renderRecentSearches(storage.getRecentSearches());
}

function bindEvents() {
  dom.searchForm.addEventListener('submit', handleSearchSubmit);
  dom.locateBtn.addEventListener('click', handleLocateClick);
  dom.recentSearches.addEventListener('click', handleRecentClick);
  dom.themeToggle.addEventListener('click', toggleTheme);
}

function init() {
  initTheme();
  initRecentSearches();
  bindEvents();
  setUiState('empty');
}

document.addEventListener('DOMContentLoaded', init);

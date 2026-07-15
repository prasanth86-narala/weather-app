# 🌤️ Weather Dashboard

A premium, glassmorphism-styled weather app with live forecasts, geolocation support, and dark mode — built with vanilla HTML, CSS, and JavaScript.

![Made with HTML](https://img.shields.io/badge/HTML-5-orange)
![Made with CSS](https://img.shields.io/badge/CSS-3-blue)
![Made with JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## Features

- 🔍 **City search** — look up current weather and forecast by city name
- 📍 **Geolocation** — one-click "Use my location" powered by the browser Geolocation API
- 📅 **5-day forecast** — daily high/low temps with condition icons
- 📊 **Detailed stats** — humidity, wind speed, pressure, visibility, sunrise & sunset
- 🕘 **Recent searches** — last 5 searches saved locally for quick access
- 🌗 **Dark mode** — toggle with system-preference detection, persisted across sessions
- 🎨 **Ambient mood colors** — accent colors shift based on current weather conditions
- 💎 **Glassmorphism UI** — modern frosted-glass design with smooth loading/error/empty states

## Demo

![Weather Dashboard Preview](preview.png)

*(Add a screenshot of the app here)*

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, glassmorphism effects, responsive layout
- **JavaScript (Vanilla)** — no frameworks or build tools
- **[OpenWeather API](https://openweathermap.org/api)** — current weather & 5-day/3-hour forecast data
- **Google Fonts** — Space Grotesk, Inter, JetBrains Mono
- **LocalStorage** — for theme preference and recent searches

## Getting Started

### Prerequisites

- A free [OpenWeather API key](https://home.openweathermap.org/users/sign_up)
- Any static file server (e.g. VS Code Live Server, or Python's built-in server)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/weather-dashboard.git
   cd weather-dashboard
   ```

2. Add your API key

   Open `script.js` and set your own OpenWeather API key:
   ```js
   const CONFIG = {
     API_KEY: 'YOUR_OPENWEATHER_API_KEY',
     ...
   };
   ```
   > ⚠️ **Security note:** Never commit a real API key to a public repository. Use a placeholder in your committed code, keep your real key locally, and consider adding `script.js` (or a config file holding the key) to `.gitignore` if you plan to keep the key out of version control entirely.

3. Run locally

   Using VS Code's Live Server extension, or any static server, e.g.:
   ```bash
   python -m http.server 5500
   ```
   Then open `http://127.0.0.1:5500` in your browser.

## Project Structure

```
weather-dashboard/
├── index.html      # Markup & layout
├── style.css        # Styling & theming
├── script.js        # App logic & OpenWeather API integration
└── README.md
```

## How It Works

- On search or location detection, the app calls OpenWeather's `/weather` endpoint for current conditions and `/forecast` for the 5-day outlook.
- Forecast data (3-hour intervals) is grouped by day, picking the entry closest to noon for each day's summary card.
- Theme preference and recent searches persist via `localStorage`.
- UI states (loading, error, empty, data) are managed declaratively for a smooth experience.

## Credits

Data provided by [OpenWeather](https://openweathermap.org/). Built for portfolio and learning purposes.

## License

This project is open source and available under the [MIT License](LICENSE).

# Weather Forecast App

A simple weather forecast application built with React, TypeScript, and Vite that allows users to search for cities and view current weather conditions and a 5-day forecast.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository or download the source code

2. Install dependencies:
   ```
   npm install
   ```
   or with yarn:
   ```
   yarn
   ```

3. **Important**: Get an API key from OpenWeather
   - Sign up at [OpenWeather](https://openweathermap.org/) and get a free API key
   - Open the `.env` file in the root directory
   - Replace `REPLACE_WITH_YOUR_OPENWEATHER_API_KEY` with your actual API key:
     ```
     VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
     ```

## Running the Application

Start the development server:

```
npm run dev
```

or with yarn:

```
yarn dev
```

The application will be available at http://localhost:5173

## Features

- Search for cities with autocomplete suggestions
- Display current weather conditions including temperature, humidity, and wind speed
- Show a 5-day weather forecast
- Responsive design for mobile and desktop

## Built With

- React
- TypeScript
- Vite
- Tailwind CSS
- OpenWeather API 
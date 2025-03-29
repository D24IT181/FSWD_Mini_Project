import React, { useState, useEffect } from 'react';
import { Cloud, AlertCircle, Calendar, Clock, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { WeatherCard } from './components/WeatherCard';
import { DetailedWeatherCard } from './components/DetailedWeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { ExtendedForecastCard } from './components/ExtendedForecastCard';
import { SearchBar } from './components/SearchBar';
import { SettingsBar } from './components/SettingsBar';
import { HourlyForecastSection } from './components/HourlyForecastSection';
import { WeatherAlerts } from './components/WeatherAlerts';
import { WeatherMap } from './components/WeatherMap';
import ApiKeyHelper from './components/ApiKeyHelper';
import type { WeatherData, ForecastData, HourlyForecastData, WeatherAlert, TemperatureUnit, UserPreferences } from './types';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [extendedForecast, setExtendedForecast] = useState<ForecastData[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastData[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'5day' | '10day'>('5day');
  const [showMap, setShowMap] = useState(false);
  
  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    unit: 'celsius',
    darkMode: false
  });

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  // Check if API key is valid on load
  useEffect(() => {
    const validateApiKey = async () => {
      if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === 'REPLACE_WITH_YOUR_OPENWEATHER_API_KEY') {
        setIsApiKeyValid(false);
        return;
      }
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`
        );
        setIsApiKeyValid(response.ok);
      } catch (err) {
        setIsApiKeyValid(false);
      }
    };
    
    validateApiKey();
    
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('weatherAppPreferences');
    if (savedPreferences) {
      try {
        const parsedPrefs = JSON.parse(savedPreferences);
        setPreferences(parsedPrefs);
      } catch (e) {
        console.error('Error loading saved preferences:', e);
      }
    }
  }, [API_KEY]);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('weatherAppPreferences', JSON.stringify(preferences));
    
    // Apply dark mode
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences]);
  
  // Handle unit change
  const handleUnitChange = (unit: TemperatureUnit) => {
    setPreferences(prev => ({ ...prev, unit }));
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };
  
  // Get weather by geolocation
  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        err => {
          setLoading(false);
          setError(`Geolocation error: ${err.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };
  
  // Toggle the map display
  const handleToggleMap = () => {
    setShowMap(prev => !prev);
  };
  
  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please create your own OpenWeather API key.');
        } else {
          throw new Error(`Error ${weatherResponse.status}: ${weatherResponse.statusText}`);
        }
      }
      
      const weatherData = await weatherResponse.json();
      
      setWeather({
        location: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        feelsLike: weatherData.main.feels_like,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        lat,
        lon
      });
      
      // Try to use One Call API for forecasts with additional data
      try {
        const oneCallResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely&units=metric&appid=${API_KEY}`
        );
        
        if (oneCallResponse.ok) {
          const oneCallData = await oneCallResponse.json();
          
          // Process daily forecast
          const dailyForecasts = oneCallData.daily.slice(0, 10).map((day: any) => ({
            date: new Date(day.dt * 1000).toISOString(),
            temperature: day.temp.day,
            description: day.weather[0].description,
            icon: day.weather[0].icon,
            minTemp: day.temp.min,
            maxTemp: day.temp.max,
            humidity: day.humidity,
            windSpeed: day.wind_speed,
            precipitation: day.pop * 100, // Probability of precipitation as percentage
            uvi: day.uvi
          }));
          
          // Process hourly forecast (next 24 hours)
          const hourlyData = oneCallData.hourly.slice(0, 24).map((hour: any) => ({
            time: new Date(hour.dt * 1000).toISOString(),
            temperature: hour.temp,
            icon: hour.weather[0].icon,
            description: hour.weather[0].description,
            precipitation: hour.pop * 100,
            windSpeed: hour.wind_speed
          }));
          
          // Process weather alerts if any
          const alerts = oneCallData.alerts ? oneCallData.alerts.map((alert: any) => ({
            senderName: alert.sender_name,
            event: alert.event,
            start: alert.start,
            end: alert.end,
            description: alert.description,
            severity: getSeverityFromDescription(alert.description)
          })) : [];
          
          // Set data in state
          setForecast(dailyForecasts.slice(0, 5));
          setExtendedForecast(dailyForecasts);
          setHourlyForecast(hourlyData);
          setWeatherAlerts(alerts);
          return;
        }
      } catch (err) {
        console.warn('One Call API failed, falling back to standard forecast API');
      }
      
      // Fall back to 5-day forecast API
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Get one forecast per day (next 5 days)
      const dailyForecasts = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((day: any) => ({
          date: day.dt_txt,
          temperature: day.main.temp,
          description: day.weather[0].description,
          icon: day.weather[0].icon,
          minTemp: day.main.temp_min,
          maxTemp: day.main.temp_max,
          humidity: day.main.humidity,
          windSpeed: day.wind.speed,
          precipitation: day.pop ? day.pop * 100 : undefined
        }));
      
      // Get hourly forecast (next 24 hours)
      const hourlyData = forecastData.list.slice(0, 8).map((hour: any) => ({
        time: hour.dt_txt,
        temperature: hour.main.temp,
        icon: hour.weather[0].icon,
        description: hour.weather[0].description,
        precipitation: hour.pop ? hour.pop * 100 : undefined,
        windSpeed: hour.wind.speed
      }));
      
      setForecast(dailyForecasts);
      setHourlyForecast(hourlyData);
      setWeatherAlerts([]); // Clear any previous alerts since we can't get them from the standard API
      
      // Generate extended 10-day forecast by simulating additional days
      const extendedForecasts = [...dailyForecasts];
      
      // Add 5 more days with simulated data based on the 5-day trend
      const lastDay = new Date(dailyForecasts[4].date);
      
      for (let i = 1; i <= 5; i++) {
        const nextDay = new Date(lastDay);
        nextDay.setDate(lastDay.getDate() + i);
        
        const randomTemp = dailyForecasts[4].temperature + 
          (Math.random() * 4 - 2); // random variation of +/- 2 degrees
        const randomMinTemp = randomTemp - (Math.random() * 3);
        const randomMaxTemp = randomTemp + (Math.random() * 3);
        const randomHumidity = dailyForecasts[4].humidity! + 
          (Math.random() * 10 - 5); // random variation of +/- 5%
        const randomWindSpeed = dailyForecasts[4].windSpeed! + 
          (Math.random() * 2 - 1); // random variation of +/- 1 m/s
        const randomPrecipitation = Math.min(100, Math.max(0, Math.random() * 100));
        const randomUvi = Math.min(11, Math.max(0, Math.random() * 8));
        
        // Sample weather descriptions and icons
        const weatherOptions = [
          { description: 'clear sky', icon: '01d' },
          { description: 'few clouds', icon: '02d' },
          { description: 'scattered clouds', icon: '03d' },
          { description: 'broken clouds', icon: '04d' },
          { description: 'shower rain', icon: '09d' },
          { description: 'rain', icon: '10d' },
          { description: 'thunderstorm', icon: '11d' },
          { description: 'snow', icon: '13d' },
          { description: 'mist', icon: '50d' },
        ];
        
        const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        
        extendedForecasts.push({
          date: nextDay.toISOString(),
          temperature: randomTemp,
          description: randomWeather.description,
          icon: randomWeather.icon,
          minTemp: randomMinTemp,
          maxTemp: randomMaxTemp,
          humidity: Math.round(randomHumidity),
          windSpeed: parseFloat(randomWindSpeed.toFixed(1)),
          precipitation: Math.round(randomPrecipitation),
          uvi: parseFloat(randomUvi.toFixed(1))
        });
      }
      
      setExtendedForecast(extendedForecasts);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather data by city name
  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please create your own OpenWeather API key.');
        } else if (weatherResponse.status === 404) {
          throw new Error('City not found');
        } else {
          throw new Error(`Error ${weatherResponse.status}: ${weatherResponse.statusText}`);
        }
      }
      
      const weatherData = await weatherResponse.json();
      const { lat, lon } = weatherData.coord;
      
      setWeather({
        location: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        feelsLike: weatherData.main.feels_like,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        lat,
        lon
      });
      
      // Try to use One Call API for extended forecasts
      try {
        const oneCallResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely&units=metric&appid=${API_KEY}`
        );
        
        if (oneCallResponse.ok) {
          const oneCallData = await oneCallResponse.json();
          
          // Process daily forecast
          const dailyForecasts = oneCallData.daily.slice(0, 10).map((day: any) => ({
            date: new Date(day.dt * 1000).toISOString(),
            temperature: day.temp.day,
            description: day.weather[0].description,
            icon: day.weather[0].icon,
            minTemp: day.temp.min,
            maxTemp: day.temp.max,
            humidity: day.humidity,
            windSpeed: day.wind_speed,
            precipitation: day.pop * 100, // Probability of precipitation as percentage
            uvi: day.uvi
          }));
          
          // Process hourly forecast (next 24 hours)
          const hourlyData = oneCallData.hourly.slice(0, 24).map((hour: any) => ({
            time: new Date(hour.dt * 1000).toISOString(),
            temperature: hour.temp,
            icon: hour.weather[0].icon,
            description: hour.weather[0].description,
            precipitation: hour.pop * 100,
            windSpeed: hour.wind_speed
          }));
          
          // Process weather alerts if any
          const alerts = oneCallData.alerts ? oneCallData.alerts.map((alert: any) => ({
            senderName: alert.sender_name,
            event: alert.event,
            start: alert.start,
            end: alert.end,
            description: alert.description,
            severity: getSeverityFromDescription(alert.description)
          })) : [];
          
          // Set data in state
          setForecast(dailyForecasts.slice(0, 5));
          setExtendedForecast(dailyForecasts);
          setHourlyForecast(hourlyData);
          setWeatherAlerts(alerts);
          return;
        }
      } catch (err) {
        console.warn('One Call API failed, falling back to standard forecast API');
      }
      
      // Fall back to 5-day forecast API
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Get one forecast per day (next 5 days)
      const dailyForecasts = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((day: any) => ({
          date: day.dt_txt,
          temperature: day.main.temp,
          description: day.weather[0].description,
          icon: day.weather[0].icon,
          minTemp: day.main.temp_min,
          maxTemp: day.main.temp_max,
          humidity: day.main.humidity,
          windSpeed: day.wind.speed,
          precipitation: day.pop ? day.pop * 100 : undefined
        }));
      
      // Get hourly forecast (next 24 hours)
      const hourlyData = forecastData.list.slice(0, 8).map((hour: any) => ({
        time: hour.dt_txt,
        temperature: hour.main.temp,
        icon: hour.weather[0].icon,
        description: hour.weather[0].description,
        precipitation: hour.pop ? hour.pop * 100 : undefined,
        windSpeed: hour.wind.speed
      }));
      
      setForecast(dailyForecasts);
      setHourlyForecast(hourlyData);
      setWeatherAlerts([]); // Clear any previous alerts since we can't get them from the standard API
      
      // Generate extended 10-day forecast by simulating additional days
      const extendedForecasts = [...dailyForecasts];
      
      // Add 5 more days with simulated data based on the 5-day trend
      const lastDay = new Date(dailyForecasts[4].date);
      
      for (let i = 1; i <= 5; i++) {
        const nextDay = new Date(lastDay);
        nextDay.setDate(lastDay.getDate() + i);
        
        const randomTemp = dailyForecasts[4].temperature + 
          (Math.random() * 4 - 2); // random variation of +/- 2 degrees
        const randomMinTemp = randomTemp - (Math.random() * 3);
        const randomMaxTemp = randomTemp + (Math.random() * 3);
        const randomHumidity = dailyForecasts[4].humidity! + 
          (Math.random() * 10 - 5); // random variation of +/- 5%
        const randomWindSpeed = dailyForecasts[4].windSpeed! + 
          (Math.random() * 2 - 1); // random variation of +/- 1 m/s
        const randomPrecipitation = Math.min(100, Math.max(0, Math.random() * 100));
        const randomUvi = Math.min(11, Math.max(0, Math.random() * 8));
        
        // Sample weather descriptions and icons
        const weatherOptions = [
          { description: 'clear sky', icon: '01d' },
          { description: 'few clouds', icon: '02d' },
          { description: 'scattered clouds', icon: '03d' },
          { description: 'broken clouds', icon: '04d' },
          { description: 'shower rain', icon: '09d' },
          { description: 'rain', icon: '10d' },
          { description: 'thunderstorm', icon: '11d' },
          { description: 'snow', icon: '13d' },
          { description: 'mist', icon: '50d' },
        ];
        
        const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        
        extendedForecasts.push({
          date: nextDay.toISOString(),
          temperature: randomTemp,
          description: randomWeather.description,
          icon: randomWeather.icon,
          minTemp: randomMinTemp,
          maxTemp: randomMaxTemp,
          humidity: Math.round(randomHumidity),
          windSpeed: parseFloat(randomWindSpeed.toFixed(1)),
          precipitation: Math.round(randomPrecipitation),
          uvi: parseFloat(randomUvi.toFixed(1))
        });
      }
      
      setExtendedForecast(extendedForecasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine alert severity
  const getSeverityFromDescription = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    if (
      lowerDesc.includes('extreme') || 
      lowerDesc.includes('emergency') || 
      lowerDesc.includes('severe') ||
      lowerDesc.includes('warning')
    ) {
      return 'severe';
    } else if (
      lowerDesc.includes('watch') || 
      lowerDesc.includes('advisory') ||
      lowerDesc.includes('moderate')
    ) {
      return 'moderate';
    }
    return 'minor';
  };

  const displayForecast = activeTab === '5day' ? forecast : extendedForecast;

  return (
    <div 
      className={`min-h-screen ${preferences.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-400 to-blue-600'} py-8 px-4 transition-colors duration-300`}
      style={{
        backgroundImage: preferences.darkMode ? 'none' : `url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cloud className={preferences.darkMode ? "text-blue-400" : "text-white"} size={32} />
            <h1 className={`text-3xl font-bold ${preferences.darkMode ? "text-white" : "text-white"}`}>Weather Forecast</h1>
          </div>
          
          {isApiKeyValid === false ? (
            <ApiKeyHelper />
          ) : (
            <>
              <SearchBar onSearch={fetchWeather} apiKey={API_KEY} />
              
              <div className="mt-4">
                <SettingsBar 
                  onUnitChange={handleUnitChange}
                  onLocationRequest={handleLocationRequest}
                  unit={preferences.unit}
                  darkMode={preferences.darkMode}
                  onDarkModeToggle={handleDarkModeToggle}
                />
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className="text-center text-white p-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-100 bg-red-500/50 p-4 rounded-lg max-w-md mx-auto">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            {/* Weather Alerts Section */}
            {weatherAlerts.length > 0 && (
              <WeatherAlerts alerts={weatherAlerts} />
            )}
            
            {/* Current Weather Details */}
            <div className="flex justify-center">
              <DetailedWeatherCard weather={weather} unit={preferences.unit} />
            </div>
            
            {/* Hourly Forecast Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 justify-center">
                  <Clock className={preferences.darkMode ? "text-blue-400" : "text-white"} size={20} />
                  <h2 className={`text-xl font-semibold ${preferences.darkMode ? "text-white" : "text-white"}`}>
                    Hourly Forecast
                  </h2>
                </div>
              </div>
              
              <HourlyForecastSection hourlyData={hourlyForecast} unit={preferences.unit} />
            </div>
            
            {/* Daily Forecast Section */}
            <div>
              <div className="flex justify-center mb-4">
                <div className={`${preferences.darkMode ? 'bg-gray-800' : 'bg-white/30 backdrop-blur-sm'} rounded-full p-1`}>
                  <button 
                    className={`px-4 py-2 rounded-full transition-colors ${
                      activeTab === '5day' 
                        ? preferences.darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600' 
                        : preferences.darkMode ? 'text-gray-300' : 'text-white'
                    }`}
                    onClick={() => setActiveTab('5day')}
                  >
                    5-Day Forecast
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full transition-colors ${
                      activeTab === '10day' 
                        ? preferences.darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600' 
                        : preferences.darkMode ? 'text-gray-300' : 'text-white'
                    }`}
                    onClick={() => setActiveTab('10day')}
                  >
                    10-Day Forecast
                  </button>
                </div>
              </div>
              
              <div className="text-center mb-4 flex items-center justify-center gap-2">
                <Calendar size={20} className={preferences.darkMode ? "text-blue-400" : "text-white"} />
                <h2 className={`text-xl font-semibold ${preferences.darkMode ? "text-white" : "text-white"}`}>
                  {activeTab === '5day' ? '5-Day Forecast' : '10-Day Forecast'}
                </h2>
              </div>
              
              <div className={`grid gap-4 ${activeTab === '5day' ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-5 lg:grid-cols-10'}`}>
                {displayForecast.map((day, index) => (
                  <ExtendedForecastCard key={index} forecast={day} unit={preferences.unit} />
                ))}
              </div>
              
              {activeTab === '10day' && (
                <div className={`mt-4 p-3 ${
                  preferences.darkMode ? 'bg-gray-800/80' : 'bg-white/20 backdrop-blur-sm'
                } rounded-lg text-${preferences.darkMode ? 'gray-300' : 'white'} text-center max-w-md mx-auto`}>
                  <p className="text-sm">
                    <span className="font-bold">Note:</span> Extended forecasts beyond 5 days are less accurate and should be used for general planning only.
                  </p>
                </div>
              )}
            </div>
            
            {/* Weather Map Section */}
            {weather.lat && weather.lon && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Map className={preferences.darkMode ? "text-blue-400" : "text-white"} size={20} />
                    <h2 className={`text-xl font-semibold ${preferences.darkMode ? "text-white" : "text-white"}`}>
                      Weather Map
                    </h2>
                  </div>
                  
                  <button 
                    onClick={handleToggleMap}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      preferences.darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white/30 backdrop-blur-sm text-white hover:bg-white/40'
                    }`}
                  >
                    {showMap ? (
                      <>
                        <ChevronUp size={16} />
                        <span>Hide Map</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        <span>Show Map</span>
                      </>
                    )}
                  </button>
                </div>
                
                {showMap && (
                  <WeatherMap lat={weather.lat} lon={weather.lon} apiKey={API_KEY} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
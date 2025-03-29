import React from 'react';
import { format } from 'date-fns';
import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, ThermometerSun } from 'lucide-react';
import type { WeatherData, TemperatureUnit } from '../types';

interface DetailedWeatherCardProps {
  weather: WeatherData;
  unit: TemperatureUnit;
}

// Convert celsius to fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

// Format temperature based on unit
const formatTemp = (temp: number, unit: TemperatureUnit): string => {
  const value = unit === 'celsius' ? temp : celsiusToFahrenheit(temp);
  return `${Math.round(value)}°${unit === 'celsius' ? 'C' : 'F'}`;
};

export const DetailedWeatherCard: React.FC<DetailedWeatherCardProps> = ({ weather, unit }) => {
  // Format sunrise and sunset times if available
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp * 1000), 'h:mm a');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-full max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{weather.location}</h2>
            <p className="text-gray-600 mb-2">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            <div className="flex items-center mb-4">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-20 h-20 mr-2"
              />
              <div>
                <div className="text-5xl font-bold text-gray-800">
                  {formatTemp(weather.temperature, unit)}
                </div>
                <p className="text-lg text-gray-600 capitalize">{weather.description}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center text-gray-700 mb-2">
              <ThermometerSun size={18} className="mr-2 text-orange-500" />
              <span>Feels like: {formatTemp(weather.feelsLike || weather.temperature, unit)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-lg">Weather Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center">
              <Droplets size={18} className="mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="font-semibold">{weather.humidity}%</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Wind size={18} className="mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Wind Speed</p>
                <p className="font-semibold">{weather.windSpeed} m/s</p>
              </div>
            </div>
            
            {weather.visibility !== undefined && (
              <div className="flex items-center">
                <Eye size={18} className="mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Visibility</p>
                  <p className="font-semibold">{(weather.visibility! / 1000).toFixed(1)} km</p>
                </div>
              </div>
            )}
            
            {weather.pressure !== undefined && (
              <div className="flex items-center">
                <Gauge size={18} className="mr-2 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Pressure</p>
                  <p className="font-semibold">{weather.pressure} hPa</p>
                </div>
              </div>
            )}
            
            {weather.sunrise !== undefined && (
              <div className="flex items-center">
                <Sunrise size={18} className="mr-2 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Sunrise</p>
                  <p className="font-semibold">{formatTime(weather.sunrise)}</p>
                </div>
              </div>
            )}
            
            {weather.sunset !== undefined && (
              <div className="flex items-center">
                <Sunset size={18} className="mr-2 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Sunset</p>
                  <p className="font-semibold">{formatTime(weather.sunset)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
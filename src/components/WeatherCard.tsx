import React from 'react';
import { Cloud, Wind, Droplets } from 'lucide-react';
import type { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{weather.location}</h2>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          className="w-16 h-16"
        />
      </div>
      
      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {Math.round(weather.temperature)}°C
        </div>
        <p className="text-gray-600 capitalize">{weather.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Wind className="text-blue-500" size={20} />
          <div>
            <p className="text-sm text-gray-500">Wind Speed</p>
            <p className="font-semibold">{weather.windSpeed} m/s</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-500" size={20} />
          <div>
            <p className="text-sm text-gray-500">Humidity</p>
            <p className="font-semibold">{weather.humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
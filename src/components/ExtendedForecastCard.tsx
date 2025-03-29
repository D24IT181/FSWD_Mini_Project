import React from 'react';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, Droplets, Wind, Shield } from 'lucide-react';
import type { ForecastData, TemperatureUnit } from '../types';

interface ExtendedForecastCardProps {
  forecast: ForecastData;
  unit: TemperatureUnit;
}

// Convert celsius to fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

// Format temperature based on unit
const formatTemp = (temp: number, unit: TemperatureUnit): string => {
  const value = unit === 'celsius' ? temp : celsiusToFahrenheit(temp);
  return `${Math.round(value)}°`;
};

export const ExtendedForecastCard: React.FC<ExtendedForecastCardProps> = ({ forecast, unit }) => {
  // Parse the date string from the API
  const date = new Date(forecast.date);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="text-center mb-2">
          <h3 className="font-semibold text-gray-800">{format(date, 'EEE, MMM d')}</h3>
          <p className="text-xs text-gray-500">{format(date, 'pp')}</p>
        </div>
        
        <div className="flex items-center justify-center mb-2">
          <img 
            src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`} 
            alt={forecast.description}
            className="w-16 h-16"
          />
        </div>
        
        <div className="text-center mb-3">
          <p className="text-xl font-bold text-gray-900">{formatTemp(forecast.temperature, unit)}</p>
          <p className="text-sm text-gray-600 capitalize">{forecast.description}</p>
        </div>
        
        {(forecast.minTemp !== undefined && forecast.maxTemp !== undefined) && (
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <div className="flex items-center">
              <ArrowDown size={16} className="text-blue-500 mr-1" />
              <span>{formatTemp(forecast.minTemp, unit)}</span>
            </div>
            <div className="flex items-center">
              <ArrowUp size={16} className="text-red-500 mr-1" />
              <span>{formatTemp(forecast.maxTemp, unit)}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
          {(forecast.humidity !== undefined) && (
            <div className="flex items-center">
              <Droplets size={14} className="text-blue-500 mr-1" />
              <span>{forecast.humidity}%</span>
            </div>
          )}
          
          {(forecast.windSpeed !== undefined) && (
            <div className="flex items-center">
              <Wind size={14} className="text-gray-500 mr-1" />
              <span>{forecast.windSpeed} m/s</span>
            </div>
          )}
          
          {(forecast.precipitation !== undefined) && (
            <div className="flex items-center">
              <svg 
                viewBox="0 0 24 24" 
                width="14" 
                height="14" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-blue-500 mr-1"
              >
                <path d="M20 16.2A4.5 4.5 0 0019 8.5 6.992 6.992 0 006.46 7 5 5 0 004 16.9h.5a7 7 0 1113.5 0H20z"></path>
                <path d="M12 16v4M8 16v4M16 16v4"></path>
              </svg>
              <span>{forecast.precipitation}%</span>
            </div>
          )}
          
          {(forecast.uvi !== undefined) && (
            <div className="flex items-center">
              <Shield size={14} className="text-purple-500 mr-1" />
              <span>UV: {forecast.uvi.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
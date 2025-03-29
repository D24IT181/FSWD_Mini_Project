import React from 'react';
import { format } from 'date-fns';
import { ArrowRight, Droplets, Wind } from 'lucide-react';
import type { HourlyForecastData, TemperatureUnit } from '../types';

interface HourlyForecastSectionProps {
  hourlyData: HourlyForecastData[];
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

export const HourlyForecastSection: React.FC<HourlyForecastSectionProps> = ({ hourlyData, unit }) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today's Hourly Forecast</h3>
      
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
          {hourlyData.map((hour, index) => {
            const time = new Date(hour.time);
            return (
              <div 
                key={index} 
                className="flex flex-col items-center p-3 rounded-lg min-w-[80px] bg-gray-50 dark:bg-gray-700"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {format(time, 'h a')}
                </span>
                
                <img 
                  src={`https://openweathermap.org/img/wn/${hour.icon}.png`} 
                  alt={hour.description}
                  className="w-10 h-10 my-1"
                />
                
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  {formatTemp(hour.temperature, unit)}
                </span>
                
                {hour.precipitation !== undefined && (
                  <div className="flex items-center mt-1 text-xs text-blue-500">
                    <Droplets size={12} className="mr-1" />
                    <span>{Math.round(hour.precipitation)}%</span>
                  </div>
                )}
                
                {hour.windSpeed !== undefined && (
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Wind size={12} className="mr-1" />
                    <span>{hour.windSpeed} m/s</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {hourlyData.length > 0 && (
            <div className="flex items-center justify-center px-2">
              <ArrowRight className="text-gray-400" size={24} />
            </div>
          )}
        </div>
      </div>
      
      {hourlyData.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>Hourly forecast data not available</p>
        </div>
      )}
    </div>
  );
}; 
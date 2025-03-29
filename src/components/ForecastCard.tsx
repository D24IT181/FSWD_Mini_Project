import React from 'react';
import { format } from 'date-fns';
import type { ForecastData } from '../types';

interface ForecastCardProps {
  forecast: ForecastData;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="font-semibold text-gray-700">
        {format(new Date(forecast.date), 'EEE')}
      </p>
      <img
        src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
        alt={forecast.description}
        className="w-12 h-12 mx-auto"
      />
      <p className="text-lg font-bold text-gray-900">{Math.round(forecast.temperature)}°C</p>
      <p className="text-sm text-gray-600 capitalize">{forecast.description}</p>
    </div>
  );
};
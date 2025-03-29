import React from 'react';
import { MapPin, Thermometer, Moon, Sun } from 'lucide-react';
import type { TemperatureUnit } from '../types';

interface SettingsBarProps {
  onUnitChange: (unit: TemperatureUnit) => void;
  onLocationRequest: () => void;
  unit: TemperatureUnit;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  onUnitChange,
  onLocationRequest,
  unit,
  darkMode,
  onDarkModeToggle
}) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-white/30 backdrop-blur-sm rounded-full p-1 flex items-center space-x-3">
        <button 
          onClick={onLocationRequest}
          className="px-3 py-2 rounded-full bg-white text-blue-600 flex items-center gap-1 hover:bg-blue-50 transition-colors"
          title="Use my location"
        >
          <MapPin size={16} />
          <span className="text-sm">My Location</span>
        </button>
        
        <div className="px-3 py-1 rounded-full bg-white flex items-center">
          <button 
            onClick={() => onUnitChange('celsius')}
            className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
              unit === 'celsius' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
            title="Use Celsius"
          >
            <Thermometer size={14} />
            <span>°C</span>
          </button>
          <button 
            onClick={() => onUnitChange('fahrenheit')}
            className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
              unit === 'fahrenheit' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
            title="Use Fahrenheit"
          >
            <Thermometer size={14} />
            <span>°F</span>
          </button>
        </div>
        
        <button 
          onClick={onDarkModeToggle}
          className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}; 
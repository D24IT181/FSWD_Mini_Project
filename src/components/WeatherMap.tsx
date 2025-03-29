import React, { useState } from 'react';
import { MapPin, Layers } from 'lucide-react';

interface WeatherMapProps {
  lat: number;
  lon: number;
  apiKey: string;
}

type MapLayer = 'temp_new' | 'precipitation_new' | 'clouds_new' | 'wind_new';

export const WeatherMap: React.FC<WeatherMapProps> = ({ lat, lon, apiKey }) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temp_new');
  
  const layers = [
    { id: 'temp_new', name: 'Temperature', color: 'bg-gradient-to-r from-blue-500 to-red-500' },
    { id: 'precipitation_new', name: 'Precipitation', color: 'bg-gradient-to-r from-blue-100 to-blue-700' },
    { id: 'clouds_new', name: 'Clouds', color: 'bg-gradient-to-r from-gray-200 to-gray-700' },
    { id: 'wind_new', name: 'Wind', color: 'bg-gradient-to-r from-green-300 to-green-700' },
  ] as const;
  
  const zoom = 10;
  const mapUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${apiKey}`;
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <MapPin className="mr-2" size={20} />
          Weather Map
        </h3>
        
        <div className="flex items-center space-x-2">
          <Layers size={16} className="text-gray-500 mr-1" />
          <div className="text-sm text-gray-500 dark:text-gray-400">Layers:</div>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-900 p-2 flex flex-wrap gap-2 justify-center">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`px-3 py-1 rounded text-sm ${
              activeLayer === layer.id 
                ? 'ring-2 ring-blue-500 font-semibold' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            } ${layer.color} text-white`}
          >
            {layer.name}
          </button>
        ))}
      </div>
      
      <div className="relative overflow-hidden" style={{ height: '400px' }}>
        {/* Option 1: Using OpenLayers (would require adding the library) */}
        {/* <div id="map" style={{ width: '100%', height: '100%' }}></div> */}
        
        {/* Option 2: Using an iframe with OpenStreetMap */}
        <iframe
          src={`https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${activeLayer}&lat=${lat}&lon=${lon}&zoom=${zoom}`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Weather Map"
          allowFullScreen
        />
        
        {/* Option 3: Show note that map requires API key with additional subscription */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs text-center">
          <p>Note: Some weather layers may require additional OpenWeather subscription</p>
        </div>
      </div>
    </div>
  );
}; 
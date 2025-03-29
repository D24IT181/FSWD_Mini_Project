import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import type { CityData } from '../types';

interface SearchBarProps {
  onSearch: (city: string) => void;
  apiKey: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, apiKey }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      // Check if API key is actually defined and not the placeholder
      if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'REPLACE_WITH_YOUR_OPENWEATHER_API_KEY') {
        setError('Please set your OpenWeather API key in the .env file (VITE_OPENWEATHER_API_KEY=your_key)');
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const testResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`
        );
        
        if (testResponse.status === 401) {
          throw new Error('Invalid API key. Please create your own OpenWeather API key at openweathermap.org');
        }
        
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          
          if (response.status === 401) {
            throw new Error('Invalid API key. Please create your own OpenWeather API key at openweathermap.org');
          } else if (response.status === 404) {
            throw new Error('No cities found matching your search.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please try again later.');
          } else {
            throw new Error(`API Error: ${response.statusText}`);
          }
        }
        
        const data: CityData[] = await response.json();
        
        if (data.length === 0) {
          setError('No cities found matching your search.');
          setSuggestions([]);
        } else {
          setSuggestions(data);
          setError(null);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: CityData) => {
    const cityName = suggestion.state 
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    setQuery(cityName);
    onSearch(cityName);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchContainerRef} className="w-full max-w-md relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for a city..."
            className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {showSuggestions && (query.length >= 2) && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-10">
          {isLoading ? (
            <div className="p-3 text-gray-500 text-center">Loading suggestions...</div>
          ) : error ? (
            <div className="p-3 text-red-500 text-center">{error}</div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="font-medium">{suggestion.name}</span>
                  {suggestion.state && <span className="text-gray-600">, {suggestion.state}</span>}
                  <span className="text-gray-600">, {suggestion.country}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-gray-500 text-center">No cities found</div>
          )}
        </div>
      )}
    </div>
  );
};
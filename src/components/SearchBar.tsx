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
    <div className="flex justify-center items-center w-full">
      <div ref={searchContainerRef} className="relative w-full max-w-md">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city..."
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.name}-${suggestion.country}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {suggestion.name}, {suggestion.country}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ApiKeyHelper = () => {
  return (
    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">API Key Required</h2>
          <p className="text-gray-600 mb-4">
            This weather app requires a valid OpenWeather API key to function.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Get your own free API key:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Go to <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenWeatherMap.org</a></li>
          <li>Create a free account</li>
          <li>Navigate to the API Keys section in your account</li>
          <li>Copy your API key</li>
          <li>Update your project's .env file with:
            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
              VITE_OPENWEATHER_API_KEY=your_api_key_here
            </pre>
          </li>
          <li>Restart the development server</li>
        </ol>
        
        <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-800">
          <p><strong>Note:</strong> New API keys may take a few hours to activate. If you get an "Invalid API key" error after creating a new key, please wait a few hours and try again.</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyHelper; 
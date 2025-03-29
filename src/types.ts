export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
  sunrise?: number;
  sunset?: number;
  lat?: number;
  lon?: number;
}

export interface ForecastData {
  date: string;
  temperature: number;
  description: string;
  icon: string;
  minTemp?: number;
  maxTemp?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  uvi?: number;
}

export interface HourlyForecastData {
  time: string;
  temperature: number;
  icon: string;
  description: string;
  precipitation?: number;
  windSpeed?: number;
}

export interface WeatherAlert {
  senderName: string;
  event: string;
  start: number;
  end: number;
  description: string;
  severity?: string;
}

export interface CityData {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface UserPreferences {
  unit: TemperatureUnit;
  darkMode: boolean;
}
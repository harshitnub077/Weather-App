"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Loader2, Wind, Droplets, Compass } from 'lucide-react';
import { searchLocation, getWeatherData, getWikipediaSummary, getWeatherDetails, reverseGeocode, LocationData, CurrentWeather, DailyForecast } from '@/lib/api';
import * as LucideIcons from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" /> });

export default function WeatherView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<{current: CurrentWeather, daily: DailyForecast} | null>(null);
  const [wiki, setWiki] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setError('');
    try {
      const locs = await searchLocation(query);
      if (locs.length === 0) {
        throw new Error('City not found. Please try a different location.');
      }
      const loc = locs[0];
      setLocation(loc);
      await fetchAllData(loc.lat, loc.lon, loc.name);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const name = await reverseGeocode(lat, lon);
          const loc = { name, lat, lon, country: '' };
          setLocation(loc);
          setQuery(name);
          await fetchAllData(lat, lon, name);
        } catch (err: any) {
          setError('Failed to fetch weather for your location.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Unable to retrieve your location. Please check permissions.');
        setLoading(false);
      }
    );
  };

  const fetchAllData = async (lat: number, lon: number, name: string) => {
    try {
      const [weatherData, wikiData] = await Promise.all([
        getWeatherData(lat, lon),
        getWikipediaSummary(name)
      ]);
      setWeather(weatherData);
      setWiki(wikiData);
    } catch (error) {
      throw new Error('Weather API failed to respond.');
    }
  };

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <Icon className={className} />;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter city, zip code, or landmark..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-200/60 dark:border-white/5 bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md focus:ring-1 focus:ring-blue-500/50 outline-none transition-all shadow-sm font-medium"
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={18} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={loading}
          className="bg-white/50 hover:bg-white dark:bg-[#1a1a1a]/50 dark:hover:bg-[#1a1a1a] backdrop-blur-md border border-gray-200/60 dark:border-white/5 text-gray-800 dark:text-gray-200 px-5 py-3.5 rounded-full font-medium transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          title="Use current location"
        >
          <MapPin size={18} />
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium backdrop-blur-sm">
          {error}
        </div>
      )}

      {location && weather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

          <div className="lg:col-span-2 bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl rounded-3xl shadow-sm p-8 border border-gray-200/50 dark:border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{location.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{location.admin1 ? `${location.admin1}, ` : ''}{location.country}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Weather</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(weather.current.time).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between mt-10 gap-8">
              <div className="flex items-center gap-6">
                {renderIcon(getWeatherDetails(weather.current.weathercode).icon, "w-20 h-20 text-gray-800 dark:text-gray-200")}
                <div>
                  <span className="text-7xl font-bold tracking-tighter">{weather.current.temperature}°</span>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mt-1">
                    {getWeatherDetails(weather.current.weathercode).description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-white/40 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50 dark:border-white/5">
                  <Wind className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wind</p>
                    <p className="font-semibold">{weather.current.windspeed} km/h</p>
                  </div>
                </div>
                <div className="bg-white/40 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50 dark:border-white/5">
                  <Compass className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</p>
                    <p className="font-semibold">{weather.current.winddirection}°</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-12">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {weather.daily.time.slice(1, 6).map((time, idx) => {
                  const details = getWeatherDetails(weather.daily.weathercode[idx + 1]);
                  return (
                    <div key={time} className="bg-white/30 dark:bg-white/5 p-4 rounded-2xl text-center border border-gray-100/50 dark:border-white/5 transition-transform hover:scale-105 duration-300">
                      <p className="text-xs font-semibold mb-3 text-gray-500 uppercase">{new Date(time).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                      <div className="flex justify-center mb-3">
                        {renderIcon(details.icon, "w-6 h-6 text-gray-700 dark:text-gray-300")}
                      </div>
                      <div className="flex justify-center gap-2 text-sm">
                        <span className="font-bold">{weather.daily.temperature_2m_max[idx + 1]}°</span>
                        <span className="text-gray-400">{weather.daily.temperature_2m_min[idx + 1]}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl rounded-3xl shadow-sm p-4 border border-gray-200/50 dark:border-white/5 overflow-hidden">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-2 flex items-center gap-2"><MapPin size={14}/> Map</h3>
              <div className="rounded-2xl overflow-hidden shadow-inner">
                <Map lat={location.lat} lon={location.lon} name={location.name} />
              </div>
            </div>

            <div className="bg-white/60 dark:bg-[#111]/60 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-200/50 dark:border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">About {location.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {wiki}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

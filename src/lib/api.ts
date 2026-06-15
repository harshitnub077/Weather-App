export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
  isDay: boolean;
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

// 1. Geocoding API (OpenStreetMap Nominatim)
export async function searchLocation(query: string): Promise<LocationData[]> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country || '',
      admin1: item.address?.state || ''
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 2. Reverse Geocoding (Lat/Lon to Name)
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.name || 'Unknown Location';
  } catch (error) {
    return 'Unknown Location';
  }
}

// 3. Open-Meteo Current & Forecast
export async function getWeatherData(lat: number, lon: number): Promise<{ current: CurrentWeather, daily: DailyForecast }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API failed');
  const data = await res.json();
  return {
    current: {
      ...data.current_weather,
      isDay: data.current_weather.is_day === 1
    },
    daily: data.daily
  };
}

// 4. Open-Meteo Historical
export async function getHistoricalWeather(lat: number, lon: number, startDate: string, endDate: string) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Historical Weather API failed');
  const data = await res.json();
  
  // Calculate averages over the period
  const daily = data.daily;
  if (!daily || !daily.temperature_2m_mean) {
    throw new Error('No data available for this range');
  }

  const avgTemp = daily.temperature_2m_mean.reduce((a: number, b: number) => a + b, 0) / daily.temperature_2m_mean.length;
  const maxTemp = Math.max(...daily.temperature_2m_max);
  const minTemp = Math.min(...daily.temperature_2m_min);

  return { avgTemp, maxTemp, minTemp };
}

// 5. Wikipedia Summary
export async function getWikipediaSummary(locationName: string): Promise<string> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`);
    if (!res.ok) return 'No historical or geographical summary available for this location.';
    const data = await res.json();
    return data.extract || 'No historical or geographical summary available for this location.';
  } catch (error) {
    return 'No historical or geographical summary available for this location.';
  }
}

// Map Weather Codes to standard descriptions and icons
export function getWeatherDetails(code: number) {
  const codeMap: Record<number, { description: string, icon: string }> = {
    0: { description: 'Clear sky', icon: 'Sun' },
    1: { description: 'Mainly clear', icon: 'CloudSun' },
    2: { description: 'Partly cloudy', icon: 'Cloud' },
    3: { description: 'Overcast', icon: 'Cloud' },
    45: { description: 'Fog', icon: 'CloudFog' },
    48: { description: 'Depositing rime fog', icon: 'CloudFog' },
    51: { description: 'Light drizzle', icon: 'CloudDrizzle' },
    53: { description: 'Moderate drizzle', icon: 'CloudDrizzle' },
    55: { description: 'Dense drizzle', icon: 'CloudDrizzle' },
    61: { description: 'Slight rain', icon: 'CloudRain' },
    63: { description: 'Moderate rain', icon: 'CloudRain' },
    65: { description: 'Heavy rain', icon: 'CloudRain' },
    71: { description: 'Slight snow', icon: 'CloudSnow' },
    73: { description: 'Moderate snow', icon: 'CloudSnow' },
    75: { description: 'Heavy snow', icon: 'CloudSnow' },
    95: { description: 'Thunderstorm', icon: 'CloudLightning' },
    96: { description: 'Thunderstorm with slight hail', icon: 'CloudLightning' },
    99: { description: 'Thunderstorm with heavy hail', icon: 'CloudLightning' },
  };
  return codeMap[code] || { description: 'Unknown', icon: 'HelpCircle' };
}

import { Search, House, MapPin, X, Droplet, Wind, Sun, Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Times from './time';
import { getWeatherImage, getDescription } from './unity';
import { GitGraphIcon } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherIcon = ({ code, time, size = 24 }) => {
  const isDay = new Date(time).getHours() > 6 && new Date(time).getHours() < 18;
  
  const icons = {
    0: <Sun size={size} className="text-yellow-400" />, // Clear sky
    1: <Sun size={size} className="text-yellow-400" />, // Mainly clear
    2: <Cloud size={size} className="text-gray-300" />, // Partly cloudy
    3: <Cloud size={size} className="text-gray-400" />, // Overcast
    45: <Cloud size={size} className="text-gray-500" />, // Fog
    48: <Cloud size={size} className="text-gray-500" />, // Fog
    51: <CloudRain size={size} className="text-blue-300" />, // Drizzle
    53: <CloudRain size={size} className="text-blue-400" />, // Drizzle
    55: <CloudRain size={size} className="text-blue-500" />, // Drizzle
    56: <CloudRain size={size} className="text-blue-300" />, // Freezing drizzle
    57: <CloudRain size={size} className="text-blue-400" />, // Freezing drizzle
    61: <CloudRain size={size} className="text-blue-400" />, // Rain
    63: <CloudRain size={size} className="text-blue-500" />, // Rain
    65: <CloudRain size={size} className="text-blue-600" />, // Rain
    66: <CloudRain size={size} className="text-blue-300" />, // Freezing rain
    67: <CloudRain size={size} className="text-blue-400" />, // Freezing rain
    71: <CloudSnow size={size} className="text-blue-200" />, // Snow
    73: <CloudSnow size={size} className="text-blue-300" />, // Snow
    75: <CloudSnow size={size} className="text-blue-400" />, // Snow
    77: <CloudSnow size={size} className="text-blue-300" />, // Snow grains
    80: <CloudRain size={size} className="text-blue-400" />, // Rain showers
    81: <CloudRain size={size} className="text-blue-500" />, // Rain showers
    82: <CloudRain size={size} className="text-blue-600" />, // Rain showers
    85: <CloudSnow size={size} className="text-blue-300" />, // Snow showers
    86: <CloudSnow size={size} className="text-blue-400" />, // Snow showers
    95: <Zap size={size} className="text-yellow-500" />, // Thunderstorm
    96: <Zap size={size} className="text-yellow-500" />, // Thunderstorm with hail
    99: <Zap size={size} className="text-yellow-600" />, // Thunderstorm with hail
  };

  return icons[code] || <Sun size={size} className={isDay ? "text-yellow-400" : "text-gray-400"} />;
};

export function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherdata, setWeatherData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [active, setActive] = useState('Home');
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // For 5-day forecast

  // Current date display
  const currentDate = useMemo(() => {
    const date = new Date();
    return {
      day: date.getDate(),
      dayOfWeek: date.toLocaleString('en-US', { weekday: 'short' }),
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  }, []);

  // Generate 5-day forecast dates
  const forecastDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        day: date.getDate(),
        dayOfWeek: date.toLocaleString('en-US', { weekday: 'short' }),
        month: date.toLocaleString('en-US', { month: 'short' }),
        dateObj: date
      });
    }
    return dates;
  }, []);

  // Format time for chart
  const formatTime = (time) => {
    const date = new Date(time);
    return date.getHours().toString().padStart(2, '0') + ':00';
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!weatherdata?.hourly) return null;
    
    return {
      labels: weatherdata.hourly.time.slice(0, 24).map(formatTime),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: weatherdata.hourly.temperature_2m.slice(0, 24),
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#93c5fd',
          pointBorderColor: '#60a5fa',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [weatherdata]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}°C`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: { 
          color: '#94a3b8',
          font: {
            size: 10
          }
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: { 
          color: '#94a3b8',
          font: {
            size: 10
          },
          callback: (value) => `${value}°`
        },
      },
    },
  };

  // Fetch weather data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get user location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });

        // Fetch weather data
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min`
        );
        const weatherData = await weatherResponse.json();

        // Fetch location data
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'User-Agent': 'WeatherApp/1.0' } }
        );
        const cityData = await cityResponse.json();

        setWeatherData(weatherData);
        setCityData(
          cityData.address?.city || 
          cityData.address?.town || 
          cityData.address?.village || 
          cityData.address?.county || 
          'Your Location'
        );
        setCountryData(cityData.address?.country || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Unable to load weather data. Showing sample data.');
        
        // Fallback data
        setWeatherData({
          current_weather: {
            temperature: 22.5,
            windspeed: 8.3,
            winddirection: 195,
            weathercode: 1,
            time: new Date().toISOString()
          },
          hourly: {
            time: Array.from({ length: 24 }, (_, i) => 
              new Date(Date.now() + i * 3600000).toISOString()
            ),
            temperature_2m: Array.from({ length: 24 }, (_, i) => 
              20 + Math.sin(i / 3) * 5
            ),
            weather_code: Array.from({ length: 24 }, (_, i) => 
              [0, 1, 2, 3][i % 4]
            )
          },
          daily: {
            time: Array.from({ length: 5 }, (_, i) => 
              new Date(Date.now() + i * 86400000).toISOString()
            ),
            temperature_2m_max: Array.from({ length: 5 }, (_, i) => 
              22 + Math.sin(i) * 3
            ),
            temperature_2m_min: Array.from({ length: 5 }, (_, i) => 
              15 + Math.sin(i) * 2
            ),
            weather_code: Array.from({ length: 5 }, (_, i) => 
              [0, 1, 2, 3, 1][i]
            )
          }
        });
        setCityData('Sample City');
        setCountryData('Sample Country');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle city search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0' } }
      );
      const data = await response.json();
      
      if (data.length === 0) {
        setError('Location not found');
        return;
      }

      const { lat, lon, display_name } = data[0];
      const newCoords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      
      setCoordinates(newCoords);
      setCityData(display_name.split(',')[0]);
      setCountryData(display_name.split(',').pop().trim());
      setActiveSearch(false);
      setSearchQuery('');

      // Fetch new weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${newCoords.latitude}&longitude=${newCoords.longitude}&hourly=temperature_2m,weather_code&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min`
      );
      setWeatherData(await weatherResponse.json());
      setError('');
    } catch (err) {
      setError('Failed to search location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items
  const navItems = [
    { id: 'Home', label: 'Home', icon: <House size={20} /> },
    { id: 'Map', label: 'Map', icon: <MapPin size={20} /> },
    { id: 'Predict', label: 'Predict', icon: <GitGraphIcon size={20} /> },
  ];

  return (
    <div className="w-full min-h-screen custom-bg text-slate-100 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-20 h-screen bg-slate-800/50 backdrop-blur-lg border-r border-slate-700/50 flex-col items-center py-8 space-y-8">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WP
          </div>
          
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`p-3 rounded-xl transition-all ${active === item.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'hover:bg-slate-700/50 text-slate-300'}`}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
          
          <div className="flex-1"></div>
          
          <button 
            onClick={() => setActiveSearch(true)}
            className="p-3 rounded-xl hover:bg-slate-700/50 text-slate-300"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-4 bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WEATHERPULSE
          </div>
          <button 
            onClick={() => setActiveSearch(true)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {active === 'Home' && (
            <div className="space-y-6">
              {/* Current Weather Card */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{cityData}</h2>
                      <p className="text-slate-400">{countryData}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300">{currentDate.fullDate}</p>
                      </div>
                  </div>

                  {weatherdata?.current_weather ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Main Weather Display */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="w-32 h-32 flex items-center justify-center">
                            {getWeatherImage(
                              weatherdata.current_weather.weathercode,
                              weatherdata.current_weather.time
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-slate-700/80 backdrop-blur-sm rounded-full p-2 border border-slate-600/50 shadow-md">
                            <WeatherIcon 
                              code={weatherdata.current_weather.weathercode} 
                              time={weatherdata.current_weather.time} 
                              size={20} 
                            />
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-5xl font-bold">
                            {weatherdata.current_weather.temperature.toFixed(1)}°
                          </p><p className="text-md font-bold text-slate-500">{weatherdata?.current_weather && getDescription(weatherdata.current_weather.weathercode)}</p>
                    
                          <p className="text-slate-400">Feels like {weatherdata.current_weather.temperature.toFixed(1)}°</p>
                        </div>
                      </div>

                      {/* Weather Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 flex items-center space-x-3">
                          <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Wind size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Wind</p>
                            <p className="font-semibold">{weatherdata.current_weather.windspeed} km/h</p>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 flex items-center space-x-3">
                          <div className="bg-purple-500/20 p-2 rounded-lg">
                            <Droplet size={20} className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Humidity</p>
                            <p className="font-semibold">65%</p>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 flex items-center space-x-3">
                          <div className="bg-amber-500/20 p-2 rounded-lg">
                            <Wind size={20} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Direction</p>
                            <p className="font-semibold">{weatherdata.current_weather.winddirection}°</p>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 flex items-center space-x-3">
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Sun size={20} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">UV Index</p>
                            <p className="font-semibold">3.5</p>
                          </div>
                        </div>
                      </div>

                      {/* Hourly Forecast Summary */}
                      <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
                        <h3 className="font-medium mb-3 text-slate-300">Today's Forecast</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                          {weatherdata?.hourly?.time.slice(0, 12).map((time, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[50px]">
                              <p className="text-xs text-slate-400">{formatTime(time)}</p>
                              <div className="my-1">
                                <WeatherIcon 
                                  code={weatherdata.hourly.weather_code[i]} 
                                  time={time} 
                                  size={20} 
                                />
                              </div>
                              <p className="text-sm font-medium">
                                {weatherdata.hourly.temperature_2m[i]}°
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {error || 'Loading weather data...'}
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Day Forecast */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h3 className="font-bold text-lg mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {forecastDates.map((date, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(i)}
                      className={`p-3 rounded-xl transition-all ${selectedDay === i ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30'}`}
                    >
                      <div className="flex flex-col items-center">
                        <p className="text-sm font-medium">
                          {i === 0 ? 'Today' : date.dayOfWeek}
                        </p>
                        <p className="text-xs text-slate-400">
                          {date.day} {date.month}
                        </p>
                        <div className="my-2">
                          {weatherdata?.daily && (
                            <WeatherIcon 
                              code={weatherdata.daily.weather_code[i]} 
                              time={date.dateObj.toISOString()} 
                              size={24} 
                            />
                          )}
                        </div>
                        {weatherdata?.daily && (
                          <div className="flex space-x-2">
                            <p className="text-sm font-semibold">
                              {weatherdata.daily.temperature_2m_max[i]}°
                            </p>
                            <p className="text-sm text-slate-400">
                              {weatherdata.daily.temperature_2m_min[i]}°
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Chart */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Temperature</h3>
                    <div className="flex space-x-2">
                      <button className="text-xs px-2 py-1 bg-slate-700/50 rounded-lg">24h</button>
                      <button className="text-xs px-2 py-1 bg-slate-700/20 rounded-lg">Week</button>
                    </div>
                  </div>
                  <div className="h-64">
                    {chartData ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        No chart data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Hourly Forecast */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  <h3 className="font-bold mb-4">Hourly Forecast</h3>
                  {weatherdata?.hourly ? (
                    <Times
                      hourlyTimes={weatherdata.hourly.time.slice(0, 24)}
                      temperatures={weatherdata.hourly.temperature_2m.slice(0, 24)}
                      weatherCode={weatherdata.hourly.weather_code.slice(0, 24)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      No hourly data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Map View */}
          {active === 'Map' && coordinates && (
            <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-48px)] bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl">
              <MapContainer
                center={[coordinates.latitude, coordinates.longitude]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="rounded-2xl"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[coordinates.latitude, coordinates.longitude]}>
                  <Popup className="font-sans">
                    <div className="text-sm font-medium">{cityData}</div>
                    <div className="text-xs text-slate-500">{countryData}</div>
                    {weatherdata?.current_weather && (
                      <div className="mt-1 flex items-center">
                        <WeatherIcon 
                          code={weatherdata.current_weather.weathercode} 
                          time={weatherdata.current_weather.time} 
                          size={16} 
                          className="mr-1"
                        />
                        <span>{weatherdata.current_weather.temperature.toFixed(1)}°C</span>
                      </div>
                    )}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* Predict View */}
          {active === 'Predict' && (
            <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-48px)] flex items-center justify-center bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
              <div className="text-center p-6 max-w-md">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mb-6 inline-block">
                  <GitGraphIcon size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Weather Prediction</h2>
                <p className="text-slate-400 mb-6">
                  Our advanced prediction models are coming soon to help you plan better.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Notify Me When Ready
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg border-t border-slate-700/50 flex justify-around py-3 z-20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex flex-col items-center p-2 ${active === item.id ? 'text-blue-400' : 'text-slate-300'}`}
          >
            <div className={`p-2 rounded-lg ${active === item.id ? 'bg-blue-500/20' : ''}`}>
              {item.icon}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Search Modal */}
      {activeSearch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Search Location</h3>
              <button
                onClick={() => setActiveSearch(false)}
                className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city or location..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Search
              </button>
            </form>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="mt-4 text-sm text-slate-400">
              <p>Try searching for:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['New York', 'London', 'Tokyo', 'Paris', 'Sydney'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSearchQuery(city);
                      // Optionally trigger search immediately
                      // handleSearch({ preventDefault: () => {} });
                    }}
                    className="px-3 py-1 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-300 animate-pulse">Loading weather data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
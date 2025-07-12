import { Search, MapPin, Droplet, Wind, Thermometer, Gauge, Navigation } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Times from './time';
import { getWeatherImage, getDescription } from './unity';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Configure Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Home() {
  // State management
  const [weather, setWeather] = useState({
    data: {
      current_weather: {
        temperature: 0,
        windspeed: 0,
        winddirection: 0,
        weathercode: 0,
        time: new Date().toISOString()
      },
      hourly: {
        time: [],
        temperature_2m: [],
        weather_code: []
      }
    },
    loading: true,
    error: '',
    location: {
      coordinates: null,
      city: 'Loading...',
      country: ''
    }
  });

  const [ui, setUi] = useState({
    activeView: 'dashboard',
    searchOpen: false,
    searchQuery: ''
  });

  // Fetch weather data on mount
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Fetch weather data
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&current_weather=true`
        );
        const weatherData = await weatherResponse.json();

        // Fetch location data
        const locationResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'User-Agent': 'WeatherApp/1.0' } }
        );
        const locationData = await locationResponse.json();

        setWeather({
          data: weatherData,
          loading: false,
          error: '',
          location: {
            coordinates: { latitude, longitude },
            city: locationData.address?.city || locationData.address?.town || "Current Location",
            country: locationData.address?.country || ""
          }
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: "Couldn't fetch live data. Using sample data.",
        }));
      }
    };

    fetchWeatherData();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ui.searchQuery.trim()) return;

    try {
      setWeather(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ui.searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0' } }
      );
      const data = await response.json();
      
      if (data.length === 0) {
        setWeather(prev => ({ ...prev, error: "Location not found", loading: false }));
        return;
      }

      const { lat, lon, display_name } = data[0];
      const newCoords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${newCoords.latitude}&longitude=${newCoords.longitude}&hourly=temperature_2m,weather_code&current_weather=true`
      );
      const weatherData = await weatherResponse.json();

      setWeather({
        data: weatherData,
        loading: false,
        error: '',
        location: {
          coordinates: newCoords,
          city: display_name.split(',')[0],
          country: display_name.split(',').pop().trim()
        }
      });

      setUi(prev => ({ ...prev, searchOpen: false, searchQuery: '' }));

    } catch (error) {
      setWeather(prev => ({ ...prev, error: "Search failed", loading: false }));
    }
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!weather.data?.hourly?.time.length) return null;

    return {
      labels: weather.data.hourly.time
        .slice(0, 24)
        .map(time => new Date(time).getHours().toString().padStart(2, '0') + ':00'),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: weather.data.hourly.temperature_2m.slice(0, 24),
          borderColor: 'rgba(59, 130, 246, 0.8)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [weather.data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  // Weather metrics
  const weatherMetrics = [
    {
      icon: <Thermometer size={20} />,
      label: 'Feels Like',
      value: `${weather.data.current_weather.temperature}°C`
    },
    {
      icon: <Wind size={20} />,
      label: 'Wind',
      value: `${weather.data.current_weather.windspeed} km/h`
    },
    {
      icon: <Navigation size={20} style={{ 
        transform: `rotate(${weather.data.current_weather.winddirection}deg)` 
      }} />,
      label: 'Direction',
      value: `${weather.data.current_weather.winddirection}°`
    },
    {
      icon: <Droplet size={20} />,
      label: 'Humidity',
      value: '65%' // Would come from API if available
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              <path fill="currentColor" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">WeatherPulse</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setUi(prev => ({ ...prev, searchOpen: true }))}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Search location"
          >
            <Search size={20} />
          </button>
          <div className="text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-6xl mx-auto">
        {/* Current Weather Card */}
        <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{weather.location.city}</h2>
              <p className="text-gray-300">{weather.location.country}</p>
              <p className="text-sm text-gray-400 mt-1">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <div className="text-center mr-6">
                <div className="text-5xl font-bold">
                  {weather.data.current_weather.temperature}°C
                </div>
                <div className="text-lg capitalize">
                  {getDescription(weather.data.current_weather.weathercode)}
                </div>
              </div>
              
              <div className="w-24 h-24">
                {getWeatherImage(
                  weather.data.current_weather.weathercode,
                  weather.data.current_weather.time
                )}
              </div>
            </div>
          </div>

          {/* Weather Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {weatherMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-800/50 p-3 rounded-lg flex items-center space-x-3">
                <div className="text-blue-400">
                  {metric.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="font-medium">{metric.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
          {weather.data.hourly.time.length > 0 ? (
            <Times
              hourlyTimes={weather.data.hourly.time.slice(0, 24)}
              temperatures={weather.data.hourly.temperature_2m.slice(0, 24)}
              weatherCode={weather.data.hourly.weather_code.slice(0, 24)}
            />
          ) : (
            <div className="text-center py-8 text-gray-400">
              Hourly data not available
            </div>
          )}
        </div>

        {/* Charts */}
        {chartData && (
          <div className="bg-gray-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">24-Hour Forecast</h3>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Map View */}
        {ui.activeView === 'map' && weather.location.coordinates && (
          <div className="bg-gray-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-gray-700 h-96 mt-6">
            <h3 className="text-lg font-semibold mb-4">Location Map</h3>
            <MapContainer
              center={[weather.location.coordinates.latitude, weather.location.coordinates.longitude]}
              zoom={12}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[weather.location.coordinates.latitude, weather.location.coordinates.longitude]}>
                <Popup>{weather.location.city}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex justify-around py-3">
        <button 
          onClick={() => setUi(prev => ({ ...prev, activeView: 'dashboard' }))}
          className={`flex flex-col items-center p-2 ${ui.activeView === 'dashboard' ? 'text-blue-400' : 'text-gray-400'}`}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
          </svg>
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        
        <button 
          onClick={() => setUi(prev => ({ ...prev, activeView: 'map' }))}
          className={`flex flex-col items-center p-2 ${ui.activeView === 'map' ? 'text-blue-400' : 'text-gray-400'}`}
        >
          <MapPin size={24} />
          <span className="text-xs mt-1">Map</span>
        </button>
      </nav>

      {/* Search Modal */}
      {ui.searchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden">
            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <input
                  type="text"
                  value={ui.searchQuery}
                  onChange={(e) => setUi(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="Search city or location..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUi(prev => ({ ...prev, searchOpen: false, searchQuery: '' }))}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {weather.loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-medium">Loading Weather Data</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {weather.error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <span>{weather.error}</span>
        </div>
      )}
    </div>
  );
}
import { Search, House, MapPin, X } from 'lucide-react';
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

export function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [isHovering2, setIsHovering2] = useState(false);
  const [isHovering5, setIsHovering5] = useState(false);
  const [isHovering7, setIsHovering7] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherdata, setWeatherData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [active, setActive] = useState('Home');
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Current date display
  const currentDate = useMemo(() => {
    const date = new Date();
    return {
      day: date.getDate(),
      dayOfWeek: date.toLocaleString('en-US', { weekday: 'short' }),
      month: date.toLocaleString('en-US', { month: 'long' }),
      year: date.getFullYear()
    };
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
          label: 'Temp (°C)',
          data: weatherdata.hourly.temperature_2m.slice(0, 24),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(30, 58, 138, 0.35)',
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
        position: 'top',
        labels: { color: 'white', font: { size: 10 } },
      },
      title: {
        display: true,
        text: 'Hourly Temp',
        color: 'white',
        font: { size: 12 },
      },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: { color: 'white', maxTicksLimit: 6, font: { size: 10 } },
      },
      y: {
        title: { display: false },
        ticks: { color: 'white', font: { size: 10 } },
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
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&current_weather=true`
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
        `https://api.open-meteo.com/v1/forecast?latitude=${newCoords.latitude}&longitude=${newCoords.longitude}&hourly=temperature_2m,weather_code&current_weather=true`
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
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 to-blue-950 overflow-hidden p-2">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-2 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md rounded-xl p-3 flex-col items-center space-y-4 z-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`p-2 rounded-lg transition-all ${active === item.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
        <button 
          onClick={() => setActiveSearch(true)}
          className="p-2 rounded-lg hover:bg-white/10"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="h-full w-full md:pl-14 flex flex-col space-y-3 overflow-y-auto">
        {/* Weather Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h1 className="font-bold text-lg">WEATHERPULSE</h1>
            <p className="text-sm">
              {currentDate.dayOfWeek}, {currentDate.day} {currentDate.month}, {currentDate.year}
            </p>
          </div>

          {weatherdata?.current_weather ? (
            <div className="flex flex-col items-center">
              {/* Location */}
              <div className="flex items-center mb-3">
                <MapPin className="mr-2" />
                <div>
                  <p className="font-bold">{cityData}</p>
                  <p className="text-sm opacity-80">{countryData}</p>
                </div>
              </div>

              {/* Weather Icon and Description */}
              <div className="flex flex-col items-center my-2">
                <div className="w-16 h-16">
                  {getWeatherImage(
                    weatherdata.current_weather.weathercode,
                    weatherdata.current_weather.time
                  )}
                </div>
                <p className="text-lg font-semibold text-blue-200 mt-1">
                  {getDescription(weatherdata.current_weather.weathercode)}
                </p>
              </div>

              {/* Temperature */}
              <p className="text-4xl font-bold my-2">
                {weatherdata.current_weather.temperature.toFixed(1)}°C
              </p>

              {/* Wind Info */}
              <div className="flex justify-around w-full mt-3">
                <div className="text-center">
                  <p className="font-bold">
                    {weatherdata.current_weather.winddirection}°
                  </p>
                  <p className="text-xs opacity-80">Wind Direction</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">
                    {weatherdata.current_weather.windspeed} km/h
                  </p>
                  <p className="text-xs opacity-80">Wind Speed</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {error || 'Loading weather data...'}
            </div>
          )}
        </div>

        {/* Forecast Section */}
        {active === 'Home' && (
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            {/* Hourly Forecast */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold mb-3">Hourly Forecast</h2>
              {weatherdata?.hourly ? (
                <Times
                  hourlyTimes={weatherdata.hourly.time.slice(0, 24)}
                  temperatures={weatherdata.hourly.temperature_2m.slice(0, 24)}
                  weatherCode={weatherdata.hourly.weather_code.slice(0, 24)}
                />
              ) : (
                <p>No hourly data available</p>
              )}
            </div>

            {/* Temperature Chart */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold mb-3">Temperature Trend</h2>
              <div className="h-64">
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <p>No chart data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Map View */}
        {active === 'Map' && coordinates && (
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <MapContainer
              center={[coordinates.latitude, coordinates.longitude]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[coordinates.latitude, coordinates.longitude]}>
                <Popup>{cityData}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Predict View */}
        {active === 'Predict' && (
          <div className="flex-1 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
            <div className="text-center p-4">
              <h2 className="text-xl font-bold mb-2">Weather Prediction</h2>
              <p>This feature is coming soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/10 flex justify-around py-2 z-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex flex-col items-center p-2 ${active === item.id ? 'text-blue-300' : 'text-white'}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={() => setActiveSearch(true)}
          className="flex flex-col items-center p-2"
        >
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
      </div>

      {/* Search Modal */}
      {activeSearch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 w-full max-w-md backdrop-blur-md">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </form>
            <button
              onClick={() => setActiveSearch(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              aria-label="Close search"
            >
              <X size={24} />
            </button>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <div className="w-24 h-24 bg-white/20 rounded-full"></div>
            </div>
            <p className="mt-4 text-white">Loading weather data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
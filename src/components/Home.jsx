// src/Home.jsx
import {
  Search,
  House,
  MapPin,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Times from './time';
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

const formatTime = (time) => {
  const date = new Date(time);
  return date.getHours().toString().padStart(2, '0') + ':00';
};

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

  useEffect(() => {
    const fakeData = {
      current: {
        temperature_2m: 15.0,
        wind_speed_10m: 10,
        wind_direction_10m: 180,
        weather_code: 0,
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, i) =>
          new Date(Date.UTC(2025, 4, 3, i)).toISOString(),
        temperature_2m: Array.from({ length: 24 }, (_, i) => (15 + i * 0.5).toFixed(1)),
        weather_code: Array.from({ length: 24 }, (_, i) => [0, 1, 2, 3, 51, 61, 71, 73, 95, 96][i % 10]),
      },
    };

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported by your browser.');
        setWeatherData(fakeData);
        setCityData('Unknown City');
        setCountryData('Unknown Country');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            setError('Invalid location coordinates.');
            setWeatherData(fakeData);
            setCityData('Unknown City');
            setCountryData('Unknown Country');
            setLoading(false);
            return;
          }

          setCoordinates({ latitude, longitude });

          try {
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_hours,uv_index_max,weather_code&hourly=temperature_2m,weather_code&current_weather=true&timezone=auto`
            );
            if (!weatherResponse.ok) throw new Error('Weather API call failed.');
            const weatherData = await weatherResponse.json();

            const cityUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            let cityResponse;
            try {
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0' },
              });
              if (!cityResponse.ok) throw new Error('City lookup API failed.');
            } catch (e) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0' },
              });
              if (!cityResponse.ok) throw new Error('City lookup API failed on retry.');
            }

            const cityData = await cityResponse.json();
            const city =
              cityData.address?.city ||
              cityData.address?.town ||
              cityData.address?.village ||
              cityData.address?.county ||
              'Unknown Location';
            const country = cityData.address?.country;

            setWeatherData(weatherData);
            setCityData(city);
            setCountryData(country);
            setLoading(false);
            setError('');
          } catch (error) {
            setError(`Failed to fetch data: ${error.message}`);
            setWeatherData(fakeData);
            setCityData('Unknown City');
            setCountryData('Unknown Country');
            setLoading(false);
          }
        },
        (error) => {
          setError(`Location access denied or timed out: ${error.message}`);
          setWeatherData(fakeData);
          setCityData('Unknown City');
          setCountryData('Unknown Country');
          setLoading(false);
        },
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
      );
    };

    getUserLocation();
  }, []);

  const handleMap = () => setActive('Home');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0' } }
      );
      if (!response.ok) throw new Error('City search failed.');
      const data = await response.json();
      if (data.length === 0) {
        setError('City not found. Please try a different name.');
        return;
      }
      const { lat, lon, display_name } = data[0];
      const newLat = parseFloat(lat);
      const newLon = parseFloat(lon);

      setCoordinates({ latitude: newLat, longitude: newLon });
      setCityData(display_name.split(',')[0]);
      setCountryData(display_name.split(',').pop());
      setActive('Map');
      setActiveSearch(false);
      setSearchQuery('');

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${newLat}&longitude=${newLon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_hours,uv_index_max,weather_code&hourly=temperature_2m,weather_code&current_weather=true&timezone=auto`
      );
      if (!weatherResponse.ok) throw new Error('Weather data fetch failed for searched city.');
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setError('');
    } catch (error) {
      setError(`Error searching for city: ${error.message}`);
    }
  };

  const navItems = [
    { id: 'Home', label: 'Home', icons: <House size={20} /> },
    { id: 'Map', label: 'Map', icons: <MapPin size={20} /> },
    { id: 'Predict', label: 'Predict', icons: <GitGraphIcon size={20} /> },
  ];

  const date = new Date();
  const day = date.getDate();
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const chartData = weatherdata?.hourly && {
    labels: weatherdata.hourly.time.slice(0, 24).map((time) => formatTime(time)),
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

  const getCurrentTemperature = () =>
    weatherdata?.current?.temperature_2m ??
    weatherdata?.current_weather?.temperature ??
    'N/A';
  const getCurrentWindDirection = () =>
    weatherdata?.current?.wind_direction_10m ??
    weatherdata?.current_weather?.winddirection ??
    'N/A';
  const getCurrentWindSpeed = () =>
    weatherdata?.current?.wind_speed_10m ??
    weatherdata?.current_weather?.windspeed ??
    'N/A';

  const handleHovering1 = () => setIsHovering(true);
  const handleHoveringOut1 = () => setIsHovering(false);
  const handleHovering2 = () => setIsHovering2(true);
  const handleHoveringOut2 = () => setIsHovering2(false);
  const handleHovering5 = () => setIsHovering5(true);
  const handleHoveringOut5 = () => setIsHovering5(false);
  const handleHovering7 = () => setIsHovering7(true);
  const handleHoveringOut7 = () => setIsHovering7(false);

  const searching = (e) => {
    e.preventDefault();
    setActiveSearch(true);
  };

  const handleCancel = () => {
    setActiveSearch(false);
    setSearchQuery('');
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-indigo-900 p-2 md:p-4 overflow-y-auto">
      {/* Liquid Glass Container */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1965&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      
      {/* App Content */}
      <div className="relative z-10">
        {/* Sidebar */}
        <div className="hidden md:flex fixed left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-3xl rounded-2xl p-3 shadow-xl border border-white/20">
          <div className="flex flex-col items-center space-y-6">
            <House
              onMouseOver={handleHovering1}
              onMouseOut={handleHoveringOut1}
              onClick={() => setActive('Home')}
              className="w-6 h-6 text-white hover:text-blue-300 transition-all cursor-pointer hover:scale-110"
            />
            <MapPin
              onMouseOver={handleHovering2}
              onMouseOut={handleHoveringOut2}
              onClick={() => setActive('Map')}
              className="w-6 h-6 text-white hover:text-blue-300 transition-all cursor-pointer hover:scale-110"
            />
            <GitGraphIcon
              onMouseOver={handleHovering5}
              onMouseOut={handleHoveringOut5}
              onClick={() => setActive('Predict')}
              className="w-6 h-6 text-white hover:text-blue-300 transition-all cursor-pointer hover:scale-110"
            />
            <Search
              onMouseOver={handleHovering7}
              onMouseOut={handleHoveringOut7}
              onClick={searching}
              className="w-6 h-6 text-white hover:text-red-300 transition-all cursor-pointer hover:scale-110"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="md:ml-20 max-w-4xl mx-auto">
          {/* Weather Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-white text-lg">WEATHERPULSE</p>
              <p className="text-white font-medium">
                {dayOfWeek}, {day} {month}, {year}
              </p>
            </div>
            {weatherdata && !error ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <MapPin className="text-white" />
                  <div className="ml-2">
                    <p className="text-white font-bold text-xl">{cityData || 'Loading...'}</p>
                    <p className="text-white/80 text-sm">{countryData || 'Loading...'}</p>
                  </div>
                </div>
                <p className="text-blue-300 font-bold text-5xl mb-1">
                  {getCurrentTemperature()}°C
                </p>
                <p className="text-white/80 text-sm mb-4">Temperature</p>
                <div className="flex justify-around w-full">
                  <div className="text-center">
                    <p className="text-blue-200 font-bold text-2xl">
                      {getCurrentWindDirection()}°
                    </p>
                    <p className="text-white/80 text-xs">Wind Direction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 font-bold text-2xl">
                      {getCurrentWindSpeed()}Km/h
                    </p>
                    <p className="text-white/80 text-xs">Wind Speed</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-300 text-center">{error || 'No data available'}</div>
            )}
          </div>

          {/* Forecast Section */}
          {active === 'Home' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h1 className="text-white font-bold text-lg mb-4">Today's Forecast</h1>
                  {weatherdata?.hourly ? (
                    <Times
                      hourlyTimes={weatherdata.hourly.time.slice(0, 24)}
                      temperatures={weatherdata.hourly.temperature_2m.slice(0, 24)}
                      weatherCode={weatherdata.hourly.weather_code.slice(0, 24)}
                    />
                  ) : (
                    <p className="text-red-300 text-sm">No hourly forecast data</p>
                  )}
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg mb-4">Forecast Graph</h1>
                  <div className="h-64">
                    {weatherdata?.hourly && chartData ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <p className="text-red-300 text-sm">No data for graph</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/20 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/30">
            <div className="flex justify-around">
              {navItems.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => setActive(nav.id)}
                  className={`p-2 rounded-full transition-all ${active === nav.id ? 'bg-white/30' : ''}`}
                >
                  {React.cloneElement(nav.icons, {
                    className: `w-5 h-5 ${active === nav.id ? 'text-blue-300' : 'text-white'}`
                  })}
                </button>
              ))}
              <button
                onClick={searching}
                className="p-2 rounded-full transition-all"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Overlay */}
        {active === 'Map' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
            <button 
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg rounded-full p-2 border border-white/30"
              onClick={handleMap}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white font-bold text-2xl mb-4">Map View</h1>
            {coordinates ? (
              <div className="w-full h-[80vh] rounded-2xl overflow-hidden border-2 border-white/30">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={13}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[coordinates.latitude, coordinates.longitude]}>
                    <Popup className="font-bold">{cityData || 'Your Location'}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-red-300">Map loading or coordinates unavailable</p>
            )}
          </div>
        )}

        {/* Search Overlay */}
        {activeSearch && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search city or postal code"
                  className="w-full bg-white/20 backdrop-blur-lg text-white rounded-full py-4 px-6 pr-12 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 rounded-full p-2 transition-all"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
            <button
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg rounded-full p-2 border border-white/30"
              onClick={handleCancel}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-blue-300/30 rounded-full animate-pulse" />
                <div className="absolute inset-8 bg-white/50 rounded-full" />
              </div>
              <p className="text-white font-bold text-xl mt-4">Loading Weather Data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

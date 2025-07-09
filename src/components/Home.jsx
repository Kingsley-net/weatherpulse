// src/components/Home.jsx
import {
  Search,
  House,
  MapPin,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Times from './time'; // Component for hourly forecast display
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

// Helper: Format ISO time string to 'HH:00'
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
    // Fake data for fallback/testing
    const fakeData = {
      current: {
        temperature_2m: 15.0,
        wind_speed_10m: 10,
        wind_direction_10m: 180,
        weather_code: 0,
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, i) =>
          new Date(Date.UTC(2025, 4, 3, i)).toISOString()
        ),
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
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&current_weather=true`,
            );
            if (!weatherResponse.ok) throw new Error('Weather API call failed.');
            const weatherData = await weatherResponse.json();

            // Using Nominatim for reverse geocoding
            const cityUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            let cityResponse;
            try {
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' },
              });
              if (!cityResponse.ok) throw new Error('City lookup API failed.');
            } catch (e) {
              // Retry once for Nominatim due to rate limits
              await new Promise((resolve) => setTimeout(resolve, 1000));
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' },
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

  // Handles closing overlays
  const handleMap = () => setActive('Home');

  // Handle city search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' } }
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
        `https://api.open-meteo.com/v1/forecast?latitude=${newLat}&longitude=${newLon}&hourly=temperature_2m,weather_code&current_weather=true`
      );
      if (!weatherResponse.ok) throw new Error('Weather data fetch failed for searched city.');
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setError('');
    } catch (error) {
      setError(`Error searching for city: ${error.message}`);
    }
  };

  // Navigation items for mobile footer
  const navItems = [
    { id: 'Home', label: 'Home', icons: <House size={20} /> },
    { id: 'Map', label: 'Map', icons: <MapPin size={20} /> },
    { id: 'Predict', label: 'Predict', icons: <GitGraphIcon size={20} /> },
  ];

  // Current Date display
  const date = new Date();
  const day = date.getDate();
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  // Chart Data
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

  // Helpers to get weather
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

  // Hover handlers
  const handleHovering1 = () => setIsHovering(true);
  const handleHoveringOut1 = () => setIsHovering(false);
  const handleHovering2 = () => setIsHovering2(true);
  const handleHoveringOut2 = () => setIsHovering2(false);
  const handleHovering5 = () => setIsHovering5(true);
  const handleHoveringOut5 = () => setIsHovering5(false);
  const handleHovering7 = () => setIsHovering7(true);
  const handleHoveringOut7 = () => setIsHovering7(false);

  // Open/close search overlay
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
    <div className=" w-full custom-bg gap-2 p-2 box-border ">
      <div className="h-full w-full custom-bg gap-2 p-2 box-border  ">
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex md:h-4/5 p-4 fixed left-2 top-1/2 transform -translate-y-1/2 bg-transparent backdrop-blur-md rounded-xl text-white font-bold text-2xl flex-col items-center py-4 shadow-lg z-50">
          {/* Sidebar Icons with hover and click effects */}
          <div className="relative">
            <House
              onMouseOver={handleHovering1}
              onMouseOut={handleHoveringOut1}
              onClick={() => setActive('Home')}
              className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
            />
            {isHovering && (
              <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Home</p>
            )}
          </div>
          <div className="relative">
            <MapPin
              onMouseOver={handleHovering2}
              onMouseOut={handleHoveringOut2}
              onClick={() => setActive('Map')}
              className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
            />
            {isHovering2 && (
              <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Map</p>
            )}
          </div>
          <div className="relative">
            <GitGraphIcon
              onMouseOver={handleHovering5}
              onMouseOut={handleHoveringOut5}
              onClick={() => setActive('Predict')}
              className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
            />
            {isHovering5 && (
              <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Predict</p>
            )}
          </div>
          <div className="relative mt-auto">
            <Search
              onMouseOver={handleHovering7}
              onMouseOut={handleHoveringOut7}
              onClick={searching}
              className="w-5 h-5 hover:scale-125 transition-transform hover:text-red-400"
            />
            {isHovering7 && (
              <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Search</p>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="h-full w-full md:pl-10 flex flex-col">
          {/* Header/Weather Info Card */}
          <div className="transparent  rounded-xl p-2 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-base">WEATHERPULSE</p>
              <p className="text-base font-semibold">
                {dayOfWeek}, {day} {month}, {year}
              </p>
            </div>
            {weatherdata && !error ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <MapPin className="text-xl" />
                  <div className="ml-2">
                    <p className="text-xl font-bold">{cityData || 'Loading...'}</p>
                    <p className="text-sm">{countryData || 'Loading...'}</p>
                  </div>
                </div>
                <p className="text-blue-500 font-bold text-4xl">
                  {getCurrentTemperature()}°C
                </p>

                <div className="flex justify-around w-full mt-2">
                  <div>
                    <p className="text-blue-700 font-bold text-xl">
                      {getCurrentWindDirection()}°
                    </p>
                    <p className="text-xs">Wind Direction</p>
                  </div>
                  <div>
                    <p className="text-blue-500 font-bold text-xl">
                      {getCurrentWindSpeed()}Km/h
                    </p>
                    <p className="text-xs">Wind Speed</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 text-center text-sm">{error || 'No data available'}</div>
            )}
          </div>

          {/* Main Content Area (Home View) */}
          {active === 'Home' && (
            <div className="transparent  rounded-xl p-4 overflow-hidden mt-2 flex-1 flex flex-col md:flex-row gap-4 border border-white/10 shadow-lg">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white text-center">Today's Forecast</h1>
                {weatherdata?.hourly ? (
                  <Times
                    hourlyTimes={weatherdata.hourly.time.slice(0, 24)}
                    temperatures={weatherdata.hourly.temperature_2m.slice(0, 24)}
                    weatherCode={weatherdata.hourly.weather_code.slice(0, 24)}
                     />
                ) : (
                  <p className="text-red-400 text-sm">No hourly forecast data</p>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white text-center">Forecast Graph</h1>
                <div className="w-full h-48 md:h-1/2">
                  {weatherdata?.hourly && chartData ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <p className="text-red-400 text-sm">No data for graph</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer - Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 shadow-3xl backdrop-blur-xl rounded-t-xl h-auto flex bg-blue-400/20 justify-around items-center z-40 border-t border-white/10">
            {navItems.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActive(nav.id)}
                className={`relative flex flex-col font-bold items-center justify-center py-2 px-3 transition-all duration-200
                  ${active === nav.id ? 'text-blue-300 font-bold scale-110 drop-shadow-lg' : 'opacity-80 text-white'}`}
              >
                <p>{nav.icons}</p>
                <p className="text-xs mt-1">{nav.label}</p>
              </button>
            ))}
            <button
              onClick={searching}
              className="flex flex-col items-center justify-center font-bold py-2 px-3 transition-all duration-200 opacity-80 text-white focus:text-yellow-300"
            >
              <Search />
              <p className="text-xs mt-1">Search</p>
            </button>
          </div>

          {/* Map Overlay */}
          {active === 'Map' && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/70 backdrop-blur-2xl">
              <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full backdrop-blur-md" onClick={handleMap}>
                <X />
              </button>
              <h1 className="text-xl font-bold text-white mb-2">Map</h1>
              {coordinates ? (
                <div className="w-full h-full md:w-4/5 md:h-4/5 rounded-xl overflow-hidden border-2 border-white/20">
                  <MapContainer
                    center={[coordinates.latitude, coordinates.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[coordinates.latitude, coordinates.longitude]}>
                      <Popup>{cityData || 'Your Location'}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <p className="text-red-400 text-sm">Map loading or coordinates unavailable</p>
              )}
            </div>
          )}

          {/* Predict Overlay */}
          {active === 'Predict' && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-xl">
              <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full backdrop-blur-md" onClick={handleMap}>
                <X />
              </button>
              <h1 className="text-2xl font-bold text-white">Predict</h1>
              <p className="text-sm text-white">Prediction feature not yet implemented.</p>
            </div>
          )}

          {/* Search Overlay */}
          {activeSearch && (
            <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-gray-950/70 backdrop-blur-xl">
              <form onSubmit={handleSearch} className="w-4/5 max-w-md flex items-center">
                <input
                  type="search"
                  placeholder="Search city or postal code"
                  className="text-white w-full bg-white/20 border border-white/30 p-3 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 text-white font-bold bg-blue-500/70 hover:bg-blue-500/90 border border-white/30 p-3 rounded-xl backdrop-blur-md transition-colors"
                >
                  Search
                </button>
              </form>
              <button
                className="text-white font-bold absolute top-4 right-4 rounded-full bg-white/10 p-2 border border-white/30 backdrop-blur-md"
                onClick={handleCancel}
              >
                <X />
              </button>
              {error && (
                <div className="mt-4 text-red-400 text-center text-sm">{error}</div>
              )}
            </div>
          )}

          {/* Weather-like Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-950/70 backdrop-blur-2xl z-50">
              <div className="flex flex-col items-center">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-cloud-move">
                  <ellipse cx="60" cy="55" rx="35" ry="18" fill="#dbeafe" />
                  <ellipse cx="45" cy="45" rx="20" ry="15" fill="#bae6fd" />
                  <ellipse cx="80" cy="45" rx="24" ry="16" fill="#a5b4fc" />
                  <ellipse cx="70" cy="60" rx="32" ry="13" fill="#e0e7ff" />
                </svg>
                <span className="mt-4 text-blue-100 text-center text-2xl font-extrabold tracking-wide animate-pulse">Loading Weather data please wait...</span>
              </div>
              <style>{`
                @keyframes cloud-move {
                  0% { transform: translateX(0); }
                  50% { transform: translateX(10px); }
                  100% { transform: translateX(0); }
                }
                .animate-cloud-move {
                  animation: cloud-move 2.2s ease-in-out infinite;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

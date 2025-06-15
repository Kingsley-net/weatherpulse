// src/Home.jsx
import {
  Search,
  House,
  MapPin,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Times from './time'; // Assuming this is your component for hourly forecast display
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
  const [cityData, setCityData] = null);
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
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_hours,uv_index_max,weather_code&hourly=temperature_2m,weather_code&current_weather=true&timezone=auto`
            );
            if (!weatherResponse.ok) throw new Error('Weather API call failed.');
            const weatherData = await weatherResponse.json();

            // Using Nominatim for reverse geocoding
            const cityUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            let cityResponse;
            try {
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' }, // IMPORTANT: Provide a unique User-Agent
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
            setWeatherData(fakeData); // Fallback to fake data on error
            setCityData('Unknown City');
            setCountryData('Unknown Country');
            setLoading(false);
          }
        },
        (error) => {
          setError(`Location access denied or timed out: ${error.message}`);
          setWeatherData(fakeData); // Fallback to fake data on geolocation error
          setCityData('Unknown City');
          setCountryData('Unknown Country');
          setLoading(false);
        },
        { timeout: 15000, maximumAge: 0, enableHighAccuracy: true } // Geolocation options
      );
    };

    getUserLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Handles closing map or prediction overlays
  const handleMap = () => setActive('Home');

  // Handle city search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return; // Don't search if query is empty
    try {
      // Use Nominatim for forward geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' } } // IMPORTANT: Provide a unique User-Agent
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

      // Update coordinates and city/country for the new location
      setCoordinates({ latitude: newLat, longitude: newLon });
      // Extract main city name from display_name
      setCityData(display_name.split(',')[0]);
      setCountryData(display_name.split(',').pop()); // Get the last part (country)
      setActive('Map'); // Switch to map view after successful search
      setActiveSearch(false); // Close search overlay
      setSearchQuery(''); // Clear search query after successful search

      // Fetch weather for the newly searched location
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${newLat}&longitude=${newLon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_hours,uv_index_max,weather_code&hourly=temperature_2m,weather_code&current_weather=true&timezone=auto`
      );
      if (!weatherResponse.ok) throw new Error('Weather data fetch failed for searched city.');
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setError(''); // Clear any previous errors
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

  // Chart Data: 24 hours, blue/navy colors
  const chartData = weatherdata?.hourly && {
    labels: weatherdata.hourly.time.slice(0, 24).map((time) => formatTime(time)),
    datasets: [
      {
        label: 'Temp (°C)',
        data: weatherdata.hourly.temperature_2m.slice(0, 24),
        borderColor: '#2563eb', // Tailwind's blue-600
        backgroundColor: 'rgba(30, 58, 138, 0.35)', // A navy blue with opacity for fill
        fill: true,
        tension: 0.4, // Smooth the line
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill its container's height
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
        ticks: { color: 'white', maxTicksLimit: 6, font: { size: 10 } }, // Limit ticks for smaller screens
      },
      y: {
        title: { display: false },
        ticks: { color: 'white', font: { size: 10 } },
      },
    },
  };

  // Helper functions to safely get current weather data
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

  // UI logic for hover states (kept as-is based on your request)
  const handleHovering1 = () => setIsHovering(true);
  const handleHoveringOut1 = () => setIsHovering(false);
  const handleHovering2 = () => setIsHovering2(true);
  const handleHoveringOut2 = () => setIsHovering2(false);
  const handleHovering5 = () => setIsHovering5(true);
  const handleHoveringOut5 = () => setIsHovering5(false);
  const handleHovering7 = () => setIsHovering7(true);
  const handleHoveringOut7 = () => setIsHovering7(false);

  // Function to open search overlay
  const searching = (e) => {
    e.preventDefault();
    setActiveSearch(true);
  };
  // Function to close search overlay and clear query/errors
  const handleCancel = () => {
    setActiveSearch(false);
    setSearchQuery('');
    setError(''); // Clear search-related errors
  };

  return (
    // Main container: `custom-bg` remains for the background.
    // Grid layout for responsiveness.
    <div className="h-full w-full custom-bg p-2 box-border fixed 
                    grid grid-rows-[auto_1fr_auto] /* Mobile: Header, Main Content, Footer */
                    md:grid-rows-1 /* Desktop: Single row for sidebar & main */
                    md:grid-cols-[auto_1fr] /* Desktop: Sidebar takes auto width, Main takes rest */
                    md:gap-2">

      {/* Sidebar (Desktop only) */}
      <div className="liquid-glass-element rounded-xl text-white font-bold text-2xl md:flex flex-col items-center py-4 hidden">
        <div className="liquid-glass-shine-overlay"></div> {/* Liquid glass shine effect */}
        {/* Sidebar Icons with hover and click effects */}
        <House
          onMouseOver={handleHovering1}
          onMouseOut={handleHoveringOut1}
          onClick={() => setActive('Home')}
          className="mb-4 w-6 h-6 hover:scale-125 transition-transform hover:text-blue-400 cursor-pointer"
        />
        {isHovering && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Home</p>
        )}
        <MapPin
          onMouseOver={handleHovering2}
          onMouseOut={handleHoveringOut2}
          onClick={() => setActive('Map')}
          className="mb-4 w-6 h-6 hover:scale-125 transition-transform hover:text-blue-400 cursor-pointer"
        />
        {isHovering2 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Map</p>
        )}
        <GitGraphIcon
          onMouseOver={handleHovering5}
          onMouseOut={handleHoveringOut5}
          onClick={() => setActive('Predict')}
          className="mb-4 w-6 h-6 hover:scale-125 transition-transform hover:text-blue-400 cursor-pointer"
        />
        {isHovering5 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Predict</p>
        )}
        <Search
          onMouseOver={handleHovering7}
          onMouseOut={handleHoveringOut7}
          onClick={searching}
          className="w-6 h-6 hover:scale-125 transition-transform hover:text-red-400 mt-auto cursor-pointer"
        />
        {isHovering7 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Search</p>
        )}
      </div>

      {/* Main Content Area: Contains Header/Weather Info Card and Home/Map/Predict views */}
      {/* Added `pb-20` (padding-bottom) to prevent interception by the fixed bottom nav on mobile */}
      <div className="flex flex-col h-full overflow-y-auto gap-2 pb-20 md:pb-0"> 
        {/* Header/Weather Info Card */}
        <div className="liquid-glass-element p-4 flex flex-col justify-between flex-shrink-0">
          <div className="liquid-glass-shine-overlay"></div> {/* Liquid glass shine effect */}
          <div className="relative z-10"> {/* Content needs to be above the shine */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg sm:text-xl">WEATHERPULSE</p>
              <p className="text-sm sm:text-base font-semibold">
                {dayOfWeek}, {day} {month}, {year}
              </p>
            </div>
            {weatherdata && !error ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <MapPin className="text-xl sm:text-2xl" />
                  <div className="ml-2">
                    <p className="text-xl sm:text-2xl font-bold">{cityData || 'Loading...'}</p>
                    <p className="text-sm sm:text-base text-gray-200">{countryData || 'Loading...'}</p>
                  </div>
                </div>
                <p className="text-blue-300 font-bold text-5xl sm:text-6xl mb-1">
                  {getCurrentTemperature()}°C
                </p>
                <p className="text-sm sm:text-base text-gray-200 mb-4">Temperature</p>
                <div className="flex justify-around w-full max-w-xs">
                  <div className="text-center">
                    <p className="text-blue-200 font-bold text-xl sm:text-2xl">
                      {getCurrentWindDirection()}°
                    </p>
                    <p className="text-xs sm:text-sm text-gray-200">Wind Direction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 font-bold text-xl sm:text-2xl">
                      {getCurrentWindSpeed()}Km/h
                    </p>
                    <p className="text-xs sm:text-sm text-gray-200">Wind Speed</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-300 text-center text-sm sm:text-base mt-4">{error || 'Fetching weather data...'}</div>
            )}
          </div>
        </div>

        {/* Main Content Area (Home View - Conditional Rendering) */}
        {active === 'Home' && (
          <div className="liquid-glass-element p-4 overflow-hidden flex-grow flex flex-col">
            <div className="liquid-glass-shine-overlay"></div> {/* Liquid glass shine effect */}
            <div className="relative z-10 flex-grow flex flex-col"> {/* Content needs to be above the shine */}
              <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-4">Hourly Forecast</h1>
              <div className="flex-grow flex flex-col overflow-y-auto mb-4"> {/* Scrollable for hourly forecast */}
                {weatherdata?.hourly ? (
                  <Times
                    hourlyTimes={weatherdata.hourly.time.slice(0, 24)}
                    temperatures={weatherdata.hourly.temperature_2m.slice(0, 24)}
                    weatherCode={weatherdata.hourly.weather_code.slice(0, 24)}
                  />
                ) : (
                  <p className="text-red-300 text-sm sm:text-base text-center">No hourly forecast data available.</p>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">Temperature Graph</h1>
              <div className="w-full h-40 sm:h-56 mt-2 relative"> {/* Increased height for chart on larger screens */}
                {weatherdata?.hourly && chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <p className="text-red-300 text-sm sm:text-base text-center">No data for graph visualization.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Mobile Bottom Navigation (Hidden on MD screens and up) */}
      <div className="liquid-glass-nav fixed bottom-0 right-0 left-0 rounded-t-3xl h-auto flex justify-around items-center z-40 p-2 md:hidden">
        <div className="liquid-glass-shine-overlay"></div> {/* Liquid glass shine effect */}
        {navItems.map((nav) => (
          <button
            key={nav.id}
            onClick={() => setActive(nav.id)}
            className={`relative flex flex-col font-bold items-center justify-center py-2 px-3 transition-all duration-200
              ${active === nav.id ? 'text-blue-600 scale-110 drop-shadow-lg' : 'text-white opacity-80'}`}
          >
            <p>{nav.icons}</p>
            <p className="text-xs mt-1">{nav.label}</p>
          </button>
        ))}
        <button
          onClick={searching}
          className="relative flex flex-col items-center justify-center font-bold py-2 px-3 transition-all duration-200 text-white opacity-80 focus:text-yellow-300"
        >
          <Search />
          <p className="text-xs mt-1">Search</p>
        </button>
      </div>

      {/* Map Overlay (Conditional Rendering) */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/70 backdrop-blur-2xl p-4" style={{ display: active === 'Map' ? 'flex' : 'none' }}>
          <button className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors" onClick={handleMap}>
            <X size={28} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Current Location Map</h1>
          {coordinates ? (
            <MapContainer
              center={[coordinates.latitude, coordinates.longitude]}
              zoom={13}
              className="h-3/4 w-full max-w-3xl rounded-xl shadow-lg border border-gray-700"
              attributionControl={false} // Hide default Leaflet attribution for cleaner UI
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[coordinates.latitude, coordinates.longitude]}>
                <Popup>{cityData || 'Your Location'}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="text-red-300 text-sm sm:text-base">Map loading or coordinates unavailable. Please enable location services.</p>
          )}
        </div>

      {/* Predict Overlay (Conditional Rendering) */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-xl p-4" style={{ display: active === 'Predict' ? 'flex' : 'none' }}>
          <button className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors" onClick={handleMap}>
            <X size={28} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Predictive Analysis</h1>
          <p className="text-xl sm:text-2xl text-white text-center">Our prediction feature is under development. Check back soon!</p>
        </div>

      {/* Search Overlay (Conditional Rendering) */}
      {activeSearch && (
        <div className="flex flex-col justify-center items-center h-screen w-full fixed top-0 left-0 bg-gray-950/50 backdrop-blur-xl z-50 p-4">
          <form onSubmit={handleSearch} className="w-full max-w-md flex items-center bg-gray-800 rounded-xl shadow-lg">
            <input
              type="search"
              placeholder="Search city or postal code"
              className="text-white w-full bg-transparent p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
            >
              Search
            </button>
          </form>
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>} {/* Display search-specific error */}
          <button
            className="text-white font-bold absolute top-4 right-4 p-2 rounded-full border border-blue-300 hover:bg-blue-600 transition-colors"
            onClick={handleCancel}
          >
            <X size={28} />
          </button>
        </div>
      )}

      {/* Weather-like Loading Overlay (Conditional Rendering) */}
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950/70 backdrop-blur-2xl z-50">
          <div className="flex flex-col items-center">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-cloud-move">
              <ellipse cx="60" cy="55" rx="35" ry="18" fill="#dbeafe" />
              <ellipse cx="45" cy="45" rx="20" ry="15" fill="#bae6fd" />
              <ellipse cx="80" cy="45" rx="24" ry="16" fill="#a5b4fc" />
              <ellipse cx="70" cy="60" rx="32" ry="13" fill="#e0e7ff" />
            </svg>
            <span className="mt-4 text-blue-100 text-center text-2xl font-extrabold tracking-wide animate-pulse">Loading Weather...</span>
          </div>
        </div>
      )}
    </div>
  );
}

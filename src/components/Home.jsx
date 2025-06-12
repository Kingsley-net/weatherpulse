import {
  Bell,
  User,
  LayoutGrid,
  MapPinnedIcon,
  Star,
  Settings,
  Power,
  Search,
  House,
  MapPin,
  X,
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

export function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [isHovering2, setIsHovering2] = useState(false);
  const [isHovering3, setIsHovering3] = useState(false);
  const [isHovering4, setIsHovering4] = useState(false);
  const [isHovering5, setIsHovering5] = useState(false);
  const [isHovering6, setIsHovering6] = useState(false);
  const [isHovering7, setIsHovering7] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
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
          new Date(Date.UTC(2025, 4, 3, i)).toISOString()
        ),
        temperature_2m: Array.from({ length: 24 }, (_, i) => (15 + i * 0.5).toFixed(1)),
        weather_code: Array.from({ length: 24 }, (_, i) => [0, 1, 2, 3, 51, 61, 71, 73, 95, 96][i % 10]),
      },
    };

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setError('No geolocation');
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
            setError('Bad location');
            setWeatherData(fakeData);
            setCityData('Unknown City');
            setCountryData('Unknown Country');
            setLoading(false);
            return;
          }

          setCoordinates({ latitude, longitude });

          try {
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,precipitation_sum,precipitation_hours&current_weather=true&hourly=temperature_2m,weather_code&timezone=auto`
            );
            if (!weatherResponse.ok) throw new Error('Weather API failed');
            const weatherData = await weatherResponse.json();

            const cityUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            let cityResponse;
            try {
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' },
              });
              if (!cityResponse.ok) throw new Error('City API failed');
            } catch (e) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              cityResponse = await fetch(cityUrl, {
                headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' },
              });
              if (!cityResponse.ok) throw new Error('City API failed again');
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
            setError('Could not get data');
            setWeatherData(fakeData);
            setCityData('Unknown City');
            setCountryData('Unknown Country');
            setLoading(false);
          }
        },
        (error) => {
          setError('Could not get location');
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

  const handleMap = () => {
    setActive('Home');
  };

  // Handle city search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' } }
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      if (data.length === 0) {
        setError('City not found');
        return;
      }
      const { lat, lon, display_name } = data[0];
      setCoordinates({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      setCityData(display_name.split(',')[0]);
      setCountryData(display_name.split(',').pop());
      setActive('Map');
      setActiveSearch(false);

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,precipitation_sum,precipitation_hours&current_weather=true&hourly=temperature_2m,weather_code&timezone=auto`
      );
      if (!weatherResponse.ok) throw new Error('Weather API failed');
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setError('');
    } catch (error) {
      setError('Could not fetch data for this location');
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

  // Chart Data and Options (clean, realistic, not jam-packed, and visually fitting)
  const chartData =
    weatherdata?.hourly && weatherdata.hourly.temperature_2m
      ? {
          labels: weatherdata.hourly.time.map((time, idx) =>
            [0, 4, 8, 12, 16, 20].includes(idx)
              ? new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
              : ""
          ),
          datasets: [
            {
              label: 'Temperature (°C)',
              data: weatherdata.hourly.temperature_2m.map((t) => Number(t)),
              borderColor: '#38bdf8', // sky-400
              backgroundColor: function(context) {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) {
                  return null;
                }
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, "rgba(56,189,248,0.5)");
                gradient.addColorStop(1, "rgba(224,242,254,0.1)");
                return gradient;
              },
              pointRadius: 0,
              fill: true,
              tension: 0.4,
            },
          ],
        }
      : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#334155',
        titleColor: '#38bdf8',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.14)' },
        ticks: {
          color: '#fff',
          font: { size: 12 },
          callback: function(value, index, ticks) {
            return this.getLabelForValue(value) || null;
          },
          maxTicksLimit: 6,
          autoSkip: false,
        },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.16)' },
        ticks: { color: '#fff', font: { size: 12 } },
        beginAtZero: false,
      },
    },
  };

  const formatTime = (isoTime) => {
    try {
      return new Date(isoTime).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: true,
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const handleNavigation = (id) => setActive(id);
  const handleHovering1 = () => setIsHovering(true);
  const handleHoveringOut1 = () => setIsHovering(false);
  const handleHovering2 = () => setIsHovering2(true);
  const handleHoveringOut2 = () => setIsHovering2(false);
  const handleHovering3 = () => setIsHovering3(true);
  const handleHoveringOut3 = () => setIsHovering3(false);
  const handleHovering4 = () => setIsHovering4(true);
  const handleHoveringOut4 = () => setIsHovering4(false);
  const handleHovering5 = () => setIsHovering5(true);
  const handleHoveringOut5 = () => setIsHovering5(false);
  const handleHovering6 = () => setIsHovering6(true);
  const handleHoveringOut6 = () => setIsHovering6(false);
  const handleHovering7 = () => setIsHovering7(true);
  const handleHoveringOut7 = () => setIsHovering7(false);
  const searching = (e) => {
    e.preventDefault();
    setActiveSearch(true);
  };
  const handleCancel = () => {
    setActiveSearch(false);
    setSearchQuery('');
  };

  // Helper: Safely get current weather from either API or fake data
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

  return (
    <div className="h-full w-full custom-bg gap-2 p-2 box-border overflow-hidden fixed">
      {/* Sidebar */}
      <div className="bg-gray-700/40 backdrop-blur-2xl rounded-xl text-white font-bold text-2xl md:flex flex-col items-center py-4 shadow-xl row-span-2 hidden">
        <House
          onMouseOver={handleHovering1}
          onMouseOut={handleHoveringOut1}
          className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
        />
        {isHovering && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Home</p>
        )}
        <MapPin
          onMouseOver={handleHovering2}
          onMouseOut={handleHoveringOut2}
          className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
        />
        {isHovering2 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Map</p>
        )}
        <GitGraphIcon
          onMouseOver={handleHovering5}
          onMouseOut={handleHoveringOut5}
          className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
        />
        {isHovering5 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Predict</p>
        )}
        <Search
          onMouseOver={handleHovering7}
          onMouseOut={handleHoveringOut7}
          className="w-5 h-5 hover:scale-125 transition-transform hover:text-red-400 mt-auto"
        />
        {isHovering7 && (
          <p className="absolute ml-8 bg-gray-800/90 px-1 py-0.5 rounded text-xs shadow-md">Search</p>
        )}
      </div>

      {/* Header/Weather Info */}
      <div className="text-white transparent backdrop-blur-sm rounded-xl p-4 ">
        <div className="flex items-center justify-between">
          <p className="font-bold text-base">WEATHERPULSE</p>
          <p className="text-base font-semibold">
            {dayOfWeek}, {day} {month}, {year}
          </p>
        </div>
        {weatherdata && !error ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <MapPin className="text-xl" />
              <div className="ml-2">
                <p className="text-xl font-bold">{cityData || 'Loading...'}</p>
                <p className="text-sm">{countryData || 'Loading...'}</p>
              </div>
            </div>
            <p className="text-blue-500 font-bold text-4xl">
              {getCurrentTemperature()}°C
            </p>
            <p className="text-sm">Temperature</p>
            <div className="flex justify-around w-full mt-2">
              <div>
                <p className="text-blue-300 font-bold text-xl">
                  {getCurrentWindDirection()}°
                </p>
                <p className="text-xs">Wind Direction</p>
              </div>
              <div>
                <p className="text-blue-300 font-bold text-xl">
                  {getCurrentWindSpeed()}Km/h
                </p>
                <p className="text-xs">Wind Speed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-center text-sm">{error || 'No data available'}</div>
        )}
      </div>

      {/* Main Content */}
      <div className="transparent backdrop-blur-sm rounded-xl p-4 overflow-hidden mt-2 md:h-3/4 md:flex">
        {active === 'Home' && (
          <div className="grid grid-cols-1 gap-4 h-full">
            <div>
              <h1 className="text-xl font-bold text-white text-center">Today's Forecast</h1>
              {weatherdata?.hourly ? (
                <Times
                  hourlyTimes={weatherdata.hourly.time}
                  temperatures={weatherdata.hourly.temperature_2m}
                  weatherCode={weatherdata.hourly.weather_code}
                />
              ) : (
                <p className="text-red-500 text-sm">No hourly forecast data</p>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white text-center">Forecast Graph</h1>
              <div className="w-full h-40 mt-2 bg-transparent">
                {weatherdata?.hourly && chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <p className="text-red-500 text-sm">No data for graph</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Mobile Bottom Navigation */}
      <div className="col-span-2 fixed bottom-0 right-0 left-0 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 shadow-2xl backdrop-blur-lg rounded-t-xl h-auto flex justify-around items-center w-full text-white md:hidden">
        {navItems.map((nav) => (
          <button
            key={nav.id}
            onClick={() => setActive(nav.id)}
            className={`flex flex-col items-center justify-center font-bold py-2 px-3 transition-all duration-200 ${
              active === nav.id ? 'text-yellow-300 scale-110 drop-shadow-lg' : 'opacity-80'
            }`}
          >
            <p>{nav.icons}</p>
            <p className="text-xs mt-1">{nav.label}</p>
          </button>
        ))}
        <button
          onClick={searching}
          className="flex flex-col items-center justify-center font-bold py-2 px-3 transition-all duration-200 opacity-80 focus:text-yellow-300"
        >
          <Search />
          <p className="text-xs mt-1">Search</p>
        </button>
      </div>

      {/* Map Overlay */}
      {active === 'Map' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/70 backdrop-blur-2xl">
          <button className="absolute top-1 right-2 text-white" onClick={handleMap}>
            <X />
          </button>
          <h1 className="text-xl font-bold text-white">Map</h1>
          {coordinates ? (
            <MapContainer
              center={[coordinates.latitude, coordinates.longitude]}
              zoom={13}
              style={{ height: '80%', width: '80%', borderRadius: '8px' }}
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
            <p className="text-red-500 text-sm">Map loading or coordinates unavailable</p>
          )}
        </div>
      )}

      {/* Predict Overlay */}
      {active === 'Predict' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90">
          <button className="absolute top-1 right-2 text-white" onClick={handleMap}>
            <X />
          </button>
          <h1 className="text-2xl font-bold text-white">Predict</h1>
          <p className="text-xl text-white">Prediction feature not yet implemented.</p>
        </div>
      )}

      {/* Search Overlay */}
      {activeSearch && (
        <div className="flex flex-col justify-center items-center h-screen w-full fixed top-0 left-0 bg-gray-950/50 backdrop-blur-md z-50">
          <form onSubmit={handleSearch} className="w-4/5 flex items-center">
            <input
              type="search"
              placeholder="Search city or postal code"
              className="text-white w-full border border-blue-300 p-2 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 text-white font-bold border border-blue-300 p-2 rounded-xl"
            >
              Search
            </button>
          </form>
          <button
            className="text-white font-bold absolute top-2 right-2 rounded-full border border-blue-300 p-1"
            onClick={handleCancel}
          >
            <X />
          </button>
        </div>
      )}

      {/* Weather-like Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-b from-blue-200/80 via-gray-300/80 to-white/80 z-50">
          <div className="flex flex-col items-center">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-cloud-move">
              <ellipse cx="60" cy="55" rx="35" ry="18" fill="#dbeafe" />
              <ellipse cx="45" cy="45" rx="20" ry="15" fill="#bae6fd" />
              <ellipse cx="80" cy="45" rx="24" ry="16" fill="#a5b4fc" />
              <ellipse cx="70" cy="60" rx="32" ry="13" fill="#e0e7ff" />
            </svg>
            <span className="mt-4 text-blue-900 text-2xl font-extrabold tracking-wide animate-pulse">Loading Weather...</span>
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
  );
}

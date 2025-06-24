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

// Weather background images
const weatherBackgrounds = {
  clear: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?q=80&w=1974&auto=format&fit=crop',
  cloudy: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=2070&auto=format&fit=crop',
  rainy: 'https://images.unsplash.com/photo-1534274988757-a28bf1cb57ef?q=80&w=2070&auto=format&fit=crop',
  snowy: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=2076&auto=format&fit=crop',
  thunder: 'https://images.unsplash.com/photo-1507334446581-e61b8e05de27?q=80&w=2070&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1469122312224-c5846569feb1?q=80&w=1974&auto=format&fit=crop'
};

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const [background, setBackground] = useState(weatherBackgrounds.default);

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
          setCoordinates({ latitude, longitude });

          try {
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_hours,uv_index_max,weather_code&hourly=temperature_2m,weather_code&current_weather=true&timezone=auto`
            );
            if (!weatherResponse.ok) throw new Error('Weather API call failed.');
            const weatherData = await weatherResponse.json();
            setWeatherData(weatherData);

            // Set background based on weather
            const code = weatherData.current_weather?.weathercode;
            if (code <= 3) setBackground(weatherBackgrounds.clear);
            else if (code <= 48) setBackground(weatherBackgrounds.cloudy);
            else if (code <= 67 || code === 80) setBackground(weatherBackgrounds.rainy);
            else if (code <= 86) setBackground(weatherBackgrounds.snowy);
            else if (code <= 99) setBackground(weatherBackgrounds.thunder);

            const cityUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            const cityResponse = await fetch(cityUrl, {
              headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' },
            });
            const cityData = await cityResponse.json();
            const city =
              cityData.address?.city ||
              cityData.address?.town ||
              cityData.address?.village ||
              cityData.address?.county ||
              'Unknown Location';
            const country = cityData.address?.country;

            setCityData(city);
            setCountryData(country);
            setLoading(false);
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
        }
      );
    };

    getUserLocation();
  }, []);

  // Keep all your existing handler functions here...

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
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}°C`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      },
    },
  };

  return (
    <div 
      className="h-screen w-full fixed overflow-hidden"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      <div className="relative h-full w-full custom-bg gap-2 p-2 box-border overflow-hidden z-10">
        {/* Sidebar (Desktop only) */}
        <div className="bg-gray-700/10 backdrop-blur-md rounded-xl text-white font-bold text-2xl md:flex flex-col items-center py-4 shadow-xl row-span-2 hidden border border-white/10">
          <House
            onMouseOver={handleHovering1}
            onMouseOut={handleHoveringOut1}
            onClick={() => setActive('Home')}
            className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
          />
          {isHovering && (
            <p className="absolute ml-8 bg-gray-800/50 px-1 py-0.5 rounded text-xs shadow-md">Home</p>
          )}
          <MapPin
            onMouseOver={handleHovering2}
            onMouseOut={handleHoveringOut2}
            onClick={() => setActive('Map')}
            className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
          />
          {isHovering2 && (
            <p className="absolute ml-8 bg-gray-800/50 px-1 py-0.5 rounded text-xs shadow-md">Map</p>
          )}
          <GitGraphIcon
            onMouseOver={handleHovering5}
            onMouseOut={handleHoveringOut5}
            onClick={() => setActive('Predict')}
            className="mb-4 w-5 h-5 hover:scale-125 transition-transform hover:text-blue-400"
          />
          {isHovering5 && (
            <p className="absolute ml-8 bg-gray-800/50 px-1 py-0.5 rounded text-xs shadow-md">Predict</p>
          )}
          <Search
            onMouseOver={handleHovering7}
            onMouseOut={handleHoveringOut7}
            onClick={searching}
            className="w-5 h-5 hover:scale-125 transition-transform hover:text-red-400 mt-auto"
          />
          {isHovering7 && (
            <p className="absolute ml-8 bg-gray-800/50 px-1 py-0.5 rounded text-xs shadow-md">Search</p>
          )}
        </div>

        {/* Header/Weather Info Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-white">WEATHERPULSE</p>
            <p className="text-white/90 font-semibold">
              {dayOfWeek}, {day} {month}, {year}
            </p>
          </div>
          {weatherdata && !error ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-2">
                <MapPin className="text-white" />
                <div className="ml-2">
                  <p className="text-xl font-bold text-white">{cityData || 'Loading...'}</p>
                  <p className="text-sm text-white/80">{countryData || 'Loading...'}</p>
                </div>
              </div>
              <p className="text-white font-bold text-4xl">
                {getCurrentTemperature()}°C
              </p>
              <p className="text-sm text-white/80">Temperature</p>
              <div className="flex justify-around w-full mt-2">
                <div>
                  <p className="text-blue-200 font-bold text-xl">
                    {getCurrentWindDirection()}°
                  </p>
                  <p className="text-xs text-white/80">Wind Direction</p>
                </div>
                <div>
                  <p className="text-blue-200 font-bold text-xl">
                    {getCurrentWindSpeed()}Km/h
                  </p>
                  <p className="text-xs text-white/80">Wind Speed</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-300 text-center text-sm">{error || 'No data available'}</div>
          )}
        </div>

        {/* Main Content Area (Home View) */}
        {active === 'Home' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 overflow-hidden mt-2 border border-white/10 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h1 className="text-xl font-bold text-white text-center mb-2">Today's Forecast</h1>
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
                <h1 className="text-xl font-bold text-white text-center mb-2">Forecast Graph</h1>
                <div className="h-64 w-full">
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

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md rounded-t-xl h-auto flex justify-around items-center z-40 border-t border-white/10">
          {['Home', 'Map', 'Predict'].map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`flex flex-col items-center py-2 px-3 transition-all ${active === item ? 'text-blue-300 scale-110' : 'text-white/80'}`}
            >
              {item === 'Home' && <House size={20} />}
              {item === 'Map' && <MapPin size={20} />}
              {item === 'Predict' && <GitGraphIcon size={20} />}
              <span className="text-xs mt-1">{item}</span>
            </button>
          ))}
          <button
            onClick={searching}
            className="flex flex-col items-center py-2 px-3 text-white/80"
          >
            <Search size={20} />
            <span className="text-xs mt-1">Search</span>
          </button>
        </div>

        {/* Map Overlay */}
        {active === 'Map' && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <button 
              className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full backdrop-blur-md"
              onClick={handleMap}
            >
              <X />
            </button>
            <h1 className="text-xl font-bold text-white mb-2">Map</h1>
            {coordinates ? (
              <div className="w-full h-full md:w-4/5 md:h-4/5 rounded-xl overflow-hidden border border-white/20">
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
              <p className="text-red-300 text-sm">Map loading or coordinates unavailable</p>
            )}
          </div>
        )}

        {/* Predict Overlay */}
        {active === 'Predict' && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <button 
              className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full backdrop-blur-md"
              onClick={handleMap}
            >
              <X />
            </button>
            <h1 className="text-2xl font-bold text-white mb-2">Predict</h1>
            <p className="text-xl text-white">Prediction feature not yet implemented.</p>
          </div>
        )}

        {/* Search Overlay */}
        {activeSearch && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <form onSubmit={handleSearch} className="w-4/5 max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search city or postal code"
                  className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-white/70" size={18} />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500/70 hover:bg-blue-500/90 text-white font-bold py-2 rounded-xl transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-white text-lg font-medium">Loading Weather...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

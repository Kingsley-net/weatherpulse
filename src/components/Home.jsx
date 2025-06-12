import {
  House,
  MapPin,
  GitGraphIcon,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Times from './time';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const NAV_ITEMS = [
  { id: 'Home', label: 'Home', icon: <House size={22} /> },
  { id: 'Map', label: 'Map', icon: <MapPin size={22} /> },
  { id: 'Predict', label: 'Predict', icon: <GitGraphIcon size={22} /> },
];

function WeatherCard({ weatherdata, city, country }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 shadow-lg p-6 flex flex-col items-center gap-2 text-white min-w-[220px]">
      <div className="flex items-center gap-2">
        <MapPin className="opacity-80" />
        <span className="font-bold text-lg">{city || 'Loading...'}</span>
        <span className="text-xs opacity-70">{country || ''}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-5xl font-extrabold drop-shadow">{weatherdata.current?.temperature_2m ?? 'N/A'}°C</span>
        <span className="text-sm tracking-wide">Current Temperature</span>
      </div>
      <div className="flex gap-8 mt-3">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{weatherdata.current?.wind_direction_10m ?? 'N/A'}°</span>
          <span className="text-xs">Wind Dir</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{weatherdata.current?.wind_speed_10m ?? 'N/A'} km/h</span>
          <span className="text-xs">Wind Speed</span>
        </div>
      </div>
    </div>
  );
}

function ForecastChart({ weatherdata }) {
  if (!weatherdata?.hourly) return <p className="text-red-600">No data for graph</p>;
  const chartData = {
    labels: weatherdata.hourly.time.map((t) =>
      new Date(t).toLocaleString('en-US', { hour: 'numeric', hour12: true })
    ),
    datasets: [
      {
        label: 'Temp (°C)',
        data: weatherdata.hourly.temperature_2m,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.45,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#1f2937', font: { size: 10 } } },
      y: { ticks: { color: '#1f2937', font: { size: 10 } } },
    },
  };
  return (
    <div className="h-44 mt-2 rounded-xl bg-white/70 p-2">
      <Line data={chartData} options={options} />
    </div>
  );
}

export function Home() {
  const [active, setActive] = useState('Home');
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherdata, setWeatherData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [error, setError] = useState('');

  // Date formatting
  const date = new Date();
  const day = date.getDate();
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  useEffect(() => {
    // ... (keep your useEffect logic as is)
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
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,weather_code,snow_depth,precipitation,precipitation_probability,wind_speed_10m&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_hours=24`
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

      // Fetch weather data for new coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,weather_code,snow_depth,precipitation,precipitation_probability,wind_speed_10m&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_hours=24`
      );
      if (!weatherResponse.ok) throw new Error('Weather API failed');
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      setError('');
    } catch (error) {
      setError('Could not fetch data for this location');
    }
  };

  // Responsive sidebar (desktop) and bottom nav (mobile)
  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-blue-50 via-blue-200 to-blue-400 p-0 md:flex">
      {/* Sidebar for desktop */}
      <nav className="hidden md:flex flex-col items-center py-8 px-2 gap-5 bg-white/80 h-screen min-w-[70px] shadow-xl z-20">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
              active === item.id
                ? 'text-blue-700 bg-blue-100 shadow scale-110'
                : 'text-blue-900 opacity-70 hover:text-blue-700'
            }`}
            onClick={() => setActive(item.id)}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
        <button
          className="flex flex-col items-center gap-1 rounded-lg p-2 text-blue-900 opacity-70 hover:text-blue-700 mt-auto"
          onClick={() => setActiveSearch(true)}
          aria-label="Search"
        >
          <Search />
          <span className="text-xs">Search</span>
        </button>
      </nav>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0">
        {/* Header */}
        <header className="flex justify-between items-center py-3 px-4 rounded-b-xl bg-white/80 shadow mb-2 sticky top-0 z-10">
          <span className="font-extrabold text-xl tracking-widest text-blue-900">WeatherPulse</span>
          <span className="text-sm font-semibold text-blue-900">
            {dayOfWeek}, {day} {month}, {year}
          </span>
          <button
            className="md:hidden p-2 rounded text-blue-900"
            onClick={() => setActiveSearch(true)}
            aria-label="Search location"
          >
            <Search />
          </button>
        </header>

        {/* Weather Card and Forecast */}
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col gap-4 p-3">
          {error && (
            <div className="bg-red-100 text-red-700 font-semibold rounded-lg px-4 py-2">{error}</div>
          )}
          {weatherdata && !error && (
            <WeatherCard weatherdata={weatherdata} city={cityData} country={countryData} />
          )}

          {/* Main views */}
          <section className="mt-2">
            {active === 'Home' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-bold text-blue-900 mb-2">Today's Forecast</h2>
                  {weatherdata?.hourly ? (
                    <Times
                      hourlyTimes={weatherdata.hourly.time}
                      temperatures={weatherdata.hourly.temperature_2m}
                      weatherCode={weatherdata.hourly.weather_code}
                    />
                  ) : (
                    <p className="text-red-600">No hourly forecast data</p>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-blue-900 mb-2">Forecast Chart</h2>
                  <ForecastChart weatherdata={weatherdata} />
                </div>
              </div>
            )}

            {active === 'Map' && (
              <div className="fixed inset-0 z-30 bg-blue-950/85 flex flex-col items-center justify-center p-2">
                <button
                  className="absolute top-4 right-6 p-2 text-white rounded-full hover:bg-blue-900"
                  onClick={() => setActive('Home')}
                  aria-label="Close Map"
                >
                  <X />
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Map View</h2>
                <div className="w-full max-w-xl h-96 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                  {coordinates ? (
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
                  ) : (
                    <p className="text-red-100 text-center">Map loading or coordinates unavailable</p>
                  )}
                </div>
              </div>
            )}

            {active === 'Predict' && (
              <div className="fixed inset-0 z-40 bg-blue-950/85 flex flex-col items-center justify-center p-2">
                <button
                  className="absolute top-4 right-6 p-2 text-white rounded-full hover:bg-blue-900"
                  onClick={() => setActive('Home')}
                  aria-label="Close Prediction"
                >
                  <X />
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Prediction</h2>
                <p className="text-lg text-white opacity-80">Prediction feature not yet implemented.</p>
              </div>
            )}
          </section>
        </main>

        {/* Bottom nav for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-lg z-20 px-2 py-2 flex justify-around items-center border-t border-blue-200">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                active === item.id
                  ? 'text-blue-700 bg-blue-100 shadow scale-110'
                  : 'text-blue-900 opacity-70 hover:text-blue-700'
              }`}
              onClick={() => setActive(item.id)}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
          <button
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-blue-900 opacity-70 hover:text-blue-700"
            onClick={() => setActiveSearch(true)}
            aria-label="Search"
          >
            <Search />
            <span className="text-xs">Search</span>
          </button>
        </nav>

        {/* Search Overlay */}
        {activeSearch && (
          <div className="fixed inset-0 bg-blue-950/80 z-50 flex flex-col justify-center items-center">
            <form
              onSubmit={handleSearch}
              className="w-11/12 max-w-md bg-white/95 p-6 rounded-2xl shadow flex items-center gap-2"
            >
              <input
                type="search"
                placeholder="Search city or postal code"
                className="flex-1 border border-blue-400 rounded-lg px-3 py-2 text-blue-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Search
              </button>
            </form>
            <button
              className="absolute top-5 right-8 text-white bg-blue-700 hover:bg-blue-900 rounded-full p-2"
              onClick={() => setActiveSearch(false)}
              aria-label="Close Search"
            >
              <X />
            </button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-blue-200/80 flex justify-center items-center z-50">
            <p className="text-2xl text-blue-900 font-bold">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Droplet, Wind, Thermometer, Navigation } from 'lucide-react';
import Times from './time';
import { getWeatherImage, getDescription } from './unity';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Initialize Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function Home() {
  // Initialize with default data to prevent blank page
  const [weather, setWeather] = useState({
    data: {
      current_weather: {
        temperature: 22,
        windspeed: 10,
        winddirection: 180,
        weathercode: 0,
        time: new Date().toISOString()
      },
      hourly: {
        time: Array(24).fill().map((_, i) => new Date(Date.now() + i * 3600000).toISOString()),
        temperature_2m: Array(24).fill().map((_, i) => 20 + Math.sin(i / 3) * 5),
        weather_code: Array(24).fill().map((_, i) => [0, 1, 2, 3][i % 4])
      }
    },
    loading: false,
    error: '',
    location: {
      city: 'New York',
      country: 'USA'
    }
  });

  const [ui, setUi] = useState({
    activeView: 'dashboard',
    searchOpen: false,
    searchQuery: ''
  });

  // Simple fetch function - will work even if API fails
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get real data, but fallback to default if fails
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          const { latitude, longitude } = position.coords;
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          
          setWeather(prev => ({
            ...prev,
            data: weatherData,
            location: {
              city: 'Current Location',
              country: ''
            }
          }));
        }
      } catch (error) {
        console.log("Using default weather data");
      }
    };

    fetchData();
  }, []);

  // Chart configuration
  const chartData = useMemo(() => ({
    labels: weather.data.hourly.time.map(time => 
      new Date(time).getHours().toString().padStart(2, '0') + ':00'
    ).slice(0, 24),
    datasets: [{
      label: 'Temperature (°C)',
      data: weather.data.hourly.temperature_2m.slice(0, 24),
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
      fill: true
    }]
  }), [weather.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Weather App</h1>
        <button 
          onClick={() => setUi(prev => ({ ...prev, searchOpen: true }))}
          className="p-2 rounded-full hover:bg-gray-700"
        >
          <Search size={20} />
        </button>
      </header>

      {/* Main Weather Card */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{weather.location.city}</h2>
            <p className="text-gray-300">{weather.location.country}</p>
            <p className="text-5xl font-bold my-3">
              {weather.data.current_weather.temperature}°C
            </p>
            <p className="text-lg capitalize">
              {getDescription(weather.data.current_weather.weathercode)}
            </p>
          </div>
          <div className="w-20 h-20">
            {getWeatherImage(
              weather.data.current_weather.weathercode,
              weather.data.current_weather.time
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center text-gray-300">
              <Wind size={18} className="mr-2" />
              <span>Wind</span>
            </div>
            <p className="text-xl font-semibold">
              {weather.data.current_weather.windspeed} km/h
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center text-gray-300">
              <Navigation 
                size={18} 
                className="mr-2"
                style={{ transform: `rotate(${weather.data.current_weather.winddirection}deg)` }}
              />
              <span>Direction</span>
            </div>
            <p className="text-xl font-semibold">
              {weather.data.current_weather.winddirection}°
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
        <Times
          hourlyTimes={weather.data.hourly.time.slice(0, 24)}
          temperatures={weather.data.hourly.temperature_2m.slice(0, 24)}
          weatherCode={weather.data.hourly.weather_code.slice(0, 24)}
        />
      </div>

      {/* Temperature Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">24-Hour Trend</h3>
        <div className="h-64">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { tooltip: { enabled: true } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { grid: { color: 'rgba(255,255,255,0.1)' } }
            }
          }} />
        </div>
      </div>

      {/* Search Modal */}
      {ui.searchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-4">
            <form onSubmit={(e) => e.preventDefault()} className="mb-4">
              <input
                type="text"
                value={ui.searchQuery}
                onChange={(e) => setUi(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search location..."
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUi(prev => ({ ...prev, searchOpen: false }))}
                  className="px-4 py-2 rounded-lg bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
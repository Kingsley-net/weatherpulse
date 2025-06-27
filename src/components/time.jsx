export default function Times({ hourlyTimes, temperatures, weatherCode }) {
  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // === MODERN FLAT WEATHER ICONS ===

  const size = 64;

  const SunnyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" fill="#fde047" />
      <g stroke="#facc15">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );

  const CloudyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17a5 5 0 0110 0h1a4 4 0 010 8H6a4 4 0 010-8h1" fill="#cbd5e1" />
    </svg>
  );

  const PartlyCloudyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="7" r="4" fill="#fde047" />
      <path d="M5 17a5 5 0 0110 0h1a4 4 0 010 8H6a4 4 0 010-8h1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );

  const RainyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 17a5 5 0 0110 0h1a4 4 0 010 8H6a4 4 0 010-8h1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <line x1="8" y1="22" x2="8" y2="24" stroke="#38bdf8" strokeWidth="2" />
      <line x1="12" y1="22" x2="12" y2="24" stroke="#38bdf8" strokeWidth="2" />
      <line x1="16" y1="22" x2="16" y2="24" stroke="#38bdf8" strokeWidth="2" />
    </svg>
  );

  const SnowyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 17a5 5 0 0110 0h1a4 4 0 010 8H6a4 4 0 010-8h1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <g stroke="#a5f3fc" strokeWidth="2">
        <line x1="8" y1="22" x2="8" y2="24" />
        <line x1="12" y1="22" x2="12" y2="24" />
        <line x1="16" y1="22" x2="16" y2="24" />
      </g>
    </svg>
  );

  const ThunderstormIcon = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 17a5 5 0 0110 0h1a4 4 0 010 8H6a4 4 0 010-8h1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <polygon points="12,20 10,24 14,24 12,28" fill="#facc15" />
    </svg>
  );

  // === UTIL FUNCTIONS ===

  const isNight = (isoTime) => {
    try {
      const date = new Date(isoTime);
      const hour = parseInt(date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false
      }), 10);
      return hour >= 18 || hour < 6;
    } catch {
      return false;
    }
  };

  const getWeatherImage = (code, time) => {
    const night = isNight(time);
    switch (code) {
      case 0: return <SunnyIcon />;
      case 1:
      case 2: return <PartlyCloudyIcon />;
      case 3:
      case 45:
      case 48: return <CloudyIcon />;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82: return <RainyIcon />;
      case 71:
      case 73:
      case 75:
      case 85:
      case 86: return <SnowyIcon />;
      case 95:
      case 96:
      case 99: return <ThunderstormIcon />;
      default:
        console.warn(`Unknown weather code: ${code}`);
        return <CloudyIcon />;
    }
  };

  // === VALIDATION ===

  if (!Array.isArray(hourlyTimes) || !Array.isArray(temperatures) || !Array.isArray(weatherCode)) {
    return <div className="text-red-500">No weather data available</div>;
  }

  // === RENDER ===

  return (
    <div className="flex overflow-scroll">
      {hourlyTimes.map((time, index) => (
        <div
          key={index}
          className="relative bg-white/40 backdrop-blur-3xl h-30 mr-2 min-w-1/5 rounded-lg text-white flex flex-col items-center justify-around font-bold p-2"
        >
          <p>{formatTime(time)}</p>
          <div>{getWeatherImage(weatherCode[index], time)}</div>
          <p>{temperatures[index]}°C</p>
        </div>
      ))}
    </div>
  );
}

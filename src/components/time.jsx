import cloud from './images/cloudy.png';
import sunny from './images/sunny.png';
import partial from './images/partial.png';
import rainy from './images/rainy.png';
import snowy from './images/snow.png';
import thunderstorm from './images/thunderstorm.png';
import sunnyc from './images/sunnyc.png';
import nightc from './images/nightc.png';
import moon from './images/moon.png';

export default function Times({ hourlyTimes, temperatures, weatherCode }) {
  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleString('en-US', {
      timeZone: 'America/New_York', // Change to your time zone
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };


const ColorfulWeatherIcons = () => {
  // Colorful SVG Weather Icons
  const SunnyIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      {/* Sun rays */}
      <g stroke="#FFA500" strokeWidth="3" strokeLinecap="round">
        <line x1="50" y1="10" x2="50" y2="20" />
        <line x1="50" y1="80" x2="50" y2="90" />
        <line x1="10" y1="50" x2="20" y2="50" />
        <line x1="80" y1="50" x2="90" y2="50" />
        <line x1="21.7" y1="21.7" x2="28.3" y2="28.3" />
        <line x1="71.7" y1="71.7" x2="78.3" y2="78.3" />
        <line x1="78.3" y1="21.7" x2="71.7" y2="28.3" />
        <line x1="28.3" y1="71.7" x2="21.7" y2="78.3" />
      </g>
      {/* Sun body */}
      <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="#FFFF00" opacity="0.8" />
    </svg>
  );

  const CloudyIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6F3FF" />
          <stop offset="100%" stopColor="#B8D4F0" />
        </linearGradient>
      </defs>
      {/* Large cloud */}
      <ellipse cx="50" cy="45" rx="25" ry="15" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="35" cy="50" rx="18" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="65" cy="50" rx="18" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="50" cy="55" rx="30" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
    </svg>
  );

  const RainyIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="rainCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D3D3D3" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      {/* Rain cloud */}
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      
      {/* Rain drops */}
      <g stroke="#4169E1" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <line x1="35" y1="55" x2="32" y2="70" />
        <line x1="45" y1="58" x2="42" y2="73" />
        <line x1="55" y1="55" x2="52" y2="70" />
        <line x1="65" y1="58" x2="62" y2="73" />
        <line x1="40" y1="52" x2="37" y2="67" />
        <line x1="60" y1="52" x2="57" y2="67" />
      </g>
    </svg>
  );

  const SnowyIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="snowCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F8FF" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
      </defs>
      {/* Snow cloud */}
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      
      {/* Snowflakes */}
      <g fill="#FFFFFF" stroke="#E6E6FA" strokeWidth="1">
        <circle cx="35" cy="60" r="3" />
        <circle cx="45" cy="65" r="2.5" />
        <circle cx="55" cy="58" r="3" />
        <circle cx="65" cy="63" r="2.5" />
        <circle cx="40" cy="72" r="2" />
        <circle cx="60" cy="70" r="2" />
      </g>
    </svg>
  );

  const ThunderstormIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="stormCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2F4F4F" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      {/* Storm cloud */}
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      
      {/* Lightning bolt */}
      <path d="M45 55 L52 55 L48 65 L55 65 L45 80 L50 70 L45 70 Z" 
            fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
    </svg>
  );

  const PartlyCloudyIcon = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="partlyCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6F3FF" />
          <stop offset="100%" stopColor="#B8D4F0" />
        </linearGradient>
      </defs>
      {/* Sun behind cloud */}
      <circle cx="35" cy="35" r="15" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
      <circle cx="35" cy="35" r="10" fill="#FFFF00" opacity="0.8" />
      
      {/* Cloud */}
      <ellipse cx="55" cy="45" rx="20" ry="12" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="45" cy="50" rx="15" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="65" cy="50" rx="15" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="55" cy="55" rx="25" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
    </svg>
  );
  // Check if it's nighttime (6 PM to 6 AM)
  const isNight = (isoTime) => {
    try {
      const date = new Date(isoTime);
      if (isNaN(date.getTime())) {
        console.error(`Invalid ISO time: ${isoTime}`);
        return false; // Default to daytime if time is invalid
      }
      const hour = date.toLocaleString('en-US', { 
        timeZone: 'America/New_York', // Ensure consistent time zone
        hour: 'numeric', 
        hour12: false 
      });
      const parsedHour = parseInt(hour, 10);
      console.log(`Time: ${isoTime}, Hour: ${parsedHour}, Night: ${parsedHour >= 18 || parsedHour < 6}`);
      return parsedHour >= 18 || parsedHour < 6; // Nighttime from 6 PM to 6 AM
    } catch (error) {
      console.error(`Error parsing time: ${isoTime}`, error);
      return false; // Default to daytime on error
    }
  };

  // Pick image based on weather code and time of day
  const getWeatherImage = (code, time) => {
    const night = isNight(time);
      switch (code) {
        case 0: // Clear sky
          return <SunnyIcon size={size} />;
        case 1:
        case 2: // Partly cloudy
          return <PartlyCloudyIcon size={size} />;
        case 3: // Overcast
          return <CloudyIcon size={size} />;
        case 45:
        case 48: // Fog - using cloudy for now
          return <CloudyIcon size={size} />;
        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82: // Rain and drizzle
          return <RainyIcon size={size} />;
        case 71:
        case 73:
        case 75:
        case 85:
        case 86: // Snow
          return <SnowyIcon size={size} />;
        case 95:
        case 96:
        case 99: // Thunderstorm
          return <ThunderstormIcon size={size} />;
        default:
          return <CloudyIcon size={size} />;
      }

      
  };


  // Check if data is missing
  if (
    !hourlyTimes ||
    !Array.isArray(hourlyTimes) ||
    !temperatures ||
    !Array.isArray(temperatures) ||
    !weatherCode ||
    !Array.isArray(weatherCode)
  ) {
    return <div className="text-red-500">No weather data available</div>;
  }

  return (
    <div className="flex overflow-scroll">
      {hourlyTimes.map((time, index) => (
        <div
          key={index}
          className="relative bg-white/40 backdrop-blur-3xl  h-30 mr-2 min-w-1/5 rounded-lg text-white flex flex-col items-center justify-around font-bold"
        >
          <p>{formatTime(time)}</p>
          <p>{getWeatherImage(weatherCode[index], time)}</p>
          <p className=''>{temperatures[index]}°C</p>
        </div>
      ))}
    </div>
  );
}






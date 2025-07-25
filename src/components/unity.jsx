export const isNight = (isoTime) => {
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

export const getWeatherImage = (code, time) => {
    const night = isNight(time);
    switch (code) {
      case 0: return night ? <MoonIcon /> : <SunnyIcon />;
      case 1:
      case 2: return night ? <PartlyCloudyNightIcon /> : <PartlyCloudyIcon />;
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
      default: return <CloudyIcon />;
    }
  };

export const getDescription = (code) => {
    switch (code) {
      case 0: return "Clear";
      case 1:
      case 2: return "Partly Cloudy";
      case 3:
      case 45:
      case 48: return "Cloudy";
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82: return "Rainy";
      case 71:
      case 73:
      case 75:
      case 85:
      case 86: return "Snowy";
      case 95:
      case 96:
      case 99: return "Thunderstorm";
      default: return "Unknown";
    }
  };

// === SVG ICONS ===

const size = 48; // Reduced size for better card fit

export const SunnyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
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
      <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="#FFFF00" opacity="0.8" />
    </svg>
  );

export const MoonIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F8FF" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="20" fill="url(#moonGradient)" stroke="#A9A9A9" strokeWidth="2" />
      <circle cx="45" cy="45" r="3" fill="#D3D3D3" opacity="0.7" />
      <circle cx="55" cy="40" r="2" fill="#D3D3D3" opacity="0.7" />
      <circle cx="60" cy="55" r="2.5" fill="#D3D3D3" opacity="0.7" />
      <circle cx="40" cy="55" r="1.5" fill="#D3D3D3" opacity="0.7" />
    </svg>
  );

export const CloudyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6F3FF" />
          <stop offset="100%" stopColor="#B8D4F0" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="45" rx="25" ry="15" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="35" cy="50" rx="18" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="65" cy="50" rx="18" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="50" cy="55" rx="30" ry="12" fill="url(#cloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
    </svg>
  );

export const RainyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="rainCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D3D3D3" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#rainCloudGradient)" stroke="#696969" strokeWidth="1" />
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

export const SnowyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="snowCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F8FF" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#snowCloudGradient)" stroke="#A9A9A9" strokeWidth="1" />
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

export const ThunderstormIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="stormCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2F4F4F" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="35" rx="25" ry="15" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="35" cy="40" rx="18" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="65" cy="40" rx="18" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <ellipse cx="50" cy="45" rx="30" ry="12" fill="url(#stormCloudGradient)" stroke="#191970" strokeWidth="1" />
      <path d="M45 55 L52 55 L48 65 L55 65 L45 80 L50 70 L45 70 Z" 
            fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
    </svg>
  );

export const PartlyCloudyIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="partlyCloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6F3FF" />
          <stop offset="100%" stopColor="#B8D4F0" />
        </linearGradient>
      </defs>
      <circle cx="35" cy="35" r="15" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
      <circle cx="35" cy="35" r="10" fill="#FFFF00" opacity="0.8" />
      <ellipse cx="55" cy="45" rx="20" ry="12" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="45" cy="50" rx="15" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="65" cy="50" rx="15" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="55" cy="55" rx="25" ry="10" fill="url(#partlyCloudGradient)" stroke="#A0C4E0" strokeWidth="1" />
    </svg>
  );

export const PartlyCloudyNightIcon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="partlyCloudNightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6F3FF" />
          <stop offset="100%" stopColor="#B8D4F0" />
        </linearGradient>
        <linearGradient id="nightMoonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F8FF" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
      </defs>
      <circle cx="35" cy="35" r="12" fill="url(#nightMoonGradient)" stroke="#A9A9A9" strokeWidth="1" />
      <circle cx="32" cy="32" r="2" fill="#D3D3D3" opacity="0.7" />
      <circle cx="38" cy="30" r="1.5" fill="#D3D3D3" opacity="0.7" />
      <ellipse cx="55" cy="45" rx="20" ry="12" fill="url(#partlyCloudNightGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="45" cy="50" rx="15" ry="10" fill="url(#partlyCloudNightGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="65" cy="50" rx="15" ry="10" fill="url(#partlyCloudNightGradient)" stroke="#A0C4E0" strokeWidth="1" />
      <ellipse cx="55" cy="55" rx="25" ry="10" fill="url(#partlyCloudNightGradient)" stroke="#A0C4E0" strokeWidth="1" />
    </svg>
  );
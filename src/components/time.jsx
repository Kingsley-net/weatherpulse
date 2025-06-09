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
    
    if (code <= 1) return night ? moon : sunny; // 0, 1 = Moon at night, Sunny during day
    if (code === 2 || code === 3) return night ? nightc : sunnyc; // 2, 3 = Nightc at night, Sunnyc during day
    if (code === 51 || code === 61) return rainy; // 51, 61 = Rainy
    if (code === 71 || code === 73) return snowy; // 71, 73 = Snowy
    if (code === 95 || code === 96) return thunderstorm; // 95, 96 = Thunderstorm
    return cloud; // Anything else = Unknown
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
          className="relative bg-blue-400 h-30 mr-2 min-w-1/5 rounded-lg text-white flex flex-col items-center justify-around font-bold"
        >
          <p>{formatTime(time)}</p>
          <img src={getWeatherImage(weatherCode[index], time)} className="w-16" />
          <p className=''>{temperatures[index]}°C</p>
        </div>
      ))}
    </div>
  );
}
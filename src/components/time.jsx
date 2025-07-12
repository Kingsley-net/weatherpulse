import { getWeatherImage, getDescription } from './unity';

export default function Times({ hourlyTimes, temperatures, weatherCode }) {
  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };



    


  if (!Array.isArray(hourlyTimes) || !Array.isArray(temperatures) || !Array.isArray(weatherCode)) {
    return <div className="text-red-500">No weather data available</div>;
  }

  return (
    <div className="flex gap-3 overflow-x-scroll scrollbar-hide pb-2">
      {hourlyTimes.map((time, index) => (
        <div
          key={index}
          className="flex-shrink-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 w-24 h-32 flex flex-col items-center justify-between text-center shadow-lg"
        >
          <p className="text-xs font-medium text-blue-100">{formatTime(time)}</p>
          <div className="flex-1 flex items-center justify-center">
            {getWeatherImage(weatherCode[index], time)}
          </div>
          <p className="text-xs text-blue-200 mb-1">{getDescription(weatherCode[index])}</p>
          <p className="text-sm font-bold text-white">{temperatures[index]}°C</p>
        </div>
      ))}
    </div>
  );
}

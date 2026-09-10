import React from 'react';
import { Sun, Snowflake, CloudRain, CloudFog, CloudSun, Flame, Waves } from 'lucide-react';
import { Season, WeatherCondition } from '../types';
import {
  playRainSound,
  playWinterWind,
  playSummerBreeze,
  playWildfireSound,
  playFloodSound,
} from '../utils/audio';

interface WeatherSeasonControlsProps {
  season: Season;
  weather: WeatherCondition;
  onSeasonChange: (season: Season) => void;
  onWeatherChange: (weather: WeatherCondition) => void;
}

export const WeatherSeasonControls: React.FC<WeatherSeasonControlsProps> = ({
  season,
  weather,
  onSeasonChange,
  onWeatherChange,
}) => {
  const handleSeasonSelect = (newSeason: Season) => {
    onSeasonChange(newSeason);
    if (newSeason === 'winter') {
      playWinterWind();
      onWeatherChange('snow'); // Winter automatically activates snow and snow cover
    } else {
      playSummerBreeze();
      onWeatherChange('clear'); // Summer automatically activates sunny weather
    }
  };

  const handleWeatherSelect = (newWeather: WeatherCondition) => {
    onWeatherChange(newWeather);
    if (newWeather === 'rain') {
      playRainSound();
    } else if (newWeather === 'snow') {
      onSeasonChange('winter');
      playWinterWind();
    } else if (newWeather === 'clear') {
      onSeasonChange('summer');
      playSummerBreeze();
    } else if (newWeather === 'wildfire') {
      playWildfireSound();
    } else if (newWeather === 'flood') {
      playFloodSound();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl text-white">
      {/* Season Segmented Control */}
      <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
        <button
          id="btn-season-summer"
          onClick={() => handleSeasonSelect('summer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            season === 'summer'
              ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Summer Season: Warm sunlight, foxy red roe deer, lush aquatic foraging"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Summer</span>
        </button>

        <button
          id="btn-season-winter"
          onClick={() => handleSeasonSelect('winter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            season === 'winter'
              ? 'bg-sky-500/30 text-sky-200 border border-sky-400/50 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Winter Season: Snowfall, frosty lake rim, thick winter coats & breath vapor"
        >
          <Snowflake className="w-3.5 h-3.5 text-sky-300" />
          <span>Winter</span>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-white/15 hidden sm:block" />

      {/* Weather Selector Buttons */}
      <div className="flex items-center gap-1">
        <button
          id="btn-weather-clear"
          onClick={() => handleWeatherSelect('clear')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'clear'
              ? 'bg-amber-500/25 border-amber-400/40 text-amber-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Clear / Sunny Weather"
        >
          <CloudSun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Sunny</span>
        </button>

        <button
          id="btn-weather-rain"
          onClick={() => handleWeatherSelect('rain')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'rain'
              ? 'bg-blue-500/25 border-blue-400/40 text-blue-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Rain Shower"
        >
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Rain</span>
        </button>

        <button
          id="btn-weather-snow"
          onClick={() => handleWeatherSelect('snow')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'snow'
              ? 'bg-cyan-500/25 border-cyan-400/40 text-cyan-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Snowfall"
        >
          <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">Snow</span>
        </button>

        <button
          id="btn-weather-fog"
          onClick={() => handleWeatherSelect('fog')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'fog'
              ? 'bg-slate-500/30 border-slate-400/40 text-slate-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Atmospheric Lake Mist & Fog"
        >
          <CloudFog className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Mist</span>
        </button>

        {/* Wildfire Scenario */}
        <button
          id="btn-weather-wildfire"
          onClick={() => handleWeatherSelect('wildfire')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'wildfire'
              ? 'bg-orange-600/30 border-orange-500/60 text-orange-200 shadow-md shadow-orange-950/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Wildfire Scenario: Forest firefront, dark smoke plumes, flying embers & sparks"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span className="hidden sm:inline">Wildfire</span>
        </button>

        {/* Flood Scenario */}
        <button
          id="btn-weather-flood"
          onClick={() => handleWeatherSelect('flood')}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
            weather === 'flood'
              ? 'bg-cyan-700/35 border-cyan-400/60 text-cyan-200 shadow-md shadow-cyan-950/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Flood Scenario: Surging water levels, swift river currents, churning rapids & debris"
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Flood</span>
        </button>
      </div>
    </div>
  );
};

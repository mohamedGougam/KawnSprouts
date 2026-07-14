export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy';
export type TimeTheme = 'day' | 'evening' | 'night';

export interface AtmosphereState {
  season: Season;
  weather: Weather;
  theme: TimeTheme;
  mistOpacity: number;
  goldenHour: boolean;
  fireflies: boolean;
  lanternsLit: boolean;
  showRainbow: boolean;
}

export function getSeasonFromDate(date = new Date()): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getWeatherFromSeed(seed: number): Weather {
  const roll = seed % 100;
  if (roll < 55) return 'sunny';
  if (roll < 72) return 'cloudy';
  if (roll < 82) return 'windy';
  if (roll < 92) return 'rain';
  return 'snow';
}

export function buildAtmosphere(theme: TimeTheme, date = new Date()): AtmosphereState {
  const season = getSeasonFromDate(date);
  const daySeed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate();
  const weather = getWeatherFromSeed(daySeed);

  return {
    season,
    weather,
    theme,
    mistOpacity: theme === 'day' && season !== 'summer' ? 0.25 : 0.1,
    goldenHour: theme === 'evening',
    fireflies: theme === 'night' && (season === 'summer' || season === 'spring'),
    lanternsLit: theme === 'evening' || theme === 'night',
    showRainbow: weather === 'rain' && theme === 'day',
  };
}

export function getSeasonGrassGradient(season: Season): string {
  switch (season) {
    case 'spring':
      return 'linear-gradient(180deg,#bbf7d0,#86efac)';
    case 'summer':
      return 'linear-gradient(180deg,#a3e635,#4ade80)';
    case 'autumn':
      return 'linear-gradient(180deg,#fde68a,#86efac)';
    case 'winter':
      return 'linear-gradient(180deg,#e2e8f0,#cbd5e1)';
  }
}

export function getSkyGradient(theme: TimeTheme, season: Season): string {
  if (theme === 'night') {
    return season === 'winter'
      ? 'linear-gradient(180deg,#0f172a 0%,#1e3a5f 45%,#14532d 100%)'
      : 'linear-gradient(180deg,#1e1b4b 0%,#312e81 40%,#14532d 100%)';
  }
  if (theme === 'evening') {
    return 'linear-gradient(180deg,#fb923c 0%,#fda4af 35%,#86efac 100%)';
  }
  if (season === 'autumn') return 'linear-gradient(180deg,#fdba74 0%,#fef08a 40%,#86efac 100%)';
  if (season === 'winter') return 'linear-gradient(180deg,#e0f2fe 0%,#f1f5f9 50%,#d1fae5 100%)';
  return 'linear-gradient(180deg,#7dd3fc 0%,#bae6fd 45%,#bbf7d0 100%)';
}

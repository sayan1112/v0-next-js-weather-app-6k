const BASE_URL = 'https://api.weatherapi.com/v1'

export interface WeatherCondition {
  text: string
  icon: string
  code: number
}

export interface CurrentWeather {
  last_updated_epoch: number
  last_updated: string
  temp_c: number
  temp_f: number
  is_day: number
  condition: WeatherCondition
  wind_kph: number
  wind_mph: number
  wind_degree: number
  wind_dir: string
  pressure_mb: number
  pressure_in: number
  precip_mm: number
  precip_in: number
  humidity: number
  cloud: number
  feelslike_c: number
  feelslike_f: number
  windchill_c: number
  windchill_f: number
  heatindex_c: number
  heatindex_f: number
  dewpoint_c: number
  dewpoint_f: number
  vis_km: number
  vis_miles: number
  uv: number
  gust_kph: number
  gust_mph: number
}

export interface LocationData {
  name: string
  region: string
  country: string
  lat: number
  lon: number
  tz_id: string
  localtime_epoch: number
  localtime: string
}

export interface WeatherData {
  location: LocationData
  current: CurrentWeather
}

export interface ForecastDay {
  date: string
  date_epoch: number
  day: {
    maxtemp_c: number
    maxtemp_f: number
    mintemp_c: number
    mintemp_f: number
    avgtemp_c: number
    avgtemp_f: number
    maxwind_kph: number
    maxwind_mph: number
    totalprecip_mm: number
    totalprecip_in: number
    totalsnow_cm: number
    avgvis_km: number
    avgvis_miles: number
    avghumidity: number
    daily_will_it_rain: number
    daily_chance_of_rain: number
    daily_will_it_snow: number
    daily_chance_of_snow: number
    condition: WeatherCondition
    uv: number
  }
  astro: {
    sunrise: string
    sunset: string
    moonrise: string
    moonset: string
    moon_phase: string
    moon_illumination: number
    is_moon_up: number
    is_sun_up: number
  }
  hour: Array<{
    time_epoch: number
    time: string
    temp_c: number
    temp_f: number
    is_day: number
    condition: WeatherCondition
    wind_kph: number
    wind_mph: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    windchill_c: number
    windchill_f: number
    heatindex_c: number
    heatindex_f: number
    dewpoint_c: number
    dewpoint_f: number
    precip_mm: number
    precip_in: number
    snow_cm: number
    snow_in: number
    will_it_rain: number
    chance_of_rain: number
    will_it_snow: number
    chance_of_snow: number
    vis_km: number
    vis_miles: number
    gust_kph: number
    gust_mph: number
    uv: number
  }>
}

export interface ForecastData {
  location: LocationData
  forecast: {
    forecastday: ForecastDay[]
  }
}

export async function fetchWeatherByCity(city: string, apiKey: string): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`
  )

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('City not found')
    }
    throw new Error('Failed to fetch weather data')
  }

  return response.json()
}

export async function fetchForecastByCity(city: string, apiKey: string, days: number = 5): Promise<ForecastData> {
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=no`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch forecast data')
  }

  return response.json()
}

export async function fetchWeatherByCoordinates(
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  return response.json()
}

export function getWeatherConditionText(text: string): string {
  const conditionMap: Record<string, string> = {
    'Sunny': 'sun',
    'Clear': 'moon',
    'Partly cloudy': 'cloud-sun',
    'Cloudy': 'cloud',
    'Overcast': 'clouds',
    'Mist': 'cloud-fog',
    'Patchy rain nearby': 'cloud-rain',
    'Patchy snow nearby': 'cloud-snow',
    'Patchy sleet nearby': 'cloud-rain-wind',
    'Patchy freezing drizzle nearby': 'cloud-fog',
    'Drizzle': 'cloud-drizzle',
    'Light rain': 'cloud-rain',
    'Moderate rain at times': 'cloud-rain-wind',
    'Moderate rain': 'cloud-rain-wind',
    'Heavy rain at times': 'cloud-lightning-rain',
    'Heavy rain': 'cloud-lightning-rain',
    'Light freezing rain': 'cloud-rain',
    'Moderate or heavy freezing rain': 'cloud-rain',
    'Light sleet': 'cloud-rain-wind',
    'Moderate or heavy sleet': 'cloud-rain-wind',
    'Light snow': 'cloud-snow',
    'Patchy light snow': 'cloud-snow',
    'Light snow showers': 'cloud-snow',
    'Moderate snow': 'cloud-snow',
    'Patchy moderate snow': 'cloud-snow',
    'Heavy snow': 'cloud-snow',
    'Patchy heavy snow': 'cloud-snow',
    'Heavy snow showers': 'cloud-snow',
    'Blizzard': 'cloud-snow',
    'Patchy light rain with thunder': 'cloud-lightning-rain',
    'Moderate or heavy rain with thunder': 'cloud-lightning-rain',
    'Patchy light snow with thunder': 'cloud-lightning-rain',
    'Moderate or heavy snow with thunder': 'cloud-lightning-rain',
    'Thundery outbreaks possible': 'cloud-lightning',
  }
  
  return conditionMap[text] || 'cloud'
}

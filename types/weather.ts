/**
 * NASA-GRADE GLOBAL WEATHER INTELLIGENCE TYPES
 * v2.0.0 - Production Specification
 */

export interface LocationCoordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
  "gb-defra-index": number;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  is_day: boolean;
  condition: WeatherCondition;
  last_updated_epoch?: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  uv: number;
  vis_km: number;
  air_quality?: AirQuality;
}

export interface ForecastHour {
  time_epoch: number;
  time: string;
  temp_c: number;
  condition: WeatherCondition;
  chance_of_rain: number;
  wind_kph: number;
  is_day: boolean;
}

export interface ForecastDay {
  date: string;
  maxtemp_c: number;
  mintemp_c: number;
  condition: WeatherCondition;
  avg_humidity: number;
  daily_chance_of_rain: number;
  uv: number;
  sunrise: string;
  sunset: string;
  hours: ForecastHour[];
}

/**
 * STRATEGIC INTELLIGENCE INTERFACES
 */
export interface MeteorologicalExplanation {
  headline: string;
  reasoning: string;
  cause_effect: {
    cause: string;
    effect: string;
  };
}

export interface DecisionInsight {
  label: string;
  score: number; // 0-100
  status: 'OPTIMAL' | 'CAUTION' | 'DANGER';
  advice: string;
}

export interface WeatherIntelligence {
  explanation: MeteorologicalExplanation;
  insights: {
    running: DecisionInsight;
    photography: DecisionInsight;
    travel: DecisionInsight;
    aviation: DecisionInsight;
  };
}

export interface LocationMetadata {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  localtime: string;
}

export interface WeatherResponse {
  location: LocationMetadata;
  current: CurrentWeather;
  forecast: ForecastDay[];
  intelligence: WeatherIntelligence;
}

export interface ApiError {
  error: string;
  code: number;
  details?: any;
}

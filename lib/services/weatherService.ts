import { 
  WeatherResponse, 
  CurrentWeather, 
  ForecastDay, 
  LocationMetadata, 
  WeatherIntelligence,
  DecisionInsight,
  MeteorologicalExplanation
} from '@/types/weather';

/**
 * STRATEGIC WEATHER SERVICE - v2.0.0
 * Features: Intelligence Engine, Air Quality, Advanced Transformation
 */

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

export class WeatherService {
  static async getFullWeather(query: string): Promise<WeatherResponse> {
    if (!API_KEY) throw new Error('WEATHER_API_KEY_CONFIG_MISSING');

    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 900 }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `MET_API_ERROR_${response.status}`);
      }

      const data = await response.json();
      return this.transformResponse(data);
    } catch (error) {
      console.error('[WeatherService] Critical Sync Failure:', error);
      throw error;
    }
  }

  private static transformResponse(data: any): WeatherResponse {
    const location: LocationMetadata = {
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
      timezone: data.location.tz_id,
      localtime: data.location.localtime,
    };

    const current: CurrentWeather = {
      temp_c: data.current.temp_c,
      temp_f: data.current.temp_f,
      is_day: !!data.current.is_day,
      condition: data.current.condition,
      last_updated_epoch: data.current.last_updated_epoch,
      wind_kph: data.current.wind_kph,
      wind_degree: data.current.wind_degree,
      wind_dir: data.current.wind_dir,
      pressure_mb: data.current.pressure_mb,
      humidity: data.current.humidity,
      cloud: data.current.cloud,
      feelslike_c: data.current.feelslike_c,
      uv: data.current.uv,
      vis_km: data.current.vis_km,
      air_quality: data.current.air_quality
    };

    const forecast: ForecastDay[] = data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      maxtemp_c: day.day.maxtemp_c,
      mintemp_c: day.day.mintemp_c,
      condition: day.day.condition,
      avg_humidity: day.day.avghumidity,
      daily_chance_of_rain: day.day.daily_chance_of_rain,
      uv: day.day.uv,
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      hours: day.hour.map((h: any) => ({
        time_epoch: h.time_epoch,
        time: h.time,
        temp_c: h.temp_c,
        condition: h.condition,
        chance_of_rain: h.chance_of_rain,
        wind_kph: h.wind_kph,
        is_day: !!h.is_day,
      })),
    }));

    return { 
      location, 
      current, 
      forecast,
      intelligence: this.generateIntelligence(current, forecast[0])
    };
  }

  /**
   * CORE INTELLIGENCE ENGINE
   * Generates explainable weather insights using atmospheric logic
   */
  private static generateIntelligence(curr: CurrentWeather, today: ForecastDay): WeatherIntelligence {
    const isRaining = curr.condition.text.toLowerCase().includes('rain');
    const isStormy = curr.condition.text.toLowerCase().includes('thunder');
    const isWindy = curr.wind_kph > 30;
    const isHot = curr.temp_c > 32;
    const isCold = curr.temp_c < 5;

    // 1. Meteorological Explanation
    let headline = "Stable Atmospheric Conditions";
    let reasoning = "The local atmosphere is currently exhibiting high stability with balanced pressure systems.";
    let cause = "Normal surface heating and low pressure gradient.";
    let effect = "Ideal conditions for general mobility and outdoor exposure.";

    if (isRaining) {
      headline = "Active Precipitation Cycle";
      reasoning = `A moisture-heavy air mass has reached the dew point, causing condensation and gravity-driven precipitation.`;
      cause = "Significant humidity coupled with local cooling.";
      effect = "Reduced visibility and surface friction.";
    } else if (isWindy) {
      headline = "High Pressure Gradient";
      reasoning = "The atmosphere is rapidly equalizing between high and low pressure zones, creating significant airflow.";
      cause = "Steep pressure change over a short horizontal distance.";
      effect = "Increased wind chill and potential for debris transport.";
    } else if (isHot) {
      headline = "Solar Radiation Peak";
      reasoning = "High solar intensity combined with stagnant air is creating a localized thermal dome.";
      cause = "Direct UV exposure and low convective cooling.";
      effect = "Elevated heat stress and rapid fluid loss.";
    }

    // 2. Decision Insights
    return {
      explanation: { headline, reasoning, cause_effect: { cause, effect } },
      insights: {
        running: this.calculateRunning(curr),
        photography: this.calculatePhotography(curr),
        travel: this.calculateTravel(curr),
        aviation: this.calculateAviation(curr)
      }
    };
  }

  private static calculateRunning(c: CurrentWeather): DecisionInsight {
    let score = 90;
    if (c.temp_c > 28) score -= 30;
    if (c.humidity > 70) score -= 20;
    if (c.wind_kph > 20) score -= 15;
    if (c.condition.text.includes('Rain')) score -= 40;

    return {
      label: 'Endurance Score',
      score: Math.max(0, score),
      status: score > 70 ? 'OPTIMAL' : score > 40 ? 'CAUTION' : 'DANGER',
      advice: score > 70 ? 'Perfect for high-intensity training.' : 'Hydrate aggressively and reduce pace.'
    };
  }

  private static calculatePhotography(c: CurrentWeather): DecisionInsight {
    let score = 50;
    if (c.cloud > 20 && c.cloud < 60) score = 95; // Golden clouds
    if (c.vis_km > 15) score += 10;
    if (c.uv > 7) score -= 20; // Harsh light

    return {
      label: 'Diffusion Index',
      score: Math.min(100, score),
      status: score > 80 ? 'OPTIMAL' : score > 50 ? 'CAUTION' : 'DANGER',
      advice: score > 80 ? 'Excellent soft light and dramatic sky textures.' : 'Harsh contrast expected. Use ND filters.'
    };
  }

  private static calculateTravel(c: CurrentWeather): DecisionInsight {
    let score = 100;
    if (c.vis_km < 5) score -= 50;
    if (c.wind_kph > 40) score -= 30;
    if (c.condition.text.includes('Heavy')) score -= 50;

    return {
      label: 'Mobility Safety',
      score: Math.max(0, score),
      status: score > 70 ? 'OPTIMAL' : score > 30 ? 'CAUTION' : 'DANGER',
      advice: score > 70 ? 'Nominal road and rail conditions.' : 'Significant delays and visibility hazards reported.'
    };
  }

  private static calculateAviation(c: CurrentWeather): DecisionInsight {
    let score = 100;
    if (c.wind_kph > 25) score -= 40;
    if (c.cloud > 80) score -= 30;
    if (c.vis_km < 3) score -= 80;

    return {
      label: 'Flight Clearances',
      score: Math.max(0, score),
      status: score > 80 ? 'OPTIMAL' : score > 50 ? 'CAUTION' : 'DANGER',
      advice: score > 80 ? 'VFR conditions sustained.' : 'IFR protocols likely. High turbulence probability.'
    };
  }
}

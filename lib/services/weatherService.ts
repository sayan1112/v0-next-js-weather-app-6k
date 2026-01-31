import { WeatherResponse } from '@/types/weather'
import { cacheService } from './cacheService'

const BASE_URL = 'https://api.weatherapi.com/v1'

/**
 * Weather Service - Centralized weather data fetching with caching
 * Ensures accurate weather data and reduces API calls
 */

export class WeatherService {
  private static getApiKey(): string {
    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
      throw new Error('WEATHER_API_KEY is not configured')
    }
    return apiKey
  }

  /**
   * Get full weather data (current + forecast + intelligence)
   * Uses caching to improve performance
   */
  static async getFullWeather(query: string): Promise<WeatherResponse> {
    const cacheKey = `weather:${query}`
    
    // Check cache first
    const cached = cacheService.get<WeatherResponse>(cacheKey)
    if (cached) {
      console.log(`[Cache Hit] ${query}`)
      return cached
    }

    console.log(`[Cache Miss] Fetching ${query}`)
    
    const apiKey = this.getApiKey()
    
    try {
      // Fetch current weather and 7-day forecast in parallel
      const [currentData, forecastData] = await Promise.all([
        this.fetchCurrent(query, apiKey),
        this.fetchForecast(query, apiKey, 7)
      ])

      // Generate AI intelligence
      const intelligence = this.generateIntelligence(currentData, forecastData)

      const response: WeatherResponse = {
        location: currentData.location,
        current: {
          ...currentData.current,
          air_quality: currentData.current.air_quality || this.getDefaultAirQuality()
        },
        forecast: forecastData.forecast.forecastday.map((day: any) => ({
          date: day.date,
          date_epoch: day.date_epoch,
          day: day.day,
          astro: day.astro,
          hours: day.hour
        })),
        intelligence
      }

      // Cache for 15 minutes
      cacheService.set(cacheKey, response, 15 * 60 * 1000)

      return response
    } catch (error: any) {
      console.error('[WeatherService Error]:', error.message)
      throw new Error(error.message || 'Failed to fetch weather data')
    }
  }

  /**
   * Fetch current weather with air quality
   */
  private static async fetchCurrent(query: string, apiKey: string) {
    const url = `${BASE_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&aqi=yes`
    
    const response = await fetch(url, {
      next: { revalidate: 900 } // 15 minutes
    })

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Location not found')
      }
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Fetch forecast data
   */
  private static async fetchForecast(query: string, apiKey: string, days: number) {
    const url = `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=${days}&aqi=yes&alerts=yes`
    
    const response = await fetch(url, {
      next: { revalidate: 900 }
    })

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Generate meteorological intelligence
   */
  private static generateIntelligence(current: any, forecast: any) {
    const temp = current.current.temp_c
    const humidity = current.current.humidity
    const windSpeed = current.current.wind_kph
    const condition = current.current.condition.text
    const pressure = current.current.pressure_mb

    // Determine weather pattern
    let headline = 'Stable Atmospheric Conditions'
    let reasoning = 'Current meteorological parameters indicate equilibrium.'
    let cause = 'Balanced pressure systems'
    let effect = 'Predictable weather patterns'

    if (temp > 30) {
      headline = 'High Thermal Activity Detected'
      reasoning = 'Elevated surface temperatures indicate strong solar radiation absorption and minimal cloud cover.'
      cause = 'High-pressure system with clear skies'
      effect = 'Increased evaporation and potential heat stress'
    } else if (temp < 10) {
      headline = 'Low Thermal Regime Active'
      reasoning = 'Reduced temperatures suggest polar air mass influence or nighttime radiative cooling.'
      cause = 'Cold front passage or continental air mass'
      effect = 'Reduced atmospheric moisture and clear conditions'
    }

    if (humidity > 80) {
      headline = 'High Moisture Content Detected'
      reasoning = 'Elevated humidity levels indicate saturated air masses, increasing precipitation probability.'
      cause = 'Moisture convergence from oceanic sources'
      effect = 'Potential for cloud formation and precipitation'
    }

    if (windSpeed > 30) {
      headline = 'Elevated Wind Vector Activity'
      reasoning = 'Strong wind patterns suggest significant pressure gradients across the region.'
      cause = 'Pressure differential between systems'
      effect = 'Enhanced mixing and potential weather changes'
    }

    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
      headline = 'Active Precipitation System'
      reasoning = 'Current conditions indicate unstable atmospheric layers with vertical development.'
      cause = 'Convective instability and moisture availability'
      effect = 'Precipitation and possible electrical activity'
    }

    // Generate activity insights
    const insights = {
      running: this.getRunningInsight(temp, humidity, current.current.uv),
      photography: this.getPhotographyInsight(condition, current.current.cloud, current.current.is_day),
      travel: this.getTravelInsight(condition, current.current.vis_km, windSpeed),
      aviation: this.getAviationInsight(current.current.vis_km, windSpeed, current.current.cloud)
    }

    return {
      explanation: {
        headline,
        reasoning,
        cause_effect: {
          cause,
          effect
        }
      },
      insights
    }
  }

  private static getRunningInsight(temp: number, humidity: number, uv: number) {
    let score = 100
    let status: 'OPTIMAL' | 'CAUTION' | 'DANGER' = 'OPTIMAL'
    let advice = 'Perfect conditions for outdoor running.'

    if (temp > 30 || temp < 5) score -= 30
    if (humidity > 80) score -= 20
    if (uv > 7) score -= 15

    if (score < 50) {
      status = 'DANGER'
      advice = 'Extreme conditions. Indoor training recommended.'
    } else if (score < 70) {
      status = 'CAUTION'
      advice = 'Moderate conditions. Stay hydrated and take breaks.'
    }

    return {
      label: 'Running Conditions',
      score: Math.max(0, score),
      status,
      advice
    }
  }

  private static getPhotographyInsight(condition: string, cloud: number, isDay: number) {
    let score = 70
    let status: 'OPTIMAL' | 'CAUTION' | 'DANGER' = 'OPTIMAL'
    let advice = 'Good lighting conditions for photography.'

    if (cloud > 20 && cloud < 70) score += 20 // Partial clouds are great
    if (cloud > 90) score -= 30
    if (condition.toLowerCase().includes('rain')) score -= 40
    if (!isDay) score -= 10

    if (score < 50) {
      status = 'DANGER'
      advice = 'Poor visibility. Consider indoor or night photography.'
    } else if (score < 70) {
      status = 'CAUTION'
      advice = 'Variable conditions. Use appropriate settings.'
    } else {
      advice = 'Excellent conditions for outdoor photography.'
    }

    return {
      label: 'Photography Conditions',
      score: Math.min(100, Math.max(0, score)),
      status,
      advice
    }
  }

  private static getTravelInsight(condition: string, visibility: number, windSpeed: number) {
    let score = 100
    let status: 'OPTIMAL' | 'CAUTION' | 'DANGER' = 'OPTIMAL'
    let advice = 'Safe travel conditions.'

    if (visibility < 5) score -= 40
    if (windSpeed > 40) score -= 30
    if (condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('heavy')) score -= 50

    if (score < 40) {
      status = 'DANGER'
      advice = 'Hazardous conditions. Delay travel if possible.'
    } else if (score < 70) {
      status = 'CAUTION'
      advice = 'Exercise caution. Reduce speed and increase following distance.'
    }

    return {
      label: 'Travel Safety',
      score: Math.max(0, score),
      status,
      advice
    }
  }

  private static getAviationInsight(visibility: number, windSpeed: number, cloud: number) {
    let score = 100
    let status: 'OPTIMAL' | 'CAUTION' | 'DANGER' = 'OPTIMAL'
    let advice = 'VFR conditions suitable for flight.'

    if (visibility < 10) score -= 30
    if (windSpeed > 35) score -= 25
    if (cloud > 80) score -= 20

    if (score < 50) {
      status = 'DANGER'
      advice = 'IFR conditions. VFR flight not recommended.'
    } else if (score < 75) {
      status = 'CAUTION'
      advice = 'Marginal VFR. Monitor conditions closely.'
    }

    return {
      label: 'Flight Conditions',
      score: Math.max(0, score),
      status,
      advice
    }
  }

  private static getDefaultAirQuality() {
    return {
      'us-epa-index': 1,
      'gb-defra-index': 1
    }
  }
}

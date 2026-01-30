'use client'

import { useState, useEffect } from 'react'
import { WeatherSearch } from '@/components/weather-search'
import { WeatherCard } from '@/components/weather-card'
import { ForecastCard } from '@/components/forecast-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { WeatherData, ForecastData } from '@/lib/weather-api'

interface WeatherResponse {
  weather: WeatherData
  forecast: ForecastData
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Load default city on mount
  useEffect(() => {
    loadWeatherByCity('London')
  }, [])

  const loadWeatherByCity = async (city: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch weather data')
      }

      const data: WeatherResponse = await response.json()
      setWeather(data.weather)
      setForecast(data.forecast)
      setHasSearched(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(message)
      console.error('[v0] Weather fetch error:', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}`
          )

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to fetch weather data')
          }

          const data: WeatherResponse = await response.json()
          setWeather(data.weather)
          setForecast(data.forecast)
          setHasSearched(true)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to fetch weather data'
          setError(message)
          console.error('[v0] Location weather fetch error:', message)
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`)
        setIsLoading(false)
        console.error('[v0] Geolocation error:', err)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Weather App</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Section */}
        <div className="mb-8">
          <WeatherSearch
            onSearch={loadWeatherByCity}
            onUseLocation={handleUseLocation}
            isLoading={isLoading}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading weather data...</span>
          </div>
        )}

        {/* Weather Display */}
        {!isLoading && weather && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <WeatherCard data={weather} />
            {forecast && <ForecastCard data={forecast} />}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !weather && !hasSearched && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Search for a city or use your location to get started
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-secondary/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Weather data powered by OpenWeatherMap</p>
        </div>
      </footer>
    </div>
  )
}

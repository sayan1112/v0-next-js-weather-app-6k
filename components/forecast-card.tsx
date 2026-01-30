'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherIcon } from './weather-icon'
import type { ForecastData } from '@/lib/weather-api'

interface ForecastCardProps {
  data: ForecastData
}

export function ForecastCard({ data }: ForecastCardProps) {
  // Group forecast data by day (every 24 hours)
  const dailyForecasts = data.list.filter((_, index) => index % 8 === 0).slice(0, 5)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dailyForecasts.map((forecast) => {
            const date = new Date(forecast.dt * 1000)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const temp = Math.round(forecast.main.temp)
            const weather = forecast.weather[0]

            return (
              <div key={forecast.dt} className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <span className="text-sm font-semibold mb-2">{dayName}</span>
                <WeatherIcon
                  iconCode={weather.icon}
                  className="w-12 h-12 text-primary mb-2"
                />
                <div className="text-center">
                  <div className="text-lg font-bold">{temp}°C</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {weather.main}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {forecast.main.temp_min.toFixed(0)}° - {forecast.main.temp_max.toFixed(0)}°
                  </div>
                  <div className="text-xs text-blue-500 mt-2">
                    Humidity: {forecast.main.humidity}%
                  </div>
                  <div className="text-xs text-cyan-500">
                    Wind: {forecast.wind.speed.toFixed(1)} m/s
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

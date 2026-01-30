'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherIcon } from './weather-icon'
import type { WeatherData } from '@/lib/weather-api'
import { Droplets, Wind, Eye, Gauge } from 'lucide-react'

interface WeatherCardProps {
  data: WeatherData
}

export function WeatherCard({ data }: WeatherCardProps) {
  if (!data || !data.current || !data.location || !data.current.condition) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">No weather data available</CardContent>
      </Card>
    )
  }
  
  const condition = data.current.condition
  const temp = Math.round(data.current.temp_c)
  const feelsLike = Math.round(data.current.feelslike_c)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {data.location.name}, {data.location.country}
            </h2>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {condition.text}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Weather Display */}
          <div className="flex flex-col items-center justify-center py-8">
            <WeatherIcon conditionText={condition.text} className="w-24 h-24 text-primary" />
            <div className="mt-4 text-center">
              <div className="text-6xl font-bold">{temp}°C</div>
              <p className="text-muted-foreground mt-2">
                Feels like {feelsLike}°C
              </p>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm text-muted-foreground">Humidity</span>
              <span className="text-xl font-semibold">{data.current.humidity}%</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <Wind className="w-6 h-6 text-cyan-500 mb-2" />
              <span className="text-sm text-muted-foreground">Wind Speed</span>
              <span className="text-xl font-semibold">{data.current.wind_kph.toFixed(1)} km/h</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <Eye className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-sm text-muted-foreground">Pressure</span>
              <span className="text-xl font-semibold">{Math.round(data.current.pressure_mb)} mb</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <Gauge className="w-6 h-6 text-orange-500 mb-2" />
              <span className="text-sm text-muted-foreground">Cloudiness</span>
              <span className="text-xl font-semibold">{data.current.cloud}%</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
          <div>
            <span className="text-xs text-muted-foreground">Wind Gust</span>
            <p className="text-lg font-semibold">{data.current.gust_kph.toFixed(1)} km/h</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Visibility</span>
            <p className="text-lg font-semibold">{data.current.vis_km.toFixed(1)} km</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Dew Point</span>
            <p className="text-lg font-semibold">{Math.round(data.current.dewpoint_c)}°C</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">UV Index</span>
            <p className="text-lg font-semibold">{data.current.uv.toFixed(1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

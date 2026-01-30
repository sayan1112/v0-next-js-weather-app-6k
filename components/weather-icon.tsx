import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudRainWind, CloudSnow, Moon, Sun, Type as type, type LucideIcon } from 'lucide-react'
import { getWeatherConditionText } from '@/lib/weather-api'

interface WeatherIconProps {
  conditionText: string
  className?: string
}

export function WeatherIcon({ conditionText, className = 'w-16 h-16' }: WeatherIconProps) {
  const iconMap: Record<string, LucideIcon> = {
    'sun': Sun,
    'moon': Moon,
    'cloud-sun': Cloud,
    'cloud-moon': Cloud,
    'cloud': Cloud,
    'clouds': Cloud,
    'cloud-drizzle': CloudDrizzle,
    'cloud-rain': CloudRain,
    'cloud-rain-wind': CloudRainWind,
    'cloud-lightning': CloudLightning,
    'cloud-lightning-rain': CloudLightning,
    'cloud-snow': CloudSnow,
    'cloud-fog': CloudFog,
  }

  if (!conditionText) {
    return <Cloud className={`${className} animate-pulse`} strokeWidth={1.5} />
  }

  const iconKey = getWeatherConditionText(conditionText)
  const IconComponent = iconMap[iconKey] || Cloud

  return (
    <IconComponent
      className={`${className} animate-pulse`}
      strokeWidth={1.5}
    />
  )
}

import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudRainWind, 
  CloudSnow, 
  Moon, 
  Sun, 
  type LucideIcon 
} from 'lucide-react'

interface WeatherIconProps {
  conditionText: string
  className?: string
}

/**
 * Maps meteorological condition text to tactical Lucide icons
 */
export function getWeatherIconKey(text: string): string {
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

  const iconKey = getWeatherIconKey(conditionText)
  const IconComponent = iconMap[iconKey] || Cloud

  return (
    <IconComponent
      className={`${className} animate-pulse`}
      strokeWidth={1.5}
    />
  )
}


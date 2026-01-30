import { fetchWeatherByCity, fetchForecastByCity, fetchWeatherByCoordinates } from '@/lib/weather-api'

export async function GET(request: Request) {
  const apiKey = '95376baa64f3403f9d8174008263001'

  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!city && (!lat || !lon)) {
    return Response.json(
      { error: 'City or coordinates required' },
      { status: 400 }
    )
  }

  try {
    let weatherData
    let location
    
    if (city) {
      weatherData = await fetchWeatherByCity(city, apiKey)
    } else {
      weatherData = await fetchWeatherByCoordinates(
        parseFloat(lat!),
        parseFloat(lon!),
        apiKey
      )
    }

    location = weatherData.location.name
    const forecastData = await fetchForecastByCity(location, apiKey)

    return Response.json({
      weather: weatherData,
      forecast: forecastData,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch weather'
    console.error('[v0] Weather API error:', message)
    return Response.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    )
  }
}

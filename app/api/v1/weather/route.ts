import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/services/weatherService';
import { GeoService } from '@/lib/services/geoService';
import { ApiError } from '@/types/weather';

/**
 * PRODUCTION API ROUTE - /api/v1/weather
 * Features: 
 * - Secure key management (No leakage to client)
 * - Coordinate-first truth
 * - Input sanitization
 * - Consistent error responses
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    let query: string | null = null;

    // 1. Resolve Query Type (Coordinate vs City)
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (!GeoService.validateCoordinates(lat, lon)) {
        return NextResponse.json(
          { error: 'Invalid coordinates provided', code: 400 } as ApiError,
          { status: 400 }
        );
      }
      
      // Precision normalization to improve cache hits for nearby globe clicks
      query = GeoService.normalizeCoordinates(lat, lon);
    } else if (city) {
      query = city.trim();
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Missing search parameters (city or lat/lon required)', code: 400 } as ApiError,
        { status: 400 }
      );
    }

    // 2. Fetch Data through Service Layer
    const weatherData = await WeatherService.getFullWeather(query);

    // 3. Return Structured Response
    return NextResponse.json(weatherData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=600'
      }
    });

  } catch (error: any) {
    console.error('[API Error] Weather Route:', error.message);

    // 4. Handle Specific Errors
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: error.message || 'An unexpected error occurred', 
        code: statusCode 
      } as ApiError,
      { status: statusCode }
    );
  }
}

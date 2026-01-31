import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/services/weatherService';
import { GeoService } from '@/lib/services/geoService';
import { rateLimiter, getClientIdentifier } from '@/lib/services/rateLimiter';
import { ApiError } from '@/types/weather';

/**
 * PRODUCTION API ROUTE - /api/v1/weather
 * Features: 
 * - Secure key management (No leakage to client)
 * - Coordinate-first truth
 * - Input sanitization
 * - Rate limiting
 * - Caching
 * - Consistent error responses
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Rate Limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = rateLimiter.check(clientId);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.', 
          code: 429,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        } as ApiError,
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
          }
        }
      );
    }

    // 2. Parse and Validate Input
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    let query: string | null = null;

    // Resolve Query Type (Coordinate vs City)
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
      query = GeoService.sanitizeCityName(city);
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Missing search parameters (city or lat/lon required)', code: 400 } as ApiError,
        { status: 400 }
      );
    }

    // 3. Fetch Data through Service Layer (with caching)
    const weatherData = await WeatherService.getFullWeather(query);
    
    const responseTime = Date.now() - startTime;

    // 4. Return Structured Response with Headers
    return NextResponse.json(weatherData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=600',
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        'X-Response-Time': `${responseTime}ms`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('[API Error] Weather Route:', error.message);

    // 5. Handle Specific Errors
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('Invalid') ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: error.message || 'An unexpected error occurred', 
        code: statusCode 
      } as ApiError,
      { status: statusCode }
    );
  }
}

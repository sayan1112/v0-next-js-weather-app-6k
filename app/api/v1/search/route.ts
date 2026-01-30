import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/weather';

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * PATH: /api/v1/search
 * Provides ultra-detailed location suggestions (cities, towns, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'Server configuration error', code: 500 }, { status: 500 });
    }

    const response = await fetch(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } } // Cache suggestions for 1 hour
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: 500 }, { status: 500 });
  }
}

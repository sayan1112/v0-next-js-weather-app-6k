import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * PATH: /api/v1/search
 * Provides ultra-detailed location suggestions with dual-provider fallback.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'Server configuration error', code: 500 }, { status: 500 });
    }

    // Attempt primary search via WeatherAPI
    const weatherResponse = await fetch(
      `${WEATHER_API_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } }
    );

    let results = [];
    if (weatherResponse.ok) {
      results = await weatherResponse.json();
    }

    // If results are sparse (< 3) or empty, attempt fallback to Nominatim for more detailed town data
    if (results.length < 3) {
      try {
        const nominatimResponse = await fetch(
          `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
          { 
            headers: { 'User-Agent': 'Sayanocast/1.0 (sayan@example.com)' },
            next: { revalidate: 3600 } 
          }
        );

        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          const mappedNominatim = nominatimData.map((item: any) => ({
            id: parseInt(item.place_id),
            name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
            region: item.address.state || item.address.county || '',
            country: item.address.country,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }));

          // Merge and deduplicate results
          const existingCoords = new Set(results.map((r: any) => `${r.lat.toFixed(2)},${r.lon.toFixed(2)}`));
          
          for (const item of mappedNominatim) {
            const coordKey = `${item.lat.toFixed(2)},${item.lon.toFixed(2)}`;
            if (!existingCoords.has(coordKey)) {
              results.push(item);
              existingCoords.add(coordKey);
            }
          }
        }
      } catch (err) {
        console.error('Nominatim fallback failed:', err);
      }
    }

    return NextResponse.json(results.slice(0, 10));
  } catch (error: any) {
    console.error('Search API failure:', error);
    return NextResponse.json({ error: error.message, code: 500 }, { status: 500 });
  }
}

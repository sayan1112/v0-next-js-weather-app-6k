import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * PATH: /api/v1/search
 * Provides ultra-detailed location suggestions with dual-provider parallel execution.
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

    // Run both searches in parallel for maximum speed
    const [weatherRes, nominatimRes] = await Promise.allSettled([
      fetch(
        `${WEATHER_API_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`,
        { next: { revalidate: 3600 } }
      ).then(res => res.ok ? res.json() : []),
      
      // Always fetch secondary detailed data for better coverage
      fetch(
        `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1`,
        { 
          headers: { 'User-Agent': 'Sayanocast/1.0 (sayan@example.com)' },
          next: { revalidate: 3600 } 
        }
      ).then(res => res.ok ? res.json() : [])
    ]);

    let results: any[] = [];
    
    // Process WeatherAPI results (Fastest)
    if (weatherRes.status === 'fulfilled' && Array.isArray(weatherRes.value)) {
      results = [...weatherRes.value];
    }

    // Process Nominatim results (Most Detailed)
    if (nominatimRes.status === 'fulfilled' && Array.isArray(nominatimRes.value)) {
      const nominatimData = nominatimRes.value;
      const mappedNominatim = nominatimData.map((item: any) => ({
        id: parseInt(item.place_id),
        name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
        region: item.address.state || item.address.county || '',
        country: item.address.country,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        source: 'nominatim'
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

    // Sort to prioritize exact name matches
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const query = q.toLowerCase();
      
      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;
      return 0;
    });

    return NextResponse.json(results.slice(0, 15));
  } catch (error: any) {
    console.error('Search API failure:', error);
    return NextResponse.json({ error: error.message, code: 500 }, { status: 500 });
  }
}

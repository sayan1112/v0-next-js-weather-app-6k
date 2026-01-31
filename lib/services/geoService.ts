import { LocationCoordinates } from '@/types/weather';

/**
 * GeoService - Handles coordinate-to-location resolution and validation
 * High-precision handling for globe-based interactions
 */

export class GeoService {
  /**
   * Validates if coordinates are within standard Earth bounds
   */
  static validateCoordinates(lat: number, lon: number): boolean {
    return (
      !isNaN(lat) && 
      !isNaN(lon) && 
      lat >= -90 && 
      lat <= 90 && 
      lon >= -180 && 
      lon <= 180
    );
  }

  /**
   * Rounds coordinates to a specific precision to optimize cache hits
   * 0.1 decimal degrees is ~11km at equator - perfect for weather caching
   */
  static normalizeCoordinates(lat: number, lon: number): string {
    return `${lat.toFixed(1)},${lon.toFixed(1)}`;
  }

  /**
   * Formats a query string for the weather API
   */
  static formatQuery(query: string | { lat: number, lon: number }): string {
    if (typeof query === 'string') return query.trim();
    return `${query.lat},${query.lon}`;
  }
}

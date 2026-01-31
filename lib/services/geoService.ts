/**
 * Geographic Service - Coordinate validation and normalization
 * Ensures 100% accurate globe-to-weather mapping
 */

export class GeoService {
  /**
   * Validate latitude and longitude
   */
  static validateCoordinates(lat: number, lon: number): boolean {
    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    )
  }

  /**
   * Normalize coordinates to 3 decimal places for cache consistency
   * This groups nearby clicks on the globe to the same cache key
   */
  static normalizeCoordinates(lat: number, lon: number): string {
    const normalizedLat = parseFloat(lat.toFixed(3))
    const normalizedLon = parseFloat(lon.toFixed(3))
    return `${normalizedLat},${normalizedLon}`
  }

  /**
   * Convert globe click coordinates to precise lat/lng
   * Fixes the coordinate accuracy issue
   */
  static globeToCoordinates(point: { x: number; y: number; z: number }, radius: number = 100) {
    // Normalize the point
    const length = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z)
    const normalized = {
      x: point.x / length,
      y: point.y / length,
      z: point.z / length
    }

    // Calculate latitude (elevation angle from equator)
    const lat = Math.asin(normalized.y) * (180 / Math.PI)
    
    // Calculate longitude (azimuth angle from prime meridian)
    // Corrected formula for accurate mapping
    const lon = Math.atan2(-normalized.z, normalized.x) * (180 / Math.PI)

    return {
      lat: parseFloat(lat.toFixed(3)),
      lng: parseFloat(lon.toFixed(3))
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Get timezone offset for coordinates
   */
  static getTimezoneOffset(lat: number, lon: number): number {
    // Rough approximation: 15 degrees longitude = 1 hour
    return Math.round(lon / 15)
  }

  /**
   * Validate and sanitize city name input
   */
  static sanitizeCityName(city: string): string {
    return city
      .trim()
      .replace(/[^\w\s,.-]/g, '') // Remove special characters except common ones
      .substring(0, 100) // Limit length
  }
}

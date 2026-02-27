import type { TravelMode, TravelTime } from './types.js'

const EARTH_RADIUS_MILES = 3958.8

export function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a))
}

/**
 * Convert travel mode + time preferences into a max radius in miles.
 * These are rough estimates for Maryland geography.
 */
export function travelTimeToRadiusMiles(
  travelMode?: TravelMode | null,
  travelTime?: TravelTime | null,
): number {
  // Speed estimates (mph) by mode
  const speeds: Record<TravelMode, number> = {
    DRIVES: 30,
    PUBLIC_TRANSIT: 15,
    WALK_ONLY: 3,
    RIDE_FROM_SOMEONE: 30,
    NOT_SURE: 25,
  }

  // Time in hours
  const times: Record<TravelTime, number> = {
    UP_TO_15_MIN: 0.25,
    UP_TO_30_MIN: 0.5,
    UP_TO_60_MIN: 1.0,
    ANY_DISTANCE: 2.0,
  }

  const mode = travelMode ?? 'NOT_SURE'
  const time = travelTime ?? 'UP_TO_60_MIN'

  return speeds[mode] * times[time]
}

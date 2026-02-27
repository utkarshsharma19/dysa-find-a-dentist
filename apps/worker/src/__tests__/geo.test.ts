import { describe, it, expect } from 'vitest'
import { haversineDistanceMiles, travelTimeToRadiusMiles } from '../matching/geo.js'

describe('haversineDistanceMiles', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistanceMiles(39.29, -76.61, 39.29, -76.61)).toBe(0)
  })

  it('calculates Baltimore to Annapolis (~26 mi)', () => {
    const dist = haversineDistanceMiles(39.2904, -76.6122, 38.9784, -76.4922)
    expect(dist).toBeGreaterThan(22)
    expect(dist).toBeLessThan(30)
  })

  it('calculates Baltimore to Frederick (~45 mi)', () => {
    const dist = haversineDistanceMiles(39.2904, -76.6122, 39.4143, -77.4105)
    expect(dist).toBeGreaterThan(40)
    expect(dist).toBeLessThan(55)
  })

  it('calculates short distance within Baltimore (~1 mi)', () => {
    const dist = haversineDistanceMiles(39.2904, -76.6122, 39.2889, -76.6277)
    expect(dist).toBeGreaterThan(0.5)
    expect(dist).toBeLessThan(2)
  })
})

describe('travelTimeToRadiusMiles', () => {
  it('DRIVES + UP_TO_30_MIN = 15 miles', () => {
    expect(travelTimeToRadiusMiles('DRIVES', 'UP_TO_30_MIN')).toBe(15)
  })

  it('PUBLIC_TRANSIT + UP_TO_60_MIN = 15 miles', () => {
    expect(travelTimeToRadiusMiles('PUBLIC_TRANSIT', 'UP_TO_60_MIN')).toBe(15)
  })

  it('WALK_ONLY + UP_TO_15_MIN = 0.75 miles', () => {
    expect(travelTimeToRadiusMiles('WALK_ONLY', 'UP_TO_15_MIN')).toBe(0.75)
  })

  it('defaults to NOT_SURE + UP_TO_60_MIN when null', () => {
    expect(travelTimeToRadiusMiles(null, null)).toBe(25)
  })

  it('DRIVES + ANY_DISTANCE = 60 miles', () => {
    expect(travelTimeToRadiusMiles('DRIVES', 'ANY_DISTANCE')).toBe(60)
  })
})

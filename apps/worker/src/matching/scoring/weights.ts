import type { Weights } from './types.js'

export const DEFAULT_WEIGHTS: Weights = {
  eligibility: 0.25,
  serviceMatch: 0.25,
  access: 0.15,
  cost: 0.15,
  distance: 0.1,
  freshness: 0.1,
}

export function getWeights(): Weights {
  const env = process.env.MATCH_WEIGHTS
  if (!env) return DEFAULT_WEIGHTS

  try {
    const parsed = JSON.parse(env) as Partial<Weights>
    return { ...DEFAULT_WEIGHTS, ...parsed }
  } catch {
    return DEFAULT_WEIGHTS
  }
}

import { sql, gte } from 'drizzle-orm'
import { recommendations } from '@dysa/db'
import type { Database } from '@dysa/db'
import type { ScoredClinic } from './types.js'

const LOOKBACK_DAYS = 7
const THRESHOLD = 10
const MAX_PENALTY = 0.15

export async function fetchRecommendationCounts(db: Database): Promise<Map<string, number>> {
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      clinicId: recommendations.clinicId,
      count: sql<number>`count(*)::int`,
    })
    .from(recommendations)
    .where(gte(recommendations.createdAt, cutoff))
    .groupBy(recommendations.clinicId)

  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.clinicId, row.count)
  }
  return map
}

export async function applyLoadBalancingPenalty(
  db: Database,
  scored: ScoredClinic[],
): Promise<ScoredClinic[]> {
  const counts = await fetchRecommendationCounts(db)

  return scored.map((clinic) => {
    const count = counts.get(clinic.clinicId) ?? 0
    if (count <= THRESHOLD) return clinic

    const excessRatio = (count - THRESHOLD) / THRESHOLD
    const penalty = Math.min(excessRatio * 0.15, MAX_PENALTY)
    const adjustedScore = clinic.totalScore * (1 - penalty)

    return {
      ...clinic,
      totalScore: adjustedScore,
      reasonCodes: [...clinic.reasonCodes, 'LOAD_BALANCED'],
    }
  })
}

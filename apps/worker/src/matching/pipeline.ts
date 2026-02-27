import type { Database } from '@dysa/db'
import { fetchMatchInput, fetchCandidateClinics } from './fetch-candidates.js'
import { applyHardFilters } from './hard-filters.js'
import { scoreClinic } from './scoring/index.js'
import { applyLoadBalancingPenalty } from './scoring/load-balancer.js'
import { assignBuckets, computeDisplayConfidence } from './bucketing.js'
import type { ScoredClinic } from './scoring/types.js'

export interface PipelineResult {
  candidateCount: number
  filteredCount: number
  scoredCount: number
  bucketDistribution: Record<string, number>
  recommendationCount: number
}

export async function runMatchingPipeline(
  db: Database,
  sessionId: string,
): Promise<PipelineResult> {
  // 1. Fetch input + candidates
  const input = await fetchMatchInput(db, sessionId)
  const candidates = await fetchCandidateClinics(db)

  // 2. Hard filters
  const { passed } = applyHardFilters(candidates, input)

  // 3. Score
  let scored: ScoredClinic[] = passed.map((clinic) => scoreClinic(clinic, input))

  // 4. Load-balancing penalty
  scored = await applyLoadBalancingPenalty(db, scored)

  // 5. Sort by total score descending
  scored.sort((a, b) => b.totalScore - a.totalScore)

  // 6. Bucket + rank
  const bucketed = assignBuckets(scored)

  // 7. Limit to top 15
  const toWrite = bucketed.slice(0, 15)

  // 8. Write recommendations
  if (toWrite.length > 0) {
    const { recommendations } = await import('@dysa/db')
    await db.insert(recommendations).values(
      toWrite.map((rec, idx) => ({
        sessionId,
        clinicId: rec.clinicId,
        rank: idx + 1,
        bucket: rec.bucket ?? 'OTHER_OPTIONS',
        scoreTotal: rec.totalScore.toFixed(3),
        scoreEligibility: rec.breakdown.eligibility.toFixed(3),
        scoreServiceMatch: rec.breakdown.serviceMatch.toFixed(3),
        scoreAccess: rec.breakdown.access.toFixed(3),
        scoreCost: rec.breakdown.cost.toFixed(3),
        scoreDistance: rec.breakdown.distance.toFixed(3),
        scoreFreshness: rec.breakdown.freshness.toFixed(3),
        reasonCodes: rec.reasonCodes,
        displayConfidence: computeDisplayConfidence(rec.reasonCodes),
      })),
    )
  }

  // Build stats
  const bucketDistribution: Record<string, number> = {}
  for (const rec of toWrite) {
    const bucket = rec.bucket ?? 'OTHER_OPTIONS'
    bucketDistribution[bucket] = (bucketDistribution[bucket] ?? 0) + 1
  }

  return {
    candidateCount: candidates.length,
    filteredCount: passed.length,
    scoredCount: scored.length,
    bucketDistribution,
    recommendationCount: toWrite.length,
  }
}

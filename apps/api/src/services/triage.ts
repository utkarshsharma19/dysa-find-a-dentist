import type { CreateSessionInput } from '@dysa/shared'

interface TriageRule {
  complaintTrigger: string
  requiresFever: boolean
  requiresFacialSwelling: boolean
  requiresDifficultyBreathing: boolean
  action: 'ROUTE_TO_ED' | 'SHOW_WARNING' | 'BOOST_URGENCY' | 'ALLOW_NORMAL'
  messageTitle: string
  messageBody: string
}

// Hard-coded triage rules — safety-critical, not configurable at runtime
const TRIAGE_RULES: TriageRule[] = [
  {
    complaintTrigger: 'SWELLING',
    requiresFever: true,
    requiresFacialSwelling: false,
    requiresDifficultyBreathing: false,
    action: 'ROUTE_TO_ED',
    messageTitle: 'Seek Emergency Care Now',
    messageBody:
      'Swelling with fever can indicate a serious infection. Please go to your nearest emergency room or call 911 immediately.',
  },
  {
    complaintTrigger: 'SWELLING',
    requiresFever: false,
    requiresFacialSwelling: true,
    requiresDifficultyBreathing: false,
    action: 'ROUTE_TO_ED',
    messageTitle: 'Seek Emergency Care Now',
    messageBody:
      'Facial swelling can indicate a spreading infection. Please go to your nearest emergency room or call 911.',
  },
  {
    complaintTrigger: 'PAIN',
    requiresFever: true,
    requiresFacialSwelling: false,
    requiresDifficultyBreathing: false,
    action: 'SHOW_WARNING',
    messageTitle: 'Warning: Possible Infection',
    messageBody:
      'Tooth pain with fever may indicate an infection. If pain is severe or you feel unwell, consider visiting an emergency room. Otherwise, seek dental care as soon as possible.',
  },
  {
    complaintTrigger: 'BUMP_ON_GUM',
    requiresFever: true,
    requiresFacialSwelling: false,
    requiresDifficultyBreathing: false,
    action: 'SHOW_WARNING',
    messageTitle: 'Warning: Possible Abscess',
    messageBody:
      'A bump on the gum with fever could be an abscess requiring urgent treatment. Seek dental care today if possible.',
  },
  {
    complaintTrigger: 'TOOTH_KNOCKED_OUT',
    requiresFever: false,
    requiresFacialSwelling: false,
    requiresDifficultyBreathing: false,
    action: 'BOOST_URGENCY',
    messageTitle: 'Time-Sensitive Emergency',
    messageBody:
      'A knocked-out tooth has the best chance of being saved within 30 minutes. Keep the tooth moist and seek dental care immediately.',
  },
]

// Any complaint + difficulty breathing/swallowing => always route to ED
const BREATHING_RULE: TriageRule = {
  complaintTrigger: '*',
  requiresFever: false,
  requiresFacialSwelling: false,
  requiresDifficultyBreathing: true,
  action: 'ROUTE_TO_ED',
  messageTitle: 'Call 911 Immediately',
  messageBody:
    'Difficulty breathing or swallowing is a medical emergency. Call 911 or go to the nearest emergency room now.',
}

export interface TriageResult {
  action: 'ROUTE_TO_ED' | 'SHOW_WARNING' | 'BOOST_URGENCY' | 'ALLOW_NORMAL'
  blocked: boolean
  messageTitle?: string
  messageBody?: string
}

export function evaluateTriage(input: CreateSessionInput): TriageResult {
  // Check breathing/swallowing first — applies to all complaints
  if (input.difficultySwallowingBreathing) {
    return {
      action: BREATHING_RULE.action,
      blocked: true,
      messageTitle: BREATHING_RULE.messageTitle,
      messageBody: BREATHING_RULE.messageBody,
    }
  }

  // Check complaint-specific rules
  for (const rule of TRIAGE_RULES) {
    if (rule.complaintTrigger !== input.chiefComplaint) continue

    const feverMatch = !rule.requiresFever || input.hasFever === true
    const swellingMatch = !rule.requiresFacialSwelling || input.hasFacialSwelling === true
    // Breathing already handled above; skip rules that require it
    if (rule.requiresDifficultyBreathing) continue

    if (feverMatch && swellingMatch) {
      return {
        action: rule.action,
        blocked: rule.action === 'ROUTE_TO_ED',
        messageTitle: rule.messageTitle,
        messageBody: rule.messageBody,
      }
    }
  }

  return { action: 'ALLOW_NORMAL', blocked: false }
}

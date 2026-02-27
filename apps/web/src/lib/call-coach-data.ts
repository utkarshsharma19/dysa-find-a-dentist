export interface CallScript {
  insuranceType: string
  intro: string
  followUp: string
}

export interface ChecklistItem {
  label: string
  insuranceTypes: string[]
}

export const CALL_SCRIPTS: Record<string, CallScript> = {
  MEDICAID: {
    insuranceType: 'Medicaid',
    intro:
      'Hi, my name is [YOUR NAME]. I have Maryland Medicaid and I am looking for a dentist. Are you accepting new Medicaid patients?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. What is the earliest available appointment? What Medicaid plans do you accept?',
  },
  DUAL_MEDICAID_MEDICARE: {
    insuranceType: 'Medicaid & Medicare',
    intro:
      'Hi, my name is [YOUR NAME]. I have both Medicaid and Medicare. Are you accepting new patients with dual coverage?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. Do you bill both my Medicaid and Medicare? What is the earliest available appointment?',
  },
  MEDICARE: {
    insuranceType: 'Medicare',
    intro:
      'Hi, my name is [YOUR NAME]. I have Medicare. Do you accept Medicare for dental services?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. What dental services are covered under Medicare at your office? What would my out-of-pocket cost be?',
  },
  UNINSURED_SELF_PAY: {
    insuranceType: 'Uninsured / Self-Pay',
    intro:
      'Hi, my name is [YOUR NAME]. I do not currently have dental insurance. Are you accepting new uninsured patients?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. Do you offer a sliding fee scale or payment plans? What would the estimated cost be for my visit?',
  },
  PRIVATE: {
    insuranceType: 'Private Insurance',
    intro:
      'Hi, my name is [YOUR NAME]. I have private dental insurance through [YOUR PLAN]. Are you accepting new patients with my plan?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. Are you in-network with my plan? What is the earliest available appointment?',
  },
  NOT_SURE: {
    insuranceType: 'Insurance Unknown',
    intro:
      'Hi, my name is [YOUR NAME]. I am not sure about my insurance coverage. Can you help me figure out what options I have?',
    followUp:
      'I need to be seen for [YOUR CONCERN]. Do you accept patients who are unsure of their coverage? Can you help verify my insurance?',
  },
}

export const DOCUMENTS_CHECKLIST: ChecklistItem[] = [
  { label: "Photo ID (driver's license or state ID)", insuranceTypes: ['ALL'] },
  {
    label: 'Medicaid card or HealthChoice card',
    insuranceTypes: ['MEDICAID', 'DUAL_MEDICAID_MEDICARE'],
  },
  {
    label: 'Medicare card (red, white, and blue card)',
    insuranceTypes: ['MEDICARE', 'DUAL_MEDICAID_MEDICARE'],
  },
  { label: 'Insurance card (front and back)', insuranceTypes: ['PRIVATE'] },
  { label: 'List of current medications', insuranceTypes: ['ALL'] },
  {
    label: 'Referral letter (if required)',
    insuranceTypes: ['MEDICAID', 'DUAL_MEDICAID_MEDICARE'],
  },
  { label: 'Proof of income (for sliding fee scale)', insuranceTypes: ['UNINSURED_SELF_PAY'] },
  {
    label: 'Proof of Maryland residency (utility bill, lease)',
    insuranceTypes: ['UNINSURED_SELF_PAY'],
  },
  { label: 'List of known allergies', insuranceTypes: ['ALL'] },
  { label: 'Previous dental records or X-rays (if available)', insuranceTypes: ['ALL'] },
]

export const QUESTIONS_TO_ASK: string[] = [
  'Are you accepting new patients right now?',
  'How soon can I get an appointment?',
  'What will my out-of-pocket cost be for this visit?',
  'Do I need a referral from my primary care doctor?',
  'Do you offer walk-in or same-day appointments for emergencies?',
  'What forms of payment do you accept?',
  'Do you have evening or weekend hours?',
  'Is there parking available? Is the office accessible?',
  'Do you have staff who speak [LANGUAGE]?',
  'What should I bring to my first appointment?',
]

export function getChecklistForInsurance(insuranceType: string): string[] {
  return DOCUMENTS_CHECKLIST.filter(
    (item) => item.insuranceTypes.includes('ALL') || item.insuranceTypes.includes(insuranceType),
  ).map((item) => item.label)
}

export const COMPLAINT_LABELS: Record<string, string> = {
  PAIN: 'tooth pain',
  SWELLING: 'swelling',
  BROKEN_CHIPPED_TOOTH: 'a broken or chipped tooth',
  TOOTH_KNOCKED_OUT: 'a knocked-out tooth',
  NEED_TOOTH_PULLED: 'a tooth that needs to be pulled',
  FILLING_CROWN_FELL_OUT: 'a filling or crown that fell out',
  BUMP_ON_GUM: 'a bump on my gum',
  CLEANING_CHECKUP: 'a cleaning and checkup',
  DENTURES: 'dentures',
  NOT_SURE: 'a dental concern',
}

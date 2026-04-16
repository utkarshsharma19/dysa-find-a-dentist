// Ported from DentalCostCalc — see that project's README for sources.

export const CATS = [
  'Preventive',
  'Basic Restorative',
  'Major Restorative',
  'Endodontics',
  'Periodontal',
  'Prosthodontics',
  'Cosmetic',
] as const

// [name, low, mid, high, medicaidFee]
export const PROCS: [string, number, number, number, number][] = [
  ['Routine Cleaning (D1110)', 100, 135, 200, 67],
  ['Comprehensive Exam (D0150)', 50, 90, 150, 56],
  ['Periodic Exam (D0120)', 30, 55, 90, 32],
  ['Bitewing X-Rays (D0274)', 40, 70, 120, 24],
  ['Full Mouth X-Rays (D0210)', 80, 146, 250, 57],
  ['Panoramic X-Ray (D0330)', 75, 130, 200, 46],
  ['Fluoride Varnish (D1206)', 20, 40, 70, 26],
  ['Sealant per Tooth (D1351)', 30, 50, 80, 40],
  ['Filling, Composite 1 surface (D2391)', 130, 210, 350, 107],
  ['Filling, Composite 2 surface (D2392)', 160, 275, 420, 138],
  ['Filling, Composite 3 surface (D2393)', 190, 330, 500, 173],
  ['Filling, Amalgam 1 surface (D2140)', 100, 170, 280, 74],
  ['Simple Extraction (D7140)', 150, 200, 350, 100],
  ['Surgical Extraction (D7210)', 200, 350, 550, 175],
  ['Crown, Porcelain (D2740)', 800, 1288, 1800, 394],
  ['Crown, Porcelain Fused Metal (D2750)', 800, 1200, 1700, 492],
  ['Core Buildup (D2950)', 150, 300, 500, 85],
  ['Root Canal, Anterior (D3310)', 700, 900, 1200, 550],
  ['Root Canal, Premolar (D3320)', 800, 1050, 1400, 650],
  ['Root Canal, Molar (D3330)', 1000, 1350, 1800, 748],
  ['Scaling and Root Planing per quad (D4341)', 169, 275, 400, 130],
  ['Perio Maintenance (D4910)', 100, 175, 280, 90],
  ['Complete Denture, Upper (D5110)', 1000, 1800, 3000, 575],
  ['Complete Denture, Lower (D5120)', 1000, 1800, 3000, 575],
  ['Bridge, 3 unit (D6750x3)', 2400, 3600, 5500, 1200],
  ['Single Implant Post (D6010)', 1500, 3000, 5000, -1],
  ['In-office Whitening (D9972)', 300, 550, 900, -1],
  ['Porcelain Veneer (D2962)', 800, 1500, 2500, 114],
]

export const CAT_RANGES: [number, number][] = [
  [0, 7],
  [8, 13],
  [14, 16],
  [17, 19],
  [20, 21],
  [22, 25],
  [26, 27],
]

export const TIERS = [
  'preventive',
  'basic',
  'major',
  'basic',
  'basic',
  'major',
  'cosmetic',
] as const
export const INS_KEYS = [
  'No insurance',
  'PPO',
  'PPO Enhanced',
  'HMO',
  'Medicaid',
  'Discount plan',
] as const
export type InsuranceKey = (typeof INS_KEYS)[number]

export const INS_RATES: Record<InsuranceKey, [number, number, number, number]> = {
  'No insurance': [0, 0, 0, 0],
  PPO: [1, 0.8, 0.5, 0],
  'PPO Enhanced': [1, 0.8, 0.6, 0],
  HMO: [1, 0.7, 0.5, 0],
  Medicaid: [1, 1, 1, 0],
  'Discount plan': [0.25, 0.2, 0.15, 0.1],
}
export const INS_HAS_MAX: Partial<Record<InsuranceKey, boolean>> = {
  PPO: true,
  'PPO Enhanced': true,
}
export const INS_DEF_MAX: Partial<Record<InsuranceKey, number>> = {
  PPO: 1500,
  'PPO Enhanced': 2500,
}
export const TIER_IDX = { preventive: 0, basic: 1, major: 2, cosmetic: 3 } as const

export type MedicaidTier = 'comp' | 'ext' | 'lim' | 'eo'
export const MS: Record<string, [MedicaidTier, number, string]> = {
  Alabama: ['eo', 0, 'Emergency only'],
  Alaska: ['ext', 0, 'Covers most'],
  Arizona: ['comp', 1000, '$1K cap'],
  Arkansas: ['ext', 500, '$500 cap'],
  California: ['comp', 0, 'Full, no cap'],
  Colorado: ['comp', 1500, '$1.5K cap'],
  Connecticut: ['comp', 0, 'No cap'],
  Delaware: ['eo', 0, 'Emergency only'],
  'District of Columbia': ['comp', 0, 'Full'],
  Florida: ['lim', 0, 'Limited'],
  Georgia: ['eo', 0, 'Emergency only'],
  Hawaii: ['comp', 0, 'Full'],
  Idaho: ['ext', 1000, '$1K cap'],
  Illinois: ['comp', 0, 'Full'],
  Indiana: ['comp', 0, 'HIP Plus'],
  Iowa: ['ext', 1000, '$1K cap'],
  Kansas: ['lim', 0, 'Very limited'],
  Kentucky: ['comp', 2000, '$2K cap'],
  Louisiana: ['ext', 0, 'Most services'],
  Maine: ['comp', 0, 'Full'],
  Maryland: ['comp', 0, 'Healthy Smiles'],
  Massachusetts: ['comp', 0, 'MassHealth'],
  Michigan: ['comp', 0, 'Full'],
  Minnesota: ['comp', 0, 'Full'],
  Mississippi: ['eo', 0, 'Emergency only'],
  Missouri: ['ext', 0, 'Most services'],
  Montana: ['comp', 0, 'Full'],
  Nebraska: ['ext', 749, '$749 cap'],
  Nevada: ['lim', 0, 'Limited'],
  'New Hampshire': ['ext', 1500, '$1.5K cap'],
  'New Jersey': ['comp', 0, 'Full'],
  'New Mexico': ['comp', 0, 'Full'],
  'New York': ['comp', 0, 'Full'],
  'North Carolina': ['lim', 0, 'Limited'],
  'North Dakota': ['comp', 0, 'Full'],
  Ohio: ['comp', 0, 'Full'],
  Oklahoma: ['ext', 1000, '$1K cap'],
  Oregon: ['comp', 0, 'Full'],
  Pennsylvania: ['comp', 0, 'Full'],
  'Rhode Island': ['comp', 0, 'Full'],
  'South Carolina': ['lim', 0, 'Limited'],
  'South Dakota': ['lim', 1000, '$1K cap'],
  Tennessee: ['eo', 0, 'Emergency only'],
  Texas: ['eo', 0, 'Emergency only'],
  Utah: ['comp', 0, 'Expanded 2025'],
  Vermont: ['comp', 0, 'Full'],
  Virginia: ['comp', 0, 'Full'],
  Washington: ['comp', 0, 'Apple Health'],
  'West Virginia': ['comp', 2000, '$2K cap'],
  Wisconsin: ['comp', 0, 'Full'],
  Wyoming: ['lim', 0, 'Limited'],
}
export const MC: Record<MedicaidTier, number[]> = {
  comp: [1, 1, 1, 1, 1, 1, 0],
  ext: [1, 1, 1, 1, 1, 0, 0],
  lim: [1, 1, 0, 0, 0, 0, 0],
  eo: [0, 0, 0, 0, 0, 0, 0],
}
export const SM: Record<string, number> = {
  Alabama: 0.82,
  Alaska: 1.35,
  Arizona: 0.95,
  Arkansas: 0.8,
  California: 1.25,
  Colorado: 1.05,
  Connecticut: 1.25,
  Delaware: 1.05,
  'District of Columbia': 1.3,
  Florida: 1.0,
  Georgia: 0.92,
  Hawaii: 1.3,
  Idaho: 0.9,
  Illinois: 1.1,
  Indiana: 0.9,
  Iowa: 0.88,
  Kansas: 0.88,
  Kentucky: 0.85,
  Louisiana: 0.85,
  Maine: 1.0,
  Maryland: 1.15,
  Massachusetts: 1.3,
  Michigan: 0.95,
  Minnesota: 1.05,
  Mississippi: 0.78,
  Missouri: 0.9,
  Montana: 0.92,
  Nebraska: 0.88,
  Nevada: 1.05,
  'New Hampshire': 1.1,
  'New Jersey': 1.25,
  'New Mexico': 0.88,
  'New York': 1.3,
  'North Carolina': 0.95,
  'North Dakota': 0.9,
  Ohio: 0.92,
  Oklahoma: 0.85,
  Oregon: 1.1,
  Pennsylvania: 1.05,
  'Rhode Island': 1.15,
  'South Carolina': 0.88,
  'South Dakota': 0.88,
  Tennessee: 0.85,
  Texas: 0.95,
  Utah: 0.95,
  Vermont: 1.05,
  Virginia: 1.05,
  Washington: 1.15,
  'West Virginia': 0.8,
  Wisconsin: 0.95,
  Wyoming: 0.92,
}
export const TL: Record<MedicaidTier, string> = {
  comp: 'Comprehensive',
  ext: 'Extensive',
  lim: 'Limited',
  eo: 'Emergency only',
}
export const TC: Record<MedicaidTier, string> = {
  comp: '#2d8a4e',
  ext: '#a68307',
  lim: '#c2710c',
  eo: '#c2340a',
}
export const STATES = Object.keys(SM).sort()

export function catOfProc(pi: number): number {
  for (let c = 0; c < CAT_RANGES.length; c++) {
    if (pi >= CAT_RANGES[c][0] && pi <= CAT_RANGES[c][1]) return c
  }
  return 0
}

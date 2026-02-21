import { z } from 'zod'
import {
  ChiefComplaint,
  InsuranceType,
  MedicaidPlan,
  UrgencyLevel,
  BudgetBand,
  TravelMode,
  TravelTime,
  LanguagePreference,
} from './enums.js'

export const CreateSessionSchema = z
  .object({
    zip: z
      .string()
      .regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits')
      .optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    chiefComplaint: ChiefComplaint,
    insuranceType: InsuranceType,
    medicaidPlan: MedicaidPlan.optional(),
    urgency: UrgencyLevel,
    budgetBand: BudgetBand.optional(),
    travelMode: TravelMode.optional(),
    travelTime: TravelTime.optional(),
    languagePreference: LanguagePreference.default('ENGLISH'),
    hasFever: z.boolean().optional(),
    hasFacialSwelling: z.boolean().optional(),
    difficultySwallowingBreathing: z.boolean().optional(),
    referralSource: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      // If insurance is Medicaid-related, medicaidPlan should be provided
      const medicaidTypes = ['MEDICAID', 'DUAL_MEDICAID_MEDICARE']
      if (medicaidTypes.includes(data.insuranceType) && !data.medicaidPlan) {
        return false
      }
      return true
    },
    {
      message: 'Medicaid plan is required when insurance type is Medicaid',
      path: ['medicaidPlan'],
    },
  )

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

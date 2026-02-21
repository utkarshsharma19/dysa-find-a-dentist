import { pgEnum } from 'drizzle-orm/pg-core'

// Placeholder — full enums will be added in PR-DATA-002
export const yesNoUnknown = pgEnum('yes_no_unknown', ['YES', 'NO', 'UNKNOWN'])

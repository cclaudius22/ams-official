/**
 * Visa-type registry — the single source of vocab truth AND the multi-visa
 * config surface. Bridges the three vocabs (wire/corpus `skilled-worker`,
 * DIS-normalized `skilled_worker`, AMS canonical `skilled_worker_visa`) so the
 * corpus is never renamed (map, don't rename). The `phase` flag distinguishes
 * the live Phase-1 deep-review route (skilled worker) from the Phase-2 vision
 * routes (queue/allocation only). See docs/specs/2026-06-24-multi-visa-queue-allocation-design.md §5.1.
 */

export type VisaPhase = 1 | 2

export interface VisaTypeDef {
  key: string // AMS canonical, e.g. 'skilled_worker_visa'
  label: string // 'Skilled Worker'
  wireAliases: string[] // corpus/DIS vocab, e.g. ['skilled-worker','skilled_worker']
  specialization: string // officer-specialization token (== key here)
  phase: VisaPhase // 1 = live DIS+OV deep-review pipeline; 2 = queue/allocation only
}

export const VISA_TYPES: VisaTypeDef[] = [
  { key: 'skilled_worker_visa', label: 'Skilled Worker', wireAliases: ['skilled-worker', 'skilled_worker'], specialization: 'skilled_worker_visa', phase: 1 },
  { key: 'student_visa', label: 'Student', wireAliases: ['student'], specialization: 'student_visa', phase: 2 },
  { key: 'senior_specialist_worker_visa', label: 'Senior / Specialist Worker', wireAliases: ['senior-specialist-worker', 'senior_specialist_worker'], specialization: 'senior_specialist_worker_visa', phase: 2 },
  { key: 'spouse_partner_visa', label: 'Spouse / Partner', wireAliases: ['spouse-partner', 'spouse_partner'], specialization: 'spouse_partner_visa', phase: 2 },
  { key: 'global_talent_visa', label: 'Global Talent', wireAliases: ['global-talent', 'global_talent'], specialization: 'global_talent_visa', phase: 2 },
  { key: 'innovator_founder_visa', label: 'Innovator Founder', wireAliases: ['innovator-founder', 'innovator_founder'], specialization: 'innovator_founder_visa', phase: 2 },
]

/** Lowercase + collapse hyphens to underscores so all three vocabs map alike. */
const canon = (s: string): string => s.trim().toLowerCase().replace(/-/g, '_')

const INDEX = new Map<string, VisaTypeDef>()
for (const def of VISA_TYPES) {
  INDEX.set(canon(def.key), def)
  for (const alias of def.wireAliases) INDEX.set(canon(alias), def)
}

/** Any vocab → canonical AMS key; `null` for unknown (caller decides fallback). */
export function normalizeVisaType(raw: string): string | null {
  return raw ? INDEX.get(canon(raw))?.key ?? null : null
}

export function visaTypeLabel(key: string): string {
  return INDEX.get(canon(key))?.label ?? key
}

export function visaTypePhase(key: string): VisaPhase | null {
  return INDEX.get(canon(key))?.phase ?? null
}

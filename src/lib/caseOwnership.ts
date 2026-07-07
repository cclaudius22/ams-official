// src/lib/caseOwnership.ts
// Pure per-case ownership predicate (Task 5). No I/O, no framework imports —
// unit-testable in isolation and safe to call from both API routes and (if
// ever needed) client code.
//
// Scope: this expresses ONLY the officer<->case equality relation. The admin
// bypass (spec amendment, Chris 3 Jul: role === 'admin' → full access to every
// case, demo-wide) is NOT encoded here — it's a call-site decision made
// BEFORE this function is invoked (callers should skip the ownsCase check
// entirely for admins rather than trying to special-case it inside a "pure
// equality" predicate).

/**
 * Does the officer identified by `officerId` own the case whose
 * `assignedTo` id is `assignedToId`?
 *
 * True only when BOTH ids are defined, non-empty strings, and equal.
 * Undefined/empty on either side (unassigned case, or no officer context)
 * is always a non-match — ownership is never assumed by default.
 */
export function ownsCase(assignedToId: string | undefined, officerId: string | undefined): boolean {
  if (!assignedToId || !officerId) return false
  return assignedToId === officerId
}

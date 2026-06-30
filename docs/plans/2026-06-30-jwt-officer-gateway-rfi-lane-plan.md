# JWT Two-Login + Officer Gateway + RFI Lane — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
>
> **SPEC (read first):** `docs/specs/2026-06-30-rfi-officer-roles-design.md` (audited PASS w/ required edits, approved). This plan implements it; the spec is the source of truth for *why*. The 3b RFI per-case scaffold already exists and is pushed — this plan adds **auth + the queue-level surfaces around it**.

**Goal:** Add a JWT two-login demo (admin + officer), turn `/dashboard/reviewer` into the officer gateway, and add a per-officer RFI lane — all scaffold-level, reusing the existing auth layer.

**Architecture:** Reuse `src/lib/auth.ts` (JWT/cookie/helpers); add an `officerId` claim + a Prisma-bypassed demo-login for two seeded accounts; gate `/dashboard/**` in Next middleware by `role`; enforce per-case ownership (`assignedTo === officerId`) at the page + APIs; upgrade the existing reviewer stats page into a tiled gateway; add an RFI lane page fed by a new provider method over the corpus.

**Tech Stack:** Next.js (app router), TypeScript, `jsonwebtoken` (existing), vitest, Playwright (via MCP), `bun run dev`.

## Global Constraints
- Run shape: `DATA_PROVIDER=ams-demo AMS_DEMO_CORPUS_PATH=data/demo-corpus PORT=3000 bun run dev`.
- TDD red→green; after each phase: full `npx vitest run` green + `npx tsc --noEmit` == **76** (0 new baseline) + Playwright evidence.
- Scaffold only — Phase-2 parks (per spec §7): real Prisma auth, SSO, RBAC, persistence, applicant portal, notifications engine, DIS re-ingestion.
- **No `git add -A`.** Commit own files via explicit paths; pushes go through Marshall on Chris's named approval.
- Reuse existing patterns: `src/lib/auth.ts`, `src/contexts/OfficerContext.tsx` (`useOfficer()`), `src/lib/officerQueue.ts` (SLA helpers), `src/data/providers/deepSetRfiAdapter.ts` (`RfiSummary`/`mapRfi`), `src/data/seed/officers.ts` (`defaultOfficers`, demo officer = `officer-demo` Rachel Johnson).

---

## File structure

| File | Responsibility |
|---|---|
| `src/lib/auth.ts` (modify) | Add `officerId?` to `JWTPayload`. |
| `src/lib/demoAccounts.ts` (create) | The 2 seeded demo accounts + `validateDemoLogin(email,password)` → payload (no DB). |
| `src/app/api/auth/login/route.ts` (create) | POST: validate (demo-bypass under ams-demo) → `generateToken` → `setAuthCookie`. |
| `src/app/api/auth/logout/route.ts` (create) | POST: `clearAuthCookie`. |
| `src/lib/authRedirect.ts` (create) | Pure `landingFor(role)` + `routeAllowed(role, path)` helpers (testable; used by middleware). |
| `src/middleware.ts` (create) | Gate `/dashboard/**` + `/signin` via the token + the pure helpers. |
| `src/app/signin/page.tsx` (create or extend) | Two demo-login buttons (Admin / Officer). |
| `src/lib/caseOwnership.ts` (create) | Pure `ownsCase(assignedToId, officerId)` guard. |
| `src/app/dashboard/reviewer/[applicationId]/page.tsx` (modify) | Apply ownership guard. |
| `src/app/api/ams-demo/applications/[id]/review/route.ts` (modify) | Apply ownership guard (officerId from token). |
| `src/data/providers/ams-demo-provider.ts` (modify) | Assign the 3 RFI heroes to the demo officer on init; add `getRfiQueue(officerId)`. |
| `src/data/providers/rfiQueueAdapter.ts` (create) | Pure `mapRfiQueueItem(raw, now)` → `{id, applicantName, issue, dueAt, state}`; `RfiLaneState`. |
| `src/app/api/ams-demo/rfis/route.ts` (create) | GET `?officerId=` → the lane items. |
| `src/app/dashboard/reviewer/page.tsx` (modify) | Upgrade stats page → gateway tiles + derived RFI strip. |
| `src/app/dashboard/reviewer/rfis/page.tsx` (create) | RFI lane: grouped Awaiting / Returned / Overdue. |
| `src/components/dashboard/SidebarNavigation.tsx` (modify) | Add "My RFIs" nav item. |
| Tests | `src/__tests__/auth-demo.test.ts`, `auth-redirect.test.ts`, `case-ownership.test.ts`, `rfi-queue.test.ts`. |

---

## Phase 1 — JWT two-login

### Task 1: `officerId` claim + demo accounts
**Files:** Modify `src/lib/auth.ts:12-19` (JWTPayload); Create `src/lib/demoAccounts.ts`; Test `src/__tests__/auth-demo.test.ts`.
**Interfaces — Produces:** `JWTPayload` gains `officerId?: string`. `demoAccounts: DemoAccount[]` where `DemoAccount = { email, password, payload: Omit<JWTPayload,'iat'|'exp'> }`. `validateDemoLogin(email, password): Omit<JWTPayload,'iat'|'exp'> | null`.

- [ ] **Step 1 — failing test** (`auth-demo.test.ts`): assert `validateDemoLogin('officer@demo.gov','officer')` returns a payload with `role==='officer'` and `officerId==='officer-demo'`; admin account returns `role==='admin'` and no/empty `officerId`; bad creds → `null`. Also assert `generateToken`→`verifyToken` round-trips `officerId`.
- [ ] **Step 2 — run, expect fail** (`npx vitest run src/__tests__/auth-demo.test.ts`): FAIL (module missing).
- [ ] **Step 3 — implement:** add `officerId?: string` to `JWTPayload`. Create `demoAccounts.ts`: two accounts — admin `{email:'admin@demo.gov', role:'admin', userId:'user-admin', email…, organizationId:'ho-demo'}` and officer `{email:'officer@demo.gov', role:'officer', officerId:'officer-demo', userId:'user-officer', organizationId:'ho-demo'}` (passwords = fixed demo strings). `validateDemoLogin` does a constant-time-ish equality match.
- [ ] **Step 4 — run, expect pass.**
- [ ] **Step 5 — commit** (`git add src/lib/auth.ts src/lib/demoAccounts.ts src/__tests__/auth-demo.test.ts`).

### Task 2: Auth login/logout routes (demo-bypass)
**Files:** Create `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`.
**Interfaces — Consumes:** `validateDemoLogin`, `generateToken`, `setAuthCookie`, `clearAuthCookie`. **Produces:** `POST /api/auth/login {email,password}` → 200 `{role, officerId}` + Set-Cookie `auth-token`; 401 on bad creds. `POST /api/auth/logout` → clears cookie.
- [ ] **Step 1 — implement login route:** under `DATA_PROVIDER==='ams-demo'` use `validateDemoLogin`; else fall through to the existing Prisma path (leave a clearly-marked `// Phase 2: real DB login` branch returning 501 for now if no existing handler to call). On success: `const token = generateToken(payload); const c = setAuthCookie(token);` set the cookie on `NextResponse`.
- [ ] **Step 2 — implement logout route:** `clearAuthCookie()` → set on response.
- [ ] **Step 3 — manual curl check** (server running): `curl -i -XPOST localhost:3000/api/auth/login -d '{"email":"officer@demo.gov","password":"officer"}' -H 'content-type: application/json'` → 200 + `set-cookie: auth-token=…`. Bad creds → 401.
- [ ] **Step 4 — commit.**

### Task 3: Route-gate helpers + middleware
**Files:** Create `src/lib/authRedirect.ts`, `src/middleware.ts`; Test `src/__tests__/auth-redirect.test.ts`.
**Interfaces — Produces:** `landingFor(role:'admin'|'officer'): string` (admin→`/dashboard/livequeue`, officer→`/dashboard/reviewer`). `routeDecision(role, pathname): {allow:boolean, redirectTo?:string}` per spec §3 table (officer blocked from `/dashboard/livequeue` + `/dashboard/live-intelligence`; admin blocked from `/dashboard/reviewer*`).
- [ ] **Step 1 — failing test** (`auth-redirect.test.ts`): table-test `routeDecision`: officer + `/dashboard/livequeue` → redirect `/dashboard/reviewer`; admin + `/dashboard/reviewer/HO-SW-DEEP-2026-00012` → redirect `/dashboard/livequeue`; officer + `/dashboard/reviewer/rfis` → allow; `landingFor` mapping.
- [ ] **Step 2 — run, expect fail.**
- [ ] **Step 3 — implement** `authRedirect.ts` (pure). Then `middleware.ts`: read `auth-token` cookie → `verifyToken`; unauth on `/dashboard/**` → redirect `/signin`; else apply `routeDecision`; `config.matcher = ['/dashboard/:path*']`. (Per-case ownership is NOT here — that's Task 5.)
- [ ] **Step 4 — run, expect pass.**
- [ ] **Step 5 — commit.**

### Task 4: Sign-in page
**Files:** Create/extend `src/app/signin/page.tsx` (verify whether a stub exists first; reuse if so).
- [ ] **Step 1 — implement:** minimal page with two buttons — "Sign in as Officer (demo)" / "Sign in as Executive (demo)" — each POSTs the matching demo creds to `/api/auth/login` then `router.push(landingFor(role))`. (A creds form is Phase-2 polish; buttons keep the demo crisp.)
- [ ] **Step 2 — browser-verify** (Playwright): visit `/signin` → click Officer → lands `/dashboard/reviewer`; logout → `/signin` → Executive → lands `/dashboard/livequeue`; officer hitting `/dashboard/livequeue` redirects. Screenshot each.
- [ ] **Step 3 — `npx tsc --noEmit` == 76; `npx vitest run` green; commit. Phase-1 checkpoint.**

---

## Phase 2 — Officer gateway + ownership guard

### Task 5: Per-case ownership guard
**Files:** Create `src/lib/caseOwnership.ts`; Modify `src/app/api/ams-demo/applications/[id]/review/route.ts` + `src/app/dashboard/reviewer/[applicationId]/page.tsx`; Modify `ams-demo-provider.ts` (assign 3 RFI heroes to `officer-demo` on init so the happy path passes); Test `src/__tests__/case-ownership.test.ts`.
**Interfaces — Produces:** `ownsCase(assignedToId: string|undefined, officerId: string|undefined): boolean`. Provider: heroes `HO-SW-DEEP-2026-00012/00013/00014` assigned to `officer-demo` at init.
- [ ] **Step 1 — failing test:** `ownsCase('officer-demo','officer-demo')===true`; mismatch/undefined → false. Provider: after `initialize()`, `getApplications({assignedTo:['officer-demo']})` includes the 3 heroes.
- [ ] **Step 2 — run, expect fail.**
- [ ] **Step 3 — implement** `ownsCase`; in the provider, assign the 3 deep_set RFI heroes to `officer-demo` during init (so they appear in the demo officer's queue + lane). In the review API route, read the token (`getCurrentUser`), fetch the case's `assignedTo`, and `if(!ownsCase(assignedTo, token.officerId)) return 403`. In the per-case page, when the review fetch returns 403, render an "not assigned to you" state / redirect to the gateway.
- [ ] **Step 4 — run, expect pass.**
- [ ] **Step 5 — commit.**

### Task 6: Gateway upgrade + RFI strip
**Files:** Modify `src/app/dashboard/reviewer/page.tsx`.
**Interfaces — Consumes:** `useOfficer()`, `GET /api/ams-demo/rfis?officerId=` (Task 8 — if building Phase 2 before Phase 3, stub the strip counts to 0 and wire after Task 9).
- [ ] **Step 1 — implement:** replace `mockDashboardStats` hero with doorway tiles → My Queue (`/dashboard/reviewer/queue`), My RFIs (`/dashboard/reviewer/rfis`), SLA/today's progress; add the derived "RFIs: N awaiting · M overdue · nearest due `<date>`" strip from the lane endpoint.
- [ ] **Step 2 — browser-verify:** officer gateway renders tiles + strip; tiles navigate. Screenshot.
- [ ] **Step 3 — commit.**

### Task 7: "My RFIs" nav
**Files:** Modify `src/components/dashboard/SidebarNavigation.tsx`.
- [ ] **Step 1 — implement:** add a "My RFIs" item → `/dashboard/reviewer/rfis` in "Visa Processing" (replace a `href="#"` placeholder).
- [ ] **Step 2 — `tsc`==76; `vitest` green; browser screenshot; commit. Phase-2 checkpoint.**

---

## Phase 3 — RFI lane

### Task 8: `getRfiQueue` provider method
**Files:** Create `src/data/providers/rfiQueueAdapter.ts`; Modify `ams-demo-provider.ts`; Test `src/__tests__/rfi-queue.test.ts`.
**Interfaces — Produces:** `RfiLaneState = 'awaiting'|'returned'|'overdue'`. `RfiLaneItem = {id, applicantName, issue, dueAt?, state}`. `mapRfiQueueItem(raw, nowISO): RfiLaneItem | null` (null when `!rfi_lifecycle.enabled`). Provider `getRfiQueue(officerId, nowISO): Promise<RfiLaneItem[]>` — the officer's assigned deep_set cases that are RFI-enabled.
- [ ] **Step 1 — failing test** (against real corpus, `nowISO='2026-06-30'`): `mapRfiQueueItem` on 00012 → `{issue:'missing payslip month 2', state:'awaiting'|'returned', dueAt:'2026-07-08…'}`; a non-RFI case → null. Provider `getRfiQueue('officer-demo','2026-06-30')` returns the 3 heroes; `getRfiQueue('officer-1',…)` returns `[]`.
- [ ] **Step 2 — run, expect fail.**
- [ ] **Step 3 — implement** `mapRfiQueueItem`: derive `state` — `overdue` if `due_at < now` and no response; `returned` if a response artifact exists (corpus has it); else `awaiting`. (Demo default per spec: heroes show as `awaiting`; document the derivation.) Provider `getRfiQueue` = assigned RFI-enabled deep_set cases mapped.
- [ ] **Step 4 — run, expect pass.**
- [ ] **Step 5 — commit.**

### Task 9: RFI lane API route
**Files:** Create `src/app/api/ams-demo/rfis/route.ts`.
**Interfaces — Produces:** `GET /api/ams-demo/rfis?officerId=` → `{success, data: RfiLaneItem[]}` via the active provider's `getRfiQueue` (capability-narrowed like the review route). Reads `officerId` from the token when present, else the query param (demo).
- [ ] **Step 1 — implement** mirroring `…/applications/[id]/review/route.ts` (provider capability check → 404 if unsupported).
- [ ] **Step 2 — curl check:** `/api/ams-demo/rfis?officerId=officer-demo` → 3 items.
- [ ] **Step 3 — commit.**

### Task 10: RFI lane page
**Files:** Create `src/app/dashboard/reviewer/rfis/page.tsx`.
- [ ] **Step 1 — implement:** `useOfficer()` → fetch `/api/ams-demo/rfis?officerId=…` → render three groups (Awaiting / Returned / Overdue), each row = applicant + issue + due date + click-through to `/dashboard/reviewer/<id>`. Status-led, no numeric grades. Empty group → tidy empty state.
- [ ] **Step 2 — browser-verify the full acceptance path (spec §6):** officer login → gateway → My RFIs → grouped lane → open 00012 → 4 panels + RFI walkthrough; admin login → livequeue, PII redirect. Screenshots tied to SHA.
- [ ] **Step 3 — full `vitest` green + `tsc`==76; commit. Phase-3 checkpoint → hand Marshall for the coordinated push.**

---

## Self-review (against spec)

- **Spec coverage:** §1 two-login → T1–T4 + middleware; §2 JWT/adapt-existing → T1–T2; §3 gateway + route-gating → T3,T6,T7; §3 ownership guard + §4 enforcement → T5; §4 permissions → T5 (officer-only) + applicant=Phase2 (no task, correct); §5 RFI state (no re-ingestion, derived) → T8 (state derivation, no DIS re-run); §6 acceptance path → T4/T6/T10 browser steps; §7 scaffold/prod split honored (demo-bypass, derived counts). **No gaps.**
- **Placeholder scan:** the only deferred bit is the real Prisma login branch in T2 — intentionally Phase-2, marked, returns 501 in demo. Acceptable (spec §7).
- **Type consistency:** `JWTPayload.officerId`, `RfiLaneItem`, `RfiLaneState`, `ownsCase`, `landingFor`/`routeDecision`, `getRfiQueue` are defined once and consumed consistently.
- **Open wiring note (surfaced for the executor):** the 3 RFI heroes are deep_set cases (not bulk queue); T5 assigns them to `officer-demo` so they appear in the officer's queue/lane and pass the ownership guard. Confirm this assignment doesn't collide with auto-allocate (deep_set is separate from the 1,000 bulk).

## Execution handoff
Recommend **fresh chat** (this session is token-heavy) executing via `superpowers:subagent-driven-development` (fresh subagent per task + review) or `superpowers:executing-plans`. Spec + this plan + `SESSION_LOG.md` = full handoff. Build order: Phase 1 → 2 → 3, checkpoint after each.

# Super Admin Setup Wizard - Implementation Documentation

## Overview

A complete SaaS-style organization onboarding wizard for the Open Visa AMS platform. Similar to Google Workspace or Atlassian admin setup, the first admin creates their organization, sets up their account with real credentials, and configures the AMS system.

**Status:** Implementation Complete (Pending Testing)
**Date:** January 2026

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Database | Neon PostgreSQL |
| ORM | Prisma 5.22.0 |
| Authentication | JWT + bcrypt |
| Frontend | Next.js 16, React 19, React Hook Form |
| Styling | Tailwind CSS, Radix UI |

---

## Database Schema

### Models

```prisma
model Organization {
  id         String        @id @default(cuid())
  name       String
  country    String        // UK, DE, CA
  department String
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  users      User[]
  config     SystemConfig?
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  passwordHash   String
  firstName      String
  lastName       String
  role           Role         @default(ADMIN)
  mfaEnabled     Boolean      @default(false)
  mfaSecret      String?
  organizationId String
  organization   Organization @relation(...)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model SystemConfig {
  id                     String       @id @default(cuid())
  organizationId         String       @unique
  organization           Organization @relation(...)
  requiredClearanceLevel String?
  mfaRequired            Boolean      @default(true)
  sessionDurationHours   Int          @default(8)
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  USER
}
```

---

## Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/migrations/` | Database migration files |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | JWT + bcrypt utilities (server-side) |
| `src/lib/password-utils.ts` | Password validation (client-safe) |
| `src/app/api/auth/login/route.ts` | POST login endpoint |
| `src/app/api/auth/logout/route.ts` | POST logout endpoint |
| `src/app/api/auth/me/route.ts` | GET current user endpoint |
| `src/app/super-admin/create/constants/index.ts` | Country/department config |
| `src/app/super-admin/create/steps/OrganizationStep.tsx` | Step 1: Org details |
| `src/app/super-admin/create/steps/AccountStep.tsx` | Step 2: Admin credentials |
| `src/app/super-admin/create/steps/SecurityStep.tsx` | Step 3: Security policies |
| `src/app/super-admin/create/steps/ReviewStep.tsx` | Step 4: Review & submit |

### Modified Files

| File | Changes |
|------|---------|
| `.env` | Added DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN |
| `src/app/super-admin/create/types/index.ts` | Simplified type definitions |
| `src/app/super-admin/create/hooks/useSuperAdminForm.tsx` | 4-step validation, real API submission |
| `src/app/super-admin/create/SuperAdminForm.tsx` | 4-step progress UI |
| `src/app/api/super-admin/route.ts` | Creates org + user in database |
| `src/app/page.tsx` | Real auth API integration |

### Deleted Files

| File | Reason |
|------|--------|
| `src/app/super-admin/create/steps/IdentityGovernmentStep.tsx` | Replaced by OrganizationStep |
| `src/app/super-admin/create/steps/AccessEmergencyStep.tsx` | Replaced by SecurityStep |
| `src/app/super-admin/create/steps/SecurityClearanceStep.tsx` | Replaced by SecurityStep |

---

## Wizard Flow (4 Steps)

### Step 1: Organization Setup
- Organization name (required)
- Country selection (UK, Germany, Canada)
- Department selection (dynamic based on country)

**Country/Department Configuration:**

| Country | Departments |
|---------|-------------|
| UK | Home Office, FCDO, MOD |
| Germany | BMI (Interior), AA (Foreign), BMVG (Defence) |
| Canada | IRCC, CBSA, GAC |

### Step 2: Admin Account
- First name, Last name
- Email address (will be username)
- Password with strength indicator
- Confirm password with match validation

**Password Requirements:**
- Minimum 8 characters
- Uppercase and lowercase letters
- At least one number
- At least one special character
- Visual strength meter (Weak → Strong)

### Step 3: Security Policies
- Required clearance level for users (optional)
- MFA requirement toggle (default: enabled)
- Session duration (1hr, 4hr, 8hr, 24hr)
- MFA method selection (TOTP, SMS, Email)

### Step 4: Review & Complete
- Summary of all selections
- Terms acceptance checkbox
- Create Organization button
- Success: Redirect to login with success message

---

## API Endpoints

### POST `/api/super-admin`
Creates organization, user, and system config.

**Request:**
```json
{
  "organization": {
    "name": "Home Office Immigration",
    "country": "UK",
    "department": "HOME_OFFICE"
  },
  "account": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@homeoffice.gov.uk",
    "password": "SecurePass123!"
  },
  "security": {
    "requiredClearanceLevel": "STANDARD",
    "mfaRequired": true,
    "sessionDurationHours": 8,
    "mfaMethod": "TOTP"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "organizationId": "clxyz...",
  "userId": "clxyz..."
}
```

### POST `/api/auth/login`
Authenticates user and returns JWT.

**Request:**
```json
{
  "email": "john.smith@homeoffice.gov.uk",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxyz...",
    "email": "john.smith@homeoffice.gov.uk",
    "firstName": "John",
    "lastName": "Smith",
    "role": "SUPER_ADMIN",
    "mfaEnabled": true,
    "organization": { ... }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/logout`
Clears auth cookie.

### GET `/api/auth/me`
Returns current authenticated user.

---

## Environment Variables

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="8h"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Security Features

1. **Password Hashing:** bcrypt with 12 salt rounds
2. **JWT Tokens:** Signed with secret, 8-hour expiry
3. **HTTP-Only Cookies:** Token stored in secure cookie
4. **Input Validation:** Server-side validation on all endpoints
5. **Email Uniqueness:** Enforced at database level
6. **Transaction Safety:** Org + User + Config created atomically

---

# Production Testing Plan

## Pre-Deployment Checklist

### Environment Setup
- [ ] Neon PostgreSQL database provisioned
- [ ] DATABASE_URL configured with production credentials
- [ ] JWT_SECRET set to cryptographically secure value (min 32 chars)
- [ ] SSL/TLS enabled for database connection

### Database
- [ ] Run `bunx prisma migrate deploy` in production
- [ ] Verify tables created: Organization, User, SystemConfig
- [ ] Verify indexes on User.email and User.organizationId

---

## Test Cases

### TC-001: Organization Creation (Happy Path)

**Preconditions:** No existing organizations

**Steps:**
1. Navigate to `/super-admin/create`
2. Step 1: Enter org name "Test Organization", select UK, select Home Office
3. Step 2: Enter first/last name, valid email, strong password
4. Step 3: Enable MFA, set 8hr session, select TOTP
5. Step 4: Accept terms, click Create Organization

**Expected Results:**
- [ ] Organization created in database
- [ ] User created with SUPER_ADMIN role
- [ ] SystemConfig created with correct settings
- [ ] Password stored as bcrypt hash (not plaintext)
- [ ] Redirected to login page with success message

**Verification Queries:**
```sql
SELECT * FROM "Organization" ORDER BY "createdAt" DESC LIMIT 1;
SELECT * FROM "User" WHERE role = 'SUPER_ADMIN';
SELECT * FROM "SystemConfig";
```

---

### TC-002: Login Flow (Happy Path)

**Preconditions:** TC-001 completed successfully

**Steps:**
1. Navigate to `/` (login page)
2. Select "Super Admin User"
3. Enter registered email and password
4. Click Next

**Expected Results:**
- [ ] If MFA enabled: Redirected to MFA step
- [ ] If MFA disabled: Redirected to `/dashboard`
- [ ] JWT cookie set with correct expiry
- [ ] User data accessible via `/api/auth/me`

---

### TC-003: Duplicate Email Prevention

**Preconditions:** User with email "test@example.com" exists

**Steps:**
1. Navigate to `/super-admin/create`
2. Complete wizard with same email "test@example.com"
3. Click Create Organization

**Expected Results:**
- [ ] Error displayed: "An account with this email already exists"
- [ ] No duplicate user created
- [ ] User remains on Step 4

---

### TC-004: Invalid Login Credentials

**Steps:**
1. Navigate to `/`
2. Enter valid email with wrong password
3. Click Next

**Expected Results:**
- [ ] Error displayed: "Invalid email or password"
- [ ] No JWT issued
- [ ] No redirect occurs

---

### TC-005: Password Validation

**Steps:**
1. Navigate to `/super-admin/create`
2. Step 2: Try various weak passwords

**Test Cases:**
| Password | Expected Result |
|----------|-----------------|
| `123` | Weak - too short |
| `password` | Weak - no uppercase/numbers |
| `Password1` | Fair - no special char |
| `Password1!` | Good/Strong |

**Expected Results:**
- [ ] Strength indicator updates in real-time
- [ ] Cannot proceed with score < 3 (Good)
- [ ] Helpful feedback messages displayed

---

### TC-006: Session Expiry

**Preconditions:** Logged in with 1hr session duration

**Steps:**
1. Login successfully
2. Wait > 1 hour (or manipulate token expiry)
3. Attempt to access `/api/auth/me`

**Expected Results:**
- [ ] Returns 401 Unauthorized
- [ ] User redirected to login

---

### TC-007: Country/Department Validation

**Steps:**
1. Navigate to `/super-admin/create`
2. Select country "UK"
3. Verify department dropdown

**Expected Results:**
- [ ] Only UK departments shown (Home Office, FCDO, MOD)
- [ ] Changing country clears department selection
- [ ] Cannot proceed without selecting department

---

### TC-008: Form State Persistence

**Steps:**
1. Navigate to `/super-admin/create`
2. Fill out Step 1 completely
3. Click Next to Step 2
4. Click Previous back to Step 1

**Expected Results:**
- [ ] All Step 1 data preserved
- [ ] Progress indicator shows correct state

---

## Load Testing (Optional)

### LT-001: Concurrent Registrations

**Tool:** k6, Artillery, or similar

**Scenario:**
- 50 concurrent organization registrations
- Unique emails for each

**Expected Results:**
- [ ] All registrations succeed
- [ ] No database deadlocks
- [ ] Response time < 2s (p95)

### LT-002: Login Storm

**Scenario:**
- 100 concurrent login attempts
- Mix of valid and invalid credentials

**Expected Results:**
- [ ] Valid logins succeed
- [ ] Invalid logins return 401
- [ ] No rate limiting issues (or rate limiting works as expected)

---

## Security Testing

### ST-001: SQL Injection

**Steps:**
1. Attempt SQL injection in email field: `'; DROP TABLE User; --`
2. Attempt in organization name field

**Expected Results:**
- [ ] Input sanitized/parameterized
- [ ] No SQL execution
- [ ] Validation error returned

### ST-002: JWT Tampering

**Steps:**
1. Login and capture JWT
2. Modify payload (change role to SUPER_ADMIN)
3. Attempt to access protected endpoint

**Expected Results:**
- [ ] Modified token rejected
- [ ] Returns 401 Unauthorized

### ST-003: Password Not Exposed

**Steps:**
1. Login successfully
2. Check `/api/auth/me` response
3. Check network tab for any endpoint

**Expected Results:**
- [ ] Password/passwordHash never in API responses
- [ ] Only hashed password in database

---

## Rollback Plan

If critical issues discovered:

1. **Database:** Run `bunx prisma migrate reset` (DEV ONLY)
2. **Code:** Revert to previous commit
3. **Data:** Backup before migration, restore if needed

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA Lead | | | |
| Security | | | |
| Product Owner | | | |

---

## Known Issues / Technical Debt

1. **MFA Implementation:** Currently simulated - needs real TOTP integration
2. **Rate Limiting:** Not implemented on auth endpoints
3. **Email Verification:** Not implemented - users can register with any email
4. **Password Reset:** Flow not implemented
5. **Audit Logging:** No login/logout audit trail yet
6. **Pre-existing TypeScript errors:** Some onboarding components have type issues (to be cleaned up)

---

## Future Enhancements

1. Implement real TOTP MFA with QR code generation
2. Add email verification flow
3. Implement password reset functionality
4. Add audit logging for security events
5. Implement rate limiting on auth endpoints
6. Add account lockout after failed attempts
7. Support additional countries/departments
8. Add invitation flow for team members
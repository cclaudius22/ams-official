import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '@/lib/auth'
import { validateDemoLogin } from '@/lib/demoAccounts'

describe('validateDemoLogin', () => {
  it('authenticates the officer demo account with officerId claim', () => {
    const payload = validateDemoLogin('officer@demo.gov', 'officer')
    expect(payload).not.toBeNull()
    expect(payload?.role).toBe('officer')
    expect(payload?.officerId).toBe('officer-demo')
  })

  it('authenticates the admin demo account with no officerId claim', () => {
    const payload = validateDemoLogin('admin@demo.gov', 'admin')
    expect(payload).not.toBeNull()
    expect(payload?.role).toBe('admin')
    expect(payload?.officerId).toBeFalsy()
  })

  it('rejects bad credentials', () => {
    expect(validateDemoLogin('officer@demo.gov', 'wrong-password')).toBeNull()
    expect(validateDemoLogin('nobody@demo.gov', 'officer')).toBeNull()
  })
})

describe('generateToken / verifyToken round-trip', () => {
  it('preserves the officerId claim through sign and verify', () => {
    const payload = validateDemoLogin('officer@demo.gov', 'officer')
    expect(payload).not.toBeNull()

    const token = generateToken(payload!)
    const decoded = verifyToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded?.role).toBe('officer')
    expect(decoded?.officerId).toBe('officer-demo')
  })
})

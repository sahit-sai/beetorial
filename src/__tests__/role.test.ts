import { describe, it, expect } from 'vitest'

const VALID_ROLES = ['student', 'parent', 'mentor', 'admin'] as const
type UserRole = typeof VALID_ROLES[number]

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as any)
}

describe('Role Validation Logic', () => {
  it('should accept valid user roles', () => {
    expect(isValidRole('student')).toBe(true)
    expect(isValidRole('parent')).toBe(true)
    expect(isValidRole('mentor')).toBe(true)
    expect(isValidRole('admin')).toBe(true)
  })

  it('should reject invalid user roles', () => {
    expect(isValidRole('teacher')).toBe(false)
    expect(isValidRole('guest')).toBe(false)
    expect(isValidRole('')).toBe(false)
  })
})

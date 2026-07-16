import { describe, it, expect } from 'vitest'

// Mock state lists for testing server action logic
const TEST_AVAILABILITY = [
  { id: 'slot-abc', mentor_id: 'mentor-l-sterling', start_time: '2026-07-20T14:00:00Z', status: 'available' }
]
const TEST_CLASSES: any[] = []
const TEST_NOTEPADS: Record<string, string> = {}

function testCreateSlot(mentorId: string, startStr: string) {
  const newSlot = {
    id: `slot-${Date.now()}`,
    mentor_id: mentorId,
    start_time: startStr,
    status: 'available'
  }
  TEST_AVAILABILITY.push(newSlot)
  return true
}

function testBookSlot(slotId: string, studentId: string) {
  const slot = TEST_AVAILABILITY.find((s) => s.id === slotId)
  if (!slot || slot.status !== 'available') return false
  
  slot.status = 'booked'
  TEST_CLASSES.push({
    id: `class-${Date.now()}`,
    student_id: studentId,
    mentor_id: slot.mentor_id,
    start_time: slot.start_time,
    subject: 'Mathematics Check-In',
    status: 'scheduled'
  })
  return true
}

function testSaveNotepad(studentId: string, mentorId: string, content: string) {
  const key = `${studentId}_${mentorId}`
  TEST_NOTEPADS[key] = content
  return true
}

describe('Mentor Workspace Actions Logic', () => {
  it('should successfully create a new available slot in the listing', () => {
    const prevCount = TEST_AVAILABILITY.length
    const success = testCreateSlot('mentor-l-sterling', '2026-07-25T15:00:00Z')
    expect(success).toBe(true)
    expect(TEST_AVAILABILITY.length).toBe(prevCount + 1)
  })

  it('should transition available slot to booked and create a scheduled class agenda session', () => {
    const success = testBookSlot('slot-abc', 'student-a-jenkins')
    expect(success).toBe(true)
    
    const slot = TEST_AVAILABILITY.find((s) => s.id === 'slot-abc')
    expect(slot?.status).toBe('booked')
    expect(TEST_CLASSES.length).toBe(1)
    expect(TEST_CLASSES[0].student_id).toBe('student-a-jenkins')
  })

  it('should prevent booking slots that are already booked', () => {
    // Attempting to book 'slot-abc' again (status is now booked)
    const success = testBookSlot('slot-abc', 'student-a-jenkins')
    expect(success).toBe(false)
  })

  it('should save notepad content mapping unique student-mentor keys', () => {
    testSaveNotepad('student-1', 'mentor-5', 'Drafting fractions formulas.')
    expect(TEST_NOTEPADS['student-1_mentor-5']).toBe('Drafting fractions formulas.')
  })
})

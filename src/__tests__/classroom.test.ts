import { describe, it, expect } from 'vitest'
import { 
  generateLiveKitToken, 
  createClassroomSession, 
  completeClassroomSession,
  logClassroomMessage 
} from '@/app/classroom/actions'

describe('Classroom Live Session Helpers', () => {
  it('should generate a mock token when LiveKit env variables are not present', async () => {
    const roomName = 'maths-class-101'
    const participantName = 'Alex Jenkins'
    const token = await generateLiveKitToken(roomName, participantName)
    
    expect(token).toContain('mock-token')
    expect(token).toContain(roomName)
    expect(token).toContain(participantName)
  })

  it('should generate a valid mock classroom session ID matching the class reference', async () => {
    const classId = 'test-class-xyz'
    const sessionId = await createClassroomSession(classId)
    
    expect(sessionId).toContain('session')
    expect(sessionId).toContain(classId)
  })

  it('should run logging and completion actions without crashing in mock mode', async () => {
    const sessionId = 'session-123'
    
    await expect(
      logClassroomMessage(sessionId, 'student-1', 'Alex Jenkins', 'Hello mentor!')
    ).resolves.not.toThrow()

    await expect(
      completeClassroomSession(sessionId, '/recordings/test.mp4')
    ).resolves.not.toThrow()
  })
})

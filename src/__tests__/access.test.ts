import { describe, it, expect } from 'vitest'
import { getLinkedChildren, getStudentProgress } from '@/lib/data-fetchers'

describe('Access Control Security Checks', () => {
  it('should verify that a parent can only retrieve their linked children', async () => {
    // Sarah Jenkins is parent of Alex Jenkins
    const children = await getLinkedChildren('parent-sarah')
    expect(children).toHaveLength(1)
    expect(children[0].id).toBe('student-1-alex')
    expect(children[0].full_name).toBe('Alex Jenkins')
    
    // An arbitrary parent or user with no children linked should return empty list
    const unlinkedChildren = await getLinkedChildren('unlinked-parent')
    expect(unlinkedChildren).toHaveLength(0)
  })

  it('should retrieve correct student progress stats', async () => {
    const alexProgress = await getStudentProgress('student-1-alex')
    expect(alexProgress.accuracy_percentage).toBe(94)
    expect(alexProgress.streak_days).toBe(7)
    expect(alexProgress.xp).toBe(680)

    const emilyProgress = await getStudentProgress('student-2-emily')
    expect(emilyProgress.accuracy_percentage).toBe(88)
    expect(emilyProgress.streak_days).toBe(3)
    expect(emilyProgress.xp).toBe(410)
  })
})

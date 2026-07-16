import { describe, it, expect } from 'vitest'

// Emulate calculateSubjectProgress helper from client component
function calculateSubjectProgress(subj: { chapters: { topics: { completed: boolean }[] }[] }): number {
  let total = 0
  let completed = 0
  subj.chapters.forEach((ch) => {
    ch.topics.forEach((t) => {
      total++
      if (t.completed) completed++
    })
  })
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

describe('Reports & Syllabus Completion Math', () => {
  it('should calculate correct percentage when progress is half complete', () => {
    const mockSubject = {
      chapters: [
        {
          topics: [
            { completed: true },
            { completed: true },
            { completed: false },
            { completed: false },
          ]
        }
      ]
    }
    
    const pct = calculateSubjectProgress(mockSubject)
    expect(pct).toBe(50)
  })

  it('should calculate 100% when all topics are ticked', () => {
    const mockSubject = {
      chapters: [
        {
          topics: [
            { completed: true },
            { completed: true }
          ]
        }
      ]
    }
    
    const pct = calculateSubjectProgress(mockSubject)
    expect(pct).toBe(100)
  })

  it('should handle division by zero (empty chapters) gracefully without NaN outputs', () => {
    const mockSubject = {
      chapters: []
    }
    
    const pct = calculateSubjectProgress(mockSubject)
    expect(pct).toBe(0)
  })
})

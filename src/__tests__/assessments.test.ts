import { describe, it, expect, beforeEach } from 'vitest'
import { 
  startAssessmentAttempt, 
  submitAssessmentAnswers, 
  getStudentRevisionPacks 
} from '@/app/student/assessments/actions'

describe('Assessments Auto-Grading & Revision Pack Engine', () => {
  const studentId = 'test-student-grading'
  let attemptId = ''

  beforeEach(async () => {
    attemptId = await startAssessmentAttempt('ass-fractions', studentId)
  })

  it('should grade objective questions 100% correct when all answers match', async () => {
    const correctAnswers = [
      { questionId: 'q-1', answerText: '0.75' },
      { questionId: 'q-2', answerText: '2/3' },
      { questionId: 'q-3', answerText: '1/2:50%,1/4:25%,1/5:20%' },
      { questionId: 'q-4', answerText: 'This is a short answer explanation that is mentor graded.' }
    ]

    const results = await submitAssessmentAnswers(attemptId, correctAnswers)
    expect(results.score).toBe(100) 

    const packs = await getStudentRevisionPacks(studentId)
    const topicPacks = packs.filter((p) => p.student_id === studentId)
    expect(topicPacks).toHaveLength(0)
  })

  it('should calculate partial score and auto-generate revision packs on wrong answers', async () => {
    const wrongAnswers = [
      { questionId: 'q-1', answerText: '0.50' }, 
      { questionId: 'q-2', answerText: '2/3' },  
      { questionId: 'q-3', answerText: 'incorrect-match' }, 
      { questionId: 'q-4', answerText: 'Explanation' }
    ]

    const results = await submitAssessmentAnswers(attemptId, wrongAnswers)
    expect(results.score).toBe(33) 

    const packs = await getStudentRevisionPacks(studentId)
    const studentPacks = packs.filter((p) => p.student_id === studentId)
    expect(studentPacks).toBeDefined()
    expect(studentPacks.length).toBeGreaterThan(0)
    expect(studentPacks[0].topic_id).toBe('top-math-simplify')
  })
})

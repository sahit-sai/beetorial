'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { MOCK_TOPICS, MOCK_NOTES } from '@/lib/mock-data'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

// Private Mock Data constants (Next.js server actions restrict non-function exports)
const MOCK_ASSESSMENTS = [
  {
    id: 'ass-fractions',
    title: 'Fractions & Ratios Diagnostic',
    subject: 'Mathematics',
    time_limit_mins: 15,
  }
]

const MOCK_QUESTIONS = [
  {
    id: 'q-1',
    assessment_id: 'ass-fractions',
    type: 'mcq',
    question_text: 'What is 3/4 represented as a decimal?',
    options: ['0.50', '0.75', '0.25', '0.80'],
    correct_answer: '0.75',
    topic_id: 'top-math-simplify',
  },
  {
    id: 'q-2',
    assessment_id: 'ass-fractions',
    type: 'fill_blank',
    question_text: 'Simplify the fraction 8/12 to its lowest form (e.g. 2/3):',
    options: null,
    correct_answer: '2/3',
    topic_id: 'top-math-simplify',
  },
  {
    id: 'q-3',
    assessment_id: 'ass-fractions',
    type: 'match_pairs',
    question_text: 'Match the fraction with its percentage equivalent:',
    options: {
      pairs: [
        { left: '1/2', right: '50%' },
        { left: '1/4', right: '25%' },
        { left: '1/5', right: '20%' },
      ],
      choices: ['25%', '50%', '20%']
    },
    correct_answer: '1/2:50%,1/4:25%,1/5:20%',
    topic_id: 'top-math-simplify',
  },
  {
    id: 'q-4',
    assessment_id: 'ass-fractions',
    type: 'short_answer',
    question_text: 'Explain in your own words how you find the Greatest Common Divisor (GCD) to simplify a fraction.',
    options: null,
    correct_answer: 'mentor-evaluated',
    topic_id: 'top-math-simplify',
  }
]

// In-Memory storage for E2E and mock environments
const mockAttemptsStore = {
  get val() {
    if (!(globalThis as any).mockAttempts) (globalThis as any).mockAttempts = []
    return (globalThis as any).mockAttempts
  },
  set val(v: any[]) {
    (globalThis as any).mockAttempts = v
  }
}

const mockViolationsStore = {
  get val() {
    if (!(globalThis as any).mockViolations) (globalThis as any).mockViolations = []
    return (globalThis as any).mockViolations
  },
  set val(v: any[]) {
    (globalThis as any).mockViolations = v
  }
}

const mockRevisionPacksStore = {
  get val() {
    if (!(globalThis as any).mockRevisionPacks) (globalThis as any).mockRevisionPacks = []
    return (globalThis as any).mockRevisionPacks
  },
  set val(v: any[]) {
    (globalThis as any).mockRevisionPacks = v
  }
}

export async function resetAssessmentState(): Promise<boolean> {
  mockAttemptsStore.val = []
  mockViolationsStore.val = []
  mockRevisionPacksStore.val = []
  return true
}

export async function getStudentAssessments(studentId: string): Promise<any[]> {
  if (isMockEnv()) {
    return MOCK_ASSESSMENTS.map((ass) => {
      const attempt = mockAttemptsStore.val.find((a: any) => a.assessment_id === ass.id && a.student_id === studentId)
      return {
        ...ass,
        attempt: attempt || null,
      }
    })
  }

  try {
    const supabase = await createClient()
    const { data: assessments, error: assErr } = await supabase
      .from('assessments')
      .select('*, subjects(name)')

    if (assErr) throw assErr

    const { data: attempts, error: attErr } = await supabase
      .from('assessment_attempts')
      .select('*')
      .eq('student_id', studentId)

    if (attErr) throw attErr

    return (assessments || []).map((ass) => {
      const attempt = (attempts || []).find((a) => a.assessment_id === ass.id)
      return {
        ...ass,
        subject: ass.subjects?.name || 'General',
        attempt: attempt || null,
      }
    })
  } catch (err) {
    console.warn('Supabase getStudentAssessments failed, returning mock:', err)
    return MOCK_ASSESSMENTS.map((ass) => {
      const attempt = mockAttemptsStore.val.find((a: any) => a.assessment_id === ass.id && a.student_id === studentId)
      return {
        ...ass,
        subject: ass.subject,
        attempt: attempt || null,
      }
    })
  }
}

export async function getAssessmentQuestions(assessmentId: string): Promise<any[]> {
  if (isMockEnv()) {
    return MOCK_QUESTIONS.filter((q) => q.assessment_id === assessmentId)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase getAssessmentQuestions failed, returning mock:', err)
    return MOCK_QUESTIONS.filter((q) => q.assessment_id === assessmentId)
  }
}

export async function startAssessmentAttempt(assessmentId: string, studentId: string): Promise<string> {
  const attemptId = `attempt-${assessmentId}-${Date.now()}`

  if (isMockEnv()) {
    const newAttempt = {
      id: attemptId,
      assessment_id: assessmentId,
      student_id: studentId,
      score: null,
      status: 'started',
      violations_count: 0,
      created_at: new Date().toISOString(),
    }
    mockAttemptsStore.val.push(newAttempt)
    return attemptId
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('assessment_attempts')
      .insert({
        assessment_id: assessmentId,
        student_id: studentId,
        status: 'started',
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (err) {
    console.warn('Supabase startAttempt failed, using mock ID:', err)
    return attemptId
  }
}

export async function logProctoringViolation(
  attemptId: string, 
  violationType: 'face_missing' | 'multiple_faces' | 'tab_switch' | 'fullscreen_exit', 
  details: string
): Promise<number> {
  if (isMockEnv()) {
    const attempt = mockAttemptsStore.val.find((a: any) => a.id === attemptId)
    if (attempt) {
      attempt.violations_count += 1
      
      const newViolation = {
        id: `viol-${Date.now()}`,
        attempt_id: attemptId,
        violation_type: violationType,
        details,
        logged_at: new Date().toISOString(),
      }
      mockViolationsStore.val.push(newViolation)
      return attempt.violations_count
    }
    return 0
  }

  try {
    const supabase = await createClient()
    
    // Log violation record
    const { error: logErr } = await supabase
      .from('proctoring_violations')
      .insert({
        attempt_id: attemptId,
        violation_type: violationType,
        details,
      })
    if (logErr) throw logErr

    // Increment count on attempt
    const { data: attempt, error: getErr } = await supabase
      .from('assessment_attempts')
      .select('violations_count')
      .eq('id', attemptId)
      .single()
    if (getErr) throw getErr

    const newCount = (attempt?.violations_count || 0) + 1
    const { error: updErr } = await supabase
      .from('assessment_attempts')
      .update({ violations_count: newCount })
      .eq('id', attemptId)
    if (updErr) throw updErr

    return newCount
  } catch (err) {
    console.warn('Supabase log violation failed:', err)
    return 0
  }
}

export async function submitAssessmentAnswers(
  attemptId: string, 
  answers: { questionId: string; answerText: string }[]
): Promise<{ score: number; violations: number }> {
  const attempt = isMockEnv() 
    ? mockAttemptsStore.val.find((a: any) => a.id === attemptId) 
    : await fetchAttemptFromDb(attemptId)

  const assessmentId = attempt?.assessment_id || 'ass-fractions'
  const studentId = attempt?.student_id || 'student-1-alex'

  const questions = await getAssessmentQuestions(assessmentId)

  let correctCount = 0
  let objectiveCount = 0
  const wrongTopics = new Set<string>()

  for (const q of questions) {
    const answer = answers.find((ans) => ans.questionId === q.id)
    const studentAns = answer ? answer.answerText.trim().toLowerCase() : ''
    const correctAns = q.correct_answer.trim().toLowerCase()

    if (q.type !== 'short_answer') {
      objectiveCount++
      if (studentAns === correctAns) {
        correctCount++
      } else {
        if (q.topic_id) {
          wrongTopics.add(q.topic_id)
        }
      }
    }
  }

  const finalScore = objectiveCount > 0 ? Math.round((correctCount / objectiveCount) * 100) : 100
  const violations = attempt?.violations_count || 0

  // Generate Revision Packs for missed topics
  for (const topicId of wrongTopics) {
    await createRevisionPack(studentId, topicId, assessmentId)
  }

  if (isMockEnv()) {
    if (attempt) {
      attempt.score = finalScore
      attempt.status = 'submitted'
    }
  } else {
    try {
      const supabase = await createClient()
      
      const insertRows = answers.map((ans) => {
        const q = questions.find((qi) => qi.id === ans.questionId)
        const isCorrect = q ? q.type !== 'short_answer' && ans.answerText.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() : false
        return {
          attempt_id: attemptId,
          question_id: ans.questionId,
          student_answer: ans.answerText,
          is_correct: isCorrect,
        }
      })

      const { error: ansErr } = await supabase.from('assessment_answers').insert(insertRows)
      if (ansErr) throw ansErr

      const { error: attErr } = await supabase
        .from('assessment_attempts')
        .update({
          score: finalScore,
          status: 'submitted',
        })
        .eq('id', attemptId)
      if (attErr) throw attErr
    } catch (err) {
      console.warn('Supabase submit answers failed:', err)
    }
  }

  return { score: finalScore, violations }
}

async function fetchAttemptFromDb(attemptId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('assessment_attempts')
      .select('*')
      .eq('id', attemptId)
      .single()
    return data
  } catch {
    return null
  }
}

async function createRevisionPack(studentId: string, topicId: string, assessmentId: string) {
  if (isMockEnv()) {
    const topic = MOCK_TOPICS.find((t) => t.id === topicId)
    const note = MOCK_NOTES.find((n) => n.topic_id === topicId)
    
    const exists = mockRevisionPacksStore.val.some((rp: any) => rp.student_id === studentId && rp.topic_id === topicId)
    if (!exists && topic) {
      mockRevisionPacksStore.val.push({
        id: `rev-${topicId}-${Date.now()}`,
        student_id: studentId,
        topic_id: topicId,
        source_assessment_id: assessmentId,
        topic_name: topic.name,
        note_title: note?.title || 'Study Guide Note',
        note_content: note?.content || 'Reference notes details.',
        created_at: new Date().toISOString()
      })
    }
    return
  }

  try {
    const supabase = await createClient()
    await supabase.from('revision_packs').insert({
      student_id: studentId,
      topic_id: topicId,
      source_assessment_id: assessmentId,
    })
  } catch (err) {
    console.warn('Supabase revision pack insertion failed:', err)
  }
}

export async function getStudentRevisionPacks(studentId: string): Promise<any[]> {
  if (isMockEnv()) {
    return mockRevisionPacksStore.val.filter((rp: any) => rp.student_id === studentId)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('revision_packs')
      .select('*, topics(name, notes(*))')
      .eq('student_id', studentId)

    if (error) throw error

    return (data || []).map((pack) => {
      const topic = pack.topics
      const note = topic?.notes?.[0]
      return {
        id: pack.id,
        student_id: pack.student_id,
        topic_id: pack.topic_id,
        source_assessment_id: pack.source_assessment_id,
        topic_name: topic?.name || 'Topic Pack',
        note_title: note?.title || 'Reference Note',
        note_content: note?.content || 'Content pending.',
        created_at: pack.created_at,
      }
    })
  } catch (err) {
    console.warn('Supabase getStudentRevisionPacks failed, returning mock:', err)
    return mockRevisionPacksStore.val.filter((rp: any) => rp.student_id === studentId)
  }
}

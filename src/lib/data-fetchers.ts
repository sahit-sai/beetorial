import { createClient } from '@/utils/supabase/client'
import {
  MOCK_PROFILES,
  MOCK_PARENT_STUDENT,
  MOCK_SUBJECTS,
  MOCK_CHAPTERS,
  MOCK_TOPICS,
  MOCK_NOTES,
  MOCK_ASSIGNMENTS,
  MOCK_CLASSES,
  MOCK_PROGRESS,
  MOCK_LEADS,
  MOCK_INVOICES,
  MOCK_STUDENT_MENTOR_LINKS,
  MOCK_NOTIFICATIONS,
  type Profile,
  type Subject,
  type Chapter,
  type Topic,
  type Note,
  type Assignment,
  type ClassSession,
  type StudentProgress,
  type Lead,
  type Invoice,
  type StudentMentorLink,
  type Notification
} from './mock-data'

export type {
  Profile,
  Subject,
  Chapter,
  Topic,
  Note,
  Assignment,
  ClassSession,
  StudentProgress,
  Lead,
  Invoice,
  StudentMentorLink,
  Notification
}

// Helper to determine if we are running in a mock environment (e.g. placeholder environment variables)
function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

// Helper to return static mock profile if authenticated email matches
export async function getMockUserByEmail(email: string): Promise<Profile | null> {
  const profile = MOCK_PROFILES.find((p) => p.email === email)
  return profile || null
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  if (isMockEnv()) {
    // If testing/local with mock, check if mock user ID matches
    const profile = MOCK_PROFILES.find((p) => p.id === userId)
    if (profile) return profile

    // Fallback: If user is logged in via temporary email sign-up during testing, return mock student profile
    return {
      id: userId,
      email: 'student@example.com',
      role: 'student',
      full_name: 'Alex Jenkins',
    }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase profile query failed, using mock data:', err)
    // Dynamic fallback for user id matching
    if (userId.startsWith('student')) {
      return MOCK_PROFILES.find((p) => p.id === userId) || MOCK_PROFILES[0]
    }
    if (userId.startsWith('parent')) {
      return MOCK_PROFILES.find((p) => p.id === userId) || MOCK_PROFILES[3]
    }
    if (userId.startsWith('mentor')) {
      return MOCK_PROFILES.find((p) => p.id === userId) || MOCK_PROFILES[4]
    }
    return MOCK_PROFILES[0] // Default student
  }
}

export async function getStudentProgress(studentId: string): Promise<StudentProgress> {
  if (isMockEnv()) {
    return MOCK_PROGRESS.find((p) => p.student_id === studentId) || MOCK_PROGRESS[0]
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase student_progress failed, using mock:', err)
    return MOCK_PROGRESS.find((p) => p.student_id === studentId) || MOCK_PROGRESS[0]
  }
}

export async function getStudentClasses(studentId: string): Promise<ClassSession[]> {
  if (isMockEnv()) {
    return MOCK_CLASSES.filter((c) => c.student_id === studentId)
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('student_id', studentId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase classes failed, using mock:', err)
    return MOCK_CLASSES.filter((c) => c.student_id === studentId)
  }
}

export async function getStudentAssignments(studentId: string): Promise<Assignment[]> {
  if (isMockEnv()) {
    return MOCK_ASSIGNMENTS.filter((a) => a.student_id === studentId)
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase assignments failed, using mock:', err)
    return MOCK_ASSIGNMENTS.filter((a) => a.student_id === studentId)
  }
}

export interface NotesHierarchyItem {
  subject: Subject
  chapters: {
    chapter: Chapter
    topics: {
      topic: Topic
      note: Note | null
    }[]
  }[]
}

export async function getNotesHierarchy(): Promise<NotesHierarchyItem[]> {
  if (isMockEnv()) {
    return buildMockNotesHierarchy()
  }

  try {
    const supabase = createClient()
    
    // Perform parallel fetches to build hierarchy
    const [subRes, chRes, topRes, noteRes] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('chapters').select('*'),
      supabase.from('topics').select('*'),
      supabase.from('notes').select('*'),
    ])

    if (subRes.error) throw subRes.error
    if (chRes.error) throw chRes.error
    if (topRes.error) throw topRes.error
    if (noteRes.error) throw noteRes.error

    const subjectsList: Subject[] = subRes.data || []
    const chaptersList: Chapter[] = chRes.data || []
    const topicsList: Topic[] = topRes.data || []
    const notesList: Note[] = noteRes.data || []

    return subjectsList.map((subject) => {
      const subjectChapters = chaptersList
        .filter((ch) => ch.subject_id === subject.id)
        .sort((a, b) => a.order_index - b.order_index)

      return {
        subject,
        chapters: subjectChapters.map((chapter) => {
          const chapterTopics = topicsList
            .filter((t) => t.chapter_id === chapter.id)
            .sort((a, b) => a.order_index - b.order_index)

          return {
            chapter,
            topics: chapterTopics.map((topic) => {
              const note = notesList.find((n) => n.topic_id === topic.id) || null
              return { topic, note }
            }),
          }
        }),
      }
    })
  } catch (err) {
    console.warn('Supabase notes hierarchy failed, using mock:', err)
    return buildMockNotesHierarchy()
  }
}

function buildMockNotesHierarchy(): NotesHierarchyItem[] {
  return MOCK_SUBJECTS.map((subject) => {
    const subjectChapters = MOCK_CHAPTERS
      .filter((ch) => ch.subject_id === subject.id)
      .sort((a, b) => a.order_index - b.order_index)

    return {
      subject,
      chapters: subjectChapters.map((chapter) => {
        const chapterTopics = MOCK_TOPICS
          .filter((t) => t.chapter_id === chapter.id)
          .sort((a, b) => a.order_index - b.order_index)

        return {
          chapter,
          topics: chapterTopics.map((topic) => {
            const note = MOCK_NOTES.find((n) => n.topic_id === topic.id) || null
            return { topic, note }
          }),
        }
      }),
    }
  })
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  if (isMockEnv()) {
    return MOCK_NOTES.find((n) => n.id === noteId) || null
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase getNoteById failed, using mock:', err)
    return MOCK_NOTES.find((n) => n.id === noteId) || null
  }
}

export async function getLinkedChildren(parentId: string): Promise<Profile[]> {
  if (isMockEnv()) {
    const studentIds = MOCK_PARENT_STUDENT
      .filter((ps) => ps.parent_id === parentId)
      .map((ps) => ps.student_id)
    return MOCK_PROFILES.filter((p) => studentIds.includes(p.id))
  }

  try {
    const supabase = createClient()
    
    // Get linked student ids
    const { data: mappings, error: mapErr } = await supabase
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', parentId)

    if (mapErr) throw mapErr
    if (!mappings || mappings.length === 0) return []

    const studentIds = mappings.map((m) => m.student_id)
    const { data: students, error: studErr } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds)

    if (studErr) throw studErr
    return students || []
  } catch (err) {
    console.warn('Supabase parent children query failed, using mock:', err)
    const studentIds = MOCK_PARENT_STUDENT
      .filter((ps) => ps.parent_id === parentId)
      .map((ps) => ps.student_id)
    return MOCK_PROFILES.filter((p) => studentIds.includes(p.id))
  }
}

export async function getLeads(): Promise<Lead[]> {
  if (isMockEnv()) {
    return MOCK_LEADS
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase leads query failed, using mock:', err)
    return MOCK_LEADS
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  if (isMockEnv()) {
    return MOCK_INVOICES
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, profiles!student_id(full_name)')
      .order('due_date', { ascending: true })

    if (error) throw error
    return (data || []).map(inv => ({
      ...inv,
      student_name: (inv.profiles as any)?.full_name || 'Unknown Student'
    }))
  } catch (err) {
    console.warn('Supabase invoices query failed, using mock:', err)
    return MOCK_INVOICES
  }
}

export async function getStudentMentorLinks(): Promise<StudentMentorLink[]> {
  if (isMockEnv()) {
    return MOCK_STUDENT_MENTOR_LINKS
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('student_mentor_links')
      .select('*')

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase student_mentor_links query failed, using mock:', err)
    return MOCK_STUDENT_MENTOR_LINKS
  }
}

export async function getProfiles(): Promise<Profile[]> {
  if (isMockEnv()) {
    return MOCK_PROFILES
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase profiles query failed, returning mock:', err)
    return MOCK_PROFILES
  }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isMockEnv()) {
    if (!(globalThis as any).mockNotifications) {
      (globalThis as any).mockNotifications = [...MOCK_NOTIFICATIONS]
    }
    const list: Notification[] = (globalThis as any).mockNotifications
    return list
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase notifications query failed, returning mock:', err)
    if (!(globalThis as any).mockNotifications) {
      (globalThis as any).mockNotifications = [...MOCK_NOTIFICATIONS]
    }
    const list: Notification[] = (globalThis as any).mockNotifications
    return list
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

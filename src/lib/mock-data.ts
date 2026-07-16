// Beetorial Realistic Pre-seeded Mock Data
// Used as fallbacks for testing and local development when Supabase is not connected.

export interface Profile {
  id: string
  email: string
  role: 'student' | 'parent' | 'mentor' | 'admin'
  full_name: string
}

export interface ParentStudent {
  parent_id: string
  student_id: string
}

export interface Subject {
  id: string
  name: string
  description: string
}

export interface Chapter {
  id: string
  subject_id: string
  name: string
  order_index: number
}

export interface Topic {
  id: string
  chapter_id: string
  name: string
  order_index: number
  updated_at: string // ISO string
}

export interface Note {
  id: string
  topic_id: string
  title: string
  content: string
  updated_at: string
}

export interface Assignment {
  id: string
  student_id: string
  title: string
  due_date: string
  status: 'pending' | 'submitted' | 'graded'
  xp_reward: number
}

export interface ClassSession {
  id: string
  student_id: string
  mentor_id: string
  mentor_name: string
  start_time: string
  end_time: string
  subject: string
  status: 'scheduled' | 'completed' | 'missed'
}

export interface StudentProgress {
  student_id: string
  accuracy_percentage: number
  streak_days: number
  xp: number
}

// 1. Mock Users
export const MOCK_PROFILES: Profile[] = [
  {
    id: 'student-1-alex',
    email: 'alex.jenkins@beetorial.com',
    role: 'student',
    full_name: 'Alex Jenkins',
  },
  {
    id: 'student-2-emily',
    email: 'emily.rivers@beetorial.com',
    role: 'student',
    full_name: 'Emily Rivers',
  },
  {
    id: 'student-3-marcus',
    email: 'marcus.vance@beetorial.com',
    role: 'student',
    full_name: 'Marcus Vance',
  },
  {
    id: 'parent-sarah',
    email: 'sarah.jenkins@beetorial.com',
    role: 'parent',
    full_name: 'Sarah Jenkins',
  },
  {
    id: 'mentor-liam',
    email: 'liam.sterling@beetorial.com',
    role: 'mentor',
    full_name: 'Dr. Liam Sterling',
  },
  {
    id: 'mentor-clara',
    email: 'clara.finch@beetorial.com',
    role: 'mentor',
    full_name: 'Clara Finch',
  },
  {
    id: 'admin-1-director',
    email: 'admin@beetorial.com',
    role: 'admin',
    full_name: 'Admin Director',
  },
]

// 2. Parent-Student Mapping (Sarah is Alex's parent)
export const MOCK_PARENT_STUDENT: ParentStudent[] = [
  {
    parent_id: 'parent-sarah',
    student_id: 'student-1-alex',
  },
]

// 3. Subjects, Chapters, Topics, and Notes
export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'sub-math',
    name: 'Mathematics',
    description: '1-on-1 focus on algebra, decimals, fractions, and logic solving.',
  },
  {
    id: 'sub-science',
    name: 'Science',
    description: 'Exploring mechanics, ecosystems, chemical interactions, and biology.',
  },
  {
    id: 'sub-english',
    name: 'English',
    description: 'Building vocabulary, reading comprehension, grammar details, and text essays.',
  },
]

export const MOCK_CHAPTERS: Chapter[] = [
  // Math Chapters
  {
    id: 'ch-math-fractions',
    subject_id: 'sub-math',
    name: 'Fractions & Ratios',
    order_index: 1,
  },
  {
    id: 'ch-math-equations',
    subject_id: 'sub-math',
    name: 'Intro to Equations',
    order_index: 2,
  },
  // Science Chapters
  {
    id: 'ch-sci-water',
    subject_id: 'sub-science',
    name: 'The Water Cycle',
    order_index: 1,
  },
  {
    id: 'ch-sci-motion',
    subject_id: 'sub-science',
    name: 'Forces & Motion',
    order_index: 2,
  },
  // English Chapters
  {
    id: 'ch-eng-narrative',
    subject_id: 'sub-english',
    name: 'Narrative Essay Writing',
    order_index: 1,
  },
]

export const MOCK_TOPICS: Topic[] = [
  // Math Fractions Topics
  {
    id: 'top-math-simplify',
    chapter_id: 'ch-math-fractions',
    name: 'Simplifying Fractions',
    order_index: 1,
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago (triggers updated badge)
  },
  {
    id: 'top-math-mixed',
    chapter_id: 'ch-math-fractions',
    name: 'Adding Mixed Numbers',
    order_index: 2,
    updated_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), // 10 days ago
  },
  // Water Cycle Topics
  {
    id: 'top-sci-evap',
    chapter_id: 'ch-sci-water',
    name: 'Evaporation & Condensation',
    order_index: 1,
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
  },
  {
    id: 'top-sci-precip',
    chapter_id: 'ch-sci-water',
    name: 'Precipitation Patterns',
    order_index: 2,
    updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
  },
]

export const MOCK_NOTES: Note[] = [
  {
    id: 'note-math-simplify',
    topic_id: 'top-math-simplify',
    title: 'Mastering Simplified Fractions',
    content: 'To simplify a fraction, divide both the numerator and the denominator by their Greatest Common Divisor (GCD). For example, to simplify 12/16, the GCD of 12 and 16 is 4. Dividing both parts by 4 gives 3/4. Double check by ensuring no common factors remain other than 1.',
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note-sci-evap',
    topic_id: 'top-sci-evap',
    title: 'Ecosystem Condensation Cycles',
    content: 'Evaporation occurs when solar radiation heats liquid surface water, causing it to escape into gaseous vapour. As temperature cools high in the atmosphere, vapour condenses into water droplets, forming visible clouds. Condensation is the exact thermodynamic inverse of evaporation.',
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
]

// 4. Active Assignments (For Student 1 - Alex)
export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ass-math-1',
    student_id: 'student-1-alex',
    title: 'Fractions Operations Workbook',
    due_date: new Date(Date.now() + 3600000 * 24 * 2).toISOString(), // 2 days from now
    status: 'pending',
    xp_reward: 120,
  },
  {
    id: 'ass-sci-1',
    student_id: 'student-1-alex',
    title: 'Condensation Science Lab Summary',
    due_date: new Date(Date.now() + 3600000 * 24 * 4).toISOString(), // 4 days from now
    status: 'pending',
    xp_reward: 150,
  },
]

// 5. Scheduled Tutoring Classes (For Student 1 - Alex)
// Scheduled relative to today's date to verify weekly calendar renders correctly
const today = new Date()
const getDayRelative = (offsetDays: number, hour: number) => {
  const d = new Date(today)
  d.setDate(today.getDate() + offsetDays)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const MOCK_CLASSES: ClassSession[] = [
  {
    id: 'class-1',
    student_id: 'student-1-alex',
    mentor_id: 'mentor-liam',
    mentor_name: 'Dr. Liam Sterling',
    start_time: getDayRelative(0, 16), // Today at 4 PM
    end_time: getDayRelative(0, 17),
    subject: 'Mathematics',
    status: 'scheduled',
  },
  {
    id: 'class-2',
    student_id: 'student-1-alex',
    mentor_id: 'mentor-clara',
    mentor_name: 'Clara Finch',
    start_time: getDayRelative(2, 15), // In 2 days at 3 PM
    end_time: getDayRelative(2, 16),
    subject: 'Science',
    status: 'scheduled',
  },
  {
    id: 'class-3',
    student_id: 'student-1-alex',
    mentor_id: 'mentor-liam',
    mentor_name: 'Dr. Liam Sterling',
    start_time: getDayRelative(4, 16), // In 4 days at 4 PM
    end_time: getDayRelative(4, 17),
    subject: 'English',
    status: 'scheduled',
  },
]

// 6. Student Progress Stats
export const MOCK_PROGRESS: StudentProgress[] = [
  {
    student_id: 'student-1-alex',
    accuracy_percentage: 94,
    streak_days: 7,
    xp: 680,
  },
  {
    student_id: 'student-2-emily',
    accuracy_percentage: 88,
    streak_days: 3,
    xp: 410,
  },
  {
    student_id: 'student-3-marcus',
    accuracy_percentage: 91,
    streak_days: 12,
    xp: 1250,
  },
]

export interface Lead {
  id: string
  student_name: string
  parent_name: string
  parent_email: string
  status: 'demo_requested' | 'demo_scheduled' | 'enrolled' | 'paid'
  notes: string
  created_at: string
}

export interface Invoice {
  id: string
  student_id: string
  student_name: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  created_at: string
}

export interface StudentMentorLink {
  student_id: string
  mentor_id: string
}

export let MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    student_name: 'Tommy Miller',
    parent_name: 'Robert Miller',
    parent_email: 'robert.miller@example.com',
    status: 'demo_requested',
    notes: 'Struggling with primary school algebra. Parents want to schedule a weekend demo.',
    created_at: '2026-07-10T10:00:00Z',
  },
  {
    id: 'lead-2',
    student_name: 'Sophia Chen',
    parent_name: 'Grace Chen',
    parent_email: 'grace.chen@example.com',
    status: 'demo_scheduled',
    notes: 'Demo scheduled for Friday 4 PM with Clara. Interested in Grade 4 reading comprehension.',
    created_at: '2026-07-12T14:30:00Z',
  },
  {
    id: 'lead-3',
    student_name: 'Lucas Wright',
    parent_name: 'Sarah Wright',
    parent_email: 'sarah.wright@example.com',
    status: 'enrolled',
    notes: 'Completed math assessment. Needs placement with a patient mentor.',
    created_at: '2026-07-08T09:15:00Z',
  },
  {
    id: 'lead-4',
    student_name: 'Oliver Davis',
    parent_name: 'Jack Davis',
    parent_email: 'jack.davis@example.com',
    status: 'paid',
    notes: 'Paid 3-month package. Starting first session next Monday.',
    created_at: '2026-07-05T11:00:00Z',
  }
]

export let MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    student_id: 'student-1-alex',
    student_name: 'Alex Jenkins',
    amount: 249.00,
    status: 'paid',
    due_date: '2026-07-10',
    created_at: '2026-07-01T08:00:00Z',
  },
  {
    id: 'inv-1002',
    student_id: 'student-2-emily',
    student_name: 'Emily Rivers',
    amount: 199.00,
    status: 'pending',
    due_date: '2026-07-20',
    created_at: '2026-07-01T08:00:00Z',
  },
  {
    id: 'inv-1003',
    student_id: 'student-3-marcus',
    student_name: 'Marcus Vance',
    amount: 349.00,
    status: 'overdue',
    due_date: '2026-07-05',
    created_at: '2026-06-25T08:00:00Z',
  }
]

export let MOCK_STUDENT_MENTOR_LINKS: StudentMentorLink[] = [
  { student_id: 'student-1-alex', mentor_id: 'mentor-liam' },
  { student_id: 'student-2-emily', mentor_id: 'mentor-liam' },
  { student_id: 'student-3-marcus', mentor_id: 'mentor-clara' }
]

export interface Notification {
  id: string
  user_id: string
  title: string
  content: string
  is_read: boolean
  created_at: string
}

export let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'student-1-alex',
    title: 'New Study Guide Note Shared',
    content: 'Dr. Liam Sterling shared "Master Fractions Guide" with you.',
    is_read: false,
    created_at: '2026-07-15T09:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'parent-sarah',
    title: 'Alex Completed Fractions Diagnostic',
    content: 'Alex Jenkins completed fractions diagnostic with a score of 33%. Unlocked a new revision pack.',
    is_read: false,
    created_at: '2026-07-15T11:00:00Z'
  }
]

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

// In-memory mock storage for E2E runs
const MOCK_AVAILABILITY = [
  { id: 'slot-1', mentor_id: '00000000-0000-0000-0000-000000000005', start_time: '2026-07-20T14:00:00Z', end_time: '2026-07-20T15:00:00Z', status: 'available' },
  { id: 'slot-2', mentor_id: '00000000-0000-0000-0000-000000000005', start_time: '2026-07-22T10:00:00Z', end_time: '2026-07-22T11:00:00Z', status: 'available' }
]

const MOCK_NOTEPADS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001_00000000-0000-0000-0000-000000000005': 'Welcome to our collaborative scratchpad! Feel free to write ideas here.'
}

const MOCK_FILES = [
  { id: 'file-1', student_id: '00000000-0000-0000-0000-000000000001', mentor_id: '00000000-0000-0000-0000-000000000005', title: 'Simplifying Fractions Worksheet', file_url: '/files/simplify_fractions.pdf', subject: 'Mathematics', created_at: '2026-07-15T18:00:00Z' }
]

// 1. Get availability slots
export async function getMentorAvailability(mentorId: string): Promise<any[]> {
  if (isMockEnv()) {
    return MOCK_AVAILABILITY.filter((s) => s.mentor_id === mentorId)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentorId)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching availability:', error)
    return []
  }
  return data || []
}

// 2. Create availability slot
export async function createAvailabilitySlot(mentorId: string, startTime: string, endTime: string): Promise<boolean> {
  if (isMockEnv()) {
    const newSlot = {
      id: `slot-${Date.now()}`,
      mentor_id: mentorId,
      start_time: startTime,
      end_time: endTime,
      status: 'available'
    }
    MOCK_AVAILABILITY.push(newSlot)
    return true
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('mentor_availability')
    .insert([{ mentor_id: mentorId, start_time: startTime, end_time: endTime, status: 'available' }])

  if (error) {
    console.error('Error creating availability:', error)
    return false
  }
  return true
}

// 3. Book availability slot
export async function bookAvailabilitySlot(slotId: string, studentId: string): Promise<boolean> {
  if (isMockEnv()) {
    const slot = MOCK_AVAILABILITY.find((s) => s.id === slotId)
    if (slot) {
      slot.status = 'booked'
      return true
    }
    return false
  }

  const supabase = await createClient()
  
  // Get slot info first
  const { data: slot, error: fetchErr } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('id', slotId)
    .single()

  if (fetchErr || !slot) {
    console.error('Error fetching availability slot:', fetchErr)
    return false
  }

  // Update status to booked
  const { error: updateErr } = await supabase
    .from('mentor_availability')
    .update({ status: 'booked' })
    .eq('id', slotId)

  if (updateErr) {
    console.error('Error updating availability slot:', updateErr)
    return false
  }

  // Insert into classes scheduled list
  const { error: classErr } = await supabase
     .from('classes')
     .insert([{
        student_id: studentId,
        mentor_id: slot.mentor_id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        subject: 'Mathematics Check-In',
        status: 'scheduled'
     }])

  if (classErr) {
    console.error('Error creating class schedule:', classErr)
    return false
  }

  revalidatePath('/student/schedule')
  return true
}

// 4. Save notepad content
export async function saveSharedNotepad(studentId: string, mentorId: string, content: string): Promise<boolean> {
  const key = `${studentId}_${mentorId}`
  if (isMockEnv()) {
    MOCK_NOTEPADS[key] = content
    return true
  }

  const supabase = await createClient()
  
  // Upsert notepad entry
  const { error } = await supabase
    .from('shared_notepad')
    .upsert(
      { student_id: studentId, mentor_id: mentorId, content: content, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,mentor_id' }
    )

  if (error) {
    console.error('Error saving notepad:', error)
    return false
  }
  return true
}

// 5. Get notepad content
export async function getSharedNotepad(studentId: string, mentorId: string): Promise<string> {
  const key = `${studentId}_${mentorId}`
  if (isMockEnv()) {
    return MOCK_NOTEPADS[key] || ''
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shared_notepad')
    .select('content')
    .eq('student_id', studentId)
    .eq('mentor_id', mentorId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching notepad:', error)
    return ''
  }
  return data?.content || ''
}

// 6. Upload lesson note file
export async function uploadLessonFile(studentId: string, mentorId: string, title: string, fileUrl: string, subject: string): Promise<boolean> {
  if (isMockEnv()) {
    MOCK_FILES.push({
      id: `file-${Date.now()}`,
      student_id: studentId,
      mentor_id: mentorId,
      title: title,
      file_url: fileUrl,
      subject: subject,
      created_at: new Date().toISOString()
    })
    return true
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('uploaded_files')
    .insert([{ student_id: studentId, mentor_id: mentorId, title, file_url: fileUrl, subject }])

  if (error) {
    console.error('Error uploading file meta:', error)
    return false
  }
  
  revalidatePath('/student/notes')
  return true
}

// 7. Get shared files
export async function getUploadedFiles(studentId: string): Promise<any[]> {
  if (isMockEnv()) {
    return MOCK_FILES.filter((f) => f.student_id === studentId)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching uploaded files:', error)
    return []
  }
  return data || []
}

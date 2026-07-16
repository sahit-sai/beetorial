'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // Swallowed for Vitest unit tests execution
  }
}

// Get global notifications list
function getMockNotifications(): any[] {
  if (!(globalThis as any).mockNotifications) {
    (globalThis as any).mockNotifications = [...MOCK_NOTIFICATIONS]
  }
  return (globalThis as any).mockNotifications
}

export async function markNotificationReadAction(notificationId: string): Promise<boolean> {
  if (isMockEnv()) {
    const list = getMockNotifications()
    const notif = list.find((n) => n.id === notificationId)
    if (notif) {
      notif.is_read = true
      safeRevalidatePath('/')
      return true
    }
    return false
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
    safeRevalidatePath('/')
    return true
  } catch (err) {
    console.error('Failed to mark notification read:', err)
    return false
  }
}

export async function markAllNotificationsReadAction(userId: string): Promise<boolean> {
  if (isMockEnv()) {
    const list = getMockNotifications()
    list.forEach((n) => {
      if (n.user_id === userId) {
        n.is_read = true
      }
    })
    safeRevalidatePath('/')
    return true
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)

    if (error) throw error
    safeRevalidatePath('/')
    return true
  } catch (err) {
    console.error('Failed to mark all notifications read:', err)
    return false
  }
}

export async function sendReportAction(
  studentId: string,
  studentName: string,
  reportType: 'weekly' | 'monthly',
  mentorName: string
): Promise<boolean> {
  // Find mapped parent ID
  let parentId = 'parent-sarah' // Default to Sarah (Alex's parent)
  let parentEmail = 'sarah.jenkins@beetorial.com'
  
  if (studentId === 'student-2-emily') {
    parentId = 'parent-emily'
    parentEmail = 'emily.parent@beetorial.com'
  } else if (studentId === 'student-3-marcus') {
    parentId = 'parent-marcus'
    parentEmail = 'marcus.parent@beetorial.com'
  }

  const title = `New ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Progress Report`
  const content = `${mentorName} has published the ${reportType} analytics card report for ${studentName}.`

  // Mock Trigger Point Log
  console.log(`[Mock Email/WhatsApp Notification Trigger]`)
  console.log(`To Parent: ${parentEmail}`)
  console.log(`Subject: ${title}`)
  console.log(`Body: ${content}`)

  if (isMockEnv()) {
    const list = getMockNotifications()
    list.push({
      id: `notif-report-${Date.now()}`,
      user_id: parentId,
      title,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    })
    safeRevalidatePath('/')
    return true
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: parentId,
        title,
        content
      })

    if (error) throw error
    safeRevalidatePath('/')
    return true
  } catch (err) {
    console.error('Failed to insert report notification:', err)
    return false
  }
}

export async function triggerMissedClassNotificationAction(
  studentId: string,
  studentName: string,
  className: string
): Promise<boolean> {
  let parentId = 'parent-sarah'
  let parentEmail = 'sarah.jenkins@beetorial.com'
  
  if (studentId === 'student-2-emily') {
    parentId = 'parent-emily'
    parentEmail = 'emily.parent@beetorial.com'
  } else if (studentId === 'student-3-marcus') {
    parentId = 'parent-marcus'
    parentEmail = 'marcus.parent@beetorial.com'
  }

  const title = `Class Session Missed`
  const content = `${studentName} was marked ABSENT from today's scheduled ${className} session.`

  // Mock Trigger Point Log
  console.log(`[Mock WhatsApp Alert Trigger]`)
  console.log(`To Parent: ${parentEmail}`)
  console.log(`Alert Content: ${content}`)

  if (isMockEnv()) {
    const list = getMockNotifications()
    list.push({
      id: `notif-missed-${Date.now()}`,
      user_id: parentId,
      title,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    })
    safeRevalidatePath('/')
    return true
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: parentId,
        title,
        content
      })

    if (error) throw error
    safeRevalidatePath('/')
    return true
  } catch (err) {
    console.error('Failed to trigger missed class notification:', err)
    return false
  }
}

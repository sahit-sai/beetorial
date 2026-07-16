import { describe, it, expect, beforeEach } from 'vitest'
import { 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  sendReportAction, 
  triggerMissedClassNotificationAction 
} from '@/app/notifications/actions'
import { getNotifications } from '@/lib/data-fetchers'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data'

describe('Notifications & Reports Dispatching (Mock Mode)', () => {
  beforeEach(() => {
    // Reset initial mock list
    MOCK_NOTIFICATIONS.length = 0
    MOCK_NOTIFICATIONS.push(
      {
        id: 'notif-1',
        user_id: 'student-1-alex',
        title: 'New Study Guide Note Shared',
        content: 'Dr. Liam Sterling shared a worksheet.',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif-2',
        user_id: 'parent-sarah',
        title: 'Diagnostic Finished',
        content: 'Alex completed Fraction test.',
        is_read: false,
        created_at: new Date().toISOString()
      }
    )
  })

  it('can mark an unread notification as read', async () => {
    const res = await markNotificationReadAction('notif-1')
    expect(res).toBe(true)

    const list = await getNotifications('student-1-alex')
    expect(list.length).toBe(1)
    expect(list[0].is_read).toBe(true)
  })

  it('can mark all notifications read for a specific user', async () => {
    MOCK_NOTIFICATIONS.push({
      id: 'notif-3',
      user_id: 'parent-sarah',
      title: 'Class Reminder',
      content: 'Session starts in 10 minutes.',
      is_read: false,
      created_at: new Date().toISOString()
    })

    const res = await markAllNotificationsReadAction('parent-sarah')
    expect(res).toBe(true)

    const list = await getNotifications('parent-sarah')
    expect(list.length).toBe(2)
    expect(list.every(n => n.is_read)).toBe(true)
  })

  it('mentor sending a weekly report creates a new notification for parent', async () => {
    const res = await sendReportAction('student-1-alex', 'Alex Jenkins', 'weekly', 'Dr. Liam Sterling')
    expect(res).toBe(true)

    const list = await getNotifications('parent-sarah')
    const reportAlert = list.find(n => n.title.includes('Weekly Progress Report'))
    expect(reportAlert).toBeDefined()
    expect(reportAlert?.is_read).toBe(false)
    expect(reportAlert?.content).toContain('Dr. Liam Sterling has published the weekly')
  })

  it('mentor simulating a missed class alerts parent with class details', async () => {
    const res = await triggerMissedClassNotificationAction('student-1-alex', 'Alex Jenkins', 'Mathematics')
    expect(res).toBe(true)

    const list = await getNotifications('parent-sarah')
    const missedAlert = list.find(n => n.title.includes('Class Session Missed'))
    expect(missedAlert).toBeDefined()
    expect(missedAlert?.is_read).toBe(false)
    expect(missedAlert?.content).toContain('Mathematics')
  })
})

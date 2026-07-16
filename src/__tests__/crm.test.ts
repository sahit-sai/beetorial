import { describe, it, expect, beforeEach } from 'vitest'
import { createLeadAction, updateLeadStatusAction, assignMentorAction, payInvoiceAction } from '@/app/admin/actions'
import { getLeads, getInvoices, getStudentMentorLinks } from '@/lib/data-fetchers'
import { MOCK_LEADS, MOCK_INVOICES, MOCK_STUDENT_MENTOR_LINKS } from '@/lib/mock-data'

describe('Admin CRM & Matching Logic (Mock Mode)', () => {
  beforeEach(() => {
    // Clear and restore initial lead items
    MOCK_LEADS.length = 0
    MOCK_LEADS.push(
      {
        id: 'lead-1',
        student_name: 'Tommy Miller',
        parent_name: 'Robert Miller',
        parent_email: 'robert.miller@example.com',
        status: 'demo_requested',
        notes: 'Struggling with primary school algebra.',
        created_at: new Date().toISOString()
      }
    )

    // Clear and restore invoices
    MOCK_INVOICES.length = 0
    MOCK_INVOICES.push({
      id: 'inv-1001',
      student_id: 'student-1-alex',
      student_name: 'Alex Jenkins',
      amount: 249.00,
      status: 'pending',
      due_date: '2026-07-10',
      created_at: new Date().toISOString()
    })

    // Clear and restore student mentor links
    MOCK_STUDENT_MENTOR_LINKS.length = 0
    MOCK_STUDENT_MENTOR_LINKS.push({
      student_id: 'student-1-alex',
      mentor_id: 'mentor-liam'
    })
  })

  it('can create a new lead and retrieve it from data layer', async () => {
    const res = await createLeadAction(
      'Alice Doe',
      'John Doe',
      'john.doe@example.com',
      'demo_scheduled',
      'Prefers science notes.'
    )
    expect(res).toBe(true)

    const list = await getLeads()
    expect(list.length).toBe(2)
    
    const alice = list.find(l => l.student_name === 'Alice Doe')
    expect(alice).toBeDefined()
    expect(alice?.parent_name).toBe('John Doe')
    expect(alice?.status).toBe('demo_scheduled')
  })

  it('can transition a lead stage in the kanban pipeline', async () => {
    const list = await getLeads()
    const targetId = list[0].id

    const res = await updateLeadStatusAction(targetId, 'enrolled')
    expect(res).toBe(true)

    const updatedList = await getLeads()
    const updatedLead = updatedList.find(l => l.id === targetId)
    expect(updatedLead?.status).toBe('enrolled')
  })

  it('can matches student to tutor mentor and updates link', async () => {
    const res = await assignMentorAction('student-1-alex', 'mentor-clara')
    expect(res).toBe(true)

    const list = await getStudentMentorLinks()
    const match = list.find(l => l.student_id === 'student-1-alex')
    expect(match?.mentor_id).toBe('mentor-clara')
  })

  it('can pay an invoice and updates status to paid', async () => {
    const res = await payInvoiceAction('inv-1001')
    expect(res).toBe(true)

    const list = await getInvoices()
    const inv = list.find(i => i.id === 'inv-1001')
    expect(inv?.status).toBe('paid')
  })
})

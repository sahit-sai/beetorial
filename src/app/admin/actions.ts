'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { MOCK_LEADS, MOCK_INVOICES, MOCK_STUDENT_MENTOR_LINKS } from '@/lib/mock-data'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // Ignore in non-Next runtime/test runner context
  }
}

export async function createLeadAction(
  studentName: string,
  parentName: string,
  parentEmail: string,
  status: 'demo_requested' | 'demo_scheduled' | 'enrolled' | 'paid',
  notes: string
): Promise<boolean> {
  if (isMockEnv()) {
    MOCK_LEADS.push({
      id: `lead-mock-${Date.now()}`,
      student_name: studentName,
      parent_name: parentName,
      parent_email: parentEmail,
      status,
      notes,
      created_at: new Date().toISOString()
    })
    safeRevalidatePath('/admin')
    return true
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('leads')
      .insert({
        student_name: studentName,
        parent_name: parentName,
        parent_email: parentEmail,
        status,
        notes
      })
    if (error) throw error
    safeRevalidatePath('/admin')
    return true
  } catch (err) {
    console.error('Failed to create lead:', err)
    return false
  }
}

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: 'demo_requested' | 'demo_scheduled' | 'enrolled' | 'paid'
): Promise<boolean> {
  if (isMockEnv()) {
    const lead = MOCK_LEADS.find(l => l.id === leadId)
    if (lead) {
      lead.status = newStatus
      safeRevalidatePath('/admin')
      return true
    }
    return false
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)
    if (error) throw error
    safeRevalidatePath('/admin')
    return true
  } catch (err) {
    console.error('Failed to update lead status:', err)
    return false
  }
}

export async function assignMentorAction(
  studentId: string,
  mentorId: string
): Promise<boolean> {
  if (isMockEnv()) {
    const existing = MOCK_STUDENT_MENTOR_LINKS.find(link => link.student_id === studentId)
    if (existing) {
      existing.mentor_id = mentorId
    } else {
      MOCK_STUDENT_MENTOR_LINKS.push({ student_id: studentId, mentor_id: mentorId })
    }
    safeRevalidatePath('/admin')
    return true
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('student_mentor_links')
      .upsert({ student_id: studentId, mentor_id: mentorId }, { onConflict: 'student_id' })
    if (error) throw error
    safeRevalidatePath('/admin')
    return true
  } catch (err) {
    console.error('Failed to assign mentor:', err)
    return false
  }
}

export async function payInvoiceAction(invoiceId: string): Promise<boolean> {
  if (isMockEnv()) {
    const invoice = MOCK_INVOICES.find(inv => inv.id === invoiceId)
    if (invoice) {
      invoice.status = 'paid'
      safeRevalidatePath('/admin')
      return true
    }
    return false
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId)
    if (error) throw error
    safeRevalidatePath('/admin')
    return true
  } catch (err) {
    console.error('Failed to pay invoice:', err)
    return false
  }
}

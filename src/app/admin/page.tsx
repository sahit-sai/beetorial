import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getProfileById, getLeads, getInvoices, getStudentMentorLinks, getProfiles, getNotifications } from '@/lib/data-fetchers'
import { AdminDashboardClient } from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfileById(user.id)
  if (profile?.role !== 'admin') {
    redirect(`/${profile?.role || 'login'}`)
  }

  // Fetch initial CRM data through clean abstraction layers
  const leads = await getLeads()
  const invoices = await getInvoices()
  const links = await getStudentMentorLinks()
  const profiles = await getProfiles()
  const notifications = await getNotifications(user.id)

  return (
    <AdminDashboardClient
      initialLeads={leads}
      initialInvoices={invoices}
      initialLinks={links}
      profiles={profiles}
      adminProfile={profile}
      initialNotifications={notifications}
    />
  )
}

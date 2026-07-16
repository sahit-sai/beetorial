import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { 
  getProfileById, 
  getLinkedChildren, 
  getStudentProgress, 
  getStudentClasses, 
  getStudentAssignments,
  getNotifications
} from '@/lib/data-fetchers'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { 
  LogOut, 
  User, 
  Flame, 
  Award, 
  Target, 
  Calendar, 
  BookOpen, 
  Bell, 
  Eye, 
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfileById(user.id)
  const notifications = await getNotifications(user.id)
  
  // Get linked child
  const children = await getLinkedChildren(profile?.id || user.id)
  const child = children[0] // Alex Jenkins
  
  // Fetch child's details if mapping exists
  let childProgress = null
  let childClasses: any[] = []
  let childAssignments: any[] = []

  if (child) {
    childProgress = await getStudentProgress(child.id)
    childClasses = await getStudentClasses(child.id)
    childAssignments = await getStudentAssignments(child.id)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070710] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0f0f20] border-r border-slate-100 dark:border-slate-800/80 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 text-[#3C32CF] dark:text-[#5146e5]" />
            <div>
              <span className="font-heading font-black text-lg tracking-tight text-slate-900 dark:text-slate-50 block leading-none">
                Beetorial
              </span>
              <span className="text-[9px] text-slate-400 font-sans tracking-widest uppercase">
                Parent Workspace
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-heading font-bold text-sm mb-2">
            <Eye className="w-4 h-4" />
            Child Progress Mirror
          </div>
          <Link 
            href="/student/reports" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100 font-heading font-semibold text-sm transition-all duration-200"
          >
            <TrendingUp className="w-4 h-4" />
            Detailed Reports Mirror
          </Link>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 mb-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-slate-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-heading font-bold text-xs block text-slate-900 dark:text-slate-100 truncate">
                {profile?.full_name || 'Sarah Jenkins'}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase font-bold tracking-wider">
                {profile?.role || 'parent'}
              </span>
            </div>
          </div>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="w-full text-slate-500 hover:text-red-600 rounded-lg justify-start h-9 font-sans text-xs">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 py-8 px-6 md:px-10 overflow-y-auto space-y-8">
        
        {/* Mirror Header */}
        <div className="bg-white dark:bg-[#0f0f20] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Read-Only Parent Account</span>
            </div>

            <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {child ? `Tracking progress of ${child.full_name}` : 'Student Tracking Profile'}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-sans text-sm max-w-lg">
              This dashboard displays a live, read-only view of your child&apos;s active learning profile. Tapping actions is disabled.
            </p>
          </div>
          <div className="relative z-20">
            <NotificationCenter userId={user.id} initialNotifications={notifications} />
          </div>
        </div>

        {child ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Learning Streak</span>
                    <div className="text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                      {childProgress?.streak_days || 0} Days
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Total XP Points</span>
                    <div className="text-3xl font-heading font-black text-[#3C32CF] dark:text-[#5146e5] mt-1">
                      {childProgress?.xp || 0} XP
                    </div>
                  </div>
                  <div className="p-3 bg-[#3C32CF]/10 dark:bg-[#5146e5]/20 text-[#3C32CF] dark:text-[#5146e5] rounded-2xl">
                    <Award className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Average Accuracy</span>
                    <div className="text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {childProgress?.accuracy_percentage || 0}%
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Agenda Calendar (Read-only) */}
              <Card className="lg:col-span-2 rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-900 pb-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Weekly Lessons Agenda
                </h3>
                
                {childClasses.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No classes scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {childClasses.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60">
                        <div>
                          <span className="font-heading font-bold text-sm block text-slate-950 dark:text-slate-50">
                            {c.subject} Session
                          </span>
                          <span className="text-xs text-slate-500 font-sans block mt-1">
                            Mentor: {c.mentor_name}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 font-sans">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {c.status}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(c.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Notification Center */}
              <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-900 pb-3">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Activity Logs
                </h3>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                    <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Notes Uploaded</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-normal">
                      Dr. Liam Sterling added a new reference sheet: &ldquo;Mastering Simplified Fractions&rdquo; under Math.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                    <span className="text-[10px] font-sans font-semibold text-slate-400 block uppercase">Class Attendance</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-normal">
                      Alex Jenkins joined the Science session on water condensation on time. Attendance 100%.
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-2">
            <User className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto" />
            <p className="font-heading font-bold text-slate-400">No linked student profile found</p>
            <p className="text-xs text-slate-400 font-sans">Contact system administrators to pair your parent account with your child.</p>
          </div>
        )}

      </main>
    </div>
  )
}

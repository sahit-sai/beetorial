import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { 
  getProfileById, 
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
  BookOpen, 
  Calendar, 
  Award, 
  Clock, 
  Flame, 
  Target, 
  ExternalLink,
  BookMarked,
  Film,
  ClipboardList
} from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfileById(user.id)
  const progress = await getStudentProgress(profile?.id || user.id)
  const classes = await getStudentClasses(profile?.id || user.id)
  const assignments = await getStudentAssignments(profile?.id || user.id)
  const notifications = await getNotifications(user.id)

  // Filter classes starting today
  const todayStr = new Date().toDateString()
  const todayClasses = classes.filter(
    (c) => new Date(c.start_time).toDateString() === todayStr
  )

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
                Student Workspace
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/student" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-heading font-bold text-sm"
          >
            <LayoutIcon className="w-4 h-4" />
            Workspace Home
          </Link>
          <Link 
            href="/student/notes" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100 font-heading font-semibold text-sm transition-all duration-200"
          >
            <BookMarked className="w-4 h-4" />
            Notes Library
          </Link>
          <Link 
            href="/student/schedule" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100 font-heading font-semibold text-sm transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            Class Schedule
          </Link>
          <Link 
            href="/student/recordings" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100 font-heading font-semibold text-sm transition-all duration-200"
          >
            <Film className="w-4 h-4" />
            Class Recordings
          </Link>
          <Link 
            href="/student/assessments" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100 font-heading font-semibold text-sm transition-all duration-200"
          >
            <ClipboardList className="w-4 h-4" />
            Assessments & Tests
          </Link>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 mb-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-slate-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-heading font-bold text-xs block text-slate-900 dark:text-slate-100 truncate">
                {profile?.full_name || 'Alex Jenkins'}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase font-bold tracking-wider">
                {profile?.role || 'student'}
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
        
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-[#0f0f20] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(60_50_207/0.03),0_2px_8px_rgb(0_0_0/0.01)] relative overflow-hidden group flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Alex'}! 👋
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-sans text-sm max-w-lg">
              Review your classes scheduled for today, track your streak progress, or jump right back into the syllabus notes library.
            </p>
          </div>
          <div className="relative z-20">
            <NotificationCenter userId={user.id} initialNotifications={notifications} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Learning Streak</span>
                <div className="text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                  {progress?.streak_days || 0} Days
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Keep studying daily to raise the streak!</span>
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
                  {progress?.xp || 0} XP
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Earn points by finishing test sheets.</span>
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
                  {progress?.accuracy_percentage || 0}%
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Calculated from auto-graded papers.</span>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Target className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Today's Classes */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3C32CF]" />
                Classes Scheduled Today
              </h3>
              <Link href="/student/schedule" className="text-xs text-[#3C32CF] hover:underline flex items-center gap-1">
                Full calendar <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            {todayClasses.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-heading font-bold text-slate-500">No classes scheduled today</p>
                <p className="text-xs text-slate-400 font-sans">Attending scheduled calls regularly builds your streak.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="font-heading font-bold text-sm block text-slate-900 dark:text-slate-100">
                        {c.subject} Lesson
                      </span>
                      <span className="text-xs text-slate-500 font-sans block mt-1">
                        Mentor: {c.mentor_name}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-slate-200 rounded-full font-sans">
                        {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Link href={`/classroom/prejoin?classId=${c.id}`}>
                        <Button size="sm" className="h-8 text-[10px] font-heading font-bold rounded-lg bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-sm">
                          Join Call
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Tasks / Assignments */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#3C32CF]" />
                Upcoming Assignments
              </h3>
            </div>
            
            {assignments.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-heading font-bold text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-400 font-sans">Any tasks set by mentors will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="font-heading font-bold text-sm block text-slate-900 dark:text-slate-100">
                        {a.title}
                      </span>
                      <span className="text-xs text-slate-500 font-sans block mt-1">
                        Due: {new Date(a.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2.5">
                      <span className="text-[10px] font-sans font-bold uppercase text-amber-600 dark:text-amber-400">
                        +{a.xp_reward} XP
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 capitalize">
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

function LayoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

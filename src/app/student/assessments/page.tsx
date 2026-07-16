import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProfileById } from '@/lib/data-fetchers'
import { getStudentAssessments, getStudentRevisionPacks } from './actions'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  ClipboardList, 
  ArrowLeft,
  Calendar,
  FileCheck2,
  BookOpen,
  Sparkles
} from 'lucide-react'

export default async function StudentAssessmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfileById(user.id)
  const studentId = profile?.id || user.id

  const assessments = await getStudentAssessments(studentId)
  const revisionPacks = await getStudentRevisionPacks(studentId)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#070710] dark:text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 py-4 dark:bg-[#0f0f20] dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 text-[#3C32CF] dark:text-[#5146e5]" />
            <div>
              <span className="font-heading font-black text-lg tracking-tight block leading-none text-slate-900 dark:text-slate-50">
                Beetorial
              </span>
              <span className="text-[9px] text-slate-400 font-sans tracking-widest uppercase">
                Assessment Center
              </span>
            </div>
          </div>
          <Link href="/student">
            <Button variant="ghost" size="sm" className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-heading font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Active Assessments List */}
        <section className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-slate-200 text-xs font-semibold">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Assigned Tests</span>
            </div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
              Your Assessments
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Take diagnostics set by your mentors. Full screen proctoring security rules apply to all papers.
            </p>
          </div>

          <div className="space-y-4">
            {assessments.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 font-sans border-slate-100 dark:border-slate-800">
                No active tests assigned at this moment.
              </Card>
            ) : (
              assessments.map((ass) => {
                const attempt = ass.attempt
                const isCompleted = attempt && attempt.status === 'submitted'
                const score = attempt?.score

                return (
                  <Card key={ass.id} className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-200 dark:hover:border-slate-800/80">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                        {ass.subject} Paper
                      </span>
                      <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                        {ass.title}
                      </h3>
                      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-450 pt-1 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Time limit: {ass.time_limit_mins} mins
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-50 dark:border-slate-850 pt-3 sm:pt-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase font-bold">Score</span>
                            <span className="font-heading font-black text-lg text-emerald-600 dark:text-emerald-400">
                              {score}%
                            </span>
                          </div>
                          <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 rounded-full font-sans border border-emerald-500/20">
                            Completed
                          </span>
                        </div>
                      ) : (
                        <Link href={`/student/assessments/take?assessmentId=${ass.id}`} className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto h-10 text-xs font-heading font-bold rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-sm">
                            Start Exam
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </section>

        {/* Right Side: Revision Packs */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Study Guide</span>
            </div>
            <h2 className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
              Revision Packs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Auto-generated helper sheets. Incorrect diagnostic answers unlock corresponding syllabus notes.
            </p>
          </div>

          <div className="space-y-4">
            {revisionPacks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0f0f20] border border-slate-100 dark:border-slate-800 text-slate-400 font-sans text-xs space-y-2">
                <FileCheck2 className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto" />
                <p className="font-heading font-bold">No revision packs unlocked yet</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Complete a test. Any incorrect answers automatically import review materials here.</p>
              </div>
            ) : (
              revisionPacks.map((pack) => (
                <Card key={pack.id} className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#3C32CF] dark:text-[#5146e5]">
                      Review Topic: {pack.topic_name}
                    </span>
                    <span className="text-[9px] font-sans text-slate-400 font-semibold">
                      Unlocked from Diagnostic
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#3C32CF]" />
                      {pack.note_title}
                    </span>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-light">
                      {pack.note_content}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

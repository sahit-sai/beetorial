'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  Play, 
  ArrowLeft,
  Calendar,
  Film,
  X
} from 'lucide-react'

interface PastRecording {
  id: string
  subject: string
  mentorName: string
  date: string
  duration: string
  videoUrl: string
}

const MOCK_RECORDINGS: PastRecording[] = [
  {
    id: 'rec-1',
    subject: 'Mathematics',
    mentorName: 'Dr. Liam Sterling',
    date: 'Jul 12, 2026',
    duration: '45 mins',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'rec-2',
    subject: 'Science',
    mentorName: 'Clara Finch',
    date: 'Jul 10, 2026',
    duration: '52 mins',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
]

export default function StudentRecordingsPage() {
  const [activeRecording, setActiveRecording] = useState<PastRecording | null>(null)
  const [backLink, setBackLink] = useState('/student')

  useEffect(() => {
    async function checkRole() {
      const { createClient } = await import('@/utils/supabase/client')
      const { getProfileById } = await import('@/lib/data-fetchers')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getProfileById(user.id)
        if (profile) {
          setBackLink(`/${profile.role}`)
        }
      }
    }
    checkRole()
  }, [])

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
                Past Sessions
              </span>
            </div>
          </div>
          <Link href={backLink}>
            <Button variant="ghost" size="sm" className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-heading font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        
        {/* Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-slate-200 text-xs font-semibold">
            <Film className="w-3.5 h-3.5" />
            <span>Classroom Recording Hub</span>
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
            Past Class Recordings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            Review your historical video lessons and mentor notes
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MOCK_RECORDINGS.map((rec) => (
            <Card key={rec.id} className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="aspect-video bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/55"></div>
                
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center border border-white/20 z-20 group-hover:scale-105 transition-transform duration-200">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                
                <span className="absolute bottom-3 left-3 z-20 px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                  {rec.duration}
                </span>
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-slate-50">
                    {rec.subject} Lesson Recording
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-1">
                    Mentor: {rec.mentorName}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 font-sans border-t border-slate-50 dark:border-slate-85 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.date}
                  </span>
                  <Button 
                    onClick={() => setActiveRecording(rec)}
                    size="sm" 
                    className="h-8 text-[10px] font-heading font-bold rounded-lg bg-[#3C32CF] text-white hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] shadow-sm"
                  >
                    Watch Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Player Modal overlay */}
        {activeRecording && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
              
              <div className="p-4 bg-slate-950 border-b border-slate-850 flex justify-between items-center text-white">
                <div>
                  <span className="font-heading font-black text-sm block">
                    Playback: {activeRecording.subject} Lesson
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    Conducted by {activeRecording.mentorName} on {activeRecording.date}
                  </span>
                </div>
                <Button 
                  onClick={() => setActiveRecording(null)}
                  variant="ghost" 
                  className="w-8 h-8 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="aspect-video bg-black flex items-center justify-center">
                <video 
                  src={activeRecording.videoUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

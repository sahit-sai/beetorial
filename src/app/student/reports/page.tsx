'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp,
  FileSpreadsheet,
  Award
} from 'lucide-react'

// Syllabus structure mockup
interface TopicItem {
  name: string
  completed: boolean
}

interface ChapterItem {
  name: string
  topics: TopicItem[]
}

interface SubjectItem {
  id: string
  name: string
  chapters: ChapterItem[]
}

const MOCK_SYLLABUS: SubjectItem[] = [
  {
    id: 'sub-math',
    name: 'Mathematics',
    chapters: [
      {
        name: 'Fractions & Ratios',
        topics: [
          { name: 'Simplifying Fractions', completed: true },
          { name: 'Adding Mixed Numbers', completed: true },
          { name: 'Dividing Ratios', completed: false }
        ]
      },
      {
        name: 'Intro to Equations',
        topics: [
          { name: 'Variables & Constants', completed: false }
        ]
      }
    ]
  },
  {
    id: 'sub-science',
    name: 'Science',
    chapters: [
      {
        name: 'The Water Cycle',
        topics: [
          { name: 'Evaporation & Condensation', completed: true },
          { name: 'Precipitation Patterns', completed: false }
        ]
      }
    ]
  },
  {
    id: 'sub-english',
    name: 'English',
    chapters: [
      {
        name: 'Essay Writing',
        topics: [
          { name: 'Thesis statement mapping', completed: false }
        ]
      }
    ]
  }
]

const MOCK_ATTENDANCE = [
  { date: 'Jul 14, 2026', subject: 'Mathematics', mentor: 'Dr. Liam Sterling', duration: '60 mins', status: 'Attended' },
  { date: 'Jul 12, 2026', subject: 'Science', mentor: 'Clara Finch', duration: '60 mins', status: 'Attended' },
  { date: 'Jul 10, 2026', subject: 'English', mentor: 'Clara Finch', duration: '65 mins', status: 'Attended' },
  { date: 'Jul 08, 2026', subject: 'Mathematics', mentor: 'Dr. Liam Sterling', duration: '0 mins', status: 'Absent (Excused)' },
]

export default function StudentReportsPage() {
  const [activeSubject, setActiveSubject] = useState<string>('sub-math')

  // Calculate syllabus completion percentage
  const calculateSubjectProgress = (subj: SubjectItem) => {
    let total = 0
    let completed = 0
    subj.chapters.forEach((ch) => {
      ch.topics.forEach((t) => {
        total++
        if (t.completed) completed++
      })
    })
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

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
                Analytics Dashboard
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
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full space-y-12">
        
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-slate-200 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Learning Analytics</span>
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
            Student Analytics & Progress Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Detailed performance tracking, syllabus coverage checkpoints, and classroom attendance summaries.
          </p>
        </div>

        {/* Charts & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Custom SVG Performance Chart */}
          <Card className="lg:col-span-8 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#3C32CF]" />
                  Diagnostic Performance Trend
                </h3>
                <span className="text-[10px] font-sans text-slate-400">Accuracy scores over the last 5 diagnostics</span>
              </div>
            </div>

            {/* Premium interactive SVG chart */}
            <div className="relative pt-6 h-64 w-full select-none">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3C32CF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3C32CF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis helper lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/60" />
                <line x1="40" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/60" />
                <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/60" />
                <line x1="40" y1="155" x2="480" y2="155" stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-slate-850" />

                {/* Line graph path - plotting points (78, 80, 85, 91, 94) mapped to heights */}
                {/* Points: P1(50, 158), P2(150, 150), P3(250, 130), P4(350, 80), P5(450, 40) */}
                <path
                  d="M 50 158 Q 100 155 150 150 T 250 130 T 350 80 T 450 40 L 450 155 L 50 155 Z"
                  fill="url(#chartGrad)"
                />
                
                <path
                  d="M 50 158 Q 100 155 150 150 T 250 130 T 350 80 T 450 40"
                  fill="none"
                  stroke="#3C32CF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="dark:stroke-[#5146e5]"
                />

                {/* Nodes with glow dots */}
                <circle cx="50" cy="158" r="5" fill="#3C32CF" className="dark:fill-[#5146e5] cursor-pointer" />
                <circle cx="150" cy="150" r="5" fill="#3C32CF" className="dark:fill-[#5146e5] cursor-pointer" />
                <circle cx="250" cy="130" r="5" fill="#3C32CF" className="dark:fill-[#5146e5] cursor-pointer" />
                <circle cx="350" cy="80" r="5" fill="#3C32CF" className="dark:fill-[#5146e5] cursor-pointer" />
                <circle cx="450" cy="40" r="5" fill="#3C32CF" className="dark:fill-[#5146e5] cursor-pointer" />

                {/* Value node labels */}
                <text x="45" y="145" fontSize="9" fontWeight="bold" fill="#64748b" className="font-mono">78%</text>
                <text x="145" y="137" fontSize="9" fontWeight="bold" fill="#64748b" className="font-mono">80%</text>
                <text x="245" y="117" fontSize="9" fontWeight="bold" fill="#64748b" className="font-mono">85%</text>
                <text x="345" y="67" fontSize="9" fontWeight="bold" fill="#64748b" className="font-mono">91%</text>
                <text x="435" y="27" fontSize="10" fontWeight="bold" fill="#3C32CF" className="font-mono dark:fill-[#5146e5]">94%</text>

                {/* X-axis labels */}
                <text x="40" y="175" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Diagnostic 1</text>
                <text x="150" y="175" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Diagnostic 2</text>
                <text x="250" y="175" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Diagnostic 3</text>
                <text x="350" y="175" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Diagnostic 4</text>
                <text x="450" y="175" fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Current</text>
              </svg>
            </div>
          </Card>

          {/* Syllabus Coverage Index */}
          <Card className="lg:col-span-4 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#3C32CF]" />
                Syllabus Progress
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Chapters and topics completed</span>
            </div>

            {/* Subject Selector Tabs */}
            <div className="flex gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              {MOCK_SYLLABUS.map((subj) => {
                const isActive = activeSubject === subj.id
                const pct = calculateSubjectProgress(subj)
                return (
                  <button
                    key={subj.id}
                    onClick={() => setActiveSubject(subj.id)}
                    className={`flex-1 py-2 text-center rounded-lg text-[10px] font-heading font-black transition-all ${
                      isActive 
                        ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5]' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {subj.name}
                    <span className="block font-mono text-[9px] opacity-60 mt-0.5">{pct}%</span>
                  </button>
                )
              })}
            </div>

            {/* Target Subject Details */}
            <div className="space-y-4 pt-2">
              {MOCK_SYLLABUS.find((s) => s.id === activeSubject)?.chapters.map((ch) => (
                <div key={ch.name} className="space-y-2 font-sans text-xs">
                  <span className="text-[10px] font-heading font-extrabold text-slate-900 dark:text-slate-200">
                    {ch.name}
                  </span>
                  <div className="space-y-1.5">
                    {ch.topics.map((t) => (
                      <div key={t.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {t.name}
                        </span>
                        {t.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-350 dark:border-slate-800 shrink-0"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </Card>

        </div>

        {/* Classroom Attendance Records */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#3C32CF]" />
              Schedules & Attendance Record
            </h3>
            <span className="text-[10px] font-sans text-slate-400">Classroom logs dynamically synched from virtual session calls</span>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="p-4">Session Date</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Mentor Name</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
                {MOCK_ATTENDANCE.map((log, idx) => {
                  const isAttended = log.status === 'Attended'
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-medium text-slate-950 dark:text-slate-100">{log.date}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{log.subject}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{log.mentor}</td>
                      <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{log.duration}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          isAttended 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </main>
    </div>
  )
}

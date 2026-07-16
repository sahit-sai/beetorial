'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  LogOut, 
  User, 
  Users, 
  ClipboardCheck, 
  BookOpen,
  LayoutGrid,
  ShieldAlert,
  Calendar,
  Video,
  Plus,
  UploadCloud,
  FileText,
  Save,
  CheckCircle
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { 
  getMentorAvailability, 
  createAvailabilitySlot, 
  getSharedNotepad, 
  saveSharedNotepad, 
  uploadLessonFile 
} from '@/app/mentor/actions'
import { getNotifications } from '@/lib/data-fetchers'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { sendReportAction, triggerMissedClassNotificationAction } from '@/app/notifications/actions'

// Mock Pupil list
const MOCK_PUPILS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Alex Jenkins', email: 'alex.jenkins@beetorial.com', accuracy: '94%', streak: '7 Days', xp: '680 XP', violations: '1 warning' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Emily Rivers', email: 'emily.rivers@beetorial.com', accuracy: '88%', streak: '3 Days', xp: '410 XP', violations: '0 warnings' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Marcus Vance', email: 'marcus.vance@beetorial.com', accuracy: '91%', streak: '12 Days', xp: '1250 XP', violations: '0 warnings' },
]

// Mock Proctoring Log
const MOCK_VIOLATIONS = [
  { student: 'Alex Jenkins', paper: 'Fractions Diagnostic', type: 'Tab Switch Detected', details: 'E2E check: switched browser tab', time: '2 hours ago' },
  { student: 'Alex Jenkins', paper: 'Fractions Diagnostic', type: 'Fullscreen Exit', details: 'Student exited full screen container', time: '2 hours ago' }
]

// Mock Class Logs
const MOCK_CLASSES = [
  { date: 'Jul 14, 2026', student: 'Alex Jenkins', subject: 'Mathematics', status: 'Completed', recording: 'Watch Recording' },
  { date: 'Jul 12, 2026', student: 'Emily Rivers', subject: 'Science', status: 'Completed', recording: 'Watch Recording' },
]

export default function MentorDashboard() {
  const mentorId = '00000000-0000-0000-0000-000000000005' // Seeded mentor Liam Sterling
  const targetStudentId = '00000000-0000-0000-0000-000000000001' // Alex Jenkins

  // Notepad State
  const [notepadContent, setNotepadContent] = useState<string>('')
  const [notepadStatus, setNotepadStatus] = useState<string>('Synced')

  // Slots State
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [slotDate, setSlotDate] = useState<string>('2026-07-20')
  const [slotTime, setSlotTime] = useState<string>('14:00')

  // Upload State
  const [fileTitle, setFileTitle] = useState<string>('')
  const [fileSubject, setFileSubject] = useState<string>('Mathematics')
  const [uploadMessage, setUploadMessage] = useState<string>('')

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([])
  const [reportStatus, setReportStatus] = useState<Record<string, string>>({})

  // Fetch initial notepad, slots, and notifications
  useEffect(() => {
    async function loadData() {
      const content = await getSharedNotepad(targetStudentId, mentorId)
      setNotepadContent(content)

      const slots = await getMentorAvailability(mentorId)
      setAvailabilities(slots)

      const notifs = await getNotifications(mentorId)
      setNotifications(notifs)
    }
    loadData()
  }, [])

  // Report Dispatch handlers
  const handleSendReport = async (studentId: string, studentName: string, type: 'weekly' | 'monthly') => {
    setReportStatus(prev => ({ ...prev, [studentId]: `Sending ${type} report...` }))
    const success = await sendReportAction(studentId, studentName, type, 'Dr. Liam Sterling')
    if (success) {
      setReportStatus(prev => ({ ...prev, [studentId]: `${type.charAt(0).toUpperCase() + type.slice(1)} report sent successfully!` }))
      setTimeout(() => {
        setReportStatus(prev => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
      }, 3000)
    } else {
      setReportStatus(prev => ({ ...prev, [studentId]: `Failed to send report.` }))
    }
  }

  const handleTriggerMissedClass = async (studentId: string, studentName: string, className: string) => {
    setReportStatus(prev => ({ ...prev, [studentId]: `Triggering missed class alert...` }))
    const success = await triggerMissedClassNotificationAction(studentId, studentName, className)
    if (success) {
      setReportStatus(prev => ({ ...prev, [studentId]: `Missed class alert sent!` }))
      setTimeout(() => {
        setReportStatus(prev => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
      }, 3000)
    } else {
      setReportStatus(prev => ({ ...prev, [studentId]: `Failed to alert parent.` }))
    }
  }

  // Handle slot creation
  const handleOpenSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotDate || !slotTime) return

    const startStr = `${slotDate}T${slotTime}:00Z`
    // Mock end time 1 hour later
    const endHour = parseInt(slotTime.split(':')[0]) + 1
    const endStr = `${slotDate}T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`

    const success = await createAvailabilitySlot(mentorId, startStr, endStr)
    if (success) {
      const slots = await getMentorAvailability(mentorId)
      setAvailabilities(slots)
    }
  }

  // Handle Notepad save
  const handleSaveNotepad = async () => {
    setNotepadStatus('Saving...')
    const success = await saveSharedNotepad(targetStudentId, mentorId, notepadContent)
    if (success) {
      setNotepadStatus('Changes Saved!')
      setTimeout(() => setNotepadStatus('Synced'), 2000)
    } else {
      setNotepadStatus('Error saving')
    }
  }

  // Handle File upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileTitle) return

    setUploadMessage('Uploading...')
    // Simulated upload to supabase storage -> file URL
    const simulatedUrl = `/files/${fileTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`
    
    const success = await uploadLessonFile(targetStudentId, mentorId, fileTitle, simulatedUrl, fileSubject)
    if (success) {
      setUploadMessage('Worksheet shared successfully!')
      setFileTitle('')
      setTimeout(() => setUploadMessage(''), 3000)
    } else {
      setUploadMessage('Upload failed')
    }
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
                Mentor Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-heading font-bold text-sm">
            <LayoutGrid className="w-4 h-4" />
            Mentor Home
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 mb-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-slate-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-heading font-bold text-xs block text-slate-900 dark:text-slate-100 truncate">
                Dr. Liam Sterling
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase font-bold tracking-wider">
                mentor
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
        
        {/* Welcome Header */}
        <div className="bg-white dark:bg-[#0f0f20] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Mentor Workspace 🍎
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-sans text-sm max-w-lg">
              Manage your slots, upload files, update collaborative shared notepads, and track pupil warnings.
            </p>
          </div>
          <div className="relative z-20">
            <NotificationCenter userId={mentorId} initialNotifications={notifications} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Assigned Pupils</CardTitle>
              <Users className="h-4 w-4 text-[#3C32CF] dark:text-[#5146e5]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-black text-slate-900 dark:text-white">3</div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">Active student links established.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Papers to Grade</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-[#3C32CF] dark:text-[#5146e5]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-black text-slate-900 dark:text-white">0</div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">All submissions fully evaluated.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Proctor Warnings</CardTitle>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-black text-rose-600 dark:text-rose-450">2 logs</div>
              <p className="text-xs text-muted-foreground mt-1 font-sans">Flags logged during recent attempts.</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Availability Slots Creator */}
          <Card className="lg:col-span-4 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3C32CF]" />
                Availability Planner
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Open time slots for bookings</span>
            </div>

            <form onSubmit={handleOpenSlot} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Select Date</label>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Start Time</label>
                <input
                  type="time"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] text-white font-heading font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Open Slot
              </Button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Currently Open Slots</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availabilities.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic font-sans py-2">No availability slots opened.</p>
                ) : (
                  availabilities.map((slot) => {
                    const dateObj = new Date(slot.start_time)
                    return (
                      <div key={slot.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                        <div className="font-mono text-[10px] text-slate-700 dark:text-slate-350">
                          {dateObj.toLocaleDateString()} @ {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                          slot.status === 'booked' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                        }`}>
                          {slot.status}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Collaborative Notepad sync editor */}
          <Card className="lg:col-span-8 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#3C32CF]" />
                  Shared Scratchpad Notepad
                </h3>
                <span className="text-[10px] font-sans text-slate-400">Live text sync with student dashboard notepad</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-slate-400 font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  {notepadStatus}
                </span>
                <Button onClick={handleSaveNotepad} size="sm" className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>

            <textarea
              value={notepadContent}
              onChange={(e) => {
                setNotepadContent(e.target.value)
                setNotepadStatus('Unsaved Changes')
              }}
              placeholder="Type lesson outlines, equations, formulas, or general updates here..."
              className="w-full h-72 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#3C32CF] leading-relaxed resize-none"
            />
          </Card>

        </div>

        {/* Lesson Worksheets Files Upload Portal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Uploader Card */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#3C32CF]" />
                Share Worksheets & Notes
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Simulate file selection to push to student Notes Library</span>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Simplification Ratios Guide"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Subject Area</label>
                <select
                  value={fileSubject}
                  onChange={(e) => setFileSubject(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-950 dark:text-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-[10px] font-semibold text-slate-500">Local document loader active</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Supports PDF, DOCX, PNG (Simulated)</span>
              </div>

              {uploadMessage && (
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {uploadMessage}
                </div>
              )}

              <Button type="submit" className="w-full h-10 rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] text-white font-heading font-bold">
                Upload & Share Note
              </Button>
            </form>
          </Card>

          {/* Student Directory Row Warnings */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3C32CF]" />
                Pupil Directory Quick View
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Track matched pupil streaks and security alerts</span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {MOCK_PUPILS.map((pupil) => {
                const hasViolation = pupil.violations !== '0 warnings'
                return (
                  <div key={pupil.id} className="flex flex-col p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-heading font-black text-sm block text-slate-950 dark:text-slate-100">
                          {pupil.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Streak: {pupil.streak} • XP: {pupil.xp} • Avg: {pupil.accuracy}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold border ${
                        hasViolation 
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}>
                        {pupil.violations}
                      </span>
                    </div>

                    {/* Report triggers list */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <Button
                        onClick={() => handleSendReport(pupil.id, pupil.name, 'weekly')}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[9px] font-sans px-2.5 rounded-lg border-slate-250 hover:bg-[#3C32CF] hover:text-white"
                      >
                        Send Weekly Report
                      </Button>
                      <Button
                        onClick={() => handleSendReport(pupil.id, pupil.name, 'monthly')}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[9px] font-sans px-2.5 rounded-lg border-slate-250 hover:bg-[#3C32CF] hover:text-white"
                      >
                        Send Monthly Report
                      </Button>
                      <Button
                        onClick={() => handleTriggerMissedClass(pupil.id, pupil.name, 'Mathematics')}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[9px] font-sans px-2.5 text-rose-650 hover:bg-rose-500/10 rounded-lg"
                      >
                        Simulate Missed Class
                      </Button>
                    </div>

                    {reportStatus[pupil.id] && (
                      <span className="text-[9px] text-emerald-600 font-bold block pt-1">
                        {reportStatus[pupil.id]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

        </div>

        {/* Proctoring Violations Log & Class Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Proctor Violations details */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Recent Proctoring Warnings Log
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Security violations mapped from active attempts</span>
            </div>

            <div className="space-y-3">
              {MOCK_VIOLATIONS.map((viol, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-[#3C32CF] dark:text-[#5146e5] uppercase font-bold">{viol.student}</span>
                    <span className="text-rose-500 uppercase font-mono font-bold">{viol.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-light">{viol.details}</p>
                  <span className="text-[8px] text-slate-400 block mt-1">{viol.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Call Session Logs */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-[#3C32CF]" />
                Recent Classroom Session History
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Class durations and saved recording access links</span>
            </div>

            <div className="space-y-3">
              {MOCK_CLASSES.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 font-sans">
                  <div>
                    <span className="font-heading font-extrabold text-sm block text-slate-950 dark:text-slate-100">
                      {c.student} • {c.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-sans mt-0.5 block">{c.date}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                      {c.status}
                    </span>
                    <span className="text-xs text-[#3C32CF] hover:underline cursor-pointer font-bold">
                      {c.recording}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </main>
    </div>
  )
}

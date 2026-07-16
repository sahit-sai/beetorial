'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getStudentClasses, type ClassSession } from '@/lib/data-fetchers'
import { 
  Calendar, 
  ArrowLeft,
  Clock,
  User,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  PlusCircle,
  BellRing
} from 'lucide-react'
import { getMentorAvailability, bookAvailabilitySlot } from '@/app/mentor/actions'

// Days of the week helper
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StudentSchedulePage() {
  const studentId = '00000000-0000-0000-0000-000000000001' // Seeded Alex Jenkins
  const mentorId = '00000000-0000-0000-0000-000000000005' // Liam Sterling

  const [classes, setClasses] = useState<ClassSession[]>([])
  const [openSlots, setOpenSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingNotification, setBookingNotification] = useState<string>('')

  async function loadScheduleAndSlots() {
    const data = await getStudentClasses('student-1-alex')
    setClasses(data)

    const slots = await getMentorAvailability(mentorId)
    // Filter only available slots
    setOpenSlots(slots.filter((s) => s.status === 'available'))
    setLoading(false)
  }

  useEffect(() => {
    loadScheduleAndSlots()
  }, [])

  // Handle slot booking
  const handleBookSlot = async (slotId: string, slotTimeLabel: string) => {
    setLoading(true)
    const success = await bookAvailabilitySlot(slotId, studentId)
    if (success) {
      // Trigger Real-time Alert Notification
      setBookingNotification(`Booked! New tutoring session scheduled for ${slotTimeLabel}.`)
      await loadScheduleAndSlots()
      setTimeout(() => setBookingNotification(''), 4000)
    } else {
      setLoading(false)
    }
  }

  // Helper to get week start date (Monday)
  const getStartOfWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    const mon = new Date(today.setDate(diff))
    mon.setHours(0, 0, 0, 0)
    return mon
  }

  const startOfWeek = getStartOfWeek()

  // Format a date offset relative to Monday of this week
  const getDayDateString = (dayOffset: number) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + dayOffset)
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Filter classes belonging to a specific day of the current week (dayOffset: 0 for Monday)
  const getClassesForDay = (dayOffset: number) => {
    const targetDate = new Date(startOfWeek)
    targetDate.setDate(startOfWeek.getDate() + dayOffset)
    const targetDateString = targetDate.toDateString()

    return classes.filter(
      (c) => new Date(c.start_time).toDateString() === targetDateString
    )
  }

  const isToday = (dayOffset: number) => {
    const targetDate = new Date(startOfWeek)
    targetDate.setDate(startOfWeek.getDate() + dayOffset)
    return targetDate.toDateString() === new Date().toDateString()
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
                Student Calendar
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

      {/* Agenda Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        
        {/* Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-slate-200 text-xs font-semibold">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Class Schedule & Planner</span>
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
            Agenda Calendar & Bookings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            Week of {startOfWeek.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Real-time Alert Banner */}
        {bookingNotification && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 font-sans text-xs font-bold animate-bounce shadow-sm">
            <BellRing className="w-5 h-5 animate-pulse text-emerald-600 dark:text-emerald-450" />
            <span>{bookingNotification}</span>
          </div>
        )}

        {/* Open Tutor Availability Slots */}
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#3C32CF]" />
              Book a Tutoring Session
            </h3>
            <span className="text-[10px] font-sans text-slate-400">Available time slots opened by your matched mentor Dr. Liam Sterling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {openSlots.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 col-span-2">
                No open slots currently available. Ask Dr. Liam Sterling to open availability.
              </p>
            ) : (
              openSlots.map((slot) => {
                const dateObj = new Date(slot.start_time)
                const timeLabel = `${dateObj.toLocaleDateString()} @ ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                return (
                  <div key={slot.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-xs font-heading font-black text-slate-900 dark:text-white block">
                        Mathematics Slot
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-405 block">
                        {timeLabel}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleBookSlot(slot.id, timeLabel)}
                      size="sm" 
                      className="h-8 px-3.5 bg-[#3C32CF] hover:bg-[#2f27a6] text-white text-[10px] rounded-xl font-heading font-bold"
                    >
                      Book Slot
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Weekly List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-sans">
            Loading weekly schedule agenda...
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS.map((dayName, idx) => {
              const dayClasses = getClassesForDay(idx)
              const todayActive = isToday(idx)

              return (
                <div 
                  key={dayName}
                  className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    todayActive 
                      ? 'bg-white dark:bg-[#0f0f20] border-[#3C32CF]/30 dark:border-[#5146e5]/40 shadow-[0_8px_30px_rgb(60_50_207/0.03),0_2px_8px_rgb(0_0_0/0.01)] ring-2 ring-[#3C32CF]/5' 
                      : 'bg-white dark:bg-[#0f0f20] border-slate-100 dark:border-slate-800/80 shadow-sm hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  
                  {/* Left Side: Day Header */}
                  <div className="w-full sm:w-44 flex sm:flex-col justify-between items-center sm:items-start sm:border-r sm:border-slate-100 sm:dark:border-slate-800/80 sm:pr-4">
                    <div>
                      <span className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                        {dayName}
                        {todayActive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1 block">
                        {getDayDateString(idx)}
                      </span>
                    </div>
                    
                    <span className="text-xs font-sans text-slate-400 font-semibold sm:mt-2">
                      {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {/* Right Side: Classes list for this day */}
                  <div className="flex-1 space-y-3 pt-2 sm:pt-0">
                    {dayClasses.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic p-2">
                        No tutoring sessions scheduled.
                      </p>
                    ) : (
                      dayClasses.map((c) => (
                        <div 
                          key={c.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 gap-3"
                        >
                          <div className="space-y-1">
                            <span className="font-heading font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-2">
                              {c.subject} Session
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-slate-200 capitalize font-sans">
                                {c.status}
                              </span>
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-405 flex items-center gap-1 font-sans">
                              <User className="w-3.5 h-3.5" />
                              Mentor: {c.mentor_name || 'Dr. Liam Sterling'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-sans">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' — '}
                              {new Date(c.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}

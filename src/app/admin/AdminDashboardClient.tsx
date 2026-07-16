'use client'

import React, { useState } from 'react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  LogOut, 
  Filter, 
  CreditCard,
  Briefcase,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { createLeadAction, updateLeadStatusAction, assignMentorAction, payInvoiceAction } from './actions'
import { Lead, Invoice, StudentMentorLink, Profile, Notification } from '@/lib/mock-data'
import { NotificationCenter } from '@/components/ui/NotificationCenter'

interface AdminDashboardClientProps {
  initialLeads: Lead[]
  initialInvoices: Invoice[]
  initialLinks: StudentMentorLink[]
  profiles: Profile[]
  adminProfile: Profile
  initialNotifications: Notification[]
}

export function AdminDashboardClient({
  initialLeads,
  initialInvoices,
  initialLinks,
  profiles,
  adminProfile,
  initialNotifications
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'leads' | 'matching' | 'billing'>('leads')
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [links, setLinks] = useState<StudentMentorLink[]>(initialLinks)
  
  // Add Lead Form State
  const [newStudentName, setNewStudentName] = useState('')
  const [newParentName, setNewParentName] = useState('')
  const [newParentEmail, setNewParentEmail] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newStatus, setNewStatus] = useState<'demo_requested' | 'demo_scheduled' | 'enrolled' | 'paid'>('demo_requested')
  const [leadMessage, setLeadMessage] = useState('')

  // Matching assignment state
  const [selectedMentors, setSelectedMentors] = useState<Record<string, string>>({})
  const [matchingMessage, setMatchingMessage] = useState<Record<string, string>>({})

  const students = profiles.filter(p => p.role === 'student')
  const mentors = profiles.filter(p => p.role === 'mentor')

  // Handle lead creation
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName || !newParentName || !newParentEmail) return

    setLeadMessage('Creating Lead...')
    const success = await createLeadAction(newStudentName, newParentName, newParentEmail, newStatus, newNotes)
    
    if (success) {
      // Optimistically update client state
      setLeads([
        {
          id: `lead-mock-${Date.now()}`,
          student_name: newStudentName,
          parent_name: newParentName,
          parent_email: newParentEmail,
          status: newStatus,
          notes: newNotes,
          created_at: new Date().toISOString()
        },
        ...leads
      ])
      setLeadMessage('Lead successfully enrolled in CRM!')
      setNewStudentName('')
      setNewParentName('')
      setNewParentEmail('')
      setNewNotes('')
      setNewStatus('demo_requested')
      setTimeout(() => setLeadMessage(''), 3000)
    } else {
      setLeadMessage('Failed to create lead.')
    }
  }

  // Handle lead status transition
  const handleTransitionLead = async (leadId: string, newStatus: 'demo_requested' | 'demo_scheduled' | 'enrolled' | 'paid') => {
    const success = await updateLeadStatusAction(leadId, newStatus)
    if (success) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    }
  }

  // Handle mentor assignment
  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    setMatchingMessage(prev => ({ ...prev, [studentId]: 'Assigning...' }))
    const success = await assignMentorAction(studentId, mentorId)
    if (success) {
      // Update link mapping in state
      const existing = links.find(l => l.student_id === studentId)
      if (existing) {
        setLinks(links.map(l => l.student_id === studentId ? { ...l, mentor_id: mentorId } : l))
      } else {
        setLinks([...links, { student_id: studentId, mentor_id: mentorId }])
      }
      setMatchingMessage(prev => ({ ...prev, [studentId]: 'Assigned Successfully!' }))
      setTimeout(() => {
        setMatchingMessage(prev => {
          const next = { ...prev }
          delete next[studentId]
          return next
        })
      }, 2000)
    } else {
      setMatchingMessage(prev => ({ ...prev, [studentId]: 'Failed assignment' }))
    }
  }

  // Handle invoice mark paid
  const handleMarkPaid = async (invoiceId: string) => {
    const success = await payInvoiceAction(invoiceId)
    if (success) {
      setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    }
  }

  // Calculate CRM Stats Overview
  const totalLeads = leads.length
  const totalStudents = students.length
  const totalPaidInvoices = invoices.filter(inv => inv.status === 'paid')
  const mrr = totalPaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  // Pipeline Columns
  const pipelineStatuses = [
    { key: 'demo_requested', title: 'Demo Request', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-800' },
    { key: 'demo_scheduled', title: 'Demo Scheduled', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800' },
    { key: 'enrolled', title: 'Enrolled Match', color: 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/20 dark:border-sky-800' },
    { key: 'paid', title: 'Paid Account', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800' }
  ] as const

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
                Admin CRM Portal
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 font-sans text-xs">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-heading font-bold text-left ${
              activeTab === 'leads' 
                ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5]' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Leads Pipeline
          </button>

          <button 
            onClick={() => setActiveTab('matching')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-heading font-bold text-left ${
              activeTab === 'matching' 
                ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5]' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Pupil Matching
          </button>

          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-heading font-bold text-left ${
              activeTab === 'billing' 
                ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5]' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Subscriptions & Invoices
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 mb-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-heading font-bold text-xs block text-slate-900 dark:text-slate-100 truncate">
                {adminProfile.full_name}
              </span>
              <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold tracking-wider">
                System Admin
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

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-6 md:px-10 overflow-y-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-[#0f0f20] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Admin Workspace ⚙️
            </h2>
            <p className="mt-2 text-slate-650 dark:text-slate-400 font-sans text-sm max-w-lg">
              Track leads conversions, manage matches, assign mentors, and audit subscription invoices.
            </p>
          </div>
          <div className="relative z-20">
            <NotificationCenter userId={adminProfile.id} initialNotifications={initialNotifications} />
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
                <Layers className="h-4 w-4 text-[#3C32CF]" />
              </div>
              <div className="text-3xl font-heading font-black text-slate-900 dark:text-white mt-2">{totalLeads}</div>
              <p className="text-[10px] text-slate-400 mt-1">Acquisition pipeline entries.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Enrolled Pupils</span>
                <Users className="h-4 w-4 text-[#3C32CF]" />
              </div>
              <div className="text-3xl font-heading font-black text-slate-900 dark:text-white mt-2">{totalStudents}</div>
              <p className="text-[10px] text-slate-400 mt-1">Matched active students.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Monthly Revenue (MRR)</span>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-heading font-black text-emerald-600 dark:text-emerald-450 mt-2">${mrr.toFixed(2)}</div>
              <p className="text-[10px] text-slate-400 mt-1">Paid invoicing totals.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">Overdue Billing</span>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-3xl font-heading font-black text-rose-600 dark:text-rose-450 mt-2">${totalOverdue.toFixed(2)}</div>
              <p className="text-[10px] text-slate-400 mt-1">Requires followups.</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab 1: Leads Pipeline */}
        {activeTab === 'leads' && (
          <div className="space-y-8">
            
            {/* Split layout: Kanban Board + Add Lead Form */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Add Lead Form Card */}
              <Card className="xl:col-span-1 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4 h-fit">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#3C32CF]" />
                    Add CRM Lead
                  </h3>
                  <span className="text-[10px] font-sans text-slate-400">Enroll new parent demo request</span>
                </div>

                <form onSubmit={handleCreateLead} className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Student Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tommy Miller"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Parent Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Miller"
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Parent Email</label>
                    <input
                      type="email"
                      placeholder="e.g. robert.miller@example.com"
                      value={newParentEmail}
                      onChange={(e) => setNewParentEmail(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Initial Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-950 dark:text-white"
                    >
                      <option value="demo_requested">Demo Request</option>
                      <option value="demo_scheduled">Demo Scheduled</option>
                      <option value="enrolled">Enrolled Match</option>
                      <option value="paid">Paid Account</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Internal Notes</label>
                    <textarea
                      placeholder="Add struggles, targets, subject preferences..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full h-20 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:text-white resize-none"
                    />
                  </div>

                  {leadMessage && (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {leadMessage}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-10 rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] text-white font-heading font-bold">
                    Enroll Lead
                  </Button>
                </form>
              </Card>

              {/* Kanban Pipeline Board */}
              <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 h-fit">
                {pipelineStatuses.map((col) => {
                  const colLeads = leads.filter(l => l.status === col.key)
                  
                  return (
                    <div key={col.key} className="space-y-4 bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 min-h-[500px] flex flex-col">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/80">
                        <span className="font-heading font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider block">
                          {col.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-350 text-[10px] font-bold">
                          {colLeads.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {colLeads.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-center">
                            <span className="text-[10px] text-slate-400 italic">Column is empty</span>
                          </div>
                        ) : (
                          colLeads.map((lead) => (
                            <Card key={lead.id} className="rounded-2xl border-slate-150 dark:border-slate-800 bg-white dark:bg-[#0f0f20] p-4 shadow-sm space-y-2 hover:shadow-md transition-shadow duration-200 group">
                              <div>
                                <span className="font-heading font-black text-sm block text-slate-950 dark:text-slate-100 leading-tight">
                                  {lead.student_name}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Parent: {lead.parent_name}
                                </span>
                                <span className="text-[9px] text-[#3C32CF] dark:text-indigo-400 truncate block">
                                  {lead.parent_email}
                                </span>
                              </div>

                              {lead.notes && (
                                <p className="text-[10px] text-slate-550 dark:text-slate-400 line-clamp-3 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl font-sans">
                                  {lead.notes}
                                </p>
                              )}

                              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[8px] text-slate-400">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </span>

                                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
                                  {col.key !== 'demo_requested' && (
                                    <button 
                                      onClick={() => {
                                        const prevStatus = 
                                          col.key === 'demo_scheduled' ? 'demo_requested' :
                                          col.key === 'enrolled' ? 'demo_scheduled' : 'enrolled'
                                        handleTransitionLead(lead.id, prevStatus as any)
                                      }}
                                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650"
                                      title="Move back"
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {col.key !== 'paid' && (
                                    <button 
                                      onClick={() => {
                                        const nextStatus = 
                                          col.key === 'demo_requested' ? 'demo_scheduled' :
                                          col.key === 'demo_scheduled' ? 'enrolled' : 'paid'
                                        handleTransitionLead(lead.id, nextStatus as any)
                                      }}
                                      className="p-1 rounded-lg hover:bg-[#3C32CF]/10 text-slate-400 hover:text-[#3C32CF]"
                                      title="Move forward"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: User Matchings */}
        {activeTab === 'matching' && (
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#3C32CF]" />
                Mentor-Student Allocation Hub
              </h3>
              <span className="text-[10px] font-sans text-slate-400">Match matched active pupils to subject mentors</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student Email</th>
                    <th className="py-3 px-4">Matched Parent</th>
                    <th className="py-3 px-4">Current Mentor Matched</th>
                    <th className="py-3 px-4 text-right">Action Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {students.map((student) => {
                    const matchedLink = links.find(l => l.student_id === student.id)
                    const matchedMentor = mentors.find(m => m.id === matchedLink?.mentor_id)
                    
                    // Parent link check: Sarah Jenkins is student-1-alex's parent
                    let matchedParentName = 'No Linked Parent'
                    if (student.id === 'student-1-alex' || student.id === '00000000-0000-0000-0000-000000000001') {
                      matchedParentName = 'Sarah Jenkins'
                    } else if (student.id === 'student-2-emily') {
                      matchedParentName = 'Robert Rivers (Simulated)'
                    } else if (student.id === 'student-3-marcus') {
                      matchedParentName = 'Grace Vance (Simulated)'
                    }

                    const selectedMentorId = selectedMentors[student.id] || matchedLink?.mentor_id || ''

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                        <td className="py-4 px-4 font-heading font-bold text-slate-900 dark:text-white">
                          {student.full_name}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {student.email}
                        </td>
                        <td className="py-4 px-4 font-sans text-slate-650 dark:text-slate-350">
                          {matchedParentName}
                        </td>
                        <td className="py-4 px-4">
                          {matchedMentor ? (
                            <span className="px-2.5 py-1 text-[10px] font-semibold bg-indigo-500/10 text-[#3C32CF] dark:text-[#8881f3] rounded-full border border-indigo-500/20">
                              {matchedMentor.full_name}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-semibold bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20">
                              Unassigned Match
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right flex items-center justify-end gap-2.5">
                          <select
                            value={selectedMentorId}
                            onChange={(e) => setSelectedMentors(prev => ({ ...prev, [student.id]: e.target.value }))}
                            className="h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-950 dark:text-white text-xs"
                          >
                            <option value="">Choose Mentor...</option>
                            {mentors.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name}
                              </option>
                            ))}
                          </select>

                          <Button
                            onClick={() => handleAssignMentor(student.id, selectedMentors[student.id] || '')}
                            disabled={!selectedMentors[student.id] || selectedMentors[student.id] === matchedLink?.mentor_id}
                            className="h-9 px-3 rounded-xl bg-[#3C32CF] text-white hover:bg-[#2f27a6]"
                          >
                            Save Match
                          </Button>

                          {matchingMessage[student.id] && (
                            <span className="text-[10px] text-emerald-600 font-bold block ml-2">
                              {matchingMessage[student.id]}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: Subscriptions & Invoices */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            
            {/* Invoices List Card */}
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#3C32CF]" />
                  Billing Audit & Invoices Ledger
                </h3>
                <span className="text-[10px] font-sans text-slate-400">Track renewals, pending payments, and invoices</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Billing Amount</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Collect Payments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                    {invoices.map((inv) => {
                      const isPaid = inv.status === 'paid'
                      const isOverdue = inv.status === 'overdue'
                      
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                          <td className="py-4 px-4 font-mono font-bold text-slate-500">
                            #{inv.id}
                          </td>
                          <td className="py-4 px-4 font-heading font-bold text-slate-900 dark:text-white">
                            {inv.student_name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-950 dark:text-slate-150">
                            ${inv.amount.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                            {inv.due_date}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase border ${
                              isPaid 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                : isOverdue 
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {!isPaid && (
                              <Button
                                onClick={() => handleMarkPaid(inv.id)}
                                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px]"
                              >
                                Mark Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

      </main>

    </div>
  )
}

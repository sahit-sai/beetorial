'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getNotesHierarchy, type NotesHierarchyItem } from '@/lib/data-fetchers'
import { 
  BookMarked, 
  ChevronRight, 
  Clock, 
  ArrowLeft,
  ChevronDown,
  BookOpen,
  FileText,
  DownloadCloud,
  Save,
  Compass,
  FileSpreadsheet
} from 'lucide-react'
import { 
  getUploadedFiles, 
  getSharedNotepad, 
  saveSharedNotepad 
} from '@/app/mentor/actions'

export default function StudentNotesPage() {
  const studentId = '00000000-0000-0000-0000-000000000001' // Seeded Alex Jenkins
  const mentorId = '00000000-0000-0000-0000-000000000005' // Liam Sterling

  const [hierarchy, setHierarchy] = useState<NotesHierarchyItem[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  // Mentor Shared Resources State
  const [sharedFiles, setSharedFiles] = useState<any[]>([])
  const [scratchpadText, setScratchpadText] = useState<string>('')
  const [scratchpadStatus, setScratchpadStatus] = useState<string>('Synced')

  useEffect(() => {
    async function loadNotes() {
      const data = await getNotesHierarchy()
      setHierarchy(data)
      
      // Fetch shared resources from mentor
      const files = await getUploadedFiles(studentId)
      setSharedFiles(files)

      const notepad = await getSharedNotepad(studentId, mentorId)
      setScratchpadText(notepad)

      // Auto-expand first chapter of first subject if present
      if (data.length > 0 && data[0].chapters.length > 0) {
        const firstChId = data[0].chapters[0].chapter.id
        setExpandedChapters({ [firstChId]: true })
        // Auto-select first topic if present
        if (data[0].chapters[0].topics.length > 0) {
          setSelectedTopicId(data[0].chapters[0].topics[0].topic.id)
        }
      }
      setLoading(false)
    }
    loadNotes()
  }, [])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
  }

  // Reload shared resources
  const refreshSharedResources = async () => {
    const files = await getUploadedFiles(studentId)
    setSharedFiles(files)
    const notepad = await getSharedNotepad(studentId, mentorId)
    setScratchpadText(notepad)
  }

  // Handle Notepad save from student side
  const handleSaveScratchpad = async () => {
    setScratchpadStatus('Saving...')
    const success = await saveSharedNotepad(studentId, mentorId, scratchpadText)
    if (success) {
      setScratchpadStatus('Saved!')
      setTimeout(() => setScratchpadStatus('Synced'), 2000)
    } else {
      setScratchpadStatus('Save error')
    }
  }

  // Helper to check if updated less than 24 hours ago
  const isRecent = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime()
    return elapsed < 3600000 * 24 // 24 hours
  }

  // Find currently selected topic and note details
  let activeTopic: any = null
  let activeNote: any = null
  let activeSubjectName = ''
  let activeChapterName = ''

  for (const subItem of hierarchy) {
    for (const chItem of subItem.chapters) {
      const foundTopic = chItem.topics.find((t) => t.topic.id === selectedTopicId)
      if (foundTopic) {
        activeTopic = foundTopic.topic
        activeNote = foundTopic.note
        activeSubjectName = subItem.subject.name
        activeChapterName = chItem.chapter.name
        break
      }
    }
  }

  const isScratchpadActive = selectedTopicId === 'scratchpad'
  const selectedFileItem = sharedFiles.find((f) => `file-${f.id}` === selectedTopicId)

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
                Notes Library
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={refreshSharedResources} variant="outline" size="sm" className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-heading font-bold">
              Sync Shared Notes
            </Button>
            <Link href="/student">
              <Button variant="ghost" size="sm" className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-heading font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Side: Navigation Tree */}
        <aside className="md:col-span-4 bg-white dark:bg-[#0f0f20] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-3">
            <BookMarked className="w-5 h-5 text-[#3C32CF] dark:text-[#5146e5]" />
            <h2 className="font-heading font-extrabold text-base text-slate-900 dark:text-slate-50">Syllabus Index</h2>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
              Loading notes structure...
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Syllabus Map */}
              {hierarchy.length > 0 && (
                <div className="space-y-4">
                  {hierarchy.map((subjectItem) => (
                    <div key={subjectItem.subject.id} className="space-y-2">
                      <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {subjectItem.subject.name}
                      </h3>
                      
                      <div className="space-y-1">
                        {subjectItem.chapters.map((chItem) => {
                          const isExpanded = expandedChapters[chItem.chapter.id]
                          return (
                            <div key={chItem.chapter.id} className="space-y-1">
                              <button
                                onClick={() => toggleChapter(chItem.chapter.id)}
                                className="w-full text-left flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50 text-sm font-heading font-semibold transition-all duration-200"
                              >
                                <span className="truncate">{chItem.chapter.name}</span>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </button>

                              {isExpanded && (
                                <div className="pl-4 space-y-1 border-l border-slate-100 dark:border-slate-800/80 ml-2 py-1 animate-in fade-in duration-200">
                                  {chItem.topics.map((tItem) => {
                                    const isSelected = selectedTopicId === tItem.topic.id
                                    const isNew = isRecent(tItem.topic.updated_at)
                                    return (
                                      <button
                                        key={tItem.topic.id}
                                        onClick={() => setSelectedTopicId(tItem.topic.id)}
                                        className={`w-full text-left flex items-center justify-between p-2 rounded-lg text-xs font-sans transition-all duration-200 ${
                                          isSelected
                                            ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-semibold'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:translate-x-[2px]'
                                        }`}
                                      >
                                        <span className="truncate pr-2">{tItem.topic.name}</span>
                                        {isNew && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            New
                                          </span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shared notes files from mentors */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Mentor Shared Resources
                  </h3>
                </div>

                <div className="space-y-1">
                  {/* Notepad */}
                  <button
                    onClick={() => setSelectedTopicId('scratchpad')}
                    className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-sans transition-all duration-200 ${
                      isScratchpadActive
                        ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-bold border border-[#3C32CF]/10'
                        : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Collaborative Scratchpad</span>
                  </button>

                  {/* Uploaded Files */}
                  {sharedFiles.map((file) => {
                    const isSelected = selectedTopicId === `file-${file.id}`
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedTopicId(`file-${file.id}`)}
                        className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-sans transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#3C32CF]/5 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-[#5146e5] font-bold border border-[#3C32CF]/10'
                            : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                        <span className="truncate">{file.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </aside>

        {/* Right Side: Note Content Details */}
        <section className="md:col-span-8 space-y-6">
          {isScratchpadActive ? (
            /* Scratchpad Sync Workspace */
            <Card className="shadow-md border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] rounded-3xl overflow-hidden min-h-[400px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-900/60 p-6 md:p-8 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#3C32CF] dark:text-[#5146e5]">
                      Collaborative Scratchpad
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50 mt-1">
                      Live Notes Scratchpad
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {scratchpadStatus}
                    </span>
                    <Button onClick={handleSaveScratchpad} size="sm" className="h-9 px-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs font-sans">
                  Shared scratchpad syncs back to your mentor's dashboard. Any changes you write here are mirrored automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <textarea
                  value={scratchpadText}
                  onChange={(e) => {
                    setScratchpadText(e.target.value)
                    setScratchpadStatus('Unsaved')
                  }}
                  placeholder="Type notes or class equations here..."
                  className="w-full h-80 p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 rounded-2xl focus:outline-none focus:border-[#3C32CF] leading-relaxed resize-none"
                />
              </CardContent>
            </Card>
          ) : selectedFileItem ? (
            /* Shared Worksheet View */
            <Card className="shadow-md border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] rounded-3xl overflow-hidden min-h-[400px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-900/60 p-6 md:p-8 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#3C32CF] dark:text-[#5146e5]">
                  Shared Note File • {selectedFileItem.subject}
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
                  {selectedFileItem.title}
                </h1>
                <CardDescription className="text-xs font-sans">
                  Uploaded by Dr. Liam Sterling • {new Date(selectedFileItem.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-slate-100 flex items-center justify-center shadow-inner">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-slate-900 dark:text-slate-100">Simulated Worksheet PDF</h3>
                  <p className="text-xs text-slate-500 max-w-sm">This PDF file was pushed to your library by your tutor. Click download to store locally.</p>
                </div>
                <Link href={selectedFileItem.file_url} target="_blank">
                  <Button className="h-11 px-6 rounded-2xl bg-[#3C32CF] hover:bg-[#2f27a6] text-white font-heading font-bold shadow-md">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Download File Worksheet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : activeTopic ? (
            /* Syllabus Topic Note Details */
            <Card className="shadow-[0_8px_30px_rgb(60_50_207/0.03),0_2px_8px_rgb(0_0_0/0.01)] border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] rounded-3xl overflow-hidden min-h-[400px]">
              <CardHeader className="border-b border-slate-50 dark:border-slate-900/60 p-6 md:p-8 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#3C32CF] dark:text-[#5146e5]">
                  <span>{activeSubjectName}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-400 dark:text-slate-500">{activeChapterName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
                  {activeNote ? activeNote.title : activeTopic.name}
                </h1>
                <CardDescription className="flex items-center gap-2 pt-1 font-sans">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Syllabus updated: {new Date(activeTopic.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                {activeNote ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-650 dark:text-slate-300 font-sans leading-relaxed text-base space-y-4">
                    <p>{activeNote.content}</p>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-850 mx-auto" />
                    <p className="font-heading font-bold text-slate-400">No content notes written yet</p>
                    <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">This topic has been mapped in the syllabus, but notes are pending upload by the mentor.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-slate-100 dark:border-slate-800 p-8 text-center text-slate-400 font-sans">
              Select a topic on the left to read note sheets.
            </Card>
          )}
        </section>

      </div>
    </div>
  )
}

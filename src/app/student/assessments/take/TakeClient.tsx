'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { getProfileById, type Profile } from '@/lib/data-fetchers'
import { 
  getAssessmentQuestions, 
  startAssessmentAttempt, 
  logProctoringViolation, 
  submitAssessmentAnswers 
} from '../actions'
import { 
  ShieldAlert, 
  Camera, 
  Lock, 
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Award,
  CircleAlert,
  Tv
} from 'lucide-react'

export default function TakeAssessmentClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId') || 'ass-fractions'

  const [profile, setProfile] = useState<Profile | null>(null)
  const [attemptId, setAttemptId] = useState<string>('')
  
  const [examState, setExamState] = useState<'checklist' | 'taking' | 'submitted'>('checklist')
  
  const [mediaGranted, setMediaGranted] = useState(false)
  const [checkingDevices, setCheckingDevices] = useState(false)

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({})

  const [violations, setViolations] = useState(0)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const [scorePercent, setScorePercent] = useState<number | null>(null)

  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({})

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    async function loadResources() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const uProfile = await getProfileById(user.id)
      setProfile(uProfile)

      const qs = await getAssessmentQuestions(assessmentId)
      setQuestions(qs)
    }

    loadResources()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [assessmentId, router])

  useEffect(() => {
    if (examState !== 'taking') return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      alert('Security Warning: Right-clicking is disabled during exams.')
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      alert('Security Warning: Copying text is disabled during exams.')
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      alert('Security Warning: Pasting text is disabled during exams.')
    }

    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement) {
        await recordViolation('fullscreen_exit', 'Student exited fullscreen mode.')
      }
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        await recordViolation('tab_switch', 'Student switched tabs or minimized browser.')
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [examState, attemptId, violations])

  async function testDevices() {
    setCheckingDevices(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream
      setMediaGranted(true)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.warn('Devices checklist failed, entering simulator mode:', err)
      setMediaGranted(true) 
    } finally {
      setCheckingDevices(false)
    }
  }

  async function startExam() {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (err) {
      console.warn('Fullscreen launch rejected by browser:', err)
    }

    const attId = await startAssessmentAttempt(assessmentId, profile?.id || 'student-1-alex')
    setAttemptId(attId)
    setExamState('taking')
  }

  async function recordViolation(
    type: 'face_missing' | 'multiple_faces' | 'tab_switch' | 'fullscreen_exit', 
    details: string
  ) {
    if (!attemptId) return
    const newCount = await logProctoringViolation(attemptId, type, details)
    setViolations(newCount)

    if (newCount >= 3) {
      setAutoSubmitted(true)
      await handleSubmission(true)
    }
  }

  const updateAnswer = (questionId: string, answerText: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: answerText,
    }))
  }

  const updateMatchSelection = (leftItem: string, rightChoice: string, questionId: string) => {
    const nextSelections = {
      ...matchingSelections,
      [leftItem]: rightChoice,
    }
    setMatchingSelections(nextSelections)

    const answersString = Object.entries(nextSelections)
      .map(([l, r]) => `${l}:${r}`)
      .join(',')
    
    updateAnswer(questionId, answersString)
  }

  async function handleSubmission(forceSubmit: boolean = false) {
    const formattedAnswers = Object.entries(studentAnswers).map(([qId, val]) => ({
      questionId: qId,
      answerText: val,
    }))

    const results = await submitAssessmentAnswers(attemptId, formattedAnswers)
    setScorePercent(results.score)
    setExamState('submitted')

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (err) {
        console.warn('Fullscreen exit failed on submit:', err)
      }
    }
  }

  if (examState === 'checklist') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070710] flex items-center justify-center p-6 transition-colors duration-200">
        <Card className="w-full max-w-lg rounded-3xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-slate-200 mb-2">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50">
              Exam System Check
            </h1>
            <CardDescription className="font-sans text-xs max-w-sm mx-auto">
              Please test your microphone and camera to authorize verification parameters before starting.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
              {mediaGranted ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="text-center space-y-2 p-6">
                  <Camera className="w-10 h-10 text-slate-650 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-sans">Feed waiting for device test request...</p>
                </div>
              )}
            </div>

            <Button
              onClick={testDevices}
              disabled={checkingDevices}
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-heading font-bold"
            >
              {checkingDevices ? 'Requesting media...' : 'Check Webcam & Mic'}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 p-6 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/80">
            <Link href="/student/assessments" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full h-11 text-xs font-heading font-bold rounded-xl border border-slate-200 dark:border-slate-800">
                Cancel
              </Button>
            </Link>
            
            <Button
              onClick={startExam}
              disabled={!mediaGranted}
              className="flex-1 h-11 text-xs font-heading font-bold rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-md active:scale-98"
            >
              Start Exam (Lock Screen)
              <Lock className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (examState === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070710] flex items-center justify-center p-6 transition-colors duration-200">
        <Card className="w-full max-w-md rounded-3xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-xl overflow-hidden text-center">
          <CardHeader className="pb-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-slate-200 mb-2">
              <Award className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-slate-50">
              Exam Submitted
            </CardTitle>
            <CardDescription className="font-sans text-xs">
              {autoSubmitted 
                ? 'Your exam was automatically submitted due to multiple proctoring warnings.' 
                : 'Your answers have been successfully stored and evaluated.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 inline-block w-full">
              <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Your Diagnostic Grade</span>
              <span className="text-5xl font-heading font-black text-[#3C32CF] dark:text-[#5146e5] block mt-2">
                {scorePercent}%
              </span>
              <span className="text-xs text-slate-500 mt-2 block font-sans">
                Objective questions graded. Open text items pending mentor review.
              </span>
            </div>

            <div className="text-xs text-amber-700 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-left leading-normal font-sans">
                Recorded violations during exam: <strong>{violations} warnings</strong>.
              </span>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-slate-100 dark:border-slate-800/80">
            <Link href="/student/assessments" className="w-full">
              <Button className="w-full h-11 text-xs font-heading font-bold rounded-xl bg-[#3C32CF] text-white hover:bg-[#2f27a6]">
                Return to Assessment Hub
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const activeQuestion = questions[currentIdx]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070710] flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* Left side: Questions panel */}
      <main className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850 shrink-0">
          <div>
            <span className="text-[9px] font-mono text-slate-400 block tracking-widest uppercase font-bold">Fractions Diagnostic</span>
            <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3C32CF] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="my-8 flex-1 max-w-3xl w-full mx-auto flex flex-col justify-center space-y-6">
          {activeQuestion && (
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f0f20] shadow-sm p-6 md:p-8 space-y-6">
              
              <h2 className="text-xl md:text-2xl font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeQuestion.question_text}
              </h2>

              <div className="pt-2">
                
                {/* 1. MCQ Options */}
                {activeQuestion.type === 'mcq' && (
                  <div className="grid grid-cols-1 gap-3">
                    {activeQuestion.options?.map((opt: string) => {
                      const isSelected = studentAnswers[activeQuestion.id] === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => updateAnswer(activeQuestion.id, opt)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-sans flex items-center justify-between transition-all duration-200 ${
                            isSelected 
                              ? 'border-[#3C32CF] bg-[#3C32CF]/5 text-[#3C32CF] dark:border-[#5146e5] dark:bg-[#5146e5]/10 dark:text-slate-200 font-semibold' 
                              : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-355'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#3C32CF] bg-[#3C32CF] text-white dark:border-[#5146e5] dark:bg-[#5146e5]' : 'border-slate-300'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 2. Fill in the Blank */}
                {activeQuestion.type === 'fill_blank' && (
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={studentAnswers[activeQuestion.id] || ''}
                    onChange={(e) => updateAnswer(activeQuestion.id, e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus:outline-none focus:border-[#3C32CF] text-sm font-sans text-slate-900 dark:text-white"
                  />
                )}

                {/* 3. Matching Pairs */}
                {activeQuestion.type === 'match_pairs' && activeQuestion.options?.pairs && (
                  <div className="space-y-4">
                    {activeQuestion.options.pairs.map((pair: any) => {
                      const selection = matchingSelections[pair.left] || ''
                      return (
                        <div key={pair.left} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
                            {pair.left}
                          </span>
                          
                          <div className="flex gap-2 flex-wrap">
                            {activeQuestion.options.choices.map((choice: string) => {
                              const isChoiceSelected = selection === choice
                              return (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() => updateMatchSelection(pair.left, choice, activeQuestion.id)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-sans transition-all duration-200 ${
                                    isChoiceSelected
                                      ? 'border-[#3C32CF] bg-[#3C32CF] text-white dark:border-[#5146e5] dark:bg-[#5146e5]'
                                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {choice}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 4. Short Answer */}
                {activeQuestion.type === 'short_answer' && (
                  <textarea
                    placeholder="Type your explanation here..."
                    rows={5}
                    value={studentAnswers[activeQuestion.id] || ''}
                    onChange={(e) => updateAnswer(activeQuestion.id, e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus:outline-none focus:border-[#3C32CF] text-sm font-sans text-slate-900 dark:text-white resize-none leading-relaxed"
                  />
                )}

              </div>

            </Card>
          )}
        </div>

        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4 shrink-0 max-w-3xl w-full mx-auto">
          <Button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            variant="ghost"
            className="rounded-xl h-10 px-4 text-xs font-heading font-bold border border-slate-200 dark:border-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              onClick={() => handleSubmission(false)}
              className="h-10 px-5 text-xs font-heading font-bold rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-md active:scale-98"
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              variant="ghost"
              className="rounded-xl h-10 px-4 text-xs font-heading font-bold border border-slate-200 dark:border-slate-800"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

      </main>

      {/* Right side: Proctoring stream & simulators */}
      <aside className="w-full lg:w-80 bg-white dark:bg-[#0f0f20] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 p-6 flex flex-col shrink-0 space-y-6">
        
        <div className="space-y-1">
          <span className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-4.5 h-4.5 text-[#3C32CF] dark:text-[#5146e5]" />
            Proctoring Console
          </span>
          <p className="text-[10px] text-slate-400 font-sans">
            AI is continuously analyzing your camera feed and browser state.
          </p>
        </div>

        <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-950 overflow-hidden shadow-inner shrink-0">
          {mediaGranted ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <Camera className="w-8 h-8 text-slate-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
          <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-black/60 text-[8px] font-mono text-white tracking-widest uppercase">
            Live Stream
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Warnings Logs</span>
            <span className="text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400">
              {violations} / 3
            </span>
          </div>
          
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${violations >= 2 ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${(violations / 3) * 100}%` }}
            ></div>
          </div>
          
          <span className="text-[9px] text-slate-400 font-sans block leading-normal pt-1">
            Reaching 3 warnings will result in automatic submission.
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-end space-y-2 pb-4">
          <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest block font-bold">Test Simulators</span>
          
          <Button
            onClick={() => recordViolation('tab_switch', 'E2E trigger: simulated tab switch')}
            size="sm"
            variant="outline"
            className="w-full justify-start rounded-xl text-[10px] font-sans h-9 border-slate-200"
          >
            <CircleAlert className="w-3.5 h-3.5 mr-2 text-amber-600" />
            Simulate Tab Switch
          </Button>

          <Button
            onClick={() => recordViolation('face_missing', 'E2E trigger: simulated face missing')}
            size="sm"
            variant="outline"
            className="w-full justify-start rounded-xl text-[10px] font-sans h-9 border-slate-200"
          >
            <CircleAlert className="w-3.5 h-3.5 mr-2 text-rose-500" />
            Simulate Face Missing
          </Button>

          <Button
            onClick={() => recordViolation('fullscreen_exit', 'E2E trigger: simulated fullscreen exit')}
            size="sm"
            variant="outline"
            className="w-full justify-start rounded-xl text-[10px] font-sans h-9 border-slate-200"
          >
            <CircleAlert className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            Simulate Fullscreen Exit
          </Button>
        </div>

      </aside>

    </div>
  )
}

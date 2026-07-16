'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { getProfileById, getStudentClasses, type Profile, type ClassSession } from '@/lib/data-fetchers'
import { 
  createClassroomSession, 
  completeClassroomSession, 
  logClassroomMessage 
} from '../actions'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Send, 
  PhoneOff, 
  Circle, 
  User,
  MessageSquareCode
} from 'lucide-react'

export default function RoomClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId') || 'class-1'

  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [classDetails, setClassDetails] = useState<ClassSession | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  
  // Track mute configurations
  const [cameraActive, setCameraActive] = useState(true)
  const [micActive, setMicActive] = useState(true)

  // Recording status variables
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  // Message lists
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; role: string; text: string; time: string }[]>([])
  const [chatInput, setChatInput] = useState('')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<any>(null)

  useEffect(() => {
    async function initRoom() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      const profile = await getProfileById(user.id)
      setUserProfile(profile)

      // Find details matching class index
      const classes = await getStudentClasses(profile?.role === 'student' ? profile.id : 'student-1-alex')
      const targetClass = classes.find((c) => c.id === classId) || {
        id: classId,
        student_id: 'student-1-alex',
        mentor_id: 'mentor-liam',
        mentor_name: 'Dr. Liam Sterling',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        subject: 'Mathematics',
        status: 'scheduled' as const,
      }
      setClassDetails(targetClass)

      // Log DB sessions
      const activeId = await createClassroomSession(classId)
      setSessionId(activeId)

      // Request stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.warn('Camera stream check bypassed in call room:', err)
      }

      setChatMessages([
        {
          id: 'welcome-msg',
          sender: targetClass.mentor_name,
          role: 'mentor',
          text: `Welcome to today's ${targetClass.subject} session! Let's get started on our homework sheet.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    }

    initRoom()

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [classId, router])

  // Camera Track Toggle
  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !cameraActive
      })
    }
    setCameraActive(!cameraActive)
  }

  // Microphone Track Toggle
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !micActive
      })
    }
    setMicActive(!micActive)
  }

  // Handle messages submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !userProfile) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: userProfile.full_name,
      role: userProfile.role,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, newMessage])
    const typedText = chatInput.trim()
    setChatInput('')

    // Log to Supabase action
    await logClassroomMessage(sessionId, userProfile.id, userProfile.full_name, typedText)

    // Trigger auto-reply from mentor to verify E2E chat behavior
    if (userProfile.role === 'student') {
      setTimeout(async () => {
        const replyText = `Thanks for sharing, ${userProfile.full_name.split(' ')[0]}! Let's check the next fractions chapter notes.`
        const replyMessage = {
          id: `reply-${Date.now()}`,
          sender: classDetails?.mentor_name || 'Dr. Liam Sterling',
          role: 'mentor',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setChatMessages((prev) => [...prev, replyMessage])
        
        await logClassroomMessage(
          sessionId, 
          classDetails?.mentor_id || 'mentor-liam', 
          classDetails?.mentor_name || 'Dr. Liam Sterling', 
          replyText
        )
      }, 1500)
    }
  }

  // Start recording triggers
  const startRecording = () => {
    setIsRecording(true)
    setRecordingSeconds(0)
    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds((sec) => sec + 1)
    }, 1000)
  }

  const stopRecording = async () => {
    clearInterval(recordingIntervalRef.current)
    setIsRecording(false)
    const recUrl = `/recordings/rec-${classId}-${Date.now()}.mp4`
    await completeClassroomSession(sessionId, recUrl)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-[#5146e5]" />
          <div>
            <h1 className="font-heading font-black text-base text-white tracking-tight leading-none">
              {classDetails?.subject || 'Mathematics'} Virtual Class
            </h1>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono uppercase tracking-wider font-semibold">
              Mentor: {classDetails?.mentor_name || 'Dr. Liam Sterling'}
            </span>
          </div>
        </div>

        {/* Recording status badge */}
        <div className="flex items-center gap-4 shrink-0 font-sans text-xs">
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold animate-pulse">
              <Circle className="w-2.5 h-2.5 fill-rose-500 animate-ping" />
              <span>REC {formatTime(recordingSeconds)}</span>
            </div>
          ) : (
            <span className="text-slate-500 font-semibold">• Session Ready</span>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
            CONNECTED • SIMULATOR
          </span>
        </div>
      </header>

      {/* Workspace Grids */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* Left Side: Video frames */}
        <section className="lg:col-span-8 p-6 bg-slate-950 flex flex-col gap-6 justify-center">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            
            {/* Tutor visual box */}
            <div className="relative aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/5 text-[9px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                Incoming Stream
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#5146e5]/10 text-[#5146e5] flex items-center justify-center border-2 border-[#5146e5]/30 shadow-lg relative">
                  <User className="w-8 h-8" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
                </div>
                <div className="text-center">
                  <span className="font-heading font-black text-sm text-white block">
                    {classDetails?.mentor_name || 'Dr. Liam Sterling'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-sans font-semibold">Speaking...</span>
                </div>
              </div>
            </div>

            {/* Student visual camera box */}
            <div className="relative aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/5 text-[9px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                Local Camera
              </div>

              {cameraActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center border border-slate-700 shadow-lg">
                    <User className="w-8 h-8" />
                  </div>
                  <span className="font-heading font-black text-sm text-slate-400 block">Camera Paused</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 z-20">
                <span className="font-heading font-black text-xs text-white block">
                  {userProfile?.full_name || 'Alex Jenkins'}
                </span>
                <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold tracking-widest mt-0.5">
                  {userProfile?.role || 'student'}
                </span>
              </div>
            </div>

          </div>

          {/* Control Toolbar */}
          <div className="flex justify-center items-center gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl max-w-md mx-auto w-full shadow-lg">
            
            <Button
              onClick={toggleMic}
              variant={micActive ? 'ghost' : 'destructive'}
              className={`w-11 h-11 p-0 rounded-xl transition-all duration-200 ${micActive ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : ''}`}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              onClick={toggleCamera}
              variant={cameraActive ? 'ghost' : 'destructive'}
              className={`w-11 h-11 p-0 rounded-xl transition-all duration-200 ${cameraActive ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : ''}`}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            {userProfile?.role === 'mentor' && (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'ghost'}
                className="w-11 h-11 p-0 rounded-xl text-slate-300 hover:bg-slate-800"
              >
                <Circle className={`w-5 h-5 ${isRecording ? 'fill-current animate-pulse text-rose-500' : 'text-rose-500'}`} />
              </Button>
            )}

            <div className="w-px h-6 bg-slate-800"></div>

            <Button
              onClick={() => router.push(`/${userProfile?.role || 'student'}`)}
              variant="destructive"
              className="px-5 h-11 rounded-xl font-heading font-bold text-xs shadow-md"
            >
              Leave Call
              <PhoneOff className="w-4 h-4 ml-2" />
            </Button>

          </div>

        </section>

        {/* Right Side: Chat Pane */}
        <aside className="lg:col-span-4 bg-slate-900 border-l border-slate-800/80 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="font-heading font-black text-sm text-white flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-[#5146e5]" />
              Class Chat Room
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {chatMessages.map((msg) => {
              const isSelf = msg.sender === userProfile?.full_name
              return (
                <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 block mb-1">
                    {msg.sender} <span className="opacity-60">({msg.role})</span>
                  </span>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    isSelf 
                      ? 'bg-[#5146e5] text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-600 mt-0.5 block">{msg.time}</span>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-slate-900/60 shrink-0 flex gap-2.5">
            <input
              type="text"
              placeholder="Send message to class..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 h-10 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans text-white focus:outline-none focus:border-[#5146e5]"
            />
            <Button
              type="submit"
              className="w-10 h-10 p-0 rounded-xl bg-[#5146e5] hover:bg-[#4338ca] text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </aside>

      </div>
    </div>
  )
}

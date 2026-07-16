'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { AccessToken } from 'livekit-server-sdk'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

// Generate LiveKit token
export async function generateLiveKitToken(roomName: string, participantName: string): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    console.warn('LiveKit environment variables are missing. Using mock token.')
    return `mock-token-${roomName}-${participantName}-${Date.now()}`
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    })
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    })
    return await at.toJwt()
  } catch (err) {
    console.error('Failed to generate LiveKit JWT:', err)
    return `mock-token-${roomName}-${participantName}-${Date.now()}`
  }
}

// Create classroom session log
export async function createClassroomSession(classId: string): Promise<string> {
  const mockId = `session-${classId}-${Date.now()}`

  if (isMockEnv()) {
    console.log(`[Mock Create Classroom Session] for class ${classId}: ${mockId}`)
    return mockId
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classroom_sessions')
      .insert({
        class_id: classId,
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (err) {
    console.warn('Supabase createClassroomSession failed, using mock ID:', err)
    return mockId
  }
}

// Complete classroom session and save recording path
export async function completeClassroomSession(sessionId: string, recordingUrl: string): Promise<void> {
  if (isMockEnv()) {
    console.log(`[Mock Complete Classroom Session] ${sessionId} updated with recording ${recordingUrl}`)
    return
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('classroom_sessions')
      .update({
        recording_url: recordingUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) throw error
  } catch (err) {
    console.warn('Supabase completeClassroomSession failed:', err)
  }
}

// Log class chat messages
export async function logClassroomMessage(
  sessionId: string, 
  senderId: string, 
  senderName: string, 
  messageText: string
): Promise<void> {
  if (isMockEnv()) {
    console.log(`[Mock Classroom Chat] Session ${sessionId} | ${senderName}: ${messageText}`)
    return
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('classroom_chat_logs')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        sender_name: senderName,
        message_text: messageText,
      })

    if (error) throw error
  } catch (err) {
    console.warn('Supabase logClassroomMessage failed:', err)
  }
}

// Fetch chat history for session
export async function getClassroomMessages(sessionId: string): Promise<any[]> {
  if (isMockEnv()) {
    return []
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classroom_chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Supabase getClassroomMessages failed:', err)
    return []
  }
}

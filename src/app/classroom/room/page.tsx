import { Suspense } from 'react'
import RoomClient from './RoomClient'

export default function ClassroomRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center p-6 font-sans text-sm">Entering virtual class...</div>}>
      <RoomClient />
    </Suspense>
  )
}

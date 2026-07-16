import { Suspense } from 'react'
import TakeAssessmentClient from './TakeClient'

export default function TakeAssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#070710] flex items-center justify-center p-6 font-sans text-sm text-slate-500">Loading assessment attempt...</div>}>
      <TakeAssessmentClient />
    </Suspense>
  )
}

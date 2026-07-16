import { NextResponse } from 'next/server'
import { resetAssessmentState } from '@/app/student/assessments/actions'

export async function GET() {
  await resetAssessmentState()
  return NextResponse.json({ reset: true })
}

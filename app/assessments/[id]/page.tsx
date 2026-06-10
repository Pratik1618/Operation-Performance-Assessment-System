'use client'
// This page has been replaced by /my-tasks
import { redirect } from 'next/navigation'
export default function AssessmentDetailPage() {
  redirect('/my-tasks')
  return null
}

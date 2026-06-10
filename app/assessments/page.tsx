'use client'
// This page has been replaced by /my-tasks
import { redirect } from 'next/navigation'
export default function AssessmentsPage() {
  redirect('/my-tasks')
  return null
}

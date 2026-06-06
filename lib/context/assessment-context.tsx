'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { assessments as initialAssessments } from '@/lib/data/assessments'
import { approvals as initialApprovals } from '@/lib/data/approvals'
import type { Assessment, Approval } from '@/lib/types'

interface AssessmentContextType {
  assessments: Assessment[]
  approvals: Approval[]
  updateAssessment: (id: string, changes: Partial<Assessment>) => void
  addApproval: (approval: Approval) => void
  updateApproval: (id: string, changes: Partial<Approval>) => void
}

const AssessmentContext = createContext<AssessmentContextType | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>(() => [...initialAssessments])
  const [approvals, setApprovals] = useState<Approval[]>(() => [...initialApprovals])

  const updateAssessment = useCallback((id: string, changes: Partial<Assessment>) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    )
  }, [])

  const addApproval = useCallback((approval: Approval) => {
    setApprovals((prev) => [...prev, approval])
  }, [])

  const updateApproval = useCallback((id: string, changes: Partial<Approval>) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    )
  }, [])

  return (
    <AssessmentContext.Provider
      value={{ assessments, approvals, updateAssessment, addApproval, updateApproval }}
    >
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessmentContext() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessmentContext must be used within an AssessmentProvider')
  }
  return context
}

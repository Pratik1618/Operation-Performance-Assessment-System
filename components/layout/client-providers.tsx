'use client'

import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AssessmentProvider } from '@/lib/context/assessment-context'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <AssessmentProvider>
        {children}
      </AssessmentProvider>
    </TooltipProvider>
  )
}

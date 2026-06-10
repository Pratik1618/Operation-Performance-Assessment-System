
'use client'

import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OCRMSProvider } from '@/lib/context/ocrms-context'

import { Toaster } from '@/components/ui/sonner'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <OCRMSProvider>
        {children}
        <Toaster position="bottom-right" />
      </OCRMSProvider>
    </TooltipProvider>
  )
}

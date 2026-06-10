'use client'

import React, { Suspense } from 'react'
import { ClipboardList } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'

function AttendanceComplianceLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Attendance Compliance' }]} />

      {/* Shared Module Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-md">
            <ClipboardList className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Attendance Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Operations Attendance Hub managing shift coverage, missing punches, device verification, and escalations.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">{children}</div>
    </div>
  )
}

export default function AttendanceComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-semibold">Loading Attendance Center...</div>}>
      <AttendanceComplianceLayoutContent>{children}</AttendanceComplianceLayoutContent>
    </Suspense>
  )
}


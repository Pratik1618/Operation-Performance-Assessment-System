'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, ShieldCheck, UserCheck, Star, AlertCircle } from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'
import { AttendanceVerificationCase } from '@/lib/types'

export default function ApprovalTimelinePage() {
  const [selectedCaseId, setSelectedCaseId] = useState('CASE_006')

  const activeCase = useMemo(() => {
    return attendanceVerificationCases.find(c => c.id === selectedCaseId) || attendanceVerificationCases[0]
  }, [selectedCaseId])

  // Derive timeline steps dynamically from rating states
  const timelineSteps = useMemo(() => {
    const list: Array<{
      stage: string
      user: string
      action: string
      date: string
      remarks: string
      score?: number
      icon: any
      color: string
    }> = []

    // 1. Initial creation
    list.push({
      stage: 'Case Created',
      user: 'Biometric System',
      action: 'Auto-Trigger Absence Case',
      date: activeCase.absentDate,
      remarks: `Employee flagged absent. Assigned verification weightage: ${activeCase.weightage}`,
      icon: Clock,
      color: 'text-slate-500 bg-slate-100 dark:bg-slate-900'
    })

    // 2. OE Rating
    if (activeCase.oeRemarks || activeCase.oeRating !== undefined) {
      list.push({
        stage: 'OE Verification',
        user: 'Ravi Shankar (OE)',
        action: 'Completed Verification & Self Rated',
        date: activeCase.absentDate,
        remarks: activeCase.oeRemarks || 'Verification logged.',
        score: activeCase.oeRating,
        icon: UserCheck,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
      })
    }

    // 3. RM Rating
    if (activeCase.rmRemarks || activeCase.rmRating !== undefined) {
      list.push({
        stage: 'RM Review',
        user: 'Manoj Pillai (RM)',
        action: 'Audit Log & Score Approved',
        date: activeCase.absentDate,
        remarks: activeCase.rmRemarks || 'Review finalized.',
        score: activeCase.rmRating,
        icon: ShieldCheck,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
      })
    }

    // 4. AVP Rating
    if (activeCase.avpRemarks || activeCase.avpRating !== undefined) {
      list.push({
        stage: 'AVP Approval',
        user: 'Venkat Raman (AVP)',
        action: 'Final Verification & Score Approved',
        date: activeCase.absentDate,
        remarks: activeCase.avpRemarks || 'Final closure approved.',
        score: activeCase.avpRating,
        icon: Star,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
      })
    }

    return list
  }, [activeCase])

  return (
    <div className="grid gap-6 md:grid-cols-5 items-start">
      {/* Select Case Left Pane */}
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Select Verification Case</h3>
        <div className="space-y-3">
          {attendanceVerificationCases.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`shadow-soft border cursor-pointer hover:shadow-md transition-all ${
                selectedCaseId === c.id
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'bg-card'
              }`}
            >
              <CardContent className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.employeeName}</h4>
                  <span className="text-[10px] text-muted-foreground">{c.employeeCode}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2">
                  <span>Status: <strong className="text-slate-700 dark:text-slate-350">{c.status}</strong></span>
                  <span>Date: {c.absentDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline Right Pane */}
      <div className="md:col-span-3 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Workflow Timeline Audit</h3>
        <Card className="shadow-soft border bg-card">
          <CardHeader className="border-b p-4">
            <div className="flex justify-between items-center text-xs">
              <div>
                <h3 className="font-bold text-foreground text-sm">Case #{activeCase.id} Timeline</h3>
                <p className="text-muted-foreground mt-0.5">{activeCase.employeeName} ({activeCase.employeeCode})</p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                activeCase.status.includes('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {activeCase.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="relative border-l border-slate-250 dark:border-slate-800 pl-4 ml-3 space-y-6">
              {timelineSteps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={idx} className="relative text-xs">
                    {/* Node Icon */}
                    <span className={`absolute -left-[27px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm ${step.color}`}>
                      <Icon size={12} />
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{step.stage}</span>
                        <span className="text-[10px] text-muted-foreground">{step.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600 dark:text-slate-400">{step.user}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{step.action}</span>
                      </div>
                      <p className="text-slate-550 dark:text-slate-450 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-900/40">
                        "{step.remarks}"
                      </p>
                      {step.score !== undefined && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                          <Star size={12} /> Rating Assigned: {step.score} / 4
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

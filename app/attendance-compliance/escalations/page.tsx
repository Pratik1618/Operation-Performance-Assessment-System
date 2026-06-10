'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, UserCheck, CheckCircle2, MessageSquare } from 'lucide-react'

interface EscalatedCase {
  id: string
  employeeName: string
  employeeCode: string
  site: string
  client: string
  daysPending: number
  level: 'RM' | 'AVP'
  dateTriggered: string
  reason: string
  timeline: Array<{
    user: string
    action: string
    date: string
    comments: string
  }>
}

export default function EscalationsPage() {
  const [cases, setCases] = useState<EscalatedCase[]>([
    {
      id: 'ESC_001',
      employeeName: 'Rajesh Kumar',
      employeeCode: 'EMP4005',
      site: 'DLF Cyber Hub Delhi',
      client: 'DLF Cyber City',
      daysPending: 3,
      level: 'RM',
      dateTriggered: '2026-06-06',
      reason: 'Absenteeism Replacement Pending > 48 Hours',
      timeline: [
        { user: 'Ravi Shankar (OE)', action: 'Reported Unexcused Absence', date: '2026-06-06', comments: 'Employee not reachable on phone. No reliever available.' },
        { user: 'SLA Engine', action: 'Auto Escalate to RM', date: '2026-06-08', comments: 'System trigger: replacement not assigned within 48 hours.' }
      ]
    },
    {
      id: 'ESC_002',
      employeeName: 'Suresh Babu',
      employeeCode: 'EMP2003',
      site: 'Wipro Hinjewadi Campus',
      client: 'Wipro Technologies',
      daysPending: 6,
      level: 'AVP',
      dateTriggered: '2026-06-03',
      reason: 'No-show for night shifts & Missing punch unresolved',
      timeline: [
        { user: 'Kiran Nair (OE)', action: 'Logged Night Shift No-show', date: '2026-06-03', comments: 'Third shift skipped.' },
        { user: 'SLA Engine', action: 'Auto Escalate to RM', date: '2026-06-05', comments: 'System trigger: unresolved for 2 days.' },
        { user: 'Manoj Pillai (RM)', action: 'Requested Site Audit', date: '2026-06-07', comments: 'Checking if employee shifted projects.' },
        { user: 'SLA Engine', action: 'Auto Escalate to AVP', date: '2026-06-09', comments: 'System trigger: unresolved for 5 days.' }
      ]
    }
  ])

  const [activeCaseId, setActiveCaseId] = useState<string | null>('ESC_001')

  const activeCase = useMemo(() => {
    return cases.find(c => c.id === activeCaseId) || null
  }, [cases, activeCaseId])

  const handleResolve = (id: string) => {
    alert(`Resolving escalation case...`)
    setCases(prev => prev.filter(c => c.id !== id))
    setActiveCaseId(null)
  }

  const handleEscalateHigher = (id: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === id && c.level === 'RM') {
        return {
          ...c,
          level: 'AVP',
          reason: 'Manually escalated by Regional Manager',
          timeline: [
            ...c.timeline,
            { user: 'Manoj Pillai (RM)', action: 'Manual Escalation to AVP', date: '2026-06-09', comments: 'Requires AVP operational decision immediately.' }
          ]
        }
      }
      return c
    }))
  }

  return (
    <div className="space-y-6">
      {/* SLA flow chart */}
      <Card className="shadow-soft border bg-gradient-to-r from-slate-900 to-slate-950 text-white overflow-hidden">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold tracking-wide text-blue-400 uppercase">SLA Escalation Flow Matrix</h3>
            <p className="text-xs text-slate-300">Auto-escalation engine rules running daily at midnight across all sites.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Level 1</span>
              <p className="text-xs font-bold mt-0.5">OE Actions</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Live Log</p>
            </div>
            <ArrowRight size={14} className="text-slate-600 hidden sm:block" />
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Level 2</span>
              <p className="text-xs font-bold mt-0.5">RM Escalation</p>
              <p className="text-[9px] text-amber-500 mt-0.5">&gt; 2 Days Unresolved</p>
            </div>
            <ArrowRight size={14} className="text-slate-600 hidden sm:block" />
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] text-rose-400 font-bold uppercase">Level 3</span>
              <p className="text-xs font-bold mt-0.5">AVP Approval</p>
              <p className="text-[9px] text-rose-500 mt-0.5">&gt; 5 Days Unresolved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-5 items-start">
        {/* Escalated list */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Escalated Tickets</h3>
          <div className="space-y-3">
            {cases.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl">
                No active escalations. Excellent SLA compliance!
              </div>
            ) : (
              cases.map((c) => (
                <Card
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`shadow-soft border cursor-pointer hover:shadow-md transition-all ${
                    activeCaseId === c.id
                      ? 'border-blue-500 bg-blue-500/5 dark:border-blue-500 dark:bg-blue-950/10'
                      : 'bg-card'
                  }`}
                >
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.employeeName} ({c.employeeCode})</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        c.level === 'AVP'
                          ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        Escalated to {c.level}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Site: <strong>{c.site}</strong>
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2 mt-1">
                      <span className="flex items-center gap-1 text-rose-600 font-bold">
                        <Clock size={12} /> {c.daysPending} Days Unresolved
                      </span>
                      <span>Trigger: {c.dateTriggered}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Detailed Timeline Pane */}
        <div className="md:col-span-3">
          {activeCase ? (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Escalation Audit Trail</h3>
              <Card className="shadow-soft border bg-card overflow-hidden">
                <CardHeader className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">SLA Breach: {activeCase.employeeName}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{activeCase.reason}</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">Ticket #{activeCase.id}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-5 text-xs">
                  {/* Timeline logs */}
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-5">
                    {activeCase.timeline.map((log, index) => (
                      <div key={index} className="relative">
                        {/* Bullet point node */}
                        <span className="absolute -left-[22px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-850 dark:text-slate-200">{log.user}</span>
                            <span className="text-[10px] text-muted-foreground">{log.date}</span>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">{log.action}</p>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl mt-1.5 border border-slate-100 dark:border-slate-900/40">
                            "{log.comments}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 flex gap-2 justify-end">
                    {activeCase.level === 'RM' && (
                      <button
                        onClick={() => handleEscalateHigher(activeCase.id)}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl font-bold transition-all text-xs"
                      >
                        Escalate to AVP
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(activeCase.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-xs"
                    >
                      Resolve & Close Case
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl border-dashed">
              Select an escalated ticket from the queue to view its audit trail.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

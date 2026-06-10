'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, HelpCircle, FileText, Image as ImageIcon, AlertCircle, Calendar } from 'lucide-react'
import { attendanceRecords } from '@/lib/data/ocrms-data'
import { AttendanceRecord } from '@/lib/types'

export default function RegularizationPage() {
  const [requests, setRequests] = useState<AttendanceRecord[]>(() =>
    attendanceRecords.filter(r => r.issueType === 'regularization')
  )
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const pending = attendanceRecords.filter(r => r.issueType === 'regularization' && r.status === 'Open')
    return pending.length > 0 ? pending[0].id : null
  })

  // Selected details
  const activeRequest = useMemo(() => {
    return requests.find(r => r.id === selectedId) || null
  }, [requests, selectedId])

  const handleAction = (status: 'Regularized' | 'Rejected' | 'Clarification Required', comments: string) => {
    if (!selectedId) return

    setRequests(prev => prev.map(req => {
      if (req.id === selectedId) {
        return {
          ...req,
          status,
          remarks: comments
        }
      }
      return req
    }))
  }

  return (
    <div className="grid gap-6 md:grid-cols-5 items-start">
      {/* Requests List Pane */}
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Regularization Queue</h3>
        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl">
              No regularization requests found.
            </div>
          ) : (
            requests.map((req) => (
              <Card
                key={req.id}
                onClick={() => setSelectedId(req.id)}
                className={`shadow-soft border cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
                  selectedId === req.id
                    ? 'border-blue-500 bg-blue-500/5 dark:border-blue-500 dark:bg-blue-950/10'
                    : 'bg-card'
                }`}
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.employeeName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{req.employeeCode} · {req.shift} Shift</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                      req.status === 'Open'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/25 dark:text-rose-400'
                        : req.status === 'Regularized'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    Reason: <strong>{req.reason}</strong>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2 mt-1">
                    <span>Site: <strong className="text-slate-600 dark:text-slate-400 truncate max-w-[120px] inline-block align-bottom">{req.site}</strong></span>
                    <span>Date: {req.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Review Details Pane */}
      <div className="md:col-span-3">
        {activeRequest ? (
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Review Request Panel</h3>
            <Card className="shadow-soft border bg-card overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/60 border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{activeRequest.employeeName}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Code: {activeRequest.employeeCode} · Submitted on {activeRequest.submittedDate || activeRequest.date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    activeRequest.status === 'Open'
                      ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/25 dark:text-rose-400'
                      : activeRequest.status === 'Regularized'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    {activeRequest.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-5 text-xs">
                {/* Details list */}
                <div className="grid gap-3 sm:grid-cols-2 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border">
                  <div>
                    <p className="text-muted-foreground">Site Address:</p>
                    <p className="font-semibold text-foreground mt-0.5">{activeRequest.site}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Client Name:</p>
                    <p className="font-semibold text-foreground mt-0.5">{activeRequest.client}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requested Date & Shift:</p>
                    <p className="font-semibold text-foreground mt-0.5">{activeRequest.date} ({activeRequest.shift} Shift)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reason category:</p>
                    <span className="inline-block mt-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      {activeRequest.reason}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-muted-foreground">Employee Explanation:</h4>
                  <p className="p-3 bg-muted/40 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    "{activeRequest.remarks || 'No explanation remarks provided by employee.'}"
                  </p>
                </div>

                {/* Evidence Attachment */}
                {activeRequest.evidenceUrl && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-muted-foreground">Uploaded Evidence Proof:</h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                          {activeRequest.evidenceUrl.endsWith('.jpg') || activeRequest.evidenceUrl.endsWith('.png') ? (
                            <ImageIcon size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{activeRequest.evidenceUrl}</p>
                          <p className="text-[10px] text-muted-foreground">Image Evidence · 185 KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Opening preview for ${activeRequest.evidenceUrl}...`)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-950 hover:bg-slate-50 border rounded-lg px-3 py-1.5 transition-all shadow-sm"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                )}

                {/* Decision Panel */}
                {activeRequest.status === 'Open' && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-bold text-muted-foreground">Supervisor Decision Comments:</h4>
                    <textarea
                      id="decision-comments"
                      placeholder="Add approval or rejection remarks here..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 text-foreground text-xs"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          const commentsEl = document.getElementById('decision-comments') as HTMLTextAreaElement
                          handleAction('Clarification Required', commentsEl?.value || 'Clarification needed.')
                        }}
                        className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <HelpCircle size={14} /> Clarification
                      </button>
                      <button
                        onClick={() => {
                          const commentsEl = document.getElementById('decision-comments') as HTMLTextAreaElement
                          handleAction('Rejected', commentsEl?.value || 'Rejected request.')
                        }}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <X size={14} /> Reject Request
                      </button>
                      <button
                        onClick={() => {
                          const commentsEl = document.getElementById('decision-comments') as HTMLTextAreaElement
                          handleAction('Regularized', commentsEl?.value || 'Approved and regularized.')
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <Check size={14} /> Approve & Regularize
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl border-dashed">
            Select a regularization request from the list to review details.
          </div>
        )}
      </div>
    </div>
  )
}

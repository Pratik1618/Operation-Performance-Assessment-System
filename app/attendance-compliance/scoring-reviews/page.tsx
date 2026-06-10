'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Shield, Award, HelpCircle, Check, X, ArrowRight, CornerUpLeft } from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'
import { AttendanceVerificationCase } from '@/lib/types'

export default function ScoringReviewsPage() {
  const [cases, setCases] = useState<AttendanceVerificationCase[]>(() => attendanceVerificationCases)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('CASE_004')

  const activeCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || null
  }, [cases, selectedCaseId])

  // Form states for active case
  const [oeRating, setOeRating] = useState(4)
  const [oeRemarks, setOeRemarks] = useState('')
  const [rmRating, setRmRating] = useState(4)
  const [rmRemarks, setRmRemarks] = useState('')
  const [avpRating, setAvpRating] = useState(4)
  const [avpRemarks, setAvpRemarks] = useState('')

  // Update local states when active case changes
  React.useEffect(() => {
    if (activeCase) {
      setOeRating(activeCase.oeRating ?? 4)
      setOeRemarks(activeCase.oeRemarks ?? '')
      setRmRating(activeCase.rmRating ?? 4)
      setRmRemarks(activeCase.rmRemarks ?? '')
      setAvpRating(activeCase.avpRating ?? 4)
      setAvpRemarks(activeCase.avpRemarks ?? '')
    }
  }, [activeCase])

  const handleOeSubmit = () => {
    if (!selectedCaseId) return
    setCases(prev => prev.map(c => {
      if (c.id === selectedCaseId) {
        return {
          ...c,
          status: 'OE Submitted',
          oeRating,
          oeRemarks
        }
      }
      return c
    }))
    alert('OE Self Rating submitted to Regional Manager.')
  }

  const handleRmAction = (action: 'approve' | 'reject' | 'send_back') => {
    if (!selectedCaseId) return
    setCases(prev => prev.map(c => {
      if (c.id === selectedCaseId) {
        if (action === 'approve') {
          return {
            ...c,
            status: 'RM Reviewed',
            rmRating,
            rmRemarks
          }
        } else if (action === 'send_back') {
          return {
            ...c,
            status: 'Verification Pending',
            oeRemarks: `Returned by RM: ${rmRemarks}`
          }
        } else {
          return {
            ...c,
            status: 'Closed',
            rmRemarks: `Rejected by RM: ${rmRemarks}`,
            finalScore: 0
          }
        }
      }
      return c
    }))
    alert(`RM action [${action}] recorded successfully.`)
  }

  const handleAvpAction = (action: 'approve' | 'reopen') => {
    if (!selectedCaseId) return
    setCases(prev => prev.map(c => {
      if (c.id === selectedCaseId) {
        if (action === 'approve') {
          return {
            ...c,
            status: 'AVP Approved',
            avpRating,
            avpRemarks,
            finalScore: Math.round((c.oeRating! + c.rmRating! + avpRating) / 3)
          }
        } else {
          return {
            ...c,
            status: 'Verification Pending',
            rmRemarks: `Reopened by AVP: ${avpRemarks}`
          }
        }
      }
      return c
    }))
    alert(`AVP action [${action}] recorded successfully.`)
  }

  return (
    <div className="grid gap-6 md:grid-cols-5 items-start">
      {/* Cases Queue */}
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Scoring Workflow Queue</h3>
        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          {cases.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`shadow-soft border cursor-pointer hover:shadow-md transition-all ${
                selectedCaseId === c.id
                  ? 'border-blue-500 bg-blue-500/5 dark:border-blue-500'
                  : 'bg-card'
              }`}
            >
              <CardContent className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.employeeName} ({c.employeeCode})</h4>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                    c.status === 'Verification Pending'
                      ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                      : c.status === 'AVP Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t">
                  <span>Weightage: <strong>{c.weightage}</strong></span>
                  {c.finalScore !== undefined ? (
                    <span className="font-bold text-emerald-600">Score: {c.finalScore} / 4</span>
                  ) : (
                    <span>Score: Pending</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review details */}
      <div className="md:col-span-3">
        {activeCase ? (
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Rating Workspace</h3>
            <Card className="shadow-soft border bg-card">
              <CardHeader className="border-b p-4 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{activeCase.employeeName} ({activeCase.employeeCode})</h3>
                    <p className="text-muted-foreground mt-0.5">{activeCase.designation} · {activeCase.site}</p>
                  </div>
                  <span className="font-bold text-slate-500">Weightage: {activeCase.weightage}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6 text-xs">
                {/* Stage 1: OE */}
                <div className="space-y-3 border-b pb-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Star size={16} className="text-blue-500" />
                    Stage 1: OE Self-Rating
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground">Self Rating (0-4):</label>
                      <select
                        value={oeRating}
                        onChange={(e) => setOeRating(Number(e.target.value))}
                        disabled={activeCase.status !== 'Verification Pending'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      >
                        {[0, 1, 2, 3, 4].map(v => (
                          <option key={v} value={v}>{v} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-muted-foreground">OE Remarks:</label>
                      <input
                        type="text"
                        placeholder="Enter rating remarks..."
                        value={oeRemarks}
                        onChange={(e) => setOeRemarks(e.target.value)}
                        disabled={activeCase.status !== 'Verification Pending'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      />
                    </div>
                  </div>
                  {activeCase.status === 'Verification Pending' && (
                    <button
                      onClick={handleOeSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-bold transition-all hover:scale-102 active:scale-95 text-[11px]"
                    >
                      Submit for Review
                    </button>
                  )}
                </div>

                {/* Stage 2: RM */}
                <div className="space-y-3 border-b pb-4">
                  <h4 className={`font-bold flex items-center gap-1.5 ${
                    activeCase.status === 'Verification Pending' ? 'text-slate-400 opacity-60' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    <Shield size={16} className="text-amber-500" />
                    Stage 2: Regional Manager Review
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground">RM Rating (0-4):</label>
                      <select
                        value={rmRating}
                        onChange={(e) => setRmRating(Number(e.target.value))}
                        disabled={activeCase.status !== 'OE Submitted'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      >
                        {[0, 1, 2, 3, 4].map(v => (
                          <option key={v} value={v}>{v} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-muted-foreground">RM Remarks:</label>
                      <input
                        type="text"
                        placeholder="Enter RM remarks..."
                        value={rmRemarks}
                        onChange={(e) => setRmRemarks(e.target.value)}
                        disabled={activeCase.status !== 'OE Submitted'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      />
                    </div>
                  </div>
                  {activeCase.status === 'OE Submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRmAction('approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-bold transition-all text-[11px] flex items-center gap-1"
                      >
                        <Check size={14} /> Approve & Score
                      </button>
                      <button
                        onClick={() => handleRmAction('send_back')}
                        className="bg-slate-100 hover:bg-slate-200 border rounded-xl px-4 py-2 font-bold text-slate-700 transition-all text-[11px] flex items-center gap-1"
                      >
                        <CornerUpLeft size={14} /> Send Back
                      </button>
                      <button
                        onClick={() => handleRmAction('reject')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl px-4 py-2 font-bold transition-all text-[11px] flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Stage 3: AVP */}
                <div className="space-y-3">
                  <h4 className={`font-bold flex items-center gap-1.5 ${
                    activeCase.status !== 'RM Reviewed' && activeCase.status !== 'AVP Approved' ? 'text-slate-400 opacity-60' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    <Award size={16} className="text-emerald-500" />
                    Stage 3: AVP Operations Review
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground">AVP Rating (0-4):</label>
                      <select
                        value={avpRating}
                        onChange={(e) => setAvpRating(Number(e.target.value))}
                        disabled={activeCase.status !== 'RM Reviewed'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      >
                        {[0, 1, 2, 3, 4].map(v => (
                          <option key={v} value={v}>{v} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-muted-foreground">AVP Remarks:</label>
                      <input
                        type="text"
                        placeholder="Enter AVP final remarks..."
                        value={avpRemarks}
                        onChange={(e) => setAvpRemarks(e.target.value)}
                        disabled={activeCase.status !== 'RM Reviewed'}
                        className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                      />
                    </div>
                  </div>
                  {activeCase.status === 'RM Reviewed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAvpAction('approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-bold transition-all text-[11px] flex items-center gap-1"
                      >
                        <Check size={14} /> Final Approve
                      </button>
                      <button
                        onClick={() => handleAvpAction('reopen')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl px-4 py-2 font-bold transition-all text-[11px] flex items-center gap-1"
                      >
                        <CornerUpLeft size={14} /> Reopen Case
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl border-dashed">
            Select a case from the queue to start verification scoring.
          </div>
        )}
      </div>
    </div>
  )
}

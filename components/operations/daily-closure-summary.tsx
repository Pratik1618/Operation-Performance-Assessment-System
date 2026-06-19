'use client'

import {
  Building2, Clock, CheckCircle2, AlertTriangle, Info, Camera, Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DailyClosureReportData } from '@/lib/types'
import {
  cleanedAreaLabels, cleaningFrequencyLabels, completionStatusLabels,
  incompletionReasonLabels, dailyIssueLabels, finalShiftStatusLabels
} from '@/lib/data/daily-closure-data'

interface DailyClosureSummaryProps {
  data: DailyClosureReportData
  siteName: string
  clientName?: string
  supervisorName: string
}

export default function DailyClosureSummary({ data, siteName, clientName, supervisorName }: DailyClosureSummaryProps) {
  const hasIssues = data.issuesNoticed.length > 0 && !data.issuesNoticed.includes('no_issues')
  const incompleteWork = data.completionStatus === 'not_completed' || data.completionStatus === 'partially_completed'

  return (
    <div className="space-y-4">
      {/* Header Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Site / Client</p>
          <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{siteName}</p>
          {clientName && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{clientName}</p>}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Supervisor / OE</p>
          <p className="text-xs font-bold text-slate-800 mt-1">{supervisorName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Shift Closure</p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border shadow-soft rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-800">Daily Closure Details</h4>
        </div>
        <CardContent className="p-0 divide-y divide-slate-100 text-xs">
          
          {/* Q1: Cleaned Areas */}
          <div className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Building2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-700">Areas Cleaned & Serviced:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.cleanedAreas.map(area => (
                    <span key={area} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-semibold text-[10px] border border-indigo-100">
                      {area === 'other' ? data.cleanedAreasOther || 'Other' : cleanedAreaLabels[area]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Q2: Frequency */}
          <div className="p-4 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-700">Cleaning Frequency:</span>
              <span className="font-semibold text-slate-600 ml-auto">
                {data.cleaningFrequency ? cleaningFrequencyLabels[data.cleaningFrequency] : 'N/A'}
              </span>
            </div>
          </div>

          {/* Q3: Completion Status */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className={`${incompleteWork ? 'text-amber-500' : 'text-emerald-500'} mt-0.5 shrink-0`} />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Work Completion:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${incompleteWork ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {data.completionStatus ? completionStatusLabels[data.completionStatus] : 'N/A'}
                  </span>
                </div>
                
                {incompleteWork && data.incompletionReasons.length > 0 && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                    <p className="text-[10px] font-bold text-amber-800 uppercase mb-1.5">Reasons for Incompletion:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700 font-medium">
                      {data.incompletionReasons.map(r => (
                        <li key={r}>{r === 'other' ? data.incompletionReasonsOther || 'Other' : incompletionReasonLabels[r]}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Q4: Issues Noticed */}
          <div className="p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className={`${hasIssues ? 'text-rose-500' : 'text-emerald-500'} mt-0.5 shrink-0`} />
              <div className="w-full">
                <span className="font-bold text-slate-700">Issues Noticed:</span>
                {hasIssues ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {data.issuesNoticed.map(issue => (
                      <span key={issue} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-md font-semibold text-[10px] border border-rose-100">
                        {issue === 'other' ? data.issuesOther || 'Other' : dailyIssueLabels[issue]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="ml-2 font-semibold text-emerald-600">No issues reported</span>
                )}

                {/* Photos */}
                {hasIssues && data.issuePhotos && data.issuePhotos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <Camera size={12} /> Issue Photos ({data.issuePhotos.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.issuePhotos.map(p => (
                        <div key={p.id} className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center border text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Q5: Final Status */}
          <div className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Final Shift Status:</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 text-[10px]">
                    {data.finalStatus ? finalShiftStatusLabels[data.finalStatus] : 'N/A'}
                  </span>
                </div>
                
                {data.additionalComments && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Additional Comments:</p>
                    <p className="text-slate-700 italic">"{data.additionalComments}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import {
  Users, AlertTriangle, Building2, MessageSquare, Briefcase, CalendarClock,
  TrendingUp, Flag, FileText, CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { MOMReportData } from '@/lib/types'
import {
  sentimentLabels, discussionTopicLabels, momIssueLabels,
  opportunityTypeLabels, outcomeLabels
} from '@/lib/data/mom-report-data'

interface MOMSummaryProps {
  data: MOMReportData
  siteName: string
  clientName: string
  supervisorName: string
}

export default function MOMSummary({ data, siteName, clientName, supervisorName }: MOMSummaryProps) {
  if (!data.clientMet) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border rounded-xl p-4">
          <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
            <Users size={32} className="text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Client Interaction</h3>
              <p className="text-[10px] text-slate-500 mt-1">
                The client or branch manager was not available during this visit to {siteName}.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sentiment = data.sentiment ? sentimentLabels[data.sentiment] : null
  const outcome = data.outcome ? outcomeLabels[data.outcome] : null

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Minutes of Meeting Summary</p>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">{siteName}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{clientName} · {data.meetingDate} · {supervisorName}</p>
          </div>
          {sentiment && (
            <div className="flex flex-col items-center bg-white px-3 py-1.5 rounded-xl border shadow-sm">
              <span className="text-2xl">{sentiment.emoji}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{sentiment.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Meeting Details */}
      <Card className="border rounded-xl overflow-hidden">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
          <Building2 size={12} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-700">Meeting Details</span>
        </div>
        <CardContent className="p-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-slate-400 font-bold block">Client Representative</span>
              <span className="font-semibold text-slate-700">{data.clientRepName || '—'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold block">Designation</span>
              <span className="font-semibold text-slate-700">{data.clientDesignation || '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4 & 5: Topics & Issues */}
      <Card className="border rounded-xl overflow-hidden">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
          <FileText size={12} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-700">Discussion & Issues</span>
        </div>
        <CardContent className="p-3 space-y-3 text-xs">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">Topics Discussed</p>
            <div className="flex flex-wrap gap-1">
              {data.topics.length > 0 ? data.topics.map(t => (
                <span key={t} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded">
                  {discussionTopicLabels[t]}
                </span>
              )) : <span className="text-slate-400 italic text-[10px]">None selected</span>}
            </div>
          </div>
          
          <div className="border-t pt-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">Issues Raised</p>
            {data.issuesRaised ? (
              <div className="flex flex-wrap gap-1">
                {data.issues.map(i => (
                  <span key={i} className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                    {momIssueLabels[i]}
                  </span>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={10} /> No issues raised
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Action Items */}
      {data.actionRequired && data.actionItems.length > 0 && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-700">Action Items ({data.actionItems.length})</span>
          </div>
          <CardContent className="p-3">
            <div className="space-y-1.5">
              {data.actionItems.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 p-2 rounded-lg border text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">#{idx + 1} {item.description}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                      item.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                      item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{item.priority}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">Assigned: {item.assignedTo} · Due: {item.targetDate || '—'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 7: Business Opportunity */}
      {data.opportunityDiscussed && data.opportunity.types.length > 0 && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-emerald-50/50 border-b border-emerald-100 px-3 py-2 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-700">Business Opportunity</span>
            {data.opportunity.value && (
              <span className={`ml-auto text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                data.opportunity.value === 'high' ? 'bg-emerald-100 text-emerald-800' :
                data.opportunity.value === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {data.opportunity.value} Value
              </span>
            )}
          </div>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-1">
              {data.opportunity.types.map(t => (
                <span key={t} className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {opportunityTypeLabels[t]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 8: Summary & Follow-up */}
      <div className="grid grid-cols-1 gap-4">
        {data.summary && (
          <div className="bg-slate-50 border rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase size={12} className="text-slate-400" />
              <p className="text-[9px] font-bold text-slate-500 uppercase">Meeting Summary</p>
            </div>
            <p className="text-xs text-slate-700 italic">"{data.summary}"</p>
          </div>
        )}
      </div>

      {/* Footer Outcomes */}
      <div className="flex items-center gap-2">
        {data.followupRequired && (
          <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <CalendarClock size={16} className="text-blue-500 mx-auto mb-1" />
            <p className="text-[9px] font-bold text-blue-600 uppercase">Follow-up</p>
            <p className="text-xs font-bold text-blue-800 mt-0.5">{data.followupDate}</p>
          </div>
        )}
        <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
          <Flag size={16} className="text-indigo-500 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-indigo-600 uppercase">Outcome</p>
          <p className="text-xs font-bold text-indigo-800 mt-0.5">{outcome || '—'}</p>
        </div>
      </div>
    </div>
  )
}

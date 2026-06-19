import { ShieldCheck, CheckCircle2, AlertCircle, Calendar, User, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { FinalClosingReportData } from '@/lib/types'

interface FinalClosingSummaryProps {
  data: FinalClosingReportData
  siteName: string
  clientName: string
  supervisorName: string
}

export default function FinalClosingSummary({ data, siteName, clientName, supervisorName }: FinalClosingSummaryProps) {
  if (!data || !data.queryResolutions) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <AlertCircle size={24} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-600">No Final Closing data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400 opacity-20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black tracking-widest text-indigo-200 uppercase flex items-center gap-1.5 mb-1">
              <ShieldCheck size={14} /> Final Closing Report
            </p>
            <h2 className="text-xl font-bold">{siteName}</h2>
            <p className="text-xs text-indigo-100 font-medium mt-0.5">{clientName}</p>
          </div>
          
          <div className="flex gap-4 items-center bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold mb-0.5">Reported By</p>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <p className="text-xs font-bold text-white">{supervisorName}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold mb-0.5">Original Visit</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-indigo-200" />
                <p className="text-xs font-bold text-white">{data.visitDate}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold mb-0.5">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                data.overallStatus === 'fully_resolved' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' :
                data.overallStatus === 'partially_resolved' ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-100 border border-rose-500/30'
              }`}>
                {data.overallStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.queryResolutions.map((res, i) => (
          <Card key={res.actionId} className={`border overflow-hidden ${
            res.resolutionStatus === 'resolved' ? 'border-emerald-200 shadow-sm' : 'border-slate-200'
          }`}>
            <div className={`px-4 py-2 border-b flex items-center justify-between ${
              res.resolutionStatus === 'resolved' ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-white border rounded w-5 h-5 flex items-center justify-center text-[10px] text-slate-500">{i + 1}</span>
                {res.issue}
              </p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                res.resolutionStatus === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                {res.resolutionStatus}
              </span>
            </div>
            
            <CardContent className="p-4 bg-white grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Resolution Remarks</Label>
                <p className="text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-h-[40px]">
                  {res.resolutionRemarks || <span className="text-slate-400 italic">No remarks provided.</span>}
                </p>
                <p className="text-[9px] font-semibold text-slate-400 mt-2">Assigned To: <span className="text-slate-600">{res.assignedTo}</span></p>
              </div>

              {res.evidencePhotoId && (
                <div className="space-y-1 text-right">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Evidence</Label>
                  <div className="w-16 h-16 rounded-xl border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {data.queryResolutions.length === 0 && (
          <div className="text-center p-8 bg-slate-50 border rounded-xl">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">No Open Queries</p>
          </div>
        )}
      </div>

      {data.closingRemarks && (
        <Card className="border shadow-none bg-slate-50/50">
          <CardContent className="p-4 space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><AlertCircle size={12}/> Overall Closing Remarks</Label>
            <p className="text-xs font-semibold text-slate-700">{data.closingRemarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

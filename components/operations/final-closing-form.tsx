'use client'

import { useState, useCallback, useMemo } from 'react'
import { CheckCircle2, Camera, Trash2, ShieldCheck, AlertCircle, Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { FinalClosingReportData, QueryResolution, CorrectiveAction } from '@/lib/types'

interface FinalClosingFormProps {
  taskId: string
  siteName: string
  supervisorName: string
  // For the UI to mock the list of open queries, we pass them in if this is the first time
  openQueries?: CorrectiveAction[] 
  onSubmit: (data: FinalClosingReportData) => void
  onSaveDraft: (data: FinalClosingReportData) => void
  initialData?: Partial<FinalClosingReportData>
  disabled?: boolean
}

export default function FinalClosingForm({
  taskId, siteName, supervisorName, openQueries = [], onSubmit, onSaveDraft, initialData, disabled = false
}: FinalClosingFormProps) {

  const [data, setData] = useState<FinalClosingReportData>(() => {
    if (initialData?.queryResolutions) {
      return initialData as FinalClosingReportData
    }
    // Initialize from openQueries
    const initialResolutions: QueryResolution[] = openQueries.map(q => ({
      actionId: q.id,
      issue: q.issue,
      assignedTo: q.assignedTo,
      resolutionStatus: 'unresolved',
      resolutionRemarks: ''
    }))
    return {
      originalSiteVisitTaskId: 'MOCK_SITE_VISIT_ID',
      visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'), // 7 days ago
      queryResolutions: initialResolutions,
      overallStatus: 'unresolved',
      closingRemarks: ''
    }
  })

  // Computed status based on resolutions
  const computedStatus = useMemo(() => {
    if (data.queryResolutions.length === 0) return 'fully_resolved'
    const resolvedCount = data.queryResolutions.filter(r => r.resolutionStatus === 'resolved').length
    if (resolvedCount === data.queryResolutions.length) return 'fully_resolved'
    if (resolvedCount > 0) return 'partially_resolved'
    return 'unresolved'
  }, [data.queryResolutions])

  const updateResolution = useCallback((actionId: string, updates: Partial<QueryResolution>) => {
    setData(prev => ({
      ...prev,
      queryResolutions: prev.queryResolutions.map(r => r.actionId === actionId ? { ...r, ...updates } : r)
    }))
  }, [])

  const simulatePhotoUpload = useCallback((actionId: string) => {
    const photoId = `PHT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    updateResolution(actionId, { evidencePhotoId: photoId })
    toast.success('Photo Uploaded', { description: 'Resolution evidence attached.' })
  }, [updateResolution])

  const removePhoto = useCallback((actionId: string) => {
    updateResolution(actionId, { evidencePhotoId: undefined })
  }, [updateResolution])

  const handleSubmit = () => {
    if (data.queryResolutions.length === 0) {
      toast.error('Validation Error', { description: 'No queries to resolve.' })
      return
    }

    // Require remarks for unresolved queries
    for (const res of data.queryResolutions) {
      if (res.resolutionStatus === 'unresolved' && !res.resolutionRemarks.trim()) {
        toast.error('Validation Error', { description: `Please provide remarks for unresolved query: "${res.issue}"` })
        return
      }
    }

    onSubmit({
      ...data,
      overallStatus: computedStatus
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} /> Final Closing Report (7-Day Follow-up)
          </p>
          <h3 className="text-base font-bold text-slate-800 mt-1">{siteName}</h3>
        </div>
        <div className="text-left sm:text-right flex items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Original Visit</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{data.visitDate}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><User size={12}/> OE</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{supervisorName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            Open Queries / Corrective Actions
          </h4>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            computedStatus === 'fully_resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            computedStatus === 'partially_resolved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {computedStatus.replace('_', ' ')}
          </span>
        </div>

        {data.queryResolutions.length === 0 ? (
          <Card className="border border-dashed shadow-none bg-slate-50">
            <CardContent className="p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Open Queries</p>
              <p className="text-xs text-slate-500">There were no pending issues reported in the original site visit.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.queryResolutions.map((res, index) => (
              <Card key={res.actionId} className={`border transition-all overflow-hidden ${
                res.resolutionStatus === 'resolved' ? 'border-emerald-200 shadow-sm' : 'border-slate-200 shadow-soft'
              }`}>
                <div className={`px-4 py-2 border-b flex items-center justify-between ${
                  res.resolutionStatus === 'resolved' ? 'bg-emerald-50' : 'bg-slate-50'
                }`}>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-white border rounded w-5 h-5 flex items-center justify-center text-[10px] text-slate-500">{index + 1}</span>
                    {res.issue}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border">
                    Assigned: {res.assignedTo}
                  </p>
                </div>
                
                <CardContent className="p-4 bg-white space-y-4">
                  {/* Status Toggle */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => updateResolution(res.actionId, { resolutionStatus: 'resolved' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        res.resolutionStatus === 'resolved'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                      }`}
                    >
                      Resolved
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => updateResolution(res.actionId, { resolutionStatus: 'unresolved' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        res.resolutionStatus === 'unresolved'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
                      }`}
                    >
                      Unresolved
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                    {/* Remarks */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Resolution Remarks {res.resolutionStatus === 'unresolved' && <span className="text-rose-500">*</span>}</Label>
                      <textarea
                        value={res.resolutionRemarks}
                        onChange={(e) => updateResolution(res.actionId, { resolutionRemarks: e.target.value })}
                        disabled={disabled}
                        placeholder={res.resolutionStatus === 'resolved' ? "Describe how this was resolved..." : "Reason for delay / next steps..."}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[60px]"
                      />
                    </div>

                    {/* Evidence Photo */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Evidence Photo</Label>
                      <div>
                        {res.evidencePhotoId ? (
                          <div className="relative w-16 h-16 rounded-xl border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center group overflow-hidden">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => removePhoto(res.actionId)}
                                className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => simulatePhotoUpload(res.actionId)}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                          >
                            <Camera size={16} />
                            <span className="text-[8px] font-bold mt-0.5">Upload</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-1.5 pt-2">
          <Label className="text-xs font-bold text-slate-700">Overall Closing Remarks <span className="text-[10px] font-normal text-slate-500">(Optional)</span></Label>
          <textarea
            value={data.closingRemarks}
            onChange={(e) => setData(prev => ({ ...prev, closingRemarks: e.target.value }))}
            disabled={disabled}
            placeholder="Any overall observations..."
            className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px]"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-[10px] text-slate-400">
          Ensure all issues are addressed before submitting.
        </div>
        <div className="flex gap-2">
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSaveDraft({ ...data, overallStatus: computedStatus })}
              className="h-10 px-5 rounded-xl text-xs font-bold border-slate-200"
            >
              Save Draft
            </Button>
          )}
          {!disabled && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-10 px-6 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md border-0 gap-2"
            >
              <CheckCircle2 size={16} /> Submit Closing Report
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, Camera, Clock, Building2, AlertTriangle, ShieldCheck, Trash2, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type {
  DailyClosureReportData, CleanedArea, CleaningFrequency,
  WorkCompletionStatus, IncompletionReason, DailyIssue, FinalShiftStatus,
  PhotoDoc
} from '@/lib/types'
import {
  createEmptyDailyClosureReport,
  cleanedAreaLabels, cleaningFrequencyLabels, completionStatusLabels,
  incompletionReasonLabels, dailyIssueLabels, finalShiftStatusLabels
} from '@/lib/data/daily-closure-data'

interface DailyClosureFormProps {
  taskId: string
  siteName: string
  supervisorName: string
  onSubmit: (data: DailyClosureReportData) => void
  onSaveDraft: (data: DailyClosureReportData) => void
  initialData?: Partial<DailyClosureReportData>
  disabled?: boolean
}

export default function DailyClosureForm({
  taskId, siteName, supervisorName, onSubmit, onSaveDraft, initialData, disabled = false
}: DailyClosureFormProps) {
  const [data, setData] = useState<DailyClosureReportData>(() => {
    const empty = createEmptyDailyClosureReport()
    return initialData ? { ...empty, ...initialData } : empty
  })

  // ── Updaters ──
  const updateField = useCallback(<K extends keyof DailyClosureReportData>(key: K, value: DailyClosureReportData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleArea = useCallback((area: CleanedArea) => {
    setData(prev => ({
      ...prev,
      cleanedAreas: prev.cleanedAreas.includes(area)
        ? prev.cleanedAreas.filter(a => a !== area)
        : [...prev.cleanedAreas, area]
    }))
  }, [])

  const toggleReason = useCallback((reason: IncompletionReason) => {
    setData(prev => ({
      ...prev,
      incompletionReasons: prev.incompletionReasons.includes(reason)
        ? prev.incompletionReasons.filter(r => r !== reason)
        : [...prev.incompletionReasons, reason]
    }))
  }, [])

  const toggleIssue = useCallback((issue: DailyIssue) => {
    setData(prev => {
      // If user selects "no_issues", clear everything else
      if (issue === 'no_issues') {
        return { ...prev, issuesNoticed: prev.issuesNoticed.includes('no_issues') ? [] : ['no_issues'] }
      }
      // Otherwise remove "no_issues" and toggle the selected issue
      const withoutNoIssues = prev.issuesNoticed.filter(i => i !== 'no_issues')
      return {
        ...prev,
        issuesNoticed: withoutNoIssues.includes(issue)
          ? withoutNoIssues.filter(i => i !== issue)
          : [...withoutNoIssues, issue]
      }
    })
  }, [])

  const simulatePhotoUpload = useCallback(() => {
    const newPhoto: PhotoDoc = {
      id: `PHT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category: 'issue_photo' as any,
      fileName: `issue_photo_${Date.now().toString().slice(-4)}.jpg`,
      isMandatory: false,
    }
    setData(prev => ({ ...prev, issuePhotos: [...prev.issuePhotos, newPhoto] }))
    toast.success('Photo Uploaded', { description: 'Issue documentation attached.' })
  }, [])

  const removePhoto = useCallback((id: string) => {
    setData(prev => ({ ...prev, issuePhotos: prev.issuePhotos.filter(p => p.id !== id) }))
  }, [])

  // ── Handlers ──
  const handleSubmit = () => {
    // Basic validations
    if (data.cleanedAreas.length === 0) {
      toast.error('Validation Error', { description: 'Please select at least one cleaned area.' })
      return
    }
    if (!data.cleaningFrequency) {
      toast.error('Validation Error', { description: 'Please select cleaning frequency.' })
      return
    }
    if (!data.completionStatus) {
      toast.error('Validation Error', { description: 'Please indicate if all assigned work was completed.' })
      return
    }
    if (data.completionStatus === 'not_completed' || data.completionStatus === 'partially_completed') {
      if (data.incompletionReasons.length === 0) {
        toast.error('Validation Error', { description: 'Please provide a reason for incomplete work.' })
        return
      }
    }
    if (data.issuesNoticed.length === 0) {
      toast.error('Validation Error', { description: 'Please select if any issues were noticed.' })
      return
    }
    if (!data.finalStatus) {
      toast.error('Validation Error', { description: 'Please select the final shift status.' })
      return
    }

    onSubmit(data)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} /> Daily Closure Report
          </p>
          <h3 className="text-base font-bold text-slate-800 mt-1">{siteName}</h3>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Supervisor</p>
          <p className="text-sm font-bold text-slate-800">{supervisorName}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Q1: Cleaned Areas */}
        <Card className="border shadow-soft rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800">1. Which areas did you clean/service today?</h4>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(cleanedAreaLabels) as [CleanedArea, string][]).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    data.cleanedAreas.includes(key)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.cleanedAreas.includes(key)}
                    onChange={() => !disabled && toggleArea(key)}
                    disabled={disabled}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />
                  <span className="leading-tight">{label}</span>
                </label>
              ))}
            </div>
            
            {data.cleanedAreas.includes('other') && (
              <div className="space-y-1.5 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Label className="text-xs font-bold text-slate-700">Please specify other areas:</Label>
                <Input
                  value={data.cleanedAreasOther}
                  onChange={(e) => updateField('cleanedAreasOther', e.target.value)}
                  disabled={disabled}
                  placeholder="Type area name..."
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q2: Cleaning Frequency */}
        <Card className="border shadow-soft rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
            <Clock size={16} className="text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800">2. How many times did you complete cleaning today?</h4>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(cleaningFrequencyLabels) as [CleaningFrequency, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => updateField('cleaningFrequency', key)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    data.cleaningFrequency === key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Q3: Completion Status */}
        <Card className="border shadow-soft rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">3. Did you complete all assigned work for today?</h4>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              {(Object.entries(completionStatusLabels) as [WorkCompletionStatus, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    updateField('completionStatus', key)
                    if (key === 'fully_completed') {
                      updateField('incompletionReasons', [])
                      updateField('incompletionReasonsOther', '')
                    }
                  }}
                  className={`flex-1 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    data.completionStatus === key
                      ? key === 'fully_completed' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(data.completionStatus === 'partially_completed' || data.completionStatus === 'not_completed') && (
              <div className="border-t pt-4 space-y-4">
                <Label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Reason for incomplete work:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(incompletionReasonLabels) as [IncompletionReason, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        data.incompletionReasons.includes(key)
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.incompletionReasons.includes(key)}
                        onChange={() => !disabled && toggleReason(key)}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-600"
                      />
                      <span className="leading-tight">{label}</span>
                    </label>
                  ))}
                </div>

                {data.incompletionReasons.includes('other') && (
                  <div className="space-y-1.5 mt-2">
                    <Label className="text-[10px] font-bold text-slate-600">Please specify other reason:</Label>
                    <Input
                      value={data.incompletionReasonsOther}
                      onChange={(e) => updateField('incompletionReasonsOther', e.target.value)}
                      disabled={disabled}
                      placeholder="Type reason here..."
                      className="h-9 text-xs rounded-lg border-amber-200"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q4: Issues Noticed */}
        <Card className="border shadow-soft rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600" />
            <h4 className="text-sm font-bold text-slate-800">4. Did you notice or report any issues today?</h4>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.entries(dailyIssueLabels) as [DailyIssue, string][]).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    data.issuesNoticed.includes(key)
                      ? key === 'no_issues' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.issuesNoticed.includes(key)}
                    onChange={() => !disabled && toggleIssue(key)}
                    disabled={disabled}
                    className={`mt-0.5 h-4 w-4 rounded border-slate-300 ${key === 'no_issues' ? 'accent-emerald-600' : 'accent-rose-600'}`}
                  />
                  <span className="leading-tight">{label}</span>
                </label>
              ))}
            </div>

            {data.issuesNoticed.includes('other') && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-600">Please specify other issue:</Label>
                <Input
                  value={data.issuesOther}
                  onChange={(e) => updateField('issuesOther', e.target.value)}
                  disabled={disabled}
                  placeholder="Type issue here..."
                  className="h-9 text-xs rounded-lg border-rose-200"
                />
              </div>
            )}

            {/* Photo Upload (Optional) */}
            {data.issuesNoticed.length > 0 && !data.issuesNoticed.includes('no_issues') && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold text-slate-700">Photo Upload <span className="text-[10px] font-normal text-slate-500">(Optional)</span></Label>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {data.issuePhotos.map(photo => (
                    <div key={photo.id} className="relative w-24 h-24 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center group overflow-hidden">
                      <Camera size={24} className="text-slate-300" />
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                        >
                          <Trash2 size={16} />
                          <span className="text-[9px] mt-1">Remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {!disabled && (
                    <button
                      type="button"
                      onClick={simulatePhotoUpload}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                    >
                      <Camera size={20} />
                      <span className="text-[9px] font-bold">Add Photo</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q5: Final Status */}
        <Card className="border shadow-soft rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <h4 className="text-sm font-bold text-slate-800">5. What is the status at the end of your shift?</h4>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(finalShiftStatusLabels) as [FinalShiftStatus, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => updateField('finalStatus', key)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                    data.finalStatus === key
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 border-t pt-4">
              <Label className="text-xs font-bold text-slate-700">Additional Comments <span className="text-[10px] font-normal text-slate-500">(Optional)</span></Label>
              <textarea
                value={data.additionalComments}
                onChange={(e) => updateField('additionalComments', e.target.value)}
                disabled={disabled}
                placeholder="Any other observations or notes for the next shift..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-[10px] text-slate-400">
          Ensure all information is accurate before submitting.
        </div>
        <div className="flex gap-2">
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSaveDraft(data)}
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
              <CheckCircle2 size={16} /> Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

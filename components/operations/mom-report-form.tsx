'use client'

import { useState, useCallback } from 'react'
import {
  Users, CheckCircle2, AlertTriangle, Building2, ChevronRight, ChevronLeft,
  MessageSquare, Briefcase, CalendarClock, TrendingUp, Flag, FileText,
  Plus, Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type {
  MOMReportData, ClientSentiment, MOMDiscussionTopic, MOMIssue,
  MOMOpportunityType, MOMOutcome, MOMActionItem
} from '@/lib/types'
import {
  createEmptyMOMReport, sentimentLabels, discussionTopicLabels,
  momIssueLabels, opportunityTypeLabels, outcomeLabels
} from '@/lib/data/mom-report-data'

interface MOMReportFormProps {
  taskId: string
  siteName: string
  clientName: string
  supervisorName: string
  onSubmit: (data: MOMReportData) => void
  onSaveDraft: (data: MOMReportData) => void
  initialData?: Partial<MOMReportData>
  disabled?: boolean
}

const TOTAL_STEPS = 10

const stepMeta = [
  { label: 'Meeting Details', icon: Building2, short: 'Details' },
  { label: 'Client Interaction', icon: Users, short: 'Client' },
  { label: 'Client Sentiment', icon: MessageSquare, short: 'Sentiment' },
  { label: 'Discussion Topics', icon: FileText, short: 'Topics' },
  { label: 'Issues Raised', icon: AlertTriangle, short: 'Issues' },
  { label: 'Action Required', icon: CheckCircle2, short: 'Actions' },
  { label: 'Business Opportunity', icon: TrendingUp, short: 'Opportunity' },
  { label: 'Meeting Summary', icon: Briefcase, short: 'Summary' },
  { label: 'Follow-up', icon: CalendarClock, short: 'Follow-up' },
  { label: 'Meeting Outcome', icon: Flag, short: 'Outcome' },
]

export default function MOMReportForm({
  taskId, siteName, clientName, supervisorName,
  onSubmit, onSaveDraft, initialData, disabled = false,
}: MOMReportFormProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<MOMReportData>(() => {
    const empty = createEmptyMOMReport()
    return initialData ? { ...empty, ...initialData } : empty
  })

  // ── Updaters ──
  const updateField = useCallback(<K extends keyof MOMReportData>(key: K, value: MOMReportData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleTopic = useCallback((topic: MOMDiscussionTopic) => {
    setData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }))
  }, [])

  const toggleIssue = useCallback((issue: MOMIssue) => {
    setData(prev => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter(i => i !== issue)
        : [...prev.issues, issue]
    }))
  }, [])

  const toggleOpportunityType = useCallback((type: MOMOpportunityType) => {
    setData(prev => ({
      ...prev,
      opportunity: {
        ...prev.opportunity,
        types: prev.opportunity.types.includes(type)
          ? prev.opportunity.types.filter(t => t !== type)
          : [...prev.opportunity.types, type]
      }
    }))
  }, [])

  const addActionItem = useCallback(() => {
    const newItem: MOMActionItem = {
      id: `ACT_${Date.now()}`,
      description: '',
      assignedTo: '',
      targetDate: '',
      priority: 'medium',
      status: 'open',
    }
    setData(prev => ({ ...prev, actionItems: [...prev.actionItems, newItem] }))
  }, [])

  const updateActionItem = useCallback((id: string, updates: Partial<MOMActionItem>) => {
    setData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item => item.id === id ? { ...item, ...updates } : item)
    }))
  }, [])

  const removeActionItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, actionItems: prev.actionItems.filter(item => item.id !== id) }))
  }, [])

  // ── Navigation ──
  const canNext = step < TOTAL_STEPS - 1
  const canPrev = step > 0
  const goNext = () => canNext && setStep(s => s + 1)
  const goPrev = () => canPrev && setStep(s => s - 1)

  // ── Handlers ──
  const handleSubmit = () => {
    if (!data.clientMet) {
      onSubmit(data)
      return
    }

    if (!data.sentiment) {
      toast.error('Validation Error', { description: 'Please select the client sentiment.' })
      setStep(2)
      return
    }

    if (!data.outcome) {
      toast.error('Validation Error', { description: 'Please select the final meeting outcome.' })
      setStep(9)
      return
    }

    if (data.actionRequired && data.actionItems.length === 0) {
      toast.error('Validation Error', { description: 'Please add at least one action item, or select No for Action Required.' })
      setStep(5)
      return
    }

    onSubmit(data)
  }

  const handleSaveDraft = () => onSaveDraft(data)

  const completionPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100)

  return (
    <div className="space-y-5">
      {/* ── Stepper Header ── */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Minutes of Meeting (MOM)</p>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">{siteName} · {clientName}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Progress</p>
            <p className="text-lg font-extrabold text-indigo-700">{completionPercent}%</p>
          </div>
        </div>

        {/* Step pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {stepMeta.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isPast = i < step
            return (
              <button
                key={i}
                type="button"
                onClick={() => !disabled && setStep(i)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border-0 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isPast
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isPast ? <CheckCircle2 size={11} /> : <Icon size={11} />}
                <span className="hidden sm:inline">{s.short}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-gradient-to-r from-indigo-600 to-violet-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* ── Section Content ── */}
      <Card className="shadow-soft border rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-2">
          {(() => { const Icon = stepMeta[step].icon; return <Icon size={16} className="text-indigo-600" /> })()}
          <h4 className="text-sm font-bold text-slate-800">
            Section {step + 1}: {stepMeta[step].label}
          </h4>
        </div>
        <CardContent className="p-5">

          {/* SECTION 1: Meeting Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Supervisor</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{supervisorName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Date & Time</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{new Date().toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Site</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{siteName}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Client Representative Name</Label>
                  <Input
                    value={data.clientRepName}
                    onChange={(e) => updateField('clientRepName', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. Mr. Rajesh Sharma"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Designation</Label>
                  <Input
                    value={data.clientDesignation}
                    onChange={(e) => updateField('clientDesignation', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. Facility Manager"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Client Interaction */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Was the Client / Branch Manager met?</Label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('clientMet', val)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.clientMet === val
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {val ? 'Yes, Client Met' : 'No, Client Not Met'}
                    </button>
                  ))}
                </div>
              </div>
              
              {!data.clientMet && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-2">
                  <AlertTriangle size={24} className="text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-amber-800">No client interaction conducted</p>
                  <p className="text-[10px] text-amber-700">You may skip the remaining sections and submit the MOM directly, or add internal notes in the summary.</p>
                </div>
              )}
            </div>
          )}

          {/* Rest of the form depends on clientMet */}
          {step > 1 && !data.clientMet && (
            <div className="bg-slate-50 border p-6 rounded-xl text-center space-y-2">
              <Users size={24} className="text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Section Skipped</p>
              <p className="text-[10px] text-slate-500">Since the client was not met, this section is not applicable.</p>
            </div>
          )}

          {data.clientMet && (
            <>
              {/* SECTION 3: Client Sentiment */}
              {step === 2 && (
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-700">Client Sentiment Assessment <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.entries(sentimentLabels) as [ClientSentiment, { label: string, emoji: string }][]).map(([key, { label, emoji }]) => (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => updateField('sentiment', key)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          data.sentiment === key
                            ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className={`text-[9px] font-bold text-center ${data.sentiment === key ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: Discussion Topics */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-700">Topics Discussed</Label>
                  <p className="text-[10px] text-slate-500 font-medium">Select all topics discussed during the meeting:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(discussionTopicLabels) as [MOMDiscussionTopic, string][]).map(([key, label]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          data.topics.includes(key)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={data.topics.includes(key)}
                          onChange={() => !disabled && toggleTopic(key)}
                          disabled={disabled}
                          className="h-3.5 w-3.5 rounded accent-indigo-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: Issues Raised */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Did the Client Raise Any Concern?</Label>
                    <div className="flex gap-2">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            updateField('issuesRaised', val)
                            if (!val) updateField('issues', [])
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            data.issuesRaised === val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.issuesRaised && (
                    <div className="border-t pt-4 space-y-2">
                      <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Select Issues Raised</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.entries(momIssueLabels) as [MOMIssue, string][]).map(([key, label]) => (
                          <label
                            key={key}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              data.issues.includes(key)
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={data.issues.includes(key)}
                              onChange={() => !disabled && toggleIssue(key)}
                              disabled={disabled}
                              className="h-3.5 w-3.5 rounded accent-rose-600"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 6: Action Required */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Is Any Follow-up Action Required?</Label>
                    <div className="flex gap-2">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            updateField('actionRequired', val)
                            if (!val) updateField('actionItems', [])
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            data.actionRequired === val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.actionRequired && (
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Action Items</Label>
                      
                      {data.actionItems.map((item, idx) => (
                        <div key={item.id} className="border rounded-xl p-3 space-y-2 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">Item #{idx + 1}</span>
                            {!disabled && (
                              <button onClick={() => removeActionItem(item.id)} className="p-1 hover:bg-red-50 rounded border-0 bg-transparent cursor-pointer">
                                <Trash2 size={12} className="text-red-400" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2 space-y-1">
                              <Label className="text-[10px] font-bold text-slate-600">Action Description</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateActionItem(item.id, { description: e.target.value })}
                                disabled={disabled}
                                placeholder="What needs to be done?"
                                className="h-8 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold text-slate-600">Assigned To</Label>
                              <Input
                                value={item.assignedTo}
                                onChange={(e) => updateActionItem(item.id, { assignedTo: e.target.value })}
                                disabled={disabled}
                                placeholder="Name..."
                                className="h-8 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold text-slate-600">Target Date</Label>
                              <Input
                                type="date"
                                value={item.targetDate}
                                onChange={(e) => updateActionItem(item.id, { targetDate: e.target.value })}
                                disabled={disabled}
                                className="h-8 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold text-slate-600">Priority</Label>
                              <select
                                value={item.priority}
                                onChange={(e) => updateActionItem(item.id, { priority: e.target.value as any })}
                                disabled={disabled}
                                className="w-full h-8 border rounded-lg px-2 text-xs bg-white border-slate-200 cursor-pointer focus:outline-none"
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!disabled && (
                        <Button
                          type="button"
                          onClick={addActionItem}
                          variant="outline"
                          className="w-full h-9 text-xs rounded-xl gap-1.5"
                        >
                          <Plus size={13} /> Add Action Item
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7: Business Opportunity */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Additional Requirement Discussed?</Label>
                    <div className="flex gap-2">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            updateField('opportunityDiscussed', val)
                            if (!val) updateField('opportunity', { types: [], value: '' })
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            data.opportunityDiscussed === val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.opportunityDiscussed && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Opportunity Area(s)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.entries(opportunityTypeLabels) as [MOMOpportunityType, string][]).map(([key, label]) => (
                            <label
                              key={key}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                data.opportunity.types.includes(key)
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={data.opportunity.types.includes(key)}
                                onChange={() => !disabled && toggleOpportunityType(key)}
                                disabled={disabled}
                                className="h-3.5 w-3.5 rounded accent-emerald-600"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Opportunity Value (Optional)</Label>
                        <select
                          value={data.opportunity.value}
                          onChange={(e) => setData(prev => ({ ...prev, opportunity: { ...prev.opportunity, value: e.target.value as any } }))}
                          disabled={disabled}
                          className="w-full h-9 border rounded-xl px-2 text-xs bg-white border-slate-200 cursor-pointer focus:outline-none"
                        >
                          <option value="">Select Value Estimate...</option>
                          <option value="high">High Value</option>
                          <option value="medium">Medium Value</option>
                          <option value="low">Low Value</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 8: Meeting Summary */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                    <Label className="text-xs font-bold text-slate-700">Brief Summary of Discussion</Label>
                    <textarea
                      value={data.summary}
                      onChange={(e) => updateField('summary', e.target.value.slice(0, 200))}
                      disabled={disabled}
                      placeholder="Summarize the key points discussed..."
                      className="w-full p-3 border border-indigo-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] bg-white"
                      maxLength={200}
                    />
                    <p className="text-[9px] text-slate-400 text-right">{data.summary.length}/200</p>
                  </div>
                </div>
              )}

              {/* SECTION 9: Follow-up */}
              {step === 8 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Is a Follow-up Meeting Required?</Label>
                    <div className="flex gap-2">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            updateField('followupRequired', val)
                            if (!val) updateField('followupDate', '')
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            data.followupRequired === val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.followupRequired && (
                    <div className="border-t pt-4 space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Follow-up Date</Label>
                      <Input
                        type="date"
                        value={data.followupDate}
                        onChange={(e) => updateField('followupDate', e.target.value)}
                        disabled={disabled}
                        className="h-10 text-xs rounded-xl w-full max-w-[200px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 10: Meeting Outcome */}
              {step === 9 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Overall Meeting Outcome <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.entries(outcomeLabels) as [MOMOutcome, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          disabled={disabled}
                          onClick={() => updateField('outcome', key)}
                          className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                            data.outcome === key
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </CardContent>
      </Card>

      {/* ── Navigation Footer ── */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={!canPrev || disabled}
          className="h-9 px-4 rounded-xl text-xs gap-1"
        >
          <ChevronLeft size={14} /> Previous
        </Button>

        <div className="flex gap-2">
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="h-9 px-4 rounded-xl text-xs"
            >
              Save Draft
            </Button>
          )}

          {canNext && data.clientMet ? (
            <Button
              type="button"
              onClick={goNext}
              className="h-9 px-5 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 border-0"
            >
              Next <ChevronRight size={14} />
            </Button>
          ) : !disabled && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-9 px-5 rounded-xl text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white gap-1 border-0 shadow-md"
            >
              <CheckCircle2 size={14} /> Submit MOM
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

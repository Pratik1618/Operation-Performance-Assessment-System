'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  MapPin, CheckCircle2, AlertTriangle, Camera, Plus, Trash2,
  ChevronRight, ChevronLeft, ClipboardCheck, Sparkles, ShieldCheck,
  Package, GraduationCap, MessageSquare, Image, AlertCircle, Wrench,
  ThumbsUp, Flag, Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { StarRating } from '@/components/ui/star-rating'
import { toast } from 'sonner'
import type {
  SiteVisitReportData, QualityRating, ObservationItem, TrainingTopic,
  SiteIssue, CorrectiveAction, VisitType, MaterialAvailability,
  EquipmentStatusType, FinalSiteStatus, PhotoDoc,
} from '@/lib/types'
import {
  createEmptySiteVisitReport,
  calculateSiteQualityScore, calculateComplianceScore,
  calculateTrainingCoverageScore, calculateOverallSiteHealthScore,
  visitTypeLabels, qualityRatingLabels, observationLabels,
  trainingTopicLabels, issueLabels, complianceCheckLabels,
  knowledgeRatingLabels, disciplineCheckLabels,
  materialAvailabilityLabels, equipmentStatusLabels, finalStatusLabels,
} from '@/lib/data/site-visit-data'

interface SiteVisitReportFormProps {
  taskId: string
  siteName: string
  clientName: string
  supervisorName: string
  employeeId: string
  onSubmit: (data: SiteVisitReportData) => void
  onSaveDraft: (data: SiteVisitReportData) => void
  initialData?: Partial<SiteVisitReportData>
  disabled?: boolean
}

const TOTAL_STEPS = 11

const stepMeta = [
  { label: 'Visit Details', icon: MapPin, short: 'Details' },
  { label: 'Site Quality Audit', icon: ClipboardCheck, short: 'Quality' },
  { label: 'HK Assessment', icon: ShieldCheck, short: 'HK' },
  { label: 'Material & Equipment', icon: Package, short: 'Material' },
  { label: 'Training & Coaching', icon: GraduationCap, short: 'Training' },
  { label: 'Client Feedback', icon: MessageSquare, short: 'Client' },
  { label: 'Photo Documentation', icon: Image, short: 'Photos' },
  { label: 'Issues Identified', icon: AlertCircle, short: 'Issues' },
  { label: 'Corrective Action', icon: Wrench, short: 'Actions' },
  { label: 'Positive Recognition', icon: ThumbsUp, short: 'Recognition' },
  { label: 'Final Site Status', icon: Flag, short: 'Final' },
]

export default function SiteVisitReportForm({
  taskId, siteName, clientName, supervisorName, employeeId,
  onSubmit, onSaveDraft, initialData, disabled = false,
}: SiteVisitReportFormProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<SiteVisitReportData>(() => {
    const empty = createEmptySiteVisitReport()
    return initialData ? { ...empty, ...initialData } : empty
  })
  const [gpsFetching, setGpsFetching] = useState(false)

  // ── Score calculations ──
  const siteQualityScore = useMemo(() => calculateSiteQualityScore(data.qualityRatings), [data.qualityRatings])
  const complianceScore = useMemo(() => calculateComplianceScore(data.hkAssessment), [data.hkAssessment])
  const trainingScore = useMemo(() => calculateTrainingCoverageScore(data.trainingTopics, data.trainingConducted), [data.trainingTopics, data.trainingConducted])
  const overallScore = useMemo(() => calculateOverallSiteHealthScore(siteQualityScore, complianceScore, trainingScore), [siteQualityScore, complianceScore, trainingScore])

  // ── Updaters ──
  const updateField = useCallback(<K extends keyof SiteVisitReportData>(key: K, value: SiteVisitReportData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateQualityRating = useCallback((key: keyof QualityRating, value: number) => {
    setData(prev => ({ ...prev, qualityRatings: { ...prev.qualityRatings, [key]: value } }))
  }, [])

  const toggleObservation = useCallback((item: ObservationItem) => {
    setData(prev => {
      if (item === 'none') return { ...prev, observations: prev.observations.includes('none') ? [] : ['none'] }
      const without = prev.observations.filter(o => o !== 'none')
      return { ...prev, observations: without.includes(item) ? without.filter(o => o !== item) : [...without, item] }
    })
  }, [])

  const toggleTrainingTopic = useCallback((topic: TrainingTopic) => {
    setData(prev => ({
      ...prev,
      trainingTopics: prev.trainingTopics.includes(topic)
        ? prev.trainingTopics.filter(t => t !== topic)
        : [...prev.trainingTopics, topic],
    }))
  }, [])

  const toggleIssue = useCallback((issue: SiteIssue) => {
    setData(prev => ({
      ...prev,
      issuesIdentified: prev.issuesIdentified.includes(issue)
        ? prev.issuesIdentified.filter(i => i !== issue)
        : [...prev.issuesIdentified, issue],
    }))
  }, [])

  const addCorrectiveAction = useCallback(() => {
    const newAction: CorrectiveAction = {
      id: `CA_${Date.now()}`,
      issue: '',
      assignedTo: '',
      priority: 'medium',
      targetClosureDate: '',
      status: 'open',
    }
    setData(prev => ({ ...prev, correctiveActions: [...prev.correctiveActions, newAction] }))
  }, [])

  const updateCorrectiveAction = useCallback((id: string, updates: Partial<CorrectiveAction>) => {
    setData(prev => ({
      ...prev,
      correctiveActions: prev.correctiveActions.map(ca => ca.id === id ? { ...ca, ...updates } : ca),
    }))
  }, [])

  const removeCorrectiveAction = useCallback((id: string) => {
    setData(prev => ({ ...prev, correctiveActions: prev.correctiveActions.filter(ca => ca.id !== id) }))
  }, [])

  const simulatePhotoUpload = useCallback((category: PhotoDoc['category'], isMandatory: boolean) => {
    const newPhoto: PhotoDoc = {
      id: `PHT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      fileName: `${category}_${Date.now().toString().slice(-4)}.jpg`,
      isMandatory,
    }
    setData(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }))
    toast.success('Photo Captured', { description: `${category.replace(/_/g, ' ')} photo uploaded.` })
  }, [])

  const removePhoto = useCallback((id: string) => {
    setData(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }))
  }, [])

  const fetchGPS = useCallback(() => {
    setGpsFetching(true)
    setTimeout(() => {
      setData(prev => ({ ...prev, gpsLocation: { lat: 28.4595 + Math.random() * 0.01, lng: 77.0266 + Math.random() * 0.01 } }))
      setGpsFetching(false)
      toast.success('GPS Verified', { description: 'Location captured within 50m radius.' })
    }, 1500)
  }, [])

  // ── Navigation ──
  const canNext = step < TOTAL_STEPS - 1
  const canPrev = step > 0
  const goNext = () => canNext && setStep(s => s + 1)
  const goPrev = () => canPrev && setStep(s => s - 1)

  // ── Submit ──
  const handleSubmit = () => {
    // Validate minimum requirements
    const mandatoryPhotos = data.photos.filter(p => p.isMandatory).length
    if (mandatoryPhotos < 3) {
      toast.error('Validation Error', { description: 'Please upload at least 3 mandatory photos (Site Overview, Washroom, HK Staff).' })
      setStep(6)
      return
    }
    if (!data.positiveRecognition.trim()) {
      toast.error('Validation Error', { description: 'Positive Recognition field is mandatory.' })
      setStep(9)
      return
    }
    if (siteQualityScore < 75 || data.clientFeedback.serviceQualityFeedback === 'poor' || data.finalSiteStatus === 'critical') {
      if (!data.supervisorRemarks.trim()) {
        toast.error('Validation Error', { description: 'Supervisor remarks are mandatory when score is below 75% or critical issues exist.' })
        setStep(10)
        return
      }
    }

    const finalData: SiteVisitReportData = {
      ...data,
      siteQualityScore,
      complianceScore,
      trainingCoverageScore: trainingScore,
      overallSiteHealthScore: overallScore,
    }
    onSubmit(finalData)
  }

  const handleSaveDraft = () => {
    const finalData: SiteVisitReportData = {
      ...data,
      siteQualityScore,
      complianceScore,
      trainingCoverageScore: trainingScore,
      overallSiteHealthScore: overallScore,
    }
    onSaveDraft(finalData)
  }

  // ── Stepper Progress ──
  const completionPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100)

  return (
    <div className="space-y-5">
      {/* ── Stepper Header ── */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Site Visit Report</p>
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

      {/* ── Live Score Sidebar (always visible) ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Quality', score: siteQualityScore, color: 'text-blue-700 bg-blue-50' },
          { label: 'Compliance', score: complianceScore, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Training', score: trainingScore, color: 'text-violet-700 bg-violet-50' },
          { label: 'Overall', score: overallScore, color: 'text-indigo-700 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-2.5 text-center ${s.color}`}>
            <p className="text-[18px] font-extrabold">{s.score}%</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
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
          {/* SECTION 1: Visit Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Supervisor</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{supervisorName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Employee ID</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{employeeId}</span>
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

              {/* GPS */}
              <div className="space-y-2 p-3 bg-blue-50/30 rounded-xl border border-blue-100">
                <Label className="text-xs font-bold text-slate-700">GPS Location Verification</Label>
                {!data.gpsLocation ? (
                  <Button
                    type="button"
                    onClick={fetchGPS}
                    disabled={gpsFetching || disabled}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border-0 text-xs h-9 rounded-lg gap-2"
                  >
                    {gpsFetching ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    {gpsFetching ? 'Fetching Location...' : 'Fetch GPS Location'}
                  </Button>
                ) : (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Location Verified — {data.gpsLocation.lat.toFixed(4)}°N, {data.gpsLocation.lng.toFixed(4)}°E
                  </div>
                )}
              </div>

              {/* Visit Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Visit Type <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(visitTypeLabels) as [VisitType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('visitType', key)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.visitType === key
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Site Quality Audit */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 font-medium">Rate each parameter from 1–5 (1 = Poor, 5 = Excellent)</p>
              <div className="space-y-3">
                {(Object.entries(qualityRatingLabels) as [keyof QualityRating, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-semibold text-slate-700 flex-1">{label}</span>
                    <StarRating
                      value={data.qualityRatings[key]}
                      onChange={(v) => !disabled && updateQualityRating(key, v)}
                      disabled={disabled}
                      size={16}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label className="text-xs font-bold text-slate-700">Observation Checklist</Label>
                <p className="text-[10px] text-slate-500 font-medium">Select all applicable observations:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(observationLabels) as [ObservationItem, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        data.observations.includes(key)
                          ? key === 'none' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.observations.includes(key)}
                        onChange={() => !disabled && toggleObservation(key)}
                        disabled={disabled}
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto score display */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Auto-Calculated Quality Score</p>
                <p className={`text-2xl font-extrabold mt-1 ${
                  siteQualityScore >= 80 ? 'text-emerald-600' : siteQualityScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>{siteQualityScore}%</p>
              </div>
            </div>
          )}

          {/* SECTION 3: HK Assessment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Housekeeping Associate Met?</Label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      disabled={disabled}
                      onClick={() => setData(prev => ({ ...prev, hkAssessment: { ...prev.hkAssessment, associateMet: val } }))}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.hkAssessment.associateMet === val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {data.hkAssessment.associateMet && (
                <>
                  {/* Compliance Verification */}
                  <div className="space-y-2 border-t pt-4">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Compliance Verification</h5>
                    <div className="space-y-1.5">
                      {(Object.entries(complianceCheckLabels) as [string, string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(data.hkAssessment.compliance as any)[key] || false}
                            onChange={(e) => !disabled && setData(prev => ({
                              ...prev,
                              hkAssessment: { ...prev.hkAssessment, compliance: { ...prev.hkAssessment.compliance, [key]: e.target.checked } }
                            }))}
                            disabled={disabled}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                          />
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Knowledge Assessment */}
                  <div className="space-y-2 border-t pt-4">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Knowledge Assessment (Rate 1–5)</h5>
                    <div className="space-y-2.5">
                      {(Object.entries(knowledgeRatingLabels) as [string, string][]).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border">
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                          <StarRating
                            value={(data.hkAssessment.knowledge as any)[key] || 0}
                            onChange={(v) => !disabled && setData(prev => ({
                              ...prev,
                              hkAssessment: { ...prev.hkAssessment, knowledge: { ...prev.hkAssessment.knowledge, [key]: v } }
                            }))}
                            disabled={disabled}
                            size={15}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discipline & Attendance */}
                  <div className="space-y-2 border-t pt-4">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Discipline & Attendance</h5>
                    <div className="space-y-1.5">
                      {(Object.entries(disciplineCheckLabels) as [string, string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(data.hkAssessment.discipline as any)[key] || false}
                            onChange={(e) => !disabled && setData(prev => ({
                              ...prev,
                              hkAssessment: { ...prev.hkAssessment, discipline: { ...prev.hkAssessment.discipline, [key]: e.target.checked } }
                            }))}
                            disabled={disabled}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                          />
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!data.hkAssessment.associateMet && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                  <AlertTriangle size={20} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-amber-700">Housekeeping associate was not met during this visit.</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Assessment section will be skipped.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: Material & Equipment Status */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Material Availability</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(materialAvailabilityLabels) as [MaterialAvailability, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('materialAvailability', key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.materialAvailability === key
                          ? key === 'fully_available' ? 'bg-emerald-600 text-white border-emerald-600' :
                            key === 'low_stock' ? 'bg-amber-500 text-white border-amber-500' :
                            'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Equipment Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(equipmentStatusLabels) as [EquipmentStatusType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('equipmentStatus', key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.equipmentStatus === key
                          ? key === 'fully_functional' ? 'bg-emerald-600 text-white border-emerald-600' :
                            key === 'minor_issue' ? 'bg-amber-500 text-white border-amber-500' :
                            'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {(data.equipmentStatus === 'minor_issue' || data.equipmentStatus === 'major_breakdown') && (
                <div className="space-y-3 border-t pt-4 bg-rose-50/30 rounded-xl p-3 border-rose-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Equipment Issue Details (Mandatory)</p>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600">Equipment Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={data.equipmentIssue?.equipmentName || ''}
                        onChange={(e) => setData(prev => ({ ...prev, equipmentIssue: { ...prev.equipmentIssue || { issueDescription: '' }, equipmentName: e.target.value } as any }))}
                        disabled={disabled}
                        placeholder="e.g. Auto Scrubber Machine"
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600">Issue Description <span className="text-red-500">*</span></Label>
                      <textarea
                        value={data.equipmentIssue?.issueDescription || ''}
                        onChange={(e) => setData(prev => ({ ...prev, equipmentIssue: { ...prev.equipmentIssue || { equipmentName: '' }, issueDescription: e.target.value } as any }))}
                        disabled={disabled}
                        placeholder="Describe the equipment issue..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: Training & Coaching */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Topics Discussed During Visit</Label>
                <p className="text-[10px] text-slate-500 font-medium">Select all that apply:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(trainingTopicLabels) as [TrainingTopic, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        data.trainingTopics.includes(key)
                          ? 'bg-violet-50 border-violet-200 text-violet-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.trainingTopics.includes(key)}
                        onChange={() => !disabled && toggleTrainingTopic(key)}
                        disabled={disabled}
                        className="h-3.5 w-3.5 rounded accent-violet-600"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label className="text-xs font-bold text-slate-700">Training Conducted?</Label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('trainingConducted', val)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.trainingConducted === val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {data.trainingConducted && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-600">Training Remark (max 100 chars)</Label>
                  <Input
                    value={data.trainingRemarks}
                    onChange={(e) => updateField('trainingRemarks', e.target.value.slice(0, 100))}
                    disabled={disabled}
                    placeholder="Brief training summary..."
                    className="h-9 text-xs rounded-xl"
                    maxLength={100}
                  />
                  <p className="text-[9px] text-slate-400 text-right">{data.trainingRemarks.length}/100</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: Client Feedback */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Client / Branch Manager Met?</Label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      disabled={disabled}
                      onClick={() => setData(prev => ({ ...prev, clientFeedback: { ...prev.clientFeedback, clientMet: val } }))}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.clientFeedback.clientMet === val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {data.clientFeedback.clientMet && (
                <>
                  <div className="space-y-2.5 border-t pt-4">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Rate 1–5</h5>
                    {([
                      ['staffAppearance', 'Staff Appearance'],
                      ['behaviourEtiquette', 'Behaviour & Etiquette'],
                      ['groomingStandards', 'Grooming Standards'],
                      ['hygieneStandards', 'Hygiene Standards'],
                    ] as [string, string][]).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border">
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <StarRating
                          value={(data.clientFeedback as any)[key] || 0}
                          onChange={(v) => !disabled && setData(prev => ({
                            ...prev, clientFeedback: { ...prev.clientFeedback, [key]: v }
                          }))}
                          disabled={disabled}
                          size={15}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600">Material Quality Feedback</Label>
                      <select
                        value={data.clientFeedback.materialQualityFeedback}
                        onChange={(e) => setData(prev => ({ ...prev, clientFeedback: { ...prev.clientFeedback, materialQualityFeedback: e.target.value as any } }))}
                        disabled={disabled}
                        className="w-full h-9 border rounded-xl px-2 text-xs bg-white border-slate-200 cursor-pointer focus:outline-none"
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600">Service Quality Feedback</Label>
                      <select
                        value={data.clientFeedback.serviceQualityFeedback}
                        onChange={(e) => setData(prev => ({ ...prev, clientFeedback: { ...prev.clientFeedback, serviceQualityFeedback: e.target.value as any } }))}
                        disabled={disabled}
                        className="w-full h-9 border rounded-xl px-2 text-xs bg-white border-slate-200 cursor-pointer focus:outline-none"
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-600">Client Remark (optional, max 150 chars)</Label>
                    <Input
                      value={data.clientFeedback.clientRemark}
                      onChange={(e) => setData(prev => ({ ...prev, clientFeedback: { ...prev.clientFeedback, clientRemark: e.target.value.slice(0, 150) } }))}
                      disabled={disabled}
                      placeholder="Any client comment..."
                      className="h-9 text-xs rounded-xl"
                      maxLength={150}
                    />
                    <p className="text-[9px] text-slate-400 text-right">{data.clientFeedback.clientRemark.length}/150</p>
                  </div>
                </>
              )}

              {!data.clientFeedback.clientMet && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-amber-700">Client / Branch Manager was not met during this visit.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: Photo Documentation */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium flex items-start gap-2">
                <Camera size={14} className="mt-0.5 shrink-0" />
                <span>Minimum 3 mandatory photos required. Maximum 10 photos total.</span>
              </div>

              {/* Mandatory photo slots */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mandatory Photos</h5>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { cat: 'site_overview' as const, label: 'Site Overview' },
                    { cat: 'washroom' as const, label: 'Washroom Area' },
                    { cat: 'hk_staff' as const, label: 'HK Staff' },
                  ]).map(({ cat, label }) => {
                    const existing = data.photos.filter(p => p.category === cat)
                    return (
                      <div key={cat} className="space-y-1">
                        <button
                          type="button"
                          disabled={disabled || existing.length > 0}
                          onClick={() => simulatePhotoUpload(cat, true)}
                          className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
                            existing.length > 0
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30'
                          }`}
                        >
                          {existing.length > 0 ? <CheckCircle2 size={18} /> : <Camera size={18} />}
                          {existing.length > 0 ? 'Captured' : 'Tap to Capture'}
                        </button>
                        <p className="text-[9px] font-bold text-slate-500 text-center">{label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Optional photos */}
              <div className="space-y-2 border-t pt-4">
                <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Optional Photos</h5>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { cat: 'store_room' as const, label: 'Store Room' },
                    { cat: 'equipment' as const, label: 'Equipment' },
                    { cat: 'issues' as const, label: 'Issues' },
                    { cat: 'before_after' as const, label: 'Before/After' },
                  ]).map(({ cat, label }) => {
                    const count = data.photos.filter(p => p.category === cat).length
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={disabled || data.photos.length >= 10}
                        onClick={() => simulatePhotoUpload(cat, false)}
                        className="p-2 rounded-xl border border-dashed border-slate-200 text-center text-[10px] font-semibold text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer"
                      >
                        <Camera size={14} className="mx-auto mb-0.5" />
                        {label}
                        {count > 0 && <span className="block text-indigo-600 text-[9px] mt-0.5">{count} uploaded</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Photo list */}
              {data.photos.length > 0 && (
                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded ({data.photos.length}/10)</p>
                  {data.photos.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border text-[10px]">
                      <div className="flex items-center gap-2">
                        {p.isMandatory && <span className="bg-red-100 text-red-600 px-1 py-0.5 rounded text-[8px] font-bold">REQ</span>}
                        <span className="font-semibold text-slate-700">{p.fileName}</span>
                        <span className="text-slate-400 capitalize">{p.category.replace(/_/g, ' ')}</span>
                      </div>
                      {!disabled && (
                        <button onClick={() => removePhoto(p.id)} className="p-1 hover:bg-red-50 rounded border-0 bg-transparent cursor-pointer">
                          <Trash2 size={11} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 8: Issues Identified */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 font-medium">Select all applicable issues observed during the visit:</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(issueLabels) as [SiteIssue, string][]).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      data.issuesIdentified.includes(key)
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data.issuesIdentified.includes(key)}
                      onChange={() => !disabled && toggleIssue(key)}
                      disabled={disabled}
                      className="h-3.5 w-3.5 rounded accent-rose-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {data.issuesIdentified.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-emerald-700">No issues identified — great!</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 9: Corrective Action */}
          {step === 8 && (
            <div className="space-y-4">
              {data.issuesIdentified.length === 0 ? (
                <div className="bg-slate-50 border rounded-xl p-6 text-center">
                  <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No issues were identified in Section 8.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Corrective actions are not required.</p>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{data.issuesIdentified.length} issue(s) identified. Please add corrective actions below.</span>
                  </div>

                  {data.correctiveActions.map((ca, idx) => (
                    <div key={ca.id} className="border rounded-xl p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">Action #{idx + 1}</span>
                        {!disabled && (
                          <button onClick={() => removeCorrectiveAction(ca.id)} className="p-1 hover:bg-red-50 rounded border-0 bg-transparent cursor-pointer">
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px] font-bold text-slate-600">Issue</Label>
                          <Input
                            value={ca.issue}
                            onChange={(e) => updateCorrectiveAction(ca.id, { issue: e.target.value })}
                            disabled={disabled}
                            placeholder="Describe the issue..."
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-600">Assigned To</Label>
                          <Input
                            value={ca.assignedTo}
                            onChange={(e) => updateCorrectiveAction(ca.id, { assignedTo: e.target.value })}
                            disabled={disabled}
                            placeholder="Name..."
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-600">Priority</Label>
                          <select
                            value={ca.priority}
                            onChange={(e) => updateCorrectiveAction(ca.id, { priority: e.target.value as any })}
                            disabled={disabled}
                            className="w-full h-8 border rounded-lg px-2 text-xs bg-white border-slate-200 cursor-pointer focus:outline-none"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px] font-bold text-slate-600">Target Closure Date</Label>
                          <Input
                            type="date"
                            value={ca.targetClosureDate}
                            onChange={(e) => updateCorrectiveAction(ca.id, { targetClosureDate: e.target.value })}
                            disabled={disabled}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {!disabled && (
                    <Button
                      type="button"
                      onClick={addCorrectiveAction}
                      variant="outline"
                      className="w-full h-9 text-xs rounded-xl gap-1.5"
                    >
                      <Plus size={13} /> Add Corrective Action
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* SECTION 10: Positive Recognition */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  <Label className="text-xs font-bold text-slate-700">What was done well during this visit? <span className="text-red-500">*</span></Label>
                </div>
                <textarea
                  value={data.positiveRecognition}
                  onChange={(e) => updateField('positiveRecognition', e.target.value.slice(0, 150))}
                  disabled={disabled}
                  placeholder="e.g. Excellent attendance, Client appreciation received, Good housekeeping standards..."
                  className="w-full p-3 border border-emerald-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[80px] bg-white"
                  maxLength={150}
                />
                <p className="text-[9px] text-slate-400 text-right">{data.positiveRecognition.length}/150</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium italic">
                Purpose: Promote positive reinforcement and employee engagement.
              </p>
            </div>
          )}

          {/* SECTION 11: Final Site Status */}
          {step === 10 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Overall Site Status</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(finalStatusLabels) as [FinalSiteStatus, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateField('finalSiteStatus', key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        data.finalSiteStatus === key
                          ? key === 'excellent' ? 'bg-emerald-600 text-white border-emerald-600' :
                            key === 'good' ? 'bg-blue-600 text-white border-blue-600' :
                            key === 'needs_improvement' ? 'bg-amber-500 text-white border-amber-500' :
                            'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional mandatory remarks */}
              {(siteQualityScore < 75 || data.clientFeedback.serviceQualityFeedback === 'poor' || data.finalSiteStatus === 'critical') && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                    <AlertTriangle size={13} />
                    Supervisor Remarks Required
                  </div>
                  <p className="text-[10px] text-rose-600">
                    Remarks are mandatory because:
                    {siteQualityScore < 75 && ' Site Score is below 75%.'}
                    {data.clientFeedback.serviceQualityFeedback === 'poor' && ' Client Feedback is Poor.'}
                    {data.finalSiteStatus === 'critical' && ' Critical status selected.'}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">
                  Supervisor Remarks
                  {(siteQualityScore < 75 || data.clientFeedback.serviceQualityFeedback === 'poor' || data.finalSiteStatus === 'critical') && <span className="text-red-500"> *</span>}
                  <span className="font-normal text-slate-400 ml-1">(max 250 chars)</span>
                </Label>
                <textarea
                  value={data.supervisorRemarks}
                  onChange={(e) => updateField('supervisorRemarks', e.target.value.slice(0, 250))}
                  disabled={disabled}
                  placeholder="Enter supervisor remarks and observations..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  maxLength={250}
                />
                <p className="text-[9px] text-slate-400 text-right">{data.supervisorRemarks.length}/250</p>
              </div>

              {/* Final scores summary */}
              <div className="grid grid-cols-2 gap-2 border-t pt-4">
                {[
                  { label: 'Site Quality Score', score: siteQualityScore, color: siteQualityScore >= 75 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50' },
                  { label: 'Compliance Score', score: complianceScore, color: complianceScore >= 75 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50' },
                  { label: 'Training Coverage', score: trainingScore, color: trainingScore >= 50 ? 'text-violet-700 bg-violet-50' : 'text-amber-700 bg-amber-50' },
                  { label: 'Overall Site Health', score: overallScore, color: overallScore >= 70 ? 'text-indigo-700 bg-indigo-50' : 'text-rose-700 bg-rose-50' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                    <p className="text-xl font-extrabold">{s.score}%</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
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

          {canNext ? (
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
              <CheckCircle2 size={14} /> Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

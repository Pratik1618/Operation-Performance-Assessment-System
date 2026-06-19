'use client'

import {
  MapPin, CheckCircle2, XCircle, Star, AlertTriangle,
  Camera, Package, GraduationCap, MessageSquare, Wrench,
  ThumbsUp, Flag, ClipboardCheck, ShieldCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteVisitReportData, QualityRating } from '@/lib/types'
import {
  visitTypeLabels, qualityRatingLabels, observationLabels,
  trainingTopicLabels, issueLabels, complianceCheckLabels,
  knowledgeRatingLabels, disciplineCheckLabels,
  materialAvailabilityLabels, equipmentStatusLabels, finalStatusLabels,
  calculateSiteQualityScore, calculateComplianceScore,
  calculateTrainingCoverageScore, calculateOverallSiteHealthScore,
} from '@/lib/data/site-visit-data'

interface SiteVisitSummaryProps {
  data: SiteVisitReportData
  siteName: string
  clientName: string
  supervisorName: string
  visitDate: string
}

function ScoreRing({ score, label, size = 64 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm font-extrabold" style={{ color }}>{score}%</span>
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{label}</p>
    </div>
  )
}

function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
      <span className={`text-[9px] font-bold ml-1 ${
        value >= 4 ? 'text-emerald-600' : value >= 3 ? 'text-amber-600' : 'text-rose-600'
      }`}>{value}/5</span>
    </div>
  )
}

function CheckBadge({ value }: { value: boolean }) {
  return value
    ? <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"><CheckCircle2 size={10} /> Yes</span>
    : <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded"><XCircle size={10} /> No</span>
}

export default function SiteVisitSummary({ data, siteName, clientName, supervisorName, visitDate }: SiteVisitSummaryProps) {
  const qualityScore = calculateSiteQualityScore(data.qualityRatings)
  const complianceScore = calculateComplianceScore(data.hkAssessment)
  const trainingScore = calculateTrainingCoverageScore(data.trainingTopics, data.trainingConducted)
  const overallScore = calculateOverallSiteHealthScore(qualityScore, complianceScore, trainingScore)

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Site Visit Report Summary</p>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">{siteName}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{clientName} · {visitDate} · {supervisorName}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
            data.finalSiteStatus === 'excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            data.finalSiteStatus === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            data.finalSiteStatus === 'needs_improvement' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {finalStatusLabels[data.finalSiteStatus] || data.finalSiteStatus}
          </span>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Quality', score: qualityScore, color: qualityScore >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-100' },
          { label: 'Compliance', score: complianceScore, color: complianceScore >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Training', score: trainingScore, color: trainingScore >= 50 ? 'text-violet-700 bg-violet-50 border-violet-100' : 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Overall', score: overallScore, color: overallScore >= 70 ? 'text-indigo-700 bg-indigo-50 border-indigo-100' : 'text-rose-700 bg-rose-50 border-rose-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-2 text-center ${s.color}`}>
            <p className="text-lg font-extrabold">{s.score}%</p>
            <p className="text-[8px] font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section 1: Visit Details */}
      <Card className="border rounded-xl overflow-hidden">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
          <MapPin size={12} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-700">Visit Details</span>
        </div>
        <CardContent className="p-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-[9px] text-slate-400 font-bold block">Visit Type</span><span className="font-semibold text-slate-700">{visitTypeLabels[data.visitType]}</span></div>
            <div><span className="text-[9px] text-slate-400 font-bold block">GPS</span><span className="font-semibold text-slate-700">{data.gpsLocation ? `${data.gpsLocation.lat.toFixed(4)}°N, ${data.gpsLocation.lng.toFixed(4)}°E` : 'Not captured'}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Quality Audit */}
      <Card className="border rounded-xl overflow-hidden">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
          <ClipboardCheck size={12} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-700">Site Quality Audit</span>
          <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
            qualityScore >= 80 ? 'bg-emerald-50 text-emerald-700' : qualityScore >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
          }`}>{qualityScore}%</span>
        </div>
        <CardContent className="p-3 space-y-1.5">
          {(Object.entries(qualityRatingLabels) as [keyof QualityRating, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{label}</span>
              <StarDisplay value={data.qualityRatings[key]} />
            </div>
          ))}
          {data.observations.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Observations</p>
              <div className="flex flex-wrap gap-1">
                {data.observations.map(obs => (
                  <span key={obs} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    obs === 'none' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>{observationLabels[obs]}</span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: HK Assessment */}
      {data.hkAssessment.associateMet && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700">HK Assessment</span>
          </div>
          <CardContent className="p-3 space-y-2 text-xs">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Compliance</p>
              <div className="space-y-1">
                {(Object.entries(complianceCheckLabels) as [string, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-600">{label}</span>
                    <CheckBadge value={(data.hkAssessment.compliance as any)[key]} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Knowledge</p>
              <div className="space-y-1">
                {(Object.entries(knowledgeRatingLabels) as [string, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-600">{label}</span>
                    <StarDisplay value={(data.hkAssessment.knowledge as any)[key]} />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Discipline</p>
              <div className="space-y-1">
                {(Object.entries(disciplineCheckLabels) as [string, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-600">{label}</span>
                    <CheckBadge value={(data.hkAssessment.discipline as any)[key]} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Material & Equipment */}
      <Card className="border rounded-xl overflow-hidden">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
          <Package size={12} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-700">Material & Equipment</span>
        </div>
        <CardContent className="p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Material Availability</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              data.materialAvailability === 'fully_available' ? 'bg-emerald-50 text-emerald-700' :
              data.materialAvailability === 'low_stock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
            }`}>{materialAvailabilityLabels[data.materialAvailability]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Equipment Status</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              data.equipmentStatus === 'fully_functional' ? 'bg-emerald-50 text-emerald-700' :
              data.equipmentStatus === 'minor_issue' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
            }`}>{equipmentStatusLabels[data.equipmentStatus]}</span>
          </div>
          {data.equipmentIssue && (
            <div className="border-t pt-2 mt-1 bg-rose-50/30 p-2 rounded-lg">
              <p className="text-[9px] font-bold text-rose-600 uppercase">Equipment Issue</p>
              <p className="text-slate-700 font-semibold mt-0.5">{data.equipmentIssue.equipmentName}</p>
              <p className="text-slate-500 mt-0.5">{data.equipmentIssue.issueDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Training */}
      {data.trainingTopics.length > 0 && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <GraduationCap size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700">Training & Coaching</span>
          </div>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {data.trainingTopics.map(t => (
                <span key={t} className="text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded">
                  {trainingTopicLabels[t]}
                </span>
              ))}
            </div>
            {data.trainingConducted && data.trainingRemarks && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border">"{data.trainingRemarks}"</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 6: Client Feedback */}
      {data.clientFeedback.clientMet && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <MessageSquare size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700">Client Feedback</span>
          </div>
          <CardContent className="p-3 text-xs space-y-1.5">
            {([
              ['staffAppearance', 'Staff Appearance'],
              ['behaviourEtiquette', 'Behaviour & Etiquette'],
              ['groomingStandards', 'Grooming Standards'],
              ['hygieneStandards', 'Hygiene Standards'],
            ] as [string, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-slate-600">{label}</span>
                <StarDisplay value={(data.clientFeedback as any)[key]} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">Material Quality</span>
                <span className="font-semibold text-slate-700 capitalize">{data.clientFeedback.materialQualityFeedback || '—'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">Service Quality</span>
                <span className="font-semibold text-slate-700 capitalize">{data.clientFeedback.serviceQualityFeedback || '—'}</span>
              </div>
            </div>
            {data.clientFeedback.clientRemark && (
              <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border mt-1">"{data.clientFeedback.clientRemark}"</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 7: Photos */}
      {data.photos.length > 0 && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <Camera size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700">Photo Documentation ({data.photos.length})</span>
          </div>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-1">
              {data.photos.map(p => (
                <span key={p.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  p.isMandatory ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  📷 {p.category.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 8 & 9: Issues & Corrective Actions */}
      {data.issuesIdentified.length > 0 && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b px-3 py-2 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-rose-500" />
            <span className="text-[10px] font-bold text-slate-700">Issues & Corrective Actions</span>
          </div>
          <CardContent className="p-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {data.issuesIdentified.map(issue => (
                <span key={issue} className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                  {issueLabels[issue]}
                </span>
              ))}
            </div>
            {data.correctiveActions.length > 0 && (
              <div className="border-t pt-2 space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Action Items ({data.correctiveActions.length})</p>
                {data.correctiveActions.map((ca, idx) => (
                  <div key={ca.id} className="bg-slate-50 p-2 rounded-lg border text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">#{idx + 1} {ca.issue}</span>
                      <span className={`font-bold px-1 py-0.5 rounded text-[8px] uppercase ${
                        ca.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        ca.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{ca.priority}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Assigned: {ca.assignedTo} · Due: {ca.targetClosureDate || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 10: Positive Recognition */}
      {data.positiveRecognition && (
        <Card className="border rounded-xl overflow-hidden">
          <div className="bg-emerald-50/50 border-b px-3 py-2 flex items-center gap-1.5">
            <ThumbsUp size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-700">Positive Recognition</span>
          </div>
          <CardContent className="p-3">
            <p className="text-xs text-emerald-700 font-semibold italic">"{data.positiveRecognition}"</p>
          </CardContent>
        </Card>
      )}

      {/* Supervisor Remarks */}
      {data.supervisorRemarks && (
        <div className="bg-slate-50 border rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Supervisor Remarks</p>
          <p className="text-xs text-slate-700 italic">"{data.supervisorRemarks}"</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock3,
  MessageSquareText,
  RotateCcw,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  ArrowRight,
  UserCheck,
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useAssessmentContext } from '@/lib/context/assessment-context'
import { cn, formatDate } from '@/lib/utils'

const workflowSteps = [
  'Operation Executive (L1)',
  'Regional Manager (L2)',
  'AVP Operations (L3)',
  'Business Head (L4)',
]

export default function ApprovalsPage() {
  const [activeRole, setActiveRole] = useState<'rm' | 'avp' | 'bh'>('rm')
  const [isEmployee, setIsEmployee] = useState(false)
  const { assessments, approvals, updateAssessment, addApproval, updateApproval } = useAssessmentContext()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole && ['rm', 'avp', 'bh'].includes(savedRole)) {
        setActiveRole(savedRole)
        setIsEmployee(false)
      } else if (savedRole === 'employee') {
        setIsEmployee(true)
      }
    }

    const handleRoleChange = (e: CustomEvent) => {
      const role = e.detail
      if (['rm', 'avp', 'bh'].includes(role)) {
        setActiveRole(role)
        setIsEmployee(false)
      } else if (role === 'employee') {
        setIsEmployee(true)
      }
    }

    window.addEventListener('simulated_role_change' as any, handleRoleChange)
    return () => {
      window.removeEventListener('simulated_role_change' as any, handleRoleChange)
    }
  }, [])

  const [remarks, setRemarks] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [focusApprovalId, setFocusApprovalId] = useState<string | null>(null)

  // Filter based on active role
  const pendingForRole = approvals.filter((a) => {
    if (a.status !== 'pending') return false
    if (activeRole === 'rm' && a.stage === 'rm_review') return true
    if (activeRole === 'avp' && a.stage === 'avp_review') return true
    if (activeRole === 'bh' && a.stage === 'bh_approval') return true
    return false
  })

  // Get active approval
  const focusApproval = pendingForRole.find((a) => a.id === focusApprovalId) || pendingForRole[0]
  const focusAssessment = focusApproval
    ? assessments.find((a) => a.id === focusApproval.assessmentId)
    : null

  useEffect(() => {
    if (focusApproval && focusApproval.id !== focusApprovalId) {
      setFocusApprovalId(focusApproval.id)
    }
  }, [focusApproval, focusApprovalId])

  const handleAction = (status: 'approved' | 'rejected' | 'returned') => {
    if (!focusApproval || !focusAssessment) return

    let nextStatus: any = focusAssessment.status
    let scoreField: any = null

    if (activeRole === 'rm') {
      nextStatus = status === 'approved' ? 'submitted_l3' : 'draft'
      scoreField = 'l2Score'
    } else if (activeRole === 'avp') {
      nextStatus = status === 'approved' ? 'submitted_l4' : 'submitted_l2'
      scoreField = 'l3Score'
    } else if (activeRole === 'bh') {
      nextStatus = status === 'approved' ? 'approved' : 'submitted_l3'
      scoreField = 'l4Score'
    }

    // Update current approval in context
    updateApproval(focusApproval.id, {
      status,
      processedAt: new Date(),
      processedBy: activeRole === 'rm' ? 'Suresh Kumar (RM)' : activeRole === 'avp' ? 'Venkat Raman (AVP)' : 'Amit Sharma (BH)',
      remarks: remarks || `Scored and processed as ${status.toUpperCase()}`,
    })

    // If approved and there is a next stage, insert pending approval for next stage
    if (status === 'approved') {
      if (activeRole === 'rm') {
        addApproval({
          id: `APR_GEN_${Date.now()}`,
          assessmentId: focusAssessment.id,
          stage: 'avp_review' as const,
          status: 'pending' as const,
          assignedTo: 'usr_008',
          assignedToName: 'Venkat Raman',
          createdAt: new Date(),
        })
      } else if (activeRole === 'avp') {
        addApproval({
          id: `APR_GEN_${Date.now()}`,
          assessmentId: focusAssessment.id,
          stage: 'bh_approval' as const,
          status: 'pending' as const,
          assignedTo: 'usr_003',
          assignedToName: 'Amit Sharma',
          createdAt: new Date(),
        })
      }
    }

    // Update assessment in context
    const assessmentUpdates: any = {
      status: nextStatus,
      updatedAt: new Date(),
    }
    if (scoreField && status === 'approved') {
      const base = focusAssessment.l1Score || focusAssessment.performanceScore
      assessmentUpdates[scoreField] = Math.round((base + 0.2) * 10) / 10
      assessmentUpdates.performanceScore = assessmentUpdates[scoreField]
    }
    if (nextStatus === 'approved') {
      assessmentUpdates.approvedAt = new Date()
    }
    updateAssessment(focusAssessment.id, assessmentUpdates)

    setRemarks('')
    setFocusApprovalId(null)
    setSuccessMsg(`Assessment for ${focusAssessment.employeeName} successfully processed!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // L1 employee's own assessments for tracking
  const myAssessments = assessments.filter((a) => a.employeeId === 'usr_006')

  const getStepStatus = (assessment: any) => {
    const steps = [
      { label: 'Draft', done: assessment.status !== 'draft' },
      { label: 'Submitted to RM', done: ['submitted_l3', 'submitted_l4', 'approved'].includes(assessment.status) },
      { label: 'RM Approved', done: ['submitted_l3', 'submitted_l4', 'approved'].includes(assessment.status) },
      { label: 'AVP Approved', done: ['submitted_l4', 'approved'].includes(assessment.status) },
      { label: 'BH Approved', done: assessment.status === 'approved' },
    ]
    // Current step
    if (assessment.status === 'draft') return { steps, current: 0 }
    if (assessment.status === 'submitted_l2') return { steps, current: 1 }
    if (assessment.status === 'submitted_l3') return { steps, current: 2 }
    if (assessment.status === 'submitted_l4') return { steps, current: 3 }
    if (assessment.status === 'approved') return { steps, current: 4 }
    return { steps, current: 0 }
  }

  // ─── L1 EMPLOYEE: Track My Submissions ────────────────────────────
  if (isEmployee) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Track My Submissions' }]} />

        <Card className="p-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Submission Tracker</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Track My Submissions</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Monitor the approval progress of your submitted assessments through the L1 → L2 → L3 → L4 pipeline.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          {myAssessments.map((assessment) => {
            const { steps, current } = getStepStatus(assessment)
            return (
              <Card key={assessment.id} className="p-6 bg-white/80">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{assessment.month} {assessment.year} — Scorecard</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {assessment.employeeCode} · {assessment.region} · {assessment.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={assessment.status} />
                    <Link href={`/assessments/${assessment.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs font-semibold rounded-xl">
                        Open Scorecard
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Pipeline Stepper */}
                <div className="mt-6">
                  <div className="flex items-center gap-0">
                    {steps.map((step, idx) => (
                      <div key={step.label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            idx < current
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : idx === current
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-100 animate-pulse'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {idx < current ? '✓' : idx + 1}
                          </div>
                          <p className={`mt-2 text-[10px] font-semibold text-center max-w-16 leading-tight ${
                            idx <= current ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mt-[-16px] ${
                            idx < current ? 'bg-emerald-400' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Summary */}
                <div className="mt-5 grid gap-3 grid-cols-4 text-xs">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground font-medium">Completion</p>
                    <p className="mt-1 font-bold text-foreground">{assessment.compliancePercent}%</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground font-medium">L1 Score</p>
                    <p className="mt-1 font-bold text-foreground">{assessment.l1Score?.toFixed(1) ?? '—'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground font-medium">L2 Score</p>
                    <p className="mt-1 font-bold text-foreground">{assessment.l2Score?.toFixed(1) ?? '—'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground font-medium">Current Stage</p>
                    <p className="mt-1 font-bold text-foreground">{steps[current].label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── MANAGER VIEW (L2/L3/L4): Reviewer Workspace ─────────────────
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Approvals' }]} />

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 px-4 py-2 text-xs font-semibold text-indigo-700">
        Showing approvals filtered for active role: <span className="underline">{activeRole.toUpperCase()}</span> (Change role in the top header menu)
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 animate-pulse">
          {successMsg}
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Review Workspace</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {activeRole === 'rm' ? 'L2 Regional Manager Approvals' : activeRole === 'avp' ? 'L3 AVP Operations Approvals' : 'L4 Business Head Approvals'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Route assessments sequentially. Verify evidence and score to advance to the next reviewer stage.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Pending For Role', value: pendingForRole.length, tone: 'text-amber-600' },
              { label: 'Approved Total', value: approvals.filter((item) => item.status === 'approved').length, tone: 'text-emerald-600' },
              { label: 'Returned', value: approvals.filter((item) => ['rejected', 'returned'].includes(item.status)).length, tone: 'text-rose-600' },
            ].map((card) => (
              <Card key={card.label} className="p-4 bg-white/75 min-w-40">
                <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
                <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <Clock3 className="text-amber-600" size={18} />
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Pending Reviews</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Tasks requiring your attention</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {pendingForRole.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-white/50">
                  No pending assessments for this role.
                </div>
              ) : (
                pendingForRole.map((approval) => {
                  const assessment = assessments.find((item) => item.id === approval.assessmentId)

                  return (
                    <Card
                      key={approval.id}
                      onClick={() => setFocusApprovalId(approval.id)}
                      className={`p-5 bg-white/80 shadow-sm border cursor-pointer hover:border-primary/50 transition-all ${
                        focusApproval?.id === approval.id ? 'border-primary shadow-md ring-2 ring-primary/10' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{assessment?.employeeName ?? approval.assessmentId}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {assessment?.region} · Submitted {assessment?.submittedAt ? formatDate(assessment.submittedAt) : formatDate(approval.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={assessment?.status ?? 'submitted'} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-muted-foreground">Compliance %</p>
                          <p className="mt-1 font-semibold text-foreground">{assessment?.compliancePercent}%</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-muted-foreground">Active Score</p>
                          <p className="mt-1 font-semibold text-foreground">{assessment?.performanceScore.toFixed(1)}/10</p>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <MessageSquareText className="text-sky-600" size={18} />
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Approval Timeline Stage</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Linear review routing status</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {workflowSteps.map((step, index) => {
                const isActive =
                  activeRole === 'rm'
                    ? index <= 1
                    : activeRole === 'avp'
                      ? index <= 2
                      : index <= 3
                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`mt-1 h-4 w-4 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                      {index < workflowSteps.length - 1 && <div className="mt-2 h-full min-h-16 w-0.5 bg-border" />}
                    </div>
                    <Card className="flex-1 p-4 bg-white/70">
                      <p className="font-semibold text-sm text-foreground">{step}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {index === 0 && 'Executive compiles evidence and scores tasks.'}
                        {index === 1 && 'RM checks regional logs, adjusts rating weights, comments.'}
                        {index === 2 && 'AVP verifies regional consistency, performs final audit.'}
                        {index === 3 && 'BH closes and signs off final scorecard.'}
                      </p>
                    </Card>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {focusAssessment ? (
            <>
              <Card className="p-6">
                <CardHeader className="p-0 mb-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Focused Assessment</p>
                      <CardTitle className="mt-2 text-xl font-semibold text-foreground">{focusAssessment.employeeName}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {focusAssessment.employeeCode} · {focusAssessment.region} · {focusAssessment.state} · {focusAssessment.month} {focusAssessment.year}
                      </CardDescription>
                    </div>
                    <StatusBadge status={focusAssessment.status} />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid gap-3 grid-cols-4">
                    <div className="rounded-2xl bg-muted/50 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Completion</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{focusAssessment.compliancePercent}%</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active Score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{focusAssessment.performanceScore.toFixed(1)}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">L1 score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{focusAssessment.l1Score?.toFixed(1) ?? '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">L2 score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{focusAssessment.l2Score?.toFixed(1) ?? '—'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Link
                      href={`/assessments/${focusAssessment.id}`}
                      className={cn(
                        buttonVariants({ size: 'sm', variant: 'outline' }),
                        "flex items-center gap-2 rounded-xl text-xs font-semibold"
                      )}
                    >
                      Open Scored Task Register
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <CardHeader className="p-0 mb-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600" size={18} />
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Employee Summary</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Operational checklist status</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3 text-xs text-muted-foreground">
                    <div className="rounded-2xl border border-border bg-white/70 p-4">
                      Completed {focusAssessment.completedActivities} out of {focusAssessment.totalActivities} monthly activities.
                    </div>
                    <div className="rounded-2xl border border-border bg-white/70 p-4">
                      Submitted {focusAssessment.evidencesSubmitted} evidence files including Excel spreadsheets and video logs.
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="p-0 mb-5">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-violet-600" size={18} />
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Action Summary</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Pending validations</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs font-medium text-foreground">
                      Validate uniform/shoes logs & snag closure dates.
                    </div>
                    <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs font-medium text-foreground">
                      Confirm L1 self-scores line up with site visits.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="p-6 border border-primary/20 bg-slate-50/50">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    Enter Review Decision
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Your remarks will be appended to the timeline and notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <textarea
                    className="w-full rounded-xl border border-input bg-white p-3 text-xs text-foreground outline-none resize-none h-24 placeholder-muted-foreground"
                    placeholder="Enter review remarks, recommendations, or corrective instructions..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => handleAction('approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-2 rounded-xl text-xs font-bold py-2 px-4 shadow-sm">
                      <ThumbsUp size={16} />
                      Approve & Advance
                    </Button>
                    <Button onClick={() => handleAction('returned')} variant="outline" className="flex items-center gap-2 rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 py-2 px-4">
                      <RotateCcw size={16} />
                      Send Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full flex items-center justify-center py-20 border border-dashed rounded-2xl bg-white/50 text-muted-foreground text-sm font-medium">
              Select an assessment from the left panel to review.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

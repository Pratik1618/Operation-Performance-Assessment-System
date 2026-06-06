'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CheckCircle2,
  CloudUpload,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  MessageSquareText,
  PlaySquare,
  ShieldCheck,
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { StatusBadge } from '@/components/common/status-badge'
import { ProgressIndicator } from '@/components/common/progress-indicator'
import { OperationsActivityTable } from '@/components/operations/activity-table'
import { ActivityTimeline } from '@/components/operations/activity-timeline'
import { KanbanBoard } from '@/components/operations/kanban-board'
import { EvidenceGallery } from '@/components/operations/evidence-gallery'
import { OperationsDashboard } from '@/components/operations/operations-dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssessmentContext } from '@/lib/context/assessment-context'
import { getAssessmentActivities } from '@/lib/data/assessment-activities'
import { currentUser, employees } from '@/lib/data/users'
import { formatDate } from '@/lib/utils'

const uploadFiles = [
  { name: 'site_visit_photo.jpg', type: 'Image', size: '1.4 MB', icon: ImageIcon, progress: 100 },
  { name: 'attendance_sheet_may.xlsx', type: 'Excel', size: '820 KB', icon: FileSpreadsheet, progress: 92 },
  { name: 'incident_report.pdf', type: 'PDF', size: '540 KB', icon: FileText, progress: 100 },
  { name: 'training_clip.mp4', type: 'Video', size: '8.2 MB', icon: PlaySquare, progress: 76 },
]

export default function AssessmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { assessments, approvals: contextApprovals, updateAssessment, addApproval, updateApproval } = useAssessmentContext()
  const contextAssessment = assessments.find((item) => item.id === params.id)

  const [localAssessment, setLocalAssessment] = useState(contextAssessment)
  const [localActivities, setLocalActivities] = useState(() => {
    return contextAssessment ? getAssessmentActivities(contextAssessment.id) : []
  })
  const [selectedView, setSelectedView] = useState<'table' | 'dashboard' | 'kanban' | 'timeline'>('table')
  const [currentUserRole, setCurrentUserRole] = useState<'employee' | 'rm' | 'avp' | 'bh'>('rm')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole) {
        setCurrentUserRole(savedRole)
      }
    }

    const handleRoleChange = (e: CustomEvent) => {
      setCurrentUserRole(e.detail)
    }

    window.addEventListener('simulated_role_change' as any, handleRoleChange)
    return () => {
      window.removeEventListener('simulated_role_change' as any, handleRoleChange)
    }
  }, [])

  const [remarks, setRemarks] = useState('')
  const approvalsState = contextApprovals.filter((item) => item.assessmentId === params.id)

  const [customEvidenceFiles, setCustomEvidenceFiles] = useState<Record<string, any>>(() => {
    return {
      'ASS_001_OPS_001': [
        { name: 'absent_report_daily.pdf', type: 'pdf', size: '245 KB', uploadedDate: '2025-05-04' },
        { name: 'attendance_screenshot.jpg', type: 'image', size: '1.2 MB', uploadedDate: '2025-05-04' },
        { name: 'report_summary.docx', type: 'document', size: '156 KB', uploadedDate: '2025-05-04' },
      ],
      'ASS_001_OPS_003': [
        { name: 'site_visit_photos.zip', type: 'archive', size: '5.3 MB', uploadedDate: '2025-05-07' },
        { name: 'visit_report.pdf', type: 'pdf', size: '892 KB', uploadedDate: '2025-05-07' },
        { name: 'client_feedback.txt', type: 'document', size: '45 KB', uploadedDate: '2025-05-07' },
        { name: 'visit_video.mp4', type: 'video', size: '12.5 MB', uploadedDate: '2025-05-07' },
      ]
    }
  })
  
  const [selectedActivityId, setSelectedActivityId] = useState('')
  const [selfRating, setSelfRating] = useState<number>(4.0)
  const [activityRemarks, setActivityRemarks] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image' | 'video' | 'document'>('image')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const nextAssessment = assessments.find((item) => item.id === params.id)
    if (nextAssessment) {
      setLocalAssessment(nextAssessment)
      setLocalActivities(getAssessmentActivities(nextAssessment.id))
    }
  }, [params.id, assessments])

  useEffect(() => {
    if (localActivities.length > 0) {
      setSelectedActivityId(localActivities[0].id)
    } else {
      setSelectedActivityId('')
    }
  }, [localActivities])

  if (!localAssessment) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-foreground">Assessment not found</p>
      </div>
    )
  }

  const assessmentOwner = employees.find((employee) => employee.id === localAssessment.employeeId)
  const scorePercent = Math.min(100, (localAssessment.performanceScore ?? 0) * 10)
  const completionPercent = Math.round((localAssessment.completedActivities / localAssessment.totalActivities) * 100)

  const calculateRoleScore = (activitiesList: any[], ratingField: string) => {
    const rated = activitiesList.filter((a) => a[ratingField] !== undefined && a[ratingField] > 0)
    if (rated.length === 0) return 0
    const totalWeight = rated.reduce((sum, a) => sum + a.weightage, 0)
    const weightedSum = rated.reduce((sum, a) => sum + a[ratingField] * a.weightage, 0)
    return Math.round((weightedSum / totalWeight) * 2 * 10) / 10
  }

  const handleRatingChange = (
    activityId: string,
    roleField: 'l1Rating' | 'l2Rating' | 'l3Rating' | 'l4Rating',
    value: number
  ) => {
    setLocalActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId) {
          const updated = { ...activity, [roleField]: value }
          if (roleField === 'l1Rating') {
            updated.status = value > 0 ? 'submitted' : 'pending'
          } else if (roleField === 'l2Rating') {
            updated.status = value >= 4.0 ? 'achieved' : value > 0 ? 'partially_achieved' : 'pending'
          } else {
            updated.status = value >= 4.0 ? 'approved' : value > 0 ? 'partially_achieved' : 'pending'
          }
          return updated
        }
        return activity
      })
    )
  }

  const handleSaveL1Activity = () => {
    if (!selectedActivityId) return
    if (!uploadedFileName.trim()) {
      alert('Please specify an evidence file name.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    let progressVal = 0
    const interval = setInterval(() => {
      progressVal += 20
      setUploadProgress(progressVal)
      if (progressVal >= 100) {
        clearInterval(interval)

        // Upload completes! Now update states.
        const updatedActivities = localActivities.map((act) => {
          if (act.id === selectedActivityId) {
            return {
              ...act,
              l1Rating: selfRating,
              remarks: activityRemarks || act.remarks,
              evidenceCount: act.evidenceCount + 1,
              status: 'submitted' as const,
            }
          }
          return act
        })

        // Add file to customEvidenceFiles state
        const fileKey = selectedActivityId
        const newFile = {
          name: uploadedFileName,
          type: uploadedFileType,
          size: '1.2 MB',
          uploadedDate: new Date().toISOString().split('T')[0],
        }

        setCustomEvidenceFiles((prev) => {
          const currentFiles = prev[fileKey] || []
          return {
            ...prev,
            [fileKey]: [...currentFiles, newFile],
          }
        })

        // Recalculate scorecard metrics
        const completed = updatedActivities.filter((act) => (act.l1Rating ?? 0) > 0).length
        const compliance = Math.round((completed / localAssessment.totalActivities) * 100)
        const updatedL1Score = calculateRoleScore(updatedActivities, 'l1Rating')

        setLocalActivities(updatedActivities)
        const assessmentMetrics = {
          completedActivities: completed,
          compliancePercent: compliance,
          l1Score: updatedL1Score,
          performanceScore: updatedL1Score,
          evidencesSubmitted: (localAssessment.evidencesSubmitted || 0) + 1,
          updatedAt: new Date(),
        }
        setLocalAssessment((prev: any) => {
          if (!prev) return prev
          return { ...prev, ...assessmentMetrics }
        })
        // Sync to shared context
        updateAssessment(localAssessment.id, assessmentMetrics)

        // Reset upload form
        setUploadedFileName('')
        setActivityRemarks('')
        setIsUploading(false)
      }
    }, 150)
  }

  const getUserNameByRole = (role: string) => {
    switch (role) {
      case 'employee': return 'Anjali Desai'
      case 'rm': return 'Suresh Kumar'
      case 'avp': return 'Venkat Raman'
      case 'bh': return 'Amit Sharma'
      default: return 'System'
    }
  }

  const handleApprove = () => {
    let nextStatus: any = localAssessment.status
    let scoreField: any = null
    let ratingField = 'l1Rating'
    let approvalStage = ''
    let stageName = ''

    if (currentUserRole === 'employee' && localAssessment.status === 'draft') {
      nextStatus = 'submitted_l2'
      scoreField = 'l1Score'
      ratingField = 'l1Rating'
      approvalStage = 'l1_submission'
      stageName = 'L1 Submission'
    } else if (currentUserRole === 'rm' && localAssessment.status === 'submitted_l2') {
      nextStatus = 'submitted_l3'
      scoreField = 'l2Score'
      ratingField = 'l2Rating'
      approvalStage = 'rm_review'
      stageName = 'L2 RM Review'
    } else if (currentUserRole === 'avp' && localAssessment.status === 'submitted_l3') {
      nextStatus = 'submitted_l4'
      scoreField = 'l3Score'
      ratingField = 'l3Rating'
      approvalStage = 'avp_review'
      stageName = 'L3 AVP Review'
    } else if (currentUserRole === 'bh' && localAssessment.status === 'submitted_l4') {
      nextStatus = 'approved'
      scoreField = 'l4Score'
      ratingField = 'l4Rating'
      approvalStage = 'bh_approval'
      stageName = 'L4 BH Final Approval'
    }

    if (!scoreField) return

    const calculatedScore = calculateRoleScore(localActivities, ratingField)
    const processedByName = getUserNameByRole(currentUserRole)

    const newApproval = {
      id: `APR_SIM_${Date.now()}`,
      assessmentId: localAssessment.id,
      stage: approvalStage as any,
      status: 'approved' as const,
      assignedTo: currentUser.id,
      assignedToName: processedByName,
      remarks: remarks || `Scored ${calculatedScore}/10 and advanced by ${stageName}`,
      createdAt: new Date(),
      processedAt: new Date(),
      processedBy: processedByName,
    }

    // Commit approval to shared context
    addApproval(newApproval)

    // Build assessment updates
    const assessmentUpdates: any = {
      status: nextStatus,
      [scoreField]: calculatedScore,
      performanceScore: calculatedScore,
      updatedAt: new Date(),
    }
    if (nextStatus === 'approved') {
      assessmentUpdates.approvedAt = new Date()
    } else if (nextStatus === 'submitted_l2') {
      assessmentUpdates.submittedAt = new Date()
    }

    // Commit assessment updates to shared context
    updateAssessment(localAssessment.id, assessmentUpdates)

    // Also update local state for immediate UI feedback
    setLocalAssessment((prev: any) => {
      if (!prev) return prev
      return { ...prev, ...assessmentUpdates }
    })

    // Create pending approval for the next review stage
    if (nextStatus === 'submitted_l2') {
      addApproval({
        id: `APR_PENDING_${Date.now()}`,
        assessmentId: localAssessment.id,
        stage: 'rm_review' as const,
        status: 'pending' as const,
        assignedTo: 'usr_007',
        assignedToName: 'Suresh Kumar',
        createdAt: new Date(),
      })
      setLocalActivities((prev) =>
        prev.map((act) => ({
          ...act,
          l2Rating: act.l2Rating || act.l1Rating,
        }))
      )
    } else if (nextStatus === 'submitted_l3') {
      addApproval({
        id: `APR_PENDING_${Date.now()}`,
        assessmentId: localAssessment.id,
        stage: 'avp_review' as const,
        status: 'pending' as const,
        assignedTo: 'usr_008',
        assignedToName: 'Venkat Raman',
        createdAt: new Date(),
      })
      setLocalActivities((prev) =>
        prev.map((act) => ({
          ...act,
          l3Rating: act.l3Rating || act.l2Rating,
        }))
      )
    } else if (nextStatus === 'submitted_l4') {
      addApproval({
        id: `APR_PENDING_${Date.now()}`,
        assessmentId: localAssessment.id,
        stage: 'bh_approval' as const,
        status: 'pending' as const,
        assignedTo: 'usr_003',
        assignedToName: 'Amit Sharma',
        createdAt: new Date(),
      })
      setLocalActivities((prev) =>
        prev.map((act) => ({
          ...act,
          l4Rating: act.l4Rating || act.l3Rating,
        }))
      )
    }

    setRemarks('')
  }

  const handleSendBack = () => {
    let nextStatus: any = 'draft'
    let approvalStage = ''
    let stageName = ''

    if (currentUserRole === 'rm') {
      nextStatus = 'draft'
      approvalStage = 'rm_review'
      stageName = 'L2 RM Send Back'
    } else if (currentUserRole === 'avp') {
      nextStatus = 'submitted_l2'
      approvalStage = 'avp_review'
      stageName = 'L3 AVP Send Back'
    } else if (currentUserRole === 'bh') {
      nextStatus = 'submitted_l3'
      approvalStage = 'bh_approval'
      stageName = 'L4 BH Send Back'
    }

    const processedByName = getUserNameByRole(currentUserRole)

    const newApproval = {
      id: `APR_SIM_${Date.now()}`,
      assessmentId: localAssessment.id,
      stage: approvalStage as any,
      status: 'returned' as const,
      assignedTo: currentUser.id,
      assignedToName: processedByName,
      remarks: remarks || `Returned by ${stageName}`,
      createdAt: new Date(),
      processedAt: new Date(),
      processedBy: processedByName,
    }

    // Commit to shared context
    addApproval(newApproval)
    updateAssessment(localAssessment.id, {
      status: nextStatus,
      updatedAt: new Date(),
    })

    // Update local state for immediate UI
    setLocalAssessment((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        status: nextStatus,
        updatedAt: new Date(),
      }
    })

    setRemarks('')
  }

  const timelineSteps = [
    {
      label: 'Operation Executive (L1) - Anjali Desai',
      description: 'Assessment submitted with initial ratings and evidence',
      score: localAssessment.l1Score,
      active: true,
      meta: localAssessment.submittedAt
        ? formatDate(localAssessment.submittedAt)
        : localAssessment.status !== 'draft'
          ? 'Submitted'
          : 'In progress',
    },
    {
      label: 'Regional Manager (L2) - Suresh Kumar',
      description: 'Regional review, comments, and rating adjustments',
      score: localAssessment.l2Score,
      active: ['submitted_l3', 'submitted_l4', 'approved'].includes(localAssessment.status),
      meta: approvalsState.find((item) => item.stage === 'rm_review' && item.status === 'approved')?.processedAt
        ? formatDate(approvalsState.find((item) => item.stage === 'rm_review' && item.status === 'approved')!.processedAt!)
        : localAssessment.status === 'submitted_l2'
          ? 'Pending Action'
          : 'Pending',
    },
    {
      label: 'AVP Operations (L3) - Venkat Raman',
      description: 'AVP comparison, evidence validation, and score audit',
      score: localAssessment.l3Score,
      active: ['submitted_l4', 'approved'].includes(localAssessment.status),
      meta: approvalsState.find((item) => item.stage === 'avp_review' && item.status === 'approved')?.processedAt
        ? formatDate(
            approvalsState.find((item) => item.stage === 'avp_review' && item.status === 'approved')!.processedAt!
          )
        : localAssessment.status === 'submitted_l3'
          ? 'Pending Action'
          : 'Pending',
    },
    {
      label: 'Business Head (L4) - Amit Sharma',
      description: 'Final review, sign-off, and closure',
      score: localAssessment.l4Score,
      active: localAssessment.status === 'approved',
      meta: approvalsState.find((item) => item.stage === 'bh_approval' && item.status === 'approved')?.processedAt
        ? formatDate(
            approvalsState.find((item) => item.stage === 'bh_approval' && item.status === 'approved')!.processedAt!
          )
        : localAssessment.status === 'submitted_l4'
          ? 'Pending Action'
          : 'Pending',
    },
  ]

  const isRoleMatchingPendingStage = () => {
    if (currentUserRole === 'employee' && localAssessment.status === 'draft') return true
    if (currentUserRole === 'rm' && localAssessment.status === 'submitted_l2') return true
    if (currentUserRole === 'avp' && localAssessment.status === 'submitted_l3') return true
    if (currentUserRole === 'bh' && localAssessment.status === 'submitted_l4') return true
    return false
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Assessments', href: '/assessments' },
          { label: `${localAssessment.employeeName} - ${localAssessment.month} ${localAssessment.year}` },
        ]}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
          Reviewing scorecard as: <span className="underline">{currentUserRole.toUpperCase()}</span> (Change role in the top header menu)
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Switch Scorecard:</span>
          <select
            value={localAssessment.id}
            onChange={(e) => {
              router.push(`/assessments/${e.target.value}`)
            }}
            className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800 focus:outline-none cursor-pointer shadow-sm"
          >
            {assessments
              .filter((a) => currentUserRole !== 'employee' || a.employeeId === 'usr_006')
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.employeeName} — {a.month} {a.year} ({a.status.replace('_', ' ').toUpperCase()})
                </option>
              ))}
          </select>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Assessment Header Card</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{localAssessment.employeeName}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Operations performance scorecard for the current cycle, including activity execution, evidence quality, reviewer feedback, and approval progression.
        </p>
        <div className="mt-5 grid gap-3 text-xs text-muted-foreground md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Employee ID</p>
            <p className="mt-2 font-semibold text-foreground text-sm">{localAssessment.employeeCode}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Designation</p>
            <p className="mt-2 font-semibold text-foreground text-sm">{assessmentOwner?.designation ?? 'Operations Executive'}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Region / State / Zone</p>
            <p className="mt-2 font-semibold text-foreground text-sm">{localAssessment.region} · {localAssessment.state} · {localAssessment.zone}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Assessment Month</p>
            <p className="mt-2 font-semibold text-foreground text-sm">{localAssessment.month} {localAssessment.year}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Assessment Status</p>
              <div className="mt-2">
                <StatusBadge status={localAssessment.status} />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Simulated Role: {currentUserRole.toUpperCase()}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader className="p-0 mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Performance Progress Section</p>
          <CardTitle className="mt-2 text-xl font-semibold text-foreground">Score and completion progress</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-white/75 p-5 shadow-sm">
            <ProgressIndicator
              percentage={localAssessment.compliancePercent}
              label="Weighted Compliance"
              size="lg"
              variant="default"
              displayValue={`${Math.round(localAssessment.compliancePercent)}%`}
            />
          </div>
          <div className="rounded-3xl border border-border bg-white/75 p-5 shadow-sm">
            <ProgressIndicator
              percentage={scorePercent}
              label="Overall Score"
              size="lg"
              variant="success"
              displayValue={`${(localAssessment.performanceScore ?? 0).toFixed(1)}/10`}
            />
          </div>
          <div className="rounded-3xl border border-border bg-white/75 p-5 shadow-sm">
            <ProgressIndicator
              percentage={completionPercent}
              label="Tasks Completed"
              size="lg"
              variant="warning"
              displayValue={`${localAssessment.completedActivities}/${localAssessment.totalActivities}`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <div className="space-y-6">
          <Card className="p-4">
            <Tabs value={selectedView} onValueChange={(val) => setSelectedView(val as any)} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Activity Assessment Table</TabsTrigger>
                <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
                <TabsTrigger value="kanban">Kanban Board View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="pt-2">
                <OperationsActivityTable
                  activities={localActivities}
                  onRatingChange={handleRatingChange}
                  activeReviewerRole={currentUserRole}
                  isEditable={isRoleMatchingPendingStage()}
                />
              </TabsContent>
              <TabsContent value="dashboard" className="pt-2">
                <OperationsDashboard activities={localActivities} />
              </TabsContent>
              <TabsContent value="kanban" className="pt-2">
                <KanbanBoard activities={localActivities} />
              </TabsContent>
              <TabsContent value="timeline" className="pt-2">
                <ActivityTimeline activities={localActivities} />
              </TabsContent>
            </Tabs>
          </Card>

          {currentUserRole === 'employee' ? (
            <Card className="p-6 border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-cyan-50/20 shadow-md">
              <CardHeader className="p-0 mb-5">
                <div className="flex items-center gap-3">
                  <CloudUpload className="text-indigo-600" size={20} />
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">L1 Executive Scoring & Evidence Workspace</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-0.5">
                      Select an activity, assign your self-rating, enter comments, and upload evidence.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5">
                {localAssessment.status !== 'draft' ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2">
                    <span>⚠️ Note: This assessment is in status <strong>{localAssessment.status.replace('_', ' ').toUpperCase()}</strong> and cannot be modified. Switch to a Draft assessment to edit.</span>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">1. Select Activity to Score</label>
                        <select
                          value={selectedActivityId}
                          onChange={(e) => setSelectedActivityId(e.target.value)}
                          className="w-full h-10 rounded-xl border border-input bg-white px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                        >
                          {localActivities.map((act) => (
                            <option key={act.id} value={act.id}>
                              {act.activityName} ({act.activityId}) — L1: {act.l1Rating !== undefined && act.l1Rating > 0 ? `${act.l1Rating.toFixed(1)}/5.0` : 'Not Rated'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Evidence File Type</label>
                        <select
                          value={uploadedFileType}
                          onChange={(e) => setUploadedFileType(e.target.value as any)}
                          className="w-full h-10 rounded-xl border border-input bg-white px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                        >
                          <option value="pdf">PDF File</option>
                          <option value="image">Image (JPG, PNG)</option>
                          <option value="video">Video (MP4)</option>
                          <option value="document">Excel / Word Document</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">3. Assign Self-Rating</label>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 shadow-sm border border-indigo-100">
                          {selfRating.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={selfRating}
                        onChange={(e) => setSelfRating(parseFloat(e.target.value))}
                        className="w-full h-2 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-muted-foreground font-semibold mr-1">Presets:</span>
                        {[1.0, 2.0, 3.0, 4.0, 5.0].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSelfRating(preset)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                              selfRating === preset
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20 scale-105'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {preset.toFixed(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">4. Activity Remarks / Execution Notes</label>
                      <textarea
                        value={activityRemarks}
                        onChange={(e) => setActivityRemarks(e.target.value)}
                        placeholder="Provide details about compliance, findings, or notes for the reviewer..."
                        className="w-full rounded-xl border border-input bg-white p-3 text-xs text-foreground outline-none resize-none h-20 placeholder-muted-foreground focus:border-indigo-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">5. Evidence File Name</label>
                      <input
                        type="text"
                        value={uploadedFileName}
                        onChange={(e) => setUploadedFileName(e.target.value)}
                        placeholder="e.g. site_visit_report_may.pdf"
                        className="w-full h-10 rounded-xl border border-input bg-white px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-indigo-500 shadow-sm"
                      />
                    </div>

                    {isUploading && (
                      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 animate-pulse">
                        <div className="flex items-center justify-between text-xs text-indigo-800 font-semibold">
                          <span>Simulating Evidence Upload...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2 bg-indigo-100" />
                      </div>
                    )}

                    <Button
                      onClick={handleSaveL1Activity}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm rounded-xl py-3 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01]"
                    >
                      {isUploading ? 'Uploading & Saving...' : 'Upload Evidence & Save Rating'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6">
              <CardHeader className="p-0 mb-5">
                <div className="flex items-center gap-3">
                  <CloudUpload className="text-blue-600" size={18} />
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">Evidence Upload Experience</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Drag and drop images, PDFs, Excel files, and videos against scored activities.</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <CloudUpload size={24} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">Drop files here to upload evidence</h3>
                  <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
                    Supports images, PDFs, Excel files, and video attachments with preview and progress indicators.
                  </p>
                  <Button className="mt-5 shadow-lg shadow-blue-500/20" size="lg">
                    Upload Evidence
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {uploadFiles.map((file) => {
                    const Icon = file.icon
                    return (
                      <Card key={file.name} className="p-4 bg-white/75 shadow-sm border border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-muted p-3 text-foreground">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{file.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{file.type} · {file.size}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download size={14} />
                          </Button>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Upload Progress</span>
                            <span className="font-semibold">{file.progress}%</span>
                          </div>
                          <Progress value={file.progress} className="mt-2" />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <EvidenceGallery
            activities={localActivities}
            customEvidenceFiles={customEvidenceFiles}
            onDeleteEvidence={(activityId, fileName) => {
              setCustomEvidenceFiles((prev) => {
                const list = prev[activityId] || [];
                const updatedList = list.filter((f: any) => f.name !== fileName);
                return { ...prev, [activityId]: updatedList };
              });
              setLocalActivities((prev) =>
                prev.map((act) => {
                  if (act.id === activityId) {
                    const newCount = Math.max(0, act.evidenceCount - 1);
                    return {
                      ...act,
                      evidenceCount: newCount,
                      status: newCount === 0 && (act.l1Rating === undefined || act.l1Rating === 0) ? 'pending' as const : act.status,
                    };
                  }
                  return act;
                })
              );
              setLocalAssessment((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  evidencesSubmitted: Math.max(0, prev.evidencesSubmitted - 1),
                };
              });
            }}
          />
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">Approval Workflow Section</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Timeline details</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {timelineSteps.map((step, index, array) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-4 w-4 rounded-full ${step.active ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                    {index < array.length - 1 && <div className="mt-2 h-full min-h-16 w-0.5 bg-border" />}
                  </div>
                  <Card className="flex-1 p-4 bg-white/70">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-foreground">{step.label}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{step.meta}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{step.description}</p>
                    {step.score !== undefined && step.score > 0 && (
                      <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-[11px]">
                        <span className="font-semibold text-slate-500">Calculated Score</span>
                        <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-600">{step.score.toFixed(1)}/10</span>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </CardContent>
          </Card>

          {isRoleMatchingPendingStage() && (
            <Card className="p-6 border border-emerald-200 bg-emerald-50/30">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-semibold text-emerald-800">
                  {currentUserRole === 'employee' ? 'Submit Operations Assessment (L1)' : `Submit Review as ${currentUserRole === 'rm' ? 'Regional Manager (L2)' : currentUserRole === 'avp' ? 'AVP (L3)' : 'Business Head (L4)'}`}
                </CardTitle>
                <CardDescription className="text-xs text-emerald-700">
                  {currentUserRole === 'employee' ? 'Complete your self-ratings in the first column and submit.' : 'Rate the checklist items in the table above and submit your score.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <textarea
                  className="w-full rounded-xl border border-input bg-white p-3 text-xs text-foreground outline-none resize-none h-20 placeholder-muted-foreground"
                  placeholder={currentUserRole === 'employee' ? 'Enter submission notes or highlights...' : 'Enter review remarks/action plans for this review...'}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button onClick={handleApprove} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl py-2">
                    {currentUserRole === 'employee' ? 'Submit to RM (L2)' : 'Submit & Advance'}
                  </Button>
                  {currentUserRole !== 'employee' && (
                    <Button onClick={handleSendBack} variant="outline" className="text-xs font-bold rounded-xl py-2 text-rose-600 border-rose-200 hover:bg-rose-50">
                      Send Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <MessageSquareText size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">Reviewer Notes</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Comments and status updates</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-3">
              {approvalsState.map((approval) => (
                <Card key={approval.id} className="p-4 bg-white/75 border border-border shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-xs text-foreground">
                        {approval.stage === 'rm_review'
                          ? 'Regional Manager (L2)'
                          : approval.stage === 'avp_review'
                            ? 'AVP Operations (L3)'
                            : approval.stage === 'bh_approval'
                              ? 'Business Head (L4)'
                              : 'Operation Executive (L1)'}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Processor: {approval.processedBy ?? approval.assignedToName}</p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      {approval.processedAt ? formatDate(approval.processedAt) : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{approval.remarks || 'No comments captured yet.'}</p>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">Activity Actions</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Quick review shortcuts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 grid gap-3">
              {['Upload Evidence', 'View Evidence', 'Comment on Activity'].map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  className="w-full justify-start text-left text-xs font-semibold rounded-xl"
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Shield, AlertTriangle, FileUp, CheckCircle,
  Save, Send, UploadCloud, User, Star, Trash2, HelpCircle
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { OperationalTask, SiteVisitReportData, MOMReportData } from '@/lib/types'
import { toast } from 'sonner'
import SiteVisitReportForm from '@/components/operations/site-visit-report-form'
import SiteVisitSummary from '@/components/operations/site-visit-summary'
import MOMReportForm from '@/components/operations/mom-report-form'
import MOMSummary from '@/components/operations/mom-summary'
import DailyClosureForm from '@/components/operations/daily-closure-form'
import DailyClosureSummary from '@/components/operations/daily-closure-summary'
import FinalClosingForm from '@/components/operations/final-closing-form'
import FinalClosingSummary from '@/components/operations/final-closing-summary'
import type { FinalClosingReportData } from '@/lib/types'

const isRoleMatch = (assignedRolesStr: string | undefined, role: string) => {
  if (!assignedRolesStr) return false;
  const roles = assignedRolesStr.toLowerCase().split(',').map(r => r.trim());
  if (role === 'hr') {
    return roles.includes('hr') || roles.includes('hrbp');
  }
  if (role === 'hr_dr') {
    return roles.includes('hr dr') || roles.includes('hr_dr');
  }
  if (role === 'procurement') {
    return roles.includes('procurement') || roles.includes('ph');
  }
  if (role === 'commerical') {
    return roles.includes('commerical') || roles.includes('commercial');
  }
  if (role === 'hod') {
    return roles.includes('hod') || roles.includes('back office hod') || roles.includes('if back office hod') || roles.some(r => r.includes('hod'));
  }
  return roles.includes(role.toLowerCase());
};

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  
  const { tasks, templates, updateTask, currentRole, scoringPolicy } = useOCRMS()

  // Find task
  const task = useMemo(() => {
    return tasks.find(t => t.id === taskId)
  }, [tasks, taskId])

  // Find template
  const template = useMemo(() => {
    if (!task) return null
    return templates.find(t => t.id === task.templateId)
  }, [templates, task])

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [remarks, setRemarks] = useState('')
  const [selfRating, setSelfRating] = useState<number>(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isEditable, setIsEditable] = useState(false)

  // Review & Rating State for Managers (RM/AVP)
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [reviewRemarks, setReviewRemarks] = useState('')

  // Initialize form states
  useEffect(() => {
    if (task && template) {
      setFormData(task.formData || {})
      setRemarks(task.oeRemarks || task.remarks || '')
      setSelfRating(task.oeRating || 0)
      setUploadedFiles(task.evidenceUrls || [])
      
      // Editable only if user matches template assigned role and status is pending, in_progress, or rejected (for revision)
      const userMatchesRole = isRoleMatch(template.assignedRoles, currentRole);
      setIsEditable(userMatchesRole && (task.status === 'pending' || task.status === 'in_progress' || task.status === 'rejected'))

      // Default review rating to template weightage
      setReviewRating(template.weightage)
      setReviewRemarks('')
    }
  }, [task, template, currentRole])

  // Check if current user can review this task
  const canReview = useMemo(() => {
    if (!task || !template) return false
    
    if (currentRole === 'rm') {
      return (task.status === 'oe_submitted' || task.status === 'submitted') && task.rmRating === undefined && template.approvalFlow?.includes('rm')
    }
    
    if (currentRole === 'zh') {
      return task.status === 'rm_approved' && task.zhRating === undefined
    }
    
    if (currentRole === 'avp') {
      return task.status === 'zh_approved' && task.avpRating === undefined && template.approvalFlow?.includes('avp')
    }

    if (currentRole === 'bh') {
      return task.status === 'avp_approved' && task.bhRating === undefined
    }

    if (currentRole === 'dr') {
      return task.status === 'bh_approved' && task.drRating === undefined
    }
    
    return false
  }, [task, template, currentRole])

  // Review score preview
  const previewScore = useMemo(() => {
    if (!task) return 0
    const oe = task.oeRating || 0
    const rm = currentRole === 'rm' ? reviewRating : (task.rmRating || 0)
    const zh = currentRole === 'zh' ? reviewRating : (task.zhRating || 0)
    const avp = currentRole === 'avp' ? reviewRating : (task.avpRating || 0)
    const bh = currentRole === 'bh' ? reviewRating : (task.bhRating || 0)
    const dr = currentRole === 'dr' ? reviewRating : (task.drRating || 0)

    if (scoringPolicy === 'average') {
      let count = 1;
      let sum = oe;
      if (rm !== 0 || task.rmRating !== undefined) { sum += rm; count++; }
      if (zh !== 0 || task.zhRating !== undefined) { sum += zh; count++; }
      if (avp !== 0 || task.avpRating !== undefined) { sum += avp; count++; }
      if (bh !== 0 || task.bhRating !== undefined) { sum += bh; count++; }
      if (dr !== 0 || task.drRating !== undefined) { sum += dr; count++; }
      return Math.round(sum / count)
    } else if (scoringPolicy === 'weighted') {
      return Math.round((0.1 * oe) + (0.15 * rm) + (0.2 * zh) + (0.25 * avp) + (0.3 * bh))
    } else {
      if (currentRole === 'dr') return dr
      if (currentRole === 'bh') return bh
      if (currentRole === 'avp') return avp
      if (currentRole === 'zh') return zh
      if (currentRole === 'rm') return rm
      return oe
    }
  }, [task, reviewRating, currentRole, scoringPolicy])

  const handleReviewSubmit = (rejectMode: boolean) => {
    if (!task || !template) return

    if (reviewRating < 0 || reviewRating > template.weightage) {
      toast.error('Validation Error', { description: `Rating must be between 0 and ${template.weightage}` })
      return
    }

    if (rejectMode && !reviewRemarks.trim()) {
      toast.error('Validation Error', { description: 'Please provide remarks explaining the rejection.' })
      return
    }

    const todayStr = new Date().toLocaleDateString('en-IN')

    if (rejectMode) {
      updateTask(task.id, {
        status: 'rejected',
        remarks: `Rejected: ${reviewRemarks}`
      })
      toast.success('Task Returned', { description: 'Task has been returned to the OE.' })
    } else {
      if (currentRole === 'rm') {
        const hasZh = template.approvalFlow?.includes('zh') || true
        updateTask(task.id, {
          rmRating: reviewRating,
          rmRemarks: reviewRemarks,
          rmReviewedDate: todayStr,
          status: hasZh ? 'rm_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasZh ? 'RM Review Complete' : 'Task Final Approved', 
          { description: hasZh ? 'Task approved and advanced to ZH queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'zh') {
        const hasAvp = template.approvalFlow?.includes('avp') || true
        updateTask(task.id, {
          zhRating: reviewRating,
          zhRemarks: reviewRemarks,
          zhReviewedDate: todayStr,
          status: hasAvp ? 'zh_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasAvp ? 'ZH Review Complete' : 'Task Final Approved',
          { description: hasAvp ? 'Task approved and advanced to AVP queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'avp') {
        const hasBh = template.approvalFlow?.includes('bh') || true
        updateTask(task.id, {
          avpRating: reviewRating,
          avpRemarks: reviewRemarks,
          avpApprovedDate: todayStr,
          status: hasBh ? 'avp_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasBh ? 'AVP Approval Complete' : 'Task Final Approved', 
          { description: hasBh ? 'Task approved and advanced to BH queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'bh') {
        const hasDr = template.approvalFlow?.includes('dr') || true
        updateTask(task.id, {
          bhRating: reviewRating,
          bhRemarks: reviewRemarks,
          bhApprovedDate: todayStr,
          status: hasDr ? 'bh_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasDr ? 'BH Approval Complete' : 'Task Final Approved', 
          { description: hasDr ? 'Task approved and advanced to DR queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'dr') {
        updateTask(task.id, {
          drRating: reviewRating,
          drRemarks: reviewRemarks,
          drApprovedDate: todayStr,
          status: 'approved',
          remarks: reviewRemarks
        })
        toast.success('DR Final Approval Complete', { description: 'Task successfully closed.' })
      }
    }
    router.push('/reviews')
  }

  console.log("TaskDetailPage Debug Info:", { taskId, totalTasks: tasks?.length, hasTask: !!task, hasTemplate: !!template, currentRole });

  if (!task || !template) {
    return (
      <div className="space-y-4 py-8 text-center">
        <AlertTriangle size={36} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Task Not Found</h2>
        <p className="text-xs text-muted-foreground">The task with ID &quot;{taskId || 'undefined'}&quot; does not exist or has been deleted.</p>
        
        <div className="mt-4 p-4 max-w-md mx-auto bg-slate-50 border rounded-xl text-left text-xs space-y-1 text-slate-600">
          <p className="font-bold text-slate-800 mb-1">Diagnostic Details:</p>
          <p>• URL Parameter (taskId): <span className="font-mono bg-slate-200 px-1 rounded">{String(taskId)}</span></p>
          <p>• Total Tasks in System: <span className="font-mono bg-slate-250 px-1 rounded">{tasks?.length || 0}</span></p>
          <p>• Task Record Found: <span className={`font-bold ${task ? 'text-emerald-600' : 'text-red-600'}`}>{task ? 'YES' : 'NO'}</span></p>
          <p>• Template Record Found: <span className={`font-bold ${template ? 'text-emerald-600' : 'text-red-600'}`}>{template ? 'YES' : 'NO'}</span></p>
          <p>• User Role: <span className="font-mono bg-slate-200 px-1 rounded">{currentRole}</span></p>
        </div>

        <Button onClick={() => router.push('/my-tasks')} variant="outline" className="mt-4 text-xs">
          Go Back to Tasks
        </Button>
      </div>
    )
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // Simulator for file upload
  const simulateUpload = () => {
    if (uploadedFiles.length >= 4) {
      toast.error('Limit reached', { description: 'You can upload a maximum of 4 evidence files.' })
      return
    }
    const fileTypes = template.evidenceTypes
    const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)] || 'image'
    
    let mockFileName = ''
    if (randomType === 'image') mockFileName = `audit_capture_${Date.now().toString().slice(-4)}.jpg`
    else if (randomType === 'pdf') mockFileName = `performance_document_${Date.now().toString().slice(-4)}.pdf`
    else if (randomType === 'excel') mockFileName = `data_ledger_${Date.now().toString().slice(-4)}.xlsx`
    else if (randomType === 'video') mockFileName = `现场视频_record_${Date.now().toString().slice(-4)}.mp4`
    else if (randomType === 'audio') mockFileName = `grievance_voice_${Date.now().toString().slice(-4)}.wav`
    else mockFileName = `signature_handover_${Date.now().toString().slice(-4)}.png`

    setUploadedFiles(prev => [...prev, mockFileName])
    toast.success('File Uploaded', { description: `Simulated upload of ${mockFileName} completed successfully.` })
  }

  const deleteUploadedFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // Save as Draft
  const handleSaveDraft = () => {
    updateTask(task.id, {
      formData,
      status: 'in_progress',
      evidenceUrls: uploadedFiles,
      evidenceCount: uploadedFiles.length,
      oeRemarks: remarks,
      oeRating: selfRating
    })
    toast.success('Draft Saved', { description: 'Task has been marked as In Progress.' })
  }

  // Submit Task
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    for (const field of template.formSchema) {
      if (field.required && (formData[field.id] === undefined || formData[field.id] === '')) {
        toast.error('Validation Error', { description: `Please fill out required field: ${field.label}` })
        return
      }
    }

    // Validate self rating
    if (selfRating < 0 || selfRating > template.weightage) {
      toast.error('Validation Error', { description: `Self rating must be between 0 and ${template.weightage}` })
      return
    }

    // Update state in context
    updateTask(task.id, {
      formData,
      status: 'oe_submitted',
      evidenceUrls: uploadedFiles,
      evidenceCount: uploadedFiles.length,
      oeRemarks: remarks,
      oeRating: selfRating,
      oeSubmittedDate: new Date().toLocaleDateString('en-IN')
    })

    toast.success('Task Submitted', { description: 'Task submitted successfully for Regional Manager review.' })
    router.push('/my-tasks')
  }

  const getApprovalFlowText = (text?: string) => {
    if (!text) return 'None';
    let updated = text;
    if (updated.includes('RM') && !updated.includes('ZH')) {
      updated = updated.replace('RM', 'RM → ZH');
    }
    if (updated.includes('BH') && !updated.includes('DR')) {
      updated = updated.replace('BH', 'BH → DR');
    }
    return updated;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'My Tasks', href: '/my-tasks' },
          { label: task.taskName }
        ]}
      />

      {/* Header Back Button */}
      <button
        onClick={() => router.push('/my-tasks')}
        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer outline-none"
      >
        <ArrowLeft size={14} /> Back to My Tasks
      </button>

      {/* Task Summary Banner */}
      <Card className="shadow-soft overflow-hidden border">
        <div className="bg-slate-50 border-b px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[9px] bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {template.code}
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-1">{task.taskName}</h2>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              task.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
              task.status === 'submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-250' :
              task.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-250' :
              'bg-amber-50 text-amber-700 border-amber-250'
            }`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4 p-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{task.category}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Frequency</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 uppercase tracking-wide">{task.frequency}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Weightage (Max Score)</p>
            <p className="text-xs font-extrabold text-indigo-600 mt-0.5">{task.weightage} Points</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{task.dueDate}</p>
          </div>
          <div className="col-span-2 border-t pt-3 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Role(s)</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {template?.assignedRoles ? (
                template.assignedRoles.split(',').map(role => (
                  <span key={role} className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-350 shadow-sm">
                    {role.trim()}
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold text-slate-700">None</span>
              )}
            </div>
          </div>
          <div className="col-span-2 border-t pt-3 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Approval Flow</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">{getApprovalFlowText(template?.approvalFlowText)}</p>
          </div>
          <div className="col-span-2 border-t pt-3 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Site Details</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{task.siteName}</p>
          </div>
          <div className="col-span-2 border-t pt-3 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Client Name</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{task.clientName}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Specialized Site Visit Report Form ── */}
      {template.id === 'TPL-OPS-001' ? (
        <div className="space-y-6">
          {/* Show summary view for reviewers */}
          {(task.status === 'oe_submitted' || task.status === 'submitted' || task.status === 'rm_approved' || task.status === 'zh_approved' || task.status === 'avp_approved' || task.status === 'bh_approved' || task.status === 'approved') && task.formData?.visitType ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <SiteVisitSummary
                data={task.formData as unknown as SiteVisitReportData}
                siteName={task.siteName || ''}
                clientName={task.clientName || ''}
                supervisorName={task.assignedTo || ''}
                visitDate={task.oeSubmittedDate || task.dueDate || ''}
              />
              {/* Review sidebar for managers */}
              {canReview && (
                <aside>
                  <Card className="shadow-soft border rounded-2xl bg-indigo-50/20 border-indigo-250">
                    <CardHeader className="border-b pb-3.5 bg-indigo-50/30">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                        <Shield size={16} className="text-indigo-600" /> Manager Evaluation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="svr-reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                          Assign Audit Score (0 to {template.weightage})
                        </Label>
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="range" id="svr-reviewRating" min="0" max={template.weightage} step="1"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                            {reviewRating} / {template.weightage}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="svr-reviewRemarks" className="text-xs font-bold text-slate-700">Audit Remarks</Label>
                        <textarea
                          id="svr-reviewRemarks" value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Enter audit observations..."
                          rows={3}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Button type="button" variant="outline" onClick={() => handleReviewSubmit(true)}
                          className="flex-1 h-9 rounded-xl text-xs text-rose-600 border-rose-250 hover:bg-rose-50 font-semibold">
                          Return
                        </Button>
                        <Button type="button" onClick={() => handleReviewSubmit(false)}
                          className="flex-1 h-9 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-semibold shadow-md border-0">
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              )}
            </div>
          ) : (
            /* Show editable form for OE */
            <SiteVisitReportForm
              taskId={task.id}
              siteName={task.siteName || ''}
              clientName={task.clientName || ''}
              supervisorName={task.assignedTo || ''}
              employeeId={task.id.split('-').pop() || ''}
              disabled={!isEditable}
              initialData={task.formData?.visitType ? (task.formData as unknown as Partial<SiteVisitReportData>) : undefined}
              onSubmit={(svrData) => {
                updateTask(task.id, {
                  formData: svrData as any,
                  status: 'oe_submitted',
                  oeSubmittedDate: new Date().toLocaleDateString('en-IN'),
                  oeRating: Math.round((svrData.overallSiteHealthScore / 100) * template.weightage),
                  oeRemarks: svrData.supervisorRemarks || svrData.positiveRecognition,
                  evidenceCount: svrData.photos.length,
                })
                toast.success('Site Visit Report Submitted', { description: 'Report submitted for Regional Manager review.' })
                router.push('/my-tasks')
              }}
              onSaveDraft={(svrData) => {
                updateTask(task.id, {
                  formData: svrData as any,
                  status: 'in_progress',
                  oeRemarks: svrData.supervisorRemarks || svrData.positiveRecognition,
                  evidenceCount: svrData.photos.length,
                })
                toast.success('Draft Saved', { description: 'Site Visit Report saved as draft.' })
              }}
            />
          )}
        </div>
      ) : template.id === 'TPL-REP-001' ? (
        <div className="space-y-6">
          {/* Show summary view for reviewers */}
          {(task.status === 'oe_submitted' || task.status === 'submitted' || task.status === 'rm_approved' || task.status === 'zh_approved' || task.status === 'avp_approved' || task.status === 'bh_approved' || task.status === 'approved') && task.formData?.meetingDate ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <MOMSummary
                data={task.formData as unknown as MOMReportData}
                siteName={task.siteName || siteName}
                clientName={task.clientName || ''}
                supervisorName={task.assignedTo || ''}
              />
              {/* Review sidebar for managers */}
              {canReview && (
                <aside>
                  <Card className="shadow-soft border rounded-2xl bg-indigo-50/20 border-indigo-250">
                    <CardHeader className="border-b pb-3.5 bg-indigo-50/30">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                        <Shield size={16} className="text-indigo-600" /> Manager Evaluation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mom-reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                          Assign Score (0 to {template.weightage})
                        </Label>
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="range" id="mom-reviewRating" min="0" max={template.weightage} step="1"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                            {reviewRating} / {template.weightage}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="mom-reviewRemarks" className="text-xs font-bold text-slate-700">Audit Remarks</Label>
                        <textarea
                          id="mom-reviewRemarks" value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Enter audit observations..."
                          rows={3}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Button type="button" variant="outline" onClick={() => handleReviewSubmit(true)}
                          className="flex-1 h-9 rounded-xl text-xs text-rose-600 border-rose-250 hover:bg-rose-50 font-semibold">
                          Return
                        </Button>
                        <Button type="button" onClick={() => handleReviewSubmit(false)}
                          className="flex-1 h-9 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-semibold shadow-md border-0">
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              )}
            </div>
          ) : (
            /* Show editable form for OE */
            <MOMReportForm
              taskId={task.id}
              siteName={task.siteName || ''}
              clientName={task.clientName || ''}
              supervisorName={task.assignedTo || ''}
              disabled={!isEditable}
              initialData={task.formData?.meetingDate ? (task.formData as unknown as Partial<MOMReportData>) : undefined}
              onSubmit={(momData) => {
                updateTask(task.id, {
                  formData: momData as any,
                  status: 'oe_submitted',
                  oeSubmittedDate: new Date().toLocaleDateString('en-IN'),
                  oeRating: template.weightage,
                  oeRemarks: momData.summary,
                  evidenceCount: 0,
                })
                toast.success('MOM Report Submitted', { description: 'Report submitted for Regional Manager review.' })
                router.push('/my-tasks')
              }}
              onSaveDraft={(momData) => {
                updateTask(task.id, {
                  formData: momData as any,
                  status: 'in_progress',
                  oeRemarks: momData.summary,
                })
                toast.success('Draft Saved', { description: 'MOM Report saved as draft.' })
              }}
            />
          )}
        </div>
      ) : template.id === 'TPL-REP-003' ? (
        <div className="space-y-6">
          {/* Show summary view for reviewers */}
          {(task.status === 'oe_submitted' || task.status === 'submitted' || task.status === 'rm_approved' || task.status === 'zh_approved' || task.status === 'avp_approved' || task.status === 'bh_approved' || task.status === 'approved') && task.formData?.finalStatus ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <DailyClosureSummary
                data={task.formData as unknown as any}
                siteName={task.siteName || siteName}
                clientName={task.clientName || ''}
                supervisorName={task.assignedTo || ''}
              />
              {/* Review sidebar for managers */}
              {canReview && (
                <aside>
                  <Card className="shadow-soft border rounded-2xl bg-indigo-50/20 border-indigo-250">
                    <CardHeader className="border-b pb-3.5 bg-indigo-50/30">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                        <Shield size={16} className="text-indigo-600" /> Manager Evaluation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dc-reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                          Assign Score (0 to {template.weightage})
                        </Label>
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="range" id="dc-reviewRating" min="0" max={template.weightage} step="1"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                            {reviewRating} / {template.weightage}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="dc-reviewRemarks" className="text-xs font-bold text-slate-700">Audit Remarks</Label>
                        <textarea
                          id="dc-reviewRemarks" value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Enter audit observations..."
                          rows={3}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Button type="button" variant="outline" onClick={() => handleReviewSubmit(true)}
                          className="flex-1 h-9 rounded-xl text-xs text-rose-600 border-rose-250 hover:bg-rose-50 font-semibold">
                          Return
                        </Button>
                        <Button type="button" onClick={() => handleReviewSubmit(false)}
                          className="flex-1 h-9 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-semibold shadow-md border-0">
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              )}
            </div>
          ) : (
            /* Show editable form for OE */
            <DailyClosureForm
              taskId={task.id}
              siteName={task.siteName || ''}
              supervisorName={task.assignedTo || ''}
              disabled={!isEditable}
              initialData={task.formData?.finalStatus ? (task.formData as unknown as any) : undefined}
              onSubmit={(dcData) => {
                updateTask(task.id, {
                  formData: dcData as any,
                  status: 'oe_submitted',
                  oeSubmittedDate: new Date().toLocaleDateString('en-IN'),
                  oeRating: template.weightage,
                  oeRemarks: dcData.additionalComments,
                  evidenceCount: dcData.issuePhotos?.length || 0,
                })
                toast.success('Daily Closure Submitted', { description: 'Report submitted for Regional Manager review.' })
                router.push('/my-tasks')
              }}
              onSaveDraft={(dcData) => {
                updateTask(task.id, {
                  formData: dcData as any,
                  status: 'in_progress',
                  oeRemarks: dcData.additionalComments,
                  evidenceCount: dcData.issuePhotos?.length || 0,
                })
                toast.success('Draft Saved', { description: 'Daily Closure Report saved as draft.' })
              }}
            />
          )}
        </div>
      ) : template.id === 'TPL-OPS-003' ? (
        <div className="space-y-6">
          {(task.status === 'oe_submitted' || task.status === 'submitted' || task.status === 'rm_approved' || task.status === 'zh_approved' || task.status === 'avp_approved' || task.status === 'bh_approved' || task.status === 'approved') && task.formData?.queryResolutions ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <FinalClosingSummary
                data={task.formData as unknown as FinalClosingReportData}
                siteName={task.siteName || ''}
                clientName={task.clientName || ''}
                supervisorName={task.assignedTo || ''}
              />
              {/* Review sidebar for managers */}
              {canReview && (
                <aside>
                  <Card className="shadow-soft border rounded-2xl bg-indigo-50/20 border-indigo-250">
                    <CardHeader className="border-b pb-3.5 bg-indigo-50/30">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                        <Shield size={16} className="text-indigo-600" /> Manager Evaluation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fc-reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                          Assign Score (0 to {template.weightage})
                        </Label>
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="range" id="fc-reviewRating" min="0" max={template.weightage} step="1"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                            {reviewRating} / {template.weightage}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="fc-reviewRemarks" className="text-xs font-bold text-slate-700">Audit Remarks</Label>
                        <textarea
                          id="fc-reviewRemarks" value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder="Enter audit observations..."
                          rows={3}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Button type="button" variant="outline" onClick={() => handleReviewSubmit(true)}
                          className="flex-1 h-9 rounded-xl text-xs text-rose-600 border-rose-250 hover:bg-rose-50 font-semibold">
                          Return
                        </Button>
                        <Button type="button" onClick={() => handleReviewSubmit(false)}
                          className="flex-1 h-9 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-semibold shadow-md border-0">
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              )}
            </div>
          ) : (
            <FinalClosingForm
              taskId={task.id}
              siteName={task.siteName || ''}
              supervisorName={task.assignedTo || ''}
              disabled={!isEditable}
              openQueries={task.formData?.mockOpenQueries || []}
              initialData={task.formData?.queryResolutions ? (task.formData as unknown as FinalClosingReportData) : undefined}
              onSubmit={(fcData) => {
                updateTask(task.id, {
                  formData: fcData as any,
                  status: 'oe_submitted',
                  oeSubmittedDate: new Date().toLocaleDateString('en-IN'),
                  oeRating: template.weightage,
                  oeRemarks: fcData.closingRemarks,
                  evidenceCount: fcData.queryResolutions.filter(r => r.evidencePhotoId).length,
                })
                toast.success('Final Closing Report Submitted', { description: 'Report submitted for Regional Manager review.' })
                router.push('/my-tasks')
              }}
              onSaveDraft={(fcData) => {
                updateTask(task.id, {
                  formData: fcData as any,
                  status: 'in_progress',
                  oeRemarks: fcData.closingRemarks,
                  evidenceCount: fcData.queryResolutions.filter(r => r.evidencePhotoId).length,
                })
                toast.success('Draft Saved', { description: 'Final Closing Report saved as draft.' })
              }}
            />
          )}
        </div>
      ) : (

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Dynamic Execution Form */}
        <Card className="shadow-soft border rounded-2xl bg-white">
          <CardHeader className="border-b pb-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield size={16} className="text-indigo-600" /> Operational Form Data
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              Fill out the required operational metrics. Dynamic schema fields defined in Activity Master.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmitTask} className="space-y-5">
              {template.formSchema.map(field => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id} className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {/* SELECT FIELD */}
                  {field.type === 'select' && (
                    <select
                      id={field.id}
                      disabled={!isEditable}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* CHECKBOX FIELD */}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2.5 py-1.5">
                      <input
                        type="checkbox"
                        id={field.id}
                        disabled={!isEditable}
                        checked={formData[field.id] || false}
                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor={field.id} className="text-xs font-semibold text-slate-600 select-none cursor-pointer">
                        {field.placeholder || 'Confirmed and verified'}
                      </label>
                    </div>
                  )}

                  {/* TEXTAREA FIELD */}
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.id}
                      disabled={!isEditable}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Enter notes or logs...'}
                      required={field.required}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}

                  {/* NUMBER FIELD */}
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      id={field.id}
                      disabled={!isEditable}
                      value={formData[field.id] === undefined ? '' : formData[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={field.placeholder || '0'}
                      required={field.required}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {/* DATE FIELD */}
                  {field.type === 'date' && (
                    <Input
                      type="date"
                      id={field.id}
                      disabled={!isEditable}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {/* DEFAULT TEXT FIELD */}
                  {field.type === 'text' && (
                    <Input
                      type="text"
                      id={field.id}
                      disabled={!isEditable}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Enter text...'}
                      required={field.required}
                      className="h-10 rounded-xl"
                    />
                  )}
                </div>
              ))}

              {template.formSchema.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">No fields required. Continue with evidence upload.</p>
              )}

              {/* Remarks Box */}
              <div className="space-y-1.5 border-t pt-4">
                <Label htmlFor="oeRemarks" className="text-xs font-bold text-slate-700">OE Remarks & Field Comments</Label>
                <textarea
                  id="oeRemarks"
                  disabled={!isEditable}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any additional field notes or explanation..."
                  rows={2}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit triggers */}
              {isEditable && (
                <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="h-9 px-4 rounded-xl text-xs gap-1.5"
                  >
                    <Save size={13} /> Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-4 rounded-xl text-xs bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white gap-1.5 shadow-md font-semibold"
                  >
                    <Send size={12} /> Submit Task
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Evidence Upload and Scoring */}
        <aside className="space-y-6">
          {/* Manager Evaluation Card */}
          {canReview && (
            <Card className="shadow-soft border rounded-2xl bg-indigo-50/20 border-indigo-250 animate-in fade-in zoom-in duration-200">
              <CardHeader className="border-b pb-3.5 bg-indigo-50/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-950">
                  <Shield size={16} className="text-indigo-600" /> Manager Evaluation & Audit
                </CardTitle>
                <CardDescription className="text-[10px] font-semibold text-indigo-850 mt-0.5">
                  Review the evidence and dynamic responses, assign the performance score, and submit.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                    Assign Audit Score (0 to {template.weightage})
                  </Label>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="range"
                      id="reviewRating"
                      min="0"
                      max={template.weightage}
                      step="1"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-250 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                      {reviewRating} / {template.weightage}
                    </span>
                  </div>

                  {/* Calculated Score Preview */}
                  <div className="bg-white border p-2.5 rounded-xl text-center shadow-soft">
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Calculated Final Score (Policy: <span className="font-bold text-indigo-700 uppercase">{scoringPolicy}</span>)
                    </p>
                    <p className="text-lg font-extrabold text-indigo-700 mt-1">
                      {previewScore} / {template.weightage}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reviewRemarks" className="text-xs font-bold text-slate-700">Audit Remarks & Feedback</Label>
                  <textarea
                    id="reviewRemarks"
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Enter audit observations, findings or why it is returned..."
                    rows={3}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleReviewSubmit(true)}
                    className="flex-1 h-9 rounded-xl text-xs text-rose-600 border-rose-250 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-350 font-semibold transition-all"
                  >
                    Return / Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleReviewSubmit(false)}
                    className="flex-1 h-9 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-semibold shadow-md transition-all border-0 cursor-pointer"
                  >
                    Approve & Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Card */}
          <Card className="shadow-soft border rounded-2xl bg-white">
            <CardHeader className="border-b pb-3.5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileUp size={16} className="text-indigo-600" /> Evidence Attachments
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                Required Types: {template.evidenceTypes.map(e => e.toUpperCase()).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isEditable ? (
                <div
                  onClick={simulateUpload}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/5 hover:bg-indigo-50/10 rounded-xl p-4 text-center cursor-pointer transition-colors group"
                >
                  <UploadCloud size={24} className="text-indigo-500 mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
                  <p className="text-[11px] font-bold text-slate-700">Upload Evidence Document</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Max 4 files · Click to simulate file upload</p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 border p-3.5 text-center text-xs text-slate-500 font-medium italic">
                  Upload option disabled (Read Only)
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attached Evidence ({uploadedFiles.length})</p>
                  <div className="space-y-1">
                    {uploadedFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold text-slate-700">
                        <span className="truncate max-w-[200px]">{f}</span>
                        {isEditable && (
                          <button
                            onClick={() => deleteUploadedFile(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 border-0 bg-transparent cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Self Rating Card */}
          <Card className="shadow-soft border rounded-2xl bg-white">
            <CardHeader className="border-b pb-3.5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Star size={16} className="text-indigo-600" /> OE Self Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1 text-center">
                <Label htmlFor="oeRating" className="text-xs font-bold text-slate-600 block">
                  Self-Assign Performance Score (0 to {template.weightage})
                </Label>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <input
                    type="range"
                    id="oeRating"
                    min="0"
                    max={template.weightage}
                    step="1"
                    disabled={!isEditable}
                    value={selfRating}
                    onChange={(e) => setSelfRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-base font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                    {selfRating} / {template.weightage}
                  </span>
                </div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {Array.from({ length: template.weightage }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < selfRating ? 'text-amber-400 fill-amber-400 font-bold' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit History (OE -> RM -> AVP timeline) */}
          <Card className="shadow-soft border rounded-2xl bg-white">
            <CardHeader className="border-b pb-3.5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HelpCircle size={16} className="text-indigo-600" /> Approval Cycle Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative border-l-2 pl-4 ml-1 space-y-4 py-1 text-xs">
                {/* DR */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">Operation Director Approval</p>
                  <p className="text-[9px] text-muted-foreground">{task.drApprovedDate || 'Pending approval'}</p>
                  {task.drRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-emerald-600">Rating: {task.drRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.drRemarks}"</p>
                    </div>
                  )}
                </div>

                {/* BH */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.bhApprovedDate || ['bh_approved', 'approved'].includes(task.status) ? 'bg-purple-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">Business Head Approval</p>
                  <p className="text-[9px] text-muted-foreground">{task.bhApprovedDate || 'Pending approval'}</p>
                  {task.bhRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-purple-600">Rating: {task.bhRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.bhRemarks}"</p>
                    </div>
                  )}
                </div>

                {/* AVP */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.avpApprovedDate || ['avp_approved', 'bh_approved', 'approved'].includes(task.status) ? 'bg-indigo-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">AVP Operations Review</p>
                  <p className="text-[9px] text-muted-foreground">{task.avpApprovedDate || 'Pending review'}</p>
                  {task.avpRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-indigo-600">Rating: {task.avpRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.avpRemarks}"</p>
                    </div>
                  )}
                </div>

                {/* ZH */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.zhReviewedDate || ['zh_approved', 'avp_approved', 'bh_approved', 'approved'].includes(task.status) ? 'bg-sky-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">Zonal Head Review</p>
                  <p className="text-[9px] text-muted-foreground">{task.zhReviewedDate || 'Pending review'}</p>
                  {task.zhRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-sky-600">Rating: {task.zhRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.zhRemarks}"</p>
                    </div>
                  )}
                </div>

                {/* RM */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.rmReviewedDate || ['rm_approved', 'zh_approved', 'avp_approved', 'bh_approved', 'approved'].includes(task.status) ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">Regional Manager Review</p>
                  <p className="text-[9px] text-muted-foreground">{task.rmReviewedDate || 'Pending review'}</p>
                  {task.rmRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-indigo-600">Rating: {task.rmRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.rmRemarks}"</p>
                    </div>
                  )}
                </div>

                {/* OE */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    task.oeSubmittedDate ? 'bg-blue-400' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800">OE Task Submission</p>
                  <p className="text-[9px] text-muted-foreground">{task.oeSubmittedDate || 'Not submitted'}</p>
                  {task.oeRating !== undefined && (
                    <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <p className="font-bold text-indigo-600">Self Rating: {task.oeRating} / {task.weightage}</p>
                      <p className="text-[9px] italic text-slate-500">"{task.oeRemarks}"</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
      )}
    </div>
  )
}

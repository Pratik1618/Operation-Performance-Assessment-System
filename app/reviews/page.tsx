'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Clock3, Eye, FileUp, Star, XCircle, ArrowRight, Check,
  AlertTriangle, ClipboardCheck, MessageSquare, Award, RefreshCw, Send
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { OperationalTask } from '@/lib/types'
import { toast } from 'sonner'
import { sites } from '@/lib/data/ocrms-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

export default function ReviewsPage() {
  const { tasks, templates, currentRole, scoringPolicy, updateTask, currentUser } = useOCRMS()

  // Selected task for review modal
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null)
  
  // Review inputs
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false) // Toggle between approve / reject

  // RM Queue: Tasks submitted by OE (status = 'oe_submitted') for sites assigned to this RM
  const rmQueue = useMemo(() => {
    return tasks.filter(t => {
      const isStatusMatch = t.status === 'oe_submitted' || (t.status === 'submitted' && t.rmRating === undefined)
      if (!isStatusMatch) return false
      const tpl = templates.find(temp => temp.id === t.templateId)
      if (tpl && !tpl.approvalFlow?.includes('rm')) return false
      const site = sites.find(s => s.id === t.siteId)
      return site?.assignedRM === currentUser?.userName
    })
  }, [tasks, templates, currentUser])

  // AVP Queue: Tasks approved by RM (status = 'rm_approved') for sites assigned to this AVP
  const avpQueue = useMemo(() => {
    return tasks.filter(t => {
      const isStatusMatch = t.status === 'rm_approved' || (t.status === 'submitted' && t.rmRating !== undefined && t.avpRating === undefined)
      if (!isStatusMatch) return false
      const tpl = templates.find(temp => temp.id === t.templateId)
      if (tpl && !tpl.approvalFlow?.includes('avp')) return false
      const site = sites.find(s => s.id === t.siteId)
      return site?.assignedAVP === currentUser?.userName
    })
  }, [tasks, templates, currentUser])

  // BH Queue: Tasks approved by AVP (status = 'avp_approved')
  const bhQueue = useMemo(() => {
    return tasks.filter(t => t.status === 'avp_approved' && t.bhRating === undefined)
  }, [tasks])

  // OE / HR / Procurement Queue: Tasks executed by matching roles that are submitted or returned/rejected
  const oeQueue = useMemo(() => {
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

    return tasks.filter(t => {
      const isValidStatus = ['oe_submitted', 'rm_approved', 'avp_approved', 'rejected', 'submitted'].includes(t.status);
      if (!isValidStatus) return false;

      const tpl = templates.find(temp => temp.id === t.templateId);
      if (!tpl) return false;
      if (!isRoleMatch(tpl.assignedRoles, currentRole)) return false;

      if (currentRole === 'oe') {
        return t.assignedTo === currentUser?.userName;
      }
      return true;
    });
  }, [tasks, templates, currentRole, currentUser])

  const activeTemplate = useMemo(() => {
    if (!selectedTask) return null
    return templates.find(t => t.id === selectedTask.templateId)
  }, [templates, selectedTask])

  const handleOpenReview = (task: OperationalTask, rejectMode = false) => {
    setSelectedTask(task)
    const tpl = templates.find(t => t.id === task.templateId)
    // Default review rating to max weightage or current role rating
    setReviewRating(tpl ? tpl.weightage : 4)
    setReviewRemarks('')
    setIsRejecting(rejectMode)
    setShowReviewModal(true)
  }

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !activeTemplate) return

    if (reviewRating < 0 || reviewRating > activeTemplate.weightage) {
      toast.error('Validation Error', { description: `Rating must be between 0 and ${activeTemplate.weightage}` })
      return
    }

    const todayStr = new Date().toLocaleDateString('en-IN')

    if (isRejecting) {
      // Send task back to OE
      updateTask(selectedTask.id, {
        status: 'rejected',
        remarks: `Rejected: ${reviewRemarks}`
      })
      toast.success('Task Sent Back', { description: 'The task has been returned to the OE.' })
    } else {
      if (currentRole === 'rm') {
        const hasAvp = activeTemplate.approvalFlow?.includes('avp')
        updateTask(selectedTask.id, {
          rmRating: reviewRating,
          rmRemarks: reviewRemarks,
          rmReviewedDate: todayStr,
          status: hasAvp ? 'rm_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasAvp ? 'AE Review Complete' : 'Task Final Approved', 
          { description: hasAvp ? 'Task approved and advanced to AVP queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'avp') {
        updateTask(selectedTask.id, {
          avpRating: reviewRating,
          avpRemarks: reviewRemarks,
          avpApprovedDate: todayStr,
          status: 'avp_approved',
          remarks: reviewRemarks
        })
        toast.success('AVP Approval Complete', { description: 'Task approved and advanced to BH queue.' })
      } else if (currentRole === 'bh') {
        updateTask(selectedTask.id, {
          bhRating: reviewRating,
          bhRemarks: reviewRemarks,
          bhApprovedDate: todayStr,
          status: 'bh_approved',
          remarks: reviewRemarks
        })
        toast.success('BH Final Approval Complete', { description: 'Task successfully closed.' })
      } else {
        toast.error('Permission Denied', { description: 'You must be in RM, AVP, or BH role to perform reviews.' })
      }
    }

    setShowReviewModal(false)
    setSelectedTask(null)
  }

  // Simulator to calculate score preview based on approval level
  const previewScore = (task: OperationalTask, rating: number) => {
    const oe = task.oeRating || 0
    const rm = currentRole === 'rm' ? rating : (task.rmRating || 0)
    const avp = currentRole === 'avp' ? rating : (task.avpRating || 0)
    const bh = currentRole === 'bh' ? rating : (task.bhRating || 0)

    let activeRating = oe
    if (currentRole === 'bh') {
      activeRating = bh
    } else if (currentRole === 'avp' || task.avpRating !== undefined) {
      activeRating = avp
    } else if (currentRole === 'rm' || task.rmRating !== undefined) {
      activeRating = rm
    }
    
    return activeRating * task.weightage
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reviews & Approvals' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 shadow-md">
            <ClipboardCheck className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reviews & Approvals</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review, rate, and approve operational performance tasks submitted by OEs.
            </p>
          </div>
        </div>
        
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-soft">
          Active Role: <span className="uppercase text-[11px] bg-indigo-100 px-1.5 py-0.5 rounded ml-1">{currentRole}</span>
        </div>
      </div>

      <div className="w-full">
        {/* TASK SUBMISSIONS & REVISIONS QUEUE CARD */}
        {(currentRole !== 'rm' && currentRole !== 'avp' && currentRole !== 'bh') && (
          <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
            <CardHeader className="pb-3 border-b bg-slate-50/65">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">My Submissions & Revisions Queue</CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Track the approval progress of your submitted tasks, and revise returned tasks.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{oeQueue.length} Active Tasks</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 divide-y">
              {oeQueue.map(task => {
                let statusBadge = '';
                let statusText = '';
                let showReviseButton = false;

                if (task.status === 'rejected') {
                  statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  statusText = 'Returned for Revision';
                  showReviseButton = true;
                } else if (task.status === 'oe_submitted' || task.status === 'submitted') {
                  statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  statusText = 'Awaiting RM Review';
                } else if (task.status === 'rm_approved') {
                  statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  statusText = 'Awaiting AVP Review';
                } else if (task.status === 'avp_approved') {
                  statusBadge = 'bg-violet-50 text-violet-700 border-violet-200';
                  statusText = 'Awaiting BH Final Approval';
                }

                return (
                  <div key={task.id} className="p-6 hover:bg-slate-50/30 transition-colors group">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Col 1: Task Info & Site */}
                      <div className="md:col-span-4 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">{task.frequency}</span>
                          <p className="text-sm md:text-base font-bold text-slate-800 truncate">{task.taskName}</p>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1.5 truncate">
                          {task.siteName} <span className="text-slate-300 mx-1.5">·</span> {task.clientName}
                        </p>
                      </div>

                      {/* Col 2: Status */}
                      <div className="md:col-span-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] md:text-xs font-extrabold uppercase tracking-wider ${statusBadge}`}>
                          {statusText}
                        </span>
                      </div>

                      {/* Col 3: Dates & Self Rating */}
                      <div className="md:col-span-3 text-xs md:text-sm text-slate-600 font-medium space-y-1">
                        <div><span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide mr-1">Due:</span> {task.dueDate}</div>
                        {task.oeSubmittedDate && (
                          <div><span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide mr-1">Submitted:</span> {task.oeSubmittedDate}</div>
                        )}
                        <div className="flex items-center flex-wrap gap-2.5">
                          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide mr-1">Self-Rating:</span> 
                          <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">{task.oeRating} / {task.weightage}</span>
                          {task.oeRating !== undefined && (
                            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                              Score: {task.oeRating * task.weightage} / {task.weightage * task.weightage}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Col 4: Action Buttons */}
                      <div className="md:col-span-2 flex justify-end items-center gap-2 flex-shrink-0">
                        {showReviseButton ? (
                          <Link href={`/tasks/${task.id}`} className="w-full md:w-auto">
                            <Button
                              size="default"
                              className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 shadow-sm border-0 cursor-pointer w-full"
                            >
                              <RefreshCw size={13} className="animate-spin-slow" /> Revise & Resubmit
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/tasks/${task.id}`} className="w-full md:w-auto">
                            <Button
                              variant="outline"
                              size="default"
                              className="h-9 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-800 rounded-xl gap-1.5 cursor-pointer w-full"
                            >
                              <Eye size={13} /> View Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Feedback Row snippet if rejected */}
                    {task.remarks && (
                      <div className="mt-3 bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 text-xs md:text-sm italic text-rose-800 font-semibold max-w-5xl">
                        Feedback / Return Reason: "{task.remarks}"
                      </div>
                    )}
                  </div>
                );;
              })}
              {oeQueue.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-xs font-semibold">
                  You have no submitted tasks in the approval cycle.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RM REVIEW QUEUE CARD */}
        {currentRole === 'rm' && (
          <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
            <CardHeader className="pb-3 border-b bg-slate-50/65">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">Regional Manager Review Queue</CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Submitted tasks awaiting first-level RM authorization and rating.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{rmQueue.length} Pending</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 divide-y">
              {rmQueue.map(task => (
                <div key={task.id} className="p-6 hover:bg-slate-50/30 transition-colors group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Col 1: Task & Site */}
                    <div className="md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">{task.frequency}</span>
                        <p className="text-sm md:text-base font-bold text-slate-800 truncate">{task.taskName}</p>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1.5 truncate">
                        {task.siteName} <span className="text-slate-300 mx-1.5">·</span> {task.clientName}
                      </p>
                    </div>

                    {/* Col 2: Submission & Rating */}
                    <div className="md:col-span-3 text-xs md:text-sm text-slate-600 font-medium space-y-1">
                      <div><span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide mr-1">Submitted:</span> {task.oeSubmittedDate || 'N/A'}</div>
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide mr-1">OE Rating:</span> 
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">{task.oeRating} / {task.weightage}</span>
                        {task.oeRating !== undefined && (
                          <span className="text-[11px] font-extrabold text-emerald-850 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            Score: {task.oeRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 3: OE Remarks */}
                    <div className="md:col-span-3">
                      {task.oeRemarks ? (
                        <p className="text-xs md:text-sm italic text-slate-600 font-medium line-clamp-2">
                          "{task.oeRemarks}"
                        </p>
                      ) : (
                        <span className="text-xs md:text-sm text-slate-350 italic">No remarks submitted</span>
                      )}
                    </div>

                    {/* Col 4: Buttons */}
                    <div className="md:col-span-2 flex justify-end items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleOpenReview(task, false)}
                        size="default"
                        className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5 shadow-sm cursor-pointer w-full md:w-auto"
                      >
                        <Check size={13} /> Approve
                      </Button>
                      <Button
                        onClick={() => handleOpenReview(task, true)}
                        variant="outline"
                        size="default"
                        className="h-9 text-xs font-bold text-slate-700 border-slate-200 rounded-xl gap-1.5 hover:bg-red-50 hover:text-red-705 hover:border-red-200 cursor-pointer w-full md:w-auto"
                      >
                        <XCircle size={13} /> Return
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {rmQueue.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-xs font-semibold">
                  RM Queue is currently empty.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AVP APPROVAL QUEUE CARD */}
        {currentRole === 'avp' && (
          <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
            <CardHeader className="pb-3 border-b bg-slate-50/65">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">AVP Operations Review Queue</CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    RM-reviewed tasks awaiting final AVP performance scoring.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{avpQueue.length} Pending</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 divide-y">
              {avpQueue.map(task => (
                <div key={task.id} className="p-6 hover:bg-slate-50/30 transition-colors group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Col 1: Task & Site */}
                    <div className="md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">{task.frequency}</span>
                        <p className="text-sm md:text-base font-bold text-slate-800 truncate">{task.taskName}</p>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1.5 truncate">
                        {task.siteName} <span className="text-slate-300 mx-1.5">·</span> {task.clientName}
                      </p>
                    </div>

                    {/* Col 2: Ratings */}
                    <div className="md:col-span-3 text-xs md:text-sm font-medium space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-bold min-w-[70px]">OE Rating:</span>
                        <span className="font-bold text-slate-700 bg-slate-50 border px-2 py-0.5 rounded-lg">{task.oeRating} / {task.weightage}</span>
                        {task.oeRating !== undefined && (
                          <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                            Score: {task.oeRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-indigo-500 font-bold min-w-[70px]">RM Rating:</span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">{task.rmRating} / {task.weightage}</span>
                        {task.rmRating !== undefined && (
                          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg">
                            Score: {task.rmRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Feedback Details */}
                    <div className="md:col-span-3">
                      {task.rmRemarks ? (
                        <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide block mb-0.5">RM Remarks</span>
                          "{task.rmRemarks}"
                        </p>
                      ) : (
                        <span className="text-xs md:text-sm text-slate-350 italic">No RM remarks</span>
                      )}
                    </div>

                    {/* Col 4: Buttons */}
                    <div className="md:col-span-2 flex justify-end items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleOpenReview(task, false)}
                        size="default"
                        className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5 shadow-sm cursor-pointer w-full md:w-auto"
                      >
                        <CheckCircle2 size={13} /> Final Rate
                      </Button>
                      <Button
                        onClick={() => handleOpenReview(task, true)}
                        variant="outline"
                        size="default"
                        className="h-9 text-xs font-bold text-slate-700 border-slate-200 rounded-xl gap-1.5 hover:bg-red-50 hover:text-red-750 hover:border-red-200 cursor-pointer w-full md:w-auto"
                      >
                        <XCircle size={13} /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {avpQueue.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-xs font-semibold">
                  AVP Queue is currently empty.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* BH APPROVAL QUEUE CARD */}
        {currentRole === 'bh' && (
          <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
            <CardHeader className="pb-3 border-b bg-slate-50/65">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">Business Head Approval Queue</CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    AVP-approved tasks awaiting final Business Head signoff.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{bhQueue.length} Pending</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 divide-y">
              {bhQueue.map(task => (
                <div key={task.id} className="p-6 hover:bg-slate-50/30 transition-colors group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Col 1: Task & Site */}
                    <div className="md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">{task.frequency}</span>
                        <p className="text-sm md:text-base font-bold text-slate-800 truncate">{task.taskName}</p>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1.5 truncate">
                        {task.siteName} <span className="text-slate-300 mx-1.5">·</span> {task.clientName}
                      </p>
                    </div>

                    {/* Col 2: Ratings Matrix */}
                    <div className="md:col-span-3 text-xs font-semibold space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-bold min-w-[70px]">OE Rating:</span>
                        <span className="text-slate-700 bg-slate-50 border px-2 py-0.5 rounded-lg">{task.oeRating} / {task.weightage}</span>
                        {task.oeRating !== undefined && (
                          <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                            Score: {task.oeRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-indigo-500 font-bold min-w-[70px]">RM Rating:</span>
                        <span className="text-indigo-705 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg">{task.rmRating} / {task.weightage}</span>
                        {task.rmRating !== undefined && (
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                            Score: {task.rmRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-purple-500 font-bold min-w-[70px]">AVP Rating:</span>
                        <span className="text-purple-750 bg-purple-50 border border-purple-150 px-2 py-0.5 rounded-lg">{task.avpRating} / {task.weightage}</span>
                        {task.avpRating !== undefined && (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded-md">
                            Score: {task.avpRating * task.weightage} / {task.weightage * task.weightage}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 3: AVP Remarks */}
                    <div className="md:col-span-3">
                      {task.avpRemarks ? (
                        <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide block mb-0.5">AVP Remarks</span>
                          "{task.avpRemarks}"
                        </p>
                      ) : (
                        <span className="text-xs md:text-sm text-slate-355 italic">No AVP remarks</span>
                      )}
                    </div>

                    {/* Col 4: Buttons */}
                    <div className="md:col-span-2 flex justify-end items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleOpenReview(task, false)}
                        size="default"
                        className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl gap-1.5 shadow-sm cursor-pointer w-full md:w-auto"
                      >
                        <CheckCircle2 size={13} /> Sign Off
                      </Button>
                      <Button
                        onClick={() => handleOpenReview(task, true)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold text-slate-655 border-slate-200 rounded-lg gap-1 hover:bg-red-50 hover:text-red-655 hover:border-red-200 cursor-pointer w-full md:w-auto"
                      >
                        <XCircle size={12} /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {bhQueue.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-xs font-semibold">
                  BH Queue is currently empty.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ACCESS RESTRICTED CARD FOR NON-APPROVER ROLES */}
        {!(currentRole === 'rm' || currentRole === 'avp' || currentRole === 'bh' || currentRole === 'oe' || currentRole === 'hr' || currentRole === 'procurement' || currentRole === 'dr' || currentRole === 'th' || currentRole === 'trainers' || currentRole === 'commerical' || currentRole === 'hod' || currentRole === 'hr_dr') && (
          <Card className="shadow-soft border border-indigo-150 bg-white rounded-2xl p-8 max-w-lg mx-auto text-center mt-6">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800">Access Restricted</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review queues are only accessible to managers. Your current role is set to <span className="font-extrabold text-indigo-700 uppercase bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded text-[11px]">{currentRole}</span>.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold italic">
                Please switch your role using the profile selector in the top-right header to access Regional Manager, AVP, or Business Head queues.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- REVIEW DIALOG MODAL --- */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <ClipboardCheck className="text-indigo-600" size={16} /> 
              {isRejecting ? 'Reject & Return Task' : 'Submit Review & Rating'}
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              {selectedTask?.taskName} — {selectedTask?.siteName}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && activeTemplate && (
            <form onSubmit={handleReviewSubmit} className="space-y-4 py-1.5">
              
              {/* Task Details Info box */}
              <div className="bg-slate-50 border p-3 rounded-xl space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Category</span>
                  <span className="font-semibold">{selectedTask.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">OE Self Rating</span>
                  <span className="font-extrabold text-amber-600">{selectedTask.oeRating} / {selectedTask.weightage}</span>
                </div>
                {selectedTask.rmRating !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">RM Reviewed Rating</span>
                    <span className="font-extrabold text-indigo-600">{selectedTask.rmRating} / {selectedTask.weightage}</span>
                  </div>
                )}
                {selectedTask.formData && activeTemplate.formSchema.length > 0 && (
                  <div className="border-t pt-2 mt-2 space-y-1 bg-white p-2.5 rounded-lg border">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Form Submission Data</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
                      {activeTemplate.formSchema.map(field => {
                        const val = selectedTask.formData?.[field.id]
                        let displayVal = '—'
                        if (val !== undefined && val !== null && val !== '') {
                          if (typeof val === 'boolean') {
                            displayVal = val ? 'Yes' : 'No'
                          } else {
                            displayVal = String(val)
                          }
                        }
                        return (
                          <div key={field.id} className="min-w-0">
                            <span className="text-slate-400 font-bold block text-[8.5px] uppercase tracking-wide leading-none mb-0.5">{field.label}</span>
                            <span className="text-slate-800 font-semibold block truncate leading-tight">{displayVal}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {selectedTask.oeRemarks && (
                  <div className="border-t pt-1.5 mt-1 text-[10px] text-slate-500 italic">
                    <b>OE Remarks:</b> "{selectedTask.oeRemarks}"
                  </div>
                )}
                {selectedTask.rmRemarks && (
                  <div className="border-t pt-1.5 mt-1 text-[10px] text-indigo-500 italic">
                    <b>RM Remarks:</b> "{selectedTask.rmRemarks}"
                  </div>
                )}
                {selectedTask.avpRating !== undefined && (
                  <div className="flex justify-between border-t pt-1.5 mt-1">
                    <span className="text-slate-400 font-bold">AVP Approved Rating</span>
                    <span className="font-extrabold text-indigo-650">{selectedTask.avpRating} / {selectedTask.weightage}</span>
                  </div>
                )}
                {selectedTask.avpRemarks && (
                  <div className="border-t pt-1.5 mt-1 text-[10px] text-purple-500 italic">
                    <b>AVP Remarks:</b> "{selectedTask.avpRemarks}"
                  </div>
                )}
              </div>

              {!isRejecting && (
                <div className="space-y-2">
                  <Label htmlFor="reviewRating" className="text-xs font-bold text-slate-700 block text-center">
                    Assign Score (0 to {selectedTask.weightage})
                  </Label>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="range"
                      id="reviewRating"
                      min="0"
                      max={selectedTask.weightage}
                      step="1"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl whitespace-nowrap min-w-[50px] text-center">
                      {reviewRating} / {selectedTask.weightage}
                    </span>
                  </div>

                  {/* Performance scoring policy preview */}
                  <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Calculated Score Preview (Policy: <span className="font-bold text-indigo-700 uppercase">{scoringPolicy}</span>)
                    </p>
                    <p className="text-lg font-extrabold text-indigo-700 mt-1">
                      {previewScore(selectedTask, reviewRating)} / {selectedTask.weightage * selectedTask.weightage}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="reviewRemarks" className="text-xs font-bold text-slate-700">Review Remarks & Feedback</Label>
                <textarea
                  id="reviewRemarks"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder={isRejecting ? "Explain why this task is being sent back..." : "Enter audit verification observations..."}
                  required={isRejecting}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <DialogFooter className="border-t pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="h-9 px-4 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`h-9 px-4 rounded-xl text-xs text-white gap-1.5 font-bold shadow-sm ${
                    isRejecting 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isRejecting ? <XCircle size={13} /> : <Check size={13} />}
                  {isRejecting ? 'Reject & Return' : 'Confirm & Save'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

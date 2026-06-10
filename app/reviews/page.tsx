'use client'

import { useState, useMemo } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

export default function ReviewsPage() {
  const { tasks, templates, currentRole, scoringPolicy, updateTask } = useOCRMS()

  // Selected task for review modal
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null)
  
  // Review inputs
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false) // Toggle between approve / reject

  // RM Queue: Tasks submitted by OE (status = 'oe_submitted')
  const rmQueue = useMemo(() => {
    return tasks.filter(t => t.status === 'oe_submitted' || (t.status === 'submitted' && t.rmRating === undefined))
  }, [tasks])

  // AVP Queue: Tasks approved by RM (status = 'rm_approved')
  const avpQueue = useMemo(() => {
    return tasks.filter(t => t.status === 'rm_approved' || (t.status === 'submitted' && t.rmRating !== undefined && t.avpRating === undefined))
  }, [tasks])

  // BH Queue: Tasks approved by AVP (status = 'avp_approved')
  const bhQueue = useMemo(() => {
    return tasks.filter(t => t.status === 'avp_approved' && t.bhRating === undefined)
  }, [tasks])

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
        updateTask(selectedTask.id, {
          rmRating: reviewRating,
          rmRemarks: reviewRemarks,
          rmReviewedDate: todayStr,
          status: 'rm_approved',
          remarks: reviewRemarks
        })
        toast.success('AE Review Complete', {
          description: 'Task approved and advanced to AVP queue.'
        })
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

  // Simulator to calculate score preview
  const previewScore = (task: OperationalTask, rating: number) => {
    const oe = task.oeRating || 0
    const rm = currentRole === 'rm' ? rating : (task.rmRating || 0)
    const avp = currentRole === 'avp' ? rating : (task.avpRating || 0)

    if (scoringPolicy === 'average') {
      return Math.round((oe + rm + avp) / 3)
    } else if (scoringPolicy === 'weighted') {
      return Math.round((0.15 * oe) + (0.35 * rm) + (0.5 * avp))
    } else {
      return avp
    }
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* RM REVIEW QUEUE CARD */}
        <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b bg-slate-50/65">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">1. Regional Manager Review Queue</CardTitle>
                <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  Submitted tasks awaiting first-level RM authorization and rating.
                </CardDescription>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{rmQueue.length} Pending</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y max-h-[500px] overflow-y-auto">
            {rmQueue.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 font-bold px-1.5 py-0.25 rounded text-muted-foreground uppercase">{task.frequency}</span>
                    <p className="text-xs font-bold text-slate-800 truncate">{task.taskName}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">{task.siteName} · {task.clientName}</p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1">
                    Submitted: {task.oeSubmittedDate} · Self-Rating: <span className="font-bold text-amber-600">{task.oeRating} / {task.weightage}</span>
                  </p>
                  {task.oeRemarks && (
                    <p className="text-[9px] italic text-slate-400 mt-1 max-w-[400px] truncate">"{task.oeRemarks}"</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleOpenReview(task, false)}
                    disabled={currentRole !== 'rm' && currentRole !== 'bh'}
                    size="sm"
                    className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1 shadow-sm"
                  >
                    <Check size={12} /> Approve
                  </Button>
                  <Button
                    onClick={() => handleOpenReview(task, true)}
                    disabled={currentRole !== 'rm' && currentRole !== 'bh'}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold text-slate-600 border-slate-200 rounded-lg gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <XCircle size={12} /> Return
                  </Button>
                </div>
              </div>
            ))}
            {rmQueue.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic text-xs font-semibold">
                RM Queue is currently empty.
              </div>
            )}
          </CardContent>
        </Card>

        {/* AVP APPROVAL QUEUE CARD */}
        <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b bg-slate-50/65">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">2. AVP Operations Review Queue</CardTitle>
                <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  RM-reviewed tasks awaiting final AVP performance scoring.
                </CardDescription>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{avpQueue.length} Pending</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y max-h-[500px] overflow-y-auto">
            {avpQueue.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 font-bold px-1.5 py-0.25 rounded text-muted-foreground uppercase">{task.frequency}</span>
                    <p className="text-xs font-bold text-slate-800 truncate">{task.taskName}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">{task.siteName} · {task.clientName}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-1.5 rounded-lg border max-w-sm">
                    <div className="text-[9px] text-slate-600">
                      OE Rating: <span className="font-bold text-slate-800">{task.oeRating} / {task.weightage}</span>
                    </div>
                    <div className="text-[9px] text-slate-600">
                      RM Rating: <span className="font-bold text-indigo-600">{task.rmRating} / {task.weightage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleOpenReview(task, false)}
                    disabled={currentRole !== 'avp'}
                    size="sm"
                    className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1 shadow-sm"
                  >
                    <CheckCircle2 size={12} /> Final Rate
                  </Button>
                  <Button
                    onClick={() => handleOpenReview(task, true)}
                    disabled={currentRole !== 'avp'}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold text-slate-600 border-slate-200 rounded-lg gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <XCircle size={12} /> Reject
                  </Button>
                </div>
              </div>
            ))}
            {avpQueue.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic text-xs font-semibold">
                AVP Queue is currently empty.
              </div>
            )}
          </CardContent>
        </Card>

        {/* BH APPROVAL QUEUE CARD */}
        <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b bg-slate-50/65">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">3. Business Head Approval Queue</CardTitle>
                <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  AVP-approved tasks awaiting final Business Head signoff.
                </CardDescription>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{bhQueue.length} Pending</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y max-h-[500px] overflow-y-auto">
            {bhQueue.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-slate-100 font-bold px-1.5 py-0.25 rounded text-muted-foreground uppercase">{task.frequency}</span>
                    <p className="text-xs font-bold text-slate-800 truncate">{task.taskName}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">{task.siteName} · {task.clientName}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50 p-1.5 rounded-lg border max-w-sm">
                    <div className="text-[9px] text-slate-600">
                      OE Rating: <span className="font-bold text-slate-800">{task.oeRating} / {task.weightage}</span>
                    </div>
                    <div className="text-[9px] text-slate-600">
                      RM Rating: <span className="font-bold text-indigo-650">{task.rmRating} / {task.weightage}</span>
                    </div>
                    <div className="text-[9px] text-slate-600">
                      AVP Rating: <span className="font-bold text-indigo-650">{task.avpRating} / {task.weightage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleOpenReview(task, false)}
                    disabled={currentRole !== 'bh'}
                    size="sm"
                    className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1 shadow-sm"
                  >
                    <CheckCircle2 size={12} /> Sign Off
                  </Button>
                  <Button
                    onClick={() => handleOpenReview(task, true)}
                    disabled={currentRole !== 'bh'}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold text-slate-600 border-slate-200 rounded-lg gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <XCircle size={12} /> Reject
                  </Button>
                </div>
              </div>
            ))}
            {bhQueue.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic text-xs font-semibold">
                BH Queue is currently empty.
              </div>
            )}
          </CardContent>
        </Card>
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
                      {previewScore(selectedTask, reviewRating)} / {selectedTask.weightage}
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

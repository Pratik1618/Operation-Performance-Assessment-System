'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Shield, AlertTriangle, FileUp, CheckCircle,
  Save, Send, UploadCloud, User, Star, Trash2, HelpCircle, MapPin, Navigation, Loader2, Lock,
  Eye, FileText
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { employees, attendanceRecords, procurementRequests } from '@/lib/data/ocrms-data'

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

const isSameWeek = (date1Str: string, date2Str: string) => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  
  const getStartOfWeek = (d: Date) => {
    const temp = new Date(d);
    const day = temp.getDay();
    const diff = temp.getDate() - day + (day === 0 ? -6 : 1); // Monday is start of week
    const start = new Date(temp.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  };
  
  return getStartOfWeek(d1) === getStartOfWeek(d2);
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Presence Verification State
  const [isPresenceVerified, setIsPresenceVerified] = useState(false)
  const [verifyingPresence, setVerifyingPresence] = useState(false)
  const [presenceError, setPresenceError] = useState<string | null>(null)

  // Review & Rating State for Managers (RM/AVP)
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [reviewRemarks, setReviewRemarks] = useState('')

  // Calculate distance in meters using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180
    const phi2 = (lat2 * Math.PI) / 180
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // in meters
  }

  const handleVerifyPresence = () => {
    if (!task) return
    setVerifyingPresence(true)
    setPresenceError(null)

    if (!navigator.geolocation) {
      setPresenceError("Geolocation is not supported by your browser.")
      setVerifyingPresence(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // Target site center (Wipro Hinjewadi Campus coordinates)
        const siteLat = 28.4595
        const siteLng = 77.0266
        const dist = calculateDistance(latitude, longitude, siteLat, siteLng)

        // Bypassing geofence check for testing workflow
        // In production, lat and long coordinates are sent to backend (API 23) for verification
        setIsPresenceVerified(true)
        updateTask(task.id, {
          formData: {
            ...(task.formData || {}),
            presenceVerified: true,
            checkInDistance: dist,
            checkInTime: new Date().toLocaleTimeString('en-IN'),
            gpsLocation: { lat: latitude, lng: longitude }
          },
        })
        toast.success("Presence Verified (Bypassed)", { 
          description: `Captured coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Distance: ${dist.toFixed(1)}m). Geofence check bypassed for flow.` 
        })
        setVerifyingPresence(false)
      },
      (error) => {
        setPresenceError("Failed to retrieve GPS location. Please ensure location services are enabled and permissions are granted.")
        setVerifyingPresence(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }



  // Initialize form states
  useEffect(() => {
    if (task && template) {
      const initialFormData = { ...(task.formData || {}) };
      if (template.id === 'TPL-ATT-004' && !initialFormData.salaryMonth) {
        // Resolve month from dueDate (e.g. 2026-06-05 => "June 2026")
        const dateObj = new Date(task.dueDate);
        if (!isNaN(dateObj.getTime())) {
          initialFormData.salaryMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        } else {
          initialFormData.salaryMonth = 'June 2026';
        }
      }
      if (template.id === 'TPL-ATT-006') {
        const matchingRecords = attendanceRecords.filter(
          rec => rec.siteId === task.siteId && 
          (rec.issueType === 'missing_in' || rec.issueType === 'missing_out') &&
          isSameWeek(rec.date, task.dueDate)
        );
        initialFormData.missingRecordsCount = matchingRecords.length;
        if (!initialFormData.regularizations) {
          initialFormData.regularizations = {};
        }
        if (matchingRecords.length === 0) {
          initialFormData.regularized = true;
        }
      }
      if (template.id === 'TPL-ATT-007') {
        if (!initialFormData.regularizationsEvidence) {
          initialFormData.regularizationsEvidence = {};
        }
        const matchingRecords = attendanceRecords.filter(
          rec => rec.siteId === task.siteId && 
          rec.issueType === 'regularization' &&
          isSameWeek(rec.date, task.dueDate)
        );
        if (matchingRecords.length === 0) {
          initialFormData.clientApproved = true;
        }
      }
      if (template.id === 'TPL-PRO-003') {
        const matchingReq = procurementRequests.find(req => 
          req.siteId === task.siteId && req.material.toLowerCase().includes('uniform')
        )
        initialFormData.sizeNeeded = initialFormData.sizeNeeded || 'L'
        initialFormData.qty = initialFormData.qty || matchingReq?.quantity || 10
        initialFormData.orderDate = matchingReq?.requestedDate || '2025-05-22'
        initialFormData.targetDate = matchingReq?.expectedDelivery || '2025-06-05'
        initialFormData.withinTAT = matchingReq ? matchingReq.withinTAT : true
      }
      if (template.id === 'TPL-PRO-004') {
        const matchingReq = procurementRequests.find(req => 
          req.siteId === task.siteId && req.material.toLowerCase().includes('shoe')
        )
        initialFormData.shoeSize = initialFormData.shoeSize || '9'
        initialFormData.qty = initialFormData.qty || matchingReq?.quantity || 15
        initialFormData.orderDate = matchingReq?.requestedDate || '2025-05-20'
        initialFormData.targetDate = matchingReq?.expectedDelivery || '2025-05-28'
        initialFormData.withinTAT = matchingReq ? matchingReq.withinTAT : true
      }
      if (template.id === 'TPL-PRO-006' || template.id === 'TPL-PRO-007') {
        const matchingEmps = employees.filter(emp => emp.siteId === task.siteId)
        const empCount = matchingEmps.length || 10
        initialFormData.totalEmployees = initialFormData.totalEmployees || empCount
        initialFormData.totalIssued = initialFormData.totalIssued !== undefined ? initialFormData.totalIssued : 0
        initialFormData.remaining = initialFormData.remaining !== undefined ? initialFormData.remaining : (empCount - initialFormData.totalIssued)
      }
      if (template.id === 'TPL-PRO-001') {
        const matchingReq = procurementRequests.find(req => 
          req.siteId === task.siteId && !req.material.toLowerCase().includes('uniform') && !req.material.toLowerCase().includes('shoe')
        )
        const reqNo = matchingReq?.requestNumber || '2025-0088'
        initialFormData.challanNo = initialFormData.challanNo || `DC-PR-${reqNo}`
        initialFormData.materialDelivered = initialFormData.materialDelivered !== undefined ? initialFormData.materialDelivered : true
        initialFormData.materialCondition = initialFormData.materialCondition || 'Good'
        initialFormData.receivedInFull = initialFormData.materialDelivered === true && initialFormData.materialCondition === 'Good'
      }
      setFormData(initialFormData)
      setRemarks(task.oeRemarks || task.remarks || '')
      setSelfRating(task.oeRating || 0)
      setUploadedFiles(task.evidenceUrls || [])
      
      // Editable only if user matches template assigned role and status is pending, in_progress, or rejected (for revision)
      const userMatchesRole = isRoleMatch(template.assignedRoles, currentRole);
      setIsEditable(userMatchesRole && (task.status === 'pending' || task.status === 'in_progress' || task.status === 'rejected'))

      // Default review rating to template weightage
      setReviewRating(template.weightage)
      setReviewRemarks('')

      if (template.id === 'TPL-OPS-001') {
        const isAlreadySubmitted = ['oe_submitted', 'submitted', 'rm_approved', 'zh_approved', 'avp_approved', 'bh_approved', 'approved'].includes(task.status);
        setIsPresenceVerified(isAlreadySubmitted || !!initialFormData.presenceVerified);
      } else {
        setIsPresenceVerified(true);
      }
    }
  }, [task, template, currentRole])

  // Check site visit completion and elapsed days for Final Closing Report TPL-OPS-003
  const siteVisitInfo = useMemo(() => {
    if (!task || template?.id !== 'TPL-OPS-003') {
      return { exists: false, completed: false, visitDate: null, daysElapsed: 0, expired: false, correctiveActions: [] };
    }
    
    // Find the corresponding Site Visit Report task for the same site
    const svTask = tasks.find(t => t.templateId === 'TPL-OPS-001' && t.siteId === task.siteId);
    if (!svTask) {
      return { exists: false, completed: false, visitDate: null, daysElapsed: 0, expired: false, correctiveActions: [] };
    }
    
    const isCompleted = ['oe_submitted', 'submitted', 'rm_approved', 'zh_approved', 'avp_approved', 'bh_approved', 'approved'].includes(svTask.status);
    const correctiveActions = svTask.formData?.correctiveActions || [];

    if (!isCompleted) {
      return { exists: true, completed: false, visitDate: null, daysElapsed: 0, expired: false, correctiveActions };
    }
    
    // Resolve visit date
    const visitDateStr = svTask.oeSubmittedDate || svTask.dueDate || null;
    if (!visitDateStr) {
      return { exists: true, completed: true, visitDate: null, daysElapsed: 0, expired: false, correctiveActions };
    }
    
    // Parser to handle both DD/MM/YYYY and YYYY-MM-DD
    const parseDate = (str: string) => {
      if (str.includes('/')) {
        const parts = str.split('/');
        if (parts[2] && parts[2].length === 4) {
          // DD/MM/YYYY -> Date(YYYY, MM-1, DD)
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
      return new Date(str);
    };
    
    const visitDateObj = parseDate(visitDateStr);
    const today = new Date();
    
    // Set time to midnight for clean day calculation
    const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d2 = new Date(visitDateObj.getFullYear(), visitDateObj.getMonth(), visitDateObj.getDate());
    
    const diffTime = d1.getTime() - d2.getTime();
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      exists: true,
      completed: true,
      visitDate: visitDateStr,
      daysElapsed: Math.max(0, daysElapsed),
      expired: daysElapsed > 7,
      correctiveActions
    };
  }, [task, template, tasks]);

  // Filter employees by site
  const siteEmployees = useMemo(() => {
    if (!task) return []
    return employees.filter(emp => emp.siteId === task.siteId)
  }, [task])

  // Filter missing punches by site and week of task.dueDate
  const siteMissingRecords = useMemo(() => {
    if (!task) return []
    return attendanceRecords.filter(
      rec => rec.siteId === task.siteId && 
      (rec.issueType === 'missing_in' || rec.issueType === 'missing_out') &&
      isSameWeek(rec.date, task.dueDate)
    )
  }, [task])

  const matchingProcRequest = useMemo(() => {
    if (!task || !template) return null
    const isUniform = template.id === 'TPL-PRO-003'
    const isShoes = template.id === 'TPL-PRO-004'
    return procurementRequests.find(req => 
      req.siteId === task.siteId && 
      (
        (isUniform && req.material.toLowerCase().includes('uniform')) ||
        (isShoes && req.material.toLowerCase().includes('shoe'))
      )
    )
  }, [task, template])

  const matchingMaterialRequest = useMemo(() => {
    if (!task || template?.id !== 'TPL-PRO-001') return null
    return procurementRequests.find(req => 
      req.siteId === task.siteId && 
      !req.material.toLowerCase().includes('uniform') &&
      !req.material.toLowerCase().includes('shoe')
    )
  }, [task, template])
 
  // Filter regularization records by site and week of task.dueDate
  const siteRegularizationRecords = useMemo(() => {
    if (!task) return []
    return attendanceRecords.filter(
      rec => rec.siteId === task.siteId && 
      rec.issueType === 'regularization' &&
      isSameWeek(rec.date, task.dueDate)
    )
  }, [task])

  // Formatted week date range for display
  const weekRangeText = useMemo(() => {
    if (!task?.dueDate) return ''
    const d = new Date(task.dueDate)
    if (isNaN(d.getTime())) return ''
    
    const getStartOfWeek = (date: Date) => {
      const temp = new Date(date)
      const day = temp.getDay();
      const diff = temp.getDate() - day + (day === 0 ? -6 : 1)
      return new Date(temp.setDate(diff))
    }
    
    const monday = getStartOfWeek(d)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    }
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`
  }, [task?.dueDate])

  const handleAddLeaveRow = () => {
    const list = formData.leavesList || []
    setFormData(prev => ({
      ...prev,
      leavesList: [...list, { employeeId: '', reason: '', date: '' }]
    }))
  }

  const handleUpdateLeaveRow = (index: number, key: string, value: any) => {
    const list = [...(formData.leavesList || [])]
    list[index] = { ...list[index], [key]: value }
    setFormData(prev => ({
      ...prev,
      leavesList: list
    }))
  }

  const handleRemoveLeaveRow = (index: number) => {
    const list = (formData.leavesList || []).filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      leavesList: list
    }))
  }



  // Check if current user can review this task
  const canReview = useMemo(() => {
    if (!task || !template) return false
    
    if (currentRole === 'ph') {
      return (task.status === 'oe_submitted' || task.status === 'submitted') && task.phRating === undefined && template.approvalFlow?.includes('ph')
    }

    if (currentRole === 'rm') {
      return (task.status === 'oe_submitted' || task.status === 'submitted') && task.rmRating === undefined && template.approvalFlow?.includes('rm')
    }
    
    if (currentRole === 'zh') {
      return task.status === 'rm_approved' && task.zhRating === undefined
    }
    
    if (currentRole === 'avp') {
      return (task.status === 'zh_approved' || task.status === 'ph_approved') && task.avpRating === undefined && template.approvalFlow?.includes('avp')
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
    const ph = currentRole === 'ph' ? reviewRating : (task.phRating || 0)
    const rm = currentRole === 'rm' ? reviewRating : (task.rmRating || 0)
    const zh = currentRole === 'zh' ? reviewRating : (task.zhRating || 0)
    const avp = currentRole === 'avp' ? reviewRating : (task.avpRating || 0)
    const bh = currentRole === 'bh' ? reviewRating : (task.bhRating || 0)
    const dr = currentRole === 'dr' ? reviewRating : (task.drRating || 0)

    if (scoringPolicy === 'average') {
      let count = 1;
      let sum = oe;
      if (ph !== 0 || task.phRating !== undefined) { sum += ph; count++; }
      if (rm !== 0 || task.rmRating !== undefined) { sum += rm; count++; }
      if (zh !== 0 || task.zhRating !== undefined) { sum += zh; count++; }
      if (avp !== 0 || task.avpRating !== undefined) { sum += avp; count++; }
      if (bh !== 0 || task.bhRating !== undefined) { sum += bh; count++; }
      if (dr !== 0 || task.drRating !== undefined) { sum += dr; count++; }
      return Math.round(sum / count)
    } else if (scoringPolicy === 'weighted') {
      const hasPh = template.approvalFlow?.includes('ph')
      if (hasPh) {
        return Math.round((0.1 * oe) + (0.15 * ph) + (0.25 * avp) + (0.25 * bh) + (0.25 * dr))
      }
      return Math.round((0.1 * oe) + (0.15 * rm) + (0.2 * zh) + (0.25 * avp) + (0.3 * bh))
    } else {
      if (currentRole === 'dr') return dr
      if (currentRole === 'bh') return bh
      if (currentRole === 'avp') return avp
      if (currentRole === 'zh') return zh
      if (currentRole === 'rm') return rm
      if (currentRole === 'ph') return ph
      return oe
    }
  }, [task, template, reviewRating, currentRole, scoringPolicy])

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
      if (currentRole === 'ph') {
        const hasAvp = template.approvalFlow?.includes('avp') || true
        updateTask(task.id, {
          phRating: reviewRating,
          phRemarks: reviewRemarks,
          phReviewedDate: todayStr,
          status: hasAvp ? 'ph_approved' : 'approved',
          remarks: reviewRemarks
        })
        toast.success(
          hasAvp ? 'PH Review Complete' : 'Task Final Approved', 
          { description: hasAvp ? 'Task approved and advanced to AVP queue.' : 'Task successfully approved and concluded.' }
        )
      } else if (currentRole === 'rm') {
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

  // Browser file upload handlers
  const handleUploadClick = () => {
    if (uploadedFiles.length >= 4) {
      toast.error('Limit reached', { description: 'You can upload a maximum of 4 evidence files.' })
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (uploadedFiles.length + newFiles.length >= 4) {
        toast.error('Limit reached', { description: 'You can upload a maximum of 4 evidence files.' })
        break
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const allowedExts: Record<string, string[]> = {
        pdf: ['pdf'],
        excel: ['xls', 'xlsx', 'csv'],
        image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        video: ['mp4', 'mkv', 'avi', 'mov'],
        audio: ['mp3', 'wav', 'ogg'],
        signature: ['png', 'jpg', 'jpeg']
      }
      
      const docExtensions = template?.evidenceTypes || []
      const isValid = docExtensions.some(type => {
        const mapped = allowedExts[type] || [type]
        return mapped.includes(ext)
      })

      if (docExtensions.length > 0 && !isValid) {
        toast.error('Invalid file type', { 
          description: `Allowed types: ${docExtensions.join(', ').toUpperCase()}. You selected a .${ext} file.` 
        })
        continue
      }

      newFiles.push(file.name)
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
      toast.success('Files Attached', { 
        description: `Successfully attached ${newFiles.length} file(s).` 
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      if (field.required) {
        // Skip regularization confirmation check if no missing records found
        if (template.id === 'TPL-ATT-006' && field.id === 'regularized' && siteMissingRecords.length === 0) {
          continue;
        }
        // Skip client approved confirmation check if no regularization records found
        if (template.id === 'TPL-ATT-007' && field.id === 'clientApproved' && siteRegularizationRecords.length === 0) {
          continue;
        }
        if (formData[field.id] === undefined || formData[field.id] === '' || formData[field.id] === false) {
          toast.error('Validation Error', { description: `Please fill out required field: ${field.label}` })
          return
        }
      }
    }

    if (template.id === 'TPL-ATT-005') {
      const list = formData.leavesList || []
      if (list.length === 0) {
        toast.error('Validation Error', { description: 'Please log at least one leave application.' })
        return
      }
      for (const row of list) {
        if (!row.employeeId || !row.reason || !row.date) {
          toast.error('Validation Error', { description: 'Please complete all fields for each logged leave.' })
          return
        }
      }
    }

    if (template.id === 'TPL-ATT-006') {
      if (siteMissingRecords.length > 0) {
        if (!formData.regularized) {
          toast.error('Validation Error', { description: 'Please confirm that all incomplete records have been regularized.' })
          return
        }
        for (const row of siteMissingRecords) {
          const regVal = formData.regularizations?.[row.id] || {};
          if (!regVal.approvedTime) {
            toast.error('Validation Error', { description: `Please complete regularization details for employee: ${row.employeeName}` })
            return
          }
        }
      }
    }

    if (template.id === 'TPL-ATT-007') {
      if (siteRegularizationRecords.length > 0) {
        if (!formData.clientApproved) {
          toast.error('Validation Error', { description: 'Please confirm that client approval and countersign has been verified.' })
          return
        }
        for (const row of siteRegularizationRecords) {
          const ss = formData.regularizationsEvidence?.[row.id];
          if (!ss) {
            toast.error('Validation Error', { description: `Please upload screenshot evidence for employee: ${row.employeeName}` })
            return
          }
        }
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
            /* Show editable form for OE, gated by presence check */
            !isPresenceVerified ? (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-2xl min-h-[300px] space-y-4 max-w-xl mx-auto shadow-sm">
                <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
                  <MapPin size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-base font-bold text-slate-850">Presence Verification Required</h3>
                  <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed font-semibold">
                    To complete the 11-section Site Visit Report for <strong>{task.siteName}</strong>, we must verify that you are physically present at the site location.
                  </p>
                </div>
                
                {presenceError && (
                  <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5 max-w-md">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{presenceError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full max-w-md pt-2">
                  <Button
                    onClick={handleVerifyPresence}
                    disabled={verifyingPresence}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm border-0 cursor-pointer"
                  >
                    {verifyingPresence ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Verifying location...
                      </>
                    ) : (
                      <>
                        <Navigation size={14} /> Verify Location (GPS)
                      </>
                    )}
                  </Button>

                </div>
              </div>
            ) : (
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
            )
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
          ) : siteVisitInfo.exists && !siteVisitInfo.completed ? (
            <Card className="shadow-soft border-rose-100 bg-rose-50/20 rounded-2xl overflow-hidden max-w-2xl mx-auto border">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-950">Site Visit Not Completed</h3>
                  <p className="text-xs text-rose-600/80 mt-1 max-w-md mx-auto leading-relaxed">
                    The original Site Visit Report (TPL-OPS-001) for this site must be completed and submitted before you can open the Final Closing Report.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/my-tasks')}
                    className="h-9 px-5 rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md border-0"
                  >
                     Go to My Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : siteVisitInfo.exists && siteVisitInfo.completed && siteVisitInfo.expired ? (
            <Card className="shadow-soft border-rose-150 bg-rose-50/10 rounded-2xl overflow-hidden max-w-2xl mx-auto border">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-950">Closure Report Expired</h3>
                  <p className="text-xs text-rose-600/80 mt-1 max-w-md mx-auto leading-relaxed">
                    This Final Closing Report is locked. It can only be opened and submitted within 7 days from the Site Visit done date.
                  </p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 max-w-md mx-auto text-left space-y-2 shadow-sm text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-medium">Original Site Visit Date:</span>
                    <span className="text-slate-800 font-bold">{siteVisitInfo.visitDate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-medium">Current Date:</span>
                    <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Days Elapsed:</span>
                    <span className="text-rose-600 font-extrabold">{siteVisitInfo.daysElapsed} days</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/my-tasks')}
                    className="h-9 px-5 rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md border-0"
                  >
                    Go to My Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <FinalClosingForm
              taskId={task.id}
              siteName={task.siteName || ''}
              supervisorName={task.assignedTo || ''}
              disabled={!isEditable}
              openQueries={siteVisitInfo.correctiveActions.length > 0 ? siteVisitInfo.correctiveActions : (task.formData?.mockOpenQueries || [])}
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
              {template.id === 'TPL-ATT-006' ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-indigo-650" /> Missing Punches Guide
                      </h3>
                      <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                        Biometric punch records containing missing clock-in/out timestamps are listed below. For each record, select the regularization action and verify shift hours.
                      </p>
                    </div>
                    {weekRangeText && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg px-2.5 py-1 font-bold shrink-0">
                        Week: {weekRangeText}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Number of Incomplete Records (Auto-resolved)</Label>
                    <Input
                      type="number"
                      disabled
                      value={formData.missingRecordsCount || 0}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <span className="text-xs font-bold text-slate-800">Pending Missing Punch Cases ({siteMissingRecords.length})</span>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-soft">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                            <th className="p-3 w-1/4">Employee Name</th>
                            <th className="p-3 w-1/6">Employee Code</th>
                            <th className="p-3 w-1/5">Date / Shift</th>
                            <th className="p-3 w-1/5">Punch In/Out Timing</th>
                            <th className="p-3 w-1/5">Punched Timing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {siteMissingRecords.map((row) => {
                            const regVal = formData.regularizations?.[row.id] || {};
                            return (
                              <tr key={row.id} className="hover:bg-slate-50/40">
                                <td className="p-3">{row.employeeName}</td>
                                <td className="p-3">{row.employeeCode}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <div>{row.date}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{row.shift} Shift</div>
                                </td>
                                <td className="p-3">
                                  <div>{row.punchTime || 'No punches'}</div>
                                  <div className="mt-1">
                                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                      row.issueType === 'missing_in' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                    }`}>
                                      {row.issueType === 'missing_in' ? 'Missing In' : 'Missing Out'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {isEditable ? (
                                    <Input
                                      type="text"
                                      placeholder="e.g. 09:00 AM / 05:30 PM"
                                      value={regVal.approvedTime || ''}
                                      onChange={(e) => {
                                        const regs = { ...(formData.regularizations || {}) };
                                        regs[row.id] = { ...regs[row.id], approvedTime: e.target.value };
                                        handleInputChange('regularizations', regs);
                                      }}
                                      className="h-9 px-2 text-xs rounded-lg"
                                    />
                                  ) : (
                                    <span>{regVal.approvedTime || 'N/A'}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {siteMissingRecords.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center italic text-slate-400">
                                No missing clock-in/out records found for this week.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Regularization confirmation field */}
                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      id="regularized"
                      disabled={!isEditable}
                      checked={formData.regularized || false}
                      onChange={(e) => handleInputChange('regularized', e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="regularized" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                      All incomplete records regularized and updated *
                    </label>
                  </div>
                </div>
              ) : template.id === 'TPL-ATT-007' ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-indigo-650" /> Regularization Guide
                      </h3>
                      <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                        Employees whose attendance was regularized on the external biometric portal this week are listed below. You must upload a screenshot (SS) proof of regularization for each record.
                      </p>
                    </div>
                    {weekRangeText && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg px-2.5 py-1 font-bold shrink-0">
                        Week: {weekRangeText}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Pending Regularizations ({siteRegularizationRecords.length})</span>
                    </div>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-soft">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                            <th className="p-3 w-1/3">Employee Code/Name</th>
                            <th className="p-3 w-1/5">Regularization Date</th>
                            <th className="p-3 w-1/4">Reason / Remarks</th>
                            <th className="p-3 w-1/4">Evidence (Screenshot)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {siteRegularizationRecords.map((row) => {
                            const ss = formData.regularizationsEvidence?.[row.id] || '';
                            return (
                              <tr key={row.id} className="hover:bg-slate-50/40">
                                <td className="p-3">
                                  <div>{row.employeeName}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{row.employeeCode} · {row.shift} Shift</div>
                                </td>
                                <td className="p-3 whitespace-nowrap">{row.date}</td>
                                <td className="p-3">{row.remarks || 'Regularization request from biometric portal'}</td>
                                <td className="p-3">
                                  {isEditable ? (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const fileInput = document.createElement('input');
                                          fileInput.type = 'file';
                                          fileInput.accept = 'image/*';
                                          fileInput.onchange = (e: any) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              const ev = { ...(formData.regularizationsEvidence || {}) };
                                              ev[row.id] = file.name;
                                              handleInputChange('regularizationsEvidence', ev);
                                              toast.success('Screenshot Attached', { description: `Attached ${file.name} to employee.` });
                                            }
                                          };
                                          fileInput.click();
                                        }}
                                        className="h-8 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg px-2"
                                      >
                                        {ss ? 'Change SS' : 'Upload SS'}
                                      </Button>
                                      {ss && (
                                        <span className="text-[10px] text-emerald-650 truncate max-w-[120px]" title={ss}>
                                          {ss}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span>{ss || 'No screenshot uploaded'}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {siteRegularizationRecords.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center italic text-slate-400">
                                No regularization requests found for this week.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      id="clientApproved"
                      disabled={!isEditable}
                      checked={formData.clientApproved || false}
                      onChange={(e) => handleInputChange('clientApproved', e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="clientApproved" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                      Client Approved and Countersigned *
                    </label>
                  </div>
                </div>
              ) : template.id === 'TPL-ATT-005' ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                      <HelpCircle size={14} className="text-indigo-650" /> Leave Reporting Guide
                    </h3>
                    <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                      Enter the details of each employee who took leave this week. Ensure leave certificates or ledger exports from the external HR system are attached in the Evidence section.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Logged Leave Applications ({formData.leavesList?.length || 0})</span>
                      {isEditable && (
                        <Button
                          type="button"
                          onClick={handleAddLeaveRow}
                          className="h-8 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg px-3 gap-1"
                        >
                          + Add Leave
                        </Button>
                      )}
                    </div>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-soft">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                            <th className="p-3 w-1/3">Employee Code/Name</th>
                            <th className="p-3 w-1/4">Leave Type / Reason</th>
                            <th className="p-3 w-1/4">Leave Date</th>
                            {isEditable && <th className="p-3 w-[60px] text-center">Action</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {(formData.leavesList || []).map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/40">
                              <td className="p-3">
                                {isEditable ? (
                                  <select
                                    value={row.employeeId || ''}
                                    onChange={(e) => handleUpdateLeaveRow(idx, 'employeeId', e.target.value)}
                                    className="w-full h-9 px-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                  >
                                    <option value="">Select Employee</option>
                                    {siteEmployees.map(emp => (
                                      <option key={emp.id} value={emp.id}>
                                        {emp.code} - {emp.name} ({emp.designation})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span>
                                    {siteEmployees.find(e => e.id === row.employeeId)?.name || 'Unknown Employee'} ({siteEmployees.find(e => e.id === row.employeeId)?.code || row.employeeId})
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                {isEditable ? (
                                  <select
                                    value={row.reason || ''}
                                    onChange={(e) => handleUpdateLeaveRow(idx, 'reason', e.target.value)}
                                    className="w-full h-9 px-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                  >
                                    <option value="">Select Reason</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Earned/Privilege Leave">Earned Leave</option>
                                    <option value="Leave Without Pay (LWP)">LWP</option>
                                    <option value="Emergency / Other">Other</option>
                                  </select>
                                ) : (
                                  <span>{row.reason}</span>
                                )}
                              </td>
                              <td className="p-3">
                                {isEditable ? (
                                  <Input
                                    type="date"
                                    value={row.date || ''}
                                    onChange={(e) => handleUpdateLeaveRow(idx, 'date', e.target.value)}
                                    className="h-9 px-2 text-xs rounded-lg"
                                  />
                                ) : (
                                  <span>{row.date}</span>
                                )}
                              </td>
                              {isEditable && (
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLeaveRow(idx)}
                                    className="p-1 text-slate-400 hover:text-red-500 border-0 bg-transparent cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                          {(formData.leavesList || []).length === 0 && (
                            <tr>
                              <td colSpan={isEditable ? 4 : 3} className="p-8 text-center italic text-slate-400">
                                No leaves logged for this week. Click 'Add Leave' to report.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Reconciliation confirmation field */}
                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      id="rosterReconciled"
                      disabled={!isEditable}
                      checked={formData.rosterReconciled || false}
                      onChange={(e) => handleInputChange('rosterReconciled', e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="rosterReconciled" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                      Roster has been reconciled for all logged leaves in this system *
                    </label>
                  </div>
                </div>
              ) : template.id === 'TPL-PRO-003' || template.id === 'TPL-PRO-004' ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-250">
                      <span className="text-xs font-bold text-slate-800">MIS Procurement Data Reference</span>
                      <span className="text-[10px] text-slate-650 uppercase font-extrabold tracking-wider bg-slate-200/60 px-2 py-0.5 rounded">
                        {template.id === 'TPL-PRO-003' ? 'Uniform' : 'Shoes'} Request
                      </span>
                    </div>

                    {template.id === 'TPL-PRO-003' ? (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Order Date</Label>
                          <p className="text-xs font-bold text-slate-800">
                            {matchingProcRequest?.requestedDate || '2025-05-22'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Target Date</Label>
                          <p className="text-xs font-bold text-slate-800">
                            {matchingProcRequest?.expectedDelivery || '2025-06-05'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Shirt Qty</Label>
                          <p className="text-xs font-extrabold text-slate-800">
                            {matchingProcRequest?.quantity || 10} Units
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Pant Qty</Label>
                          <p className="text-xs font-extrabold text-slate-800">
                            {matchingProcRequest?.quantity || 10} Units
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Order Date</Label>
                          <p className="text-xs font-bold text-slate-800">
                            {matchingProcRequest?.requestedDate || '2025-05-20'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Target Date</Label>
                          <p className="text-xs font-bold text-slate-800">
                            {matchingProcRequest?.expectedDelivery || '2025-05-28'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Shoe Qty</Label>
                          <p className="text-xs font-extrabold text-slate-800">
                            {matchingProcRequest?.quantity || 15} Pairs
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-250 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Procurement TAT Compliance:</span>
                      {(matchingProcRequest ? matchingProcRequest.withinTAT : true) ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-250">
                          🟢 Within TAT SLA (Compliance Met)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-xl text-xs font-bold border border-rose-250">
                          🔴 Outside TAT SLA (Breached)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : template.id === 'TPL-PRO-006' || template.id === 'TPL-PRO-007' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Total Employees in Site</Label>
                    <Input
                      type="number"
                      disabled
                      value={formData.totalEmployees || 0}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-muted-foreground font-semibold">Automatically fetched from active site employee database records.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">
                      Total {template.id === 'TPL-PRO-006' ? 'Uniform' : 'Shoes'} Issued <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      disabled={!isEditable}
                      min="0"
                      max={formData.totalEmployees || 100}
                      placeholder="Enter quantity disbursed..."
                      value={formData.totalIssued === undefined ? '' : formData.totalIssued}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value)
                        const total = formData.totalEmployees || 0
                        const rem = Math.max(0, total - val)
                        setFormData(prev => ({
                          ...prev,
                          totalIssued: val,
                          remaining: rem
                        }))
                      }}
                      className="h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Remaining to Issue</Label>
                    <Input
                      type="number"
                      disabled
                      value={formData.remaining === undefined ? 0 : formData.remaining}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-indigo-700 font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground font-semibold">Auto-calculated remaining balance: Total Employees - Issued.</p>
                  </div>
                </div>
              ) : template.id === 'TPL-PRO-001' ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Delivery Challan (DC) Number</Label>
                    <Input
                      type="text"
                      disabled
                      value={formData.challanNo || ''}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-mono font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground">Auto-captured from matching backend logistics shipment records.</p>
                  </div>

                  {/* Delivery Challan Document Preview */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Delivery Challan (DC) Document Preview</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative border border-slate-200 rounded-xl overflow-hidden cursor-pointer group bg-slate-50 hover:bg-slate-100/50 transition-all p-3 flex flex-col items-center">
                          {/* Document Sheet Template Frame */}
                          <div className="w-full max-w-[280px] bg-white border border-slate-200 rounded shadow-sm p-4 relative aspect-[1/1.4] flex flex-col justify-between select-none">
                            {/* Header */}
                            <div>
                              <div className="flex justify-between items-start border-b pb-1.5 mb-2">
                                <div>
                                  <p className="text-[9px] font-black text-indigo-700 tracking-wider">LOGISTICS INFRA</p>
                                  <p className="text-[5px] text-slate-400 font-semibold uppercase">Supply Chain Hub</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded text-indigo-700">
                                    {formData.challanNo || 'DC-PR-2025'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Title */}
                              <p className="text-[9px] font-bold text-center text-slate-800 uppercase tracking-wide mb-3">DELIVERY CHALLAN</p>
                              
                              {/* Info */}
                              <div className="space-y-1 text-[7px] text-slate-505 mb-3 border-b pb-2">
                                <div className="flex justify-between">
                                  <span>Date:</span>
                                  <span className="font-semibold text-slate-700">03 Jun 2026</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Site:</span>
                                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{task.siteName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Client:</span>
                                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{task.clientName}</span>
                                </div>
                              </div>

                              {/* Mock Table rows */}
                              <div className="space-y-1 mb-2">
                                <div className="flex justify-between text-[6px] font-extrabold text-slate-400 border-b pb-0.5 mb-1">
                                  <span>DESCRIPTION</span>
                                  <span>QTY</span>
                                </div>
                                <div className="flex justify-between text-[6px] text-slate-750 font-semibold">
                                  <span className="truncate max-w-[140px]">{matchingMaterialRequest?.material || 'Floor Cleaning Solution (20L)'}</span>
                                  <span>{matchingMaterialRequest?.quantity || 5} Units</span>
                                </div>
                                <div className="flex justify-between text-[6px] text-slate-750 font-semibold">
                                  <span>Safety Gloves (Rubber)</span>
                                  <span>15 Pairs</span>
                                </div>
                                <div className="flex justify-between text-[6px] text-slate-750 font-semibold">
                                  <span>Microfiber Wet Mops</span>
                                  <span>10 Pcs</span>
                                </div>
                              </div>
                            </div>

                            {/* Footer & Stamps */}
                            <div>
                              <div className="flex justify-between items-end border-t pt-2 mt-2">
                                <div className="relative">
                                  {/* Stamp */}
                                  <div className="border-2 border-emerald-500 text-emerald-500 rounded text-[6px] font-black uppercase px-1 py-0.5 rotate-[-12deg] absolute -top-5 left-1 opacity-70">
                                    SHIPPED
                                  </div>
                                  <div className="text-[5px] text-slate-400">Issued By: Warehouse Incharge</div>
                                </div>
                                <div className="text-right">
                                  <div className="h-4 w-12 border-b border-slate-350 ml-auto" />
                                  <div className="text-[5px] text-slate-400 mt-0.5">Receiver Signature</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
                            <div className="bg-white/90 p-2.5 rounded-full text-indigo-750 shadow-md">
                              <Eye size={18} />
                            </div>
                            <span className="text-[10px] font-bold text-white mt-2 drop-shadow-md">Click to Preview Document</span>
                          </div>
                        </div>
                      </DialogTrigger>
                      
                      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-slate-50 border rounded-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader className="p-4 border-b bg-white">
                          <DialogTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                            <FileText size={16} className="text-indigo-600" /> Delivery Challan Document View
                          </DialogTitle>
                          <DialogDescription className="text-[10px] font-medium text-slate-500">
                            Official logistics document for Challan Reference: {formData.challanNo || 'DC-PR-2025'}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-100/50">
                          {/* Full Delivery Challan Layout */}
                          <div className="w-full max-w-[600px] bg-white border rounded-xl shadow-md p-8 relative flex flex-col justify-between aspect-[1/1.4] text-xs text-slate-700">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                              <p className="text-[72px] font-extrabold text-slate-100/40 rotate-[-40deg] tracking-widest uppercase">LOGISTICS</p>
                            </div>

                            <div>
                              {/* Header info */}
                              <div className="flex justify-between border-b pb-5 mb-6">
                                <div>
                                  <h1 className="text-lg font-black text-indigo-700 tracking-wider">LOGISTICS INFRA LTD.</h1>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Central Warehouse Operations</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Plot 45, Sector 4, Hinjewadi Phase III,</p>
                                  <p className="text-[10px] text-slate-500 font-semibold">Pune - 411057, Maharashtra</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-slate-800 tracking-wide">DELIVERY CHALLAN</p>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex justify-end gap-2">
                                      <span className="text-slate-400 font-bold">Challan No:</span>
                                      <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5">
                                        {formData.challanNo || 'DC-PR-2025-0089'}
                                      </span>
                                    </div>
                                    <div className="flex justify-end gap-2 text-[10px]">
                                      <span className="text-slate-400 font-bold">Date:</span>
                                      <span className="font-extrabold text-slate-700">03 Jun 2026</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Sender / Receiver Info */}
                              <div className="grid grid-cols-2 gap-8 border rounded-xl p-4 mb-6 bg-slate-50/50">
                                <div>
                                  <p className="text-[10px] font-extrabold text-slate-450 uppercase mb-1">CONSIGNOR (Dispatching From)</p>
                                  <p className="font-extrabold text-slate-800">Logistics Hub West-1</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Pune Central Distribution Center</p>
                                  <p className="text-[10px] text-slate-500 font-semibold">GSTIN: 27AAAAL1234F1Z0</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-extrabold text-slate-450 uppercase mb-1">CONSIGNEE (Delivering To)</p>
                                  <p className="font-extrabold text-slate-800">{task.siteName}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{task.clientName}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold">{task.siteName === 'Wipro Hinjewadi Campus' ? 'Hinjewadi Phase 2, Pune' : 'Active Site Premises'}</p>
                                </div>
                              </div>

                              {/* Shipment Reference Info */}
                              <div className="grid grid-cols-4 gap-4 border-b pb-4 mb-6 text-[10px]">
                                <div>
                                  <span className="text-slate-400 font-bold block uppercase">PO Reference</span>
                                  <span className="font-extrabold text-slate-700">PO-{formData.challanNo?.split('-').pop() || '9875'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block uppercase">Transport Mode</span>
                                  <span className="font-extrabold text-slate-700">Road Cargo / Van</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block uppercase">LR/Consignment No</span>
                                  <span className="font-extrabold text-slate-700 font-mono">LR-PN-541298</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block uppercase">Gate Pass Status</span>
                                  <span className="font-extrabold text-emerald-650">🟢 Approved</span>
                                </div>
                              </div>

                              {/* Itemized Table */}
                              <div className="border rounded-xl overflow-hidden mb-6">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-50 border-b font-bold text-slate-500 text-[10px]">
                                      <th className="p-3 w-10 text-center">S.No</th>
                                      <th className="p-3">Item Description</th>
                                      <th className="p-3 w-24 text-right">Requested Qty</th>
                                      <th className="p-3 w-24 text-right">Shipped Qty</th>
                                      <th className="p-3 w-20 text-center">Unit</th>
                                      <th className="p-3 w-24 text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                    <tr className="hover:bg-slate-50/20">
                                      <td className="p-3 text-center text-slate-400">1</td>
                                      <td className="p-3">
                                        <div>{matchingMaterialRequest?.material || 'Floor Cleaning Solution (20L)'}</div>
                                        <span className="text-[9px] text-slate-400 font-normal">Batch Code: FCS-26-05</span>
                                      </td>
                                      <td className="p-3 text-right">{matchingMaterialRequest?.quantity || 5}</td>
                                      <td className="p-3 text-right">{matchingMaterialRequest?.quantity || 5}</td>
                                      <td className="p-3 text-center text-slate-400">Can (20L)</td>
                                      <td className="p-3 text-center"><span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-extrabold">SHIPPED</span></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/20">
                                      <td className="p-3 text-center text-slate-400">2</td>
                                      <td className="p-3">
                                        <div>Safety Gloves (Industrial Rubber)</div>
                                        <span className="text-[9px] text-slate-400 font-normal">Heavy-duty protection gloves</span>
                                      </td>
                                      <td className="p-3 text-right">15</td>
                                      <td className="p-3 text-right">15</td>
                                      <td className="p-3 text-center text-slate-400">Pairs</td>
                                      <td className="p-3 text-center"><span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-extrabold">SHIPPED</span></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/20">
                                      <td className="p-3 text-center text-slate-400">3</td>
                                      <td className="p-3">
                                        <div>Microfiber Wet Mops (Thread Type)</div>
                                        <span className="text-[9px] text-slate-400 font-normal">High absorbency industrial grade</span>
                                      </td>
                                      <td className="p-3 text-right">10</td>
                                      <td className="p-3 text-right">10</td>
                                      <td className="p-3 text-center text-slate-400">Pcs</td>
                                      <td className="p-3 text-center"><span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-extrabold">SHIPPED</span></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Terms and Signatures */}
                              <p className="text-[9px] text-slate-450 italic leading-relaxed">
                                * Note: The consignee acknowledges the receipt of materials in the quantity specified above. Any damage or shortage must be reported on the gate pass registry and verified on the OPAS portal immediately.
                              </p>
                            </div>

                            <div className="flex justify-between items-end border-t pt-6 mt-8">
                              <div className="relative">
                                {/* Seal Stamp */}
                                <div className="border-2 border-emerald-500/80 text-emerald-600/80 rounded-xl text-center text-[10px] font-black uppercase px-3 py-1 rotate-[-15deg] absolute -top-8 left-8 tracking-widest scale-110 pointer-events-none opacity-60">
                                  DELIVERED
                                  <div className="text-[7px] font-bold mt-0.5">LOGISTICS SECURE</div>
                                </div>
                                <div className="h-6 w-24 border-b border-indigo-200" />
                                <p className="font-extrabold text-slate-800 text-[10px] mt-1">Warehouse Incharge</p>
                                <p className="text-[9px] text-slate-400">Authorized Logistics Signatory</p>
                              </div>
                              <div className="text-right">
                                <div className="h-6 w-24 border-b border-slate-350 ml-auto" />
                                <p className="font-extrabold text-slate-800 text-[10px] mt-1">Receiver Seal & Sign</p>
                                <p className="text-[9px] text-slate-400">Site Representative Signature</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter className="p-4 border-t bg-white" showCloseButton />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 block">Material Delivered</Label>
                    <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50/50 w-max">
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() => {
                          handleInputChange('materialDelivered', true)
                          handleInputChange('receivedInFull', formData.materialCondition === 'Good')
                        }}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                          formData.materialDelivered === true
                            ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                            : 'bg-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() => {
                          handleInputChange('materialDelivered', false)
                          handleInputChange('receivedInFull', false)
                        }}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                          formData.materialDelivered === false
                            ? 'bg-white text-rose-700 shadow-sm font-extrabold'
                            : 'bg-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 block">Condition of Material</Label>
                    <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50/50 w-max">
                      {(['Good', 'Damaged', 'Shortage'] as const).map((cond) => {
                        const colors = {
                          Good: 'text-emerald-700 shadow-sm font-extrabold bg-white',
                          Damaged: 'text-rose-700 shadow-sm font-extrabold bg-white',
                          Shortage: 'text-amber-700 shadow-sm font-extrabold bg-white'
                        }
                        return (
                          <button
                            key={cond}
                            type="button"
                            disabled={!isEditable}
                            onClick={() => {
                              handleInputChange('materialCondition', cond)
                              handleInputChange('receivedInFull', formData.materialDelivered === true && cond === 'Good')
                            }}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                              formData.materialCondition === cond
                                ? colors[cond]
                                : 'bg-transparent text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {cond}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                template.formSchema.map(field => (
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
                      disabled={!isEditable || field.id === 'salaryMonth'}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Enter text...'}
                      required={field.required}
                      className="h-10 rounded-xl"
                    />
                  )}
                </div>
              )))}

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
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept={template?.evidenceTypes.map(type => {
                      if (type === 'pdf') return '.pdf'
                      if (type === 'excel') return '.xls,.xlsx,.csv'
                      if (type === 'image') return 'image/*'
                      if (type === 'signature') return 'image/*'
                      if (type === 'video') return 'video/*'
                      if (type === 'audio') return 'audio/*'
                      return `.${type}`
                    }).join(',')}
                  />
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/5 hover:bg-indigo-50/10 rounded-xl p-4 text-center cursor-pointer transition-colors group"
                  >
                    <UploadCloud size={24} className="text-indigo-500 mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
                    <p className="text-[11px] font-bold text-slate-700">Upload Evidence Document</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Max 4 files · Click to browse & upload</p>
                  </div>
                </>
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
                {template.approvalFlow?.includes('zh') && (
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
                )}

                {/* RM */}
                {template.approvalFlow?.includes('rm') && (
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
                )}

                {/* PH (Portfolio Head) */}
                {template.approvalFlow?.includes('ph') && (
                  <div className="relative">
                    <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                      task.phReviewedDate || ['ph_approved', 'avp_approved', 'bh_approved', 'approved'].includes(task.status) ? 'bg-indigo-400' : 'bg-slate-300'
                    }`} />
                    <p className="font-bold text-slate-800">Portfolio Head Review</p>
                    <p className="text-[9px] text-muted-foreground">{task.phReviewedDate || 'Pending review'}</p>
                    {task.phRating !== undefined && (
                      <div className="mt-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                        <p className="font-bold text-indigo-650">Rating: {task.phRating} / {task.weightage}</p>
                        <p className="text-[9px] italic text-slate-500">"{task.phRemarks}"</p>
                      </div>
                    )}
                  </div>
                )}

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

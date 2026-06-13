'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, MapPin, 
  GripHorizontal, Trash2, Edit, Save, CalendarRange, Lock, Unlock, 
  DownloadCloud, CheckCircle2, AlertTriangle, BookOpen, GraduationCap, Users, 
  PlusCircle, FileText, UploadCloud, Check, AlertCircle, Send, Download
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { sites, initialTrainingSessions } from '@/lib/data/ocrms-data'
import { TrainingSession } from '@/lib/types'
import { toast } from 'sonner'


interface CalendarDay {
  day: number
  monthOffset: number
  dateStr: string
  sessions: TrainingSession[]
}

const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700', border: 'border-emerald-250', dot: 'bg-emerald-500' },
  planned: { bg: 'bg-blue-50 text-blue-700 border-blue-100', text: 'text-blue-700', border: 'border-blue-250', dot: 'bg-blue-500' },
}

export default function TrainingPlannerPage() {
  const router = useRouter()
  const { currentRole } = useOCRMS()

  // 1. Core State
  const [sessions, setSessions] = useState<TrainingSession[]>(initialTrainingSessions)
  const [plannerLocked, setPlannerLocked] = useState(false)
  const [activeTab, setActiveTab] = useState<'month' | 'week'>('month')
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'planned' | 'completed'>('all')

  // Set default view date to June 2026 (matching mock data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1))
  const todayStr = '2026-06-12' // Reference date for today in June 2026

  // 2. Add/Edit Session Dialog States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  
  const [formTopic, setFormTopic] = useState('')
  const [formSiteId, setFormSiteId] = useState(sites[0]?.id || '')
  const [formDateStr, setFormDateStr] = useState('2026-06-15')
  
  // Custom Time Dropdown states
  const [formHour, setFormHour] = useState('10')
  const [formMinute, setFormMinute] = useState('00')
  const [formPeriod, setFormPeriod] = useState('AM')

  const [formTrainer, setFormTrainer] = useState('Geeta Joshi')
  const [formTraineesCount, setFormTraineesCount] = useState(15)
  const [formStatus, setFormStatus] = useState<'planned' | 'completed'>('planned')
  const [formMode, setFormMode] = useState<'online' | 'offline'>('offline')

  // 3. Report Submission Modal States
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingSession, setReportingSession] = useState<TrainingSession | null>(null)
  const [reportActualCount, setReportActualCount] = useState(15)
  const [reportRemarks, setReportRemarks] = useState('')
  const [uploadedEvidence, setUploadedEvidence] = useState<string[]>([])

  // 4. Drag & Drop States
  const [draggedSession, setDraggedSession] = useState<TrainingSession | null>(null)
  const [dragSourceDate, setDragSourceDate] = useState<string | null>(null)

  // Auto-lock check for 26th rule
  // Since mock system date is June 12, 2026, it is before the 26th. 
  // However, we provide visual policies.
  const isPost26th = useMemo(() => {
    // Return true if system day of month is >= 26
    const today = new Date(todayStr)
    return today.getDate() >= 26
  }, [])

  // 5. Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handlePrevWeek = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7))
  }

  // 6. Filtering logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // 1. Role-based view visibility filters (Plan visibility to higher authorities)
      if (currentRole === 'trainers' && s.trainerName !== currentUser.userName) {
        return false
      }
      if (currentRole === 'oe') {
        const siteObj = sites.find(site => site.id === s.siteId)
        if (siteObj && siteObj.assignedOE !== currentUser.userName) {
          return false
        }
      }
      if (currentRole === 'rm' || currentRole === 'avp') {
        const siteObj = sites.find(site => site.id === s.siteId)
        if (siteObj && currentUser.region !== 'All' && siteObj.region !== currentUser.region) {
          return false
        }
      }

      // 2. Toolbar filter selectors
      const matchesSite = selectedSite === 'all' || s.siteId === selectedSite
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus
      const matchesTrainer = selectedTrainer === 'all' || s.trainerName === selectedTrainer
      return matchesSite && matchesStatus && matchesTrainer
    })
  }, [sessions, selectedSite, selectedStatus, selectedTrainer, currentRole, currentUser])

  // Unsubmitted past sessions checklist
  const pendingReports = useMemo(() => {
    return sessions.filter(s => {
      if (s.status !== 'planned' || s.dateStr > todayStr) return false

      // Role-based visibility
      if (currentRole === 'trainers' && s.trainerName !== currentUser.userName) {
        return false
      }
      if (currentRole === 'oe') {
        const siteObj = sites.find(site => site.id === s.siteId)
        if (siteObj && siteObj.assignedOE !== currentUser.userName) {
          return false
        }
      }
      if (currentRole === 'rm' || currentRole === 'avp') {
        const siteObj = sites.find(site => site.id === s.siteId)
        if (siteObj && currentUser.region !== 'All' && siteObj.region !== currentUser.region) {
          return false
        }
      }

      const matchesSite = selectedSite === 'all' || s.siteId === selectedSite
      const matchesTrainer = selectedTrainer === 'all' || s.trainerName === selectedTrainer
      return matchesSite && matchesTrainer
    })
  }, [sessions, selectedSite, selectedTrainer, currentRole, currentUser])

  // 7. Dynamic Calendar Grid Generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const grid: CalendarDay[] = []
    
    // Previous Month Days Offset
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const prevYear = month === 0 ? year - 1 : year
      const prevMonth = month === 0 ? 11 : month - 1
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      
      const daySessions = filteredSessions.filter(s => s.dateStr === dateStr)
      grid.push({
        day: dayNum,
        monthOffset: -1,
        dateStr,
        sessions: daySessions
      })
    }
    
    // Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const daySessions = filteredSessions.filter(s => s.dateStr === dateStr)
      
      grid.push({
        day: i,
        monthOffset: 0,
        dateStr,
        sessions: daySessions
      })
    }
    
    // Next Month Days Offset
    const totalCells = Math.ceil(grid.length / 7) * 7
    const nextDaysNeeded = totalCells - grid.length
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextYear = month === 11 ? year + 1 : year
      const nextMonth = month === 11 ? 0 : month + 1
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      
      const daySessions = filteredSessions.filter(s => s.dateStr === dateStr)
      grid.push({
        day: i,
        monthOffset: 1,
        dateStr,
        sessions: daySessions
      })
    }
    
    return grid
  }, [currentDate, filteredSessions])

  // Week Grid (Start from Sunday of the week containing currentDate)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day) // Back to Sunday
    
    const days: CalendarDay[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const daySessions = filteredSessions.filter(s => s.dateStr === dateStr)
      
      days.push({
        day: d.getDate(),
        monthOffset: d.getMonth() === currentDate.getMonth() ? 0 : d.getMonth() < currentDate.getMonth() ? -1 : 1,
        dateStr,
        sessions: daySessions
      })
    }
    return days
  }, [currentDate, filteredSessions])

  // 8. Session Add/Edit Forms Handlers
  const handleOpenAddModal = (dateStr?: string) => {
    if (plannerLocked) {
      toast.error('Planner is Locked', { description: 'Unlock the planner to add a training session.' })
      return
    }
    setEditingSession(null)
    setFormTopic('')
    setFormSiteId(sites[0]?.id || '')
    setFormDateStr(dateStr || todayStr)
    setFormHour('10')
    setFormMinute('00')
    setFormPeriod('AM')
    setFormTrainer(currentRole === 'trainers' ? currentUser.userName : 'Geeta Joshi')
    setFormTraineesCount(15)
    setFormStatus('planned')
    setFormMode('offline')
    setShowAddModal(true)
  }

  const handleOpenEditModal = (session: TrainingSession, e: React.MouseEvent) => {
    e.stopPropagation()
    if (plannerLocked) {
      toast.error('Planner is Locked', { description: 'Unlock the planner to edit training details.' })
      return
    }

    // Parse time
    const timeStr = session.time || '10:00 AM'
    const spaceParts = timeStr.split(' ')
    const colonParts = spaceParts[0].split(':')
    
    setEditingSession(session)
    setFormTopic(session.topic)
    setFormSiteId(session.siteId)
    setFormDateStr(session.dateStr)
    setFormHour(colonParts[0] || '10')
    setFormMinute(colonParts[1] || '00')
    setFormPeriod(spaceParts[1] || 'AM')
    setFormTrainer(session.trainerName)
    setFormTraineesCount(session.targetEmployeesCount)
    setFormStatus(session.status)
    setFormMode(session.mode || 'offline')
    setShowAddModal(true)
  }

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (plannerLocked) {
      toast.error('Planner is Locked', { description: 'Unlock the planner to delete sessions.' })
      return
    }
    setSessions(prev => prev.filter(s => s.id !== id))
    toast.success('Session Deleted', { description: 'Training schedule successfully removed.' })
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTopic.trim()) {
      toast.error('Validation Error', { description: 'Topic description cannot be empty.' })
      return
    }

    const targetSite = sites.find(s => s.id === formSiteId)
    const siteName = targetSite ? targetSite.name : 'Unknown Site'
    const assembledTime = `${formHour}:${formMinute} ${formPeriod}`

    if (editingSession) {
      // Edit mode
      setSessions(prev => prev.map(s => s.id === editingSession.id ? {
        ...s,
        topic: formTopic,
        siteId: formSiteId,
        siteName,
        dateStr: formDateStr,
        time: assembledTime,
        trainerName: formTrainer,
        targetEmployeesCount: formTraineesCount,
        status: formStatus,
        mode: formMode,
      } : s))
      toast.success('Session Updated', { description: 'Training details updated successfully.' })
    } else {
      // Add mode
      const newSession: TrainingSession = {
        id: `TRN_SESS_${Date.now().toString().slice(-4)}`,
        siteId: formSiteId,
        siteName,
        topic: formTopic,
        trainerName: formTrainer,
        dateStr: formDateStr,
        time: assembledTime,
        status: formStatus,
        targetEmployeesCount: formTraineesCount,
        mode: formMode
      }
      setSessions(prev => [...prev, newSession])
      toast.success('Session Scheduled', { description: 'New training session added to calendar.' })
    }
    setShowAddModal(false)
  }

  // 9. Report Submission Dialog Handlers
  const handleOpenReport = (session: TrainingSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setReportingSession(session)
    setReportActualCount(session.targetEmployeesCount)
    setReportRemarks('')
    setUploadedEvidence([])
    setShowReportModal(true)
  }

  const simulateEvidenceUpload = () => {
    const mockFiles = ['attendance_sheet.xlsx', 'training_photo.jpg', 'feedback_report.pdf']
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
    setUploadedEvidence(prev => [...prev, randomFile])
    toast.success('File Uploaded', { description: `Uploaded evidence: ${randomFile}` })
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportingSession) return

    setSessions(prev => prev.map(s => s.id === reportingSession.id ? {
      ...s,
      status: 'completed',
      targetEmployeesCount: reportActualCount, // Update with actual attendance count
    } : s))

    toast.success('Report Submitted', { description: 'Training report successfully submitted and marked as completed.' })
    setShowReportModal(false)
    setReportingSession(null)
  }

  // 10. Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, session: TrainingSession, sourceDate: string) => {
    if (plannerLocked) return
    setDraggedSession(session)
    setDragSourceDate(sourceDate)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (plannerLocked || !draggedSession) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    if (plannerLocked || !draggedSession) return
    e.preventDefault()
    if (targetDate !== dragSourceDate) {
      setSessions(prev => prev.map(s => s.id === draggedSession.id ? { ...s, dateStr: targetDate } : s))
      toast.success('Session Rescheduled', { description: `Moved training to ${targetDate}` })
    }
    setDraggedSession(null)
    setDragSourceDate(null)
  }

  const handleDragEnd = () => {
    setDraggedSession(null)
    setDragSourceDate(null)
  }

  // 11. KPIs Aggregations
  const metrics = useMemo(() => {
    const total = filteredSessions.length
    const completed = filteredSessions.filter(s => s.status === 'completed').length
    const planned = filteredSessions.filter(s => s.status === 'planned').length
    const totalTrainees = filteredSessions.reduce((acc, s) => acc + s.targetEmployeesCount, 0)
    
    return { total, completed, planned, totalTrainees }
  }, [filteredSessions])

  // Print/Export simulation
  const handleExport = () => {
    toast.success('Excel Generated', { description: 'Monthly training calendar exported in spreadsheet format.' })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Operations Performance' }, { label: 'Training Planner' }]} />

      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-md">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Training Planner Workspace</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plan, schedule, and regularize training activities and drills across all operational sites.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleOpenAddModal()}
            className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 px-4 rounded-xl shadow-md cursor-pointer border-none"
          >
            <Plus size={14} /> Schedule Training
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="h-9 rounded-xl border bg-white px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <option value="all">All Mapped Sites</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name.split(' ').slice(0, 2).join(' ')}</option>
            ))}
          </select>
          
          {currentRole !== 'trainers' && currentRole !== 'oe' && (
            <select
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="h-9 rounded-xl border bg-white px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <option value="all">All Trainers</option>
              <option value="Geeta Joshi">Geeta Joshi</option>
              <option value="Vikram Sen">Vikram Sen</option>
            </select>
          )}

          <div className="flex items-center gap-1 border rounded-xl p-1 bg-slate-50 border-slate-200">
            <button
              onClick={() => setActiveTab('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                activeTab === 'month' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >Month</button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                activeTab === 'week' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >Week</button>
          </div>

          <div className="flex items-center gap-1 border rounded-xl p-1 bg-slate-50 border-slate-200">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >All</button>
            <button
              onClick={() => setSelectedStatus('planned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                selectedStatus === 'planned' ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >Planned</button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                selectedStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-200' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >Completed</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="rounded-xl gap-1 text-xs h-9">
            <Download size={14} /> Export Plan
          </Button>
          
          {plannerLocked ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 h-9 select-none">
                <CheckCircle2 size={14} /> Plan Locked
              </div>
              <Button 
                onClick={() => {
                  setPlannerLocked(false)
                  toast.success('Planner Unlocked', { description: 'You can now schedule training sessions.' })
                }} 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-xs h-9 text-violet-750 hover:bg-violet-50 border-violet-200"
              >
                Unlock Plan
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => {
                setPlannerLocked(true)
                toast.success('Planner Locked & Submitted', { description: 'Training schedules locked for roster calculation.' })
              }} 
              className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs border-0 cursor-pointer animate-in fade-in duration-300"
            >
              <Send size={13} /> Lock & Submit
            </Button>
          )}
        </div>
      </div>

      {/* Locked deadline banner */}
      <Alert className={`rounded-xl shadow-soft border-0 ${plannerLocked ? 'bg-rose-50 text-rose-900 border-rose-250' : 'bg-amber-50 text-amber-900 border-amber-250'}`}>
        <AlertCircle className={`h-4.5 w-4.5 ${plannerLocked ? 'text-rose-600' : 'text-amber-600'}`} />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Plan Cycle Window</AlertTitle>
        <AlertDescription className="text-xs mt-1">
          ⚠️ **Policy Rule**: Training calendar for the subsequent month must be locked and submitted before the **26th** of the current month. The plan is currently <b>{plannerLocked ? 'LOCKED' : 'UNLOCKED'}</b>.
        </AlertDescription>
      </Alert>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Scheduled</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-blue-700">{metrics.planned}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Planned / Pending</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-emerald-700">{metrics.completed}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Completed Drills</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-teal-500">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-teal-700">{metrics.totalTrainees}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Trainees Mapped</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Planner Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        {/* Left Side: Calendar & Grid Workspace */}
        <div className="space-y-6 min-w-0">
          <div className="w-full">
            {activeTab === 'month' ? (
              <Card className="p-5 shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
                <CardHeader className="p-0 pb-4 border-b flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">Training Planner Month Schedule</CardTitle>
                    <CardDescription className="text-[10px] font-semibold mt-0.5">
                      {plannerLocked ? 'View-only calendar schedule.' : 'Drag sessions to reschedule, click dates to schedule, or click past sessions to submit reports.'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-slate-50 border-slate-200 shadow-sm">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-white rounded transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={14} className="text-slate-600" />
                    </button>
                    <span className="text-[10px] font-bold px-2 whitespace-nowrap text-slate-700">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-white rounded transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Next month"
                    >
                      <ChevronRight size={14} className="text-slate-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-4 flex-1">
                  <div className="grid grid-cols-7 text-center font-bold text-[10px] text-muted-foreground uppercase tracking-wider pb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1.5 border-t pt-1.5">
                    {calendarDays.map((cell, idx) => {
                      const isCurrentMonth = cell.monthOffset === 0
                      const hasSessions = cell.sessions.length > 0
                      const isToday = cell.dateStr === todayStr

                      return (
                        <div
                          key={idx}
                          onClick={() => isCurrentMonth && handleOpenAddModal(cell.dateStr)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, cell.dateStr)}
                          className={`min-h-[110px] border-2 rounded-2xl p-2 transition-all flex flex-col justify-between group ${
                            !isCurrentMonth
                              ? 'bg-slate-50/30 border-slate-100 text-slate-300 opacity-55 select-none'
                              : isToday
                                ? 'bg-amber-50/70 border-amber-300 shadow-md'
                                : draggedSession && cell.dateStr !== dragSourceDate
                                  ? 'bg-indigo-50/40 border-indigo-400 border-dashed'
                                  : hasSessions
                                    ? 'bg-indigo-50/10 border-indigo-150 hover:border-indigo-300'
                                    : 'bg-white border-slate-150 hover:bg-slate-50/50 hover:border-slate-350'
                          } ${!plannerLocked && isCurrentMonth ? 'cursor-pointer hover:shadow-sm' : ''}`}
                          role={!plannerLocked && isCurrentMonth ? 'button' : undefined}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold leading-none ${
                              !isCurrentMonth 
                                ? 'text-slate-300' 
                                : isToday
                                  ? 'text-amber-800'
                                  : hasSessions 
                                    ? 'text-indigo-600' 
                                    : 'text-slate-700'
                            }`}>
                              {cell.day}
                              {isToday && <span className="text-[7px] font-bold text-amber-600 ml-1.5">TODAY</span>}
                            </span>
                            {!plannerLocked && isCurrentMonth && (
                              <Plus size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>

                          <div className="mt-2 space-y-1 flex-1 overflow-y-auto no-scrollbar max-h-[72px]">
                            {cell.sessions.map(s => {
                              const config = statusColors[s.status] || statusColors.planned
                              const isPast = s.status === 'planned' && s.dateStr <= todayStr
                              
                              return (
                                <div
                                  key={s.id}
                                  draggable={!plannerLocked}
                                  onDragStart={(e) => handleDragStart(e, s, cell.dateStr)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleOpenEditModal(s, e)}
                                  className={`text-[8.5px] font-bold p-1 px-1.5 rounded-lg border flex flex-col gap-0.5 group/item transition-all ${config.bg} ${config.border} ${
                                    !plannerLocked ? 'cursor-move hover:scale-[1.02] hover:shadow-sm' : ''
                                  } ${draggedSession?.id === s.id ? 'opacity-40 scale-95' : ''}`}
                                  title={`${s.topic} (${s.time})`}
                                >
                                  <div className="flex items-center justify-between gap-1 w-full">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className={`px-1 py-0.2 rounded text-[7px] leading-none shrink-0 uppercase font-extrabold font-mono ${
                                        s.mode === 'online' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {s.mode}
                                      </span>
                                      <span className="truncate">{s.topic}</span>
                                    </div>
                                    
                                    {isPast ? (
                                      <button
                                        onClick={(e) => handleOpenReport(s, e)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded p-0.5 text-[7px] font-extrabold flex items-center gap-0.5 border-none cursor-pointer transition-all shrink-0"
                                        title="Training over: click to submit report"
                                      >
                                        <FileText size={7} /> Report
                                      </button>
                                    ) : (
                                      !plannerLocked && (
                                        <button
                                          onClick={(e) => handleDeleteSession(s.id, e)}
                                          className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-650 transition-all border-none bg-transparent p-0 cursor-pointer shrink-0"
                                        >
                                          <Trash2 size={9} />
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Week View */
              <Card className="p-5 shadow-soft border rounded-2xl bg-white overflow-hidden flex flex-col w-full">
                <CardHeader className="p-0 pb-4 border-b flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">Weekly Training Schedules</CardTitle>
                    <CardDescription className="text-[10px] font-semibold mt-0.5">
                      Week view planner. Drag/drop, check schedule, or add.
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-slate-50 border-slate-200 shadow-sm">
                    <button
                      onClick={handlePrevWeek}
                      className="p-1 hover:bg-white rounded transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Previous week"
                    >
                      <ChevronLeft size={14} className="text-slate-600" />
                    </button>
                    <span className="text-[10px] font-bold px-2 whitespace-nowrap text-slate-700">
                      {`Week of ${currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`}
                    </span>
                    <button
                      onClick={handleNextWeek}
                      className="p-1 hover:bg-white rounded transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Next week"
                    >
                      <ChevronRight size={14} className="text-slate-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-4 flex-1">
                  <div className="grid grid-cols-7 gap-3 min-h-[350px]">
                    {weekDays.map((cell, idx) => {
                      const isToday = cell.dateStr === todayStr
                      const hasSessions = cell.sessions.length > 0
                      const dateObj = new Date(cell.dateStr)
                      const dayName = dateObj.toLocaleDateString('default', { weekday: 'short' })

                      return (
                        <div
                          key={idx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, cell.dateStr)}
                          onClick={() => handleOpenAddModal(cell.dateStr)}
                          className={`rounded-2xl border-2 p-3.5 flex flex-col gap-3 min-h-[300px] transition-all group ${
                            isToday
                              ? 'bg-amber-50/70 border-amber-300 shadow-md'
                              : draggedSession && cell.dateStr !== dragSourceDate
                                ? 'bg-indigo-50/40 border-indigo-400 border-dashed'
                                : hasSessions
                                  ? 'bg-indigo-50/10 border-indigo-150'
                                  : 'bg-white border-slate-150 hover:bg-slate-50/40'
                          } ${!plannerLocked ? 'cursor-pointer hover:shadow-sm' : ''}`}
                        >
                          <div className="border-b pb-1.5 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{dayName}</p>
                              <p className={`text-sm font-extrabold mt-1 leading-none ${isToday ? 'text-amber-700' : 'text-slate-800'}`}>
                                {cell.day}
                              </p>
                            </div>
                            {isToday && <span className="text-[7px] font-bold text-amber-600 bg-amber-100 border border-amber-250 px-1 rounded">TODAY</span>}
                          </div>

                          <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar">
                            {cell.sessions.map(s => {
                              const config = statusColors[s.status] || statusColors.planned
                              const isPast = s.status === 'planned' && s.dateStr <= todayStr
                              
                              return (
                                <div
                                  key={s.id}
                                  draggable={!plannerLocked}
                                  onDragStart={(e) => handleDragStart(e, s, cell.dateStr)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleOpenEditModal(s, e)}
                                  className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all group/item ${config.bg} ${config.border} ${
                                    !plannerLocked ? 'cursor-move hover:scale-[1.02] hover:shadow-sm' : ''
                                  } ${draggedSession?.id === s.id ? 'opacity-40 scale-95' : ''}`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-[9.5px] font-bold leading-tight line-clamp-2">{s.topic}</span>
                                    
                                    {!plannerLocked && !isPast && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteSession(s.id, e)
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-650 transition-all border-none bg-transparent p-0 cursor-pointer"
                                      >
                                        <Trash2 size={9.5} />
                                      </button>
                                    )}
                                  </div>

                                  <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold font-mono ${
                                    s.mode === 'online' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                                  }`}>
                                    {s.mode} Mode
                                  </span>

                                  <div className="space-y-0.5 text-[8.5px] font-semibold text-slate-500">
                                    <div className="flex items-center gap-1"><Clock size={9} /> {s.time}</div>
                                    <div className="flex items-center gap-1 truncate"><MapPin size={9} /> {s.siteName.split(' ')[0]}</div>
                                    <div className="flex items-center gap-1 font-bold text-slate-605 mt-1"><Users size={9} /> {s.targetEmployeesCount} Trainees</div>
                                  </div>

                                  {isPast && (
                                    <Button
                                      onClick={(e) => handleOpenReport(s, e)}
                                      size="sm"
                                      className="h-7 text-[9px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1 border-none shadow-sm cursor-pointer mt-1"
                                    >
                                      <FileText size={9.5} /> Submit Report
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Unsubmitted Reports Checklist Sidebar */}
        <aside className="space-y-6">
          <Card className="shadow-soft border rounded-2xl bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b bg-slate-50/65">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold text-slate-800">Unsubmitted Reports</CardTitle>
                  <CardDescription className="text-[9px] font-semibold text-muted-foreground mt-0.5">
                    Drills completed that are pending evidence report submission.
                  </CardDescription>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {pendingReports.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[480px] overflow-y-auto divide-y divide-slate-100">
              {pendingReports.map(s => (
                <div key={s.id} className="p-4 hover:bg-slate-50/45 transition-all space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{s.topic}</p>
                    <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                      Report Due
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold font-mono ${
                      s.mode === 'online' ? 'bg-indigo-100 text-indigo-750' : 'bg-orange-100 text-orange-750'
                    }`}>
                      {s.mode}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-500 font-semibold space-y-0.5">
                    <div className="flex items-center gap-1"><Clock size={9} /> {s.dateStr} at {s.time}</div>
                    <div className="flex items-center gap-1"><MapPin size={9} /> {s.siteName}</div>
                  </div>
                  <Button
                    onClick={(e) => handleOpenReport(s, e)}
                    size="sm"
                    className="h-7 w-full text-[9px] font-bold bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg gap-1 border-none shadow-sm cursor-pointer"
                  >
                    <FileText size={9.5} /> Submit Report
                  </Button>
                </div>
              ))}
              {pendingReports.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic text-[10px] font-semibold">
                  All training reports are up to date!
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* --- ADD / EDIT SESSION DIALOG MODAL --- */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <PlusCircle className="text-indigo-600" size={16} /> 
              {editingSession ? 'Edit Scheduled Session' : 'Schedule Training Session'}
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              {editingSession ? 'Update details of this training session.' : 'Create a new training session on the planner calendar.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSession} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="topic" className="text-xs font-bold text-slate-700">Training Topic / Drill Name</Label>
              <textarea
                id="topic"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="e.g. Fire safety drill, grooming compliance, customer service..."
                required
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="site" className="text-xs font-bold text-slate-700">Assign Site Location</Label>
                <select
                  id="site"
                  value={formSiteId}
                  onChange={(e) => setFormSiteId(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="trainer" className="text-xs font-bold text-slate-700">Trainer / Lead Coordinator</Label>
                <Input
                  id="trainer"
                  value={formTrainer}
                  onChange={(e) => setFormTrainer(e.target.value)}
                  placeholder="Trainer Name"
                  required
                  disabled={currentRole === 'trainers'}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs font-bold text-slate-700">Scheduled Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDateStr}
                  onChange={(e) => setFormDateStr(e.target.value)}
                  required
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Time Selector Dropdowns */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Scheduled Time</Label>
                <div className="flex items-center gap-1">
                  <select
                    value={formHour}
                    onChange={(e) => setFormHour(e.target.value)}
                    className="h-10 w-full border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-slate-400 font-bold">:</span>
                  <select
                    value={formMinute}
                    onChange={(e) => setFormMinute(e.target.value)}
                    className="h-10 w-full border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value as any)}
                    className="h-10 w-[70px] border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="trainees" className="text-xs font-bold text-slate-700">Target Trainees Count</Label>
                <Input
                  id="trainees"
                  type="number"
                  min="1"
                  value={formTraineesCount}
                  onChange={(e) => setFormTraineesCount(Number(e.target.value))}
                  required
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Mode Selection Dropdown */}
              <div className="space-y-1">
                <Label htmlFor="mode" className="text-xs font-bold text-slate-700">Training Mode</Label>
                <select
                  id="mode"
                  value={formMode}
                  onChange={(e) => setFormMode(e.target.value as any)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="offline">Offline (In-Person / Field Drill)</option>
                  <option value="online">Online (Virtual / Webinar)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-bold text-slate-700">Schedule Status</Label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <DialogFooter className="border-t pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="h-9 px-4 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-700 gap-1.5 font-bold shadow-sm border-none cursor-pointer"
              >
                <CheckCircle2 size={13} />
                {editingSession ? 'Update Details' : 'Add to Calendar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- SUBMIT TRAINING REPORT MODAL --- */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="text-indigo-600" size={16} /> 
              Submit Training Report
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Confirm training metrics, upload attendance roster or photos, and finalize session.
            </DialogDescription>
          </DialogHeader>

          {reportingSession && (
            <form onSubmit={handleReportSubmit} className="space-y-4 py-2">
              <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Topic</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">{reportingSession.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Site</span>
                  <span className="font-semibold">{reportingSession.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Scheduled Time</span>
                  <span className="font-semibold">{reportingSession.dateStr} at {reportingSession.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Scheduled Mode</span>
                  <span className="font-extrabold uppercase text-indigo-700">
                    {reportingSession.mode === 'online' ? 'Online Mode (Virtual)' : 'Offline Mode (In-Person)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Target Count</span>
                  <span className="font-extrabold text-indigo-600">{reportingSession.targetEmployeesCount} Trainees</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="actualTrainees" className="text-xs font-bold text-slate-700">Actual Attending Count</Label>
                  <Input
                    id="actualTrainees"
                    type="number"
                    min="0"
                    value={reportActualCount}
                    onChange={(e) => setReportActualCount(Number(e.target.value))}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Photo / Evidence Upload</Label>
                  <Button
                    type="button"
                    onClick={simulateEvidenceUpload}
                    variant="outline"
                    className="h-10 w-full rounded-xl text-xs font-bold gap-1 border-dashed hover:bg-indigo-50/20"
                  >
                    <UploadCloud size={14} /> Upload Evidence
                  </Button>
                </div>
              </div>

              {/* Uploaded Evidence files list */}
              {uploadedEvidence.length > 0 && (
                <div className="p-2 border rounded-xl bg-indigo-50/15 space-y-1">
                  <p className="text-[8.5px] uppercase font-bold text-slate-400">Attached files ({uploadedEvidence.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {uploadedEvidence.map((file, i) => (
                      <span key={i} className="text-[8px] bg-white border px-1.5 py-0.5 rounded font-semibold text-slate-600 flex items-center gap-1">
                        <Check size={8} className="text-emerald-600 animate-bounce" /> {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="reportRemarks" className="text-xs font-bold text-slate-700">Training Session Summary & Remarks</Label>
                <textarea
                  id="reportRemarks"
                  value={reportRemarks}
                  onChange={(e) => setReportRemarks(e.target.value)}
                  placeholder="Enter comments on topic absorption, guard performance, reliever feedback..."
                  required
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <DialogFooter className="border-t pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReportModal(false)
                    setReportingSession(null)
                  }}
                  className="h-9 px-4 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-700 gap-1.5 font-bold shadow-sm border-none cursor-pointer"
                >
                  <CheckCircle2 size={13} /> Confirm Report Submission
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

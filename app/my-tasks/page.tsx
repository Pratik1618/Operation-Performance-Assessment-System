'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ArrowUpDown, CalendarDays, CheckCircle2, Clock3, Eye, FileUp,
  Filter, ListChecks, Search, Shield, Star, XCircle, ChevronLeft, ChevronRight,
  List, Calendar, Play, AlertCircle, BadgeAlert, RefreshCw
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { TaskFrequency, TaskStatus, OperationalTask } from '@/lib/types'
import { sites } from '@/lib/data/ocrms-data'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { toast } from 'sonner'

const frequencyTabs: { key: TaskFrequency | 'all'; label: string }[] = [
  { key: 'all', label: 'All Frequencies' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'one-time', label: 'One-Time' },
]

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock3 },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: ListChecks },
  submitted: { label: 'Submitted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: FileUp },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  oe_submitted: { label: 'OE Submitted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: FileUp },
  rm_approved: { label: 'AE Approved', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: CheckCircle2 },
  avp_approved: { label: 'AVP Approved', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: CheckCircle2 },
  bh_approved: { label: 'BH Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
  overdue: { label: 'Overdue', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle },
}

export default function MyTasksPage() {
  const router = useRouter()
  const { tasks, templates, currentUser, currentRole, scoringPolicy } = useOCRMS()

  // View settings
  const [activeTab, setActiveTab] = useState<TaskFrequency | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list')
  const [sortField, setSortField] = useState<'taskName' | 'dueDate' | 'status'>('dueDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  // Date state for Calendar view (defaults to current month)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)) // June 2026

  // Unique lists for filters
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.category)))
  }, [tasks])

  const uniqueSites = useMemo(() => {
    const list = new Map()
    tasks.forEach(t => list.set(t.siteId, t.siteName))
    return Array.from(list.entries()).map(([id, name]) => ({ id, name }))
  }, [tasks])

  const roleFilteredTasks = useMemo(() => {
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
      // 1. Role match check on template
      const tpl = templates.find(tpl => tpl.id === t.templateId);
      if (!tpl) return false;
      if (!isRoleMatch(tpl.assignedRoles, currentRole)) return false;

      // 2. User assignment/site check
      if (currentRole === 'oe') {
        return t.assignedTo === currentUser?.userName;
      }
      const site = sites.find(s => s.id === t.siteId);
      if (currentRole === 'rm') {
        return site?.assignedRM === currentUser?.userName;
      }
      if (currentRole === 'avp') {
        return site?.assignedAVP === currentUser?.userName;
      }
      return true;
    });
  }, [tasks, templates, currentRole, currentUser])

  // Filter tasks based on role and inputs
  const filteredTasks = useMemo(() => {
    let list = [...roleFilteredTasks]

    // Frequency
    if (activeTab !== 'all') {
      list = list.filter(t => t.frequency === activeTab)
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(t =>
        t.taskName.toLowerCase().includes(term) ||
        t.siteName.toLowerCase().includes(term) ||
        t.clientName.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      )
    }

    // Status
    if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter)
    }

    // Category
    if (categoryFilter !== 'all') {
      list = list.filter(t => t.category === categoryFilter)
    }

    // Site
    if (siteFilter !== 'all') {
      list = list.filter(t => t.siteId === siteFilter)
    }

    // Sorting
    list.sort((a, b) => {
      let cmp = 0
      if (sortField === 'taskName') cmp = a.taskName.localeCompare(b.taskName)
      else if (sortField === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate)
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [roleFilteredTasks, activeTab, searchTerm, statusFilter, categoryFilter, siteFilter, sortField, sortDir])

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / pageSize)
  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [filteredTasks, currentPage])

  // Summary statistics computed in real-time
  const summary = useMemo(() => {
    const list = roleFilteredTasks
    const total = list.length
    const approved = list.filter(t => ['approved', 'bh_approved'].includes(t.status)).length
    const submitted = list.filter(t => ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(t.status)).length
    const pending = list.filter(t => t.status === 'pending' || t.status === 'in_progress').length
    const overdue = list.filter(t => t.status === 'overdue').length
    
    return {
      total,
      approved,
      submitted,
      pending,
      overdue,
      compliance: total > 0 ? Math.round(((approved + submitted) / total) * 100) : 0,
    }
  }, [roleFilteredTasks])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const renderStars = (rating: number, max: number) => {
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {Array.from({ length: max }, (_, i) => (
          <Star key={i} size={11} className={i < rating ? 'text-amber-400 fill-amber-400 font-bold' : 'text-slate-200'} />
        ))}
      </div>
    )
  }

  // --- Calendar Grid Generation (Month view for June 2026) ---
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const cells = []
    const prevMonthDays = new Date(year, month, 0).getDate()

    // Previous month offset
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      cells.push({ day: dayNum, isCurrentMonth: false, dateStr, dayTasks: [] })
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      // Filter tasks due on this date
      const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr)
      cells.push({ day: i, isCurrentMonth: true, dateStr, dayTasks })
    }

    // Next month offset
    const totalCells = Math.ceil(cells.length / 7) * 7
    const nextDaysNeeded = totalCells - cells.length
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      cells.push({ day: i, isCurrentMonth: false, dateStr, dayTasks: [] })
    }

    return cells
  }, [currentDate, filteredTasks])

  // --- Timeline View items grouped by date ---
  const timelineGroups = useMemo(() => {
    const groups: Record<string, OperationalTask[]> = {}
    filteredTasks.forEach(task => {
      if (!groups[task.dueDate]) {
        groups[task.dueDate] = []
      }
      groups[task.dueDate].push(task)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredTasks])

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'My Tasks' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-md">
            <ListChecks className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Task Workspace</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instantiated from Activity Templates · Active Policy: <span className="font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">{scoringPolicy.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-250 bg-emerald-50/70 px-3 py-1.5 shadow-soft">
            <Shield size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{summary.compliance}%</span>
            <span className="text-[10px] text-emerald-600 font-medium">compliance</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-250 bg-amber-50/70 px-3 py-1.5 shadow-soft">
            <Clock3 size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">{summary.pending}</span>
            <span className="text-[10px] text-amber-600 font-medium">pending/due</span>
          </div>
        </div>
      </div>

      {/* Frequency Tabs */}
      <div className="flex items-center justify-between gap-4 border-b pb-2 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          {frequencyTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md'
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border rounded-xl p-1 bg-slate-50 border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List size={13} /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={13} /> Calendar
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'timeline' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock3 size={13} /> Timeline
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="rounded-xl border bg-white p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-slate-800">{summary.total}</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Total Tasks</p>
        </div>
        <div className="rounded-xl border border-emerald-150 bg-emerald-50/50 p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-emerald-700">{summary.approved}</p>
          <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Approved</p>
        </div>
        <div className="rounded-xl border border-indigo-150 bg-indigo-50/50 p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-indigo-700">{summary.submitted}</p>
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">Submitted</p>
        </div>
        <div className="rounded-xl border border-amber-150 bg-amber-50/50 p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-amber-700">{summary.pending}</p>
          <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mt-0.5">Pending</p>
        </div>
        <div className="rounded-xl border border-red-150 bg-red-50/50 p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-red-700">{summary.overdue}</p>
          <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wider mt-0.5">Overdue</p>
        </div>
        <div className="rounded-xl border border-blue-150 bg-blue-50/50 p-3.5 text-center shadow-soft">
          <p className="text-xl font-extrabold text-blue-700">{summary.compliance}%</p>
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">Compliance</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border shadow-soft">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            placeholder="Search task template, sites, clients..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 h-10 text-xs rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | 'all'); setCurrentPage(1); }}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={siteFilter}
            onChange={(e) => { setSiteFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors animate-in fade-in"
          >
            <option value="all">All Sites</option>
            {uniqueSites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-muted-foreground ml-auto font-medium">
          Found {filteredTasks.length} tasks
        </span>
      </div>

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <Card className="border border-border/80 shadow-soft overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('taskName')} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 border-none bg-transparent cursor-pointer">
                      Task Name <ArrowUpDown size={11} />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Frequency</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Site & Client</TableHead>
                  <TableHead className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 border-none bg-transparent cursor-pointer">
                      Due Date <ArrowUpDown size={11} />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 border-none bg-transparent cursor-pointer">
                      Status <ArrowUpDown size={11} />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Evidence</TableHead>
                  <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Final Score</TableHead>
                  <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => {
                  const sc = statusConfig[task.status] || statusConfig.pending
                  const StatusIcon = sc.icon
                  return (
                    <TableRow key={task.id} className="hover:bg-slate-50/30 transition-colors group">
                      <TableCell className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{task.taskName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{task.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          task.frequency === 'daily' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                          task.frequency === 'weekly' ? 'bg-violet-50 text-violet-700 border border-violet-150' :
                          task.frequency === 'fortnightly' ? 'bg-cyan-50 text-cyan-700 border border-cyan-150' :
                          task.frequency === 'monthly' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          'bg-slate-50 text-slate-700 border border-slate-150'
                        }`}>
                          {task.frequency}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{task.siteName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{task.clientName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-700">{task.dueDate}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <StatusIcon size={10} />
                          {sc.label}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        {task.evidenceCount > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-1.5 py-0.25 rounded">
                            <FileUp size={11} /> {task.evidenceCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="text-center font-extrabold text-xs">
                          {['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(task.status) && task.finalScore !== undefined ? (
                            <div className="space-y-0.5">
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded text-[11px] font-extrabold">
                                {task.finalScore} / {task.weightage * task.weightage}
                              </span>
                              {renderStars(task.finalScore / task.weightage, task.weightage)}
                            </div>
                          ) : ['oe_submitted', 'submitted'].includes(task.status) ? (
                            <span className="text-indigo-600 text-[10px] font-semibold bg-indigo-50 px-1.5 py-0.25 rounded">OE Self: {task.oeRating}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Max: {task.weightage * task.weightage}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/tasks/${task.id}`)}
                            className="rounded-lg p-1.5 hover:bg-indigo-50 text-indigo-600 transition-all hover:scale-105 border-0 bg-transparent cursor-pointer"
                            title={task.status === 'pending' || task.status === 'in_progress' ? 'Execute Form' : 'View Details'}
                          >
                            {task.status === 'pending' || task.status === 'in_progress' ? (
                              <Play size={14} className="fill-indigo-600" />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs italic font-medium">
                      No matching tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 bg-slate-50/50">
              <p className="text-[11px] text-muted-foreground font-semibold">
                Page {currentPage} of {totalPages} · {filteredTasks.length} total tasks
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs rounded-xl"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 text-xs rounded-xl font-bold"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-xs rounded-xl"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* --- CALENDAR VIEW --- */}
      {viewMode === 'calendar' && (
        <Card className="p-5 shadow-soft border rounded-2xl bg-white">
          <CardHeader className="p-0 pb-4 border-b flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Monthly Task Planner</CardTitle>
              <CardDescription className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Displays operational tasks due in the calendar cycle. Click month to adjust.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-1.5 border rounded-xl p-1 bg-slate-50 border-slate-200">
              <button 
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1 hover:bg-white rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[11px] font-extrabold px-3 uppercase text-slate-700">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1 hover:bg-white rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 pt-4">
            <div className="grid grid-cols-7 text-center font-extrabold text-[10px] text-muted-foreground uppercase tracking-widest pb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 border-t pt-2">
              {calendarCells.map((cell, idx) => {
                const isCurrentMonth = cell.isCurrentMonth
                const cellTasks = cell.dayTasks
                const hasTasks = cellTasks.length > 0
                const isToday = cell.dateStr === '2026-06-09' // Simulated "Today"

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] border-2 rounded-xl p-2 flex flex-col justify-between group transition-all duration-200 ${
                      !isCurrentMonth
                        ? 'bg-slate-50/20 border-slate-100/50 text-slate-300 opacity-40 select-none'
                        : isToday
                          ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                          : hasTasks
                            ? 'bg-indigo-50/5 border-indigo-150 hover:border-indigo-400 hover:bg-indigo-50/20'
                            : 'bg-white border-slate-150 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-extrabold ${
                        !isCurrentMonth ? 'text-slate-300' : isToday ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {cell.day}
                        {isToday && <span className="text-[7px] bg-amber-100 border border-amber-300 text-amber-800 px-1 py-0.25 rounded font-extrabold ml-1">TODAY</span>}
                      </span>
                    </div>

                    <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto scrollbar-none max-h-[70px]">
                      {cellTasks.slice(0, 3).map(task => {
                        const sc = statusConfig[task.status] || statusConfig.pending
                        return (
                          <div
                            key={task.id}
                            onClick={() => router.push(`/tasks/${task.id}`)}
                            className={`text-[8px] font-bold p-1 rounded border leading-snug cursor-pointer transition-transform hover:scale-[1.03] ${sc.bg} ${sc.text} ${sc.border}`}
                            title={`${task.taskName} - ${task.siteName}`}
                          >
                            <p className="truncate">{task.taskName}</p>
                          </div>
                        )
                      })}
                      {cellTasks.length > 3 && (
                        <div className="text-[7px] text-center font-bold text-indigo-600 bg-indigo-50 rounded border border-indigo-150 py-0.5">
                          + {cellTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-5 pt-4 border-t flex flex-wrap gap-4 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Pending / In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Submitted (RM Review)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Approved (Closed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>Overdue Alert</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- TIMELINE VIEW --- */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {timelineGroups.map(([date, groupTasks]) => {
            const isToday = date === '2026-06-09'
            const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            
            return (
              <div key={date} className="relative pl-6 border-l-2 border-indigo-100">
                {/* Timeline node */}
                <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                  isToday ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-indigo-500'
                }`} />
                
                <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                  {formattedDate}
                  {isToday && <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded uppercase">Today</span>}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3">
                  {groupTasks.map(task => {
                    const sc = statusConfig[task.status] || statusConfig.pending
                    const StatusIcon = sc.icon
                    
                    return (
                      <Card key={task.id} className="shadow-soft overflow-hidden hover:shadow-md transition-all border duration-200">
                        <div className="p-3.5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[8px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-muted-foreground uppercase">{task.frequency}</span>
                              <h4 className="text-xs font-extrabold text-slate-800 mt-1">{task.taskName}</h4>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{task.category}</p>
                            </div>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                              {sc.label}
                            </span>
                          </div>
                          
                          <div className="border-t pt-2.5 flex items-center justify-between text-xs text-slate-600">
                            <div>
                              <p className="text-[10px] font-bold text-slate-700">{task.siteName}</p>
                              <p className="text-[9px] text-muted-foreground">{task.clientName}</p>
                            </div>
                            <Button
                              onClick={() => router.push(`/tasks/${task.id}`)}
                              size="sm"
                              className="h-7 px-2.5 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg gap-1"
                            >
                              <Play size={8} className="fill-white" /> Open
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {timelineGroups.length === 0 && (
            <p className="text-xs text-slate-400 italic font-medium text-center py-8">
              No upcoming tasks in timeline.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

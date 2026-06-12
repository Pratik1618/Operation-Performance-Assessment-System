'use client'

import { useState, useMemo } from 'react'
import {
  FileText, Search, Filter, Download, ArrowUpDown, ShieldCheck,
  Calendar, Award, MessageSquare, BadgeCheck, FileSpreadsheet
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { OperationalTask } from '@/lib/types'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function ReportsPage() {
  const { tasks, scoringPolicy } = useOCRMS()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.category)))
  }, [tasks])

  const uniqueSites = useMemo(() => {
    const list = new Map()
    tasks.forEach(t => list.set(t.siteId, t.siteName))
    return Array.from(list.entries()).map(([id, name]) => ({ id, name }))
  }, [tasks])

  // Filter tasks for reports (typically completed and approved tasks are key report items, but we allow all)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      const matchesFrequency = frequencyFilter === 'all' || t.frequency === frequencyFilter
      const matchesSite = siteFilter === 'all' || t.siteId === siteFilter
      return matchesSearch && matchesStatus && matchesCategory && matchesFrequency && matchesSite
    })
  }, [tasks, searchTerm, statusFilter, categoryFilter, frequencyFilter, siteFilter])

  // Report statistics
  const stats = useMemo(() => {
    const approved = filteredTasks.filter(t => ['approved', 'bh_approved'].includes(t.status))
    const totalMaxScorePoints = approved.reduce((sum, t) => sum + (t.weightage * t.weightage), 0)
    const totalScore = approved.reduce((sum, t) => sum + (t.finalScore || 0), 0)
    const averagePerformanceScore = totalMaxScorePoints > 0 ? Math.round((totalScore / totalMaxScorePoints) * 100) : 0
    
    return {
      totalCount: filteredTasks.length,
      approvedCount: approved.length,
      submittedCount: filteredTasks.filter(t => ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(t.status)).length,
      pendingCount: filteredTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
      averagePerformanceScore
    }
  }, [filteredTasks])

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success('Report Exported', { 
      description: `Simulated download of performance report in ${format.toUpperCase()} format completed successfully. Total records: ${filteredTasks.length}` 
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reports' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
            <FileText className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Performance Reports Ledger</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate, filter, and export historical operational task logs and performance scorecards.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleExport('excel')}
            variant="outline" 
            className="rounded-xl border-slate-200 text-xs h-10 gap-1.5 font-bold hover:bg-slate-50"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel
          </Button>
          <Button 
            onClick={() => handleExport('pdf')}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-10 gap-1.5 font-bold shadow-sm"
          >
            <Download size={14} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="shadow-soft bg-white border">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-extrabold text-slate-700">{stats.totalCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Filtered Records</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-extrabold text-emerald-700">{stats.approvedCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Approved (Closed)</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-white border-l-4 border-l-indigo-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-extrabold text-indigo-700">{stats.submittedCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Submitted (RM Queue)</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-extrabold text-amber-700">{stats.pendingCount}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Pending / Drafts</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-indigo-50/50 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-extrabold text-indigo-800">{stats.averagePerformanceScore}%</p>
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Score Performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border shadow-soft">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            placeholder="Search by activity name, site name, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="oe_submitted">OE Submitted</option>
            <option value="rm_approved">AE Approved</option>
            <option value="avp_approved">AVP Approved</option>
            <option value="bh_approved">BH Approved</option>
            <option value="rejected">Rejected</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
            <option value="one-time">One-Time</option>
          </select>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Sites</option>
            {uniqueSites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table Grid */}
      <Card className="border border-border/80 shadow-soft overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Task Details</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Site & Client</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Due Date</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Status</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">OE rating</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">RM rating</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">AVP rating</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">BH rating</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Final Score</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Remarks log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{task.taskName}</p>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase">{task.frequency} · {task.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{task.siteName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{task.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs font-semibold text-slate-700">{task.dueDate}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      ['approved', 'bh_approved'].includes(task.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(task.status) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      task.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-xs font-bold">
                    {task.oeRating !== undefined ? (
                      <span className="text-slate-700 bg-slate-100 border px-1.5 py-0.25 rounded">{task.oeRating}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-xs font-bold">
                    {task.rmRating !== undefined ? (
                      <span className="text-indigo-700 bg-indigo-50 border border-indigo-150 px-1.5 py-0.25 rounded">{task.rmRating}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-xs font-bold">
                    {task.avpRating !== undefined ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-1.5 py-0.25 rounded">{task.avpRating}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-xs font-bold">
                    {task.bhRating !== undefined ? (
                      <span className="text-purple-700 bg-purple-50 border border-purple-150 px-1.5 py-0.25 rounded">{task.bhRating}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(task.status) && task.finalScore !== undefined ? (
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                        {task.finalScore} / {task.weightage * task.weightage}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Max: {task.weightage * task.weightage}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={task.remarks || task.oeRemarks || ''}>
                      {task.remarks || task.oeRemarks || '—'}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-slate-400 text-xs italic font-medium">
                    No records found matching filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

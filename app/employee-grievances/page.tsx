'use client'

import { useState, useMemo } from 'react'
import {
  Users2, Search, Filter, Plus, FileAudio, Play, Pause,
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, MessageSquare, ArrowRight
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { grievances, sites } from '@/lib/data/ocrms-data'
import type { Grievance, GrievanceStatus, GrievancePriority } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const priorityConfig: Record<GrievancePriority, { label: string; bg: string; text: string }> = {
  high: { label: 'High Priority', bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700' },
  medium: { label: 'Medium Priority', bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
  low: { label: 'Low Priority', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-600' },
}

const statusConfig: Record<GrievanceStatus, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  closed: { label: 'Closed', bg: 'bg-slate-50 text-slate-500 border-slate-200', text: 'text-slate-500' },
}

export default function EmployeeGrievancesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localGrievances, setLocalGrievances] = useState<Grievance[]>(grievances)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  
  // Voice Recording Simulator
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Quick Resolve input
  const [resolutionText, setResolutionText] = useState('')
  const [statusSelect, setStatusSelect] = useState<GrievanceStatus>('resolved')

  const metrics = useMemo(() => {
    return {
      total: localGrievances.length,
      open: localGrievances.filter(g => g.status === 'open').length,
      underReview: localGrievances.filter(g => g.status === 'under_review').length,
      resolved: localGrievances.filter(g => g.status === 'resolved').length,
    }
  }, [localGrievances])

  // Filtered lists
  const filteredGrievances = useMemo(() => {
    return localGrievances.filter((g) => {
      const matchesSearch = g.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            g.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            g.complaint.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = priorityFilter === 'all' || g.priority === priorityFilter
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter
      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [localGrievances, searchTerm, priorityFilter, statusFilter])

  const toggleAudio = (id: string) => {
    if (playingId === id) {
      setPlayingId(null)
    } else {
      setPlayingId(id)
      // Auto pause after 5 seconds simulation
      setTimeout(() => {
        setPlayingId(curr => curr === id ? null : curr)
      }, 5000)
    }
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGrievance) return

    setLocalGrievances(prev => prev.map(g => {
      if (g.id === selectedGrievance.id) {
        return {
          ...g,
          status: statusSelect,
          resolution: statusSelect === 'resolved' || statusSelect === 'closed' ? resolutionText : g.resolution,
          resolvedDate: statusSelect === 'resolved' || statusSelect === 'closed' ? new Date().toISOString().split('T')[0] : g.resolvedDate
        }
      }
      return g
    }))

    setSelectedGrievance(null)
    setResolutionText('')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Employee Grievances' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
            <Users2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Grievances Redressal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Address payroll, workplace conditions, harassment, or safety tickets logged by site personnel.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Log Grievance
        </Button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Grievances</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-red-600">{metrics.open}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Open Tickets</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.underReview}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Under Investigation</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.resolved}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Resolved Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search by worker, code, or complaint text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Grievance Card List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGrievances.map((g) => {
          const prio = priorityConfig[g.priority]
          const stat = statusConfig[g.status]
          return (
            <Card key={g.id} className="shadow-soft overflow-hidden border border-border flex flex-col justify-between">
              <div className="p-4 space-y-4 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{g.employeeName}</h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{g.employeeCode} · {g.site}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${stat.bg} ${stat.text}`}>
                    {stat.label}
                  </span>
                </div>

                {/* Complaint text */}
                <div className="space-y-1">
                  <span className="inline-flex bg-slate-100 text-[9px] font-semibold px-2 py-0.5 rounded text-slate-600 uppercase tracking-wide">
                    {g.category}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 italic">
                    "{g.complaint}"
                  </p>
                </div>

                {/* Voice audio widget */}
                {g.hasVoiceRecording && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                    <FileAudio size={14} className="text-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-semibold text-indigo-700 flex-1">Voice Feedback Attached</span>
                    <button 
                      onClick={() => toggleAudio(g.id)}
                      className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 hover:bg-indigo-200 transition-colors"
                    >
                      {playingId === g.id ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between text-xs mt-auto">
                <span className={`text-[9px] font-bold uppercase ${prio.bg} ${prio.text} border rounded px-1.5 py-0.5`}>
                  {prio.label}
                </span>
                <button 
                  onClick={() => setSelectedGrievance(g)}
                  className="flex items-center gap-0.5 font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Manage Ticket <ArrowRight size={12} />
                </button>
              </div>
            </Card>
          )
        })}
        {filteredGrievances.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground Card">
            No employee grievances found matching filters.
          </div>
        )}
      </div>

      {/* Ticket Action Dialog */}
      <Dialog open={!!selectedGrievance} onOpenChange={(open) => { if (!open) setSelectedGrievance(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold text-slate-800">Resolve Employee Ticket</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedGrievance ? `${selectedGrievance.id} · ${selectedGrievance.employeeName}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedGrievance && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complaint Details</p>
                  <p className="text-xs text-slate-700 mt-1 italic">"{selectedGrievance.complaint}"</p>
                </div>
                
                {selectedGrievance.resolution && (
                  <div className="p-2.5 rounded-lg border bg-slate-50">
                    <p className="text-[9px] font-bold text-slate-600 uppercase">Existing Resolution</p>
                    <p className="text-xs text-slate-700 mt-1">{selectedGrievance.resolution}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">Resolved date: {selectedGrievance.resolvedDate}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Update Ticket Status</Label>
                  <select 
                    value={statusSelect} 
                    onChange={(e) => setStatusSelect(e.target.value as any)}
                    className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer"
                  >
                    <option value="under_review">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Remarks / Action Taken</Label>
                  <textarea 
                    required
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Describe resolution taken or investigation status..."
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none h-20 border-border" 
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 text-xs">
                  Submit Remarks & Update
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

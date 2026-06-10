'use client'

import { useState, useMemo } from 'react'
import {
  HeadphonesIcon, Search, Filter, Plus, CalendarDays, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, UserCheck, MessageSquarePlus, CalendarRange
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { clientInteractions, sites } from '@/lib/data/ocrms-data'
import type { ClientInteraction, ClientIssueStatus } from '@/lib/types'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const statusConfig: Record<ClientIssueStatus, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  escalated: { label: 'Escalated', bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700' },
  follow_up: { label: 'Follow Up', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
}

export default function ClientManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localInteractions, setLocalInteractions] = useState<ClientInteraction[]>(clientInteractions)
  const [selectedIssue, setSelectedIssue] = useState<ClientInteraction | null>(null)

  // Resolution Form States
  const [actionInput, setActionInput] = useState('')
  const [statusInput, setStatusInput] = useState<ClientIssueStatus>('resolved')
  const [followUpDateInput, setFollowUpDateInput] = useState('')

  const metrics = useMemo(() => {
    return {
      total: localInteractions.length,
      resolved: localInteractions.filter(i => i.resolutionStatus === 'resolved').length,
      open: localInteractions.filter(i => i.resolutionStatus === 'open').length,
      escalated: localInteractions.filter(i => i.resolutionStatus === 'escalated').length,
    }
  }, [localInteractions])

  // Filtered List
  const filteredInteractions = useMemo(() => {
    return localInteractions.filter((inc) => {
      const matchesSearch = inc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inc.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inc.concern.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || inc.resolutionStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [localInteractions, searchTerm, statusFilter])

  const handleUpdateIssue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIssue) return

    setLocalInteractions(prev => prev.map(item => {
      if (item.id === selectedIssue.id) {
        return {
          ...item,
          actionTaken: actionInput,
          resolutionStatus: statusInput,
          followUpDate: statusInput === 'follow_up' ? followUpDateInput : undefined
        }
      }
      return item
    }))

    setSelectedIssue(null)
    setActionInput('')
    setFollowUpDateInput('')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Client Management' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
            <HeadphonesIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Concerns & Interactions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Log customer complaints, monitor SLA TAT deadlines, and update follow-up schedules.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <MessageSquarePlus size={14} /> Log Client Concern
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Reported Concerns</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.resolved}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Resolved SLA</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-red-600">{metrics.open}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Active Tickets</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-rose-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-rose-700">{metrics.escalated}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Escalated Tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search by client, mapped site, or issue text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="follow_up">Follow Up</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Concerns Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Client & Site</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Call Date</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Reported Concern</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Corrective Action Taken</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Follow-Up Date</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInteractions.map((inc) => {
              const stat = statusConfig[inc.resolutionStatus]
              return (
                <TableRow key={inc.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{inc.clientName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{inc.site}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-foreground">{inc.callDate}</TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate" title={inc.concern}>
                    {inc.concern}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate" title={inc.actionTaken}>
                    {inc.actionTaken || <span className="text-rose-700 font-semibold italic">Awaiting Action Plan</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center text-xs text-foreground font-semibold">
                    {inc.followUpDate ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <CalendarRange size={11} /> {inc.followUpDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                      {stat.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <Button 
                      onClick={() => setSelectedIssue(inc)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 text-[10px] font-bold rounded-lg border-primary/20 text-primary hover:bg-slate-50 flex items-center gap-1 mx-auto"
                    >
                      Resolve Concern
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredInteractions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                  No client concerns found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Concern Resolution Modal */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => { if (!open) setSelectedIssue(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold text-slate-800">Process Client Concern</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedIssue ? `${selectedIssue.clientName} · Site Visit SLA` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-xs">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported Concern</Label>
                  <p className="text-slate-700 mt-1 italic">"{selectedIssue.concern}"</p>
                </div>
                
                {selectedIssue.actionTaken && (
                  <div className="p-2.5 bg-slate-50 border border-border rounded-lg">
                    <Label className="text-[9px] font-bold text-slate-600 uppercase">Existing Corrective Actions</Label>
                    <p className="text-slate-700 mt-1">{selectedIssue.actionTaken}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateIssue} className="border-t pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-600 uppercase">Status Update</Label>
                    <select 
                      value={statusInput} 
                      onChange={(e) => setStatusInput(e.target.value as any)}
                      className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer"
                    >
                      <option value="resolved">Resolved</option>
                      <option value="follow_up">Requires Follow Up</option>
                      <option value="escalated">Escalated to RM/AVP</option>
                    </select>
                  </div>
                  
                  {statusInput === 'follow_up' && (
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600 uppercase">Follow-Up Date</Label>
                      <input 
                        type="text" 
                        required
                        placeholder="YYYY-MM-DD"
                        value={followUpDateInput}
                        onChange={(e) => setFollowUpDateInput(e.target.value)}
                        className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-600 uppercase">Corrective Actions Taken</Label>
                  <textarea 
                    required
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    placeholder="Record immediate resolution details or mitigation details..."
                    className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-20" 
                  />
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs">
                  Save & Update SLA Status
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

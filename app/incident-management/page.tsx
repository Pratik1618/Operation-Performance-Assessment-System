'use client'

import { useState, useMemo } from 'react'
import {
  AlertTriangle, Search, Filter, Plus, Camera, Eye, ArrowRight,
  CheckCircle2, Clock, ShieldAlert, Users, CalendarCheck, Send
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { incidents, sites } from '@/lib/data/ocrms-data'
import type { Incident, IncidentStatus, IncidentSeverity } from '@/lib/types'
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

const severityConfig: Record<IncidentSeverity, { label: string; bg: string; text: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-100 text-red-800 border-red-200', text: 'text-red-700' },
  high: { label: 'High', bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-700' },
  medium: { label: 'Medium', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'text-yellow-700' },
  low: { label: 'Low', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-600' },
}

const statusConfig: Record<IncidentStatus, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700' },
  investigating: { label: 'Investigating', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  closed: { label: 'Closed', bg: 'bg-slate-50 text-slate-500 border-slate-200', text: 'text-slate-500' },
}

export default function IncidentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localIncidents, setLocalIncidents] = useState<Incident[]>(incidents)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // Incident log resolver form state
  const [rootCause, setRootCause] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState<IncidentStatus>('resolved')

  const metrics = useMemo(() => {
    return {
      total: localIncidents.length,
      critical: localIncidents.filter(i => i.severity === 'critical' && i.status !== 'closed').length,
      open: localIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
      resolved: localIncidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    }
  }, [localIncidents])

  // Filtered List
  const filteredIncidents = useMemo(() => {
    return localIncidents.filter((inc) => {
      const matchesSearch = inc.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inc.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inc.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter
      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [localIncidents, searchTerm, severityFilter, statusFilter])

  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncident) return

    setLocalIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          status: resolutionStatus,
          resolution: rootCause,
          resolvedDate: new Date().toISOString().split('T')[0]
        }
      }
      return inc
    }))

    setSelectedIncident(null)
    setRootCause('')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Incident Management' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incident Logbook</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record safety, theft, equipment failures, or trespassing events on sites. SLA escalation trigger: 15 mins.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Report Incident
        </Button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Incidents</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-600">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-red-600">{metrics.critical}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Active Criticals</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.open}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Investigating</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.resolved}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Resolved Incidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters strip */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search by incident ID, site, client, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
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
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Incident #</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Site & Client</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Incident Type</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Severity</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Photos</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((inc) => {
              const sev = severityConfig[inc.severity]
              const stat = statusConfig[inc.status]
              return (
                <TableRow key={inc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3.5 font-bold text-xs text-foreground">{inc.incidentNumber}</TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{inc.site}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{inc.client}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium capitalize">{inc.type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${sev.bg} ${sev.text}`}>
                      {sev.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate" title={inc.description}>
                    {inc.description}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    {inc.photos > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-700">
                        <Camera size={11} /> {inc.photos}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${stat.bg} ${stat.text}`}>
                      {stat.label.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <Button 
                      onClick={() => setSelectedIncident(inc)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 text-[10px] font-bold rounded-lg border-primary/20 text-primary hover:bg-slate-50 flex items-center gap-1 mx-auto"
                    >
                      <Eye size={12} /> View Log
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredIncidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                  No safety incidents logged matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={(open) => { if (!open) setSelectedIncident(null); }}>
        <DialogContent className="sm:max-w-lg bg-white border border-border rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader className="border-b pb-3">
                <DialogTitle className="text-sm font-bold text-slate-800">Incident File Details</DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                  Report #{selectedIncident.incidentNumber} · {selectedIncident.type.toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported Date & Time</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedIncident.reportedDate} · {selectedIncident.reportedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Site / Client Mapped</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedIncident.site} ({selectedIncident.client})</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incident Description</p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border italic">
                  "{selectedIncident.description}"
                </p>
              </div>

              {/* Photos Upload Mockup */}
              {selectedIncident.photos > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Photo Evidence Attached ({selectedIncident.photos})</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {Array.from({ length: selectedIncident.photos }).map((_, idx) => (
                      <div key={idx} className="h-16 rounded-lg bg-slate-100 border border-border flex items-center justify-center text-slate-400 flex-col gap-1 cursor-pointer hover:bg-slate-200">
                        <Camera size={14} />
                        <span className="text-[8px] font-semibold">Evidence_{idx+1}.jpg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Log / Escalation Tracker */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert size={12} className="text-red-600 animate-pulse" />
                  Escalation Timeline Tracker
                </p>
                <div className="border-l-2 pl-3 ml-1 space-y-2 py-1 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-slate-900 border" />
                    <p className="font-semibold text-slate-700">0 mins — Incident Logged</p>
                    <p className="text-[9px] text-muted-foreground">Reported on site by {selectedIncident.reportedBy}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-amber-500 border" />
                    <p className="font-semibold text-slate-700">15 mins — Escalation Triggered</p>
                    <p className="text-[9px] text-muted-foreground">RM (Suresh Kumar) and Safety Head auto-notified via SMS alert</p>
                  </div>
                  {selectedIncident.actionTaken && (
                    <div className="relative">
                      <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-emerald-500 border" />
                      <p className="font-semibold text-emerald-700">Action Taken</p>
                      <p className="text-[9px] text-muted-foreground">{selectedIncident.actionTaken}</p>
                    </div>
                  )}
                  {selectedIncident.resolution && (
                    <div className="relative">
                      <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-blue-500 border" />
                      <p className="font-semibold text-blue-700">Root Cause Resolution Submitted</p>
                      <p className="text-[9px] text-muted-foreground">{selectedIncident.resolution} (Closed: {selectedIncident.resolvedDate})</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action log form */}
              {selectedIncident.status !== 'closed' && (
                <form onSubmit={handleResolveIncident} className="border-t pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-600">Update Status</Label>
                      <select 
                        value={resolutionStatus} 
                        onChange={(e) => setResolutionStatus(e.target.value as any)}
                        className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer border-border"
                      >
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-600">Action Taken / Root Cause Resolution Remarks</Label>
                    <textarea 
                      required
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                      placeholder="Provide root-cause corrective action steps..."
                      className="w-full border rounded-lg p-2 text-xs focus:outline-none h-16 border-border" 
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs flex items-center justify-center gap-1.5">
                    <Send size={12} /> Log Resolution & Close
                  </Button>
                </form>
              )}

              {selectedIncident.status === 'closed' && (
                <Button onClick={() => setSelectedIncident(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9 text-xs">
                  Close Incident file
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

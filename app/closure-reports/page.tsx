'use client'

import { useState, useMemo } from 'react'
import {
  FileText, Plus, Search, Calendar, User, Clock,
  CheckCircle2, AlertCircle, Clipboard, X, ChevronRight, Filter, AlertTriangle
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { closureReports as initialReports, sites } from '@/lib/data/ocrms-data'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { ClosureReport, ClosureType } from '@/lib/types'
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

const statusConfig = {
  open: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Open' },
  closed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Closed' }
}

const typeConfig: Record<ClosureType, { label: string; color: string; bg: string }> = {
  mom: { label: 'MOM Report', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
  daily_closure: { label: 'Daily Closure', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-100' },
  closure: { label: 'Action Closure', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-100' }
}

export default function ClosureReportsPage() {
  const { currentRole, currentUser } = useOCRMS()
  const [reports, setReports] = useState<ClosureReport[]>(initialReports)
  const [activeTab, setActiveTab] = useState<'all' | 'mom' | 'daily_closure' | 'open'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  
  // Selected report for timeline view
  const [selectedReportId, setSelectedReportId] = useState<string | null>(initialReports[0]?.id || null)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)

  // Form state
  const [formSiteId, setFormSiteId] = useState(sites[0].id)
  const [formType, setFormType] = useState<ClosureType>('mom')
  const [formActionTaken, setFormActionTaken] = useState('')
  const [formRemarks, setFormRemarks] = useState('')
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('closed')
  
  // Resolve Form state
  const [resolveRemarks, setResolveRemarks] = useState('')

  const metrics = useMemo(() => {
    return {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      mom: reports.filter(r => r.type === 'mom').length,
      daily: reports.filter(r => r.type === 'daily_closure').length,
    }
  }, [reports])

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'open' && r.status === 'open') ||
        (activeTab === 'mom' && r.type === 'mom') ||
        (activeTab === 'daily_closure' && r.type === 'daily_closure')

      const matchesSearch = 
        r.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSite = siteFilter === 'all' || r.siteId === siteFilter

      return matchesTab && matchesSearch && matchesSite
    })
  }, [reports, activeTab, searchTerm, siteFilter])

  // Selected Report detail
  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || null
  }, [reports, selectedReportId])

  // Create new report
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedSite = sites.find(s => s.id === formSiteId)
    const today = new Date().toISOString().split('T')[0]
    
    const newReport: ClosureReport = {
      id: `CLR_${Date.now()}`,
      site: selectedSite?.name || '',
      siteId: formSiteId,
      type: formType,
      date: today,
      actionTaken: formActionTaken,
      closureDate: formStatus === 'closed' ? today : '',
      remarks: formRemarks,
      status: formStatus,
      submittedBy: currentUser.userName
    }

    setReports(prev => [newReport, ...prev])
    setSelectedReportId(newReport.id)
    setShowAddModal(false)
    
    // Reset form
    setFormActionTaken('')
    setFormRemarks('')
    setFormStatus('closed')
  }

  // Resolve/Close report
  const handleResolveReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReportId) return
    const today = new Date().toISOString().split('T')[0]

    setReports(prev => prev.map(r => {
      if (r.id === selectedReportId) {
        return {
          ...r,
          status: 'closed' as const,
          closureDate: today,
          remarks: resolveRemarks || r.remarks
        }
      }
      return r
    }))

    setShowResolveModal(false)
    setResolveRemarks('')
  }

  // Simulated Audit Log steps
  const auditLogs = useMemo(() => {
    if (!selectedReport) return []
    const steps = [
      {
        title: 'Report Logged',
        desc: `Submitted by ${selectedReport.submittedBy}`,
        date: selectedReport.date,
        time: '09:30 AM',
        icon: FileText,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
      }
    ]

    if (selectedReport.type === 'mom') {
      steps.push({
        title: 'Minutes Documented',
        desc: 'Review notes and action plan sent to site stakeholders',
        date: selectedReport.date,
        time: '11:15 AM',
        icon: Clipboard,
        color: 'text-blue-600 bg-blue-50 border-blue-100'
      })
    } else if (selectedReport.type === 'closure') {
      steps.push({
        title: 'SLA Remediation Triggered',
        desc: 'Assigned site supervisor to execute safety corrective actions',
        date: selectedReport.date,
        time: '10:00 AM',
        icon: Clock,
        color: 'text-pink-600 bg-pink-50 border-pink-100'
      })
    }

    if (selectedReport.status === 'closed') {
      steps.push({
        title: 'Report Resolved & Closed',
        desc: selectedReport.remarks || 'Site operations back to compliant state.',
        date: selectedReport.closureDate || selectedReport.date,
        time: '04:45 PM',
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
      })
    } else {
      steps.push({
        title: 'Remediation Pending',
        desc: 'Awaiting final verification or clearance from site client.',
        date: 'Awaiting Closure',
        time: '',
        icon: AlertCircle,
        color: 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse'
      })
    }

    return steps
  }, [selectedReport])

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Closure Reports & MOMs' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Closure Reports & MOMs</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit daily closure reports, log minutes of meetings (MOM), and track action item remediation timelines.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Log Report / MOM
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Logged</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{metrics.open}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Open Issues</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-indigo-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-700">{metrics.mom}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5 font-sans">MOM Reports</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-teal-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-700">{metrics.daily}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Daily Closures</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Filters */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab('mom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'mom' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            MOMs
          </button>
          <button
            onClick={() => setActiveTab('daily_closure')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'daily_closure' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Daily Closures
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'open' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Open Actions
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Search reports/remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8.5 text-xs rounded-xl"
            />
          </div>

          {/* Site Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground" />
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="border rounded-xl h-8.5 px-2 text-xs focus:outline-none bg-white text-slate-700 border-border"
            >
              <option value="all">All Sites</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List Table, Right Timeline Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Reports List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-border/80 shadow-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow>
                  <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Report Details</TableHead>
                  <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="p-3 text-right text-xs font-semibold text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((r) => {
                  const typeStyle = typeConfig[r.type]
                  const stat = statusConfig[r.status]
                  const isSelected = selectedReportId === r.id
                  
                  return (
                    <TableRow 
                      key={r.id}
                      onClick={() => setSelectedReportId(r.id)}
                      className={`cursor-pointer hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                    >
                      <TableCell className="p-3 space-y-1 max-w-[280px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${typeStyle.bg} ${typeStyle.color}`}>
                            {typeStyle.label}
                          </span>
                          <span className="font-semibold text-slate-800 line-clamp-1">{r.site}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                          "{r.actionTaken}"
                        </p>
                      </TableCell>
                      <TableCell className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                        {r.date}
                      </TableCell>
                      <TableCell className="p-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                          {stat.label}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'open' && (
                            <Button
                              onClick={() => {
                                setSelectedReportId(r.id)
                                setShowResolveModal(true)
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 px-2.5 rounded-lg text-[10px]"
                            >
                              Resolve
                            </Button>
                          )}
                          <button 
                            onClick={() => setSelectedReportId(r.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-12 text-center text-muted-foreground">
                      No reports or MOMs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Audit Timeline Details */}
        <div className="lg:col-span-5">
          {selectedReport ? (
            <Card className="shadow-soft border border-border h-full flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 border-b bg-slate-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${typeConfig[selectedReport.type].bg} ${typeConfig[selectedReport.type].color}`}>
                          {typeConfig[selectedReport.type].label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{selectedReport.id}</span>
                      </div>
                      <CardTitle className="text-xs font-bold text-slate-800 mt-1">{selectedReport.site}</CardTitle>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusConfig[selectedReport.status].bg} ${statusConfig[selectedReport.status].text}`}>
                      {statusConfig[selectedReport.status].label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-5">
                  {/* Actions Taken Box */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Summary & Actions Logged</p>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 italic">
                      "{selectedReport.actionTaken}"
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/20 border p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Submitted By</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                        <User size={12} className="text-slate-400" />
                        {selectedReport.submittedBy}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Log Date</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} className="text-slate-400" />
                        {selectedReport.date}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Audit Logs */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Timeline Logs</p>
                    <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4">
                      {auditLogs.map((log, idx) => {
                        const Icon = log.icon
                        return (
                          <div key={idx} className="relative">
                            {/* Dot / Icon Container */}
                            <span className={`absolute -left-[27.5px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${log.color}`}>
                              <Icon size={10} />
                            </span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-800">{log.title}</span>
                                {log.time && (
                                  <span className="text-[9px] text-slate-400 font-medium">{log.date} @ {log.time}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">{log.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Resolution Info Footer */}
              {selectedReport.status === 'closed' ? (
                <div className="border-t p-3 bg-slate-50/50 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="text-emerald-500" size={14} />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-700">Closed on {selectedReport.closureDate}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Remarks: {selectedReport.remarks}</p>
                  </div>
                </div>
              ) : (
                <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-500 animate-bounce" size={14} />
                    <span className="text-[10px] font-bold text-amber-800">Resolution Pending Action</span>
                  </div>
                  <Button 
                    onClick={() => setShowResolveModal(true)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 px-3 rounded-lg text-xs"
                  >
                    Close Report
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="shadow-soft h-full border border-dashed flex items-center justify-center p-8">
              <div className="text-center space-y-2 max-w-[200px]">
                <Clipboard className="mx-auto text-slate-300" size={32} />
                <p className="text-xs font-semibold text-slate-400">Select a report to view closure timeline & audit logs</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Log Report / MOM Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Log Closure Report / MOM</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Submit daily closure reports, MOM minutes, or remediation details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReport} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Site</Label>
              <select 
                value={formSiteId} 
                onChange={(e) => setFormSiteId(e.target.value)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                {sites.slice(0, 6).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Report Type</Label>
              <select 
                value={formType} 
                onChange={(e) => setFormType(e.target.value as ClosureType)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                <option value="mom">Minutes of Meeting (MOM)</option>
                <option value="daily_closure">Daily Closure Report</option>
                <option value="closure">Remediation Action Closure</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Actions Taken / Details</Label>
              <textarea 
                required
                value={formActionTaken}
                onChange={(e) => setFormActionTaken(e.target.value)}
                placeholder="Details of what was completed, discussed, or resolved at site..."
                className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-16" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Initial Status</Label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status"
                    checked={formStatus === 'closed'}
                    onChange={() => setFormStatus('closed')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Resolved & Closed
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status"
                    checked={formStatus === 'open'}
                    onChange={() => setFormStatus('open')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Open Action Pending
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Remarks / Follow-up Notes</Label>
              <input 
                type="text" 
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                placeholder="e.g. Awaiting spare parts; Customer sign-off complete"
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
              />
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs font-semibold mt-2">
              Log Report
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve / Close Report Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Resolve & Close Action Log</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Confirm resolution remarks to close this logged action item.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <form onSubmit={handleResolveReport} className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-border">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Target Issue</span>
                <p className="font-semibold text-slate-700">{selectedReport.site}</p>
                <p className="italic text-slate-500">"{selectedReport.actionTaken}"</p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">Resolution Remarks</Label>
                <textarea 
                  required
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  placeholder="Details of remedial steps taken, client sign-off, or correction validation..."
                  className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-16" 
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-semibold">
                Mark as Closed & Resolved
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


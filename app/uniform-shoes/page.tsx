'use client'

import { useState, useMemo } from 'react'
import {
  ShirtIcon, Search, Filter, Plus, CalendarDays, CheckCircle2,
  AlertTriangle, Truck, UserCheck, Check, ShoppingBag, Eye
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uniformRecords, sites } from '@/lib/data/ocrms-data'
import type { UniformRecord, ApparelStatus, ApparelType } from '@/lib/types'
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

const statusConfig: Record<ApparelStatus, { label: string; bg: string; text: string }> = {
  issued: { label: 'Issued & Deployed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  pending: { label: 'Pending Delivery', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
  requested: { label: 'Requisition Requested', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
}

export default function UniformShoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localRecords, setLocalRecords] = useState<UniformRecord[]>(uniformRecords)
  const [selectedRecord, setSelectedRecord] = useState<UniformRecord | null>(null)

  // Dispatch details state
  const [dispatchDate, setDispatchDate] = useState('')

  const metrics = useMemo(() => {
    return {
      total: localRecords.length,
      issued: localRecords.filter(r => r.status === 'issued').length,
      pending: localRecords.filter(r => r.status === 'pending' || r.status === 'requested').length,
      rejected: localRecords.filter(r => r.status === 'rejected').length,
    }
  }, [localRecords])

  // Filtered List
  const filteredRecords = useMemo(() => {
    return localRecords.filter((rec) => {
      const matchesSearch = rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rec.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rec.site.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [localRecords, searchTerm, statusFilter])

  const handleIssueApparel = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    setLocalRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: 'issued' as const,
          issueDate: today
        }
      }
      return rec
    }))
    setSelectedRecord(null)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Uniform & Shoes' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-md">
            <ShirtIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Uniform & Shoes Issuance</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage workforce requisitions for corporate security uniforms, winter sweaters, and safety shoes.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-700 hover:to-pink-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> New Apparel Request
        </Button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Requisitions</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.issued}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Apparel Issued</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.pending}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Pending Delivery</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-rose-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-rose-700">{metrics.rejected}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Rejected Orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search employee name, code, or site..."
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
          <option value="issued">Issued</option>
          <option value="pending">Pending</option>
          <option value="requested">Requested</option>
        </select>
      </div>

      {/* Requisitions Grid Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Employee Name</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Site & Designation</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Apparel Type</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Size</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Gender</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Requested On</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Disbursed On</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((rec) => {
              const stat = statusConfig[rec.status]
              return (
                <TableRow key={rec.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rec.employeeName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rec.employeeCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{rec.site}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rec.designation}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium capitalize flex items-center gap-1 w-max">
                      <ShoppingBag size={11} className="text-slate-500" />
                      {rec.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center text-xs text-foreground font-bold">{rec.size}</TableCell>
                  <TableCell className="px-4 py-3.5 text-center text-xs text-slate-600 capitalize">{rec.gender}</TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-slate-600">{rec.requestDate}</TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-slate-600">
                    {rec.issueDate ? (
                      <span className="text-emerald-700 font-semibold">{rec.issueDate}</span>
                    ) : (
                      <span className="text-slate-400 italic">Pending Shipment</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                      {stat.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    {rec.status !== 'issued' && rec.status !== 'rejected' ? (
                      <Button 
                        onClick={() => setSelectedRecord(rec)}
                        size="sm" 
                        className="h-7 px-3 text-[10px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 mx-auto"
                      >
                        Dispatch
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                  No uniform/shoes requests found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dispatch Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => { if (!open) setSelectedRecord(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold text-slate-800">Dispatch Apparel Item</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedRecord ? `Request Ref: ${selectedRecord.id}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-xs">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee details</Label>
                <div className="p-2.5 bg-slate-50 border border-border rounded-lg space-y-1">
                  <p className="text-slate-800 font-bold">{selectedRecord.employeeName} ({selectedRecord.employeeCode})</p>
                  <p className="text-slate-600 font-medium">Site: {selectedRecord.site}</p>
                  <p className="text-slate-600">Requisition details: {selectedRecord.designation} · {selectedRecord.type.toUpperCase()} (Size: {selectedRecord.size})</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-[10px] text-slate-500 italic">Disburse uniform item to site location and record tracking log.</p>
                <Button 
                  onClick={() => handleIssueApparel(selectedRecord.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  <Truck size={13} /> Confirm Apparel Dispatch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

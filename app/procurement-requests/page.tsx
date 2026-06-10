'use client'

import { useState, useMemo } from 'react'
import {
  Package, Search, Filter, Plus, CalendarDays, CheckCircle2,
  AlertTriangle, Truck, ShoppingCart, UserCheck, Send, Check,
  Clock, ShieldCheck
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { procurementRequests, sites } from '@/lib/data/ocrms-data'
import type { ProcurementRequest, ProcurementStatus } from '@/lib/types'
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

const statusConfig: Record<ProcurementStatus, { label: string; bg: string; text: string; icon: any }> = {
  requested: { label: 'Requested', bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-600', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', icon: CheckCircle2 },
  ordered: { label: 'Ordered', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', icon: ShoppingCart },
  shipped: { label: 'Shipped', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', icon: Truck },
  delivered: { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: ShieldCheck },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', icon: AlertTriangle },
}

export default function ProcurementRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localRequests, setLocalRequests] = useState<ProcurementRequest[]>(procurementRequests)
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null)

  // Status Change State
  const [updateStatus, setUpdateStatus] = useState<ProcurementStatus>('delivered')
  const [deliveryDate, setDeliveryDate] = useState('')

  const metrics = useMemo(() => {
    return {
      total: localRequests.length,
      pending: localRequests.filter(r => r.status === 'requested' || r.status === 'approved').length,
      delivered: localRequests.filter(r => r.status === 'delivered').length,
      tatViolations: localRequests.filter(r => !r.withinTAT).length,
    }
  }, [localRequests])

  // Filtered List
  const filteredRequests = useMemo(() => {
    return localRequests.filter((req) => {
      const matchesSearch = req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.material.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [localRequests, searchTerm, statusFilter])

  const handleUpdateProcurement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setLocalRequests(prev => prev.map(item => {
      if (item.id === selectedRequest.id) {
        return {
          ...item,
          status: updateStatus,
          actualDelivery: updateStatus === 'delivered' ? deliveryDate || new Date().toISOString().split('T')[0] : undefined,
          withinTAT: updateStatus === 'delivered' 
            ? new Date(deliveryDate || new Date()) <= new Date(item.expectedDelivery)
            : item.withinTAT
        }
      }
      return item
    }))

    setSelectedRequest(null)
    setDeliveryDate('')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Procurement Requests' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
            <Package className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Material Procurement Requests</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Requisition floor consumables, security uniforms, and equipment. Track TAT lead-times.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> New Purchase Requisition
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
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.pending}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.delivered}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Material Delivered</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-red-700">{metrics.tatViolations}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">TAT SLA Breaches</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search request #, site, or material..."
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
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Procurement Grid Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Request #</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Site & Client</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Requisitioned Material</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Requested</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Expected / Actual</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">TAT Compliance</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => {
              const stat = statusConfig[req.status]
              const StatusIcon = stat.icon
              return (
                <TableRow key={req.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="px-4 py-3.5 font-bold text-xs text-foreground">{req.requestNumber}</TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{req.site}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{req.client}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                    {req.material} <span className="font-normal text-muted-foreground">(Qty: {req.quantity})</span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-foreground">{req.requestedDate}</TableCell>
                  <TableCell className="px-4 py-3.5 text-xs">
                    <p className="text-foreground">Exp: {req.expectedDelivery}</p>
                    {req.actualDelivery && <p className="text-emerald-700 font-medium">Act: {req.actualDelivery}</p>}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    {req.withinTAT ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                        🟢 Within TAT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-100 animate-pulse">
                        🔴 Outside TAT
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                      <StatusIcon size={9} /> {stat.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <Button 
                      onClick={() => setSelectedRequest(req)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 text-[10px] font-bold rounded-lg border-primary/20 text-primary hover:bg-slate-50 flex items-center gap-1 mx-auto"
                    >
                      Procure Action
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                  No material requests found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Procurement Action Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold text-slate-800">Dispatch Purchase Requisition</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedRequest ? `PR Number: ${selectedRequest.requestNumber}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 text-xs">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Request Details</Label>
                <div className="p-2.5 bg-slate-50 border border-border rounded-lg space-y-1">
                  <p className="text-slate-800 font-bold">{selectedRequest.material} (Qty: {selectedRequest.quantity})</p>
                  <p className="text-muted-foreground">Site: {selectedRequest.site}</p>
                  <p className="text-slate-600">Lead Expected Date: {selectedRequest.expectedDelivery}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProcurement} className="border-t pt-3 space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-600 uppercase">Update Logistics Status</Label>
                  <select 
                    value={updateStatus} 
                    onChange={(e) => setUpdateStatus(e.target.value as any)}
                    className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="approved">Approved</option>
                    <option value="ordered">Ordered from Vendor</option>
                    <option value="shipped">In Transit (Shipped)</option>
                    <option value="delivered">Delivered to Site</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {updateStatus === 'delivered' && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-600 uppercase">Actual Delivery Date</Label>
                    <input 
                      type="text" 
                      required
                      placeholder="YYYY-MM-DD"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
                    />
                  </div>
                )}

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs">
                  Submit Dispatch Logs
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

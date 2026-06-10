'use client'

import { useState, useMemo } from 'react'
import {
  Users2, Search, Filter, Plus, CalendarDays, CheckCircle2,
  AlertTriangle, Landmark, Award, Gift, ArrowRight, Check
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { referrals, sites } from '@/lib/data/ocrms-data'
import type { Referral, RewardStatus } from '@/lib/types'
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

const statusConfig: Record<RewardStatus, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid Out', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700' },
  pending: { label: 'Pending Verification', bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
  eligible: { label: 'Eligible for Payout', bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700' },
  ineligible: { label: 'Ineligible', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-600' },
}

export default function ReferralsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localReferrals, setLocalReferrals] = useState<Referral[]>(referrals)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  const metrics = useMemo(() => {
    const totalPayout = localReferrals.filter(r => r.rewardStatus === 'paid').reduce((sum, r) => sum + r.rewardAmount, 0)
    return {
      total: localReferrals.length,
      eligible: localReferrals.filter(r => r.rewardEligible).length,
      paidCount: localReferrals.filter(r => r.rewardStatus === 'paid').length,
      pendingCount: localReferrals.filter(r => r.rewardStatus === 'pending' || r.rewardStatus === 'eligible').length,
      totalPayout
    }
  }, [localReferrals])

  // Filtered List
  const filteredReferrals = useMemo(() => {
    return localReferrals.filter((ref) => {
      const matchesSearch = ref.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ref.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ref.site.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ref.rewardStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [localReferrals, searchTerm, statusFilter])

  const handleApprovePayout = (id: string) => {
    setLocalReferrals(prev => prev.map(ref => {
      if (ref.id === id) {
        return {
          ...ref,
          rewardStatus: 'paid' as const
        }
      }
      return ref
    }))
    setSelectedReferral(null)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Referrals' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 shadow-md">
            <Users2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workforce Referral Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor candidate retention, verify the 90-day policy rule, and disburse referral payouts.
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-700 hover:to-blue-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Add Referral
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-blue-700">{metrics.eligible}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">90-Day Retained</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.paidCount}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Rewards Disbursed</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.pendingCount}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Pending Rewards</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-sky-50 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-sky-800">₹{metrics.totalPayout.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-sky-700 uppercase mt-0.5">Total Disbursed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search candidate, referrer, or site..."
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
          <option value="all">All Reward Statuses</option>
          <option value="paid">Paid Out</option>
          <option value="pending">Pending Verification</option>
          <option value="eligible">Eligible</option>
        </select>
      </div>

      {/* Referrals Grid Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Candidate & Site</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Referrer Details</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joining Date</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">90-Day Retention Progress</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Payout Eligibility</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Reward Status</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferrals.map((ref) => {
              const stat = statusConfig[ref.rewardStatus]
              const progressPct = Math.min(100, Math.round((ref.daysCompleted / 90) * 100))
              return (
                <TableRow key={ref.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ref.candidateName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ref.site}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{ref.referrerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ref.referrerCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs text-foreground">{ref.joiningDate}</TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="max-w-[150px] space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                        <span>{ref.daysCompleted}/90 Days</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            progressPct === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    {ref.rewardEligible ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold leading-none">
                        <CheckCircle2 size={11} /> Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 text-[10px] font-semibold leading-none">
                        <AlertTriangle size={11} /> Ineligible
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                      {stat.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right text-xs font-bold text-slate-800">₹{ref.rewardAmount.toLocaleString()}</TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <Button 
                      onClick={() => setSelectedReferral(ref)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 text-[10px] font-bold rounded-lg border-primary/20 text-primary hover:bg-slate-50 flex items-center gap-1 mx-auto"
                    >
                      Milestones
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredReferrals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                  No workforce referrals found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Milestone Modal */}
      <Dialog open={!!selectedReferral} onOpenChange={(open) => { if (!open) setSelectedReferral(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold text-slate-800">Retention Milestones</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedReferral ? `Candidate: ${selectedReferral.candidateName}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedReferral && (
            <div className="space-y-4 py-2">
              {/* Visual Milestones */}
              <div className="space-y-4">
                <div className="relative border-l-2 pl-4 ml-2 space-y-4 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </span>
                    <p className="font-bold text-slate-700">Day 1 — Onboarded</p>
                    <p className="text-[10px] text-muted-foreground">Candidate joined site operations on {selectedReferral.joiningDate}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border border-white flex items-center justify-center ${
                      selectedReferral.daysCompleted >= 30 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      {selectedReferral.daysCompleted >= 30 && <Check size={8} className="text-white" />}
                    </span>
                    <p className="font-bold text-slate-700">Day 30 — Operational Check</p>
                    <p className="text-[10px] text-muted-foreground">Audit attendance history and site performance compliance.</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border border-white flex items-center justify-center ${
                      selectedReferral.daysCompleted >= 60 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      {selectedReferral.daysCompleted >= 60 && <Check size={8} className="text-white" />}
                    </span>
                    <p className="font-bold text-slate-700">Day 60 — Roster Audit</p>
                    <p className="text-[10px] text-muted-foreground">Audit supervisor reports and reliever history log.</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border border-white flex items-center justify-center ${
                      selectedReferral.daysCompleted >= 90 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      {selectedReferral.daysCompleted >= 90 && <Check size={8} className="text-white" />}
                    </span>
                    <p className="font-bold text-slate-700">Day 90 — Policy Retention Met</p>
                    <p className="text-[10px] text-muted-foreground">Retained on site for 90 days. Reward disbursement status.</p>
                  </div>
                </div>
              </div>

              {/* Resolution/Approve Action */}
              {selectedReferral.rewardStatus === 'pending' && selectedReferral.rewardEligible && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-[10px] text-slate-500 italic">Candidate has met retention policies. Approve reward payout.</p>
                  <Button 
                    onClick={() => handleApprovePayout(selectedReferral.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Landmark size={13} /> Approve Reward Payout
                  </Button>
                </div>
              )}

              <Button onClick={() => setSelectedReferral(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9 text-xs">
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

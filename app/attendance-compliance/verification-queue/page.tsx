'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ExternalLink, ShieldAlert, CheckSquare, Clock } from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'
import { AttendanceVerificationCase } from '@/lib/types'

export default function VerificationQueuePage() {
  const router = useRouter()
  const [cases, setCases] = useState<AttendanceVerificationCase[]>(() => attendanceVerificationCases)

  // Filters
  const [clientFilter, setClientFilter] = useState('All')
  const [shiftFilter, setShiftFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter list options
  const clientsList = useMemo(() => {
    const list = new Set(cases.map(c => c.client))
    return ['All', ...Array.from(list)]
  }, [cases])

  const statusesList = useMemo(() => {
    const list = new Set(cases.map(c => c.status))
    return ['All', ...Array.from(list)]
  }, [cases])

  // Filter calculations
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesClient = clientFilter === 'All' || c.client === clientFilter
      const matchesShift = shiftFilter === 'All' || c.shift === shiftFilter
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      const matchesSearch = searchQuery === '' ||
        c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.designation.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesClient && matchesShift && matchesStatus && matchesSearch
    })
  }, [cases, clientFilter, shiftFilter, statusFilter, searchQuery])

  const handleEscalate = (id: string) => {
    alert(`Case ${id} escalated to RM.`)
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: 'Under Investigation' }
      }
      return c
    }))
  }

  const handleSubmit = (id: string) => {
    alert(`Case ${id} submitted to RM for scoring review.`)
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: 'OE Submitted', oeRating: 4, oeRemarks: 'Verification complete.' }
      }
      return c
    }))
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="shadow-soft border bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by staff name, code, designation, site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Client:</span>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                {clientsList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Shift:</span>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                <option value="All">All Shifts</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                {statusesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Table */}
      <Card className="shadow-soft border bg-card overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-bold text-foreground">Pending Verification Gaps</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="p-4">Employee</th>
                <th className="p-4">Site / Client</th>
                <th className="p-4">Shift / Date</th>
                <th className="p-4">Consecutive Days</th>
                <th className="p-4">Reliever Deployed</th>
                <th className="p-4">Case Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {c.employeeName}
                    <div className="text-[10px] font-normal text-muted-foreground mt-0.5">{c.employeeCode} · {c.designation}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{c.site}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.client}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{c.absentDate}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.shift} Shift</div>
                  </td>
                  <td className="p-4 font-bold text-center md:text-left text-amber-600">
                    {c.consecutiveAbsentDays} Days
                  </td>
                  <td className="p-4">
                    {c.relieverDeployed ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        ✓ {c.relieverName || 'Deployed'}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        ✗ No Reliever
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      c.status === 'Verification Pending'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                        : c.status === 'Under Investigation'
                        ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                        : c.status === 'AVP Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => router.push(`/attendance-compliance/case-management?caseId=${c.id}`)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink size={12} /> Open Case
                      </button>
                      {c.status === 'Verification Pending' && (
                        <>
                          <button
                            onClick={() => handleSubmit(c.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <CheckSquare size={12} /> Submit
                          </button>
                          <button
                            onClick={() => handleEscalate(c.id)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <ShieldAlert size={12} /> Escalate
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

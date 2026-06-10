'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts'
import { attendanceRecords } from '@/lib/data/ocrms-data'
import { AttendanceRecord } from '@/lib/types'

export default function MissingPunchPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    attendanceRecords.filter(r => r.issueType === 'missing_in' || r.issueType === 'missing_out')
  )

  const stats = useMemo(() => {
    const missingIn = records.filter(r => r.issueType === 'missing_in' && r.status !== 'Regularized').length
    const missingOut = records.filter(r => r.issueType === 'missing_out' && r.status !== 'Regularized').length
    const total = missingIn + missingOut
    return { missingIn, missingOut, total }
  }, [records])

  // Recharts Chart Mock Data
  const trendData = [
    { day: 'Mon', 'Missing In': 4, 'Missing Out': 6 },
    { day: 'Tue', 'Missing In': 3, 'Missing Out': 5 },
    { day: 'Wed', 'Missing In': 5, 'Missing Out': 3 },
    { day: 'Thu', 'Missing In': 2, 'Missing Out': 4 },
    { day: 'Fri', 'Missing In': 6, 'Missing Out': 7 },
    { day: 'Sat', 'Missing In': 1, 'Missing Out': 3 },
    { day: 'Sun', 'Missing In': 0, 'Missing Out': 2 }
  ]

  const siteBreakdownData = [
    { name: 'Gurgaon Tower A', value: 5, color: '#3b82f6' },
    { name: 'Bangalore EC', value: 3, color: '#10b981' },
    { name: 'Hinjewadi Campus', value: 4, color: '#f59e0b' },
    { name: 'Cyber Hub Delhi', value: 2, color: '#ec4899' },
    { name: 'Jio Centre Mumbai', value: 4, color: '#8b5cf6' }
  ]

  const handleResolve = (id: string, action: 'Regularized' | 'Rejected') => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: action,
          remarks: `Resolved as ${action} by supervisor.`
        }
      }
      return rec
    }))
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Missing In-Time</p>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-200">{stats.missingIn}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Punch-in card failure logs</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-850">
              <Clock size={20} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Missing Out-Time</p>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-200">{stats.missingOut}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Forgot to clock-out shifts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-850">
              <Clock size={20} className="text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-500">Total Exceptions</p>
              <h3 className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">{stats.total}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Unresolved biometric anomalies</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40">
              <AlertCircle size={20} className="text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Line Chart: Weekly Trend */}
        <Card className="shadow-soft border bg-card md:col-span-2">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Weekly Exception Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Missing In" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Missing Out" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart: Site-wise Breakdown */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Site Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={siteBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {siteBreakdownData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend checklist */}
            <div className="grid grid-cols-2 gap-2 mt-4 w-full text-[10px]">
              {siteBreakdownData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Table */}
      <Card className="shadow-soft border bg-card overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-bold text-foreground">Missing Punch Logs</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="p-4">Employee</th>
                <th className="p-4">Site / Client</th>
                <th className="p-4">Date / Shift</th>
                <th className="p-4">Anomaly Type</th>
                <th className="p-4">Last Logged Punch</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {rec.employeeName}
                    <div className="text-[10px] font-normal text-muted-foreground mt-0.5">{rec.employeeCode}</div>
                  </td>
                  <td className="p-4 font-semibold text-foreground">
                    {rec.site}
                    <div className="text-[10px] font-normal text-muted-foreground mt-0.5">{rec.client}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{rec.date}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{rec.shift} Shift</div>
                  </td>
                  <td className="p-4 font-semibold">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                      rec.issueType === 'missing_in'
                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {rec.issueType === 'missing_in' ? 'Missing In-Time' : 'Missing Out-Time'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                    {rec.punchTime || 'No punches recorded'}
                  </td>
                  <td className="p-4 font-bold">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      rec.status === 'Open'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                        : rec.status === 'Regularized'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {rec.status === 'Open' ? (
                        <>
                          <button
                            onClick={() => handleResolve(rec.id, 'Regularized')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <Check size={12} /> Regularize
                          </button>
                          <button
                            onClick={() => handleResolve(rec.id, 'Rejected')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-bold">✓ Logged Resolved</span>
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

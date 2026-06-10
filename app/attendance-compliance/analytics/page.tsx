'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'

export default function VerificationAnalyticsPage() {
  // 1. Absence reasons breakdown
  const reasonsData = useMemo(() => {
    const counts: Record<string, number> = {}
    attendanceVerificationCases.forEach(c => {
      counts[c.absenceReason] = (counts[c.absenceReason] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [])

  // 2. Reliever coverage
  const relieverCoverage = useMemo(() => {
    const total = attendanceVerificationCases.length
    const deployed = attendanceVerificationCases.filter(c => c.relieverDeployed).length
    return total > 0 ? Math.round((deployed / total) * 100) : 100
  }, [])

  // 3. Vacancy breakdown data
  const vacancyData = [
    { name: 'Open Positions', value: 1, color: '#f59e0b' },
    { name: 'Interviewing', value: 1, color: '#3b82f6' },
    { name: 'Filled Positions', value: 0, color: '#10b981' }
  ]

  // 4. Performance Rating scores
  const scoreData = [
    { name: 'OE Rating', score: 3.7, color: '#3b82f6' },
    { name: 'RM Rating', score: 3.9, color: '#f59e0b' },
    { name: 'AVP Rating', score: 4.0, color: '#10b981' }
  ]

  // 5. Site-wise absenteeism rate
  const siteAbsenteeData = [
    { site: 'Gurgaon Tower A', absentees: 3 },
    { site: 'Bangalore EC', absentees: 2 },
    { site: 'Hinjewadi Campus', absentees: 4 },
    { site: 'Jio Centre Mum', absentees: 5 },
    { site: 'Cyber Hub Delhi', absentees: 3 }
  ]

  return (
    <div className="space-y-6">
      {/* Top gauges row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Coverage Ring */}
        <Card className="shadow-soft border bg-card flex flex-col justify-center items-center p-6 text-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-100 dark:text-slate-900"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={((100 - relieverCoverage) / 100) * (2 * Math.PI * 52)}
                className="text-emerald-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-foreground">{relieverCoverage}%</span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Coverage</p>
            </div>
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-4 uppercase">Reliever Coverage Ratio</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">Operational target: 100% replacements</p>
        </Card>

        {/* Absence Reasons Chart */}
        <Card className="shadow-soft border bg-card md:col-span-2">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Absence Reason Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasonsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Vacancy Breakdown */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Vacancy Hiring Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-[150px] w-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vacancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {vacancyData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 w-full text-[9px] text-center">
              {vacancyData.map((v, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{v.value}</p>
                  <p className="text-muted-foreground truncate">{v.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating averages chart */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Performance Score Audit</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 4]} stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={12}>
                    {scoreData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Site wise breakdown */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold text-foreground">Site-wise Absenteeism Counts</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteAbsenteeData}>
                  <XAxis dataKey="site" stroke="#94a3b8" fontSize={9} interval={0} tickFormatter={(v) => v.slice(0, 10)} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="absentees" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

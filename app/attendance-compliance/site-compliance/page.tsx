'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ArrowUpRight, ArrowDownRight, Award, AlertTriangle, Building2, UserCheck } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ComplianceRow {
  name: string
  parent: string // Client name or Region
  total: number
  present: number
  absent: number
  missingPunch: number
  nonApp: number
  compliancePct: number
}

export default function SiteCompliancePage() {
  const [view, setView] = useState<'site' | 'client' | 'region'>('site')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock site compliance logs
  const siteData: ComplianceRow[] = [
    { name: 'Infosys Gurgaon Tower A', parent: 'Infosys BPO', total: 120, present: 115, absent: 3, missingPunch: 2, nonApp: 2, compliancePct: 95.8 },
    { name: 'Infosys Bangalore EC', parent: 'Infosys BPO', total: 150, present: 144, absent: 4, missingPunch: 2, nonApp: 3, compliancePct: 96.0 },
    { name: 'Wipro Hinjewadi Campus', parent: 'Wipro Technologies', total: 80, present: 74, absent: 4, missingPunch: 2, nonApp: 1, compliancePct: 92.5 },
    { name: 'HDFC Tower Chennai', parent: 'HDFC Bank', total: 60, present: 58, absent: 1, missingPunch: 1, nonApp: 0, compliancePct: 96.7 },
    { name: 'Jio Centre Mumbai', parent: 'Reliance Jio', total: 90, present: 83, absent: 4, missingPunch: 3, nonApp: 1, compliancePct: 92.2 },
    { name: 'DLF Cyber Hub Delhi', parent: 'DLF Cyber City', total: 40, present: 36, absent: 3, missingPunch: 1, nonApp: 1, compliancePct: 90.0 },
    { name: 'Amazon Hyderabad FC', parent: 'Amazon India', total: 200, present: 196, absent: 2, missingPunch: 2, nonApp: 0, compliancePct: 98.0 }
  ]

  // Client view mapping
  const clientData: ComplianceRow[] = [
    { name: 'Amazon India', parent: 'Retail', total: 200, present: 196, absent: 2, missingPunch: 2, nonApp: 0, compliancePct: 98.0 },
    { name: 'HDFC Bank', parent: 'Banking', total: 60, present: 58, absent: 1, missingPunch: 1, nonApp: 0, compliancePct: 96.7 },
    { name: 'Infosys BPO', parent: 'IT Services', total: 270, present: 259, absent: 7, missingPunch: 4, nonApp: 5, compliancePct: 95.9 },
    { name: 'Wipro Technologies', parent: 'IT Services', total: 80, present: 74, absent: 4, missingPunch: 2, nonApp: 1, compliancePct: 92.5 },
    { name: 'Reliance Jio', parent: 'Telecom', total: 90, present: 83, absent: 4, missingPunch: 3, nonApp: 1, compliancePct: 92.2 },
    { name: 'DLF Cyber City', parent: 'Real Estate', total: 40, present: 36, absent: 3, missingPunch: 1, nonApp: 1, compliancePct: 90.0 }
  ]

  // Region view mapping
  const regionData: ComplianceRow[] = [
    { name: 'South Region', parent: 'India', total: 210, present: 202, absent: 5, missingPunch: 3, nonApp: 3, compliancePct: 96.2 },
    { name: 'North Region', parent: 'India', total: 160, present: 151, absent: 6, missingPunch: 3, nonApp: 3, compliancePct: 94.4 },
    { name: 'West Region', parent: 'India', total: 170, present: 157, absent: 8, missingPunch: 5, nonApp: 2, compliancePct: 92.4 },
    { name: 'East Region', parent: 'India', total: 100, present: 89, absent: 7, missingPunch: 4, nonApp: 1, compliancePct: 89.0 }
  ]

  // Select appropriate dataset based on view
  const activeDataset = useMemo(() => {
    switch (view) {
      case 'client': return clientData
      case 'region': return regionData
      default: return siteData
    }
  }, [view])

  // Top & Bottom sites (always calculated based on individual siteData)
  const rankings = useMemo(() => {
    const sorted = [...siteData].sort((a, b) => b.compliancePct - a.compliancePct)
    const top = sorted.slice(0, 3)
    const bottom = [...sorted].reverse().slice(0, 3)
    return { top, bottom }
  }, [])

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery) return activeDataset
    return activeDataset.filter(row =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.parent.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [activeDataset, searchQuery])

  return (
    <div className="space-y-6">
      {/* View Selectors and Search */}
      <Card className="shadow-soft border bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 self-start">
            <button
              onClick={() => setView('site')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                view === 'site'
                  ? 'bg-white dark:bg-zinc-950 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Site View
            </button>
            <button
              onClick={() => setView('client')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                view === 'client'
                  ? 'bg-white dark:bg-zinc-950 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Client View
            </button>
            <button
              onClick={() => setView('region')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                view === 'region'
                  ? 'bg-white dark:bg-zinc-950 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Region View
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search views..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main stats layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Compliance Table */}
        <div className="md:col-span-2">
          <Card className="shadow-soft border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="p-4">Name / Parent</th>
                    <th className="p-4">Staff Count</th>
                    <th className="p-4">Present</th>
                    <th className="p-4">Absent</th>
                    <th className="p-4">Exceptions (Punch/App)</th>
                    <th className="p-4">Compliance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {row.name}
                        <div className="text-[10px] font-normal text-muted-foreground mt-0.5">{row.parent}</div>
                      </td>
                      <td className="p-4 font-semibold text-foreground">{row.total}</td>
                      <td className="p-4 font-bold text-emerald-600">{row.present}</td>
                      <td className="p-4 font-bold text-rose-600">{row.absent}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-350">
                        Missing: <span className="font-bold text-slate-800 dark:text-slate-200">{row.missingPunch}</span> · Non-App: <span className="font-bold text-slate-850 dark:text-slate-200">{row.nonApp}</span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-extrabold text-foreground">
                            <span>{row.compliancePct}%</span>
                          </div>
                          <Progress
                            value={row.compliancePct}
                            className="h-1.5"
                            indicatorClassName={
                              row.compliancePct >= 95
                                ? 'bg-emerald-500'
                                : row.compliancePct >= 90
                                ? 'bg-blue-500'
                                : 'bg-rose-500'
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Top / Bottom Rankings widget */}
        <div className="space-y-6">
          {/* Top Sites */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider flex items-center gap-1.5">
                <Award size={16} /> Top Performing Sites
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {rankings.top.map((site, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-950/20 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{site.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{site.parent}</p>
                  </div>
                  <span className="flex items-center text-emerald-600 font-extrabold gap-0.5">
                    <ArrowUpRight size={14} /> {site.compliancePct}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bottom Sites */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={16} /> Bottom Performing Sites
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {rankings.bottom.map((site, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-rose-500/5 border border-rose-100/50 dark:border-rose-950/20 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{site.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{site.parent}</p>
                  </div>
                  <span className="flex items-center text-rose-600 font-extrabold gap-0.5">
                    <ArrowDownRight size={14} /> {site.compliancePct}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

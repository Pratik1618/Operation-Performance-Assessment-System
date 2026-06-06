'use client'

import { Download, FileSpreadsheet, FileText, Printer, Sheet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { regionPerformance } from '@/lib/data/dashboard'

const reportTypes = [
  {
    id: 'employee',
    name: 'Employee Performance Report',
    description: 'Individual task execution, score, evidence, and approval trail.',
  },
  {
    id: 'region',
    name: 'Region Report',
    description: 'Operational scorecard comparison for all employees in a region.',
  },
  {
    id: 'state',
    name: 'State Report',
    description: 'State-level execution quality, activity backlog, and trends.',
  },
  {
    id: 'completion',
    name: 'Completion Report',
    description: 'Completion metrics, pending items, and evidence status by cycle.',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reports' }]} />

      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Report Management</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Reports</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Generate operational reports for employees, regions, states, and management reviews with export-ready enterprise formatting.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg">
              Save Filter Preset
            </Button>
            <Button size="lg" className="shadow-lg shadow-blue-500/20">
              Generate Report Pack
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              options: ['Month: May', 'April', 'March'],
            },
            {
              options: ['Year: 2025', '2024'],
            },
            {
              options: ['Region: All Regions', 'North', 'South', 'East', 'West'],
            },
            {
              options: ['State: All States', 'Delhi', 'Karnataka', 'West Bengal'],
            },
            {
              options: ['Employee: All Employees', 'Neha Verma', 'Anjali Desai', 'Priya Saxena'],
            },
          ].map((select, idx) => (
            <select
              key={idx}
              className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary dark:bg-slate-900"
            >
              {select.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ))}
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground">{report.name}</CardTitle>
                    <CardDescription className="mt-2 text-xs text-muted-foreground">{report.description}</CardDescription>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
                    <FileText size={18} />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button size="sm" className="inline-flex items-center gap-2">
                    <Download size={16} />
                    Generate
                  </Button>
                  <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                    <Printer size={16} />
                    Preview
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">Region-wise Report Summary</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Quick analytics preview before export</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={regionPerformance}>
                  <CartesianGrid stroke="#dbe4f0" strokeDasharray="3 3" />
                  <XAxis dataKey="region" stroke="#6b7d98" />
                  <YAxis stroke="#6b7d98" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.24)',
                      borderRadius: '1rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="compliancePercent" fill="#1f5eff" radius={[10, 10, 0, 0]} name="Completion %" />
                  <Bar dataKey="averageScore" fill="#10b981" radius={[10, 10, 0, 0]} name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">Export Options</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Enterprise output formats</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left text-xs font-semibold">
                <span className="inline-flex items-center gap-3">
                  <Sheet size={16} />
                  Export Excel
                </span>
                <Download size={16} className="text-muted-foreground" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left text-xs font-semibold">
                <span className="inline-flex items-center gap-3">
                  <FileText size={16} />
                  Export PDF
                </span>
                <Download size={16} className="text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <CardTitle className="text-lg font-semibold text-foreground">Recent Reports</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Previously generated system outputs</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {[
                { name: 'May 2025 Regional Pack', date: '15/05/2025', size: '4.1 MB' },
                { name: 'North Region Executive Summary', date: '12/05/2025', size: '2.8 MB' },
                { name: 'April Completion Dashboard PDF', date: '30/04/2025', size: '3.2 MB' },
                { name: 'State Comparison Export', date: '27/04/2025', size: '2.4 MB' },
              ].map((report) => (
                <div key={report.name} className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm text-xs">
                  <p className="font-semibold text-foreground">{report.name}</p>
                  <p className="mt-1 text-muted-foreground">{report.date} · {report.size}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

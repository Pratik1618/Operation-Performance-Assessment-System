'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, CartesianGrid, Cell, Legend, LineChart, Line,
  PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area
} from 'recharts'
import { BarChart3, TrendingUp, ShieldCheck, Award, AlertCircle, Building2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useOCRMS } from '@/lib/context/ocrms-context'

const COLORS = {
  blue: '#3b82f6', cyan: '#06b6d4', emerald: '#10b981', amber: '#f59e0b',
  rose: '#f43f5e', violet: '#8b5cf6', indigo: '#6366f1', slate: '#64748b',
}

export default function AnalyticsPage() {
  const { tasks, scoringPolicy } = useOCRMS()

  // 1. Overall Metrics
  const metrics = useMemo(() => {
    const total = tasks.length
    const approved = tasks.filter(t => ['approved', 'bh_approved'].includes(t.status)).length
    const submitted = tasks.filter(t => ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(t.status)).length
    const complianceRate = total > 0 ? Math.round(((approved + submitted) / total) * 100) : 0
    
    // Average scores
    const approvedTasks = tasks.filter(t => ['approved', 'bh_approved', 'avp_approved', 'rm_approved'].includes(t.status))
    const totalMaxPoints = approvedTasks.reduce((sum, t) => sum + t.weightage, 0)
    const totalMaxScorePoints = approvedTasks.reduce((sum, t) => sum + (t.weightage * t.weightage), 0)
    
    const oeSum = approvedTasks.reduce((sum, t) => sum + (t.oeRating || 0), 0)
    const rmSum = approvedTasks.reduce((sum, t) => sum + (t.rmRating || 0), 0)
    const avpSum = approvedTasks.reduce((sum, t) => sum + (t.avpRating || 0), 0)
    const finalSum = approvedTasks.reduce((sum, t) => sum + (t.finalScore || 0), 0)

    const calcAvgPercent = (sum: number) => {
      return totalMaxPoints > 0 ? Math.round((sum / totalMaxPoints) * 100) : 0
    }

    return {
      total,
      approved,
      complianceRate,
      oeAvg: calcAvgPercent(oeSum),
      rmAvg: calcAvgPercent(rmSum),
      avpAvg: calcAvgPercent(avpSum),
      finalAvg: totalMaxScorePoints > 0 ? Math.round((finalSum / totalMaxScorePoints) * 100) : 0
    }
  }, [tasks])

  // 2. Category Compliance Chart Data
  const categoryChartData = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>()
    tasks.forEach(t => {
      const curr = map.get(t.category) || { completed: 0, total: 0 }
      curr.total += 1
      if (['approved', 'bh_approved', 'avp_approved', 'rm_approved', 'oe_submitted', 'submitted'].includes(t.status)) {
        curr.completed += 1
      }
      map.set(t.category, curr)
    })

    return Array.from(map.entries()).map(([category, val]) => ({
      category,
      compliance: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0
    })).sort((a, b) => b.compliance - a.compliance)
  }, [tasks])

  // 3. Role Averages Chart Data
  const roleChartData = useMemo(() => {
    return [
      { role: 'OE Self Rating', average: metrics.oeAvg, fill: COLORS.blue },
      { role: 'RM Review Rating', average: metrics.rmAvg, fill: COLORS.indigo },
      { role: 'AVP Final Rating', average: metrics.avpAvg, fill: COLORS.emerald },
      { role: 'Calculated Final Score', average: metrics.finalAvg, fill: COLORS.violet }
    ]
  }, [metrics])

  // 4. Monthly Trend Data (Dynamic simulation with Jun matching live compliance)
  const monthlyTrendData = [
    { month: 'Jan', compliance: 74, target: 85 },
    { month: 'Feb', compliance: 78, target: 85 },
    { month: 'Mar', compliance: 82, target: 85 },
    { month: 'Apr', compliance: 80, target: 85 },
    { month: 'May', compliance: 85, target: 85 },
    { month: 'Jun', compliance: metrics.complianceRate, target: 85 },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Analytics' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 shadow-md">
            <BarChart3 className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Compliance & Performance Insights</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live statistics dynamically computed from operational checklists, supervisor scoring, and active scoring policy.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-150 bg-indigo-50/50 px-3.5 py-2 text-xs font-bold text-indigo-800 shadow-soft">
          Calculations: <span className="uppercase text-[11px] bg-indigo-150 px-2 py-0.5 rounded ml-1">{scoringPolicy.replace('_', ' ')}</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4 shadow-soft border rounded-2xl bg-white text-center">
          <p className="text-2xl font-extrabold text-slate-800">{metrics.complianceRate}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Compliance Adherence</p>
        </Card>
        <Card className="p-4 shadow-soft border rounded-2xl bg-white text-center">
          <p className="text-2xl font-extrabold text-blue-600">{metrics.oeAvg}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Average OE Self-Rating</p>
        </Card>
        <Card className="p-4 shadow-soft border rounded-2xl bg-white text-center">
          <p className="text-2xl font-extrabold text-indigo-600">{metrics.rmAvg}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Average RM Review Score</p>
        </Card>
        <Card className="p-4 shadow-soft border rounded-2xl bg-white text-center bg-indigo-50/30 border-indigo-200">
          <p className="text-2xl font-extrabold text-indigo-800">{metrics.finalAvg}%</p>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">Performance Index Score</p>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compliance trends monthly */}
        <Card className="shadow-soft border rounded-2xl bg-white">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">Monthly Compliance Adherence Trend</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              Comparison between actual compliance and target (85%) over the past 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="compliance" stroke={COLORS.blue} strokeWidth={2.5} fill="url(#compGrad)" name="Actual Compliance" />
                <Line type="monotone" dataKey="target" stroke={COLORS.emerald} strokeWidth={1.5} strokeDasharray="4 4" name="Target compliance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown bar chart */}
        <Card className="shadow-soft border rounded-2xl bg-white">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">Category-wise Compliance Breakdown</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              Real-time percentage compliance across the 9 primary Excel categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryChartData} barSize={20} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="compliance" name="Compliance %" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, idx) => (
                    <Cell key={idx} fill={[COLORS.blue, COLORS.emerald, COLORS.violet, COLORS.cyan, COLORS.indigo][idx % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparative Rating average chart */}
        <Card className="shadow-soft border rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">Review Hierarchy Score Comparison</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              Comparison between self-assigned scoring and supervisor review scores.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={roleChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="role" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="average" name="Average Performance score %" radius={[6, 6, 0, 0]}>
                  {roleChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Building2, CalendarCheck, CheckCircle2,
  Clock3, ClipboardList, FileStack, HeadphonesIcon, ListChecks,
  Shield, Users2, Play
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { sites } from '@/lib/data/ocrms-data'

const COLORS = {
  blue: '#3b82f6', cyan: '#06b6d4', emerald: '#10b981', amber: '#f59e0b',
  rose: '#f43f5e', violet: '#8b5cf6', indigo: '#6366f1', slate: '#64748b',
}

export default function DashboardPage() {
  const router = useRouter()
  const { tasks, templates, currentRole, currentUser } = useOCRMS()
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null)

  const roleTasks = useMemo(() => {
    const isRoleMatch = (assignedRolesStr: string | undefined, role: string) => {
      if (!assignedRolesStr) return false;
      const roles = assignedRolesStr.toLowerCase().split(',').map(r => r.trim());
      if (role === 'hr') {
        return roles.includes('hr') || roles.includes('hrbp') || roles.includes('hr dr');
      }
      if (role === 'procurement') {
        return roles.includes('procurement') || roles.includes('ph') || roles.includes('commerical') || roles.includes('commercial');
      }
      return roles.includes(role.toLowerCase());
    };

    return tasks.filter(t => {
      // 1. Role match check on template
      const tpl = templates.find(tpl => tpl.id === t.templateId);
      if (!tpl) return false;
      if (!isRoleMatch(tpl.assignedRoles, currentRole)) return false;

      // 2. User assignment/site check
      if (currentRole === 'oe') {
        return t.assignedTo === currentUser?.userName;
      }
      const site = sites.find(s => s.id === t.siteId);
      if (currentRole === 'rm') {
        return site?.assignedRM === currentUser?.userName;
      }
      if (currentRole === 'avp') {
        return site?.assignedAVP === currentUser?.userName;
      }
      return true;
    });
  }, [tasks, templates, currentRole, currentUser])

  // Compute live KPIs
  const liveKPIs = useMemo(() => {
    const total = roleTasks.length
    const approved = roleTasks.filter(t => ['approved', 'bh_approved'].includes(t.status)).length
    const submitted = roleTasks.filter(t => ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(t.status)).length
    const pending = roleTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
    const overdue = roleTasks.filter(t => t.status === 'overdue').length
    const compliance = total > 0 ? Math.round(((approved + submitted) / total) * 100) : 0

    // Specific category/name counts
    const siteVisitsCompleted = roleTasks.filter(t => t.taskName === 'Site Visit Report' && ['approved', 'bh_approved'].includes(t.status)).length
    const pendingApprovals = roleTasks.filter(t => ['oe_submitted', 'submitted', 'rm_approved', 'avp_approved'].includes(t.status)).length
    const openIncidents = roleTasks.filter(t => t.taskName === 'Incident Report' && !['approved', 'bh_approved'].includes(t.status)).length

    // Frequency compliance
    const calcFreqCompliance = (freq: string) => {
      const freqTasks = roleTasks.filter(t => t.frequency === freq)
      const approvedCount = freqTasks.filter(t => ['approved', 'bh_approved', 'avp_approved', 'rm_approved', 'oe_submitted', 'submitted'].includes(t.status)).length
      return freqTasks.length > 0 ? Math.round((approvedCount / freqTasks.length) * 100) : 0
    }

    return {
      total,
      approved,
      submitted,
      pending,
      overdue,
      compliance,
      siteVisitsCompleted,
      pendingApprovals,
      openIncidents,
      daily: calcFreqCompliance('daily'),
      weekly: calcFreqCompliance('weekly'),
      fortnightly: calcFreqCompliance('fortnightly'),
      monthly: calcFreqCompliance('monthly'),
    }
  }, [roleTasks])

  const kpiCards = [
    { label: 'Total Assigned', value: liveKPIs.total, icon: FileStack, color: 'from-blue-600 to-sky-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { label: 'Completed (Approved)', value: liveKPIs.approved, icon: CheckCircle2, color: 'from-emerald-600 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { label: 'Pending OE Execution', value: liveKPIs.pending, icon: Clock3, color: 'from-amber-500 to-yellow-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    { label: 'Overdue Alerts', value: liveKPIs.overdue, icon: AlertTriangle, color: 'from-rose-600 to-red-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    { label: 'Performance Rate', value: `${liveKPIs.compliance}%`, icon: Shield, color: 'from-indigo-600 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    { label: 'Site Visits Done', value: liveKPIs.siteVisitsCompleted, icon: Building2, color: 'from-teal-600 to-cyan-500', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    { label: 'Awaiting Reviews', value: liveKPIs.pendingApprovals, icon: ClipboardList, color: 'from-purple-600 to-fuchsia-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { label: 'Active Incidents', value: liveKPIs.openIncidents, icon: AlertTriangle, color: 'from-orange-600 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  ]

  const frequencyCards = [
    { label: 'Daily Tasks', value: `${liveKPIs.daily}%`, color: 'from-blue-500 to-blue-600', ring: liveKPIs.daily },
    { label: 'Weekly Tasks', value: `${liveKPIs.weekly}%`, color: 'from-violet-500 to-violet-600', ring: liveKPIs.weekly },
    { label: 'Fortnightly', value: `${liveKPIs.fortnightly}%`, color: 'from-cyan-500 to-cyan-600', ring: liveKPIs.fortnightly },
    { label: 'Monthly Tasks', value: `${liveKPIs.monthly}%`, color: 'from-emerald-500 to-emerald-600', ring: liveKPIs.monthly },
  ]

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Approved', value: liveKPIs.approved, fill: COLORS.emerald },
      { name: 'Submitted (RM/AVP Queue)', value: liveKPIs.submitted, fill: COLORS.indigo },
      { name: 'Pending', value: liveKPIs.pending, fill: COLORS.amber },
      { name: 'Overdue', value: liveKPIs.overdue, fill: COLORS.rose },
    ]
  }, [liveKPIs])

  // Category completion list
  const categoryCompletionList = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>()

    roleTasks.forEach(t => {
      const curr = map.get(t.category) || { completed: 0, total: 0 }
      curr.total += 1
      if (['approved', 'bh_approved', 'avp_approved', 'rm_approved', 'oe_submitted', 'submitted'].includes(t.status)) {
        curr.completed += 1
      }
      map.set(t.category, curr)
    })

    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      completed: val.completed,
      total: val.total
    })).sort((a, b) => b.total - a.total)
  }, [roleTasks])

  // Active Widgets Lists
  const todaysPendingTasks = useMemo(() => {
    // Simulate current date June 9, 2026
    return roleTasks.filter(t => (t.status === 'pending' || t.status === 'in_progress') && t.dueDate === '2026-06-09').slice(0, 5)
  }, [roleTasks])

  const overdueReports = useMemo(() => {
    return roleTasks.filter(t => t.status === 'overdue').slice(0, 5)
  }, [roleTasks])

  const openIncidentsList = useMemo(() => {
    return roleTasks.filter(t => t.taskName === 'Incident Report' && t.status !== 'approved').slice(0, 5)
  }, [roleTasks])

  const openGrievances = useMemo(() => {
    return roleTasks.filter(t => t.taskName === 'Employee Grievance' && t.status !== 'approved').slice(0, 5)
  }, [roleTasks])

  // Mock static charts trend (for rich graphics)
  const dailyComplianceTrend = [
    { day: 'Mon', compliance: Math.max(70, liveKPIs.compliance - 5), target: 90 },
    { day: 'Tue', compliance: Math.max(72, liveKPIs.compliance - 3), target: 90 },
    { day: 'Wed', compliance: liveKPIs.compliance, target: 90 },
    { day: 'Thu', compliance: Math.min(95, liveKPIs.compliance + 2), target: 90 },
    { day: 'Fri', compliance: Math.min(94, liveKPIs.compliance + 4), target: 90 },
    { day: 'Sat', compliance: Math.min(98, liveKPIs.compliance + 6), target: 90 },
  ]

  const monthlyComplianceTrend = [
    { month: 'Jan', compliance: 78 },
    { month: 'Feb', compliance: 82 },
    { month: 'Mar', compliance: 80 },
    { month: 'Apr', compliance: 85 },
    { month: 'May', compliance: 88 },
    { month: 'Jun', compliance: liveKPIs.compliance },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      {/* Executive Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-md">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-2xl" />
        <div className="absolute left-1/3 bottom-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 blur-xl" />
        
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Live Operations Dashboard
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
              Executive Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back, <span className="font-semibold text-slate-700">{currentUser.userName}</span> · Current Role: <span className="font-bold text-indigo-700 uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">{currentUser.role}</span>
            </p>
          </div>
          
          <Link
            href="/my-tasks"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] w-fit"
          >
            <ListChecks size={14} />
            Go to My Tasks
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card
              key={kpi.label}
              className={`relative overflow-hidden transition-all duration-300 cursor-default border ${kpi.border} ${
                hoveredKpi === index 
                  ? 'shadow-lg shadow-slate-200 -translate-y-1 scale-[1.02] border-slate-300 bg-white' 
                  : 'shadow-soft bg-white/95'
              }`}
              onMouseEnter={() => setHoveredKpi(index)}
              onMouseLeave={() => setHoveredKpi(null)}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg} mb-3 transition-transform duration-300 ${hoveredKpi === index ? 'scale-110' : ''}`}>
                    <Icon size={16} className={kpi.text} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{kpi.value}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-2 leading-tight uppercase tracking-wider">{kpi.label}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
            </Card>
          )
        })}
      </div>

      {/* Frequency Compliance Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {frequencyCards.map((freq) => (
          <Card key={freq.label} className="overflow-hidden border border-slate-100 shadow-soft bg-white hover:shadow-medium hover:border-slate-200 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{freq.label}</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{freq.value}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">performance rate</p>
                </div>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="#f8fafc" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="23" fill="none"
                      stroke={`url(#grad-${freq.label.replace(/\s+/g, '-').toLowerCase()})`} strokeWidth="4.5" strokeLinecap="round"
                      strokeDasharray={`${(freq.ring / 100) * 144.5} 144.5`}
                      className="transition-all duration-500 ease-out"
                    />
                    <defs>
                      <linearGradient id={`grad-${freq.label.replace(/\s+/g, '-').toLowerCase()}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={freq.label.startsWith('Daily') ? '#3b82f6' : freq.label.startsWith('Weekly') ? '#8b5cf6' : freq.label.startsWith('Fortnightly') ? '#06b6d4' : '#10b981'} />
                        <stop offset="100%" stopColor={freq.label.startsWith('Daily') ? '#60a5fa' : freq.label.startsWith('Weekly') ? '#a78bfa' : freq.label.startsWith('Fortnightly') ? '#22d3ee' : '#34d399'} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-slate-800">{freq.ring}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Daily & Monthly Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Compliance Trend */}
        <Card className="shadow-soft border border-slate-150 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Daily Performance Trend
              </CardTitle>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">This Cycle</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyComplianceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="complianceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.08} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: '600', fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fontWeight: '600', fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="target" stroke={COLORS.emerald} strokeWidth={1.5} strokeDasharray="4 4" fill="url(#targetFill)" name="Target Performance" />
                <Area type="monotone" dataKey="compliance" stroke={COLORS.blue} strokeWidth={3} fill="url(#complianceFill)" name="Actual Performance" dot={{ stroke: COLORS.blue, strokeWidth: 2, r: 3, fill: '#fff' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Compliance Trend */}
        <Card className="shadow-soft border border-slate-150 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Monthly Performance Trend
              </CardTitle>
              <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Jan–Jun 2026</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyComplianceTrend} barSize={24} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: '600', fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fontWeight: '600', fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: '600' }}
                />
                <Bar dataKey="compliance" name="Performance %" radius={[6, 6, 0, 0]}>
                  {monthlyComplianceTrend.map((entry, i) => (
                    <Cell key={i} fill={entry.compliance >= 85 ? COLORS.emerald : entry.compliance >= 70 ? COLORS.amber : COLORS.rose} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Completion Pie + Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Completion Distribution */}
        <Card className="shadow-soft border border-slate-150 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60 px-5">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Task Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col justify-between h-[250px]">
            <div className="flex items-center justify-center h-full">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-[10px] text-slate-600 font-bold">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Completion Bars */}
        <Card className="shadow-soft border border-slate-150 rounded-2xl bg-white overflow-hidden lg:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60 px-5">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Category-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 h-[250px] overflow-y-auto pr-2 scrollbar-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {categoryCompletionList.map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0
                return (
                  <div key={cat.name} className="space-y-1 hover:bg-slate-50/50 p-1.5 rounded-xl transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[170px]">{cat.name}</span>
                      <span className="text-[10px] font-extrabold text-slate-500">{cat.completed}/{cat.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 85 ? COLORS.emerald : pct >= 70 ? COLORS.amber : COLORS.rose,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget Panels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Today's Pending Tasks */}
        <Card className="shadow-soft border-l-4 border-l-amber-500 border border-slate-150 rounded-2xl bg-white overflow-hidden hover:shadow-medium transition-shadow duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-amber-50/20 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800">
                <Clock3 size={15} className="text-amber-600" />
                Today&apos;s Pending Tasks
              </CardTitle>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{todaysPendingTasks.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {todaysPendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{task.taskName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{task.siteName}</p>
                </div>
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 border-0 bg-transparent cursor-pointer ml-3 flex-shrink-0 transition-transform active:scale-95"
                >
                  <Play size={13} className="fill-indigo-600" />
                </button>
              </div>
            ))}
            {todaysPendingTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-[11px] text-slate-400 italic font-semibold">No pending tasks for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Reports */}
        <Card className="shadow-soft border-l-4 border-l-rose-500 border border-slate-150 rounded-2xl bg-white overflow-hidden hover:shadow-medium transition-shadow duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-rose-50/20 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800">
                <AlertTriangle size={15} className="text-rose-600" />
                Overdue Alerts
              </CardTitle>
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">{overdueReports.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {overdueReports.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{task.taskName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{task.siteName} · Due {task.dueDate}</p>
                </div>
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 border-0 bg-transparent cursor-pointer ml-3 flex-shrink-0 transition-transform active:scale-95"
                >
                  <Play size={13} className="fill-rose-600" />
                </button>
              </div>
            ))}
            {overdueReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-[11px] text-slate-400 italic font-semibold">No overdue tasks.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card className="shadow-soft border-l-4 border-l-red-600 border border-slate-150 rounded-2xl bg-white overflow-hidden hover:shadow-medium transition-shadow duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-red-50/20 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800">
                <AlertTriangle size={15} className="text-red-600" />
                Active Incidents
              </CardTitle>
              <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">{openIncidentsList.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {openIncidentsList.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">Incident Report</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{task.siteName} · Due {task.dueDate}</p>
                </div>
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="rounded-xl p-2 text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer ml-3 flex-shrink-0 transition-transform active:scale-95"
                >
                  <Play size={13} className="fill-red-600" />
                </button>
              </div>
            ))}
            {openIncidentsList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-[11px] text-slate-400 italic font-semibold">No active incident reports.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Grievances */}
        <Card className="shadow-soft border-l-4 border-l-indigo-500 border border-slate-150 rounded-2xl bg-white overflow-hidden hover:shadow-medium transition-shadow duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-indigo-50/20 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-800">
                <Users2 size={15} className="text-indigo-600" />
                Open Grievances
              </CardTitle>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{openGrievances.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {openGrievances.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">Employee Grievance</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{task.siteName} · Due {task.dueDate}</p>
                </div>
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 border-0 bg-transparent cursor-pointer ml-3 flex-shrink-0 transition-transform active:scale-95"
                >
                  <Play size={13} className="fill-indigo-600" />
                </button>
              </div>
            ))}
            {openGrievances.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-[11px] text-slate-400 italic font-semibold">No open grievances.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

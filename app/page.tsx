'use client'

import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  ChartNoAxesCombined,
  CircleDashed,
  ClipboardCheck,
  FileStack,
  Shield,
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  activityCompletionBreakdown,
  activityTrends,
  awaitingApprovals,
  complianceTrends,
  dashboardKPI,
  recentActivities,
  regionPerformance,
} from '@/lib/data/dashboard'
import { formatDate } from '@/lib/utils'

const kpiCards = [
  {
    label: 'Total Activities',
    value: dashboardKPI.totalActivities,
    icon: FileStack,
    accent: 'from-blue-600 to-sky-500',
    detail: 'Monthly operational tasks tracked across all active scorecards',
  },
  {
    label: 'Completed Activities',
    value: dashboardKPI.completedActivities,
    icon: ClipboardCheck,
    accent: 'from-emerald-600 to-teal-500',
    detail: 'Field tasks closed with evidence and verified status updates',
  },
  {
    label: 'Pending Activities',
    value: dashboardKPI.pendingActivities,
    icon: CircleDashed,
    accent: 'from-amber-500 to-orange-500',
    detail: 'Tasks still open in execution, review, or evidence collection',
  },
  {
    label: 'Completion Percentage',
    value: `${dashboardKPI.compliancePercent}%`,
    icon: Shield,
    accent: 'from-indigo-600 to-blue-500',
    detail: 'Weighted completion across all regions for the current cycle',
  },
  {
    label: 'Performance Score',
    value: dashboardKPI.averagePerformanceScore,
    icon: ChartNoAxesCombined,
    accent: 'from-violet-600 to-fuchsia-500',
    detail: 'Average operating score across active monthly assessments',
  },
  {
    label: 'Awaiting Approval',
    value: dashboardKPI.assessmentsAwaitingApproval,
    icon: AlertCircle,
    accent: 'from-rose-500 to-red-500',
    detail: 'Assessments pending RM, AVP, or business-head action',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Operations performance overview</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <div className="rounded bg-primary/10 p-2 text-primary flex-shrink-0">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{card.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityTrends}>
                  <defs>
                    <linearGradient id="completedGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#1f5eff" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#1f5eff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(31, 94, 255, 0.2)',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="completed" stroke="#1f5eff" fill="url(#completedGradient)" strokeWidth={3} name="Completed" />
                  <Area type="monotone" dataKey="pending" stroke="#f59e0b" fill="transparent" strokeWidth={2.5} name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={activityCompletionBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={92}
                      innerRadius={52}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {activityCompletionBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(31, 94, 255, 0.2)',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Region Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionPerformance}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis dataKey="region" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(31, 94, 255, 0.2)',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                      }}
                    />
                    <Bar dataKey="compliancePercent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completion %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={complianceTrends}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis domain={[75, 95]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(31, 94, 255, 0.2)',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                    }}
                  />
                  <Bar dataKey="compliance" fill="#0f766e" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border rounded bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-foreground">{activity.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{activity.userName}</span> · {activity.userRole}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(activity.timestamp)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {awaitingApprovals.map((approval) => (
                  <Link
                    key={approval.id}
                    href={`/assessments/${approval.assessmentId}`}
                    className="block border rounded bg-muted/50 p-3 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{approval.employeeName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{approval.month}</p>
                      </div>
                      <StatusBadge status={approval.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

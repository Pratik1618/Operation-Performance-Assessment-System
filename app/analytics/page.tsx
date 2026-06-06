'use client'

import React, { useState, useEffect } from 'react'
import {
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
import { Award, Building2, Gauge, Globe2, MapPinned, UserRoundCheck, Users, TrendingUp, Layers } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const topPerformersOverall = [
  { name: 'Neha Verma', score: 8.5, region: 'East', state: 'West Bengal' },
  { name: 'Priya Saxena', score: 8.4, region: 'North', state: 'Punjab' },
  { name: 'Anjali Desai', score: 8.0, region: 'South', state: 'Karnataka' },
]

const bottomPerformersOverall = [
  { name: 'Raj Kumar', score: 6.8, region: 'West', state: 'Maharashtra' },
  { name: 'Suresh Singh', score: 7.1, region: 'Central', state: 'Madhya Pradesh' },
  { name: 'Kiran Nair', score: 7.2, region: 'South', state: 'Tamil Nadu' },
]

const statePerformanceOverall = [
  { state: 'Delhi', score: 8.4 },
  { state: 'Punjab', score: 8.2 },
  { state: 'West Bengal', score: 8.1 },
  { state: 'Karnataka', score: 7.9 },
  { state: 'Maharashtra', score: 7.6 },
]

const zonePerformanceOverall = [
  { zone: 'North-Central', score: 8.5 },
  { zone: 'North-West', score: 8.2 },
  { zone: 'East-Central', score: 8.1 },
  { zone: 'South-Central', score: 7.9 },
  { zone: 'West-Coastal', score: 7.4 },
]

const heatmapOverall = [
  ['North', 92, 88, 85, 90],
  ['South', 83, 80, 86, 82],
  ['East', 89, 91, 88, 87],
  ['West', 78, 81, 79, 76],
]

// Role-based mock metrics
const roleData = {
  rm: {
    regionName: 'North Region',
    topPerformers: [
      { name: 'Priya Saxena', score: 8.4, region: 'North', state: 'Punjab' },
      { name: 'Vikash Jain', score: 7.9, region: 'North', state: 'Delhi' },
    ],
    bottomPerformers: [
      { name: 'Rohan Sharma', score: 7.1, region: 'North', state: 'Delhi' },
    ],
    statePerformance: [
      { state: 'Delhi', score: 8.4 },
      { state: 'Punjab', score: 8.2 },
    ],
    zonePerformance: [
      { zone: 'North-Central', score: 8.5 },
      { zone: 'North-West', score: 8.2 },
    ],
    heatmap: [
      ['Delhi Cluster', 92, 88, 85, 90],
      ['Punjab Cluster', 86, 89, 91, 88],
    ],
    kpis: [
      { label: 'Region Employees', value: 342, icon: Users },
      { label: 'Avg Compliance', value: '91.0%', icon: Gauge },
      { label: 'L1 Executive Score', value: '7.9', icon: Award },
      { label: 'L2 RM Review Score', value: '8.4', icon: Award },
      { label: 'Pending L2 Actions', value: 4, icon: UserRoundCheck },
      { label: 'Active Zones', value: 2, icon: Globe2 },
    ],
    chartData: [
      { region: 'North-Central', compliancePercent: 91, l1Score: 7.9, l2Score: 8.5 },
      { region: 'North-West', compliancePercent: 88, l1Score: 7.7, l2Score: 8.2 },
    ]
  },
  avp: {
    regionName: 'All Regional Review (L3 View)',
    topPerformers: [
      { name: 'Neha Verma', score: 8.5, region: 'East', state: 'West Bengal' },
      { name: 'Priya Saxena', score: 8.4, region: 'North', state: 'Punjab' },
    ],
    bottomPerformers: [
      { name: 'Kiran Nair', score: 7.2, region: 'South', state: 'Tamil Nadu' },
    ],
    statePerformance: [
      { state: 'Delhi', score: 8.4 },
      { state: 'Punjab', score: 8.2 },
      { state: 'West Bengal', score: 8.1 },
    ],
    zonePerformance: [
      { zone: 'North-Central', score: 8.5 },
      { zone: 'North-West', score: 8.2 },
      { zone: 'East-Central', score: 8.1 },
    ],
    heatmap: [
      ['North Region', 92, 88, 85, 90],
      ['East Region', 89, 91, 88, 87],
    ],
    kpis: [
      { label: 'Under Supervision', value: 812, icon: Users },
      { label: 'Avg AVP Scored Comp', value: '89.5%', icon: Gauge },
      { label: 'L2 RM Score Avg', value: '8.2', icon: Award },
      { label: 'L3 AVP Score Avg', value: '8.4', icon: Award },
      { label: 'Pending L3 Approvals', value: 6, icon: UserRoundCheck },
      { label: 'Active States', value: 3, icon: Globe2 },
    ],
    chartData: [
      { region: 'North Region', compliancePercent: 91, l2Score: 8.4, l3Score: 8.6 },
      { region: 'East Region', compliancePercent: 88, l2Score: 8.1, l3Score: 8.3 },
      { region: 'South Region', compliancePercent: 87, l2Score: 7.9, l3Score: 8.1 },
    ]
  },
  bh: {
    regionName: 'Enterprise Dashboard (L4 View)',
    topPerformers: topPerformersOverall,
    bottomPerformers: bottomPerformersOverall,
    statePerformance: statePerformanceOverall,
    zonePerformance: zonePerformanceOverall,
    heatmap: heatmapOverall,
    kpis: [
      { label: 'Total Employees', value: 1248, icon: Users },
      { label: 'Avg L1 Self-Score', value: '7.8 / 10', icon: Award },
      { label: 'Avg L2 RM Score', value: '8.1 / 10', icon: Award },
      { label: 'Avg L3 AVP Score', value: '8.3 / 10', icon: Award },
      { label: 'Avg L4 BH Final Score', value: '8.4 / 10', icon: Award },
      { label: 'Final Approved Reports', value: 184, icon: UserRoundCheck },
    ],
    chartData: [
      { region: 'North', l1Score: 7.9, l2Score: 8.4, l3Score: 8.6, l4Score: 8.7 },
      { region: 'East', l1Score: 7.8, l2Score: 8.1, l3Score: 8.3, l4Score: 8.4 },
      { region: 'South', l1Score: 7.5, l2Score: 7.9, l3Score: 8.1, l4Score: 8.2 },
      { region: 'West', l1Score: 7.7, l2Score: 8.2, l3Score: 8.4, l4Score: 8.5 },
      { region: 'Central', l1Score: 7.4, l2Score: 7.8, l3Score: 8.0, l4Score: 8.1 },
    ]
  }
}

const workflowDistribution = [
  { name: 'L1 Draft', value: 8, fill: '#3b82f6' },
  { name: 'Pending L2 (RM)', value: 14, fill: '#f59e0b' },
  { name: 'Pending L3 (AVP)', value: 6, fill: '#10b981' },
  { name: 'Pending L4 (BH)', value: 4, fill: '#6366f1' },
  { name: 'Approved Final', value: 52, fill: '#8b5cf6' },
]

function heatColor(value: number) {
  if (value >= 90) return 'bg-emerald-500 hover:bg-emerald-600 transition-colors'
  if (value >= 85) return 'bg-emerald-400 hover:bg-emerald-500 transition-colors'
  if (value >= 80) return 'bg-amber-400 hover:bg-amber-500 transition-colors'
  return 'bg-rose-400 hover:bg-rose-500 transition-colors'
}

export default function AnalyticsPage() {
  const [activeRole, setActiveRole] = useState<'rm' | 'avp' | 'bh'>('bh')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole && ['rm', 'avp', 'bh'].includes(savedRole)) {
        setActiveRole(savedRole)
      } else if (savedRole === 'employee') {
        setActiveRole('rm') // L1 executive falls back to L2 RM view for analytics
      }
    }

    const handleRoleChange = (e: CustomEvent) => {
      const role = e.detail
      if (['rm', 'avp', 'bh'].includes(role)) {
        setActiveRole(role)
      } else if (role === 'employee') {
        setActiveRole('rm')
      }
    }

    window.addEventListener('simulated_role_change' as any, handleRoleChange)
    return () => {
      window.removeEventListener('simulated_role_change' as any, handleRoleChange)
    }
  }, [])

  const currentRoleData = roleData[activeRole]

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Analytics' }]} />

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 px-4 py-2 text-xs font-semibold text-indigo-700">
        Showing metrics filtered for active role: <span className="underline">{activeRole.toUpperCase()}</span> (Change role in the top header menu)
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {currentRoleData.regionName}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Executive Analytics</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Enterprise-wide visibility into scoring progression. Compare L1 self-assessments against RM validations, AVP checks, and BH sign-offs.
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {currentRoleData.kpis.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary flex-shrink-0">
                  <Icon size={18} />
                </div>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {activeRole === 'rm'
                    ? 'L1 Self-Score vs L2 RM Verification'
                    : activeRole === 'avp'
                      ? 'L2 RM Score vs L3 AVP Review'
                      : 'Multi-Level Review Comparison (L1 → L2 → L3 → L4)'}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Score deviation metrics across operating tiers
                </CardDescription>
              </div>
              <TrendingUp size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={currentRoleData.chartData as any[]}>
                  <CartesianGrid stroke="#dbe4f0" strokeDasharray="3 3" />
                  <XAxis dataKey="region" stroke="#6b7d98" />
                  <YAxis stroke="#6b7d98" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.24)',
                      borderRadius: '1rem',
                    }}
                  />
                  <Legend />
                  {activeRole === 'rm' && (
                    <>
                      <Bar dataKey="l1Score" fill="#f59e0b" radius={[10, 10, 0, 0]} name="L1 Self-Score" />
                      <Bar dataKey="l2Score" fill="#1f5eff" radius={[10, 10, 0, 0]} name="L2 RM Verified Score" />
                    </>
                  )}
                  {activeRole === 'avp' && (
                    <>
                      <Bar dataKey="l2Score" fill="#1f5eff" radius={[10, 10, 0, 0]} name="L2 RM Verified Score" />
                      <Bar dataKey="l3Score" fill="#10b981" radius={[10, 10, 0, 0]} name="L3 AVP Score" />
                    </>
                  )}
                  {activeRole === 'bh' && (
                    <>
                      <Bar dataKey="l1Score" fill="#f59e0b" radius={[8, 8, 0, 0]} name="L1 Executive" />
                      <Bar dataKey="l2Score" fill="#1f5eff" radius={[8, 8, 0, 0]} name="L2 RM" />
                      <Bar dataKey="l3Score" fill="#10b981" radius={[8, 8, 0, 0]} name="L3 AVP" />
                      <Bar dataKey="l4Score" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="L4 BH (Final)" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-xl font-semibold text-foreground">State-wise Performance</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">State hierarchy scores</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-5">
                {currentRoleData.statePerformance.map((state) => (
                  <div key={state.state}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{state.state}</span>
                      <span className="text-muted-foreground font-semibold">{state.score}/10</span>
                    </div>
                    <Progress value={state.score * 10} className="mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-xl font-semibold text-foreground">Zone-wise Performance</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Operational zone scoreboards</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-5">
                {currentRoleData.zonePerformance.map((zone) => (
                  <div key={zone.zone}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{zone.zone}</span>
                      <span className="text-muted-foreground font-semibold">{zone.score}/10</span>
                    </div>
                    <Progress value={zone.score * 10} className="mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <MapPinned className="text-violet-600" size={18} />
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">Regional Performance Map</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Quarterly operating scores across active zones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[120px_repeat(4,minmax(0,1fr))] gap-3">
                <div />
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                  <div key={quarter} className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {quarter}
                  </div>
                ))}
                {currentRoleData.heatmap.map(([region, ...values]) => (
                  <React.Fragment key={region as string}>
                    <div className="flex items-center text-sm font-medium text-foreground">
                      {region}
                    </div>
                    {values.map((value, index) => (
                      <div
                        key={`${region}-${index}`}
                        className={`rounded-2xl p-5 text-center text-sm font-semibold text-white shadow-sm ${heatColor(value as number)}`}
                      >
                        {value}%
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">Workflow Stage Distribution</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Scorecard tracking across authorization levels</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={workflowDistribution}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {workflowDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.24)',
                      borderRadius: '1rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 w-full space-y-2">
                {workflowDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="text-foreground font-bold">{entry.value} reports</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">Top Performers</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Highest scoring employees in current view scope</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {currentRoleData.topPerformers.map((performer, index) => (
                <div key={performer.name} className="rounded-2xl border border-border bg-white/70 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{index + 1}. {performer.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{performer.region} · {performer.state}</p>
                  </div>
                  <Badge variant="outline" className="text-sm font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                    {performer.score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">Bottom Performers</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Lowest scoring employees in current view scope</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {currentRoleData.bottomPerformers.map((performer, index) => (
                <div key={performer.name} className="rounded-2xl border border-border bg-white/70 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{index + 1}. {performer.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{performer.region} · {performer.state}</p>
                  </div>
                  <Badge variant="outline" className="text-sm font-bold bg-rose-50 text-rose-700 border-rose-200">
                    {performer.score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

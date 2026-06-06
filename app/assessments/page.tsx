'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, Eye, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAssessmentContext } from '@/lib/context/assessment-context'
import { formatDate } from '@/lib/utils'

export default function AssessmentsPage() {
  const router = useRouter()
  const { assessments } = useAssessmentContext()
  const [currentUserRole, setCurrentUserRole] = useState<'employee' | 'rm' | 'avp' | 'bh'>('rm')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole) {
        setCurrentUserRole(savedRole)
      }
    }

    const handleRoleChange = (e: CustomEvent) => {
      setCurrentUserRole(e.detail)
    }

    window.addEventListener('simulated_role_change' as any, handleRoleChange)
    return () => {
      window.removeEventListener('simulated_role_change' as any, handleRoleChange)
    }
  }, [])

  const visibleAssessments = assessments.filter(
    (item) => currentUserRole !== 'employee' || item.employeeId === 'usr_006'
  )

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Assessments' }]} />

      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {currentUserRole === 'employee' ? 'My Assessment History' : 'Assessment Operations Grid'}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {currentUserRole === 'employee' ? 'My Assessments' : 'Assessment List'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {currentUserRole === 'employee'
                ? 'View your submitted scorecards, evidence status, and track approval progress.'
                : 'Review employee assessments, monitor scorecard completion, and route submissions through the enterprise approval workflow.'}
            </p>
          </div>
          {currentUserRole !== 'employee' && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="lg" className="inline-flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button size="lg" className="inline-flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <Plus size={16} />
                New Assessment
              </Button>
            </div>
          )}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Assessments', value: visibleAssessments.length, tone: 'text-foreground' },
          { label: 'Approved', value: visibleAssessments.filter((item) => item.status === 'approved').length, tone: 'text-emerald-600' },
          {
            label: 'Pending Review',
            value: visibleAssessments.filter((item) => ['submitted', 'pending_review', 'submitted_l2', 'submitted_l3', 'submitted_l4'].includes(item.status)).length,
            tone: 'text-amber-600',
          },
          { label: 'Draft', value: visibleAssessments.filter((item) => item.status === 'draft').length, tone: 'text-blue-600' },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5 bg-muted/20">
          <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_180px_180px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 text-muted-foreground" size={17} />
              <Input
                type="text"
                placeholder="Search by employee, code, region..."
                className="pl-10 h-10 w-full rounded-xl"
              />
            </div>
            <select className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary dark:bg-slate-900">
              <option>All Regions</option>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
            <select className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary dark:bg-slate-900">
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Pending Review</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1 h-10 rounded-xl inline-flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl">
                <SlidersHorizontal size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1350px] w-full text-sm">
            <TableHeader className="bg-muted/50">
              <TableRow>
                {[
                  'Assessment ID',
                  'Employee Name',
                  'Employee Code',
                  'Region',
                  'State',
                  'Zone',
                  'Month',
                  'Completion %',
                  'Status',
                  'Score',
                  'Actions',
                ].map((label) => (
                  <TableHead key={label} className="px-4 py-4 text-left font-semibold text-foreground">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAssessments.map((assessment) => (
                <TableRow
                  key={assessment.id}
                  onClick={() => router.push(`/assessments/${assessment.id}`)}
                  className="cursor-pointer bg-white/60 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="px-4 py-4 font-semibold text-foreground">{assessment.id}</TableCell>
                  <TableCell className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{assessment.employeeName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(assessment.updatedAt)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">{assessment.employeeCode}</TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">{assessment.region}</TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">{assessment.state}</TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">{assessment.zone}</TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {assessment.month} {assessment.year}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="min-w-28">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{assessment.compliancePercent}%</span>
                        <span>{assessment.completedActivities}/{assessment.totalActivities}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${assessment.compliancePercent}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusBadge status={assessment.status} />
                  </TableCell>
                  <TableCell className="px-4 py-4 font-semibold text-foreground">{assessment.performanceScore.toFixed(1)}</TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          router.push(`/assessments/${assessment.id}`)
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Showing 1-{visibleAssessments.length} of {visibleAssessments.length} assessments</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

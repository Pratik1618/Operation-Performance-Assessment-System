'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock3, FolderKanban, NotebookPen } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAssessmentContext } from '@/lib/context/assessment-context'
import { currentUser } from '@/lib/data/users'

export default function MyAssessmentsPage() {
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

  const portfolio = currentUserRole === 'employee'
    ? assessments.filter((assessment) => assessment.employeeId === 'usr_006')
    : assessments.filter((assessment) => assessment.region === currentUser.region)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: currentUserRole === 'employee' ? 'My Scorecards' : 'Regional Portfolio' }]} />

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {currentUserRole === 'employee' ? 'Employee Workspace' : 'Role Workspace'}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          {currentUserRole === 'employee' ? 'My Scorecards' : 'Regional Portfolio'}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {currentUserRole === 'employee'
            ? 'Your operations scorecards, evidence status, and submission tracking.'
            : 'A focused regional-manager portfolio for assessments owned, reviewed, or awaiting action in your operating region.'}
        </p>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {(currentUserRole === 'employee' ? [
          { label: 'My Scorecards', value: portfolio.length, icon: FolderKanban },
          { label: 'Pending Approval', value: portfolio.filter((item) => ['submitted_l2', 'submitted_l3', 'submitted_l4'].includes(item.status)).length, icon: Clock3 },
          { label: 'Drafts', value: portfolio.filter((item) => item.status === 'draft').length, icon: NotebookPen },
        ] : [
          { label: 'Regional Portfolio', value: portfolio.length, icon: FolderKanban },
          { label: 'Pending My Review', value: portfolio.filter((item) => item.status === 'submitted_l2').length, icon: Clock3 },
          { label: 'Drafts In Motion', value: portfolio.filter((item) => item.status === 'draft').length, icon: NotebookPen },
        ]).map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold text-foreground">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon size={18} />
                </div>
              </div>
            </Card>
          )
        })}
      </section>

      <Card className="p-6">
        <CardHeader className="p-0 mb-5">
          <CardTitle className="text-xl font-semibold text-foreground">Regional review portfolio</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Assessments linked to your workspace and escalation chain</CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          {portfolio.map((assessment) => (
            <Card key={assessment.id} className="p-5 bg-white/75 shadow-sm border border-border">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">{assessment.employeeName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {assessment.employeeCode} · {assessment.region} · {assessment.state} · {assessment.month} {assessment.year}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={assessment.status} />
                  <Link href={`/assessments/${assessment.id}`}>
                    <Button size="sm" className="flex items-center gap-2">
                      Open
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4 text-xs">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-[10px]">Completion</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{assessment.compliancePercent}%</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-[10px]">Score</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{assessment.performanceScore}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-[10px]">Evidence</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{assessment.evidencesSubmitted}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-[10px]">Activities</p>
                  <p className="mt-2 text-xl font-bold text-foreground">
                    {assessment.completedActivities}/{assessment.totalActivities}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

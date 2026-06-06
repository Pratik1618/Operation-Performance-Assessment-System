'use client'

import { AssessmentActivity } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  AlarmClockCheck,
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  Target,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface OperationsDashboardProps {
  activities: AssessmentActivity[]
}

function getCompletionRate(activities: AssessmentActivity[]) {
  if (activities.length === 0) return 0
  const completed = activities.filter((activity) =>
    ['achieved', 'approved'].includes(activity.status)
  ).length
  return Math.round((completed / activities.length) * 100)
}

export function OperationsDashboard({ activities }: OperationsDashboardProps) {
  const totalActivities = activities.length
  const completedActivities = activities.filter((activity) =>
    ['achieved', 'approved'].includes(activity.status)
  ).length
  const pendingActivities = activities.filter((activity) => activity.status === 'pending').length
  const overdueActivities = activities.filter(
    (activity) => !['achieved', 'approved'].includes(activity.status) && new Date(activity.dueDate) < new Date('2025-05-31')
  )

  const totalWeightage = activities.reduce((sum, activity) => sum + activity.weightage, 0)
  const compliantWeightage = activities
    .filter((activity) => ['achieved', 'approved'].includes(activity.status))
    .reduce((sum, activity) => sum + activity.weightage, 0)
  const compliancePercentage =
    totalWeightage > 0 ? Math.round((compliantWeightage / totalWeightage) * 100) : 0

  const weightedRatingTotal = activities.reduce(
    (sum, activity) => sum + activity.rating * activity.weightage,
    0
  )
  const monthlyScore =
    totalWeightage > 0 ? (weightedRatingTotal / totalWeightage).toFixed(1) : '0.0'

  const dailyActivities = activities.filter((activity) => activity.frequency === 'daily')
  const weeklyActivities = activities.filter((activity) => activity.frequency === 'weekly')
  const monthlyActivities = activities.filter((activity) => activity.frequency === 'monthly')

  const topMissedActivities = [...activities]
    .filter((activity) => ['pending', 'not_achieved', 'rejected', 'submitted'].includes(activity.status))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5']
  const heatmap = weeks.map((weekLabel, index) => {
    const weekStart = index * 7 + 1
    const weekEnd = weekStart + 6
    const weekActivities = activities.filter((activity) => {
      const day = new Date(activity.completedDate ?? activity.submissionDate ?? activity.dueDate).getUTCDate()
      return day >= weekStart && day <= weekEnd
    })
    const completed = weekActivities.filter((activity) =>
      ['achieved', 'approved'].includes(activity.status)
    ).length
    const ratio = weekActivities.length === 0 ? 0 : completed / weekActivities.length
    return {
      weekLabel,
      completed,
      total: weekActivities.length,
      intensity:
        ratio >= 0.9
          ? 'bg-emerald-500'
          : ratio >= 0.7
            ? 'bg-emerald-400'
            : ratio >= 0.5
              ? 'bg-amber-400'
              : ratio > 0
                ? 'bg-rose-300'
                : 'bg-muted',
    }
  })

  const summaryCards = [
    {
      label: 'Total Activities',
      value: totalActivities,
      hint: 'Monthly scorecard tasks',
      icon: ClipboardList,
    },
    {
      label: 'Completed Activities',
      value: completedActivities,
      hint: 'Achieved or approved',
      icon: ClipboardCheck,
    },
    {
      label: 'Pending Activities',
      value: pendingActivities,
      hint: 'Still awaiting action',
      icon: AlarmClockCheck,
    },
    {
      label: 'Overdue Activities',
      value: overdueActivities.length,
      hint: 'Past due date',
      icon: CircleAlert,
    },
    {
      label: 'Completion Percentage',
      value: `${compliancePercentage}%`,
      hint: 'Weighted operational completion',
      icon: Target,
    },
    {
      label: 'Monthly Score',
      value: monthlyScore,
      hint: 'Weighted score out of 5.0',
      icon: TrendingUp,
    },
  ]

  const trackerCards = [
    {
      title: 'Daily Activity Tracker',
      activities: dailyActivities,
      accent: 'from-sky-500/10 to-sky-500/5',
      border: 'border-sky-200',
    },
    {
      title: 'Weekly Activity Tracker',
      activities: weeklyActivities,
      accent: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-200',
    },
    {
      title: 'Monthly Activity Tracker',
      activities: monthlyActivities,
      accent: 'from-violet-500/10 to-violet-500/5',
      border: 'border-violet-200',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="flex flex-col justify-between h-full hover:border-primary/50 transition-colors bg-card shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary flex-shrink-0">
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-normal">{card.hint}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {trackerCards.map((tracker) => {
          const completed = tracker.activities.filter((activity) =>
            ['achieved', 'approved'].includes(activity.status)
          ).length
          const pending = tracker.activities.filter((activity) =>
            ['pending', 'submitted', 'partially_achieved', 'not_achieved', 'rejected'].includes(activity.status)
          ).length

          return (
            <div
              key={tracker.title}
              className={`rounded-2xl border ${tracker.border} bg-gradient-to-br ${tracker.accent} p-5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{tracker.title}</h3>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {tracker.activities.length} tasks
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-foreground">{getCompletionRate(tracker.activities)}%</p>
                <p className="pb-1 text-sm text-muted-foreground">completion rate</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-muted-foreground">Completed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{completed}</p>
                </div>
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-muted-foreground">Open / at risk</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{pending}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Activity Completion Heatmap</h3>
              <p className="text-sm text-muted-foreground">Week-by-week operational completion intensity</p>
            </div>
            <CalendarDays size={18} className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {heatmap.map((cell) => (
              <div key={cell.weekLabel} className="rounded-xl border border-border p-3 text-center">
                <div className={`mx-auto mb-3 h-16 rounded-lg ${cell.intensity}`} />
                <p className="text-xs font-medium text-foreground">{cell.weekLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cell.completed}/{cell.total || 0} complete
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">Overdue Activities</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tasks needing immediate operational closure</p>
          <div className="mt-4 space-y-3">
            {overdueActivities.length === 0 ? (
              <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                No overdue activities in this monthly cycle.
              </p>
            ) : (
              overdueActivities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="font-medium text-foreground">{activity.activityName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatDate(activity.dueDate)} • {activity.frequency}
                  </p>
                  <p className="mt-2 text-sm text-rose-700">{activity.remarks || 'Action plan required.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">Top Missed Activities</h3>
          <p className="mt-1 text-sm text-muted-foreground">Lowest-performing or blocked operational items</p>
          <div className="mt-4 space-y-3">
            {topMissedActivities.map((activity, index) => (
              <div key={activity.id} className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {index + 1}. {activity.activityName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {formatDate(activity.dueDate)} • Rating {activity.rating.toFixed(1)}
                    </p>
                  </div>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    {activity.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{activity.remarks || 'No remarks provided.'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

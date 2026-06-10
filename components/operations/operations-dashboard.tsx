'use client'

import { AssessmentActivity } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  AlarmClockCheck,
  CalendarDays,
  CheckCircle2,
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
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          const isCompliance = card.label.includes('Percentage')
          const isScore = card.label.includes('Score')
          
          let iconBg = 'bg-primary/10 text-primary'
          if (isCompliance) iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          else if (isScore) iconBg = 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          else if (card.label.includes('Overdue')) iconBg = 'bg-rose-50 text-rose-600 border border-rose-100'
          else if (card.label.includes('Pending')) iconBg = 'bg-amber-50 text-amber-600 border border-amber-100'
          else if (card.label.includes('Completed')) iconBg = 'bg-teal-50 text-teal-600 border border-teal-100'
          else iconBg = 'bg-blue-50 text-blue-600 border border-blue-100'

          return (
            <Card key={card.label} className="flex flex-col justify-between h-full hover:shadow-medium hover:border-slate-350 hover:-translate-y-0.5 transition-all duration-300 bg-white border border-slate-150 rounded-2xl shadow-soft">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{card.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center ${iconBg}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 text-[11px] font-medium text-slate-400 leading-normal">{card.hint}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trackers Row */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {trackerCards.map((tracker) => {
          const completed = tracker.activities.filter((activity) =>
            ['achieved', 'approved'].includes(activity.status)
          ).length
          const pending = tracker.activities.filter((activity) =>
            ['pending', 'submitted', 'partially_achieved', 'not_achieved', 'rejected'].includes(activity.status)
          ).length

          let trackingColor = 'border-sky-200 from-sky-500/10 to-sky-500/5 text-sky-800'
          if (tracker.title.includes('Weekly')) trackingColor = 'border-emerald-250 from-emerald-500/10 to-emerald-500/5 text-emerald-800'
          else if (tracker.title.includes('Monthly')) trackingColor = 'border-violet-250 from-violet-500/10 to-violet-500/5 text-violet-800'

          return (
            <div
              key={tracker.title}
              className={`rounded-3xl border bg-gradient-to-br p-5 shadow-soft ${trackingColor} flex flex-col justify-between`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{tracker.title}</h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 border border-slate-200/50 shadow-sm">
                    {tracker.activities.length} tasks
                  </span>
                </div>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-3xl font-extrabold text-slate-900 leading-none">{getCompletionRate(tracker.activities)}%</p>
                  <p className="pb-0.5 text-xs font-semibold text-slate-400">completion rate</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-sm">
                  <p className="font-semibold text-slate-400">Completed</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">{completed}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3.5 border border-slate-100 shadow-sm">
                  <p className="font-semibold text-slate-400">Open / At Risk</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">{pending}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Heatmap & Panels */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Activity Completion Heatmap</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Week-by-week operational completion intensity</p>
            </div>
            <CalendarDays size={18} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {heatmap.map((cell) => (
              <div key={cell.weekLabel} className="rounded-2xl border border-slate-100 bg-slate-50/20 p-3 text-center hover:bg-slate-50/50 transition-colors">
                <div className={`mx-auto mb-3 h-16 rounded-xl shadow-inner ${cell.intensity}`} />
                <p className="text-xs font-bold text-slate-800">{cell.weekLabel}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                  {cell.completed}/{cell.total || 0} complete
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800">Overdue Activities</h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Tasks needing immediate operational closure</p>
          <div className="mt-4 space-y-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-none">
            {overdueActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-400 italic">
                  No overdue activities in this cycle.
                </p>
              </div>
            ) : (
              overdueActivities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 shadow-sm">
                  <p className="font-bold text-slate-850 text-xs truncate">{activity.activityName}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">
                    Due {formatDate(activity.dueDate)} • <span className="uppercase">{activity.frequency}</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-rose-700 leading-relaxed">{activity.remarks || 'Action plan required.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800">Top Missed Activities</h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Lowest-performing or blocked operational items</p>
          <div className="mt-4 space-y-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-none">
            {topMissedActivities.map((activity, index) => (
              <div key={activity.id} className="rounded-2xl border border-slate-100 bg-slate-50/20 p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">
                      {index + 1}. {activity.activityName}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      Due {formatDate(activity.dueDate)} • Rating {activity.rating.toFixed(1)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200/60 px-2 py-0.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-wide flex-shrink-0">
                    {activity.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed truncate">{activity.remarks || 'No remarks provided.'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


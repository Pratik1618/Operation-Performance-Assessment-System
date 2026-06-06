'use client'

import { AssessmentActivity } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { StatusChip } from './status-chip'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ActivityTimelineProps {
  activities: AssessmentActivity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const completedActivities = [...activities]
    .filter((activity) => activity.completedDate || activity.submissionDate)
    .sort((a, b) => {
      const aDate = new Date(a.completedDate ?? a.submissionDate ?? a.dueDate).getTime()
      const bDate = new Date(b.completedDate ?? b.submissionDate ?? b.dueDate).getTime()
      return bDate - aDate
    })

  if (completedActivities.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>No operational activity updates have been logged for this month.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 shadow-sm">
      <CardHeader className="p-0 mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Timeline View
        </p>
        <CardTitle className="mt-2 text-xl font-bold text-foreground">
          Activity completion across the month
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          Every completed or submitted operational activity in chronological order.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {completedActivities.map((activity, index) => {
          const timelineDate = activity.completedDate ?? activity.submissionDate ?? activity.dueDate

          return (
            <div key={activity.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                {index < completedActivities.length - 1 && (
                  <div className="mt-2 h-full min-h-16 w-0.5 bg-border" />
                )}
              </div>

              <Card className="flex-1 bg-muted/20 p-4 border border-border shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{activity.activityName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(timelineDate, { day: 'numeric', month: 'short', year: 'numeric' })} •{' '}
                      {activity.frequency}
                    </p>
                  </div>
                  <StatusChip status={activity.status} size="sm" />
                </div>
                <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                  <div className="rounded-lg bg-background p-3 border shadow-sm">
                    <p className="text-muted-foreground font-medium">Weightage</p>
                    <p className="mt-1 font-bold text-foreground">{activity.weightage}%</p>
                  </div>
                  <div className="rounded-lg bg-background p-3 border shadow-sm">
                    <p className="text-muted-foreground font-medium">Evidence Count</p>
                    <p className="mt-1 font-bold text-foreground">{activity.evidenceCount}</p>
                  </div>
                  <div className="rounded-lg bg-background p-3 border shadow-sm">
                    <p className="text-muted-foreground font-medium">Rating</p>
                    <p className="mt-1 font-bold text-foreground">
                      {activity.rating > 0 ? activity.rating.toFixed(1) : 'Pending'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {activity.remarks || 'No operational remark recorded for this update.'}
                </p>
              </Card>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

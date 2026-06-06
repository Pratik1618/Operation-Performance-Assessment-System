'use client'

import { AssessmentActivity } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { StatusChip } from './status-chip'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface KanbanBoardProps {
  activities: AssessmentActivity[]
}

export function KanbanBoard({ activities }: KanbanBoardProps) {
  const columns = [
    {
      id: 'pending',
      title: 'Pending',
      description: 'Not started or missing submission',
      color: 'border-slate-200 bg-slate-50/50 dark:bg-slate-900/30',
      activities: activities.filter((activity) => activity.status === 'pending'),
    },
    {
      id: 'submitted',
      title: 'Submitted',
      description: 'Shared but not reviewed yet',
      color: 'border-sky-200 bg-sky-50/50 dark:bg-sky-950/20',
      activities: activities.filter((activity) => activity.status === 'submitted'),
    },
    {
      id: 'reviewed',
      title: 'Reviewed',
      description: 'Operationally evaluated',
      color: 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20',
      activities: activities.filter((activity) =>
        ['achieved', 'partially_achieved', 'not_achieved', 'rejected'].includes(activity.status)
      ),
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Closed and signed off',
      color: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20',
      activities: activities.filter((activity) => activity.status === 'approved'),
    },
  ]

  return (
    <Card className="p-6 shadow-sm">
      <CardHeader className="p-0 mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Kanban Board View
        </p>
        <CardTitle className="mt-2 text-xl font-bold text-foreground">
          Pending to approved operational flow
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          Track movement through Pending, Submitted, Reviewed, and Approved.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-2xl border p-4 ${column.color}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm text-foreground">{column.title}</h4>
                <p className="mt-1 text-2xs text-muted-foreground leading-normal">{column.description}</p>
              </div>
              <span className="rounded-full bg-background border px-2 py-0.5 text-xs font-bold text-foreground shadow-sm">
                {column.activities.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.activities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/80 p-4 text-xs text-muted-foreground text-center">
                  No activities in this stage.
                </div>
              ) : (
                column.activities.map((activity) => (
                  <Card key={activity.id} className="p-4 bg-background shadow-sm border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-xs text-foreground leading-snug">{activity.activityName}</p>
                        <p className="mt-1 text-2xs text-muted-foreground">
                          Due {formatDate(activity.dueDate)} • {activity.frequency}
                        </p>
                      </div>
                      <StatusChip status={activity.status} size="sm" />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-2xs">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">Weightage</p>
                        <p className="mt-0.5 font-semibold text-foreground">{activity.weightage}%</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-muted-foreground">Evidence</p>
                        <p className="mt-0.5 font-semibold text-foreground">{activity.evidenceCount}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                      {activity.remarks || 'No remarks recorded for this activity.'}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

'use client'

import { AssessmentActivity, ActivityStatus } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { StatusChip } from './status-chip'
import { useDeferredValue, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface OperationsActivityTableProps {
  activities: AssessmentActivity[]
  onRatingChange?: (activityId: string, roleField: 'l1Rating' | 'l2Rating' | 'l3Rating' | 'l4Rating', value: number) => void
  activeReviewerRole?: 'employee' | 'rm' | 'avp' | 'bh'
  isEditable?: boolean
}

type ActivitySortOption = 'name' | 'dueDate' | 'status' | 'weightage' | 'l1Rating' | 'l2Rating' | 'l3Rating' | 'l4Rating'

function frequencyLabel(frequency: AssessmentActivity['frequency']) {
  return frequency.charAt(0).toUpperCase() + frequency.slice(1)
}

export function OperationsActivityTable({
  activities,
  onRatingChange,
  activeReviewerRole,
  isEditable = false,
}: OperationsActivityTableProps) {
  const [sortBy, setSortBy] = useState<ActivitySortOption>('dueDate')
  const [filterStatus, setFilterStatus] = useState<'all' | ActivityStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const filteredActivities = activities
    .filter((activity) => {
      if (filterStatus !== 'all' && activity.status !== filterStatus) {
        return false
      }

      if (!deferredSearchTerm.trim()) {
        return true
      }

      const query = deferredSearchTerm.toLowerCase()
      return (
        activity.activityName.toLowerCase().includes(query) ||
        activity.frequency.toLowerCase().includes(query) ||
        (activity.remarks || '').toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }
      if (sortBy === 'weightage') {
        return b.weightage - a.weightage
      }
      if (sortBy === 'l1Rating') {
        return (b.l1Rating ?? 0) - (a.l1Rating ?? 0)
      }
      if (sortBy === 'l2Rating') {
        return (b.l2Rating ?? 0) - (a.l2Rating ?? 0)
      }
      if (sortBy === 'l3Rating') {
        return (b.l3Rating ?? 0) - (a.l3Rating ?? 0)
      }
      if (sortBy === 'l4Rating') {
        return (b.l4Rating ?? 0) - (a.l4Rating ?? 0)
      }
      return a.activityName.localeCompare(b.activityName)
    })

  const renderRatingCell = (
    activity: AssessmentActivity,
    role: 'employee' | 'rm' | 'avp' | 'bh',
    field: 'l1Rating' | 'l2Rating' | 'l3Rating' | 'l4Rating'
  ) => {
    const val = activity[field]
    const isCurrentFieldEditable = isEditable && activeReviewerRole === role

    if (isCurrentFieldEditable && onRatingChange) {
      return (
        <TableCell className="px-4 py-4 text-center">
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="w-16 rounded-lg border border-input bg-white px-2 py-1 text-center text-sm font-semibold shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={val !== undefined ? val : ''}
            onChange={(e) => {
              const numVal = parseFloat(e.target.value)
              if (!isNaN(numVal) && numVal >= 0 && numVal <= 5) {
                onRatingChange(activity.id, field, numVal)
              } else if (e.target.value === '') {
                onRatingChange(activity.id, field, 0)
              }
            }}
          />
        </TableCell>
      )
    }

    return (
      <TableCell className="px-4 py-4 text-center font-semibold text-foreground">
        {val !== undefined && val > 0 ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            {val.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border p-5 bg-muted/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Operations Activities
            </p>
            <CardTitle className="mt-2 text-xl font-bold text-foreground">
              Monthly Scorecard Task Register
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              The operational scorecard tracks daily, weekly, and monthly activities. Double-click or change values to score.
            </CardDescription>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search activity or remarks"
                className="pl-10 h-10 w-full rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ActivitySortOption)}
                className="h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary dark:bg-slate-900"
              >
                <option value="dueDate">Due date</option>
                <option value="name">Activity name</option>
                <option value="status">Status</option>
                <option value="weightage">Weightage</option>
                <option value="l1Rating">L1 Rating</option>
                <option value="l2Rating">L2 Rating</option>
                <option value="l3Rating">L3 Rating</option>
                <option value="l4Rating">L4 Rating</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status filter</span>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as 'all' | ActivityStatus)}
                className="h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary dark:bg-slate-900"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="achieved">Achieved</option>
                <option value="partially_achieved">Partially Achieved</option>
                <option value="not_achieved">Not Achieved</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal size={14} />
          <span>{filteredActivities.length} activities shown</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table className="min-w-[1360px] w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Activity Name</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Frequency</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">Weightage</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Due Date</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">Evidence</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">L1 Rating</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">L2 Rating (RM)</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">L3 Rating (AVP)</TableHead>
              <TableHead className="px-4 py-3 text-center font-semibold text-foreground">L4 Rating (BH)</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow key={activity.id} className="align-middle hover:bg-muted/30 transition-colors bg-white/60">
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{activity.activityName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activity.activityId}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-muted-foreground">{frequencyLabel(activity.frequency)}</TableCell>
                <TableCell className="px-4 py-4 text-center font-semibold text-foreground">{activity.weightage}%</TableCell>
                <TableCell className="px-4 py-4 text-muted-foreground">{formatDate(activity.dueDate)}</TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-semibold text-blue-600 border border-blue-100">
                    {activity.evidenceCount}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <StatusChip status={activity.status} size="sm" />
                </TableCell>
                {renderRatingCell(activity, 'employee', 'l1Rating')}
                {renderRatingCell(activity, 'rm', 'l2Rating')}
                {renderRatingCell(activity, 'avp', 'l3Rating')}
                {renderRatingCell(activity, 'bh', 'l4Rating')}
                <TableCell className="px-4 py-4 text-muted-foreground max-w-xs truncate">
                  {activity.remarks || 'No remarks captured for this activity yet.'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

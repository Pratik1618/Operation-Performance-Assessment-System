'use client'

import { AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/utils'

const notifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Assessment Pending Review',
    message: "Anjali Desai's assessment for May 2025 is awaiting your review",
    date: new Date('2025-05-15'),
    read: false,
  },
  {
    id: 2,
    type: 'success',
    title: 'Assessment Approved',
    message: "Neha Verma's May 2025 assessment has been approved",
    date: new Date('2025-05-15'),
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Monthly Report Generated',
    message: 'Your monthly assessment report for May 2025 is ready',
    date: new Date('2025-05-10'),
    read: true,
  },
  {
    id: 4,
    type: 'warning',
    title: 'Evidence Upload Required',
    message: 'Please upload evidence for Operations Audit activity',
    date: new Date('2025-05-08'),
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Activity Archived',
    message: 'Quarterly Risk Assessment activity has been archived',
    date: new Date('2025-05-05'),
    read: true,
  },
]

export default function NotificationsPage() {
  const unreadCount = notifications.filter((item) => !item.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-emerald-600" size={20} />
      case 'warning':
        return <AlertCircle className="text-amber-600" size={20} />
      default:
        return <Info className="text-blue-600" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Notifications' }]} />

      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Notification Center</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              System alerts, review requests, approval updates, and operational reminders in one enterprise inbox.
            </p>
          </div>
          <Button variant="outline">
            Mark all as read
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Unread Notifications', value: unreadCount, tone: 'text-blue-600' },
          { label: 'Approval Alerts', value: 2, tone: 'text-amber-600' },
          { label: 'System Updates', value: 3, tone: 'text-emerald-600' },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-5 flex items-start gap-4 transition-colors ${
              !notification.read ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900 dark:bg-blue-950/20' : 'bg-white/70'
            }`}
          >
            <div className="rounded-2xl bg-white p-3 shadow-sm border dark:bg-slate-900">{getIcon(notification.type)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{notification.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(notification.date)} at {formatTime(notification.date)}
                  </p>
                </div>
                {!notification.read && (
                  <Badge className="bg-primary hover:bg-primary/80">Unread</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <Trash2 size={16} />
            </Button>
          </Card>
        ))}
      </section>
    </div>
  )
}

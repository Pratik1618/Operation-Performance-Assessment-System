'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, CheckCircle, Info, Trash2, Calendar, ShieldAlert, Sparkles, UserCheck, MessageSquare, ClipboardCheck, X } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface OCRMSNotification {
  id: string
  type: 'compliance' | 'incident' | 'resources' | 'feedback' | 'system'
  severity: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  date: string
  time: string
  read: boolean
}

const initialNotifications: OCRMSNotification[] = [
  {
    id: 'NOT_1',
    type: 'incident',
    severity: 'error',
    title: 'Critical Safety Incident Escalated',
    message: 'Electrical short circuit reported in server room at DLF Cyber Hub Delhi. SLA investigation active.',
    date: '2025-06-05',
    time: '11:30 AM',
    read: false,
  },
  {
    id: 'NOT_2',
    type: 'feedback',
    severity: 'warning',
    title: 'CSAT Score Drop Alert',
    message: 'Client satisfaction score has dropped to 58% (Poor) at DLF Cyber Hub Delhi. Escalation sent to AVP.',
    date: '2025-06-05',
    time: '09:15 AM',
    read: false,
  },
  {
    id: 'NOT_3',
    type: 'resources',
    severity: 'success',
    title: 'Reliever Guard Deployed',
    message: 'Ramesh Yadav marked absent covered by reliever Sunil Verma at Infosys Gurgaon Tower A.',
    date: '2025-06-05',
    time: '08:00 AM',
    read: false,
  },
  {
    id: 'NOT_4',
    type: 'compliance',
    severity: 'warning',
    title: 'Task Outside SLA Limit',
    message: 'Daily Closure Report is overdue for site Wipro Sarjapur Road. SLA timer triggered.',
    date: '2025-06-04',
    time: '18:00 PM',
    read: true,
  },
  {
    id: 'NOT_5',
    type: 'system',
    severity: 'info',
    title: 'Monthly R&R Celebrations Configured',
    message: 'Rewards & Recognition schedule for June 2025 has been initialized for all 12 zones.',
    date: '2025-06-01',
    time: '09:00 AM',
    read: true,
  },
  {
    id: 'NOT_6',
    type: 'resources',
    severity: 'error',
    title: 'Procurement Request Delayed',
    message: 'PR-2025-0093 for Hand Sanitizer (5L Bottles) at HDFC Tower Chennai is outside delivery SLA TAT.',
    date: '2025-05-28',
    time: '14:30 PM',
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<OCRMSNotification[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'compliance' | 'incident' | 'resources'>('all')

  // Count unreads and types
  const metrics = useMemo(() => {
    return {
      unread: notifications.filter(n => !n.read).length,
      compliance: notifications.filter(n => n.type === 'compliance').length,
      incident: notifications.filter(n => n.type === 'incident').length,
      resources: notifications.filter(n => n.type === 'resources').length,
    }
  }, [notifications])

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === 'unread') return !n.read
      if (activeTab === 'all') return true
      return n.type === activeTab
    })
  }, [notifications, activeTab])

  // Action: Mark single read
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  // Action: Delete notification
  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Action: Mark all read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: OCRMSNotification['type'], severity: OCRMSNotification['severity']) => {
    const iconColors = {
      info: 'text-blue-600 bg-blue-50 border-blue-100',
      success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      warning: 'text-amber-600 bg-amber-50 border-amber-100',
      error: 'text-rose-600 bg-rose-50 border-rose-100'
    }

    switch (type) {
      case 'compliance':
        return { Icon: ClipboardCheck, style: iconColors[severity] }
      case 'incident':
        return { Icon: ShieldAlert, style: iconColors[severity] }
      case 'resources':
        return { Icon: UserCheck, style: iconColors[severity] }
      case 'feedback':
        return { Icon: MessageSquare, style: iconColors[severity] }
      default:
        return { Icon: Sparkles, style: iconColors[severity] }
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Notifications Center' }]} />

      {/* Header Panel */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Operational Inbox</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Notification Hub</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Review critical system notifications, safety incident alerts, csat warnings, reliever logs, and operational alerts.
            </p>
          </div>
          <Button onClick={handleMarkAllRead} variant="outline" className="h-9 text-xs rounded-xl border-slate-200">
            Mark all as read
          </Button>
        </div>
      </Card>

      {/* KPI Counters Strip */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 shadow-soft border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unread Alerts</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{metrics.unread}</p>
        </Card>
        <Card className="p-4 shadow-soft border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Logs</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{metrics.compliance}</p>
        </Card>
        <Card className="p-4 shadow-soft border-l-4 border-l-rose-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incidents / Safety</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{metrics.incident}</p>
        </Card>
        <Card className="p-4 shadow-soft border-l-4 border-l-purple-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics & Resources</p>
          <p className="mt-2 text-2xl font-bold text-purple-700">{metrics.resources}</p>
        </Card>
      </section>

      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          All Inbox
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'unread' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Unread Alerts ({metrics.unread})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'compliance' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Compliance
        </button>
        <button
          onClick={() => setActiveTab('incident')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'incident' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Safety Alerts
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'resources' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Resources
        </button>
      </div>

      {/* Notifications List */}
      <section className="space-y-3.5">
        {filteredNotifications.map((notification) => {
          const { Icon, style } = getIcon(notification.type, notification.severity)
          return (
            <Card
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`p-5 shadow-soft border flex items-start gap-4.5 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer ${
                !notification.read ? 'border-blue-250 bg-blue-50/20' : 'bg-white/80'
              }`}
            >
              <div className={`rounded-xl p-3 border shrink-0 ${style}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="font-bold text-sm text-slate-800">{notification.title}</p>
                      {!notification.read && (
                        <span className="bg-blue-600 text-white rounded-full h-2 w-2 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{notification.message}</p>
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-2">
                      <Calendar size={12} className="text-slate-300" />
                      {notification.date} @ {notification.time}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="p-2 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 hover:border-rose-100 shrink-0 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
        {filteredNotifications.length === 0 && (
          <div className="py-16 text-center text-xs text-muted-foreground Card">
            Your notification inbox is clean.
          </div>
        )}
      </section>
    </div>
  )
}

'use client'

import React, { useMemo } from 'react'
import { AlertCircle, ArrowRight, ShieldAlert, BadgeAlert, Users, Phone, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { attendanceRecords } from '@/lib/data/ocrms-data'

export default function TodayAlertsPage() {
  const alerts = useMemo(() => {
    // Generate alerts dynamically from attendance mock data
    const list: Array<{
      id: string
      site: string
      client: string
      employeeName: string
      employeeCode: string
      shift: string
      type: string
      severity: 'critical' | 'high' | 'medium'
      message: string
      status: string
    }> = []

    attendanceRecords.forEach((record) => {
      if (record.issueType === 'absent') {
        if (record.replacementRequired && !record.relieverAssigned) {
          list.push({
            id: record.id,
            site: record.site,
            client: record.client || 'N/A',
            employeeName: record.employeeName,
            employeeCode: record.employeeCode,
            shift: record.shift || 'First',
            type: 'Uncovered Absenteeism',
            severity: 'critical',
            message: `${record.employeeName} is absent from ${record.shift} Shift and replacement is required but not assigned.`,
            status: record.status
          })
        } else if (record.status.toLowerCase().includes('escalated')) {
          list.push({
            id: record.id,
            site: record.site,
            client: record.client || 'N/A',
            employeeName: record.employeeName,
            employeeCode: record.employeeCode,
            shift: record.shift || 'First',
            type: 'Escalated Leave Case',
            severity: 'high',
            message: `Absence case for ${record.employeeName} has been escalated to management.`,
            status: record.status
          })
        }
      } else if (record.issueType.startsWith('missing_') && record.status === 'Open') {
        list.push({
          id: record.id,
          site: record.site,
          client: record.client || 'N/A',
          employeeName: record.employeeName,
          employeeCode: record.employeeCode,
          shift: record.shift || 'First',
          type: 'Missing Clock-in/out',
          severity: 'medium',
          message: `${record.employeeName} has a missing punch on ${record.date}.`,
          status: record.status
        })
      } else if (record.issueType === 'regularization' && record.status === 'Open') {
        list.push({
          id: record.id,
          site: record.site,
          client: record.client || 'N/A',
          employeeName: record.employeeName,
          employeeCode: record.employeeCode,
          shift: record.shift || 'First',
          type: 'Regularization Request',
          severity: 'medium',
          message: `Pending regularization request from ${record.employeeName} (${record.reason || 'N/A'}).`,
          status: record.status
        })
      }
    })

    return list
  }, [])

  const stats = useMemo(() => {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length
    const highCount = alerts.filter(a => a.severity === 'high').length
    const mediumCount = alerts.filter(a => a.severity === 'medium').length
    return { criticalCount, highCount, mediumCount, total: alerts.length }
  }, [alerts])

  return (
    <div className="space-y-6">
      {/* Alert Header Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border bg-rose-500/5 dark:bg-rose-500/10 border-rose-200 dark:border-rose-950">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-500">Critical Warnings</p>
              <h3 className="text-2xl font-extrabold mt-1 text-rose-700 dark:text-rose-400">{stats.criticalCount}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Sites without coverage</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50">
              <ShieldAlert className="text-rose-600 dark:text-rose-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-amber-500/5 dark:bg-amber-500/10 border-amber-200 dark:border-amber-950">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-500">High Priority</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-700 dark:text-amber-400">{stats.highCount}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Escalated issues</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50">
              <BadgeAlert className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-blue-500/5 dark:bg-blue-500/10 border-blue-200 dark:border-blue-950">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-500">Exceptions Pending</p>
              <h3 className="text-2xl font-extrabold mt-1 text-blue-700 dark:text-blue-400">{stats.mediumCount}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Punches & Regularizations</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <AlertCircle className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Action Alerts</p>
              <h3 className="text-2xl font-extrabold mt-1">{stats.total}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Requiring execution response</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Zap className="text-slate-600 dark:text-slate-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Alerts List */}
      <Card className="shadow-soft border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-sm font-bold text-foreground">Real-Time Operational Alerts</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Live list of attendance issues requiring immediate response or supervisor assignment.</p>
        </div>
        <div className="divide-y">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No alerts active today. All shifts fully covered.</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="mt-1">
                    {alert.severity === 'critical' ? (
                      <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping mt-1.5" />
                    ) : alert.severity === 'high' ? (
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                          : alert.severity === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                        {alert.site} ({alert.client})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span>Employee: <strong className="text-slate-600 dark:text-slate-300">{alert.employeeName} ({alert.employeeCode})</strong></span>
                      <span>•</span>
                      <span>Shift: <strong className="text-slate-600 dark:text-slate-300">{alert.shift}</strong></span>
                      <span>•</span>
                      <span>Status: <strong className="text-rose-600 dark:text-rose-400">{alert.status}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-2 hover:scale-[1.02] active:scale-95 transition-all">
                    Resolve Case <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

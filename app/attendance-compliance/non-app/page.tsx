'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, ShieldCheck, Mail, Send, Award, Users } from 'lucide-react'
import { attendanceRecords } from '@/lib/data/ocrms-data'
import { AttendanceRecord } from '@/lib/types'

export default function NonAppUserTrackingPage() {
  const [users, setUsers] = useState<AttendanceRecord[]>(() =>
    attendanceRecords.filter(r => r.issueType === 'non_app')
  )

  const stats = useMemo(() => {
    const totalNonApp = users.filter(u => u.status === 'Open').length
    const registeredDevices = users.filter(u => u.registrationStatus === 'Registered Device').length
    const pendingRegistrations = users.filter(u => u.registrationStatus === 'Pending Registration').length
    const adoptionPct = Math.round((registeredDevices / (users.length || 1)) * 100)

    return { totalNonApp, registeredDevices, pendingRegistrations, adoptionPct }
  }, [users])

  const handleAction = (id: string, actionName: string) => {
    alert(`Success: ${actionName} triggered for candidate.`)
    if (actionName === 'Register Device' || actionName === 'Mark Trained') {
      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          return {
            ...u,
            registrationStatus: 'Registered Device',
            appStatus: 'Installed',
            status: 'Regularized'
          }
        }
        return u
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* App Adoption KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-500">Unregistered Users</p>
              <h3 className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">{stats.totalNonApp}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Using manual registers</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50">
              <Users className="text-rose-600 dark:text-rose-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-500">Registered Devices</p>
              <h3 className="text-2xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">{stats.registeredDevices}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Secure biometric profile</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <Smartphone className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-500">Pending Registrations</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">{stats.pendingRegistrations}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Awaiting verification</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50">
              <ShieldCheck className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-500">App Adoption Rate</p>
              <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{stats.adoptionPct}%</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Compliance Target: 95%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
              <Award className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Non-App Users List */}
      <Card className="shadow-soft border bg-card overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-bold text-foreground">Non-App Attendance Auditing</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="p-4">Employee</th>
                <th className="p-4">Site / Client</th>
                <th className="p-4">Device Model</th>
                <th className="p-4">App Installation</th>
                <th className="p-4">Manual Log Count (Month)</th>
                <th className="p-4">Registration Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {user.employeeName}
                    <div className="text-[10px] font-normal text-muted-foreground mt-0.5">{user.employeeCode} · {user.shift} Shift</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{user.site}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{user.client}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {user.deviceType || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      user.appStatus === 'Installed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {user.appStatus || 'Not Installed'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 text-center md:text-left">
                    {user.manualEntriesCount || 0} times
                  </td>
                  <td className="p-4 font-semibold">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      user.registrationStatus === 'Registered Device'
                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {user.registrationStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      {user.registrationStatus === 'Pending Registration' && (
                        <>
                          <button
                            onClick={() => handleAction(user.id, 'Register Device')}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-2.5 py-1.5 font-bold transition-all text-[11px]"
                          >
                            Register Device
                          </button>
                          <button
                            onClick={() => handleAction(user.id, 'Send SMS Invite')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <Mail size={12} /> SMS Invite
                          </button>
                          <button
                            onClick={() => handleAction(user.id, 'Send WhatsApp Invite')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <Send size={12} /> WhatsApp
                          </button>
                        </>
                      )}
                      {user.registrationStatus === 'Registered Device' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

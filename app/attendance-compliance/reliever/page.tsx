'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, Clock, MapPin, Phone, RefreshCw, Navigation, CheckCircle2, UserX } from 'lucide-react'
import { attendanceRecords } from '@/lib/data/ocrms-data'

interface RelieverDeployment {
  id: string
  absentEmployee: string
  relieverName: string
  site: string
  shift: string
  contact: string
  time: string
  status: 'Assigned' | 'En Route' | 'Present' | 'Completed'
}

export default function RelieverManagementPage() {
  const [deployments, setDeployments] = useState<RelieverDeployment[]>([
    {
      id: 'DEP_001',
      absentEmployee: 'Ramesh Yadav',
      relieverName: 'Sunil Verma',
      site: 'Infosys Gurgaon Tower A',
      shift: 'First',
      contact: '+91 98765 43210',
      time: '08:15 AM',
      status: 'Present'
    },
    {
      id: 'DEP_002',
      absentEmployee: 'Lakshmi Nair',
      relieverName: 'Gopal Raj',
      site: 'HDFC Tower Chennai',
      shift: 'First',
      contact: '+91 98765 00112',
      time: '09:00 AM',
      status: 'Completed'
    },
    {
      id: 'DEP_003',
      absentEmployee: 'Priya Sharma',
      relieverName: 'Vikram Singh',
      site: 'Infosys Bangalore EC',
      shift: 'Second',
      contact: '+91 88990 77665',
      time: '01:30 PM',
      status: 'En Route'
    },
    {
      id: 'DEP_004',
      absentEmployee: 'Suresh Babu',
      relieverName: 'Amit Sharma',
      site: 'Wipro Hinjewadi Campus',
      shift: 'Third',
      contact: '+91 77665 44321',
      time: '09:45 PM',
      status: 'Assigned'
    }
  ])

  // KPIs
  const kpis = useMemo(() => {
    const totalAbsentees = attendanceRecords.filter(r => r.issueType === 'absent').length
    const relieversAssigned = deployments.length
    const relieversPending = Math.max(0, totalAbsentees - relieversAssigned)
    const coveragePct = totalAbsentees > 0 ? Math.round((relieversAssigned / totalAbsentees) * 100) : 100

    return { totalAbsentees, relieversAssigned, relieversPending, coveragePct }
  }, [deployments])

  const handleUpdateStatus = (id: string, newStatus: 'Assigned' | 'En Route' | 'Present' | 'Completed') => {
    setDeployments(prev => prev.map(dep => {
      if (dep.id === id) {
        return { ...dep, status: newStatus }
      }
      return dep
    }))
  }

  const handleContact = (name: string, phone: string) => {
    alert(`Calling ${name} at ${phone}...`)
  }

  return (
    <div className="space-y-6">
      {/* Reliever KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Absentees</p>
              <h3 className="text-2xl font-extrabold mt-1">{kpis.totalAbsentees}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Manpower gaps identified</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <UserX className="text-slate-600 dark:text-slate-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-500">Relievers Assigned</p>
              <h3 className="text-2xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">{kpis.relieversAssigned}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Replacements deployed</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-500">Relievers Pending</p>
              <h3 className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">{kpis.relieversPending}</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Uncovered open shifts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50">
              <Clock className="text-rose-600 dark:text-rose-400" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-500">Reliever Coverage</p>
              <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{kpis.coveragePct}%</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Operations continuity score</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reliever Deployment Cards Grid */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">Active Reliever Deployments</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {deployments.map((dep) => (
            <Card key={dep.id} className="shadow-soft border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{dep.relieverName}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Deployed to cover <strong>{dep.absentEmployee}</strong></p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    dep.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : dep.status === 'Present'
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                      : dep.status === 'En Route'
                      ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    {dep.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="truncate">{dep.site}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Clock size={14} className="text-muted-foreground" />
                    <span>{dep.shift} Shift ({dep.time})</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t pt-3.5">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={dep.status}
                      onChange={(e) => handleUpdateStatus(dep.id, e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-900 border text-[11px] rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-foreground"
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="En Route">En Route</option>
                      <option value="Present">Present</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleContact(dep.relieverName, dep.contact)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
                      title="Contact Reliever"
                    >
                      <Phone size={14} />
                    </button>
                    <button
                      onClick={() => alert(`Initiating reassign for ${dep.absentEmployee}...`)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-xl hover:scale-105 active:scale-95 transition-all"
                      title="Reassign Reliever"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

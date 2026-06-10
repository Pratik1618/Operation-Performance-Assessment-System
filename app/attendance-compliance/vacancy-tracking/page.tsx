'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserX, PlusCircle, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

interface VacancyRecord {
  id: string
  exitedEmployee: string
  designation: string
  site: string
  client: string
  raisedDate: string
  expectedJoiningDate: string
  recruitmentRequested: boolean
  status: 'Open' | 'Interviewing' | 'Offer Released' | 'Joining Expected' | 'Filled'
}

export default function VacancyTrackingPage() {
  const [vacancies, setVacancies] = useState<VacancyRecord[]>([
    {
      id: 'VAC_001',
      exitedEmployee: 'Ketan Patel',
      designation: 'Housekeeping Supervisor',
      site: 'Jio Centre Mumbai',
      client: 'Reliance Jio',
      raisedDate: '2026-06-07',
      expectedJoiningDate: '2026-06-25',
      recruitmentRequested: true,
      status: 'Interviewing'
    },
    {
      id: 'VAC_002',
      exitedEmployee: 'Sohan Singh',
      designation: 'Security Guard',
      site: 'Jio Centre Mumbai',
      client: 'Reliance Jio',
      raisedDate: '2026-06-09',
      expectedJoiningDate: '2026-07-01',
      recruitmentRequested: true,
      status: 'Open'
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [exitedEmployee, setExitedEmployee] = useState('')
  const [designation, setDesignation] = useState('')
  const [site, setSite] = useState('')
  const [client, setClient] = useState('')
  const [expectedJoiningDate, setExpectedJoiningDate] = useState('2026-06-30')

  const handleUpdateStatus = (id: string, newStatus: 'Open' | 'Interviewing' | 'Offer Released' | 'Joining Expected' | 'Filled') => {
    setVacancies(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: newStatus }
      }
      return v
    }))
  }

  const handleRaiseVacancy = () => {
    if (!exitedEmployee || !designation) return

    const newVacancy: VacancyRecord = {
      id: `VAC_00${vacancies.length + 1}`,
      exitedEmployee,
      designation,
      site,
      client,
      raisedDate: '2026-06-09',
      expectedJoiningDate,
      recruitmentRequested: true,
      status: 'Open'
    }

    setVacancies(prev => [newVacancy, ...prev])
    setIsAdding(false)
    setExitedEmployee('')
    setDesignation('')
    setSite('')
    setClient('')
  }

  return (
    <div className="space-y-6">
      {/* Action panel */}
      <div className="flex justify-between items-center bg-card border rounded-2xl p-4 shadow-soft">
        <div>
          <h3 className="text-sm font-bold text-foreground">Vacancy Tracking Board</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Audit empty profiles arising from exits and track recruitment pipelines.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-bold transition-all text-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
        >
          <PlusCircle size={14} /> Raise Vacancy
        </button>
      </div>

      {/* Add Vacancy Form */}
      {isAdding && (
        <Card className="shadow-soft border bg-card animate-in slide-in-from-top duration-300">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Raise New Vacancy Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-5 text-xs items-end">
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Exited Employee Name:</label>
              <input
                type="text"
                placeholder="Exited Name"
                value={exitedEmployee}
                onChange={(e) => setExitedEmployee(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Designation Profile:</label>
              <input
                type="text"
                placeholder="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Site & Client:</label>
              <input
                type="text"
                placeholder="Site name"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Expected Joining Date:</label>
              <input
                type="date"
                value={expectedJoiningDate}
                onChange={(e) => setExpectedJoiningDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseVacancy}
                disabled={!exitedEmployee || !designation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-xs"
              >
                Raise Profile
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vacancies log table */}
      <Card className="shadow-soft border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="p-4">Exited Employee</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Site / Client</th>
                <th className="p-4">Raised Date</th>
                <th className="p-4">Expected Joining</th>
                <th className="p-4">Recruitment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vacancies.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <UserX size={16} className="text-slate-500" />
                      {v.exitedEmployee}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-foreground">{v.designation}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-850 dark:text-slate-350">{v.site}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{v.client}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{v.raisedDate}</td>
                  <td className="p-4 font-medium text-blue-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {v.expectedJoiningDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      v.status === 'Filled'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : v.status === 'Open'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={v.status}
                      onChange={(e) => handleUpdateStatus(v.id, e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-900 border text-[10px] rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-foreground cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer Released">Offer Released</option>
                      <option value="Joining Expected">Joining Expected</option>
                      <option value="Filled">Filled</option>
                    </select>
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

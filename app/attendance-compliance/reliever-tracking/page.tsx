'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, Clock, MapPin, PlusCircle, CheckCircle2, UserX } from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'

interface RelieverAssignment {
  id: string
  absentEmployee: string
  absentEmployeeCode: string
  relieverName: string
  relieverCode: string
  site: string
  shift: string
  deploymentDate: string
  status: 'Assigned' | 'Present' | 'Completed'
}

export default function RelieverTrackingPage() {
  const [deployments, setDeployments] = useState<RelieverAssignment[]>([
    {
      id: 'RLV_001',
      absentEmployee: 'Ramesh Yadav',
      absentEmployeeCode: 'EMP1001',
      relieverName: 'Sunil Verma',
      relieverCode: 'EMP9002',
      site: 'Infosys Gurgaon Tower A',
      shift: 'First',
      deploymentDate: '2026-06-09',
      status: 'Present'
    },
    {
      id: 'RLV_002',
      absentEmployee: 'Suresh Babu',
      absentEmployeeCode: 'EMP2003',
      relieverName: 'Amit Sharma',
      relieverCode: 'EMP9014',
      site: 'Wipro Hinjewadi Campus',
      shift: 'Third',
      deploymentDate: '2026-06-09',
      status: 'Assigned'
    },
    {
      id: 'RLV_003',
      absentEmployee: 'Lakshmi Nair',
      absentEmployeeCode: 'EMP2010',
      relieverName: 'Gopal Raj',
      relieverCode: 'EMP9008',
      site: 'HDFC Tower Chennai',
      shift: 'First',
      deploymentDate: '2026-06-08',
      status: 'Completed'
    }
  ])

  // Dialog / Assign form states
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [relieverName, setRelieverName] = useState('')
  const [relieverCode, setRelieverCode] = useState('')
  const [deploymentDate, setDeploymentDate] = useState('2026-06-09')

  // Cases that need relievers (no reliever assigned yet in this local list)
  const availableAbsentCases = useMemo(() => {
    const assignedCodes = deployments.map(d => d.absentEmployeeCode)
    return attendanceVerificationCases.filter(c => !assignedCodes.includes(c.employeeCode))
  }, [deployments])

  const handleUpdateStatus = (id: string, newStatus: 'Assigned' | 'Present' | 'Completed') => {
    setDeployments(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: newStatus }
      }
      return d
    }))
  }

  const handleAssign = () => {
    const chosenCase = attendanceVerificationCases.find(c => c.id === selectedCaseId)
    if (!chosenCase || !relieverName) return

    const newAssignment: RelieverAssignment = {
      id: `RLV_00${deployments.length + 1}`,
      absentEmployee: chosenCase.employeeName,
      absentEmployeeCode: chosenCase.employeeCode,
      relieverName,
      relieverCode: relieverCode || `EMP90${Math.floor(Math.random() * 90) + 10}`,
      site: chosenCase.site,
      shift: chosenCase.shift,
      deploymentDate,
      status: 'Assigned'
    }

    setDeployments(prev => [newAssignment, ...prev])
    setIsAssigning(false)
    setSelectedCaseId('')
    setRelieverName('')
    setRelieverCode('')
  }

  return (
    <div className="space-y-6">
      {/* Reliever Deployment actions bar */}
      <div className="flex justify-between items-center bg-card border rounded-2xl p-4 shadow-soft">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reliever Deployment Logs</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Track deployment statuses of replacement employees across sites.</p>
        </div>
        <button
          onClick={() => setIsAssigning(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-bold transition-all text-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
        >
          <PlusCircle size={14} /> Deploy Reliever
        </button>
      </div>

      {/* Deploy reliever form panel (conditionally visible) */}
      {isAssigning && (
        <Card className="shadow-soft border bg-card animate-in slide-in-from-top duration-300">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Assign New Reliever Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-4 text-xs items-end">
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Select Absent Employee:</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                <option value="">-- Choose Employee --</option>
                {availableAbsentCases.map(c => (
                  <option key={c.id} value={c.id}>{c.employeeName} ({c.employeeCode})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Reliever Name:</label>
              <input
                type="text"
                placeholder="Name"
                value={relieverName}
                onChange={(e) => setRelieverName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground">Reliever Code:</label>
              <input
                type="text"
                placeholder="Code"
                value={relieverCode}
                onChange={(e) => setRelieverCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAssigning(false)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedCaseId || !relieverName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-xs"
              >
                Confirm
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relievers grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {deployments.map((d) => (
          <Card key={d.id} className="shadow-soft border bg-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{d.relieverName}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Replacement for <strong>{d.absentEmployee}</strong></p>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  d.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : d.status === 'Present'
                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
                }`}>
                  {d.status}
                </span>
              </div>

              {/* Deployment info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="truncate">{d.site}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock size={14} className="text-muted-foreground" />
                  <span>{d.shift} Shift ({d.deploymentDate})</span>
                </div>
              </div>

              {/* Status updater */}
              <div className="border-t pt-3 flex items-center justify-between">
                <select
                  value={d.status}
                  onChange={(e) => handleUpdateStatus(d.id, e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-900 border text-[10px] rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-foreground"
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Present">Present</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="text-[10px] text-muted-foreground">ID: {d.relieverCode}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users, AlertCircle, ShieldAlert, CheckCircle2, RefreshCw, UserX, Award, HelpCircle
} from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'

export default function VerificationDashboard() {
  const stats = useMemo(() => {
    const totalAbsent = attendanceVerificationCases.length
    const verificationPending = attendanceVerificationCases.filter(c => c.status === 'Verification Pending').length
    const underInvestigation = attendanceVerificationCases.filter(c => c.status === 'Under Investigation').length
    const resolvedCases = attendanceVerificationCases.filter(c => c.status === 'AVP Approved' || c.status === 'Closed').length

    const relieversDeployed = attendanceVerificationCases.filter(c => c.relieverDeployed).length
    const relieversPending = attendanceVerificationCases.filter(c => !c.relieverDeployed && c.status === 'Verification Pending').length
    
    const vacantPositions = attendanceVerificationCases.filter(c => c.vacancyRaised).length
    const positionsFilled = attendanceVerificationCases.filter(c => c.resolutionType === 'Position Filled').length

    // Shift counts
    const firstShiftAbsent = attendanceVerificationCases.filter(c => c.shift === 'First').length
    const secondShiftAbsent = attendanceVerificationCases.filter(c => c.shift === 'Second').length
    const thirdShiftAbsent = attendanceVerificationCases.filter(c => c.shift === 'Third').length

    // Performance summaries
    const tasksSubmitted = attendanceVerificationCases.filter(c => 
      c.status === 'OE Submitted' || c.status === 'RM Reviewed' || c.status === 'AVP Approved'
    ).length
    const pendingReviews = attendanceVerificationCases.filter(c => 
      c.status === 'OE Submitted' || c.status === 'RM Reviewed'
    ).length

    // Average ratings
    const oeRatings = attendanceVerificationCases.map(c => c.oeRating).filter((r): r is number => r !== undefined)
    const rmRatings = attendanceVerificationCases.map(c => c.rmRating).filter((r): r is number => r !== undefined)
    const avpRatings = attendanceVerificationCases.map(c => c.avpRating).filter((r): r is number => r !== undefined)

    const avgOE = oeRatings.length > 0 ? (oeRatings.reduce((a, b) => a + b, 0) / oeRatings.length).toFixed(1) : '0.0'
    const avgRM = rmRatings.length > 0 ? (rmRatings.reduce((a, b) => a + b, 0) / rmRatings.length).toFixed(1) : '0.0'
    const avgAVP = avpRatings.length > 0 ? (avpRatings.reduce((a, b) => a + b, 0) / avpRatings.length).toFixed(1) : '0.0'

    // Resolution breakdown counts
    const returnedCount = attendanceVerificationCases.filter(c => c.resolutionType === 'Employee Returned').length
    const relieverCount = attendanceVerificationCases.filter(c => c.resolutionType === 'Reliever Deployed').length
    const recruitmentCount = attendanceVerificationCases.filter(c => c.resolutionType === 'Recruitment In Progress').length
    const exitCount = attendanceVerificationCases.filter(c => c.employeeLeft).length

    return {
      totalAbsent,
      verificationPending,
      underInvestigation,
      resolvedCases,
      relieversDeployed,
      relieversPending,
      vacantPositions,
      positionsFilled,
      firstShiftAbsent,
      secondShiftAbsent,
      thirdShiftAbsent,
      tasksSubmitted,
      pendingReviews,
      avgOE,
      avgRM,
      avgAVP,
      returnedCount,
      relieverCount,
      recruitmentCount,
      exitCount
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Abs absenteeism cases</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-center border-t pt-2.5">
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats.totalAbsent}</p>
                <p className="text-[9px] text-muted-foreground">Total Absent</p>
              </div>
              <div>
                <p className="text-xl font-bold text-rose-600">{stats.verificationPending}</p>
                <p className="text-[9px] text-muted-foreground">Pending verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Case Status Tracker</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-center border-t pt-2.5">
              <div>
                <p className="text-xl font-bold text-amber-600">{stats.underInvestigation}</p>
                <p className="text-[9px] text-muted-foreground">Under Audit</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{stats.resolvedCases}</p>
                <p className="text-[9px] text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Reliever Deployments</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-center border-t pt-2.5">
              <div>
                <p className="text-xl font-bold text-emerald-600">{stats.relieversDeployed}</p>
                <p className="text-[9px] text-muted-foreground">Deployed</p>
              </div>
              <div>
                <p className="text-xl font-bold text-rose-600">{stats.relieversPending}</p>
                <p className="text-[9px] text-muted-foreground">Pending reliever</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Vacancy Audits</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-center border-t pt-2.5">
              <div>
                <p className="text-xl font-bold text-amber-600">{stats.vacantPositions}</p>
                <p className="text-[9px] text-muted-foreground">Vacancies raised</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{stats.positionsFilled}</p>
                <p className="text-[9px] text-muted-foreground">Filled positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Summary & Resolution Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Shift Summary Card */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 pb-2 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300">Shift Absenteeism</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">First Shift:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{stats.firstShiftAbsent} cases</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Second Shift:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{stats.secondShiftAbsent} cases</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Third Shift:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{stats.thirdShiftAbsent} cases</span>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Summary */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 pb-2 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300">Resolution Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Employee Returned:</span>
              <span className="font-bold text-blue-600">{stats.returnedCount}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Relievers Deployed:</span>
              <span className="font-bold text-emerald-600">{stats.relieverCount}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Recruitments Raised:</span>
              <span className="font-bold text-amber-600">{stats.recruitmentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Exited Organisation:</span>
              <span className="font-bold text-rose-600">{stats.exitCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Scoring Summary */}
        <Card className="shadow-soft border bg-card">
          <CardHeader className="p-4 pb-2 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300">Performance Scoring Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Tasks Submitted:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{stats.tasksSubmitted} / {stats.totalAbsent}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Pending Reviews:</span>
              <span className="font-bold text-amber-600">{stats.pendingReviews}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Average OE Rating:</span>
              <span className="font-extrabold text-blue-650 dark:text-blue-400">{stats.avgOE} / 4.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Average RM Rating:</span>
              <span className="font-extrabold text-emerald-600">{stats.avgRM} / 4.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Average AVP Rating:</span>
              <span className="font-extrabold text-rose-600">{stats.avgAVP} / 4.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

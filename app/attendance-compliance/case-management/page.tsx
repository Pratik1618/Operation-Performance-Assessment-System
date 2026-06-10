'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, ShieldCheck, UserCheck, AlertTriangle, ArrowLeft, Info, HelpCircle } from 'lucide-react'
import { attendanceVerificationCases } from '@/lib/data/ocrms-data'
import { AttendanceVerificationCase } from '@/lib/types'

function CaseManagementContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get('caseId') || 'CASE_001'

  // Load the initial case
  const initialCase = useMemo(() => {
    return attendanceVerificationCases.find(c => c.id === caseId) || attendanceVerificationCases[0]
  }, [caseId])

  // Form states
  const [absenceReason, setAbsenceReason] = useState(initialCase.absenceReason)
  const [contactedEmployee, setContactedEmployee] = useState(false)
  const [contactedSupervisor, setContactedSupervisor] = useState(false)
  const [contactedIncharge, setContactedIncharge] = useState(false)
  const [remarks, setRemarks] = useState(initialCase.oeRemarks || '')
  
  const [leftOrganization, setLeftOrganization] = useState<boolean>(initialCase.employeeLeft)
  const [lastWorkingDate, setLastWorkingDate] = useState('')
  const [exitReason, setExitReason] = useState('Resigned')

  const [resolutionType, setResolutionType] = useState(initialCase.resolutionType)
  const [resolutionRemarks, setResolutionRemarks] = useState('')
  const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  const [uploadedEvidence, setUploadedEvidence] = useState<string[]>([])

  // Reload states when active case changes
  useEffect(() => {
    if (initialCase) {
      setAbsenceReason(initialCase.absenceReason)
      setLeftOrganization(initialCase.employeeLeft)
      setResolutionType(initialCase.resolutionType)
      setRemarks(initialCase.oeRemarks || '')
    }
  }, [initialCase])

  const handleSave = () => {
    alert(`Progress saved successfully for Case ${caseId}.`)
  }

  const handleSubmit = () => {
    alert(`Verification details submitted successfully. Rated weightage: ${initialCase.weightage}. Case moved to review.`)
    router.push('/attendance-compliance/verification-queue')
  }

  return (
    <div className="space-y-6">
      {/* Back to Queue header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/attendance-compliance/verification-queue')}
          className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Verification Workspace</h2>
          <p className="text-[11px] text-muted-foreground">Audit active absenteeism case and declare status resolution.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Left pane: Employee Info & Verification Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Employee Info Card */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-muted-foreground">Name:</p>
                <p className="font-extrabold text-foreground text-sm mt-0.5">{initialCase.employeeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employee Code:</p>
                <p className="font-bold text-foreground mt-0.5">{initialCase.employeeCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Designation:</p>
                <p className="font-bold text-foreground mt-0.5">{initialCase.designation}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shift & Date:</p>
                <p className="font-bold text-foreground mt-0.5">{initialCase.shift} Shift ({initialCase.absentDate})</p>
              </div>
              <div>
                <p className="text-muted-foreground">Client & Site:</p>
                <p className="font-semibold text-foreground mt-0.5">{initialCase.client} ({initialCase.site})</p>
              </div>
              <div>
                <p className="text-muted-foreground">Consecutive Days Absent:</p>
                <p className="font-extrabold text-rose-600 mt-0.5">{initialCase.consecutiveAbsentDays} Days</p>
              </div>
            </CardContent>
          </Card>

          {/* Absence Reason verification */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Absence Verification Audit</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Why is employee absent?</label>
                <select
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Approved Leave">Approved Leave</option>
                  <option value="Unapproved Leave">Unapproved Leave</option>
                  <option value="Personal Emergency">Personal Emergency</option>
                  <option value="Salary Issue">Salary Issue</option>
                  <option value="Family Emergency">Family Emergency</option>
                  <option value="Absconding">Absconding</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              {/* Checkbox logs */}
              <div className="space-y-2.5 border-t pt-3">
                <label className="font-bold text-muted-foreground block">Contact Verification Checklist:</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactedEmployee}
                      onChange={(e) => setContactedEmployee(e.target.checked)}
                      className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                    />
                    Employee Contacted
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactedSupervisor}
                      onChange={(e) => setContactedSupervisor(e.target.checked)}
                      className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                    />
                    Supervisor Contacted
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactedIncharge}
                      onChange={(e) => setContactedIncharge(e.target.checked)}
                      className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                    />
                    Site Incharge Contacted
                  </label>
                </div>
              </div>

              {/* Status Remarks */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="font-bold text-muted-foreground">Verification Call Remarks:</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record summary of contact calls here..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Left organization logs */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Employee Status Verification</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-muted-foreground block">Has employee left the organization?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="leftOrg"
                      checked={leftOrganization === true}
                      onChange={() => setLeftOrganization(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="leftOrg"
                      checked={leftOrganization === false}
                      onChange={() => setLeftOrganization(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    No
                  </label>
                </div>
              </div>

              {leftOrganization && (
                <div className="grid gap-3 sm:grid-cols-2 border-t pt-3 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Last Working Date:</label>
                    <input
                      type="date"
                      value={lastWorkingDate}
                      onChange={(e) => setLastWorkingDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Exit Reason:</label>
                    <select
                      value={exitReason}
                      onChange={(e) => setExitReason(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                    >
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                      <option value="Absconded">Absconded</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right pane: Resolution & Scoring submission */}
        <div className="space-y-6">
          {/* Resolution form */}
          <Card className="shadow-soft border bg-card">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Resolution Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Resolution Type:</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                >
                  <option value="Pending">Pending Audit</option>
                  <option value="Employee Returned">Employee Returned</option>
                  <option value="Reliever Deployed">Reliever Deployed</option>
                  <option value="Position Filled">Position Filled</option>
                  <option value="Recruitment In Progress">Recruitment In Progress</option>
                  <option value="Employee Resigned">Employee Resigned</option>
                  <option value="Employee Terminated">Employee Terminated</option>
                  <option value="Requirement Closed">Requirement Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Resolution Remarks:</label>
                <textarea
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="Record summary of action resolution..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Next Follow-Up Date:</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                />
              </div>

              <div className="space-y-1.5 border-t pt-3">
                <label className="font-bold text-muted-foreground">Evidence Upload / Call Log Proof:</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <p className="text-[10px] text-muted-foreground font-bold">CLICK OR DRAG EVIDENCE FILES</p>
                  <p className="text-[9px] text-slate-400 mt-1">Accepts PNG, JPG, PDF, MP3 (Max 10MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions & Rating card */}
          <Card className="shadow-soft border bg-card">
            <CardContent className="p-4 space-y-3.5">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-[11px] text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <Info size={16} className="flex-shrink-0" />
                <p>
                  Submitting verification lock scores this task with weightage <strong>{initialCase.weightage}</strong>.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-xs"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-xs"
                >
                  Submit & Score
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CaseDetailsWorkspace() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-semibold">Loading Case Workspace...</div>}>
      <CaseManagementContent />
    </Suspense>
  )
}

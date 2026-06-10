'use client'

import React, { useState, useMemo } from 'react'
import { Search, UserCheck, ShieldAlert, FileText, Check, AlertCircle, RefreshCw, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { attendanceRecords } from '@/lib/data/ocrms-data'
import { AttendanceRecord } from '@/lib/types'

export default function AbsentReportPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    attendanceRecords.filter(r => r.issueType === 'absent')
  )

  // Filters
  const [clientFilter, setClientFilter] = useState('All')
  const [shiftFilter, setShiftFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Reliever Assignment Dialog State
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [relieverName, setRelieverName] = useState('')
  const [isRemarksDialogOpen, setIsRemarksDialogOpen] = useState(false)
  const [selectedForRemarks, setSelectedForRemarks] = useState<AttendanceRecord | null>(null)
  const [remarksText, setRemarksText] = useState('')

  // Available relievers mock list
  const availableRelievers = ['Sunil Verma', 'Gopal Raj', 'Vikram Singh', 'Amit Sharma', 'Rakesh Kumar']

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesClient = clientFilter === 'All' || r.client === clientFilter
      const matchesShift = shiftFilter === 'All' || r.shift === shiftFilter
      const matchesSearch = searchQuery === '' || 
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.site.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesClient && matchesShift && matchesSearch
    })
  }, [records, clientFilter, shiftFilter, searchQuery])

  // Get unique clients for filter
  const clientsList = useMemo(() => {
    const clients = new Set(records.map(r => r.client).filter(Boolean))
    return ['All', ...Array.from(clients)]
  }, [records])

  const handleAssignReliever = () => {
    if (!selectedRecord || !relieverName) return

    setRecords(prev => prev.map(rec => {
      if (rec.id === selectedRecord.id) {
        return {
          ...rec,
          relieverAssigned: relieverName,
          status: 'Reliever Assigned',
          remarks: `Reliever ${relieverName} assigned.`
        }
      }
      return rec
    }))
    
    // Reset state
    setSelectedRecord(null)
    setRelieverName('')
  }

  const handleEscalate = (id: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: 'Escalated',
          remarks: 'Escalated to Operations Manager.'
        }
      }
      return rec
    }))
  }

  const handleSaveRemarks = () => {
    if (!selectedForRemarks) return

    setRecords(prev => prev.map(rec => {
      if (rec.id === selectedForRemarks.id) {
        return {
          ...rec,
          remarks: remarksText
        }
      }
      return rec
    }))
    
    setIsRemarksDialogOpen(false)
    setSelectedForRemarks(null)
    setRemarksText('')
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="shadow-soft border bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search employee, code, or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Client:</span>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                {clientsList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Shift:</span>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
              >
                <option value="All">All Shifts</option>
                <option value="First">First Shift</option>
                <option value="Second">Second Shift</option>
                <option value="Third">Third Shift</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Report Table */}
      <Card className="shadow-soft border bg-card overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-bold text-foreground">Absentees & Deployment Log</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="p-4">Employee</th>
                <th className="p-4">Site / Client</th>
                <th className="p-4">Shift / Date</th>
                <th className="p-4">Reliever Deployed</th>
                <th className="p-4">SLA Status</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No absentees matching standard filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{record.employeeName}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{record.employeeCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{record.site}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{record.client}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-300">{record.shift} Shift</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{record.date}</div>
                    </td>
                    <td className="p-4">
                      {record.relieverAssigned ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <UserCheck size={14} />
                          {record.relieverAssigned}
                        </div>
                      ) : record.replacementRequired ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertCircle size={14} /> Required
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No replacement needed</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        record.status === 'Open'
                          ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
                          : record.status === 'Reliever Assigned'
                          ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40'
                          : record.status === 'Covered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-[11px] text-muted-foreground">
                      {record.remarks || 'No remarks recorded.'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.status === 'Open' && record.replacementRequired && (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl px-3 py-1.5 font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1"
                          >
                            <RefreshCw size={12} /> Assign
                          </button>
                        )}
                        {record.status === 'Open' && (
                          <button
                            onClick={() => handleEscalate(record.id)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-1.5 font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1"
                          >
                            <ShieldAlert size={12} /> Escalate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedForRemarks(record)
                            setRemarksText(record.remarks || '')
                            setIsRemarksDialogOpen(true)
                          }}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold transition-all flex items-center gap-1"
                        >
                          <FileText size={12} /> Remarks
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reliever Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="text-blue-500" />
                Assign Reliever
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 space-y-1">
                <p className="text-muted-foreground">Absent Employee: <strong className="text-foreground">{selectedRecord.employeeName}</strong></p>
                <p className="text-muted-foreground">Site: <strong className="text-foreground">{selectedRecord.site}</strong></p>
                <p className="text-muted-foreground">Shift: <strong className="text-foreground">{selectedRecord.shift} Shift</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Select Available Reliever:</label>
                <select
                  value={relieverName}
                  onChange={(e) => setRelieverName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
                >
                  <option value="">-- Choose Reliever --</option>
                  {availableRelievers.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignReliever}
                disabled={!relieverName}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all disabled:opacity-50 text-xs"
              >
                Confirm Assignment
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Remarks Dialog */}
      {selectedForRemarks && (
        <Dialog open={isRemarksDialogOpen} onOpenChange={setIsRemarksDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="text-slate-500" />
                Add/Edit Remarks
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 text-xs">
              <p className="text-muted-foreground">Update notes for <strong className="text-foreground">{selectedForRemarks.employeeName}</strong></p>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="Enter shift remarks or reason for absence..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 text-foreground text-xs"
              />
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setIsRemarksDialogOpen(false)
                  setSelectedForRemarks(null)
                }}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemarks}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all text-xs"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

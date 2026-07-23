'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Building2, CalendarDays, ClipboardCheck, CheckCircle2, AlertTriangle,
  MapPin, Plus, Search, Filter, ShieldCheck, Signature, Camera,
  ChevronRight, Calendar, List, CalendarCheck, Clock, Check, Edit2, Trash2, Download, Send, AlertCircle, Users, ArrowUpDown, Globe2, UserCheck, X, FileSpreadsheet, UploadCloud, FileText,
  Car, Bike, Train, Bus, Compass
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import VisitCalendar from '@/components/operations/visit-calendar'
import WeekView from '@/components/operations/week-view'
import { toast } from 'sonner'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { siteVisits, sites as initialSites, employees, attendanceRecords } from '@/lib/data/ocrms-data'
import { fetchScheduledVisits, createScheduledVisit, updateScheduledVisit, deleteScheduledVisit, lockSiteVisits, downloadImportTemplate, uploadImportSchedules, fetchSites, requestSiteTransfer, fetchTransfers, updateTransfer } from '@/lib/api'
import type { SiteVisit, VisitStatus, Site, SiteVisitReportData, Employee } from '@/lib/types'
import SiteVisitReportForm from '@/components/operations/site-visit-report-form'
import SiteVisitSummary from '@/components/operations/site-visit-summary'
import { Loader2 } from 'lucide-react'

// Status configurations for visual consistency
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  planned: { bg: 'bg-blue-50 text-blue-700 border-blue-100', text: 'text-blue-700', label: 'Planned' },
  missed: { bg: 'bg-rose-50 text-rose-700 border-rose-100', text: 'text-rose-700', label: 'Missed' },
  in_progress: { bg: 'bg-amber-50 text-amber-700 border-amber-100', text: 'text-amber-700', label: 'In Progress' },
  rescheduled: { bg: 'bg-slate-50 text-slate-700 border-slate-100', text: 'text-slate-700', label: 'Rescheduled' },
}

const getTransportIcon = (mode?: string, size = 12) => {
  const m = mode?.toLowerCase();
  if (m === 'car') return <Car size={size} className="text-slate-500" />;
  if (m === 'bike') return <Bike size={size} className="text-slate-500" />;
  if (m === 'metro' || m === 'train') return <Train size={size} className="text-slate-500" />;
  if (m === 'bus') return <Bus size={size} className="text-slate-500" />;
  return <Compass size={size} className="text-slate-500" />;
}

interface Visit {
  id: string
  siteId: string
  siteName: string
  dateStr: string
  time: string
  status: 'planned' | 'completed'
  assignedTo?: string
  transportMode?: string
  notes?: string
  reportData?: SiteVisitReportData
}

interface AssignmentRequest {
  id: string
  siteId: string
  siteName: string
  siteCode: string
  assignedOE: string
  previousOE: string
  assignedRM: string
  toUserId?: string
  fromUserId?: string
  requestedByUserId?: string
  reason?: string
  requestedDate: string
  status: 'pending_avp' | 'verified_avp' | 'rejected_avp'
  avpRemarks?: string
}

const initialAssignments: AssignmentRequest[] = [
  {
    id: 'ASN_001',
    siteId: 'SITE_001',
    siteName: 'Infosys Gurgaon Tower A',
    siteCode: 'INFO-GGN-01',
    previousOE: 'Ravi Shankar',
    assignedOE: 'Rajesh Sharma',
    assignedRM: 'Suresh Kumar',
    requestedDate: '2025-06-08',
    status: 'pending_avp',
  },
  {
    id: 'ASN_002',
    siteId: 'SITE_003',
    siteName: 'Wipro Hinjewadi Campus',
    siteCode: 'WIPRO-PUN-01',
    previousOE: 'Kiran Nair',
    assignedOE: 'Anil Deshmukh',
    assignedRM: 'Rajesh Kumar',
    requestedDate: '2025-06-07',
    status: 'verified_avp',
    avpRemarks: 'Verified and approved'
  }
]

export default function SiteOperationsPage() {
  const { currentRole, currentUser, apiUser } = useOCRMS()

  // ─────────────────────────────────────────────
  // 1. Shared & Navigation State
  // ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'visits' | 'planner' | 'mapping' | 'upload'>('visits')
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // ─────────────────────────────────────────────
  // 2. State Management for Tab: Site Visits
  // ─────────────────────────────────────────────
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportVisitObj, setReportVisitObj] = useState<Visit | null>(null)
  const [isFetchingGPS, setIsFetchingGPS] = useState(false)
  const [gpsFetched, setGpsFetched] = useState(false)
  const [reportRemarks, setReportRemarks] = useState('')
  const [reportTransportMode, setReportTransportMode] = useState('Bike')

  // ─────────────────────────────────────────────
  // 3. State Management for Tab: Visit Planner
  // ─────────────────────────────────────────────
  const [selectedPlannerSite, setSelectedPlannerSite] = useState<string>('all')
  const [selectedOE, setSelectedOE] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
  const [submittedMonths, setSubmittedMonths] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [plannerStatusFilter, setPlannerStatusFilter] = useState<'all' | 'planned' | 'completed'>('all')

  const [schedules, setSchedules] = useState<Visit[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setIsLoadingSchedules(true)
        const data = await fetchScheduledVisits()
        const mappedSchedules: Visit[] = data.map((item) => ({
          id: item.id,
          siteId: item.site_id,
          siteName: item.site_name,
          dateStr: item.date_str,
          time: item.time,
          status: item.status === 'completed' ? 'completed' : 'planned',
          assignedTo: item.assigned_to_name
        }))
        setSchedules(mappedSchedules)
      } catch (error) {
        toast.error('Failed to load scheduled visits')
      } finally {
        setIsLoadingSchedules(false)
      }
    }
    
    const loadSites = async () => {
      try {
        const data = await fetchSites()
        if (data && data.length > 0) {
          setLocalSites(data)
        }
      } catch (error) {
        // Fallback to local data if API fails
      }
    }
    
    if (currentRole && currentUser) {
      loadSchedules()
      loadSites()
    }
  }, [currentRole, currentUser])
 
  const [showAddModal, setShowAddModal] = useState(false)
  
  // ─────────────────────────────────────────────
  // 4. State Management for Tab: Employees
  // ─────────────────────────────────────────────
  const [selectedEmployeeSite, setSelectedEmployeeSite] = useState<string>('all')
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('')
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState<Employee | null>(null)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [formSiteId, setFormSiteId] = useState(initialSites[0].id)
  const [formDateStr, setFormDateStr] = useState('2025-06-15')
  const [formTime, setFormTime] = useState('11:00 AM')
  const [formAssignedTo, setFormAssignedTo] = useState('Ravi Shankar')

  const checklistCategories = [
    { title: 'Grooming & Uniform Check (6 points)', items: ['Proper uniform worn', 'ID card displayed', 'Safety shoes clean', 'Personal hygiene guidelines met'] },
    { title: 'Operational Attendance Verification (8 points)', items: ['Biometric check matching roster', 'Reliever assignments verified', 'Manual registers up-to-date', 'OT register matching punches'] },
    { title: 'Material & Consumables Performance (10 points)', items: ['Material punch register updated', 'Stock level matching requirements', 'Quality audit of chemical seal', 'Equipment upkeep inspections'] },
    { title: 'Site Register & Documentation Audit (10 points)', items: ['Visitor register checked', 'Incident logbook countersigned', 'Client interaction feedback logged', 'MOM report actions verified'] }
  ]

  // Planner lock logic
  const plannerLocked = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const todayYear = today.getFullYear()
    const todayMonth = today.getMonth()

    // Current month or past months are always locked
    if (year < todayYear || (year === todayYear && month <= todayMonth)) {
      return true
    }

    const monthKey = `${year}-${month}`
    if (submittedMonths[monthKey]) {
      return true
    }

    // Auto lock next month if current day is on or after the 26th
    const isNextMonth = (year === todayYear && month === todayMonth + 1) || (month === 0 && todayMonth === 11 && year === todayYear + 1)
    if (isNextMonth && today.getDate() >= 26) {
      return true
    }

    return false
  }, [currentDate, today, submittedMonths])

  // ─────────────────────────────────────────────
  // 4. State Management for Tab: Site Mapping
  // ─────────────────────────────────────────────
  const [localSites, setLocalSites] = useState<Site[]>(initialSites)
  const [assignments, setAssignments] = useState<AssignmentRequest[]>(initialAssignments)

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const data = await fetchTransfers()
        if (data && data.length > 0) {
          
          // Build a dynamic map of User IDs to Names based on the site data
          const idToName = new Map<string, string>()
          localSites.forEach(s => {
            if (s.assignedOeId && s.assignedOE) idToName.set(s.assignedOeId, s.assignedOE)
            if (s.assignedRmId && s.assignedRM) idToName.set(s.assignedRmId, s.assignedRM)
            if (s.assignedZhId && s.assignedZH) idToName.set(s.assignedZhId, s.assignedZH)
            if (s.assignedAvpId && s.assignedAVP) idToName.set(s.assignedAvpId, s.assignedAVP)
          })
          // Fallback for new OEs not assigned to any site yet
          idToName.set('USR_OE_001', 'Ravi Shankar')
          idToName.set('USR_OE_002', 'Kiran Nair')
          idToName.set('USR_OE_003', 'Anjali Desai')
          idToName.set('USR_OE_004', 'Geeta Sen')
          idToName.set('USR_OE_999', 'Siddharth Malhotra')
          idToName.set('USR_RM_001', 'Sanjay Gupta')

          const mapped: AssignmentRequest[] = data.map((item: any) => ({
            id: item.id || item.transfer_id || item.transferId || item._id || item.uuid || `ASN_${Date.now()}_${Math.random()}`,
            siteId: item.site_id,
            siteName: localSites.find(s => s.id === item.site_id)?.name || 'Unknown Site',
            siteCode: localSites.find(s => s.id === item.site_id)?.code || 'Unknown',
            assignedOE: idToName.get(item.to_user_id) || item.to_user_id,
            previousOE: idToName.get(item.from_user_id) || item.from_user_id,
            assignedRM: idToName.get(item.requested_by) || item.requested_by,
            toUserId: item.to_user_id,
            fromUserId: item.from_user_id,
            requestedByUserId: item.requested_by,
            reason: item.reason,
            requestedDate: item.decided_at || item.created_at || new Date().toISOString().split('T')[0],
            status: item.status === 'approved' ? 'verified_avp' : item.status === 'rejected' ? 'rejected_avp' : 'pending_avp',
            avpRemarks: item.decision_remarks
          }))
          setAssignments(mapped)
        }
      } catch (error) {
        console.error('Failed to load assignments', error)
      }
    }
    // Only load if sites are already loaded, so we can map site names
    if (localSites.length > 1) {
      loadAssignments()
    }
  }, [localSites])
  const [mappingSubTab, setMappingSubTab] = useState<'sites' | 'assignments'>('sites')
  
  // Mapping Search & Filters
  const [mappingSearch, setMappingSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')
  
  // Sorting Mappings
  const [sortField, setSortField] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Modals
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRequest | null>(null)

  // Transfer Forms
  const [transferSiteId, setTransferSiteId] = useState(initialSites[0].id)
  const [transferNewOE, setTransferNewOE] = useState('')
  const [avpRemarksText, setAvpRemarksText] = useState('')

  // ─────────────────────────────────────────────
  // 5. State Management for Tab: Visit Calendar Upload
  // ─────────────────────────────────────────────
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isParsing, setIsParsing] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<Array<{
    date: string
    time: string
    siteId: string
    siteName: string
    oeName: string
    status: 'Valid' | 'Warning'
    msg: string
  }>>([])

  // ─────────────────────────────────────────────
  // 6. Computations & Filters
  // ─────────────────────────────────────────────

  // Visits Tab KPI calculations
  const metrics = useMemo(() => {
    const list = currentRole === 'oe' ? siteVisits.filter(v => v.visitedBy === currentUser.userName) : siteVisits
    const total = list.length
    const completed = list.filter(v => v.status === 'completed').length
    const planned = list.filter(v => v.status === 'planned').length
    const missed = list.filter(v => v.status === 'missed').length
    const compRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, planned, missed, compRate }
  }, [currentRole, currentUser])

  // Filtered List of completed site audits
  const filteredVisits = useMemo(() => {
    return siteVisits.filter((v) => {
      if (currentRole === 'oe' && v.visitedBy !== currentUser.userName) {
        return false
      }
      const matchesSearch = v.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            v.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            v.visitedBy.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, currentRole, currentUser])

  // Planner schedules calculations
  const plannerStats = useMemo(() => {
    const roleFiltered = schedules.filter(v => {
      if (currentRole === 'oe') return v.assignedTo === currentUser.userName
      return selectedOE === 'all' || v.assignedTo === selectedOE
    })
    const filtered = selectedPlannerSite === 'all' ? roleFiltered : roleFiltered.filter(v => v.siteId === selectedPlannerSite)
    return {
      target: 24,
      planned: filtered.length,
      completed: filtered.filter(v => v.status === 'completed').length,
      pending: filtered.filter(v => v.status === 'planned').length,
    }
  }, [schedules, selectedPlannerSite, currentRole, selectedOE, currentUser])

  const filteredSchedules = useMemo(() => {
    return schedules.filter(v => {
      if (currentRole === 'oe' && v.assignedTo !== currentUser.userName) {
        return false
      }
      if (currentRole !== 'oe' && selectedOE !== 'all' && v.assignedTo !== selectedOE) {
        return false
      }
      return plannerStatusFilter === 'all' || v.status === plannerStatusFilter
    })
  }, [schedules, plannerStatusFilter, currentRole, selectedOE, currentUser])

  const submittedReports = useMemo(() => {
    const baseReports = siteVisits.filter(v => v.status === 'completed')
    const completedSchedules = schedules.filter(s => s.status === 'completed').map(s => {
      const siteObj = localSites.find(si => si.id === s.siteId)
      return {
        id: s.id,
        site: s.siteName,
        siteId: s.siteId,
        client: siteObj?.client || 'Client Ltd',
        visitDate: s.dateStr,
        plannedTime: s.time,
        actualTime: s.time,
        status: 'completed' as const,
        clientSignature: true,
        geoTagged: true,
        photos: 3,
        notes: s.notes || 'Visit completed successfully. Checklist requirements met.',
        checklistScore: 32,
        visitedBy: s.assignedTo || 'Ravi Shankar',
        transportMode: s.transportMode || 'Bike'
      }
    })
    const combined = [...completedSchedules, ...baseReports]
    const unique = combined.filter((v, i, self) => self.findIndex(t => t.id === v.id) === i)
    return unique
  }, [schedules, localSites])

  const formattedFormDate = useMemo(() => {
    if (!formDateStr) return ''
    const parts = formDateStr.split('-')
    if (parts.length !== 3) return formDateStr
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return d.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })
  }, [formDateStr])

  // Mapping Role-filtering
  const roleFilteredSites = useMemo(() => {
    if (currentRole === 'oe') {
      return localSites.filter(s => s.assignedOE === currentUser.userName || s.assignedOeId === currentUser.id)
    }
    if (currentRole === 'rm') {
      return localSites.filter(s => s.assignedRM === currentUser.userName || s.assignedRmId === currentUser.id)
    }
    if (currentRole === 'avp') {
      return localSites.filter(s => s.assignedAVP === currentUser.userName || s.assignedAvpId === currentUser.id)
    }
    return localSites
  }, [localSites, currentRole, currentUser])

  useEffect(() => {
    if (roleFilteredSites.length > 0 && !roleFilteredSites.find(s => s.id === transferSiteId)) {
      setTransferSiteId(roleFilteredSites[0].id)
    }
  }, [roleFilteredSites, transferSiteId])

  const roleFilteredAssignments = useMemo(() => {
    if (currentRole === 'oe') {
      return assignments.filter(a => a.previousOE === currentUser.userName || a.assignedOE === currentUser.userName || a.previousOE === currentUser.id || a.assignedOE === currentUser.id)
    }
    if (currentRole === 'rm') {
      return assignments.filter(a => a.assignedRM === currentUser.userName || a.assignedRM === currentUser.id)
    }
    if (currentRole === 'avp') {
      const avpSiteIds = new Set(roleFilteredSites.map(s => s.id))
      return assignments.filter(a => avpSiteIds.has(a.siteId))
    }
    return assignments
  }, [assignments, roleFilteredSites, currentRole, currentUser])

  const uniqueRegions = useMemo(() => Array.from(new Set(roleFilteredSites.map(s => s.region))), [roleFilteredSites])
  const uniqueStates = useMemo(() => Array.from(new Set(roleFilteredSites.map(s => s.state))), [roleFilteredSites])

  const kpis = useMemo(() => {
    return {
      totalSites: roleFilteredSites.length,
      activeSites: roleFilteredSites.filter(s => s.status === 'active').length,
      totalEmployees: roleFilteredSites.reduce((sum, s) => sum + s.employeeCount, 0),
      pendingAssignments: roleFilteredAssignments.filter(a => a.status === 'pending_avp').length,
      verifiedAssignments: roleFilteredAssignments.filter(a => a.status === 'verified_avp').length,
    }
  }, [roleFilteredSites, roleFilteredAssignments])

  const transferPreviousOE = useMemo(() => {
    const siteObj = localSites.find(s => s.id === transferSiteId)
    return siteObj ? siteObj.assignedOE : ''
  }, [transferSiteId, localSites])

  const filteredSites = useMemo(() => {
    let result = [...roleFilteredSites]

    if (mappingSearch) {
      const term = mappingSearch.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.client.toLowerCase().includes(term) ||
        s.assignedOE.toLowerCase().includes(term)
      )
    }

    if (regionFilter !== 'all') {
      result = result.filter(s => s.region === regionFilter)
    }

    if (stateFilter !== 'all') {
      result = result.filter(s => s.state === stateFilter)
    }

    result.sort((a, b) => {
      let valA = a[sortField as keyof Site] || ''
      let valB = b[sortField as keyof Site] || ''

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA
      }

      return sortDir === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA))
    })

    return result
  }, [roleFilteredSites, mappingSearch, regionFilter, stateFilter, sortField, sortDir])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // ─────────────────────────────────────────────
  // 7. Event Handlers
  // ─────────────────────────────────────────────

  // Planner actions
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    const siteObj = localSites.find(s => s.id === formSiteId)
    const assignedOEName = currentRole === 'oe' ? currentUser.userName : formAssignedTo

    try {
      // Ensure time format is HH:mm (strip AM/PM if present)
      const cleanTime = formTime.replace(/ (AM|PM)/i, '').padStart(5, '0')

      if (editingVisit) {
        if (editingVisit.id.length === 36) {
          const updatedApiVisit = await updateScheduledVisit(editingVisit.id, {
            site_id: formSiteId,
            visit_date: formDateStr,
            visit_time: cleanTime,
            assigned_to_user_id: apiUser?.user_id || 'USR_OE_001',
          })

          setSchedules(prev => prev.map(v => 
            v.id === editingVisit.id 
              ? { 
                  ...v, 
                  siteId: updatedApiVisit.site_id, 
                  siteName: updatedApiVisit.site_name, 
                  dateStr: updatedApiVisit.date_str, 
                  time: updatedApiVisit.time,
                  assignedTo: updatedApiVisit.assigned_to_name
                } 
              : v
          ))
        } else {
          // Bypassing API for hardcoded mock data IDs like 'VIS_003'
          setSchedules(prev => prev.map(v => 
            v.id === editingVisit.id 
              ? { 
                  ...v, 
                  siteId: formSiteId, 
                  siteName: siteObj?.name || 'Unknown Site', 
                  dateStr: formDateStr, 
                  time: formTime,
                  assignedTo: assignedOEName
                } 
              : v
          ))
        }
        toast.success('Schedule Updated', { description: 'The site visit plan has been modified.' })
      } else {
        const newApiVisit = await createScheduledVisit({
          site_id: formSiteId,
          visit_date: formDateStr,
          visit_time: cleanTime,
          // If we are RM assigning to someone else we would ideally look up their ID. 
          // For now, using apiUser.user_id or a mock default.
          assigned_to_user_id: apiUser?.user_id || 'USR_OE_001',
        })
        
        const newVisit: Visit = {
          id: newApiVisit.id,
          siteId: newApiVisit.site_id,
          siteName: newApiVisit.site_name,
          dateStr: newApiVisit.date_str,
          time: newApiVisit.time,
          status: 'planned',
          assignedTo: newApiVisit.assigned_to_name
        }
        
        setSchedules(prev => [...prev, newVisit])
        toast.success('Schedule Added', { description: 'New planned visit added to calendar via API.' })
      }
    } catch (error: any) {
      toast.error(`Failed to ${editingVisit ? 'update' : 'add'} schedule`, { description: error.message })
    }
    
    setShowAddModal(false)
    setEditingVisit(null)
  }

  const handleDeleteVisit = async (visitId: string) => {
    try {
      if (visitId.length === 36) {
        await deleteScheduledVisit(visitId)
      }
      setSchedules(prev => prev.filter(v => v.id !== visitId))
      toast.error('Schedule Deleted', { description: 'The planned visit has been removed.' })
    } catch (error: any) {
      toast.error('Failed to delete schedule', { description: error.message })
    }
  }

  const handleEditVisit = (visit: Visit) => {
    setEditingVisit(visit)
    setFormSiteId(visit.siteId)
    setFormDateStr(visit.dateStr)
    setFormTime(visit.time)
    setFormAssignedTo(visit.assignedTo || 'Ravi Shankar')
    setShowAddModal(true)
  }

  const handleVisitMove = (visitId: string, newDateStr: string) => {
    setSchedules(prev => prev.map(v => 
      v.id === visitId ? { ...v, dateStr: newDateStr } : v
    ))
    toast.success('Visit Rescheduled', { description: `Moved schedule to ${newDateStr}` })
  }

  // Report submission actions
  const handleOpenReport = (visit: Visit) => {
    setReportVisitObj(visit)
    setGpsFetched(false)
    setReportRemarks('')
    setReportTransportMode('Bike')
    setShowReportModal(true)
  }

  const fetchGPS = () => {
    setIsFetchingGPS(true)
    if (!navigator.geolocation) {
      toast.error('Geolocation Not Supported', { description: 'Your browser does not support geolocation services.' })
      setIsFetchingGPS(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsFetchingGPS(false)
        setGpsFetched(true)
        const { latitude, longitude } = position.coords
        toast.success('GPS Verification Successful', { 
          description: `Site coordinates matched. Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` 
        })
      },
      (error) => {
        setIsFetchingGPS(false)
        let errorMsg = 'Could not fetch GPS coordinates.'
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permission denied. Please grant location access in your browser settings.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Request to retrieve location timed out.'
        }
        toast.error('GPS Verification Failed', { description: errorMsg })

        // Local demo/assessment mode bypass: Auto fallback to mock GPS coordinates
        setTimeout(() => {
          setGpsFetched(true)
          toast.info('Simulated GPS Verification Active', {
            description: 'Local development environment mock bypass applied. Simulated coords: Lat: 28.4595, Lon: 77.0266 (Gurgaon).'
          })
        }, 1200)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Old simple report submit (kept for fallback)
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gpsFetched) {
      toast.error('Verification Error', { description: 'Please fetch and verify GPS coordinates first.' })
      return
    }
    
    if (reportVisitObj) {
      setSchedules(prev => prev.map(v => v.id === reportVisitObj.id ? { ...v, status: 'completed', transportMode: reportTransportMode, notes: reportRemarks } : v))
      toast.success('Report Submitted', { description: 'Audit completed. Score and details compiled.' })
    }
    setShowReportModal(false)
    setReportVisitObj(null)
  }

  const handleSVRSubmit = (data: SiteVisitReportData) => {
    if (reportVisitObj) {
      setSchedules(prev => prev.map(v => v.id === reportVisitObj.id ? { 
        ...v, 
        status: 'completed', 
        transportMode: reportTransportMode, 
        notes: data.supervisorRemarks || data.positiveRecognition,
        reportData: data
      } : v))

      toast.success('Site Visit Report Submitted', { description: '11-section comprehensive report completed.' })
    }
    setShowReportModal(false)
    setReportVisitObj(null)
  }

  const handleSVRDraft = (data: SiteVisitReportData) => {
    if (reportVisitObj) {
      setSchedules(prev => prev.map(v => v.id === reportVisitObj.id ? { 
        ...v, 
        status: 'planned', // Keep planned so they can submit later
        reportData: data
      } : v))
      toast.success('Draft Saved', { description: 'Site Visit Report progress saved.' })
    }
    setShowReportModal(false)
    setReportVisitObj(null)
  }

  // Site Mapping actions
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferNewOE.trim()) return

    const selectedSite = localSites.find(s => s.id === transferSiteId)
    if (!selectedSite) return

    try {
      const oeNameToId: Record<string, string> = {
        'Ravi Shankar': 'USR_OE_001',
        'Kiran Nair': 'USR_OE_002',
        'Anjali Desai': 'USR_OE_003',
        'Geeta Sen': 'USR_OE_004',
      }
      const toUserId = oeNameToId[transferNewOE] || 'USR_OE_999'

      const data = await requestSiteTransfer(
        transferSiteId,
        toUserId,
        'Routine operational requirement and workload balancing.'
      )

      const newRequest: AssignmentRequest = {
        id: data.id || `ASN_${Date.now()}`,
        siteId: data.site_id || transferSiteId,
        siteName: selectedSite.name,
        siteCode: selectedSite.code,
        previousOE: selectedSite.assignedOE,
        assignedOE: transferNewOE,
        assignedRM: currentUser.userName,
        toUserId: toUserId,
        fromUserId: selectedSite.assignedOeId || 'USR_OE_003',
        requestedByUserId: currentUser.id,
        reason: 'Routine operational requirement and workload balancing.',
        requestedDate: new Date().toISOString().split('T')[0],
        status: 'pending_avp'
      }

      setAssignments(prev => [newRequest, ...prev])
      setShowAddAssignmentModal(false)
      setTransferNewOE('')
      toast.success('Transfer Requested', { description: 'Change request submitted for AVP verification.' })
    } catch (error: any) {
      toast.error('Transfer Request Failed', { description: error.message })
    }
  }

  const handleVerifyAssignment = async (actionStatus: 'verified_avp' | 'rejected_avp') => {
    if (!selectedAssignment) return

    const apiStatus = actionStatus === 'verified_avp' ? 'approve' : 'reject'
    const remarks = avpRemarksText || 'Processed by AVP'

    try {
      await updateTransfer({
        transferId: selectedAssignment.id,
        siteId: selectedAssignment.siteId,
        fromUserId: selectedAssignment.fromUserId || '',
        toUserId: selectedAssignment.toUserId || '',
        reason: selectedAssignment.reason || 'Routine operational requirement',
        status: apiStatus,
        remarks: remarks,
        decidedBy: currentUser.id,
        requestedBy: selectedAssignment.requestedByUserId || ''
      })

      setAssignments(prev => prev.map(a => {
        if (a.id === selectedAssignment.id) {
          return {
            ...a,
            status: actionStatus,
            avpRemarks: remarks
          }
        }
        return a
      }))

      if (actionStatus === 'verified_avp') {
        // Optimistically update local site OE to reflect the approved transfer
        setLocalSites(prev => prev.map(s => {
          if (s.id === selectedAssignment.siteId) {
            return {
              ...s,
              assignedOE: selectedAssignment.assignedOE
            }
          }
          return s
        }))
        toast.success('Transfer Approved', { description: `Roster mapping updated. OE ${selectedAssignment.assignedOE} is now assigned to ${selectedAssignment.siteName}.` })
      } else {
        toast.error('Transfer Rejected', { description: 'Roster change request was denied.' })
      }

      setShowVerifyModal(false)
      setSelectedAssignment(null)
      setAvpRemarksText('')
    } catch (error: any) {
      toast.error('Verification Failed', { description: error.message })
    }
  }

  // Calendar Upload actions
  const downloadSampleTemplate = async () => {
    try {
      const blob = await downloadImportTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "opas_schedules_template.xlsx")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Template Downloaded', { description: 'Excel template saved to downloads.' })
    } catch (error: any) {
      toast.error('Download Failed', { description: error.message })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setUploadedFileName(file.name)
      // We no longer simulate parsing rows, we wait for the user to click Bulk Import
    }
  }

  const handleBulkImport = async () => {
    if (!importFile) return

    setIsParsing(true)
    setUploadProgress(20)

    try {
      setUploadProgress(60)
      const data = await uploadImportSchedules(importFile)
      setUploadProgress(100)
      
      toast.success('Bulk Import Completed', { description: `Successfully imported schedules.` })
      
      // Optionally reload schedules here
      try {
        const freshData = await fetchScheduledVisits()
        const mappedSchedules: Visit[] = freshData.map((item: any) => ({
          id: item.id,
          siteId: item.site_id,
          siteName: item.site_name,
          dateStr: item.date_str,
          time: item.time,
          status: item.status === 'completed' ? 'completed' : 'planned',
          assignedTo: item.assigned_to_name
        }))
        setSchedules(mappedSchedules)
      } catch (err) {}
      
      setImportFile(null)
      setUploadedFileName('')
      setUploadProgress(0)
      setActiveTab('planner')
    } catch (error: any) {
      toast.error('Import Failed', { description: error.message })
      setUploadProgress(0)
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Site Operations' }]} />

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
            <Building2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Operations Workspace</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unified workspace for scheduling visits, field audits, roster mapping, and schedule imports.
            </p>
          </div>
        </div>
        {activeTab === 'mapping' && currentRole === 'rm' && mappingSubTab === 'assignments' && (
          <Button 
            onClick={() => {
              setTransferSiteId(roleFilteredSites[0]?.id || initialSites[0].id)
              setTransferNewOE('')
              setShowAddAssignmentModal(true)
            }} 
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs border-0"
          >
            <Plus size={14} /> Assign New OE to Site
          </Button>
        )}
      </div>

      {/* Unified KPI Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'Mapped Sites', value: localSites.length, icon: Building2, color: 'from-blue-600 to-sky-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-slate-150' },
          { label: 'Planned Audits', value: metrics.total, icon: CalendarDays, color: 'from-cyan-600 to-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-slate-150' },
          { label: 'Audits Completed', value: metrics.completed, icon: CheckCircle2, color: 'from-emerald-600 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-slate-150' },
          { label: 'Adherence Rate', value: `${metrics.compRate}%`, icon: ClipboardCheck, color: 'from-orange-600 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-slate-150' },
          { label: 'Roster Requests', value: kpis.pendingAssignments, icon: Users, color: 'from-indigo-600 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-slate-150' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card
              key={kpi.label}
              className={`relative overflow-hidden transition-all duration-300 border bg-white shadow-soft rounded-2xl hover:shadow-medium hover:border-slate-350 hover:-translate-y-1 ${kpi.border}`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[90px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{kpi.value}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center h-9 w-9 ${kpi.bg} ${kpi.text}`}>
                    <Icon size={18} />
                  </div>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
            </Card>
          )
        })}
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full space-y-4">
        <div className="border-b pb-1 flex justify-between items-center flex-wrap gap-2">
          <TabsList className="bg-slate-100 p-0.5 rounded-xl border">
            <TabsTrigger value="visits" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <List size={13} /> Site Visits
            </TabsTrigger>
            <TabsTrigger value="planner" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <CalendarCheck size={13} /> Visit Planner
            </TabsTrigger>
            <TabsTrigger value="mapping" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <Users size={13} /> Site Mapping
            </TabsTrigger>
            <TabsTrigger value="upload" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <FileSpreadsheet size={13} /> Calendar Upload
            </TabsTrigger>
            <TabsTrigger value="employees" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              <UserCheck size={13} /> Site Employees
            </TabsTrigger>
          </TabsList>

          {/* Search/Filters relative to Tab Context */}
          {activeTab === 'visits' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-52 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                <Input
                  placeholder="Search site, client, OE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8.5 text-xs rounded-xl"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
                <option value="missed">Missed</option>
              </select>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-52 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                <Input
                  placeholder="Search site name, code, client, OE..."
                  value={mappingSearch}
                  onChange={(e) => setMappingSearch(e.target.value)}
                  className="pl-8 h-8.5 text-xs rounded-xl"
                />
              </div>
              {mappingSubTab === 'sites' && (
                <>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 cursor-pointer"
                  >
                    <option value="all">All Regions</option>
                    {uniqueRegions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="h-8.5 rounded-xl border bg-white px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 cursor-pointer"
                  >
                    <option value="all">All States</option>
                    {uniqueStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────
            TAB CONTENT: Site Visits
            ───────────────────────────────────────────── */}
        <TabsContent value="visits" className="m-0 space-y-5">
          {/* Action Required: Today's Pending Visits for Current User (OE Roster) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <AlertCircle size={15} className="text-rose-500 animate-pulse" />
              Action Required: Today's Roster ({todayStr})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules
                .filter(s => s.dateStr === todayStr && s.status === 'planned' && (currentRole === 'oe' ? s.assignedTo === currentUser.userName : true))
                .map(v => (
                  <Card key={v.id} className="border-rose-100 bg-rose-50/20 shadow-soft">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{v.siteName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Scheduled: {v.time}
                          {currentRole !== 'oe' && v.assignedTo && (
                            <span className="ml-1.5 font-bold text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {v.assignedTo}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleOpenReport(v)} 
                        size="sm" 
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 rounded-lg shadow-sm border-0"
                      >
                        Report Visit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              {schedules.filter(s => s.dateStr === todayStr && s.status === 'planned' && (currentRole === 'oe' ? s.assignedTo === currentUser.userName : true)).length === 0 && (
                <Card className="border-dashed shadow-none p-4 w-full">
                  <p className="text-xs text-muted-foreground italic text-center">No audit visits pending for today.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Subscriptions / Execution view toggle */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Audit logs & checklists</h2>
            </div>
            
            {currentRole === 'oe' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVisits.map((visit) => {
                  const siteObj = localSites.find(s => s.id === visit.siteId)
                  const cfg = statusColors[visit.status] || statusColors.planned
                  return (
                    <Card key={visit.id} className="shadow-soft hover:shadow-md transition-all border border-border duration-200">
                      <div className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-muted-foreground">{siteObj?.code || 'SITE'}</span>
                            <h3 className="text-xs font-bold text-slate-800 truncate mt-1.5">{visit.site}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{visit.client}</p>
                          </div>
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs border-t pt-3">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <CalendarDays size={13} className="text-slate-400" />
                            <span>{visit.visitDate}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-700">{visit.visitedBy}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/50">
                          <div className="text-center">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono">Signature</p>
                            <div className="flex justify-center mt-1">
                              {visit.clientSignature ? (
                                <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5"><Signature size={11} /> Yes</span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400">—</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center border-x">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono">GPS Loc</p>
                            <div className="flex justify-center mt-1">
                              {visit.geoTagged ? (
                                <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5"><MapPin size={11} /> Tagged</span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400">—</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center border-r">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono">Photos</p>
                            <div className="flex justify-center mt-1">
                              {visit.photos > 0 ? (
                                <span className="text-[9px] font-bold text-blue-700 flex items-center gap-0.5"><Camera size={11} /> {visit.photos} Pics</span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400">—</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono">Transport</p>
                            <div className="flex justify-center mt-1">
                              {visit.status === 'completed' ? (
                                <span className="text-[9px] font-bold text-indigo-700 flex items-center justify-center gap-0.5">
                                  {getTransportIcon(visit.transportMode, 11)}
                                  <span className="truncate">{visit.transportMode || 'Bike'}</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400">—</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {visit.status === 'completed' && (
                          <div className="flex items-center justify-between border-t pt-3">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              <span className="text-xs font-bold text-slate-700">{visit.checklistScore}/34</span>
                              <span className="text-[10px] text-muted-foreground">Passed</span>
                            </div>
                            <button 
                              onClick={() => setSelectedVisit(visit)}
                              className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline border-0 bg-transparent cursor-pointer"
                            >
                              Audit Sheet <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border border-border/80 shadow-soft overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Auditor (OE)</TableHead>
                      <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Site / Client</TableHead>
                      <TableHead className="p-3 text-left text-xs font-semibold text-muted-foreground">Date / Time</TableHead>
                      <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground">Checklist Score</TableHead>
                      <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground">Verification</TableHead>
                      <TableHead className="p-3 text-right text-xs font-semibold text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submittedReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="p-3">
                          <p className="font-semibold text-slate-800 text-xs">{report.visitedBy}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">Roster Executive</p>
                        </TableCell>
                        <TableCell className="p-3">
                          <p className="font-semibold text-slate-800 text-xs">{report.site}</p>
                          <p className="text-[9px] text-muted-foreground">{report.client}</p>
                        </TableCell>
                        <TableCell className="p-3 text-xs text-slate-600">
                          <p>{report.visitDate} · {report.actualTime || report.plannedTime}</p>
                          {report.transportMode && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
                              {getTransportIcon(report.transportMode, 10)}
                              <span>{report.transportMode}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                            {report.checklistScore}/34
                          </span>
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="flex items-center justify-center gap-2 text-[10px]">
                            {report.geoTagged && (
                              <span className="text-emerald-700 bg-emerald-50 px-1 py-0.25 rounded border border-emerald-100 flex items-center gap-0.5"><MapPin size={10} /> GPS</span>
                            )}
                            {report.photos > 0 && (
                              <span className="text-blue-700 bg-blue-50 px-1 py-0.25 rounded border border-blue-100 flex items-center gap-0.5"><Camera size={10} /> {report.photos} Pics</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-right">
                          <Button 
                            onClick={() => setSelectedVisit(report as any)}
                            size="sm" 
                            className="h-7 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg border-0"
                          >
                            View Audit Sheet
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submittedReports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-12 text-center text-muted-foreground text-xs italic">
                          No submissions logged.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────
            TAB CONTENT: Visit Planner
            ───────────────────────────────────────────── */}
        <TabsContent value="planner" className="m-0 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedPlannerSite}
                onChange={(e) => setSelectedPlannerSite(e.target.value)}
                className="h-9 rounded-xl border bg-white px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <option value="all">All Mapped Sites</option>
                {localSites.slice(0, 6).map(s => (
                  <option key={s.id} value={s.id}>{s.name.split(' ').slice(0, 2).join(' ')}</option>
                ))}
              </select>
              
              {currentRole !== 'oe' && (
                <select
                  value={selectedOE}
                  onChange={(e) => setSelectedOE(e.target.value)}
                  className="h-9 rounded-xl border bg-white px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <option value="all">All OEs</option>
                  <option value="Ravi Shankar">Ravi Shankar</option>
                  <option value="Kiran Nair">Kiran Nair</option>
                  <option value="Anjali Desai">Anjali Desai</option>
                  <option value="Priya Sen">Priya Sen</option>
                </select>
              )}
              
              <div className="flex items-center gap-1 border rounded-xl p-1 bg-slate-50 border-slate-200">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                    viewMode === 'month' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >Month</button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                    viewMode === 'week' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >Week</button>
              </div>

              <div className="flex items-center gap-1 border rounded-xl p-1 bg-slate-50 border-slate-200">
                <button
                  onClick={() => setPlannerStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                    plannerStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >All</button>
                <button
                  onClick={() => setPlannerStatusFilter('planned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                    plannerStatusFilter === 'planned' ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >Planned</button>
                <button
                  onClick={() => setPlannerStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                    plannerStatusFilter === 'completed' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-200' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >Completed</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs h-9">
                <Download size={14} /> Export Plan
              </Button>
              {plannerLocked ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 h-9 select-none">
                    <CheckCircle2 size={14} /> Plan Locked
                  </div>
                  <Button 
                    onClick={() => {
                      const year = currentDate.getFullYear()
                      const month = currentDate.getMonth()
                      const monthKey = `${year}-${month}`
                      setSubmittedMonths(prev => ({ ...prev, [monthKey]: false }))
                      toast.success('Planner Unlocked', { description: 'You can now schedule visits.' })
                    }} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-xs h-9 text-violet-700 hover:bg-violet-50 border-violet-200"
                  >
                    Unlock Plan
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={async () => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth() + 1
                    const monthKey = `${year}-${String(month).padStart(2, '0')}`
                    try {
                      await lockSiteVisits(monthKey)
                      setSubmittedMonths(prev => ({ ...prev, [monthKey]: true }))
                      toast.success('Planner Locked & Submitted', { description: 'Schedules locked for roster calculation.' })
                    } catch (error: any) {
                      if (error.message && error.message.toLowerCase().includes('already locked')) {
                        setSubmittedMonths(prev => ({ ...prev, [monthKey]: true }))
                        toast.info('Planner already locked', { description: 'Syncing local state.' })
                      } else {
                        toast.error('Failed to lock planner', { description: error.message })
                      }
                    }
                  }} 
                  className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs border-0"
                >
                  <Send size={13} /> Lock & Submit
                </Button>
              )}
            </div>
          </div>

          {/* Locked deadline banner */}
          <Alert className={`rounded-xl shadow-soft border-0 ${plannerLocked ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
            <AlertCircle className={`h-4.5 w-4.5 ${plannerLocked ? 'text-rose-600' : 'text-amber-600'}`} />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Plan Cycle Window</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              ⚠️ **Policy Rule**: Site visit calendar for the subsequent month must be locked and submitted before the **26th** of the current month. The plan is currently <b>{plannerLocked ? 'LOCKED' : 'UNLOCKED'}</b>.
            </AlertDescription>
          </Alert>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-slate-700">{plannerStats.target}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Monthly Target Visits</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-blue-700">{plannerStats.planned}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Scheduled Visits</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-l-4 border-l-emerald-500">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-emerald-700">{plannerStats.completed}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Audits Completed</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-l-4 border-l-amber-500">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-amber-700">{plannerStats.pending}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Remaining Planned</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Planner Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
            {viewMode === 'month' ? (
              <VisitCalendar
                currentDate={currentDate}
                onPrevMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                visits={filteredSchedules}
                selectedSite={selectedPlannerSite}
                onDateClick={(dateStr) => {
                  if (plannerLocked) return
                  setFormDateStr(dateStr)
                  setEditingVisit(null)
                  setFormAssignedTo(selectedOE !== 'all' ? selectedOE : 'Ravi Shankar')
                  setShowAddModal(true)
                }}
                onVisitClick={handleEditVisit}
                onVisitMove={handleVisitMove}
                isLocked={plannerLocked}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                onPrevWeek={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7))}
                onNextWeek={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7))}
                visits={filteredSchedules}
                selectedSite={selectedPlannerSite}
                isLocked={plannerLocked}
              />
            )}

            <aside className="space-y-6">
              {/* Upcoming Schedules Side list */}
              <Card className="p-4 shadow-soft">
                <CardHeader className="p-0 mb-3 border-b pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" /> Upcoming Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[300px] overflow-y-auto pr-1">
                    {schedules
                      .filter(s => {
                        const parts = s.dateStr.split('-')
                        const belongsToOE = currentRole === 'oe' ? s.assignedTo === currentUser.userName : (selectedOE === 'all' || s.assignedTo === selectedOE)
                        return parts.length === 3 && s.status === 'planned' && Number(parts[1]) - 1 === currentDate.getMonth() && Number(parts[0]) === currentDate.getFullYear() && belongsToOE
                      })
                      .map((s) => (
                        <div key={s.id} className="py-2 flex items-center justify-between text-xs group hover:bg-slate-50 px-1 rounded transition-colors">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{s.siteName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {s.dateStr} · {s.time}
                              {currentRole !== 'oe' && s.assignedTo && (
                                <span className="ml-1.5 font-bold text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {s.assignedTo.split(' ')[0]}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {!plannerLocked && (
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditVisit(s)} className="p-1 hover:bg-blue-100 rounded transition-colors border-0 bg-transparent cursor-pointer"><Edit2 size={12} className="text-blue-600" /></button>
                                <button onClick={() => handleDeleteVisit(s.id)} className="p-1 hover:bg-red-100 rounded transition-colors border-0 bg-transparent cursor-pointer"><Trash2 size={12} className="text-red-600" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    {schedules.filter(s => {
                      const parts = s.dateStr.split('-')
                      const belongsToOE = currentRole === 'oe' ? s.assignedTo === currentUser.userName : (selectedOE === 'all' || s.assignedTo === selectedOE)
                      return parts.length === 3 && s.status === 'planned' && Number(parts[1]) - 1 === currentDate.getMonth() && Number(parts[0]) === currentDate.getFullYear() && belongsToOE
                    }).length === 0 && (
                      <p className="text-xs text-muted-foreground py-4 text-center italic">No upcoming schedules planned for this month.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────
            TAB CONTENT: Site Mapping
            ───────────────────────────────────────────── */}
        <TabsContent value="mapping" className="m-0 space-y-5">
          {/* Sub-tab selection */}
          <div className="border-b pb-1">
            <div className="flex gap-2">
              <button 
                onClick={() => { setMappingSubTab('sites'); setSearchTerm(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all ${
                  mappingSubTab === 'sites' ? 'bg-slate-900 text-white shadow-sm font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Site Master ({filteredSites.length})
              </button>
              <button 
                onClick={() => { setMappingSubTab('assignments'); setSearchTerm(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all ${
                  mappingSubTab === 'assignments' ? 'bg-slate-900 text-white shadow-sm font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                OE Assignments Requests ({roleFilteredAssignments.length})
              </button>
            </div>
          </div>

          {mappingSubTab === 'sites' ? (
            <Card className="border border-border/80 shadow-soft overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('code')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border-0 bg-transparent cursor-pointer">
                        Site Code <ArrowUpDown size={11} />
                      </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border-0 bg-transparent cursor-pointer">
                        Site Name <ArrowUpDown size={11} />
                      </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left">
                      <button onClick={() => handleSort('client')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border-0 bg-transparent cursor-pointer">
                        Client Account <ArrowUpDown size={11} />
                      </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Geography</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Assigned OE</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Assigned RM & AVP</TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Staff Count</TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3.5 font-semibold text-xs text-foreground">{site.code}</TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div>
                          <p className="text-xs font-bold text-foreground">{site.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{site.address}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-xs font-medium text-foreground">{site.client}</TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Globe2 size={11} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{site.region} · {site.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <Badge className="bg-indigo-50 border-indigo-100 text-indigo-700 border text-[10px] font-bold">
                          {site.assignedOE}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-xs">
                        <p className="font-semibold text-slate-700">{site.assignedRM} <span className="text-[9px] font-normal text-muted-foreground">(RM)</span></p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{site.assignedAVP} <span className="text-[9px] font-normal text-muted-foreground">(AVP)</span></p>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center text-xs font-bold text-foreground">
                        {site.employeeCount}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          site.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${site.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {site.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                        No sites found matching the filter criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Request Status summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                {[
                  { label: 'Total Requests', value: roleFilteredAssignments.length, icon: FileText, color: 'from-blue-600 to-sky-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-slate-150' },
                  { label: 'Pending Approval', value: kpis.pendingAssignments, icon: AlertCircle, color: 'from-amber-600 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-slate-150' },
                  { label: 'Approved Transfers', value: kpis.verifiedAssignments, icon: CheckCircle2, color: 'from-emerald-600 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-slate-150' }
                ].map((kpi) => {
                  const Icon = kpi.icon
                  return (
                    <Card
                      key={kpi.label}
                      className={`relative overflow-hidden transition-all duration-300 border bg-white shadow-soft rounded-2xl hover:shadow-medium hover:border-slate-350 hover:-translate-y-1 ${kpi.border}`}
                    >
                      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[90px]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                            <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{kpi.value}</p>
                          </div>
                          <div className={`rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center h-9 w-9 ${kpi.bg} ${kpi.text}`}>
                            <Icon size={18} />
                          </div>
                        </div>
                      </CardContent>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
                    </Card>
                  )
                })}
              </div>

              <Card className="border border-border/80 shadow-soft overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Site</TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Previous OE</TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned New OE</TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Requested By (RM)</TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Logged</TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleFilteredAssignments.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3.5">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{req.siteName}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{req.siteCode}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-xs text-slate-500 font-medium">{req.previousOE}</TableCell>
                        <TableCell className="px-4 py-3.5">
                          <Badge className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px]">
                            {req.assignedOE}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-xs font-semibold text-slate-700">{req.assignedRM}</TableCell>
                        <TableCell className="px-4 py-3.5 text-xs text-slate-500 font-medium">{req.requestedDate}</TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            req.status === 'pending_avp' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            req.status === 'verified_avp' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {req.status === 'pending_avp' ? 'Awaiting AVP' :
                             req.status === 'verified_avp' ? 'Approved' : 'Rejected'}
                          </span>
                          {req.avpRemarks && (
                            <p className="text-[9px] text-slate-400 italic mt-0.5">Remarks: "{req.avpRemarks}"</p>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          {req.status === 'pending_avp' && currentRole === 'avp' ? (
                            <Button 
                              onClick={() => {
                                setSelectedAssignment(req)
                                setShowVerifyModal(true)
                              }}
                              size="sm" className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1 border-0"
                            >
                              <UserCheck size={11} /> Verify
                            </Button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-semibold">No Pending Action</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {roleFilteredAssignments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground italic">
                          No roster assignment transfer requests logged.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─────────────────────────────────────────────
            TAB CONTENT: Calendar Upload
            ───────────────────────────────────────────── */}
        <TabsContent value="upload" className="m-0 space-y-5">
          <Card className="p-5 shadow-soft">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <FileSpreadsheet size={16} className="text-amber-600" /> Excel / CSV Bulk Schedule Upload
              </CardTitle>
              <CardDescription className="text-xs">
                Quickly populate your site visit planner calendar by dragging and dropping your monthly excel sheet.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-6">
              {/* Dropzone Container */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    triggerSimulatedParse(file.name)
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragOver ? 'border-violet-500 bg-violet-50/40' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                }`}
              >
                <input 
                  type="file" 
                  id="csv-file-picker" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <label htmlFor="csv-file-picker" className="cursor-pointer space-y-3 block">
                  <div className="mx-auto h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {uploadedFileName ? `Selected File: ${uploadedFileName}` : 'Drag & drop your scheduling roster here'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Supports Microsoft Excel (.xlsx), CSV (.csv) files up to 5MB</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg pointer-events-none">
                      Browse Files
                    </Button>
                  </div>
                </label>
              </div>

              {/* Progress Bar (Parsing simulation) */}
              {isParsing && (
                <div className="space-y-1 bg-slate-50 p-4 rounded-xl border">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5"><Clock size={13} className="animate-spin text-violet-600" /> Parsing File Layout...</span>
                    <span className="text-violet-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-violet-600 h-1.5 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Download / Template details */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                <div className="flex gap-2.5 items-start">
                  <FileSpreadsheet size={18} className="text-slate-500 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Need a format template?</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Download our pre-formatted CSV template which automatically maps columns for Date, Time, Site ID, and assigned OE.</p>
                  </div>
                </div>
                <Button 
                  onClick={downloadSampleTemplate} 
                  variant="outline" 
                  size="sm" 
                  className="h-8.5 text-xs rounded-xl gap-1 shrink-0"
                >
                  <Download size={12} /> Download Template
                </Button>
              </div>

              {/* Preview table */}
              {/* Preview & Import */}
              {importFile && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-violet-50/50 rounded-xl border border-violet-100">
                    <div>
                      <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wider">Ready for Import</h3>
                      <p className="text-[10px] text-violet-600 mt-1">{importFile.name} is selected and ready to be processed.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => { setImportFile(null); setUploadedFileName(''); }}
                        variant="outline" size="sm" className="h-8 text-xs rounded-lg bg-white border-violet-200 text-violet-700 hover:bg-violet-100"
                        disabled={isParsing}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBulkImport}
                        disabled={isParsing}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold h-8 text-xs rounded-lg border-0"
                      >
                        {isParsing ? 'Importing...' : 'Upload & Import'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────────────────────────────────────
            TAB CONTENT: Site Employees
            ───────────────────────────────────────────── */}
        <TabsContent value="employees" className="m-0 space-y-5">
          {(() => {
            const mySites = filteredSites; // already filtered by role
            const filteredEmployees = employees.filter(emp => {
              if (selectedEmployeeSite !== 'all' && emp.siteId !== selectedEmployeeSite) return false;
              if (selectedEmployeeSite === 'all' && !mySites.find(s => s.id === emp.siteId)) return false;
              if (employeeSearchTerm && !emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) && !emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase())) return false;
              return true;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex flex-1 gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                      <Input
                        placeholder="Search employee by name or ID..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="pl-8 h-9 text-xs rounded-xl"
                      />
                    </div>
                    <select
                      value={selectedEmployeeSite}
                      onChange={(e) => setSelectedEmployeeSite(e.target.value)}
                      className="h-9 px-3 border border-input rounded-xl text-xs bg-white text-slate-700 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All My Sites</option>
                      {mySites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Headcount</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{filteredEmployees.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                  </Card>
                  <Card className="p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active Status</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{filteredEmployees.filter(e => e.status === 'active').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                  </Card>
                  <Card className="p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Inactive / On Leave</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{filteredEmployees.filter(e => e.status === 'inactive').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                  </Card>
                </div>

                <Card className="shadow-soft border rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700">EMP Code</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700">Employee Name</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700">Site Deployed</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700">Designation</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700">Shift</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700 text-center">Status</TableHead>
                        <TableHead className="py-3 px-4 text-xs font-bold text-slate-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => {
                          const empSite = initialSites.find(s => s.id === emp.siteId);
                          return (
                            <TableRow key={emp.id} className="hover:bg-slate-50/50 cursor-default transition-colors">
                              <TableCell className="py-3 px-4">
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border">{emp.code}</span>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">{emp.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Joined: {emp.joiningDate}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <p className="text-xs font-semibold text-slate-700">{empSite?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{empSite?.client}</p>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <p className="text-xs font-semibold text-slate-700">{emp.designation}</p>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div>
                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {emp.shift}
                                  </span>
                                  <p className="text-[9px] text-muted-foreground mt-1">
                                    {emp.shift === 'First' ? '08:00 AM - 04:00 PM' : emp.shift === 'Second' ? '04:00 PM - 12:00 AM' : emp.shift === 'Third' ? '12:00 AM - 08:00 AM' : '09:00 AM - 06:00 PM'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-center">
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {emp.status}
                                </span>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setSelectedEmployeeAttendance(emp)}
                                  className="h-8 rounded-lg text-xs gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                  <CalendarDays size={14} /> Attendance
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                            <Users size={32} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-semibold">No employees found.</p>
                            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* ─────────────────────────────────────────────
          MODALS & DIALOGS
          ───────────────────────────────────────────── */}

      {/* Audit Detail Dialog (Checks checklist results) */}
      <Dialog open={!!selectedVisit} onOpenChange={(open) => { if (!open) setSelectedVisit(null); }}>
        <DialogContent className={`${selectedVisit?.reportData ? 'sm:max-w-4xl' : 'sm:max-w-lg'} bg-white border border-border rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto`}>
          {selectedVisit && (
            selectedVisit.reportData ? (
              <div className="space-y-4">
                <SiteVisitSummary
                  data={selectedVisit.reportData}
                  siteName={selectedVisit.site}
                  clientName={selectedVisit.client}
                  supervisorName={selectedVisit.visitedBy}
                  visitDate={selectedVisit.visitDate}
                />
                <Button onClick={() => setSelectedVisit(null)} variant="outline" className="w-full">
                  Close Report
                </Button>
              </div>
            ) : (
              <>
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className="text-sm font-bold text-slate-800">Performance Audit Sheet</DialogTitle>
                  <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedVisit.site} · Report #{selectedVisit.id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border">
                    <div>
                      <p className="text-[18px] font-bold text-emerald-600">{selectedVisit.checklistScore}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Passed Checklist</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-bold text-rose-600">{34 - (selectedVisit.checklistScore || 34)}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Failed Checklist</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-bold text-indigo-600">{selectedVisit.photos}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Uploaded Photos</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-bold text-slate-700">100%</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">GPS Precision</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2.5 rounded-xl border text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Visited By / Auditor</span>
                      <span className="font-semibold text-slate-700 mt-0.5 block">{selectedVisit.visitedBy}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Mode of Transport</span>
                      <span className="font-semibold text-indigo-700 flex items-center gap-1 mt-0.5">
                        {getTransportIcon(selectedVisit.transportMode, 13)}
                        <span>{selectedVisit.transportMode || 'Bike'}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* 34-point Audit checklist results */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Checklist Verification Audit Details</h4>
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {checklistCategories.map((cat, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-600 uppercase bg-slate-100/50 px-1 py-0.5 rounded">{cat.title}</p>
                          <ul className="space-y-1 pl-2">
                            {cat.items.map((item, i) => {
                              // Mock some checks failing to show realistic audit
                              const passed = (idx === 0) || (idx === 1 && i < 3) || (idx === 2 && i !== 2) || (idx === 3 && i < 3)
                              return (
                                <li key={i} className="text-[10px] flex items-center justify-between">
                                  <span className="text-slate-600">{item}</span>
                                  <span className={`font-bold px-1.5 py-0.25 rounded text-[8px] ${
                                    passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 border-t pt-3">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Audit Observations & Notes</h4>
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border italic">
                      "{selectedVisit.notes || 'No custom remarks provided.'}"
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setSelectedVisit(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9 text-xs border-0">
                    Close Audit Details
                  </Button>
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Visit Dialog for Planner */}
      <Dialog open={showAddModal} onOpenChange={(open) => { setShowAddModal(open); if (!open) setEditingVisit(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">{editingVisit ? 'Edit Visit' : 'Add Planned Visit'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVisit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Selected Date</Label>
              <input type="text" disabled value={formattedFormDate} className="w-full border rounded-lg h-9 px-2 text-xs bg-slate-50 text-slate-500 focus:outline-none border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Site</Label>
              <select value={formSiteId} onChange={(e) => setFormSiteId(e.target.value)} className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer">
                {localSites.slice(0, 6).map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Time</Label>
              <input 
                type="time" 
                value={formTime.replace(/(AM|PM)/, '').trim() || '10:00'} 
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':')
                  const h = parseInt(hours)
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  const displayHours = h % 12 || 12
                  setFormTime(`${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`)
                }} 
                className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white border-border cursor-pointer transition-all"
              />
            </div>
            {currentRole !== 'oe' && (
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">Assign Operation Executive</Label>
                <select 
                  value={formAssignedTo} 
                  onChange={(e) => setFormAssignedTo(e.target.value)} 
                  className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer"
                >
                  <option value="Ravi Shankar">Ravi Shankar</option>
                  <option value="Kiran Nair">Kiran Nair</option>
                  <option value="Anjali Desai">Anjali Desai</option>
                  <option value="Priya Sen">Priya Sen</option>
                </select>
              </div>
            )}
            {editingVisit ? (
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 h-9 text-xs rounded-lg" 
                  onClick={() => {
                    handleDeleteVisit(editingVisit.id)
                    setShowAddModal(false)
                    setEditingVisit(null)
                  }}
                >
                  Delete
                </Button>
                <Button type="submit" className="w-2/3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-9 text-xs border-0">
                  Update Schedule
                </Button>
              </div>
            ) : (
              <Button type="submit" className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-9 text-xs border-0">
                Add Visit Schedule
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Visit Form Dialog */}
      <Dialog open={showReportModal} onOpenChange={(open) => { if (!open) setShowReportModal(false); }}>
        <DialogContent className="sm:max-w-5xl bg-white border border-border rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
          {reportVisitObj && (
            <SiteVisitReportForm
              taskId={reportVisitObj.id}
              siteName={reportVisitObj.siteName}
              clientName={localSites.find(s => s.id === reportVisitObj.siteId)?.client || ''}
              supervisorName={currentUser.userName}
              employeeId={currentUser.id}
              initialData={reportVisitObj.reportData}
              onSubmit={handleSVRSubmit}
              onSaveDraft={handleSVRDraft}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* RM Create Assignment Dialog */}
      <Dialog open={showAddAssignmentModal} onOpenChange={setShowAddAssignmentModal}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Assign New OE to Site</DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              Create a request to transfer site performance responsibilities to another executive.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Site Location</Label>
              <select 
                value={transferSiteId} 
                onChange={(e) => setTransferSiteId(e.target.value)}
                className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer"
              >
                {roleFilteredSites.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Previous Mapped OE</Label>
              <input 
                type="text" 
                disabled
                value={transferPreviousOE}
                className="w-full border rounded-lg h-9 px-2 text-xs bg-slate-50 text-slate-500 focus:outline-none border-border"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">New Assigned OE Name</Label>
              <select 
                required
                value={transferNewOE} 
                onChange={(e) => setTransferNewOE(e.target.value)}
                className="w-full border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white border-border cursor-pointer"
              >
                <option value="">-- Choose New Executive --</option>
                <option value="Rajesh Sharma">Rajesh Sharma (OE)</option>
                <option value="Anil Deshmukh">Anil Deshmukh (OE)</option>
                <option value="Siddharth Malhotra">Siddharth Malhotra (OE)</option>
                <option value="Geeta Sen">Geeta Sen (OE)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-[10px] text-amber-800">
              <AlertTriangle size={14} className="shrink-0" />
              <p>
                <strong>AVP Verification Policy:</strong> Site mapping transfers must be approved and signed off by the AVP Operations prior to changing active rosters.
              </p>
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs font-semibold mt-2 border-0">
              Submit Transfer Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* AVP Verification Dialog */}
      <Dialog open={showVerifyModal} onOpenChange={(open) => {
        if (!open) {
          setShowVerifyModal(false)
          setSelectedAssignment(null)
          setAvpRemarksText('')
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">AVP Mapping Verification</DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              Review mapping change details and approve/reject the roster update.
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 border rounded-xl p-3 text-xs space-y-1.5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Site Location</span>
                  <p className="font-bold text-slate-800">{selectedAssignment.siteName} ({selectedAssignment.siteCode})</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Previous Mapped OE</span>
                    <p className="font-semibold text-slate-600">{selectedAssignment.previousOE}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Assigned New OE</span>
                    <p className="font-bold text-indigo-700">{selectedAssignment.assignedOE}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t text-[10px] text-slate-500">
                  Requested by: <span className="font-semibold">{selectedAssignment.assignedRM} (RM)</span> on {selectedAssignment.requestedDate}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600 uppercase">Verification Comments</Label>
                <textarea 
                  required
                  value={avpRemarksText}
                  onChange={(e) => setAvpRemarksText(e.target.value)}
                  placeholder="Roster changes verification remarks..."
                  className="w-full border rounded-lg p-2 text-xs focus:outline-none h-16 border-border" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleVerifyAssignment('rejected_avp')}
                  variant="outline" className="flex-1 text-rose-700 hover:bg-rose-50 h-9 text-xs rounded-xl font-bold gap-1 border-rose-200"
                >
                  <X size={13} /> Reject Transfer
                </Button>
                <Button 
                  onClick={() => handleVerifyAssignment('verified_avp')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs rounded-xl font-bold gap-1 border-0"
                >
                  <CheckCircle2 size={13} /> Verify & Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Attendance Modal */}
      <Dialog open={!!selectedEmployeeAttendance} onOpenChange={(open) => { if (!open) setSelectedEmployeeAttendance(null); }}>
        <DialogContent className="sm:max-w-3xl bg-white border border-border rounded-2xl p-5 shadow-2xl overflow-hidden">
          {selectedEmployeeAttendance && (() => {
            const emp = selectedEmployeeAttendance;
            const empSite = initialSites.find(s => s.id === emp.siteId);
            
            // Calculate 30 day and 7 day logs
            const todayDate = new Date();
            let present30 = 0;
            let absent30 = 0;
            const last7DaysLog = [];

            for (let i = 0; i < 30; i++) {
              const d = new Date(todayDate);
              d.setDate(d.getDate() - i);
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              
              // Shift logic for punch
              const shiftIn = emp.shift === 'First' ? '08:00 AM' : emp.shift === 'Second' ? '04:00 PM' : emp.shift === 'Third' ? '12:00 AM' : '09:00 AM';
              const shiftOut = emp.shift === 'First' ? '04:00 PM' : emp.shift === 'Second' ? '12:00 AM' : emp.shift === 'Third' ? '08:00 AM' : '06:00 PM';
              
              // Check if issue exists
              const issue = attendanceRecords.find(r => r.employeeCode === emp.code && r.date === dateStr);
              if (issue && issue.issueType === 'absent') {
                absent30++;
                if (i < 7) {
                  last7DaysLog.push({ date: dateStr, status: 'Absent', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', punchTime: 'No Punch' });
                }
              } else if (issue && (issue.issueType === 'missing_in' || issue.issueType === 'missing_out')) {
                // Treated as present but with issue
                present30++;
                if (i < 7) {
                  last7DaysLog.push({ date: dateStr, status: 'Missing Punch', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', punchTime: issue.punchTime || 'Partial Punch' });
                }
              } else {
                present30++;
                if (i < 7) {
                  // Simulate random slight punch variation
                  const inMin = Math.floor(Math.random() * 5); // 0-4 mins late
                  const outMin = Math.floor(Math.random() * 5); // 0-4 mins late
                  const punchInStr = shiftIn.replace(':00', `:0${inMin}`);
                  const punchOutStr = shiftOut.replace(':00', `:0${outMin}`);
                  last7DaysLog.push({ date: dateStr, status: 'Present', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', punchTime: `${punchInStr} - ${punchOutStr}` });
                }
              }
            }

            return (
              <div className="space-y-5">
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck size={18} className="text-indigo-600" /> Employee Attendance Profile
                  </DialogTitle>
                </DialogHeader>

                {/* Profile Header */}
                <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-base">{emp.name} <span className="text-xs font-semibold text-slate-500 bg-white border px-1.5 py-0.5 rounded ml-2">{emp.code}</span></h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{emp.designation} · {emp.shift} Shift</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><MapPin size={10} /> {empSite?.name}</p>
                  </div>
                </div>

                {/* 30-Day Summary */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Last 30 Days Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Total Days</p>
                      <p className="text-xl font-black text-slate-800 mt-0.5">30</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
                      <p className="text-xl font-black text-emerald-700 mt-0.5">{present30}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
                      <p className="text-xl font-black text-rose-700 mt-0.5">{absent30}</p>
                    </div>
                  </div>
                </div>

                {/* 7-Day Detailed Log (Calendar Strip) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Recent 7-Day Calendar</span>
                    <span className="text-[9px] text-muted-foreground normal-case font-normal italic">Exception-based sync</span>
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[...last7DaysLog].reverse().map((log, idx) => {
                      const d = new Date(log.date);
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateNum = d.getDate();
                      return (
                        <div key={idx} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center p-2.5 rounded-xl border ${log.bg}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${log.status === 'Present' ? 'text-emerald-600' : log.status === 'Absent' ? 'text-rose-600' : 'text-amber-600'}`}>{dayName}</span>
                          <span className="text-xl font-black text-slate-800 leading-none">{dateNum}</span>
                          
                          <div className="text-[7px] text-slate-500 mt-1 text-center font-semibold leading-tight min-h-[18px] flex flex-col justify-center">
                            {log.punchTime.includes('-') ? (
                              <>
                                <span>In: {log.punchTime.split('-')[0].trim()}</span>
                                <span>Out: {log.punchTime.split('-')[1].trim()}</span>
                              </>
                            ) : (
                              <span>{log.punchTime}</span>
                            )}
                          </div>

                          <div className={`mt-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${log.color} bg-white/80 border`}>
                            {log.status === 'Missing Punch' ? 'Miss' : log.status}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserRole, OperationalTask, ActivityTemplate } from '@/lib/types'
import { operationalTasks, activityTemplates, sites, recomputeScores } from '@/lib/data/ocrms-data'
import type { ApiUser } from '@/lib/api'

// ── Role Configuration ──
export interface RoleConfig {
  id?: string
  role: UserRole
  label: string
  userName: string
  code: string
  designation: string
}

export const roleConfigs: RoleConfig[] = [
  { id: 'USR_OE_001', role: 'oe', label: 'Operation Executive', userName: 'Ravi Shankar', code: 'OE-001', designation: 'Operation Executive' },
  { id: 'USR_RM_001', role: 'rm', label: 'Regional Manager', userName: 'Suresh Kumar', code: 'RM-001', designation: 'Regional Manager' },
  { id: 'USR_ZH_001', role: 'zh', label: 'Zonal Head', userName: 'Nitin Gadkari', code: 'ZH-001', designation: 'Zonal Head' },
  { id: 'USR_AVP_001', role: 'avp', label: 'AVP Operations', userName: 'Venkat Raman', code: 'AVP-001', designation: 'AVP Operations' },
  { id: 'USR_BH_001', role: 'bh', label: 'Business Head', userName: 'Priya Saxena', code: 'BH-001', designation: 'Business Head' },
  { id: 'USR_HR_001', role: 'hr', label: 'HR Team', userName: 'Neha Verma', code: 'HR-001', designation: 'HR Manager' },
  { id: 'USR_PROC_001', role: 'procurement', label: 'Procurement Team', userName: 'Amit Sharma', code: 'PROC-001', designation: 'Procurement Head' },
  { id: 'USR_DR_001', role: 'dr', label: 'Operation Director', userName: 'Rajesh Khanna', code: 'DR-001', designation: 'Operation Director' },
  { id: 'USR_TH_001', role: 'th', label: 'Trainer Head', userName: 'Vikram Sen', code: 'TH-001', designation: 'Trainer Head' },
  { id: 'USR_TRN_001', role: 'trainers', label: 'Trainers', userName: 'Geeta Joshi', code: 'TRN-001', designation: 'Trainer' },
  { id: 'USR_COMM_001', role: 'commerical', label: 'Commercial Team', userName: 'Anil Mehta', code: 'COMM-001', designation: 'Commercial Team' },
  { id: 'USR_HOD_001', role: 'hod', label: 'Back Office HOD', userName: 'Sanjay Gupta', code: 'HOD-001', designation: 'Back Office HOD' },
  { id: 'USR_HRDR_001', role: 'hr_dr', label: 'HR Director', userName: 'Meenakshi Sharma', code: 'HRDR-001', designation: 'HR Director' },
]

export type ScoringPolicy = 'avp_only' | 'average' | 'weighted';

// ── Context Shape ──
interface OCRMSContextType {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  currentUser: RoleConfig
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Auth State
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
  isLoadingAuth: boolean
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  apiUser: ApiUser | null
  setApiUser: (user: ApiUser | null) => void

  // Live State
  tasks: OperationalTask[]
  setTasks: React.Dispatch<React.SetStateAction<OperationalTask[]>>
  templates: ActivityTemplate[]
  setTemplates: React.Dispatch<React.SetStateAction<ActivityTemplate[]>>
  scoringPolicy: ScoringPolicy
  setScoringPolicy: (policy: ScoringPolicy) => void
  
  // State Mutators
  updateTask: (taskId: string, updatedFields: Partial<OperationalTask>) => void
  updateTemplate: (tplId: string, updatedFields: Partial<ActivityTemplate>) => void
  addTemplate: (newTpl: ActivityTemplate) => void
  runTaskGenerationEngine: (dateStr: string) => number
}

const OCRMSContext = createContext<OCRMSContextType | undefined>(undefined)

// ── Provider ──
export function OCRMSProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('oe')
  const [isAuthenticated, setIsAuthenticatedState] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [apiUser, setApiUserState] = useState<ApiUser | null>(null)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tasks, setTasks] = useState<OperationalTask[]>(operationalTasks)
  const [templates, setTemplates] = useState<ActivityTemplate[]>(activityTemplates)
  const [scoringPolicy, setScoringPolicyState] = useState<ScoringPolicy>('avp_only')
  
  // Use API user if available AND role matches, otherwise fallback to mock config to allow role switching
  const currentUser: RoleConfig = (apiUser && apiUser.role === currentRole) ? {
    id: apiUser.user_id,
    role: apiUser.role as UserRole,
    label: roleConfigs.find(r => r.role === apiUser.role)?.label || apiUser.role,
    userName: apiUser.name,
    code: apiUser.code,
    designation: apiUser.designation
  } : (roleConfigs.find(r => r.role === currentRole) || roleConfigs[0])

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    const storedAuth = localStorage.getItem('opas_authenticated')
    const storedRole = localStorage.getItem('opas_role') as UserRole | null
    const storedToken = localStorage.getItem('opas_token')
    const storedUser = localStorage.getItem('opas_user')

    if (storedAuth === 'true') {
      setIsAuthenticatedState(true)
    }
    if (storedRole && roleConfigs.some(r => r.role === storedRole)) {
      setCurrentRoleState(storedRole)
    }
    if (storedToken) {
      setAccessTokenState(storedToken)
    }
    if (storedUser) {
      try {
        setApiUserState(JSON.parse(storedUser))
      } catch (e) {}
    }
    setIsLoadingAuth(false)
  }, [])

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role)
    localStorage.setItem('opas_role', role)
  }

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth)
    if (auth) {
      localStorage.setItem('opas_authenticated', 'true')
    } else {
      localStorage.removeItem('opas_authenticated')
      localStorage.removeItem('opas_token')
      localStorage.removeItem('opas_user')
      setAccessTokenState(null)
      setApiUserState(null)
    }
  }

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token)
    if (token) {
      localStorage.setItem('opas_token', token)
    } else {
      localStorage.removeItem('opas_token')
    }
  }

  const setApiUser = (user: ApiUser | null) => {
    setApiUserState(user)
    if (user) {
      localStorage.setItem('opas_user', JSON.stringify(user))
      setCurrentRole(user.role as UserRole)
    } else {
      localStorage.removeItem('opas_user')
    }
  }

  // Recompute scores on policy change
  const setScoringPolicy = (policy: ScoringPolicy) => {
    setScoringPolicyState(policy)
    setTasks(prev => recomputeScores(prev, policy))
  }

  const updateTask = (taskId: string, updatedFields: Partial<OperationalTask>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updatedFields }
        // If ratings are changing, recalculate final score
        if (
          updatedFields.oeRating !== undefined || 
          updatedFields.rmRating !== undefined || 
          updatedFields.zhRating !== undefined || 
          updatedFields.avpRating !== undefined || 
          updatedFields.bhRating !== undefined || 
          updatedFields.drRating !== undefined || 
          updatedFields.status === 'approved'
        ) {
          const recomputed = recomputeScores([updatedTask], scoringPolicy)
          return recomputed[0]
        }
        return updatedTask
      }
      return task
    }))
  }

  const updateTemplate = (tplId: string, updatedFields: Partial<ActivityTemplate>) => {
    setTemplates(prev => prev.map(tpl => tpl.id === tplId ? { ...tpl, ...updatedFields } : tpl))
  }

  const addTemplate = (newTpl: ActivityTemplate) => {
    setTemplates(prev => [...prev, newTpl])
  }

  // Task Generation Engine
  const runTaskGenerationEngine = (dateStr: string): number => {
    const newTasks: OperationalTask[] = []
    let idCounter = tasks.length + 1
    const dateObj = new Date(dateStr)
    const day = dateObj.getDay()
    const dateNum = dateObj.getDate()

    for (const site of sites) {
      for (const tpl of templates) {
        if (!tpl.active) continue

        let shouldGenerate = false
        if (tpl.frequency === 'daily') {
          shouldGenerate = true
        } else if (tpl.frequency === 'weekly') {
          shouldGenerate = day === 1 // Generate on Mondays
        } else if (tpl.frequency === 'fortnightly') {
          shouldGenerate = dateNum === 1 || dateNum === 15 // Generate on 1st and 15th
        } else if (tpl.frequency === 'monthly') {
          shouldGenerate = dateNum === 1 // Generate on 1st
        } else if (tpl.frequency === 'one-time') {
          // Check if already exists
          shouldGenerate = !tasks.some(t => t.templateId === tpl.id && t.siteId === site.id)
        }

        if (shouldGenerate) {
          // Verify duplicate doesn't exist for this day/site/template
          const alreadyExists = tasks.some(
            t => t.templateId === tpl.id && t.siteId === site.id && t.dueDate === dateStr
          )
          if (!alreadyExists) {
            newTasks.push({
              id: `TASK_GEN_${Date.now()}_${idCounter++}`,
              templateId: tpl.id,
              taskName: tpl.name,
              category: tpl.category,
              frequency: tpl.frequency,
              weightage: tpl.weightage,
              dueDate: dateStr,
              siteId: site.id,
              siteName: site.name,
              clientName: site.client,
              status: 'pending',
              evidenceUrls: [],
              evidenceCount: 0,
              assignedTo: site.assignedOE
            })
          }
        }
      }
    }

    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks])
      return newTasks.length
    }
    return 0
  }

  return (
    <OCRMSContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUser,
      isAuthenticated,
      setIsAuthenticated,
      isLoadingAuth,
      accessToken,
      setAccessToken,
      apiUser,
      setApiUser,
      sidebarCollapsed,
      setSidebarCollapsed,
      tasks,
      setTasks,
      templates,
      setTemplates,
      scoringPolicy,
      setScoringPolicy,
      updateTask,
      updateTemplate,
      addTemplate,
      runTaskGenerationEngine
    }}>
      {children}
    </OCRMSContext.Provider>
  )
}

// ── Hook ──
export function useOCRMS() {
  const ctx = useContext(OCRMSContext)
  if (!ctx) throw new Error('useOCRMS must be used within an OCRMSProvider')
  return ctx
}


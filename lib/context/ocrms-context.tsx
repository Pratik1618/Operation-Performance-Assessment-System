'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserRole, OperationalTask, ActivityTemplate } from '@/lib/types'
import { operationalTasks, activityTemplates, sites, recomputeScores } from '@/lib/data/ocrms-data'

// ── Role Configuration ──
export interface RoleConfig {
  role: UserRole
  label: string
  userName: string
  code: string
  designation: string
}

export const roleConfigs: RoleConfig[] = [
  { role: 'oe', label: 'Operation Executive', userName: 'Ravi Shankar', code: 'OE-001', designation: 'Operation Executive' },
  { role: 'rm', label: 'Regional Manager', userName: 'Suresh Kumar', code: 'RM-001', designation: 'Regional Manager' },
  { role: 'avp', label: 'AVP Operations', userName: 'Venkat Raman', code: 'AVP-001', designation: 'AVP Operations' },
  { role: 'bh', label: 'Business Head', userName: 'Priya Saxena', code: 'BH-001', designation: 'Business Head' },
  { role: 'hr', label: 'HR Team', userName: 'Neha Verma', code: 'HR-001', designation: 'HR Manager' },
  { role: 'procurement', label: 'Procurement Team', userName: 'Amit Sharma', code: 'PROC-001', designation: 'Procurement Head' },
]

export type ScoringPolicy = 'avp_only' | 'average' | 'weighted';

// ── Context Shape ──
interface OCRMSContextType {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  currentUser: RoleConfig
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
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
  const [currentRole, setCurrentRole] = useState<UserRole>('oe')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tasks, setTasks] = useState<OperationalTask[]>(operationalTasks)
  const [templates, setTemplates] = useState<ActivityTemplate[]>(activityTemplates)
  const [scoringPolicy, setScoringPolicyState] = useState<ScoringPolicy>('avp_only')
  
  const currentUser = roleConfigs.find(r => r.role === currentRole) || roleConfigs[0]

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
          updatedFields.avpRating !== undefined || 
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


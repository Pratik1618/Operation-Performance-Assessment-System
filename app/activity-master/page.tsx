'use client'

import { useState, useMemo } from 'react'
import {
  ClipboardList, Plus, Search, Filter, Edit2, Check, X,
  Trash2, Shield, Settings, Info, ToggleLeft, ToggleRight, CheckSquare
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { ActivityTemplate, ActivityCategory, TaskFrequency } from '@/lib/types'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const categories: ActivityCategory[] = [
  'Attendance Verification',
  'Site Operations',
  'Training',
  'Procurement & Logistics',
  'Employee Relations',
  'Incident & Performance',
  'Planning & Recognition',
  'Reporting & Closure',
  'Quality & Feedback'
]

const frequencies: TaskFrequency[] = ['daily', 'weekly', 'fortnightly', 'monthly', 'one-time']

export default function ActivityMasterPage() {
  const { templates, updateTemplate, addTemplate } = useOCRMS()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Edit/Create Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null)
  
  // Dialog Form states
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState<ActivityCategory>('Attendance Verification')
  const [formFrequency, setFormFrequency] = useState<TaskFrequency>('daily')
  const [formWeight, setFormWeight] = useState(4)
  const [formActive, setFormActive] = useState(true)
  const [formEvidence, setFormEvidence] = useState<string[]>([])

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      const matchesFrequency = frequencyFilter === 'all' || t.frequency === frequencyFilter
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && t.active) || 
                            (statusFilter === 'inactive' && !t.active)
      return matchesSearch && matchesCategory && matchesFrequency && matchesStatus
    })
  }, [templates, searchTerm, categoryFilter, frequencyFilter, statusFilter])

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormCode(`ACT-${Date.now().toString().slice(-4)}`)
    setFormDesc('')
    setFormCategory('Attendance Verification')
    setFormFrequency('daily')
    setFormWeight(4)
    setFormActive(true)
    setFormEvidence(['image'])
    setShowModal(true)
  }

  const handleOpenEdit = (tpl: ActivityTemplate) => {
    setEditingTemplate(tpl)
    setFormName(tpl.name)
    setFormCode(tpl.code)
    setFormDesc(tpl.description)
    setFormCategory(tpl.category)
    setFormFrequency(tpl.frequency)
    setFormWeight(tpl.weightage)
    setFormActive(tpl.active)
    setFormEvidence(tpl.evidenceTypes)
    setShowModal(true)
  }

  const handleEvidenceToggle = (type: string) => {
    setFormEvidence(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim() || !formCode.trim()) {
      toast.error('Validation Error', { description: 'Name and Code are required.' })
      return
    }

    const templateData = {
      name: formName,
      code: formCode,
      description: formDesc,
      category: formCategory,
      frequency: formFrequency,
      weightage: formWeight,
      active: formActive,
      evidenceTypes: formEvidence as any[],
      formSchema: editingTemplate?.formSchema || [
        { id: 'notes', label: 'Activity Verification Notes', type: 'textarea', required: true }
      ],
      approvalFlow: editingTemplate?.approvalFlow || ['oe', 'rm']
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateData)
      toast.success('Template Updated', { description: `${formName} has been successfully updated.` })
    } else {
      const newTpl: ActivityTemplate = {
        id: `TPL-GEN-${Date.now()}`,
        ...templateData
      }
      addTemplate(newTpl)
      toast.success('Template Created', { description: `${formName} has been added to the master index.` })
    }

    setShowModal(false)
  }

  const toggleActiveStatus = (tpl: ActivityTemplate) => {
    updateTemplate(tpl.id, { active: !tpl.active })
    toast.success('Status Toggled', { 
      description: `${tpl.name} is now ${!tpl.active ? 'Active' : 'Inactive'}.` 
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Activity Master' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md">
            <ClipboardList className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Activity Template Master</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure activity rules, frequency, compliance weights, and dynamic schemas.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-bold gap-1.5 shadow-md rounded-xl h-10 text-xs"
        >
          <Plus size={15} /> Create Activity Template
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border shadow-soft">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            placeholder="Search activity template by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Frequencies</option>
            {frequencies.map(f => (
              <option key={f} value={f} className="uppercase">{f}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Templates Table */}
      <Card className="border border-border/80 shadow-soft overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Code</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Activity Name</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Category</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Frequency</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Weightage</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600">Required Evidence</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Status</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((tpl) => (
                <TableRow key={tpl.id} className="hover:bg-slate-50/30 transition-colors group">
                  <TableCell className="px-4 py-3 font-bold text-slate-700 text-xs">{tpl.code}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[250px]">{tpl.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs font-semibold text-slate-700">{tpl.category}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-xs uppercase font-bold text-slate-600 tracking-wide">{tpl.frequency}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                      {tpl.weightage} Pts
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tpl.evidenceTypes.map(ev => (
                        <span key={ev} className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border px-1.5 py-0.25 rounded">
                          {ev}
                        </span>
                      ))}
                      {tpl.evidenceTypes.length === 0 && <span className="text-[10px] text-slate-400 font-medium">None</span>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActiveStatus(tpl)}
                      className="border-0 bg-transparent cursor-pointer p-0 focus:outline-none"
                    >
                      {tpl.active ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-600 transition-all border-0 bg-transparent cursor-pointer"
                      title="Edit Template"
                    >
                      <Edit2 size={13} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTemplates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs italic font-medium">
                    No activity templates matched the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* --- CREATE / EDIT TEMPLATE MODAL --- */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <ClipboardList className="text-indigo-600" size={16} /> 
              {editingTemplate ? 'Modify Activity Template' : 'New Activity Template'}
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              {editingTemplate ? 'Update this activity config rules' : 'Design a new operational activity template'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-1.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tplCode" className="text-xs font-bold text-slate-700">Activity Code</Label>
                <Input
                  id="tplCode"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. ACT-ATT-10"
                  required
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tplName" className="text-xs font-bold text-slate-700">Activity Name</Label>
                <Input
                  id="tplName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Absent Check"
                  required
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tplDesc" className="text-xs font-bold text-slate-700">Description</Label>
              <textarea
                id="tplDesc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Explain the purpose and requirements of this activity..."
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tplCategory" className="text-xs font-bold text-slate-700">Category</Label>
                <select
                  id="tplCategory"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tplFrequency" className="text-xs font-bold text-slate-700">Frequency</Label>
                <select
                  id="tplFrequency"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as TaskFrequency)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {frequencies.map(f => (
                    <option key={f} value={f} className="uppercase">{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <Label htmlFor="tplWeight" className="text-xs font-bold text-slate-700">Max Score Weightage</Label>
                <Input
                  type="number"
                  id="tplWeight"
                  min={1}
                  max={10}
                  value={formWeight}
                  onChange={(e) => setFormWeight(Number(e.target.value))}
                  required
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 mt-4.5">
                <input
                  type="checkbox"
                  id="tplActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Label htmlFor="tplActive" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Template Active
                </Label>
              </div>
            </div>

            {/* Evidence Requirements */}
            <div className="space-y-1.5 border-t pt-3">
              <Label className="text-xs font-bold text-slate-700">Required Evidence Formats</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['image', 'pdf', 'excel', 'video', 'audio', 'signature'].map(type => {
                  const isChecked = formEvidence.includes(type)
                  return (
                    <div
                      key={type}
                      onClick={() => handleEvidenceToggle(type)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-colors ${
                        isChecked 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CheckSquare size={12} className={isChecked ? 'text-indigo-600 fill-indigo-100' : 'text-slate-400'} />
                      <span className="uppercase text-[9px]">{type}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="border-t pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="h-9 px-4 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 shadow-sm"
              >
                <Check size={12} /> Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

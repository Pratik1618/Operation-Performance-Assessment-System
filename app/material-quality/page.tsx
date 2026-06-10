'use client'

import { useState, useMemo } from 'react'
import {
  Scale, Search, Plus, CalendarDays, CheckCircle2,
  AlertTriangle, TrendingUp, TrendingDown, ArrowRight, UserCheck
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { materialQuality, sites } from '@/lib/data/ocrms-data'
import type { MaterialQuality } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function MaterialQualityPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [localAudits, setLocalAudits] = useState<MaterialQuality[]>(materialQuality)
  const [showAddModal, setShowAddModal] = useState(false)

  // Audit Form States
  const [formSiteId, setFormSiteId] = useState(sites[0].id)
  const [formScore, setFormScore] = useState(85)
  const [formIssues, setFormIssues] = useState(0)
  const [formObs, setFormObs] = useState('')

  const metrics = useMemo(() => {
    const total = localAudits.length
    const avgScore = total > 0 ? Math.round(localAudits.reduce((sum, a) => sum + a.qualityScore, 0) / total) : 0
    const issues = localAudits.reduce((sum, a) => sum + a.issuesFound, 0)
    const passRate = total > 0 ? Math.round((localAudits.filter(a => a.qualityScore >= 75).length / total) * 100) : 0
    return { total, avgScore, issues, passRate }
  }, [localAudits])

  // Filtered List
  const filteredAudits = useMemo(() => {
    return localAudits.filter((aud) => {
      return aud.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
             aud.observations.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [localAudits, searchTerm])

  const handleAddAudit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedSiteObj = sites.find(s => s.id === formSiteId)
    const newAudit: MaterialQuality = {
      id: `MQ_${Date.now()}`,
      site: selectedSiteObj?.name || '',
      siteId: formSiteId,
      auditDate: new Date().toISOString().split('T')[0],
      qualityScore: Number(formScore),
      issuesFound: Number(formIssues),
      observations: formObs,
      auditor: 'Ravi Shankar (OE)',
      trend: formScore >= 85 ? 'improving' : 'stable'
    }

    setLocalAudits(prev => [newAudit, ...prev])
    setShowAddModal(false)
    setFormObs('')
    setFormIssues(0)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Material Quality' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-lime-500 to-green-500 shadow-md">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Material Quality Audits</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conduct quality control on floor cleaning chemicals, mops, sanitizers, and PPE gear.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-lime-600 to-green-500 hover:from-lime-700 hover:to-green-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Log Quality Audit
        </Button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Audits Logged</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-lime-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-lime-700">{metrics.avgScore}%</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Average Quality Score</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-amber-700">{metrics.issues}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Deficiencies Found</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.passRate}%</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Compliance Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search audits by site name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Audits Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAudits.map((aud) => {
          const isGood = aud.qualityScore >= 85
          const isMed = aud.qualityScore >= 75 && aud.qualityScore < 85
          return (
            <Card key={aud.id} className="shadow-soft border border-border flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{aud.site}</h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Audit: {aud.auditDate} · {aud.auditor}</p>
                  </div>
                  
                  {/* Trend Indicator */}
                  {aud.trend === 'improving' ? (
                    <span className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100" title="Improving Quality">
                      <TrendingUp size={12} />
                    </span>
                  ) : aud.trend === 'declining' ? (
                    <span className="h-6 w-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100" title="Declining Quality">
                      <TrendingDown size={12} className="animate-bounce" />
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">➡️</span>
                  )}
                </div>

                {/* Score Horizontal gauge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Chemical/Material Score</span>
                    <span className={`font-bold ${
                      isGood ? 'text-emerald-700' : isMed ? 'text-amber-700' : 'text-rose-700'
                    }`}>{aud.qualityScore}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isGood ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${aud.qualityScore}%` }}
                    />
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Audit Remarks</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{aud.observations || 'Premises materials conform to specs.'}"
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between text-[10px]">
                <span className={`font-bold uppercase rounded px-1.5 py-0.5 border ${
                  aud.issuesFound > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {aud.issuesFound} Deficiencies Mapped
                </span>
                <span className="text-muted-foreground font-semibold">100% Verified</span>
              </div>
            </Card>
          )
        })}
        {filteredAudits.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground Card">
            No quality audits found matching search.
          </div>
        )}
      </div>

      {/* Add Audit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Add Quality Audit</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Record new chemical quality and label compliance details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAudit} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Site</Label>
              <select 
                value={formSiteId} 
                onChange={(e) => setFormSiteId(e.target.value)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                {sites.slice(0, 6).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">Quality Score (0-100)</Label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={formScore}
                  onChange={(e) => setFormScore(Number(e.target.value))}
                  className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">Issues Mapped</Label>
                <input 
                  type="number" 
                  min={0} 
                  value={formIssues}
                  onChange={(e) => setFormIssues(Number(e.target.value))}
                  className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Observations</Label>
              <textarea 
                required
                value={formObs}
                onChange={(e) => setFormObs(e.target.value)}
                placeholder="Record chemical quality, label compliance details..."
                className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-16" 
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs">
              Log Audit Sheet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

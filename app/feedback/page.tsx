'use client'

import { useState, useMemo } from 'react'
import {
  Star, MessageSquare, TrendingUp, Plus, Search, Sparkles,
  ThumbsUp, ThumbsDown, AlertCircle, Calendar, X, ChevronRight, CheckCircle2
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { feedbackScores as initialFeedback, sites } from '@/lib/data/ocrms-data'
import { useOCRMS } from '@/lib/context/ocrms-context'
import type { FeedbackScore, FeedbackBand } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// Band styling definitions
const bandConfigs: Record<FeedbackBand, { label: string; color: string; bg: string; icon: string; border: string }> = {
  poor: { label: 'Poor (0-60)', color: 'text-rose-700', bg: 'bg-rose-50', icon: '🔴', border: 'border-rose-200' },
  average: { label: 'Average (61-80)', color: 'text-amber-700', bg: 'bg-amber-50', icon: '🟡', border: 'border-amber-200' },
  better: { label: 'Better (81-90)', color: 'text-blue-700', bg: 'bg-blue-50', icon: '🔵', border: 'border-blue-200' },
  best: { label: 'Best (91-100)', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '🟢', border: 'border-emerald-200' },
}

function CSATGauge({ score }: { score: number }) {
  const radius = 40
  const semiCircumference = Math.PI * radius // 125.66
  
  const filledLength = (Math.min(Math.max(score, 0), 100) / 100) * semiCircumference
  
  let strokeColor = 'stroke-rose-500'
  if (score > 90) strokeColor = 'stroke-emerald-500'
  else if (score > 80) strokeColor = 'stroke-blue-500'
  else if (score > 60) strokeColor = 'stroke-amber-500'

  return (
    <div className="relative flex flex-col items-center justify-end w-32 h-16 select-none">
      <svg className="w-28 h-auto" viewBox="0 0 100 52">
        {/* Background Arc */}
        <path
          d="M 10 46 A 40 40 0 0 1 90 46"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d="M 10 46 A 40 40 0 0 1 90 46"
          fill="none"
          className={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${semiCircumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute bottom-2 text-center">
        <span className="text-xl font-bold text-slate-800">{score}%</span>
        <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider mt-0.5">CSAT</span>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  const { currentRole } = useOCRMS()
  const [feedbacks, setFeedbacks] = useState<FeedbackScore[]>(initialFeedback)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeBandFilter, setActiveBandFilter] = useState<'all' | 'best' | 'better_avg' | 'poor'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [formSiteId, setFormSiteId] = useState(sites[0].id)
  const [formScore, setFormScore] = useState(85)
  const [formComments, setFormComments] = useState('')
  const [formMonth, setFormMonth] = useState('June')

  const metrics = useMemo(() => {
    const total = feedbacks.length
    const avgScore = Math.round(feedbacks.reduce((sum, f) => sum + f.score, 0) / (total || 1))
    
    return {
      total,
      avgScore,
      bestCount: feedbacks.filter(f => f.score > 90).length,
      betterCount: feedbacks.filter(f => f.score > 80 && f.score <= 90).length,
      avgCount: feedbacks.filter(f => f.score > 60 && f.score <= 80).length,
      poorCount: feedbacks.filter(f => f.score <= 60).length,
    }
  }, [feedbacks])

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesSearch = 
        f.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.comments.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesBand = 
        activeBandFilter === 'all' ||
        (activeBandFilter === 'best' && f.score > 90) ||
        (activeBandFilter === 'better_avg' && f.score > 60 && f.score <= 90) ||
        (activeBandFilter === 'poor' && f.score <= 60)

      return matchesSearch && matchesBand
    })
  }, [feedbacks, searchTerm, activeBandFilter])

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedSite = sites.find(s => s.id === formSiteId)
    
    let band: FeedbackBand = 'poor'
    if (formScore > 90) band = 'best'
    else if (formScore > 80) band = 'better'
    else if (formScore > 60) band = 'average'

    const newFeedback: FeedbackScore = {
      id: `FB_${Date.now()}`,
      site: selectedSite?.name || '',
      siteId: formSiteId,
      client: selectedSite?.client || 'Client BPO',
      score: Number(formScore),
      band,
      month: formMonth,
      year: 2025,
      comments: formComments
    }

    setFeedbacks(prev => [newFeedback, ...prev])
    setShowAddModal(false)
    setFormComments('')
    setFormScore(85)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Client Feedback (CSAT)' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md">
            <Star className="text-white fill-white/20" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Feedback & CSAT</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor client satisfaction scores, categorise satisfaction bands, and resolve client concerns.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Log Feedback Score
        </Button>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="shadow-soft bg-gradient-to-br from-slate-50 to-slate-100 border-none">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{metrics.avgScore}%</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Average CSAT</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{metrics.bestCount}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Best (91+)</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{metrics.betterCount}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Better (81-90)</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{metrics.avgCount}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Average (61-80)</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-rose-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-rose-700">{metrics.poorCount}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Poor (&lt;60)</p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Information Alert */}
      <Card className="shadow-soft border-none bg-slate-50">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 shrink-0 animate-pulse" size={16} />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800">Operational Excellence Policy</h4>
              <p className="text-[11px] text-slate-600">
                Any score under **60% (Poor)** triggers an automatic SLA escalation notification to the AVP and BH.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">🟢 Best (91-100)</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">🔵 Better (81-90)</span>
            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">🟡 Average (61-80)</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-100">🔴 Poor (0-60)</span>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveBandFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeBandFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All Ratings ({metrics.total})
          </button>
          <button
            onClick={() => setActiveBandFilter('best')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeBandFilter === 'best' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Best Rating ({metrics.bestCount})
          </button>
          <button
            onClick={() => setActiveBandFilter('better_avg')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeBandFilter === 'better_avg' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Better / Average ({metrics.betterCount + metrics.avgCount})
          </button>
          <button
            onClick={() => setActiveBandFilter('poor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeBandFilter === 'poor' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Poor Rating ({metrics.poorCount})
          </button>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search site, client, or comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Feedbacks Grid Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFeedbacks.map((f) => {
          const config = bandConfigs[f.band]
          
          return (
            <Card key={f.id} className="shadow-soft border border-border flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{f.site}</h3>
                    <p className="text-[10px] text-muted-foreground">Client: <span className="font-semibold text-slate-600">{f.client}</span></p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.bg} ${config.color} ${config.border}`}>
                    {config.icon} {config.label}
                  </span>
                </div>

                {/* Score visualization gauge */}
                <div className="flex items-center justify-center py-2 bg-slate-50/50 rounded-2xl border border-border/60">
                  <CSATGauge score={f.score} />
                </div>

                {/* Comments box */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client Remarks</span>
                  <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                    "{f.comments || 'No remarks provided.'}"
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {f.month} {f.year}
                </span>
                <span className="text-slate-400">ID: {f.id}</span>
              </div>
            </Card>
          )
        })}
        {filteredFeedbacks.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground Card">
            No client feedbacks found matching criteria.
          </div>
        )}
      </div>

      {/* Log Feedback Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Log Client CSAT Feedback</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Record customer satisfaction percentage scores and client remarks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Select Site</Label>
              <select 
                value={formSiteId} 
                onChange={(e) => setFormSiteId(e.target.value)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                {sites.slice(0, 6).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.client})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold text-slate-600">CSAT Score ({formScore}%)</Label>
                <span className={`text-[10px] font-bold ${formScore > 90 ? 'text-emerald-600' : formScore > 80 ? 'text-blue-600' : formScore > 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {formScore > 90 ? 'Best' : formScore > 80 ? 'Better' : formScore > 60 ? 'Average' : 'Poor'}
                </span>
              </div>
              <input 
                type="range"
                min={0}
                max={100}
                value={formScore}
                onChange={(e) => setFormScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Audit Period (Month)</Label>
              <select
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                <option value="June">June 2025</option>
                <option value="May">May 2025</option>
                <option value="April">April 2025</option>
                <option value="March">March 2025</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Comments / Client Concerns</Label>
              <textarea 
                required
                value={formComments}
                onChange={(e) => setFormComments(e.target.value)}
                placeholder="Record client comments, positive callouts, or critical issues reported by client representatives..."
                className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-20" 
              />
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs font-semibold mt-2">
              Log Feedback
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


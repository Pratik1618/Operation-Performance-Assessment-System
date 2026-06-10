'use client'

import { useState, useMemo } from 'react'
import {
  Star, Search, Plus, CalendarDays, CheckCircle2,
  AlertCircle, Gift, Image as ImageIcon, Camera, UserCheck, Trash
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { rrEvents, sites } from '@/lib/data/ocrms-data'
import type { RREvent, RRStatus } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const statusConfig: Record<RRStatus, { label: string; bg: string; text: string }> = {
  planned: { label: 'Planned', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
}

export default function RRSchedulePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [localEvents, setLocalEvents] = useState<RREvent[]>(rrEvents)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEventForPhotos, setSelectedEventForPhotos] = useState<RREvent | null>(null)

  // Form states
  const [formSiteId, setFormSiteId] = useState(sites[0].id)
  const [formType, setFormType] = useState('Best Employee Award')
  const [formDate, setFormDate] = useState('2025-06-18')
  const [formDesc, setFormDesc] = useState('')

  // Simulated photo upload count state
  const [uploadCount, setUploadCount] = useState(3)

  const metrics = useMemo(() => {
    return {
      total: localEvents.length,
      completed: localEvents.filter(e => e.status === 'completed').length,
      planned: localEvents.filter(e => e.status === 'planned').length,
      totalPhotos: localEvents.reduce((sum, e) => sum + e.photos, 0),
    }
  }, [localEvents])

  // Filtered List
  const filteredEvents = useMemo(() => {
    return localEvents.filter((ev) => {
      return ev.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ev.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ev.description.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [localEvents, searchTerm])

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedSiteObj = sites.find(s => s.id === formSiteId)
    const newEvent: RREvent = {
      id: `RR_${Date.now()}`,
      site: selectedSiteObj?.name || '',
      siteId: formSiteId,
      eventDate: formDate,
      eventType: formType,
      description: formDesc,
      photos: 0,
      status: 'planned' as const,
      coordinator: 'Ravi Shankar (OE)'
    }

    setLocalEvents(prev => [newEvent, ...prev])
    setShowAddModal(false)
    setFormDesc('')
  }

  const handleUploadPhotos = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventForPhotos) return

    setLocalEvents(prev => prev.map(ev => {
      if (ev.id === selectedEventForPhotos.id) {
        return {
          ...ev,
          status: 'completed' as const,
          photos: Number(uploadCount)
        }
      }
      return ev
    }))

    setSelectedEventForPhotos(null)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'R&R Schedule' }]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 shadow-md">
            <Star className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rewards & Recognition Events</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plan monthly R&R celebrations, reward site guards, and capture event compliance photos.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-white font-semibold shadow-md gap-1.5 rounded-xl h-9 text-xs">
          <Plus size={14} /> Schedule R&R Event
        </Button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-700">{metrics.total}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Total Events</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-700">{metrics.completed}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Events Completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-blue-700">{metrics.planned}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Planned Events</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-violet-500">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-violet-700">{metrics.totalPhotos}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Celebration Photos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
          <Input
            placeholder="Search events by site, type, or coordinator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Events Grid cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((ev) => {
          const stat = statusConfig[ev.status]
          return (
            <Card key={ev.id} className="shadow-soft border border-border flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{ev.eventType}</h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{ev.site}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${stat.bg} ${stat.text}`}>
                    {stat.label}
                  </span>
                </div>

                {/* Event Description */}
                <p className="text-xs text-slate-600 line-clamp-3 italic">
                  "{ev.description}"
                </p>

                {/* Photos Section */}
                {ev.status === 'completed' && ev.photos > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon size={11} className="text-emerald-600" />
                      Uploaded Photo Compliance ({ev.photos} Pics)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: Math.min(4, ev.photos) }).map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-slate-100 border flex items-center justify-center text-slate-400">
                          <Camera size={10} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : ev.status === 'planned' ? (
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2">
                    <Gift size={14} className="text-blue-600 shrink-0" />
                    <span className="text-[10px] text-blue-800 font-semibold flex-1">Complete Event & Upload Photos</span>
                    <button 
                      onClick={() => setSelectedEventForPhotos(ev)}
                      className="text-[10px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg shrink-0"
                    >
                      Complete
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-muted-foreground italic">No photos uploaded</span>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} className="text-slate-400" />
                  {ev.eventDate}
                </span>
                <span className="font-semibold text-slate-700">Coord: {ev.coordinator}</span>
              </div>
            </Card>
          )
        })}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground Card">
            No R&R events found matching search criteria.
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Schedule R&R Event</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Plan and schedule monthly R&R celebrations for site guards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-3 py-2">
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
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Celebration Type</Label>
              <select 
                value={formType} 
                onChange={(e) => setFormType(e.target.value)}
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none bg-white cursor-pointer"
              >
                <option value="Best Employee Award">Best Employee Award Ceremony</option>
                <option value="Birthday Celebration">Monthly Birthday Celebration</option>
                <option value="Safety Week Drill">Safety Week / Fire Drill</option>
                <option value="Tea & Snacks Meet">Tea & Snacks Meet</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Event Date</Label>
              <input 
                type="text" 
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full border border-border rounded-lg h-9 px-2 text-xs focus:outline-none" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-600">Description</Label>
              <textarea 
                required
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Ceremony details, gift distribution logs, snacks roster..."
                className="w-full border border-border rounded-lg p-2 text-xs focus:outline-none h-16" 
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 text-xs">
              Schedule Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Photos / Complete Event Modal */}
      <Dialog open={!!selectedEventForPhotos} onOpenChange={(open) => { if (!open) setSelectedEventForPhotos(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border border-border rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-slate-800">Complete Event & Upload Photos</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              {selectedEventForPhotos ? `Log completion of ${selectedEventForPhotos.eventType} at ${selectedEventForPhotos.site}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedEventForPhotos && (
            <form onSubmit={handleUploadPhotos} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-600">Simulate Photo Upload Count</Label>
                <input 
                  type="number" 
                  min={1}
                  max={8}
                  value={uploadCount}
                  onChange={(e) => setUploadCount(Number(e.target.value))}
                  className="w-full border border-border rounded-lg h-9 px-3 text-xs focus:outline-none" 
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs">
                Complete & Upload
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

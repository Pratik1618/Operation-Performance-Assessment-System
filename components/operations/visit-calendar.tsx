'use client'

import { useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, GripHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface CalendarVisit {
  id: string
  siteId: string
  siteName: string
  dateStr: string
  time: string
  status: 'planned' | 'completed'
  assignedTo?: string
}

interface CalendarDay {
  day: number
  monthOffset: number
  dateStr: string
  visits: CalendarVisit[]
}

interface VisitCalendarProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  visits: CalendarVisit[]
  selectedSite: string
  onDateClick: (dateStr: string) => void
  onVisitMove?: (visitId: string, newDateStr: string) => void
  isLocked: boolean
}

export default function VisitCalendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  visits,
  selectedSite,
  onDateClick,
  onVisitMove,
  isLocked
}: VisitCalendarProps) {
  const [draggedVisit, setDraggedVisit] = useState<CalendarVisit | null>(null)
  const [dragSource, setDragSource] = useState<string | null>(null)
  
  const handleVisitDragStart = (e: React.DragEvent, visit: CalendarVisit, fromDateStr: string) => {
    if (isLocked) return
    setDraggedVisit(visit)
    setDragSource(fromDateStr)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDateDragOver = (e: React.DragEvent) => {
    if (isLocked || !draggedVisit) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDateDrop = (e: React.DragEvent, toDateStr: string) => {
    if (isLocked || !draggedVisit) return
    e.preventDefault()
    
    if (toDateStr !== dragSource && onVisitMove) {
      onVisitMove(draggedVisit.id, toDateStr)
    }
    
    setDraggedVisit(null)
    setDragSource(null)
  }

  const handleDragEnd = () => {
    setDraggedVisit(null)
    setDragSource(null)
  }
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const grid: CalendarDay[] = []
    
    // Previous month offset days
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const prevYear = month === 0 ? year - 1 : year
      const prevMonth = month === 0 ? 11 : month - 1
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      
      const dayVisits = visits.filter(v => 
        v.dateStr === dateStr && (selectedSite === 'all' || v.siteId === selectedSite)
      )
      
      grid.push({
        day: dayNum,
        monthOffset: -1,
        dateStr,
        visits: dayVisits
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayVisits = visits.filter(v => 
        v.dateStr === dateStr && (selectedSite === 'all' || v.siteId === selectedSite)
      )
      
      grid.push({
        day: i,
        monthOffset: 0,
        dateStr,
        visits: dayVisits
      })
    }
    
    // Next month offset days
    const totalCells = Math.ceil(grid.length / 7) * 7
    const nextDaysNeeded = totalCells - grid.length
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextYear = month === 11 ? year + 1 : year
      const nextMonth = month === 11 ? 0 : month + 1
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      
      const dayVisits = visits.filter(v => 
        v.dateStr === dateStr && (selectedSite === 'all' || v.siteId === selectedSite)
      )
      
      grid.push({
        day: i,
        monthOffset: 1,
        dateStr,
        visits: dayVisits
      })
    }
    
    return grid
  }, [currentDate, visits, selectedSite])

  // Count metrics
  const metrics = useMemo(() => {
    const filteredVisits = selectedSite === 'all' 
      ? visits 
      : visits.filter(v => v.siteId === selectedSite)
    
    return {
      total: filteredVisits.length,
      completed: filteredVisits.filter(v => v.status === 'completed').length,
      planned: filteredVisits.filter(v => v.status === 'planned').length
    }
  }, [visits, selectedSite])

  return (
    <Card className="p-5 shadow-soft">
      <CardHeader className="p-0 pb-4 border-b flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold">
            Schedule Calendar
          </CardTitle>
          <CardDescription className="text-[11px]">
            {isLocked ? 'Calendar is locked. Planning window is closed or plan has been submitted.' : 'Click on dates to schedule audits.'}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-slate-50 border-slate-200">
          <button 
            onClick={onPrevMonth}
            className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} className="text-slate-600" />
          </button>
          <span className="text-[10px] font-bold px-2 whitespace-nowrap">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={onNextMonth}
            className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        </div>
      </CardHeader>
      
      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 mt-4 mb-4 py-3 px-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">{metrics.total}</p>
          <p className="text-[9px] text-muted-foreground">Total Visits</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-blue-600">{metrics.planned}</p>
          <p className="text-[9px] text-muted-foreground">Planned</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-600">{metrics.completed}</p>
          <p className="text-[9px] text-muted-foreground">Completed</p>
        </div>
      </div>
      
      <CardContent className="p-0 pt-4">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 text-center font-bold text-[10px] text-muted-foreground uppercase tracking-wider pb-3 px-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
            <div className="grid grid-cols-7 gap-1.5 border-t pt-1.5">
          {calendarDays.map((cell, index) => {
            const isCurrentMonth = cell.monthOffset === 0
            const hasVisits = cell.visits.length > 0
            const isToday = (() => {
              const today = new Date()
              return isCurrentMonth && 
                     cell.day === today.getDate() && 
                     currentDate.getMonth() === today.getMonth() &&
                     currentDate.getFullYear() === today.getFullYear()
            })()

            return (
              <div 
                key={index} 
                onClick={() => {
                  if (!isLocked && isCurrentMonth) {
                    onDateClick(cell.dateStr)
                  }
                }}
                onDragOver={handleDateDragOver}
                onDrop={(e) => handleDateDrop(e, cell.dateStr)}
                className={`min-h-[100px] border-2 rounded-xl p-2.5 transition-all flex flex-col justify-between group ${
                  !isCurrentMonth
                    ? 'bg-slate-50/40 border-slate-100 text-slate-300 opacity-60 select-none'
                    : isToday
                      ? 'bg-amber-50 border-amber-300 shadow-md'
                      : draggedVisit && cell.dateStr !== dragSource
                        ? 'bg-indigo-100/30 border-indigo-400 border-dashed'
                        : hasVisits
                        ? 'bg-indigo-50/15 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                        : 'bg-white border-slate-150 hover:bg-slate-50/60 hover:border-slate-300'
                } ${!isLocked && isCurrentMonth ? 'cursor-pointer hover:shadow-sm' : ''}`}
                role={!isLocked && isCurrentMonth ? 'button' : undefined}
                tabIndex={!isLocked && isCurrentMonth ? 0 : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold leading-none ${
                    !isCurrentMonth 
                      ? 'text-slate-300' 
                      : isToday
                        ? 'text-amber-700'
                        : hasVisits 
                          ? 'text-indigo-600' 
                          : 'text-slate-700'
                  }`}>
                    {cell.day}
                    {isToday && <span className="text-[6px] font-bold text-amber-600 ml-1">TODAY</span>}
                  </span>
                  {!isLocked && isCurrentMonth && (
                    <Plus size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                <div className="mt-2 space-y-1 flex-1 overflow-y-auto no-scrollbar max-h-[65px]">
                  {cell.visits.map((v) => (
                    <div 
                      key={v.id} 
                      draggable={!isLocked}
                      onDragStart={(e) => handleVisitDragStart(e, v, cell.dateStr)}
                      onDragEnd={handleDragEnd}
                      className={`text-[8px] font-semibold p-1.5 rounded-md truncate flex items-start gap-1 group/visit transition-all ${
                        v.status === 'completed' 
                          ? 'bg-emerald-100/80 text-emerald-900 border-l-2 border-l-emerald-600' 
                          : 'bg-blue-100/80 text-blue-900 border-l-2 border-l-blue-600'
                      } ${!isLocked ? 'cursor-move hover:shadow-md hover:scale-105' : ''} ${draggedVisit?.id === v.id ? 'opacity-50 scale-95' : ''}`}
                      title={`${v.siteName} (${v.time})${v.assignedTo ? ` - Assigned to ${v.assignedTo}` : ''}${!isLocked ? ' - Drag to reschedule' : ''}`}
                    >
                      {!isLocked && (
                        <GripHorizontal size={10} className="mt-0.5 flex-shrink-0 opacity-0 group-hover/visit:opacity-100 transition-opacity" />
                      )}
                      <Clock size={10} className={`mt-0.5 flex-shrink-0 ${!isLocked ? 'hidden group-hover/visit:block' : 'block'}`} />
                      <span className={`truncate ${!isLocked ? 'group-hover/visit:hidden' : 'block'}`}>
                        {v.siteName.split(' ')[0]} - {v.time} {v.assignedTo ? `(${v.assignedTo.split(' ')[0]})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100/80 border-l-2 border-l-blue-600"></div>
            <span className="text-slate-600">Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100/80 border-l-2 border-l-emerald-600"></div>
            <span className="text-slate-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-50 border-2 border-amber-300"></div>
            <span className="text-slate-600">Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

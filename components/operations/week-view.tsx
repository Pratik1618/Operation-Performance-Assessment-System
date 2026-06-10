'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface CalendarVisit {
  id: string
  siteId: string
  siteName: string
  dateStr: string
  time: string
  status: 'planned' | 'completed'
}

interface WeekViewProps {
  currentDate: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  visits: CalendarVisit[]
  selectedSite: string
  isLocked: boolean
}

export default function WeekView({
  currentDate,
  onPrevWeek,
  onNextWeek,
  visits,
  selectedSite,
  isLocked
}: WeekViewProps) {
  
  const weekDays = useMemo(() => {
    const startDate = new Date(currentDate)
    const day = startDate.getDay()
    const diff = startDate.getDate() - day // adjust to start of week (Sunday)
    startDate.setDate(diff)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const dayVisits = visits.filter(v => 
        v.dateStr === dateStr && (selectedSite === 'all' || v.siteId === selectedSite)
      )
      
      days.push({
        date,
        dateStr,
        dayName: date.toLocaleString('default', { weekday: 'short' }),
        dayNum: date.getDate(),
        visits: dayVisits,
        isToday: date.toDateString() === new Date().toDateString()
      })
    }
    return days
  }, [currentDate, visits, selectedSite])

  const weekRange = useMemo(() => {
    if (weekDays.length === 0) return ''
    const start = weekDays[0]
    const end = weekDays[6]
    return `${start.date.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${end.date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }, [weekDays])

  return (
    <Card className="p-5 shadow-soft">
      <CardHeader className="p-0 pb-4 border-b flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold">Weekly Schedule</CardTitle>
          <CardDescription className="text-[11px]">{weekRange}</CardDescription>
        </div>
        
        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-slate-50 border-slate-200">
          <button 
            onClick={onPrevWeek}
            className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
            aria-label="Previous week"
          >
            <ChevronLeft size={14} className="text-slate-600" />
          </button>
          <span className="text-[10px] font-bold px-2 whitespace-nowrap">
            Week
          </span>
          <button 
            onClick={onNextWeek}
            className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
            aria-label="Next week"
          >
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pt-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              className={`border-2 rounded-xl p-3 transition-all flex flex-col min-h-[200px] ${
                day.isToday
                  ? 'bg-amber-50 border-amber-300 shadow-md'
                  : 'bg-white border-slate-150 hover:border-slate-300'
              }`}
            >
              <div className="mb-3 pb-2 border-b">
                <p className={`text-xs font-bold ${day.isToday ? 'text-amber-700' : 'text-slate-600'}`}>
                  {day.dayName}
                </p>
                <p className={`text-lg font-bold ${day.isToday ? 'text-amber-900' : 'text-slate-900'}`}>
                  {day.dayNum}
                </p>
              </div>
              
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {day.visits.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-4">No visits</p>
                ) : (
                  day.visits.map((v) => (
                    <div
                      key={v.id}
                      className={`text-[9px] font-semibold p-2 rounded-lg truncate flex items-start gap-1 ${
                        v.status === 'completed'
                          ? 'bg-emerald-100/80 text-emerald-900 border-l-2 border-l-emerald-600'
                          : 'bg-blue-100/80 text-blue-900 border-l-2 border-l-blue-600'
                      }`}
                      title={`${v.siteName} (${v.time})`}
                    >
                      <Clock size={10} className="mt-0.5 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-bold truncate">{v.siteName.split(' ')[0]}</p>
                        <p className="text-[8px] opacity-90">{v.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

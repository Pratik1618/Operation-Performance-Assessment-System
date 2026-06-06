import { ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  title: string
  value: number | string
  unit?: string
  trend?: number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'red'
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  icon,
  color = 'blue',
}: KPICardProps) {
  const trendColor = trend !== undefined && trend >= 0 ? 'text-emerald-600' : 'text-rose-600'

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trendColor}`}>
                {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(trend)}% from last month
              </div>
            )}
          </div>
          {icon && <div className="text-2xl ml-2 flex-shrink-0 opacity-60">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

interface KPIGridProps {
  cards: KPICardProps[]
}

export function KPIGrid({ cards }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, index) => (
        <KPICard key={index} {...card} />
      ))}
    </div>
  )
}

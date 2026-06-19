'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: number
  disabled?: boolean
  label?: string
}

export function StarRating({ value, onChange, max = 5, size = 18, disabled = false, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-[10px] font-semibold text-slate-500 mr-1.5 min-w-[80px]">{label}</span>}
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= value
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(starValue === value ? 0 : starValue)}
              className={`p-0 border-0 bg-transparent transition-all duration-150 ${
                disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
              title={`${starValue} / ${max}`}
            >
              <Star
                size={size}
                className={`transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : disabled
                      ? 'text-slate-200'
                      : 'text-slate-250 hover:text-amber-300'
                }`}
              />
            </button>
          )
        })}
      </div>
      {value > 0 && (
        <span className={`text-[10px] font-extrabold ml-1.5 px-1.5 py-0.5 rounded ${
          value >= 4 ? 'bg-emerald-50 text-emerald-700' :
          value >= 3 ? 'bg-amber-50 text-amber-700' :
          'bg-rose-50 text-rose-700'
        }`}>
          {value}/{max}
        </span>
      )}
    </div>
  )
}

// Labels for rating display
export const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

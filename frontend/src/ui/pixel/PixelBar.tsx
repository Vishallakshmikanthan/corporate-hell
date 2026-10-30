/**
 * CORPORATE HELL™ — Segmented Pixel Bar.
 *
 * Chunky 8-bit stepped bar meter with discrete segments.
 * No smooth gradients, perfectly authentic retro look.
 */
import React from 'react'

export type PixelBarColor = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'lime' | 'cream'

interface PixelBarProps {
  value: number // 0 to 100
  max?: number
  segments?: number
  color?: PixelBarColor
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  label?: string
  icon?: string
}

export const PixelBar: React.FC<PixelBarProps> = ({
  value,
  max = 100,
  segments = 10,
  color = 'lime',
  size = 'md',
  showNumber = false,
  label,
  icon,
}) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const filledSegments = Math.round((percent / 100) * segments)

  const activeColor = {
    green: '#3f8f4e',
    lime: '#b6e52d',
    blue: '#3e6ec0',
    amber: '#f2a93b',
    red: '#d9453d',
    purple: '#8b5cf6',
    cream: '#f4ecd8',
  }[color]

  const heightClass = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  }[size]

  return (
    <div className="flex flex-col gap-1 select-none font-mono">
      {(label || icon || showNumber) && (
        <div className="flex items-center justify-between text-[11px] text-[#ded2b6]">
          <span className="flex items-center gap-1">
            {icon && <span>{icon}</span>}
            {label && <span className="uppercase tracking-wider">{label}</span>}
          </span>
          {showNumber && (
            <span className="font-bold text-[#f4ecd8]">
              {Math.round(value)}/{max}
            </span>
          )}
        </div>
      )}

      {/* Chunky Outer Pixel Inset Well */}
      <div className="flex items-center gap-[2px] bg-[#14121c] p-[2px] border-2 border-[#4b4a5e] shadow-[inset_1px_1px_0px_#000000]">
        {Array.from({ length: segments }).map((_, idx) => {
          const isFilled = idx < filledSegments
          return (
            <div
              key={idx}
              className={`flex-1 ${heightClass} border border-[#14121c] transition-none`}
              style={{
                backgroundColor: isFilled ? activeColor : '#2a2838',
                boxShadow: isFilled
                  ? 'inset 1px 1px 0px rgba(255,255,255,0.4), inset -1px -1px 0px rgba(0,0,0,0.5)'
                  : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

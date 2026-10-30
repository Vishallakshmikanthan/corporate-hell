/**
 * CORPORATE HELL™ — Pixel Badge & Chip.
 */
import React from 'react'

export type PixelBadgeVariant = 'lime' | 'amber' | 'red' | 'blue' | 'purple' | 'slate' | 'cream'

interface PixelBadgeProps {
  label: string
  variant?: PixelBadgeVariant
  icon?: string | React.ReactNode
  className?: string
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  label,
  variant = 'slate',
  icon,
  className = '',
}) => {
  const variantStyles = {
    lime: 'bg-[#b6e52d] text-[#14121c] border-[#14121c]',
    amber: 'bg-[#f2a93b] text-[#14121c] border-[#14121c]',
    red: 'bg-[#d9453d] text-white border-[#14121c]',
    blue: 'bg-[#3e6ec0] text-white border-[#14121c]',
    purple: 'bg-[#8b5cf6] text-white border-[#14121c]',
    slate: 'bg-[#4b4a5e] text-[#f4ecd8] border-[#14121c]',
    cream: 'bg-[#f4ecd8] text-[#14121c] border-[#14121c]',
  }[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-[10px]
        font-mono uppercase tracking-wider font-bold
        border-2 select-none shadow-[1px_1px_0px_#14121c]
        ${variantStyles}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  )
}

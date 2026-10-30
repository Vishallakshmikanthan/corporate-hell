/**
 * CORPORATE HELL™ — Tactile Pixel Button.
 *
 * Authentic 8-bit stepped button with sound effect, 1px depression,
 * and CH-16 color palette variants.
 */
import React from 'react'
import { audio } from '../../services/audio'

export type PixelButtonVariant =
  | 'default'
  | 'neutral'
  | 'primary'
  | 'lime'
  | 'success'
  | 'amber'
  | 'warning'
  | 'danger'
  | 'cream'
  | 'ghost'

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  sound?: 'click' | 'lever' | 'stamp' | 'cash'
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  sound = 'click',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (sound === 'click') audio.playClick()
    else if (sound === 'lever') audio.playLever()
    else if (sound === 'stamp') audio.playStamp()
    else if (sound === 'cash') audio.playCash()
    onClick?.(e)
  }

  const variantClass = {
    default: 'bg-[#4b4a5e] text-[#f4ecd8]',
    neutral: 'bg-[#4b4a5e] text-[#f4ecd8]',
    primary: 'bg-[#3e6ec0] text-white',
    lime: 'bg-[#b6e52d] text-[#14121c]',
    success: 'bg-[#b6e52d] text-[#14121c]',
    amber: 'bg-[#f2a93b] text-[#14121c]',
    warning: 'bg-[#f2a93b] text-[#14121c]',
    danger: 'bg-[#d9453d] text-white',
    cream: 'bg-[#f4ecd8] text-[#14121c]',
    ghost: 'bg-transparent text-[#f4ecd8] border-dashed',
  }[variant]

  const sizeClass = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size]

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        font-mono uppercase select-none tracking-wider
        border-2 border-[#14121c]
        shadow-[inset_2px_2px_0px_0px_rgba(255,255,255,0.25),inset_-2px_-2px_0px_0px_rgba(0,0,0,0.5),2px_2px_0px_0px_#14121c]
        active:top-[2px] active:left-[2px] active:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.6)]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:top-0 disabled:active:left-0
        transition-none cursor-pointer
        ${variantClass}
        ${sizeClass}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="inline-block shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

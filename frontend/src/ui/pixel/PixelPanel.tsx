/**
 * CORPORATE HELL™ — Pixel Panel Container.
 *
 * Beveled 8-bit containers with CH-16 backgrounds.
 */
import React from 'react'

export type PixelPanelVariant = 'raised' | 'inset' | 'cream' | 'window' | 'cork'

interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PixelPanelVariant
  children: React.ReactNode
}

export const PixelPanel: React.FC<PixelPanelProps> = ({
  variant = 'raised',
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    raised: 'pixel-box-raised text-[#f4ecd8]',
    inset: 'pixel-box-inset text-[#f4ecd8]',
    cream: 'pixel-box-cream text-[#14121c]',
    window: 'pixel-box-window text-[#f4ecd8]',
    cork: 'border-4 border-[#7a4a2d] bg-[#c58a55] text-[#14121c] shadow-[inset_2px_2px_0px_#ded2b6,inset_-2px_-2px_0px_#5c3722]',
  }[variant]

  return (
    <div
      className={`p-3 select-none ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CORPORATE HELL™ — Crisp 16x16 SVG Pixel-Art Icons for CorpOS Apps.
 *
 * Replaces raw OS emojis with cohesive CH-16 palette pixel-art sprites.
 */
import React from 'react'

interface Props {
  appId: string
  size?: number
  className?: string
}

export const PixelAppIcon: React.FC<Props> = ({ appId, size = 28, className = '' }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    shapeRendering: 'crispEdges' as const,
    className: `pixelated shrink-0 ${className}`,
  }

  switch (appId) {
    case 'kanban':
      return (
        <svg {...common}>
          <rect x="1" y="1" width="14" height="14" fill="#c58a55" />
          <rect x="2" y="2" width="12" height="12" fill="#7a4a2d" />
          <rect x="3" y="3" width="3" height="4" fill="#f2a93b" />
          <rect x="7" y="3" width="3" height="3" fill="#8fd3ff" />
          <rect x="11" y="3" width="2" height="5" fill="#b6e52d" />
          <rect x="3" y="8" width="3" height="3" fill="#f4ecd8" />
          <rect x="7" y="7" width="3" height="4" fill="#d9453d" />
        </svg>
      )
    case 'gitbub':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="12" height="12" fill="#14121c" />
          <rect x="4" y="3" width="2" height="10" fill="#8fd3ff" />
          <rect x="6" y="7" width="4" height="2" fill="#b6e52d" />
          <rect x="10" y="4" width="2" height="5" fill="#b6e52d" />
          <rect x="3" y="2" width="4" height="3" fill="#f4ecd8" />
          <rect x="9" y="3" width="4" height="3" fill="#b6e52d" />
          <rect x="3" y="11" width="4" height="3" fill="#3e6ec0" />
        </svg>
      )
    case 'pipeline':
      return (
        <svg {...common}>
          <rect x="1" y="10" width="14" height="4" fill="#4b4a5e" />
          <rect x="2" y="11" width="2" height="2" fill="#f4ecd8" />
          <rect x="7" y="11" width="2" height="2" fill="#f4ecd8" />
          <rect x="12" y="11" width="2" height="2" fill="#f4ecd8" />
          <rect x="4" y="3" width="8" height="6" fill="#3e6ec0" />
          <rect x="6" y="5" width="4" height="2" fill="#b6e52d" />
        </svg>
      )
    case 'awsome':
      return (
        <svg {...common}>
          <rect x="3" y="2" width="10" height="12" fill="#4b4a5e" />
          <rect x="4" y="3" width="8" height="3" fill="#14121c" />
          <rect x="4" y="7" width="8" height="3" fill="#14121c" />
          <rect x="4" y="11" width="8" height="2" fill="#14121c" />
          <rect x="5" y="4" width="2" height="1" fill="#b6e52d" />
          <rect x="5" y="8" width="2" height="1" fill="#8fd3ff" />
          <rect x="9" y="8" width="2" height="1" fill="#f2a93b" />
        </svg>
      )
    case 'nvidiot':
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="10" fill="#2a2838" />
          <rect x="3" y="4" width="10" height="8" fill="#8b5cf6" />
          <rect x="5" y="6" width="6" height="4" fill="#14121c" />
          <rect x="6" y="7" width="4" height="2" fill="#b6e52d" />
          <rect x="1" y="5" width="1" height="2" fill="#f2a93b" />
          <rect x="1" y="9" width="1" height="2" fill="#f2a93b" />
          <rect x="14" y="5" width="1" height="2" fill="#f2a93b" />
          <rect x="14" y="9" width="1" height="2" fill="#f2a93b" />
        </svg>
      )
    case 'chirper':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="8" height="7" fill="#8fd3ff" />
          <rect x="3" y="6" width="10" height="4" fill="#3e6ec0" />
          <rect x="12" y="6" width="2" height="2" fill="#f2a93b" />
          <rect x="9" y="5" width="2" height="2" fill="#14121c" />
          <rect x="5" y="11" width="2" height="2" fill="#f2a93b" />
          <rect x="9" y="11" width="2" height="2" fill="#f2a93b" />
        </svg>
      )
    case 'launch':
      return (
        <svg {...common}>
          <rect x="7" y="1" width="2" height="2" fill="#d9453d" />
          <rect x="6" y="3" width="4" height="7" fill="#f4ecd8" />
          <rect x="7" y="5" width="2" height="2" fill="#8fd3ff" />
          <rect x="4" y="8" width="2" height="3" fill="#d9453d" />
          <rect x="10" y="8" width="2" height="3" fill="#d9453d" />
          <rect x="6" y="11" width="4" height="2" fill="#f2a93b" />
          <rect x="7" y="13" width="2" height="2" fill="#b6e52d" />
        </svg>
      )
    case 'investors':
      return (
        <svg {...common}>
          <rect x="2" y="12" width="12" height="2" fill="#4b4a5e" />
          <rect x="3" y="9" width="2" height="3" fill="#3e6ec0" />
          <rect x="7" y="6" width="2" height="6" fill="#8fd3ff" />
          <rect x="11" y="3" width="2" height="9" fill="#b6e52d" />
          <rect x="10" y="2" width="4" height="1" fill="#f2a93b" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <rect x="1" y="3" width="14" height="10" fill="#f4ecd8" />
          <rect x="2" y="4" width="12" height="1" fill="#3e6ec0" />
          <rect x="4" y="6" width="8" height="1" fill="#3e6ec0" />
          <rect x="6" y="8" width="4" height="1" fill="#d9453d" />
        </svg>
      )
    case 'team':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="4" height="4" fill="#f2cca0" />
          <rect x="2" y="8" width="6" height="5" fill="#3e6ec0" />
          <rect x="9" y="4" width="4" height="4" fill="#e0b080" />
          <rect x="8" y="9" width="6" height="4" fill="#3f8f4e" />
        </svg>
      )
    case 'directive':
      return (
        <svg {...common}>
          <rect x="8" y="1" width="4" height="2" fill="#f2a93b" />
          <rect x="6" y="3" width="4" height="3" fill="#f2a93b" />
          <rect x="4" y="6" width="8" height="2" fill="#b6e52d" />
          <rect x="7" y="8" width="4" height="3" fill="#f2a93b" />
          <rect x="5" y="11" width="4" height="3" fill="#f2a93b" />
        </svg>
      )
    case 'pager':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="10" fill="#2a2838" />
          <rect x="4" y="4" width="8" height="5" fill="#d9453d" />
          <rect x="7" y="5" width="2" height="2" fill="#f4ecd8" />
          <rect x="5" y="10" width="2" height="2" fill="#b6e52d" />
          <rect x="9" y="10" width="2" height="2" fill="#f2a93b" />
        </svg>
      )
    case 'talent':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="6" height="2" fill="#7a4a2d" />
          <rect x="2" y="4" width="12" height="9" fill="#c58a55" />
          <rect x="2" y="7" width="12" height="2" fill="#7a4a2d" />
          <rect x="7" y="7" width="2" height="2" fill="#f2a93b" />
        </svg>
      )
    case 'forge':
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="10" fill="#8b5cf6" />
          <rect x="5" y="5" width="6" height="6" fill="#14121c" />
          <rect x="6" y="6" width="4" height="4" fill="#8fd3ff" />
        </svg>
      )
  }
}

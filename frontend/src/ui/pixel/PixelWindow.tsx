/**
 * CORPORATE HELL™ — CorpOS Draggable Pixel Window.
 *
 * Authentic 90s OS window with title bar, minimize, close,
 * snap-to-grid dragging, and retro bevel frame.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Minus, X, HelpCircle, BarChart2 } from 'lucide-react'
import { audio } from '../../services/audio'
import { useUiStore } from '../../state/uiStore'

interface PixelWindowProps {
  appId: string
  title: string
  icon?: string
  initialX?: number
  initialY?: number
  width?: number | string
  height?: number | string
  onClose?: () => void
  onMinimize?: () => void
  onToggleNerd?: () => void
  hasNerdMode?: boolean
  isNerdMode?: boolean
  children: React.ReactNode
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  appId,
  title,
  icon = '📁',
  initialX = 30,
  initialY = 30,
  width = 680,
  height = 480,
  onClose,
  onMinimize,
  onToggleNerd,
  hasNerdMode = false,
  isNerdMode = false,
  children,
}) => {
  const bringToFront = useUiStore((s) => s.bringToFront)
  const openWindows = useUiStore((s) => s.openWindows)
  const currentWin = openWindows.find((w) => w.appId === appId)
  const zIndex = currentWin?.z || 10
  const isMinimized = currentWin?.isMinimized || false

  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const isDragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    bringToFront(appId)
    // Only drag from titlebar
    if ((e.target as HTMLElement).closest('.window-controls')) return
    isDragging.current = true
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: pos.x,
      winY: pos.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - dragStart.current.mouseX
      const dy = e.clientY - dragStart.current.mouseY
      // Snap to 4px grid for pixel aesthetics
      const rawX = dragStart.current.winX + dx
      const rawY = dragStart.current.winY + dy
      const snappedX = Math.round(rawX / 4) * 4
      const snappedY = Math.round(rawY / 4) * 4

      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 120, snappedX)),
        y: Math.max(32, Math.min(window.innerHeight - 80, snappedY)),
      })
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (isMinimized) return null

  return (
    <div
      onMouseDown={() => bringToFront(appId)}
      className="absolute flex flex-col border-4 border-[#14121c] bg-[#2a2838] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8),inset_2px_2px_0px_0px_#4b4a5e,inset_-2px_-2px_0px_0px_#110f17] select-none text-[#f4ecd8] font-mono"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 72px)',
        zIndex,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Title Bar */}
      {/* ------------------------------------------------------------- */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between bg-[#3e6ec0] px-2 py-1 border-b-2 border-[#14121c] text-white cursor-move select-none shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4)]"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="font-bold text-xs uppercase tracking-wider truncate text-white drop-shadow-[1px_1px_0px_#14121c]">
            {title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="window-controls flex items-center gap-1 shrink-0 ml-2">
          {hasNerdMode && (
            <button
              onClick={() => {
                audio.playLever()
                onToggleNerd?.()
              }}
              title={isNerdMode ? 'Switch to Simple Mode' : 'Switch to Nerd Mode (raw data)'}
              className={`p-1 text-[10px] border border-[#14121c] shadow-[1px_1px_0px_#14121c] ${
                isNerdMode ? 'bg-[#b6e52d] text-[#14121c]' : 'bg-[#4b4a5e] text-white'
              }`}
            >
              <BarChart2 className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={() => {
              audio.playClick()
              onMinimize?.()
            }}
            title="Minimize"
            className="flex items-center justify-center h-5 w-5 bg-[#4b4a5e] hover:bg-[#5c5b70] active:top-[1px] border border-[#14121c] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3),1px_1px_0px_#14121c]"
          >
            <Minus className="h-3 w-3 text-white" />
          </button>

          <button
            onClick={() => {
              audio.playClick()
              onClose?.()
            }}
            title="Close (Esc)"
            className="flex items-center justify-center h-5 w-5 bg-[#d9453d] hover:bg-[#e05851] active:top-[1px] border border-[#14121c] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4),1px_1px_0px_#14121c]"
          >
            <X className="h-3 w-3 text-white font-bold" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Window Body Container */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-auto bg-[#1e1c27] p-2 pixel-scrollbar relative">
        {children}
      </div>

      {/* Subtle Bottom Status Bar */}
      <div className="flex items-center justify-between px-2 py-0.5 bg-[#2a2838] border-t-2 border-[#14121c] text-[10px] text-[#8c8aa0]">
        <span>CorpOS Standard App</span>
        <span>Ready</span>
      </div>
    </div>
  )
}

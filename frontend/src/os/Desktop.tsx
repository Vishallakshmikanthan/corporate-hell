/**
 * CORPORATE HELL™ — CorpOS Desktop Environment (Section 5).
 *
 * Full-screen desktop workspace with stage-based retro wallpaper,
 * authentic icon grid with live notification badges, and window manager.
 */
import React from 'react'
import { useUiStore } from '../state/uiStore'
import { useGameStore } from '../state/gameStore'
import { APP_REGISTRY, AppDefinition } from './appRegistry'
import { WindowManager } from './WindowManager'
import { Dock } from './Dock'
import { audio } from '../services/audio'

export const Desktop: React.FC = () => {
  const openApp = useUiStore((s) => s.openApp)
  const state = useGameStore((s) => s.state)

  const currentStage = state?.stage || 'Seed'

  // Wallpaper styling based on stage progression
  const wallpaperStyle: Record<string, string> = {
    garage: 'bg-[#1b1926]', // Garage / dark retro
    seed: 'bg-[#1e1c2b]', // Brick loft
    series_a: 'bg-[#1a233a]', // Corporate blue floor
    series_b: 'bg-[#14213d]', // High-rise skyline
    scale_up: 'bg-[#181d30]', // Tech campus
    unicorn: 'bg-[#161226]', // Neon penthouse
  }
  const currentWallpaper = wallpaperStyle[currentStage] || 'bg-[#1e1c2b]'

  const handleIconClick = (app: AppDefinition) => {
    // Check unlock requirements
    if (app.unlockStage && currentStage === 'garage' && app.unlockStage !== 'garage') {
      audio.playAlert()
      return
    }
    openApp(app.id)
  }

  return (
    <div className={`relative flex flex-col h-full w-full overflow-hidden ${currentWallpaper} font-mono select-none crt-scanlines`}>
      {/* ----------------------------------------------------------- */}
      {/* Retro Wallpaper Backdrop & Subtle Grid */}
      {/* ----------------------------------------------------------- */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#8fd3ff 1px, transparent 1px), radial-gradient(#8fd3ff 1px, #14121c 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Decorative CorpOS Brand Watermark */}
      <div className="absolute right-8 bottom-14 opacity-20 pointer-events-none text-right">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-[#f4ecd8]">
          CorpOS™ 3.2
        </h1>
        <p className="text-xs uppercase text-[#b6e52d]">
          {state?.name || 'Corporate Hell Inc.'} • {currentStage} Edition
        </p>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Top Quick App Launcher Bar (Always accessible) */}
      {/* ----------------------------------------------------------- */}
      <div className="relative z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#21202e] border-b-2 border-[#14121c] overflow-x-auto pixel-scrollbar shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.6)] pointer-events-auto">
        <span className="text-[10px] uppercase font-bold text-[#b6e52d] mr-1 shrink-0 flex items-center gap-1 select-none">
          <span>⚡</span>
          <span>APPS:</span>
        </span>
        {APP_REGISTRY.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => openApp(app.id)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#14121c] hover:bg-[#3e6ec0] text-[#f4ecd8] hover:text-white border border-[#4b4a5e] hover:border-[#b6e52d] text-[11px] font-bold cursor-pointer shrink-0 active:translate-y-[1px] transition-none"
            title={`Open ${app.title} - ${app.description}`}
          >
            <span className="text-xs">{app.icon}</span>
            <span>{app.title}</span>
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Desktop App Icons Grid (Top Left) */}
      {/* ----------------------------------------------------------- */}
      <div className="relative z-10 flex flex-col flex-wrap gap-4 p-5 max-h-[calc(100vh-120px)] w-fit pointer-events-auto">
        {APP_REGISTRY.map((app) => {
          const badgeValue = app.badge ? app.badge(state) : null

          return (
            <button
              key={app.id}
              type="button"
              onClick={() => handleIconClick(app)}
              className="relative flex flex-col items-center justify-center w-20 p-2 rounded-none cursor-pointer select-none group text-center border border-transparent hover:border-[#8fd3ff]/40 hover:bg-[#3e6ec0]/20 active:bg-[#3e6ec0]/40 transition-none pointer-events-auto"
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center w-12 h-12 bg-[#2a2838] border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] group-hover:border-[#b6e52d] group-hover:scale-105 transition-none">
                <span className="text-2xl">{app.icon}</span>

                {/* Live Notification Badge */}
                {badgeValue && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-none bg-[#d9453d] text-white text-[9px] font-bold border border-[#14121c] flex items-center justify-center shadow-[1px_1px_0px_#14121c]">
                    {badgeValue}
                  </span>
                )}
              </div>

              {/* Icon Title */}
              <span className="mt-1 text-[11px] font-bold uppercase text-[#f4ecd8] tracking-wider drop-shadow-[1px_1px_0px_#14121c] truncate w-full group-hover:text-[#b6e52d]">
                {app.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Draggable Active Windows Layer */}
      {/* ----------------------------------------------------------- */}
      <WindowManager />

      {/* ----------------------------------------------------------- */}
      {/* Bottom Dock / Taskbar */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-auto">
        <Dock />
      </div>
    </div>
  )
}

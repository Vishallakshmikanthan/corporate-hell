/**
 * CORPORATE HELL™ — CorpOS Bottom Taskbar Dock (Section 5).
 *
 * Windows 95/98 styled bottom taskbar with Start button, running app tabs,
 * battery status, volume toggle, and exit to office button.
 */
import React, { useState } from 'react'
import { useUiStore } from '../state/uiStore'
import { useGameStore } from '../state/gameStore'
import { APP_REGISTRY } from './appRegistry'
import { Laptop, Volume2, VolumeX, LogOut, BatteryMedium, Wifi } from 'lucide-react'
import { audio } from '../services/audio'

export const Dock: React.FC = () => {
  const openWindows = useUiStore((s) => s.openWindows)
  const activeAppId = useUiStore((s) => s.activeAppId)
  const openApp = useUiStore((s) => s.openApp)
  const minimizeApp = useUiStore((s) => s.minimizeApp)
  const bringToFront = useUiStore((s) => s.bringToFront)
  const closeLaptop = useUiStore((s) => s.closeLaptop)

  const audioMuted = useGameStore((s) => s.audioMuted)
  const toggleAudioMute = useGameStore((s) => s.toggleAudioMute)
  const state = useGameStore((s) => s.state)

  const [startMenuOpen, setStartMenuOpen] = useState(false)

  const handleTaskClick = (appId: string) => {
    const win = openWindows.find((w) => w.appId === appId)
    if (win?.isMinimized) {
      minimizeApp(appId)
    } else if (activeAppId === appId) {
      minimizeApp(appId)
    } else {
      bringToFront(appId)
    }
  }

  return (
    <div className="relative z-30 flex items-center justify-between h-9 bg-[#2a2838] border-t-2 border-[#14121c] px-2 select-none font-mono shadow-[inset_1px_1px_0px_#4b4a5e]">
      {/* ----------------------------------------------------------- */}
      {/* Start Button & Running App Tabs */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 h-full py-1">
        {/* Start Button */}
        <button
          onClick={() => {
            audio.playClick()
            setStartMenuOpen(!startMenuOpen)
          }}
          className={`
            flex items-center gap-1.5 px-3 h-full border-2 border-[#14121c] text-xs font-bold uppercase cursor-pointer
            shadow-[inset_1px_1px_0px_rgba(255,255,255,0.4),1px_1px_0px_#14121c] active:top-[1px]
            ${startMenuOpen ? 'bg-[#b6e52d] text-[#14121c]' : 'bg-[#4b4a5e] text-[#f4ecd8]'}
          `}
        >
          <span>💾</span>
          <span>CorpOS</span>
        </button>

        {/* Start Menu Popup */}
        {startMenuOpen && (
          <div className="absolute bottom-10 left-2 w-64 bg-[#2a2838] border-4 border-[#14121c] p-2 shadow-[6px_6px_0px_#14121c] flex flex-col gap-1 z-50 animate-slide-up">
            <div className="bg-[#3e6ec0] text-white p-2 border-b-2 border-[#14121c] font-bold text-xs uppercase mb-1">
              CorpOS v3.2 Enterprise
            </div>
            <div className="grid grid-cols-2 gap-1">
              {APP_REGISTRY.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    openApp(app.id)
                    setStartMenuOpen(false)
                  }}
                  className="flex items-center gap-1.5 p-1.5 bg-[#14121c] hover:bg-[#3e6ec0] text-left text-[11px] text-[#f4ecd8] border border-[#4b4a5e] cursor-pointer"
                >
                  <span>{app.icon}</span>
                  <span className="truncate">{app.title}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setStartMenuOpen(false)
                closeLaptop()
              }}
              className="mt-2 p-1.5 bg-[#d9453d] hover:bg-[#e05851] text-white text-xs font-bold uppercase flex items-center justify-center gap-1 border border-[#14121c]"
            >
              <LogOut className="h-3 w-3" /> Exit to Office (Esc)
            </button>
          </div>
        )}

        {/* Open App Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pixel-scrollbar max-w-xl">
          {openWindows.map((win) => {
            const app = APP_REGISTRY.find((a) => a.id === win.appId)
            if (!app) return null
            const isActive = activeAppId === win.appId && !win.isMinimized

            return (
              <button
                key={win.appId}
                onClick={() => handleTaskClick(win.appId)}
                className={`
                  flex items-center gap-1.5 px-2.5 h-full border border-[#14121c] text-[11px] font-bold uppercase truncate max-w-[140px] cursor-pointer
                  shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3),1px_1px_0px_#14121c] active:top-[1px]
                  ${isActive ? 'bg-[#3e6ec0] text-white border-white' : 'bg-[#1e1c27] text-[#ded2b6] hover:bg-[#353346]'}
                `}
              >
                <span>{app.icon}</span>
                <span className="truncate">{app.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Right Tray: Battery, Wifi, Time, Exit */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-2 text-xs text-[#ded2b6]">
        {/* Return to 3D Office Button */}
        <button
          onClick={closeLaptop}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#3f8f4e] hover:bg-[#4d9e5d] text-white text-[11px] font-bold uppercase border border-[#14121c] shadow-[1px_1px_0px_#14121c] cursor-pointer"
          title="Return to 3D Office (Esc)"
        >
          <LogOut className="h-3 w-3" />
          <span>Exit to Office</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudioMute}
          className="p-1 hover:bg-[#4b4a5e] border border-[#14121c]"
        >
          {audioMuted ? <VolumeX className="h-3.5 w-3.5 text-[#d9453d]" /> : <Volume2 className="h-3.5 w-3.5 text-[#b6e52d]" />}
        </button>

        <div className="flex items-center gap-1 bg-[#14121c] px-2 py-0.5 border border-[#4b4a5e] text-[10px]">
          <Wifi className="h-3 w-3 text-[#b6e52d]" />
          <span className="font-bold text-[#8fd3ff] ml-1">
            {state ? `${String(Math.floor(9 + state.tick / 6)).padStart(2, '0')}:${String((state.tick % 6) * 10).padStart(2, '0')}` : '09:00'}
          </span>
        </div>
      </div>
    </div>
  )
}

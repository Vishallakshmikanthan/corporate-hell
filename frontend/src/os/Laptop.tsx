/**
 * CORPORATE HELL™ — CorpOS Laptop Environment (Section 5).
 *
 * Full immersion physical laptop bezel overlay with CRT scanlines,
 * power LED, Esc step-back handling, and Desktop environment.
 */
import React, { useEffect } from 'react'
import { useUiStore } from '../state/uiStore'
import { Desktop } from './Desktop'
import { X, LogOut } from 'lucide-react'
import { audio } from '../services/audio'

export const Laptop: React.FC = () => {
  const focus = useUiStore((s) => s.focus)
  const closeLaptop = useUiStore((s) => s.closeLaptop)
  const activeAppId = useUiStore((s) => s.activeAppId)
  const closeApp = useUiStore((s) => s.closeApp)

  // Esc key navigation: close window first, then close laptop
  useEffect(() => {
    if (focus !== 'laptop') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (activeAppId) {
          closeApp(activeAppId)
        } else {
          closeLaptop()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focus, activeAppId, closeApp, closeLaptop])

  if (focus !== 'laptop') return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 md:p-6 animate-slide-up select-none">
      {/* ----------------------------------------------------------- */}
      {/* Laptop Monitor Outer Bezel Frame */}
      {/* ----------------------------------------------------------- */}
      <div className="relative flex flex-col w-full max-w-6xl h-[92vh] max-h-[820px] bg-[#2a2838] border-8 border-[#14121c] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_3px_3px_0px_#4b4a5e,inset_-3px_-3px_0px_#110f17]">
        {/* Top Bezel: Webcam & Model Branding */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#21202e] border-b-2 border-[#14121c] text-[#8c8aa0] text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-[#f4ecd8] uppercase">
              THINKPAD™ 486-DX
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#3e6ec0] shadow-[0_0_4px_#3e6ec0]" />
          </div>

          {/* Centered Webcam Dot */}
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#14121c] border border-[#4b4a5e] flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-[#8fd3ff]" />
            </div>
            <div className="h-1 w-1 rounded-full bg-[#3f8f4e]" title="Webcam indicator" />
          </div>

          {/* Quick Exit Button on Bezel */}
          <button
            onClick={closeLaptop}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#d9453d] hover:bg-[#e05851] text-white text-[10px] font-bold uppercase border border-[#14121c] shadow-[1px_1px_0px_#14121c] cursor-pointer"
            title="Close Laptop [Esc]"
          >
            <LogOut className="h-3 w-3" />
            <span>Close Lid [Esc]</span>
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Screen Display Glass Container */}
        {/* ----------------------------------------------------------- */}
        <div className="relative flex-1 overflow-hidden border-4 border-[#14121c] bg-[#14121c]">
          <Desktop />
        </div>

        {/* Bottom Bezel: Logo & Green Power LED */}
        <div className="flex items-center justify-between px-4 py-1 bg-[#21202e] border-t-2 border-[#14121c] text-[10px] font-mono text-[#8c8aa0]">
          <span className="text-[9px] uppercase tracking-wider text-[#ded2b6]">
            CorpOS 3.2 Immersive Edition
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase text-[#ded2b6]">PWR</span>
            <div className="h-2 w-2 rounded-full bg-[#b6e52d] shadow-[0_0_6px_#b6e52d] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

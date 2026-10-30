/**
 * CORPORATE HELL™ — CorpOS AWSome Cloud App (Section 6).
 *
 * Server-farm diorama with pluggable rack sprites, traffic crowd
 * queuing at the door vs capacity, tactile wall switches, and big analog bill meter.
 */
import React from 'react'
import { useGameStore } from '../../state/gameStore'
import { Server, Plus, Minus, ShieldCheck, Zap, Database, Activity, ToggleLeft, ToggleRight } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const AwsomeApp: React.FC = () => {
  const infra = useGameStore((s) => s.state?.infra)
  const dispatch = useGameStore((s) => s.dispatch)

  const instances = infra?.instances || 3
  const currentTraffic = infra?.currentTraffic || 420
  const capacity = infra?.capacity || 600
  const monthlyCost = infra?.monthlyCost || 1250
  const autoscale = infra?.autoscale || false
  const cdn = infra?.cdn || false
  const backups = infra?.backups || false
  const isOverCapacity = currentTraffic > capacity

  const handleAdjustInstances = (delta: number) => {
    audio.playLever()
    dispatch({
      type: 'scale_infra',
      instancesDelta: delta,
    })
  }

  const handleToggleSetting = (field: 'autoscale' | 'cdn' | 'backups') => {
    audio.playLever()
    dispatch({
      type: 'scale_infra',
      instancesDelta: 0,
      [field]: !infra?.[field],
    })
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Big Retro Bill Meter */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">☁</span>
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            AWSome Cloud Console
          </span>
          <PixelBadge
            label={isOverCapacity ? '502 OVERLOAD' : 'NOMINAL'}
            variant={isOverCapacity ? 'red' : 'lime'}
          />
        </div>

        {/* Big Retro Analog-Style Bill Meter */}
        <div className="flex items-center gap-2 bg-[#14121c] px-3 py-1 border border-[#4b4a5e]">
          <span className="text-[10px] text-[#ded2b6] uppercase">Monthly Bill:</span>
          <span className="font-bold text-sm text-[#f2a93b]">
            ${monthlyCost.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#8c8aa0]">/mo</span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Server-Farm Diorama & Traffic Crowd */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[220px]">
        {/* Left 2 Cols: Server Racks (Pluggable Units) */}
        <div className="col-span-2 flex flex-col bg-[#14121c] p-3 border-2 border-[#4b4a5e] shadow-[inset_2px_2px_0px_#000000]">
          <div className="flex justify-between items-center mb-2 border-b border-[#4b4a5e] pb-1.5 text-xs text-[#8fd3ff] font-bold">
            <span className="flex items-center gap-1">
              <Server className="h-3.5 w-3.5" /> Pluggable Server Racks ({instances}/16)
            </span>
            <div className="flex items-center gap-1">
              <PixelButton
                size="sm"
                variant="danger"
                icon={<Minus className="h-3 w-3" />}
                onClick={() => handleAdjustInstances(-1)}
                disabled={instances <= 1}
              />
              <PixelButton
                size="sm"
                variant="lime"
                icon={<Plus className="h-3 w-3" />}
                onClick={() => handleAdjustInstances(1)}
                disabled={instances >= 16}
              />
            </div>
          </div>

          {/* Diorama Grid of Rack Units */}
          <div className="grid grid-cols-4 gap-2 flex-1 p-2 overflow-y-auto pixel-scrollbar bg-[#1c1b26] border border-[#2a2838]">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isPlugged = idx < instances
              return (
                <div
                  key={idx}
                  onClick={() => handleAdjustInstances(isPlugged ? -1 : 1)}
                  className={`
                    flex flex-col items-center justify-between p-1.5 border-2 select-none cursor-pointer
                    shadow-[1px_1px_0px_#14121c] hover:brightness-110 active:top-[1px]
                    ${isPlugged ? 'bg-[#2a2838] border-[#3e6ec0]' : 'bg-[#14121c] border-dashed border-[#4b4a5e]/50 opacity-40'}
                  `}
                >
                  <div className="flex justify-between w-full">
                    <span className="text-[8px] text-[#8c8aa0]">R-{idx + 1}</span>
                    {isPlugged && (
                      <div className="h-1.5 w-1.5 rounded-full bg-[#b6e52d] animate-ping" />
                    )}
                  </div>

                  <span className="text-xl my-1">{isPlugged ? '🖳' : '·'}</span>

                  <span className="text-[8px] font-bold uppercase truncate">
                    {isPlugged ? 'Active' : 'Empty'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Traffic Crowd Queuing at the Door */}
          <div className="mt-2.5 p-2 bg-[#2a2838] border border-[#4b4a5e]">
            <div className="flex justify-between items-center text-[10px] text-[#ded2b6] mb-1">
              <span>🚪 Inbound User Traffic vs Gateway Capacity:</span>
              <span className={`font-bold ${isOverCapacity ? 'text-[#d9453d]' : 'text-[#b6e52d]'}`}>
                {currentTraffic} / {capacity} req/s
              </span>
            </div>
            <PixelBar
              value={currentTraffic}
              max={capacity}
              color={isOverCapacity ? 'red' : 'green'}
              size="sm"
            />
            {/* Visual Crowd of tiny sprites */}
            <div className="flex items-center gap-1 mt-1.5 text-xs overflow-hidden">
              <span className="text-[9px] text-[#8c8aa0] shrink-0">Traffic Crowd:</span>
              <div className="flex gap-0.5 truncate text-[11px]">
                {Array.from({ length: Math.min(24, Math.round(currentTraffic / 30)) }).map((_, i) => (
                  <span key={i} title="Active user request">🚶</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Wall Panel Toggle Switches */}
        <div className="flex flex-col bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#f4ecd8] uppercase border-b border-[#4b4a5e] pb-1 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#f2a93b]" /> Wall Panel Switches
            </span>

            {/* Switch 1: Autoscale */}
            <div
              onClick={() => handleToggleSetting('autoscale')}
              className="flex items-center justify-between p-2 bg-[#14121c] border border-[#4b4a5e] cursor-pointer hover:border-[#b6e52d]"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-[#f4ecd8] uppercase">
                  Autoscale
                </span>
                <span className="text-[8px] text-[#8c8aa0]">Auto spin up on traffic</span>
              </div>
              <span className={`text-base font-bold ${autoscale ? 'text-[#b6e52d]' : 'text-[#8c8aa0]'}`}>
                {autoscale ? '[ON]' : '[OFF]'}
              </span>
            </div>

            {/* Switch 2: Cloud CDN */}
            <div
              onClick={() => handleToggleSetting('cdn')}
              className="flex items-center justify-between p-2 bg-[#14121c] border border-[#4b4a5e] cursor-pointer hover:border-[#8fd3ff]"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-[#f4ecd8] uppercase">
                  Cloud CDN
                </span>
                <span className="text-[8px] text-[#8c8aa0]">Caches static assets</span>
              </div>
              <span className={`text-base font-bold ${cdn ? 'text-[#8fd3ff]' : 'text-[#8c8aa0]'}`}>
                {cdn ? '[ON]' : '[OFF]'}
              </span>
            </div>

            {/* Switch 3: Automated Backups */}
            <div
              onClick={() => handleToggleSetting('backups')}
              className="flex items-center justify-between p-2 bg-[#14121c] border border-[#4b4a5e] cursor-pointer hover:border-[#f2a93b]"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-[#f4ecd8] uppercase">
                  Daily Backups
                </span>
                <span className="text-[8px] text-[#8c8aa0]">Restores data on crash</span>
              </div>
              <span className={`text-base font-bold ${backups ? 'text-[#f2a93b]' : 'text-[#8c8aa0]'}`}>
                {backups ? '[ON]' : '[OFF]'}
              </span>
            </div>
          </div>

          <div className="p-2 bg-[#14121c] border border-[#4b4a5e] text-[9px] text-[#8c8aa0]">
            <div>Region: US-East-1 (N. Virginia)</div>
            <div>Uptime: 99.94%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

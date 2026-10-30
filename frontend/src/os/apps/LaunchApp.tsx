/**
 * CORPORATE HELL™ — CorpOS Launch War Room App (Section 6).
 *
 * NASA / Mission-control screen with 4 big status lights, selectable rocket booster channels,
 * red covered launch button, and live traffic explosion graphs.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Rocket, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Flame, Activity } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const LaunchApp: React.FC = () => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [safetyCoverOpen, setSafetyCoverOpen] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'product_hunt',
    'hacker_news',
  ])
  const [isLaunching, setIsLaunching] = useState(false)
  const [liveTraffic, setLiveTraffic] = useState(120)

  // 4 Big Mission Control Lights
  const statusLights = [
    { label: 'Code Quality', status: 'green', desc: '0 blocking bugs' },
    { label: 'Infra Headroom', status: 'green', desc: '16 racks hot-standby' },
    { label: 'Social Buzz', status: 'amber', desc: 'Waitlist: 4,200 emails' },
    { label: 'SRE On-Call', status: 'green', desc: 'Pager active & alert' },
  ]

  const toggleChannel = (id: string) => {
    audio.playClick()
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleFireLaunch = () => {
    audio.playCelebration()
    setIsLaunching(true)
    setLiveTraffic(2400)
    dispatch({
      type: 'launch_product',
      name: 'Product v1.0',
    })
    pushToast({
      title: 'T-MINUS ZERO: LAUNCHED!',
      description: 'Product Hunt #1 spot achieved! Massive traffic spike incoming!',
      severity: 'celebrate',
      appId: 'launch',
    })
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Mission Control Banner */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-[#d9453d]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            Mission Control: Product Launch Deck
          </span>
          <PixelBadge
            label={isLaunching ? 'IN ORBIT' : 'PRE-LAUNCH'}
            variant={isLaunching ? 'lime' : 'amber'}
          />
        </div>

        <div className="flex items-center gap-2 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
          <span className="text-[10px] text-[#ded2b6] uppercase">Readiness:</span>
          <span className="font-bold text-xs text-[#b6e52d]">92% GO FOR LAUNCH</span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center 4 Big Checklist Lights */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        {statusLights.map((light, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 p-2 bg-[#14121c] border-2 border-[#4b4a5e] shadow-[2px_2px_0px_#14121c]"
          >
            {/* Big Bulb */}
            <div
              className={`h-5 w-5 border-2 border-[#14121c] flex items-center justify-center shrink-0 ${
                light.status === 'green'
                  ? 'bg-[#b6e52d] shadow-[0_0_8px_#b6e52d]'
                  : 'bg-[#f2a93b] shadow-[0_0_8px_#f2a93b]'
              }`}
            >
              <div className="h-1.5 w-1.5 bg-white" />
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-[10px] text-[#f4ecd8] uppercase truncate">
                {light.label}
              </span>
              <span className="text-[8px] text-[#8c8aa0] truncate">{light.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center Diorama: Rocket Boosters & Real-Time Traffic Graph */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[220px]">
        {/* Left 2 Cols: Rocket Boosters Channels */}
        <div className="col-span-2 flex flex-col bg-[#14121c] p-3 border-2 border-[#4b4a5e] shadow-[inset_2px_2px_0px_#000000] justify-between">
          <div>
            <span className="text-xs font-bold text-[#8fd3ff] uppercase mb-2 block flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" /> Rocket Launch Boosters (Select Channels)
            </span>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: 'product_hunt', name: 'Product Hunt #1', cost: 'Free', boost: '+40% Tech' },
                { id: 'hacker_news', name: 'Show HN Post', cost: 'Free', boost: '+60% Devs' },
                { id: 'techcrunch', name: 'TechCrunch Exclusive', cost: '$2,500', boost: '+80% VCs' },
                { id: 'twitter_ads', name: 'Chirper Ad Blitz', cost: '$1,200', boost: '+35% Traffic' },
              ].map((ch) => {
                const isSelected = selectedChannels.includes(ch.id)
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`
                      p-2 border-2 cursor-pointer select-none transition-none shadow-[1px_1px_0px_#14121c]
                      ${isSelected ? 'bg-[#2a2838] border-[#b6e52d]' : 'bg-[#1e1c27] border-[#4b4a5e] opacity-60'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[10px] text-[#f4ecd8] uppercase">
                        {ch.name}
                      </span>
                      <span className="text-[9px] font-bold text-[#b6e52d]">
                        {isSelected ? 'ARMED' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[8px] text-[#8c8aa0]">
                      <span>{ch.cost}</span>
                      <span className="text-[#8fd3ff]">{ch.boost}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Traffic Meter */}
          <div className="mt-3 p-2 bg-[#2a2838] border border-[#4b4a5e]">
            <div className="flex justify-between text-[10px] text-[#ded2b6] mb-1 font-bold">
              <span>Telemetry: Inbound User Swarm:</span>
              <span className="text-[#b6e52d]">{liveTraffic} concurrent visitors</span>
            </div>
            <PixelBar
              value={liveTraffic}
              max={3000}
              color={liveTraffic > 2000 ? 'lime' : 'blue'}
              size="sm"
            />
          </div>
        </div>

        {/* Right Col: Big Covered Red Launch Button */}
        <div className="flex flex-col items-center justify-between bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] text-center">
          <div className="w-full">
            <span className="text-xs font-bold text-[#d9453d] uppercase tracking-wider block border-b border-[#4b4a5e] pb-1">
              IGNITION KEY
            </span>
            <span className="text-[9px] text-[#8c8aa0] mt-1 block">
              Lift acrylic safety shield before pressing
            </span>
          </div>

          {/* Big Physical Button with Safety Cover */}
          <div className="relative my-4">
            {/* Protective Cover Toggle */}
            <button
              onClick={() => {
                audio.playLever()
                setSafetyCoverOpen(!safetyCoverOpen)
              }}
              className="text-[9px] uppercase px-2 py-1 bg-[#4b4a5e] text-white border border-[#14121c] mb-2 font-bold cursor-pointer"
            >
              {safetyCoverOpen ? 'Shield: [LIFTED]' : 'Shield: [CLOSED]'}
            </button>

            <button
              onClick={handleFireLaunch}
              disabled={!safetyCoverOpen || isLaunching}
              className={`
                relative h-24 w-24 rounded-none border-4 select-none uppercase font-bold text-xs tracking-wider
                shadow-[4px_4px_0px_#14121c,inset_2px_2px_0px_rgba(255,255,255,0.4)]
                active:top-[2px] active:shadow-none transition-none cursor-pointer
                ${
                  safetyCoverOpen && !isLaunching
                    ? 'bg-[#d9453d] border-[#14121c] text-white hover:brightness-110 animate-pulse'
                    : 'bg-[#4b4a5e] border-[#14121c] text-white/40 cursor-not-allowed'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <Flame className="h-6 w-6" />
                <span>{isLaunching ? 'ACTIVE' : 'LAUNCH'}</span>
              </div>
            </button>
          </div>

          <div className="text-[9px] text-[#8c8aa0]">
            Cannot be undone. 60-second viral surge will test infrastructure.
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CORPORATE HELL™ — CorpOS NVIDIOT GPU App (Section 6).
 *
 * Wall Street trading-floor style GPU spot market, physical BUY/WAIT lever,
 * glowing H100 rack slots, preemption warnings, and chunky model training progress.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { Cpu, TrendingUp, AlertTriangle, Play, Flame } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const NvidiotApp: React.FC = () => {
  const gpuMarket = useGameStore((s) => s.state?.gpuMarket)
  const gpuJobs = useGameStore((s) => s.state?.gpuJobs || [])
  const dispatch = useGameStore((s) => s.dispatch)

  const spotPrice = gpuMarket?.spotPrice || 2.45
  const onDemandPrice = gpuMarket?.onDemandPrice || 4.20
  const availability = Math.round((gpuMarket?.availability || 0.8) * 100)

  const [rentGpus, setRentGpus] = useState(4)

  const handleBuySpot = () => {
    audio.playCash()
    dispatch({
      type: 'rent_gpu',
      ticketId: 'ml-train-01',
      gpus: rentGpus,
      mode: 'spot',
      checkpointing: true,
    })
  }

  const handleRentOnDemand = () => {
    audio.playCash()
    dispatch({
      type: 'rent_gpu',
      ticketId: 'ml-train-01',
      gpus: rentGpus,
      mode: 'on_demand',
      checkpointing: true,
    })
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Trading Floor Ticker (≤ 4 numbers) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[#8b5cf6]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            NVIDIOT GPU Exchange (H100 / B200)
          </span>
        </div>

        {/* Spot Ticker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#b6e52d]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">Spot Price:</span>
            <span className="font-bold text-xs text-[#b6e52d]">
              ${spotPrice.toFixed(2)}/hr
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">On-Demand:</span>
            <span className="font-bold text-xs text-[#8fd3ff]">
              ${onDemandPrice.toFixed(2)}/hr
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Trading Floor Graphic & Slot Matrix */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[220px]">
        {/* Left 2 Cols: GPU Rack Slots Diorama */}
        <div className="col-span-2 flex flex-col bg-[#14121c] p-3 border-2 border-[#4b4a5e] shadow-[inset_2px_2px_0px_#000000]">
          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#4b4a5e] text-xs text-[#8b5cf6] font-bold">
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-[#f2a93b]" /> H100 GPU Cluster Racks
            </span>
            <span className="text-[10px] text-[#ded2b6]">
              Market Availability: {availability}%
            </span>
          </div>

          {/* 8 Slot Racks Matrix */}
          <div className="grid grid-cols-4 gap-2 flex-1 p-2 bg-[#1b1926] border border-[#2a2838]">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isOccupied = idx < gpuJobs.reduce((acc, j) => acc + (j.gpus || 0), 0)
              return (
                <div
                  key={idx}
                  className={`
                    flex flex-col items-center justify-between p-2 border-2 select-none
                    shadow-[1px_1px_0px_#14121c]
                    ${isOccupied ? 'bg-[#2a2838] border-[#8b5cf6]' : 'bg-[#14121c] border-dashed border-[#4b4a5e]/40 opacity-40'}
                  `}
                >
                  <div className="flex justify-between w-full">
                    <span className="text-[8px] text-[#8c8aa0]">GPU-{idx}</span>
                    {isOccupied && (
                      <div className="h-2 w-2 rounded-full bg-[#8b5cf6] animate-pulse" />
                    )}
                  </div>

                  <span className="text-xl my-1">{isOccupied ? '🧠' : '▫'}</span>

                  <span className="text-[8px] font-bold uppercase truncate text-[#8b5cf6]">
                    {isOccupied ? 'Training' : 'Idle'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Active Training Job Progress */}
          <div className="mt-2.5 p-2 bg-[#2a2838] border border-[#4b4a5e]">
            <div className="flex justify-between items-center text-[10px] text-[#ded2b6] mb-1">
              <span>Model Convergence Training Job:</span>
              <span className="font-bold text-[#8b5cf6]">
                Epoch 42 / 100 • Loss 0.041
              </span>
            </div>
            <PixelBar value={42} max={100} color="purple" size="sm" />
          </div>
        </div>

        {/* Right Col: BUY NOW / WAIT Physical Levers */}
        <div className="flex flex-col bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#f4ecd8] uppercase border-b border-[#4b4a5e] pb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#b6e52d]" /> Spot Trading Lever
            </span>

            <div className="p-2 bg-[#14121c] border border-[#4b4a5e]">
              <span className="text-[10px] text-[#ded2b6] uppercase">Cluster Size:</span>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 4, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRentGpus(n)}
                    className={`flex-1 py-1 text-xs font-bold border border-[#14121c] ${
                      rentGpus === n ? 'bg-[#8b5cf6] text-white' : 'bg-[#2a2838] text-[#ded2b6]'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            {/* Lever 1: BUY SPOT */}
            <PixelButton
              variant="lime"
              size="md"
              sound="lever"
              onClick={handleBuySpot}
              className="w-full text-center"
            >
              PULL LEVER: BUY SPOT (${(spotPrice * rentGpus).toFixed(2)}/h)
            </PixelButton>

            {/* Lever 2: ON DEMAND */}
            <PixelButton
              variant="primary"
              size="sm"
              sound="lever"
              onClick={handleRentOnDemand}
              className="w-full text-center"
            >
              LOCK ON-DEMAND (${(onDemandPrice * rentGpus).toFixed(2)}/h)
            </PixelButton>
          </div>

          <div className="p-2 bg-[#14121c] border border-[#4b4a5e] text-[9px] text-[#8c8aa0]">
            <div>Warning: Spot instances can be preempted at high market demand!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

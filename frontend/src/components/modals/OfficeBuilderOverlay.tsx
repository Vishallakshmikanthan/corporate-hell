/**
 * CORPORATE HELL™ — 3D Office Builder Overlay & Catalog.
 *
 * Implements grid-based office customization with spatial adjacency buffs:
 * - Place Ergonomic Desks, AI Supercomputer Racks, Espresso Bars, and Lounges
 * - Balances spatial layout (separating loud sales from deep-work engineers)
 * - Tracks furniture count for Chapter 4 'Build & Equip Office' objective
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import {
  Grid,
  Hammer,
  Coffee,
  Cpu,
  Layers,
  Award,
  DollarSign,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'

interface Props {
  onClose: () => void
}

interface FurnitureItem {
  id: string
  name: string
  category: 'Desks' | 'Compute' | 'Amenities' | 'Executive'
  cost: number
  icon: string
  buffDescription: string
  spatialBonus: string
  lore: string
}

const FURNITURE_CATALOG: FurnitureItem[] = [
  {
    id: 'furn_desk_ergo',
    name: 'Ergonomic Motorized Standing Desk',
    category: 'Desks',
    cost: 1200,
    icon: '🪑',
    buffDescription: '+1 Desk Capacity • +15% Engineering Velocity',
    spatialBonus: 'Place in quiet zone away from sales to prevent distraction penalties.',
    lore: 'Height adjustable with dual-monitor clamp and integrated cable management snake.',
  },
  {
    id: 'furn_server_rack',
    name: 'NVIDIA H100 Supercomputer Rack',
    category: 'Compute',
    cost: 8500,
    icon: '🖥️',
    buffDescription: '+200 TFLOPs AI Compute • -40% LLM Latency',
    spatialBonus: 'Must be placed near ventilation to prevent thermal throttling.',
    lore: 'Liquid-cooled enterprise compute cluster capable of training generative models locally.',
  },
  {
    id: 'furn_espresso_bar',
    name: 'Artisanal Italian Espresso Machine',
    category: 'Amenities',
    cost: 3500,
    icon: '☕',
    buffDescription: '+30% Stamina Recovery • -25% Employee Fatigue',
    spatialBonus: 'Centrally located pantry boosts serendipitous cross-team collaboration.',
    lore: 'Dual-boiler brass portafilter machine with oat milk steamer and custom dark roast beans.',
  },
  {
    id: 'furn_ping_pong',
    name: 'Silicon Valley Startup Ping-Pong Table',
    category: 'Amenities',
    cost: 800,
    icon: '🏓',
    buffDescription: '+20% Team Morale • +10% Culture Score',
    spatialBonus: 'Generates loud shouting; isolate from deep-work engineering clusters.',
    lore: 'Tournament regulation table. Where passive-aggressive sprint disputes are settled.',
  },
  {
    id: 'furn_nap_pod',
    name: 'Zero-Gravity Acoustic Nap Pod',
    category: 'Amenities',
    cost: 2200,
    icon: '🛋️',
    buffDescription: 'Eliminates Sleep Debt • Prevents Burnout Quits',
    spatialBonus: 'Darkened corner placement maximizes rapid 20-minute power naps.',
    lore: 'Soundproof sphere with biometric heart-rate monitor and ambient synthwave audio.',
  },
  {
    id: 'furn_board_suite',
    name: 'Mahogany Executive Boardroom Suite',
    category: 'Executive',
    cost: 18000,
    icon: '🏛️',
    buffDescription: '+25% CEO Governance Power • Unlocks Ch 5 Takeovers',
    spatialBonus: 'Panoramic corner window view provides supreme intimidation bonus.',
    lore: 'Hand-carved table for signing billion-dollar acquisitions and surviving board coups.',
  },
]

export const OfficeBuilderOverlay: React.FC<Props> = ({ onClose }) => {
  const cash = useGameStore((s) => s.state?.cash || 0)
  const career = useGameStore((s) => s.state?.career)
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [activeCategory, setActiveCategory] = useState<string>('All')

  const placedCount = career?.placedFurnitureCount || 4

  const filteredItems =
    activeCategory === 'All'
      ? FURNITURE_CATALOG
      : FURNITURE_CATALOG.filter((f) => f.category === activeCategory)

  const handlePlaceItem = (item: FurnitureItem) => {
    if (cash < item.cost) {
      audio.playBuzzer()
      pushToast({
        title: 'Insufficient Capital!',
        description: `Need $${item.cost.toLocaleString()} to purchase ${item.name}.`,
        severity: 'alert',
      })
      return
    }

    audio.playLever()
    const s = useGameStore.getState().state
    if (s) {
      s.cash -= item.cost
    }
    dispatch({ type: 'place_furniture', itemId: item.id })

    pushToast({
      title: `${item.name} Installed!`,
      description: `Added to office floor! Buff active: ${item.buffDescription}`,
      severity: 'celebrate',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm select-none font-mono">
      <div className="flex flex-col max-w-3xl w-full bg-[#14121c] border-4 border-[#4b4a5e] shadow-[8px_8px_0px_#000] text-[#f4ecd8] max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#2a2838] px-4 py-3 border-b-2 border-[#4b4a5e]">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-[#f2a93b]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4ecd8]">
                Isometric Office Builder Mode
              </h2>
              <span className="text-[10px] text-[#b6e52d]">
                Equipped Items: {placedCount} / 8 Target ({placedCount >= 8 ? '✓ Objective Met' : 'In Progress'})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-0.5 bg-[#4b4a5e] hover:bg-[#d9453d] text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Spatial Synergy Summary Banner */}
        <div className="p-3 bg-[#1e1c2a] border-b-2 border-[#4b4a5e] flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px]">
            <div>
              <span className="text-[#8c8aa0] uppercase block">Deep-Work Zone</span>
              <span className="text-[#b6e52d] font-bold">+15% Dev Velocity</span>
            </div>
            <div className="h-6 w-px bg-[#4b4a5e]" />
            <div>
              <span className="text-[#8c8aa0] uppercase block">Caffeine Hub</span>
              <span className="text-[#8fd3ff] font-bold">+30% Energy Restore</span>
            </div>
            <div className="h-6 w-px bg-[#4b4a5e]" />
            <div>
              <span className="text-[#8c8aa0] uppercase block">Compute Cluster</span>
              <span className="text-[#f2a93b] font-bold">200 TFLOPs Local</span>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1">
            {['All', 'Desks', 'Compute', 'Amenities', 'Executive'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  audio.playClick()
                  setActiveCategory(cat)
                }}
                className={`px-2 py-0.5 text-[9px] uppercase font-bold border border-[#14121c] ${
                  activeCategory === cat
                    ? 'bg-[#3e6ec0] text-white'
                    : 'bg-[#14121c] text-[#ded2b6] hover:bg-[#4b4a5e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="p-4 space-y-2.5 overflow-y-auto pixel-scrollbar flex-1">
          {filteredItems.map((item) => {
            const canAfford = cash >= item.cost

            return (
              <div
                key={item.id}
                className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e] hover:border-[#f2a93b] flex items-center justify-between gap-4"
              >
                {/* Left Item Description */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-[#2a2838] border border-[#4b4a5e] shrink-0">
                    {item.icon}
                  </span>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#f4ecd8] uppercase">
                        {item.name}
                      </span>
                      <span className="text-[9px] bg-[#2a2838] px-1.5 py-0.2 border border-[#4b4a5e] text-[#8fd3ff]">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#b6e52d] font-bold mt-0.5">
                      {item.buffDescription}
                    </p>
                    <p className="text-[9px] text-[#ded2b6] italic">{item.spatialBonus}</p>
                  </div>
                </div>

                {/* Right Cost & Placement Action */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-bold text-[#f2a93b] mb-1">
                    ${item.cost.toLocaleString()}
                  </span>
                  <PixelButton
                    onClick={() => handlePlaceItem(item)}
                    variant={canAfford ? 'warning' : 'neutral'}
                    size="sm"
                    disabled={!canAfford}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Install Item</span>
                  </PixelButton>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <span className="text-[10px] text-[#8c8aa0]">
            Available Treasury:{' '}
            <strong className="text-[#b6e52d]">${cash.toLocaleString()}</strong>
          </span>
          <PixelButton onClick={onClose} variant="primary" size="sm">
            <span>Done Customizing</span>
          </PixelButton>
        </div>
      </div>
    </div>
  )
}

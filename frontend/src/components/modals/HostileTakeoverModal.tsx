/**
 * CORPORATE HELL™ — Hostile Takeovers & M&A Buyouts Modal (Endgame).
 *
 * Implements M&A buyout warfare against rival tech monopolies:
 * - Pear Computer (Consumer Hardware titan)
 * - Macrohard Systems (Enterprise Cloud titan)
 * - GooGle Search & AI (Surveillance & Search titan)
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import {
  Building2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
} from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'

interface Props {
  onClose: () => void
}

interface RivalCorp {
  id: string
  name: string
  ticker: string
  valuation: number
  marketShare: number
  moat: string
  quote: string
  logo: string
  acquired: boolean
}

export const HostileTakeoverModal: React.FC<Props> = ({ onClose }) => {
  const cash = useGameStore((s) => s.state?.cash || 0)
  const career = useGameStore((s) => s.state?.career)
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const acquiredRivals = career?.acquiredRivalIds || []

  const rivals: RivalCorp[] = [
    {
      id: 'rival_pear',
      name: 'Pear Computer Inc.',
      ticker: 'PEAR',
      valuation: 15000000,
      marketShare: 24,
      moat: 'Luxury walled garden & proprietary silicon chips.',
      quote: '"Our margins are sacred. You cannot afford to buy our ecosystem."',
      logo: '🍐',
      acquired: acquiredRivals.includes('rival_pear'),
    },
    {
      id: 'rival_macrohard',
      name: 'Macrohard Systems Corp.',
      ticker: 'HARD',
      valuation: 25000000,
      marketShare: 35,
      moat: 'Legacy enterprise desktop dominance & government contracts.',
      quote: '"We invented the modern cubicle. We will consume you in court."',
      logo: '🪟',
      acquired: acquiredRivals.includes('rival_macrohard'),
    },
    {
      id: 'rival_google',
      name: 'GooGle Search & Autonomous AI',
      ticker: 'GOGL',
      valuation: 40000000,
      marketShare: 41,
      moat: 'Planetary surveillance index & subsea fiber-optic network.',
      quote: '"We know what you searched for 10 years ago. Yield or be deprioritized."',
      logo: '🌐',
      acquired: acquiredRivals.includes('rival_google'),
    },
  ]

  const handleAcquire = (rival: RivalCorp) => {
    if (cash < rival.valuation) {
      audio.playBuzzer()
      pushToast({
        title: 'M&A Bid Rejected!',
        description: `Board of ${rival.name} rejected our tender offer. Need $${(rival.valuation / 1000000).toFixed(1)}M cash reserves.`,
        severity: 'alert',
      })
      return
    }

    audio.playFanfare()
    const updated = [...acquiredRivals, rival.id]
    if (career) {
      career.acquiredRivalIds = updated
    }
    const currentState = useGameStore.getState().state
    if (currentState) {
      currentState.cash -= rival.valuation
    }

    pushToast({
      title: `Hostile Takeover Complete!`,
      description: `Acquired 100% of ${rival.name} (${rival.ticker})! Absorbed +${rival.marketShare}% Global Market Share!`,
      severity: 'celebrate',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none font-mono">
      <div className="flex flex-col max-w-3xl w-full bg-[#14121c] border-4 border-[#4b4a5e] shadow-[8px_8px_0px_#000] text-[#f4ecd8] max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#2a2838] px-4 py-3 border-b-2 border-[#4b4a5e]">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#f2a93b]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4ecd8]">
                Hostile M&A Takeovers & Market Monopolization
              </h2>
              <span className="text-[10px] text-[#b6e52d]">
                Chapter 6: Global Tech Hegemony ({acquiredRivals.length}/3 Titans Conquered)
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

        {/* Content Body */}
        <div className="p-4 space-y-3 overflow-y-auto pixel-scrollbar flex-1">
          {rivals.map((rival) => {
            const canAfford = cash >= rival.valuation

            return (
              <div
                key={rival.id}
                className={`p-3.5 border-2 flex items-center justify-between gap-4 ${
                  rival.acquired
                    ? 'bg-[#1b2b1a] border-[#b6e52d]'
                    : 'bg-[#1e1c2a] border-[#4b4a5e] hover:border-[#8fd3ff]'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-[#2a2838] border border-[#4b4a5e] shrink-0">
                    {rival.logo}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase text-[#f4ecd8]">{rival.name}</h3>
                      <span className="text-[9px] bg-[#14121c] px-1.5 py-0.2 border border-[#4b4a5e] text-[#8fd3ff] font-bold">
                        ${rival.ticker}
                      </span>
                      <span className="text-[9px] text-[#b6e52d] font-bold">
                        {rival.marketShare}% Market Share
                      </span>
                    </div>

                    <p className="text-[10px] text-[#ded2b6] mt-0.5">{rival.moat}</p>
                    <p className="text-[9px] text-[#8c8aa0] italic mt-1">{rival.quote}</p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-bold text-[#b6e52d] mb-1">
                    Buyout: ${(rival.valuation / 1000000).toFixed(1)}M
                  </span>

                  {rival.acquired ? (
                    <span className="text-[10px] font-bold text-[#b6e52d] flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> 100% Acquired
                    </span>
                  ) : (
                    <PixelButton
                      onClick={() => handleAcquire(rival)}
                      variant={canAfford ? 'warning' : 'neutral'}
                      size="sm"
                      disabled={!canAfford}
                    >
                      <span>Execute Buyout</span>
                    </PixelButton>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <span className="text-[10px] text-[#ded2b6]">
            War Chest Reserves:{' '}
            <strong className="text-[#b6e52d]">${cash.toLocaleString()}</strong>
          </span>
          <PixelButton onClick={onClose} variant="primary" size="sm">
            <span>Close M&A Terminal</span>
          </PixelButton>
        </div>
      </div>
    </div>
  )
}

/**
 * CORPORATE HELL™ — CorpOS Investors & Growth App (Section 6).
 *
 * Skyline climb diorama: company building gains floors as stage advances,
 * literal pixel funnel with falling gold coins, and tactile Pitch Investors deck.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Building2, TrendingUp, DollarSign, Award, Target, Sparkles } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const InvestorsApp: React.FC = () => {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [pitching, setPitching] = useState(false)
  const [deckSlide, setDeckSlide] = useState(0)

  const stage = state?.stage || 'garage'
  const valuation = state?.growth?.valuation || 5000000
  const mrr = state?.growth?.mrr || 42000

  // Stages and floor levels
  const stageFloors: Record<string, number> = {
    garage: 1,
    seed: 2,
    series_a: 4,
    series_b: 7,
    scale_up: 10,
    unicorn: 15,
  }
  const floors = stageFloors[stage] || 2

  const handlePitchChoice = (choice: 'traction' | 'ai_buzzword' | 'profit') => {
    audio.playCelebration()
    setPitching(false)

    let resultMsg = ''
    if (choice === 'traction') {
      resultMsg = 'VCs loved your retention metrics! +$750k Term Sheet signed!'
      dispatch({ type: 'pitch_investors', pitchDeckQuality: 92 })
    } else if (choice === 'ai_buzzword') {
      resultMsg = 'Buzzwords hyped up the valuation! Valuation +$2.5M, but expectations skyrocketed!'
      dispatch({ type: 'pitch_investors', pitchDeckQuality: 78 })
    } else {
      resultMsg = 'Profitable SaaS plan intrigued angel investors! +$250k check wired.'
      dispatch({ type: 'pitch_investors', pitchDeckQuality: 88 })
    }

    pushToast({
      title: 'Investor Term Sheet!',
      description: resultMsg,
      severity: 'celebrate',
      appId: 'investors',
    })
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Valuation & MRR (≤ 4 numbers) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#f2a93b]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            Cap Table & Valuation Skyline
          </span>
          <PixelBadge label={stage} variant="amber" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">Valuation:</span>
            <span className="font-bold text-xs text-[#b6e52d]">
              ${(valuation / 1000000).toFixed(1)}M
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">MRR:</span>
            <span className="font-bold text-xs text-[#8fd3ff]">
              ${mrr.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Skyline Climb & Coin Funnel */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-[220px]">
        {/* Left: Skyline Building Climb */}
        <div className="flex flex-col items-center justify-end bg-[#14121c] p-3 border-2 border-[#4b4a5e] shadow-[inset_2px_2px_0px_#000000] relative overflow-hidden">
          {/* Pixel Stars in Night Sky */}
          <div className="absolute top-2 left-2 text-[8px] text-[#8c8aa0]">
            ★ &nbsp;&nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ★
          </div>
          <span className="text-xs font-bold text-[#8fd3ff] uppercase mb-2">
            Corporate Headquarters Tower ({floors} Floors)
          </span>

          {/* Building graphic stacked from floors */}
          <div className="flex flex-col-reverse items-center w-36 border-2 border-[#14121c] bg-[#2a2838] shadow-[3px_3px_0px_#14121c]">
            {/* Ground Floor */}
            <div className="w-full h-8 bg-[#7a4a2d] border-b-2 border-[#14121c] flex items-center justify-around px-2">
              <div className="w-4 h-6 bg-[#ded2b6] border border-[#14121c]" />
              <span className="text-[9px] text-white font-bold">LOBBY</span>
              <div className="w-4 h-6 bg-[#ded2b6] border border-[#14121c]" />
            </div>

            {/* Stage Floors */}
            {Array.from({ length: floors }).map((_, fIdx) => (
              <div
                key={fIdx}
                className="w-full h-7 bg-[#3e6ec0] border-b border-[#14121c] flex items-center justify-around px-2"
              >
                <div className="w-3 h-4 bg-[#8fd3ff] border border-[#14121c] shadow-[inset_1px_1px_0px_#ffffff]" />
                <div className="w-3 h-4 bg-[#8fd3ff] border border-[#14121c] shadow-[inset_1px_1px_0px_#ffffff]" />
                <div className="w-3 h-4 bg-[#8fd3ff] border border-[#14121c] shadow-[inset_1px_1px_0px_#ffffff]" />
              </div>
            ))}

            {/* Roof / Helipad */}
            <div className="w-28 h-4 bg-[#4b4a5e] border-b-2 border-[#14121c] flex items-center justify-center">
              <span className="text-[8px] text-[#b6e52d] font-bold">🚁 [H]</span>
            </div>
          </div>
        </div>

        {/* Right: Literal Coin Funnel & Pitch Mini-Game */}
        <div className="flex flex-col bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] justify-between">
          <div>
            <span className="text-xs font-bold text-[#f4ecd8] uppercase border-b border-[#4b4a5e] pb-1 block flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[#b6e52d]" /> Growth Revenue Funnel
            </span>

            {/* Literal Pixel Funnel with coins */}
            <div className="flex flex-col items-center my-3 bg-[#14121c] p-2 border border-[#4b4a5e]">
              <div className="w-full bg-[#3e6ec0]/30 p-1 text-center text-[9px] text-[#8fd3ff] border border-[#3e6ec0]/40">
                Top: 45,000 Visitors
              </div>
              <div className="w-3/4 bg-[#8b5cf6]/30 p-1 text-center text-[9px] text-[#ded2b6] border border-[#8b5cf6]/40 mt-1">
                Mid: 3,200 Signups
              </div>
              <div className="w-1/2 bg-[#b6e52d]/30 p-1 text-center text-[9px] font-bold text-[#b6e52d] border border-[#b6e52d]/40 mt-1">
                Bottom: 480 Paying Customers 🪙
              </div>
            </div>
          </div>

          {/* Pitch Investors Deck Button */}
          {!pitching ? (
            <PixelButton
              variant="lime"
              size="md"
              icon={<Sparkles className="h-3.5 w-3.5" />}
              onClick={() => {
                audio.playClick()
                setPitching(true)
              }}
              className="w-full"
            >
              Pitch Investors (Series Seed)
            </PixelButton>
          ) : (
            /* Pitch Mini-Game Choices */
            <div className="bg-[#14121c] p-2 border-2 border-[#b6e52d] animate-slide-up">
              <span className="text-[10px] text-[#b6e52d] font-bold uppercase block mb-1.5">
                Select Your Pitch Hook to VCs:
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handlePitchChoice('traction')}
                  className="p-1.5 bg-[#2a2838] hover:bg-[#3e6ec0] text-left text-[10px] text-[#f4ecd8] border border-[#14121c]"
                >
                  📊 "Net Retention is 140% and payback is 3 months."
                </button>
                <button
                  onClick={() => handlePitchChoice('ai_buzzword')}
                  className="p-1.5 bg-[#2a2838] hover:bg-[#8b5cf6] text-left text-[10px] text-[#f4ecd8] border border-[#14121c]"
                >
                  🧠 "We are an autonomous agentic neural substrate."
                </button>
                <button
                  onClick={() => handlePitchChoice('profit')}
                  className="p-1.5 bg-[#2a2838] hover:bg-[#b6e52d] hover:text-[#14121c] text-left text-[10px] text-[#f4ecd8] border border-[#14121c]"
                >
                  🪙 "Default alive. Profitable today. We choose our partners."
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

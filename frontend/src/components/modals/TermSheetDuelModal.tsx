/**
 * CORPORATE HELL™ — Term Sheet Duel & Venture Contract Modal.
 *
 * High-stakes term sheet negotiation screen for Chapter 3 & beyond.
 * Players evaluate competing VC term sheets, balance valuation vs dilution,
 * and identify toxic predatory clauses (liquidation preferences & board coups).
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import { FileText, DollarSign, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react'

interface Props {
  onClose: () => void
}

interface TermSheet {
  id: string
  firmName: string
  partnerName: string
  investmentAmount: number
  equityPct: number
  valuation: number
  boardSeatsDemanded: number
  hasToxicLiquidationPref: boolean // 2x participating
  founderVestingYears: number
  prestigeTier: 'S' | 'A' | 'B'
  badgeColor: string
  reputationBuff: string
  quote: string
  warnings: string[]
}

export const TermSheetDuelModal: React.FC<Props> = ({ onClose }) => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)
  const career = useGameStore((s) => s.state?.career)

  const [selectedOfferId, setSelectedOfferId] = useState<string>('ts_sequoia')

  const offers: TermSheet[] = [
    {
      id: 'ts_sequoia',
      firmName: 'Sand Hill Sequoia Partners',
      partnerName: 'Brad Thornwood',
      investmentAmount: 1500000,
      equityPct: 18,
      valuation: 8333333,
      boardSeatsDemanded: 1,
      hasToxicLiquidationPref: false,
      founderVestingYears: 4,
      prestigeTier: 'S',
      badgeColor: '#b6e52d',
      reputationBuff: '+25% Talent Attraction & Tier-1 Press',
      quote: '"We back generational category kings. Don\'t make us regret this check, kid."',
      warnings: ['Aggressive quarterly growth targets', 'Standard 4-year vesting schedule'],
    },
    {
      id: 'ts_yc_angel',
      firmName: 'Orange Hacker Accelerator',
      partnerName: 'Garry Tech',
      investmentAmount: 1000000,
      equityPct: 12,
      valuation: 8333333,
      boardSeatsDemanded: 0,
      hasToxicLiquidationPref: false,
      founderVestingYears: 0,
      prestigeTier: 'A',
      badgeColor: '#f2a93b',
      reputationBuff: '+35% Organic Viral Launch Traction',
      quote: '"Make something people actually want. No board seats. Founder retains 100% governance."',
      warnings: ['Lower total cash injection ($1.0M vs $1.5M)', 'Self-guided roadmap'],
    },
    {
      id: 'ts_vulture_fund',
      firmName: 'Degen Vulture Capital',
      partnerName: 'Chadwick Sterling IV',
      investmentAmount: 2500000,
      equityPct: 32,
      valuation: 7812500,
      boardSeatsDemanded: 2,
      hasToxicLiquidationPref: true,
      founderVestingYears: 4,
      prestigeTier: 'B',
      badgeColor: '#d9453d',
      reputationBuff: 'Massive Cash Injection ($2.5M Runway)',
      quote: '"Here is a heavy bag of cash. We want two board seats and double liquidation rights."',
      warnings: [
        '⚠️ TOXIC: Demands 2 Board Seats (High Coup Risk in Ch 5!)',
        '⚠️ TOXIC: 2x Participating Liquidation Preference (Investors get paid double before you get $1)',
      ],
    },
  ]

  const activeOffer = offers.find((o) => o.id === selectedOfferId) || offers[0]

  const handleSignTermSheet = () => {
    audio.playDing()
    dispatch({
      type: 'sign_term_sheet_offer',
      offerId: activeOffer.id,
    })

    pushToast({
      title: 'Term Sheet Signed!',
      description: `Secured $${(activeOffer.investmentAmount / 1000000).toFixed(1)}M Seed round from ${activeOffer.firmName}!`,
      severity: 'celebrate',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none font-mono">
      <div className="flex flex-col max-w-3xl w-full bg-[#14121c] border-4 border-[#4b4a5e] shadow-[8px_8px_0px_#000] text-[#f4ecd8] max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#2a2838] px-4 py-3 border-b-2 border-[#4b4a5e]">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#8fd3ff]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4ecd8]">
                Venture Capital Seed Term Sheet Duel
              </h2>
              <span className="text-[10px] text-[#b6e52d]">
                Chapter 3: Institutional Fundraising Milestone
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

        {/* 3-Column Pitch Deck Selector */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#1e1c2a] border-b-2 border-[#4b4a5e]">
          {offers.map((offer) => {
            const isSelected = offer.id === selectedOfferId
            return (
              <button
                key={offer.id}
                onClick={() => {
                  audio.playClick()
                  setSelectedOfferId(offer.id)
                }}
                className={`p-2.5 text-left flex flex-col justify-between border-2 transition-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#2a2838] border-[#b6e52d] shadow-[2px_2px_0px_#b6e52d]'
                    : 'bg-[#14121c] border-[#4b4a5e] hover:border-[#8fd3ff]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 border border-[#14121c] text-[#14121c]"
                      style={{ backgroundColor: offer.badgeColor }}
                    >
                      Tier {offer.prestigeTier}
                    </span>
                    <span className="text-xs font-bold text-[#b6e52d]">
                      ${(offer.investmentAmount / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#f4ecd8] leading-tight line-clamp-1">
                    {offer.firmName}
                  </h4>
                  <span className="text-[9px] text-[#8c8aa0]">{offer.partnerName}</span>
                </div>

                <div className="mt-2 text-[9px] text-[#ded2b6] flex items-center justify-between border-t border-[#4b4a5e] pt-1">
                  <span>{offer.equityPct}% Dilution</span>
                  <span>{offer.boardSeatsDemanded} Seats</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detailed Contract Clause Inspection */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Hero Firm Banner */}
          <div className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#f4ecd8]">{activeOffer.firmName}</h3>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 text-[#14121c]"
                  style={{ backgroundColor: activeOffer.badgeColor }}
                >
                  Tier {activeOffer.prestigeTier} Syndicate
                </span>
              </div>
              <p className="text-[10px] text-[#8fd3ff] italic mt-1">{activeOffer.quote}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase text-[#8c8aa0] block">Post-Money Valuation</span>
              <span className="text-base font-bold text-[#b6e52d]">
                ${(activeOffer.valuation / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>

          {/* Key Deal Terms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-[#2a2838] border border-[#4b4a5e]">
              <span className="text-[9px] uppercase text-[#8c8aa0] block">Cash Injection</span>
              <span className="text-sm font-bold text-[#b6e52d]">
                ${activeOffer.investmentAmount.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-[#2a2838] border border-[#4b4a5e]">
              <span className="text-[9px] uppercase text-[#8c8aa0] block">Equity Dilution</span>
              <span className="text-sm font-bold text-[#f2a93b]">{activeOffer.equityPct}%</span>
            </div>
            <div className="p-2.5 bg-[#2a2838] border border-[#4b4a5e]">
              <span className="text-[9px] uppercase text-[#8c8aa0] block">Board Seats</span>
              <span
                className={`text-sm font-bold ${
                  activeOffer.boardSeatsDemanded >= 2
                    ? 'text-[#d9453d]'
                    : activeOffer.boardSeatsDemanded === 1
                    ? 'text-[#f2a93b]'
                    : 'text-[#b6e52d]'
                }`}
              >
                {activeOffer.boardSeatsDemanded === 0
                  ? '0 (Clean SAFE)'
                  : `${activeOffer.boardSeatsDemanded} Investor Seat`}
              </span>
            </div>
            <div className="p-2.5 bg-[#2a2838] border border-[#4b4a5e]">
              <span className="text-[9px] uppercase text-[#8c8aa0] block">Liquidation Pref</span>
              <span
                className={`text-sm font-bold ${
                  activeOffer.hasToxicLiquidationPref ? 'text-[#d9453d]' : 'text-[#b6e52d]'
                }`}
              >
                {activeOffer.hasToxicLiquidationPref ? '2x Participating' : '1x Non-Part.'}
              </span>
            </div>
          </div>

          {/* Partner Synergies & Perks */}
          <div className="p-3 bg-[#1e1c2a] border border-[#3e6ec0]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-[#8fd3ff]" />
              <h4 className="text-[10px] font-bold uppercase text-[#8fd3ff]">
                Investor Network & Strategic Value:
              </h4>
            </div>
            <p className="text-[11px] text-[#f4ecd8]">{activeOffer.reputationBuff}</p>
          </div>

          {/* Critical Warnings & Gotchas */}
          <div className="p-3 bg-[#1e1c2a] border border-[#d9453d]">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="h-4 w-4 text-[#d9453d]" />
              <h4 className="text-[10px] font-bold uppercase text-[#d9453d]">
                Legal Due Diligence & Risks:
              </h4>
            </div>
            <ul className="space-y-1 text-[10px] text-[#ded2b6]">
              {activeOffer.warnings.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#f2a93b]">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ded2b6]">
              Selected:{' '}
              <strong className="text-[#8fd3ff]">{activeOffer.firmName}</strong>
            </span>
            <span className="text-[9px] text-[#8c8aa0]">
              Irrevocable execution of legal investment agreement.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#4b4a5e] hover:bg-[#5c5b70] text-[#f4ecd8] text-xs font-bold uppercase"
            >
              Pass
            </button>
            <button
              onClick={handleSignTermSheet}
              className="px-4 py-1.5 bg-[#b6e52d] hover:bg-[#cbf443] text-[#14121c] text-xs font-bold uppercase border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Sign Term Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

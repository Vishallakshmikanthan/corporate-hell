/**
 * CORPORATE HELL™ — Co-Founder Equity Negotiation Modal.
 *
 * Interactive cap table negotiation screen for Chapter 3 (The Garage & Pre-Seed).
 * The player balances founder control vs co-founder morale across Yuki, Gary, and Ellen.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import { PieChart, ShieldAlert, Users, Award, CheckCircle2, AlertTriangle } from 'lucide-react'

interface Props {
  onClose: () => void
}

interface CoFounder {
  id: string
  name: string
  role: string
  archetype: string
  avatar: string
  demandedPct: number
  offeredPct: number
}

export const CoFounderNegotiationModal: React.FC<Props> = ({ onClose }) => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)
  const career = useGameStore((s) => s.state?.career)

  // Initial co-founder candidates
  const [coFounders, setCoFounders] = useState<CoFounder[]>([
    {
      id: 'emp_yuki',
      name: 'Yuki Tanaka',
      role: 'Chief Architect / AI Lead',
      archetype: '10x Genius Hacker',
      avatar: '💻',
      demandedPct: 22,
      offeredPct: 20,
    },
    {
      id: 'emp_gary',
      name: 'Gary Vance',
      role: 'Head of Infrastructure',
      archetype: 'DevOps & SysAdmin Veteran',
      avatar: '⚙️',
      demandedPct: 18,
      offeredPct: 15,
    },
    {
      id: 'emp_ellen',
      name: 'Ellen Hayes',
      role: 'Chief Growth Officer',
      archetype: 'Viral Growth Marketer',
      avatar: '🚀',
      demandedPct: 15,
      offeredPct: 15,
    },
  ])

  const [founderPct, setFounderPct] = useState<number>(50)

  // Calculate total equity allocated
  const totalAllocated = founderPct + coFounders.reduce((sum, c) => sum + c.offeredPct, 0)
  const remainingEquity = 100 - totalAllocated

  const handleUpdateCoFounder = (id: string, delta: number) => {
    audio.playClick()
    setCoFounders((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const newPct = Math.max(0, Math.min(40, c.offeredPct + delta))
        return { ...c, offeredPct: newPct }
      })
    )
  }

  const handleFounderChange = (delta: number) => {
    audio.playClick()
    setFounderPct((prev) => Math.max(10, Math.min(100, prev + delta)))
  }

  const calculateSatisfaction = (offered: number, demanded: number): number => {
    if (offered >= demanded) return Math.min(100, 80 + (offered - demanded) * 4)
    const deficit = demanded - offered
    return Math.max(10, 80 - deficit * 10)
  }

  const handleFinalize = () => {
    if (totalAllocated !== 100) {
      audio.playBuzzer()
      pushToast({
        title: 'Invalid Cap Table!',
        description: `Total equity must equal exactly 100% (currently ${totalAllocated}%).`,
        severity: 'alert',
      })
      return
    }

    const payload = coFounders.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      equityPct: c.offeredPct,
      satisfaction: calculateSatisfaction(c.offeredPct, c.demandedPct),
    }))

    dispatch({
      type: 'split_founder_equity',
      coFounders: payload,
      founderEquityPct: founderPct,
    })

    audio.playDing()
    pushToast({
      title: 'Founders Agreement Executed!',
      description: `Cap Table locked: CEO retains ${founderPct}% voting equity.`,
      severity: 'celebrate',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none font-mono">
      <div className="flex flex-col max-w-2xl w-full bg-[#14121c] border-4 border-[#4b4a5e] shadow-[8px_8px_0px_#000] text-[#f4ecd8] max-h-[90vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#2a2838] px-4 py-3 border-b-2 border-[#4b4a5e]">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#b6e52d]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4ecd8]">
                Founding Cap Table & Equity Split
              </h2>
              <span className="text-[10px] text-[#8fd3ff]">
                Chapter 3: The Garage & Pre-Seed Milestone
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
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Cap Table Status Banner */}
          <div className="flex items-center justify-between p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e]">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-[9px] uppercase text-[#8c8aa0] block">Allocated</span>
                <span
                  className={`text-lg font-bold ${
                    totalAllocated === 100
                      ? 'text-[#b6e52d]'
                      : totalAllocated > 100
                      ? 'text-[#d9453d]'
                      : 'text-[#f2a93b]'
                  }`}
                >
                  {totalAllocated}%
                </span>
              </div>
              <div className="h-8 w-px bg-[#4b4a5e]" />
              <div className="text-center">
                <span className="text-[9px] uppercase text-[#8c8aa0] block">Remaining</span>
                <span className="text-lg font-bold text-[#8fd3ff]">{remainingEquity}%</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#ded2b6] block">
                {founderPct > 50 ? (
                  <span className="text-[#b6e52d] flex items-center justify-end gap-1 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Founder Absolute Majority (&gt;50%)
                  </span>
                ) : founderPct >= 40 ? (
                  <span className="text-[#f2a93b] flex items-center justify-end gap-1 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Plurality Stake (Vulnerable)
                  </span>
                ) : (
                  <span className="text-[#d9453d] flex items-center justify-end gap-1 font-bold">
                    <ShieldAlert className="h-3.5 w-3.5" /> Minority Stake (Coup Risk in Ch 5)
                  </span>
                )}
              </span>
              <span className="text-[9px] text-[#8c8aa0]">Standard 4-Year Vesting with 1-Year Cliff</span>
            </div>
          </div>

          {/* CEO / Founder Stake Slider Card */}
          <div className="p-3 bg-[#2a2838] border-2 border-[#b6e52d]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#b6e52d]">You (Founder & CEO)</h3>
                  <span className="text-[10px] text-[#ded2b6]">Executive Vision & Board Control</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFounderChange(-5)}
                  className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-sm font-bold border border-[#4b4a5e]"
                >
                  -5%
                </button>
                <button
                  onClick={() => handleFounderChange(-1)}
                  className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-xs font-bold border border-[#4b4a5e]"
                >
                  -1%
                </button>
                <span className="text-base font-bold text-[#b6e52d] w-12 text-center">
                  {founderPct}%
                </span>
                <button
                  onClick={() => handleFounderChange(1)}
                  className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-xs font-bold border border-[#4b4a5e]"
                >
                  +1%
                </button>
                <button
                  onClick={() => handleFounderChange(5)}
                  className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-sm font-bold border border-[#4b4a5e]"
                >
                  +5%
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full bg-[#14121c] overflow-hidden border border-[#14121c]">
              <div
                className="h-full bg-[#b6e52d] transition-all duration-200"
                style={{ width: `${founderPct}%` }}
              />
            </div>
          </div>

          {/* Co-Founders List */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-[#8c8aa0] tracking-wider">
              Recruited Co-Founders & Demands:
            </h4>
            {coFounders.map((cf) => {
              const satisfaction = calculateSatisfaction(cf.offeredPct, cf.demandedPct)
              const isHappy = satisfaction >= 80
              const isMad = satisfaction < 50

              return (
                <div
                  key={cf.id}
                  className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cf.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#f4ecd8]">{cf.name}</span>
                          <span className="text-[9px] bg-[#2a2838] px-1.5 py-0.5 border border-[#4b4a5e] text-[#8fd3ff]">
                            {cf.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#8c8aa0]">
                          Demands {cf.demandedPct}% • {cf.archetype}
                        </span>
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCoFounder(cf.id, -1)}
                        className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-xs font-bold border border-[#4b4a5e]"
                      >
                        -1%
                      </button>
                      <span
                        className={`text-sm font-bold w-10 text-center ${
                          isHappy ? 'text-[#b6e52d]' : isMad ? 'text-[#d9453d]' : 'text-[#f2a93b]'
                        }`}
                      >
                        {cf.offeredPct}%
                      </span>
                      <button
                        onClick={() => handleUpdateCoFounder(cf.id, 1)}
                        className="px-2 py-1 bg-[#14121c] hover:bg-[#4b4a5e] text-xs font-bold border border-[#4b4a5e]"
                      >
                        +1%
                      </button>
                    </div>
                  </div>

                  {/* Reaction meter */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#2a2838]">
                    <span className="text-[#8c8aa0]">
                      Satisfaction:{' '}
                      <strong
                        className={isHappy ? 'text-[#b6e52d]' : isMad ? 'text-[#d9453d]' : 'text-[#f2a93b]'}
                      >
                        {satisfaction}%
                      </strong>
                    </span>
                    <span className="italic text-[9px] text-[#ded2b6]">
                      {isHappy
                        ? '🎉 "Hyped to build this unicorn with you!" (+25% Speed)'
                        : isMad
                        ? '⚠️ "This is insulting. I will seek other offers." (Quit Risk)'
                        : '😐 "Acceptable, let us get to work."'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <span className="text-[10px] text-[#8c8aa0]">
            {totalAllocated === 100 ? (
              <span className="text-[#b6e52d] font-bold">✓ Ready for Legal Execution</span>
            ) : (
              <span className="text-[#f2a93b]">Adjust stakes until allocated is 100%</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#4b4a5e] hover:bg-[#5c5b70] text-[#f4ecd8] text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalize}
              disabled={totalAllocated !== 100}
              className={`px-4 py-1.5 text-xs font-bold uppercase border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] ${
                totalAllocated === 100
                  ? 'bg-[#b6e52d] hover:bg-[#cbf443] text-[#14121c] cursor-pointer'
                  : 'bg-[#4b4a5e] text-[#8c8aa0] cursor-not-allowed opacity-50'
              }`}
            >
              Execute Cap Table
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CORPORATE HELL™ — Roguelite End-of-Day 3-Card Startup Perk Draft (Option B).
 *
 * Balatro-inspired synergy builder: pick 1 of 3 randomized Startup Perks,
 * Legendary Hires, or Cursed Deals at the end of each day to stack multipliers.
 */
import React from 'react'
import { useGamificationStore, PerkRarity, StartupPerk } from '../../state/gamificationStore'
import { useGameStore } from '../../state/gameStore'
import { Sparkles, Zap, Skull, Crown, ShieldCheck } from 'lucide-react'

const RARITY_STYLES: Record<
  PerkRarity,
  { border: string; headerBg: string; badgeText: string; label: string; icon: React.ReactNode }
> = {
  common: {
    border: 'border-[#8fd3ff]',
    headerBg: 'bg-[#223552]',
    badgeText: 'text-[#8fd3ff]',
    label: 'COMMON PERK',
    icon: <ShieldCheck className="h-4 w-4 text-[#8fd3ff]" />,
  },
  rare: {
    border: 'border-[#c084fc]',
    headerBg: 'bg-[#361d52]',
    badgeText: 'text-[#e9d5ff]',
    label: 'RARE SYNERGY',
    icon: <Zap className="h-4 w-4 text-[#c084fc]" />,
  },
  legendary: {
    border: 'border-[#f2a93b]',
    headerBg: 'bg-[#4a310a]',
    badgeText: 'text-[#fde68a]',
    label: 'LEGENDARY',
    icon: <Crown className="h-4 w-4 text-[#f2a93b]" />,
  },
  cursed: {
    border: 'border-[#d9453d]',
    headerBg: 'bg-[#451212]',
    badgeText: 'text-[#fecaca]',
    label: 'CURSED DEAL',
    icon: <Skull className="h-4 w-4 text-[#ff6b6b]" />,
  },
}

export const PerkDraftModal: React.FC = () => {
  const isOpen = useGamificationStore((s) => s.isPerkDraftOpen)
  const draftChoices = useGamificationStore((s) => s.draftChoices)
  const activePerks = useGamificationStore((s) => s.activePerks)
  const selectPerk = useGamificationStore((s) => s.selectPerk)
  const closePerkDraft = useGamificationStore((s) => s.closePerkDraft)
  const setPlaying = useGameStore((s) => s.setPlaying)

  if (!isOpen || draftChoices.length === 0) return null

  const handlePick = (perk: StartupPerk) => {
    selectPerk(perk.id, (moraleDelta) => {
      const st = useGameStore.getState().state
      if (st) {
        Object.values(st.employees).forEach((emp) => {
          if (emp.active) {
            emp.morale = Math.max(5, Math.min(100, emp.morale + moraleDelta))
          }
        })
        useGameStore.setState({ state: { ...st } })
      }
    })
    setPlaying(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14121c]/90 p-4 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-4xl bg-[#1e1c2b] border-4 border-[#14121c] shadow-[8px_8px_0px_#000000] p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#4b4a5e] pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-[#b6e52d]" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#f4ecd8]">
                Daily Startup Perk Draft
              </h2>
              <p className="text-[11px] text-[#8fd3ff]">
                Choose 1 permanent upgrade to stack synergies for your run ({activePerks.length} active)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closePerkDraft()
              setPlaying(true)
            }}
            className="px-3 py-1 bg-[#2a2838] hover:bg-[#4b4a5e] text-[#ded2b6] text-[10px] font-bold uppercase border-2 border-[#14121c] cursor-pointer"
          >
            Skip Draft
          </button>
        </div>

        {/* 3 Draft Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {draftChoices.map((perk) => {
            const style = RARITY_STYLES[perk.rarity]
            return (
              <button
                key={perk.id}
                type="button"
                onClick={() => handlePick(perk)}
                className={`group flex flex-col justify-between text-left bg-[#14121c] border-2 ${style.border} shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_8px_0px_#000000] active:translate-y-0 transition-all cursor-pointer overflow-hidden`}
              >
                <div>
                  {/* Card Top Banner */}
                  <div className={`flex items-center justify-between px-3 py-2 ${style.headerBg} border-b-2 border-[#14121c]`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${style.badgeText}`}>
                      {style.label}
                    </span>
                    {style.icon}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-[#f4ecd8] uppercase group-hover:text-[#b6e52d]">
                        {perk.name}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-[#2a2838] text-[#8c8aa0] text-[9px] font-bold uppercase border border-[#4b4a5e]">
                        {perk.tag}
                      </span>
                    </div>

                    <p className="text-xs text-[#f4ecd8] leading-relaxed font-semibold mb-3">
                      {perk.description}
                    </p>

                    <p className="text-[10px] text-[#8c8aa0] italic border-t border-[#2a2838] pt-2">
                      "{perk.flavor}"
                    </p>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="px-4 py-2.5 bg-[#2a2838] group-hover:bg-[#b6e52d] group-hover:text-[#14121c] text-[#b6e52d] text-center text-xs font-bold uppercase tracking-wider border-t-2 border-[#14121c]">
                  Draft This Perk →
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

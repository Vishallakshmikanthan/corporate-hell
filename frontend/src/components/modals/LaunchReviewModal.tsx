/**
 * CORPORATE HELL™ — 4-Critic Product Launch Review Reveal Modal (Option D).
 *
 * Game Dev Tycoon-inspired launch climax: name your release, pick a satirical
 * buzzword, launch the rocket, and watch 4 tech critics reveal 1-10 scores
 * one-by-one with drumroll audio, confetti, and a viral cash surge!
 */
import React, { useEffect, useState } from 'react'
import { useGamificationStore, LaunchReviewResult } from '../../state/gamificationStore'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import { Rocket, Sparkles, TrendingUp, Users, DollarSign, Star } from 'lucide-react'

const BUZZWORDS = [
  'Agentic AI',
  'Blazingly Fast',
  'Zero-Trust',
  'Cloud-Native',
  'Hyper-Scale',
  'Quantum-Ready',
]

const PRODUCT_NAMES = [
  'SynergyOS',
  'SlopGPT',
  'CloudBench',
  'VibeStack',
  'MetricPulse',
  'AutoJira',
]

export const LaunchReviewModal: React.FC = () => {
  const isOpen = useGamificationStore((s) => s.isLaunchModalOpen)
  const closeLaunchModal = useGamificationStore((s) => s.closeLaunchModal)
  const executeProductLaunch = useGamificationStore((s) => s.executeProductLaunch)
  const triggerConfetti = useGamificationStore((s) => s.triggerConfetti)
  const triggerScreenShake = useGamificationStore((s) => s.triggerScreenShake)
  const openPerkDraft = useGamificationStore((s) => s.openPerkDraft)
  const launchesCompleted = useGamificationStore((s) => s.launchesCompleted)
  const codePoints = useGamificationStore((s) => s.codePoints)
  const designPoints = useGamificationStore((s) => s.designPoints)
  const hypePoints = useGamificationStore((s) => s.hypePoints)

  const [productName, setProductName] = useState(
    `${PRODUCT_NAMES[launchesCompleted % PRODUCT_NAMES.length]} v${launchesCompleted + 1}.0`
  )
  const [buzzword, setBuzzword] = useState(BUZZWORDS[0])
  const [result, setResult] = useState<LaunchReviewResult | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)

  // Reset form when opened fresh
  useEffect(() => {
    if (isOpen) {
      setProductName(
        `${PRODUCT_NAMES[launchesCompleted % PRODUCT_NAMES.length]} v${launchesCompleted + 1}.0`
      )
      setResult(null)
      setRevealedCount(0)
    }
  }, [isOpen, launchesCompleted])

  // Step-by-step animated critic reveal with drumroll audio!
  useEffect(() => {
    if (!result) return
    if (revealedCount >= result.reviews.length) return

    const timer = setTimeout(() => {
      audio.playDrumrollTick(revealedCount)
      const next = revealedCount + 1
      setRevealedCount(next)

      if (next === result.reviews.length) {
        setTimeout(() => {
          audio.playCelebration()
          triggerConfetti()
        }, 250)
      }
    }, 550)

    return () => clearTimeout(timer)
  }, [result, revealedCount, triggerConfetti])

  if (!isOpen) return null

  const handleLaunch = () => {
    audio.playBoot()
    triggerScreenShake()
    const res = executeProductLaunch(productName.trim() || 'Product v1.0', buzzword, (cash) => {
      const st = useGameStore.getState().state
      if (st) {
        st.cash += cash
        useGameStore.setState({ state: { ...st } })
      }
    })
    setResult(res)
    setRevealedCount(0)
  }

  const allRevealed = result !== null && revealedCount >= result.reviews.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14121c]/90 p-4 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-2xl bg-[#1e1c2b] border-4 border-[#14121c] shadow-[8px_8px_0px_#000000] p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#4b4a5e] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Rocket className="h-6 w-6 text-[#b6e52d]" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#f4ecd8]">
                {result ? `LAUNCHED: ${result.buzzword} ${result.productName}` : 'READY FOR PRODUCT LAUNCH!'}
              </h2>
              <p className="text-[11px] text-[#8fd3ff]">
                Code: {codePoints} • UX: {designPoints} • Hype: {hypePoints}
              </p>
            </div>
          </div>

          {!result && (
            <button
              type="button"
              onClick={closeLaunchModal}
              className="px-2.5 py-1 bg-[#2a2838] text-[#ded2b6] text-xs font-bold border border-[#4b4a5e] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Phase 1: Configure Launch */}
        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#ded2b6] mb-1">
                Release Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-[#14121c] border-2 border-[#4b4a5e] focus:border-[#b6e52d] px-3 py-2 text-sm font-bold text-[#f4ecd8] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#ded2b6] mb-1.5">
                Choose Viral Marketing Buzzword
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BUZZWORDS.map((bw) => (
                  <button
                    key={bw}
                    type="button"
                    onClick={() => {
                      audio.playClick()
                      setBuzzword(bw)
                    }}
                    className={`px-2.5 py-2 text-xs font-bold uppercase border-2 cursor-pointer ${
                      buzzword === bw
                        ? 'bg-[#3e6ec0] text-white border-[#b6e52d] shadow-[2px_2px_0px_#14121c]'
                        : 'bg-[#14121c] text-[#ded2b6] border-[#4b4a5e] hover:border-[#8fd3ff]'
                    }`}
                  >
                    {bw}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#b6e52d] hover:bg-[#cbf443] text-[#14121c] font-bold text-sm uppercase tracking-wider border-2 border-[#14121c] shadow-[4px_4px_0px_#000000] active:translate-y-0.5 cursor-pointer"
            >
              <Rocket className="h-5 w-5" />
              <span>FIRE LAUNCH ROCKET & REVEAL CRITIC SCORES!</span>
            </button>
          </div>
        ) : (
          /* Phase 2: 4-Critic Animated Review Reveal */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.reviews.map((rev, idx) => {
                const shown = idx < revealedCount
                const scoreColor =
                  rev.score >= 8
                    ? 'text-[#b6e52d] border-[#b6e52d]'
                    : rev.score >= 6
                    ? 'text-[#f2a93b] border-[#f2a93b]'
                    : 'text-[#d9453d] border-[#d9453d]'

                return (
                  <div
                    key={rev.outlet}
                    className={`p-3 border-2 transition-all duration-300 ${
                      shown
                        ? 'bg-[#14121c] border-[#4b4a5e] opacity-100 translate-y-0'
                        : 'bg-[#14121c]/40 border-[#2a2838] opacity-40 translate-y-1'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-xs font-bold uppercase text-[#8fd3ff] block">
                          {rev.outlet}
                        </span>
                        <span className="text-[9px] text-[#8c8aa0]">by {rev.critic}</span>
                      </div>
                      <div
                        className={`px-2 py-1 border-2 font-bold text-base ${
                          shown ? scoreColor : 'text-[#4b4a5e] border-[#4b4a5e]'
                        }`}
                      >
                        {shown ? `${rev.score.toFixed(1)}/10` : '?.?'}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#f4ecd8] italic leading-snug min-h-[32px]">
                      {shown ? rev.quote : 'Critic is typing furiously...'}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Final Payout Banner */}
            {allRevealed && (
              <div className="bg-[#14121c] border-2 border-[#b6e52d] p-4 shadow-[4px_4px_0px_#000000]">
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div>
                    <span className="text-[9px] uppercase text-[#8c8aa0] flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-[#f2a93b]" /> Avg Score
                    </span>
                    <span className="text-lg font-bold text-[#f2a93b]">
                      {result.avgScore.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8c8aa0] flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3 text-[#b6e52d]" /> Revenue Surge
                    </span>
                    <span className="text-lg font-bold text-[#b6e52d]">
                      +${result.totalPayout.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8c8aa0] flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-[#8fd3ff]" /> New Users
                    </span>
                    <span className="text-lg font-bold text-[#8fd3ff]">
                      +{result.newUsers.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8c8aa0] flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-[#c084fc]" /> Hype
                    </span>
                    <span className="text-lg font-bold text-[#c084fc]">
                      +{result.hypeGained}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeLaunchModal()
                      openPerkDraft()
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#f2a93b] hover:bg-[#ffb94d] text-[#14121c] font-bold text-xs uppercase border-2 border-[#14121c] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Claim Launch Bonus Perk Draft!</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeLaunchModal}
                    className="px-4 py-2.5 bg-[#2a2838] hover:bg-[#4b4a5e] text-[#f4ecd8] font-bold text-xs uppercase border-2 border-[#14121c] cursor-pointer"
                  >
                    Back to Office
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

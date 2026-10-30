/**
 * CORPORATE HELL™ — Growth Ladder & Valuation View.
 *
 * Implements the 6-stage company growth ladder (Garage -> Seed -> Series A -> Series B -> Scale-Up -> Unicorn),
 * customer acquisition funnel telemetry, and investor pitch deck negotiations.
 */
import { useGameStore } from '../../state/gameStore'
import { STAGE_REQUIREMENTS, checkStageProgression } from '../../game/engine/growth'
import type { CompanyStage } from '../../game/models/types'
import {
  TrendingUp,
  Award,
  Crown,
  Users,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

const STAGES_LIST: CompanyStage[] = ['garage', 'seed', 'series_a', 'series_b', 'scale_up', 'unicorn']

export function GrowthView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const openMiniGame = useGameStore((s) => s.openMiniGame)

  if (!state) return null

  const growth = state.growth
  const currentStage = state.stage || 'seed'
  const check = checkStageProgression(state)

  const handleUpgradeStage = () => {
    dispatch({ type: 'upgrade_company_stage' })
  }

  const handlePitchDeck = () => {
    openMiniGame('pitch')
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                Company Growth & Valuation Ladder
              </h1>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                {currentStage.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Scale from a humble garage startup to a publicly-traded Silicon Valley unicorn.
            </p>
          </div>
        </div>

        {/* Valuation Badge & Pitch Deck Button */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-4 py-2 text-center">
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">Company Valuation</span>
            <span className="font-mono text-base font-black text-emerald-400">
              ${(growth?.valuation || 3500000).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePitchDeck}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 transition"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Pitch Investors</span>
          </button>
        </div>
      </div>

      {/* 6-Stage Growth Ladder Progression */}
      <div className="mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-paper-300 mb-3">
          Venture Capital Growth Ladder
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {STAGES_LIST.map((stageKey, idx) => {
            const req = STAGE_REQUIREMENTS[stageKey]
            const isCurrent = currentStage === stageKey
            const isPassed = STAGES_LIST.indexOf(currentStage) > idx

            return (
              <div
                key={stageKey}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 shadow-lg transition backdrop-blur-md ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/40'
                    : isPassed
                      ? 'border-ink-700 bg-ink-900/60 opacity-85'
                      : 'border-ink-800 bg-ink-900/30 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-ink-400">STAGE 0{idx + 1}</span>
                    {isPassed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {isCurrent && <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />}
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-paper-100">{req.label}</h3>
                  <div className="mt-2 space-y-1 text-[11px] font-mono text-ink-300">
                    <div>MRR: ${req.minMrr.toLocaleString()}</div>
                    <div>Uptime: {req.minUptime}%</div>
                    <div>Users: {req.minPaying}</div>
                  </div>
                </div>

                <div className="mt-3 border-t border-ink-800 pt-2 text-[10px] text-ink-400 font-sans">
                  {req.reward}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Stage Upgrade Banner */}
      <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-paper-100">Funding Round Progression</h3>
          </div>
          <p className="mt-1 text-xs text-ink-400">{check.message}</p>
        </div>

        {check.eligible && (
          <button
            onClick={handleUpgradeStage}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 transition animate-bounce"
          >
            <span>Close Series Funding Round</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Customer Acquisition Funnel */}
      <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/80 p-6 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-paper-200 mb-4">
          Customer Acquisition Funnel & MRR Economics
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 border-b border-ink-800 pb-6">
          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">1. Impressions</span>
            <span className="mt-1 font-mono text-lg font-black text-paper-100">
              {(growth?.impressions || 12000).toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-400 block mt-0.5">Brand Awareness</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">2. Site Visits</span>
            <span className="mt-1 font-mono text-lg font-black text-blue-400">
              {(growth?.visits || 2400).toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-400 block mt-0.5">CTR ~12%</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">3. Free Signups</span>
            <span className="mt-1 font-mono text-lg font-black text-cyan-400">
              {(growth?.signups || 320).toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-400 block mt-0.5">Conversion ~8%</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">4. Activated</span>
            <span className="mt-1 font-mono text-lg font-black text-purple-400">
              {(growth?.activatedUsers || 180).toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-400 block mt-0.5">Onboarded Users</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">5. Paying SaaS</span>
            <span className="mt-1 font-mono text-lg font-black text-emerald-400">
              {(growth?.payingCustomers || 45).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              ${(growth?.mrr || 2200).toLocaleString()} MRR
            </span>
          </div>
        </div>

        {/* Churn & Unit Economics */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-mono text-ink-300">
          <div className="rounded-xl border border-ink-800 bg-ink-850/60 p-3">
            <span className="text-[10px] text-ink-400 uppercase block mb-1">Monthly Churn Rate</span>
            <span className="text-base font-bold text-amber-400">
              {((growth?.churnRate || 0.035) * 100).toFixed(1)}% / mo
            </span>
            <span className="text-[10px] text-ink-400 block mt-1">Reduced by high CSAT and zero bugs</span>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-850/60 p-3">
            <span className="text-[10px] text-ink-400 uppercase block mb-1">Customer Acquisition Cost (CAC)</span>
            <span className="text-base font-bold text-paper-100">${growth?.cac || 120}</span>
            <span className="text-[10px] text-ink-400 block mt-1">Blended marketing & ad spend</span>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-850/60 p-3">
            <span className="text-[10px] text-ink-400 uppercase block mb-1">Customer Lifetime Value (LTV)</span>
            <span className="text-base font-bold text-emerald-400">${growth?.ltv || 850}</span>
            <span className="text-[10px] text-emerald-400 block mt-1">LTV/CAC Ratio: 7.1x (Healthy)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

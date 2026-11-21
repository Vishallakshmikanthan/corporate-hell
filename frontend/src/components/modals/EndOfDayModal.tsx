/**
 * CORPORATE HELL™ — End-of-Day Fiscal Report Modal.
 *
 * Appears at the close of every business day (18:00) with complete financial
 * ledger breakdown, workforce sentiment shifts, notable incidents, and campaign progress.
 */
import { useGameStore } from '../../state/gameStore'
import { useGamificationStore } from '../../state/gamificationStore'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  Award,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react'

export function EndOfDayModal() {
  const isOpen = useGameStore((s) => s.isEndOfDayModalOpen)
  const close = useGameStore((s) => s.closeEndOfDayModal)
  const state = useGameStore((s) => s.state)
  const openPerkDraft = useGamificationStore((s) => s.openPerkDraft)
  const checkBoardAudit = useGamificationStore((s) => s.checkBoardAudit)
  const currentAudit = useGamificationStore((s) => s.currentAudit)
  const launchesCompleted = useGamificationStore((s) => s.launchesCompleted)

  if (!isOpen || !state) return null

  const handleProceedAndDraft = () => {
    checkBoardAudit(state.day - 1, state.cash, (bonusCash) => {
      state.cash += bonusCash
      useGameStore.setState({ state: { ...state } })
    })
    close()
    // Pause while player drafts their roguelite startup perk card
    useGameStore.getState().setPlaying(false)
    openPerkDraft()
  }

  // Latest DayLedger
  const ledger = state.history[state.history.length - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur select-none animate-slide-up">
      <div className="w-full max-w-xl rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-ink-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-corp-400" />
              <h3 className="font-display text-lg font-bold text-paper-50 uppercase tracking-wide">
                Fiscal Day {ledger?.day || state.day - 1} Debrief
              </h3>
            </div>
            <span className="rounded-full bg-corp-500/20 px-2.5 py-0.5 text-xs font-bold text-corp-300 border border-corp-500/30">
              Markets Closed
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-400">
            Corporate performance summary and executive ledger reconciliation
          </p>
        </div>

        {/* Financial Highlights */}
        {ledger && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-ink-800 bg-ink-850 p-3 text-center">
              <span className="text-[11px] text-ink-400">Daily Inflow</span>
              <div className="mt-1 font-display text-base font-bold text-corp-300">
                +${ledger.revenue.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-ink-800 bg-ink-850 p-3 text-center">
              <span className="text-[11px] text-ink-400">Operating Costs</span>
              <div className="mt-1 font-display text-base font-bold text-alert-400">
                -${ledger.costs.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-ink-800 bg-ink-850 p-3 text-center">
              <span className="text-[11px] text-ink-400">Net Profit/Loss</span>
              <div
                className={`mt-1 font-display text-base font-bold ${
                  ledger.net >= 0 ? 'text-acid-400' : 'text-alert-400'
                }`}
              >
                {ledger.net >= 0 ? '+' : ''}${ledger.net.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Workforce Metrics */}
        {ledger && (
          <div className="mt-4 rounded-xl border border-ink-800 bg-ink-850/60 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
              Workforce Sentiments
            </span>
            <div className="mt-2.5 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs text-ink-400">Avg Morale</span>
                <div className="mt-0.5 font-bold text-sm text-paper-100 flex items-center justify-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-corp-400" />
                  <span>{ledger.moraleAvg}%</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-ink-400">Avg Stress</span>
                <div className="mt-0.5 font-bold text-sm text-paper-100 flex items-center justify-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-alert-400" />
                  <span>{ledger.stressAvg}%</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-ink-400">Headcount</span>
                <div className="mt-0.5 font-bold text-sm text-paper-100">
                  {ledger.headcount} active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Progress Note if in Campaign */}
        {state.mode === 'campaign' && state.campaign && (
          <div className="mt-4 rounded-xl border border-corp-500/30 bg-corp-500/10 p-3 text-xs text-paper-200">
            <span className="font-bold text-corp-300">Campaign Status: </span>
            <span>
              {state.campaign.objectives.filter((o) => o.status === 'done').length} of{' '}
              {state.campaign.objectives.length} strategic milestones secured.
            </span>
          </div>
        )}

        {/* Board Audit Countdown Banner */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-paper-200 flex items-center justify-between">
          <div>
            <span className="font-bold text-amber-300 uppercase">Next Board Audit (Day {currentAudit.dueDay}): </span>
            <span>
              ${currentAudit.targetCash.toLocaleString()} Cash OR {currentAudit.targetLaunches} Launch(es)
            </span>
          </div>
          <span className="font-bold text-acid-400">
            Reward: +${currentAudit.rewardCash.toLocaleString()}
          </span>
        </div>

        {/* Modal Action CTA */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[11px] text-ink-400">
            Launches Shipped: <strong className="text-paper-100">{launchesCompleted}</strong>
          </span>
          <button
            onClick={handleProceedAndDraft}
            className="flex items-center gap-2 rounded-xl bg-corp-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-corp-500/25 transition hover:bg-corp-600 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-acid-400" />
            <span>Draft Daily Perk & Start Day {state.day}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

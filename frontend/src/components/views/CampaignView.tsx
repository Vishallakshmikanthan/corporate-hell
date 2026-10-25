/**
 * CORPORATE HELL™ — CEO Campaign View.
 *
 * Strategic campaign headquarters: board objectives, survival countdown,
 * executive briefing memo, and victory/defeat resolution reports.
 */
import { useGameStore } from '../../state/gameStore'
import {
  Target,
  CheckCircle,
  AlertTriangle,
  Flame,
  Award,
  Calendar,
  Building,
} from 'lucide-react'

export function CampaignView() {
  const state = useGameStore((s) => s.state)
  const setPhase = useGameStore((s) => s.setPhase)

  if (!state) return null

  if (state.mode !== 'campaign' || !state.campaign) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-ink-950 p-6 text-center select-none">
        <Target className="h-12 w-12 text-ink-600 mb-3" />
        <h2 className="font-display text-xl font-bold text-paper-50">
          Currently in Sandbox Mode
        </h2>
        <p className="mt-2 max-w-md text-xs text-ink-400">
          The CEO Campaign offers structured corporate survival with escalating board crises,
          statutory deadlines, victory conditions, and real consequences.
        </p>
        <button
          onClick={() => setPhase('setup')}
          className="mt-6 rounded-xl bg-corp-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-corp-500/25 transition hover:bg-corp-600 active:scale-95"
        >
          Start CEO Campaign Run
        </button>
      </div>
    )
  }

  const camp = state.campaign
  const ending = camp.ending

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      {/* Header */}
      <div className="border-b border-ink-800 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide">
              CEO Strategic Campaign
            </h2>
            <p className="text-xs text-ink-400">
              Board of Directors Mandate • Fiscal Day {state.day}
            </p>
          </div>

          {/* Bankruptcy & Mutiny Threat Indicators */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3 py-1.5 text-xs">
              <span className="text-ink-400">Insolvency Streak: </span>
              <span
                className={`font-bold font-mono ${
                  camp.bankNegativeDays > 0 ? 'text-alert-400 animate-pulse' : 'text-paper-100'
                }`}
              >
                {camp.bankNegativeDays}/3 Days
              </span>
            </div>

            <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3 py-1.5 text-xs">
              <span className="text-ink-400">Rebellion Risk: </span>
              <span
                className={`font-bold font-mono ${
                  camp.collapseDays > 0 ? 'text-alert-400 animate-pulse' : 'text-paper-100'
                }`}
              >
                {camp.collapseDays}/3 Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Ending Report Banner if triggered */}
      {ending && (
        <div
          className={`mt-6 rounded-2xl border p-6 shadow-2xl animate-slide-up ${
            ending.kind === 'victory'
              ? 'border-acid-400/50 bg-acid-400/10'
              : 'border-alert-500/50 bg-alert-500/10'
          }`}
        >
          <div className="flex items-center gap-3">
            {ending.kind === 'victory' ? (
              <Award className="h-8 w-8 text-acid-400" />
            ) : (
              <Flame className="h-8 w-8 text-alert-400" />
            )}
            <div>
              <h3 className="font-display text-xl font-black text-paper-50">{ending.title}</h3>
              <p className="text-xs text-paper-200 mt-1">{ending.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Executive Briefing Memo */}
      <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/70 p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-corp-400 mb-2">
          Executive Briefing Memo
        </h3>
        <div className="space-y-1 text-xs text-paper-200">
          {camp.memo.map((line, idx) => (
            <p key={idx} className="flex items-baseline gap-2">
              <span className="text-corp-500">•</span>
              <span>{line}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Campaign Objectives List */}
      <div className="mt-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 flex items-center gap-2">
          <Target className="h-4 w-4 text-corp-400" />
          <span>Milestones & Board Deliverables</span>
        </h3>

        <div className="space-y-3">
          {camp.objectives.map((obj, idx) => {
            const isDone = obj.status === 'done'
            const isFailed = obj.status === 'failed'

            return (
              <div
                key={obj.id}
                className={`rounded-2xl border p-5 shadow-lg transition ${
                  isDone
                    ? 'border-acid-500/30 bg-ink-900/50'
                    : isFailed
                      ? 'border-alert-500/40 bg-alert-500/10'
                      : 'border-ink-800 bg-ink-900/80 hover:border-corp-500/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        isDone
                          ? 'bg-acid-400 text-ink-950'
                          : isFailed
                            ? 'bg-alert-500 text-white'
                            : 'bg-ink-800 text-corp-400 border border-ink-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-paper-100">{obj.title}</h4>
                      <p className="text-xs text-ink-400">{obj.description}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDone
                        ? 'bg-acid-400/20 text-acid-400 border border-acid-400/40'
                        : isFailed
                          ? 'bg-alert-500/20 text-alert-400 border border-alert-500/40'
                          : 'bg-corp-500/20 text-corp-300 border border-corp-500/40'
                    }`}
                  >
                    {obj.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-ink-500">Progress</span>
                    <span className="mono font-bold text-paper-200">{obj.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                    <div
                      style={{ width: `${obj.progress}%` }}
                      className={`h-full transition-all ${
                        isDone ? 'bg-acid-400' : isFailed ? 'bg-alert-400' : 'bg-corp-400'
                      }`}
                    />
                  </div>
                </div>

                {obj.resultNote && (
                  <p className="mt-3 text-xs italic text-acid-300">
                    ✓ {obj.resultNote}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

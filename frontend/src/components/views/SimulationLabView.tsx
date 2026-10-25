/**
 * CORPORATE HELL™ — Simulation Laboratory.
 *
 * Sandbox chaos controls: manual workplace policy overrides,
 * triggerable library of all 30+ corporate events, and experimental levers.
 */
import { useGameStore } from '../../state/gameStore'
import { EVENT_DEFINITIONS } from '../../game/engine/events'
import type { Policies } from '../../game/models/types'
import { FlaskConical, Zap, Sliders, Play, ShieldAlert, Sparkles } from 'lucide-react'

export function SimulationLabView() {
  const policies = useGameStore((s) => s.state?.policies)
  const dispatch = useGameStore((s) => s.dispatch)

  if (!policies) return null

  const handlePolicyToggle = (key: keyof Policies) => {
    dispatch({ type: 'set_policy', policy: key, value: !policies[key] })
  }

  const handleTriggerEvent = (eventId: string) => {
    dispatch({ type: 'trigger_event', eventId })
  }

  const policyItems: { key: keyof Policies; label: string; desc: string }[] = [
    {
      key: 'fourDayWeek',
      label: 'Four-Day Workweek',
      desc: 'Reduces burnout and stress, slightly scales down total weekly sprint output.',
    },
    {
      key: 'meetingFreeDay',
      label: 'Mandatory Meeting-Free Day',
      desc: 'Cancels all meetings today. Engineers rejoice; meeting addicts spiral into panic.',
    },
    {
      key: 'hiringFrozen',
      label: 'Total Hiring Freeze',
      desc: 'Prohibits any recruitment. Saves cash reserves but increases gossip and layoff rumors.',
    },
    {
      key: 'productivityTracking',
      label: 'Keystroke & Productivity Tracking',
      desc: 'Artificially spikes KPI reporting while tanking workforce trust and morale.',
    },
    {
      key: 'casualFridays',
      label: 'Casual Fridays',
      desc: 'Small morale boost for staff at zero financial cost.',
    },
    {
      key: 'remoteFriendly',
      label: 'Remote-Friendly Flex Policy',
      desc: 'Provides flexibility and reduces pantry crowding.',
    },
  ]

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      <div className="border-b border-ink-800 pb-5">
        <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide flex items-center gap-2.5">
          <FlaskConical className="h-6 w-6 text-acid-400" />
          <span>Simulation Laboratory & Chaos Controls</span>
        </h2>
        <p className="text-xs text-ink-400">
          Executive policy experiments, forced event injection, and behavioral stress-testing
        </p>
      </div>

      {/* Workplace Policies Section */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-corp-400 mb-3 flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          <span>Corporate Workplace Policies</span>
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {policyItems.map((p) => {
            const isActive = policies[p.key]
            return (
              <div
                key={p.key}
                onClick={() => handlePolicyToggle(p.key)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                  isActive
                    ? 'border-acid-400/50 bg-acid-400/10'
                    : 'border-ink-800 bg-ink-900/60 hover:border-ink-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-paper-100">{p.label}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isActive ? 'bg-acid-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Force Event Library Section */}
      <div className="mt-8 border-t border-ink-800 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warn-400 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span>Inject Simulated Office Disasters (30+ Events)</span>
        </h3>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(EVENT_DEFINITIONS).map((def) => (
            <div
              key={def.id}
              className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-900/60 p-3 transition hover:border-corp-500/40 hover:bg-ink-850"
            >
              <div>
                <h4 className="font-bold text-xs text-paper-100">{def.title}</h4>
                <span className="text-[10px] text-ink-400 uppercase tracking-wider font-mono">
                  {def.category} • Severity {def.severity}
                </span>
              </div>

              <button
                onClick={() => handleTriggerEvent(def.id)}
                className="flex items-center gap-1 rounded-lg bg-ink-800 px-2.5 py-1 text-[11px] font-bold text-paper-200 hover:bg-corp-500 hover:text-white transition active:scale-95 border border-ink-700"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Trigger</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

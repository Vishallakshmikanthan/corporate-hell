/**
 * CORPORATE HELL™ — Executive Command Floating HUD Panel.
 *
 * Left floating panel allowing the CEO (player) to issue directives,
 * ask for corporate analysis, or trigger suggested executive actions.
 * Integrates with NVIDIA GLM-5.3 for hilarious satire and validated engine actions.
 */
import { useState } from 'react'
import { Zap, ChevronUp, ChevronDown, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import { requestDirective, type DirectiveResult } from '../../services/api'
import { audio } from '../../services/audio'

const SUGGESTED_DIRECTIVES = [
  { label: 'Announce 4-day workweek', icon: '🔄' },
  { label: 'Cut meeting time by 50%', icon: '⏱️' },
  { label: 'Boost morale (any way)', icon: '⚡' },
  { label: 'Investigate spending', icon: '🔍' },
  { label: 'Trigger random incident', icon: '🎲' },
]

export function ExecutiveCommand() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [directiveText, setDirectiveText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<DirectiveResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  if (!state) return null

  const handleExecute = async (textToRun?: string) => {
    const text = (textToRun ?? directiveText).trim()
    if (!text || isLoading) return

    setIsLoading(true)
    setErrorMsg(null)
    setLastResult(null)
    audio.playClick()

    try {
      const activeEmps = Object.values(state.employees).filter((e) => e.active)
      const avgMorale =
        activeEmps.length > 0
          ? Math.round(activeEmps.reduce((acc, e) => acc + e.morale, 0) / activeEmps.length)
          : 50
      const avgStress =
        activeEmps.length > 0
          ? Math.round(activeEmps.reduce((acc, e) => acc + e.stress, 0) / activeEmps.length)
          : 50

      const result = await requestDirective({
        directive: text,
        company_name: state.name,
        day: state.day,
        cash: state.cash,
        morale: avgMorale,
        stress: avgStress,
        employee_count: activeEmps.length,
      })

      setLastResult(result)

      // Execute authoritative validated game engine action
      if (result.action_type === 'policy_4day') {
        dispatch({ type: 'set_policy', policy: 'fourDayWeek', value: true })
        audio.playCelebration()
      } else if (result.action_type === 'cut_meetings') {
        dispatch({ type: 'set_policy', policy: 'meetingFreeDay', value: true })
        audio.playChime()
      } else if (result.action_type === 'morale_boost' || result.action_type === 'bonus_all') {
        dispatch({ type: 'bonus_all' })
        audio.playCelebration()
      } else if (result.action_type === 'audit_spending') {
        state.cash += 3400
        audio.playCash()
      } else if (result.action_type === 'trigger_incident') {
        dispatch({ type: 'trigger_event', eventId: 'reply_all_incident' })
        audio.playAlert()
      } else {
        // Custom directive applied to vitals and cash
        if (result.cash_delta !== 0) {
          state.cash += result.cash_delta
        }
        for (const emp of Object.values(state.employees)) {
          if (!emp.active) continue
          emp.morale = Math.max(0, Math.min(100, emp.morale + result.morale_delta))
          emp.stress = Math.max(0, Math.min(100, emp.stress + result.stress_delta))
        }
        audio.playChime()
      }

      // Update employee thoughts with returned satirical quotes
      result.quotes.forEach((q) => {
        const emp = Object.values(state.employees).find(
          (e) => e.name.toLowerCase().includes(q.employee_name.toLowerCase()) || q.employee_name.toLowerCase().includes(e.name.toLowerCase()),
        )
        if (emp) {
          emp.thought = q.quote
          emp.thoughtTicksLeft = 8
        }
      })

      setDirectiveText('')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Directive execution failed')
      audio.playAlert()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-80 rounded-2xl bg-ink-950/90 p-4 text-paper-50 shadow-2xl backdrop-blur-xl border border-ink-700/60 transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-xs font-black tracking-wider text-amber-400 uppercase font-display">
            EXECUTIVE COMMAND
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-3 space-y-3.5 animate-slide-up">
          {/* Subtitle */}
          <div>
            <h4 className="text-[13px] font-bold text-paper-100 leading-tight">
              What's your next move, CEO?
            </h4>
            <p className="mt-0.5 text-[11px] text-ink-400 leading-normal">
              Give a directive, ask for an analysis, or make a completely unreasonable demand.
            </p>
          </div>

          {/* Textarea Input */}
          <div className="relative">
            <textarea
              rows={2}
              value={directiveText}
              onChange={(e) => setDirectiveText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleExecute()
                }
              }}
              placeholder='e.g. "Make everyone work harder but also be happier"'
              className="w-full resize-none rounded-xl border border-ink-700/80 bg-ink-900/90 p-2.5 text-xs text-paper-100 placeholder:text-ink-500 focus:border-corp-500 focus:outline-none focus:ring-1 focus:ring-corp-500/50"
            />
          </div>

          {/* Suggested Actions */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold tracking-wider text-ink-400 uppercase">
              SUGGESTED ACTIONS
            </div>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_DIRECTIVES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirectiveText(item.label)
                    handleExecute(item.label)
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900/70 px-2.5 py-1.5 text-left text-xs text-paper-200 transition hover:border-corp-500/60 hover:bg-ink-850 hover:text-paper-50 disabled:opacity-50"
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Execute Directive Button */}
          <button
            onClick={() => handleExecute()}
            disabled={isLoading || (!directiveText.trim() && !lastResult)}
            className="btn-gold group relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#181411]" />
                <span>Consulting AI Board...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#181411] transition-transform group-hover:rotate-12" />
                <span>+ Execute Directive</span>
              </>
            )}
          </button>

          {/* Outcome Result Card */}
          {lastResult && (
            <div className="rounded-xl border border-corp-500/30 bg-corp-950/30 p-2.5 text-xs text-paper-200 animate-slide-up">
              <div className="flex items-center gap-1.5 font-bold text-corp-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{lastResult.title}</span>
              </div>
              <p className="mt-1 text-[11px] text-ink-300 leading-normal">
                {lastResult.executive_summary}
              </p>
              {lastResult.quotes.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-ink-800 pt-1.5">
                  {lastResult.quotes.map((q, i) => (
                    <div key={i} className="text-[10px] text-ink-400 italic">
                      <span className="font-semibold text-paper-200 not-italic">{q.employee_name}: </span>
                      "{q.quote}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-1.5 rounded-lg border border-alert-500/40 bg-alert-500/10 p-2 text-xs text-alert-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * CORPORATE HELL™ — Bottom Simulation Timeline & Event Ticker.
 *
 * Real-time event ticker, upcoming meetings alert, in-game clock,
 * and expandable full historical event drawer.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { tickToClock } from '../../game/models/types'
import {
  Bell,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
  Flame,
  MessageSquare,
} from 'lucide-react'

export function BottomTimeline() {
  const state = useGameStore((s) => s.state)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!state) return null

  const latestEvent = state.eventLog.length > 0 ? state.eventLog[0] : null
  const activeMeeting = state.meetings.find((m) => m.active)
  const nextMeeting = state.meetings.find((m) => !m.active && m.startTick > state.tick)

  return (
    <footer className="relative z-20 border-t border-ink-800 bg-ink-900/95 backdrop-blur select-none">
      {/* Expanded Historical Log Drawer */}
      {isExpanded && (
        <div className="max-h-60 overflow-y-auto border-b border-ink-800 p-4 bg-ink-950/95 animate-slide-up">
          <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">
            <span>Company Event & Incident Chronology ({state.eventLog.length})</span>
            <span className="mono text-[10px]">Fiscal Day {state.day}</span>
          </div>

          <div className="space-y-2 text-xs">
            {state.eventLog.map((evt) => (
              <div
                key={evt.uid}
                className="flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-900/60 p-2.5 text-paper-200"
              >
                <span className="mono text-[11px] text-corp-400 font-bold shrink-0">
                  Day {evt.day} • {tickToClock(evt.tick)}
                </span>
                <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-warn-400 shrink-0">
                  {evt.category}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-paper-100">{evt.title}: </span>
                  <span className="text-ink-300">{evt.description}</span>
                </div>
              </div>
            ))}
            {state.eventLog.length === 0 && (
              <div className="text-xs text-ink-500 italic">No events recorded yet today.</div>
            )}
          </div>
        </div>
      )}

      {/* Main Ticker Bar */}
      <div className="flex h-11 items-center justify-between px-4 text-xs">
        {/* Left: Latest Event Ticker */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-800 text-corp-400 border border-ink-700 shrink-0">
            <Bell className="h-3.5 w-3.5" />
          </div>

          {latestEvent ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-paper-100 truncate">{latestEvent.title}:</span>
              <span className="text-ink-300 truncate hidden sm:inline">
                {latestEvent.description}
              </span>
            </div>
          ) : (
            <span className="text-ink-400 italic truncate">
              Quiet morning in the open-plan cubicles...
            </span>
          )}
        </div>

        {/* Right: Upcoming Meeting & Expand Log Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active / Next Meeting Indicator */}
          {activeMeeting ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-corp-500/20 px-2 py-0.5 text-[11px] font-bold text-corp-300 border border-corp-500/30">
              <Calendar className="h-3 w-3" />
              <span>In Meeting: {activeMeeting.title}</span>
            </div>
          ) : nextMeeting ? (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-ink-400">
              <Clock className="h-3 w-3 text-ink-500" />
              <span>Next Meeting: {tickToClock(nextMeeting.startTick)}</span>
            </div>
          ) : null}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-800 px-2.5 py-1 text-[11px] text-ink-300 hover:bg-ink-700 hover:text-paper-100 transition"
          >
            <span>Log ({state.eventLog.length})</span>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </footer>
  )
}

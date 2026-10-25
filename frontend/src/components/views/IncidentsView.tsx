/**
 * CORPORATE HELL™ — Incident & Crisis Center.
 *
 * Review open equipment breakdowns, departmental emergencies, and PR crises.
 * Execute manager response actions with real trade-offs and consequences.
 */
import { useGameStore } from '../../state/gameStore'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Wrench,
  DollarSign,
  Heart,
} from 'lucide-react'

export function IncidentsView() {
  const incidents = useGameStore((s) => s.state?.incidents || [])
  const dispatch = useGameStore((s) => s.dispatch)

  const activeIncidents = incidents.filter((i) => !i.resolved)
  const resolvedIncidents = incidents.filter((i) => i.resolved)

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      <div className="border-b border-ink-800 pb-5">
        <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide">
          Incident Response Command
        </h2>
        <p className="text-xs text-ink-400">
          Operational hazards, hardware malfunctions, and corporate emergencies
        </p>
      </div>

      {/* Active Crises Section */}
      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-alert-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Active Emergencies ({activeIncidents.length})</span>
        </h3>

        {activeIncidents.map((incident) => (
          <div
            key={incident.id}
            className="rounded-2xl border border-alert-500/40 bg-ink-900/90 p-5 shadow-2xl transition hover:border-alert-500/60"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alert-500/20 text-alert-400 border border-alert-500/40 font-bold text-xs">
                  S{incident.severity}
                </span>
                <h4 className="font-bold text-sm text-paper-50">{incident.title}</h4>
              </div>

              <div className="flex items-center gap-3 text-xs text-ink-400">
                {incident.roomId && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-corp-400" />
                    <span className="capitalize">{incident.roomId.replace('_', ' ')}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Day {incident.dayOpened}</span>
                </span>
              </div>
            </div>

            {/* Narrative description */}
            <p className="mt-3 text-xs text-paper-200/90 leading-relaxed">
              {incident.description}
            </p>

            {/* Impact indicator */}
            {incident.productivityPenalty && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-800 px-2.5 py-1 text-[11px] text-alert-300 border border-ink-700">
                <AlertTriangle className="h-3 w-3" />
                <span>
                  Company Output Penalty: -{Math.round((1 - incident.productivityPenalty) * 100)}%
                </span>
              </div>
            )}

            {/* Response Options */}
            <div className="mt-5 border-t border-ink-800/80 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Available Managerial Responses
              </span>

              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {incident.responses.map((resp) => (
                  <button
                    key={resp.id}
                    onClick={() =>
                      dispatch({
                        type: 'respond_incident',
                        incidentId: incident.id,
                        responseId: resp.id,
                      })
                    }
                    className="flex flex-col justify-between rounded-xl border border-ink-700/80 bg-ink-850 p-3.5 text-left transition hover:border-corp-400 hover:bg-ink-800 active:scale-95 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-paper-100 group-hover:text-corp-300">
                          {resp.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-ink-400 leading-normal">
                        {resp.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-ink-800 pt-2 text-[10px] text-ink-500 font-mono">
                      <span>Cost: ${resp.cost}</span>
                      <span className="text-corp-400 font-bold">Execute ➔</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {activeIncidents.length === 0 && (
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8 text-center text-ink-500">
            <CheckCircle className="mx-auto h-8 w-8 text-acid-400/60 mb-2" />
            <p className="text-sm font-semibold text-paper-300">
              No active operational emergencies!
            </p>
            <p className="text-xs text-ink-500 mt-1">
              All equipment is functional. Enjoy the quiet while it lasts.
            </p>
          </div>
        )}
      </div>

      {/* Resolved History */}
      {resolvedIncidents.length > 0 && (
        <div className="mt-10 border-t border-ink-800 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-acid-400" />
            <span>Resolved Incidents History</span>
          </h3>

          <div className="space-y-2 text-xs">
            {resolvedIncidents.map((ri) => (
              <div
                key={ri.id}
                className="flex items-center justify-between rounded-xl border border-ink-800/80 bg-ink-900/50 p-3 text-ink-400"
              >
                <div>
                  <span className="font-bold text-paper-200">{ri.title}</span>
                  <span className="ml-2 text-[11px] text-ink-500">
                    Opened Day {ri.dayOpened} • Resolved Day {ri.dayResolved || ri.dayOpened}
                  </span>
                </div>
                <span className="rounded bg-ink-800 px-2 py-0.5 text-[10px] font-mono text-acid-400">
                  RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

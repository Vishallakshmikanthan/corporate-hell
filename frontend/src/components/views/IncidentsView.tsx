/**
 * CORPORATE HELL™ — Section 06: Incidents & Crisis Center.
 *
 * Interactive corporate crisis management:
 * - Left: Active Incidents queue, Resolved History & Live Incident Log
 * - Center: 4-Stage Crisis Inspector (Overview, Investigation with AI RCA, Responses, Consequences)
 * - Right: Potential Outcomes preview, Long-Term Effects & Employee Reactions
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { requestPostmortem } from '../../services/api'
import { audio } from '../../services/audio'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Loader2,
  Flame,
  Wrench,
  Users,
} from 'lucide-react'

type CrisisStageTab = 'overview' | 'investigation' | 'responses' | 'consequences'

export function IncidentsView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [stageTab, setStageTab] = useState<CrisisStageTab>('overview')
  const [selectedResponseIdx, setSelectedResponseIdx] = useState<number>(0)
  const [isInvestigating, setIsInvestigating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!state) return null

  const activeIncidents = state.incidents.filter((i) => !i.resolved)
  const resolvedIncidents = state.incidents.filter((i) => i.resolved)

  const currentIncident =
    activeIncidents.find((i) => i.id === selectedIncidentId) ||
    activeIncidents[0] ||
    resolvedIncidents[0] ||
    null

  const notify = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleRunInvestigation = async () => {
    if (!currentIncident || isInvestigating) return
    setIsInvestigating(true)
    audio.playClick()

    try {
      const rca = await requestPostmortem({
        incident_title: currentIncident.title,
        incident_cause: currentIncident.description,
        severity: currentIncident.severity,
        resolution_chosen: 'Pending Executive Decision',
        company_name: state.name,
      })

      const summary = `${rca.summary} Root Cause: ${rca.contributing_factors.join('; ')}. Action Items: ${rca.action_items.join(' • ')}`
      dispatch({
        type: 'investigate_incident',
        incidentId: currentIncident.id,
        summary,
      })
      setStageTab('investigation')
      notify('Root-Cause Investigation completed!')
    } finally {
      setIsInvestigating(false)
    }
  }

  const handleExecuteResponse = (responseId: string) => {
    if (!currentIncident) return
    audio.playClick()
    const res = dispatch({
      type: 'respond_incident',
      incidentId: currentIncident.id,
      responseId,
    })
    if (res.ok) {
      notify(res.message || `Resolved "${currentIncident.title}"!`)
      setSelectedResponseIdx(0)
    } else if (res.reason) {
      notify(res.reason)
    }
  }

  const selectedResponse =
    currentIncident?.responses[selectedResponseIdx] || currentIncident?.responses[0] || null

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            06
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              INCIDENTS & CRISIS CENTER
            </h1>
            <p className="text-xs text-[#b5a695]">
              Investigate unexpected corporate emergencies, weigh trade-offs, and deal with lasting consequences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[#65b87b]/20 border border-[#65b87b]/40 px-3.5 py-1.5 text-xs font-bold text-[#65b87b] animate-slide-up">
              <CheckCircle2 className="h-4 w-4" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={() => {
              const res = dispatch({
                type: 'trigger_event',
                eventId: 'coffee_machine_uprising',
              })
              if (res.ok) notify('Simulated new office emergency!')
            }}
            className="rounded-xl bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/35 px-3.5 py-2 text-xs font-semibold text-[#e5c478] flex items-center gap-1.5 cursor-pointer transition"
          >
            <Flame className="h-3.5 w-3.5 text-[#f08578]" />
            <span>+ Trigger Crisis Drill</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main 3-Column Crisis Workspace */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto">
        {/* ================================================================= */}
        {/* LEFT COLUMN (3 cols): Active Queue & Resolved History             */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Active Incidents Queue */}
          <div className="panel-dark p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#d4a84f]/20">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f08578]">
                <AlertTriangle className="h-4 w-4" />
                <span>Active Crises ({activeIncidents.length})</span>
              </span>
            </div>

            {activeIncidents.map((inc) => {
              const selected = currentIncident?.id === inc.id
              return (
                <button
                  key={inc.id}
                  onClick={() => {
                    audio.playClick()
                    setSelectedIncidentId(inc.id)
                    setSelectedResponseIdx(0)
                  }}
                  className={`flex w-full flex-col rounded-xl p-3 text-left transition cursor-pointer border ${
                    selected
                      ? 'bg-gradient-to-r from-[#3a241f] to-[#261a17] border-[#e25848] shadow-lg'
                      : 'bg-[#1b1612]/90 border-[#d4a84f]/15 hover:border-[#d4a84f]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#faf7f0] truncate">
                      {inc.title}
                    </span>
                    <span className="rounded-full bg-[#c74234]/25 border border-[#c74234]/50 px-2 py-0.5 text-[9.5px] font-bold text-[#f08578] shrink-0">
                      Sev {inc.severity}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-[#b5a695]">
                    <span className="capitalize">
                      {inc.roomId ? inc.roomId.replace('_', ' ') : inc.category}
                    </span>
                    <span>Day {inc.dayOpened} • Active</span>
                  </div>
                </button>
              )
            })}

            {activeIncidents.length === 0 && (
              <div className="rounded-xl bg-[#181410] p-4 text-center text-xs text-[#65b87b]">
                Zero active emergencies! All office systems are operating normally.
              </div>
            )}
          </div>

          {/* Crisis Navigation Vertical Stepper (matches reference-ui #06 left rail) */}
          <div className="panel-dark p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
              Crisis Protocol Stages
            </div>
            {(
              [
                { id: 'overview', label: '01. Overview & Impact' },
                { id: 'investigation', label: '02. Root-Cause Investigation' },
                { id: 'responses', label: '03. Managerial Responses' },
                { id: 'consequences', label: '04. Long-Term Consequences' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStageTab(st.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                  stageTab === st.id
                    ? 'btn-gold'
                    : 'bg-[#181410] text-[#b5a695] border border-[#d4a84f]/15 hover:text-[#faf7f0]'
                }`}
              >
                <span>{st.label}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Resolved Incidents History */}
          <div className="panel-dark p-4 flex-1">
            <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-[#d4a84f]/20 text-xs font-bold uppercase tracking-wider text-[#65b87b]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Resolved History ({resolvedIncidents.length})</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {resolvedIncidents.map((ri) => (
                <div
                  key={ri.id}
                  onClick={() => setSelectedIncidentId(ri.id)}
                  className="rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/15 text-xs cursor-pointer hover:border-[#d4a84f]/40"
                >
                  <div className="font-bold text-[#faf7f0]">{ri.title}</div>
                  <div className="text-[10px] text-[#65b87b] mt-0.5">
                    Resolved Day {ri.dayResolved || ri.dayOpened}
                  </div>
                </div>
              ))}
              {resolvedIncidents.length === 0 && (
                <p className="text-xs text-[#8e7c6b]">No resolved incidents yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER COLUMN (6 cols): Crisis Showcase & 4 Response Cards        */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto px-1">
          {currentIncident ? (
            <>
              {/* Crisis Header & Investigation Card */}
              <div className="panel-dark p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4a84f]/20 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c74234]/25 border border-[#c74234]/50 text-[#f08578] font-bold">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-title text-2xl font-bold text-[#faf7f0]">
                          {currentIncident.title}
                        </h2>
                        <span className="rounded-full bg-[#c74234] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                          {currentIncident.severity >= 4 ? 'High Severity' : 'Active Alert'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#b5a695]">
                        {currentIncident.roomId && (
                          <span className="flex items-center gap-1 capitalize">
                            <MapPin className="h-3.5 w-3.5 text-[#d4a84f]" />
                            {currentIncident.roomId.replace('_', ' ')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#d4a84f]" />
                          Opened Day {currentIncident.dayOpened}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crisis Narrative & Penalty */}
                <p className="mt-4 text-sm text-[#faf7f0] leading-relaxed">
                  {currentIncident.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {currentIncident.productivityPenalty && (
                    <span className="rounded-lg bg-[#c74234]/20 border border-[#c74234]/40 px-3 py-1 text-xs font-bold text-[#f08578]">
                      Output Penalty: -{Math.round((1 - currentIncident.productivityPenalty) * 100)}% Productivity
                    </span>
                  )}
                  {currentIncident.dailyMoraleDrift && (
                    <span className="rounded-lg bg-[#e8a33d]/20 border border-[#e8a33d]/40 px-3 py-1 text-xs font-bold text-[#f5c66b]">
                      Daily Morale Drift: {currentIncident.dailyMoraleDrift}/day while unresolved
                    </span>
                  )}
                </div>

                {/* Investigation Diagnostic Box */}
                <div className="mt-4 rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/25">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478] flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-[#d4a84f]" />
                      <span>Root-Cause Investigation Report</span>
                    </span>
                    <button
                      onClick={handleRunInvestigation}
                      disabled={isInvestigating}
                      className="rounded-lg bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/35 px-2.5 py-1 text-[10.5px] font-bold text-[#e5c478] flex items-center gap-1 cursor-pointer transition"
                    >
                      {isInvestigating ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          <span>Run Deep AI Forensics</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#d8cdc0] leading-relaxed">
                    {currentIncident.investigationSummary ||
                      'Initial telemetry indicates hardware saturation and rising team frustration. Run Deep AI Forensics or select an executive response below.'}
                  </p>
                </div>
              </div>

              {/* Managerial Response Options (matches reference-ui #06 right cards) */}
              <div className="panel-dark p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                      Select Executive Response ({currentIncident.responses.length} Options)
                    </span>
                    <span className="text-[11px] text-[#b5a695]">
                      Treasury Available: ${state.cash.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentIncident.responses.map((resp, idx) => {
                      const isSelected = idx === selectedResponseIdx
                      const moraleImpact =
                        resp.effects.moraleDeltaAll ?? resp.effects.moraleDelta ?? 0
                      return (
                        <div
                          key={resp.id}
                          onClick={() => {
                            audio.playClick()
                            setSelectedResponseIdx(idx)
                          }}
                          className={`flex items-center justify-between rounded-xl p-3.5 cursor-pointer border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#362c22] to-[#261f18] border-[#e5c478] shadow-md'
                              : 'bg-[#181410] border-[#d4a84f]/20 hover:border-[#d4a84f]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                                isSelected
                                  ? 'bg-[#e5c478] text-[#181411]'
                                  : 'bg-[#27211c] text-[#d4a84f]'
                              }`}
                            >
                              <Wrench className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#faf7f0]">
                                {resp.label}
                              </div>
                              <div className="text-[11px] text-[#b5a695] mt-0.5">
                                {resp.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 text-xs font-bold mono">
                            <span
                              className={
                                resp.cost > 0 ? 'text-[#f5c66b]' : 'text-[#b5a695]'
                              }
                            >
                              {resp.cost > 0 ? `-$${resp.cost.toLocaleString()}` : '$0'}
                            </span>
                            <span
                              className={`text-[10.5px] ${
                                moraleImpact >= 0 ? 'text-[#65b87b]' : 'text-[#f08578]'
                              }`}
                            >
                              {moraleImpact >= 0 ? `+${moraleImpact}%` : `${moraleImpact}%`} Morale
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {!currentIncident.resolved && selectedResponse && (
                  <div className="mt-4 pt-3 border-t border-[#d4a84f]/20 flex items-center justify-between">
                    <span className="text-xs text-[#b5a695]">
                      Selected: <strong className="text-[#faf7f0]">{selectedResponse.label}</strong>
                    </span>
                    <button
                      onClick={() => handleExecuteResponse(selectedResponse.id)}
                      className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      <span>Confirm Decision ({selectedResponse.cost > 0 ? `-$${selectedResponse.cost.toLocaleString()}` : '$0'})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="panel-dark p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#65b87b] mb-3" />
              <h3 className="font-serif-title text-xl font-bold text-[#faf7f0]">
                All Corporate Crises Resolved
              </h3>
              <p className="mt-1 text-xs text-[#b5a695]">
                Your office is running smoothly. Click "+ Trigger Crisis Drill" above to test your emergency response protocols.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN (3 cols): Outcomes Preview & Employee Reactions      */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-1">
          {/* Potential Outcomes Preview */}
          <div className="panel-cream p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#181411] border-b border-[#d4c8b0] pb-2">
              Projected Decision Impact
            </div>

            {selectedResponse ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5c4e41] font-medium">Immediate Cash Cost</span>
                  <span className="mono font-extrabold text-[#181411]">
                    -${selectedResponse.cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c4e41] font-medium">Company Morale Impact</span>
                  <span className="mono font-extrabold text-emerald-800">
                    {(selectedResponse.effects.moraleDeltaAll ?? 0) >= 0 ? '+' : ''}
                    {selectedResponse.effects.moraleDeltaAll ?? 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c4e41] font-medium">Crisis Status</span>
                  <span className="font-bold text-[#966c22]">Immediate Resolution</span>
                </div>
                <div className="mt-2 rounded-lg bg-[#e6decb] p-2.5 text-[11px] text-[#27211c] italic">
                  “{selectedResponse.effects.narrative}”
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5c4e41]">Select a response option to preview its impact.</p>
            )}
          </div>

          {/* Employee Witness Reactions */}
          <div className="panel-dark p-4 flex-1">
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#d4a84f]/20 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
              <Users className="h-4 w-4 text-[#d4a84f]" />
              <span>Employee Floor Reactions</span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: 'Priya Nair (SRE)',
                  quote: 'Until this is resolved, Engineering velocity is taking a 15% hit.',
                  mood: 'Frustrated',
                },
                {
                  name: 'Yuki Tanaka (Staff Eng)',
                  quote: 'I just want working equipment and four hours of quiet focus.',
                  mood: 'Exhausted',
                },
                {
                  name: 'Chad Sterling (VP Sales)',
                  quote: 'Clients are visiting Floor 1 this afternoon—fix it fast, CEO!',
                  mood: 'Urgent',
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/15 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#faf7f0]">
                    <span>{r.name}</span>
                    <span className="text-[10px] text-[#e5c478]">{r.mood}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#b5a695] italic">“{r.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

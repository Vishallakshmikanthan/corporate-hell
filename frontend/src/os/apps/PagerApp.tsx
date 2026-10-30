/**
 * CORPORATE HELL™ — CorpOS Pager Incident App (Section 6).
 *
 * SRE on-call outage response station with sirens, postmortems,
 * and immediate incident mitigation actions.
 */
import React from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { AlertOctagon, CheckCircle2, ShieldAlert, Wrench, RefreshCw } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const PagerApp: React.FC = () => {
  const incidents = useGameStore((s) => s.state?.incidents || [])
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const activeIncidents = incidents.filter((i) => !i.resolved)

  const handleResolveIncident = (incidentId: string) => {
    audio.playCelebration()
    const inc = incidents.find((i) => i.id === incidentId)
    const respId = inc?.responses?.[0]?.id || 'mitigate'
    dispatch({
      type: 'respond_incident',
      incidentId,
      responseId: respId,
    })
    pushToast({
      title: 'Incident Mitigated',
      description: 'Production traffic restored to 100%. Postmortem generated.',
      severity: 'celebrate',
      appId: 'pager',
    })
  }

  const handleTriggerDrill = () => {
    audio.playZap()
    pushToast({
      title: 'Chaos Monkey Fire Drill',
      description: 'Simulated AZ outage injected. Team responding!',
      severity: 'warn',
      appId: 'pager',
    })
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-[#d9453d]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            SRE Pager & Incident War Room
          </span>
          <PixelBadge
            label={activeIncidents.length > 0 ? 'CRITICAL OUTAGE' : 'ALL SYSTEMS GREEN'}
            variant={activeIncidents.length > 0 ? 'red' : 'lime'}
          />
        </div>

        <PixelButton
          variant="amber"
          size="sm"
          onClick={handleTriggerDrill}
        >
          Inject Chaos Drill
        </PixelButton>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Active Incident List / Postmortem */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 bg-[#14121c] p-3 border-2 border-[#4b4a5e] overflow-y-auto pixel-scrollbar shadow-[inset_2px_2px_0px_#000000]">
        {activeIncidents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3 bg-[#2a2838] border-2 border-[#d9453d] shadow-[3px_3px_0px_#14121c] animate-slide-up"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[#d9453d]" />
                    <span className="font-bold text-xs text-white uppercase">
                      {inc.title}
                    </span>
                  </div>
                  <PixelBadge label={`SEV-${inc.severity || 1}`} variant="red" />
                </div>

                <p className="text-xs text-[#ded2b6] mb-3 leading-relaxed">
                  {inc.description ||
                    'Database connection pool exhausted due to unindexed query in customer search. 504 gateway timeout on API endpoints.'}
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#4b4a5e]">
                  <PixelButton
                    variant="lime"
                    size="sm"
                    icon={<CheckCircle2 className="h-3 w-3" />}
                    onClick={() => handleResolveIncident(inc.id)}
                  >
                    Mitigate & Restart Pods
                  </PixelButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="text-3xl mb-2">🛡</span>
            <span className="font-bold text-xs uppercase text-[#b6e52d]">
              Zero Active Incidents
            </span>
            <span className="text-[10px] text-[#8c8aa0] mt-1 max-w-xs">
              All Kubernetes clusters, Redis caches, and API gateways operating within SLA error budgets.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

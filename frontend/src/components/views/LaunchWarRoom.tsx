/**
 * CORPORATE HELL™ — Product Launch War Room View.
 *
 * Implements pre-launch readiness checklists, 60-90 second real-time launch countdown,
 * live traffic & error telemetry graphs, launch distribution channels, and crisis interventions.
 */
import { useState, useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'
import {
  Rocket,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'

export function LaunchWarRoom() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [warRoomActive, setWarRoomActive] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const [trafficSpike, setTrafficSpike] = useState(120)
  const [errorRate, setErrorRate] = useState(0.4)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'launchpad',
    'techcrunchy',
  ])

  const doneTickets = state?.tickets.filter((t) => t.state === 'done') || []
  const totalTickets = state?.tickets.length || 1
  const completeness = Math.round((doneTickets.length / totalTickets) * 100)
  const isReadinessHigh = completeness >= 50

  // 60-second live War Room ticker
  useEffect(() => {
    if (!warRoomActive) return

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setWarRoomActive(false)
          // Finalize launch
          dispatch({
            type: 'launch_product',
            name: `${state?.name || 'Corporate'} Cloud v2`,
          })
          return 0
        }
        // Random live traffic fluctuation
        setTrafficSpike((t) => Math.round(t + Math.random() * 40 - 15))
        setErrorRate((e) => Math.max(0.1, Number((e + (Math.random() * 0.2 - 0.08)).toFixed(2))))
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [warRoomActive, dispatch, state?.name])

  const startWarRoom = () => {
    setWarRoomActive(true)
    setSecondsRemaining(60)
    setTrafficSpike(450)
  }

  const handleIntervention = (type: 'scale' | 'rollback' | 'statement') => {
    if (type === 'scale') {
      dispatch({ type: 'scale_infra', instancesDelta: 2 })
      setTrafficSpike((t) => Math.round(t * 1.2))
      setErrorRate((e) => Math.max(0.05, e - 0.3))
    } else if (type === 'rollback') {
      dispatch({ type: 'rollback' })
      setErrorRate(0.1)
    } else {
      dispatch({
        type: 'post_social',
        platform: 'chirper',
        kind: 'announcement',
        content: 'We are monitoring high launch volume. All server systems scaling gracefully! 🚀',
      })
    }
  }

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Radio className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                Product Launch War Room
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  warRoomActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {warRoomActive ? '🔴 LIVE RELEASE IN PROGRESS' : 'PRE-LAUNCH READY'}
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Live telemetry monitoring, launch channel distribution, and real-time release warfare.
            </p>
          </div>
        </div>

        {/* Big Launch Trigger Button */}
        <div className="flex items-center gap-3">
          {!warRoomActive ? (
            <button
              onClick={startWarRoom}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-red-600/30 hover:bg-red-500 transition animate-bounce"
            >
              <Rocket className="h-4 w-4" />
              <span>Initiate Live Launch (60s War Room)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/80 border border-red-500/50 px-4 py-2 font-mono text-sm font-bold text-red-400">
              <Clock className="h-4 w-4 animate-spin" />
              <span>War Room Countdown: {secondsRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Live War Room Dashboard Mode */}
      {warRoomActive ? (
        <div className="mt-6 space-y-6 animate-scale-in">
          {/* Telemetry Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-5 shadow-xl">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">Live Inbound RPS</span>
              <div className="mt-1 font-mono text-2xl font-black text-paper-100">{trafficSpike.toLocaleString()} req/s</div>
              <span className="text-xs text-emerald-400 mt-1 block">+380% surge</span>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">HTTP 5xx Error Rate</span>
              <div className={`mt-1 font-mono text-2xl font-black ${errorRate > 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {errorRate.toFixed(2)}%
              </div>
              <span className="text-xs text-ink-400 mt-1 block">Target &lt; 0.5%</span>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">Active Fleet</span>
              <div className="mt-1 font-mono text-2xl font-black text-blue-400">{state?.infra.instances} Nodes</div>
              <span className="text-xs text-ink-400 mt-1 block">Auto-scaling Warm</span>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">Launch Hype Score</span>
              <div className="mt-1 font-mono text-2xl font-black text-amber-400">92 / 100</div>
              <span className="text-xs text-purple-400 mt-1 block">Viral Sentiment High</span>
            </div>
          </div>

          {/* Emergency Panic Interventions */}
          <div className="rounded-2xl border border-ink-800 bg-ink-900/90 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper-200 mb-3">
              War Room Live Interventions
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => handleIntervention('scale')}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/20"
              >
                <Zap className="h-4 w-4" />
                <span>Scale Fleet (+2 EC2 Nodes)</span>
              </button>

              <button
                onClick={() => handleIntervention('statement')}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
              >
                <Globe className="h-4 w-4" />
                <span>Broadcast Status Statement</span>
              </button>

              <button
                onClick={() => handleIntervention('rollback')}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-xs font-bold text-white hover:bg-red-600 transition shadow-lg shadow-red-700/20"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Panic Rollback (Safety)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Pre-launch Checklist & Channels Setup */
        <div className="mt-6 space-y-6">
          {/* Readiness Checklist */}
          <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-paper-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Pre-Launch Readiness Audit</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2.5">
                <div className="flex items-center gap-2.5 text-xs text-paper-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Feature Scope Completeness ({doneTickets.length}/{totalTickets} Tickets Merged)</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">{completeness}%</span>
              </div>

              <div className="flex items-center justify-between border-b border-ink-800 pb-2.5">
                <div className="flex items-center gap-2.5 text-xs text-paper-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>CI/CD Automation Pipeline Clean (0 Red Builds)</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">PASSED</span>
              </div>

              <div className="flex items-center justify-between border-b border-ink-800 pb-2.5">
                <div className="flex items-center gap-2.5 text-xs text-paper-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>AWSome Cloud Fleet Capacity ({state?.infra.capacity.toLocaleString()} req/s reserve)</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">READY</span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5 text-xs text-paper-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Product Landing Page & Marketing Content Calendar Prepared</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">READY</span>
              </div>
            </div>
          </div>

          {/* Launch Channels Selection */}
          <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-paper-100 mb-2">
              Launch Distribution Channels
            </h3>
            <p className="text-xs text-ink-400 mb-4">
              Select release platforms. High-reach channels bring massive traffic spikes and roast risks.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: 'launchpad', name: 'Launchpad #1 Product of Day', reach: '50,000 Impressions', cost: '$500' },
                { id: 'techcrunchy', name: 'Techcrunchy Exclusive Article', reach: '120,000 Impressions', cost: '$1,500' },
                { id: 'hackernooz', name: 'HackerNooz Frontpage (#1)', reach: '80,000 Devs (High Roast Risk)', cost: '$0' },
                { id: 'influencer', name: 'YouTuber Tech Reviewer Sponsor', reach: '200,000 Views', cost: '$3,000' },
                { id: 'coldemail', name: '10,000 Enterprise Cold Emails', reach: 'B2B Leads', cost: '$800' },
              ].map((chan) => {
                const isSelected = selectedChannels.includes(chan.id)

                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => toggleChannel(chan.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-red-500 bg-red-500/15 ring-2 ring-red-500/30'
                        : 'border-ink-700 bg-ink-850 hover:border-ink-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-paper-100">{chan.name}</span>
                      <span className="font-mono text-[10px] text-amber-400">{chan.cost}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-ink-400 font-mono">{chan.reach}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

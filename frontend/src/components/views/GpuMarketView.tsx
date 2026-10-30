/**
 * CORPORATE HELL™ — Parody "NVIDIOT GPUs" Market & Training Farm View.
 *
 * Implements GPU market spot price tickers, active AI model training jobs,
 * spot preemption resilience, and cluster provisioning.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import {
  Cpu,
  TrendingDown,
  TrendingUp,
  Zap,
  Play,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react'

export function GpuMarketView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [gpuCount, setGpuCount] = useState(8)
  const [mode, setMode] = useState<'spot' | 'on_demand'>('spot')
  const [checkpointing, setCheckpointing] = useState(true)

  if (!state) return null

  const market = state.gpuMarket
  const jobs = state.gpuJobs || []
  const mlTickets = state.tickets.filter((t) => t.kind === 'ml' || t.kind === 'feature')

  const handleRentCluster = () => {
    if (!selectedTicketId) return
    dispatch({
      type: 'rent_gpu',
      ticketId: selectedTicketId,
      gpus: gpuCount,
      mode,
      checkpointing,
    })
    setIsProvisionModalOpen(false)
  }

  const handleCancelJob = (jobId: string) => {
    dispatch({ type: 'cancel_gpu_job', jobId })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                NVIDIOT Cloud GPUs
              </h1>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                Market: Live Volatility
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              High-bandwidth H100 tensor core clusters for neural net fine-tuning and inference.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (mlTickets.length > 0 && !selectedTicketId) {
                setSelectedTicketId(mlTickets[0].id)
              }
              setIsProvisionModalOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:bg-purple-500 transition"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Provision H100 Cluster</span>
          </button>
        </div>
      </div>

      {/* Market Prices Ticker Bar */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Spot Price (H100 SXM5)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-purple-400">
              ${market?.spotPrice || 2.45}
            </span>
            <span className="text-xs text-ink-400 font-mono">/ GPU-hr</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>64% cheaper than on-demand</span>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            On-Demand Price (Guaranteed)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-paper-100">
              ${market?.onDemandPrice || 6.8}
            </span>
            <span className="text-xs text-ink-400 font-mono">/ GPU-hr</span>
          </div>
          <div className="mt-2 text-xs text-ink-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>0% Preemption Risk SLA</span>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Global Cluster Availability
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-400">
              {Math.round((market?.availability || 0.85) * 100)}%
            </span>
            <span className="text-xs text-ink-400 font-mono">capacity free</span>
          </div>
          <div className="mt-2 text-xs text-ink-400">
            Demand walk: Stable pool availability
          </div>
        </div>
      </div>

      {/* Active Training Jobs Section */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-paper-200">
          Active GPU Training Jobs ({jobs.filter((j) => j.status === 'running').length})
        </h2>

        <div className="mt-3 space-y-3">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8 text-center text-ink-400 text-xs">
              No active GPU clusters provisioned. Click "Provision H100 Cluster" to train an AI model!
            </div>
          ) : (
            jobs.map((job) => {
              const isPreempted = job.status === 'preempted'
              const isDone = job.status === 'completed'

              return (
                <div
                  key={job.id}
                  className={`rounded-2xl border p-5 backdrop-blur-md shadow-lg transition ${
                    isPreempted
                      ? 'border-red-500/80 bg-red-950/30'
                      : isDone
                        ? 'border-emerald-500/80 bg-emerald-950/20'
                        : 'border-ink-800 bg-ink-900/90'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isPreempted
                                ? 'bg-red-500/20 text-red-400 animate-pulse'
                                : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {job.status}
                        </span>
                        <h3 className="text-sm font-bold text-paper-100">{job.name}</h3>
                      </div>

                      <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-400 font-mono">
                        <span>Cluster: <strong className="text-paper-200">{job.gpus}x H100</strong></span>
                        <span>Mode: <strong className="uppercase text-paper-200">{job.mode}</strong></span>
                        <span>Cost So Far: <strong className="text-amber-400">${job.costAccumulated}</strong></span>
                        <span>
                          Checkpointing:{' '}
                          <strong className={job.checkpointing ? 'text-emerald-400' : 'text-ink-400'}>
                            {job.checkpointing ? 'ON' : 'OFF'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {job.status === 'running' && (
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Kill Job</span>
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-mono text-ink-300 mb-1">
                      <span>Epoch Training Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-ink-950 overflow-hidden border border-ink-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? 'bg-emerald-400' : isPreempted ? 'bg-red-400' : 'bg-purple-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Provision Cluster Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-ink-900 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-2 text-paper-50 font-bold">
              <Cpu className="h-5 w-5 text-purple-400" />
              <span>Provision H100 Cluster</span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              Configure GPU cluster allocation and resiliency mode.
            </p>

            <div className="mt-4 space-y-4">
              {/* Ticket Selection */}
              <div>
                <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">
                  Target Work Ticket
                </label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full rounded-xl border border-ink-700 bg-ink-850 px-3.5 py-2 text-xs text-paper-100 focus:outline-none"
                >
                  {mlTickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.kind.toUpperCase()}] {t.title} ({t.complexity} pts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of GPUs */}
              <div>
                <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">
                  GPU Count (Scale: {gpuCount}x)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 8, 16].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGpuCount(count)}
                      className={`rounded-xl py-2 text-xs font-bold font-mono transition ${
                        gpuCount === count
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'border border-ink-700 bg-ink-800 text-ink-300 hover:bg-ink-750'
                      }`}
                    >
                      {count}x H100
                    </button>
                  ))}
                </div>
              </div>

              {/* Spot vs On-Demand */}
              <div>
                <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">
                  Instance Billing Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('spot')}
                    className={`rounded-xl p-3 text-left border transition ${
                      mode === 'spot'
                        ? 'border-purple-500 bg-purple-500/15'
                        : 'border-ink-700 bg-ink-850'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-400">Spot (~65% Off)</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">Can be preempted if demand spikes.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('on_demand')}
                    className={`rounded-xl p-3 text-left border transition ${
                      mode === 'on_demand'
                        ? 'border-purple-500 bg-purple-500/15'
                        : 'border-ink-700 bg-ink-850'
                    }`}
                  >
                    <div className="text-xs font-bold text-paper-100">On-Demand</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">Guaranteed SLA, full price.</div>
                  </button>
                </div>
              </div>

              {/* Checkpointing Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-850 p-3">
                <div>
                  <div className="text-xs font-bold text-paper-100">Periodic Checkpointing</div>
                  <div className="text-[10px] text-ink-400">Preserves 90% progress if spot reclaimed.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckpointing(!checkpointing)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    checkpointing ? 'bg-emerald-500 text-ink-950 font-black' : 'bg-ink-800 text-ink-400'
                  }`}
                >
                  {checkpointing ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs text-ink-400 hover:text-paper-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRentCluster}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Launch Cluster</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

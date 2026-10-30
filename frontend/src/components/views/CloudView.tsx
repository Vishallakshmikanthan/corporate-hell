/**
 * CORPORATE HELL™ — Parody "AWSome Cloud" Infrastructure & Capacity View.
 *
 * Implements cloud instance auto-scaling, live traffic vs capacity gauges,
 * monthly cloud cost breakdowns, and resilience controls.
 */
import { useGameStore } from '../../state/gameStore'
import {
  Server,
  Cloud,
  Cpu,
  Database,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertOctagon,
  Globe,
} from 'lucide-react'

export function CloudView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  if (!state) return null

  const infra = state.infra
  const traffic = infra?.currentTraffic || 100
  const capacity = infra?.capacity || 1000
  const utilization = Math.round((traffic / Math.max(1, capacity)) * 100)
  const isOverloaded = utilization >= 100
  const isOutage = (infra?.outageTicksRemaining || 0) > 0

  const handleScaleInstances = (delta: number) => {
    dispatch({ type: 'scale_infra', instancesDelta: delta })
  }

  const handleToggleAutoscale = () => {
    dispatch({ type: 'scale_infra', instancesDelta: 0, autoscale: !infra?.autoscale })
  }

  const handleToggleCdn = () => {
    dispatch({ type: 'scale_infra', instancesDelta: 0, cdn: !infra?.cdn })
  }

  const handleToggleBackups = () => {
    dispatch({ type: 'scale_infra', instancesDelta: 0, backups: !infra?.backups })
  }

  const handleSelectDb = (dbSize: 'S' | 'M' | 'L') => {
    dispatch({ type: 'scale_infra', instancesDelta: 0, dbSize })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Cloud className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                AWSome Cloud Console
              </h1>
              <span className="rounded-full bg-ink-800 text-ink-300 border border-ink-700 px-2 py-0.5 text-[10px] font-bold font-mono">
                Region: us-east-1 (N. Virginia)
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Production compute fleet, managed database, edge CDN routing, and disaster recovery.
            </p>
          </div>
        </div>

        {/* Global Uptime & SLA Meter */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">30-Day SLA Uptime</div>
            <div className={`font-mono text-sm font-bold ${state.uptime < 99 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {state.uptime.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Est. Cloud Invoice</div>
            <div className="font-mono text-sm font-bold text-orange-400">${infra?.monthlyCost || 950}/mo</div>
          </div>
        </div>
      </div>

      {/* Traffic vs Capacity Live Overload Meter */}
      <div className={`mt-6 rounded-2xl border p-5 backdrop-blur-md shadow-xl transition ${
        isOutage
          ? 'border-red-500 bg-red-950/40 animate-pulse'
          : isOverloaded
            ? 'border-amber-500 bg-amber-950/30'
            : 'border-ink-800 bg-ink-900/80'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Activity className="h-4 w-4 text-orange-400" />
            <span className="text-paper-50">Live Traffic vs Capacity Gauge</span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase ${
            isOutage
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : isOverloaded
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {isOutage ? '⚠️ Outage Active: Service Degraded' : isOverloaded ? 'Heavy Load: 100%+ Capacity' : 'Nominal Health'}
          </span>
        </div>

        {/* Progress Meter Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono text-ink-300 mb-1.5">
            <span>Current Traffic: <strong className="text-paper-100">{traffic.toLocaleString()} req/s</strong></span>
            <span>Server Fleet Limit: <strong className="text-paper-100">{capacity.toLocaleString()} req/s</strong> ({utilization}%)</span>
          </div>
          <div className="h-3 w-full rounded-full bg-ink-950 overflow-hidden border border-ink-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilization >= 100 ? 'bg-red-500' : utilization >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Cloud Hardware Configuration */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Compute Instances */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-100">EC2 Instances</span>
            </div>
            <span className="font-mono text-sm font-bold text-paper-50">{infra?.instances || 3} Nodes</span>
          </div>
          <p className="mt-2 text-xs text-ink-400 leading-relaxed">
            Linux virtual compute workers running microservices behind load balancer.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-3">
            <span className="text-xs font-mono text-ink-300">$120/instance/mo</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScaleInstances(-1)}
                disabled={(infra?.instances || 3) <= 1}
                className="h-7 w-7 rounded-lg border border-ink-700 bg-ink-800 font-bold text-sm text-paper-200 hover:bg-ink-750 disabled:opacity-40 transition"
              >
                -
              </button>
              <button
                onClick={() => handleScaleInstances(1)}
                disabled={(infra?.instances || 3) >= 24}
                className="h-7 w-7 rounded-lg border border-ink-700 bg-ink-800 font-bold text-sm text-paper-200 hover:bg-ink-750 disabled:opacity-40 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Managed Database */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-100">PostgreSQL RDS</span>
            </div>
            <span className="font-mono text-sm font-bold text-paper-50">Tier: {infra?.dbSize || 'M'}</span>
          </div>
          <p className="mt-2 text-xs text-ink-400 leading-relaxed">
            Primary relational transactional storage engine with read replicas.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-3">
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {(['S', 'M', 'L'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSelectDb(tier)}
                  className={`rounded-lg py-1 text-xs font-bold font-mono transition ${
                    infra?.dbSize === tier
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'border border-ink-700 bg-ink-800 text-ink-300 hover:bg-ink-750'
                  }`}
                >
                  {tier} ({tier === 'S' ? '$90' : tier === 'M' ? '$280' : '$650'})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-scaling Switch */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-100">Auto-Scaling</span>
            </div>
            <button
              onClick={handleToggleAutoscale}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                infra?.autoscale
                  ? 'bg-amber-500 text-ink-950 font-black'
                  : 'bg-ink-800 text-ink-400 border border-ink-700'
              }`}
            >
              {infra?.autoscale ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400 leading-relaxed">
            Automatically spins up new EC2 instances when traffic exceeds 80% fleet capacity.
          </p>
          <div className="mt-4 text-[11px] font-mono text-ink-300 border-t border-ink-800 pt-3">
            Reserve Buffer: +$160/mo
          </div>
        </div>

        {/* Global Edge CDN */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-100">CloudFront CDN</span>
            </div>
            <button
              onClick={handleToggleCdn}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                infra?.cdn
                  ? 'bg-cyan-500 text-ink-950 font-black'
                  : 'bg-ink-800 text-ink-400 border border-ink-700'
              }`}
            >
              {infra?.cdn ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400 leading-relaxed">
            Edge caching for static assets and API responses. Multiplies request capacity by 1.5x.
          </p>
          <div className="mt-4 text-[11px] font-mono text-ink-300 border-t border-ink-800 pt-3">
            Edge Network Cost: +$120/mo
          </div>
        </div>

        {/* Automated Daily Backups */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-100">Daily S3 Backups</span>
            </div>
            <button
              onClick={handleToggleBackups}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                infra?.backups
                  ? 'bg-emerald-500 text-ink-950 font-black'
                  : 'bg-ink-800 text-ink-400 border border-ink-700'
              }`}
            >
              {infra?.backups ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400 leading-relaxed">
            Disaster recovery protection. Disabling saves $60/mo but creates catastrophic data loss risk!
          </p>
          <div className="mt-4 text-[11px] font-mono text-ink-300 border-t border-ink-800 pt-3">
            Glacier Archive Cost: +$60/mo
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-paper-100">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>SRE War Room Actions</span>
            </div>
            <p className="mt-2 text-xs text-ink-400 leading-relaxed">
              Quick emergency controls during traffic spikes or outage incidents.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => handleScaleInstances(2)}
              className="w-full rounded-xl bg-orange-600/20 text-orange-300 border border-orange-500/30 py-2 text-xs font-bold hover:bg-orange-600/30 transition"
            >
              + Spin Up 2 Emergency Instances
            </button>
            <button
              onClick={() => dispatch({ type: 'rollback' })}
              className="w-full rounded-xl bg-ink-800 text-ink-300 border border-ink-700 py-2 text-xs font-bold hover:bg-ink-750 transition"
            >
              Rollback Production Fleet Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

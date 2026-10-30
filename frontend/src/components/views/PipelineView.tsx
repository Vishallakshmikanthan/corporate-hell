/**
 * CORPORATE HELL™ — CI/CD Pipeline & Build Rectification View.
 *
 * Implements 9 visual pipeline stages, interactive build failure remediation cards,
 * build console logs, and production deployment trigger gates.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { STRATEGY_CONFIGS } from '../../game/engine/deploy'
import type { DeployStrategy } from '../../game/models/types'
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Rocket,
  ShieldCheck,
  Server,
  Cpu,
} from 'lucide-react'

export function PipelineView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const [selectedStrategy, setSelectedStrategy] = useState<DeployStrategy>('rolling')
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)

  if (!state) return null

  const pipeline = state.pipeline
  const stages = pipeline?.stages || []
  const failure = pipeline?.activeFailure
  const isAllPassed = pipeline?.status === 'passed'

  const handleTriggerPipeline = () => {
    dispatch({ type: 'run_pipeline' })
  }

  const handleApplyFix = (optionId: string) => {
    if (!failure) return
    dispatch({ type: 'fix_pipeline_failure', failureId: failure.id, optionId })
  }

  const handleDeployProduction = () => {
    dispatch({ type: 'deploy', environment: 'prod', strategy: selectedStrategy })
    setIsDeployModalOpen(false)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              pipeline?.status === 'running'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : pipeline?.status === 'failed'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                CI/CD Automation Pipeline
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  pipeline?.status === 'running'
                    ? 'bg-amber-500/20 text-amber-400'
                    : pipeline?.status === 'failed'
                      ? 'bg-red-500/20 text-red-400'
                      : pipeline?.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-ink-800 text-ink-400'
                }`}
              >
                {pipeline?.status || 'idle'}
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Continuous Integration & Deployment gatekeeper for main release artifacts.
            </p>
          </div>
        </div>

        {/* Pipeline Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPipeline}
            disabled={pipeline?.status === 'running'}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Trigger Build</span>
          </button>

          {isAllPassed && (
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 transition animate-bounce"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Deploy to Prod</span>
            </button>
          )}
        </div>
      </div>

      {/* 9 Stages Visual Progression Grid */}
      <div className="py-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-9">
          {stages.map((stage, idx) => {
            const isCurrent = pipeline.status === 'running' && pipeline.currentStageIndex === idx
            const isPassed = stage.status === 'passed'
            const isFailed = stage.status === 'failed'

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col rounded-xl border p-3 transition shadow-md ${
                  isFailed
                    ? 'border-red-500 bg-red-950/30'
                    : isCurrent
                      ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/40 animate-pulse'
                      : isPassed
                        ? 'border-emerald-600/60 bg-emerald-950/20'
                        : 'border-ink-800 bg-ink-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-400 font-bold">0{idx + 1}</span>
                  {isPassed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {isFailed && <XCircle className="h-4 w-4 text-red-400" />}
                  {isCurrent && <Zap className="h-4 w-4 text-amber-400 animate-spin" />}
                  {!isPassed && !isFailed && !isCurrent && (
                    <span className="h-2 w-2 rounded-full bg-ink-700" />
                  )}
                </div>

                <div className="mt-2 text-xs font-bold text-paper-100 line-clamp-1">{stage.name}</div>
                <div className="text-[10px] text-ink-400 font-mono mt-0.5 capitalize">{stage.status}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Pipeline Failure Remediation Card */}
      {failure && (
        <div className="mb-6 rounded-2xl border border-red-500/60 bg-red-950/40 p-5 shadow-2xl backdrop-blur-md animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>BUILD FAILURE: {failure.title}</span>
              </div>
              <p className="mt-1 text-xs text-red-200/90 font-mono">{failure.cause}</p>
            </div>
            <span className="rounded bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold uppercase">
              Action Required
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {failure.fixOptions.map((opt) => (
              <div
                key={opt.id}
                className="flex flex-col justify-between rounded-xl border border-ink-700 bg-ink-900/90 p-3.5 shadow-md hover:border-ink-600 transition"
              >
                <div>
                  <h4 className="text-xs font-bold text-paper-100">{opt.label}</h4>
                  <p className="text-[11px] text-ink-300 mt-1 leading-snug">{opt.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="text-emerald-400">Success: {Math.round(opt.successChance * 100)}%</span>
                    <span className={opt.techDebtDelta > 0 ? 'text-red-400' : 'text-blue-400'}>
                      Tech Debt: {opt.techDebtDelta > 0 ? `+${opt.techDebtDelta}` : opt.techDebtDelta}
                    </span>
                    {opt.cost > 0 && <span className="text-amber-400">Cost: ${opt.cost}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyFix(opt.id)}
                  className="mt-3.5 w-full rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition shadow"
                >
                  Apply Remediation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Build Console Logs */}
      <div className="flex flex-1 flex-col rounded-2xl border border-ink-800 bg-ink-900/80 p-4 shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-800 pb-2 text-xs font-mono text-ink-400">
          <Terminal className="h-3.5 w-3.5 text-blue-400" />
          <span>Pipeline Console Log (STDOUT/STDERR)</span>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto font-mono text-xs text-ink-300 space-y-1 pr-1">
          {stages.map((stage) => (
            <div key={stage.id} className="flex gap-2">
              <span className="text-ink-500 select-none">[{stage.id}]</span>
              <span className={stage.status === 'failed' ? 'text-red-400 font-bold' : stage.status === 'passed' ? 'text-emerald-400' : 'text-ink-400'}>
                {stage.log || `Awaiting stage execution...`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Production Deploy Strategy Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-2 text-paper-50 font-bold">
              <Rocket className="h-5 w-5 text-emerald-400" />
              <span>Select Production Release Strategy</span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              Choose your deployment risk profile and traffic rollout strategy.
            </p>

            <div className="mt-4 space-y-2.5">
              {(Object.keys(STRATEGY_CONFIGS) as DeployStrategy[]).map((stratKey) => {
                const strat = STRATEGY_CONFIGS[stratKey]
                const isSelected = selectedStrategy === stratKey

                return (
                  <button
                    key={stratKey}
                    type="button"
                    onClick={() => setSelectedStrategy(stratKey)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                        : 'border-ink-700 bg-ink-850 hover:border-ink-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-paper-100">{strat.name}</span>
                      <span className="font-mono text-[10px] text-amber-400">
                        {strat.cost > 0 ? `$${strat.cost}` : 'Free'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-300">{strat.description}</p>
                    <div className="mt-1.5 flex gap-3 text-[10px] font-mono text-ink-400">
                      <span>Speed: {strat.speed}</span>
                      <span className={strat.risk > 0.2 ? 'text-red-400' : 'text-emerald-400'}>
                        Risk: {Math.round(strat.risk * 100)}%
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeployModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs text-ink-400 hover:text-paper-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeployProduction}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>Confirm & Release to Production</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

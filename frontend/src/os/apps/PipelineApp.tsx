/**
 * CORPORATE HELL™ — CorpOS Pipeline (CI/CD) App (Section 6).
 *
 * Factory conveyor belt with 9 machines, little animated build-bot,
 * sparking failures, and one-click fix mini-game.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { Play, Wrench, AlertTriangle, CheckCircle, RotateCw, Sparkles } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const PipelineApp: React.FC = () => {
  const pipeline = useGameStore((s) => s.state?.pipeline)
  const dispatch = useGameStore((s) => s.dispatch)

  const [activeFailureStage, setActiveFailureStage] = useState<string | null>(null)
  const [selectedFix, setSelectedFix] = useState<string | null>(null)

  const stages = pipeline?.stages || [
    { id: 'lint', name: 'Lint', status: 'passed', durationTicks: 2 },
    { id: 'unit_tests', name: 'Unit Tests', status: 'passed', durationTicks: 4 },
    { id: 'build', name: 'Build', status: 'passed', durationTicks: 5 },
    { id: 'integration_tests', name: 'Integration', status: 'running', durationTicks: 6 },
    { id: 'security_scan', name: 'Security', status: 'pending', durationTicks: 3 },
    { id: 'docker_image', name: 'Docker', status: 'pending', durationTicks: 4 },
    { id: 'deploy_staging', name: 'Staging', status: 'pending', durationTicks: 2 },
    { id: 'smoke_tests', name: 'Smoke', status: 'pending', durationTicks: 3 },
    { id: 'deploy_prod', name: 'Deploy Prod', status: 'pending', durationTicks: 2 },
  ]

  const handleRunPipeline = () => {
    audio.playLever()
    dispatch({ type: 'run_pipeline' })
  }

  const handleFixStage = (fixId: string) => {
    audio.playLever()
    dispatch({
      type: 'fix_pipeline_failure',
      failureId: pipeline?.activeFailure?.id || 'fail-1',
      optionId: fixId,
    })
    setActiveFailureStage(null)
  }

  const isFailing = stages.some((s) => s.status === 'failed')

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">⚙</span>
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            CI/CD Factory Conveyor
          </span>
          <PixelBadge
            label={isFailing ? 'BROKEN BUILD' : pipeline?.status || 'HEALTHY'}
            variant={isFailing ? 'red' : 'lime'}
          />
        </div>

        <PixelButton
          variant="lime"
          size="sm"
          icon={<Play className="h-3 w-3" />}
          onClick={handleRunPipeline}
          disabled={pipeline?.status === 'running'}
        >
          Run Pipeline
        </PixelButton>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Factory Conveyor Belt with 9 Stations */}
      {/* ----------------------------------------------------------- */}
      <div className="relative bg-[#14121c] p-4 border-2 border-[#4b4a5e] mb-2.5 shadow-[inset_2px_2px_0px_#000000]">
        <div className="text-[10px] text-[#8c8aa0] uppercase font-bold mb-3 flex items-center justify-between">
          <span>🏭 Conveyor Belt Stations</span>
          <span>Click failing station to deploy emergency fix</span>
        </div>

        {/* The Conveyor Belt Graphic */}
        <div className="relative overflow-x-auto pixel-scrollbar pb-3">
          <div className="flex items-center justify-between min-w-[700px] bg-[#272635] p-3 border-y-4 border-[#4b4a5e] shadow-[inset_0_4px_0_#14121c,inset_0_-4px_0_#14121c]">
            {stages.map((stage, idx) => {
              const statusColor = {
                passed: 'bg-[#3f8f4e] text-white border-[#b6e52d]',
                running: 'bg-[#3e6ec0] text-white border-[#8fd3ff] animate-pulse',
                failed: 'bg-[#d9453d] text-white border-white animate-bounce',
                pending: 'bg-[#2a2838] text-[#8c8aa0] border-[#4b4a5e]',
              }[stage.status || 'pending']

              const statusIcon = {
                passed: '✓',
                running: '⚙',
                failed: '⚡',
                pending: '·',
              }[stage.status || 'pending']

              return (
                <div key={stage.id} className="flex items-center">
                  {/* Station Machine */}
                  <div
                    onClick={() => {
                      if (stage.status === 'failed') {
                        audio.playZap()
                        setActiveFailureStage(stage.id)
                      }
                    }}
                    className={`
                      relative flex flex-col items-center justify-center p-2.5 w-18 h-20 border-2 select-none text-center cursor-pointer
                      shadow-[2px_2px_0px_#14121c] hover:brightness-110 active:top-[1px]
                      ${statusColor}
                    `}
                  >
                    {/* Machine Chimney / Beacon */}
                    <div className="absolute -top-3 w-4 h-3 bg-[#4b4a5e] border border-[#14121c]">
                      {stage.status === 'failed' && (
                        <div className="w-2 h-2 rounded-full bg-[#d9453d] animate-ping mx-auto" />
                      )}
                    </div>

                    <span className="text-base font-bold">{statusIcon}</span>
                    <span className="text-[9px] font-bold uppercase truncate max-w-[60px] mt-1">
                      {stage.name}
                    </span>
                  </div>

                  {/* Conveyor Belt Rollers Between Stations */}
                  {idx < stages.length - 1 && (
                    <div className="flex items-center px-1">
                      <div className="h-2 w-3 bg-[#14121c] border-t border-b border-[#ded2b6]/20" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Little Walking Build Bot */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#8fd3ff]">
            <span>🤖 Build-Bot:</span>
            <span>
              {isFailing
                ? 'CRITICAL ALERT! Pipeline halted at broken station!'
                : 'All assembly machines operational. Zero regressions.'}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Bottom: Fix Mini-Game Panel */}
      {/* ----------------------------------------------------------- */}
      {isFailing || activeFailureStage ? (
        <div className="flex-1 bg-[#2a2838] p-3 border-2 border-[#d9453d] shadow-[3px_3px_0px_#14121c] animate-slide-up">
          <div className="flex items-center justify-between border-b-2 border-[#14121c] pb-2 mb-2 text-[#d9453d]">
            <span className="font-bold text-xs uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Emergency Build Repair Console
            </span>
            <span className="text-[10px] text-[#ded2b6]">Choose an engineering action:</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div
              onClick={() => handleFixStage('hotfix_patch')}
              className="p-2.5 bg-[#14121c] border-2 border-[#4b4a5e] hover:border-[#b6e52d] cursor-pointer shadow-[2px_2px_0px_#14121c]"
            >
              <h5 className="font-bold text-xs text-[#b6e52d] uppercase">1. Hotfix Patch</h5>
              <p className="text-[10px] text-[#ded2b6] mt-1 leading-tight">
                Quick patch straight to branch. 90% success, +2 tech debt.
              </p>
            </div>

            <div
              onClick={() => handleFixStage('re_run_clean')}
              className="p-2.5 bg-[#14121c] border-2 border-[#4b4a5e] hover:border-[#8fd3ff] cursor-pointer shadow-[2px_2px_0px_#14121c]"
            >
              <h5 className="font-bold text-xs text-[#8fd3ff] uppercase">2. Clear Cache & Re-run</h5>
              <p className="text-[10px] text-[#ded2b6] mt-1 leading-tight">
                Flush npm & Docker build cache. Flaky tests pass 60% of the time.
              </p>
            </div>

            <div
              onClick={() => handleFixStage('rollback_commit')}
              className="p-2.5 bg-[#14121c] border-2 border-[#4b4a5e] hover:border-[#f2a93b] cursor-pointer shadow-[2px_2px_0px_#14121c]"
            >
              <h5 className="font-bold text-xs text-[#f2a93b] uppercase">3. Safe Git Rollback</h5>
              <p className="text-[10px] text-[#ded2b6] mt-1 leading-tight">
                Revert to previous green commit. 100% stable, delays ticket by 1 day.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Console Log Drawer */
        <div className="flex-1 bg-[#14121c] p-2.5 border-2 border-[#4b4a5e] font-mono text-[10px] text-[#b6e52d] overflow-y-auto pixel-scrollbar">
          <div className="text-[#8c8aa0] mb-1">--- Automated Pipeline Telemetry Log ---</div>
          <div>[INFO] Workspace linting checked 142 files. 0 errors, 2 warnings.</div>
          <div>[INFO] Vitest unit test suite executed: 20 passed in 548ms.</div>
          <div>[INFO] Docker image built: sha256:9f8e4c... tag: prod-latest</div>
          <div className="text-[#8fd3ff]">[OK] All stages passed. Ready for release.</div>
        </div>
      )}
    </div>
  )
}

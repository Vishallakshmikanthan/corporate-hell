/**
 * CORPORATE HELL™ — CI/CD Pipeline & Error Rectification Engine.
 *
 * Implements 9 pipeline stages, formula-driven failure rolls,
 * failure catalogue, and remediation choices.
 */
import type {
  CompanyState,
  Pipeline,
  PipelineFailure,
  PipelineStage,
  PipelineStageId,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export const STAGE_CONFIGS: { id: PipelineStageId; name: string; baseRisk: number; duration: number }[] = [
  { id: 'lint', name: 'Lint & Style Checks', baseRisk: 0.08, duration: 1 },
  { id: 'unit_tests', name: 'Unit Tests Suite', baseRisk: 0.12, duration: 1 },
  { id: 'build', name: 'TypeScript & Bundle Build', baseRisk: 0.06, duration: 1 },
  { id: 'integration_tests', name: 'Integration & E2E Tests', baseRisk: 0.15, duration: 2 },
  { id: 'security_scan', name: 'SAST & Dependency Scan', baseRisk: 0.07, duration: 1 },
  { id: 'docker_image', name: 'OCI Docker Image Bake', baseRisk: 0.05, duration: 1 },
  { id: 'deploy_staging', name: 'Deploy to Staging Cluster', baseRisk: 0.04, duration: 1 },
  { id: 'smoke_tests', name: 'Synthetic Staging Smoke Tests', baseRisk: 0.06, duration: 1 },
  { id: 'deploy_prod', name: 'Production Gate & Release', baseRisk: 0.03, duration: 1 },
]

export function createInitialPipeline(): Pipeline {
  return {
    status: 'idle',
    currentStageIndex: 0,
    stages: STAGE_CONFIGS.map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      status: 'pending',
      durationTicks: cfg.duration,
      log: undefined,
    })),
    lastRunTick: 0,
  }
}

/**
 * Calculates failure chance for a stage using Section 10 formula:
 * clamp(base[stage] + techDebt*0.003 - coverage*0.002 - codeQuality*0.001, 0.02, 0.60)
 */
export function calculateStageFailureChance(
  stageId: PipelineStageId,
  techDebt: number,
  testCoverage: number,
  codeQuality: number,
): number {
  const cfg = STAGE_CONFIGS.find((c) => c.id === stageId)
  const base = cfg ? cfg.baseRisk : 0.08
  const raw = base + techDebt * 0.003 - testCoverage * 0.002 - codeQuality * 0.001
  return clamp(Number(raw.toFixed(4)), 0.02, 0.6)
}

/**
 * Generates typed failure catalog entry for a failing stage.
 */
export function generatePipelineFailure(
  stageId: PipelineStageId,
  rng: SeededRandom,
): PipelineFailure {
  const failureId = `fail_${stageId}_${Math.floor(rng.next() * 100000).toString(36)}`

  switch (stageId) {
    case 'lint':
      return {
        id: failureId,
        stageId,
        title: 'ESLint & Prettier Format Failures',
        cause: 'Unused variables, missing trailing commas, and any-typed parameters.',
        fixOptions: [
          {
            id: 'fix_lint_auto',
            label: 'Run eslint --fix (Standard)',
            description: 'Automatically formats code and fixes safe violations.',
            cost: 0,
            techDebtDelta: -1,
            timeCostTicks: 0,
            successChance: 0.95,
          },
          {
            id: 'fix_lint_ignore',
            label: 'Add // eslint-disable-next-line',
            description: 'Sweep warnings under the rug to ship quickly.',
            cost: 0,
            techDebtDelta: 4,
            timeCostTicks: 0,
            successChance: 1.0,
          },
        ],
      }

    case 'unit_tests':
      return {
        id: failureId,
        stageId,
        title: 'Flaky Unit Tests Failed in Assertion',
        cause: 'Race condition in async event emitter timed out after 5000ms.',
        fixOptions: [
          {
            id: 'fix_test_retry',
            label: 'Rerun Job ("Maybe It Works This Time")',
            description: 'Retry the build and pray to the CI gods.',
            cost: 0,
            techDebtDelta: 1,
            timeCostTicks: 0,
            successChance: 0.6,
          },
          {
            id: 'fix_test_quarantine',
            label: 'Quarantine Test with .skip()',
            description: 'Disable the failing test file. Out of sight, out of mind.',
            cost: 0,
            techDebtDelta: 5,
            timeCostTicks: 0,
            successChance: 1.0,
          },
          {
            id: 'fix_test_rewrite',
            label: 'Fix Root Cause Timing Logic',
            description: 'Rewrite the flaky mock with proper promise hooks.',
            cost: 250,
            techDebtDelta: -3,
            timeCostTicks: 1,
            successChance: 0.95,
          },
        ],
      }

    case 'build':
      return {
        id: failureId,
        stageId,
        title: 'TypeScript Typecheck & Dependency Collision',
        cause: 'Package transitive version mismatch: react types conflicting with third party lib.',
        fixOptions: [
          {
            id: 'fix_build_pin',
            label: 'Pin Overrides in package.json',
            description: 'Force exact dependency resolution in lockfile.',
            cost: 150,
            techDebtDelta: -1,
            timeCostTicks: 1,
            successChance: 0.92,
          },
          {
            id: 'fix_build_legacy',
            label: 'npm install --legacy-peer-deps --force',
            description: 'Brute-force ignore dependency graph constraints.',
            cost: 0,
            techDebtDelta: 6,
            timeCostTicks: 0,
            successChance: 1.0,
          },
        ],
      }

    case 'security_scan':
      return {
        id: failureId,
        stageId,
        title: 'Critical CVE Vulnerability in Transitive Dependency',
        cause: 'Prototype pollution detected in string-templating parser.',
        fixOptions: [
          {
            id: 'fix_sec_patch',
            label: 'Patch and Upgrade Dependency',
            description: 'Upgrade to verified patched release.',
            cost: 300,
            techDebtDelta: -4,
            timeCostTicks: 1,
            successChance: 0.95,
          },
          {
            id: 'fix_sec_override',
            label: 'Add Security Scanner Exception Override',
            description: 'Mark CVE as "intended feature" in audit configuration.',
            cost: 0,
            techDebtDelta: 8,
            timeCostTicks: 0,
            successChance: 1.0,
          },
        ],
      }

    case 'docker_image':
      return {
        id: failureId,
        stageId,
        title: 'Docker Image Exceeded Size Limit (> 2.4 GB)',
        cause: 'Uncached build layers and dangling node_modules bloated image.',
        fixOptions: [
          {
            id: 'fix_docker_multistage',
            label: 'Implement Multi-Stage Alpine Build',
            description: 'Shrink container image down to lean production artifact.',
            cost: 200,
            techDebtDelta: -3,
            timeCostTicks: 1,
            successChance: 0.94,
          },
          {
            id: 'fix_docker_increase_ram',
            label: 'Upgrade CI Runner Disk & RAM',
            description: 'Throw cloud dollars at the oversized container.',
            cost: 400,
            techDebtDelta: 0,
            timeCostTicks: 0,
            successChance: 1.0,
          },
        ],
      }

    default:
      return {
        id: failureId,
        stageId,
        title: `${STAGE_CONFIGS.find((s) => s.id === stageId)?.name || 'Stage'} Failed`,
        cause: 'Unexpected runtime assertion or timeout in deployment environment.',
        fixOptions: [
          {
            id: 'fix_gen_retry',
            label: 'Clean Cache and Re-trigger Stage',
            description: 'Retry with fresh virtual machine worker.',
            cost: 100,
            techDebtDelta: 0,
            timeCostTicks: 0,
            successChance: 0.85,
          },
          {
            id: 'fix_gen_investigate',
            label: 'Root Cause Investigation',
            description: 'DevOps team analyzes telemetry and patches environment.',
            cost: 350,
            techDebtDelta: -2,
            timeCostTicks: 1,
            successChance: 0.98,
          },
        ],
      }
  }
}

/**
 * Triggers a new CI/CD pipeline run.
 */
export function startPipelineRun(state: CompanyState): void {
  state.pipeline.status = 'running'
  state.pipeline.currentStageIndex = 0
  state.pipeline.activeFailure = undefined
  state.pipeline.lastRunTick = state.tick

  state.pipeline.stages.forEach((stage, idx) => {
    stage.status = idx === 0 ? 'running' : 'pending'
    stage.log = idx === 0 ? 'Starting lint and style verification...' : undefined
  })
}

/**
 * Advances the pipeline simulation tick.
 */
export function advancePipeline(state: CompanyState, rng: SeededRandom): void {
  const p = state.pipeline
  if (p.status !== 'running') return

  const stage = p.stages[p.currentStageIndex]
  if (!stage) {
    p.status = 'passed'
    return
  }

  // Roll for stage failure
  const failChance = calculateStageFailureChance(
    stage.id,
    state.techDebt,
    state.testCoverage,
    state.codeQuality,
  )

  if (rng.boolean(failChance)) {
    stage.status = 'failed'
    p.status = 'failed'
    const failure = generatePipelineFailure(stage.id, rng)
    p.activeFailure = failure
    stage.log = `FAILED: ${failure.title} — ${failure.cause}`
    return
  }

  // Stage passed!
  stage.status = 'passed'
  stage.log = `Passed cleanly in ${stage.durationTicks} tick(s).`

  p.currentStageIndex += 1
  if (p.currentStageIndex >= p.stages.length) {
    p.status = 'passed'
  } else {
    p.stages[p.currentStageIndex].status = 'running'
    p.stages[p.currentStageIndex].log = `Executing ${p.stages[p.currentStageIndex].name}...`
  }
}

/**
 * Applies a player's fix option to resolve a pipeline failure.
 */
export function applyPipelineFix(
  state: CompanyState,
  failureId: string,
  optionId: string,
  rng: SeededRandom,
): { ok: boolean; message: string } {
  const p = state.pipeline
  if (!p.activeFailure || p.activeFailure.id !== failureId) {
    return { ok: false, message: 'Failure was not found or already dismissed.' }
  }

  const option = p.activeFailure.fixOptions.find((o) => o.id === optionId)
  if (!option) {
    return { ok: false, message: 'Fix option not found.' }
  }

  if (option.cost > 0 && state.cash < option.cost) {
    return { ok: false, message: `Insufficient cash ($${option.cost} required).` }
  }

  state.cash -= option.cost
  state.techDebt = clamp(state.techDebt + option.techDebtDelta, 0, 100)
  state.repo.techDebt = state.techDebt

  const roll = rng.next()
  if (roll <= option.successChance) {
    // Fix succeeded! Resume pipeline
    const stage = p.stages[p.currentStageIndex]
    if (stage) {
      stage.status = 'passed'
      stage.log = `Fixed via: ${option.label}. Resumed execution.`
    }
    p.activeFailure = undefined
    p.currentStageIndex += 1
    if (p.currentStageIndex >= p.stages.length) {
      p.status = 'passed'
    } else {
      p.status = 'running'
      p.stages[p.currentStageIndex].status = 'running'
    }
    return { ok: true, message: `Fix applied successfully: ${option.label}` }
  } else {
    // Fix failed!
    return {
      ok: false,
      message: `Fix attempt failed (${Math.round((1 - option.successChance) * 100)}% gamble failed). Try another remediation strategy.`,
    }
  }
}

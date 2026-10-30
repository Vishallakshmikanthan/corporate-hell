/**
 * CORPORATE HELL™ — Mini-Game Logic & Auto-Resolve Engines.
 *
 * Implements pure functions `(skill, input, rng) -> result` for interactive
 * mini-games and their 1-click Auto-resolve counterparts.
 */
import { clamp } from '../../models/types'
import { SeededRandom } from '../rng'

export interface MiniGameResult {
  success: boolean
  score: number // 0..100
  qualityBonus: number
  techDebtDelta: number
  summary: string
}

/**
 * 1. Code Review & Bug-Spotting Mini-Game
 */
export function resolveCodeReviewMiniGame(
  skillTechnical: number,
  selectedBugIndex: number,
  actualBugIndex: number,
  rng: SeededRandom,
  isAuto = false,
): MiniGameResult {
  if (isAuto) {
    // Auto-resolve rolls based on technical skill (1..10)
    const successChance = clamp(0.5 + skillTechnical * 0.04, 0.5, 0.9)
    const success = rng.boolean(successChance)
    return {
      success,
      score: success ? 80 : 45,
      qualityBonus: success ? 6 : -2,
      techDebtDelta: success ? -2 : 3,
      summary: success
        ? 'Auto-Review: Teammate successfully spotted subtle off-by-one error.'
        : 'Auto-Review: Bug missed during quick scan. Shipped minor tech debt.',
    }
  }

  const success = selectedBugIndex === actualBugIndex
  return {
    success,
    score: success ? 95 : 30,
    qualityBonus: success ? 10 : -4,
    techDebtDelta: success ? -4 : 4,
    summary: success
      ? 'Flawless review! Caught null-check vulnerability before merging.'
      : 'Missed the bug! PR approved with latent regression risk.',
  }
}

/**
 * 2. Merge Conflict Resolver Mini-Game
 */
export function resolveMergeConflictMiniGame(
  strategy: 'ours' | 'theirs' | 'manual',
  isCleanManual: boolean,
  rng: SeededRandom,
  isAuto = false,
): MiniGameResult {
  if (isAuto) {
    const success = rng.boolean(0.75)
    return {
      success,
      score: success ? 75 : 50,
      qualityBonus: success ? 3 : -2,
      techDebtDelta: success ? 0 : 2,
      summary: success
        ? 'Auto-resolved Git merge conflicts using automated 3-way merge algorithm.'
        : 'Auto-merge produced noisy merge commit with minor tech debt.',
    }
  }

  if (strategy === 'manual') {
    const success = isCleanManual
    return {
      success,
      score: success ? 100 : 40,
      qualityBonus: success ? 8 : -3,
      techDebtDelta: success ? -3 : 3,
      summary: success
        ? 'Clean manual cherry-pick and conflict resolution! Zero regressions.'
        : 'Accidentally deleted upstream function during conflict editing!',
    }
  }

  return {
    success: true,
    score: 70,
    qualityBonus: 2,
    techDebtDelta: 1,
    summary: `Merged using ${strategy.toUpperCase()} strategy cleanly.`,
  }
}

/**
 * 3. CI/CD Build Log Reading Puzzle Mini-Game
 */
export function resolveCiLogPuzzle(
  skillTechnical: number,
  chosenOptionId: string,
  correctOptionId: string,
  rng: SeededRandom,
  isAuto = false,
): MiniGameResult {
  if (isAuto) {
    const successChance = clamp(0.55 + skillTechnical * 0.04, 0.55, 0.92)
    const success = rng.boolean(successChance)
    return {
      success,
      score: success ? 80 : 40,
      qualityBonus: success ? 5 : -2,
      techDebtDelta: success ? -2 : 3,
      summary: success
        ? 'Auto-parsed CI stack trace: Identified missing peer dependency.'
        : 'Auto-fix applied generic patch with sub-optimal results.',
    }
  }

  const success = chosenOptionId === correctOptionId
  return {
    success,
    score: success ? 95 : 35,
    qualityBonus: success ? 8 : -3,
    techDebtDelta: success ? -4 : 4,
    summary: success
      ? 'Root cause accurately diagnosed from build log! Green build restored.'
      : 'Incorrect resolution option applied! CI pipeline required rollback.',
  }
}

/**
 * 4. Postmortem & Incident Root-Cause Mini-Game
 */
export function resolvePostmortemMiniGame(
  correctRootCause: boolean,
  actionPlanCount: number,
  rng: SeededRandom,
  isAuto = false,
): MiniGameResult {
  if (isAuto) {
    const success = rng.boolean(0.8)
    return {
      success,
      score: success ? 75 : 50,
      qualityBonus: success ? 4 : 0,
      techDebtDelta: success ? -3 : 0,
      summary: success
        ? 'Auto-generated postmortem document with 2 preventative action items.'
        : 'Postmortem deferred to next sprint retrospective.',
    }
  }

  const success = correctRootCause && actionPlanCount >= 2
  return {
    success,
    score: success ? 100 : 55,
    qualityBonus: success ? 10 : 2,
    techDebtDelta: success ? -6 : 1,
    summary: success
      ? 'Thorough postmortem completed! Systemic tech debt reduced and outage risk prevented.'
      : 'Incomplete postmortem. Surface symptoms addressed without deep preventative guardrails.',
  }
}

/**
 * 5. Investor Pitch Deck Mini-Game
 */
export function resolvePitchDeckMiniGame(
  skillLeadership: number,
  slideScore: number, // 0..100
  rng: SeededRandom,
  isAuto = false,
): { cashRaised: number; valuationMultiplier: number; summary: string } {
  if (isAuto) {
    const pitchGrade = clamp(50 + skillLeadership * 4 + rng.integer(-10, 15), 40, 95)
    const multiplier = 1.0 + (pitchGrade / 100) * 0.5
    const cash = Math.round(35000 * multiplier)
    return {
      cashRaised: cash,
      valuationMultiplier: Number(multiplier.toFixed(2)),
      summary: `Automated investor pitch completed (Grade: ${pitchGrade}%). Secured $${cash.toLocaleString()} seed capital.`,
    }
  }

  const totalScore = clamp(slideScore + skillLeadership * 2, 30, 100)
  const multiplier = 1.1 + (totalScore / 100) * 0.6
  const cash = Math.round(45000 * multiplier)

  return {
    cashRaised: cash,
    valuationMultiplier: Number(multiplier.toFixed(2)),
    summary: `Pitch deck presented with great synergy (Score: ${totalScore}%)! Closed $${cash.toLocaleString()} funding round at ${multiplier.toFixed(2)}x valuation.`,
  }
}

/**
 * 6. Break Room Ping-Pong Rhythm Mini-Game
 */
export function resolvePingPongRally(
  rallyClicks: number,
  targetClicks = 8,
): { moraleBump: number; stressRelief: number; summary: string } {
  const diff = Math.abs(rallyClicks - targetClicks)
  const perfect = diff <= 1

  return {
    moraleBump: perfect ? 25 : 12,
    stressRelief: perfect ? 30 : 15,
    summary: perfect
      ? 'Epic 12-shot ping pong rally concluded with an airborne smash! Morale surged.'
      : 'Friendly table tennis warmup match. Spirits lifted.',
  }
}

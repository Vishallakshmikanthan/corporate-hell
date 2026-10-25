/**
 * CORPORATE HELL™ — simulation formulas.
 *
 * Every number in the simulation funnels through this file so the whole
 * game is explainable from one place. All functions are pure (they mutate
 * nothing); the employee/engine modules apply the results.
 *
 * Design rules:
 *  - All metrics live inside BOUNDS (see models/types.ts).
 *  - Values are plain floats; rounding happens at display time.
 *  - Difficulty only scales pressure (attrition, event weight, cash).
 */

import type {
  CompanyState,
  Difficulty,
  Employee,
  Project,
  Skills,
} from '../models/types'
import { clamp } from '../models/types'
import { ARCHETYPES } from './archetypes'

// ---------------------------------------------------------------------------
// Difficulty tuning
// ---------------------------------------------------------------------------

export interface DifficultyTuning {
  startingCash: number
  baseRetainer: number
  attritionMultiplier: number
  eventWeight: number
  salaryMultiplier: number
}

export const DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  easy: { startingCash: 60000, baseRetainer: 5000, attritionMultiplier: 0.8, eventWeight: 0.8, salaryMultiplier: 1 },
  normal: { startingCash: 32000, baseRetainer: 3800, attritionMultiplier: 1, eventWeight: 1, salaryMultiplier: 1 },
  hard: { startingCash: 16000, baseRetainer: 3000, attritionMultiplier: 1.3, eventWeight: 1.3, salaryMultiplier: 1.1 },
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function averageSkills(skills: Skills): number {
  return (skills.focus + skills.communication + skills.technical + skills.creativity + skills.leadership) / 5
}

/** Work-relevant skill blend; communication matters less at a desk. */
export function workSkills(skills: Skills): number {
  return (skills.focus * 1.3 + skills.technical * 1.3 + skills.creativity + skills.communication * 0.6 + skills.leadership * 0.8) / 5
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/**
 * Work points produced per tick while working.
 *
 *   base        = 0.4 + skills/10            (skill band 0.5 .. 1.4)
 *   energyTerm  = 0.5 + energy/200          (0.5 .. 1.0, 1.0 at full energy)
 *   stressTerm  = 1 - stress/150            (stress 0 -> 1.0, 75+ -> <=0.5)
 *   moraleTerm  = 0.8 + morale/250          (0.8 .. 1.2)
 *   archetype   = outputMultiplier
 *   incidents   = product of open productivityPenalty values
 */
export function outputPerTick(state: CompanyState, employee: Employee): number {
  const archetype = ARCHETYPES[employee.archetype]
  const base = 0.4 + workSkills(employee.skills) / 10
  const energyTerm = 0.5 + employee.energy / 200
  const stressTerm = 1 - employee.stress / 150
  const moraleTerm = 0.8 + employee.morale / 250
  const incidentPenalty = incidentProductivityPenalty(state)
  return base * energyTerm * Math.max(0.05, stressTerm) * moraleTerm * archetype.outputMultiplier * incidentPenalty
}

/** Combined multiplier from all open incidents that carry a penalty. */
export function incidentProductivityPenalty(state: CompanyState): number {
  let penalty = 1
  for (const incident of state.incidents) {
    if (!incident.resolved && incident.productivityPenalty !== undefined) {
      penalty *= incident.productivityPenalty
    }
  }
  if (state.equipment.serverRoomHot) penalty *= 0.85
  if (state.equipment.acBroken) penalty *= 0.95
  return penalty
}

/**
 * Effective output applied to a project — some archetypes report inflated
 * numbers (KPI manipulation). Returns [realPoints, fakePoints].
 */
export function splitRealAndFakeOutput(employee: Employee, points: number): [number, number] {
  const fakeShare = ARCHETYPES[employee.archetype].fakeOutputShare * (employee.role === 'manager' ? 1.1 : 1)
  const fake = points * fakeShare
  return [points - fake, fake]
}

/** EMA smoothing for the productivity indicator shown in the UI. */
export function updateProductivityEma(employee: Employee, tickOutput: number): number {
  const target = clamp(tickOutput * 18, 0, 100) // ~5.5 pts/tick ≈ 100
  const alpha = 0.08
  return clamp(employee.productivity + (target - employee.productivity) * alpha, 0, 100)
}

// ---------------------------------------------------------------------------
// Per-tick metric updates
// ---------------------------------------------------------------------------

/**
 * Stress delta for one tick given what the employee is doing.
 * Sensitivity scales both gains and relief.
 */
export function stressDeltaForTick(employee: Employee, state: CompanyState): number {
  const sens = ARCHETYPES[employee.archetype].stressSensitivity
  let delta = 0
  switch (employee.action) {
    case 'work':
      delta = employee.workload > 1 ? 0.35 : 0.12
      break
    case 'meeting':
      delta = 0.4
      break
    case 'break':
    case 'coffee':
      delta = -0.45
      break
    case 'chat':
    case 'gossip':
      delta = -0.15
      break
    case 'personal':
    case 'wander':
      delta = -0.1
      break
    case 'escalate':
      delta = 0.2
      break
    default:
      delta = 0.05
  }
  if (state.equipment.acBroken && employee.location !== 'server_room') delta += 0.1
  if (state.equipment.serverRoomHot && employee.location === 'server_room') delta += 0.35
  if (state.policies.productivityTracking && delta > 0) delta += 0.08
  return delta * sens
}

/** Energy delta for one tick. */
export function energyDeltaForTick(employee: Employee): number {
  switch (employee.action) {
    case 'work':
    case 'meeting':
    case 'help':
      return -1.1
    case 'coffee':
      return +22
    case 'break':
      return +14
    case 'personal':
    case 'wander':
      return -0.3
    default:
      return -0.6
  }
}

/**
 * Morale drifts toward a target instead of swinging per tick:
 *
 *   target = 55
 *          + trust * 0.1              (trusted leadership lifts mood)
 *          - (stress - 40) * 0.25     (over-stress drags it down)
 *          - overworkPenalty          (workload > 1.25 for days)
 *          + policy modifiers        (casualFridays +4, fourDayWeek +5,
 *                                     meetingFreeDay +3, remoteFriendly +3,
 *                                     productivityTracking -6)
 *   speed = 0.02 per tick (a full ~14-tick workday closes ~25% of the gap)
 */
export function moraleTarget(employee: Employee, state: CompanyState): number {
  let target = 55
  target += employee.trust * 0.1
  target -= Math.max(0, employee.stress - 40) * 0.25
  const overwork = Math.max(0, employee.workload - 1.25)
  target -= overwork * 12
  if (state.policies.casualFridays) target += 4
  if (state.policies.fourDayWeek) target += 5
  if (state.policies.meetingFreeDay) target += 3
  if (state.policies.remoteFriendly) target += 3
  if (state.policies.productivityTracking) target -= 6
  // Open incidents with daily drift already apply at EOD; a bad incident
  // still stings a little while unresolved.
  for (const incident of state.incidents) {
    if (!incident.resolved && incident.dailyMoraleDrift) target += incident.dailyMoraleDrift * 0.5
  }
  // Recent bonuses (trust bump) already folded into trust. Salary-level envy:
  // interns are cheap to please, executives are never happy.
  if (employee.role === 'intern') target += 6
  if (employee.role === 'ceo') target -= 4
  return target
}

export function moraleDeltaForTick(employee: Employee, state: CompanyState): number {
  const target = moraleTarget(employee, state)
  const volatility = ARCHETYPES[employee.archetype].moraleVolatility
  const speed = 0.02 * volatility
  const gap = target - employee.morale
  return gap * speed
}

// ---------------------------------------------------------------------------
// Overnight (end-of-day) updates
// ---------------------------------------------------------------------------

/** Everyone sleeps. Mostly. */
export function overnightStress(employee: Employee): number {
  const recovery = employee.stress * 0.28 // keep 72%
  const floor = employee.archetype === 'burnout_veteran' ? 18 : 0
  return clamp(employee.stress - recovery, floor, 100)
}

export function overnightEnergy(state: CompanyState, employee: Employee): number {
  // Energy resets to 100, remote-friendly policies rest a bit better (kept
  // as small permanent buff through the day via slower drain in employee.ts).
  return state.policies.remoteFriendly ? 100 : 100
}

// ---------------------------------------------------------------------------
// Turnover
// ---------------------------------------------------------------------------

/**
 * Daily quit probability. Evaluated at end-of-day.
 *
 *   risk = clamp(((stress - 40)/60 + (55 - morale)/80
 *                 + ambition/300 + poachMod)
 *                * attritionMultiplier, 0, 1)
 *
 * A content junior (stress 20, morale 70, ambition 30) ≈ 0.
 * A burned veteran (stress 80, morale 30, ambition 70) ≈ 0.6+.
 */
export function turnoverRisk(employee: Employee, state: CompanyState): number {
  const tuning = DIFFICULTY_TUNING[state.difficulty]
  const stressTerm = (employee.stress - 40) / 60
  const moraleTerm = (55 - employee.morale) / 80
  const ambitionTerm = employee.ambition / 300
  const poachMod = state.flags.headhunterActive ? 0.25 : 0
  const layoffMod = state.flags.layoffRumorActive ? 0.2 : 0
  const raw = stressTerm + moraleTerm + ambitionTerm + poachMod + layoffMod
  return clamp(raw * tuning.attritionMultiplier, 0, 1)
}

// ---------------------------------------------------------------------------
// Company-level indicators
// ---------------------------------------------------------------------------

export function activeEmployees(state: CompanyState): Employee[] {
  return state.employeeOrder.map((id) => state.employees[id]).filter((e) => e && e.active)
}

export function averageMetric(state: CompanyState, pick: (e: Employee) => number): number {
  const list = activeEmployees(state)
  if (list.length === 0) return 0
  return list.reduce((sum, e) => sum + pick(e), 0) / list.length
}

/**
 * Company health index (0..100) shown as the "vitality" meter.
 * Weighted blend of morale, stress (inverted), productivity, cash runway
 * and reputation.
 */
export function companyHealth(state: CompanyState): number {
  const morale = averageMetric(state, (e) => e.morale)
  const stress = averageMetric(state, (e) => e.stress)
  const productivity = averageMetric(state, (e) => e.productivity)
  const runway = clamp(state.cash / Math.max(1, dailyBurnEstimate(state)) / 30, 0, 1) * 100
  return clamp(
    morale * 0.3 + (100 - stress) * 0.2 + productivity * 0.25 + runway * 0.15 + state.reputation * 0.1,
    0,
    100,
  )
}

/** Rough daily cost — used by the health meter only. */
export function dailyBurnEstimate(state: CompanyState): number {
  const tuning = DIFFICULTY_TUNING[state.difficulty]
  const salaries = activeEmployees(state).reduce(
    (sum, e) => sum + e.salary * tuning.salaryMultiplier * (state.policies.fourDayWeek ? 0.8 : 1),
    0,
  )
  const overhead = 900 + 45 * activeEmployees(state).length
  return salaries + overhead
}

/** Days until cash runs out at current burn (negative revenue ignored). */
export function cashRunwayDays(state: CompanyState): number {
  const burn = dailyBurnEstimate(state)
  const recentRevenue = state.history.slice(-3).reduce((s, l) => s + l.revenue, 0) / Math.max(1, Math.min(3, state.history.length))
  const net = recentRevenue - burn
  if (net >= 0) return Infinity
  return state.cash / -net
}

// ---------------------------------------------------------------------------
// Project scoring
// ---------------------------------------------------------------------------

/** Deadline urgency 0..1 used by the employee decision engine. */
export function deadlineUrgency(project: Project, day: number): number {
  const daysLeft = project.deadlineDay - day
  if (daysLeft <= 0) return 1
  const progress = project.pointsDone / Math.max(1, project.pointsTotal)
  return clamp(1 - daysLeft / 10 + (1 - progress) * 0.1, 0, 1)
}

/**
 * Quality contribution of one work tick (skills vs manipulation).
 * `adrenalineBonus` is a deterministic per-employee quirk passed in by
 * employee.ts (e.g. procrastinator finishing at the last minute).
 */
export function qualityContribution(employee: Employee, adrenalineBonus = 0): number {
  const skill = workSkills(employee.skills)
  const manipulator = employee.archetype === 'kpi_manipulator' ? -6 : 0
  return clamp(skill * 9 + manipulator + adrenalineBonus, 1, 100)
}

/** Update the project's rolling quality EMA with one contributor tick. */
export function updateProjectQuality(project: Project, contribution: number, weight = 1): number {
  const totalWeight = project.pointsDone + weight
  if (totalWeight <= 0) return clamp(contribution, 0, 100)
  const blended = (project.quality * project.pointsDone + contribution * weight) / totalWeight
  return clamp(blended, 0, 100)
}

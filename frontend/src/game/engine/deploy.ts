/**
 * CORPORATE HELL™ — Deployment & Release Strategy Engine.
 *
 * Implements deployment strategies (Friday Deploy, Rolling, Blue/Green, Canary, Feature Flags),
 * the post-deploy bug burst window, and rollback mechanics.
 */
import type {
  ActionResult,
  CompanyState,
  DeployStrategy,
  Ticket,
} from '../models/types'
import { BOUNDS, clamp } from '../models/types'
import { SeededRandom } from './rng'

export const STRATEGY_CONFIGS: Record<
  DeployStrategy,
  { name: string; speed: string; risk: number; cost: number; description: string }
> = {
  friday: {
    name: 'Friday 5:00 PM Big-Bang Deploy',
    speed: 'Instantaneous',
    risk: 0.38,
    cost: 0,
    description: 'Ship directly to production right before the weekend. May ruin everyone’s Saturday.',
  },
  rolling: {
    name: 'Standard Rolling Update',
    speed: 'Moderate (2 Ticks)',
    risk: 0.16,
    cost: 150,
    description: 'Sequentially replaces instances behind load balancer.',
  },
  blue_green: {
    name: 'Blue / Green Deployment',
    speed: 'Slow (3 Ticks)',
    risk: 0.06,
    cost: 500,
    description: 'Spins up identical parallel fleet. Supports instantaneous zero-downtime cutover.',
  },
  canary: {
    name: 'Canary Phased Rollout (5% → 50% → 100%)',
    speed: 'Cautious (4 Ticks)',
    risk: 0.03,
    cost: 300,
    description: 'Routes small fraction of production traffic to test error rates.',
  },
  feature_flags: {
    name: 'Dark Launch with Feature Flags',
    speed: 'Instantaneous',
    risk: 0.05,
    cost: 200,
    description: 'Safely toggled via dynamic runtime configuration. Requires high test coverage.',
  },
}

export function executeDeployment(
  state: CompanyState,
  environment: 'staging' | 'prod',
  strategy: DeployStrategy,
  rng: SeededRandom,
): ActionResult {
  const config = STRATEGY_CONFIGS[strategy]
  if (!config) return { ok: false, reason: 'Invalid deploy strategy.' }

  if (state.cash < config.cost) {
    return { ok: false, reason: `Insufficient cash for deploy strategy ($${config.cost} required).` }
  }

  if (strategy === 'feature_flags' && state.testCoverage < 50) {
    return { ok: false, reason: 'Feature flags require at least 50% test coverage for safety checks.' }
  }

  state.cash -= config.cost

  // Staging deployment
  if (environment === 'staging') {
    return {
      ok: true,
      message: `Deployed latest release to Staging via ${config.name}. Staging smoke tests green!`,
      effects: ['Staging cluster synchronized'],
    }
  }

  // Production deployment
  const qaTickets = state.tickets.filter((t) => t.state === 'qa')

  // Friday Big-Bang disaster check
  let disasterHit = false
  if (strategy === 'friday' && rng.boolean(config.risk)) {
    disasterHit = true
    state.uptime = clamp(state.uptime - 3.5, ...BOUNDS.uptime)
    state.customerSatisfaction = clamp(state.customerSatisfaction - 12, ...BOUNDS.customerSatisfaction)
    // Morale drops
    Object.values(state.employees).forEach((emp) => {
      emp.morale = clamp(emp.morale - 8, ...BOUNDS.morale)
      emp.stress = clamp(emp.stress + 10, ...BOUNDS.stress)
    })
  }

  // Bug burst calculation
  let bugsDiscovered = 0
  qaTickets.forEach((ticket) => {
    ticket.state = 'done'
    const bugRoll = rng.next()
    if (bugRoll < ticket.bugRisk) {
      bugsDiscovered += 1
      // Spawn customer-reported bug ticket
      const bugTicket: Ticket = {
        id: `bug_prod_${Math.floor(rng.next() * 100000).toString(36)}`,
        title: `Production Bug: Regression in ${ticket.title}`,
        kind: 'bug',
        complexity: 2,
        state: 'backlog',
        source: 'customer',
        bugRisk: 0.08,
        designReady: true,
        techDebtDelta: -2,
        progress: 0,
      }
      state.tickets.push(bugTicket)
    }
  })

  // Reputation & quality impact
  if (disasterHit) {
    state.reputation = clamp(state.reputation - 10, ...BOUNDS.reputation)
    return {
      ok: true,
      message: `💥 Friday deploy triggered catastrophic production regression! ${bugsDiscovered} bugs reported by furious users. Weekend on-call paged!`,
      effects: [
        'Uptime decreased -3.5%',
        'Customer Satisfaction -12%',
        'Team Stress +10%',
        `${bugsDiscovered} new customer bug tickets created`,
      ],
    }
  }

  const qualityBump = Math.min(10, qaTickets.length * 2)
  state.codeQuality = clamp(state.codeQuality + qualityBump, 0, 100)
  state.reputation = clamp(state.reputation + 4, ...BOUNDS.reputation)
  state.customerSatisfaction = clamp(state.customerSatisfaction + 3, ...BOUNDS.customerSatisfaction)

  return {
    ok: true,
    message: `🚀 Production release deployed successfully using ${config.name}! (${qaTickets.length} tickets shipped, ${bugsDiscovered} edge-case bugs caught)`,
    effects: [
      `Code Quality +${qualityBump}`,
      'Reputation +4',
      'Customer Satisfaction +3',
      `${qaTickets.length} tickets marked Done`,
    ],
  }
}

export function executeRollback(state: CompanyState): ActionResult {
  state.uptime = clamp(state.uptime + 0.5, ...BOUNDS.uptime)
  state.reputation = clamp(state.reputation - 4, ...BOUNDS.reputation)
  state.infra.outageTicksRemaining = 0

  return {
    ok: true,
    message: '⏪ Production fleet rolled back to previous stable release image. Outage mitigated.',
    effects: ['Outage terminated', 'Reputation -4', 'Production stable'],
  }
}

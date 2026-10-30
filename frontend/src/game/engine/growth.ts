/**
 * CORPORATE HELL™ — Growth Funnel, Valuation, & Company Stages Engine.
 *
 * Implements conversion funnels (impressions -> visits -> signups -> paying),
 * churn modeling, ARR/MRR revenue accumulation, and funding round valuation multiples.
 */
import type {
  ActionResult,
  CompanyStage,
  CompanyState,
  GrowthFunnel,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialGrowthFunnel(): GrowthFunnel {
  return {
    impressions: 12000,
    visits: 2400,
    signups: 320,
    activatedUsers: 180,
    payingCustomers: 45,
    churnRate: 0.035,
    mrr: 45 * 49, // $49/mo ARPU
    valuation: 3500000, // $3.5M Seed Valuation
    cac: 120,
    ltv: 850,
  }
}

/**
 * Calculates daily churn using Section 10 formula:
 * clamp(0.02 + 0.005*bugs + 0.003*outages - 0.002*(csat/50), 0.005, 0.25)
 */
export function calculateChurnRate(
  activeBugsCount: number,
  outagesCount: number,
  csat: number,
): number {
  const base = 0.02
  const bugPenalty = activeBugsCount * 0.005
  const outagePenalty = outagesCount * 0.003
  const csatBonus = (csat / 50) * 0.002
  const raw = base + bugPenalty + outagePenalty - csatBonus
  return clamp(Number(raw.toFixed(4)), 0.005, 0.25)
}

/**
 * Calculates company valuation multiple:
 * Valuation = MRR * 12 * multiple
 */
export function calculateValuation(
  mrr: number,
  stage: CompanyStage,
  churnRate: number,
): number {
  const stageMultiples: Record<CompanyStage, number> = {
    garage: 8,
    seed: 14,
    series_a: 22,
    series_b: 30,
    scale_up: 40,
    unicorn: 60,
  }

  const baseMultiple = stageMultiples[stage] || 15
  const churnPenalty = churnRate > 0.05 ? (churnRate - 0.05) * 50 : 0
  const effectiveMultiple = Math.max(5, baseMultiple - churnPenalty)

  return Math.round(mrr * 12 * effectiveMultiple)
}

/**
 * Advances growth funnel metrics every simulation day.
 */
export function advanceGrowthDaily(state: CompanyState, rng: SeededRandom): void {
  if (!state.growth) {
    state.growth = createInitialGrowthFunnel()
  }

  const g = state.growth
  const activeBugs = state.tickets.filter((t) => t.kind === 'bug' && t.state !== 'done').length
  const outages = state.infra?.outageTicksRemaining ? 1 : 0

  g.churnRate = calculateChurnRate(activeBugs, outages, state.customerSatisfaction)

  // Marketing and product hype drives top-of-funnel
  const totalFollowers = Object.values(state.socialAccounts).reduce((acc, a) => acc + a.followers, 0)
  const hypeFactor = state.product ? state.product.hype : 20
  const newImpressions = Math.round(totalFollowers * 2.5 + hypeFactor * 150 + rng.integer(500, 2000))
  g.impressions += newImpressions

  // Funnel progression
  const newVisits = Math.round(newImpressions * 0.12)
  const newSignups = Math.round(newVisits * 0.08)
  const qualityFactor = state.codeQuality / 100
  const newActivated = Math.round(newSignups * (0.45 + qualityFactor * 0.35))
  const newPaying = Math.round(newActivated * 0.18)

  // Churn deduction
  const churnedCustomers = Math.round(g.payingCustomers * g.churnRate)
  g.payingCustomers = Math.max(10, g.payingCustomers + newPaying - churnedCustomers)
  g.signups += newSignups
  g.visits += newVisits
  g.activatedUsers += newActivated

  // MRR update
  const planPrice = 49
  g.mrr = g.payingCustomers * planPrice
  g.valuation = calculateValuation(g.mrr, state.stage, g.churnRate)

  // Daily subscription revenue injected into todayRevenueExtra
  const dailySubscriptionRevenue = Math.round(g.mrr / 30)
  state.todayRevenueExtra += dailySubscriptionRevenue
}

export const STAGE_REQUIREMENTS: Record<
  CompanyStage,
  { label: string; minMrr: number; minUptime: number; minPaying: number; reward: string }
> = {
  garage: {
    label: 'Garage Startup',
    minMrr: 0,
    minUptime: 0,
    minPaying: 0,
    reward: 'Base Garage Office',
  },
  seed: {
    label: 'Seed Stage',
    minMrr: 2500,
    minUptime: 96,
    minPaying: 50,
    reward: 'Expand Office to 10 Desks + Cloud Auto-scale',
  },
  series_a: {
    label: 'Series A',
    minMrr: 15000,
    minUptime: 98,
    minPaying: 300,
    reward: 'Unlock Server Cage, GPU Farm, & SRE Dept',
  },
  series_b: {
    label: 'Series B',
    minMrr: 50000,
    minUptime: 99,
    minPaying: 1000,
    reward: 'Second Office Floor + Global Multi-Region',
  },
  scale_up: {
    label: 'Scale-Up Expansion',
    minMrr: 150000,
    minUptime: 99.5,
    minPaying: 3000,
    reward: 'M&A Acquisition Deals + Executive Perks',
  },
  unicorn: {
    label: 'Unicorn IPO Status',
    minMrr: 500000,
    minUptime: 99.9,
    minPaying: 10000,
    reward: 'Endgame Victory: Golden Office & Bell Ringing',
  },
}

/**
 * Checks if company is eligible to advance to the next company stage.
 */
export function checkStageProgression(state: CompanyState): { eligible: boolean; nextStage?: CompanyStage; message: string } {
  const STAGES: CompanyStage[] = ['garage', 'seed', 'series_a', 'series_b', 'scale_up', 'unicorn']
  const currentIndex = STAGES.indexOf(state.stage)
  if (currentIndex >= STAGES.length - 1) {
    return { eligible: false, message: 'Already reached maximum Unicorn IPO Stage!' }
  }

  const nextStage = STAGES[currentIndex + 1]
  const req = STAGE_REQUIREMENTS[nextStage]
  const g = state.growth

  if (g.mrr < req.minMrr) {
    return { eligible: false, message: `Requires $${req.minMrr.toLocaleString()} MRR (Currently: $${g.mrr.toLocaleString()}).` }
  }
  if (state.uptime < req.minUptime) {
    return { eligible: false, message: `Requires ${req.minUptime}% Uptime (Currently: ${state.uptime.toFixed(1)}%).` }
  }
  if (g.payingCustomers < req.minPaying) {
    return { eligible: false, message: `Requires ${req.minPaying} Paying Customers (Currently: ${g.payingCustomers}).` }
  }

  return { eligible: true, nextStage, message: `Eligible for upgrade to ${req.label}!` }
}

export function upgradeStage(state: CompanyState): ActionResult {
  const check = checkStageProgression(state)
  if (!check.eligible || !check.nextStage) {
    return { ok: false, reason: check.message }
  }

  state.stage = check.nextStage
  const req = STAGE_REQUIREMENTS[check.nextStage]
  state.cash += 50000 // Funding check injected into bank balance!
  state.reputation = clamp(state.reputation + 15, 0, 100)
  state.investorConfidence = clamp(state.investorConfidence + 20, 0, 100)

  return {
    ok: true,
    message: `🎉 Company successfully graduated to ${req.label}! +$50,000 funding round closed! ${req.reward}`,
    effects: [
      `Stage: ${req.label}`,
      '+$50,000 Funding Closed',
      'Reputation +15',
      'Investor Confidence +20',
    ],
  }
}

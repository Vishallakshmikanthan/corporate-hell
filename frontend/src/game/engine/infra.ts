/**
 * CORPORATE HELL™ — Parody "AWSome Cloud" Infrastructure & Outage Engine.
 *
 * Implements traffic vs capacity modeling, outage probability formulas,
 * auto-scaling logic, and cloud billing accounting.
 */
import type {
  ActionResult,
  CompanyState,
  Infra,
} from '../models/types'
import { BOUNDS, clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialInfra(): Infra {
  return {
    region: 'us',
    instances: 3,
    autoscale: true,
    dbSize: 'M',
    cdn: true,
    monitoring: true,
    backups: true,
    monthlyCost: 950,
    capacity: 1000,
    currentTraffic: 220,
    outageTicksRemaining: 0,
  }
}

/**
 * Calculates infrastructure traffic capacity (req/sec).
 */
export function calculateInfraCapacity(infra: Infra): number {
  const instanceCapacity = infra.instances * 250
  const cdnMultiplier = infra.cdn ? 1.5 : 1.0
  const dbMultiplier = infra.dbSize === 'L' ? 1.8 : infra.dbSize === 'M' ? 1.3 : 1.0
  return Math.round(instanceCapacity * cdnMultiplier * dbMultiplier)
}

/**
 * Calculates current estimated cloud bill.
 */
export function calculateMonthlyCloudCost(infra: Infra): number {
  const instanceCost = infra.instances * 120
  const autoscaleReserve = infra.autoscale ? 160 : 0
  const dbCost = infra.dbSize === 'L' ? 650 : infra.dbSize === 'M' ? 280 : 90
  const cdnCost = infra.cdn ? 120 : 0
  const monitoringCost = infra.monitoring ? 150 : 0
  const backupsCost = infra.backups ? 60 : 0

  return instanceCost + autoscaleReserve + dbCost + cdnCost + monitoringCost + backupsCost
}

/**
 * Calculates outage probability per tick using Section 10 formula:
 * max(0, (traffic - capacity) / capacity) * 0.5 + (backups ? 0 : 0.002)
 */
export function calculateOutageProbability(
  traffic: number,
  capacity: number,
  backupsEnabled: boolean,
): number {
  const overloadRatio = Math.max(0, (traffic - capacity) / capacity)
  const baseOverloadRisk = overloadRatio * 0.5
  const backupRisk = backupsEnabled ? 0 : 0.002
  const raw = baseOverloadRisk + backupRisk
  return clamp(Number(raw.toFixed(4)), 0, 0.95)
}

/**
 * Advances infrastructure state every simulation tick:
 * recalculates traffic, evaluates autoscale, rolls for outages.
 */
export function advanceInfra(state: CompanyState, rng: SeededRandom): void {
  const infra = state.infra
  infra.capacity = calculateInfraCapacity(infra)
  infra.monthlyCost = calculateMonthlyCloudCost(infra)

  // Daily cloud charge accrual (cost / 30 / TICKS_PER_DAY)
  const tickCloudCharge = Math.round(infra.monthlyCost / 30 / 36)
  state.todayCostsExtra += tickCloudCharge

  // Determine current traffic based on product hype, users, and viral activity
  const baseTraffic = 80
  const productTraffic = state.product ? state.product.hype * 8 : 40
  const userTraffic = state.growth ? Math.round(state.growth.payingCustomers * 0.4) : 20
  const randomDrift = rng.integer(-30, 40)

  infra.currentTraffic = Math.max(20, baseTraffic + productTraffic + userTraffic + randomDrift)

  // Auto-scale up if traffic nears or exceeds capacity
  if (infra.autoscale && infra.currentTraffic > infra.capacity * 0.8 && infra.instances < 16) {
    infra.instances += 1
    infra.capacity = calculateInfraCapacity(infra)
    infra.monthlyCost = calculateMonthlyCloudCost(infra)
  }

  // Handle active outage recovery
  if (infra.outageTicksRemaining > 0) {
    infra.outageTicksRemaining -= 1
    state.uptime = clamp(state.uptime - 0.1, ...BOUNDS.uptime)
    state.customerSatisfaction = clamp(state.customerSatisfaction - 0.4, ...BOUNDS.customerSatisfaction)
    return
  }

  // Roll for new outage
  const outageChance = calculateOutageProbability(
    infra.currentTraffic,
    infra.capacity,
    infra.backups,
  )

  if (outageChance > 0 && rng.boolean(outageChance)) {
    infra.outageTicksRemaining = rng.integer(2, 6)
    state.uptime = clamp(state.uptime - 1.2, ...BOUNDS.uptime)
    state.customerSatisfaction = clamp(state.customerSatisfaction - 6, ...BOUNDS.customerSatisfaction)

    // Notify event log
    state.eventLog.push({
      uid: `evt_outage_${state.nextUid++}`,
      defId: 'cloud_outage_spike',
      title: '🚨 AWSome Cloud Overload Incident',
      description: `Traffic spike (${infra.currentTraffic} req/s) overwhelmed server capacity (${infra.capacity} req/s). Service degraded.`,
      category: 'equipment',
      severity: 4,
      day: state.day,
      tick: state.tick,
      participantIds: state.onCallEmployeeId ? [state.onCallEmployeeId] : [],
      effects: ['Uptime -1.2%', 'Customer CSAT -6%'],
    })
  }
}

/**
 * Updates infra capacity configuration by player.
 */
export function scaleInfraSettings(
  state: CompanyState,
  params: {
    instancesDelta?: number
    autoscale?: boolean
    dbSize?: 'S' | 'M' | 'L'
    cdn?: boolean
    backups?: boolean
  },
): ActionResult {
  const infra = state.infra
  if (params.instancesDelta) {
    const nextInstances = clamp(infra.instances + params.instancesDelta, 1, 24)
    infra.instances = nextInstances
  }
  if (params.autoscale !== undefined) infra.autoscale = params.autoscale
  if (params.dbSize !== undefined) infra.dbSize = params.dbSize
  if (params.cdn !== undefined) infra.cdn = params.cdn
  if (params.backups !== undefined) infra.backups = params.backups

  infra.capacity = calculateInfraCapacity(infra)
  infra.monthlyCost = calculateMonthlyCloudCost(infra)

  return {
    ok: true,
    message: `Infra scaled. Capacity: ${infra.capacity} req/s | Est. Monthly Cloud: $${infra.monthlyCost}`,
    effects: [`Capacity: ${infra.capacity} req/s`, `Cloud Bill: $${infra.monthlyCost}/mo`],
  }
}

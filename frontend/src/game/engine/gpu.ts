/**
 * CORPORATE HELL™ — Parody "NVIDIOT GPUs" Market & Training Job Engine.
 *
 * Implements GPU market random walk (spot price volatility), job progression,
 * spot preemption, and model checkpointing mechanics.
 */
import type {
  ActionResult,
  CompanyState,
  GpuJob,
  GpuMarket,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialGpuMarket(): GpuMarket {
  return {
    spotPrice: 2.45,
    onDemandPrice: 6.8,
    availability: 0.85,
    history: [
      { tick: 0, spot: 2.45, onDemand: 6.8 },
    ],
  }
}

/**
 * Updates spot market price using Section 10 formula:
 * spot(t+1) = clamp(spot(t) * exp(sigma * N(0,1) + shock), 0.25 * onDemand, 0.90 * onDemand)
 */
export function stepGpuMarket(
  market: GpuMarket,
  rng: SeededRandom,
  currentTick: number,
): void {
  const onDemand = market.onDemandPrice
  const sigma = 0.04
  // Standard normal approximation via Box-Muller transform
  const u1 = Math.max(1e-6, rng.next())
  const u2 = rng.next()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)

  // 5% chance of sudden AI hype demand shock
  const shock = rng.boolean(0.05) ? rng.float(0.08, 0.25) : 0
  const drift = Math.exp(sigma * z0 + shock)
  const nextSpot = clamp(market.spotPrice * drift, 0.25 * onDemand, 0.9 * onDemand)

  market.spotPrice = Number(nextSpot.toFixed(2))
  market.availability = clamp(1 - (market.spotPrice / onDemand) * 0.7, 0.1, 0.95)

  if (market.history.length > 20) {
    market.history.shift()
  }
  market.history.push({
    tick: currentTick,
    spot: market.spotPrice,
    onDemand: market.onDemandPrice,
  })
}

/**
 * Calculates preemption chance for a spot job using Section 10 formula:
 * preemptChance = (spot ? 0.04 + marketDemand * 0.10 : 0)
 */
export function calculatePreemptionChance(
  mode: 'spot' | 'on_demand',
  marketDemand: number,
): number {
  if (mode === 'on_demand') return 0
  const raw = 0.04 + marketDemand * 0.1
  return clamp(Number(raw.toFixed(4)), 0.02, 0.35)
}

/**
 * Advances active GPU training jobs each tick.
 */
export function advanceGpuJobs(state: CompanyState, rng: SeededRandom): void {
  const market = state.gpuMarket

  // Advance jobs
  for (const job of state.gpuJobs) {
    if (job.status !== 'running') continue

    // Calculate hourly cost per tick (1 tick = 0.25 hours)
    const pricePerGpuHour = job.mode === 'spot' ? market.spotPrice : market.onDemandPrice
    const tickCost = Math.round(pricePerGpuHour * job.gpus * 0.25)
    job.costAccumulated += tickCost
    state.todayCostsExtra += tickCost

    // Check preemption for spot jobs
    if (job.mode === 'spot') {
      const demandRatio = 1 - market.availability
      const preemptChance = calculatePreemptionChance('spot', demandRatio)

      if (rng.boolean(preemptChance)) {
        job.status = 'preempted'
        if (job.checkpointing) {
          // Checkpointing saves most progress, loses only ~10%
          job.progress = Math.max(0, job.progress - 10)
        } else {
          // Without checkpointing, lost entire progress!
          job.progress = 0
        }

        state.eventLog.push({
          uid: `evt_gpu_preempt_${state.nextUid++}`,
          defId: 'gpu_node_preempted',
          title: '⚠️ Spot GPU Instance Preempted',
          description: `Cloud provider reclaimed ${job.gpus}x H100 GPU nodes for ${job.name}. ${job.checkpointing ? 'Checkpoint preserved 90% progress.' : 'No checkpointing! Progress reset to 0%.'}`,
          category: 'equipment',
          severity: 3,
          day: state.day,
          tick: state.tick,
          participantIds: [],
          effects: [job.checkpointing ? 'Progress -10%' : 'Progress Reset to 0%'],
        })
        continue
      }
    }

    // Job continues training: calculate progress increment
    const progressPerTick = (100 / (job.hoursNeeded * 4)) * Math.sqrt(job.gpus)
    job.progress = clamp(Number((job.progress + progressPerTick).toFixed(1)), 0, 100)

    if (job.progress >= 100) {
      job.status = 'completed'
      // Mark associated ticket as done
      const ticket = state.tickets.find((t) => t.id === job.ticketId)
      if (ticket) {
        ticket.state = 'done'
        ticket.progress = 100
      }
      state.codeQuality = clamp(state.codeQuality + 8, 0, 100)

      state.eventLog.push({
        uid: `evt_gpu_done_${state.nextUid++}`,
        defId: 'gpu_training_complete',
        title: '🧠 AI Model Training Finished',
        description: `Training run for "${job.name}" completed successfully! Code Quality +8%.`,
        category: 'project',
        severity: 2,
        day: state.day,
        tick: state.tick,
        participantIds: [],
        effects: ['Model Trained', 'Code Quality +8%'],
      })
    }
  }
}

export function rentGpuCluster(
  state: CompanyState,
  params: {
    ticketId: string
    gpus: number
    mode: 'spot' | 'on_demand'
    checkpointing: boolean
  },
): ActionResult {
  const ticket = state.tickets.find((t) => t.id === params.ticketId)
  if (!ticket) return { ok: false, reason: 'Ticket not found.' }

  const jobId = `job_${Math.floor(Date.now() / 1000).toString(36)}`
  const newJob: GpuJob = {
    id: jobId,
    ticketId: ticket.id,
    name: ticket.title,
    gpus: clamp(params.gpus, 1, 64),
    hoursNeeded: ticket.complexity * 2,
    progress: 0,
    mode: params.mode,
    checkpointing: params.checkpointing,
    costAccumulated: 0,
    status: 'running',
  }

  state.gpuJobs.push(newJob)
  ticket.state = 'doing'

  return {
    ok: true,
    message: `Provisioned ${params.gpus}x H100 GPUs (${params.mode.toUpperCase()}) for "${ticket.title}".`,
    effects: [`Mode: ${params.mode}`, `Checkpointing: ${params.checkpointing ? 'ON' : 'OFF'}`],
  }
}

export function cancelGpuJob(state: CompanyState, jobId: string): ActionResult {
  const job = state.gpuJobs.find((j) => j.id === jobId)
  if (!job) return { ok: false, reason: 'GPU Job not found.' }

  job.status = 'failed'
  return {
    ok: true,
    message: `Terminated GPU cluster allocation for ${job.name}. Instances decommissioned.`,
    effects: ['GPU nodes released'],
  }
}

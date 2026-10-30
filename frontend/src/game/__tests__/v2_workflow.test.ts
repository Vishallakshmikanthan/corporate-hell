/**
 * CORPORATE HELL™ — V2 "Ship It" Workflow & Formulas Test Suite.
 */
import { describe, it, expect } from 'vitest'
import {
  calculateTicketBugRisk,
  calculateEmployeeCapacity,
  createInitialTickets,
  createInitialSprint,
} from '../engine/tickets'
import {
  createInitialRepo,
  createBranch,
  addCommit,
  mergePullRequest,
  generateReviewerFeedback,
} from '../engine/repo'
import {
  calculateStageFailureChance,
  createInitialPipeline,
  applyPipelineFix,
} from '../engine/pipeline'
import { calculateOutageProbability } from '../engine/infra'
import {
  createInitialGpuMarket,
  stepGpuMarket,
  calculatePreemptionChance,
} from '../engine/gpu'
import { calculateSocialReach } from '../engine/social'
import { calculateChurnRate, calculateValuation } from '../engine/growth'
import { migrateSave } from '../persistence/storage'
import { SeededRandom } from '../engine/rng'
import { SimulationEngine } from '../engine/engine'
import type { CompanyState, Employee, SaveData } from '../models/types'

describe('V2 Mathematical Formulas', () => {
  it('calculates employee capacity with energy, stress, and tech debt factors', () => {
    const emp = {
      skills: { technical: 8 },
      energy: 100,
      stress: 0,
    } as unknown as Employee

    const capZeroDebt = calculateEmployeeCapacity(emp, 0)
    expect(capZeroDebt).toBe(8)

    // Higher stress reduces capacity
    const empStressed = {
      skills: { technical: 8 },
      energy: 100,
      stress: 100, // (1 - 100/200) = 0.5
    } as unknown as Employee
    const capStressed = calculateEmployeeCapacity(empStressed, 0)
    expect(capStressed).toBe(4)

    // High tech debt reduces capacity
    const capDebt = calculateEmployeeCapacity(emp, 100)
    expect(capDebt).toBeLessThan(capZeroDebt)
  })

  it('calculates bug risk bounded between 0.01 and 0.95', () => {
    const riskStandard = calculateTicketBugRisk(3, 70, 20, false, true)
    expect(riskStandard).toBeGreaterThanOrEqual(0.01)
    expect(riskStandard).toBeLessThanOrEqual(0.95)

    const riskRushed = calculateTicketBugRisk(8, 0, 90, true, false)
    expect(riskRushed).toBeGreaterThan(riskStandard)
  })

  it('calculates CI/CD stage failure probability clamped between 0.02 and 0.60', () => {
    const failRate = calculateStageFailureChance('lint', 20, 60, 75)
    expect(failRate).toBeGreaterThanOrEqual(0.02)
    expect(failRate).toBeLessThanOrEqual(0.6)

    const highDebtRate = calculateStageFailureChance('lint', 100, 0, 20)
    expect(highDebtRate).toBeGreaterThan(failRate)
    expect(highDebtRate).toBeLessThanOrEqual(0.6)
  })

  it('calculates cloud outage probability accurately', () => {
    // Within capacity: overload component is 0
    const normalOutage = calculateOutageProbability(300, 1000, true)
    expect(normalOutage).toBe(0)

    // Over capacity: positive outage chance
    const overOutage = calculateOutageProbability(1500, 1000, true)
    expect(overOutage).toBeGreaterThan(0)

    // Backups disabled adds slight background risk
    const noBackupOutage = calculateOutageProbability(300, 1000, false)
    expect(noBackupOutage).toBe(0.002)
  })

  it('calculates social reach deterministically with viral multipliers', () => {
    const rng = new SeededRandom(42)
    const res = calculateSocialReach(2000, 0.05, 80, 50, 10, rng)
    expect(res.reach).toBeGreaterThan(100)
    expect(res.newFollowers).toBeGreaterThan(0)
  })

  it('calculates churn rate and valuation multiples', () => {
    const churn = calculateChurnRate(2, 0, 80)
    expect(churn).toBeGreaterThanOrEqual(0.005)
    expect(churn).toBeLessThanOrEqual(0.25)

    const valSeed = calculateValuation(10000, 'seed', 0.03)
    const valSeriesA = calculateValuation(10000, 'series_a', 0.03)
    expect(valSeriesA).toBeGreaterThan(valSeed)
  })
})

describe('V2 Software Engineering Workflow', () => {
  it('manages Git branches, commits, PRs, and merges cleanly', () => {
    const repo = createInitialRepo()
    const ticket = createInitialTickets()[0]

    // Create branch
    const branch = createBranch(repo, ticket, 'DevAlex')
    expect(branch.name).toContain('feature')

    // Commit work
    const commitRes = addCommit(repo, branch.name, 'feat: initial auth commit')
    expect(commitRes.ok).toBe(true)
    expect(commitRes.commits).toBe(1)

    // Test engine action integration
    const engine = new SimulationEngine({
      seed: 1234,
      mode: 'sandbox',
      companyName: 'Test SaaS',
      industry: 'Software',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    const pickRes = engine.dispatchAction({
      type: 'pick_ticket',
      ticketId: state.tickets[0].id,
    })
    expect(pickRes.ok).toBe(true)
    expect(state.tickets[0].state).toBe('doing')

    const branchRes = engine.dispatchAction({
      type: 'create_branch',
      ticketId: state.tickets[0].id,
    })
    expect(branchRes.ok).toBe(true)

    const prRes = engine.dispatchAction({
      type: 'open_pr',
      branchName: state.repo.branches[state.repo.branches.length - 1].name,
    })
    expect(prRes.ok).toBe(true)
    expect(state.prs.length).toBeGreaterThan(0)
  })

  it('steps GPU spot market with bounded random walk', () => {
    const rng = new SeededRandom(777)
    const market = createInitialGpuMarket()
    const initialSpot = market.spotPrice

    for (let t = 0; t < 10; t++) {
      stepGpuMarket(market, rng, t)
      expect(market.spotPrice).toBeGreaterThanOrEqual(0.25 * market.onDemandPrice)
      expect(market.spotPrice).toBeLessThanOrEqual(0.9 * market.onDemandPrice)
    }
  })

  it('migrates legacy save files to v2 structure seamlessly', () => {
    const legacySave: SaveData = {
      version: 1,
      savedAt: '2026-10-24T00:00:00Z',
      game: {
        id: 'legacy_comp',
        name: 'Old Co',
        industry: 'Tech',
        mode: 'sandbox',
        difficulty: 'normal',
        scenarioId: 'standard',
        seed: 100,
        rngState: 100,
        day: 2,
        tick: 10,
        cash: 25000,
        reputation: 60,
        customerSatisfaction: 60,
        investorConfidence: 60,
        executiveConfidence: 60,
        baseRetainer: 2000,
        product: null,
        employees: {},
        employeeOrder: [],
        projects: [],
        meetings: [],
        incidents: [],
        emails: [],
        eventLog: [],
        decisions: [],
        policies: {} as any,
        eventCooldowns: {},
        eventQueue: [],
        kpiInflation: 0,
        auditRisk: 0,
        equipment: {} as any,
        history: [],
        todayRevenueExtra: 0,
        todayCostsExtra: 0,
        campaign: null,
        flags: {},
        nextUid: 1,
      } as unknown as CompanyState,
    }

    const migrated = migrateSave(legacySave)
    expect(migrated.stateVersion).toBe(2)
    expect(migrated.playerRole).toBe('developer')
    expect(migrated.stage).toBe('seed')
    expect(migrated.tickets.length).toBeGreaterThan(0)
    expect(migrated.repo).toBeDefined()
    expect(migrated.pipeline).toBeDefined()
    expect(migrated.infra).toBeDefined()
    expect(migrated.gpuMarket).toBeDefined()
    expect(migrated.socialAccounts).toBeDefined()
    expect(migrated.growth).toBeDefined()
  })
})

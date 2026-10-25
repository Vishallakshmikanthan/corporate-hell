/**
 * CORPORATE HELL™ — Central Simulation Engine.
 *
 * Dedicated, render-independent game engine with fixed tick execution,
 * deterministic PRNG state, employee agents, project progression,
 * financial accounting, meetings, events, and campaign evaluation.
 */
import type {
  ActionResult,
  CompanyState,
  DayLedger,
  Difficulty,
  EngineConfig,
  EngineEvents,
  GameMode,
  PlayerAction,
  Project,
} from '../models/types'
import { BOUNDS, clamp, TICKS_PER_DAY } from '../models/types'
import { DIFFICULTY_TUNING } from './formulas'
import { SeededRandom } from './rng'
import { STARTING_ROSTER } from '../scenarios/roster'
import { SCENARIOS } from '../scenarios/presets'
import { updateEmployee } from './employee'
import { updateMeetings } from './meetings'
import { executeEvent, selectEligibleEvent } from './events'
import { applyAction, validateAction } from '../rules/actions'
import { createInitialCampaign, evaluateCampaignDaily } from './campaign'
import { deskSeat } from './office'

export class SimulationEngine {
  private state: CompanyState
  private rng: SeededRandom
  private events: EngineEvents

  constructor(config: EngineConfig, events: EngineEvents = {}) {
    this.events = events
    this.rng = new SeededRandom(config.seed)
    this.state = this.createInitialState(config)

    // Apply scenario modifications if requested
    const scenario = SCENARIOS[config.scenarioId]
    if (scenario) {
      scenario.apply(this.state)
    }
  }

  public getState(): CompanyState {
    return this.state
  }

  public getRng(): SeededRandom {
    return this.rng
  }

  public dispatchAction(action: PlayerAction): ActionResult {
    const result = applyAction(this.state, action, this.rng)
    if (this.events.onTick) {
      this.events.onTick(this.state)
    }
    return result
  }

  public validate(action: PlayerAction): ActionResult {
    return validateAction(this.state, action)
  }

  /**
   * Main simulation tick. Advances in-game time by 1 tick (15 minutes).
   */
  public tick(): void {
    // If a campaign terminal ending has been reached, stop ticking
    if (this.state.campaign?.ending) {
      return
    }

    // 1. Advance in-game tick
    this.state.tick += 1

    // 2. Resolve meeting lifecycle
    updateMeetings(this.state)

    // 3. Update active projects (buff decay & deadline penalties)
    for (const project of this.state.projects) {
      if (project.alignmentBuffTicksLeft > 0) {
        project.alignmentBuffTicksLeft -= 1
      }
      if (
        project.status === 'active' &&
        this.state.day > project.deadlineDay &&
        this.state.tick === 1
      ) {
        // Project failed deadline
        project.status = 'failed'
        this.state.cash -= project.penaltyOnFail
        this.state.customerSatisfaction = clamp(
          this.state.customerSatisfaction - 10,
          ...BOUNDS.customerSatisfaction,
        )
        this.state.investorConfidence = clamp(
          this.state.investorConfidence - 8,
          ...BOUNDS.investorConfidence,
        )
      }
    }

    // 4. Update each active employee
    for (const empId of this.state.employeeOrder) {
      const emp = this.state.employees[empId]
      if (emp && emp.active) {
        updateEmployee(this.state, emp, this.rng)
      }
    }

    // Sync PRNG state to company state for serialization
    this.state.rngState = this.rng.getState()

    // 5. Evaluate eligible random events
    // Events check at specific ticks: 8 (morning crisis) and 22 (afternoon drama)
    // or when forced events are queued
    if (
      this.state.eventQueue.length > 0 ||
      this.state.tick === 8 ||
      this.state.tick === 22
    ) {
      const tuning = DIFFICULTY_TUNING[this.state.difficulty]
      if (this.state.eventQueue.length > 0 || this.rng.chance(0.65 * tuning.eventWeight)) {
        const eventDef = selectEligibleEvent(this.state, this.rng)
        if (eventDef) {
          const record = executeEvent(this.state, eventDef, this.rng)
          if (this.events.onEvent) {
            this.events.onEvent(record, this.state)
          }
        }
      }
    }

    // 6. Check for End of Day
    if (this.state.tick >= TICKS_PER_DAY) {
      this.endOfDay()
    }

    // 7. Emit state snapshot
    if (this.events.onTick) {
      this.events.onTick(this.state)
    }
  }

  /**
   * Finalizes the current fiscal day: salaries, revenue, accounting ledger,
   * campaign objective evaluations, skill training increments, and resets.
   */
  public endOfDay(): void {
    const day = this.state.day
    const tuning = DIFFICULTY_TUNING[this.state.difficulty]

    // 1. Calculate Costs
    const activeEmployees = Object.values(this.state.employees).filter((e) => e.active)
    let salaryCost = 0
    for (const emp of activeEmployees) {
      salaryCost += Math.round(emp.salary * tuning.salaryMultiplier)
    }
    const overheadCost = 800 + activeEmployees.length * 50
    const totalCosts = salaryCost + overheadCost + this.state.todayCostsExtra

    // 2. Calculate Revenue
    let retainerRev = tuning.baseRetainer
    let productRev = 0
    if (this.state.product) {
      // Product generates recurring daily cash flow based on quality and hype
      productRev = Math.round(
        (this.state.product.quality * 20 + this.state.product.hype * 15) *
          (this.state.customerSatisfaction / 100),
      )
      this.state.product.revenueToDate += productRev
      // Hype gently decays unless sustained
      this.state.product.hype = Math.max(10, this.state.product.hype - 2)
    }
    const projectRev = this.state.todayRevenueExtra
    const totalRevenue = retainerRev + productRev + projectRev

    // 3. Update Cash
    const net = totalRevenue - totalCosts
    this.state.cash += net

    // 4. Calculate Averages
    const moraleAvg =
      activeEmployees.length > 0
        ? activeEmployees.reduce((acc, e) => acc + e.morale, 0) / activeEmployees.length
        : 0
    const stressAvg =
      activeEmployees.length > 0
        ? activeEmployees.reduce((acc, e) => acc + e.stress, 0) / activeEmployees.length
        : 0
    const prodAvg =
      activeEmployees.length > 0
        ? activeEmployees.reduce((acc, e) => acc + e.productivity, 0) / activeEmployees.length
        : 0

    // 5. Record Day Ledger
    const ledger: DayLedger = {
      day,
      revenue: totalRevenue,
      costs: totalCosts,
      net,
      cashAfter: this.state.cash,
      moraleAvg: Math.round(moraleAvg),
      stressAvg: Math.round(stressAvg),
      productivity: Math.round(prodAvg),
      headcount: activeEmployees.length,
      events: this.state.eventLog.filter((e) => e.day === day).length,
      revenueBreakdown: { retainer: retainerRev, product: productRev, projects: projectRev },
      costBreakdown: {
        salaries: salaryCost,
        overhead: overheadCost,
        other: this.state.todayCostsExtra,
      },
    }
    this.state.history.push(ledger)

    // 6. End-of-Day Employee Upkeep
    for (const emp of activeEmployees) {
      // Training advancement
      if (emp.trainingDaysLeft > 0) {
        emp.trainingDaysLeft -= 1
        emp.skills.technical = clamp(emp.skills.technical + 1, 1, 10)
        emp.skills.focus = clamp(emp.skills.focus + 1, 1, 10)
      }
      // Reset daily trackers
      emp.coffeesToday = 0
      emp.meetingsAttendedToday = 0
      emp.energy = clamp(emp.energy + 40, ...BOUNDS.energy) // overnight rest
    }

    // 7. Auto-healing / expiry for old incidents
    for (const inc of this.state.incidents) {
      if (!inc.resolved && inc.expiresDay && this.state.day >= inc.expiresDay) {
        inc.resolved = true
        inc.dayResolved = this.state.day
      }
    }

    // 8. Campaign Objective & Ending Evaluation
    if (this.state.mode === 'campaign') {
      const ending = evaluateCampaignDaily(this.state)
      if (ending && this.events.onEnding) {
        this.events.onEnding(ending, this.state)
      }
    }

    // 9. Advance Day and Reset Tick
    this.state.day += 1
    this.state.tick = 0
    this.state.todayRevenueExtra = 0
    this.state.todayCostsExtra = 0

    if (this.events.onDayEnd) {
      this.events.onDayEnd(this.state)
    }
  }

  private createInitialState(config: EngineConfig): CompanyState {
    const tuning = DIFFICULTY_TUNING[config.difficulty]

    // Populate employees from STARTING_ROSTER
    const employees: Record<string, typeof STARTING_ROSTER[0] & { [k: string]: any }> = {}
    const employeeOrder: string[] = []

    STARTING_ROSTER.forEach((entry, idx) => {
      const seat = deskSeat(idx)
      employeeOrder.push(entry.id)
      employees[entry.id] = {
        ...entry,
        active: true,
        salary: Math.round(
          (entry.role === 'manager'
            ? 480
            : entry.role === 'senior'
              ? 380
              : entry.role === 'specialist'
                ? 260
                : entry.role === 'junior'
                  ? 200
                  : 110) * tuning.salaryMultiplier,
        ),
        hiredDay: 1,
        productivity: 65,
        energy: 85,
        action: 'work',
        actionTicksLeft: 8 + (idx % 4),
        actionStartedTick: 0,
        nextDecisionTick: 8 + (idx % 4),
        location: 'open_plan',
        position: { ...seat },
        facing: 0,
        pathIndex: 0,
        homeDesk: idx,
        relationships: {},
        memories: [{ day: 1, text: 'Joined the corporate mission with high synergy expectations.' }],
        goals: [
          {
            id: `goal_${entry.id}_1`,
            description: 'Survive first quarter without an HR investigation',
            type: 'survival',
            target: 20,
            progress: 0,
            achieved: false,
          },
        ],
        workload: 1,
        meetingsAttendedToday: 0,
        coffeesToday: 0,
        thoughtTicksLeft: 0,
        trainingDaysLeft: 0,
      }
    })

    // Initial Projects
    const projects: Project[] = [
      {
        id: 'proj_chimera',
        name: 'Project Chimera',
        department: 'engineering',
        clientName: 'OmniCorp Solutions',
        pointsDone: 20,
        pointsTotal: 120,
        quality: 75,
        deadlineDay: 8,
        revenueOnDone: 14000,
        penaltyOnFail: 5000,
        status: 'active',
        alignmentBuffTicksLeft: 0,
      },
      {
        id: 'proj_sales_q1',
        name: 'Enterprise Outbound Surge',
        department: 'sales',
        clientName: 'Global Logistics Partners',
        pointsDone: 10,
        pointsTotal: 60,
        quality: 68,
        deadlineDay: 5,
        revenueOnDone: 7500,
        penaltyOnFail: 2000,
        status: 'active',
        alignmentBuffTicksLeft: 0,
      },
      {
        id: 'proj_rebrand',
        name: 'Synergy Rebranding Campaign',
        department: 'marketing',
        clientName: 'Internal Leadership',
        pointsDone: 15,
        pointsTotal: 50,
        quality: 80,
        deadlineDay: 6,
        revenueOnDone: 5000,
        penaltyOnFail: 1000,
        status: 'active',
        alignmentBuffTicksLeft: 0,
      },
    ]

    return {
      stateVersion: 1,
      id: `company_${Date.now()}`,
      name: config.companyName || 'Corporate Hell Inc.',
      industry: config.industry || 'Enterprise SaaS',
      mode: config.mode,
      difficulty: config.difficulty,
      scenarioId: config.scenarioId,
      scenarioLabel: SCENARIOS[config.scenarioId]?.name || 'Standard Sandbox',
      seed: config.seed,
      rngState: this.rng.getState(),
      day: 1,
      tick: 0,
      cash: tuning.startingCash,
      reputation: 65,
      customerSatisfaction: 70,
      investorConfidence: 65,
      executiveConfidence: 75,
      baseRetainer: tuning.baseRetainer,
      product: null,
      employees: employees as any,
      employeeOrder,
      projects,
      meetings: [
        {
          id: 'mtg_morning_sync',
          title: 'Daily Alignment Standup',
          roomId: 'conference',
          startTick: 4,
          durationTicks: 4,
          attendeeIds: ['emp_deborah', 'emp_chad', 'emp_gary'],
          recurring: 'daily',
          topic: 'Reviewing yesterday’s alignment on alignment',
          createdBy: 'Deborah Overbyte',
          timesHeld: 0,
          active: false,
        },
      ],
      incidents: [],
      emails: [
        {
          id: 'email_welcome',
          uid: '1',
          from: 'board@corporate.local',
          fromName: 'The Board of Directors',
          subject: 'Welcome to Leadership, CEO',
          body: 'We expect synergy, ruthless cost discipline, and quarterly growth. Remember: Sanity is strictly optional.',
          day: 1,
          kind: 'info',
          choices: [],
          read: false,
          participantIds: [],
        },
      ],
      eventLog: [],
      decisions: [],
      policies: {
        fourDayWeek: false,
        meetingFreeDay: false,
        hiringFrozen: false,
        productivityTracking: false,
        casualFridays: true,
        remoteFriendly: false,
      },
      eventCooldowns: {},
      eventQueue: [],
      kpiInflation: 5,
      auditRisk: 5,
      equipment: {
        coffeeMachineBroken: false,
        printerJammed: false,
        acBroken: false,
        serverRoomHot: false,
      },
      history: [],
      todayRevenueExtra: 0,
      todayCostsExtra: 0,
      campaign: config.mode === 'campaign' ? createInitialCampaign() : null,
      flags: {},
      nextUid: 100,
    }
  }
}

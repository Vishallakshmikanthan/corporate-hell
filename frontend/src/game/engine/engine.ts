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
import { createInitialTickets, createInitialSprint, checkSprintAdvancement } from './tickets'
import { createInitialRepo, createInitialPRs } from './repo'
import { createInitialPipeline, advancePipeline } from './pipeline'
import { createInitialInfra, advanceInfra } from './infra'
import { createInitialGpuMarket, stepGpuMarket, advanceGpuJobs } from './gpu'
import { createInitialSuggestions } from './suggestions'
import { createInitialSocialAccounts, createInitialSocialPosts } from './social'
import { createInitialGrowthFunnel, advanceGrowthDaily } from './growth'
import { createInitialAvatar } from './avatar'
import { executeNpcRoleSupport } from './roles'
import { createInitialCareerState, evaluateChapterProgress } from './career'

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

    // --- V2 Tick Enhancements: Tickets, Pipeline, Infra, GPU, and NPC Role Support ---
    checkSprintAdvancement(this.state, this.rng)
    executeNpcRoleSupport(this.state, this.rng)
    advancePipeline(this.state, this.rng)
    stepGpuMarket(this.state.gpuMarket, this.rng, this.state.tick)
    advanceGpuJobs(this.state, this.rng)
    advanceInfra(this.state, this.rng)
    evaluateChapterProgress(this.state)

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

    // --- V2 Growth & Avatar Daily Upkeep ---
    advanceGrowthDaily(this.state, this.rng)
    if (this.state.playerAvatar) {
      this.state.playerAvatar.energy = clamp(this.state.playerAvatar.energy + 40, ...BOUNDS.energy)
      this.state.playerAvatar.coffeesToday = 0
    }

    // 8. Campaign Objective & Ending Evaluation
    if (this.state.campaign) {
      const ending = evaluateCampaignDaily(this.state)
      if (this.state.mode === 'campaign' && ending && this.events.onEnding) {
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

    const playerRole = config.playerRole || 'developer'
    const playerAvatar = createInitialAvatar(playerRole, config.playerName || 'Alex Vance')
    if (config.avatarVisual) {
      playerAvatar.visual = config.avatarVisual
    }

    return {
      stateVersion: 2,
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
          kind: 'standup',
          attendeeStances: { emp_deborah: 'supports', emp_chad: 'supports', emp_gary: 'neutral' },
        },
      ],
      incidents: [
        {
          id: 'inc_coffee_uprising',
          title: 'The Coffee Machine Uprising',
          description:
            'The artisan espresso machine in the break lounge is displaying "ERROR 666: FEED ME ARTISAN BEANS". Engineering productivity is dropping by 15% and employees are threatening a walkout.',
          category: 'equipment',
          severity: 4,
          roomId: 'break_room',
          affectedDepartment: 'engineering',
          dayOpened: 1,
          dailyMoraleDrift: -4,
          productivityPenalty: 0.85,
          resolved: false,
          investigationSummary:
            'Telemetry log shows the grinder motor seized after someone poured dark-roast syrupy beans into the water reservoir during last night’s crunch session. Without caffeine, senior engineers are refusing to review pull requests.',
          responses: [
            {
              id: 'resp_coffee_upgrade',
              label: 'Upgrade to Commercial Italian Espresso Rig',
              description: 'Install a dual-boiler Italian espresso system with oat milk draft.',
              cost: 2800,
              effects: {
                resolve: true,
                moraleDeltaAll: 15,
                stressDeltaAll: -10,
                fixEquipment: 'coffeeMachineBroken',
                narrative: 'Installed a gleaming dual-boiler Italian espresso rig. Team morale surged.',
              },
            },
            {
              id: 'resp_coffee_repair',
              label: 'Call Certified Technician (Quick Repair)',
              description: 'Dispatch emergency technician to replace the boiler gasket and descale.',
              cost: 900,
              effects: {
                resolve: true,
                moraleDeltaAll: 6,
                stressDeltaAll: -4,
                fixEquipment: 'coffeeMachineBroken',
                narrative: 'Emergency technician repaired the espresso machine before noon.',
              },
            },
            {
              id: 'resp_coffee_instant',
              label: 'Switch to Bulk Instant Coffee Packets',
              description: 'Put a tin of freeze-dried instant powder on the counter. Save treasury cash.',
              cost: 80,
              effects: {
                resolve: true,
                moraleDeltaAll: -10,
                stressDeltaAll: 8,
                fixEquipment: 'coffeeMachineBroken',
                narrative: 'Replaced espresso with bulk instant coffee. Silent geniuses are visibly weeping.',
              },
            },
            {
              id: 'resp_coffee_ignore',
              label: 'Let Them Handle It ("Character Building")',
              description: 'Issue a memo on the health benefits of hydration and decaf living.',
              cost: 0,
              effects: {
                resolve: true,
                moraleDeltaAll: -18,
                stressDeltaAll: 14,
                reputationDelta: -4,
                narrative: 'Leadership told the company to drink tap water. Morale plummeted.',
              },
            },
          ],
        },
        {
          id: 'inc_gpu_bill',
          title: 'Uncapped GPU Cluster Anomaly',
          description:
            'An unmonitored 8x H100 training run was left spinning over the weekend on On-Demand pricing. Cloud billing alerts are flashing crimson.',
          category: 'tech',
          severity: 3,
          roomId: 'server_room',
          affectedDepartment: 'engineering',
          dayOpened: 1,
          dailyMoraleDrift: -2,
          productivityPenalty: 0.92,
          resolved: false,
          investigationSummary:
            'Root cause traced to an un-checkpointed fine-tuning script triggered by the AI Evangelist archetype. Killing it loses 18 hours of weights; migrating to Spot saves 65% cost.',
          responses: [
            {
              id: 'resp_gpu_migrate',
              label: 'Checkpoint & Migrate to Spot Cluster',
              description: 'Snapshot model weights immediately and move workload to Spot instances.',
              cost: 1200,
              effects: {
                resolve: true,
                moraleDeltaAll: 5,
                investorConfidenceDelta: 6,
                narrative: 'Weights checkpointed and migrated to Spot pricing with zero data loss.',
              },
            },
            {
              id: 'resp_gpu_absorb',
              label: 'Absorb On-Demand Bill & Finish Run',
              description: 'Pay the premium cloud invoice so the model launches on schedule.',
              cost: 3400,
              effects: {
                resolve: true,
                moraleDeltaAll: 8,
                reputationDelta: 5,
                narrative: 'Paid full cloud invoice to complete the flagship AI training run.',
              },
            },
            {
              id: 'resp_gpu_kill',
              label: 'Hard-Kill Cluster Processes Immediately',
              description: 'Terminate all GPU nodes immediately to stop the bleeding.',
              cost: 0,
              effects: {
                resolve: true,
                moraleDeltaAll: -12,
                stressDeltaAll: 10,
                narrative: 'Terminated GPU instances mid-epoch. Engineering is furious over lost weights.',
              },
            },
            {
              id: 'resp_gpu_credits',
              label: 'Negotiate Cloud Provider Startup Credits',
              description: 'Have the CEO lobby AWSome account reps for emergency startup credits.',
              cost: 400,
              effects: {
                resolve: true,
                investorConfidenceDelta: 4,
                moraleDeltaAll: 3,
                narrative: 'Secured a partial cloud credit waiver after an intense call with account reps.',
              },
            },
          ],
        },
        {
          id: 'inc_printer_rebellion',
          title: 'Enterprise Printer Rebellion',
          description:
            'The floor-standing LaserJet isjammed with a 200-page pitch deck and emitting ominous ozone smoke near Sales.',
          category: 'equipment',
          severity: 2,
          roomId: 'open_plan',
          affectedDepartment: 'sales',
          dayOpened: 1,
          dailyMoraleDrift: -2,
          productivityPenalty: 0.95,
          resolved: false,
          investigationSummary:
            'Sales attempted to print 40 glossy bound prospectuses on heavy cardstock. Fuser assembly is overheated.',
          responses: [
            {
              id: 'resp_printer_pro',
              label: 'Replace Fuser & Go Paperless',
              description: 'Service the unit and transition Sales to digital tablet pitch decks.',
              cost: 650,
              effects: {
                resolve: true,
                moraleDeltaAll: 6,
                fixEquipment: 'printerJammed',
                narrative: 'Repaired printer and equipped Sales with digital pitch tablets.',
              },
            },
            {
              id: 'resp_printer_intern',
              label: 'Assign Intern with Tweezers',
              description: 'Send the intern in with a flashlight and long tweezers.',
              cost: 0,
              effects: {
                resolve: true,
                moraleDeltaAll: -3,
                stressDeltaAll: 5,
                fixEquipment: 'printerJammed',
                narrative: 'The intern extracted 47 crumpled pages covered in toner dust.',
              },
            },
          ],
        },
      ],
      emails: [
        {
          id: 'email_horizon_vc',
          uid: '1',
          from: 'partners@horizoncapital.com',
          fromName: 'Horizon Capital',
          senderRole: 'Lead Venture Partner — Series A',
          senderRelation: 'Warm (72% Confidence)',
          category: 'investors',
          important: true,
          timestamp: '10:15 AM',
          subject: 'Follow-up: Series A Funding & Boardroom Pitch',
          body: `Hi CEO,\n\nThank you for the productive initial discussion. Our partnership committee was impressed with your vision and early traction, especially your AI-driven approach to enterprise automation.\n\nBefore we issue a formal Series A term sheet, we need clarity on three fronts:\n• Unit economics and path to sustainable profitability\n• Engineering team scalability and key hiring plans\n• Competitive differentiation against legacy incumbents\n\nPlease review the attached deck and financial model, or step into the Investor Pitch Boardroom when ready.\n\nLooking forward to your response.\n— James Carter, Managing Partner, Horizon Capital`,
          day: 1,
          kind: 'decision',
          read: false,
          participantIds: [],
          keyTopics: ['Series A Valuation ($12M–$18M)', 'Burn Rate & Runway', 'Engineering Velocity'],
          attachments: [
            {
              name: 'Pitch_Deck.pdf',
              type: 'pdf',
              summary: '14-slide Series A presentation covering Problem, AI Architecture, $480K ARR run-rate, and $2.5M ask.',
            },
            {
              name: 'Financials.xlsx',
              type: 'xlsx',
              summary: '24-month operating model showing path to break-even at 18 months with 74% gross margin.',
            },
          ],
          choices: [
            {
              id: 'choice_horizon_schedule',
              label: 'Confirm Boardroom Pitch & Share Unit Economics',
              description: 'Send verified cohort retention data and lock in the partner pitch (+8 Investor Confidence).',
              effects: {
                investorConfidenceDelta: 8,
                reputationDelta: 4,
              },
            },
            {
              id: 'choice_horizon_negotiate',
              label: 'Push for Higher Pre-Money Valuation ($18M Cap)',
              description: 'Signal competing VC interest to anchor higher valuation terms (+5 Confidence, +4 Stress).',
              effects: {
                investorConfidenceDelta: 5,
                executiveConfidenceDelta: 6,
                stressDeltaAll: 4,
              },
            },
            {
              id: 'choice_horizon_delay',
              label: 'Request 2 Weeks to Boost Revenue Metrics First',
              description: 'Buy time to ship Project Chimera before opening the data room (-3 Investor Confidence).',
              effects: {
                investorConfidenceDelta: -3,
                projectPointsDelta: 10,
              },
            },
          ],
        },
        {
          id: 'email_priya_bug',
          uid: '2',
          from: 'priya.nair@company.io',
          fromName: 'Priya Nair',
          senderRole: 'Staff DevOps & SRE Architect',
          senderRelation: 'Trusted Technical Lead (84% Trust)',
          category: 'employees',
          important: true,
          timestamp: '09:48 AM',
          subject: 'URGENT: Production Latency Spike & Tech Debt',
          body: `CEO,\n\nWe are seeing p99 latency spikes on the primary API cluster during peak enterprise traffic. If we don't allocate either an extra sprint buffer for refactoring or upgrade our database read-replicas, we risk an SLA breach on Project Chimera.\n\nHow do you want Engineering to prioritize this today?\n\n— Priya`,
          day: 1,
          kind: 'decision',
          read: false,
          participantIds: ['emp_priya'],
          keyTopics: ['API Cluster Reliability', 'Tech Debt Reduction', 'Project Chimera SLA'],
          attachments: [
            {
              name: 'Latency_Trace_Report.pdf',
              type: 'pdf',
              summary: 'Grafana p99 telemetry showing DB connection pool saturation above 1,400 req/s.',
            },
          ],
          choices: [
            {
              id: 'choice_priya_infra',
              label: 'Approve $1,500 Read-Replica Upgrade & Refactor Window',
              description: 'Spend $1,500 to provision replicas and let Priya clean up the bottleneck (+10 Morale, +Customer Sat).',
              effects: {
                cashDelta: -1500,
                moraleDeltaAll: 8,
                customerSatisfactionDelta: 8,
              },
            },
            {
              id: 'choice_priya_push',
              label: 'Keep Shipping Features — Patch Only Critical Alerts',
              description: 'Prioritize Project Chimera feature velocity over tech debt cleanup (+12 Project Pts, +8 Stress).',
              effects: {
                projectPointsDelta: 12,
                stressDeltaAll: 8,
                moraleDeltaAll: -5,
              },
            },
          ],
        },
        {
          id: 'email_chad_acme',
          uid: '3',
          from: 'chad.sterling@company.io',
          fromName: 'Chad Sterling',
          senderRole: 'VP of Enterprise Sales',
          senderRelation: 'Ambitious Closer (76% Morale)',
          category: 'customers',
          important: false,
          timestamp: '09:30 AM',
          subject: 'Enterprise Contract Proposal — OmniCorp ($18,000 Deal)',
          body: `Boss,\n\nOmniCorp's VP of Procurement is ready to sign an expanded annual seat license worth $18,000 upfront, but they're asking for a custom SSO integration within 5 days OR a 15% early-adopter discount.\n\nGive me the green light and I'll close this before lunch.\n\nBest,\nChad Sterling`,
          day: 1,
          kind: 'decision',
          read: false,
          participantIds: ['emp_chad'],
          keyTopics: ['OmniCorp $18K Expansion', 'Custom Enterprise SSO', 'Q2 Revenue Targets'],
          choices: [
            {
              id: 'choice_chad_discount',
              label: 'Approve 15% Discount for Immediate Cash ($4,200 Now)',
              description: 'Close the contract immediately without burdening Engineering (+$4,200 Cash, +5 Customer Sat).',
              effects: {
                cashDelta: 4200,
                customerSatisfactionDelta: 5,
                investorConfidenceDelta: 4,
              },
            },
            {
              id: 'choice_chad_sso',
              label: 'Hold Full Price & Task Engineering with Custom SSO',
              description: 'Protect gross margins and collect $6,000, adding workload to Engineering (+$6,000 Cash, +6 Stress).',
              effects: {
                cashDelta: 6000,
                stressDeltaAll: 6,
                reputationDelta: 4,
              },
            },
          ],
        },
        {
          id: 'email_hr_burnout',
          uid: '4',
          from: 'toby.flenderson@company.io',
          fromName: 'HR Department',
          senderRole: 'Head of People Operations',
          senderRelation: 'Cautious Mediator',
          category: 'hr',
          important: false,
          timestamp: '09:15 AM',
          subject: 'Q2 Morale & Retention Risk Assessment',
          body: `Hello CEO,\n\nPeople Ops has completed our weekly pulse check. While overall team ambition remains high, several senior specialists noted rising stress levels from back-to-back standups and the broken espresso machine.\n\nWe recommend reviewing compensation bands or introducing a wellness stipend this week.`,
          day: 1,
          kind: 'decision',
          read: true,
          participantIds: ['emp_toby'],
          keyTopics: ['Retention Risk', 'Team Morale & Wellness', 'Meeting Overload'],
          attachments: [
            {
              name: 'Hiring_Plan.xlsx',
              type: 'xlsx',
              summary: 'Departmental headcount plan and salary band benchmarks across Engineering, Sales, and Ops.',
            },
          ],
          choices: [
            {
              id: 'choice_hr_stipend',
              label: 'Fund $1,200 Team Wellness & Catered Lunch Program',
              description: 'Boost company-wide morale (+10 Morale, -6 Stress, -$1,200).',
              effects: {
                cashDelta: -1200,
                moraleDeltaAll: 10,
                stressDeltaAll: -6,
                trustDeltaAll: 6,
              },
            },
            {
              id: 'choice_hr_ack',
              label: 'Acknowledge Report & Monitor Weekly',
              description: 'File the HR report without immediate budget outlay.',
              effects: {
                trustDeltaAll: 2,
              },
            },
          ],
        },
        {
          id: 'email_ir_review',
          uid: '5',
          from: 'ir@board-advisors.com',
          fromName: 'Investor Relations',
          senderRole: 'Board Audit Committee',
          senderRelation: 'Formal Oversight',
          category: 'investors',
          important: false,
          timestamp: '08:50 AM',
          subject: 'Q2 Financial Runway & Burn Rate Review',
          body: `Executive Summary:\n\nCurrent treasury stands at $${tuning.startingCash.toLocaleString()} with daily recurring retainers of $${tuning.baseRetainer.toLocaleString()}/day. Maintain positive net cash flow or complete a priced equity round before Day 15 to achieve a Grade-A rating from the Board.`,
          day: 1,
          kind: 'info',
          choices: [],
          read: true,
          participantIds: [],
          keyTopics: ['Runway Governance', 'Burn Rate Discipline', 'Board Audit'],
        },
      ],
      eventLog: [
        {
          uid: 'evt_init_1',
          defId: 'coffee_machine_uprising',
          title: 'The Coffee Machine Uprising',
          description: 'Break room espresso machine threw ERROR 666. Engineers are demanding repairs.',
          category: 'equipment',
          severity: 3,
          day: 1,
          tick: 0,
          participantIds: ['emp_yuki', 'emp_priya'],
          effects: ['Active Incident Opened', 'Pantry Morale Alert'],
        },
        {
          uid: 'evt_init_2',
          defId: 'investor_checkin',
          title: 'Horizon Capital Series A Inquiry',
          description: 'Managing Partner James Carter requested a formal boardroom pitch and financial review.',
          category: 'finance',
          severity: 2,
          day: 1,
          tick: 0,
          participantIds: ['emp_deborah'],
          effects: ['Boardroom Pitch Available', 'New Priority Email'],
        },
      ],
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
      campaign: createInitialCampaign(),
      flags: {},
      nextUid: 100,

      // --- V2 State Fields ---
      playerRole,
      playerAvatar,
      stage: 'seed',
      techDebt: 15,
      velocity: 24,
      codeQuality: 78,
      testCoverage: 62,
      uptime: 99.8,
      culture: 65,
      tickets: createInitialTickets(),
      sprint: createInitialSprint(1),
      repo: createInitialRepo(),
      prs: createInitialPRs(),
      pipeline: createInitialPipeline(),
      infra: createInitialInfra(),
      gpuMarket: createInitialGpuMarket(),
      gpuJobs: [],
      suggestions: createInitialSuggestions(),
      socialAccounts: createInitialSocialAccounts(),
      socialPosts: createInitialSocialPosts(),
      growth: createInitialGrowthFunnel(),
      onCallEmployeeId: 'emp_priya',
      career: createInitialCareerState(),
    }
  }
}

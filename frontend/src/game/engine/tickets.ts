/**
 * CORPORATE HELL™ — Tickets & Sprint Engine Module.
 *
 * Implements story point estimation, ticket lifecycles, bug risk formulas,
 * velocity tracking (EMA), and sprint planning.
 */
import type {
  CompanyState,
  Employee,
  Sprint,
  Ticket,
  TicketKind,
  TicketSource,
  TicketState,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialTickets(): Ticket[] {
  return [
    {
      id: 'tick_auth_oauth',
      title: 'OAuth2 & SSO Integration',
      kind: 'feature',
      complexity: 3,
      state: 'todo',
      source: 'roadmap',
      bugRisk: 0.12,
      designReady: true,
      techDebtDelta: -2,
      progress: 0,
    },
    {
      id: 'tick_db_indexing',
      title: 'Postgres Slow Queries & Missing Indexes',
      kind: 'infra',
      complexity: 2,
      state: 'todo',
      source: 'incident',
      bugRisk: 0.08,
      designReady: true,
      techDebtDelta: -5,
      progress: 0,
    },
    {
      id: 'tick_billing_stripe',
      title: 'Stripe Webhook Idempotency & Invoicing',
      kind: 'feature',
      complexity: 5,
      state: 'todo',
      source: 'investor',
      bugRisk: 0.18,
      designReady: true,
      techDebtDelta: 3,
      progress: 0,
    },
    {
      id: 'tick_ui_dashboard',
      title: 'Executive Analytics & Dark Mode Theme',
      kind: 'design',
      complexity: 3,
      state: 'todo',
      source: 'roadmap',
      bugRisk: 0.06,
      designReady: true,
      techDebtDelta: -1,
      progress: 0,
    },
    {
      id: 'tick_ai_model',
      title: 'Fine-tune Churn Prediction Model (LLM/XGBoost)',
      kind: 'ml',
      complexity: 8,
      state: 'backlog',
      source: 'roadmap',
      bugRisk: 0.22,
      designReady: true,
      techDebtDelta: 4,
      progress: 0,
    },
    {
      id: 'tick_security_patch',
      title: 'Upgrade Vulnerable JWT Library',
      kind: 'chore',
      complexity: 1,
      state: 'backlog',
      source: 'incident',
      bugRisk: 0.05,
      designReady: true,
      techDebtDelta: -8,
      progress: 0,
    },
    {
      id: 'tick_mobile_responsive',
      title: 'Fix Mobile Viewport Breakpoints in Checkout',
      kind: 'bug',
      complexity: 2,
      state: 'backlog',
      source: 'customer',
      bugRisk: 0.09,
      designReady: true,
      techDebtDelta: -2,
      progress: 0,
    },
  ]
}

export function createInitialSprint(startDay = 1): Sprint {
  return {
    id: 'sprint_1',
    number: 1,
    startDay,
    endDay: startDay + 4, // 5 in-game days per sprint
    committedPoints: 13,
    donePoints: 0,
    tickets: ['tick_auth_oauth', 'tick_db_indexing', 'tick_billing_stripe', 'tick_ui_dashboard'],
    goal: 'Ship core authentication, billing foundations, and initial dashboard.',
  }
}

/**
 * Calculates latent bug risk for a ticket using Section 10 formula:
 * bugRisk = clamp(0.05 + 0.02*complexity + (rushed?0.15:0) - (reviewed?0.10:0) - coverage*0.001 + techDebt*0.002, 0.01, 0.95)
 */
export function calculateTicketBugRisk(
  complexity: number,
  testCoverage: number,
  techDebt: number,
  rushed = false,
  reviewed = false,
): number {
  const base = 0.05
  const compFactor = complexity * 0.02
  const rushPenalty = rushed ? 0.15 : 0
  const reviewBonus = reviewed ? 0.1 : 0
  const coverageBonus = testCoverage * 0.001
  const debtPenalty = techDebt * 0.002

  const raw = base + compFactor + rushPenalty - reviewBonus - coverageBonus + debtPenalty
  return clamp(Number(raw.toFixed(4)), 0.01, 0.95)
}

/**
 * Calculates effective employee output capacity per tick:
 * capacity = baseSkill * (energy/100)^0.5 * (1 - stress/200) * (1 - techDebt/250)
 */
export function calculateEmployeeCapacity(
  emp: Employee,
  techDebt: number,
): number {
  const baseSkill = emp.skills.technical || 5
  const energyFactor = Math.sqrt(Math.max(0.1, emp.energy / 100))
  const stressFactor = 1 - emp.stress / 200
  const debtFactor = 1 - techDebt / 250
  const raw = baseSkill * energyFactor * stressFactor * debtFactor
  return Math.max(0.2, Number(raw.toFixed(3)))
}

/**
 * Generates dynamic tickets for the backlog when backlog runs low.
 */
export function generateTicket(rng: SeededRandom, source: TicketSource = 'roadmap'): Ticket {
  const id = `tick_${Math.floor(rng.next() * 1000000).toString(36)}`
  const kinds: TicketKind[] = ['feature', 'bug', 'chore', 'design', 'infra', 'ml']
  const kind = kinds[rng.integer(0, kinds.length - 1)]

  const TITLES: Record<TicketKind, string[]> = {
    feature: [
      'Implement Multi-Tenant Workspace Switching',
      'Export PDF Invoices & Tax Breakdowns',
      'Add Real-time WebSockets Live Cursors',
      'Global Command Palette (Cmd+K)',
      'Custom Role-Based Access Control (RBAC)',
    ],
    bug: [
      'Race Condition on Concurrent Checkout Attempts',
      'Memory Leak in WebGL Canvas Canvas Re-renders',
      'Null Pointer on Disconnected User Session',
      'Search Filter Drops Query Parameter on Page 2',
      'Zombie Worker Process Consuming 100% CPU',
    ],
    chore: [
      'Bump Core Dependencies and Remove Deprecated Polyfills',
      'Refactor Monolith API Router into Domain Services',
      'Clean Up Unused Feature Flag Toggles',
      'Upgrade TypeScript to Latest Strict Mode',
      'Extract Shared UI Design System Tokens',
    ],
    design: [
      'Redesign Empty States with Playful Vector Art',
      'Simplify Onboarding Wizard from 7 Steps to 3',
      'High-Contrast Accessibility Audit & Palette Adjustments',
      'Design Micro-interactions for Button Hover & Loading',
      'Design Interactive Data Visualization Graphs',
    ],
    infra: [
      'Set Up Multi-AZ Redis Replica Failover',
      'Configure Auto-scaling Group Warm Pools',
      'Implement Edge Caching & Brotli Compression',
      'Migrate S3 Storage Bucket to Cold Tier Glacier',
      'Containerize Background Worker Fleet',
    ],
    ml: [
      'Train Vector Embeddings for Semantic Product Search',
      'Fine-tune Customer Support Auto-Triage Classifier',
      'Optimize ONNX Runtime Inference Latency on CPU',
      'Implement Guardrails Filter for Hallucinations',
      'Build Anomaly Detection Model for Outage Telemetry',
    ],
  }

  const titleOptions = TITLES[kind]
  const title = titleOptions[rng.integer(0, titleOptions.length - 1)]
  const complexityOptions: (1 | 2 | 3 | 5 | 8)[] = [1, 2, 3, 5, 8]
  const complexity = complexityOptions[rng.integer(0, complexityOptions.length - 1)]

  return {
    id,
    title,
    kind,
    complexity,
    state: 'backlog',
    source,
    bugRisk: 0.05 + complexity * 0.02,
    designReady: kind !== 'feature' || rng.boolean(0.7),
    techDebtDelta: kind === 'chore' ? -4 : kind === 'bug' ? -2 : 2,
    progress: 0,
  }
}

/**
 * Advances sprint day and checks if sprint should conclude.
 */
export function checkSprintAdvancement(state: CompanyState, rng: SeededRandom): void {
  if (!state.sprint) {
    state.sprint = createInitialSprint(state.day)
  }

  const sprint = state.sprint
  if (state.day > sprint.endDay) {
    // Sprint completed!
    const doneTickets = state.tickets.filter(
      (t) => sprint.tickets.includes(t.id) && t.state === 'done',
    )
    sprint.donePoints = doneTickets.reduce((acc, t) => acc + t.complexity, 0)

    // Update velocity EMA: 70% existing, 30% recent sprint done points
    const currentVelocity = state.velocity || 20
    state.velocity = Math.round(currentVelocity * 0.7 + sprint.donePoints * 0.3)

    // Start next sprint
    const nextSprintNumber = sprint.number + 1
    const nextSprintStart = state.day
    const nextSprintEnd = state.day + 4

    // Pick top backlog tickets for the next sprint up to velocity capacity
    let accumulatedPoints = 0
    const nextTickets: string[] = []
    for (const t of state.tickets) {
      if (t.state === 'todo' || t.state === 'backlog') {
        if (accumulatedPoints + t.complexity <= state.velocity + 5) {
          t.state = 'todo'
          nextTickets.push(t.id)
          accumulatedPoints += t.complexity
        }
      }
    }

    // If backlog is low, seed fresh tickets
    while (state.tickets.length < 12) {
      state.tickets.push(generateTicket(rng))
    }

    state.sprint = {
      id: `sprint_${nextSprintNumber}`,
      number: nextSprintNumber,
      startDay: nextSprintStart,
      endDay: nextSprintEnd,
      committedPoints: accumulatedPoints,
      donePoints: 0,
      tickets: nextTickets,
      goal: `Sprint ${nextSprintNumber}: Deliver ${accumulatedPoints} story points across prioritized roadmap epics.`,
    }
  }
}

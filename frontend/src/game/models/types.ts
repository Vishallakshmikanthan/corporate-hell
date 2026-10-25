/**
 * CORPORATE HELL™ — core data models.
 *
 * This file is the single source of truth for the simulation's data shapes.
 * The engine mutates plain JSON-serializable objects only (no class
 * instances inside state) so save/load is a pure JSON round trip.
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type GameMode = 'sandbox' | 'campaign'
export type Difficulty = 'easy' | 'normal' | 'hard'

export type Department = 'engineering' | 'sales' | 'marketing' | 'hr' | 'operations'

export type Role = 'ceo' | 'manager' | 'senior' | 'specialist' | 'junior' | 'intern'

export type RoomId =
  | 'open_plan'
  | 'ceo_office'
  | 'conference'
  | 'break_room'
  | 'pantry'
  | 'server_room'
  | 'reception'

export type ArchetypeId =
  | 'meeting_addict'
  | 'bootlicker'
  | 'silent_genius'
  | 'linkedin_speaker'
  | 'procrastinator'
  | 'gossip'
  | 'kpi_manipulator'
  | 'burnout_veteran'
  | 'unnecessary_manager'
  | 'ai_evangelist'

/** Must stay in sync with backend Emotion enum (app/schemas/dialogue.py). */
export type Emotion =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'celebratory'
  | 'smug'
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'confused'
  | 'exhausted'
  | 'panicked'
  | 'embarrassed'

export type ActionKind =
  | 'work'
  | 'coffee'
  | 'break'
  | 'chat'
  | 'meeting'
  | 'help'
  | 'procrastinate'
  | 'gossip'
  | 'escalate'
  | 'personal'
  | 'wander'
  | 'react'

export type EventCategory =
  | 'drama'
  | 'project'
  | 'finance'
  | 'management'
  | 'equipment'
  | 'customer'
  | 'hr'
  | 'ai'
  | 'celebration'
  | 'luck'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export interface Vec2 {
  x: number
  z: number
}

export interface EmployeeVisual {
  skin: string
  hair: string
  outfit: string
  outfitAccent: string
  hairStyle: 'short' | 'bun' | 'long' | 'bald' | 'ponytail' | 'spiky'
  accessory: 'none' | 'glasses' | 'tie' | 'headphones' | 'badge' | 'beard'
}

export interface Skills {
  focus: number // 1..10
  communication: number
  technical: number
  creativity: number
  leadership: number
}

export interface PersonalGoal {
  id: string
  description: string
  type: 'promotion' | 'meetings' | 'skill' | 'social' | 'survival'
  target: number
  progress: number
  achieved: boolean
}

export interface Memory {
  day: number
  text: string
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

export interface Employee {
  id: string
  name: string
  role: Role
  department: Department
  archetype: ArchetypeId
  bio: string
  visual: EmployeeVisual

  skills: Skills

  /** Bounded 0..100 metrics. See engine/formulas.ts for update rules. */
  morale: number
  stress: number
  energy: number
  /** Static-ish drive 0..100. High-ambition employees react to promotions. */
  ambition: number
  /** Trust in leadership 0..100. */
  trust: number
  /** Rolling productivity indicator 0..100 (EMA of recent output). */
  productivity: number

  /** Daily salary in $. */
  salary: number

  hiredDay: number
  active: boolean
  quitDay?: number
  quitReason?: string

  // --- current behavior ---
  action: ActionKind
  actionTicksLeft: number
  actionStartedTick: number
  nextDecisionTick: number
  /** Short expressive reaction overriding normal animation. */
  reaction?: { kind: Emotion; ticksLeft: number }
  /** Employee this one is interacting with (chat/gossip/help). */
  interactingWith?: string

  location: RoomId
  position: Vec2
  facing: number
  path?: Vec2[]
  pathIndex: number
  /** Desk index in the open plan (or special desks), -1 for none. */
  homeDesk: number

  relationships: Record<string, number> // employeeId -> -100..100

  memories: Memory[]
  goals: PersonalGoal[]

  /** Assigned work points this tick vs. personal capacity (ratio). */
  workload: number
  meetingsAttendedToday: number
  coffeesToday: number

  /** Transient visible thought (thought-bubble text + ttl). */
  thought?: string
  thoughtTicksLeft: number
  /** Latest dialogue line (AI or fallback) shown in the dossier. */
  lastDialogue?: { text: string; source: 'ai' | 'template'; day: number; tick: number }

  /** Days of paid training remaining (skills grow at end of each day). */
  trainingDaysLeft: number

  /** Ticks of +15% output mentorship remaining (set by `help` from a senior). */
  mentoredTicksLeft?: number
}

// ---------------------------------------------------------------------------
// Projects / meetings / incidents / emails / events
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  name: string
  department: Department
  clientName: string
  pointsDone: number
  pointsTotal: number
  /** 0..100 EMA of contributor quality. Affects revenue on completion. */
  quality: number
  deadlineDay: number
  revenueOnDone: number
  penaltyOnFail: number
  status: 'active' | 'completed' | 'failed'
  /** Post-meeting coordination buff (ticks remaining). */
  alignmentBuffTicksLeft: number
}

export interface Meeting {
  id: string
  title: string
  roomId: RoomId
  startTick: number
  durationTicks: number
  attendeeIds: string[]
  recurring: 'none' | 'daily' | 'weekly'
  topic: string
  createdBy: string
  timesHeld: number
  /** True while the meeting is currently running this tick. */
  active: boolean
}

export type EquipmentKey = 'coffeeMachineBroken' | 'printerJammed' | 'acBroken' | 'serverRoomHot'

export interface IncidentResponseEffects {
  resolve: boolean
  moraleDelta?: number
  moraleDeltaAll?: number
  stressDeltaAll?: number
  reputationDelta?: number
  investorConfidenceDelta?: number
  cashDelta?: number
  fixEquipment?: EquipmentKey
  /** narrative shown in the incident log */
  narrative: string
}

export interface IncidentResponse {
  id: string
  label: string
  description: string
  cost: number
  effects: IncidentResponseEffects
}

export interface Incident {
  id: string
  title: string
  description: string
  category: string
  severity: number // 1..5
  roomId?: RoomId
  causeEventId?: string
  dayOpened: number
  /** Morale drift applied to the whole company at each end-of-day while open. */
  dailyMoraleDrift?: number
  /** Productivity multiplier while open (0.8 = -20%). */
  productivityPenalty?: number
  responses: IncidentResponse[]
  resolved: boolean
  dayResolved?: number
  /** Auto-resolve silently after this day (used for self-healing issues). */
  expiresDay?: number
}

/** Declarative effects used by events, decisions and email choices. */
export interface EffectSpec {
  cashDelta?: number
  revenueDelta?: number
  moraleDelta?: number
  moraleDeltaAll?: number
  stressDelta?: number
  stressDeltaAll?: number
  reputationDelta?: number
  investorConfidenceDelta?: number
  executiveConfidenceDelta?: number
  customerSatisfactionDelta?: number
  trustDeltaAll?: number
  kpiInflationDelta?: number
  auditRiskDelta?: number
  energyDeltaAll?: number
  projectPointsDelta?: number
  relationshipDelta?: number
  breakEquipment?: EquipmentKey
  fixEquipment?: EquipmentKey
  /** Employee quits immediately (used by poach decisions when not countered). */
  quitEmployeeId?: string
  hireFrozenDays?: number
  flags?: Record<string, boolean | number | string>
  /** Log lines appended to the record for the audit trail. */
  log?: string[]
}

export interface EmailChoice {
  id: string
  label: string
  description: string
  effects: EffectSpec
}

export interface Email {
  id: string
  uid: string
  from: string
  fromName: string
  subject: string
  body: string
  day: number
  kind: 'info' | 'decision'
  choices: EmailChoice[]
  read: boolean
  participantIds: string[]
}

export interface EventRecord {
  uid: string
  defId: string
  title: string
  description: string
  category: EventCategory
  severity: number
  day: number
  tick: number
  participantIds: string[]
  effects: string[]
}

export interface DecisionChoice {
  id: string
  label: string
  description: string
  effects: EffectSpec
}

export interface PendingDecision {
  id: string
  uid: string
  title: string
  description: string
  severity: number
  source: 'event' | 'campaign'
  eventId?: string
  choices: DecisionChoice[]
  day: number
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

export interface Policies {
  fourDayWeek: boolean
  meetingFreeDay: boolean
  hiringFrozen: boolean
  productivityTracking: boolean
  casualFridays: boolean
  remoteFriendly: boolean
}

export interface ProductLaunch {
  name: string
  launchedDay: number
  hype: number // 0..100
  quality: number // 0..100
  revenueToDate: number
}

export interface DayLedger {
  day: number
  revenue: number
  costs: number
  net: number
  cashAfter: number
  moraleAvg: number
  stressAvg: number
  productivity: number
  headcount: number
  events: number
  revenueBreakdown: { retainer: number; product: number; projects: number }
  costBreakdown: { salaries: number; overhead: number; other: number }
}

export type ObjectiveType =
  | 'survive_days'
  | 'cash_positive_streak'
  | 'complete_project'
  | 'morale_minimum'
  | 'investor_confidence'
  | 'final_stability'

export interface Objective {
  id: string
  title: string
  description: string
  type: ObjectiveType
  target?: number
  projectId?: string
  deadlineDay?: number
  status: 'active' | 'done' | 'failed'
  startedDay: number
  completedDay?: number
  /** 0..100 progress indicator for the UI. */
  progress: number
  /** Set when the objective resolves; shown in the briefing. */
  resultNote?: string
}

export interface Ending {
  kind: 'victory' | 'failure'
  title: string
  summary: string
  day: number
}

export interface CampaignState {
  objectives: Objective[]
  activeObjectiveIndex: number
  ending: Ending | null
  /** Consecutive days cash was below zero (bankruptcy warning). */
  bankNegativeDays: number
  /** Consecutive days average morale was below collapse threshold. */
  collapseDays: number
  memo: string[]
}

export interface CompanyState {
  /** Shape version of the state, used by save migration. */
  stateVersion: number
  id: string
  name: string
  industry: string
  mode: GameMode
  difficulty: Difficulty
  scenarioId: string
  scenarioLabel: string

  seed: number
  rngState: number

  day: number
  tick: number // 0..TICKS_PER_DAY-1; TICKS_PER_DAY == end-of-day

  cash: number
  reputation: number // 0..100
  customerSatisfaction: number // 0..100
  investorConfidence: number // 0..100
  executiveConfidence: number // 0..100

  baseRetainer: number
  product: ProductLaunch | null

  employees: Record<string, Employee>
  /** Stable hire order for iteration. */
  employeeOrder: string[]

  projects: Project[]
  meetings: Meeting[]
  incidents: Incident[]
  emails: Email[]
  eventLog: EventRecord[]
  decisions: PendingDecision[]

  policies: Policies

  eventCooldowns: Record<string, number> // event def id -> last day it fired
  /** Scenario-forced events to fire ASAP. */
  eventQueue: string[]

  kpiInflation: number // 0..100 fake reported output
  auditRisk: number // 0..100

  equipment: Record<EquipmentKey, boolean>

  history: DayLedger[]
  /** Accumulators for the in-progress day (project completions, repairs...). */
  todayRevenueExtra: number
  todayCostsExtra: number

  campaign: CampaignState | null

  /** Scenario/decision scratch flags. */
  flags: Record<string, boolean | number | string>

  /** Counter for stable unique ids. */
  nextUid: number
}

// ---------------------------------------------------------------------------
// Player actions (validated by rules/actions.ts)
// ---------------------------------------------------------------------------

export type PlayerAction =
  | { type: 'hire'; name?: string; department: Department; role: Role }
  | { type: 'fire'; employeeId: string }
  | { type: 'promote'; employeeId: string }
  | { type: 'reprimand'; employeeId: string }
  | { type: 'bonus'; employeeId: string }
  | { type: 'bonus_all' }
  | { type: 'training'; employeeId: string }
  | {
      type: 'schedule_meeting'
      title: string
      roomId: RoomId
      startTick?: number
      durationTicks: number
      attendeeIds: string[]
      recurring?: 'none' | 'daily' | 'weekly'
    }
  | { type: 'cancel_meeting'; meetingId: string }
  | { type: 'launch_product'; name: string }
  | { type: 'set_policy'; policy: keyof Policies; value: boolean }
  | { type: 'respond_incident'; incidentId: string; responseId: string }
  | { type: 'decide'; decisionId: string; choiceId: string }
  | { type: 'choose_email'; emailId: string; choiceId: string }
  | { type: 'trigger_event'; eventId: string }
  | { type: 'nudge'; employeeId: string } // "get back to work" — small push

export interface ActionResult {
  ok: boolean
  reason?: string
  message?: string
  effects?: string[]
}

// ---------------------------------------------------------------------------
// Engine config / snapshots / saves
// ---------------------------------------------------------------------------

export interface EngineConfig {
  seed: number
  mode: GameMode
  companyName: string
  industry: string
  difficulty: Difficulty
  scenarioId: string // 'standard' or a scenario preset id
}

export interface EngineEvents {
  /** Emitted after every simulation tick with the current state. */
  onTick?: (state: CompanyState) => void
  /** Emitted once when the fiscal day ends (state already finalized). */
  onDayEnd?: (state: CompanyState) => void
  /** Emitted when an event fires (for narration / camera focus). */
  onEvent?: (record: EventRecord, state: CompanyState) => void
  /** Emitted when a critical failure or victory occurs. */
  onEnding?: (ending: Ending, state: CompanyState) => void
}

export interface SaveData {
  version: number
  savedAt: string
  game: CompanyState
}

// ---------------------------------------------------------------------------
// Bounds — the single authority for numeric limits
// ---------------------------------------------------------------------------

export const BOUNDS = {
  morale: [0, 100],
  stress: [0, 100],
  energy: [0, 100],
  productivity: [0, 100],
  trust: [0, 100],
  reputation: [0, 100],
  customerSatisfaction: [0, 100],
  investorConfidence: [0, 100],
  executiveConfidence: [0, 100],
  kpiInflation: [0, 100],
  auditRisk: [0, 100],
  relationship: [-100, 100],
  skill: [1, 10],
  goalProgress: [0, Infinity],
} as const

/** Simulation time constants. */
export const TICKS_PER_DAY = 36 // 09:00 -> 18:00 in 15-minute ticks
export const TICK_MINUTES = 15
export const DAY_START_HOUR = 9

/** Formatting helper: tick -> "HH:MM" in-game clock. */
export function tickToClock(tick: number): string {
  const minutes = DAY_START_HOUR * 60 + tick * TICK_MINUTES
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Clamp helper used everywhere to keep state inside BOUNDS. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  engineering: 'Engineering',
  sales: 'Sales',
  marketing: 'Marketing',
  hr: 'People Ops',
  operations: 'Operations',
}

export const ROLE_LABELS: Record<Role, string> = {
  ceo: 'CEO',
  manager: 'Manager',
  senior: 'Senior Specialist',
  specialist: 'Specialist',
  junior: 'Associate',
  intern: 'Intern',
}

export const ROLE_SALARY: Record<Role, number> = {
  ceo: 720,
  manager: 480,
  senior: 380,
  specialist: 260,
  junior: 200,
  intern: 110,
}

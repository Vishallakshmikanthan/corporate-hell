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
  | 'tech'
  | 'social'

// ---------------------------------------------------------------------------
// V2 "Ship It" — Role Modes & Software Workflow Types
// ---------------------------------------------------------------------------

export type PlayerRole = 'ceo' | 'developer' | 'designer' | 'pm' | 'devops' | 'overall' | 'intern'

export type TicketKind = 'feature' | 'bug' | 'chore' | 'design' | 'infra' | 'ml'
export type TicketState = 'backlog' | 'todo' | 'doing' | 'review' | 'qa' | 'done' | 'blocked'
export type TicketSource = 'roadmap' | 'customer' | 'investor' | 'employee' | 'incident'

export interface Ticket {
  id: string
  title: string
  kind: TicketKind
  complexity: 1 | 2 | 3 | 5 | 8 // story points
  assigneeId?: string
  state: TicketState
  source: TicketSource
  bugRisk: number // 0..1, hidden until QA/prod
  designReady: boolean
  techDebtDelta: number
  progress?: number // 0..100
}

export interface Sprint {
  id: string
  number: number
  startDay: number
  endDay: number
  committedPoints: number
  donePoints: number
  tickets: string[]
  goal: string
}

export interface Branch {
  name: string
  authorId: string
  commits: number
  conflicts: number
  ticketId: string
}

export interface PullRequest {
  id: string
  branch: string
  title: string
  authorId: string
  reviewerId?: string
  size: number
  quality: number
  state: 'open' | 'changes_requested' | 'approved' | 'merged'
  comments?: { author: string; text: string; day: number }[]
}

export interface Repo {
  name: string
  branches: Branch[]
  mainHealth: number // 0..100
  techDebt: number // 0..100
  lastCommitMessage?: string
}

export type PipelineStageId =
  | 'lint'
  | 'unit_tests'
  | 'build'
  | 'integration_tests'
  | 'security_scan'
  | 'docker_image'
  | 'deploy_staging'
  | 'smoke_tests'
  | 'deploy_prod'

export interface PipelineStage {
  id: PipelineStageId
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  durationTicks: number
  log?: string
}

export interface PipelineFailureFixOption {
  id: string
  label: string
  description: string
  cost: number
  techDebtDelta: number
  timeCostTicks: number
  successChance: number
}

export interface PipelineFailure {
  id: string
  stageId: PipelineStageId
  title: string
  cause: string
  incidentId?: string
  fixOptions: PipelineFailureFixOption[]
}

export interface Pipeline {
  status: 'idle' | 'running' | 'passed' | 'failed'
  currentStageIndex: number
  stages: PipelineStage[]
  activeFailure?: PipelineFailure
  lastRunTick: number
}

export type DeployStrategy = 'friday' | 'rolling' | 'blue_green' | 'canary' | 'feature_flags'

export interface Infra {
  region: 'us' | 'eu' | 'asia'
  instances: number
  autoscale: boolean
  dbSize: 'S' | 'M' | 'L'
  cdn: boolean
  monitoring: boolean
  backups: boolean
  monthlyCost: number
  capacity: number // requests/s
  currentTraffic: number // requests/s
  outageTicksRemaining: number
}

export interface GpuMarket {
  spotPrice: number
  onDemandPrice: number
  availability: number // 0..1
  history: { tick: number; spot: number; onDemand: number }[]
}

export interface GpuJob {
  id: string
  ticketId: string
  name: string
  gpus: number
  hoursNeeded: number
  progress: number // 0..100
  mode: 'spot' | 'on_demand'
  checkpointing: boolean
  costAccumulated: number
  status: 'running' | 'preempted' | 'completed' | 'failed'
}

export interface Suggestion {
  id: string
  from: 'customer' | 'investor' | 'employee' | 'social' | 'ceo'
  text: string
  value: number // expected revenue or quality bump
  effort: number // story points
  urgency: number // 1..5
  politicalWeight: number // 1..5
  status: 'pending' | 'accepted' | 'deferred' | 'rejected'
}

export type SocialPlatform = 'chirper' | 'linkedout' | 'instagrim' | 'tiktak' | 'reddot' | 'newsletter'

export interface SocialAccount {
  platform: SocialPlatform
  followers: number
  engagementRate: number
  sentiment: number // 0..100
}

export interface SocialComment {
  id: string
  author: string
  handle: string
  text: string
  likes: number
  isRoast?: boolean
  replied?: boolean
}

export interface SocialPost {
  id: string
  platform: SocialPlatform
  kind: 'announcement' | 'meme' | 'thread' | 'demo_video' | 'apology' | 'hiring' | 'behind_the_scenes'
  content: string
  quality: number
  authorId: string
  authorName: string
  postedDay: number
  postedTick: number
  reach: number
  likes: number
  shares: number
  sentiment: number
  comments: SocialComment[]
}

export type CompanyStage = 'garage' | 'seed' | 'series_a' | 'series_b' | 'scale_up' | 'unicorn'

export interface GrowthFunnel {
  impressions: number
  visits: number
  signups: number
  activatedUsers: number
  payingCustomers: number
  churnRate: number // 0..1
  mrr: number
  valuation: number
  cac: number
  ltv: number
}

export interface PlayerAvatarState {
  role: PlayerRole
  name: string
  visual: EmployeeVisual
  position: Vec2
  facing: number
  cameraMode: 'follow' | 'orbit' | 'desk'
  energy: number // 0..100
  focus: number // 0..100
  stress: number // 0..100
  reputationWithTeam: number // 0..100
  coffeesToday: number
  skillXP: Record<string, number>
  perks: string[]
  currentInteractable: string | null
  currentBranch?: string
  currentTicketId?: string
}

export type MeetingKind =
  | 'standup'
  | 'sprint_planning'
  | 'design_review'
  | 'code_review'
  | 'retro'
  | 'stakeholder_demo'
  | 'board'
  | 'could_have_been_email'

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
  kind?: MeetingKind
  attendeeStances?: Record<string, 'supports' | 'opposes' | 'neutral'>
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
  investigationSummary?: string
  affectedDepartment?: Department
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

export interface EmailAttachment {
  name: string
  type: 'pdf' | 'xlsx' | 'doc'
  summary: string
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
  category?: 'important' | 'investors' | 'employees' | 'customers' | 'hr' | 'archived'
  important?: boolean
  archived?: boolean
  timestamp?: string
  attachments?: EmailAttachment[]
  senderRole?: string
  senderRelation?: string
  keyTopics?: string[]
  repliedText?: string
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

  // --- V2 Software Workflow & Avatar state ---
  playerRole: PlayerRole
  playerAvatar: PlayerAvatarState
  stage: CompanyStage
  techDebt: number // 0..100
  velocity: number // story points / sprint
  codeQuality: number // 0..100
  testCoverage: number // 0..100
  uptime: number // 0..100
  culture: number // 0..100
  tickets: Ticket[]
  sprint: Sprint | null
  repo: Repo
  prs: PullRequest[]
  pipeline: Pipeline
  infra: Infra
  gpuMarket: GpuMarket
  gpuJobs: GpuJob[]
  suggestions: Suggestion[]
  socialAccounts: Record<SocialPlatform, SocialAccount>
  socialPosts: SocialPost[]
  growth: GrowthFunnel
  onCallEmployeeId?: string
  lastWarRoomTick?: number
  career?: import('../engine/career').CareerChapterState
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
  // V2 actions
  | { type: 'set_player_role'; role: PlayerRole }
  | { type: 'avatar_move'; position: Vec2; facing: number }
  | { type: 'avatar_interact'; targetId: string }
  | { type: 'set_camera_mode'; mode: 'follow' | 'orbit' | 'desk' }
  | { type: 'pick_ticket'; ticketId: string; assigneeId?: string }
  | { type: 'create_branch'; ticketId: string; branchName?: string }
  | { type: 'commit_work'; branchName: string; qualityDelta?: number }
  | { type: 'open_pr'; branchName: string; size?: number }
  | { type: 'review_pr'; prId: string; approve: boolean; feedback?: string }
  | { type: 'resolve_conflict'; branchName: string; strategy: 'ours' | 'theirs' | 'manual' }
  | { type: 'merge_pr'; prId: string }
  | { type: 'run_pipeline'; branchName?: string }
  | { type: 'fix_pipeline_failure'; failureId: string; optionId: string }
  | { type: 'deploy'; environment: 'staging' | 'prod'; strategy: DeployStrategy }
  | { type: 'rollback' }
  | { type: 'scale_infra'; instancesDelta: number; autoscale?: boolean; dbSize?: 'S' | 'M' | 'L'; cdn?: boolean; backups?: boolean }
  | { type: 'rent_gpu'; ticketId: string; gpus: number; mode: 'spot' | 'on_demand'; checkpointing: boolean }
  | { type: 'cancel_gpu_job'; jobId: string }
  | { type: 'handle_suggestion'; suggestionId: string; decision: 'accept' | 'defer' | 'reject_polite' | 'reject_rude' }
  | { type: 'office_break'; activity: 'coffee' | 'lunch' | 'ping_pong' | 'walk' | 'nap' | 'gossip'; targetEmployeeId?: string }
  | { type: 'post_social'; platform: SocialPlatform; kind: SocialPost['kind']; content?: string }
  | { type: 'reply_social'; postId: string; commentId: string; responseKind: 'helpful' | 'defensive' | 'meme' }
  | { type: 'pitch_investors'; pitchDeckQuality: number }
  | { type: 'upgrade_company_stage' }
  | { type: 'study_docs'; topic?: string }
  | { type: 'ship_side_project'; title?: string }
  | { type: 'code_sprint_result'; score: number; bugsSquashed: number }
  | { type: 'recruit_cofounder'; candidateId: string }
  | { type: 'crunch_hackathon'; hours: number }
  | { type: 'pitch_hackathon_result'; won: boolean; rank: number; prizeCash: number }
  | { type: 'split_founder_equity'; coFounders: { id: string; name: string; role: string; equityPct: number; satisfaction: number }[]; founderEquityPct: number }
  | { type: 'sign_term_sheet_offer'; offerId: string }
  | { type: 'place_furniture'; itemId?: string; x?: number; y?: number }
  | { type: 'advance_chapter'; targetChapter: import('../engine/career').CareerChapterId }
  // Complete 9-Section Executive Actions
  | {
      type: 'conclude_pitch'
      cashRaised: number
      valuation: number
      equityDiluted: number
      confidenceDelta: number
      investorName: string
      outcome: 'full' | 'partial' | 'rejected'
    }
  | {
      type: 'employee_conversation'
      employeeId: string
      choiceLabel: string
      moraleDelta: number
      stressDelta: number
      trustDelta: number
      productivityDelta: number
      memoryText: string
      cost?: number
    }
  | { type: 'adjust_salary'; employeeId: string; newSalary: number }
  | {
      type: 'create_project'
      name: string
      department: Department
      clientName: string
      pointsTotal: number
      deadlineDay: number
      revenueOnDone: number
    }
  | { type: 'boost_project'; projectId: string; cost: number; pointsGain: number }
  | { type: 'adjust_dept_budget'; department: Department; budgetPerDay: number }
  | {
      type: 'treasury_action'
      subtype:
        | 'take_loan'
        | 'repay_loan'
        | 'cut_costs'
        | 'increase_pricing'
        | 'emergency_fundraise'
        | 'prepare_financials'
      amount?: number
    }
  | { type: 'investigate_incident'; incidentId: string; summary: string }
  | {
      type: 'reply_email_custom'
      emailId: string
      replyText: string
      confidenceDelta: number
      cashDelta?: number
      moraleDelta?: number
    }
  | { type: 'toggle_email_flag'; emailId: string; flag: 'important' | 'archived' }
  | {
      type: 'complete_campaign_scene'
      chapterNumber: number
      sceneId: string
      choiceLabel: string
      cashDelta?: number
      moraleDelta?: number
      confidenceDelta?: number
      reputationDelta?: number
    }

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
  playerRole?: PlayerRole
  avatarVisual?: EmployeeVisual
  playerName?: string
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
  focus: [0, 100],
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
  techDebt: [0, 100],
  codeQuality: [0, 100],
  testCoverage: [0, 100],
  uptime: [0, 100],
  culture: [0, 100],
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

export const PLAYER_ROLE_LABELS: Record<PlayerRole, string> = {
  ceo: 'Chief Executive Officer',
  developer: 'Software Engineer',
  designer: 'Product Designer',
  pm: 'Product Manager',
  devops: 'DevOps & SRE',
  overall: 'Director (God View)',
  intern: 'Engineering Intern',
}

export const COMPANY_STAGE_LABELS: Record<CompanyStage, string> = {
  garage: 'Garage Startup (3 Desks)',
  seed: 'Seed Funded (MVP + Traction)',
  series_a: 'Series A (Growth + SRE)',
  series_b: 'Series B (Multi-product Scale)',
  scale_up: 'Scale-Up (Profitable / Expansion)',
  unicorn: 'Unicorn / IPO (Endgame)',
}

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, { name: string; handlePrefix: string; icon: string }> = {
  chirper: { name: 'Chirper', handlePrefix: '@corp_', icon: 'bird' },
  linkedout: { name: 'LinkedOut', handlePrefix: 'in/', icon: 'briefcase' },
  reddot: { name: 'RedDot', handlePrefix: 'r/', icon: 'message-square' },
  tiktak: { name: 'TikTak', handlePrefix: '@tiktak_', icon: 'video' },
  instagrim: { name: 'InstaGrim', handlePrefix: '@grim_', icon: 'camera' },
  newsletter: { name: 'SubStalker', handlePrefix: 'sub/', icon: 'mail' },
}

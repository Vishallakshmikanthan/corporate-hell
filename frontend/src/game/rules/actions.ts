/**
 * CORPORATE HELL™ — player action validation and execution.
 *
 * Validates and executes all management commands (hire, fire, promote,
 * reprimand, bonus, meetings, policies, incident responses, decisions).
 * Ensures invalid actions are rejected and financial / state invariants hold.
 */
import type {
  ActionResult,
  CompanyState,
  Department,
  Employee,
  PlayerAction,
  Role,
} from '../models/types'
import { BOUNDS, clamp, ROLE_SALARY } from '../models/types'
import { setReaction } from '../engine/employee'
import { onPromotion } from '../engine/relationships'
import { EVENT_DEFINITIONS, executeEvent, applyEffectSpec } from '../engine/events'
import { SeededRandom } from '../engine/rng'
import { nextId, addMemory } from '../engine/util'
import { deskSeat } from '../engine/office'

import { createBranch, addCommit, checkForMergeConflicts, mergePullRequest, generateReviewerFeedback } from '../engine/repo'
import { startPipelineRun, applyPipelineFix } from '../engine/pipeline'
import { executeDeployment, executeRollback, STRATEGY_CONFIGS } from '../engine/deploy'
import { scaleInfraSettings } from '../engine/infra'
import { rentGpuCluster, cancelGpuJob } from '../engine/gpu'
import { handleSuggestionDecision } from '../engine/suggestions'
import { publishSocialPost, replyToComment } from '../engine/social'
import { upgradeStage, checkStageProgression } from '../engine/growth'
import { checkProximityInteractable, executeOfficeBreak, validateAvatarMove } from '../engine/avatar'
import { resolvePitchDeckMiniGame } from '../engine/minigames/minigames'
import { advanceCareerChapter } from '../engine/career'

const HIRING_COST: Record<Role, number> = {
  ceo: 10000,
  manager: 3500,
  senior: 2400,
  specialist: 1500,
  junior: 800,
  intern: 300,
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Riley', 'Avery',
  'Cameron', 'Dakota', 'Quinn', 'Harper', 'Skyler', 'Logan', 'Rowan', 'Finley'
]
const LAST_NAMES = [
  'Vance', 'Sterling', 'Chen', 'Kapoor', 'Sinclair', 'Mercer', 'Novak', 'Holloway',
  'Kowalski', 'Thorpe', 'Fairchild', 'Blackwood', 'Gallagher', 'Whitmore'
]

export function validateAction(state: CompanyState, action: PlayerAction): ActionResult {
  switch (action.type) {
    case 'hire': {
      if (state.policies.hiringFrozen) {
        return { ok: false, reason: 'Hiring is currently frozen by company policy.' }
      }
      const cost = HIRING_COST[action.role] ?? 1000
      if (state.cash < cost) {
        return { ok: false, reason: `Insufficient cash for recruitment fees ($${cost} required).` }
      }
      return { ok: true }
    }

    case 'fire': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) {
        return { ok: false, reason: 'Employee not found or already inactive.' }
      }
      if (emp.role === 'ceo') {
        return { ok: false, reason: 'You cannot fire the CEO from this menu.' }
      }
      const severance = emp.salary * 5
      if (state.cash < severance) {
        return { ok: false, reason: `Insufficient cash to pay statutory severance ($${severance}).` }
      }
      return { ok: true }
    }

    case 'promote': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found or inactive.' }
      if (emp.role === 'manager' || emp.role === 'ceo') {
        return { ok: false, reason: 'Employee is already at maximum corporate altitude.' }
      }
      return { ok: true }
    }

    case 'reprimand': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found or inactive.' }
      return { ok: true }
    }

    case 'bonus': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found or inactive.' }
      const bonusCost = Math.round(emp.salary * 3)
      if (state.cash < bonusCost) {
        return { ok: false, reason: `Insufficient cash for bonus ($${bonusCost} required).` }
      }
      return { ok: true }
    }

    case 'bonus_all': {
      const activeCount = state.employeeOrder.filter((id) => state.employees[id]?.active).length
      const totalCost = activeCount * 600
      if (state.cash < totalCost) {
        return { ok: false, reason: `Insufficient cash for company-wide bonuses ($${totalCost} required).` }
      }
      return { ok: true }
    }

    case 'training': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found or inactive.' }
      if (emp.trainingDaysLeft > 0) {
        return { ok: false, reason: 'Employee is already enrolled in active professional training.' }
      }
      const cost = 750
      if (state.cash < cost) {
        return { ok: false, reason: `Insufficient cash for training module ($${cost} required).` }
      }
      return { ok: true }
    }

    case 'schedule_meeting': {
      if (state.policies.meetingFreeDay) {
        return { ok: false, reason: 'Meetings are prohibited by the Meeting-Free policy today.' }
      }
      if (action.attendeeIds.length === 0) {
        return { ok: false, reason: 'A meeting requires at least one attendee.' }
      }
      return { ok: true }
    }

    case 'cancel_meeting': {
      const m = state.meetings.find((x) => x.id === action.meetingId)
      if (!m) return { ok: false, reason: 'Meeting not found.' }
      return { ok: true }
    }

    case 'launch_product': {
      if (state.product) {
        return { ok: false, reason: 'A product is already active in the market.' }
      }
      if (state.cash < 5000) {
        return { ok: false, reason: 'Product launch requires at least $5,000 in promotional budget.' }
      }
      return { ok: true }
    }

    case 'set_policy': {
      return { ok: true }
    }

    case 'respond_incident': {
      const inc = state.incidents.find((i) => i.id === action.incidentId)
      if (!inc || inc.resolved) return { ok: false, reason: 'Incident not found or already resolved.' }
      const resp = inc.responses.find((r) => r.id === action.responseId)
      if (!resp) return { ok: false, reason: 'Response option not found.' }
      if (resp.cost > 0 && state.cash < resp.cost) {
        return { ok: false, reason: `Insufficient funds for this response ($${resp.cost} required).` }
      }
      return { ok: true }
    }

    case 'decide': {
      const dec = state.decisions.find((d) => d.id === action.decisionId)
      if (!dec) return { ok: false, reason: 'Decision not found or already resolved.' }
      const choice = dec.choices.find((c) => c.id === action.choiceId)
      if (!choice) return { ok: false, reason: 'Choice option not found.' }
      return { ok: true }
    }

    case 'choose_email': {
      const email = state.emails.find((e) => e.id === action.emailId)
      if (!email) return { ok: false, reason: 'Email not found.' }
      const choice = email.choices.find((c) => c.id === action.choiceId)
      if (!choice) return { ok: false, reason: 'Choice option not found.' }
      return { ok: true }
    }

    case 'trigger_event': {
      const def = EVENT_DEFINITIONS[action.eventId]
      if (!def) return { ok: false, reason: 'Event definition not found.' }
      return { ok: true }
    }

    case 'nudge': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found.' }
      return { ok: true }
    }

    // --- V2 Action Validation ---
    case 'set_player_role':
    case 'avatar_move':
    case 'avatar_interact':
    case 'set_camera_mode':
    case 'office_break':
      return { ok: true }

    case 'pick_ticket': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId)
      if (!ticket) return { ok: false, reason: 'Ticket not found.' }
      if (ticket.state === 'done') return { ok: false, reason: 'Ticket is already completed.' }
      return { ok: true }
    }

    case 'create_branch': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId)
      if (!ticket) return { ok: false, reason: 'Ticket not found.' }
      return { ok: true }
    }

    case 'commit_work': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)
      if (!branch) return { ok: false, reason: 'Branch not found in repository.' }
      return { ok: true }
    }

    case 'open_pr': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)
      if (!branch) return { ok: false, reason: 'Branch not found in repository.' }
      return { ok: true }
    }

    case 'review_pr': {
      const pr = state.prs.find((p) => p.id === action.prId)
      if (!pr) return { ok: false, reason: 'Pull Request not found.' }
      return { ok: true }
    }

    case 'resolve_conflict': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)
      if (!branch) return { ok: false, reason: 'Branch not found.' }
      return { ok: true }
    }

    case 'merge_pr': {
      const pr = state.prs.find((p) => p.id === action.prId)
      if (!pr) return { ok: false, reason: 'Pull Request not found.' }
      if (pr.state === 'merged') return { ok: false, reason: 'Pull Request already merged.' }
      return { ok: true }
    }

    case 'run_pipeline':
      return { ok: true }

    case 'fix_pipeline_failure': {
      if (!state.pipeline.activeFailure) {
        return { ok: false, reason: 'No active pipeline failure requires fixing.' }
      }
      return { ok: true }
    }

    case 'deploy': {
      const cfg = STRATEGY_CONFIGS[action.strategy]
      if (cfg && cfg.cost > 0 && state.cash < cfg.cost) {
        return { ok: false, reason: `Insufficient cash for ${cfg.name} ($${cfg.cost} required).` }
      }
      return { ok: true }
    }

    case 'rollback':
      return { ok: true }

    case 'scale_infra':
      return { ok: true }

    case 'rent_gpu': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId)
      if (!ticket) return { ok: false, reason: 'Target ticket not found.' }
      return { ok: true }
    }

    case 'cancel_gpu_job': {
      const job = state.gpuJobs.find((j) => j.id === action.jobId)
      if (!job) return { ok: false, reason: 'GPU Job not found.' }
      return { ok: true }
    }

    case 'handle_suggestion': {
      const sug = state.suggestions.find((s) => s.id === action.suggestionId)
      if (!sug) return { ok: false, reason: 'Suggestion not found.' }
      return { ok: true }
    }

    case 'post_social':
    case 'reply_social':
    case 'pitch_investors':
      return { ok: true }

    case 'upgrade_company_stage': {
      const check = checkStageProgression(state)
      if (!check.eligible) return { ok: false, reason: check.message }
      return { ok: true }
    }

    case 'study_docs':
    case 'ship_side_project':
    case 'code_sprint_result':
    case 'recruit_cofounder':
    case 'crunch_hackathon':
    case 'pitch_hackathon_result':
    case 'split_founder_equity':
    case 'sign_term_sheet_offer':
    case 'place_furniture':
    case 'advance_chapter':
    case 'conclude_pitch':
    case 'adjust_salary':
    case 'create_project':
    case 'adjust_dept_budget':
    case 'investigate_incident':
    case 'reply_email_custom':
    case 'toggle_email_flag':
    case 'complete_campaign_scene':
      return { ok: true }

    case 'employee_conversation': {
      const emp = state.employees[action.employeeId]
      if (!emp || !emp.active) return { ok: false, reason: 'Employee not found or inactive.' }
      if (action.cost && action.cost > 0 && state.cash < action.cost) {
        return { ok: false, reason: `Insufficient treasury funds ($${action.cost} required).` }
      }
      return { ok: true }
    }

    case 'boost_project': {
      const proj = state.projects.find((p) => p.id === action.projectId)
      if (!proj || proj.status !== 'active') return { ok: false, reason: 'Active project not found.' }
      if (state.cash < action.cost) {
        return { ok: false, reason: `Insufficient cash to boost project ($${action.cost} required).` }
      }
      return { ok: true }
    }

    case 'treasury_action': {
      if (action.subtype === 'repay_loan') {
        const loan = Number(state.flags.loanBalance || 0)
        if (loan <= 0) return { ok: false, reason: 'No active corporate loan to repay.' }
        if (state.cash < loan) return { ok: false, reason: `Insufficient cash to repay $${loan.toLocaleString()} loan.` }
      }
      if (action.subtype === 'prepare_financials' && state.cash < 500) {
        return { ok: false, reason: 'Requires $500 for external audit preparation.' }
      }
      return { ok: true }
    }
  }
}

export function applyAction(
  state: CompanyState,
  action: PlayerAction,
  rng: SeededRandom,
): ActionResult {
  const check = validateAction(state, action)
  if (!check.ok) return check

  switch (action.type) {
    case 'hire': {
      const cost = HIRING_COST[action.role] ?? 1000
      state.cash -= cost

      const newId = nextId(state, 'emp')
      const name =
        action.name ||
        `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`

      const archetypes = Object.keys(BOUNDS) // dummy reference
      const archetypePool: (keyof typeof import('../engine/archetypes').ARCHETYPES)[] = [
        'silent_genius',
        'bootlicker',
        'meeting_addict',
        'linkedin_speaker',
        'procrastinator',
        'gossip',
        'kpi_manipulator',
        'burnout_veteran',
        'unnecessary_manager',
        'ai_evangelist',
      ]
      const chosenArchetype = rng.pick(archetypePool)

      const deskIndex = findFreeDesk(state)
      const seat = deskSeat(deskIndex)

      const newEmployee: Employee = {
        id: newId,
        name,
        role: action.role,
        department: action.department,
        archetype: chosenArchetype,
        bio: `Recently onboarded into ${action.department}. Full of nervous corporate optimism.`,
        visual: {
          skin: rng.pick(['#f2d3b3', '#e8b98a', '#caa27e', '#8c593b', '#5c3826']),
          hair: rng.pick(['#20242c', '#4a3319', '#7c4a21', '#c9a24b', '#a83232']),
          outfit: rng.pick(['#3a3f4b', '#4f6df0', '#2f6b4f', '#6c3b8c', '#a35025']),
          outfitAccent: '#ffffff',
          hairStyle: rng.pick(['short', 'bun', 'long', 'bald', 'ponytail', 'spiky']),
          accessory: rng.pick(['none', 'glasses', 'tie', 'headphones', 'badge']),
        },
        skills: {
          focus: rng.int(4, 8),
          communication: rng.int(4, 8),
          technical: rng.int(4, 8),
          creativity: rng.int(4, 8),
          leadership: rng.int(3, 7),
        },
        morale: 75,
        stress: 20,
        energy: 90,
        ambition: rng.int(40, 85),
        trust: 70,
        productivity: 60,
        salary: Math.round(ROLE_SALARY[action.role] * (1 + rng.range(-0.1, 0.1))),
        hiredDay: state.day,
        active: true,
        action: 'work',
        actionTicksLeft: 10,
        actionStartedTick: state.tick,
        nextDecisionTick: state.tick + 10,
        location: 'open_plan',
        position: { ...seat },
        facing: 0,
        pathIndex: 0,
        homeDesk: deskIndex,
        relationships: {},
        memories: [{ day: state.day, text: `Hired as ${action.role} in ${action.department}.` }],
        goals: [
          {
            id: 'goal_1',
            description: 'Survive first 30 days without crying',
            type: 'survival',
            target: 30,
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

      state.employees[newId] = newEmployee
      state.employeeOrder.push(newId)

      return {
        ok: true,
        message: `Hired ${name} as ${action.role} in ${action.department}.`,
        effects: [`Recruitment cost: -$${cost}`, `Headcount: ${state.employeeOrder.length}`],
      }
    }

    case 'fire': {
      const emp = state.employees[action.employeeId]
      const severance = emp.salary * 5
      state.cash -= severance
      emp.active = false
      emp.quitDay = state.day
      emp.quitReason = 'Terminated by executive order'

      // Morale hit across peers
      for (const other of Object.values(state.employees)) {
        if (!other.active) continue
        other.morale = clamp(other.morale - 8, 0, 100)
        other.trust = clamp(other.trust - 12, 0, 100)
        other.stress = clamp(other.stress + 10, 0, 100)
      }

      return {
        ok: true,
        message: `${emp.name} was let go with $${severance} severance.`,
        effects: [`Severance: -$${severance}`, 'Peers: -8 morale, -12 trust, +10 stress'],
      }
    }

    case 'promote': {
      const emp = state.employees[action.employeeId]
      const nextRole: Record<Role, Role> = {
        intern: 'junior',
        junior: 'specialist',
        specialist: 'senior',
        senior: 'manager',
        manager: 'manager',
        ceo: 'ceo',
      }
      const oldRole = emp.role
      emp.role = nextRole[oldRole]
      emp.salary = Math.round(ROLE_SALARY[emp.role] * 1.1)
      emp.morale = clamp(emp.morale + 25, 0, 100)
      emp.trust = clamp(emp.trust + 20, 0, 100)
      emp.skills.leadership = clamp(emp.skills.leadership + 1, 1, 10)
      setReaction(emp, 'celebratory', 8)
      addMemory(state, emp.id, `Promoted from ${oldRole} to ${emp.role}!`)

      // Check peer jealousy
      const peers = Object.values(state.employees)
      const jealous = onPromotion(emp, peers)

      return {
        ok: true,
        message: `Promoted ${emp.name} to ${emp.role}.`,
        effects: [
          `New salary: $${emp.salary}/day`,
          '+25 morale, +20 trust',
          jealous ? 'High-ambition peers are secretly grumbling' : 'Team congratulated them',
        ],
      }
    }

    case 'reprimand': {
      const emp = state.employees[action.employeeId]
      emp.morale = clamp(emp.morale - 18, 0, 100)
      emp.stress = clamp(emp.stress + 20, 0, 100)
      emp.trust = clamp(emp.trust - 15, 0, 100)
      setReaction(emp, 'frustrated', 6)
      addMemory(state, emp.id, 'Received formal reprimand from CEO.')

      return {
        ok: true,
        message: `Formally reprimanded ${emp.name}.`,
        effects: ['-18 morale, +20 stress, -15 trust'],
      }
    }

    case 'bonus': {
      const emp = state.employees[action.employeeId]
      const cost = Math.round(emp.salary * 3)
      state.cash -= cost
      emp.morale = clamp(emp.morale + 30, 0, 100)
      emp.energy = clamp(emp.energy + 20, 0, 100)
      emp.trust = clamp(emp.trust + 15, 0, 100)
      setReaction(emp, 'celebratory', 6)
      addMemory(state, emp.id, `Received $${cost} spot bonus!`)

      return {
        ok: true,
        message: `Awarded $${cost} bonus to ${emp.name}.`,
        effects: [`Cash: -$${cost}`, '+30 morale, +20 energy, +15 trust'],
      }
    }

    case 'bonus_all': {
      const activeEmps = Object.values(state.employees).filter((e) => e.active)
      const costPer = 600
      const totalCost = activeEmps.length * costPer
      state.cash -= totalCost

      for (const emp of activeEmps) {
        emp.morale = clamp(emp.morale + 20, 0, 100)
        emp.trust = clamp(emp.trust + 10, 0, 100)
        setReaction(emp, 'celebratory', 5)
      }

      return {
        ok: true,
        message: `Company-wide bonus distributed to all ${activeEmps.length} employees.`,
        effects: [`Cash: -$${totalCost}`, '+20 company-wide morale, +10 trust'],
      }
    }

    case 'training': {
      const emp = state.employees[action.employeeId]
      state.cash -= 750
      emp.trainingDaysLeft = 3
      emp.morale = clamp(emp.morale + 8, 0, 100)
      addMemory(state, emp.id, 'Enrolled in 3-day executive coaching & skills workshop.')

      return {
        ok: true,
        message: `Enrolled ${emp.name} in 3-day training.`,
        effects: ['Cost: -$750', 'Skills will level up across the next 3 days'],
      }
    }

    case 'schedule_meeting': {
      const meetingId = nextId(state, 'mtg')
      const startTick = action.startTick ?? Math.min(state.tick + 2, 30)
      state.meetings.push({
        id: meetingId,
        title: action.title,
        roomId: action.roomId,
        startTick,
        durationTicks: action.durationTicks,
        attendeeIds: action.attendeeIds,
        recurring: action.recurring ?? 'none',
        topic: action.title,
        createdBy: 'CEO',
        timesHeld: 0,
        active: false,
      })

      return {
        ok: true,
        message: `Scheduled meeting "${action.title}" at tick ${startTick}.`,
        effects: [`${action.attendeeIds.length} attendees locked in`],
      }
    }

    case 'cancel_meeting': {
      const idx = state.meetings.findIndex((m) => m.id === action.meetingId)
      if (idx !== -1) {
        const title = state.meetings[idx].title
        state.meetings.splice(idx, 1)
        return {
          ok: true,
          message: `Cancelled meeting "${title}". Attendees freed!`,
          effects: ['+morale for silent geniuses and engineers'],
        }
      }
      return { ok: false, reason: 'Meeting not found.' }
    }

    case 'launch_product': {
      state.cash -= 5000
      state.product = {
        name: action.name,
        launchedDay: state.day,
        hype: 85,
        quality: 70,
        revenueToDate: 0,
      }
      state.reputation = clamp(state.reputation + 10, 0, 100)
      state.investorConfidence = clamp(state.investorConfidence + 12, 0, 100)

      return {
        ok: true,
        message: `Launched new product "${action.name}" to global acclaim!`,
        effects: ['Launch cost: -$5,000', '+10 reputation, +12 investor confidence'],
      }
    }

    case 'set_policy': {
      state.policies[action.policy] = action.value
      return {
        ok: true,
        message: `Policy "${action.policy}" set to ${action.value ? 'Active' : 'Disabled'}.`,
        effects: [`Policy updated for Day ${state.day}`],
      }
    }

    case 'respond_incident': {
      const inc = state.incidents.find((i) => i.id === action.incidentId)!
      const resp = inc.responses.find((r) => r.id === action.responseId)!

      if (resp.cost > 0) state.cash -= resp.cost
      inc.resolved = true
      inc.dayResolved = state.day

      const logLines: string[] = [resp.effects.narrative]

      if (resp.effects.cashDelta) state.cash += resp.effects.cashDelta
      if (resp.effects.reputationDelta) {
        state.reputation = clamp(state.reputation + resp.effects.reputationDelta, 0, 100)
      }
      if (resp.effects.fixEquipment) {
        state.equipment[resp.effects.fixEquipment] = false
      }
      if (resp.effects.moraleDeltaAll) {
        for (const emp of Object.values(state.employees)) {
          if (!emp.active) continue
          emp.morale = clamp(emp.morale + resp.effects.moraleDeltaAll, 0, 100)
        }
      }

      return {
        ok: true,
        message: `Resolved incident "${inc.title}".`,
        effects: logLines,
      }
    }

    case 'decide': {
      const decIdx = state.decisions.findIndex((d) => d.id === action.decisionId)
      if (decIdx === -1) return { ok: false, reason: 'Decision not found.' }
      const dec = state.decisions[decIdx]
      const choice = dec.choices.find((c) => c.id === action.choiceId)!

      const effectLogs: string[] = []
      applyEffectSpec(state, choice.effects, [], effectLogs)

      // Remove resolved decision
      state.decisions.splice(decIdx, 1)

      return {
        ok: true,
        message: `Executed decision: ${choice.label}`,
        effects: effectLogs,
      }
    }

    case 'choose_email': {
      const emailIdx = state.emails.findIndex((e) => e.id === action.emailId)
      if (emailIdx === -1) return { ok: false, reason: 'Email not found.' }
      const email = state.emails[emailIdx]
      const choice = email.choices.find((c) => c.id === action.choiceId)!

      const effectLogs: string[] = []
      applyEffectSpec(state, choice.effects, email.participantIds, effectLogs)
      email.read = true

      return {
        ok: true,
        message: `Replied: ${choice.label}`,
        effects: effectLogs,
      }
    }

    case 'trigger_event': {
      const def = EVENT_DEFINITIONS[action.eventId]
      if (!def) return { ok: false, reason: 'Event not found.' }
      const record = executeEvent(state, def, rng)
      return {
        ok: true,
        message: `Triggered event: ${record.title}`,
        effects: record.effects,
      }
    }

    case 'nudge': {
      const emp = state.employees[action.employeeId]
      emp.energy = clamp(emp.energy + 10, 0, 100)
      emp.actionTicksLeft = 1
      setReaction(emp, 'confused', 3)
      return {
        ok: true,
        message: `Gave ${emp.name} a managerial nudge to refocus.`,
        effects: ['Action reset, +10 energy'],
      }
    }

    // --- V2 Action Execution Handlers ---
    case 'set_player_role': {
      state.playerRole = action.role
      if (state.playerAvatar) {
        state.playerAvatar.role = action.role
      }
      return {
        ok: true,
        message: `Switched player role to ${action.role.toUpperCase()}.`,
        effects: [`Active Role: ${action.role}`],
      }
    }

    case 'avatar_move': {
      if (state.playerAvatar) {
        state.playerAvatar.position = action.position
        state.playerAvatar.facing = action.facing
        const nearby = checkProximityInteractable(action.position)
        state.playerAvatar.currentInteractable = nearby ? nearby.id : null
      }
      return { ok: true }
    }

    case 'avatar_interact': {
      if (state.playerAvatar) {
        state.playerAvatar.currentInteractable = action.targetId
      }
      return {
        ok: true,
        message: `Interacting with ${action.targetId}.`,
      }
    }

    case 'set_camera_mode': {
      if (state.playerAvatar) {
        state.playerAvatar.cameraMode = action.mode
      }
      return {
        ok: true,
        message: `Camera mode set to ${action.mode}.`,
      }
    }

    case 'pick_ticket': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId)
      if (!ticket) return { ok: false, reason: 'Ticket not found.' }
      ticket.state = 'doing'
      ticket.assigneeId = action.assigneeId || state.playerAvatar?.name || 'Player'
      if (state.playerAvatar) {
        state.playerAvatar.currentTicketId = ticket.id
      }
      return {
        ok: true,
        message: `Picked up ticket "${ticket.title}". State moved to In-Progress.`,
        effects: ['Ticket: Doing', `Assignee: ${ticket.assigneeId}`],
      }
    }

    case 'create_branch': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId)!
      const author = state.playerAvatar?.name || 'Alex Vance'
      const branch = createBranch(state.repo, ticket, author)
      if (state.playerAvatar) {
        state.playerAvatar.currentBranch = branch.name
      }
      return {
        ok: true,
        message: `Created Git branch "${branch.name}" for ticket "${ticket.title}".`,
        effects: [`Branch: ${branch.name}`],
      }
    }

    case 'commit_work': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)!
      addCommit(state.repo, branch.name)
      // Advance associated ticket progress
      const ticket = state.tickets.find((t) => t.id === branch.ticketId)
      if (ticket) {
        ticket.progress = clamp((ticket.progress || 0) + 30, 0, 100)
        if (ticket.progress >= 100) {
          ticket.state = 'review'
        }
      }
      return {
        ok: true,
        message: `Committed work to ${branch.name} (Total Commits: ${branch.commits}).`,
        effects: [`Commit #${branch.commits}`, `Ticket progress: ${ticket?.progress ?? 30}%`],
      }
    }

    case 'open_pr': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)!
      const ticket = state.tickets.find((t) => t.id === branch.ticketId)
      checkForMergeConflicts(state.repo, branch, rng)

      // Select teammate reviewer
      const otherEmps = state.employeeOrder.filter((id) => state.employees[id]?.active)
      const reviewerId = otherEmps[rng.integer(0, otherEmps.length - 1)] || 'emp_gary'
      const reviewer = state.employees[reviewerId]

      const prQuality = clamp(Math.round(state.codeQuality + rng.integer(-10, 15)), 30, 100)
      const feedback = reviewer ? generateReviewerFeedback(reviewer, prQuality, rng) : { approved: true, text: 'LGTM!' }

      const prId = `pr_${state.nextUid++}`
      state.prs.unshift({
        id: prId,
        branch: branch.name,
        title: ticket ? `feat: ${ticket.title}` : `feat on ${branch.name}`,
        authorId: branch.authorId,
        reviewerId,
        size: action.size || 250,
        quality: prQuality,
        state: feedback.approved ? 'approved' : 'changes_requested',
        comments: reviewer
          ? [
              {
                author: `${reviewer.name} (${reviewer.role})`,
                text: feedback.text,
                day: state.day,
              },
            ]
          : [],
      })

      if (ticket) {
        ticket.state = 'review'
      }

      return {
        ok: true,
        message: `Opened Pull Request #${prId.replace('pr_', '')} for branch ${branch.name}! Assigned reviewer: ${reviewer?.name || 'Teammate'}.`,
        effects: [
          `Reviewer: ${reviewer?.name || 'Teammate'}`,
          `Status: ${feedback.approved ? 'Approved' : 'Changes Requested'}`,
          branch.conflicts > 0 ? `⚠️ ${branch.conflicts} Merge Conflicts Detected!` : 'Clean Merge Tree',
        ],
      }
    }

    case 'review_pr': {
      const pr = state.prs.find((p) => p.id === action.prId)!
      pr.state = action.approve ? 'approved' : 'changes_requested'
      if (action.feedback) {
        pr.comments = pr.comments || []
        pr.comments.push({
          author: state.playerAvatar?.name || 'Reviewer',
          text: action.feedback,
          day: state.day,
        })
      }
      return {
        ok: true,
        message: `PR #${pr.id.replace('pr_', '')} review updated: ${action.approve ? 'Approved' : 'Changes Requested'}.`,
        effects: [action.approve ? 'Ready to Merge' : 'Changes Requested'],
      }
    }

    case 'resolve_conflict': {
      const branch = state.repo.branches.find((b) => b.name === action.branchName)!
      branch.conflicts = 0
      state.techDebt = clamp(state.techDebt + (action.strategy === 'manual' ? -2 : 2), 0, 100)
      state.repo.techDebt = state.techDebt
      return {
        ok: true,
        message: `Resolved merge conflicts on branch ${branch.name} via ${action.strategy.toUpperCase()}.`,
        effects: ['Conflicts: 0', action.strategy === 'manual' ? 'Tech Debt -2' : 'Tech Debt +2'],
      }
    }

    case 'merge_pr': {
      const mergeRes = mergePullRequest(state, action.prId)
      if (!mergeRes.ok) return mergeRes
      return {
        ok: true,
        message: `Merged PR #${action.prId.replace('pr_', '')} into main! Triggering CI/CD verification pipeline.`,
        effects: ['Merged into main', 'Branch closed', 'Ticket moved to QA'],
      }
    }

    case 'run_pipeline': {
      startPipelineRun(state)
      return {
        ok: true,
        message: 'Triggered CI/CD deployment pipeline execution.',
        effects: ['Pipeline: Running'],
      }
    }

    case 'fix_pipeline_failure': {
      return applyPipelineFix(state, action.failureId, action.optionId, rng)
    }

    case 'deploy': {
      return executeDeployment(state, action.environment, action.strategy, rng)
    }

    case 'rollback': {
      return executeRollback(state)
    }

    case 'scale_infra': {
      return scaleInfraSettings(state, action)
    }

    case 'rent_gpu': {
      return rentGpuCluster(state, action)
    }

    case 'cancel_gpu_job': {
      return cancelGpuJob(state, action.jobId)
    }

    case 'handle_suggestion': {
      return handleSuggestionDecision(state, action.suggestionId, action.decision)
    }

    case 'office_break': {
      return executeOfficeBreak(state, action.activity, action.targetEmployeeId, rng)
    }

    case 'post_social': {
      return publishSocialPost(state, action, rng)
    }

    case 'reply_social': {
      return replyToComment(state, action.postId, action.commentId, action.responseKind, rng)
    }

    case 'pitch_investors': {
      const leadershipSkill = state.employees['emp_deborah']?.skills.leadership || 7
      const result = resolvePitchDeckMiniGame(leadershipSkill, action.pitchDeckQuality, rng, false)
      state.cash += result.cashRaised
      state.investorConfidence = clamp(state.investorConfidence + 15, 0, 100)
      return {
        ok: true,
        message: result.summary,
        effects: [
          `+$${result.cashRaised.toLocaleString()} Cash`,
          `Valuation: ${result.valuationMultiplier}x`,
          'Investor Confidence +15',
        ],
      }
    }

    case 'upgrade_company_stage': {
      return upgradeStage(state)
    }

    case 'study_docs': {
      if (state.career) {
        state.career.learningLevel = Math.min(100, state.career.learningLevel + 12)
        state.career.sleepDebt = Math.min(100, state.career.sleepDebt + 8)
      }
      return { ok: true, message: 'Studied modern documentation & tech stacks (+12 Tech Skill)' }
    }

    case 'ship_side_project': {
      if (state.career) {
        state.career.sideProjectsShipped += 1
        const starsGained = rng.integer(60, 140)
        state.career.githubStars += starsGained
        return {
          ok: true,
          message: `Shipped side project to GitHub! Earned +${starsGained} stars!`,
          effects: [`+${starsGained} GitHub Stars`, '+1 Project Shipped'],
        }
      }
      return { ok: true }
    }

    case 'code_sprint_result': {
      if (state.career) {
        state.career.githubStars += action.score
        state.career.learningLevel = Math.min(100, state.career.learningLevel + 5)
      }
      return {
        ok: true,
        message: `Code Sprint Complete! Squashed ${action.bugsSquashed} bugs (+${action.score} Stars)`,
      }
    }

    case 'recruit_cofounder': {
      if (state.career) {
        const candidate = state.career.recruitedCoFounders.find((c) => c.id === action.candidateId)
        if (!candidate) {
          state.career.recruitedCoFounders.push({
            id: action.candidateId,
            name: action.candidateId.includes('yuki') ? 'Yuki Tanaka' : 'Gary Sparks',
            role: action.candidateId.includes('yuki') ? 'CTO (Silent Genius)' : 'CRO (Hustler)',
            archetype: 'co_founder',
            bio: 'Joined your hackathon squad to conquer tech.',
            skills: { tech: 9, hustle: 7, design: 8 },
            demandedEquityPct: 30,
            avatarImg: '/reference/char_graphic_tee.jpg',
            satisfaction: 85,
          })
        }
      }
      return { ok: true, message: 'Recruited co-founder to your hackathon squad!' }
    }

    case 'crunch_hackathon': {
      if (state.career) {
        state.career.prototypeCompleteness = Math.min(100, state.career.prototypeCompleteness + action.hours * 4)
        state.career.hackathonHoursLeft = Math.max(0, state.career.hackathonHoursLeft - action.hours)
      }
      return { ok: true, message: `Crunched prototype for ${action.hours} hours!` }
    }

    case 'pitch_hackathon_result': {
      if (state.career) {
        state.career.wonHackathon = action.won
        state.career.hackathonRank = action.rank
        if (action.won) {
          state.cash += action.prizeCash
          return {
            ok: true,
            message: `GRAND PRIZE WINNER! You won 1st Place and received a $${action.prizeCash.toLocaleString()} Angel Check!`,
            effects: [`+$${action.prizeCash.toLocaleString()} Cash`, 'Hackathon Champion Trophy'],
          }
        }
      }
      return { ok: true, message: 'Hackathon pitch complete.' }
    }

    case 'split_founder_equity': {
      if (state.career) {
        state.career.coFounders = action.coFounders
        state.career.founderEquityPct = action.founderEquityPct
      }
      return { ok: true, message: `Finalized founding equity split (${action.founderEquityPct}% CEO stake).` }
    }

    case 'sign_term_sheet_offer': {
      if (state.career) {
        state.career.selectedTermSheetId = action.offerId
        const offer = state.career.termSheetOffers.find((o) => o.id === action.offerId)
        if (offer) {
          state.cash += offer.investmentAmount
          state.investorConfidence = Math.min(100, state.investorConfidence + 30)
          return {
            ok: true,
            message: `Term Sheet Signed with ${offer.firmName}! +$${offer.investmentAmount.toLocaleString()} deposited!`,
            effects: [`+$${offer.investmentAmount.toLocaleString()} Seed Capital`, `${offer.equityPct}% Equity Dilution`],
          }
        }
      }
      return { ok: true }
    }

    case 'place_furniture': {
      if (state.career) {
        state.career.placedFurnitureCount += 1
      }
      return { ok: true, message: 'Placed new furniture in the office builder!' }
    }

    case 'advance_chapter': {
      const advanced = advanceCareerChapter(state, action.targetChapter)
      if (advanced) {
        return {
          ok: true,
          message: `Advanced to Chapter: ${action.targetChapter.toUpperCase()}!`,
          effects: ['New Setting Unlocked', 'New Objectives Active'],
        }
      }
      return { ok: false, reason: 'Complete all chapter objectives first!' }
    }

    case 'conclude_pitch': {
      state.cash += action.cashRaised
      if (action.valuation > 0) {
        state.growth.valuation = action.valuation
      }
      state.investorConfidence = clamp(
        state.investorConfidence + action.confidenceDelta,
        ...BOUNDS.investorConfidence,
      )
      state.flags.lastPitchOutcome = action.outcome
      state.flags.lastPitchInvestor = action.investorName
      state.flags.totalEquityDiluted =
        Number(state.flags.totalEquityDiluted || 0) + action.equityDiluted
      state.flags.totalCapitalRaised =
        Number(state.flags.totalCapitalRaised || 0) + action.cashRaised

      state.eventLog.push({
        uid: nextId(state, 'evt'),
        defId: 'investor_pitch',
        title:
          action.outcome === 'full'
            ? `Funded by ${action.investorName} (+$${action.cashRaised.toLocaleString()})`
            : action.outcome === 'partial'
              ? `Bridge Round Closed with ${action.investorName} (+$${action.cashRaised.toLocaleString()})`
              : `Pitch Rejected by ${action.investorName}`,
        description:
          action.cashRaised > 0
            ? `Raised $${action.cashRaised.toLocaleString()} at $${(action.valuation / 1_000_000).toFixed(1)}M valuation (${action.equityDiluted}% equity).`
            : `Partners passed on the round. Improve metrics or refine the pitch deck.`,
        category: 'finance',
        severity: action.outcome === 'rejected' ? 3 : 1,
        day: state.day,
        tick: state.tick,
        participantIds: [],
        effects: [
          action.cashRaised > 0 ? `+$${action.cashRaised.toLocaleString()} Treasury` : '$0 Raised',
          `${action.confidenceDelta >= 0 ? '+' : ''}${action.confidenceDelta} Investor Confidence`,
        ],
      })

      return {
        ok: true,
        message:
          action.cashRaised > 0
            ? `Closed $${action.cashRaised.toLocaleString()} investment from ${action.investorName}!`
            : `Pitch concluded without funding.`,
        effects: [
          action.cashRaised > 0 ? `+$${action.cashRaised.toLocaleString()} Cash` : 'No dilution',
          `Investor Confidence: ${state.investorConfidence}%`,
        ],
      }
    }

    case 'employee_conversation': {
      const emp = state.employees[action.employeeId]
      if (action.cost && action.cost > 0) {
        state.cash -= action.cost
      }
      emp.morale = clamp(emp.morale + action.moraleDelta, 0, 100)
      emp.stress = clamp(emp.stress + action.stressDelta, 0, 100)
      emp.trust = clamp(emp.trust + action.trustDelta, 0, 100)
      emp.productivity = clamp(emp.productivity + action.productivityDelta, 0, 100)
      addMemory(state, emp.id, action.memoryText)
      setReaction(emp, action.moraleDelta >= 0 ? 'happy' : 'frustrated', 6)

      return {
        ok: true,
        message: `1:1 with ${emp.name}: "${action.choiceLabel}"`,
        effects: [
          `${action.moraleDelta >= 0 ? '+' : ''}${action.moraleDelta} Morale`,
          `${action.trustDelta >= 0 ? '+' : ''}${action.trustDelta} Trust`,
          `${action.productivityDelta >= 0 ? '+' : ''}${action.productivityDelta} Productivity`,
        ],
      }
    }

    case 'adjust_salary': {
      const emp = state.employees[action.employeeId]
      const oldSalary = emp.salary
      const newSalary = clamp(Math.round(action.newSalary), 80, 1800)
      const diff = newSalary - oldSalary
      emp.salary = newSalary
      if (diff > 0) {
        const boost = Math.min(25, Math.max(4, Math.round(diff / 15)))
        emp.morale = clamp(emp.morale + boost, 0, 100)
        emp.trust = clamp(emp.trust + Math.round(boost * 0.8), 0, 100)
        emp.stress = clamp(emp.stress - 5, 0, 100)
        setReaction(emp, 'celebratory', 6)
        addMemory(state, emp.id, `Received salary raise from $${oldSalary}/day to $${newSalary}/day.`)
      } else if (diff < 0) {
        const hit = Math.min(35, Math.max(6, Math.round(Math.abs(diff) / 10)))
        emp.morale = clamp(emp.morale - hit, 0, 100)
        emp.trust = clamp(emp.trust - hit, 0, 100)
        emp.stress = clamp(emp.stress + 12, 0, 100)
        setReaction(emp, 'angry', 6)
        addMemory(state, emp.id, `Salary cut from $${oldSalary}/day to $${newSalary}/day.`)
      }
      return {
        ok: true,
        message: `Updated ${emp.name}'s salary to $${newSalary}/day.`,
        effects: [`Previous: $${oldSalary}/day`, `New: $${newSalary}/day`],
      }
    }

    case 'create_project': {
      const projId = nextId(state, 'proj')
      state.projects.push({
        id: projId,
        name: action.name,
        department: action.department,
        clientName: action.clientName,
        pointsDone: 0,
        pointsTotal: action.pointsTotal,
        quality: 75,
        deadlineDay: action.deadlineDay,
        revenueOnDone: action.revenueOnDone,
        penaltyOnFail: Math.round(action.revenueOnDone * 0.3),
        status: 'active',
        alignmentBuffTicksLeft: 6,
      })
      return {
        ok: true,
        message: `Launched new ${action.department} project: "${action.name}"`,
        effects: [`Reward: +$${action.revenueOnDone.toLocaleString()}`, `Deadline: Day ${action.deadlineDay}`],
      }
    }

    case 'boost_project': {
      const proj = state.projects.find((p) => p.id === action.projectId)!
      state.cash -= action.cost
      proj.pointsDone = Math.min(proj.pointsTotal, proj.pointsDone + action.pointsGain)
      proj.alignmentBuffTicksLeft = Math.max(proj.alignmentBuffTicksLeft, 8)
      if (proj.pointsDone >= proj.pointsTotal) {
        proj.status = 'completed'
        state.cash += proj.revenueOnDone
        state.todayRevenueExtra += proj.revenueOnDone
        state.reputation = clamp(state.reputation + 6, 0, 100)
        state.investorConfidence = clamp(state.investorConfidence + 5, 0, 100)
        return {
          ok: true,
          message: `Completed "${proj.name}"! Collected +$${proj.revenueOnDone.toLocaleString()} milestone payout!`,
          effects: [`+$${proj.revenueOnDone.toLocaleString()} Revenue`, '+6 Reputation'],
        }
      }
      return {
        ok: true,
        message: `Accelerated "${proj.name}" (+${action.pointsGain} pts).`,
        effects: [`Cost: -$${action.cost}`, `Progress: ${Math.round(proj.pointsDone)}/${proj.pointsTotal}`],
      }
    }

    case 'adjust_dept_budget': {
      state.flags[`budget_${action.department}`] = action.budgetPerDay
      const deptEmps = Object.values(state.employees).filter(
        (e) => e.active && e.department === action.department,
      )
      for (const emp of deptEmps) {
        if (action.budgetPerDay >= 1000) {
          emp.morale = clamp(emp.morale + 5, 0, 100)
          emp.productivity = clamp(emp.productivity + 4, 0, 100)
        } else if (action.budgetPerDay < 400) {
          emp.morale = clamp(emp.morale - 4, 0, 100)
        }
      }
      return {
        ok: true,
        message: `Set ${action.department.toUpperCase()} operating budget to $${action.budgetPerDay.toLocaleString()}/day.`,
        effects: [`${deptEmps.length} team members updated`],
      }
    }

    case 'treasury_action': {
      switch (action.subtype) {
        case 'take_loan': {
          const amount = action.amount || 25000
          state.cash += amount
          state.flags.loanBalance = Number(state.flags.loanBalance || 0) + Math.round(amount * 1.08)
          state.investorConfidence = clamp(state.investorConfidence - 4, 0, 100)
          return {
            ok: true,
            message: `Drew $${amount.toLocaleString()} Venture Credit Facility (8% interest).`,
            effects: [`+$${amount.toLocaleString()} Treasury`, '-4 Investor Confidence'],
          }
        }
        case 'repay_loan': {
          const loan = Number(state.flags.loanBalance || 0)
          state.cash -= loan
          state.flags.loanBalance = 0
          state.investorConfidence = clamp(state.investorConfidence + 10, 0, 100)
          state.reputation = clamp(state.reputation + 5, 0, 100)
          return {
            ok: true,
            message: `Repaid $${loan.toLocaleString()} Venture Credit Facility in full!`,
            effects: [`-$${loan.toLocaleString()} Cash`, '+10 Investor Confidence'],
          }
        }
        case 'cut_costs': {
          state.todayCostsExtra -= 600
          state.flags.costCutCount = Number(state.flags.costCutCount || 0) + 1
          for (const emp of Object.values(state.employees)) {
            if (!emp.active) continue
            emp.morale = clamp(emp.morale - 6, 0, 100)
            emp.stress = clamp(emp.stress + 5, 0, 100)
          }
          return {
            ok: true,
            message: 'Executed vendor & SaaS license consolidation (-$600 burn today).',
            effects: ['+$600 Net Savings', '-6 Team Morale'],
          }
        }
        case 'increase_pricing': {
          const bump = Math.round(state.baseRetainer * 0.12)
          state.baseRetainer += bump
          state.customerSatisfaction = clamp(state.customerSatisfaction - 5, 0, 100)
          state.investorConfidence = clamp(state.investorConfidence + 4, 0, 100)
          return {
            ok: true,
            message: `Increased enterprise subscription tiers (+$${bump}/day recurring retainer).`,
            effects: [`+$${bump}/day Base Retainer`, '-5 Customer Satisfaction'],
          }
        }
        case 'emergency_fundraise': {
          const bridge = 12000
          state.cash += bridge
          state.flags.totalEquityDiluted = Number(state.flags.totalEquityDiluted || 0) + 6
          state.investorConfidence = clamp(state.investorConfidence - 6, 0, 100)
          return {
            ok: true,
            message: `Closed $12,000 Emergency SAFE Bridge Note (6% dilution).`,
            effects: ['+$12,000 Cash', '6% Equity Dilution'],
          }
        }
        case 'prepare_financials': {
          state.cash -= 500
          state.auditRisk = clamp(state.auditRisk - 15, 0, 100)
          state.investorConfidence = clamp(state.investorConfidence + 6, 0, 100)
          return {
            ok: true,
            message: 'Certified GAAP financial statements & investor data room.',
            effects: ['-$500 Audit Fee', '+6 Investor Confidence', '-15 Audit Risk'],
          }
        }
      }
    }

    case 'investigate_incident': {
      const inc = state.incidents.find((i) => i.id === action.incidentId)
      if (inc) {
        inc.investigationSummary = action.summary
        state.flags[`investigated_${inc.id}`] = true
      }
      return {
        ok: true,
        message: `Completed Root-Cause Investigation for "${inc?.title || 'Incident'}".`,
        effects: ['Root cause & impact vectors unlocked'],
      }
    }

    case 'reply_email_custom': {
      const email = state.emails.find((e) => e.id === action.emailId)
      if (email) {
        email.read = true
        email.repliedText = action.replyText
        email.choices = []
      }
      state.investorConfidence = clamp(
        state.investorConfidence + action.confidenceDelta,
        0,
        100,
      )
      if (action.cashDelta) state.cash += action.cashDelta
      if (action.moraleDelta) {
        for (const emp of Object.values(state.employees)) {
          if (emp.active) emp.morale = clamp(emp.morale + action.moraleDelta, 0, 100)
        }
      }
      return {
        ok: true,
        message: `Sent executive reply to ${email?.fromName || 'stakeholder'}.`,
        effects: [
          `${action.confidenceDelta >= 0 ? '+' : ''}${action.confidenceDelta} Stakeholder Confidence`,
        ],
      }
    }

    case 'toggle_email_flag': {
      const email = state.emails.find((e) => e.id === action.emailId)
      if (email) {
        if (action.flag === 'important') email.important = !email.important
        if (action.flag === 'archived') email.archived = !email.archived
      }
      return { ok: true, message: `Updated email status.` }
    }

    case 'complete_campaign_scene': {
      state.flags[`scene_${action.sceneId}`] = action.choiceLabel
      state.flags[`chapter_${action.chapterNumber}_progress`] =
        Number(state.flags[`chapter_${action.chapterNumber}_progress`] || 0) + 1
      if (action.cashDelta) state.cash += action.cashDelta
      if (action.confidenceDelta) {
        state.investorConfidence = clamp(state.investorConfidence + action.confidenceDelta, 0, 100)
      }
      if (action.reputationDelta) {
        state.reputation = clamp(state.reputation + action.reputationDelta, 0, 100)
      }
      if (action.moraleDelta) {
        for (const emp of Object.values(state.employees)) {
          if (emp.active) emp.morale = clamp(emp.morale + action.moraleDelta, 0, 100)
        }
      }
      if (state.campaign) {
        state.campaign.memo.push(
          `Day ${state.day} (Ch.${action.chapterNumber}): ${action.choiceLabel}`,
        )
      }
      return {
        ok: true,
        message: `Executive Decision Recorded: "${action.choiceLabel}"`,
        effects: ['Story branch updated'],
      }
    }
  }
}

function findFreeDesk(state: CompanyState): number {
  const occupiedDesks = new Set(
    Object.values(state.employees)
      .filter((e) => e.active)
      .map((e) => e.homeDesk),
  )
  for (let i = 0; i < 20; i++) {
    if (!occupiedDesks.has(i)) return i
  }
  return 0
}

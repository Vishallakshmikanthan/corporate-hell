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

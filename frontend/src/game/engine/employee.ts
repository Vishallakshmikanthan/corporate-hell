/**
 * Per-employee simulation: autonomous decisions, pathing, and action effects.
 *
 * Every tick each active employee either walks along their path, performs
 * their current action, or (when their decision slot arrives) scores every
 * possible action with a utility function flavored by their archetype and
 * current vitals, then commits to the winner.
 */
import type {
  ActionKind,
  CompanyState,
  Employee,
  Emotion,
  Meeting,
  Project,
  RoomId,
} from '../models/types'
import { BOUNDS, clamp } from '../models/types'
import { ARCHETYPES } from './archetypes'
import {
  outputPerTick,
  splitRealAndFakeOutput,
  stressDeltaForTick,
  energyDeltaForTick,
  moraleDeltaForTick,
  updateProductivityEma,
  updateProjectQuality,
  qualityContribution,
  workSkills,
  deadlineUrgency,
} from './formulas'
import { getRelationship, onChat, onGossip, onHelp, onProjectCompleted } from './relationships'
import { meetingTickEffects } from './meetings'
import type { SeededRandom } from './rng'
import {
  COFFEE_SPOT,
  OFFICE_HALF_D,
  OFFICE_HALF_W,
  WALK_SPEED,
  deskSeat,
  findPath,
  roomAtPoint,
  spotInRoom,
} from './office'
import { addMemory, nextId, pushEmail } from './util'

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Active department project with the most urgent deadline (or null). */
export function departmentProject(state: CompanyState, department: string): Project | null {
  const active = state.projects.filter((p) => p.status === 'active' && p.department === department)
  if (active.length === 0) return null
  return active.reduce((best, p) =>
    deadlineUrgency(p, state.day) > deadlineUrgency(best, state.day) ? p : best,
  )
}

function others(state: CompanyState, self: Employee): Employee[] {
  return state.employeeOrder
    .map((id) => state.employees[id])
    .filter((e) => e && e.active && e.id !== self.id)
}

/** A standing spot near another employee (for chats/gossip/help). */
function near(person: Employee): { x: number; z: number } {
  return {
    x: clamp(person.position.x + 0.9, -OFFICE_HALF_W + 0.5, OFFICE_HALF_W - 0.5),
    z: clamp(person.position.z + 0.9, -OFFICE_HALF_D + 0.5, OFFICE_HALF_D - 0.5),
  }
}

function setThought(employee: Employee, text: string, ticks = 8): void {
  employee.thought = text
  employee.thoughtTicksLeft = ticks
}

export function setReaction(employee: Employee, kind: Emotion, ticks = 4): void {
  employee.reaction = { kind, ticksLeft: ticks }
}

// ---------------------------------------------------------------------------
// Decision making
// ---------------------------------------------------------------------------

interface Decision {
  action: ActionKind
  duration: number
  spot: { x: number; z: number }
  partnerId?: string
}

/** Highest-urgency deadline pressure in the employee's department (0..1). */
function teamUrgency(state: CompanyState, employee: Employee): number {
  const projects = state.projects.filter(
    (p) => p.status === 'active' && p.department === employee.department,
  )
  if (projects.length === 0) return 0
  return Math.max(...projects.map((p) => deadlineUrgency(p, state.day)))
}

/** Score every candidate action; the highest utility wins. */
function decideAction(state: CompanyState, employee: Employee, rng: SeededRandom): Decision {
  const def = ARCHETYPES[employee.archetype]
  const scores: { action: ActionKind; score: number }[] = []
  const project = departmentProject(state, employee.department)
  const urgency = teamUrgency(state, employee)

  // --- work ---
  {
    let score = 10 + employee.workload * 8 + urgency * 12 - employee.stress / 8
    if (!project) score -= 6 // busywork is unfulfilling
    if (employee.energy < 12) score -= 8 // running on fumes
    scores.push({ action: 'work', score })
  }

  // --- coffee ---
  if (!state.equipment.coffeeMachineBroken) {
    let score = 4 + (100 - employee.energy) * 0.25 + def.coffeeBias
    if (employee.coffeesToday >= 3) score -= 8
    if (employee.energy < 20) score += 6
    scores.push({ action: 'coffee', score })
  }

  // --- break ---
  scores.push({ action: 'break', score: 4 + employee.stress / 12 })

  // --- chat ---
  {
    const partner = rng.pick(others(state, employee))
    const score = partner ? 3 + def.socialBias / 10 : -Infinity
    scores.push({ action: 'chat', score })
  }

  // --- gossip ---
  {
    const partner = rng.pick(others(state, employee))
    const score = partner ? def.gossipChance * 20 + def.socialBias / 8 : -Infinity
    scores.push({ action: 'gossip', score })
  }

  // --- help (only when a colleague is drowning and not hostile) ---
  {
    const colleague = others(state, employee)
      .filter(
        (o) => o.department === employee.department && o.stress > 65 && getRelationship(employee, o.id) > 0,
      )
      .sort((a, b) => b.stress - a.stress)[0]
    const score = colleague ? 4 + colleague.stress / 10 : -Infinity
    scores.push({ action: 'help', score })
  }

  // --- escalate ---
  {
    const score = employee.workload > 1.4 ? 6 + employee.workload * 3 : -Infinity
    scores.push({ action: 'escalate', score })
  }

  // --- personal ---
  scores.push({ action: 'personal', score: 2 + employee.ambition / 40 })

  // --- wander ---
  scores.push({ action: 'wander', score: 1 })

  // --- procrastinate ---
  {
    const bias = def.actionBias.procrastinate ?? 0
    const slack = urgency < 0.3 ? 2 : 0
    scores.push({ action: 'procrastinate', score: 2 + bias + slack })
  }

  // --- archetype flavor + noise, then pick ---
  let best: { action: ActionKind; score: number } | null = null
  for (const entry of scores) {
    const total =
      entry.score + (def.actionBias[entry.action] ?? 0) + rng.range(-2, 2)
    if (!best || total > best.score) {
      best = { action: entry.action, score: total }
    }
  }
  const action = best!.action

  // --- resolve target spot / partner / duration ---
  return buildDecision(state, employee, action, rng)
}

function buildDecision(
  state: CompanyState,
  employee: Employee,
  action: ActionKind,
  rng: SeededRandom,
): Decision {
  const othersList = others(state, employee)
  switch (action) {
    case 'work': {
      const spot =
        employee.homeDesk >= 0 ? deskSeat(employee.homeDesk, 0) : spotInRoom('open_plan', 3)
      return { action: 'work', duration: 2 + rng.int(0, 1), spot }
    }
    case 'coffee':
      return { action: 'coffee', duration: 1, spot: COFFEE_SPOT }
    case 'break':
      return {
        action: 'break',
        duration: 1 + rng.int(0, 1),
        spot: spotInRoom('break_room', rng.int(0, 2)),
      }
    case 'chat':
    case 'gossip': {
      const partner = rng.pick(othersList)
      return partner
        ? { action, duration: 1, spot: near(partner), partnerId: partner.id }
        : { action: 'wander', duration: 1, spot: spotInRoom('open_plan', 1) }
    }
    case 'help': {
      const colleague = othersList
        .filter(
          (o) => o.department === employee.department && o.stress > 65 && getRelationship(employee, o.id) > 0,
        )
        .sort((a, b) => b.stress - a.stress)[0]
      return colleague
        ? { action: 'help', duration: 2, spot: near(colleague), partnerId: colleague.id }
        : { action: 'wander', duration: 1, spot: spotInRoom('open_plan', 2) }
    }
    case 'escalate':
      return { action: 'escalate', duration: 1, spot: spotInRoom('ceo_office', 0) }
    case 'personal': {
      const spot =
        rng.chance(0.5) && employee.homeDesk >= 0
          ? deskSeat(employee.homeDesk, 2)
          : spotInRoom('break_room', rng.int(0, 2))
      return { action: 'personal', duration: 2, spot }
    }
    case 'procrastinate': {
      const spot = rng.chance(0.5) ? spotInRoom('break_room', rng.int(0, 2)) : spotInRoom('pantry', 0)
      return { action: 'procrastinate', duration: 2 + rng.int(0, 1), spot }
    }
    case 'wander':
    default: {
      const roomIds: RoomId[] = ['open_plan', 'break_room', 'conference', 'pantry', 'reception']
      const room = rng.pick(roomIds)
      return { action: 'wander', duration: 1, spot: spotInRoom(room, rng.int(0, 2)) }
    }
  }
}

/** Commit to a decision: set action, path, and schedule the next decision. */
function commitDecision(state: CompanyState, employee: Employee, decision: Decision, rng: SeededRandom): void {
  const path = findPath(employee.position, decision.spot)
  const walkTicks = pathLength(path) / WALK_SPEED

  employee.action = decision.action
  employee.actionTicksLeft = decision.duration
  employee.interactingWith = decision.partnerId
  employee.path = path.length > 0 ? path : undefined
  employee.pathIndex = 0
  employee.location = roomAtPoint(employee.position.x, employee.position.z)

  // While walking the employee is idle; action ticks start on arrival.
  // A zero-length path means the first action tick is the very next tick.
  employee.actionStartedTick =
    walkTicks > 0 ? state.tick + Math.ceil(walkTicks) : state.tick + 1
  employee.nextDecisionTick = employee.actionStartedTick + decision.duration + 1

  // Side-effects of *starting* an action (not per-tick effects).
  if (decision.action === 'coffee') employee.coffeesToday += 1
  if (decision.action === 'chat' || decision.action === 'gossip') {
    const partner = decision.partnerId ? state.employees[decision.partnerId] : undefined
    if (partner && partner.active) {
      // Face each other while talking.
      employee.facing = Math.atan2(
        partner.position.x - employee.position.x,
        partner.position.z - employee.position.z,
      )
    }
  }
  if (rng.chance(0.35)) {
    setThought(employee, rng.pick(ARCHETYPES[employee.archetype].thoughts))
  }
}

function pathLength(path: { x: number; z: number }[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z)
  }
  return total
}

// ---------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------

/** Advance along the remaining path. Returns true when the path completes. */
function advanceAlongPath(employee: Employee): boolean {
  let budget = WALK_SPEED
  let arrived = false

  while (budget > 0 && employee.path && employee.pathIndex < employee.path.length) {
    const target = employee.path[employee.pathIndex]
    const dx = target.x - employee.position.x
    const dz = target.z - employee.position.z
    const dist = Math.hypot(dx, dz)

    if (dist <= budget) {
      employee.position = { x: target.x, z: target.z }
      budget -= dist
      employee.pathIndex += 1
      if (employee.pathIndex >= employee.path.length) {
        arrived = true
        employee.path = undefined
        employee.pathIndex = 0
      }
    } else {
      employee.position = {
        x: employee.position.x + (dx / dist) * budget,
        z: employee.position.z + (dz / dist) * budget,
      }
      employee.facing = Math.atan2(dx, dz)
      budget = 0
    }
  }

  return arrived
}

// ---------------------------------------------------------------------------
// Per-tick action effects
// ---------------------------------------------------------------------------

/** Apply one tick of the employee's current action. */
function performAction(state: CompanyState, employee: Employee, rng: SeededRandom): void {
  const first = state.tick === employee.actionStartedTick
  const def = ARCHETYPES[employee.archetype]

  switch (employee.action) {
    case 'work': {
      let points = outputPerTick(state, employee)
      if (employee.mentoredTicksLeft && employee.mentoredTicksLeft > 0) {
        points *= 1.15
        employee.mentoredTicksLeft -= 1
      }
      const [real, fake] = splitRealAndFakeOutput(employee, points)

      const project = departmentProject(state, employee.department)
      if (project) {
        project.pointsDone = Math.min(project.pointsTotal, project.pointsDone + real)
        const adrenaline =
          employee.archetype === 'procrastinator' && teamUrgency(state, employee) > 0.75 ? 8 : 0
        updateProjectQuality(project, qualityContribution(employee, adrenaline), Math.max(0.2, real))
        if (project.pointsDone >= project.pointsTotal) {
          completeProject(state, project)
        }
      }
      if (fake > 0) {
        state.kpiInflation = clamp(
          state.kpiInflation + fake * 0.4,
          BOUNDS.kpiInflation[0],
          BOUNDS.kpiInflation[1],
        )
        state.auditRisk = clamp(
          state.auditRisk + fake * 0.15,
          BOUNDS.auditRisk[0],
          BOUNDS.auditRisk[1],
        )
      }
      updateProductivityEma(employee, points)
      break
    }

    case 'break': {
      employee.morale = clamp(employee.morale + 1, ...BOUNDS.morale)
      break
    }

    case 'coffee': {
      if (first) {
        employee.morale = clamp(employee.morale + 1, ...BOUNDS.morale)
        if (rng.chance(0.3)) setThought(employee, rng.pick(def.thoughts))
      }
      break
    }

    case 'chat': {
      if (first) {
        const partner = employee.interactingWith ? state.employees[employee.interactingWith] : undefined
        if (partner && partner.active) {
          onChat(employee, partner)
          partner.morale = clamp(partner.morale + 1, ...BOUNDS.morale)
          setThought(partner, `Chatting with ${employee.name.split(' ')[0]}`, 4)
          partner.interactingWith = employee.id
        }
      }
      break
    }

    case 'gossip': {
      if (first) {
        const partner = employee.interactingWith ? state.employees[employee.interactingWith] : undefined
        if (partner && partner.active) {
          onGossip(employee, partner)
          setThought(partner, `Did you hear about ${employee.name.split(' ')[0]}?`, 4)
          partner.interactingWith = employee.id
          // Sometimes the grapevine surfaces something real.
          if (rng.chance(0.2)) {
            if (state.kpiInflation > 5) {
              pushEmail(state, {
                from: partner.id,
                fromName: partner.name,
                subject: 'Off the record...',
                body: `Something's off with the numbers. I heard the dashboards look "better than reality" lately. Maybe look into it before someone external does. — ${partner.name}`,
                participantIds: [partner.id, employee.id],
              })
            } else if (state.flags.phantomIntern) {
              pushEmail(state, {
                from: partner.id,
                fromName: partner.name,
                subject: 'Who is this new person?',
                body: `Nobody I ask has ever actually MET the new intern HR mentioned. Just saying. — ${partner.name}`,
                participantIds: [partner.id, employee.id],
              })
            }
          }
        }
      }
      break
    }

    case 'help': {
      if (first) {
        const colleague = employee.interactingWith ? state.employees[employee.interactingWith] : undefined
        if (colleague && colleague.active) {
          onHelp(colleague, employee)
          colleague.stress = clamp(colleague.stress - 10, ...BOUNDS.stress)
          colleague.morale = clamp(colleague.morale + 6, ...BOUNDS.morale)
          setReaction(colleague, 'happy', 3)
          addMemory(state, colleague.id, `${employee.name} helped me through a crunch.`)
          // Mentorship: seniors coaching juniors leaves a lasting buff.
          const isJunior = employee.role === 'senior' || employee.role === 'manager'
          if (isJunior && (colleague.role === 'junior' || colleague.role === 'intern')) {
            colleague.mentoredTicksLeft = 40
            setThought(colleague, 'Finally understanding this codebase.', 6)
          }
          employee.morale = clamp(employee.morale + 2, ...BOUNDS.morale)
        }
      }
      break
    }

    case 'escalate': {
      if (first) {
        employee.stress = clamp(employee.stress - 4, ...BOUNDS.stress)
        const ceo = state.employeeOrder
          .map((id) => state.employees[id])
          .find((e) => e && e.active && e.role === 'ceo')
        if (ceo) {
          ceo.stress = clamp(ceo.stress + 2, ...BOUNDS.stress)
        }
        pushEmail(state, {
          from: employee.id,
          fromName: employee.name,
          subject: 'We need to talk about my workload',
          body: `I'm currently carrying about ${Math.round(employee.workload * 100)}% of my capacity and it is not sustainable. I need either help, a deadline extension, or a very large coffee. Please advise. — ${employee.name}`,
          participantIds: [employee.id],
        })
      }
      break
    }

    case 'personal': {
      if (first) {
        switch (employee.archetype) {
          case 'meeting_addict': {
            const scheduled = state.meetings.filter((m) => !m.active).length
            const upcomingTick = state.tick + 6
            if (scheduled < 6 && upcomingTick <= 30) {
              const attendees = [employee.id]
              const pool = rng.shuffle(
                others(state, employee).filter((o) => o.department === employee.department),
              )
              for (const candidate of pool.slice(0, 3)) attendees.push(candidate.id)
              state.meetings.push({
                id: nextId(state, 'meeting'),
                title: 'Quick Sync (Addict Edition)',
                roomId: 'conference',
                startTick: upcomingTick,
                durationTicks: 2 + rng.int(0, 1),
                attendeeIds: attendees,
                recurring: 'none',
                topic: 'Alignment pre-alignment',
                createdBy: employee.id,
                timesHeld: 0,
                active: false,
              } satisfies Meeting)
              setThought(employee, 'Scheduled a meeting about scheduling meetings.')
            }
            break
          }
          case 'linkedin_speaker': {
            setThought(employee, 'This would make a great post.')
            if (rng.chance(0.2)) {
              state.eventQueue.push('linkedin_viral')
              setThought(employee, 'The algorithm loves me today.', 12)
            }
            break
          }
          case 'kpi_manipulator': {
            state.kpiInflation = clamp(
              state.kpiInflation + 3,
              BOUNDS.kpiInflation[0],
              BOUNDS.kpiInflation[1],
            )
            setThought(employee, 'Found a metric that makes me look great.')
            break
          }
          case 'silent_genius': {
            const project = departmentProject(state, employee.department)
            if (project) {
              project.pointsDone = Math.min(project.pointsTotal, project.pointsDone + 1.5)
              setThought(employee, 'Solved it in the shower. Fixing it now.')
            }
            break
          }
          default: {
            employee.morale = clamp(employee.morale + 1, ...BOUNDS.morale)
            if (rng.chance(0.4)) setThought(employee, rng.pick(def.thoughts))
            break
          }
        }
      }
      break
    }

    case 'procrastinate': {
      employee.morale = clamp(employee.morale + 0.5, ...BOUNDS.morale)
      if (first && rng.chance(0.5)) {
        setThought(employee, rng.pick(def.thoughts))
      }
      break
    }

    case 'wander':
    case 'react':
    case 'meeting':
    default:
      break
  }
}

/** Project completion side effects (revenue lands in today's ledger). */
function completeProject(state: CompanyState, project: Project): void {
  project.status = 'completed'
  const revenue = project.revenueOnDone * (0.8 + project.quality / 250)
  state.todayRevenueExtra += revenue
  state.reputation = clamp(state.reputation + 1, ...BOUNDS.reputation)

  const team = state.employeeOrder
    .map((id) => state.employees[id])
    .filter((e) => e && e.active && e.department === project.department)
  for (const member of team) {
    member.morale = clamp(member.morale + 4, ...BOUNDS.morale)
    setReaction(member, 'celebratory', 4)
    addMemory(state, member.id, `Shipped "${project.name}" for ${project.clientName}.`)
  }
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      onProjectCompleted(team[i], team[j])
    }
  }

  pushEmail(state, {
    from: 'system',
    fromName: 'Project Ops',
    subject: `Shipped: ${project.name}`,
    body: `"${project.name}" for ${project.clientName} is done — quality score ${Math.round(project.quality)}/100. Invoice value $${Math.round(revenue).toLocaleString()}. The team celebrates. Briefly.`,
    participantIds: team.map((e) => e.id),
  })
}

// ---------------------------------------------------------------------------
// Vitals
// ---------------------------------------------------------------------------

function applyVitals(state: CompanyState, employee: Employee): void {
  employee.stress = clamp(
    employee.stress + stressDeltaForTick(employee, state),
    ...BOUNDS.stress,
  )
  employee.energy = clamp(
    employee.energy + energyDeltaForTick(employee),
    ...BOUNDS.energy,
  )
  employee.morale = clamp(
    employee.morale + moraleDeltaForTick(employee, state),
    ...BOUNDS.morale,
  )
}

/** Lighter vitals while walking between places. */
function applyTravelVitals(state: CompanyState, employee: Employee): void {
  employee.energy = clamp(employee.energy - 0.2, ...BOUNDS.energy)
  employee.stress = clamp(employee.stress + 0.05, ...BOUNDS.stress)
  employee.morale = clamp(
    employee.morale + moraleDeltaForTick(employee, state),
    ...BOUNDS.morale,
  )
}

// ---------------------------------------------------------------------------
// Public tick entry point
// ---------------------------------------------------------------------------

/** The active meeting an employee is currently sitting in, if any. */
function activeMeetingFor(state: CompanyState, employee: Employee): Meeting | undefined {
  return state.meetings.find(
    (m) => m.active && m.attendeeIds.includes(employee.id) && m.roomId === 'conference',
  )
}

/** Advance one employee by one tick. Call for every active employee each tick. */
export function updateEmployee(state: CompanyState, employee: Employee, rng: SeededRandom): void {
  if (!employee.active) return

  // 1. Decay transient overlays.
  if (employee.reaction) {
    employee.reaction.ticksLeft -= 1
    if (employee.reaction.ticksLeft <= 0) employee.reaction = undefined
  }
  if (employee.thoughtTicksLeft > 0) {
    employee.thoughtTicksLeft -= 1
    if (employee.thoughtTicksLeft <= 0) {
      employee.thought = undefined
      employee.thoughtTicksLeft = 0
    }
  } else if (employee.thought) {
    employee.thought = undefined
  }

  // 2. Walking takes priority.
  if (employee.path && employee.pathIndex < employee.path.length) {
    const arrived = advanceAlongPath(employee)
    employee.location = roomAtPoint(employee.position.x, employee.position.z)
    if (arrived && employee.action !== 'meeting') {
      performAction(state, employee, rng) // first tick of the action
      employee.actionTicksLeft -= 1
      applyVitals(state, employee)
    } else {
      applyTravelVitals(state, employee)
    }
    return
  }

  // 3. Forced meetings run on the meetings.ts clock.
  const meeting = activeMeetingFor(state, employee)
  if (employee.action === 'meeting' && meeting) {
    const endTick = Math.min(35, meeting.startTick + meeting.durationTicks)
    employee.actionTicksLeft = Math.max(0, endTick - state.tick)
    employee.interactingWith = undefined
    meetingTickEffects(employee)
    applyVitals(state, employee)
    return
  }

  // 4. Continue the current action.
  if (employee.actionTicksLeft > 0) {
    performAction(state, employee, rng)
    employee.actionTicksLeft -= 1
    applyVitals(state, employee)
    return
  }

  // 5. Idle: decide what to do next when the slot arrives.
  employee.action = 'wander'
  employee.interactingWith = undefined
  if (state.tick >= employee.nextDecisionTick) {
    const decision = decideAction(state, employee, rng)
    commitDecision(state, employee, decision, rng)
  } else {
    applyVitals(state, employee)
  }
}

/** Utility export for tests: expose decideAction-driven choice. */
export function chooseAction(state: CompanyState, employee: Employee, rng: SeededRandom): ActionKind {
  return decideAction(state, employee, rng).action
}

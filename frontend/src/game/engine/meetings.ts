/**
 * CORPORATE HELL™ — meeting lifecycle.
 *
 * Meetings are the game's favorite satire target and its main time sink:
 *  - They forcibly capture attendees (no work output while active).
 *  - Everyone gets a chair in the conference room (or stands close by).
 *  - Ending one grants a short-lived "alignment buff" (+10% project output
 *    for 20 ticks) — the only in-game reason meetings exist at all.
 *  - The meeting_addict archetype genuinely enjoys them (+morale per tick).
 *  - `meetingFreeDay` policy cancels everything (and the addict suffers).
 */

import type { CompanyState, Employee, Meeting, RoomId, Vec2 } from '../models/types'
import { TICKS_PER_DAY, clamp } from '../models/types'
import { CONFERENCE_CHAIRS, findPath, spotInRoom } from './office'
import { ARCHETYPES } from './archetypes'
import { onSharedMeeting } from './relationships'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function activeMeetings(state: CompanyState): Meeting[] {
  return state.meetings.filter((m) => m.active)
}

export function meetingsStartingAt(state: CompanyState, tick: number): Meeting[] {
  return state.meetings.filter((m) => !m.active && m.startTick === tick)
}

export function meetingsEndingAt(state: CompanyState, tick: number): Meeting[] {
  return state.meetings.filter((m) => m.active && m.startTick + m.durationTicks <= tick)
}

export function meetingAttendees(state: CompanyState, meeting: Meeting): Employee[] {
  return meeting.attendeeIds
    .map((id) => state.employees[id])
    .filter((e): e is Employee => !!e && e.active)
}

// ---------------------------------------------------------------------------
// Seating
// ---------------------------------------------------------------------------

/** Chair/standing spot for the n-th attendee. */
export function seatForIndex(roomId: RoomId, index: number): Vec2 {
  if (roomId === 'conference' && index < CONFERENCE_CHAIRS.length) {
    return { ...CONFERENCE_CHAIRS[index] }
  }
  // Other rooms have a small set of standing spots; cycle attendees through them.
  if (roomId !== 'conference') {
    return spotInRoom(roomId, index % 3)
  }
  return { ...CONFERENCE_CHAIRS[index % CONFERENCE_CHAIRS.length] }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/**
 * Called every simulation tick before employees act.
 * Starts meetings whose startTick has arrived and ends those that ran
 * their course. Recurring one-shots are removed after they end; recurring
 * meetings stay and are re-queued at end-of-day by requeueRecurring.
 */
export function updateMeetings(state: CompanyState): void {
  const tick = state.tick

  // --- end meetings ---
  for (const meeting of meetingsEndingAt(state, tick)) {
    endMeeting(state, meeting)
  }

  // --- start meetings ---
  if (state.policies.meetingFreeDay) {
    // Policy: nothing starts today. One log line per day.
    const flagKey = `meetingFreeLoggedDay${state.day}`
    if (!state.flags[flagKey]) {
      state.flags[flagKey] = true
    }
    return
  }

  for (const meeting of meetingsStartingAt(state, tick)) {
    startMeeting(state, meeting)
  }
}

/** Force-capture attendees and send them to their seats. */
export function startMeeting(state: CompanyState, meeting: Meeting): void {
  meeting.active = true
  meeting.timesHeld += 1
  const attendees = meetingAttendees(state, meeting)

  attendees.forEach((employee, index) => {
    // Absolute within-day semantics: ticks reset each morning.
    const endTick = Math.min(TICKS_PER_DAY - 1, meeting.startTick + meeting.durationTicks)
    employee.action = 'meeting'
    employee.actionTicksLeft = Math.max(1, endTick - state.tick)
    employee.actionStartedTick = state.tick
    employee.nextDecisionTick = endTick + 1
    employee.interactingWith = undefined
    employee.meetingsAttendedToday += 1

    const seat = seatForIndex(meeting.roomId, index)
    employee.path = findPath(employee.position, seat)
    employee.pathIndex = 0
  })

  // Shared-room bonding: everyone gets a little closer to everyone.
  for (let i = 0; i < attendees.length; i++) {
    for (let j = i + 1; j < attendees.length; j++) {
      onSharedMeeting(attendees[i], attendees[j])
    }
  }

  // The meeting addict scheduled it themselves and is thrilled.
  const addict = attendees.find((e) => e.archetype === 'meeting_addict')
  if (addict) {
    addict.reaction = { kind: 'excited', ticksLeft: 4 }
  }
}

/** Release attendees and hand out the alignment buff. */
export function endMeeting(state: CompanyState, meeting: Meeting): void {
  meeting.active = false

  const attendees = meetingAttendees(state, meeting)
  for (const employee of attendees) {
    if (employee.action === 'meeting') {
      employee.action = 'wander'
      employee.actionTicksLeft = 0
      employee.nextDecisionTick = state.tick + 1
    }
  }

  // Alignment buff on all active projects owned by attendee departments.
  const departments = new Set(attendees.map((e) => e.department))
  for (const project of state.projects) {
    if (project.status === 'active' && departments.has(project.department)) {
      project.alignmentBuffTicksLeft = Math.max(project.alignmentBuffTicksLeft, 20)
    }
  }

  // One-shot meetings are cleaned up so they can never restart.
  if (meeting.recurring === 'none') {
    state.meetings = state.meetings.filter((m) => m.id !== meeting.id)
  }
}

/**
 * End-of-day: re-arm recurring meetings for tomorrow.
 * Daily meetings always return; weekly ones return every 7th day
 * (days 1, 8, 15, ... counted from day 1).
 */
export function requeueRecurringMeetings(state: CompanyState): void {
  const nextDay = state.day + 1
  state.meetings = state.meetings.filter((meeting) => {
    if (meeting.recurring === 'none') {
      // Completed one-shots were already removed by endMeeting.
      // Keep one-shots that have not been held yet (scheduled for a future day);
      // drop stale leftovers that were held but somehow survived.
      return meeting.timesHeld === 0
    }
    if (meeting.recurring === 'daily') {
      meeting.active = false
      return true
    }
    // weekly
    meeting.active = false
    return (nextDay - 1) % 7 === 0
  })
}

// ---------------------------------------------------------------------------
// Per-tick attendee effects (called from employee.performAction)
// ---------------------------------------------------------------------------

/** Extra per-tick effects of sitting in a meeting. */
export function meetingTickEffects(employee: Employee): void {
  if (employee.action !== 'meeting') return
  if (ARCHETYPES[employee.archetype].meetingLove >= 1.5) {
    employee.morale = clamp(employee.morale + 1, 0, 100)
  }
}

/** Morale hit when a meeting gets cancelled (the addict takes it hard). */
export function cancelMeetingEffects(state: CompanyState, meeting: Meeting): { addictsHit: number } {
  let addictsHit = 0
  for (const id of meeting.attendeeIds) {
    const employee = state.employees[id]
    if (!employee || !employee.active) continue
    if (employee.archetype === 'meeting_addict') {
      employee.morale = clamp(employee.morale - 8, 0, 100)
      employee.stress = clamp(employee.stress + 6, 0, 100)
      employee.reaction = { kind: 'sad', ticksLeft: 6 }
      addictsHit++
    }
  }
  // Everyone else gets a few minutes of their life back.
  for (const id of meeting.attendeeIds) {
    const employee = state.employees[id]
    if (!employee || !employee.active || employee.archetype === 'meeting_addict') continue
    employee.morale = clamp(employee.morale + 2, 0, 100)
  }
  state.meetings = state.meetings.filter((m) => m.id !== meeting.id)
  return { addictsHit }
}

/**
 * CORPORATE HELL™ — relationship bookkeeping.
 *
 * Relationships are pairwise, mirrored and bounded to [-100, 100]:
 *   > 0  gets along (they chat, they help, they cover for each other)
 *   < 0  friction (gossip wars, passive aggression, sabotage-adjacent vents)
 *
 * Every helper takes the canonical (lower-id-first) pair and writes both
 * sides so the graph can never become asymmetric.
 */

import type { Employee } from '../models/types'
import { clamp } from '../models/types'

function pairKey(aId: string, bId: string): string {
  return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`
}

/** Read the relationship value between two employees (missing = 0). */
export function getRelationship(a: Employee, bId: string): number {
  return a.relationships[bId] ?? 0
}

/** Set both sides of a relationship to the same value. */
export function setRelationship(a: Employee, b: Employee, value: number): void {
  const v = clamp(value, -100, 100)
  a.relationships[b.id] = v
  b.relationships[a.id] = v
}

/** Shift both sides by the same delta; returns the new value. */
export function adjustRelationship(a: Employee, b: Employee, delta: number): number {
  const current = getRelationship(a, b.id)
  const next = clamp(current + delta, -100, 100)
  a.relationships[b.id] = next
  b.relationships[a.id] = next
  return next
}

// ---------------------------------------------------------------------------
// Standard interaction effects
// ---------------------------------------------------------------------------

/** A friendly chat happened. */
export function onChat(a: Employee, b: Employee): void {
  adjustRelationship(a, b, 3)
}

/** They gossiped together — bonding, at someone else's expense. */
export function onGossip(a: Employee, b: Employee): void {
  adjustRelationship(a, b, 2)
}

/** Junior got help from a senior. */
export function onHelp(junior: Employee, senior: Employee): void {
  adjustRelationship(junior, senior, 5)
}

/** Shared a meeting room for an hour. Team building, allegedly. */
export function onSharedMeeting(a: Employee, b: Employee): void {
  adjustRelationship(a, b, 1)
}

/** Shipped a project together. */
export function onProjectCompleted(a: Employee, b: Employee): void {
  adjustRelationship(a, b, 5)
}

/** Open conflict (event-driven). */
export function onConflict(a: Employee, b: Employee): void {
  adjustRelationship(a, b, -15)
}

/**
 * Promotion fallout: highly ambitious peers resent the promoted one.
 * Returns true when jealousy was applied.
 */
export function onPromotion(promoted: Employee, peers: Employee[]): boolean {
  let jealous = false
  for (const peer of peers) {
    if (peer.id === promoted.id || !peer.active) continue
    if (peer.ambition > 60) {
      adjustRelationship(peer, promoted, -8)
      jealous = true
    }
  }
  return jealous
}

// ---------------------------------------------------------------------------
// Queries used by the decision engine
// ---------------------------------------------------------------------------

/** Best friend (highest relationship) among the given ids, or null. */
export function bestFriend(employee: Employee, candidates: Employee[]): Employee | null {
  let best: Employee | null = null
  let bestScore = -Infinity
  for (const candidate of candidates) {
    if (candidate.id === employee.id || !candidate.active) continue
    const score = getRelationship(employee, candidate.id)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }
  return bestScore > 10 ? best : null
}

/** Nemesis (lowest relationship) among candidates, if actually hostile. */
export function nemesis(employee: Employee, candidates: Employee[]): Employee | null {
  let worst: Employee | null = null
  let worstScore = Infinity
  for (const candidate of candidates) {
    if (candidate.id === employee.id || !candidate.active) continue
    const score = getRelationship(employee, candidate.id)
    if (score < worstScore) {
      worstScore = score
      worst = candidate
    }
  }
  return worstScore < -25 ? worst : null
}

/** Average sentiment towards an employee — used by morale nudges. */
export function socialStanding(employee: Employee, colleagues: Employee[]): number {
  let sum = 0
  let count = 0
  for (const other of colleagues) {
    if (other.id === employee.id) continue
    sum += getRelationship(employee, other.id)
    count++
  }
  return count > 0 ? sum / count : 0
}

export { pairKey }

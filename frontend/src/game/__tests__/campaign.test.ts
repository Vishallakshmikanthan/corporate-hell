import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../engine/engine'
import { TICKS_PER_DAY } from '../models/types'

describe('CEO Campaign', () => {
  it('tracks campaign objectives across days', () => {
    const engine = new SimulationEngine({
      seed: 777,
      mode: 'campaign',
      companyName: 'Crisis Management LLC',
      industry: 'Defense',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    expect(state.campaign).not.toBeNull()
    expect(state.campaign?.objectives.length).toBe(5)

    // Tick through Day 1
    for (let i = 0; i < TICKS_PER_DAY; i++) {
      engine.tick()
    }

    expect(state.day).toBe(2)
    // Survive days objective should have updated progress
    const surviveObj = state.campaign?.objectives.find((o) => o.type === 'survive_days')
    expect(surviveObj?.progress).toBeGreaterThan(0)
  })

  it('triggers bankruptcy failure when cash is negative for 3 days', () => {
    const engine = new SimulationEngine({
      seed: 888,
      mode: 'campaign',
      companyName: 'Doomed Ventures',
      industry: 'Subprime AI',
      difficulty: 'hard',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    state.cash = -10000 // Deep in debt

    // Day 1 end
    for (let i = 0; i < TICKS_PER_DAY; i++) engine.tick()
    expect(state.campaign?.bankNegativeDays).toBe(1)
    expect(state.campaign?.ending).toBeNull()

    // Day 2 end
    for (let i = 0; i < TICKS_PER_DAY; i++) engine.tick()
    expect(state.campaign?.bankNegativeDays).toBe(2)
    expect(state.campaign?.ending).toBeNull()

    // Day 3 end -> Bankruptcy!
    for (let i = 0; i < TICKS_PER_DAY; i++) engine.tick()
    expect(state.campaign?.ending).not.toBeNull()
    expect(state.campaign?.ending?.kind).toBe('failure')
    expect(state.campaign?.ending?.title).toMatch(/BANKRUPTCY/i)
  })
})

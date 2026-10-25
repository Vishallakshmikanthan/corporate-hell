import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../engine/engine'
import { TICKS_PER_DAY } from '../models/types'

describe('SimulationEngine', () => {
  it('initializes company state with 13 starting employees and valid metrics', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'sandbox',
      companyName: 'Acme Synergy Corp',
      industry: 'Enterprise Cloud',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    expect(state.name).toBe('Acme Synergy Corp')
    expect(state.day).toBe(1)
    expect(state.tick).toBe(0)
    expect(state.cash).toBe(32000)
    expect(state.employeeOrder.length).toBe(13)
    expect(state.projects.length).toBe(3)
  })

  it('is deterministic: identical seeds produce identical local state after 10 ticks', () => {
    const engineA = new SimulationEngine({
      seed: 12345,
      mode: 'sandbox',
      companyName: 'Seed Test',
      industry: 'AI',
      difficulty: 'normal',
      scenarioId: 'standard',
    })
    const engineB = new SimulationEngine({
      seed: 12345,
      mode: 'sandbox',
      companyName: 'Seed Test',
      industry: 'AI',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    for (let i = 0; i < 15; i++) {
      engineA.tick()
      engineB.tick()
    }

    const stateA = engineA.getState()
    const stateB = engineB.getState()

    expect(stateA.tick).toBe(stateB.tick)
    expect(stateA.cash).toBe(stateB.cash)
    expect(stateA.rngState).toBe(stateB.rngState)

    // Compare first employee position and action
    const empId = stateA.employeeOrder[0]
    expect(stateA.employees[empId].action).toBe(stateB.employees[empId].action)
    expect(stateA.employees[empId].position).toEqual(stateB.employees[empId].position)
  })

  it('completes a full fiscal day (36 ticks) and produces a valid DayLedger', () => {
    const engine = new SimulationEngine({
      seed: 999,
      mode: 'sandbox',
      companyName: 'Ledger Test',
      industry: 'SaaS',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    // Advance 36 ticks
    for (let i = 0; i < TICKS_PER_DAY; i++) {
      engine.tick()
    }

    const state = engine.getState()
    expect(state.day).toBe(2)
    expect(state.tick).toBe(0)
    expect(state.history.length).toBe(1)

    const ledger = state.history[0]
    expect(ledger.day).toBe(1)
    expect(ledger.costs).toBeGreaterThan(0)
    expect(ledger.revenue).toBeGreaterThan(0)
    expect(ledger.headcount).toBe(13)
    expect(ledger.cashAfter).toBe(state.cash)
  })
})

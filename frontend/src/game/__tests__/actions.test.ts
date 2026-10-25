import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../engine/engine'

describe('Player Actions', () => {
  it('handles promoting an employee and jealousy among ambitious peers', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'sandbox',
      companyName: 'Action Corp',
      industry: 'Consulting',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    // Yuki is senior specialist
    const res = engine.dispatchAction({ type: 'promote', employeeId: 'emp_yuki' })
    expect(res.ok).toBe(true)
    expect(state.employees['emp_yuki'].role).toBe('manager')
    expect(state.employees['emp_yuki'].morale).toBeGreaterThan(70)
  })

  it('rejects hiring when hiring freeze policy is active', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'sandbox',
      companyName: 'Action Corp',
      industry: 'Consulting',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    engine.dispatchAction({ type: 'set_policy', policy: 'hiringFrozen', value: true })
    const res = engine.dispatchAction({ type: 'hire', department: 'engineering', role: 'junior' })
    expect(res.ok).toBe(false)
    expect(res.reason).toMatch(/frozen/i)
  })

  it('handles awarding spot bonuses and deducting company cash', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'sandbox',
      companyName: 'Action Corp',
      industry: 'Consulting',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const initialCash = engine.getState().cash
    const emp = engine.getState().employees['emp_gary']
    const initialMorale = emp.morale

    const res = engine.dispatchAction({ type: 'bonus', employeeId: 'emp_gary' })
    expect(res.ok).toBe(true)
    expect(engine.getState().cash).toBeLessThan(initialCash)
    expect(emp.morale).toBeGreaterThan(initialMorale)
  })
})

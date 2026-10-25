import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../engine/engine'
import { EVENT_DEFINITIONS, executeEvent } from '../engine/events'

describe('Office Events', () => {
  it('has at least 30 distinct event definitions defined', () => {
    const keys = Object.keys(EVENT_DEFINITIONS)
    expect(keys.length).toBeGreaterThanOrEqual(30)
  })

  it('executes coffee machine uprising and generates an interactive incident', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'sandbox',
      companyName: 'Coffee Crisis Corp',
      industry: 'Beverages',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    const def = EVENT_DEFINITIONS['coffee_machine_uprising']
    expect(def).toBeDefined()

    const record = executeEvent(state, def, engine.getRng())
    expect(record.defId).toBe('coffee_machine_uprising')
    expect(state.equipment.coffeeMachineBroken).toBe(true)

    const incident = state.incidents.find((i) => i.roomId === 'pantry')
    expect(incident).toBeDefined()
    expect(incident?.resolved).toBe(false)
    expect(incident?.responses.length).toBe(3)
  })
})

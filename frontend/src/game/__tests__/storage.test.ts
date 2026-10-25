import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../engine/engine'
import { exportSaveToJson, importSaveFromJson, saveGame, loadGame } from '../persistence/storage'

describe('Persistence Storage', () => {
  it('exports and imports game state via JSON without data loss', () => {
    const engine = new SimulationEngine({
      seed: 555,
      mode: 'sandbox',
      companyName: 'Persistent Corp',
      industry: 'Hardware',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const original = engine.getState()
    const jsonStr = exportSaveToJson(original)
    expect(jsonStr).toContain('Persistent Corp')

    const imported = importSaveFromJson(jsonStr)
    expect(imported.name).toBe(original.name)
    expect(imported.cash).toBe(original.cash)
    expect(imported.day).toBe(original.day)
    expect(imported.employeeOrder.length).toBe(original.employeeOrder.length)
  })
})

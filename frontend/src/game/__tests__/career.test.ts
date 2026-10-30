import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '../engine/engine'
import { advanceCareerChapter, evaluateChapterProgress } from '../engine/career'

describe('Career Chapter Engine & Progression', () => {
  it('initializes with Chapter 1: The Bedroom Hacker', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'campaign',
      companyName: 'Garage Unicorn Inc',
      industry: 'ai',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    expect(state.career).toBeDefined()
    expect(state.career?.currentChapter).toBe('bedroom')
    expect(state.career?.objectives.length).toBe(3)
    expect(state.career?.unlockedChapters).toContain('bedroom')
  })

  it('updates Chapter 1 objectives when studying and shipping projects', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'campaign',
      companyName: 'Garage Unicorn Inc',
      industry: 'ai',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    // Study docs
    engine.dispatchAction({ type: 'study_docs' })
    let state = engine.getState()
    expect(state.career?.learningLevel).toBeGreaterThan(15)

    // Ship side project
    engine.dispatchAction({ type: 'ship_side_project' })
    state = engine.getState()
    expect(state.career?.sideProjectsShipped).toBe(1)
    expect(state.career?.githubStars).toBeGreaterThan(12)

    // Evaluate progress
    evaluateChapterProgress(state)
    const projectObj = state.career?.objectives.find((o) => o.id === 'obj_ship_projects')
    expect(projectObj?.current).toBe(1)
    expect(projectObj?.completed).toBe(false)
  })

  it('advances through chapters properly', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'campaign',
      companyName: 'Garage Unicorn Inc',
      industry: 'ai',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    if (!state.career) throw new Error('Missing career')

    // Force complete Chapter 1 objectives
    state.career.learningLevel = 50
    state.career.sideProjectsShipped = 3
    state.career.githubStars = 350
    evaluateChapterProgress(state)

    expect(state.career.objectives.every((o) => o.completed)).toBe(true)

    // Advance to Hackathon
    const res = engine.dispatchAction({ type: 'advance_chapter', targetChapter: 'hackathon' })
    expect(res.ok).toBe(true)
    expect(state.career.currentChapter).toBe('hackathon')
    expect(state.career.hackathonHoursLeft).toBe(48)
    expect(state.career.unlockedChapters).toContain('hackathon')
  })

  it('executes founding equity split and term sheet signing in Chapter 3', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'campaign',
      companyName: 'Garage Unicorn Inc',
      industry: 'ai',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()

    // Split equity
    const equityRes = engine.dispatchAction({
      type: 'split_founder_equity',
      coFounders: [
        { id: 'emp_yuki', name: 'Yuki', role: 'CTO', equityPct: 20, satisfaction: 90 },
        { id: 'emp_gary', name: 'Gary', role: 'DevOps', equityPct: 15, satisfaction: 85 },
      ],
      founderEquityPct: 65,
    })
    expect(equityRes.ok).toBe(true)
    expect(state.career?.founderEquityPct).toBe(65)
    expect(state.career?.coFounders.length).toBe(2)

    // Sign Seed Term Sheet
    const initialCash = state.cash
    const termSheetRes = engine.dispatchAction({
      type: 'sign_term_sheet_offer',
      offerId: 'ts_sequoia_parody',
    })
    expect(termSheetRes.ok).toBe(true)
    expect(state.career?.selectedTermSheetId).toBe('ts_sequoia_parody')
    expect(state.cash).toBe(initialCash + 1500000)

    // Place furniture in builder mode
    const initialFurn = state.career?.placedFurnitureCount || 0
    const furnRes = engine.dispatchAction({ type: 'place_furniture' })
    expect(furnRes.ok).toBe(true)
    expect(state.career?.placedFurnitureCount).toBe(initialFurn + 1)
  })
})

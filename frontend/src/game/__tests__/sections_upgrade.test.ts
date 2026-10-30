import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '../engine/engine'

describe('9-Section Complete Game Upgrade Actions & Determinism', () => {
  it('initializes seeded incidents, corporate inbox emails, and campaign objectives', () => {
    const engine = new SimulationEngine({
      seed: 42,
      mode: 'campaign',
      companyName: 'Vishal Corp',
      industry: 'AI Infrastructure',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const state = engine.getState()
    expect(state.incidents.length).toBeGreaterThanOrEqual(3)
    expect(state.emails.length).toBeGreaterThanOrEqual(5)
    expect(state.campaign).not.toBeNull()
    expect(state.campaign?.objectives.length).toBe(5)
  })

  it('executes Investor Pitch conclusion (conclude_pitch) with deterministic cash and confidence updates', () => {
    const engine = new SimulationEngine({
      seed: 101,
      mode: 'campaign',
      companyName: 'Vishal Corp',
      industry: 'AI Infrastructure',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const initialCash = engine.getState().cash
    const res = engine.dispatchAction({
      type: 'conclude_pitch',
      cashRaised: 1200000,
      valuation: 12000000,
      equityDiluted: 10,
      confidenceDelta: 15,
      investorName: 'Horizon Capital',
      outcome: 'full',
    })

    expect(res.ok).toBe(true)
    expect(engine.getState().cash).toBe(initialCash + 1200000)
    expect(engine.getState().growth.valuation).toBe(12000000)
    expect(engine.getState().flags.totalEquityDiluted).toBe(10)
  })

  it('executes Employee 1-on-1 conversations and salary adjustments', () => {
    const engine = new SimulationEngine({
      seed: 202,
      mode: 'sandbox',
      companyName: 'Vishal Corp',
      industry: 'SaaS',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const empId = engine.getState().employeeOrder[0]
    const empBefore = engine.getState().employees[empId]
    const prevMemories = empBefore.memories.length
    const prevSalary = empBefore.salary

    const convRes = engine.dispatchAction({
      type: 'employee_conversation',
      employeeId: empId,
      choiceLabel: 'Acknowledge contributions & clear blockers',
      moraleDelta: 10,
      stressDelta: -8,
      trustDelta: 12,
      productivityDelta: 6,
      memoryText: 'Had a constructive 1-on-1 with CEO.',
    })
    expect(convRes.ok).toBe(true)
    expect(engine.getState().employees[empId].memories.length).toBe(prevMemories + 1)

    const salRes = engine.dispatchAction({
      type: 'adjust_salary',
      employeeId: empId,
      newSalary: prevSalary + 60,
    })
    expect(salRes.ok).toBe(true)
    expect(engine.getState().employees[empId].salary).toBe(prevSalary + 60)
  })

  it('executes Department project creation, project boost, and budget adjustments', () => {
    const engine = new SimulationEngine({
      seed: 303,
      mode: 'sandbox',
      companyName: 'Vishal Corp',
      industry: 'SaaS',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const prevProjects = engine.getState().projects.length
    const createRes = engine.dispatchAction({
      type: 'create_project',
      name: 'Neural Inference Engine v2',
      department: 'engineering',
      clientName: 'Enterprise Core',
      pointsTotal: 250,
      deadlineDay: 14,
      revenueOnDone: 45000,
    })
    expect(createRes.ok).toBe(true)
    expect(engine.getState().projects.length).toBe(prevProjects + 1)

    const newProj = engine.getState().projects[engine.getState().projects.length - 1]
    const boostRes = engine.dispatchAction({
      type: 'boost_project',
      projectId: newProj.id,
      cost: 2500,
      pointsGain: 40,
    })
    expect(boostRes.ok).toBe(true)
    expect(
      engine.getState().projects.find((p) => p.id === newProj.id)?.pointsDone
    ).toBeGreaterThanOrEqual(40)

    const budgetRes = engine.dispatchAction({
      type: 'adjust_dept_budget',
      department: 'engineering',
      budgetPerDay: 2400,
    })
    expect(budgetRes.ok).toBe(true)
    expect(engine.getState().flags.budget_engineering).toBe(2400)
  })

  it('executes Finance treasury actions, Incident investigation, Inbox custom reply, and Campaign scenes', () => {
    const engine = new SimulationEngine({
      seed: 404,
      mode: 'campaign',
      companyName: 'Vishal Corp',
      industry: 'SaaS',
      difficulty: 'normal',
      scenarioId: 'standard',
    })

    const cash0 = engine.getState().cash
    const loanRes = engine.dispatchAction({
      type: 'treasury_action',
      subtype: 'take_loan',
      amount: 50000,
    })
    expect(loanRes.ok).toBe(true)
    expect(engine.getState().cash).toBe(cash0 + 50000)

    const incId = engine.getState().incidents[0].id
    const invRes = engine.dispatchAction({
      type: 'investigate_incident',
      incidentId: incId,
      summary: 'Sabotaged espresso valve traced to burnout.',
    })
    expect(invRes.ok).toBe(true)
    expect(engine.getState().incidents[0].investigationSummary).toContain('Sabotaged')

    const emailId = engine.getState().emails[0].id
    const replyRes = engine.dispatchAction({
      type: 'reply_email_custom',
      emailId,
      replyText: 'Attached updated unit economics.',
      confidenceDelta: 6,
    })
    expect(replyRes.ok).toBe(true)
    expect(engine.getState().emails[0].read).toBe(true)
    expect(engine.getState().emails[0].repliedText).toContain('Attached')

    const sceneRes = engine.dispatchAction({
      type: 'complete_campaign_scene',
      chapterNumber: 1,
      sceneId: 'ch1_opening_crisis',
      choiceLabel: 'Focus on Core Product Stability',
      cashDelta: -2000,
      moraleDelta: 8,
      confidenceDelta: 10,
      reputationDelta: 5,
    })
    expect(sceneRes.ok).toBe(true)
    expect(engine.getState().flags.scene_ch1_opening_crisis).toBe(
      'Focus on Core Product Stability'
    )
  })
})

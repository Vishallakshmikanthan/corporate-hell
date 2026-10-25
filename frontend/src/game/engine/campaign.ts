/**
 * CORPORATE HELL™ — CEO Campaign Mode Manager.
 *
 * Coordinates campaign objectives, daily briefings, bankruptcy/collapse
 * tracking, victory/defeat triggers, and post-campaign debrief summaries.
 */
import type { CampaignState, CompanyState, Ending, Objective } from '../models/types'

export function createInitialCampaign(): CampaignState {
  const objectives: Objective[] = [
    {
      id: 'obj_1_survive',
      title: 'Survive the First 5 Fiscal Days',
      description: 'Stabilize operational cash flow and prevent immediate staff mutiny.',
      type: 'survive_days',
      target: 5,
      status: 'active',
      startedDay: 1,
      progress: 20,
    },
    {
      id: 'obj_2_project',
      title: 'Deliver Project Chimera',
      description: 'Complete the flagship engineering project before the quarterly board deadline.',
      type: 'complete_project',
      projectId: 'proj_chimera',
      deadlineDay: 9,
      status: 'active',
      startedDay: 1,
      progress: 0,
    },
    {
      id: 'obj_3_morale',
      title: 'Workforce Morale Recovery',
      description: 'Raise the company-wide average morale above 65%.',
      type: 'morale_minimum',
      target: 65,
      status: 'active',
      startedDay: 1,
      progress: 40,
    },
    {
      id: 'obj_4_investor',
      title: 'Pass Series-B Board Audit',
      description: 'Elevate investor confidence above 75% without triggering a compliance audit.',
      type: 'investor_confidence',
      target: 75,
      status: 'active',
      startedDay: 1,
      progress: 50,
    },
    {
      id: 'obj_5_stability',
      title: 'Sustained Corporate Hegemony',
      description: 'Survive to Day 15 with cash exceeding $40,000 and zero open equipment crises.',
      type: 'final_stability',
      target: 15,
      status: 'active',
      startedDay: 1,
      progress: 10,
    },
  ]

  return {
    objectives,
    activeObjectiveIndex: 0,
    ending: null,
    bankNegativeDays: 0,
    collapseDays: 0,
    memo: [
      'Welcome to the corner office, CEO.',
      'Cash reserves are fragile and operations are already asking for a coffee machine upgrade.',
      'Remember: Synergy is mandatory. Sanity is optional.',
    ],
  }
}

/**
 * Evaluates campaign progress, advances objectives, and tests victory/failure.
 */
export function evaluateCampaignDaily(state: CompanyState): Ending | null {
  if (!state.campaign || state.campaign.ending) return state.campaign?.ending ?? null

  const camp = state.campaign

  // 1. Bankruptcy Check
  if (state.cash < 0) {
    camp.bankNegativeDays += 1
    if (camp.bankNegativeDays >= 3) {
      camp.ending = {
        kind: 'failure',
        title: 'CHAPTER 11 BANKRUPTCY',
        summary:
          'The treasury ran out of money for 3 consecutive days. Creditors seized the ergonomic chairs, the coffee machine was repossessed, and security escorted you off the premises.',
        day: state.day,
      }
      return camp.ending
    }
  } else {
    camp.bankNegativeDays = 0
  }

  // 2. Workforce Mutiny / Morale Collapse Check
  const activeEmps = Object.values(state.employees).filter((e) => e.active)
  const avgMorale =
    activeEmps.length > 0
      ? activeEmps.reduce((acc, e) => acc + e.morale, 0) / activeEmps.length
      : 0

  if (avgMorale < 20) {
    camp.collapseDays += 1
    if (camp.collapseDays >= 3) {
      camp.ending = {
        kind: 'failure',
        title: 'TOTAL WORKFORCE REBELLION',
        summary:
          'Morale stayed below 20% for three days. The entire company walked out, formed a union across the street, and published an exposé on LinkedIn that garnered 500,000 impressions.',
        day: state.day,
      }
      return camp.ending
    }
  } else {
    camp.collapseDays = 0
  }

  // 3. Evaluate each active objective
  let allDone = true
  for (let i = 0; i < camp.objectives.length; i++) {
    const obj = camp.objectives[i]
    if (obj.status === 'done') continue

    switch (obj.type) {
      case 'survive_days': {
        const target = obj.target ?? 5
        obj.progress = Math.min(100, Math.round((state.day / target) * 100))
        if (state.day >= target) {
          obj.status = 'done'
          obj.completedDay = state.day
          obj.resultNote = `Survived ${target} days without burning the building down.`
        } else {
          allDone = false
        }
        break
      }

      case 'complete_project': {
        const proj = state.projects.find((p) => p.id === obj.projectId)
        if (proj) {
          obj.progress = Math.min(100, Math.round((proj.pointsDone / proj.pointsTotal) * 100))
          if (proj.status === 'completed') {
            obj.status = 'done'
            obj.completedDay = state.day
            obj.resultNote = `Project ${proj.name} delivered successfully!`
          } else if (proj.status === 'failed' || (obj.deadlineDay && state.day > obj.deadlineDay)) {
            obj.status = 'failed'
            camp.ending = {
              kind: 'failure',
              title: 'FAILED STRATEGIC DELIVERABLE',
              summary: `Failed to deliver ${proj.name} by Day ${obj.deadlineDay}. The board lost all confidence and cancelled funding.`,
              day: state.day,
            }
            return camp.ending
          } else {
            allDone = false
          }
        }
        break
      }

      case 'morale_minimum': {
        const target = obj.target ?? 65
        obj.progress = Math.min(100, Math.round((avgMorale / target) * 100))
        if (avgMorale >= target) {
          obj.status = 'done'
          obj.completedDay = state.day
          obj.resultNote = `Company morale elevated to ${Math.round(avgMorale)}%.`
        } else {
          allDone = false
        }
        break
      }

      case 'investor_confidence': {
        const target = obj.target ?? 75
        obj.progress = Math.min(100, Math.round((state.investorConfidence / target) * 100))
        if (state.investorConfidence >= target) {
          obj.status = 'done'
          obj.completedDay = state.day
          obj.resultNote = `Investor confidence reached ${Math.round(state.investorConfidence)}%.`
        } else {
          allDone = false
        }
        break
      }

      case 'final_stability': {
        const target = obj.target ?? 15
        obj.progress = Math.min(100, Math.round((state.day / target) * 100))
        const equipmentOk = !Object.values(state.equipment).some(Boolean)
        if (state.day >= target && state.cash >= 30000 && equipmentOk) {
          obj.status = 'done'
          obj.completedDay = state.day
          obj.resultNote = 'Achieved true corporate equilibrium.'
        } else {
          allDone = false
        }
        break
      }

      default:
        allDone = false
    }
  }

  // 4. Victory Check
  if (allDone) {
    camp.ending = {
      kind: 'victory',
      title: 'CHAIRMAN OF CHAOS — VICTORY',
      summary:
        'You have successfully survived the gauntlet of Corporate Hell! The company is profitable, the board is appeased, the coffee machine works, and you have mastered the art of managing chaos.',
      day: state.day,
    }
    return camp.ending
  }

  return null
}

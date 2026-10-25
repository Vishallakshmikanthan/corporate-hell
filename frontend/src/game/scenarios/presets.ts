/**
 * CORPORATE HELL™ — playable scenario presets.
 *
 * Each preset configures actual game simulation conditions:
 * initial cash, morale, policies, broken equipment, and queued events.
 */
import type { CompanyState, Project } from '../models/types'

export interface ScenarioDef {
  id: string
  name: string
  tagline: string
  description: string
  difficulty: 'easy' | 'normal' | 'hard'
  apply: (state: CompanyState) => void
}

export const SCENARIOS: Record<string, ScenarioDef> = {
  standard: {
    id: 'standard',
    name: 'Standard Startup Chaos',
    tagline: 'A balanced baseline of startup dysfunction.',
    description: 'Modest cash, a full roster of quirky employees, and high hopes for the upcoming fiscal quarter.',
    difficulty: 'normal',
    apply: () => {
      // Default initial conditions
    },
  },

  monday_morning_disaster: {
    id: 'monday_morning_disaster',
    name: 'Monday Morning Disaster',
    tagline: 'Everything that could break broke before 9:15 AM.',
    description: 'The coffee machine is broken, the server room is overheating, and someone sent a Reply-All vent email before breakfast.',
    difficulty: 'hard',
    apply: (state) => {
      state.equipment.coffeeMachineBroken = true
      state.equipment.serverRoomHot = true
      state.eventQueue.push('reply_all_incident', 'coffee_machine_uprising')
      for (const emp of Object.values(state.employees)) {
        emp.energy = 50
        emp.stress = 65
      }
    },
  },

  the_great_coffee_shortage: {
    id: 'the_great_coffee_shortage',
    name: 'The Great Coffee Shortage',
    tagline: 'Zero caffeine. Maximum hostility.',
    description: 'Both the espresso machine and bean grinder have failed. Energy is plummeting and employees are wandering around the pantry like zombies.',
    difficulty: 'normal',
    apply: (state) => {
      state.equipment.coffeeMachineBroken = true
      state.eventQueue.push('coffee_machine_uprising')
      for (const emp of Object.values(state.employees)) {
        emp.energy = 35
        emp.morale = 45
      }
    },
  },

  quarterly_kpi_panic: {
    id: 'quarterly_kpi_panic',
    name: 'Quarterly KPI Panic',
    tagline: 'The numbers don\u2019t lie, but we certainly can.',
    description: 'The board review is in 3 days. Projects are behind schedule and productivity tracking has been forced company-wide.',
    difficulty: 'hard',
    apply: (state) => {
      state.policies.productivityTracking = true
      state.kpiInflation = 40
      state.auditRisk = 60
      state.eventQueue.push('kpi_miracle')
      for (const emp of Object.values(state.employees)) {
        emp.stress = 70
      }
    },
  },

  ceo_has_discovered_ai: {
    id: 'ceo_has_discovered_ai',
    name: 'CEO Has Discovered AI',
    tagline: '"Can we automate the developers with an agent?"',
    description: 'Executive management has mandated AI in every single workflow. Autonomous bots are sending sales emails and confusion reigns.',
    difficulty: 'normal',
    apply: (state) => {
      state.eventQueue.push('ai_agent_hallucination', 'ai_coffee_optimizer')
      state.reputation = 60
      for (const emp of Object.values(state.employees)) {
        if (emp.archetype === 'ai_evangelist') {
          emp.morale = 95
        } else if (emp.archetype === 'silent_genius' || emp.archetype === 'burnout_veteran') {
          emp.morale = 40
          emp.stress = 60
        }
      }
    },
  },

  mandatory_team_building: {
    id: 'mandatory_team_building',
    name: 'The Mandatory Team-Building Event',
    tagline: 'Forced fun will continue until morale improves.',
    description: 'HR has blocked the entire afternoon for trust-falls, synergy workshops, and awkward small talk.',
    difficulty: 'easy',
    apply: (state) => {
      state.eventQueue.push('mandatory_fun_initiative', 'the_47_slide_presentation')
      for (const emp of Object.values(state.employees)) {
        emp.morale = 50
      }
    },
  },

  layoff_rumor_season: {
    id: 'layoff_rumor_season',
    name: 'Layoff Rumor Season',
    tagline: 'Whispers in the hallway and closed-door HR meetings.',
    description: 'Hiring is frozen. Gossip is running rampant, trust has evaporated, and everyone is updating their LinkedIn profiles.',
    difficulty: 'hard',
    apply: (state) => {
      state.policies.hiringFrozen = true
      state.eventQueue.push('secret_slack_channel', 'poaching_attempt')
      for (const emp of Object.values(state.employees)) {
        emp.trust = 25
        emp.stress = 75
      }
    },
  },

  the_printer_rebellion: {
    id: 'the_printer_rebellion',
    name: 'The Printer Rebellion',
    tagline: 'Load Letter in Tray 2. PC LOAD LETTER.',
    description: 'The office hardware has staged an uprising. Multiple jammed trays, toner explosions, and urgent pitch decks held hostage.',
    difficulty: 'normal',
    apply: (state) => {
      state.equipment.printerJammed = true
      state.eventQueue.push('printer_rebellion')
    },
  },

  the_47_slide_presentation: {
    id: 'the_47_slide_presentation',
    name: 'The 47-Slide Presentation',
    tagline: 'Death by PowerPoint.',
    description: 'An executive presentation has trapped all middle management in the conference room. Work has ground to a complete standstill.',
    difficulty: 'normal',
    apply: (state) => {
      state.eventQueue.push('the_47_slide_presentation', 'synergy_emergency')
      for (const emp of Object.values(state.employees)) {
        emp.energy = 40
      }
    },
  },
}

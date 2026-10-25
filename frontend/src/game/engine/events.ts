/**
 * CORPORATE HELL™ — random events and office drama.
 *
 * Over 30 distinct, satirical corporate crisis and luck events spanning:
 *  - employee drama
 *  - project crises
 *  - financial surprises
 *  - management mistakes
 *  - office equipment failures
 *  - customer complaints
 *  - HR incidents
 *  - AI mishaps
 *  - corporate celebrations
 *  - unexpected successes
 *
 * Every event mutates game state through verified EffectSpecs and/or generates
 * pending decisions, emails, or active incidents.
 */
import type {
  CompanyState,
  EffectSpec,
  EventCategory,
  EventRecord,
  Incident,
  IncidentResponse,
  PendingDecision,
  RoomId,
} from '../models/types'
import { clamp } from '../models/types'
import { ARCHETYPES } from './archetypes'
import { SeededRandom } from './rng'
import { nextId, pushEmail, addMemory } from './util'

export interface EventDefinition {
  id: string
  title: string
  category: EventCategory
  severity: number // 1..5
  baseWeight: number // frequency weight
  minDay?: number
  minEmployees?: number
  cooldownDays?: number
  requiresEquipmentBroken?: 'coffeeMachineBroken' | 'printerJammed' | 'acBroken' | 'serverRoomHot'
  requiresEquipmentWorking?: 'coffeeMachineBroken' | 'printerJammed' | 'acBroken' | 'serverRoomHot'
  requiresPolicy?: keyof CompanyState['policies']
  requiresNotPolicy?: keyof CompanyState['policies']
  requiresLowMorale?: number // triggers when morale < threshold
  requiresHighStress?: number // triggers when stress > threshold
  requiresMinCash?: number
  requiresMaxCash?: number

  /** Narrative builder. Can incorporate state and participant names. */
  describe: (state: CompanyState, participants: string[]) => string

  /** Determine participants (employee IDs) relevant to this event. */
  selectParticipants?: (state: CompanyState, rng: SeededRandom) => string[]

  /** Direct effects applied immediately to state. */
  applyEffects?: (state: CompanyState, participants: string[], rng: SeededRandom) => EffectSpec

  /** Spawns an interactive incident if true. */
  createIncident?: (state: CompanyState, participants: string[]) => Incident | null

  /** Spawns a pending CEO decision if true. */
  createDecision?: (state: CompanyState, participants: string[]) => PendingDecision | null

  /** Spawns an email in the CEO's inbox. */
  createEmail?: (state: CompanyState, participants: string[]) => {
    from: string
    fromName: string
    subject: string
    body: string
    kind?: 'info' | 'decision'
  } | null
}

export const EVENT_DEFINITIONS: Record<string, EventDefinition> = {
  // -------------------------------------------------------------------------
  // 1. Employee Drama
  // -------------------------------------------------------------------------
  reply_all_incident: {
    id: 'reply_all_incident',
    title: 'The Reply-All Incident',
    category: 'drama',
    severity: 3,
    baseWeight: 10,
    minEmployees: 3,
    cooldownDays: 5,
    describe: (state, [sender, target]) => {
      const sName = state.employees[sender]?.name ?? 'Someone'
      const tName = state.employees[target]?.name ?? 'leadership'
      return `${sName} accidentally hit 'Reply All' on a private 3-paragraph vent criticizing ${tName} and the new snack budget.`
    },
    selectParticipants: (state, rng) => {
      const active = state.employeeOrder.filter((id) => state.employees[id]?.active)
      if (active.length < 2) return active
      const sender = rng.pick(active)
      const target = rng.pick(active.filter((id) => id !== sender))
      return [sender, target]
    },
    applyEffects: (_state, [sender]) => ({
      moraleDeltaAll: -4,
      stressDeltaAll: +5,
      trustDeltaAll: -6,
      log: [`Reply-All chaos triggered by employee ${sender}`],
    }),
    createDecision: (state, [sender]) => {
      const sName = state.employees[sender]?.name ?? 'The employee'
      return {
        id: nextId(state, 'dec'),
        uid: String(state.nextUid),
        title: 'Reply-All Disaster Management',
        description: `${sName} sent an internal email leak to the whole company. How will you respond?`,
        severity: 3,
        source: 'event',
        eventId: 'reply_all_incident',
        day: state.day,
        choices: [
          {
            id: 'brush_off',
            label: 'Issue a humorous apology memo',
            description: 'Downplay the drama. Morale recovers slightly, but leadership authority takes a dent.',
            effects: { moraleDeltaAll: +3, executiveConfidenceDelta: -4, trustDeltaAll: +2 },
          },
          {
            id: 'written_warning',
            label: 'Formal reprimand and sensitivity training',
            description: 'Make an example of the sender. Reassures executives, creates tension.',
            effects: { stressDeltaAll: +4, executiveConfidenceDelta: +6, trustDeltaAll: -5 },
          },
          {
            id: 'disable_reply_all',
            label: 'Ban the "Reply All" button entirely',
            description: 'Operations blocks Reply-All company-wide. IT grumbles.',
            effects: { cashDelta: -500, executiveConfidenceDelta: +3 },
          },
        ],
      }
    },
  },

  microwave_fish: {
    id: 'microwave_fish',
    title: 'Microwave Salmon Incident',
    category: 'drama',
    severity: 2,
    baseWeight: 12,
    cooldownDays: 4,
    describe: (state, [culprit]) => {
      const name = state.employees[culprit]?.name ?? 'An unidentified employee'
      return `${name} microwaved leftover salmon for 4 minutes in the pantry. The entire second floor is currently uninhabitable.`
    },
    selectParticipants: (state, rng) => {
      const active = state.employeeOrder.filter((id) => state.employees[id]?.active)
      return active.length > 0 ? [rng.pick(active)] : []
    },
    applyEffects: () => ({
      moraleDeltaAll: -5,
      stressDeltaAll: +4,
      log: ['Pantry evacuated due to severe airborne salmon fumes.'],
    }),
  },

  secret_slack_channel: {
    id: 'secret_slack_channel',
    title: 'The Shadow Channel Leaks',
    category: 'drama',
    severity: 3,
    baseWeight: 8,
    minEmployees: 4,
    cooldownDays: 7,
    describe: () => 'A private backchannel titled #anti-synergy-cabal was accidentally shared during a screen share.',
    applyEffects: () => ({
      trustDeltaAll: -8,
      stressDeltaAll: +6,
      reputationDelta: -2,
      log: ['Underground chat leaked memes about executives.'],
    }),
    createEmail: (state) => ({
      from: 'hr@corporate.local',
      fromName: 'People Ops Hotline',
      subject: 'URGENT: Unauthorized Channel Investigation',
      body: 'Leadership was informed of private channels with customized executive emojis. Please confirm if a formal investigation is required.',
      kind: 'info',
    }),
  },

  // -------------------------------------------------------------------------
  // 2. Office Equipment Failures
  // -------------------------------------------------------------------------
  coffee_machine_uprising: {
    id: 'coffee_machine_uprising',
    title: 'The Coffee Machine Uprising',
    category: 'equipment',
    severity: 4,
    baseWeight: 14,
    cooldownDays: 6,
    requiresEquipmentWorking: 'coffeeMachineBroken',
    describe: () => 'The espresso machine has entered a state of violent descaling rebellion. No caffeine is currently available.',
    applyEffects: (state) => {
      state.equipment.coffeeMachineBroken = true
      return {
        breakEquipment: 'coffeeMachineBroken',
        moraleDeltaAll: -10,
        energyDeltaAll: -15,
        log: ['Espresso machine exploded in steam and error codes.'],
      }
    },
    createIncident: (state) => ({
      id: nextId(state, 'inc'),
      title: 'Espresso Machine Inoperable',
      description: 'The office espresso machine is hissing steam and spitting decaf beans. Productivity is nose-diving.',
      category: 'equipment',
      severity: 4,
      roomId: 'pantry',
      dayOpened: state.day,
      dailyMoraleDrift: -4,
      productivityPenalty: 0.82,
      resolved: false,
      responses: [
        {
          id: 'emergency_barista',
          label: 'Hire an emergency artisan barista ($900)',
          description: 'Instant morale explosion and perfect flat whites for the day.',
          cost: 900,
          effects: {
            resolve: true,
            fixEquipment: 'coffeeMachineBroken',
            moraleDeltaAll: +12,
            narrative: 'The artisan barista brought oat milk and saved company morale.',
          },
        },
        {
          id: 'cheap_repair',
          label: 'Call regular maintenance repair ($300)',
          description: 'Takes until tomorrow to fix, but stops the bleed.',
          cost: 300,
          effects: {
            resolve: true,
            fixEquipment: 'coffeeMachineBroken',
            moraleDeltaAll: +3,
            narrative: 'Maintenance replaced the pressure gasket.',
          },
        },
        {
          id: 'instant_coffee',
          label: 'Provide generic instant coffee powder ($30)',
          description: 'A deeply insulting gesture that technically provides caffeine.',
          cost: 30,
          effects: {
            resolve: true,
            fixEquipment: 'coffeeMachineBroken',
            moraleDeltaAll: -6,
            stressDeltaAll: +3,
            narrative: 'Staff stared in disgust at the jar of generic instant granules.',
          },
        },
      ],
    }),
  },

  printer_rebellion: {
    id: 'printer_rebellion',
    title: 'The Printer Rebellion',
    category: 'equipment',
    severity: 3,
    baseWeight: 11,
    cooldownDays: 5,
    requiresEquipmentWorking: 'printerJammed',
    describe: () => 'Printer 2B is spewing blank warm paper and displaying "ERROR: LOAD TRAY 3" despite tray 3 being full.',
    applyEffects: (state) => {
      state.equipment.printerJammed = true
      return {
        breakEquipment: 'printerJammed',
        stressDeltaAll: +5,
        log: ['Paper jam apocalypse at the central printer.'],
      }
    },
    createIncident: (state) => ({
      id: nextId(state, 'inc'),
      title: 'Printer Paper Jam Gridlock',
      description: 'Important contract printouts are held hostage inside roller assembly 4.',
      category: 'equipment',
      severity: 3,
      roomId: 'open_plan',
      dayOpened: state.day,
      dailyMoraleDrift: -2,
      productivityPenalty: 0.92,
      resolved: false,
      responses: [
        {
          id: 'kick_printer',
          label: 'Have engineering kick it gently ($0)',
          description: '50% chance of fixing it, 50% chance of permanent hardware damage.',
          cost: 0,
          effects: {
            resolve: true,
            fixEquipment: 'printerJammed',
            moraleDeltaAll: +2,
            narrative: 'A calibrated kick by senior engineering miraculously loosened the stuck toner!',
          },
        },
        {
          id: 'official_service',
          label: 'Call official enterprise printer technician ($450)',
          description: 'Certified technicians replace the roller.',
          cost: 450,
          effects: {
            resolve: true,
            fixEquipment: 'printerJammed',
            narrative: 'Technician arrived and unjammed 24 stuck sheets of paper.',
          },
        },
      ],
    }),
  },

  server_room_overheating: {
    id: 'server_room_overheating',
    title: 'Server Room Meltdown',
    category: 'equipment',
    severity: 4,
    baseWeight: 9,
    cooldownDays: 6,
    requiresEquipmentWorking: 'serverRoomHot',
    describe: () => 'The server room AC unit failed. Internal temperatures hit 98°F; fans are screaming like jet engines.',
    applyEffects: (state) => {
      state.equipment.serverRoomHot = true
      return {
        breakEquipment: 'serverRoomHot',
        stressDeltaAll: +8,
        log: ['Server rack alarms ringing across the office.'],
      }
    },
    createIncident: (state) => ({
      id: nextId(state, 'inc'),
      title: 'Server Room Thermal Throttling',
      description: 'Build servers are downclocking to prevent fire. Compile times have tripled.',
      category: 'equipment',
      severity: 4,
      roomId: 'server_room',
      dayOpened: state.day,
      productivityPenalty: 0.8,
      resolved: false,
      responses: [
        {
          id: 'hvac_express',
          label: 'Dispatch industrial HVAC cooling crew ($1,200)',
          description: 'Immediate fix with auxiliary chillers.',
          cost: 1200,
          effects: {
            resolve: true,
            fixEquipment: 'serverRoomHot',
            narrative: 'Industrial chillers brought temperatures back down to 68°F.',
          },
        },
        {
          id: 'open_door_fan',
          label: 'Prop the door open with a box fan ($40)',
          description: 'Noisy and unprofessional, but keeps servers barely under redline.',
          cost: 40,
          effects: {
            resolve: true,
            fixEquipment: 'serverRoomHot',
            moraleDeltaAll: -4,
            reputationDelta: -3,
            narrative: 'A box fan blowing hot air into the hallway kept the cluster barely alive.',
          },
        },
      ],
    }),
  },

  // -------------------------------------------------------------------------
  // 3. Project Crises & Management Mistakes
  // -------------------------------------------------------------------------
  synergy_emergency: {
    id: 'synergy_emergency',
    title: 'Synergy Emergency',
    category: 'management',
    severity: 2,
    baseWeight: 12,
    cooldownDays: 4,
    describe: () => 'A middle manager scheduled a mandatory 3-hour alignment meeting to discuss how to have fewer meetings.',
    applyEffects: () => ({
      moraleDeltaAll: -6,
      stressDeltaAll: +4,
      log: ['Employees trapped in recursive meta-coordination.'],
    }),
  },

  kpi_miracle: {
    id: 'kpi_miracle',
    title: 'The KPI Miracle',
    category: 'management',
    severity: 3,
    baseWeight: 10,
    cooldownDays: 6,
    describe: () => 'Reported productivity numbers suddenly spiked by 300%. Nobody shipped any code, but the graphs look breathtaking.',
    applyEffects: () => ({
      kpiInflationDelta: +18,
      auditRiskDelta: +12,
      investorConfidenceDelta: +5,
      log: ['Executive dashboards turned bright green with fabricated metrics.'],
    }),
    createDecision: (state) => ({
      id: nextId(state, 'dec'),
      uid: String(state.nextUid),
      title: 'Handling the "Miracle" Metrics',
      description: 'The numbers look incredible for the board, but an internal audit would be disastrous.',
      severity: 3,
      source: 'event',
      eventId: 'kpi_miracle',
      day: state.day,
      choices: [
        {
          id: 'present_to_board',
          label: 'Present the miracle numbers proudly to the board',
          description: 'High reward, massive audit vulnerability.',
          effects: { investorConfidenceDelta: +10, executiveConfidenceDelta: +8, auditRiskDelta: +15 },
        },
        {
          id: 'quiet_recalibration',
          label: 'Quietly recalibrate the dashboards to reality',
          description: 'Disappoints leadership slightly, avoids future bankruptcy-inducing audits.',
          effects: { kpiInflationDelta: -18, auditRiskDelta: -10, executiveConfidenceDelta: -3 },
        },
      ],
    }),
  },

  the_47_slide_presentation: {
    id: 'the_47_slide_presentation',
    title: 'The 47-Slide Presentation',
    category: 'management',
    severity: 2,
    baseWeight: 11,
    cooldownDays: 4,
    describe: () => 'A senior manager is presenting an unedited 47-slide deck titled "Holistic Paradigms of Cross-Functional Synergy". Half the room is zoning out.',
    applyEffects: () => ({
      moraleDeltaAll: -4,
      energyDeltaAll: -12,
      log: ['Attendees survived slide 28: "The Quad-Helix of Deliverables".'],
    }),
  },

  phantom_intern: {
    id: 'phantom_intern',
    title: 'The Phantom Intern',
    category: 'management',
    severity: 2,
    baseWeight: 8,
    cooldownDays: 8,
    describe: () => 'Someone discovered an employee ID badge for "Bartholomew" who has been claiming free lunches for 3 months with no known manager.',
    applyEffects: () => ({
      cashDelta: -450,
      moraleDeltaAll: +2,
      trustDeltaAll: -2,
      log: ['Unaccounted cafeteria charges traced to a mythical intern.'],
    }),
  },

  spreadsheet_apocalypse: {
    id: 'spreadsheet_apocalypse',
    title: 'The Spreadsheet Apocalypse',
    category: 'finance',
    severity: 4,
    baseWeight: 9,
    cooldownDays: 7,
    describe: () => 'Cell G47 of the master financial model had a circular reference. All department forecasts were off by $14,000.',
    applyEffects: () => ({
      cashDelta: -1500,
      stressDeltaAll: +8,
      auditRiskDelta: +8,
      log: ['Finance department worked until 2 AM hunting down broken VLOOKUPs.'],
    }),
    createEmail: (state) => ({
      from: 'cfo@corporate.local',
      fromName: 'Finance Desk',
      subject: 'Correction: Q3 Cash Flow Projections',
      body: 'Due to a copy-paste error across 4 tabs, we accidentally counted catering revenue twice. Please adjust budgets accordingly.',
      kind: 'info',
    }),
  },

  // -------------------------------------------------------------------------
  // 4. AI & Tech Mishaps
  // -------------------------------------------------------------------------
  ai_agent_hallucination: {
    id: 'ai_agent_hallucination',
    title: 'Autonomous AI Sales Pitch Gone Wild',
    category: 'ai',
    severity: 3,
    baseWeight: 10,
    cooldownDays: 5,
    describe: () => 'The newly deployed autonomous AI outreach bot promised a Fortune 500 prospect a 99.999% SLA and free lifetime quantum computing.',
    applyEffects: () => ({
      reputationDelta: -6,
      customerSatisfactionDelta: -4,
      stressDeltaAll: +5,
      log: ['AI marketing agent offered impossible contractual guarantees.'],
    }),
    createDecision: (state) => ({
      id: nextId(state, 'dec'),
      uid: String(state.nextUid),
      title: 'The AI Guarantee Fallout',
      description: 'The client wants us to honor the hallucinated quantum guarantee or pay liquidated damages.',
      severity: 3,
      source: 'event',
      eventId: 'ai_agent_hallucination',
      day: state.day,
      choices: [
        {
          id: 'settle_discount',
          label: 'Offer a 20% discount on standard services ($1,200)',
          description: 'Saves face with the client without bankrupting the company.',
          effects: { cashDelta: -1200, customerSatisfactionDelta: +6, reputationDelta: +3 },
        },
        {
          id: 'blame_intern',
          label: 'Claim an intern was testing an experimental beta',
          description: 'Saves money, damages professional credibility.',
          effects: { reputationDelta: -5, executiveConfidenceDelta: -4 },
        },
      ],
    }),
  },

  github_secret_leak: {
    id: 'github_secret_leak',
    title: 'Production API Key Pushed to Public Repo',
    category: 'ai',
    severity: 4,
    baseWeight: 7,
    cooldownDays: 8,
    describe: () => 'A junior engineer accidentally committed live cloud credentials inside a test notebook.',
    applyEffects: () => ({
      cashDelta: -1800,
      stressDeltaAll: +10,
      reputationDelta: -4,
      log: ['Emergency key revocation and crypto-mining scan completed.'],
    }),
  },

  ai_coffee_optimizer: {
    id: 'ai_coffee_optimizer',
    title: 'AI Coffee Routine Optimization',
    category: 'ai',
    severity: 1,
    baseWeight: 10,
    cooldownDays: 4,
    describe: () => 'The resident AI enthusiast trained an ML model to predict optimal pantry visit times. It suggested never leaving one\u2019s desk.',
    applyEffects: () => ({
      moraleDeltaAll: +2,
      log: ['Employees laughed at the algorithm\u2019s anti-caffeine schedule.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 5. HR Incidents & Culture
  // -------------------------------------------------------------------------
  mandatory_fun_initiative: {
    id: 'mandatory_fun_initiative',
    title: 'Mandatory Fun Initiative',
    category: 'hr',
    severity: 3,
    baseWeight: 11,
    cooldownDays: 6,
    describe: () => 'HR announced mandatory trust-falls and a two-legged sack race during peak sprint hours.',
    applyEffects: () => ({
      moraleDeltaAll: -8,
      stressDeltaAll: +5,
      log: ['Employees endured 90 minutes of forced corporate camaraderie.'],
    }),
  },

  poaching_attempt: {
    id: 'poaching_attempt',
    title: 'Aggressive Tech Giant Poaching',
    category: 'hr',
    severity: 4,
    baseWeight: 8,
    minEmployees: 4,
    cooldownDays: 7,
    describe: (state, [target]) => {
      const name = state.employees[target]?.name ?? 'Our top performer'
      return `A venture-backed tech giant reached out to ${name} with a ridiculous signing bonus and unlimited kombucha.`
    },
    selectParticipants: (state, rng) => {
      const active = state.employeeOrder.filter((id) => state.employees[id]?.active)
      return active.length > 0 ? [rng.pick(active)] : []
    },
    createDecision: (state, [target]) => {
      const name = state.employees[target]?.name ?? 'the employee'
      return {
        id: nextId(state, 'dec'),
        uid: String(state.nextUid),
        title: `Counter-Offer for ${name}`,
        description: `${name} is holding an offer letter with 40% higher compensation. How do we respond?`,
        severity: 4,
        source: 'event',
        eventId: 'poaching_attempt',
        day: state.day,
        choices: [
          {
            id: 'match_raise',
            label: 'Counter-offer with a $2,500 retention bonus',
            description: 'Keeps the employee, boosts their morale and loyalty, costs money.',
            effects: { cashDelta: -2500, moraleDelta: +25, trustDeltaAll: +4 },
          },
          {
            id: 'give_title',
            label: 'Offer an empty title promotion: "Principal Visionary"',
            description: 'Costs nothing. 50/50 chance they see right through it.',
            effects: { moraleDelta: +5, trustDeltaAll: -3 },
          },
          {
            id: 'wish_well',
            label: 'Wish them the best on their next journey',
            description: 'They depart. Headcount drops; team morale wobbles.',
            effects: { quitEmployeeId: target, moraleDeltaAll: -4, stressDeltaAll: +5 },
          },
        ],
      }
    },
  },

  linkedin_influencer_viral: {
    id: 'linkedin_influencer_viral',
    title: 'Viral "Hustle Culture" Post',
    category: 'hr',
    severity: 2,
    baseWeight: 10,
    cooldownDays: 5,
    describe: (state, [author]) => {
      const name = state.employees[author]?.name ?? 'A team member'
      return `${name} published a viral post: "What being stuck in an elevator taught me about B2B sales funnel velocity." It has 40,000 likes.`
    },
    selectParticipants: (state, rng) => {
      const match = state.employeeOrder.find((id) => state.employees[id]?.archetype === 'linkedin_speaker')
      if (match) return [match]
      const active = state.employeeOrder.filter((id) => state.employees[id]?.active)
      return active.length > 0 ? [rng.pick(active)] : []
    },
    applyEffects: () => ({
      reputationDelta: +4,
      moraleDeltaAll: -2,
      log: ['Cringe corporate thought leadership brought inbound inquiries.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 6. Financial & Market Surprises
  // -------------------------------------------------------------------------
  unexpected_client_retainer: {
    id: 'unexpected_client_retainer',
    title: 'Sudden Retainer Expansion',
    category: 'finance',
    severity: 2,
    baseWeight: 9,
    cooldownDays: 6,
    describe: () => 'A legacy enterprise client accidentally renewed their premium SLA at double the tier without noticing.',
    applyEffects: () => ({
      cashDelta: +4500,
      revenueDelta: +1000,
      investorConfidenceDelta: +6,
      log: ['Client accounting department auto-approved an oversized payment.'],
    }),
  },

  surprise_cloud_bill: {
    id: 'surprise_cloud_bill',
    title: 'Uncapped GPU Cluster Bill',
    category: 'finance',
    severity: 4,
    baseWeight: 8,
    cooldownDays: 7,
    describe: () => 'Someone left an idle H100 cluster spinning over the weekend running unit tests in a loop.',
    applyEffects: () => ({
      cashDelta: -3400,
      stressDeltaAll: +7,
      log: ['Cloud hosting invoice arrived with an extra zero.'],
    }),
  },

  tax_audit_notice: {
    id: 'tax_audit_notice',
    title: 'Tax Authority Audit Notice',
    category: 'finance',
    severity: 5,
    baseWeight: 6,
    cooldownDays: 10,
    describe: () => 'The Revenue Service selected Corporate Hell for a comprehensive compliance audit of R&D tax credits.',
    applyEffects: (state) => ({
      cashDelta: -1200,
      stressDeltaAll: +12,
      executiveConfidenceDelta: -8,
      auditRiskDelta: -20, // audit happens, risk discharges
      log: ['Tax auditors occupied the conference room for the day.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 7. Customer & PR
  // -------------------------------------------------------------------------
  customer_rage_tweet: {
    id: 'customer_rage_tweet',
    title: 'Rage-Tweet from a Verified Influencer',
    category: 'customer',
    severity: 3,
    baseWeight: 9,
    cooldownDays: 5,
    describe: () => 'A tech influencer with 250k followers tweeted: "Corporate Hell\u2019s software crashed my laptop and drank my kombucha." Retweets are climbing.',
    applyEffects: () => ({
      reputationDelta: -8,
      customerSatisfactionDelta: -6,
      stressDeltaAll: +5,
      log: ['PR team scrambled to formulate a witty yet remorseful corporate reply.'],
    }),
    createDecision: (state) => ({
      id: nextId(state, 'dec'),
      uid: String(state.nextUid),
      title: 'Influencer Crisis PR Response',
      description: 'The tweet has 4,000 quote retweets and counting.',
      severity: 3,
      source: 'event',
      eventId: 'customer_rage_tweet',
      day: state.day,
      choices: [
        {
          id: 'gift_box',
          label: 'Send them a luxury branded gift basket ($800)',
          description: 'Convert the detractor into an evangelist.',
          effects: { cashDelta: -800, reputationDelta: +7, customerSatisfactionDelta: +5 },
        },
        {
          id: 'feisty_tweet',
          label: 'Clap back with a snarky corporate meme',
          description: 'High risk. Might go viral in a good way, or completely backfire.',
          effects: { reputationDelta: +3, investorConfidenceDelta: -3, moraleDeltaAll: +4 },
        },
        {
          id: 'ignore_it',
          label: 'Do not feed the trolls — maintain corporate silence',
          description: 'Saves money, but the negative tweet stays at the top of Google results.',
          effects: { reputationDelta: -4 },
        },
      ],
    }),
  },

  g2_crowd_5_star_bomb: {
    id: 'g2_crowd_5_star_bomb',
    title: 'Suspicious Wave of 5-Star Reviews',
    category: 'customer',
    severity: 2,
    baseWeight: 8,
    cooldownDays: 6,
    describe: () => 'Fifty identical 5-star reviews saying "Truly changed our corporate synergies" appeared overnight on software review portals.',
    applyEffects: () => ({
      reputationDelta: +5,
      customerSatisfactionDelta: +3,
      kpiInflationDelta: +8,
      log: ['Marketing intern bought review credits from an offshore agency.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 8. Celebrations & Successes
  // -------------------------------------------------------------------------
  pizza_party_reward: {
    id: 'pizza_party_reward',
    title: 'The Budget Pizza Party',
    category: 'celebration',
    severity: 1,
    baseWeight: 10,
    cooldownDays: 4,
    describe: () => 'Management ordered lukewarm sheet pizzas with generic cheese as a gesture of appreciation for an 80-hour week.',
    applyEffects: () => ({
      cashDelta: -120,
      moraleDeltaAll: +3,
      energyDeltaAll: +6,
      log: ['Employees accepted slices of lukewarm cheese pizza.'],
    }),
  },

  major_press_mention: {
    id: 'major_press_mention',
    title: 'Featured in "Startups to Watch While Crying"',
    category: 'celebration',
    severity: 2,
    baseWeight: 7,
    cooldownDays: 8,
    describe: () => 'A tier-one business publication called Corporate Hell "the bleeding edge of dystopian workforce automation."',
    applyEffects: () => ({
      reputationDelta: +9,
      investorConfidenceDelta: +10,
      moraleDeltaAll: +5,
      log: ['Glowing media profile sent stock inquiries through the roof.'],
    }),
  },

  ceo_inspirational_speech: {
    id: 'ceo_inspirational_speech',
    title: 'The CEO\u2019s All-Hands Keynote',
    category: 'celebration',
    severity: 2,
    baseWeight: 10,
    cooldownDays: 5,
    describe: () => 'The CEO delivered a 20-minute unscripted speech about "navigating the fog of excellence" with dramatic arm gestures.',
    applyEffects: () => ({
      moraleDeltaAll: +4,
      executiveConfidenceDelta: +5,
      energyDeltaAll: -4,
      log: ['Staff politely applauded executive metaphors.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 9. Good Luck & Breakthroughs
  // -------------------------------------------------------------------------
  accidental_bug_fix: {
    id: 'accidental_bug_fix',
    title: 'The 3-Year Heisenbug Fixed by Accident',
    category: 'luck',
    severity: 2,
    baseWeight: 8,
    cooldownDays: 6,
    describe: () => 'A cat walking across a junior developer\u2019s keyboard deleted 4 redundant lines of code, permanently fixing a race condition.',
    applyEffects: (state) => {
      // Advance active projects
      for (const p of state.projects) {
        if (p.status === 'active') {
          p.pointsDone = Math.min(p.pointsTotal, p.pointsDone + 15)
        }
      }
      return {
        moraleDeltaAll: +8,
        stressDeltaAll: -6,
        log: ['Critical software race condition vanished unexpectedly.'],
      }
    },
  },

  competitor_implodes: {
    id: 'competitor_implodes',
    title: 'Chief Competitor Accidentally Deletes Production DB',
    category: 'luck',
    severity: 3,
    baseWeight: 5,
    cooldownDays: 12,
    describe: () => 'Our primary market rival suffered an irreversible database drop during a Friday afternoon migration. Their clients are calling us.',
    applyEffects: () => ({
      revenueDelta: +1500,
      cashDelta: +3000,
      reputationDelta: +10,
      investorConfidenceDelta: +12,
      log: ['Market share surged as rival went offline for 72 hours.'],
    }),
  },

  // -------------------------------------------------------------------------
  // 10. Additional Chaos (Equipment, HR, Finance)
  // -------------------------------------------------------------------------
  ac_failure_heatwave: {
    id: 'ac_failure_heatwave',
    title: 'AC Failure during Heatwave',
    category: 'equipment',
    severity: 3,
    baseWeight: 9,
    cooldownDays: 6,
    requiresEquipmentWorking: 'acBroken',
    describe: () => 'The central air conditioning is blowing hot air. Desk plants are wilting and everyone is sweating through their oxfords.',
    applyEffects: (state) => {
      state.equipment.acBroken = true
      return {
        breakEquipment: 'acBroken',
        moraleDeltaAll: -8,
        energyDeltaAll: -10,
        log: ['Office temperature reached 84°F.'],
      }
    },
  },

  fire_drill_panic: {
    id: 'fire_drill_panic',
    title: 'Unannounced 11 AM Fire Drill',
    category: 'management',
    severity: 2,
    baseWeight: 9,
    cooldownDays: 5,
    describe: () => 'Building management triggered an unannounced evacuation test right in the middle of a client demo call.',
    applyEffects: () => ({
      stressDeltaAll: +6,
      customerSatisfactionDelta: -3,
      log: ['Whole company stood in the parking lot in the rain for 40 minutes.'],
    }),
  },

  stationery_heist: {
    id: 'stationery_heist',
    title: 'The Great Gel Pen Cartel',
    category: 'drama',
    severity: 1,
    baseWeight: 10,
    cooldownDays: 4,
    describe: () => 'Every pilot G2 0.7mm black gel pen in the supply closet has mysteriously vanished. Tensions are running high.',
    applyEffects: () => ({
      moraleDeltaAll: -2,
      cashDelta: -80,
      log: ['Black market stationery trading detected by water cooler.'],
    }),
  },

  standing_desk_epidemic: {
    id: 'standing_desk_epidemic',
    title: 'Standing Desk Ergonomic Craze',
    category: 'hr',
    severity: 1,
    baseWeight: 8,
    cooldownDays: 5,
    describe: () => 'An ergonomic consultant convinced operations that sitting is lethal. Half the team is standing awkwardly on balance boards.',
    applyEffects: () => ({
      moraleDeltaAll: +3,
      energyDeltaAll: -5,
      cashDelta: -350,
      log: ['Balance boards and anti-fatigue mats delivered.'],
    }),
  },

  corporate_swag_delivery: {
    id: 'corporate_swag_delivery',
    title: 'Corporate Swag Drop',
    category: 'celebration',
    severity: 1,
    baseWeight: 9,
    cooldownDays: 5,
    describe: () => 'Ten boxes of fleece vests with the corporate logo misspelled as "CORPRATE HEL" arrived in reception.',
    applyEffects: () => ({
      moraleDeltaAll: +4,
      cashDelta: -500,
      log: ['Misprinted fleeces became an instant cult collector\u2019s item.'],
    }),
  },
}

// ---------------------------------------------------------------------------
// Engine Evaluation & Execution
// ---------------------------------------------------------------------------

/**
 * Checks whether an event definition is eligible to fire given the current state.
 */
export function isEventEligible(state: CompanyState, def: EventDefinition): boolean {
  if (def.minDay !== undefined && state.day < def.minDay) return false

  const activeEmployees = state.employeeOrder.filter((id) => state.employees[id]?.active).length
  if (def.minEmployees !== undefined && activeEmployees < def.minEmployees) return false

  if (def.cooldownDays !== undefined) {
    const lastDay = state.eventCooldowns[def.id]
    if (lastDay !== undefined && state.day - lastDay < def.cooldownDays) return false
  }

  if (def.requiresEquipmentBroken && !state.equipment[def.requiresEquipmentBroken]) return false
  if (def.requiresEquipmentWorking && state.equipment[def.requiresEquipmentWorking]) return false

  if (def.requiresPolicy && !state.policies[def.requiresPolicy]) return false
  if (def.requiresNotPolicy && state.policies[def.requiresNotPolicy]) return false

  if (def.requiresMinCash !== undefined && state.cash < def.requiresMinCash) return false
  if (def.requiresMaxCash !== undefined && state.cash > def.requiresMaxCash) return false

  return true
}

/**
 * Selects an eligible event using weighted random choice or pulls from the eventQueue.
 */
export function selectEligibleEvent(state: CompanyState, rng: SeededRandom): EventDefinition | null {
  // Scenario forced queue takes priority
  if (state.eventQueue.length > 0) {
    const forcedId = state.eventQueue.shift()!
    const def = EVENT_DEFINITIONS[forcedId]
    if (def) return def
  }

  const eligible: { item: EventDefinition; weight: number }[] = []
  for (const def of Object.values(EVENT_DEFINITIONS)) {
    if (isEventEligible(state, def)) {
      eligible.push({ item: def, weight: def.baseWeight })
    }
  }

  if (eligible.length === 0) return null
  return rng.pickWeighted(eligible)
}

/**
 * Executes an event: mutates state, creates record, pushes log, incidents, emails or decisions.
 */
export function executeEvent(
  state: CompanyState,
  def: EventDefinition,
  rng: SeededRandom,
): EventRecord {
  const participants = def.selectParticipants ? def.selectParticipants(state, rng) : []
  const description = def.describe(state, participants)
  const effectStrings: string[] = []

  // Apply declarative / direct effects
  if (def.applyEffects) {
    const spec = def.applyEffects(state, participants, rng)
    applyEffectSpec(state, spec, participants, effectStrings)
  }

  // Create incident if applicable
  if (def.createIncident) {
    const incident = def.createIncident(state, participants)
    if (incident) {
      incident.causeEventId = def.id
      state.incidents.push(incident)
      effectStrings.push(`New Incident: ${incident.title}`)
    }
  }

  // Create CEO decision if applicable
  if (def.createDecision) {
    const decision = def.createDecision(state, participants)
    if (decision) {
      state.decisions.push(decision)
      effectStrings.push(`Action Required: ${decision.title}`)
    }
  }

  // Create email if applicable
  if (def.createEmail) {
    const emailData = def.createEmail(state, participants)
    if (emailData) {
      pushEmail(state, {
        from: emailData.from,
        fromName: emailData.fromName,
        subject: emailData.subject,
        body: emailData.body,
        kind: emailData.kind,
        participantIds: participants,
      })
      effectStrings.push(`New Email from ${emailData.fromName}`)
    }
  }

  // Update cooldown
  state.eventCooldowns[def.id] = state.day

  // Record event in company log
  const record: EventRecord = {
    uid: nextId(state, 'evt'),
    defId: def.id,
    title: def.title,
    description,
    category: def.category,
    severity: def.severity,
    day: state.day,
    tick: state.tick,
    participantIds: participants,
    effects: effectStrings,
  }

  state.eventLog.unshift(record)
  // Keep last 100 events
  if (state.eventLog.length > 100) {
    state.eventLog = state.eventLog.slice(0, 100)
  }

  // Update participant memories
  for (const pId of participants) {
    addMemory(state, pId, `${def.title}: ${description}`)
  }

  return record
}

/**
 * Universal applicator for EffectSpec into CompanyState.
 */
export function applyEffectSpec(
  state: CompanyState,
  spec: EffectSpec,
  targetEmployeeIds: string[] = [],
  effectLog: string[] = [],
): void {
  if (spec.cashDelta) {
    state.cash += spec.cashDelta
    effectLog.push(`Cash: ${spec.cashDelta > 0 ? '+' : ''}$${spec.cashDelta}`)
  }

  if (spec.revenueDelta) {
    state.todayRevenueExtra += spec.revenueDelta
    effectLog.push(`Revenue: ${spec.revenueDelta > 0 ? '+' : ''}$${spec.revenueDelta}`)
  }

  if (spec.reputationDelta) {
    state.reputation = clamp(state.reputation + spec.reputationDelta, 0, 100)
    effectLog.push(`Reputation: ${spec.reputationDelta > 0 ? '+' : ''}${spec.reputationDelta}`)
  }

  if (spec.customerSatisfactionDelta) {
    state.customerSatisfaction = clamp(
      state.customerSatisfaction + spec.customerSatisfactionDelta,
      0,
      100,
    )
    effectLog.push(
      `Satisfaction: ${spec.customerSatisfactionDelta > 0 ? '+' : ''}${spec.customerSatisfactionDelta}`,
    )
  }

  if (spec.investorConfidenceDelta) {
    state.investorConfidence = clamp(
      state.investorConfidence + spec.investorConfidenceDelta,
      0,
      100,
    )
    effectLog.push(
      `Investor Confidence: ${spec.investorConfidenceDelta > 0 ? '+' : ''}${spec.investorConfidenceDelta}`,
    )
  }

  if (spec.executiveConfidenceDelta) {
    state.executiveConfidence = clamp(
      state.executiveConfidence + spec.executiveConfidenceDelta,
      0,
      100,
    )
  }

  if (spec.kpiInflationDelta) {
    state.kpiInflation = clamp(state.kpiInflation + spec.kpiInflationDelta, 0, 100)
  }

  if (spec.auditRiskDelta) {
    state.auditRisk = clamp(state.auditRisk + spec.auditRiskDelta, 0, 100)
  }

  if (spec.breakEquipment) {
    state.equipment[spec.breakEquipment] = true
    effectLog.push(`Equipment malfunction: ${spec.breakEquipment}`)
  }

  if (spec.fixEquipment) {
    state.equipment[spec.fixEquipment] = false
    effectLog.push(`Equipment repaired: ${spec.fixEquipment}`)
  }

  if (spec.quitEmployeeId && state.employees[spec.quitEmployeeId]) {
    const emp = state.employees[spec.quitEmployeeId]
    emp.active = false
    emp.quitDay = state.day
    emp.quitReason = 'Poached by competitor'
    effectLog.push(`${emp.name} has resigned.`)
  }

  // Company-wide employee shifts
  if (
    spec.moraleDeltaAll ||
    spec.stressDeltaAll ||
    spec.energyDeltaAll ||
    spec.trustDeltaAll
  ) {
    for (const emp of Object.values(state.employees)) {
      if (!emp.active) continue
      if (spec.moraleDeltaAll) emp.morale = clamp(emp.morale + spec.moraleDeltaAll, 0, 100)
      if (spec.stressDeltaAll) emp.stress = clamp(emp.stress + spec.stressDeltaAll, 0, 100)
      if (spec.energyDeltaAll) emp.energy = clamp(emp.energy + spec.energyDeltaAll, 0, 100)
      if (spec.trustDeltaAll) emp.trust = clamp(emp.trust + spec.trustDeltaAll, 0, 100)
    }
    if (spec.moraleDeltaAll) effectLog.push(`Morale: ${spec.moraleDeltaAll > 0 ? '+' : ''}${spec.moraleDeltaAll}`)
    if (spec.stressDeltaAll) effectLog.push(`Stress: ${spec.stressDeltaAll > 0 ? '+' : ''}${spec.stressDeltaAll}`)
  }

  // Individual target employee shifts
  if (targetEmployeeIds.length > 0) {
    for (const tId of targetEmployeeIds) {
      const emp = state.employees[tId]
      if (!emp || !emp.active) continue
      if (spec.moraleDelta) emp.morale = clamp(emp.morale + spec.moraleDelta, 0, 100)
      if (spec.stressDelta) emp.stress = clamp(emp.stress + spec.stressDelta, 0, 100)
    }
  }

  if (spec.log) {
    effectLog.push(...spec.log)
  }
}

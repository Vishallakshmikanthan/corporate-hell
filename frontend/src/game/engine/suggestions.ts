/**
 * CORPORATE HELL™ — Suggestions & Scope Creep Engine.
 *
 * Implements suggestion triage from customers, investors, employees, social, and executive leadership,
 * managing scope creep and stakeholder sentiment effects.
 */
import type {
  ActionResult,
  CompanyState,
  Suggestion,
  Ticket,
} from '../models/types'
import { BOUNDS, clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialSuggestions(): Suggestion[] {
  return [
    {
      id: 'sug_dark_mode',
      from: 'customer',
      text: 'Please add dark mode to the dashboard. My retinas are burning during 2 AM deployments.',
      value: 8,
      effort: 2,
      urgency: 4,
      politicalWeight: 3,
      status: 'pending',
    },
    {
      id: 'sug_blockchain',
      from: 'investor',
      text: 'Have we explored putting our SaaS auth tokens on a decentralized blockchain ledger?',
      value: 2,
      effort: 8,
      urgency: 5,
      politicalWeight: 5,
      status: 'pending',
    },
    {
      id: 'sug_standup_cancel',
      from: 'employee',
      text: 'Can we replace the daily 45-minute verbal standup with an asynchronous Slack check-in?',
      value: 9,
      effort: 1,
      urgency: 3,
      politicalWeight: 2,
      status: 'pending',
    },
    {
      id: 'sug_spinning_logo',
      from: 'ceo',
      text: 'Make the company logo 25% bigger and animate it with 3D spinning glitter on login.',
      value: 1,
      effort: 1,
      urgency: 4,
      politicalWeight: 4,
      status: 'pending',
    },
    {
      id: 'sug_csv_export',
      from: 'customer',
      text: 'Add bulk CSV export for monthly billing reports so our accounting team can reconcile taxes.',
      value: 7,
      effort: 3,
      urgency: 3,
      politicalWeight: 3,
      status: 'pending',
    },
  ]
}

export function generateDynamicSuggestion(rng: SeededRandom): Suggestion {
  const sources: Suggestion['from'][] = ['customer', 'investor', 'employee', 'social', 'ceo']
  const from = sources[rng.integer(0, sources.length - 1)]

  const TEXTS: Record<Suggestion['from'], { text: string; value: number; effort: number; political: number }[]> = {
    customer: [
      { text: 'Add two-factor authentication (2FA) via authenticator app.', value: 8, effort: 3, political: 3 },
      { text: 'The search bar should support fuzzy typo tolerance.', value: 7, effort: 2, political: 2 },
      { text: 'Allow custom webhook URLs on payment receipts.', value: 6, effort: 3, political: 3 },
    ],
    investor: [
      { text: 'Pivot immediately to an Autonomous AI Agent first paradigm to boost Series A valuation.', value: 4, effort: 8, political: 5 },
      { text: 'Cut customer support headcounts and replace with an unmoderated LLM bot.', value: 2, effort: 5, political: 5 },
      { text: 'Implement annual upfront contracts with non-refundable auto-renewals.', value: 9, effort: 2, political: 4 },
    ],
    employee: [
      { text: 'Provide free oat milk and cold brew keg in the break pantry.', value: 6, effort: 1, political: 2 },
      { text: 'Designate No-Meeting Wednesdays company-wide so engineers can write code.', value: 8, effort: 1, political: 3 },
      { text: 'Upgrade engineer laptops to 64GB M3 Max chips to speed up local Docker builds.', value: 7, effort: 2, political: 2 },
    ],
    social: [
      { text: 'Create an official corporate TikTok account and do viral dance challenges.', value: 3, effort: 2, political: 1 },
      { text: 'Publicly open source our telemetry logger on Hacker News.', value: 5, effort: 1, political: 2 },
    ],
    ceo: [
      { text: 'Rebrand the core platform to CorporateHell.AI Enterprise Cloud Engine.', value: 2, effort: 3, political: 5 },
      { text: 'Mandate badge swipe tracking in the office to monitor synergy presence.', value: 1, effort: 2, political: 4 },
    ],
  }

  const pool = TEXTS[from]
  const item = pool[rng.integer(0, pool.length - 1)]

  return {
    id: `sug_${Math.floor(rng.next() * 1000000).toString(36)}`,
    from,
    text: item.text,
    value: item.value,
    effort: item.effort,
    urgency: rng.integer(2, 5),
    politicalWeight: item.political,
    status: 'pending',
  }
}

export function handleSuggestionDecision(
  state: CompanyState,
  suggestionId: string,
  decision: 'accept' | 'defer' | 'reject_polite' | 'reject_rude',
): ActionResult {
  const sug = state.suggestions.find((s) => s.id === suggestionId)
  if (!sug) return { ok: false, reason: 'Suggestion not found.' }

  sug.status = decision === 'accept' ? 'accepted' : decision === 'defer' ? 'deferred' : 'rejected'

  switch (decision) {
    case 'accept': {
      // Scope creep: create ticket and add to sprint/backlog
      const newTicket: Ticket = {
        id: `tick_sug_${sug.id}`,
        title: `Suggestion: ${sug.text.slice(0, 48)}...`,
        kind: sug.value >= 7 ? 'feature' : 'chore',
        complexity: clamp(sug.effort, 1, 8) as any,
        state: 'todo',
        source: sug.from === 'customer' ? 'customer' : sug.from === 'investor' ? 'investor' : 'roadmap',
        bugRisk: 0.12,
        designReady: true,
        techDebtDelta: 2,
        progress: 0,
      }
      state.tickets.push(newTicket)
      if (state.sprint) {
        state.sprint.tickets.push(newTicket.id)
        state.sprint.committedPoints += newTicket.complexity
      }

      // Team morale takes a small hit from scope creep
      Object.values(state.employees).forEach((emp) => {
        emp.stress = clamp(emp.stress + 3, ...BOUNDS.stress)
      })

      if (sug.from === 'investor') state.investorConfidence = clamp(state.investorConfidence + 5, ...BOUNDS.investorConfidence)
      if (sug.from === 'customer') state.customerSatisfaction = clamp(state.customerSatisfaction + 5, ...BOUNDS.customerSatisfaction)

      return {
        ok: true,
        message: `Accepted into sprint! Created ticket "${newTicket.title}" (+${newTicket.complexity} pts scope creep).`,
        effects: ['Scope Creep Added', 'Stakeholder Pleased', 'Team Stress +3%'],
      }
    }

    case 'defer': {
      return {
        ok: true,
        message: `Deferred suggestion to future roadmap backlog. Stakeholder acknowledged polite deferral.`,
        effects: ['Logged to backlog archive'],
      }
    }

    case 'reject_polite': {
      if (sug.from === 'investor') {
        state.investorConfidence = clamp(state.investorConfidence - 2, ...BOUNDS.investorConfidence)
      } else if (sug.from === 'customer') {
        state.customerSatisfaction = clamp(state.customerSatisfaction - 1, ...BOUNDS.customerSatisfaction)
      }
      return {
        ok: true,
        message: 'Politely declined suggestion. Scope preserved.',
        effects: ['Velocity protected'],
      }
    }

    case 'reject_rude': {
      if (sug.from === 'investor') {
        state.investorConfidence = clamp(state.investorConfidence - 8, ...BOUNDS.investorConfidence)
      } else if (sug.from === 'customer') {
        state.customerSatisfaction = clamp(state.customerSatisfaction - 6, ...BOUNDS.customerSatisfaction)
      } else if (sug.from === 'ceo') {
        // Team loves seeing absurd CEO suggestions dunked on!
        Object.values(state.employees).forEach((e) => {
          e.morale = clamp(e.morale + 3, ...BOUNDS.morale)
        })
      }
      return {
        ok: true,
        message: 'Rudely rejected suggestion. Stakeholder was offended!',
        effects: ['Confidence hit applied'],
      }
    }
  }
}

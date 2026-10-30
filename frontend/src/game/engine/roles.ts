/**
 * CORPORATE HELL™ — Role Modes & NPC Role-Fill Engine.
 *
 * Implements role definitions (CEO, Developer, Designer, PM, DevOps, Overall, Intern),
 * role daily obligations, allowed actions, and NPC autonomous role execution.
 */
import type {
  CompanyState,
  PlayerRole,
} from '../models/types'
import { SeededRandom } from './rng'

export interface RoleDefinition {
  id: PlayerRole
  title: string
  subtitle: string
  icon: string
  coreFantasy: string
  signatureMechanic: string
  dailyObligations: string[]
  perks: string[]
  blindSpots: string[]
}

export const ROLE_DEFINITIONS: Record<PlayerRole, RoleDefinition> = {
  ceo: {
    id: 'ceo',
    title: 'Chief Executive Officer',
    subtitle: 'Survive, Fundraise, & Scale',
    icon: 'crown',
    coreFantasy: 'Navigate runway limits, pitch skeptical venture capitalists, and guide company strategy.',
    signatureMechanic: 'Investor pitch negotiation & board deck reviews.',
    dailyObligations: [
      'Review daily financial burn & runway',
      'Take 1 high-stakes executive people decision',
      'Manage investor relations and valuation targets',
    ],
    perks: ['Executive Authority', 'Valuation Multiplier +15%'],
    blindSpots: ['Cannot write code directly', 'High stress penalty on low cash'],
  },
  developer: {
    id: 'developer',
    title: 'Senior Software Engineer',
    subtitle: 'Ship Clean Code Under Pressure',
    icon: 'terminal',
    coreFantasy: 'Pick tickets from Kanban, write commits, open PRs, pass CI/CD checks, and deploy.',
    signatureMechanic: 'Git branch lifecycle, PR review defense, and CI build fixes.',
    dailyObligations: [
      'Pick up an active sprint ticket',
      'Push commits and open a Pull Request',
      'Review a teammate’s code or fix broken CI builds',
      'Deploy to staging or production',
    ],
    perks: ['10x Velocity Bonus', 'Bypass peer-review on emergency hotfixes'],
    blindSpots: ['Tech debt increases faster if rushing', 'Caffeine dependency'],
  },
  designer: {
    id: 'designer',
    title: 'Lead Product Designer',
    subtitle: 'Make the Product Loved',
    icon: 'palette',
    coreFantasy: 'Design intuitive UI/UX screens, unblock developers, and conduct user testing.',
    signatureMechanic: 'Design ticket readiness unblocks engineering speed.',
    dailyObligations: [
      'Complete design specs for roadmap features',
      'Run design review in conference room',
      'Boost customer satisfaction ratings',
    ],
    perks: ['Customer CSAT +20%', 'Reduced bug generation on designed tickets'],
    blindSpots: ['Developers complain about spec changes mid-sprint'],
  },
  pm: {
    id: 'pm',
    title: 'Product Manager',
    subtitle: 'Say "No" Politely to Everyone',
    icon: 'clipboard-list',
    coreFantasy: 'Groom the backlog, protect sprint scope against feature creep, and balance requests.',
    signatureMechanic: 'Suggestion inbox defense & sprint commitment balancing.',
    dailyObligations: [
      'Triage incoming suggestions from customers and investors',
      'Ensure sprint tickets remain within velocity capacity',
      'Prevent mid-sprint scope creep',
    ],
    perks: ['Scope Creep Immunity', 'Stakeholder Confidence +10%'],
    blindSpots: ['Blamed by both engineers and investors when deadlines slip'],
  },
  devops: {
    id: 'devops',
    title: 'DevOps & SRE Specialist',
    subtitle: 'Keep It Up at 3:00 AM',
    icon: 'server',
    coreFantasy: 'Optimize AWSome cloud bills, configure auto-scaling, tune GPUs, and mitigate outages.',
    signatureMechanic: 'Live cloud capacity tuning & instant production rollbacks.',
    dailyObligations: [
      'Monitor requests/sec traffic vs cloud capacity',
      'Keep cloud bill within operating budget',
      'Maintain 99.9% production uptime SLA',
    ],
    perks: ['Zero-downtime blue/green deployments', 'Cloud cost discount 20%'],
    blindSpots: ['On-call alert fatigue causes rapid stress buildup'],
  },
  overall: {
    id: 'overall',
    title: 'Director (God-View / Sandbox)',
    subtitle: 'Master Orchestrator',
    icon: 'eye',
    coreFantasy: 'Control the entire company machine with omniscient camera controls and time toggles.',
    signatureMechanic: 'Full god-mode command over all company departments and systems.',
    dailyObligations: [
      'Observe living office simulation',
      'Trigger custom scenario events',
      'Balance financial and emotional equilibrium',
    ],
    perks: ['Access to all tools and speed controls'],
    blindSpots: ['None'],
  },
  intern: {
    id: 'intern',
    title: 'Engineering Intern',
    subtitle: 'Survive Onboarding & Avoid Incidents',
    icon: 'coffee',
    coreFantasy: 'Learn every system from scratch, fetch coffee, and avoid dropping the production database.',
    signatureMechanic: 'Onboarding tutorial quest chain + roguelite survival mode.',
    dailyObligations: [
      'Brew coffee for senior engineers',
      'Fix tiny chore tickets without breaking staging',
      'Survive the daily standup without panic',
    ],
    perks: ['Rapid XP gain (+50%)', 'Forgiven for minor mistakes'],
    blindSpots: ['Low starting skills', 'Very low salary ($110/day)'],
  },
}

/**
 * Executes autonomous actions for roles not controlled by the human player.
 * Keeps the company living and thriving!
 */
export function executeNpcRoleSupport(state: CompanyState, rng: SeededRandom): void {
  const playerRole = state.playerRole || 'ceo'

  // If player is not Developer, NPC developers automatically make progress on tickets
  if (playerRole !== 'developer') {
    const activeDevs = Object.values(state.employees).filter(
      (e) => e.department === 'engineering' && e.active,
    )
    if (activeDevs.length > 0 && rng.boolean(0.4)) {
      const doingTicket = state.tickets.find((t) => t.state === 'doing')
      if (doingTicket) {
        doingTicket.progress = Math.min(100, (doingTicket.progress || 0) + rng.integer(15, 30))
        if (doingTicket.progress >= 100) {
          doingTicket.state = 'review'
        }
      } else {
        const todoTicket = state.tickets.find((t) => t.state === 'todo')
        if (todoTicket) {
          todoTicket.state = 'doing'
          todoTicket.progress = 10
        }
      }
    }
  }

  // If player is not DevOps, NPC SRE auto-scales if dangerously close to overload
  if (playerRole !== 'devops') {
    if (state.infra.currentTraffic > state.infra.capacity * 0.9 && state.infra.instances < 12) {
      state.infra.instances += 1
    }
  }

  // If player is not PM, suggestions are periodically auto-triaged
  if (playerRole !== 'pm') {
    const pending = state.suggestions.filter((s) => s.status === 'pending')
    if (pending.length > 6 && rng.boolean(0.3)) {
      const oldest = pending[0]
      oldest.status = oldest.value >= 7 ? 'accepted' : 'deferred'
    }
  }
}

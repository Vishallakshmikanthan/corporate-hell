/**
 * CORPORATE HELL™ — Parody "GitBub" Version Control Engine.
 *
 * Implements branches, commits, pull requests, merge conflict detection & resolution,
 * and reviewer archetype personality reactions.
 */
import type {
  Branch,
  CompanyState,
  Employee,
  PullRequest,
  Repo,
  Ticket,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialRepo(): Repo {
  return {
    name: 'corporate-core-monorepo',
    branches: [
      {
        name: 'feat/sso-oauth2',
        authorId: 'emp_elena',
        commits: 4,
        conflicts: 0,
        ticketId: 'tick_auth_oauth',
      },
      {
        name: 'fix/slow-indexes',
        authorId: 'emp_priya',
        commits: 2,
        conflicts: 0,
        ticketId: 'tick_db_indexing',
      },
    ],
    mainHealth: 88,
    techDebt: 15,
    lastCommitMessage: 'merge: Initial architecture setup and telemetry foundation (#1)',
  }
}

export function createInitialPRs(): PullRequest[] {
  return [
    {
      id: 'pr_101',
      branch: 'feat/sso-oauth2',
      title: 'feat(auth): Add PKCE OAuth2 and SAML providers',
      authorId: 'emp_elena',
      reviewerId: 'emp_gary',
      size: 350,
      quality: 84,
      state: 'open',
      comments: [
        {
          author: 'Gary Chen (The Silent Genius)',
          text: 'Check the nonce validation on line 142. A replay attack is possible if redis cache expires early.',
          day: 1,
        },
      ],
    },
  ]
}

/**
 * Creates a new branch for a ticket.
 */
export function createBranch(repo: Repo, ticket: Ticket, authorId: string): Branch {
  const slug = ticket.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24)
  const branchName = `${ticket.kind}/${slug}`

  // Check if branch already exists
  const existing = repo.branches.find((b) => b.name === branchName)
  if (existing) return existing

  const branch: Branch = {
    name: branchName,
    authorId,
    commits: 0,
    conflicts: 0,
    ticketId: ticket.id,
  }
  repo.branches.push(branch)
  return branch
}

/**
 * Adds a commit to a branch, accumulating code changes and quality.
 */
export function addCommit(
  repo: Repo,
  branchName: string,
  message?: string,
): { ok: boolean; commits: number } {
  const branch = repo.branches.find((b) => b.name === branchName)
  if (!branch) return { ok: false, commits: 0 }

  branch.commits += 1
  repo.lastCommitMessage = message || `commit on ${branchName}: progress commit #${branch.commits}`
  return { ok: true, commits: branch.commits }
}

/**
 * Simulates reviewer persona reaction when a PR is assigned to them.
 */
export function generateReviewerFeedback(
  reviewer: Employee,
  prQuality: number,
  rng: SeededRandom,
): { approved: boolean; text: string } {
  const archetype = reviewer.archetype

  switch (archetype) {
    case 'bootlicker':
      return {
        approved: true,
        text: 'LGTM! Flawless code craftsmanship, perfectly synergistic with company vision! 🚀 Ship it immediately!',
      }

    case 'silent_genius':
      if (prQuality >= 75) {
        return {
          approved: true,
          text: 'Clean implementation. Good lock scoping and test coverage. Approved.',
        }
      }
      return {
        approved: false,
        text: 'Found a memory leak in the buffer allocation and an unhandled Promise rejection. Needs refactoring before main.',
      }

    case 'meeting_addict':
      return {
        approved: false,
        text: 'I think we need a 45-minute architectural sync with the entire team to align on these variable names.',
      }

    case 'ai_evangelist':
      return {
        approved: true,
        text: 'Have you considered wrapping this entire logic in an autonomous AI agent? Looks good nonetheless. Approved!',
      }

    case 'burnout_veteran':
      return {
        approved: true,
        text: 'Does it compile? Yes. Does it pass tests? Barely. Good enough for enterprise software.',
      }

    case 'kpi_manipulator':
      return {
        approved: true,
        text: `Approved. This will increase our deployed commit count velocity metric by +12%.`,
      }

    default:
      if (prQuality >= 65 || rng.boolean(0.7)) {
        return {
          approved: true,
          text: 'LGTM! Tested locally, works as expected.',
        }
      }
      return {
        approved: false,
        text: 'Please add unit tests for edge cases and address linting warnings.',
      }
  }
}

/**
 * Checks if two open branches conflict with each other.
 */
export function checkForMergeConflicts(repo: Repo, branch: Branch, rng: SeededRandom): boolean {
  if (repo.branches.length <= 1) return false
  // 25% chance of merge conflict if main health is low or multiple branches touch common code
  const conflictChance = repo.techDebt > 40 ? 0.35 : 0.18
  if (rng.boolean(conflictChance)) {
    branch.conflicts = rng.integer(1, 3)
    return true
  }
  return false
}

/**
 * Merges a Pull Request into main, updating main health and tech debt.
 */
export function mergePullRequest(
  state: CompanyState,
  prId: string,
): { ok: boolean; reason?: string } {
  const pr = state.prs.find((p) => p.id === prId)
  if (!pr) return { ok: false, reason: 'Pull Request not found.' }
  if (pr.state === 'merged') return { ok: false, reason: 'PR is already merged.' }

  const branch = state.repo.branches.find((b) => b.name === pr.branch)
  if (branch && branch.conflicts > 0) {
    return { ok: false, reason: 'Cannot merge PR with unresolved merge conflicts!' }
  }

  pr.state = 'merged'

  // Mark associated ticket as 'qa' or 'done'
  const ticket = state.tickets.find((t) => t.id === branch?.ticketId)
  if (ticket) {
    ticket.state = 'qa'
    ticket.progress = 100
    // Adjust tech debt
    state.techDebt = clamp(state.techDebt + ticket.techDebtDelta, 0, 100)
    state.repo.techDebt = state.techDebt
  }

  // Adjust code quality based on PR quality
  state.codeQuality = Math.round(state.codeQuality * 0.85 + pr.quality * 0.15)
  state.repo.mainHealth = clamp(
    Math.round(state.repo.mainHealth + (pr.quality > 70 ? 2 : -4)),
    10,
    100,
  )
  state.repo.lastCommitMessage = `Merge pull request #${pr.id.replace('pr_', '')} from ${pr.branch}`

  // Clean up branch
  state.repo.branches = state.repo.branches.filter((b) => b.name !== pr.branch)

  return { ok: true }
}

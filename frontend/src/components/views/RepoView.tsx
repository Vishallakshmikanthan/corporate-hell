/**
 * CORPORATE HELL™ — Parody "GitBub" Version Control View.
 *
 * Implements branch management, commit histories, PR reviews, merge conflict resolutions,
 * and automated CI/CD pipeline triggers.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import type { PullRequest, Branch } from '../../game/models/types'
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export function RepoView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const openMiniGame = useGameStore((s) => s.openMiniGame)

  const [activeSubTab, setActiveSubTab] = useState<'prs' | 'branches'>('prs')
  const [conflictModalBranch, setConflictModalBranch] = useState<string | null>(null)

  if (!state) return null

  const repo = state.repo
  const prs = state.prs || []
  const branches = repo?.branches || []

  const handleMergePr = (pr: PullRequest) => {
    dispatch({ type: 'merge_pr', prId: pr.id })
    dispatch({ type: 'run_pipeline' })
    setActiveTab('pipeline')
  }

  const handleApprovePr = (pr: PullRequest) => {
    dispatch({ type: 'review_pr', prId: pr.id, approve: true, feedback: 'Approved by player!' })
  }

  const handleRequestChangesPr = (pr: PullRequest) => {
    dispatch({
      type: 'review_pr',
      prId: pr.id,
      approve: false,
      feedback: 'Please address code smell and add missing unit tests.',
    })
  }

  const handleResolveConflict = (branchName: string, strategy: 'ours' | 'theirs' | 'manual') => {
    dispatch({ type: 'resolve_conflict', branchName, strategy })
    setConflictModalBranch(null)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ink-950 p-6 select-none animate-fade-in">
      {/* GitBub Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <GitBranch className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                GitBub: {repo?.name || 'corporate-monorepo'}
              </h1>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                main: Protected
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5 font-mono truncate max-w-md">
              {repo?.lastCommitMessage || 'Initial commit'}
            </p>
          </div>
        </div>

        {/* Health & Tech Debt Meters */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Main Health</div>
            <div className="font-mono text-sm font-bold text-emerald-400">{repo?.mainHealth || 85}%</div>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Tech Debt</div>
            <div className={`font-mono text-sm font-bold ${(repo?.techDebt || 15) > 40 ? 'text-red-400' : 'text-amber-400'}`}>
              {repo?.techDebt || 15}%
            </div>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Code Quality</div>
            <div className="font-mono text-sm font-bold text-blue-400">{state.codeQuality || 78}%</div>
          </div>

          <button
            onClick={() => {
              dispatch({ type: 'run_pipeline' })
              setActiveTab('pipeline')
            }}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>CI/CD Pipeline</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-ink-800/80 pt-4 pb-2">
        <button
          onClick={() => setActiveSubTab('prs')}
          className={`flex items-center gap-2 border-b-2 pb-2 text-xs font-bold transition ${
            activeSubTab === 'prs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-ink-400 hover:text-paper-200'
          }`}
        >
          <GitPullRequest className="h-4 w-4" />
          <span>Pull Requests ({prs.filter((p) => p.state !== 'merged').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex items-center gap-2 border-b-2 pb-2 text-xs font-bold transition ${
            activeSubTab === 'branches'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-ink-400 hover:text-paper-200'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          <span>Active Branches ({branches.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto py-4 pr-1">
        {activeSubTab === 'prs' ? (
          <div className="space-y-3">
            {prs.length === 0 ? (
              <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8 text-center text-ink-400 text-xs">
                No active pull requests. Pick a ticket from Kanban and open a branch!
              </div>
            ) : (
              prs.map((pr) => {
                const branchObj = branches.find((b) => b.name === pr.branch)
                const hasConflict = branchObj && branchObj.conflicts > 0

                return (
                  <div
                    key={pr.id}
                    className="rounded-2xl border border-ink-800 bg-ink-900/90 p-5 shadow-lg backdrop-blur hover:border-ink-700 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              pr.state === 'merged'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : pr.state === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {pr.state.replace('_', ' ')}
                          </span>
                          <h3 className="text-sm font-bold text-paper-50">{pr.title}</h3>
                        </div>

                        <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-400 font-mono">
                          <span>branch: <span className="text-blue-400">{pr.branch}</span></span>
                          <span>author: @{pr.authorId}</span>
                          <span>diff: +{pr.size} lines</span>
                          <span className="text-emerald-400 font-bold">Quality: {pr.quality}%</span>
                        </div>
                      </div>

                      {/* PR Action Buttons */}
                      <div className="flex items-center gap-2">
                        {hasConflict && (
                          <button
                            onClick={() => setConflictModalBranch(pr.branch)}
                            className="flex items-center gap-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 transition animate-pulse"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Resolve Conflicts ({branchObj.conflicts})</span>
                          </button>
                        )}

                        {pr.state !== 'merged' && (
                          <>
                            <button
                              onClick={() => handleApprovePr(pr)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500/30 transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => handleRequestChangesPr(pr)}
                              className="flex items-center gap-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-bold hover:bg-amber-500/30 transition"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Request Changes</span>
                            </button>

                            <button
                              onClick={() => handleMergePr(pr)}
                              disabled={hasConflict}
                              className={`flex items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-lg transition ${
                                hasConflict
                                  ? 'bg-ink-800 text-ink-500 cursor-not-allowed'
                                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                              }`}
                            >
                              <GitMerge className="h-3.5 w-3.5" />
                              <span>Merge to Main</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review Comments */}
                    {pr.comments && pr.comments.length > 0 && (
                      <div className="mt-3.5 rounded-xl border border-ink-800 bg-ink-950/60 p-3 text-xs">
                        <div className="flex items-center gap-1.5 text-ink-400 font-semibold mb-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Reviewer Feedback</span>
                        </div>
                        {pr.comments.map((c, idx) => (
                          <div key={idx} className="mt-1 text-paper-200">
                            <span className="font-bold text-paper-100">{c.author}: </span>
                            <span className="italic">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {branches.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-900/80 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-sm font-bold text-paper-100">{b.name}</span>
                    {b.conflicts > 0 && (
                      <span className="rounded bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                        {b.conflicts} Conflicts
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-ink-400 font-mono">
                    <span>author: @{b.authorId}</span>
                    <span>commits: {b.commits}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'commit_work', branchName: b.name })}
                    className="flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs font-bold text-paper-200 hover:bg-ink-700 transition"
                  >
                    <GitCommit className="h-3.5 w-3.5 text-blue-400" />
                    <span>Push Commit</span>
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'open_pr', branchName: b.name })}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                  >
                    <GitPullRequest className="h-3.5 w-3.5" />
                    <span>Open PR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merge Conflict Resolution Modal */}
      {conflictModalBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-ink-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <span>GitBub Merge Conflict Resolver</span>
            </div>
            <p className="mt-2 text-xs text-ink-300">
              Branch <span className="font-mono text-paper-100">{conflictModalBranch}</span> has overlapping code changes with <span className="font-mono text-paper-100">main</span>.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => handleResolveConflict(conflictModalBranch, 'manual')}
                className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-left hover:bg-emerald-500/20 transition"
              >
                <div className="text-xs font-bold text-emerald-300">Clean 3-Way Manual Merge (Recommended)</div>
                <div className="text-[11px] text-ink-400 mt-0.5">Carefully combine changes. Reduces tech debt by -2.</div>
              </button>

              <button
                onClick={() => handleResolveConflict(conflictModalBranch, 'ours')}
                className="w-full rounded-xl border border-ink-700 bg-ink-800 p-3 text-left hover:bg-ink-750 transition"
              >
                <div className="text-xs font-bold text-paper-100">Accept Current Branch (Ours)</div>
                <div className="text-[11px] text-ink-400 mt-0.5">Overwrite main conflict hunk with this branch. Tech debt +2.</div>
              </button>

              <button
                onClick={() => handleResolveConflict(conflictModalBranch, 'theirs')}
                className="w-full rounded-xl border border-ink-700 bg-ink-800 p-3 text-left hover:bg-ink-750 transition"
              >
                <div className="text-xs font-bold text-paper-100">Accept Main (Theirs)</div>
                <div className="text-[11px] text-ink-400 mt-0.5">Discard branch changes in conflict files. Tech debt +2.</div>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setConflictModalBranch(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-ink-400 hover:text-paper-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
